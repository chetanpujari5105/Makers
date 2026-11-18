# Fieldkit (formerly MAKERS) — Claude Code Build Plan

This plan breaks the project into small, reviewable phases. **Do not ask Claude Code to build all phases at once.** Complete one phase, test it, review it, then explicitly ask Claude Code to continue.

## How to work with Claude Code

At the start of each session, ask Claude Code to read `CLAUDE.md`, `PROJECT_SPEC.md` and this file. Then give it only the prompt for the current phase.

After each phase:

1. Start the local development server and review the relevant pages.
2. Run lint, typecheck, tests and production build.
3. Check the acceptance criteria for that phase.
4. Ask Claude Code to fix failures before accepting the phase.
5. Commit the work with a clear message.
6. Push the branch if GitHub is connected. Check the Vercel preview for visual changes.
7. Do not proceed until the owner approves the phase.

---

## Phase 0 — Project foundation

### Goal

Create a clean, runnable Next.js foundation with the design shell and project instructions. No database, checkout, paid downloads or fake integrations yet.

### Tasks

- Inspect the repository. If empty, create a Next.js App Router project with TypeScript and Tailwind.
- Use the current stable compatible versions and commit the package lockfile.
- Configure strict TypeScript, ESLint and formatting.
- Install and configure shadcn/ui and lucide-react. Add framer-motion only for future restrained motion.
- Establish sensible aliases such as `@/components`, `@/lib` and `@/db`.
- Create the folder structure from `PROJECT_SPEC.md`.
- Add a central temporary brand configuration for `MAKERS` and neutral design tokens. Do not finalize the accent colour yet.
- Create responsive application layout with header, footer, navigation and a simple branded placeholder home page.
- Add loading, not-found and global error boundaries.
- Add `.env.example`, `.gitignore` and a beginner-friendly repository README.
- Add scripts: `dev`, `build`, `start`, `lint`, `typecheck`, `test` (test command may initially run an empty configured suite, but it must not be a fake success script).
- Add a basic test setup and one example test.
- Do not create placeholder payment buttons that imply Razorpay is connected.

### Acceptance criteria

- `npm install` succeeds.
- `npm run dev` starts and the home page loads.
- Header and footer work at desktop and mobile widths.
- `npm run lint`, `npm run typecheck`, `npm test` and `npm run build` pass.
- `.env.example` contains variable names only, no secrets.
- README explains local setup and how to deploy from GitHub to Vercel, and how Neon will be connected in a later phase.

### Prompt to give Claude Code

> Complete Phase 0 only from BUILD_PLAN.md. Read the project instructions first. Scaffold the app and shell, add the configuration and documentation, run all checks and fix failures. Do not implement database, product catalogue, payments, file storage or buyer auth yet. Stop and tell me exactly how to test the phase.

---

## Phase 1 — Neon database, data model and public catalogue

### Goal

Build the real catalogue and product experience using Neon and seeded sample content. No checkout or actual private download access yet.

### Tasks

- Configure Neon using `DATABASE_URL`; document pooled connection vs direct/unpooled migration connection.
- Add Drizzle, schema, migrations and seed scripts.
- Implement categories, products, product files/metadata, product updates, bundle items, customers, leads, orders, order items, entitlements, coupons, reviews, magic tokens and webhook event tables as specified.
- Add database constraints, indexes and migrations.
- Seed the four goal groups and six realistic sample products across several product types. Mark all sample products as drafts by default. No fake reviews or sales metrics.
- Add product content model and MDX loading. Add reusable MDX components (`Steps`, `Step`, `Callout`, `Result`, `Faq`, `Requirements`, `PrintSettings`) with safe rendering and no arbitrary unsafe HTML.
- Build homepage, Explore, Category and Product pages.
- Build search, goal/type/level/free-paid filters, price filter, setup-time filter, sort and pagination. Sync relevant filters to URL query parameters.
- Build the full Grow With It product-page layout and type-specific sections.
- Add proper empty/loading/error states.
- Add dynamic SEO metadata and product Open Graph metadata foundations.
- Use only real DB values; do not invent rating or sales count.

### Acceptance criteria

- Migrations run against a development Neon database.
- Seed command creates categories and sample draft products safely and can be run more than once without duplicates.
- Draft products do not appear publicly.
- An owner/developer can publish one sample product through a documented seed/update workflow until admin UI exists.
- Homepage, Explore, Category and Product pages load from Neon.
- Search and filters work together and persist in the URL.
- Product type-specific sections appear only for relevant product types.
- Unpublished/archived product slugs do not reveal private content.
- Product content never displays raw object keys or private external links.
- Lint, typecheck, tests and build pass.

### Prompt to give Claude Code

