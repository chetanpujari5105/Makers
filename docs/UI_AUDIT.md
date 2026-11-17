# UI audit: what looks generic, and how to fix it

Read-only audit, 2026-11-18, branch `phase-ui-polish` (same code as `main`).

**What was checked**
- Production https://makers-alpha.vercel.app. Its catalogue is empty, so it only shows the empty states.
- Local `next dev` and a local production build (`next start`) against the **development** database, which has two published samples: "Freelance project tracker" (₹399) and "Clear email prompt pack" (free).
- Widths: 1440, 768 and 390, using headless Chrome with real device emulation. The Chrome extension was not connected.
- Tools: `impeccable detect` (code and live pages), the Web Interface Guidelines review, Lighthouse 12 (mobile and desktop).
- Screenshots are kept outside the repo, in the session scratchpad.

**Short verdict:** the store is careful and correct. Accessibility scores 100, the copy is plain and honest, and keyboard and focus work. It looks "AI-made" for three reasons:
1. It uses the most common type pairing of 2025–26 (Fraunces + Geist) and a default-looking blue.
2. Every section has the same shape and spacing.
3. The product covers are pale, nearly identical boxes with a small icon, and they carry no brand.

It also has two real performance bugs: a footer **layout shift** and **400 KB of fonts**.

---

## 1. Measured problems (fix these whatever direction is chosen)

| # | Problem | Evidence | Fix |
|---|---|---|---|
| P1 | **Layout shift (CLS) of 0.42 on Home, desktop, production.** The limit for "good" is 0.1. | Lighthouse filmstrip: at 750 ms the page shows `app/(site)/loading.tsx` (three short grey bars) with the footer right under it. At 1,125 ms the real page streams in and pushes the footer about 2,000 px down. | Make loading placeholders match the real layout: same hero height, same card grid (task 5, "skeletons that match the layout"). Give `main` a minimum height while loading so the footer never shows above the fold. |
| P2 | **CLS of 0.126 on the product page, mobile (local build).** | Same cause: the product page's short `role="status"` fallback, then the footer moves. | Product-page skeleton: cover block + title + price row + section blocks, at their real sizes. |
| P3 | **About 400 KB of web fonts. On mobile the headline waits for them (LCP 4.8 s, of which 4.3 s is "render delay").** | Four woff2 files: Fraunces upright and italic with the `opsz` + `SOFT` axes (about 120 + 150 + 106 KB), plus Geist (30 KB). | Set a font budget of **≤ 120 KB** for the first screen. Load only the axes and styles we use, drop the `SOFT` axis, and use at most one italic. Every proposed direction stays inside this budget. |
| P4 | Product page body lines run to **86–92 characters**. The comfortable maximum is about 75. | `impeccable detect` at 1440 (6 findings). | Limit long text blocks to about 65ch. |
| P5 | Placeholders don't end with "…" (the Web Interface Guidelines rule). | `home-view.tsx:85`, `explore-filters.tsx:44`: `Try “budget”, “Notion” or “poster”` | `Try “budget”, “Notion” or “poster”…`. Minor. |

Baseline numbers. Local production build, development database, Lighthouse 12, simulated slow 4G on mobile:

| Page | Mobile perf | Mobile LCP | Mobile CLS | Desktop perf | Desktop CLS | JS transferred | A11y |
|---|---|---|---|---|---|---|---|
| Home | 82 | 4.8 s | 0 | 99 | 0 | 187 KB | 100 |
| Explore | 87 | 4.1 s | 0 | 99 | 0 | 181–187 KB | 100 |
| Product (paid) | 78 | 4.8 s | **0.126** | 99 | 0 | 199 KB | 100 |
| Production Home (empty) | 93 | 3.2 s | 0 | 80 | **0.42** | — | 100 |

The product page's SEO score is 91 locally because the sample product has no meta description. That's a content gap in the sample, not a code bug.

## 2. Detector results, sorted

`impeccable detect app components` (static code): **0 findings.**

Live pages, at 1440×900 and 390×844:

| Finding | Pages | Verdict |
|---|---|---|
| `overused-font`: Geist is 78–85% of the text, and Fraunces is on the same list | all | **Real.** This is the main "AI-made" signal. Each direction below uses a different pairing. |
| `oversized-h1`: 88px, 47 characters, takes 29% of the viewport height | Home 1440 | **Real.** Three full sentences at display size. Shorten the line or step it down; let one phrase be large. |
| `nested-cards`: card inside card | Home, Product | **Partly real.** The hero search form is a white card on the page, and the "first win" box sits in the content. Flatten the search into the hero. |
| `line-length` ×6 | Product 1440 | **Real** (see P4). |
| `cramped-padding`: 0px vertical padding | Home, Library | **False positive.** It measures the stretched link text inside a goal card. The card has padding. |
| `text-occlusion` "Notion template" covered | Explore | **False positive.** The card's stretched link (`::after`, transparent) covers the cover label by design, and the label stays readable. |
| `text-occlusion` "Goal" covered by a button | Explore | **False positive.** The label is inside the *closed* Filters panel. The detector measured hidden content. |

Web Interface Guidelines (code review of `components/{home,product,catalogue,layout,library,ui}` and `app/(site)`): **no blocking issues.** Labels, `autocomplete`, `spellCheck={false}` on email, `role="status"`/`role="alert"`, the skip link, `touch-action`, `overscroll-behavior: contain` in the dialog and sheet, "Loading…" with an ellipsis, `Intl` money formatting, and no `transition: all` all pass. Only P5 needs a change. The Title Case rule was not applied (owner decision: sentence case).

## 3. What looks generic, area by area

