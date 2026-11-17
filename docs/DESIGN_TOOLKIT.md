# Design toolkit

Every skill, plugin and MCP tool on this computer that relates to design, UI, UX, motion, typography, colour, accessibility or frontend, checked on 2026-11-18. **✅ = used in the UI polish phase.** The project has no project-level skills; everything below is the owner's user-level setup. If a skill conflicts with `PROJECT_SPEC.md` or `CLAUDE.md`, the spec wins.

## Standalone skills (`~/.claude/skills`)

- ✅ `impeccable`: design critique and polish, plus the `impeccable detect` scanner. Run on code and on live pages at 1440 and 390.
- ✅ `emil-design-eng`: component polish and motion rules (press feedback, easing, timing, interruptible motion).
- ✅ `web-design-guidelines`: Vercel's Web Interface Guidelines review (accessibility, forms, focus, motion, copy).
- ✅ `animate`: builds one animation step by step (purpose → property → curve → duration → exit).
- ✅ `vercel-react-view-transitions`: React `<ViewTransition>` patterns for the card-to-product move.
- ✅ `vercel-react-best-practices`: keeps framer-motion and fonts from slowing the site.
- ✅ `vercel-composition-patterns`: component structure for the cover system.
- `review-animations`: critiques motion that already exists (use after build, in QA).
- `improve-animations`: audits a codebase's motion and writes a plan (not needed: little motion exists yet).
- `find-animation-opportunities`: lists places that should animate (covered by the task's own list).
- `animation-vocabulary`: names motion effects (reference only).
- `apple-design`: Apple-style fluid motion, sheets and materials (reference for direction C).
- `redesign-existing-projects`: redesign workflow (overlaps impeccable; not used).
- `ask-sonner`: toast library guide (no toasts in this store).
- `better-icons`: icon search across Iconify sets (lucide-react already covers our needs).
- `figma`: Figma to video (video-only, not used).
- `archify`: architecture diagrams (not UI).
- `ui-ux-pro-max:*` (`ui-ux-pro-max`, `design`, `design-system`, `ui-styling`, `brand`, `banner-design`, `slides`): broad style libraries and banners (not used; risk of generic styles).
- `artifact-design`, `dataviz`: Claude artifact and chart design (not for this codebase).
- `claude-in-chrome` (skill + MCP): real-browser checks. **Not connected this session**; headless Chrome with DevTools device emulation was used instead.
- `run`: launch the app and confirm a change works.
- `deploy-to-vercel`, `vercel-cli-with-tokens`, `vercel-optimize`: preview deploys and performance checks.
- `security-review`: ✅ run in QA (no new risks expected; the phase changes UI only).
- `code-review`, `simplify`: ✅ before commits.

## designer-skills plugins

**ui-design**

- ✅ `ui-design:type-system`: type scale, weights, line heights and measure.
- ✅ `ui-design:color-palette` / `ui-design:color-system`: palette tiers and contrast.
- ✅ `ui-design:spacing-system`: section rhythm.
- ✅ `ui-design:responsive-audit`: 390 / 768 / 1440 checks.
- ✅ `ui-design:visual-hierarchy`: hero and product page hierarchy.
- `ui-design:design-screen`: designs a single screen.
- `ui-design:platform-audit`: platform conventions audit.
- `ui-design:aesthetic-usability`: aesthetic–usability effect (reference).
- `ui-design:dark-mode-design`: dark mode (spec is light only).
- `ui-design:data-visualization`: charts (not needed).
- `ui-design:illustration-style`: illustration rules (input for the cover system).
- `ui-design:law-of-closure` / `law-of-common-region` / `law-of-continuity` / `law-of-figure-ground` / `law-of-proximity` / `law-of-similarity`: Gestalt principles (reference).
- `ui-design:layout-grid`: grid system.
- `ui-design:platform-conventions`: platform norms.
- `ui-design:readable-measure`: line length (fixes the product page's ~86–92 character lines).
- `ui-design:responsive-design`: responsive patterns.
- `ui-design:typography-scale`: type scale.
- `ui-design:von-restorff-effect`: making one thing stand out (the CTA).

**interaction-design**

- ✅ `interaction-design:animation-principles`: timing and easing rules.
- ✅ `interaction-design:loading-states`: skeletons that match the layout (fixes the layout-shift bug).
- ✅ `interaction-design:micro-interaction-spec`: button press and filter feedback.
- `interaction-design:design-form` / `form-design`: forms (claim and checkout dialogs already follow this).
- `interaction-design:design-interaction`, `interfaces-that-feel`, `feedback-patterns`: interaction feel.
- `interaction-design:error-flow` / `error-handling-ux`: error states.
- `interaction-design:map-states` / `state-machine`: UI states.
- `interaction-design:design-onboarding` / `onboarding-design`: onboarding (Start Here page).
- `interaction-design:navigation-patterns`, `search-ux`, `gesture-patterns`, `conversational-ux`.
- `interaction-design:doherty-threshold`, `fitts-law`, `hicks-law`, `jakobs-law`, `millers-law`, `peak-end-rule`, `serial-position-effect`, `teslers-law`, `zeigarnik-effect`: UX laws (reference).

**visual-critique**

- ✅ `visual-critique:critique-screen`: screen-level critique for the audit.
- `visual-critique:critique-ux`, `critique-affordance`, `critique-brand-consistency`, `critique-color`, `critique-composition`, `critique-information-density`, `critique-typography`, `critique-visual-hierarchy`.

**design-systems**

- ✅ `design-systems:design-token`: palette tier edit.
- ✅ `design-systems:motion-system`: motion tokens and the motion guide in `DESIGN.md`.
- ✅ `design-systems:accessibility-audit`: QA accessibility pass.
- `design-systems:audit-system`, `create-component`, `component-spec`, `tokenize`, `pattern-library`, `documentation-template`, `icon-system`, `localization-design`, `naming-convention`, `theming-system`, `design-system-governance`.

**designer-toolkit**

- ✅ `designer-toolkit:ux-writing`: empty states and microcopy.
- `designer-toolkit:design-token-audit`, `design-rationale`, `write-rationale`, `case-study`, `write-case-study`, `presentation-deck`, `build-presentation`, `design-negotiation`, `design-system-adoption`, `start-here`.

**ux-strategy**

- ✅ `ux-strategy:design-principles`: the MAKERS principles in `INSPIRATION.md`.
- `ux-strategy:competitive-analysis` / `benchmark`: (done by hand in `INSPIRATION.md`).
- `ux-strategy:frame-problem`, `strategize`, `design-brief`, `north-star-vision`, `experience-map`, `information-architecture`, `content-strategy`, `metrics-definition`, `opportunity-framework`, `service-blueprint`, `stakeholder-alignment`, `business-design`.

**prototyping-testing**

- ✅ `prototyping-testing:explore-options` / `parallel-concepts`: three directions, not one.
- `prototyping-testing:concept-selection`, `heuristic-evaluation`, `accessibility-test-plan`, `evaluate`, `experiment`, `prototype-plan`, `prototype-strategy`, `test-plan`, `test-scenario`, `a-b-test-design`, `click-test-plan`, `user-flow-diagram`, `wireframe-spec`.

**design-research / design-ops**

- `design-research:*` (discover, interview, synthesize, personas, journey maps, surveys…): user research (no users yet).
- `design-ops:design-qa-checklist`: ✅ merge checklist.
- `design-ops:handoff`, `handoff-spec`, `design-critique`, `design-debt-audit`, `design-review-process`, `design-sprint-plan`, `plan-sprint`, `setup-workflow`, `team-workflow`, `version-control-strategy`, `design-impact-reporting`.

## Other plugins

- ✅ `ponytail` (project-enabled): smallest complete change; `/ponytail-review` on the phase diff.

## MCP servers

- `claude-in-chrome`: browser automation (extension not connected this session).
- `ide`: editor diagnostics (failed to connect this session).
- `easel`: charts (not needed).
- `metapilot-native`: failed to connect; unrelated.

## Command-line tools used

- ✅ `impeccable detect` (bundled with the impeccable skill): design-slop scanner.
- ✅ Headless Google Chrome + DevTools Protocol: screenshots with real device emulation, reduced-motion emulation.
- ✅ Lighthouse 12 (`npx lighthouse@12`): Core Web Vitals and accessibility, before and after.
