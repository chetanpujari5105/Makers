# Handoff — MAKERS

Last updated: 2026-11-17, end of Phase 0 (approved and merged into `main`). Read with `CLAUDE.md`, `docs/DECISIONS.md` and `docs/SKILLS_AND_TOOLS.md`.

## 1. What exists

A runnable Next.js storefront shell with a finished design foundation and real quality gates. **No** database, catalogue, payments, storage, buyer auth or admin yet.

| Area           | State                                                                                                                                        |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Framework      | Next.js **16.4.6** (App Router, Turbopack), React 19.3, TypeScript 5 strict                                                                  |
| Styling        | Tailwind CSS **v4** (CSS-first config, no `tailwind.config`), `tw-animate-css`                                                               |
| Components     | shadcn/ui CLI v4, style `radix-nova` (Radix primitives), restyled for MAKERS                                                                 |
| Icons / motion | `lucide-react`; `framer-motion` installed but not used yet                                                                                   |
| Pages          | Home (placeholder), `/design-preview`, honest "being built" pages for every nav/footer link, `not-found`, `loading`, `error`, `global-error` |
| Tests          | Vitest 5 + Testing Library + jsdom — 6 files, 17 tests                                                                                       |
| Security       | Baseline headers in `next.config.ts` (no full CSP yet — see Known issues)                                                                    |

## 2. Folder map

```text
app/
  layout.tsx            Root layout: fonts (Geist + Fraunces), metadata, skip link
  globals.css           ALL design tokens (see §5)
  icon.svg              Placeholder favicon ("M" on accent) — replace with real logo
  not-found.tsx         Site-wide 404 (renders header/footer itself)
  error.tsx             Catches errors in the header/footer shell
  global-error.tsx      Last-resort error page (own <html>/<body>)
  (site)/               Public storefront (route group, no URL segment)
    layout.tsx          SiteHeader + <main id="main"> + SiteFooter
    page.tsx            Home placeholder (hero + four goals)
    loading.tsx, error.tsx
    design-preview/     Token + component reference (404 on Vercel production)
    explore/ free/ find/ bundles/ library/ about/ help/ contact/
    refund-policy/ terms/ privacy/ license/   → ComingSoon placeholders (noindex)
    category/[slug]/    ComingSoon for the 4 goal slugs; notFound() otherwise
components/
  ui/                   button, card, dialog, input, badge, label, checkbox (+ tests)
  layout/               container, wordmark, site-header, desktop-nav, mobile-nav,
                        site-footer, coming-soon, error-message
  product/ checkout/ library/ admin/   Empty (README says which phase)
lib/
  brand.ts              Store name, tagline, goals, nav — single source of brand truth
  site-url.ts           Safe NEXT_PUBLIC_SITE_URL reader (+ test)
  utils.ts              cn() = clsx + tailwind-merge, configured with our custom tokens (+ test)
  validators.ts         Zod schemas for external input (+ test)
  payments/ storage/ email/ auth/ security/   Empty (README per folder)
db/  emails/            Empty (README per folder)
content/products/_template.mdx   Product guide template (owner-supplied, do not reformat)
docs/                   This file, DECISIONS, SKILLS_AND_TOOLS, ACCEPTANCE_TESTS, STARTER_KIT
PRODUCT.md, DESIGN.md   Product truth + design system summary (used by the impeccable skill)
```

## 3. Commands

| Command                           | Purpose                                                                             |
| --------------------------------- | ----------------------------------------------------------------------------------- |
| `npm run dev`                     | Dev server, http://localhost:3000                                                   |
| `npm run lint`                    | `eslint .` (Next core-web-vitals + TypeScript rules + Prettier compat)              |
| `npm run typecheck`               | `next typegen && tsc --noEmit` (typegen creates route types like `PageProps<"/x">`) |
| `npm test`                        | `vitest run` (`npm run test:watch` for watch mode)                                  |
| `npm run build`                   | Production build                                                                    |
| `npm run format` / `format:check` | Prettier (with Tailwind class sorting)                                              |
| `npm run check`                   | **format:check → lint → typecheck → test → build.** Must pass before every commit.  |

## 4. Conventions

- **Git:** `main` is production (Vercel deploys it once connected). Start each phase on a new branch from `main` (`phase-1-catalogue`, `phase-2-…`). Run `npm run check` and the `code-review` skill before each commit. Merge into `main` only after the owner approves the phase. Commit messages: `feat:`, `fix:`, `docs:`, `chore:`. Never commit `.env*` files (only `.env.example`).

