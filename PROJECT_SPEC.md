# PROJECT SPECIFICATION — MAKERS Digital Resource Store

> **Instruction to Claude Code:** Read this entire document before writing application code. Follow `CLAUDE.md` and `BUILD_PLAN.md`. Build one phase at a time, run the checks, and stop for owner review after each phase.
>
> **Owner profile:** The owner is a creator, not a senior engineer. Explain technical errors in plain English and give exact terminal commands. Never invent credentials or claim an integration works unless it has been configured and tested.

---

## 0. Project decisions and scope

### 0.1 What we are building

Build a polished, creator-owned digital resource store where one owner can publish and sell useful digital products to customers in India and around the world.

The store can sell:

- PDFs, ebooks, workbooks and guides.
- Downloadable courses and course resources.
- Markdown (`.md`) files and practical AI prompt packs.
- Notion templates and other external template links.
- Figma and Canva resources, design systems and creative kits.
- 3D-printing files such as STL and 3MF models.
- Bundles containing several related products.

The core promise is **sell the outcome, not just the file**. Every product page must explain what the product helps the buyer do, who it is for, what is included, how to set it up and what realistic result the buyer can work towards.

The audience may include students, parents, freelancers, designers, creators, business owners and people with little technical experience. Use clear, friendly English at approximately a grade-six reading level. Explain unfamiliar technical words. Never imply that a purchase guarantees income, employment, business growth or a specific result.

### 0.2 This is a single-owner store, not a multi-vendor marketplace

Only the site owner can create, edit, price, publish and archive products. Do not build:

- Public seller registration or seller profiles.
- Seller dashboards.
- Creator commissions or marketplace payout splits.
- Seller identity checks or seller onboarding.
- Multi-vendor product moderation.

Keep the architecture clean enough that multi-vendor support could be explored in a separate future project, but do not implement it now.

### 0.3 Fixed technology stack

Do not replace these choices without first explaining a concrete blocker and asking the owner.

| Layer | Required choice |
|---|---|
| Web framework | Next.js stable release, App Router, TypeScript strict mode |
| UI | Tailwind CSS, shadcn/ui, lucide-react |
| Motion | framer-motion for subtle, purposeful motion only |
| Hosting | Vercel |
| Source control / deploy | GitHub; `main` is production; pull requests create Vercel previews |
| Database | Neon Postgres, connected through the Vercel Marketplace integration |
| ORM / migrations | Drizzle ORM + drizzle-kit, using `@neondatabase/serverless` |
| Payments | Razorpay Orders API + Checkout.js + webhooks |
| Payment architecture | Provider interface so another provider can be added later without rewriting store logic |
| Private file storage | Cloudflare R2 private bucket, S3-compatible API and short-lived presigned URLs |
| Transactional email | Resend + React Email |
| Product guide content | MDX in `content/products/`; structured product-page content can also be stored in Postgres for owner-friendly editing |
| Input validation | Zod on every API input |
| Buyer authentication | Passwordless email magic links; no buyer passwords |
| Admin authentication | Single owner account from environment variables, signed httpOnly session cookie |
| Rate limiting | Upstash Redis using `@upstash/ratelimit` |
| Analytics | Vercel Analytics; optional Plausible if configured |
| Tests | Unit/integration tests and Playwright end-to-end tests for critical flows |

Use compatible stable package versions available when implementation begins. Commit the lockfile. Do not use experimental Next.js features unless they are required and stable for the selected release.

### 0.4 Important infrastructure distinction

- **Vercel** runs and deploys the Next.js website and server-side routes.
- **Neon** stores structured data: products, categories, customers, leads, orders, entitlements, reviews and settings.
- **Cloudflare R2** stores downloadable product files privately. Do not store large binary files in Postgres.
- **GitHub** stores the source code and MDX guides, and triggers deployments through Vercel.

Neon is the database, not the file-download service.

### 0.5 Working brand

Use **MAKERS** as a temporary name in code and sample UI. Keep the site name, logo, accent colour, support email and footer details in a central brand/config file or database settings so the owner can change them later. Do not make brand name changes require editing many components.

Brand decisions still needed before public launch:

- Final brand name and domain.
- Logo and favicon.
- Accent colour.
- Support email and sender domain.

Do not invent a real domain, support email or business address.

---

## 1. Buyer journey — implement this exact flow

The buyer flow is a core requirement. Do not redesign it without asking.

### 1.1 Product discovery and information

1. A visitor lands on the home page, explores the catalogue, or opens a direct product URL.
2. The visitor can read the complete product page before giving their name or email.
3. The product page explains the product clearly: benefits, audience, contents, previews, setup, results, requirements, license, help and FAQs.
4. The main CTA is labelled **Get this** for a paid product and **Download free** for a free product. Avoid a misleading download label for paid products.

### 1.2 Click CTA and capture name/email

5. Clicking the CTA opens a modal/dialog.
6. The dialog asks for:
   - Name (required).
   - Email (required, validated and normalized to lowercase).
   - Optional marketing/newsletter checkbox (unchecked by default).
7. Include a short, readable privacy note explaining why the name and email are needed: to provide access, send the receipt and help the customer return to the product.
8. Save the lead in the database before attempting payment. If the customer closes or fails checkout, the lead remains saved.
9. Saving a lead does **not** mean the customer agreed to marketing. Only send marketing messages when the customer explicitly opts in and the required unsubscribe mechanism is present.

### 1.3 Free product flow

10. For a free product, do not open Razorpay.
11. Create or find the customer record, grant an entitlement and record the free claim safely and idempotently.
12. Show a clear success/Start Here state with the secure download button and getting-started guide.
13. Send a free-download email containing a secure way to access the product or My Library. Do not send a permanent public R2 URL.

### 1.4 Paid product flow

