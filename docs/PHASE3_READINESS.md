# Phase 3 readiness — what Razorpay needs from you

_Planning only (2026-11-17). Phase 3 (Razorpay checkout, BUILD_PLAN "Phase 3") has **not** started. No Razorpay account exists yet, and live mode stays off until you approve a separate live-mode checklist._

## Decisions only you can make (PROJECT_SPEC §5.6 and "Owner decisions")

- [ ] **Business status:** are you selling as an **individual** (sole proprietor, no company) or as a registered business? This changes the KYC documents, invoices and international eligibility.
- [ ] **GST:** do you need GST registration? Razorpay lets eligible sellers choose "I don't have GST" and use a savings account, but that **doesn't decide** whether GST law applies to you. Ask a CA (below).
- [ ] **Launch currency:** INR only first (default; `NEXT_PUBLIC_ENABLE_USD=false`), or USD later once Razorpay approves international payments.
- [ ] **Refund policy** for digital products, including failed or broken downloads. Your own wording; it shouldn't simply assume "no refunds".
- [ ] **Prices** for the first paid products (stored in paise in the database).

## CA check (one short consultation)

Ask a Chartered Accountant:

1. Do I need GST registration for selling digital downloads in India, and to buyers abroad?
2. Do I need to issue invoices, and what must they show?
3. Is a sole-proprietor setup with a savings account fine, or should I open a current account first?
4. How should I record Razorpay payouts and fees for income tax?

The code won't contain any tax or legal conclusions (spec rule). It will follow what you decide.

## Razorpay account (you do this; it needs your identity documents)

- [ ] Sign up at razorpay.com with your email and phone, and complete any verification yourself.
- [ ] **Test-mode keys:** Razorpay's docs say you can integrate in test mode while KYC is being checked. Test keys start with `rzp_test_`. That's all Phase 3 needs.
- [ ] **KYC for an individual (unregistered) seller.** Typical documents, but follow the list Razorpay shows you:
  - PAN card.
  - A second ID or address proof (for example Aadhaar).
  - Bank proof for the payout account (cancelled cheque or statement). The account name must match your PAN.
  - A short description of what you sell: "digital guides, templates and learning resources, delivered as downloads".
- [ ] **Website for activation:** Razorpay checks the site before giving **live** keys. Have these ready first:
  - The live store with real products (not "Sample content").
  - Pages for Terms, Privacy, Refund/Cancellation, Contact (with a reachable email), and the license. The footer already links to these. They need your reviewed wording (BUILD_PLAN Phase 5).
  - Ideally your own domain (see `docs/DOMAIN_AND_EMAIL.md`).
- [ ] Common rejection causes to avoid: blurry scans, a name that differs between documents, an inactive website, expired documents.

## What to hand over when Phase 3 starts (test mode only)

Never paste these into chat. I'll add them to Vercel with the CLI, or you can.

- [ ] `RAZORPAY_KEY_ID` (test, starts `rzp_test_`).
- [ ] `RAZORPAY_KEY_SECRET` (test). It is shown only once, when generated. Only the Owner or Admin role can see API keys.
- [ ] A webhook secret you choose (`RAZORPAY_WEBHOOK_SECRET`). The webhook URL will be `https://<your-site>/api/webhooks/razorpay`. I'll give you the exact events (`payment.captured`, `order.paid`, `payment.failed`, `refund.processed`) when Phase 3 is built.

## Not in Phase 3

- Live mode, live keys or real money (needs your separate approval).
- USD or international cards (feature flag stays off).
- Payouts, invoices or GST logic (depends on the CA answers).

## Sources

- [Razorpay: KYC documents by business type](https://razorpay.com/docs/payments/business-types-kyc-documents/)
- [Razorpay: minimum documents for onboarding](https://razorpay.com/blog/minimum-documents-payment-gateway-onboarding-india/)
- [Razorpay: payments FAQs (no-GST route)](https://razorpay.com/docs/payments/faqs?preferred-country=IN)
- [Razorpay: payments quickstart (test mode during KYC)](https://razorpay.com/docs/payments/quickstart?preferred-country=IN)
- [Razorpay: set up an account](https://razorpay.com/docs/build/llm-docs/payments/set-up.md)
