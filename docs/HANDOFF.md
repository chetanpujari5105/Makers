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
  layout.tsx            Root layout: fonts (Schibsted Grotesk + Newsreader), metadata, skip link
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

| Token family | Utilities                                                                                                       | Values                                                                                                                    |
| ------------ | --------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Colour       | `bg-primary`, `text-muted-foreground`, `bg-primary-soft`, `bg-success-soft`…                                    | Accent vermilion `#b5381f`, ink `#1d1b17`, paper `#f7f3ec` (direction A, `docs/DESIGN.md`). All pairs ≥ WCAG AA (checked) |
| Fonts        | `font-sans` (Schibsted Grotesk), `font-display` (Newsreader 500 + italic)                                       | Headings h1–h4 default to `font-display`                                                                                  |
| Type scale   | `text-display`, `text-h1`, `text-h2`, `text-h3`, `text-lead`, `text-body`, `text-base` (16), `text-sm` (15)     | Fluid `clamp()`; body never < 16px; `text-sm` is the smallest allowed size                                                |
| Spacing      | Tailwind 4px base (`p-4` = 16px) + `px-gutter`, `py-section`                                                    | Fluid gutters/sections                                                                                                    |
| Widths       | `max-w-page` (76rem), `max-w-prose` (42rem)                                                                     | `Container` component uses these                                                                                          |
| Radius       | `rounded-lg` 12 (inputs), `rounded-xl` 16 (cards), `rounded-2xl` 20 (dialogs), `rounded-full` (buttons, badges) |                                                                                                                           |
| Shadow       | `shadow-card`, `shadow-raised`, `shadow-dialog`                                                                 | Elevation = shadow **or** border, never both                                                                              |
| Motion       | `ease-out` (cubic-bezier(0.23,1,0.32,1)), 150/200/300ms                                                         | Reduced motion removes scale/translate, keeps fades (bottom of globals.css)                                               |

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

## 10. Phase 3 — Razorpay test mode (merged 2026-11-17; checkout closed on Production)