14. For a paid product, create the Razorpay order on the server using the product's current database price and supported currency. Never trust a price sent by the browser.
15. Save a local order row with status `created` and the Razorpay order ID before returning the Checkout details to the browser.
16. Open Razorpay Checkout and prefill the name/email captured in the dialog. Enable UPI, cards, netbanking and wallets when available for the account and currency.
17. On the Checkout success callback, send Razorpay order ID, payment ID and signature to the server verification endpoint.
18. Verify the HMAC signature using the server-only Razorpay secret and a timing-safe comparison. Also confirm the payment/order status with Razorpay where appropriate. A signature callback alone must not unlock an uncaptured payment.
19. The webhook is the authoritative confirmation path. The verification endpoint may be a fast path for the user experience, but both paths must be idempotent and must not create duplicate entitlements.
20. Only after the payment is confirmed as captured/paid should the order be marked paid and entitlements be granted.
21. Show a success/Start Here page with secure downloads and a clear getting-started guide. Send a receipt email with a My Library link.
22. If payment fails or the Checkout popup is closed, show a helpful message and allow retry. Do not mark the order paid or grant access.

### 1.5 My Library

23. Buyers can return to their purchases using an email magic link. They do not create or remember a password.
24. The visitor enters their email on `/library`; the site sends a single-use magic link that expires after 15 minutes.
25. Store only a cryptographic hash of the magic token. Mark it used after a successful login. Do not place customer or file data in the URL beyond an opaque, short-lived token.
26. My Library lists the buyer's entitled products, product update notices, Start Here guides and download actions.
27. A customer must not be able to access another customer's purchases by changing an ID or slug in the URL.

---

## 2. Product model and catalogue

### 2.1 Organize by customer goal first

The main navigation should not force customers to understand file extensions. The primary discovery layer is based on what someone wants to do:

| Goal group | Display label | Example resources |
|---|---|---|
| `create` | Create | Figma kits, Canva templates, creative assets and design resources |
| `learn` | Learn | Courses, ebooks, workbooks and practical guides |
| `work_smarter` | Work Smarter | Notion workspaces, AI workflows, prompt packs and productivity kits |
| `build_make` | Build & Make | 3D models, printable designs and project files |

The secondary discovery layer lets customers filter by product format/type:

- PDF / workbook.
- Ebook.
- Course.
- Markdown resource.
- Notion template.
- Design kit (Figma/Canva).
- Prompt pack / AI skill.
- 3D model.
- Bundle.

### 2.2 Search and filters

Catalogue filters should include:

- Goal group/category.
- Product type.
- Skill level: beginner, intermediate, advanced.
- Free or paid.
- Price range.
- Estimated setup time.
- Software or device requirement when practical.

Search and filter state must sync to URL query parameters so users can share a filtered catalogue link. Filters must work on mobile and have a clear reset action. Sorting options: featured, newest and price low-to-high/high-to-low. Do not claim "popular this week" unless the data actually supports that label; use a neutral label such as "Featured resources" when sales data is insufficient.

### 2.3 Product content requirements

Every published product needs, at minimum:

- Title and slug.
- One-sentence plain-English tagline.
- Short description.
- Goal/category and product type.
- Skill level.
- Price or free status.
- Cover and useful preview media.
- Audience / who it is for.
- What it helps the buyer do.
- What is included.
- Requirements and compatibility.
- Estimated setup time.
- First useful result / first win.
- Three to five setup steps.
- Realistic examples or results.
- License type and license explanation.
- Support details and FAQ.
- Delivery file(s) or protected resource link(s).

Do not allow a product to be published if critical required fields or delivery configuration are missing. Add validation messages in plain English.

### 2.4 Product-type-specific information

Render additional sections conditionally based on `product_type`:

**Notion template**
- Workspace screenshots or preview.
- What the template helps organize.
- Duplicate/copy instructions.
- Customization guide.
- Required Notion plan or account, if any.

**Markdown resource / prompt pack**
- Readable sample preview.
- Compatible apps and where to paste/open the file (for example, a text editor, Obsidian, Claude or ChatGPT where relevant).
- Explain when to use each prompt or section.
- Include file type and encoding details when needed.

**3D model**
- Rendered previews and multiple angles.
- Dimensions and units.
- Included file formats (STL/3MF, etc.).
- Printer/software compatibility.
- Material and print settings only when tested or supplied by the creator: layer height, infill, supports, nozzle and assembly steps.
- Never invent settings or promise a model will fit every printer.

**Ebook / PDF / workbook**
- Table of contents.
- Sample pages or chapter.
- Reading level or assumed knowledge.
- Exercises, worksheets or bonus files.
- Page count and file size where known.

**Course**
- Learning outcomes.
- Curriculum/modules/lessons.
- Lesson previews and duration when known.
- Course access method and any external video platform.
- Included worksheets and files.
- This project does not need to build a full video-hosting/LMS system in the first release. A course can be delivered as structured lesson links and resources, or point to a properly access-controlled external course destination. Do not claim that protected video streaming is implemented unless it is.

**Design kit**
- Software required (Figma, Canva, etc.).
- File formats and compatibility.
- Installation/import steps.
- Editable components and example projects.

**Bundle**
- List each included product.
- Explain the combined outcome.
- Show the bundle price and savings only when calculated from real product prices.
- Check that every included product is active and deliverable before publishing the bundle.

### 2.5 Product content source and owner editing

Use MDX files in `content/products/` for detailed, version-controlled product guides and reusable rich content components. Use frontmatter for stable guide metadata and a reusable template at `content/products/_template.mdx`.

At the same time, routine product management should not require the owner to edit code for every price or product listing. Store commercial fields and editable, structured product-page sections in Postgres. A product may reference an MDX guide using `mdx_slug`; DB-backed structured sections should be the owner-editable source for normal product page fields. MDX can provide the longer Start Here guide or advanced content.

If Claude Code finds a practical conflict between MDX-only content and a usable admin content editor, preserve the owner-friendly admin workflow and document the final content split. Do not silently make routine product publishing depend on editing source code.

### 2.6 Product samples for development

Seed six realistic sample products across the supported formats so the UI can be tested. Seed them as **drafts** by default. Do not create fake ratings, testimonials, reviews, sales counts or customer results. Clearly document how the owner reviews and publishes each sample. Do not seed products into production automatically unless an explicit seed flag is set.

