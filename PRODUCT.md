# Product

<!-- impeccable:product-schema 1 -->

> Derived from `PROJECT_SPEC.md` (the source of truth) on 2026-11-17 and confirmed by the owner's approval of the Phase 0 plan. If this file and the spec disagree, the spec wins.

## Platform

web

## Users

Buyers in India and worldwide: students, parents, freelancers, designers, creators, small-business owners and people with little technical experience. They arrive wanting an outcome (learn a skill, make something, organise their work, build/print a project), often on a phone, and need to understand a resource fully before giving their name and email.

The store owner is a single creator (not a senior engineer) who publishes and manages every product.

## Product Purpose

A single-owner store selling practical digital resources — PDFs/ebooks/workbooks, downloadable courses, Markdown and AI prompt packs, Notion templates, Figma/Canva kits, 3D-print files and bundles. Success means buyers can actually use what they get: each product teaches setup and a quick first win, and buyers can return to their library with a one-time email link.

## Positioning

"Sell the outcome, not just the file." Every product page is a small guide — what it helps you do, who it's for, what you receive, a first win, setup steps, common fixes, license and help — and the store is organised by goal (Create, Learn, Work Smarter, Build & Make) rather than file type.

## Operating Context

Visitors browse by goal, read the full product page, then click `Get this` (paid) or `Download free` (free), enter name and email in a dialog, and either pay with Razorpay (UPI, cards, netbanking, wallets) or receive the free item. Buyers return via My Library magic links. Mobile checkout matters.

## Capabilities and Constraints

- Fixed stack: Next.js, Tailwind + shadcn/ui, Vercel, Neon, Drizzle, Razorpay, private S3-compatible storage (Backblaze B2 now; R2 alternative), Resend, Upstash.
- Single owner only — no seller registration, dashboards or payouts.
- INR first; USD off until Razorpay eligibility is confirmed.
- Buyers never create passwords. Marketing consent is optional and unchecked by default.
- Undecided: final brand name, domain, logo, accent colour, support email, business/GST status, refund policy, first real products.

## Brand Commitments

- Working name **MAKERS** (temporary). Headline concept: "Learn something. Create something. Make progress."
- Premium editorial storefront: light, bright, calm; generous whitespace; one strong accent; neutral surfaces; restrained motion; no generic SaaS-dashboard look, no excessive gradients.
- Plain English at about a grade-six reading level.

## Evidence on Hand

No real products, reviews, sales figures, testimonials or customer results exist yet. Never fabricate ratings, sales counts, scarcity, testimonials or outcomes. Sample products (Phase 1) are drafts and clearly marked.

## Product Principles

1. Show everything before asking for anything — full product information before name/email.
2. Teach, don't just deliver — every product includes a first win and setup steps.
3. Honest by default — real data only; hide what isn't configured.
4. Secure by default — prices, entitlements and downloads are decided on the server.
5. Easy for non-technical people — plain words, large tap targets, clear states.

## Accessibility & Inclusion

WCAG AA contrast, body text ≥16px, ~44px tap targets, full keyboard support, visible focus, reduced-motion support, descriptive alt text, status never by colour alone.
