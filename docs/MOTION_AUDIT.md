# Motion audit (2026-11-18)

Goal: every animation runs on the compositor (`transform`, `opacity`), uses one easing curve, and stays within 150 ms for feedback and 250 ms for panels (never over 300 ms). Rules now live in `docs/DESIGN.md` → Motion.

## How it was measured

- Local production build (`npm run build && next start`) with the development database, in Chrome 157 with the real GPU.
- **CPU slowed 4×** (Chrome DevTools throttling, a mid-range phone profile). Phone runs used 412×915 at 2× pixel density; desktop runs used 1440×900.
- For each interaction a script recorded a Chrome performance trace and counted frames. It reports:
  - frame rate and the 95th-percentile frame time;
  - frames longer than 33 ms (visibly dropped);
  - main-thread **Layout** and **Paint** events (count and total ms). These are what an animation should _not_ cause on every frame.
- With invalidation tracking switched on, the trace also says _which element_ caused each layout or paint. That is how the causes below were found.
- "Before" is commit `3302ec2` (Rare UI added, motion untouched). "After" is commit `8baf568`. The final commit only adds a skip for hidden components, which removes more work.
- The scripts are in the session scratchpad, not the repo. They are throwaway measuring tools.

## Results (CPU 4×)

The screen refreshes at 120 Hz, so about 120 fps is the ceiling.

| Interaction                                  | fps       | p95 frame (ms) | frames > 33 ms | Layouts (time)               | Paints (time)                 |
| -------------------------------------------- | --------- | -------------- | -------------- | ---------------------------- | ----------------------------- |
| Card hover (desktop)                         | 119 → 120 | 9.1 → 9.2      | 0 → 0          | 1 (0.5 ms) → 2 (0.5 ms)      | **52 (7.4 ms) → 6 (1.2 ms)**  |
| Scroll reveals, Home (phone)                 | 120 → 119 | 9.1 → 9.2      | 0 → 0          | 4 (1.9 ms) → 4 (1.8 ms)      | 24 (8.9 ms) → 24 (11.4 ms)    |
| Card → product view transition (desktop)     | 119 → 118 | 9.2 → 9.2      | 1 → 1          | 5 (11 ms) → 7 (17 ms)        | **94 (12 ms) → 49 (11 ms)**   |
| Explore filter crossfade (phone)             | 120 → 120 | 9.2 → 9.2      | 1 → 1          | 42 (12 ms) → 41 (5 ms)       | **106 (23 ms) → 77 (13 ms)**  |
| Claim dialog opens (phone)                   | 117 → 117 | 9.2 → 9.2      | 1 → 1          | **45 (28 ms) → 4 (4 ms)**    | **105 (23 ms) → 34 (14 ms)**  |
| Scrolling the product page / buy bar (phone) | 120 → 119 | 9.3 → 9.1      | 0 → 0          | **183 (11 ms) → 3 (1.4 ms)** | **359 (65 ms) → 15 (4.5 ms)** |
| Mobile menu opens (phone)                    | 117 → 116 | 9.2 → 9.2      | 0 → 1          | 3 (3 ms) → 3 (5 ms)          | 13 (2 ms) → 16 (4 ms)         |
| FAQ answer opens (phone)                     | 120 → 119 | 9.1 → 9.3      | 0 → 0          | **99 (11 ms) → 6 (5 ms)**    | **211 (38 ms) → 43 (13 ms)**  |

Frame rate was already at the ceiling before. What changed is how much work each frame needs, which is the headroom a slower real phone needs. The view transition and the Explore crossfade still lay out the new page once, because they swap in new content. That is expected.

**Single dropped frames:** the dialog, menu, crossfade and view transition each show at most one frame over 33 ms. It is the moment React mounts the new content (JavaScript, about 50 ms at 4× slowdown), not the animation. It happens once per open and is not visible as stutter.

## What was wrong, and the fix

| Problem (found in the trace)                                                                                                                                    | Fix                                                                                                                                                                                                        |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Card hover animated `box-shadow`**: the cover repainted every frame for 200 ms.                                                                               | The shadow is painted once on a layer under the cover (`.lift-shadow` in `globals.css`). Hover fades that layer's `opacity`; the lift stays a `translate`.                                                 |
| **Scroll pill progress ring** rewrote an SVG attribute (`stroke-dasharray`) on every scroll frame, causing a layout and a paint each frame (the "buy bar" row). | The ring is two half-rings rotated with `transform` (`ProgressRing` in `scroll-progress.tsx`).                                                                                                             |
| **Scroll pill open/close** animated `width`, `height` and `border-radius`.                                                                                      | The pill and the section list fade and scale (0.96 → 1) from the bottom edge.                                                                                                                              |
| **Claim dialog** loaded the 1 KB ₹ font only when it opened, so the price re-laid-out the form mid-animation.                                                   | The dialog asks for that font when the page loads (`document.fonts.load`).                                                                                                                                 |
| **"Common problems" answers** animated `height`.                                                                                                                | The answer fades in (250 ms) and the height opens at once.                                                                                                                                                 |
| **Focus rings** on buttons, inputs, the password field and the Explore sort box animated `box-shadow`.                                                          | Rings appear at once.                                                                                                                                                                                      |
| **Paper-plane rail** (new): the original moves along a curved SVG path and repaints masks each frame.                                                           | Straight rail. The plane moves by `translateY`, and the filled line grows by `scaleY`.                                                                                                                     |
| Hidden components still ran their scroll code: the rail on phones, the pill on desktop.                                                                         | Each skips its scroll work while hidden.                                                                                                                                                                   |
| **Timing drift:** 200, 240, 260 and 300 ms values, plus a second ease-in curve in the FAQ and the CSS tokens.                                                   | One curve, `cubic-bezier(0.23, 1, 0.32, 1)`, also set as Tailwind's default. 150 ms for feedback (hover, press, fades), 250 ms for panels (dialogs, menu, buy bar, pill list, morph). Nothing over 300 ms. |