---

## 3. Homepage and public website

### 3.1 Homepage `/`

The homepage should feel like a premium editorial storefront, not a generic admin dashboard or crowded marketplace.

Required sections, in this order unless a design reason is documented:

1. Header with wordmark, Explore, goal navigation, Free resources, search, My Library and cart/bag indicator if a cart is implemented.
2. Hero with the headline concept: **Learn something. Create something. Make progress.**
3. Plain-language supporting text about practical digital resources and step-by-step guidance.
4. Search prompt: **What would you like to achieve?**
5. Four goal cards: Create, Learn, Work Smarter, Build & Make.
6. Featured resources, selected from real published products.
7. Free resource strip.
8. "Find the right resource" quiz CTA.
9. Bundles section when bundles exist.
10. Trust section explaining secure checkout, instant access (where applicable), clear instructions and support.
11. Newsletter signup with explicit opt-in.
12. Footer with About, Help, Contact, policies and social links only when real values are configured.

Use a proper empty state when no featured/published items exist. Do not show fake product counts.

### 3.2 Public routes

- `/` — Homepage.
- `/explore` — Searchable catalogue with filters, sorting and pagination.
- `/category/[slug]` — Goal/category landing page.
- `/products/[slug]` — Product detail page.
- `/free` — Published free resources.
- `/find` — Three-step resource finder (phase 5; can be a simple placeholder link earlier, not a fake functioning quiz).
- `/bundles` — Published bundles.
- `/library` — Email entry for magic-link access.
- `/library/[productSlug]` — Authenticated Start Here page with guide and downloads.
- `/checkout/success` — Verified purchase success state. URL params alone must not grant access.
- `/about` — About the owner/store.
- `/help` — Download, install and troubleshooting help.
- `/contact` — Contact form or configured support email.
- `/refund-policy`, `/terms`, `/privacy`, `/license` — Owner-reviewed policy pages.
- `/sitemap.xml` and `/robots.txt`.

### 3.3 Global layout and navigation

- Header is responsive and keyboard accessible.
- Search should be prominent but not overwhelm the hero.
- Goal navigation is understandable without knowing technical file formats.
- Include a visible My Library route so customers can return to purchased items.
- Use a consistent product card design with cover, name, useful one-line result, level, type and price.
- Cards must not invent ratings, discount badges or popularity.

---

## 4. Product detail page — the "Grow With It" page

Every product page is a small, persuasive, educational landing page. The product page is a key differentiator and deserves more attention than a generic checkout page.

### 4.1 Section order

1. **Hero** — cover/gallery, title, plain-language tagline, level badge, product type, price, setup time, and CTA. On mobile, use a sticky purchase bar that does not cover content or accessibility controls.
2. **What this does for you** — explain the benefit without jargon.
3. **Who it's for** — concrete audiences and any prerequisites.
4. **What you'll get** — each file/resource with readable label, format, size and preview where suitable.
5. **Preview** — screenshots, sample pages, a short demo video or live demo when useful. Do not expose paid source files in a public preview.
6. **Your first win in 10 minutes** — a small, realistic task/result.
7. **How to set it up** — three to five numbered steps, ideally with screenshots and optional video.
8. **Results you can work towards** — examples and use cases, clearly distinguished from guaranteed outcomes.
9. **What you need** — apps, accounts, device, cost and compatibility; say "no coding needed" only when true.
10. **Common problems and fixes** — accessible accordion.
11. **Reviews** — only real reviews; show verified-purchase label only when verified.
12. **License and support** — allowed use, restrictions, updates and help route.
13. **Next steps** — related products or a suggested learning path.
14. **FAQ and final CTA**.

### 4.2 CTA and modal

- Paid product button: `Get this`.
- Free product button: `Download free`.
- Clicking the CTA opens a shadcn/ui Dialog.
- Form fields: name, email, optional newsletter checkbox (unchecked by default).
- Validate with Zod on the server and a helpful client-side validation state.
- Include a privacy note; link to the privacy page.
- Disable duplicate submissions and show loading/error states.

### 4.3 Price display and currencies

- Store money as integer minor units (INR paise, USD cents).
- INR is the initial default launch currency.
- USD display/checkout is behind `NEXT_PUBLIC_ENABLE_USD=false` until Razorpay international eligibility and account configuration are confirmed.
- Never convert prices in the browser using a guessed exchange rate.
- If multiple currencies are enabled, store an explicit price for each supported currency. Do not treat a converted display-only amount as a chargeable price.
- Provide a clear currency selector only for currencies that the payment account supports.

### 4.4 Accessibility and plain language

- Use at least 16px body text and strong text contrast.
- Add descriptive alt text to meaningful product images.
- Keep the page scannable with short paragraphs and headings.
- Add an optional **Explain it like I'm new** toggle for short explanations of technical terms. Do not hide critical information behind the toggle.
- Support keyboard navigation, reduced motion and screen-reader labels.

---

## 5. Checkout, payments and fulfilment

### 5.1 Payment-provider interface

Payment-specific code must sit behind an interface similar to:

```ts
interface PaymentProvider {
  createOrder(input: CreateOrderInput): Promise<ProviderOrder>;
  verifyPayment(input: VerifyPaymentInput): Promise<VerifiedPayment>;
  handleWebhook(input: WebhookInput): Promise<WebhookResult>;
}
```

Keep Razorpay in `lib/payments/razorpay.ts`. Store order-provider identifiers and provider names in the database. This is to make a future provider possible; do not implement a second payment provider in the first release.

### 5.2 Order creation

- Accept product ID, customer name/email, selected supported currency and coupon code if enabled.
- Read product status and price from the database.
- Confirm product is published and purchasable.
- Calculate discounts on the server only.
- Reject a client-supplied price or amount; do not accept it as authoritative.
- Validate currency against feature flags and product prices.
- Create Razorpay order server-side and persist local order with `created` status.
- Use an idempotency strategy to avoid accidental duplicate order creation from double-clicks or retries.
- Return only required client-safe details, including Razorpay order ID and public key ID.