> Complete Phase 1 only. First inspect the current app and migrations. Add Neon + Drizzle schema and safe idempotent seeds, then implement the public catalogue and complete product page from PROJECT_SPEC.md. Keep seeded products as drafts and do not implement payment or real download access. Run migrations and all checks. Tell me which Neon environment variables I need and how to test each page.

---

## Phase 2 — Lead capture, free resources, R2 delivery and My Library

> Done 2026-11-17. "R2" in this plan means the private S3-compatible bucket; the owner chose Backblaze B2 (`STORAGE_*` settings, see `docs/DECISIONS.md`).

### Goal

Implement the full free-product journey and secure file access. Paid checkout is still not enabled in this phase.

### Tasks

- Configure Cloudflare R2 private bucket access using server-side credentials.
- Implement safe admin/developer upload flow for product files using presigned PUT URLs, with type/size validation and upload confirmation.
- Implement public `POST /api/leads` with Zod, normalized email, honeypot and Upstash rate limiting.
- Build the buyer-details dialog exactly as described: name, email, optional unchecked marketing checkbox and privacy note.
- Save leads before any subsequent action.
- Implement `POST /api/free-claim` for published free products; create/find customer and entitlement idempotently.
- Implement short-lived protected download access and R2 presigned GET redirects. Check active entitlement, file/product relationship, revocation and atomic download limit.
- Add download logging and rate limiting.
- Implement Resend transactional email for free download confirmation and buyer magic link.
- Implement magic-link creation, hash storage, expiry, single-use enforcement and generic response.
- Build `/library`, authenticated `/library/[productSlug]` Start Here page and protected external link delivery.
- Add customer session handling with secure cookies.
- Keep paid entitlements impossible to create from client input.

### Acceptance criteria

- Clicking a free product CTA opens the name/email dialog.
- Submitting the form saves the lead and grants one free entitlement.
- Marketing opt-in stays false unless explicitly selected.
- A second claim does not create duplicate entitlements.
- A buyer can request a magic link and sign in once; a replayed, expired or altered token fails.
- An entitled customer can download a private R2 test file via short-lived URL.
- A non-entitled customer cannot download by guessing the file ID.
- A revoked entitlement cannot download.
- Download limit is enforced even if requests are made close together.
- The email contains a secure library/access link, not a permanent R2 URL.
- Lint, typecheck, tests and build pass.

### Prompt to give Claude Code

> Complete Phase 2 only. Implement lead capture, free claims, private R2 storage/delivery, magic-link buyer login, My Library and Resend emails. Follow the security rules exactly. Use test resources in a private development bucket. Do not add Razorpay checkout or paid entitlement creation yet. Run tests including unauthorized download, repeated free claim, expired magic link and download-limit checks. Explain exactly how I configure R2, Resend and Upstash.

---

## Phase 3 — Razorpay checkout and payment fulfilment

### Goal

Allow customers to purchase paid products securely. Use Razorpay test mode only.

### Tasks

- Implement the `PaymentProvider` interface and Razorpay adapter.
- Add server-side `POST /api/orders` that reads price and currency from Neon, validates publication status and coupon, creates Razorpay order and persists local order.
- Add idempotency strategy for repeated submits.
- Integrate Checkout.js using `next/script` or the current supported Next.js script method.
- Prefill buyer name/email, and enable available methods including UPI/cards/netbanking/wallets as permitted by the account.
- Implement `POST /api/payments/verify` with HMAC signature verification and timing-safe compare; confirm payment status with Razorpay before entitlement grant.
- Implement raw-body `POST /api/webhooks/razorpay`, signature verification, webhook event dedupe and idempotent processing.
- Handle captured, paid, failed and refunded events supported by the provider.
- Ensure the browser callback and webhook can arrive in either order without duplicate access.
- Implement success, failure and retry states. A success URL/order ID alone must not grant access.
- Send purchase receipt email and connect paid products to My Library.
- Add coupon validation on server if included in this phase; record use transactionally.
- Keep USD/international payments feature-flagged off.

### Acceptance criteria

- Test-mode order amount and currency match the DB product price, not a browser-supplied value.
- Client cannot change product price, currency or discount to reduce the charge.
- Correct test payment verifies and grants exactly one entitlement.
- Invalid/tampered signature is rejected.
- Failed/closed checkout does not grant access.
- Duplicate verify calls do not create duplicate entitlements.
- Repeated webhook event is deduplicated.
- Webhook before browser verify and browser verify before webhook both work.
- Payment that is not captured/paid does not grant access.
- Refunded payment changes access only after confirmed refund processing.
- Buyer gets receipt and can access paid item through My Library.
- R2 download still requires entitlement.
- Lint, typecheck, tests and build pass.

### Prompt to give Claude Code

