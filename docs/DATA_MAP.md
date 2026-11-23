# Data map — personal data in Fieldkitt

**Draft: owner/lawyer review required.** This describes what the code does today (2026-11-18, branch `pre-domain-audit`). It is not a statement of legal compliance.

The source of truth is `lib/legal/data-map.ts`. The privacy page (`/privacy`) renders that file, and `lib/legal/data-map.test.ts` fails if this document stops naming an item from it. **When a form, table or service changes, update `data-map.ts` first, then regenerate the tables below.**

## Personal data collected

| Data                                                                            | When                                                                        | Stored in                                                                              | Processors            | Retention                                                                                                |
| ------------------------------------------------------------------------------- | --------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | --------------------- | -------------------------------------------------------------------------------------------------------- |
| Name and email address                                                          | You fill in the form before a free download or a purchase.                  | Database tables: leads and customers                                                   | Vercel, Neon          | Kept until deleted (no automatic deletion yet; owner to decide a period).                                |
| Marketing choice and the time you made it                                       | Only if you tick the optional box (it is never ticked for you).             | Database table: leads                                                                  | Neon                  | Kept until deleted (no automatic deletion yet; owner to decide a period).                                |
| IP address (scrambled, never stored in full)                                    | You submit a form or download a file.                                       | Database tables: leads, download_logs (as a salted hash); Upstash (hashed counter key) | Vercel, Neon, Upstash | Hash in the database: until deleted. Upstash counters: expire within one hour.                           |
| Orders: what you bought, price, status, Razorpay order and payment IDs          | You start or finish a purchase.                                             | Database tables: orders, order_items                                                   | Neon, Razorpay        | Kept until deleted; sales records may need to be kept for tax purposes (owner/CA to confirm the period). |
| Payment details (card, UPI, bank, phone number if you enter it)                 | You pay on Razorpay's checkout form.                                        | Razorpay only; never this store's database                                             | Razorpay              | Set by Razorpay.                                                                                         |
| Payment events from Razorpay (may include email, phone, payment method)         | Razorpay notifies the store about a payment (webhook; not switched on yet). | Database table: webhook_events                                                         | Neon, Razorpay        | Kept until deleted (no automatic deletion yet; owner to decide a period).                                |
| Access and downloads: what you can download, how many times, when, browser type | You get a kit and download its files.                                       | Database tables: entitlements, download_logs                                           | Neon, Backblaze B2    | Kept until deleted (no automatic deletion yet; owner to decide a period).                                |
| Sign-in links (your email and a scrambled copy of the link's code)              | You ask for a link to My Library.                                           | Database table: magic_tokens                                                           | Neon, Resend          | Links stop working after 15 minutes or one use; the row is kept until deleted.                           |
| Sign-in cookie (contains your email, signed so it can't be changed)             | You open a sign-in link.                                                    | Your browser (cookie)                                                                  | —                     | 30 days, or until you sign out.                                                                          |
| Emails sent to you                                                              | Sign-in links, purchase receipts and product update notices.                | Resend's email log                                                                     | Resend                | Set by Resend's plan (owner to confirm).                                                                 |
| Reviews (rating, title, text, how you used the kit)                             | You choose to write a review.                                               | Database table: reviews                                                                | Neon                  | Kept until deleted (no automatic deletion yet; owner to decide a period).                                |

## Processors

| Service      | What it does with the data                                                                                                                    | Region                                          |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| Vercel       | Hosts the website and runs its server code. Sees each visit's IP address and browser details in short-lived request logs.                     | Server code runs in Singapore (sin1)            |
| Neon         | The database that stores the records listed below.                                                                                            | Singapore                                       |
| Razorpay     | Takes payments. Card, UPI and bank details are entered on Razorpay's own form and never reach this store.                                     | India                                           |
| Resend       | Sends the sign-in and purchase emails. Keeps a log of emails sent (address, subject, delivery status).                                        | Set in the Resend account (owner to confirm)    |
| Upstash      | Counts recent attempts to stop abuse. Receives only a scrambled (salted hash) form of the IP address or email; entries expire within an hour. | Singapore                                       |
| Backblaze B2 | Stores the product files. Holds no customer records; downloads use short-lived signed links.                                                  | Set in the Backblaze account (owner to confirm) |

## What never reaches the store

- **Card, UPI and bank details**: entered only on Razorpay's own checkout form.
- **Full IP addresses**: the server hashes them with a secret salt (`hashIp`, `limitKey` in `lib/security/`). The database and Upstash get only the hash. Vercel's request logs see the raw IP briefly, as every web host does.
- **Advertising trackers**: none are installed. **Vercel Web Analytics** (`components/analytics/site-analytics.tsx`) counts visits and page views without cookies, **only** on Home, Explore, Free, category pages and product pages (`lib/analytics.ts` allowlist; every other page sends nothing, and query strings and `#fragments` are stripped). It sees that page address, referrer, browser/device type and country, and identifies a visitor only by a hash that resets daily (no IP address is stored).

## Things to know

- **The sign-in cookie** (`makers_session`) holds the buyer's email in readable (base64) form, signed so it can't be changed. It is httpOnly (page scripts can't read it), `secure` in production and `SameSite=Lax`.
- **Leads CSV export** (`/admin` → Leads → Export) copies names and emails to the owner's computer. Keep that file private and delete it when done.
- **Webhooks are not switched on yet.** When they are, `webhook_events.payload` will hold Razorpay's event JSON, which can include the buyer's email, phone and payment method.
- **Retention:** nothing is deleted automatically. The owner should decide periods (for example, sign-in link rows after 30 days, leads without a purchase after 2 years) and then a scheduled job can be added. Until then the privacy page says "kept until deleted".

## How a person asks for deletion (owner steps)

1. The person writes to the support or grievance email. **Acknowledge within 48 hours.**
2. **Check it's really them.** Reply to the email address on record and ask them to confirm. Never act on a request from a different address.
3. **Try it on the development database first.** In the Neon console, open the **development** branch, run the SQL below with a test email, and check the results.
4. On the **production** branch, run the same SQL with their email. Replace `buyer@example.com` in the first line only:

```sql
begin;
-- The email to remove (lowercase, as stored).
create temp table target on commit drop as select 'buyer@example.com'::text as email;

-- Sign-in links and leads: delete.
delete from magic_tokens where email = (select email from target);
delete from leads        where email = (select email from target);

-- Access, download history and reviews: delete (download_logs go with entitlements).
delete from entitlements where customer_id in (select id from customers where email = (select email from target));
delete from reviews      where customer_id in (select id from customers where email = (select email from target));

-- Customers with orders: keep the sales record for tax, remove the person.
update customers
   set name = 'Deleted customer', email = 'deleted-' || id || '@deleted.invalid', updated_at = now()
 where email = (select email from target)
   and exists (select 1 from orders o where o.customer_id = customers.id);

-- Customers without orders: delete completely.
delete from customers
 where email = (select email from target)
   and not exists (select 1 from orders o where o.customer_id = customers.id);

-- Razorpay webhook events that mention the email (once webhooks are on).
delete from webhook_events where payload::text ilike '%' || (select email from target) || '%';

commit;
```

5. **Resend:** in the Resend dashboard → Emails, search the address and delete those log entries if the plan allows it. Otherwise they expire on Resend's own schedule.
6. **Razorpay** keeps its own payment records under financial rules. Point the person to Razorpay's privacy policy for those.
7. Reply to confirm what was deleted and what was kept (the sales record and why). **Resolve within one month.**

Upstash needs nothing: it only ever holds hashes, which expire within an hour.
