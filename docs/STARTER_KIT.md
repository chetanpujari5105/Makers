# Fieldkit (formerly MAKERS) — Claude Code Project Starter Kit

This folder contains the build brief and working instructions for creating a single-owner digital resource store.

**Brand:** Fieldkit — Practical kits by Chetan (decided 2026-11-18; working name was MAKERS)

**Owner model:** One store owner publishes and manages every product. This is not a multi-vendor marketplace.

**Primary stack:** Next.js App Router + TypeScript, Tailwind CSS + shadcn/ui, Vercel, Neon Postgres, Drizzle ORM, Razorpay, private S3-compatible storage (Backblaze B2 now; R2 alternative), Resend, Upstash Redis.

## Files in this kit

- `CLAUDE.md` — project-wide instructions Claude Code must follow.
- `PROJECT_SPEC.md` — the product, UX, architecture, database, security and implementation requirements. Treat this as the source of truth.
- `BUILD_PLAN.md` — phased implementation sequence, acceptance gates and suggested prompts.
- `CLAUDE_CODE_START_PROMPT.md` — copy/paste this into Claude Code to begin.
- `.env.example` — names and descriptions of environment variables. It contains no real secrets.
- `content/products/_template.mdx` — reusable authoring template for each product's guide.
- `docs/ACCEPTANCE_TESTS.md` — practical end-to-end checks for the completed store.

## How to use this kit

1. Create a new empty GitHub repository for the website.
2. Download and extract this kit into the repository root. Keep the filenames and folder structure.
3. Open that repository folder in Claude Code.
4. Paste the contents of `CLAUDE_CODE_START_PROMPT.md` into Claude Code.
5. Ask Claude Code to complete **Phase 0 only**. Do not ask it to build every phase at once.
6. Review the files and run the commands Claude provides. Continue phase by phase using `BUILD_PLAN.md`.
7. Push the repository to GitHub and import it into Vercel. Configure Neon through the Vercel Marketplace integration.

## Important setup choices

- Vercel hosts the Next.js application and deploys from GitHub. `main` is production; pull requests create preview deployments.
- Neon is the Postgres database. It is not file storage.
- The private storage bucket (Backblaze B2 now; Cloudflare R2 alternative) stores private downloadable product files. Never put paid files in `/public` or a public bucket.
- Razorpay is the first payment provider. Keep the payment code behind an interface so another provider can be added later.
- Buyers do not create passwords. They enter their name and email before checkout, then use an email magic link to return to My Library.
- The store does not have seller registration, seller dashboards, commissions or creator payouts.

## Before launch

The site can be built before all business details are decided, but do not enable live payments until the owner has confirmed Razorpay eligibility, international-payment availability, currency choices, business/GST requirements, refund wording, legal pages and support email. See the open decisions in `PROJECT_SPEC.md`.