### 5.3 Payment verification

- Verify `HMAC_SHA256(order_id + "|" + payment_id, RAZORPAY_KEY_SECRET)` using a timing-safe comparison.
- Validate that the payment belongs to the local order and expected amount/currency.
- Confirm captured/paid state from Razorpay before granting paid access.
- Persist payment ID and signature only if needed for audit; never expose secrets to the browser.
- Handle repeat verification safely.
- A cancelled or failed payment does not grant an entitlement.

### 5.4 Webhooks

Route: `POST /api/webhooks/razorpay`.

- Read the unmodified raw request body for signature verification.
- Verify the `x-razorpay-signature` using `RAZORPAY_WEBHOOK_SECRET`.
- Persist event IDs with a unique constraint before processing or within an idempotent transaction.
- Deduplicate repeated events.
- Handle at least `payment.captured`, `order.paid`, `payment.failed` and `refund.processed` where supported by the Razorpay integration.
- Webhook processing must be safe if the same event arrives more than once or arrives after the browser verification call.
- Do not trust an event unless its signature is valid.
- Log useful operational details without logging secrets, full card information or unnecessary personal data.

### 5.5 Entitlement rules

- An entitlement means a customer has access to a product.
- Grant paid entitlements only after a confirmed captured/paid order.
- Grant free entitlements only through the free-claim endpoint after lead capture.
- Use a database transaction and uniqueness constraints so webhook + browser verify cannot duplicate access.
- Revoked entitlements cannot download files.
- If a bundle is purchased, grant access to the bundle and each included product (or use a clearly documented equivalent that gives the buyer access to every included item).
- A refund should revoke entitlements only after the refund is confirmed. Do not revoke based on a manual unverified UI flag.

### 5.6 Razorpay configuration and business eligibility

- Use Razorpay test mode during development and QA.
- Keep international/USD checkout disabled by default.
- International card payments can depend on account eligibility, KYC and business status. The owner must confirm eligibility with Razorpay before enabling it.
- Do not claim that all global cards/currencies work until verified on the actual merchant account.
- Keep the provider interface so the owner can add another provider later if needed.
- The owner must confirm whether they sell as an individual or a registered business, and whether GST/invoicing obligations apply. Do not give legal or tax conclusions in code comments or UI.

---

## 6. Secure file delivery and storage

### 6.1 Cloudflare R2

- Product download files live in a private R2 bucket.
- Use an S3-compatible SDK on the server.
- Product cover images and public preview assets may be stored under `/public` or a separate public asset bucket/CDN.
- Never put paid originals in `/public` or a publicly readable bucket.
- Use R2 object keys in the database; never reveal secret credentials to the client.

### 6.2 Download endpoint

Route: `GET /api/download/[fileId]` (or an equivalent route with a signed token/session design documented).

Before issuing a redirect to a presigned URL:

1. Authenticate the buyer (magic-link session or a short-lived access token created after a verified purchase/free claim).
2. Check that the buyer has an active entitlement for the product associated with the file.
3. Check that the entitlement is not revoked.
4. Check and atomically increment the download count only when under the limit.
5. Log the download with file ID, entitlement ID, timestamp and privacy-safe abuse signals.
6. Generate a short-lived R2 presigned GET URL (target expiry: approximately 60 seconds).
7. Redirect to the URL. Never return a permanent public URL.

Default download limit: 10 successful downloads per entitlement, configurable by product or entitlement. Provide a clear support path if a customer reaches the limit legitimately.

### 6.3 Protected external links

Notion templates and hosted course links may use external URLs instead of file objects. Store these as protected delivery resources. Do not place private duplicate links in public page JSON or HTML. Reveal the link only from an authenticated Start Here page after entitlement checks. Be clear that once an external template link is revealed, the external provider may have its own sharing controls.

### 6.4 Admin uploads

- Admin requests a presigned PUT upload URL from the server.
- Validate allowed file type, file size and intended product.
- Upload directly to private R2 without exposing R2 credentials.
- Save object key and metadata only after confirming upload completion.
- Show upload progress, success and retry errors.
- Product file labels should be human-readable (for example, "Setup guide PDF") rather than only showing a raw object key.

---

## 7. My Library and authentication

### 7.1 Buyer magic-link login

- `/library` asks for email.
- Generate a cryptographically random token with a 15-minute expiry.
- Store only the token hash in `magic_tokens`.
- Send the link through Resend.
- On use, compare the token hash, check expiry and `used_at`, mark it used, then create a signed session cookie.
- Do not allow replay.
- Rate limit requests by email and privacy-safe IP hash.
- Avoid revealing whether an email has an account; use a generic success message.

### 7.2 Customer library

- Show product cover, title, purchased/access date, latest version and a `Start here` action.
- Start Here shows the getting-started guide, protected file list, external resources and product update notes.
- Show download counts or remaining downloads only if this can be accurately calculated.
- If an entitlement is revoked/refunded, show a clear access state and support instruction rather than exposing the file.

### 7.3 Admin auth

- Single owner only.
- `ADMIN_EMAIL` and `ADMIN_PASSWORD_HASH` configured on the server.
- Use a secure password hash (for example Argon2 or bcrypt) and a signed session cookie using `jose` or a similarly maintained library.
- Cookie: httpOnly, secure in production, sameSite=lax, appropriate expiry and path.
- No public admin registration or password reset flow unless explicitly requested later.
- Protect `/admin` in middleware and check the session again in every admin API route/action.
- Add login rate limits and generic auth errors.
- Do not create a hard-coded default password.

---

## 8. Admin dashboard

The owner should be able to manage the store without editing database rows manually.

### 8.1 Admin routes

- `/admin/login` — owner login.
- `/admin` — dashboard.
- `/admin/products` — product list, filter by status/type, search.
- `/admin/products/new` — create product.
- `/admin/products/[id]` — edit product, preview and publish/archive.
- `/admin/orders` — orders list.
- `/admin/orders/[id]` — order details and resend receipt/access email.
- `/admin/customers` — customer list.
- `/admin/leads` — leads list and CSV export.
- `/admin/coupons` — create/deactivate coupons.
- `/admin/reviews` — moderate reviews.
- `/admin/updates` — publish product updates and notify eligible buyers.