1. **Built:** `lib/payments/provider.ts` (interface), `razorpay.ts` (REST via `fetch`: create order, fetch payment, both signature checks; `isCheckoutOpen()`), `orders.ts` (all order SQL); `POST /api/orders`, `/api/payments/verify`, `/api/webhooks/razorpay`; paid mode in `components/product/claim-dialog.tsx` (Checkout.js loaded on demand); `/checkout/success`.
2. **Flow:** dialog → lead saved → order from the DB price (any browser amount ignored; double submits reuse the order via `idempotency_key`) → Razorpay Checkout → verify (signature + Razorpay says `captured` with the same order, amount and currency) → one SQL statement marks the order paid and grants access → receipt email with a one-time library link. The browser is never signed in (same reason as free claims). The webhook does the same independently; whichever arrives first wins, the other is a no-op.
3. **Safety switch:** `isCheckoutOpen()` needs all three `RAZORPAY_*` settings, a `rzp_test_` key, and a site that is not Vercel Production. So production keeps "Opens soon" until live mode is approved.
4. **States:** `authorized` = pending (no access yet; the webhook finishes it). `failed` can still become `paid` (Razorpay allows retries on one order). Full refund (Razorpay's `amount_refunded` ≥ amount) revokes access; partial refunds keep it.
5. **Webhook storage:** `webhook_events` keeps the event ID and a trimmed summary (IDs, amount, currency, status) — no email, phone or card data.
6. **Not built:** coupons, buying bundles (refused), USD, live mode, invoices/GST.
7. **Tests:** `lib/payments/payments.test.ts` (development DB + fake Razorpay): price tampering, double submit, refused products, forged signature, wrong amount, failed/authorized, success + repeat, webhook-first + duplicate event, bad webhook signature, failed-then-paid, partial vs full refund.
8. **Services (2026-11-17):** Razorpay account (KYC under review; test mode works). Test key regenerated after an accidental exposure (old key deactivated immediately). `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET` are in Vercel **Preview only** and `.env.local`; Production has none. No webhook is registered in Razorpay yet: the preview is behind Vercel login, and production keeps checkout closed. Register it (URL + the same secret + the four events in README §8) when live mode is approved.
9. **Manual test (2026-11-17, localhost + development DB, Razorpay test mode):** price from the DB (₹1 USD sent → Razorpay order at ₹99 INR); double submit → same order; real test payment → success page, 1 entitlement, 1 receipt, receipt link signs in once, library lists it, download authorised for the buyer only; Netbanking "Failure" → no payment, no access; cancelling keeps the form filled. Preview: checkout on, unknown product 404, other-site 403, unsigned webhook 400. Test payments run only on localhost (assistant rule), so the preview wasn't used for paying. All test rows deleted.
10. **Known gap:** `/api/download` checks "storage configured" before anything else, so even external-link files say "unavailable" on a computer without `STORAGE_*` settings. No effect on Vercel (storage is set).
11. **⚠ MUST before any real paid product is published:** remove the Razorpay test keys from Vercel **Preview**, or give Preview its own database. Previews read the production database, so a test-card purchase on a preview would create a real entitlement to real paid files. Until then, keep preview protection (Vercel login) on. No webhook is registered in Razorpay and live mode is off — both wait for the owner's live-mode approval.

## 11. Phase 4 — owner admin (merged 2026-11-18)

1. **Routes:** `/admin` (dashboard), `/admin/products` (+ `/new`, `/[id]`, `/[id]/preview`), `/admin/orders` (+ `/[id]` with "resend receipt"), `/admin/customers`, `/admin/leads` (+ CSV at `/api/admin/leads/export`), `/admin/coupons`, `/admin/reviews`, `/admin/updates`. Buyers: `POST /api/reviews`, review form and update notes on Start Here.
2. **Protection:** every page calls `requireAdminPage()`; every server action in `app/(site)/admin/actions.ts` runs inside `ownerOnly()`; admin APIs check `isAdmin()`. The `(owner)` layout only draws the menu. `lib/admin/admin.test.ts` calls every exported action while signed out and expects a refusal, so a new action without the check fails the tests. Logged-out page requests return 200 (streaming) but contain only a redirect to `/admin/login`.
3. **Products:** plain fields per section (lists = one per line, pairs = `first | second`), type-specific fields, an "advanced JSON" box that wins only if changed. Drafts save half-finished; publishing (and any edit of a live product) must pass `publishProblems` (now names each missing section and checks the gallery). Web address locks after first publish or first buyer. Categories are the four goals; their rows are created on first save (production needs no seed). Archiving stops sales; buyers keep access.
4. **Database change:** migration `0001_phase4_admin` (new `admin_audit_logs` table; unique review per buyer per product). Applied to development and, with the owner's approval on 2026-11-17, to production Neon `main` (tables/indexes only, no data).
5. **Coupons:** store-wide, percent (1–90) or rupees off; checked on the server in `/api/orders`; never below ₹1; INR only. A use is counted when the payment is confirmed (inside `fulfilPaidOrder`) and given back on a full refund. An unpaid checkout holds its use for one hour, so a single-use code can't be opened on many products at once. Known limit: Razorpay orders don't expire, so a checkout paid more than an hour later keeps its discount even if the coupon has since run out or been turned off (the buyer has paid; access is never blocked). Changing the coupon starts a new order.
6. **Sales count:** `products.sales_count` now goes up on a confirmed payment and down on a full refund.
7. **Reviews:** only someone with active access; one per product; "verified purchase" only when access came from a paid order (free claims are not purchases), set by the server. Every review waits for approval; the owner can change only the status. Public pages show no names or emails; the average is computed from approved reviews only.
8. **Updates:** saved first, then (if ticked) one email per buyer with their own one-time library link; at most 80 emails per update (Resend free plan is 100/day), otherwise it's saved without emails. No automatic retry, so no double emails. While Resend uses its test sender, emails only reach the owner's own address.
9. **Audit log:** publish/archive/unpublish, price change, file add/remove, coupon create/on/off, receipt resend, review decisions, update posts, CSV export. No passwords, secrets or card data.
10. **Not built:** MDX guide slug (the MDX loader from Phase 1 is still not built, so the field is not shown); bundle editing and bundle purchases (bundles stay unpurchasable); USD prices (USD is off). Uploads still need the bucket's CORS to allow the site's address, so they work on localhost (with `STORAGE_*` set) and production, not on preview addresses.
11. **Tests:** `lib/admin/admin.test.ts` (owner-only refusals, CSV safety, product draft → publish → price change → slug/file/completeness locks → archive with access kept, reviews, updates), `lib/payments/coupons.test.ts`, extra coupon and sales-count cases in `lib/payments/payments.test.ts`. `.claude/` (where other git worktrees live) is excluded from Prettier, ESLint, TypeScript and Vitest.
12. **Owner walkthrough (2026-11-18):** run in a headless browser on localhost against the development database, with a throwaway owner password that existed only in that server's memory (the hosted preview writes to the production database and its address isn't a test address, so it got logged-out checks only). Passed: wrong password, lockout after 5 tries, logout, visitor and signed-in buyer refused by every admin page and API; draft → refused publish → complete → link file → preview → publish; ₹1 saves as 100 paise (shown as "₹1": whole rupees have no decimals); 0, negative and text prices refused by the browser and the server; archive → 404 and checkout refused; coupons (limit held by an open checkout, expired, USD coupon on a rupee price, below-₹1 result, over 90%, duplicate); CSV columns, opt-in column and formula cells; orders, customers, resend receipt (no new charge), review approve (verified flag can't be set), update emails only to buyers with access, 80-email cap; audit rows; every admin page at 390px with no page overflow (wide tables scroll sideways inside their box). Not tested in the UI: file **upload** (localhost has no `STORAGE_*` settings); the upload route was tested on the Phase 2 preview. Bugs fixed, each with a test: (a) open checkouts didn't hold a single-use coupon and (b) customer counts were wrong — both subqueries compared the wrong `id`; (c) Publish/Archive and Approve/Reject lost their confirmation when the buttons changed; (d) owner dates showed UTC, so a coupon's last day looked like the day before — now India time; (e) a refused Publish listed missing items twice. Database tests now allow 30 s for Neon waking from idle. All test rows were deleted afterwards.
13. **Delete sample products:** a sample product (`is_sample = true`) has a "Delete this sample" box at the bottom of its admin page (tick "Yes, delete it", then **Delete sample**). It deletes the product, its file rows, updates and reviews, and the stored files in the bucket, and writes a `product_delete` audit entry. It refuses non-sample products, and samples that someone has access to or has ordered.

## 12. ⚠ Sample product is live on production — delete before launch

Added 2026-11-18 at the owner's request, to see the shop working. Everything is marked as sample content (yellow "Sample content" label, `noindex`, not in `sitemap.xml`).

- **"Freelance project tracker (sample)"** — `/products/freelance-project-tracker-sample`, **published**, free, featured (shows on Home, `/free`, `/explore`). Product id `63915e5f-9ba5-4ea3-b5da-32eff46621e7`. One file: a 2-page made-up PDF checklist (85,459 bytes) stored in the bucket at `products/63915e5f-…/8db971d0-…-freelance-project-tracker-sample.pdf` (product_files id `6e64d1cd-57c8-4781-97f1-ef30b8b9ff28`).
- **"Sample paid pack"** — **draft** (never published), ₹1 (`price_inr = 100`), no file. Product id `dcf0757b-0f8d-42ad-9991-3dccf7df3b93`. Its page returns 404; checkout answers "Paid checkout isn't open yet."
- **Other rows:** the `work-smarter` category (created on first save; keep it — real products use it) and audit entries (`product_create` ×2, `product_publish` ×1; deleting adds `product_delete`). Audit entries are history and are kept.
- **Claim test (done, cleaned up):** free claim → email → Continue → My Library → Start Here → download (file identical to the upload); signed-out visitor and a second signed-in buyer without access were both refused. The test buyers' customers, lead, entitlement, download log and sign-in links were deleted; nobody has access to the samples now. Left behind and harmless: 4 test emails in the Resend log, and short-lived rate-limit counters in Upstash that expire on their own.

**To remove before launch:** sign in at `/admin`, open each sample under **Products**, scroll to **Delete this sample**, tick **Yes, delete it**, press **Delete sample**. Two clicks per product; this also deletes the PDF from the bucket. Then check `/free` and `/explore` show no products.

## 13. UI polish — direction A "Field Notes" (merged into `main` 2026-11-18, `67f7a86`)

- **What:** new palette and fonts, figure-plate covers for all 9 types, a new Home hero and section rhythm, the product page (facts line, first-win block, numbered steps, 65ch text), Explore goal chips and `next/form`, My Library cards, one designed empty state (`CatalogueEmpty`), the claim dialog cover, and motion (see `docs/DESIGN.md`).
- **Fixed:** layout shift (Home 0.616 → 0, product 0.36 → 0) and font weight (398 → about 97 KB on every page, with a 1 KB ₹-only font). Before and after numbers are in `docs/UI_AUDIT.md` §5.
- **Checked before merge (2026-11-18):** `npm run check` (99 tests), `/security-review` (no findings), a Razorpay test purchase and a cancel, a free claim and My Library on localhost + development DB (test rows deleted), dialogs at 390 px. The unused `cn` package was removed.
- **Not touched:** payments, auth, database and secrets. In `claim-dialog.tsx` only the markup changed (a cover at the top, an icon on errors); the submit, order, Razorpay and verify logic is unchanged.
- **Production check after merge (read-only):** `/`, `/explore`, `/free`, `/library` and the sample product return 200; `/admin` sends a signed-out visitor to `/admin/login` (a 307 inside the streamed page, so `curl` sees 200); an unknown path, `/design-preview/directions/a` and `/design-preview/home` return 404. Layout shift (CLS) is 0 on Home, Explore and the product page, phone and desktop. Fonts are 95–96 KB, and the ₹ comes from the 1 KB file. Numbers: `docs/UI_AUDIT.md` §5.
- **Known weak spots:** the product page on a phone scored anywhere from 55 to 99 on production. The difference is server wait time (the free Neon database and functions waking up after the deploy), not the page itself. With one real product, the Home hero fills empty spots with type-only plates and can repeat that product's type (two "FIG. 1 PDF workbook" plates).

## 14. Rare UI components and smooth motion (merged into `main` 2026-11-18, `138017c`)

- **What:**
  - `ScrollProgress` on product pages, phones only.
  - `RailToc`: an "On this page" list with a paper plane, on product pages, desktop.
  - The `Faq` thread for product "Questions".
  - `PasswordInput` on `/admin/login`. The login form, field name and POST are unchanged.
  - `FluidOrb` in the Home finder panel. It has a 2 KB still image underneath, and the live orb runs only on capable devices.
  - A footer credit, "Some interface pieces from Rare UI". **Keep it:** the licence requires it.
- **Licence rule (Commons Clause):** never sell or bundle these components inside a MAKERS product. Details: `components/rare-ui/README.md`.
- **Motion clean-up:** every animation now uses only transforms and opacity, one curve, 150 ms for feedback and 250 ms for panels. Measured before and after (CPU slowed 4×) in `docs/MOTION_AUDIT.md`.
  - **Scrolling a product page on a phone:** 183 → 3 layouts and 359 → 15 paints. The cause was the progress ring.
  - **Card hover:** 52 → 6 paints.
  - **Claim dialog:** 45 → 4 layouts.
  - **FAQ:** 99 → 6 layouts.
- **Orb cost:** about 1 Lighthouse point, and 120 fps on a slowed phone profile, so it did not need hiding below `lg`.
  - It stays a still image with Save-Data, reduced data or motion, a weak CPU or little memory, a low battery, or no WebGL. Each case was tested.
- **Checked (localhost, production build):**
  - `npm run check` passes (100 tests).
  - Security review: no findings.
  - Keyboard-only flows pass, with reduced motion off and on: rail, pill, dialog, menu, FAQ and the password eye.
  - Lighthouse is unchanged within noise: Home 92, Explore 91, Product 91 on phones; 99–100 on desktop; CLS 0 everywhere.
- **Production after merge:** status codes as before (pages 200, unknown page and design previews 404, `/admin` lands on `/admin/login`). Orb device cases, scroll and hover traces match localhost. Lighthouse: Home desktop median 97 (5 runs), phones 91–97, CLS 0. Details: `docs/MOTION_AUDIT.md`.
- **Known, not new:** the product page's SEO score is 91. Next 16 streams the page description into the body, and Lighthouse looks for it in the head. Google reads it after rendering, but this is worth a look before launch.
