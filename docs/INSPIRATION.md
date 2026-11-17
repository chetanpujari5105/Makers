# Inspiration research

Done 2026-11-18 for the UI polish phase. **Inspiration, not copying:** we take principles only. No layouts, text, logos, illustrations, photos, icons, paid fonts or code from these sites go into MAKERS, and no images from them are stored in this repo. (Private research screenshots stayed in a temporary folder outside the project.)

## Design principles for MAKERS

1. **Show the real thing.** The product's own cover and contents are the imagery. No stock photos, no mock laptops.
   Backed by: Framer Marketplace (the template preview _is_ the hero), Apple iPad Air buy page (the product on a plain stage), Craft (shows its real app).
2. **One loud thing per screen.** One phrase, one picture, one action. Everything else stays quiet.
   Backed by: Gumroad ("Go from 0 to $1", one pink button), Apple iPad Air ("Whoosh."), Things (one icon, one sentence, one link).
3. **Start from the goal, not the file type.** Name what people want to do, and show examples under each goal.
   Backed by: Notion templates ("Get things done →", "Organize your knowledge →"), Maven (topic tabs), Siteinspire (categories as a plain text index).
4. **Type does the heavy lifting.** A characterful display face against a clear reading face, with real weight contrast, not size alone.
   Backed by: Every (serif headlines with distinctive italics), Craft (serif headline + quiet sans), Making Software (serif reading text + bold display), Linear (precise weights such as 510 and tight tracking).
5. **Facts, not hype.** Type, level, time and price appear as calm metadata. Never ratings we don't have, sales counts or "only 3 left".
   Backed by: Maven (live / duration / start date row), Apple (price and plan lines under each model), Framer template page (type · skills · category). Counter-example: Gumroad Discover's star counts and "12 left" tags.
6. **Motion is quick and quiet.** Feedback in about 100–180 ms, panels in about 240–320 ms, with a strong ease-out. Long reveals belong to brand sites, not stores.
   Backed by (measured transition durations): Linear (0.1 s / 0.16 s), Godly (0.12 s / 0.18 s, `cubic-bezier(0.2,0,0,1)`), Every (0.12 s / 0.15 s, `cubic-bezier(0.16,1,0.3,1)`), Are.na (0.18 s, `cubic-bezier(0.16,1,0.3,1)`), Apple (0.24 s / 0.32 s).
7. **The phone's first screen = headline + one action + a picture.**
   Backed by: Gumroad mobile (headline, two actions, artwork), Every mobile (artwork, headline, dek), Apple buy page mobile (title, price, product), Things mobile (icon, sentence, link).
8. **Calm surfaces, one confident colour.** Warm or neutral paper, ink text, and one accent used with intent.
   Backed by: Craft (warm paper + black), Things (cool grey + one blue), Notion templates (white + small colour icons), Gumroad (black/white + one pink).

## How this was researched (honest method notes)

- **Tooling:** the Claude-in-Chrome extension was **not connected**, so pages were opened in headless Chrome with DevTools device emulation, at 1440×900 and (where noted) a 390×844 phone. For each page I captured the first screen and read the computed CSS:
  - h1 and body font, size, weight, tracking
  - the most common `transition-duration` and timing functions
  - the number of running animations
- **Limits:**
  - Timings below are _measured CSS transition values_. I did not watch animations play, so I don't describe staggers or choreography I didn't see.
  - Only the first screen of each page was studied. Below-the-fold content and interactions are not described.
- **Could not study:**
  - **Pinterest:** a login wall covers results.
  - **Mobbin, Page Flows, Refero:** only their public landing pages load; the flows need an account. No accounts were created, so they are listed but not cited as sources of patterns.
  - **A Gumroad product page:** a bot-check page ("Just a moment…"). Not bypassed.
  - **Notion's freelancing category URL:** 404.
- **Coverage:**
  - 25 usable references from 12 sources: Awwwards, Godly, Land-book, Lapa Ninja, SaaSpo, Httpster, Siteinspire, Dribbble, Behance, plus direct visits to competitors, neighbours and product sites (Gumroad, Lemon Squeezy, Framer, Notion, Envato, Creative Market, Linear, Stripe, Vercel, Arc, Raycast, Apple, Readymag, Are.na, Maven, Every, Craft, Things, Cosmos, Making Software).
  - **Excellent on mobile** (checked at 390): Apple iPad Air buy page, Every, Things, Making Software, Notion templates, Gumroad home.

## References

Parts of our site: **H** Home hero · **G** goal cards · **C** product cards · **P** product page · **F** filters · **D** claim / checkout dialogs · **L** My Library · **E** empty states · **Ft** footer.