### 8.2 Dashboard metrics

Show real metrics only:

- Gross paid order revenue (clearly label whether before fees/refunds/tax).
- Paid orders.
- New leads.
- Top products by actual sales.
- Downloads.
- Recent orders.

If there is no data, show an empty state instead of fabricated charts or totals. Do not display a metric as net revenue unless gateway fees, refunds and applicable tax have actually been included.

### 8.3 Product CRUD fields

- Product title, slug, tagline and description.
- Goal/category and product type.
- Skill level.
- Price in supported currencies or free toggle.
- Cover/gallery/preview video.
- Setup time and requirements.
- License type and license text.
- Structured page sections (audience, benefits, what is included, first win, setup steps, expected results, FAQs, next steps).
- Product file uploads and protected external resources.
- MDX guide slug.
- Version and update notes.
- SEO title/description.
- Draft/published/archived state.
- Featured flag.

The admin must preview a product page before publishing. Validate required fields and at least one configured delivery item before allowing publish.

### 8.4 Orders and refunds

- Orders list filters: status, date, product, email.
- Order detail shows customer, line items, amount/currency, payment IDs, status history and entitlement status.
- Allow resend of receipt/access email.
- A manual refund note/flag must not pretend to issue a Razorpay refund. If refund APIs are later added, call Razorpay server-side and wait for confirmation/webhook before changing entitlement state.

### 8.5 Leads and marketing permissions

- Export leads as CSV.
- Show source and explicit marketing opt-in status.
- Do not export or use non-opted-in leads as a newsletter audience.
- Provide a way to honor unsubscribe requests.
- Restrict admin data access to the owner.

---

## 9. Database design (Drizzle / Neon Postgres)

Use UUID primary keys for core entities. Use `created_at` and `updated_at` timestamps consistently. Store money as integer minor units plus ISO currency code. Normalize customer email to lowercase.

The exact Drizzle table implementation may include helper enums and join tables, but it must preserve these concepts and constraints.

### 9.1 `categories`

- `id` UUID primary key.
- `slug` unique.
- `name`.
- `goal_group`: `create | learn | work_smarter | build_make`.
- `description`.
- `icon` (lucide icon name or safe key).
- `sort_order`.
- `created_at`, `updated_at`.

### 9.2 `products`

- `id` UUID primary key.
- `slug` unique.
- `title`.
- `tagline` (plain-English one-sentence outcome).
- `short_description`.
- `product_type`: `pdf | ebook | course | markdown | notion | design_kit | prompt_pack | model_3d | bundle`.
- `category_id` foreign key.
- `level`: `beginner | intermediate | advanced`.
- `price_inr` integer paise, nullable only when free or unavailable by policy.
- `price_usd` integer cents, nullable until enabled and configured.
- `is_free` boolean.
- `status`: `draft | published | archived`.
- `cover_image`.
- `gallery` JSONB.
- `preview_video_url` nullable.
- `setup_time_minutes`.
- `requirements` JSONB.
- `content_json` JSONB for owner-editable structured sections.
- `license_type`: `personal | commercial | team`.
- `license_text`.
- `version`.
- `featured` boolean.
- `mdx_slug` nullable, references `content/products/*.mdx` guide.
- `seo_title`, `seo_description`.
- `sales_count` (maintained from real paid order fulfilment, not manually fabricated).
- `created_at`, `updated_at`.

Add database checks for valid prices and product states where practical. `is_free` must not create an accidental zero-value paid order. A free product must be clearly marked and have no paid checkout path.

### 9.3 `product_files`

- `id` UUID primary key.
- `product_id` foreign key.
- `label`.
- `delivery_type`: `file | external_link | lesson_resource`.
- `file_key` nullable (R2 object key).
- `external_url` nullable (only exposed after entitlement check).
- `file_name`.
- `size_bytes` nullable.
- `mime_type` nullable.
- `is_preview` boolean (only true if the resource is intentionally public).
- `sort_order`.
- `version`.
- `created_at`, `updated_at`.

Ensure a delivery row has the correct object key or external link for its type. Public previews must not reveal private source files.

### 9.4 `product_updates`

- `id` UUID primary key.
- `product_id` foreign key.
- `version`.
- `notes`.
- `created_at`.
- `created_by` (owner/admin identifier if useful).

### 9.5 `bundle_items`

- `bundle_id` product ID where `product_type = bundle`.
- `product_id` included product ID.
- Composite primary key or unique constraint.
- Prevent a bundle from containing itself or a recursive bundle structure in the first version.

### 9.6 `leads`

- `id` UUID primary key.
- `name`.
- `email` (normalized lowercase).
- `product_id` nullable.
- `source`: `product_page | newsletter | free_download`.
- `marketing_opt_in` boolean, default false.
- `consent_at` nullable.
- `ip_hash` nullable.
- `created_at`.

A lead may exist without a paid order. Do not infer consent from a product purchase.

### 9.7 `customers`

- `id` UUID primary key.
- `name`.
- `email` unique and normalized lowercase.
- `created_at`, `updated_at`.

### 9.8 `orders`

- `id` UUID primary key.
- `customer_id` foreign key.
- `amount` integer minor units.
- `currency` ISO code.
- `status`: `created | paid | failed | refunded` (extend with a separate status history table if needed).
- `provider` (initially `razorpay`).
- `razorpay_order_id` unique nullable until created by provider.
- `razorpay_payment_id` nullable.
- `razorpay_signature` nullable; protect as sensitive operational data and never return to client.
- `coupon_id` nullable.
- `idempotency_key` unique where available.
- `created_at`, `paid_at`, `updated_at`.

### 9.9 `order_items`

Add this join table so a single order can contain a product or bundle and the design can support bundles cleanly:

