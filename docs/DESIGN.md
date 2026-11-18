# Design and motion guide: direction A "Field Notes"

Chosen by the owner on 2026-11-18 (see `DECISIONS.md`; the options are in `DESIGN_DIRECTIONS.md`). All values live in `app/globals.css`. This guide says **how to use them**. If something here disagrees with `PROJECT_SPEC.md` or `CLAUDE.md`, those win.

## The idea in one line

MAKERS should feel like **a well-made workbook**: warm paper, ink, one vermilion accent, and numbered "figure plates" that show honestly what each resource is.

## Colour

| Token (tier 1, `--palette-*`)         | Value                                         | Use                                                                                           |
| ------------------------------------- | --------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `paper`                               | `#f7f3ec`                                     | Page background (also the phone browser bar colour, `themeColor`)                             |
| `white`                               | `#fffdf9`                                     | Cards, dialogs, the guide area on product pages                                               |
| `neutral-100 / 200`                   | `#efe9de` / `#e2dacb`                         | Muted fills / hairlines                                                                       |
| `neutral-400`                         | `#8e8677`                                     | Input borders (3.55:1)                                                                        |
| `neutral-600`                         | `#5d574c`                                     | Secondary text (6.5:1 on paper)                                                               |
| `ink`                                 | `#1d1b17`                                     | Body text (15.5:1), section rules, the "Not sure where to start?" panel                       |
| `accent-600 / 700 / 50`               | `#b5381f` / `#932c17` / `#fbe9e3`             | Vermilion: primary buttons (white text 5.8:1), prices, numbers, links, focus ring             |
| `cover-create / learn / work / build` | `#efc9b4` / `#c9d8e6` / `#cfddc0` / `#edd39a` | Cover plates, one per goal                                                                    |
| `danger-600 / 50`                     | `#a3173f` / `#f9e4ea`                         | Errors: a cooler crimson, so an error never looks like the CTA; always with an icon and words |
| `success-700`, `warning-700`          | `#2f6a3a`, `#7a5310`                          | Status, on their soft tints (5.5:1, 5.9:1)                                                    |

Every pair above was measured for WCAG AA. On the ink panel, use the paper (`secondary`) button, not the vermilion one: vermilion on ink is only 2.9:1 at the edge.

**Rules:** one strong colour (vermilion). No gradients and no glass. Cover tints are surfaces, never text colours.

## Type

