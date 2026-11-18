# Rare UI components

Adapted from [Rare UI](https://rareui.com) (`github.com/swamimalode07/rare-ui`).

Copyright (c) 2026 Swami Malode. Licence: MIT + Commons Clause + Attribution.

- **Attribution:** the site footer links to https://rareui.com. Keep that link and this notice.
- **Commons Clause:** we may use these components in the store, including commercially. We may **not** sell, sublicense or redistribute the components themselves. Never put them inside a product that MAKERS sells (UI kits, templates, code packs).

## Changes from the originals

All four were restyled to direction A (`docs/DESIGN.md`):

- They use our colour tokens instead of hard-coded colours.
- There is no blur and no bouncy springs. Motion stays at or under 300 ms with our ease-out.
- They use framer-motion's `LazyMotion` + `m` instead of the `motion` package.
- They keep the `cn` helper from `@/lib/utils`. Never let `shadcn add` overwrite `lib/utils.ts`.

| File                  | Used in                               | Other changes                                                                                                |
| --------------------- | ------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `scroll-progress.tsx` | product page, phones only             | Sits above the mobile buy bar. Moves focus to the current section when the list opens.                       |
| `faq.tsx`             | product page "Questions"              | Closed answers stay in the page (hidden), so search engines and no-JavaScript visitors keep them. No avatar. |
| `password-input.tsx`  | owner sign-in                         | Focus ring on the whole field; no strength meter on sign-in.                                                 |
| `fluid-orb.tsx`       | Home "Not sure where to start?" panel | Pauses when off screen; a still frame with reduced motion; decorative (`aria-hidden`).                       |