- `id` UUID primary key.
- `order_id` foreign key.
- `product_id` foreign key.
- `unit_amount` integer minor units.
- `currency`.
- `quantity` default 1.
- Unique order/product pair where appropriate.

For the initial version, checkout may purchase one product at a time. Keep the schema ready for bundle order fulfilment.

### 9.10 `entitlements`

- `id` UUID primary key.
- `customer_id` foreign key.
- `product_id` foreign key.
- `order_id` nullable (null for free claims).
- `granted_at`.
- `revoked_at` nullable.
- `download_count` default 0.
- `download_limit` default 10.
- Unique rule to prevent duplicate active access for the same customer/product. Document how re-purchase and a refunded/re-purchased product are handled.

### 9.11 `download_logs`

- `id` UUID primary key.
- `entitlement_id` foreign key.
- `file_id` foreign key.
- `ip_hash` nullable.
- `user_agent` nullable or safely truncated.
- `created_at`.

### 9.12 `webhook_events`

- `id` UUID primary key.
- `provider`.
- `event_id` unique within provider.
- `type`.
- `payload` JSONB with sensitive fields minimized.
- `processed_at` nullable.
- `created_at`.

### 9.13 `coupons`

- `id` UUID primary key.
- `code` unique, normalized uppercase.
- `discount_type`: `percent | fixed`.
- `percent_off` nullable.
- `amount_off` nullable in minor units.
- `currency` nullable/required for fixed discount.
- `max_uses` nullable.
- `used_count` default 0.
- `expires_at` nullable.
- `active` boolean.
- `created_at`, `updated_at`.

Validate that a coupon cannot discount below zero or be applied in the wrong currency. Coupon redemption should be recorded transactionally to prevent overuse.

### 9.14 `reviews`

- `id` UUID primary key.
- `product_id` foreign key.
- `customer_id` foreign key.
- `rating` integer 1–5.
- `title`.
- `body`.
- `use_case` nullable.
- `verified_purchase` boolean set by server logic, never by client.
- `status`: `pending | approved | rejected`.
- `created_at`, `updated_at`.

Only customers with a valid entitlement can submit verified reviews. Escape/sanitize user text and require owner moderation before public display.

### 9.15 `magic_tokens`

- `id` UUID primary key.
- `email` normalized lowercase.
- `token_hash` unique.
- `expires_at`.
- `used_at` nullable.
- `created_at`.

### 9.16 Optional `admin_audit_logs`

Record important owner operations such as product publish/archive, price change, coupon creation, manual email resend and review moderation. Do not record passwords, secrets or complete payment card details.

### 9.17 Indexes and migrations

Add indexes for:

- `products(slug, status)`.
- `products(category_id, status)`.
- `orders(razorpay_order_id)` and `orders(customer_id, created_at)`.
- `customers(email)`.
- `entitlements(customer_id, product_id)`.
- `product_files(product_id, sort_order)`.
- `leads(email, created_at)`.
- `webhook_events(provider, event_id)`.
- `magic_tokens(token_hash, expires_at)`.

Provide scripts:

- `db:generate`.
- `db:migrate`.
- `db:seed`.
- `db:studio` if supported by the chosen Drizzle setup.

Use migrations, not runtime auto-push, in production. Explain the Neon pooled vs direct connection string choice in README.

---

## 10. API routes and server actions

All API inputs must be validated with Zod. Return predictable typed JSON errors; do not leak stack traces or secret values.

### 10.1 Public routes

**`POST /api/leads`**
- Body: name, email, productId optional, source, marketingOptIn.
- Normalize and validate name/email.
- Save lead; marketing consent remains false unless explicitly checked.
- Rate limit and add honeypot or optional Turnstile protection.

**`POST /api/orders`**
- Body: productId, name, email, currency, optional coupon, idempotency key.
- Read product price from DB; ignore/reject client price fields.
- Ensure product is published and paid.
- Create Razorpay order and local order row.
- Return only order ID, amount, currency and public Razorpay key ID.

**`POST /api/payments/verify`**
- Body: Razorpay order ID, payment ID and signature.
- Validate local order match, signature and payment captured/paid status.
- Idempotently mark paid and grant entitlements only after confirmation.

**`POST /api/webhooks/razorpay`**
- Raw body and signature verification.
- Event deduplication and idempotent fulfilment.

**`POST /api/free-claim`**
- Body: productId, name, email.
- Confirm published free product.
- Create/find customer and grant entitlement idempotently.

**`POST /api/auth/magic-link`**
- Body: email.
- Always return a generic success response to reduce account enumeration.
- Rate limit, create single-use 15-minute token and send email.

**`GET /api/download/[fileId]`**
- Authenticate buyer, check entitlement/file association/revocation/limit, log, then redirect to a presigned R2 URL.

### 10.2 Admin routes

All under `/api/admin/*` (or equivalent server actions), with server-side session checks on every mutation and read containing private data.

Required operations:

- Product create/update/archive/publish.
- Create presigned R2 upload, confirm upload and remove/replace file metadata.
- Order list/detail and resend email.
- Customer and leads list/export.
- Coupon CRUD.
- Review moderation.
- Product version/update publishing and buyer notification.

Never rely on middleware alone to protect admin APIs.

### 10.3 Error handling

Use consistent error codes, such as:

- `VALIDATION_ERROR`.
- `PRODUCT_NOT_FOUND`.
- `PRODUCT_NOT_PURCHASABLE`.
- `PAYMENT_NOT_VERIFIED`.
- `PAYMENT_ALREADY_PROCESSED`.
- `ENTITLEMENT_REQUIRED`.
- `DOWNLOAD_LIMIT_REACHED`.
- `RATE_LIMITED`.
- `UNAUTHORIZED`.

User-facing copy should be simple and helpful. Detailed diagnostic information belongs in server logs, with secrets and personal data removed.

---

## 11. Email notifications (Resend + React Email)

Required transactional templates:

1. **Purchase receipt** — product/order summary, confirmation, Start Here/My Library button and support contact.
2. **Free download** — confirmation and secure way to access the free product.
3. **Magic link** — one-time sign-in link with 15-minute expiry notice.
4. **Product update** — what changed and how to access the new version.
5. **Optional newsletter/marketing email** — only to opted-in recipients, with unsubscribe mechanism.

Email design:

- Plain, friendly, mobile-friendly.
- Clear sender name.
- Do not put private permanent file URLs in email.
- Use secure account/library links.
- Include support email once configured.
- Do not send marketing mail to every lead by default.

---

## 12. Design system and UI quality

### 12.1 Visual direction

Premium editorial storefront: a balance between a modern magazine, a creative marketplace and a learning platform.

- Light, bright and calm.
- Generous whitespace.
- Large, consistent product covers (4:3 or 1:1 depending on the product-card composition).
- Distinctive display type such as Instrument Serif or Fraunces for large headlines, paired with Geist/Inter for readable body copy. Use a properly licensed web font or a system fallback.
- One strong accent colour plus neutral background/surface/text colours. Final accent colour remains a brand decision.
- Rounded cards, restrained shadows and subtle hover lift.
- No heavy skeuomorphism or excessive glassmorphism.
- Avoid constant animation; respect `prefers-reduced-motion`.

### 12.2 Mobile-first checkout

- Product detail must work on narrow screens.
- Keep the primary CTA easy to find; a sticky mobile bar may be used.
- Name/email modal must fit small screens and have a visible close action.
- Razorpay Checkout should launch correctly on mobile, with UPI enabled where available.
- Use large tap targets (approximately 44px or larger).
- Ensure modal scroll does not trap users or hide the submit action.

### 12.3 Reusable components

At minimum, create reusable components for:

- `Navbar` and goal menu.
- `Footer`.
- `ProductCard`, `ProductGrid`.
- `FilterBar` and search input.
- `GoalCard`.
- `LevelBadge` and product-type label.
- `PriceTag`.
- `DownloadModal` / buyer-details dialog.
- `StepList` / step cards.
- `FaqAccordion`.
- `ReviewList`.
- `StickyBuyBar`.
- `Toast`/notification system.
- `EmptyState`, skeleton and error states.
- `ProductPreviewGallery`.
- `StartHereChecklist`.

Use shadcn/ui components where appropriate; customize them to fit the store rather than leaving the default shadcn look untouched.

### 12.4 Accessibility

- Semantic elements and headings in the correct order.
- Keyboard navigation for menus, dialogs, accordions and filters.
- Visible focus indicators.
- Accessible labels and error text.
- Descriptive alt text.
- WCAG AA contrast target.
- Reduced-motion support.
- Captions/transcripts for demo videos where available.
- Do not use colour alone to communicate status.

### 12.5 State design

Every route with asynchronous data needs:

- Loading state.
- Empty state.
- Error state with retry where appropriate.
- Success state.

Do not use lorem ipsum on a user-facing screen. Use realistic, clearly marked sample copy.

---

## 13. Security and privacy — non-negotiable

- Price, currency, coupon discount and entitlement are computed/verified on the server.
- Verify Razorpay payment signature and webhook signature; use timing-safe comparisons.
- Webhook events are idempotent and deduplicated.
- Do not grant paid access before payment is captured/paid.
- Paid files are private; downloads require entitlement and short-lived presigned URLs.
- Enforce download limits atomically.
- Rate limit public POST endpoints: lead, order, free claim, magic link, download and admin login.
- Add honeypot field or Cloudflare Turnstile to public forms; Turnstile may be enabled when credentials are configured.
- Escape and sanitize user-generated review content.
- Normalize and validate emails.
- Store only hashed IP information for abuse detection where possible.
- Never log secrets, full payment data or unnecessary personal data.
- Add security headers in Next.js configuration (CSP appropriate for Razorpay Checkout, `X-Content-Type-Options`, `Referrer-Policy`, frame protections and other suitable headers). Do not break Razorpay's hosted checkout.
- Admin UI and APIs require owner session checks.
- Use CSRF/origin protections appropriate to cookie-authenticated mutations.
- Do not store card data; Razorpay handles payment details.
- Use secure, httpOnly, sameSite cookies.
- Protect against open redirects in magic-link and success-page return URLs.
- Use parameterized queries/Drizzle; do not concatenate untrusted SQL.
- Review dependencies and avoid abandoned packages.
- Add a privacy/retention note for leads, customer data, logs and tokens.

---

## 14. SEO, performance and analytics

- Dynamic title and description metadata for every product and category.
- Open Graph metadata/images for product pages.
- JSON-LD Product schema with accurate price, currency and availability where appropriate.
- `sitemap.xml` and `robots.txt`.
- Canonical URLs and clean slugs.
- Use `next/image` for optimized imagery.
- Use server rendering/ISR/revalidation for public catalogue/product content where appropriate; revalidate after product updates.
- Avoid shipping large client-side bundles for static product content.
- Aim for Lighthouse 90+ on mobile for core public pages, while documenting any third-party checkout or analytics impact.
- Vercel Analytics can be enabled. Do not send personal name/email/payment identifiers into analytics events.
- Track useful funnel events without sensitive values: product view, CTA clicked, lead form submitted, checkout started, purchase confirmed, download started.

---

## 15. Required environment variables

Create `.env.example` and maintain it when configuration changes. Initial variables:

```dotenv
NEXT_PUBLIC_SITE_URL=http://localhost:3000
DATABASE_URL=
DATABASE_URL_UNPOOLED=
RAZORPAY_KEY_ID=
NEXT_PUBLIC_RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=
NEXT_PUBLIC_ENABLE_USD=false
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_PRIVATE=
R2_PUBLIC_BASE_URL=
RESEND_API_KEY=
EMAIL_FROM=
SUPPORT_EMAIL=
SESSION_SECRET=
ADMIN_EMAIL=
ADMIN_PASSWORD_HASH=
MAGIC_LINK_SECRET=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
NEXT_PUBLIC_TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=
SEED_SAMPLE_PRODUCTS=false
```

Document where each value comes from and which ones are required locally vs production. Never commit real secrets. Never expose secret keys through `NEXT_PUBLIC_` variables.