- **Headlines:** Newsreader 500 (plus italic), via `next/font`, SIL Open Font License. Use the italic only for one short emphasis per screen (the hero's "_this week._", step and section numbers).
- **Reading text:** Schibsted Grotesk (variable), SIL Open Font License.
- **Weight on the page:** about 97 KB of fonts in total (the budget is 120 KB). Don't add weights or styles without measuring again.
- **The ₹ sign** comes from two tiny files in `app/fonts/` (under 1 KB each), cut from the same two fonts and declared first in `--font-sans` and `--font-display` with `unicode-range: U+20B9`. Without them, a single ₹ downloads a 15–20 KB "latin-ext" file. If you change a font, cut a new ₹ file from it (`pyftsubset <font>.woff2 --unicodes=U+20B9 --flavor=woff2`).
- **Scale:** unchanged fluid tokens (`text-display … text-sm`). Body text is at least 16px, and `text-sm` (15px) is the smallest size.
- **Line length:** long text is at most `65ch` (product guide, descriptions).
- **Labels in caps** (`FIG. 6`, `NOTION TEMPLATE`, `FIRST WIN`): `text-sm font-semibold uppercase tracking-[0.08–0.12em]`. Use them only for labels, never for sentences.

## Layout and rhythm

- **Ink rules mark a new thing.** A 1px `border-foreground` sits on top of each card, the hero steps, the goal index, the promises and the buy block. Hairlines (`border-border`) separate items inside a thing.
- **Numbering is the brand voice.** Use `01 / 02 / 03` in italic vermilion for steps, goals and promises. Don't use icons for these.
- **Grids hold up with 1, 2 or 3+ items.** One product becomes a wide card with the cover beside the text; two products sit as a pair.
- Sections use `py-section`. The page width is 76rem.

## Cover system (`components/product/product-cover.tsx`, `figure.tsx`)

- **When there's a real cover image,** it's always used as-is.
- **Otherwise, a figure plate is drawn.** It has:
  - the goal's tint;
  - a thin inset frame;
  - "FIG. n" on the left and the type name on the right;
  - a line drawing of the product type, with one vermilion part.
- **Figure numbers are fixed per type:**
  1. PDF
  2. Ebook
  3. Course
  4. Markdown
  5. Prompt pack
  6. Notion
  7. Design kit
  8. 3D model
  9. Bundle
- **Sizes:**
  - `card`: number, type and drawing.
  - `hero`: the same, plus an accessible name ("Cover of …: Notion template").
  - `thumb`: the drawing only, used in the buy bar, dialogs and the free strip.
- **Honesty rule:** a cover shows only true facts. No ratings, badges or "bestseller" stickers. When fewer than three products exist, the Home hero fills the empty spots with type-only plates that have no product names.

## Motion

| What                        | How                                                                                                           | Timing                              |
| --------------------------- | ------------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| Button press                | CSS `scale(0.97)` on `:active`                                                                                | 150 ms ease-out                     |
| Card hover (mouse only)     | Cover plate lifts 4px and gains a shadow; title underlines                                                    | 200 ms                              |
| Scroll entrance             | `<Reveal>` (`components/motion/reveal.tsx`, framer-motion `LazyMotion` + `m`): fade in and rise 8px, **once** | 260 ms, 40 ms stagger (max 5 steps) |
| Card → product page         | React `<ViewTransition name="cover-{slug}" share="morph">`: the plate grows into the product cover            | 260 ms                              |
| Explore filters             | `next/form` keeps you on the page; results crossfade (`.crossfade`)                                           | 120 ms out, 200 ms in               |
| Dialogs                     | Fade + scale from 0.95                                                                                        | 200 ms in, 150 ms out               |
| Mobile menu                 | Slides in from the right                                                                                      | 250 ms in, 150 ms out               |
| Mobile buy bar              | Slides up and fades once the hero's button scrolls away                                                       | 240 ms                              |
| Success in the claim dialog | The cover thumbnail settles in (fade + zoom from 90%)                                                         | 300 ms                              |
| Loading                     | Placeholders shaped like the real page, at least one screen tall, with a soft pulse                           | —                                   |

**Rules:**

- UI motion stays at or under 300 ms and uses the strong ease-out `cubic-bezier(0.23, 1, 0.32, 1)`. No bounce.
- **Never use `<Reveal>` above the fold or on a headline.** Its content is hidden until JavaScript runs. A `<noscript>` rule shows it when JavaScript is off.
- **Reduced motion:**
  - Movement is removed: framer-motion's `reducedMotion="user"` and the CSS block in `globals.css`.
  - Fades stay.
  - View transitions become an instant swap.
- **No layout shift:**
  - Animate only `opacity` and transforms.
  - Loading placeholders must match the real layout and fill the screen. This fixed a 0.6 layout-shift score on Home.
- **View-transition names must be unique on a page.** Only `ProductCard` covers and the product-page hero cover carry `cover-{slug}`.

## Empty states and words

- **One component:** `CatalogueEmpty` (a small stack of blank plates, one plain sentence, one useful action). It's used on Home, Explore, category, Free and My Library.
- **Plain English at about grade-six level** and sentence case.
  - Say what happened and what to do next: "Nothing matches these filters. Try fewer filters or a shorter search word."
  - Placeholders end in "…".
- **Never** use fake reviews, ratings, sales counts, scarcity, stock photos or invented results.

## Checking your work

- `npm run check` (format, lint, types, tests, build).
- Contrast: re-measure any new colour pair (AA: 4.5:1 for text, 3:1 for borders and focus).
- Fonts: the page total must stay at or under 120 KB, including ₹.
- Lighthouse on Home, Explore and a product page, phone and desktop. Layout shift (CLS) must stay under 0.1.