### Type scale and hierarchy
- **Pairing:** Fraunces + Geist is the default "tasteful AI site" pairing. Both fonts are good, but together they now read as a template.
- **Hierarchy runs on size alone.** h1, h2 and h3 all use Fraunces at weight 420. Nothing changes but size, so section titles, card titles and the hero all feel the same.
- **The Home h1 is three sentences at 88px.** The italic "Make progress." is the only bit of personality, and it is in the template colour.
- **Fix:** a new pairing (see the directions), a clearer weight contrast between display and headings, and a hero line built around one phrase.

### Colour and the temporary accent
- `#2049a1` is a safe ink-blue, close to many SaaS defaults. With paper `#f9fbfe` and grey hairlines, the whole store is blue-grey. Nothing says "creative" or "making".
- The goal tints (mint, peach, sky, sand) are so faint, at the same lightness, that they read as one colour. Both sample products are in the same goal, so the catalogue looks like one mint block.
- **Fix:** choose a real accent with character (it must still pass AA with white text), warm or tune the neutrals, and give the four goals tints you can actually tell apart.

### Product cover art
- Covers are a flat pale box with a small icon in one corner and a tiny type label. They look like placeholders.
- On the product page, the cover prints the title and the title appears again beside it (desktop) or right below it (phone). On phones you see the same title twice in one screen.
- No visual system ties covers to goals, levels or the brand.
- **Fix:** a real generated cover system. Each product type gets a distinct composition, each goal a colour, and covers show honest facts only (type, goal, level, setup time). The cover replaces the "Sample content" clutter as the main image, and on the product page it should never repeat the h1 next to the h1.

### Spacing rhythm
- Every section uses the same `py-section` padding and alternates paper and white bands with hairlines. The page reads as equal stripes with no rhythm and no "chapter" moments.
- The featured grid with one product leaves two-thirds of the row empty at 1440, so the store looks unfinished.
- **Fix:** vary the rhythm (tight → open → tight), use a layout that looks deliberate with 1, 2 or 3 products, and drop some hairlines.

### Imagery
- No stock photos: correct, keep it that way. Today the only imagery is the faint covers, so the page has almost no picture weight.
- **Fix:** the covers become the imagery. A composed group of real product covers in the hero is honest (they are real products) and gives the page a picture.

### Motion
- What exists is careful: button press scale, hover lift on pointer devices, dialog fade and scale, `<details>` height easing, the sticky buy bar sliding up, all with reduced-motion handling. But there is **no** scroll entrance, page transition, list or filter transition, or layout-matching skeleton.
- `framer-motion` is installed but not used anywhere.
- **Fix:** see "Motion language" in each direction. Use `LazyMotion` + `m` so the library adds as little JavaScript as possible. Use React `<ViewTransition>` for the card → product cover move; it falls back to a normal navigation where browsers lack support.

### Copy
- Plain, warm and honest. Keep it. Small points:
  - "Featured resources" and "Free to download" are generic labels.
  - The hero sentence repeats "guides, templates, courses and project files", the same list as the footer.
  - "Find the right resource" sits in a large blue promo box, the most template-like block on the page.
- **Fix:** shorter section titles in the brand's voice, and a promise-led hero ("every resource comes with a first win").

### Empty states
- Production shows "The first resources are on their way" in a dashed box. The dashed box looks like a developer placeholder, not a designed moment.
- The Explore, Free and Library empty states use the same dashed box.
- **Fix:** a designed empty state for each place: a small drawn cover stack in the brand style, one plain sentence, and one useful action. No fake products.

### Product page
- Strong content structure ("what this does for you", first win, setup steps, fixes, license), and the side "On this page" index is good. Weak points:
  - The hero is two equal columns (cover | text), so the price and CTA sit far down on the right.
  - The title appears twice (see covers).
  - The "first win" box uses the accent tint and looks like the generic "info callout".
  - The step numbers are thin circles.
  - Long body lines (P4).
- **Fix:**
  - Hero: a tighter title, price and CTA group with honest facts (type · level · setup time).
  - Turn the first win into a signature block.
  - Make the setup steps a stronger numbered sequence.
  - Use the 65ch measure.

### Mobile buy bar
- It works and is accessible (`inert` when hidden, safe-area padding). It slides with CSS.
- It shows up abruptly as a flat white bar, and it can't show the product name.
- **Fix:** a short (~240 ms) slide plus fade, a thumbnail of the cover, the price and the CTA, and a soft top shadow instead of a hard border.

### Explore filters
- One collapsed "Filters" box with six native selects, plus a separate "Show results" submit button. Correct, and it works without JavaScript, but it feels like a form, not a store.
- **Fix:** keep the GET form (shareable URLs). Add goal chips that can be seen at a glance and submit on change when JavaScript is on. Animate the result count and the list reflow. Keep the "Show results" button for no-JS users and screen readers.

### My Library, claim dialog, checkout dialog
- These are functional and accessible, but visually they are default shadcn: a white panel, a label, an input and a button.
- **Fix:**
  - Show the product cover thumbnail and name at the top of each dialog, so the buyer knows what they're getting.
  - Make the success state a small, honest celebration (a cover "arrives" in the library, under 300 ms) with no confetti.
  - Library: a cover grid, not a list.

## 4. What to keep

- Sentence case, plain English, honest "sample" and "test mode" notes, and "not promises" disclaimers.
- The 16px body floor, 44–48px tap targets, the visible focus ring, the skip link, `inert` handling and reduced-motion rules.
- Server-rendered GET filters and URL state.
- The section order fixed by `PROJECT_SPEC.md` §3.1 and §4.1.