**Kept on purpose:** colour changes on hover (links, buttons, chips) keep a 150 ms colour fade. They repaint only that small control, only on hover, and measured under 1 ms per hover. The password field's blinking caret is a looping on/off step, not a transition.

## Fluid orb (Home)

| Check (phone profile, CPU 4×, orb forced on at phone width) | Result                                                                                                                                  |
| ----------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Frame rate with the orb animating, real GPU                 | 120 fps (same as with the orb removed), 0 long tasks                                                                                    |
| Frame rate with software graphics (worst case, no GPU)      | 60 fps (the software renderer's cap; same with the orb removed)                                                                         |
| Lighthouse mobile, Home                                     | 91 with the orb on at phone width vs 92 as shipped (TBT 14 ms vs 26 ms, LCP 3.5 s vs 3.4 s): **about 1 point**, within run-to-run noise |

Both limits held (cost under 3 points, never below 50 fps), so the orb did **not** need hiding below `lg`. It stays as before: hidden on phones (below `sm`), shown from `sm` up.

It now has a **2 KB still image** underneath (`public/images/orb-still.webp`). The live WebGL orb fades in over it only when all of these hold (`orbMayAnimate` in `fluid-orb.tsx`):

| Device case (tested by faking it in Chrome)                                                                              | Live orb?                                            |
| ------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------- |
| Desktop, capable                                                                                                         | yes                                                  |
| Tablet, 700 px                                                                                                           | yes                                                  |
| No WebGL (`getContext` returns nothing)                                                                                  | no, still image                                      |
| Save-Data on (`navigator.connection.saveData`)                                                                           | no, still image                                      |
| `prefers-reduced-data: reduce`. Chrome supports it only behind its experimental-features flag; tested with that flag on. | no, still image                                      |
| Reduced motion                                                                                                           | no, still image                                      |
| 2 CPU cores                                                                                                              | no, still image                                      |
| 2 GB memory                                                                                                              | no, still image                                      |
| Battery 10%, not charging (Chrome's battery API; other browsers skip this check)                                         | no, still image                                      |
| Phone, 390 px                                                                                                            | hidden; the still image isn't even downloaded (lazy) |

## Lighthouse before → after (local, median of 3)

| Page    | Phone perf (5 runs) | Phone LCP   | Phone TBT  | Desktop perf | CLS   | Page JS      |
| ------- | ------------------- | ----------- | ---------- | ------------ | ----- | ------------ |
| Home    | 92 → 92             | 3.4 → 3.4 s | 26 → 24 ms | 100 → 100    | 0 → 0 | 220 → 220 KB |
| Explore | 91 → 91             | 3.5 → 3.5 s | 15 → 14 ms | 100 → 99     | 0 → 0 | 223 → 223 KB |
| Product | 90 → 91             | 3.6 → 3.5 s | 22 → 22 ms | 99 → 100     | 0 → 0 | 253 → 255 KB |

Home and the "before" column are the median of 3 runs; the "after" phone scores for Explore and Product are the median of 5 runs on an idle machine. One earlier 3-run set overlapped with other work on the machine and showed Speed Index outliers (up to 7.5 s), so it was discarded. The product page gained 2 KB of JavaScript for the paper-plane rail. Accessibility and best practices scored 100 on every page. SEO scored 100, except the product page at 91 before and after: Next 16 streams the page description into the body, and Lighthouse looks for it in the head. This is not new; it is noted in `docs/HANDOFF.md`.

## Keyboard and reduced motion (checked after the changes)

- **Keyboard only**, each flow run with reduced motion off and then on:
  - Rail links: Tab reaches them, Enter scrolls to the section and updates the link.
  - Explore card links: reached, with a focus ring.
  - Scroll pill: Enter opens it and moves focus to the current section; Escape closes it and returns focus to the pill.
  - Claim dialog and phone menu: Enter opens them with focus inside; Escape closes them and returns focus to the button.
  - FAQ questions: Enter opens the answer.
  - Password eye: Enter shows the password; `aria-pressed` changes.
- **Reduced motion:**
  - The card doesn't lift, but its shadow still fades in.
  - The pill list fades without scaling.
  - The buy bar fades without sliding.
  - The rail plane jumps straight to the section without the spring.
  - The orb shows its still image.
  - View transitions swap instantly (CSS rule unchanged).
