# Razorpay live mode — checklist

Owner approved switching on live payments on 2026-11-18 ("take control and do it"). Branch `live-checkout`.

## Code (this branch)

- `isCheckoutOpen()` (`lib/payments/razorpay.ts`): **live** keys (`rzp_live_`) only on Vercel Production, **test** keys (`rzp_test_`) only locally, **never** on previews (they share the production database).
- Buyers see "test mode — no real money" only with test keys.
- Test: `lib/payments/payments.test.ts` ("opens checkout with test keys locally, live keys only on production, never on previews").

## Owner steps (secrets and logins: the owner does these)

1. [x] Razorpay account activated (Account & Settings → Activation details: activated 2026-11-17).
2. [ ] Razorpay → switch the top toggle to **Live** → Account & Settings → API keys → Generate live key. Copy the Key ID and Key Secret (the secret is shown once).
3. [ ] Make a webhook secret without printing it: in Terminal run `openssl rand -hex 32 | pbcopy` (copies it to the clipboard).
4. [ ] Razorpay (Live) → Account & Settings → Webhooks → Add new webhook:
   - URL: `https://makers-alpha.vercel.app/api/webhooks/razorpay` (change it when the domain moves; `docs/DOMAIN_SWITCH.md`)
   - Secret: paste from step 3
   - Events: `payment.captured`, `order.paid`, `payment.failed`, `refund.processed`
5. [ ] Vercel → makers → Settings → Environment Variables → add, **Production only**, marked Sensitive: `RAZORPAY_KEY_ID` (rzp_live_…), `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET` (same value as step 4).
6. [ ] Say "merge" → Production redeploys with the new code and keys.
7. [ ] One real purchase with your own card on the live site; check the order in Admin → Orders, the email, the library download, and the webhook delivery (Razorpay → Webhooks → the webhook → recent deliveries: 200).

## Still open (owner's call; not blocking the code)

- Legal pages still show "[Owner to fill]" for seller name, address, phone and grievance officer (`legal` in `lib/brand.ts`). Indian e-commerce rules expect these on a site that sells.
- GST / invoice questions for a CA (`docs/PHASE3_READINESS.md`).
- Rights to sell material adapted from other creators: owner confirmed permission on 2026-11-18.

## Turning it off again

Delete the three `RAZORPAY_*` variables from Vercel Production and redeploy: checkout returns to "Opens soon".
