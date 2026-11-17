# CLAUDE.md — Instructions for Claude Code

## Project state (keep this section current and under ~40 lines)

- **Current phase:** Phase 1 — Neon database and public catalogue. **Status:** complete, owner-approved and merged into `main` (2026-11-17); live at https://makers-alpha.vercel.app with an honest empty catalogue. Phase 2 starts on branch `phase-2-free-flow`.
- **Branches:** `main` = production (Phase 0 + tool setup). Phase branches merge only after owner approval.
- **Services:** GitHub `chetanpujari5105/Makers` → Vercel project `makers` (https://makers-alpha.vercel.app, production branch `main`, functions in `sin1`) → Neon `makers-db` (Singapore, Free plan). Neon branches: `main` = production (endpoint `ep-silent-fog-azl3md5w`, migrated 2026-11-17, **tables only — no products or categories**), `development` = local work (`ep-small-water-azp0874c`, migrated + seeded, one sample published). `.env.local` points at `development` only.
- **Database migrations on `main`:** run once per schema change, owner-approved, tables only (never `db:seed`). Vercel Preview and Production both read Neon `main`, so previews show an empty catalogue until real products are published. A Preview-only override to `development` did not save in Vercel (the `DATABASE_*` variables are owned by the Neon integration).
- **Done in Phase 1:** schema + migration, idempotent seed (6 sample drafts), `db:publish`, endpoint check; query layer `lib/catalogue/queries.ts` (published only, explicit columns, no file keys/private links) with cached wrappers `catalogue.ts`; URL filters `filters.ts`; real Home, `/explore`, `/category/[slug]`, `/products/[slug]`, `/free`, `sitemap.xml`, `robots.txt`; real 404s via `proxy.ts`; JSON-LD + OG. 50 tests (6 run against the development DB).
- **Not done yet in Phase 1:** MDX loader + safe MDX components (BUILD_PLAN task); not needed by the current pages.
- **Not built (by design):** payments, real downloads, buyer login, admin, newsletter.
- **Read before working:** `docs/HANDOFF.md` (map, commands, conventions, tokens), `docs/DECISIONS.md` (owner decisions + deviations), `docs/SKILLS_AND_TOOLS.md` (which skills to use per phase).
- **Next.js 16 warning:** APIs differ from older tutorials (e.g. `error.tsx` receives `retry`, Cache Components are on, `dynamicParams` is unavailable). Check `node_modules/next/dist/docs/` before writing Next.js code (see `AGENTS.md`).
- **Token-saving tools (use every session):**
  - **graphify** — a code map in `graphify-out/` (not committed). Before reading many files to answer "where/how is X built?", run `graphify query "<question>"` (or `graphify explain "X"`, `graphify affected "X"`). After code changes run `graphify update .` (free, no AI calls).
  - **ponytail** plugin (enabled in `.claude/settings.json`) — smallest complete change, no unrequested abstractions. Never cuts validation, security, accessibility or anything in this file. Use `/ponytail-review` on a phase diff before reporting.
- **One command for every quality gate:** `npm run check` (format → lint → typecheck → test → build).

---

You are building a production-minded, single-owner digital product storefront called **MAKERS** (working name). The owner is a creator, not a senior engineer. Make decisions carefully, explain technical terms in plain English, and give exact terminal commands.

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
- Cloudflare R2 private bucket for product files, using S3-compatible SDK and short-lived presigned URLs.
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
- Never expose Razorpay secret, R2 secret, Resend key, admin password hash, magic-link secret or session secret to the browser.
- Validate all external input with Zod, including query strings, route params and webhook payloads.
- Use integer minor units for money (paise/cents), never floating point.
- Never trust a product price, currency, discount, order status or product entitlement supplied by the browser. Read commercial values from the database on the server.
- Use database transactions and unique constraints for payment fulfillment, webhook deduplication and entitlement creation.
- Verify Razorpay payment signatures with HMAC SHA-256 and timing-safe comparison. Verify webhook signatures against the unmodified raw request body. Make all webhook handlers idempotent.
- The browser payment callback is a fast UX path, not the sole source of truth. Confirm payment status server-side; webhooks are authoritative. Do not grant paid access for a merely created or failed payment.
- Paid files must stay in a private R2 bucket and only be exposed through entitlement-checked, short-lived signed downloads.
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
- Add clear setup instructions for GitHub, Vercel, Neon, Razorpay, Cloudflare R2, Resend and Upstash.
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
