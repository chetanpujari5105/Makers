# Razorpay live mode — checklist

Owner approved switching on live payments on 2026-11-18 ("take control and do it"). Branch `live-checkout`.

## Code (this branch)

- `paymentsConfigured()` (`lib/payments/razorpay.ts`): **live** keys (`rzp_live_`) only on Vercel Production, **test** keys (`rzp_test_`) only locally, **never** on previews (they share the production database). Payment confirmations (browser check + webhook) need only this.
- `isCheckoutOpen()`: new checkouts. On Production it also needs the on/off switch **`CHECKOUT_ENABLED=true`** (default OFF; added 2026-11-19), so a deploy never opens payments by accident.
- Buyers see "test mode — no real money" only with test keys.
- Tests: `lib/payments/payments.test.ts` ("the checkout switch…", "emergency OFF…", "buyer closes the tab…").

## Owner steps (secrets and logins: the owner does these)

1. [x] Razorpay account activated (Account & Settings → Activation details: activated 2026-11-17).
2. [x] Razorpay → switch the top toggle to **Live** → Account & Settings → API keys → Generate live key. Copy the Key ID and Key Secret (the secret is shown once).
3. [x] Make a webhook secret without printing it: in Terminal run `openssl rand -hex 32 | pbcopy` (copies it to the clipboard).
4. [x] Razorpay (Live) → Account & Settings → Webhooks → Add new webhook:
   - URL: `https://makers-alpha.vercel.app/api/webhooks/razorpay` (change it when the domain moves; `docs/DOMAIN_SWITCH.md`)
   - Secret: paste from step 3
   - Events: `payment.captured`, `order.paid`, `payment.failed`, `refund.processed`
5. [x] Vercel → makers → Settings → Environment Variables → add, **Production only**, marked Sensitive: `RAZORPAY_KEY_ID` (rzp_live_…), `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET` (same value as step 4).
6. [x] Say "merge" → Production redeploys with the new code and keys.
7. [ ] **(still to do)** One real purchase with your own card on the live site; check the order in Admin → Orders, the email, the library download, and the webhook delivery (Razorpay → Webhooks → the webhook → recent deliveries: 200).

Done 2026-11-18: keys added by the owner, webhook enabled (4 events), Production redeployed; the live page shows the buy button and `/api/orders` validates input (400) instead of 503. Razorpay's onboarding test payment was done on localhost with test keys (order paid, access granted).

## Still open (owner's call; not blocking the code)

- Legal details filled 2026-11-18; owner + lawyer reviewed the policy pages 2026-11-19; CA review done (owner, 2026-11-19). Terms §7 still has the limitation-of-liability marker until the owner pastes the lawyer's sentence or approves dropping it.
- GTA 6 Clipping Playbook: owner states it is their own work (2026-11-19; `docs/DECISIONS.md`).
- Launch on the real domain: `docs/LAUNCH_RUNBOOK.md`.

## Turning checkout on and off (Production)

- **On:** Vercel → makers → Settings → Environment Variables → `CHECKOUT_ENABLED` = `true`, **Production** only (not a secret) → Deployments → latest Production → Redeploy (approve with your passkey).
- **Emergency off:** same place, set `CHECKOUT_ENABLED` to `false` (or delete it) → Redeploy. Product pages show "Opens soon" and `/api/orders` answers 503 within a minute of the deploy. Payments already made still complete (webhook + browser check keep working), so nobody pays without getting access.
- **Fully off (remove the keys):** delete the three `RAZORPAY_*` variables from Production and redeploy. Do this only if a key leaked; payments in flight would then wait until keys return (Razorpay retries webhooks for 24 hours).

## Webhook reference

- URL format: `https://<your-domain>/api/webhooks/razorpay` — today `https://makers-alpha.vercel.app/api/webhooks/razorpay`, on launch day `https://fieldkitt.xyz/api/webhooks/razorpay`.
- Events: `payment.captured`, `order.paid`, `payment.failed`, `refund.processed`.
- Secret: the same value as `RAZORPAY_WEBHOOK_SECRET` in Vercel Production.
