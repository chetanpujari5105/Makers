# Fieldkit — Acceptance Test Checklist

Use this checklist throughout development. Claude Code should automate these checks where practical and tell the owner which ones require manual dashboard setup.

## A. Public storefront

- [ ] Home page loads at desktop and mobile widths.
- [ ] Header navigation works with mouse, touch and keyboard.
- [ ] Goal cards link to the correct category pages.
- [ ] Explore search works for product title and description.
- [ ] Goal, type, level, free/paid, price and setup-time filters can be combined.
- [ ] Filters update URL parameters and survive refresh/back navigation.
- [ ] Pagination and sorting work.
- [ ] Draft and archived products are not visible to public visitors.
- [ ] Product detail pages show full information before asking for name/email.
- [ ] Product-specific content blocks appear only when relevant.
- [ ] Public pages do not expose R2 private object keys, secret links or private file URLs.
- [ ] Missing images and empty catalogue states look intentional.

## B. Lead capture

- [ ] Paid and free CTA opens the name/email modal.
- [ ] Name and email are required and validated.
- [ ] Email is normalized to lowercase.
- [ ] Invalid email shows a plain-language error.
- [ ] Marketing checkbox is unchecked by default.
- [ ] Submitting without marketing opt-in stores `marketing_opt_in = false`.
- [ ] Submitting with explicit opt-in stores consent information.
- [ ] Lead is saved before payment begins.
- [ ] Closing or failing checkout does not delete the lead.
- [ ] Duplicate clicks do not create uncontrolled duplicate leads/orders.
- [ ] Rate limiting/honeypot works.

## C. Free products

- [ ] Free products do not open Razorpay Checkout.
- [ ] Free claim creates/finds customer and grants entitlement.
- [ ] Repeated claim does not duplicate entitlements.
- [ ] Customer sees Start Here and download access.
- [ ] Free email arrives with a secure access/library link.
- [ ] A free claim cannot be made for a paid or unpublished product.

## D. Paid checkout and Razorpay test mode

- [ ] Server creates Razorpay order using current DB price.
- [ ] Altering the price in browser requests does not change the order amount.
- [ ] Unsupported currency is rejected.
- [ ] Checkout opens with correct amount, currency, product and buyer details.
- [ ] Successful test payment verifies server-side.
- [ ] Invalid or tampered payment signature is rejected.
- [ ] Failed or cancelled payment does not grant access.
- [ ] A payment that is not captured/paid does not grant access.
- [ ] Duplicate verification is idempotent.
- [ ] Duplicate webhook event is ignored safely.
- [ ] Webhook signature mismatch is rejected.
- [ ] Webhook raw-body signature verification works.
- [ ] Browser verification and webhook may arrive in either order.
- [ ] Exactly one entitlement is created for the paid product.
- [ ] Success URL without verified payment cannot expose files.
- [ ] Receipt email is sent after fulfilment.
- [ ] Live Razorpay keys are not required for local automated tests.

## E. Secure downloads

- [ ] Paid product original files are in private storage (Backblaze B2 now; "R2" in this file means that bucket).
- [ ] Direct access to the R2 object without a signed URL is denied.
- [ ] Non-entitled buyer cannot download by guessing a file ID.
- [ ] Entitled buyer can download the correct file.
- [ ] Revoked entitlement blocks download.
- [ ] Download limit is enforced atomically under repeated/concurrent requests.
- [ ] Presigned URL expires quickly (target approximately 60 seconds).
- [ ] Download log records entitlement/file/time without unnecessary personal data.
- [ ] Protected Notion/course links are hidden until entitlement is verified.

## F. My Library and magic links

- [ ] Library form accepts email and gives a generic success message.
- [ ] Magic link email is sent.
- [ ] Magic token is stored as a hash, not plaintext.
- [ ] Token expires after 15 minutes.
- [ ] Token can be used only once.
- [ ] Altered, expired or replayed token is rejected.
- [ ] User can see only their own entitlements.
- [ ] Customer can reopen Start Here page after signing in again.
- [ ] Product update/version information is accurate.

## G. Admin security and management

- [ ] No public seller or admin registration exists.
- [ ] Unauthenticated user cannot load admin pages.
- [ ] Unauthenticated user cannot call admin APIs.
- [ ] Admin login rate limit works.
- [ ] Owner can create/edit/archive/publish products.
- [ ] Cannot publish a product missing required delivery information.
- [ ] Owner can upload private files to R2.
- [ ] Owner can preview product page before publishing.
- [ ] Owner can change prices; storefront reflects DB value.
- [ ] Owner can inspect order and customer details.
- [ ] Resending an email does not create a payment or new order.
- [ ] Leads CSV includes source and marketing opt-in status.
- [ ] Non-opted-in leads are not automatically subscribed.
- [ ] Reviews are moderated and verified status is server-controlled.
- [ ] Dashboard metrics are based on real records, not sample claims.

## H. UI, accessibility and SEO

- [ ] Product and checkout flows work at common mobile widths.
- [ ] Buttons and inputs have accessible labels.
- [ ] Dialogs and accordions work by keyboard.
- [ ] Focus is visible and focus returns appropriately after closing modal.
- [ ] Reduced-motion preference is respected.
- [ ] Body text is comfortable to read and contrast is sufficient.
- [ ] Images have useful alt text.
- [ ] Pages have title and description metadata.
- [ ] Product OG metadata is accurate.
- [ ] Sitemap does not include draft products, admin or private library pages.
- [ ] Product JSON-LD price/currency matches the real product data.

## I. Deployment and operations

- [ ] GitHub `main` deploys to Vercel production.
- [ ] Pull request produces Vercel preview deployment.
- [ ] Preview environment does not use production payment secrets or production storage.
- [ ] Neon production and preview environments are separated appropriately.
- [ ] Migrations run from a documented command, not automatically on every request.
- [ ] Resend sender domain is configured and verified.
- [ ] Razorpay test webhook points to the correct environment route.
- [ ] Error logs do not include secrets, card data or unnecessary personal data.
- [ ] Backup/restore and incident steps are documented.
- [ ] Legal, refund, privacy and license pages have been reviewed by the owner before public launch.
- [ ] Razorpay live mode and international currency are enabled only after owner approval and account eligibility confirmation.

## Minimum release gate

Do not call the store ready for paid public launch until sections A, B, D, E, F, G, H and I have been tested. If a credential or external account is missing, label that check **not verified** rather than marking it complete.