- **Files:** kebab-case (`site-header.tsx`); exports PascalCase (`SiteHeader`). Tests sit next to the file: `button.test.tsx`.
- **Imports:** always the `@/` alias (`@/components/ui/button`, `@/lib/brand`). Planned aliases `@/db/...` work too (alias is `@/* → ./*`).
- **`cn`:** import from `@/lib/utils`. It is `clsx` + `tailwind-merge` with the custom tokens registered (`text-h3`, `px-gutter`, `max-w-page`, `shadow-card`…). **When you add a token to `globals.css`, register it in `lib/utils.ts`**, or `cn()` may silently drop or keep conflicting classes. New shadcn components import `cn` from the `cn` package — ESLint now rejects that import (`no-restricted-imports`); change it to `@/lib/utils`.
- **Validation:** every external input (route params, query strings, API bodies) goes through a Zod schema in `lib/validators.ts` (example: `goalSlugSchema`).
- **Motion utilities:** Tailwind v4 `scale-*`/`translate-*` use the CSS `scale`/`translate` properties — list those (not `transform`) in `transition-[...]`, and add `motion-press`, `motion-lift` or `motion-nudge` so reduced-motion removes the movement.
- **Server first:** components are Server Components unless they need state/effects/browser APIs. Current client components: `desktop-nav` (usePathname), `mobile-nav`, `dialog`, `label`, `checkbox`, `error-message` and the error boundaries, `design-preview/_components/dialog-demo`.
- **Next.js 16 specifics** (check `node_modules/next/dist/docs/` before using an API):
  - `cacheComponents: true` and `partialPrefetching: true` are on (create-next-app defaults). Route segment configs `dynamic`, `dynamicParams`, `revalidate`, `fetchCache` are **unavailable**. Use `"use cache"`, `cacheLife`, `<Suspense>`, `connection()`.
  - Don't call `Date.now()`/`new Date()`/`Math.random()` in rendered server code without `connection()` + Suspense or caching — the build will fail.
  - `error.tsx` receives `{ error: unknown, retry }` (not `reset`).
  - `PageProps<"/route">` / `LayoutProps<"/">` are global generated types.
- **Copy:** plain English, sentence case (spec wins over "Title Case" lint advice), curly quotes ’ “ ”, ellipsis `…`.
- **Honesty rules:** no fake counts, ratings, testimonials, scarcity or working-looking stubs. Hide unconfigured values (e.g. `brand.supportEmail` is `null` → footer hides it).
- **Placeholder pages:** to build a real page, replace the `page.tsx` in its folder (keep the folder). Remove `robots: { index: false }` when the page is real.

## 5. Design tokens — where they live

**Everything is in `app/globals.css`**, in three tiers:

1. **Palette** (`--palette-*`): raw OKLCH values. Never used directly in components.
2. **Semantic** (`--background`, `--foreground`, `--primary`, `--muted-foreground`, `--border`, `--input`, `--ring`, `--success`, `--warning`, `--destructive`, `*-soft`, `--overlay`, `--elevation-*`, `--motion-*`): shadcn names + MAKERS additions. Note shadcn naming: **`--primary` is the brand accent**, `--accent` is only a subtle hover tint.
3. **Tailwind `@theme inline`**: generates utilities.

| Token family | Utilities                                                                                                       | Values                                                                                               |
| ------------ | --------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Colour       | `bg-primary`, `text-muted-foreground`, `bg-primary-soft`, `bg-success-soft`…                                    | Accent `#2049a1` (**temporary**), ink `#11161f`, paper `#f9fbfe`. All text pairs ≥ WCAG AA (checked) |
| Fonts        | `font-sans` (Geist), `font-display` (Fraunces, opsz+SOFT axes)                                                  | Headings h1–h4 default to `font-display`                                                             |
| Type scale   | `text-display`, `text-h1`, `text-h2`, `text-h3`, `text-lead`, `text-body`, `text-base` (16), `text-sm` (15)     | Fluid `clamp()`; body never < 16px; `text-sm` is the smallest allowed size                           |
| Spacing      | Tailwind 4px base (`p-4` = 16px) + `px-gutter`, `py-section`                                                    | Fluid gutters/sections                                                                               |
| Widths       | `max-w-page` (76rem), `max-w-prose` (42rem)                                                                     | `Container` component uses these                                                                     |
| Radius       | `rounded-lg` 12 (inputs), `rounded-xl` 16 (cards), `rounded-2xl` 20 (dialogs), `rounded-full` (buttons, badges) |                                                                                                      |
| Shadow       | `shadow-card`, `shadow-raised`, `shadow-dialog`                                                                 | Elevation = shadow **or** border, never both                                                         |
| Motion       | `ease-out` (cubic-bezier(0.23,1,0.32,1)), 150/200/300ms                                                         | Reduced motion removes scale/translate, keeps fades (bottom of globals.css)                          |

