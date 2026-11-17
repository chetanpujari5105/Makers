# Handoff — MAKERS

Last updated: 2026-11-17. Phases 0–1 are in `main`; Phase 2 is built on `phase-2-free-flow` (waiting for owner review and service setup). Read with `CLAUDE.md`, `docs/DECISIONS.md` and `docs/SKILLS_AND_TOOLS.md`.

## 1. What exists

A runnable Next.js storefront shell with a finished design foundation and real quality gates. **No** database, catalogue, payments, storage, buyer auth or admin yet.

| Area           | State                                                                                                                                        |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Framework      | Next.js **16.4.6** (App Router, Turbopack), React 19.3, TypeScript 5 strict                                                                  |
| Styling        | Tailwind CSS **v4** (CSS-first config, no `tailwind.config`), `tw-animate-css`                                                               |
| Components     | shadcn/ui CLI v4, style `radix-nova` (Radix primitives), restyled for MAKERS                                                                 |
| Icons / motion | `lucide-react`; `framer-motion` installed but not used yet                                                                                   |
| Pages          | Home (placeholder), `/design-preview`, honest "being built" pages for every nav/footer link, `not-found`, `loading`, `error`, `global-error` |
| Tests          | Vitest 5 + Testing Library + jsdom — 13 files, 50 tests                                                                                      |
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

1. **Vercel previews read Neon `main`.** `main` was migrated on 2026-11-17 (tables only), so Vercel builds pass, but `main` has no products or categories yet — previews show the empty catalogue (“The first resources are on their way”). Pages fall back to code for the four goals. Every future schema change must be migrated on `main` (owner-approved) **before** merging, or the production build fails.
2. **ESLint 9** shows a "no longer supported" npm warning. ESLint 10 was tried and rejected: `eslint-plugin-react`, `eslint-plugin-jsx-a11y` and `eslint-plugin-import` (used by `eslint-config-next`) don't support it yet. Revisit when they do.
3. **4 moderate `npm audit` findings**, all inside the `shadcn` CLI's dependency chain (`ts-morph` → `minimatch`). `shadcn` is a dev dependency (only its `tailwind.css` is imported at build time); nothing ships to browsers. The CLI also bundles its own private copy of the `cn` package — that is expected and not used by our code. Do not run `npm audit fix --force` (breaking). Re-check when shadcn updates.
4. **No full Content-Security-Policy yet** — only `frame-ancestors 'none'`. Phase 3 must add a CSP that allows Razorpay Checkout (scripts + frames) and test checkout with it.
5. **npm 11 blocks install scripts** by default (`fsevents` warning). Harmless on this project; no action needed.
6. **Mobile screenshots:** headless Chrome has a 500px minimum window width, so `--window-size=390,...` screenshots are cropped, not emulated. Use real device emulation (DevTools Protocol `Emulation.setDeviceMetricsOverride`) or Playwright (Phase 2).
7. `framer-motion` is installed (spec) but unused; it adds nothing to the bundle until imported.

## 8. Phase 1 — where it stands

