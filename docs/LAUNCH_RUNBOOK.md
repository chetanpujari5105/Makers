# Launch day runbook (fieldkitt.xyz)

Ordered steps for the day the domain and Vercel Pro arrive. **[Owner]** = only you can do it (logins, payments, secrets, DNS, codes). **[Claude]** = Claude can do it with you watching. Never paste a secret into chat.

Today (2026-11-19) the store already sells on `https://makers-alpha.vercel.app`: live Razorpay keys are on Vercel Production, the webhook is registered, and `CHECKOUT_ENABLED=true`. Launch day moves all of that to the new address.

## Before you start

- [ ] **[Owner]** Have your password manager ready, plus your phone for Razorpay/Vercel codes.
- [ ] **[Claude]** `npm run check` passes on `main`; the latest Production deployment is "Ready".

## 1. Domain and hosting

1. **[Owner]** Buy `fieldkitt.xyz` (and auto-renew on).
2. **[Owner]** Vercel → Settings → Billing: upgrade the team to **Pro**. Hobby is for non-commercial use only; a store that sells needs Pro.
3. **[Owner]** Vercel → makers → Settings → **Domains** → add `fieldkitt.xyz` and `www.fieldkitt.xyz` (redirect `www` → bare domain). Add the DNS records Vercel shows at your registrar. Wait until both show **Valid Configuration**.
4. **[Claude]** Vercel → Environment Variables → Production: set `NEXT_PUBLIC_SITE_URL=https://fieldkitt.xyz` (not a secret). Full detail: `docs/DOMAIN_SWITCH.md`.

## 2. Email (Resend)

5. **[Owner]** Resend → Domains → add `fieldkitt.xyz` → add its DNS records (SPF, DKIM, and the return-path record) at your registrar → wait for **Verified**.
6. **[Claude]** Vercel Production: set `EMAIL_FROM=Fieldkitt <hello@fieldkitt.xyz>` and `SUPPORT_EMAIL` (the address buyers reply to). Not secrets.
7. **[Claude]** Redeploy Production (you approve with your passkey if Vercel asks). Check: home page on the new domain, `/sitemap.xml` and canonical links show `fieldkitt.xyz`.
8. **[Owner]** Request a My Library link to your own email on the new domain: it must arrive from `hello@fieldkitt.xyz`, not `onboarding@resend.dev`.

## 3. Razorpay

9. **[Owner, Claude can fill the form]** Account & Settings → Business website details → **+ Add additional website/app**: `https://fieldkitt.xyz`. Keep `makers-alpha.vercel.app` until the new one shows **Approved** (24–48 h), so payments never stop.
10. **[Claude fills, Owner pastes the secret]** Account & Settings → Webhooks → edit the webhook URL to:
    `https://fieldkitt.xyz/api/webhooks/razorpay`
    Events (exactly these four): `payment.captured`, `order.paid`, `payment.failed`, `refund.processed`. If Razorpay asks for the secret again, paste the **same** value as `RAZORPAY_WEBHOOK_SECRET` in Vercel (from your password manager). If you no longer have it: make a new one with `openssl rand -hex 32 | pbcopy`, paste it in **both** Razorpay and Vercel, then redeploy.
11. **[Claude]** Account & Settings → Customer support details → Website/Contact link: `https://fieldkitt.xyz/contact`.
12. **[Owner]** Only if you rotate keys: Razorpay (Live) → API keys → Regenerate; paste the new Key ID and Secret into Vercel Production (`RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, Sensitive); redeploy.

## 4. Switch on and prove it

13. **[Claude]** Confirm Vercel Production has `CHECKOUT_ENABLED=true` and that the product page on the new domain shows **Get this** (not "Opens soon").
14. **[Owner]** Buy the ₹99 GTA 6 Clipping Playbook with your own card/UPI on `https://fieldkitt.xyz`. Check: "Payment confirmed" page → receipt email → My Library link → PDF downloads.
15. **[Claude]** Check Admin → Orders shows it **paid**, and Razorpay → Webhooks → recent deliveries show **200**.
16. **[Owner]** Razorpay → Transactions → that payment → **Refund** (full). Within minutes the order shows **refunded** in Admin and the playbook disappears from your library (the `refund.processed` webhook). If both happen, launch is done.

## Rollback (if anything goes wrong)

- **Stop new sales now:** **[Claude]** Vercel Production → set `CHECKOUT_ENABLED=false` (or delete it) → redeploy (passkey). Product pages show "Opens soon"; payments already made still finish and grant access.
- **Bad code deploy:** **[Claude]** Vercel → Deployments → previous Production deployment → **Instant Rollback**.
- **Domain problems:** the old address `https://makers-alpha.vercel.app` keeps working; set `NEXT_PUBLIC_SITE_URL` back to it and redeploy. Keep the Razorpay website + webhook on the old address until the new one works.
- **Someone paid but has no access:** Admin → Orders → find the order; if Razorpay shows it captured but the order isn't paid, check Razorpay → Webhooks → deliveries; "Resend receipt" in Admin sends the library link again.
