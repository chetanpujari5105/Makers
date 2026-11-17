# Design system — MAKERS

Recorded from the built Phase 0 foundation (2026-11-17). Source of truth for values is `app/globals.css`; live reference at `/design-preview`. Details and usage rules: `docs/HANDOFF.md` §5.

## World

A bright, calm editorial storefront — part modern magazine, part learning platform. Near-white cool paper (`#f9fbfe`), white card surfaces, near-black ink text (`#11161f`) and one deep ink-blue accent (`#2049a1`, **temporary** until the brand colour is decided). Fraunces (variable, optical sizing) carries headlines with an italic accent moment ("_Make progress._"); Geist carries everything you read.

## Rules

- **Colour strategy:** restrained — neutrals plus one accent. Accent is for primary actions, links, key emphasis and focus rings. Status colours (success/warning/destructive) appear as soft tints with dark text and always with words.
- **Type:** fluid scale `display / h1 / h2 / h3 / lead / body / sm`; body ≥16px; `text-sm` (15px) is the floor; headings balanced, tracking ≥ -0.03em.
- **Surfaces:** cards are white with a soft offset shadow (`shadow-card`), radius 16px; no border + shadow together; hover lift only on pointer devices.
- **Controls:** pill buttons (44px default, 48px for the product CTA), 48px inputs with 16px text and a 2px ink focus ring, pill badges ≥14px.
- **Motion:** few, purposeful; ease-out `cubic-bezier(0.23,1,0.32,1)`, 150–300ms; dialogs fade + scale from 0.95; reduced motion keeps fades only.
- **Layout:** 76rem page width, fluid gutters, generous section rhythm (`py-section`), mobile-first.
- **Never:** gradient text, decorative glass/blur, eyebrow labels above headings, fake badges (discounts, popularity, scarcity), stock images as product covers.
