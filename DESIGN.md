# Design system — Fieldkit

Direction A "Field Notes", chosen by the owner on 2026-11-18. Source of truth for values: `app/globals.css`. Full guide (colour, type, covers, motion, empty states, checks): [`docs/DESIGN.md`](docs/DESIGN.md).

## World

A well-made workbook: warm paper (`#f7f3ec`), ink text (`#1d1b17`) and one vermilion accent (`#b5381f`).

- **Headlines:** Newsreader 500, with one short italic moment per screen ("_this week._").
- **Reading text:** Schibsted Grotesk.
- **Covers:** numbered "figure plates" that show what each resource is.

## Rules

- **Colour:**
  - Neutrals plus one accent. Vermilion marks actions, prices, numbers, links and focus.
  - Errors use a cooler crimson, always with an icon and words.
- **Type:**
  - Body text at least 16px; 15px is the floor.
  - Long text at most 65 characters per line.
  - Capital-letter labels only for short labels.
- **Rhythm:**
  - An ink rule on top marks each new thing; hairlines separate items within it.
  - `01 / 02 / 03` numbering instead of icons.
- **Controls:** pill buttons (44px; 48px for the product CTA), 48px inputs, a 2px vermilion focus ring.
- **Motion:**
  - At or under 300ms, strong ease-out, no bounce.
  - Scroll entrances once, never above the fold.
  - The cover morphs from card to product page.
  - Reduced motion keeps fades only.
- **Never:**
  - gradients, glass or blur (one owner-approved exception: the Rare UI fluid orb on Home, see `docs/DESIGN.md`)
  - fake badges, ratings, sales counts or scarcity
  - stock images as covers
  - layout shift from loading states
