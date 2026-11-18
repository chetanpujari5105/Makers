# First prompt for Claude Code

Read `CLAUDE.md`, `PROJECT_SPEC.md`, `BUILD_PLAN.md` and `docs/ACCEPTANCE_TESTS.md` completely before doing anything.

We are building **Fieldkit** (working name was MAKERS), a single-owner digital product store. This is not a multi-vendor marketplace. The approved stack is Next.js App Router + TypeScript, Tailwind + shadcn/ui, Vercel, Neon Postgres, Drizzle, Razorpay, Cloudflare R2, Resend and Upstash. The owner deploys through GitHub to Vercel. Use Neon for the database and R2 for private downloadable files.

The buyer flow is important and must be implemented exactly:
1. Visitor opens the home page or a product page.
2. They can read the product's full information before providing personal details.
3. They click the product CTA (`Get this` for paid products, `Download free` for free products).
4. A dialog asks for name and email. Marketing opt-in is optional and unchecked by default.
5. Save the lead. If the product is free, grant an entitlement and show the secure download/Start Here path. If paid, create a server-side Razorpay order using the database price and launch Razorpay Checkout.
6. Verify payment on the server and process the webhook idempotently. Never unlock paid files based only on a browser callback.
7. After verified payment, show the Start Here page and send a receipt/access email.
8. Buyers can return to My Library using a one-time 15-minute email magic link. No buyer passwords.

Use the detailed requirements in `PROJECT_SPEC.md`; do not improvise a different stack or buyer journey.

**Start with Phase 0 only.** Inspect the repository first. If it is empty, scaffold the project. Create the foundation, folder structure, `.env.example`, lint/typecheck configuration and a README with beginner-friendly setup steps. Do not build database features, payments or product pages yet. Follow `BUILD_PLAN.md` acceptance criteria. Run all available checks, fix errors, then report exactly what I should test. Do not proceed to Phase 1 until I ask.

I am not a senior engineer. Explain errors simply and always give exact commands I can copy into the terminal. Never invent credentials or say a deployment/integration is working unless it has actually been configured and tested.
