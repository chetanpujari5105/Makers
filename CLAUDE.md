# CLAUDE.md — Instructions for Claude Code

## Project state (keep this section current and under ~40 lines)

- **Current phase:** Phase 4 (owner admin) **complete and merged into `main` (2026-11-18)**; live at https://makers-alpha.vercel.app (**first real product published 2026-11-18: "GTA 6 Clipping Playbook", ₹99, shows "Opens soon" until checkout opens. ⚠ One SAMPLE free product is published and one sample paid draft exists — delete both before launch with the admin's "Delete this sample" button; see `docs/HANDOFF.md` §12**). Phases 0–3 merged 2026-11-17. Checkout stays closed on Production (no `RAZORPAY_*` variables there; `isCheckoutOpen()` is false when `VERCEL_ENV=production`; `/api/orders` returns 503). Next: publish the owner's first real free product. See `docs/HANDOFF.md` §11.
- **Branches:** `main` = production (Phases 0–4). Phase branches merge only after owner approval.
- **Services:** GitHub `chetanpujari5105/Makers` → Vercel project `makers` (https://makers-alpha.vercel.app, production branch `main`, functions in `sin1`) → Neon `makers-db` (Singapore, Free plan). Neon branches: `main` = production (endpoint `ep-silent-fog-azl3md5w`, migrated 2026-11-17, tables + the 2 sample products (§12) + the `work-smarter` category), `development` = local work (`ep-small-water-azp0874c`, migrated + seeded, one sample published). `.env.local` points at `development` only.
- **Database migrations on `main`:** run once per schema change, owner-approved, tables only (never `db:seed`). Vercel Preview and Production both read Neon `main`, so previews show an empty catalogue until real products are published. A Preview-only override to `development` did not save in Vercel (the `DATABASE_*` variables are owned by the Neon integration).
- **Done in Phase 1:** schema + migration, idempotent seed (6 sample drafts), `db:publish`, endpoint check; query layer `lib/catalogue/queries.ts` (published only, explicit columns, no file keys/private links) with cached wrappers `catalogue.ts`; URL filters `filters.ts`; real Home, `/explore`, `/category/[slug]`, `/products/[slug]`, `/free`, `sitemap.xml`, `robots.txt`; real 404s via `proxy.ts`; JSON-LD + OG. 50 tests (6 run against the development DB).
- **Not done yet in Phase 1:** MDX loader + safe MDX components (BUILD_PLAN task); not needed by the current pages.
- **Phase 2** (merged 2026-11-17): free claim + leads, magic-link My Library, Start Here, protected downloads, minimal owner admin, Resend emails (test sender `onboarding@resend.dev` until a domain is verified — see `docs/DOMAIN_AND_EMAIL.md`), Upstash limits, private Backblaze B2 storage via `STORAGE_*` settings (owner choice instead of R2; R2 works by changing settings). Full preview test passed and test data was deleted. See `docs/HANDOFF.md` §9.
- **Razorpay keys (2026-11-18):** removed from Vercel **Preview** (owner approved), so previews can no longer take test payments against the live database. Vercel has no `RAZORPAY_*` anywhere now; local test mode still uses `.env.local`. Preview builds made before 2026-11-18 still carry the old test keys (behind Vercel login): don't test-buy on them. **Live mode code merged 2026-11-18 (`4bc0e34`):** `isCheckoutOpen()` accepts `rzp_live_` keys only on Production, `rzp_test_` only locally, never previews. Razorpay account activated, website approved. Checkout opens once the owner adds the three live `RAZORPAY_*` keys to Vercel Production, registers the webhook and redeploys: steps in `docs/LIVE_MODE_CHECKLIST.md`.
- **Phase 4** (merged 2026-11-18): owner admin for products, orders (+ resend receipt), customers, leads + CSV, coupons, reviews, updates and an audit log. Its migration is on production Neon `main`. Walkthrough on localhost + development DB passed; 5 bugs fixed with tests (see `docs/HANDOFF.md` §11 item 12).
- **UI polish** (**merged into `main` 2026-11-18**, merge commit `67f7a86`; production verified): owner picked direction A "Field Notes" (warm paper, vermilion, Newsreader + Schibsted Grotesk, figure-plate covers). Layout shift and font weight fixed. Design and motion rules: `docs/DESIGN.md`; results: `docs/UI_AUDIT.md` §5; `docs/HANDOFF.md` §13.
- **Rare UI + smooth motion** (**merged into `main` 2026-11-18**, merge commit `138017c`; production verified): 5 adapted components in `components/rare-ui/` (licence: footer credit link required; never resell them in a product — Commons Clause; see its README). Motion is transform/opacity only, one curve, 150/250 ms: `docs/MOTION_AUDIT.md`. Never let `shadcn add` overwrite `lib/utils.ts`. `docs/HANDOFF.md` §14.
- **Brand Fieldkitt** (first merged as "Fieldkit" 2026-11-18; **renamed to Fieldkitt, merged into `main` 2026-11-18** (owner said "merge", merge commit `850f689`; production verified); matches the domain fieldkitt.xyz): name/tagline/owner in `lib/brand.ts`; inline header logo `components/layout/wordmark.tsx`; icons, OG image, manifest in `app/`; logo files `public/brand/`; owner originals `docs/brand/originals/`. Trademark and domain checks still open. See `docs/HANDOFF.md` §15.
- **Pre-domain audit** (**merged into `main` 2026-11-18**, owner said "merge", merge commit `66017ba`; production verified): one `NEXT_PUBLIC_SITE_URL` drives every absolute URL (`docs/DOMAIN_SWITCH.md` = the day-you-buy-the-domain steps); draft legal pages About/Contact/Pricing/Terms/Privacy/Refunds with Grievance Officer, all `noindex`, owner details in `legal` (`lib/brand.ts`, all null → visible "[Owner to fill]" markers); **no refunds** (owner); `docs/DATA_MAP.md` + privacy page from one list (`lib/legal/data-map.ts`); sample invoice `docs/legal/sample-invoice.pdf`. See `docs/HANDOFF.md` §16.
- **Not built (by design):** live payments (live mode not approved), bundle editing/purchases, USD prices, MDX guide loader, newsletter. No Razorpay webhook is registered yet (owner: not until live mode).
- **Read before working:** `docs/HANDOFF.md` (map, commands, conventions, tokens), `docs/DECISIONS.md` (owner decisions + deviations), `docs/SKILLS_AND_TOOLS.md` (which skills to use per phase).
- **Next.js 16 warning:** APIs differ from older tutorials (e.g. `error.tsx` receives `retry`, Cache Components are on, `dynamicParams` is unavailable). Check `node_modules/next/dist/docs/` before writing Next.js code (see `AGENTS.md`).
- **Token-saving tools (use every session):**
  - **graphify** — a code map in `graphify-out/` (not committed). Before reading many files to answer "where/how is X built?", run `graphify query "<question>"` (or `graphify explain "X"`, `graphify affected "X"`). After code changes run `graphify update .` (free, no AI calls).
  - **ponytail** plugin (enabled in `.claude/settings.json`) — smallest complete change, no unrequested abstractions. Never cuts validation, security, accessibility or anything in this file. Use `/ponytail-review` on a phase diff before reporting.
- **One command for every quality gate:** `npm run check` (format → lint → typecheck → test → build).

---

You are building a production-minded, single-owner digital product storefront called **Fieldkitt** — "Practical kits by Chetan" (brand locked 2026-11-18, renamed from "Fieldkit" the same day to match fieldkitt.xyz; repo, package and Vercel project are still named `makers`). The owner is a creator, not a senior engineer. Make decisions carefully, explain technical terms in plain English, and give exact terminal commands.

## 1. Source of truth

- Read `PROJECT_SPEC.md`, `BUILD_PLAN.md` and `docs/ACCEPTANCE_TESTS.md` before changing code.
- `PROJECT_SPEC.md` is the source of truth for product behavior, stack and security.
- If two instructions conflict, do not silently choose. Explain the conflict and propose the safest interpretation. Prefer the explicit buyer flow and security requirements.
- Do not silently replace the approved stack.
- The store is single-owner only. Do not build multi-vendor features.

## 2. Work in small phases

- Follow the phases in `BUILD_PLAN.md` in order.
- Complete only the current phase. Do not start the next phase until the current one passes its acceptance checks and the owner has reviewed it.
- Before coding, briefly state the phase goal and the files you expect to touch.
- After coding, run the relevant commands, fix errors and report the result honestly.
- Never claim a test passed unless you actually ran it and saw it pass.
- Do not leave broken imports, placeholder handlers, fake success flows or TODOs that make a feature appear complete when it is not.
- If an external service credential is missing, build a safe integration boundary and a clear local-development mode. Do not invent credentials or pretend the live integration works.

## 3. Fixed technology choices

- Next.js stable release, App Router, TypeScript with strict mode.
- Tailwind CSS, shadcn/ui, lucide-react, and restrained framer-motion.
- Vercel deployment from GitHub.
- Neon Postgres through Vercel Marketplace integration.
- Drizzle ORM and drizzle-kit, using `@neondatabase/serverless`.
- Razorpay Orders API, Checkout.js and webhooks; payment provider interface required.
- Private S3-compatible bucket for product files (currently Backblaze B2; Cloudflare R2 is the documented alternative), configured through `STORAGE_*` settings, using the S3-compatible SDK and short-lived presigned URLs.
- Resend with React Email for transactional mail.
- Product guide content uses MDX in `content/products/`, with DB-backed structured content where necessary for owner-friendly product editing.
- Zod validation for every API input.
- Buyer passwordless email magic links. Single owner admin login uses environment-configured credentials and a signed, httpOnly cookie.
- Upstash Redis rate limiting for public sensitive endpoints.
- Vercel Analytics; optional Plausible only if configured.

Use compatible stable package versions at implementation time and commit the lockfile. Do not pin an obsolete version just because an old tutorial says so.

## 4. Engineering rules

- Use server components by default. Add client components only where interaction requires them.
- Keep secrets and privileged SDKs on the server. Never prefix secrets with `NEXT_PUBLIC_`.
- Never expose Razorpay secret, storage (`STORAGE_SECRET_ACCESS_KEY`) secret, Resend key, admin password hash, magic-link secret or session secret to the browser.
- Validate all external input with Zod, including query strings, route params and webhook payloads.
- Use integer minor units for money (paise/cents), never floating point.
- Never trust a product price, currency, discount, order status or product entitlement supplied by the browser. Read commercial values from the database on the server.
- Use database transactions and unique constraints for payment fulfillment, webhook deduplication and entitlement creation.
- Verify Razorpay payment signatures with HMAC SHA-256 and timing-safe comparison. Verify webhook signatures against the unmodified raw request body. Make all webhook handlers idempotent.
- The browser payment callback is a fast UX path, not the sole source of truth. Confirm payment status server-side; webhooks are authoritative. Do not grant paid access for a merely created or failed payment.
- Paid files must stay in the private storage bucket and only be exposed through entitlement-checked, short-lived signed downloads.
- Enforce download limits atomically and log each successful download.
- Store only a salted/hash form of IP data where needed for abuse prevention. Do not store full IP addresses unless there is a justified, documented requirement.
- Normalize buyer email to lowercase and trim whitespace.
- Marketing consent must be optional, explicit and unchecked by default. Saving a checkout lead is not marketing consent.
- Add loading, empty, success and error states to all meaningful screens.
- Use semantic HTML, accessible labels, keyboard focus styles, readable contrast and reduced-motion support.

## 5. Design standards

- Premium editorial storefront: modern publication + creative resource shop + learning platform.
- Light, bright and calm. Generous whitespace, clear hierarchy, one strong accent colour and neutral surfaces.
- Body type at least 16px. Avoid tiny low-contrast helper text.
- Mobile-first. Ensure buttons are comfortable to tap (about 44px high), especially the product CTA and Razorpay checkout path.
- Use strong, consistent product cover artwork. Do not use random stock images as final product covers.
- Use plain English suitable for a broad audience. Avoid unexplained technical jargon.
- Do not use fake testimonials, fake sales counts, fake ratings, fake scarcity or invented customer results.
- Do not invent product facts. Seed sample products as drafts and make it clear that sample content must be reviewed before publication.
- Avoid excessive gradients, noisy animation and generic SaaS-dashboard styling.

## 6. Product-page content standards

Every product should answer, in simple language:

1. What does this help me do?
2. Who is it for?
3. What will I receive?
4. What can I expect to achieve?
5. What do I need before I start?
6. How do I set it up in 3–5 steps?
7. What is one useful first result I can get quickly?
8. What problems might I run into, and how do I fix them?
9. What does the license allow?
10. Where can I get help?

Use `content/products/_template.mdx` for guide structure. Product-specific blocks must appear only when relevant to the product type (for example, print settings for 3D models or lesson curriculum for courses).

## 7. Admin and buyer behavior

- Only the owner can access `/admin`. There is no public seller registration.
- Buyers never create passwords.
- The product CTA opens a dialog asking for name and email. Save the lead before attempting payment so a cancelled checkout does not erase the lead.
- The marketing checkbox is optional and unchecked by default.
- Free products grant an entitlement without payment after the customer submits the form.
- Paid products start Razorpay Checkout only after the server has created an order from the product's database price.
- A buyer sees a success/Start Here page only after the payment has been verified and access is granted.
- My Library uses a one-time email magic link. Store only token hashes. Links expire after 15 minutes and cannot be reused.

## 8. Environment and deployment

- Keep `.env.example` current whenever an environment variable is added or renamed.
- Never overwrite a real `.env.local` file.
- Never commit `.env`, `.env.local`, API keys, webhook secrets, tokens or customer data.
- Add clear setup instructions for GitHub, Vercel, Neon, Razorpay, Backblaze B2 (or Cloudflare R2), Resend and Upstash.
- Treat Vercel preview and production environments separately. Do not use production payment secrets or production files in previews.
- Use Razorpay test mode until the owner explicitly approves the live-mode checklist.

## 9. Required response after every phase

Report:

- What was built.
- Files or routes added/changed.
- Commands run and whether they passed.
- Any work blocked by missing credentials or owner decisions.
- Exact steps the owner should follow to test it.
- The next phase, but do not start it automatically.

Remember: the goal is a reliable store that helps customers use what they buy—not just a visually attractive mockup.
