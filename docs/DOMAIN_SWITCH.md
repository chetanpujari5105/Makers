# Domain switch — the day you buy the domain

Everything in the code is ready. Every absolute link (canonical, Open Graph, sitemap, robots, JSON-LD, sign-in emails) comes from **one setting, `NEXT_PUBLIC_SITE_URL`** (`lib/site-url.ts`). `lib/domain-switch.test.ts` proves it with a fake domain. Cookies have no domain set, so they follow whatever address the site is on. Razorpay uses no callback URL (the result comes back inside the page).

Below, `example.com` stands for your domain. Do the steps **in order**. Each one says how to check it worked and how to undo it.

> Before you buy: run the trademark search for "Fieldkit" and check that the domain and social handles are free (still open in `docs/DECISIONS.md`).

## 0. A few days before (nothing changes for visitors)

1. **Backblaze B2 CORS:** add the new origins `https://example.com` and `https://www.example.com` to the `makers-files` bucket's CORS rules, keeping `https://makers-alpha.vercel.app` and `http://localhost:3000`. Use the B2 API or CLI, the same way it was set up in README → Backblaze.
   - **Check:** the rule list shows all four origins.
   - **Undo:** remove the new origins.
2. **Decide the email addresses:**
   - **Sending:** use a subdomain, for example `mail.example.com`, so it never clashes with your inbox's MX records.
   - **Receiving:** a support inbox such as `hello@example.com`, through Google Workspace, Zoho Mail or the registrar's email forwarding.

## 1. Buy the domain (registrar)

1. Buy it with **auto-renew on**, **registrar lock on** and **2-factor login** on the registrar account.
2. Don't add any DNS records yet. Vercel and Resend will tell you exactly which ones.

## 2. Connect it to Vercel

1. Vercel → project **makers** → **Settings → Domains → Add** `example.com`. Add `www.example.com` too and set it to **redirect to** `example.com`.
2. Vercel shows the DNS records to create (an A record and/or a CNAME). **Copy them exactly** into the registrar's DNS page. Don't type values from memory.
3. Wait until Vercel says **Valid Configuration** and the HTTPS certificate is issued. That usually takes minutes, but DNS can take up to 48 hours.
   - **Check:** `https://example.com` opens the store with a padlock, and `https://www.example.com` jumps to it.
   - **Undo:** remove the domain in Vercel. The site keeps working on `makers-alpha.vercel.app`.

## 3. Set `NEXT_PUBLIC_SITE_URL`

1. Vercel → **Settings → Environment Variables → Add** `NEXT_PUBLIC_SITE_URL` = `https://example.com`. Tick **Production only**.
   - If you set it for Preview too, sign-in emails sent from previews would point at the live site.
2. **Redeploy production** (Deployments → latest production → Redeploy). The value is baked in when the site is built, so saving the setting alone changes nothing.
   - **Check:** on `https://example.com`, view the page source of a product page. `og:url`, `canonical` and the JSON-LD `url` start with `https://example.com`. `https://example.com/sitemap.xml` and `/robots.txt` list the new domain.
   - **Check:** request a My Library link. The link in the email starts with `https://example.com/library/continue`.
   - **Undo:** delete the variable and redeploy, or use **Instant Rollback** on the previous deployment.

> Without this variable, Vercel switches the fallback to your custom domain by itself, but setting it explicitly is safer and easier to check.

## 4. Send old links to the new domain

1. Vercel → **Settings → Domains** → `makers-alpha.vercel.app` → **Edit → Redirect to** `example.com` (permanent, 308).
   - **Check:** `curl -sI "https://makers-alpha.vercel.app/library/continue?token=test"` answers `308` with `location: https://example.com/library/continue?token=test`. The path and the `?token=` must both survive, or sign-in links already sent by email will break.
   - **Undo:** set the domain back to "no redirect".
2. Preview deployments keep their own `*.vercel.app` addresses. Nothing to do.

## 5. Cookies (nothing to change)

Cookies belong to the address that set them. After the switch, **everyone is signed out once**: buyers ask for a new library link and you sign in to `/admin` again. Old cookies on `makers-alpha.vercel.app` simply expire. Don't rename the cookies; that would sign everyone out a second time.

## 6. Email: Resend domain

1. Resend → **Domains → Add Domain** → `mail.example.com`. Pick the region closest to your buyers.
2. Resend lists DNS records: SPF (TXT and MX on the `send` subdomain), DKIM (TXT) and an optional DMARC (TXT). **Copy them exactly** into the registrar's DNS page.
3. Wait for Resend to show **Verified**.
4. Vercel → env var `EMAIL_FROM` = `hello@mail.example.com` for **Production**. Preview can use it too. You only need the address: the code adds the name "Fieldkit". Redeploy.
   - **Check:** request a library link to an address that is **not** your Resend login, such as a second mailbox. It must arrive, not in spam, and show "via mail.example.com" / "signed by example.com".
   - **Undo:** set `EMAIL_FROM` back to `onboarding@resend.dev` and redeploy. That address only delivers to your own Resend email.
5. Fill in `brand.supportEmail` and `legal.grievanceOfficer.email` in `lib/brand.ts`, plus the `SUPPORT_EMAIL` env var used in emails. Then update the "leaves every detail for the owner" test in `lib/brand.test.ts`.

## 7. Razorpay

1. Razorpay Dashboard → **Account & Settings → Business website details**: change the website to `https://example.com`. Razorpay may re-review the website. The policy pages are at `/terms`, `/privacy`, `/refund-policy`, `/contact` and `/pricing`.
2. **Checkout branding:** set the display name "Fieldkit" and upload `public/brand/fieldkit-mark.svg` (or a PNG made from it).
3. When you approve live mode and webhooks: the webhook URL is `https://example.com/api/webhooks/razorpay` (see `docs/HANDOFF.md` §10).
   - **Check:** a test-mode payment on a preview still completes (preview only, never with live keys).
   - **Undo:** change the website back in the dashboard.

## 8. Search and sharing

1. Google Search Console → add a **Domain** property (verify with the DNS TXT record it gives you) → submit `https://example.com/sitemap.xml`.
2. Paste a product link into WhatsApp or Slack and check that the preview shows the Fieldkit image and the right title.

## 9. Final checks

- `curl -sI https://example.com` returns `200`, and security headers are present (`x-frame-options`, `x-content-type-options`, `strict-transport-security`).
- A free claim with a real second mailbox works end to end: email arrives, the link signs in, the download works. **This writes a real lead and customer to production; delete them afterwards with the steps in `docs/DATA_MAP.md`.**
- `/admin` sign-in works, and an admin file upload works (that's the B2 CORS check).
- Update `lib/brand.ts` (`domain`), `CLAUDE.md`, `docs/HANDOFF.md` and `README.md` (B2 CORS list, URLs) with the new domain.

## If something goes wrong

- **Whole site:** Vercel → Deployments → previous production → **Instant Rollback**. Then remove the new env values.
- **Emails broken:** set `EMAIL_FROM` back to `onboarding@resend.dev` and redeploy.
- **DNS mistakes:** fix the records at the registrar. `makers-alpha.vercel.app` keeps working throughout, unless you already redirected it in step 4. In that case, turn the redirect off first.