1. **Done:** everything in BUILD_PLAN Phase 1 except the MDX loader/components. Neon `makers-db` (Singapore) connected to Vercel (Production, Preview, Development; variables `DATABASE_URL`, `DATABASE_URL_UNPOOLED`, not marked Sensitive because Vercel doesn't allow Sensitive variables in Development). Neon branch `development` (auto-delete: never) is migrated, seeded twice (no duplicates) and has `freelance-project-tracker` published.
2. **How pages get data:** `lib/catalogue/queries.ts` (plain queries, tested) → `lib/catalogue/catalogue.ts` (`"use cache"` + `cacheLife("minutes")`) → pages. Only `status = 'published'`; `product_files.file_key` and `external_url` are never selected.
3. **404s:** `proxy.ts` checks `/products/:slug` (published-slug lookup) and `/category/:slug` (four goal slugs) and rewrites to `/_not-found` with status 404. Needed because Cache Components start streaming (200) before a page can call `notFound()`.
4. **Explore:** a plain GET form (`components/catalogue/explore-filters.tsx`), so filters live in the URL and work without JavaScript. Parsing/validation in `lib/catalogue/filters.ts` (invalid values are ignored). Empty fields appear in the URL after submitting (harmless).
5. **Tests:** `lib/catalogue/queries.test.ts` creates `zz-test-*` products on the development branch, checks drafts/archived are hidden, no private keys, filters, sorting, pagination and proxy 404s, then deletes them. Skipped when no `DATABASE_URL`.
6. **Next:** owner says “merge” → merge to `main` → Phase 2 (only when the owner says so).

## 9. Phase 2 — where it stands

1. **Built:** buyer-details dialog for free products (`components/product/claim-dialog.tsx`); `POST /api/leads`, `/api/free-claim`, `/api/library/link`, `/api/library/continue`, `/api/library/sign-out`, `/api/download/[fileId]`; `/library`, `/library/continue`, `/library/[productSlug]` (Start Here); owner `/admin` + `/admin/login` with file upload to private storage (Backblaze B2; any S3-compatible store works) (`/api/admin/uploads` → browser PUT → `/api/admin/files` confirms with a HEAD request).
2. **Where the rules live:** `lib/library/access.ts` (all reads and writes; one SQL statement per multi-step write, because the neon-http driver has no transactions), `lib/auth/*` (signed cookies, magic links), `lib/security/*` (crypto, same-site check using `Sec-Fetch-Site`, rate limits), `lib/storage/files.ts` (provider-neutral `STORAGE_*` settings), `lib/email/send.tsx` + `emails/link-email.tsx`.
3. **Key behaviours:** a free claim saves the lead first, then grants the entitlement. It never signs the browser in: access comes only through the emailed one-time link. Opening that link spends nothing; the token is used only by the Continue POST. Downloads use POST, check the session email → active entitlement → limit, and write the log in the same statement as the count.
4. **No schema change** in Phase 2, so no migration on Neon `main` is needed to merge.
5. **Without services:** development prints email links to the terminal (`[dev email — not sent]`) and limits in memory. Production returns 503 (no Upstash), a 502 "couldn't send" error (no Resend), or "Downloads aren't available" (no storage), with no download counted.
6. **Tests:** `lib/library/access.test.ts` (development DB: claims, duplicates, consent, paid/draft refused, honeypot, cross-site, magic link once/replay/altered/expired, entitled/non-entitled/other-product downloads, 8 parallel downloads against a limit of 3, revoked) and `lib/auth/auth.test.ts`.
7. **Known gaps:** buyer sessions last 30 days and can't be revoked server-side (sign-out deletes the cookie only); external-link files don't count against the download limit; owner can't add external links or publish from `/admin` yet (Phase 4; use `npm run db:publish`). The Vercel preview reads Neon `main`, so test claims and downloads locally, not on the preview.
8. **Services (2026-11-17):** Vercel has `SESSION_SECRET`, `MAGIC_LINK_SECRET`, `ADMIN_PASSWORD_HASH`, `ADMIN_EMAIL` (Preview + Production, set with `vercel env add`, secrets marked Sensitive) and Upstash `makers-ratelimit` (Free, `sin1`, `KV_REST_API_*`). Storage is Backblaze B2 (R2 needed a billing subscription). The owner's admin login is in the git-ignored `.env.admin-login` (mode 600). Previews build sign-in links from `VERCEL_BRANCH_URL`, so links emailed from a preview open that preview.
9. **Merged and live (2026-11-17):** full preview test passed (claim → Resend email → Continue → My Library → B2 download; other-product/unknown/no-session downloads refused; replayed link refused; admin login, upload, `.exe` refused). All test rows and bucket objects were deleted. B2 keeps one key (`makers-store-v2`, limited to `makers-files`). Admin password was rotated after the merge (only in `.env.admin-login`). Resend still uses the test sender, which only delivers to the Resend account's own email — see `docs/DOMAIN_AND_EMAIL.md`. Bucket CORS allows `http://localhost:3000` and the production address only, so browser uploads from a preview address fail (by design).