| #   | Reference                                                                                                                        | Found via | The one thing it does best                                                                             | Applies to                              | Notes (type · colour · motion, as measured)                                                    |
| --- | -------------------------------------------------------------------------------------------------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------ | --------------------------------------- | ---------------------------------------------------------------------------------------------- |
| 1   | [Making Software](https://www.makingsoftware.com/) 📱                                                                            | Httpster  | Technical drawings with "FIG.001" labels make a manual feel crafted and trustworthy                    | **C, P, E** (cover system, setup steps) | Serif reading text, pixel display title; near-white `#fbfbfb`; very little motion (0.15–0.3 s) |
| 2   | [Every](https://every.to/) 📱                                                                                                    | direct    | Editorial hierarchy: date · section label → big serif headline → dek                                   | **H, C**                                | Display + serif body at 20 px; transitions 0.12–0.15 s, `cubic-bezier(0.16,1,0.3,1)`           |
| 3   | [Craft](https://www.craft.do/)                                                                                                   | direct    | Warm paper, serif headline, paper-cut collage around the real product                                  | **H, E**                                | Serif 66 px, tracking −3%; paper `#fcf9f7`; 0.15–0.3 s, `cubic-bezier(0.4,0,0.2,1)`            |
| 4   | [Things](https://culturedcode.com/things/) 📱                                                                                    | direct    | Extreme calm: one object, one sentence, one link                                                       | **P, E, L**                             | Cool grey `#f2f5f7`; almost no motion (0.1–0.2 s ease-out)                                     |
| 5   | [Apple – Buy iPad Air](https://www.apple.com/shop/buy-ipad/ipad-air) 📱                                                          | direct    | Two-tone heading ("Model. Choose your size."), price lines under each option, product on a plain stage | **P, D**, buy bar                       | 0.24 s / 0.32 s, `cubic-bezier(0.4,0,0.6,1)`                                                   |
| 6   | [Apple – iPad Air](https://www.apple.com/ipad-air/) 📱                                                                           | direct    | One oversized word as the hero ("Whoosh."), then the product                                           | **H**                                   | Many timed animations (16 running at load). Too much for a store; take the one-word idea only  |
| 7   | [Notion templates](https://www.notion.com/templates) 📱                                                                          | direct    | Goal-first rows ("Get things done →") with tiny colour icons; search up top                            | **G, F**                                | Sans 42 px bold; 0.15–0.2 s                                                                    |
| 8   | [Gumroad home](https://gumroad.com/) 📱                                                                                          | direct    | Confidence: short claim, one colour, big buttons on mobile                                             | **H** (voice), colour courage           | 96 px headline; 0.15 s, `cubic-bezier(0.4,0,0.2,1)`. Decorative 3D coins = skip                |
| 9   | [Gumroad Discover](https://gumroad.com/discover)                                                                                 | direct    | Price shown as a bold tag shape on the card                                                            | **C** (price treatment)                 | Also an anti-pattern source: star ratings, "12 left" scarcity tags, busy covers                |
| 10  | [Framer Marketplace](https://www.framer.com/marketplace/)                                                                        | direct    | Categories as a plain text index; the preview image does all the selling                               | **F, C**                                | 0.15 s, `cubic-bezier(0.4,0,0.2,1)` ×232 (one consistent curve)                                |
| 11  | [Framer template page](https://www.framer.com/marketplace/templates/accrue-pro/)                                                 | direct    | "Show preview" and "Buy" side by side, meta row of honest facts, gallery thumbs                        | **P**                                   | Dark theme; take the structure, not the look                                                   |
| 12  | [Maven](https://maven.com/)                                                                                                      | direct    | Course cards with a calm fact row (format · length · start date · teacher)                             | **C, P**                                | 0.15 / 0.3 s, `cubic-bezier(0.4,0,0.2,1)`                                                      |
| 13  | [Are.na](https://www.are.na/)                                                                                                    | direct    | Plain, honest voice; a numbered a./b./c. list explains the product                                     | **E, L**, copy tone                     | 0.18 s, `cubic-bezier(0.16,1,0.3,1)`                                                           |
| 14  | [Linear](https://linear.app/)                                                                                                    | direct    | Precise type (variable weight 510, tight tracking); separate timings for feedback vs reveal            | motion timing, **H** type               | Hovers 0.1 / 0.16 s; reveals 0.7 s `cubic-bezier(0.32,0.72,0,1)` (too slow for us)             |
| 15  | [Stripe](https://stripe.com/)                                                                                                    | direct    | Two-tone headline: strong first clause, softer continuation                                            | **H, P** headings                       | 0.3 s, `cubic-bezier(0.25,1,0.5,1)` ×631. Gradient ribbon = anti-pattern                       |
| 16  | [Cosmos](https://www.cosmos.so/)                                                                                                 | direct    | Search as the hero, centred and large                                                                  | **H** search                            | 0.4 / 0.7 s. Scattered floating images = too noisy for us                                      |
| 17  | [Lemon Squeezy](https://www.lemonsqueezy.com/)                                                                                   | direct    | Friendly, large headline for "sell digital products"                                                   | **H** voice                             | Full-bleed saturated purple everywhere = too loud for long reading                             |
| 18  | [Raycast Store](https://www.raycast.com/store)                                                                                   | direct    | Store landing with search under a single word ("Store")                                                | **F, H**                                | Dark glossy 3D icons = skip                                                                    |
| 19  | [Siteinspire](https://www.siteinspire.com/)                                                                                      | gallery   | Category index as a plain text cloud; calm card grid with small captions                               | **F, Ft**                               | 0.1–0.15 s                                                                                     |
| 20  | [Awwwards – E-commerce](https://www.awwwards.com/websites/e-commerce/)                                                           | gallery   | Filter bar of compact dropdown chips above a grid                                                      | **F**                                   | 0.3 s ease                                                                                     |
| 21  | [Godly](https://godly.website/)                                                                                                  | gallery   | Fast, consistent micro-motion: one curve everywhere                                                    | motion                                  | 0.12 / 0.18 s, `cubic-bezier(0.2,0,0,1)` ×135                                                  |
| 22  | [Httpster](https://httpster.net/)                                                                                                | gallery   | Big honest count ("3116 websites featured") under the title                                            | **F** (result count style)              | Manrope; 0.2–0.3 s ease-out                                                                    |
| 23  | [Dribbble – "digital product store", "ebook landing page", "course platform"](https://dribbble.com/search/digital-product-store) | Dribbble  | Mostly anti-patterns (see below); a few show covers as a tidy shelf                                    | **C**                                   | —                                                                                              |
| 24  | [Behance – "ebook landing page", "digital product store"](https://www.behance.net/search/projects/ebook%20landing%20page)        | Behance   | Mostly anti-patterns: stock models, 3D renders, crowded hero text                                      | —                                       | —                                                                                              |
| 25  | [Land-book](https://land-book.com/) · [Lapa Ninja](https://www.lapa.ninja/) · [SaaSpo](https://saaspo.com/)                      | galleries | Show how alike dark SaaS heroes have become (what to avoid)                                            | —                                       | —                                                                                              |

Also opened, not cited: Vercel, Arc, Readymag, Creative Market, Envato (mostly anti-pattern evidence below), Pinterest, Mobbin, Page Flows and Refero (blocked or landing page only).

### Layout, spacing rhythm and scroll (full-page study of the six showcased references, 1440 wide)

| Reference            | Page length  | Layout and rhythm                                                                                                                                                                                             | Scroll behaviour                                   | Applies to                                              |
| -------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- | ------------------------------------------------------- |
| Making Software      | ~7,100 px    | One narrow reading column alternating with wide figures. A numbered table of contents with dot leaders. Sections are separated by white space, never boxes.                                                   | Plain scroll                                       | **P** (guide sections, contents list), **E**            |
| Every                | ~8,100 px    | The same section header row repeats ("SECTION →" + a 4-column grid). Very regular, newspaper-like rhythm.                                                                                                     | Plain scroll                                       | **C** grids, section headers                            |
| Craft                | ~11,000 px   | Big rounded colour panels, each a different soft tint, then lots of air, then a short italic quote. A clear "panel / air / quote" beat.                                                                       | Plain scroll; product images sit inside the panels | **H**, Home section rhythm                              |
| Notion templates     | ~5,400 px    | Heading + "Browse all →" + a 4-across grid, repeated for each collection. Quiet, predictable.                                                                                                                 | Plain scroll                                       | **G, C, F**                                             |
| Gumroad home         | (one screen) | The page scrolls inside its own container, so only the first screen could be captured.                                                                                                                        | Not studied                                        | —                                                       |
| Apple – Buy iPad Air | ~16,100 px   | Two columns: the product picture stays **fixed** on the left while the right column steps through the choices (Model → Finish → Storage → …), each a numbered-feeling step with a bold label and a grey hint. | Sticky media column                                | **P** (sticky cover beside the guide on desktop), **D** |

Not covered: scroll-linked animations (none were watched playing, see method notes).

### Motion worth copying, in principle

| Technique                         | Seen in (measured)                                                                     | Our use                                                                                                              |
| --------------------------------- | -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| One house curve for everything    | Godly (`0.2,0,0,1` everywhere), Framer (`0.4,0,0.2,1` ×232)                            | Keep our single strong ease-out `cubic-bezier(0.23,1,0.32,1)` (the same family as Every and Are.na's `0.16,1,0.3,1`) |
| Two speeds: feedback vs. panels   | Linear 0.1 / 0.16 s; Apple 0.24 / 0.32 s                                               | Hover/press 120–160 ms; dialogs, sheets and the buy bar 220–280 ms                                                   |
| Short scroll reveals              | Linear and Arc use about 0.7 s, Mobbin’s public landing page 1 s: too slow for a store | Reveal once, 8–12 px rise + fade, ≤ 300 ms, ≤ 40 ms stagger, off with reduced motion                                 |
| Shared element (thumbnail → hero) | Next.js docs (React `<ViewTransition>`); not observed on these sites                   | Card cover → product cover, ~250 ms; normal navigation where unsupported                                             |

## Ten ideas, ranked by impact versus effort

| Rank | Idea                                                                                                                    | Impact | Effort | Draws on                                          |
| ---- | ----------------------------------------------------------------------------------------------------------------------- | ------ | ------ | ------------------------------------------------- |
| 1    | Skeletons that match the real layout (fixes CLS 0.42 / 0.126)                                                           | High   | Low    | — (audit P1–P2)                                   |
| 2    | New font pairing inside a 120 KB budget (fixes the "AI font" signal and slow LCP)                                       | High   | Low    | Every, Craft, Linear                              |
| 3    | A real accent + four distinct goal colours, palette tier only                                                           | High   | Low    | Gumroad, Things, Craft                            |
| 4    | Generated cover system per product type (honest facts only)                                                             | High   | Medium | Making Software, Framer, Maven                    |
| 5    | Hero: one-phrase headline + inline search + a composed stack of _real_ covers                                           | High   | Medium | Apple iPad Air, Cosmos, Gumroad                   |
| 6    | Product page: tight title / facts / price / CTA group, a signature "first win" block, bold numbered steps, 65ch measure | High   | Medium | Apple buy page, Maven, Making Software            |
| 7    | Goal rows/tiles with examples and a small cover glyph                                                                   | Medium | Low    | Notion templates, Siteinspire                     |
| 8    | Buy bar with cover thumbnail, title, price and CTA; soft slide-up                                                       | Medium | Low    | Apple buy page                                    |
| 9    | Card → product cover transition (`<ViewTransition>`)                                                                    | Medium | Medium | Next.js view-transitions guide                    |
| 10   | Explore: goal chips that submit on change, animated count and list                                                      | Medium | Medium | Awwwards filter bar, Framer index, Httpster count |

## Anti-patterns to avoid (seen in this research)

- **Dark gradient SaaS heroes** with glows and ribbons (Stripe's ribbon, Vercel's glow, most of SaaSpo, Lapa Ninja, Land-book). They read as "software company", not "friendly shop".
- **Decorative 3D objects** that say nothing about the product (Gumroad's floating coins, Raycast's glossy icons).
- **Laptop or phone mock-ups, purple gradients and invented big numbers** ("50,000+") in Dribbble store and ebook shots.
- **Star ratings, sales counts and scarcity tags** ("12 left", "Limited time!") on Gumroad Discover cards. We have no such data and won't invent it.
- **Stock-photo models and 3D renders** as product imagery (Behance results, Creative Market, Envato).
- **Promo and cookie banners covering content** (Creative Market, Envato, Land-book, Lapa Ninja). We have no non-essential cookies, so we show no banner.
- **Slow reveals** (Linear and Arc ~0.7 s, Mobbin’s landing page 1 s, Stripe 0.8 s). Fine for a brand film, sluggish in a store.
- **Scattered floating images** (Cosmos) and **full-bleed saturated backgrounds for long reading** (Lemon Squeezy).

## Six references to react to

Tell me "I like this one" or "not this one" for any of these:

1. **Making Software:** https://www.makingsoftware.com/ (drawn technical figures; the manual feel)
2. **Every:** https://every.to/ (editorial headlines and labels)
3. **Craft:** https://www.craft.do/ (warm paper, serif headline, collage around the real product)
4. **Notion templates:** https://www.notion.com/templates (goal-first rows on mobile)
5. **Gumroad:** https://gumroad.com/ (one bold claim, one bold colour)
6. **Apple – Buy iPad Air:** https://www.apple.com/shop/buy-ipad/ipad-air (calm product page and price clarity)

The three design directions built from this research are in [`DESIGN_DIRECTIONS.md`](DESIGN_DIRECTIONS.md).