**Component rules:** Button default 44px (`lg` 48px for the product CTA), `loading` prop for submit states. Input 48px/16px text (no iOS zoom), pair with `<Label htmlFor>`, errors via `aria-invalid` + `aria-describedby` + `role="alert"`. Badge ≥14px; status colours always with words. Card: `interactive` prop for link cards (whole-card link via `after:absolute after:inset-0` on the title link). Dialog: always include `DialogTitle`; content scrolls inside on small screens. Hover styles use `pointer-fine:` so touch devices don't get sticky hovers.

**To change the accent colour:** edit `--palette-accent-50/600/700` in `globals.css`, then re-check contrast (white text on accent-600 needs ≥ 4.5:1), and update the hex values listed on `/design-preview`.

## 6. Decisions

See `docs/DECISIONS.md` (dated log of owner decisions and spec deviations).

## 7. Known issues

1. **Unknown `/category/<slug>` returns HTTP 200** (shows the correct "We couldn’t find that page" UI with `noindex`). Cause: with Cache Components, a param not listed in `generateStaticParams` streams, so the status is sent before `notFound()` runs. Unknown top-level URLs correctly return 404. Phase 1 replaces this page — verify real 404 status there (e.g. check the slug before any streaming boundary, or follow the Next 16 docs on `notFound` with Cache Components).
2. **ESLint 9** shows a "no longer supported" npm warning. ESLint 10 was tried and rejected: `eslint-plugin-react`, `eslint-plugin-jsx-a11y` and `eslint-plugin-import` (used by `eslint-config-next`) don't support it yet. Revisit when they do.
3. **4 moderate `npm audit` findings**, all inside the `shadcn` CLI's dependency chain (`ts-morph` → `minimatch`). `shadcn` is a dev dependency (only its `tailwind.css` is imported at build time); nothing ships to browsers. The CLI also bundles its own private copy of the `cn` package — that is expected and not used by our code. Do not run `npm audit fix --force` (breaking). Re-check when shadcn updates.
4. **No full Content-Security-Policy yet** — only `frame-ancestors 'none'`. Phase 3 must add a CSP that allows Razorpay Checkout (scripts + frames) and test checkout with it.
5. **npm 11 blocks install scripts** by default (`fsevents` warning). Harmless on this project; no action needed.
6. **Mobile screenshots:** headless Chrome has a 500px minimum window width, so `--window-size=390,...` screenshots are cropped, not emulated. Use real device emulation (DevTools Protocol `Emulation.setDeviceMetricsOverride`) or Playwright (Phase 2).
7. `framer-motion` is installed (spec) but unused; it adds nothing to the bundle until imported.

## 8. Phase 1 — first three tasks

1. **Database foundation:** create branch `phase-1-catalogue` from `main`; install Drizzle ORM, drizzle-kit and `@neondatabase/serverless` (check current docs/versions); create `db/index.ts` (pooled `DATABASE_URL`) and `drizzle.config.ts` (unpooled `DATABASE_URL_UNPOOLED` for migrations); add `db:generate`, `db:migrate`, `db:seed`, `db:studio` scripts; document pooled vs direct in README.
2. **Schema + migrations:** implement every table in PROJECT_SPEC.md §9 with UUID keys, integer minor-unit money, enums, unique constraints, check constraints and the §9.17 indexes. Generate the first migration and run it against a **development** Neon branch.
3. **Idempotent seed + catalogue read path:** seed the four goal categories (map `lib/brand.ts` `goals[].goalGroup` to `categories.goal_group`) and six realistic **draft** sample products (no fake reviews/sales); add a server-only data layer that returns **published** products only; then build Home featured strip, `/explore`, `/category/[slug]` and `/products/[slug]` on top of `components/ui` — replacing the placeholder pages.
