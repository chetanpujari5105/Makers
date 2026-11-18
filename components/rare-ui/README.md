# Rare UI components

Adapted from [Rare UI](https://rareui.com) (`github.com/swamimalode07/rare-ui`).

Copyright (c) 2026 Swami Malode. Licence: MIT + Commons Clause + Attribution.

- **Attribution:** the site footer links to https://rareui.com. Keep that link and this notice.
- **Commons Clause:** we may use these components in the store, including commercially. We may **not** sell, sublicense or redistribute the components themselves. Never put them inside a product that MAKERS sells (UI kits, templates, code packs).

## Changes from the originals

All five were restyled to direction A (`docs/DESIGN.md`):

- They use our colour tokens instead of hard-coded colours.
- There is no blur and no bouncy springs. Motion uses our one ease-out curve: 150 ms for feedback, 250 ms for panels.
- They animate only transforms and opacity (`docs/MOTION_AUDIT.md`).
- They use framer-motion's `LazyMotion` + `m` instead of the `motion` package.
- They keep the `cn` helper from `@/lib/utils`. Never let `shadcn add` overwrite `lib/utils.ts`.

| File                  | Used in                               | Other changes                                                                                                                                                                              |
| --------------------- | ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `scroll-progress.tsx` | product page, phones only             | Sits above the mobile buy bar. Moves focus to the current section when the list opens. The ring is two rotating half-rings; the pill and the list fade and scale instead of changing size. |
| `rail-toc.tsx`        | product page, desktop                 | Real `#` links. A straight rail, so the plane and the filled line move with transforms. 16px labels. Skips its scroll work while hidden.                                                   |
| `faq.tsx`             | product page "Questions"              | Closed answers stay in the page (hidden), so search engines and no-JavaScript visitors keep them. No avatar.                                                                               |
| `password-input.tsx`  | owner sign-in                         | Focus ring on the whole field; no strength meter on sign-in.                                                                                                                               |
| `fluid-orb.tsx`       | Home "Not sure where to start?" panel | A still image underneath; the live orb only on capable devices (`orbMayAnimate`); if WebGL fails the still image stays. Pauses when off screen. Decorative (`aria-hidden`).                |

Not used (checked 2026-11-18): the AI/chat pieces (prompt box, streaming reply, AI status, web search, voice note, matrix orb), social pieces (emoji reaction, GitHub activity, notification bell), `otp-input` (buyers use email links), `toast` (the store shows messages in place), `delete-button` (the admin already asks for a tick-box), `task-list` (progress wouldn't be saved), `animated-counter` (no counts to show), and decorative ones that don't fit direction A.