> Complete Phase 3 only using Razorpay test mode. Implement the provider adapter, server-side order creation, checkout, server verification, raw-body webhook verification, idempotent fulfilment and receipt email. Keep USD off. Add automated tests for price tampering, invalid signature, duplicate webhook, failed payment and success flow. Do not switch to live keys or claim live checkout is ready. Tell me what Razorpay dashboard settings and webhook URL I need for test mode.

---

## Phase 4 — Single-owner admin dashboard

### Goal

Let the owner manage products, prices, delivery files, leads and orders without editing code or database rows manually.

### Tasks

- Implement owner login with `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH` and signed secure session.
- Protect all admin pages and each admin API independently.
- Add login rate limiting and logout.
- Build dashboard with real paid order, lead, download and product metrics.
- Build product list, create/edit forms, product preview, publish/archive and file upload to R2.
- Make structured product-page sections editable through forms. Support MDX guide slug for longer guide content.
- Validate required fields before publication.
- Build order list/detail and resend receipt/access email.
- Build customer and lead pages, CSV export and opt-in visibility.
- Build coupon CRUD and safe usage limits.
- Build review moderation; verified purchase status must be server-controlled.
- Build product update publishing with version notes and emails to entitled buyers.
- Add audit logs for sensitive owner actions where practical.

### Acceptance criteria

- No public registration route exists.
- Unauthenticated visitors cannot open admin pages or call admin APIs.
- Invalid login is rate limited and does not reveal which credential is wrong.
- Owner can create a draft product, upload files, preview and publish it after completing required fields.
- Owner can change product price and see it update on the storefront.
- Owner can archive a product; archived product cannot be purchased.
- Owner can inspect order/customer/lead records and export leads.
- Non-opted-in leads are clearly marked and are not treated as newsletter subscribers.
- Owner can resend a receipt without generating another charge.
- Review moderation does not allow fabricated verified-purchase status.
- Lint, typecheck, tests and build pass.

### Prompt to give Claude Code

> Complete Phase 4 only. Build the single-owner admin experience. There must be no seller registration or seller features. Make everyday product publishing possible without code edits: product details, structured Grow With It page sections, prices, previews and R2 files. Protect every admin API. Use real database metrics only. Run authorization tests and explain how I generate a secure password hash and set admin environment variables.

---

## Phase 5 — Polish, SEO and launch readiness

### Goal

Make the store ready for controlled public launch, with legal/brand placeholders clearly identified and no unfinished security-critical flows.

### Tasks

- Add verified-buyer review experience and moderation if not completed in Phase 4.
- Add bundles and related products; ensure bundle fulfilment creates correct entitlements.
- Build the 3-step resource finder quiz (goal, skill level, preferred format) and return up to three real recommendations.
- Complete Free resources and product update pages.
- Complete metadata, Product JSON-LD, sitemap, robots and Open Graph images.
- Run accessibility review and keyboard-only checks.
- Run mobile QA for common phone sizes, especially product modal and Razorpay Checkout.
- Optimize product images and core page performance.
- Add error monitoring/logging with PII and secret scrubbing.
- Add privacy/terms/refund/license page placeholders and mark them as owner review required until approved.
- Add operational runbook for order disputes, refund confirmation, lost download access and email delivery failures.
- Add production deployment steps and Vercel environment separation.
- Create Razorpay live-mode checklist; do not enable until owner approves.
- Connect custom domain only after brand/domain decisions.

### Acceptance criteria

- Resource finder returns existing published products only.
- Bundles cannot contain unpublished products or recursive bundles.
- Product updates are visible only to entitled buyers where access is required.
- Sitemap excludes draft/archive products and private library/admin routes.
- Product schema prices and currency are accurate.
- Keyboard navigation works for all main flows.
- Mobile checkout path can be completed in Razorpay test mode.
- Core pages have complete loading/empty/error/success states.
- No placeholder legal details are presented as final legal advice.
- Build, lint, typecheck, test and end-to-end checks pass.

### Prompt to give Claude Code

> Complete Phase 5 only. Finish the resource finder, bundles, reviews, SEO, accessibility, responsive QA, operational docs and launch checks. Do not enable Razorpay live mode or USD automatically. Identify every owner decision that is still missing and give me a launch checklist. Run all available automated checks and report anything not verified.

---

## Post-launch backlog — not part of initial launch

Only consider these after the single-owner store has real buyers and feedback:

- Add an additional international payment provider behind `PaymentProvider`.
- Enable USD/other currencies after merchant eligibility and tax/accounting review.
- Add language localization if there is demand.
- Add affiliate tracking and payout processes.
- Add pay-what-you-want pricing with abuse controls.
- Add membership only if the owner can deliver ongoing value.
- Explore multi-vendor features only in a separate project with a new risk, legal and payout review.
