# Domain and email — options and exact steps

_Research only (2026-11-17). Nothing has been bought. Prices change, so check the checkout page before paying, and compare **renewal** prices as well as the first-year price._

## Why you need this

Until you verify a domain, Resend sends from its test address `onboarding@resend.dev`, which **only delivers to your own Resend account email**. Real customers won't get their library links until a domain is verified. A domain also gives the store its own web address in place of `makers-alpha.vercel.app`.

## 1. Choose where to register the domain

| Registrar                | Price (.com, per year)                       | Notes                                                                                                                    |
| ------------------------ | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| **Cloudflare Registrar** | At cost, about US$10.4                       | No markup, and free WHOIS privacy. The domain must use Cloudflare's DNS. Needs a payment method on a Cloudflare account. |
| **Porkbun**              | About US$11                                  | Simple, reputable, free WHOIS privacy, any DNS.                                                                          |
| **Spaceship**            | Low first year (promo), about US$10 to renew | Cheapest over 5 years in several 2026 comparisons. Several of those comparisons are written by registrars.               |

**Recommendation:** Cloudflare Registrar or Porkbun. Both charge a fair renewal price, include free privacy, and have a long track record. Avoid "₹99 first year" deals with high renewal prices. An India-focused `.in` name is also an option; compare its renewal price the same way.

Buying a domain needs your card and acceptance of the registrar's terms, so **you** do the purchase.

## 2. Point the domain at the store (Vercel)

1. In Vercel, open project **makers** → **Settings** → **Domains** → **Add**. Type your domain (for example `yourstore.com`), then add `www.yourstore.com` too.
2. Vercel shows one or two DNS records (usually an `A` record for the root and a `CNAME` for `www`). Add exactly those at your registrar's DNS page. On Cloudflare, set them to **DNS only** (grey cloud).
3. Wait until Vercel shows "Valid Configuration".
4. Set `NEXT_PUBLIC_SITE_URL=https://yourstore.com` for **Production** (`vercel env add NEXT_PUBLIC_SITE_URL production`) and redeploy. Sign-in links, the sitemap and canonical links then use the new address.
5. Add `https://yourstore.com` to the Backblaze bucket's CORS rules, or admin uploads from the new address will fail.

## 3. Verify the domain in Resend

1. In Resend → **Domains** → **Add domain**, use a **subdomain** such as `mail.yourstore.com`. Resend recommends a subdomain so its records can't clash with anything else on the main domain.
2. Resend's **Records** tab lists the records to add. Copy them exactly; the tab is the source of truth. They are usually:
   - **DKIM**: a `TXT` record named `resend._domainkey` (or `resend._domainkey.mail`) holding a long public key.
   - **SPF**: a `TXT` record on `send` (or `send.mail`) with a value like `v=spf1 include:… ~all`.
   - **Bounces (MX)**: an `MX` record on `send` (or `send.mail`) pointing to Resend's feedback server.
   - Newer domains may get `CNAME` records in place of some of these. Use whatever the tab shows.
3. **Recommended:** a DMARC record, a `TXT` record named `_dmarc` with the value `v=DMARC1; p=none;`. You can tighten it later.
4. Watch for DNS quirks:
   - On Cloudflare, set records to **DNS only**.
   - Some DNS hosts add your domain to the end of names and values automatically. If verification fails, remove the duplicated domain part.
   - If a record already exists at the same name (for example an SPF record), merge the values instead of adding a second one.
5. Press **Verify**. It usually passes within 15 minutes; after 72 hours, use **Restart verification**.
6. Create a sending-only API key if you want a new one. Then set `EMAIL_FROM` in Vercel for **Production** and **Preview**, for example `hello@mail.yourstore.com` (the code adds the display name "Fieldkit" from `lib/brand.ts`), and redeploy.
7. Test: claim a free product with your own email, then with a friend's. Both should arrive.

## 4. Optional: a support inbox

Resend sends email but doesn't host mailboxes. For `help@yourstore.com`, either use Cloudflare Email Routing (free forwarding to your Gmail, if the domain is on Cloudflare) or your registrar's forwarding. Then set `SUPPORT_EMAIL` in Vercel.

## Sources

- [Resend: add a domain](https://resend.com/docs/add-a-domain)
- [Resend: domains introduction](https://resend.com/docs/dashboard/domains/introduction.md)
- [Resend: Cloudflare DNS guide](https://resend.com/docs/knowledge-base/cloudflare)
- [Resend: what if my domain is not verifying](https://www.resend.com/docs/knowledge-base/what-if-my-domain-is-not-verifying)
- [Cheapest domain registrars in 2026 (Dupple)](https://dupple.com/learn/cheapest-domain-registrars)
- [Cheapest registrars (domaindetails.com)](https://domaindetails.com/registrars/cheapest)
- [Cheapest .com registrars 2026 (DomainOffer)](https://domainoffer.net/blog/cheapest-com-domain-registrars-2026)