---

## 16. Suggested folder structure

Claude Code may adjust naming to match the current Next.js conventions, but keep clear separation of concerns.

```text
/app
  /(site)
    page.tsx
    explore/
    category/[slug]/
    products/[slug]/
    free/
    find/
    bundles/
    library/
    library/[productSlug]/
    checkout/success/
    about/
    help/
    contact/
    refund-policy/
    terms/
    privacy/
    license/
  /admin
    login/
    products/
    orders/
    customers/
    leads/
    coupons/
    reviews/
    updates/
  /api
    leads/
    orders/
    payments/verify/
    webhooks/razorpay/
    free-claim/
    auth/magic-link/
    download/[fileId]/
    admin/...
/components
  /ui
  /layout
  /product
  /checkout
  /library
  /admin
/content
  /products/*.mdx
/db
  schema.ts
  index.ts
  seed.ts
  /migrations
/lib
  /payments
    provider.ts
    razorpay.ts
  /storage
    r2.ts
  /email
  /auth
  /rate-limit.ts
  /money.ts
  /validators.ts
  /security
/emails
/docs
/public
.env.example
CLAUDE.md
PROJECT_SPEC.md
BUILD_PLAN.md
README.md
```

---

## 17. Development phases

Build one phase at a time. After each phase, run the app, fix errors and report how the owner can test the result. See `BUILD_PLAN.md` for exact phase gates.

### Phase 0 — Foundation and setup

- Scaffold Next.js + TypeScript + Tailwind + shadcn/ui.
- Configure linting, formatting, strict TypeScript and test scripts.
- Create folder structure and application shell.
- Add `.env.example` and beginner-friendly README.
- Add brand configuration, global styles, navigation/footer shell and responsive layouts.
- Add placeholder service adapters only where needed; do not fake working checkout/storage.

### Phase 1 — Database and catalogue

- Drizzle schema, migrations and seed data.
- Home, Explore, Category and Product pages reading published products from Neon.
- MDX guide loading and structured content blocks.
- Search, filters, URL state, sorting and pagination.
- Full product page layout and design system.

### Phase 2 — Lead capture, free products and delivery

- Name/email modal and lead API.
- Free claim and entitlement flow.
- R2 private upload and presigned download.
- Buyer magic-link sign-in and My Library.
- Start Here page.
- Resend transactional emails.
- Rate limiting and access checks.

### Phase 3 — Razorpay checkout

- Payment provider interface and Razorpay implementation.
- Server-side orders, Checkout.js, verify endpoint and webhook.
- Idempotent order fulfilment and entitlements.
- Receipt email, success/failure/retry pages and coupons if in scope.
- Thorough test-mode verification, including invalid signature and repeated webhook.
- Keep live mode disabled until owner approval.

### Phase 4 — Owner admin

- Owner login/session.
- Dashboard with real metrics.
- Product CRUD, cover/gallery and R2 file upload.
- Product preview/publish/archive.
- Orders, customers, leads CSV export.
- Coupons, review moderation and product updates.

### Phase 5 — Polish and launch

- Verified reviews.
- Bundles and product recommendations.
- Find-the-right-resource quiz.
- SEO, accessibility, responsive and performance audit.
- Help centre and owner-reviewed legal pages.
- Monitoring and operational error handling.
- Razorpay live-mode checklist and custom domain.

### Later, only after the store has traction

- Additional payment provider for international customers.
- More currencies/languages.
- Affiliate programme.
- Pay-what-you-want pricing.
- Membership/subscription only if there is recurring value.
- Multi-vendor marketplace only as a separate, explicitly approved project.

---

## 18. Definition of done for every phase

A phase is not done until:

- `npm run build` passes.
- `npm run lint` passes.
- `npm run typecheck` passes if configured separately.
- Relevant unit/integration tests pass.
- No secrets are committed.
- No fake working flows or misleading UI remain.
- The owner can run the app using documented exact commands.
- The owner receives a short, plain-English test checklist.
- Changes are committed with a clear message.
- A branch is pushed to GitHub if remote access is configured; Vercel preview should then be available. Do not claim this happened unless it was performed successfully.

If an integration cannot be tested because credentials are missing, report it as **not yet verified**, explain the missing value and keep the test in the checklist.

---

## 19. Open owner decisions — do not invent answers

The app foundation can be built without resolving all of these. Before Phase 3 live payments and before public launch, ask the owner to confirm:

1. **Business status:** selling as an individual or through a registered business? This affects Razorpay international eligibility, invoicing and tax setup.
2. **Brand:** final name, domain, logo and accent colour.
3. **Launch currency:** INR only first, or INR plus USD after Razorpay approval? Default is INR only; USD flag remains false.
4. **Refund policy:** owner-approved wording for digital products and failed/broken downloads. Do not assume "no refunds" without the owner's decision and applicable legal review.
5. **Support:** actual support email and sender domain.
6. **Product catalogue:** which six or more real products will be published first, their actual prices, files, licenses and images.
7. **International payment plan:** confirm Razorpay account eligibility and whether a second provider is needed. Keep payment adapter swappable.
8. **Legal/tax pages:** owner-reviewed Terms, Privacy, Refund, License and any GST/invoice requirements.

---

## 20. Product and conversion principles

These are product principles, not promises of conversion:

- Design earns attention, useful product positioning creates interest, previews build trust and a clear checkout completes the purchase.
- Show real screenshots, sample pages and honest previews whenever possible.
- Explain how to use the product, not just what files are inside.
- Include a simple "first win" so buyers can get value quickly.
- Offer free starter resources as a discovery path, but only send marketing email after explicit opt-in.
- Bundles should solve a connected problem, not just collect unrelated files.
- Product updates should be versioned and sent to entitled customers.
- Show verified reviews only; do not fabricate social proof.
- A good website is necessary but not sufficient. Track the actual funnel and improve based on real customer behavior.

**The finished product should feel like a helpful guide and a premium digital store—not a folder of downloads with a payment button.**
