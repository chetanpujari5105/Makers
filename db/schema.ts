import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

/*
 * Database schema — PROJECT_SPEC.md §9.
 * Money is always an integer in minor units (paise / cents), never a float.
 * Emails and coupon codes are normalised, and the database refuses anything
 * that isn't (CHECK constraints), so a missed normalisation can't slip through.
 */

// ---------- Enums ----------
export const goalGroup = pgEnum("goal_group", ["create", "learn", "work_smarter", "build_make"]);
export const productType = pgEnum("product_type", [
  "pdf",
  "ebook",
  "course",
  "markdown",
  "notion",
  "design_kit",
  "prompt_pack",
  "model_3d",
  "bundle",
]);
export const productLevel = pgEnum("product_level", ["beginner", "intermediate", "advanced"]);
export const productStatus = pgEnum("product_status", ["draft", "published", "archived"]);
export const licenseType = pgEnum("license_type", ["personal", "commercial", "team"]);
export const deliveryType = pgEnum("delivery_type", ["file", "external_link", "lesson_resource"]);
export const leadSource = pgEnum("lead_source", ["product_page", "newsletter", "free_download"]);
export const orderStatus = pgEnum("order_status", ["created", "paid", "failed", "refunded"]);
export const discountType = pgEnum("discount_type", ["percent", "fixed"]);
export const reviewStatus = pgEnum("review_status", ["pending", "approved", "rejected"]);

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
};
const id = uuid("id").primaryKey().defaultRandom();

// ---------- Catalogue ----------
export const categories = pgTable("categories", {
  id,
  slug: varchar("slug", { length: 80 }).notNull().unique(),
  name: text("name").notNull(),
  goalGroup: goalGroup("goal_group").notNull(),
  description: text("description").notNull(),
  icon: varchar("icon", { length: 40 }),
  sortOrder: integer("sort_order").notNull().default(0),
  ...timestamps,
});

export const products = pgTable(
  "products",
  {
    id,
    slug: varchar("slug", { length: 120 }).notNull().unique(),
    title: text("title").notNull(),
    tagline: text("tagline").notNull(),
    shortDescription: text("short_description").notNull(),
    productType: productType("product_type").notNull(),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "restrict" }),
    level: productLevel("level").notNull(),
    priceInr: integer("price_inr"),
    priceUsd: integer("price_usd"),
    isFree: boolean("is_free").notNull().default(false),
    status: productStatus("status").notNull().default("draft"),
    /** Marks seeded sample content that the owner must review before real use. */
    isSample: boolean("is_sample").notNull().default(false),
    coverImage: text("cover_image"),
    gallery: jsonb("gallery").notNull().default([]),
    previewVideoUrl: text("preview_video_url"),
    setupTimeMinutes: integer("setup_time_minutes"),
    requirements: jsonb("requirements").notNull().default([]),
    contentJson: jsonb("content_json").notNull().default({}),
    licenseType: licenseType("license_type").notNull().default("personal"),
    licenseText: text("license_text"),
    version: varchar("version", { length: 40 }).notNull().default("1.0"),
    featured: boolean("featured").notNull().default(false),
    mdxSlug: varchar("mdx_slug", { length: 120 }),
    seoTitle: text("seo_title"),
    seoDescription: text("seo_description"),
    /** Maintained only by real paid-order fulfilment (Phase 3). Never set by hand. */
    salesCount: integer("sales_count").notNull().default(0),
    ...timestamps,
  },
  (t) => [
    index("products_slug_status_idx").on(t.slug, t.status),
    index("products_category_status_idx").on(t.categoryId, t.status),
    // Free: no price at all, so no accidental zero-value paid order.
    // Paid: any price that exists is positive.
    check(
      "products_price_check",
      sql`(${t.isFree} and ${t.priceInr} is null and ${t.priceUsd} is null)
        or (not ${t.isFree} and (${t.priceInr} is null or ${t.priceInr} > 0)
            and (${t.priceUsd} is null or ${t.priceUsd} > 0))`,
    ),
    // A published paid product must have an INR price (INR is the launch currency).
    check(
      "products_published_price_check",
      sql`${t.status} <> 'published' or ${t.isFree} or ${t.priceInr} is not null`,
    ),
    check(
      "products_setup_time_check",
      sql`${t.setupTimeMinutes} is null or ${t.setupTimeMinutes} >= 0`,
    ),
    check("products_sales_count_check", sql`${t.salesCount} >= 0`),
  ],
);

export const productFiles = pgTable(
  "product_files",
  {
    id,
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    label: text("label").notNull(),
    deliveryType: deliveryType("delivery_type").notNull(),
    /** Private storage object key (B2/R2). Never sent to the browser. */
    fileKey: text("file_key"),
    /** Private link, exposed only after an entitlement check (Phase 2). */
    externalUrl: text("external_url"),
    fileName: text("file_name"),
    sizeBytes: integer("size_bytes"),
    mimeType: varchar("mime_type", { length: 120 }),
    isPreview: boolean("is_preview").notNull().default(false),
    sortOrder: integer("sort_order").notNull().default(0),
    version: varchar("version", { length: 40 }).notNull().default("1.0"),
    ...timestamps,
  },
  (t) => [
    index("product_files_product_sort_idx").on(t.productId, t.sortOrder),
    check(
      "product_files_delivery_check",
      sql`(${t.deliveryType} = 'file' and ${t.fileKey} is not null and ${t.externalUrl} is null)
        or (${t.deliveryType} = 'external_link' and ${t.externalUrl} is not null and ${t.fileKey} is null)
        or (${t.deliveryType} = 'lesson_resource' and (${t.fileKey} is not null or ${t.externalUrl} is not null))`,
    ),
    check("product_files_size_check", sql`${t.sizeBytes} is null or ${t.sizeBytes} >= 0`),
  ],
);

export const productUpdates = pgTable("product_updates", {
  id,
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  version: varchar("version", { length: 40 }).notNull(),
  notes: text("notes").notNull(),
  createdBy: text("created_by"),
  createdAt: timestamps.createdAt,
});

export const bundleItems = pgTable(
  "bundle_items",
  {
    bundleId: uuid("bundle_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "restrict" }),
  },
  (t) => [
    primaryKey({ columns: [t.bundleId, t.productId] }),
    // shortcut: only blocks self-reference; "bundle_id is a bundle and product_id
    // is not" is checked in app code when bundles get an editor (Phase 4).
    check("bundle_items_not_self_check", sql`${t.bundleId} <> ${t.productId}`),
  ],
);

// ---------- People ----------
export const leads = pgTable(
  "leads",
  {
    id,
    name: text("name").notNull(),
    email: text("email").notNull(),
    productId: uuid("product_id").references(() => products.id, { onDelete: "set null" }),
    source: leadSource("source").notNull(),
    marketingOptIn: boolean("marketing_opt_in").notNull().default(false),
    consentAt: timestamp("consent_at", { withTimezone: true }),
    ipHash: text("ip_hash"),
    createdAt: timestamps.createdAt,
  },
  (t) => [
    index("leads_email_created_idx").on(t.email, t.createdAt),
    check("leads_email_normalised_check", sql`${t.email} = lower(btrim(${t.email}))`),
    check("leads_consent_check", sql`not ${t.marketingOptIn} or ${t.consentAt} is not null`),
  ],
);

export const customers = pgTable(
  "customers",
  {
    id,
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    ...timestamps,
  },
  (t) => [check("customers_email_normalised_check", sql`${t.email} = lower(btrim(${t.email}))`)],
);

// ---------- Commerce ----------
export const coupons = pgTable(
  "coupons",
  {
    id,
    code: varchar("code", { length: 40 }).notNull().unique(),
    discountType: discountType("discount_type").notNull(),
    percentOff: integer("percent_off"),
    amountOff: integer("amount_off"),
    currency: varchar("currency", { length: 3 }),
    maxUses: integer("max_uses"),
    usedCount: integer("used_count").notNull().default(0),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    active: boolean("active").notNull().default(true),
    ...timestamps,
  },
  (t) => [
    check("coupons_code_normalised_check", sql`${t.code} = upper(btrim(${t.code}))`),
    check(
      "coupons_discount_check",
      sql`(${t.discountType} = 'percent' and ${t.percentOff} between 1 and 100 and ${t.amountOff} is null)
        or (${t.discountType} = 'fixed' and ${t.amountOff} > 0 and ${t.currency} in ('INR', 'USD') and ${t.percentOff} is null)`,
    ),
    check(
      "coupons_uses_check",
      sql`${t.usedCount} >= 0 and (${t.maxUses} is null or (${t.maxUses} > 0 and ${t.usedCount} <= ${t.maxUses}))`,
    ),
  ],
);

export const orders = pgTable(
  "orders",
  {
    id,
    customerId: uuid("customer_id")
      .notNull()
      .references(() => customers.id, { onDelete: "restrict" }),
    amount: integer("amount").notNull(),
    currency: varchar("currency", { length: 3 }).notNull(),
    status: orderStatus("status").notNull().default("created"),
    provider: varchar("provider", { length: 40 }).notNull().default("razorpay"),
    razorpayOrderId: varchar("razorpay_order_id", { length: 64 }).unique(),
    razorpayPaymentId: varchar("razorpay_payment_id", { length: 64 }),
    /** Sensitive operational data — never returned to the browser. */
    razorpaySignature: text("razorpay_signature"),
    couponId: uuid("coupon_id").references(() => coupons.id, { onDelete: "restrict" }),
    idempotencyKey: varchar("idempotency_key", { length: 120 }).unique(),
    paidAt: timestamp("paid_at", { withTimezone: true }),
    ...timestamps,
  },
  (t) => [
    index("orders_customer_created_idx").on(t.customerId, t.createdAt),
    check("orders_amount_check", sql`${t.amount} > 0`),
    check("orders_currency_check", sql`${t.currency} in ('INR', 'USD')`),
    check("orders_paid_at_check", sql`${t.status} <> 'paid' or ${t.paidAt} is not null`),
  ],
);

export const orderItems = pgTable(
  "order_items",
  {
    id,
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "restrict" }),
    unitAmount: integer("unit_amount").notNull(),
    currency: varchar("currency", { length: 3 }).notNull(),
    quantity: integer("quantity").notNull().default(1),
  },
  (t) => [
    uniqueIndex("order_items_order_product_uq").on(t.orderId, t.productId),
    check("order_items_amount_check", sql`${t.unitAmount} >= 0`),
    check("order_items_quantity_check", sql`${t.quantity} > 0`),
    check("order_items_currency_check", sql`${t.currency} in ('INR', 'USD')`),
  ],
);

/*
 * Access to a product. At most one ACTIVE (not revoked) row per customer and
 * product. A refund revokes the row (revoked_at); buying again later creates a
 * new row, so the history of the refunded purchase is kept.
 */
export const entitlements = pgTable(
  "entitlements",
  {
    id,
    customerId: uuid("customer_id")
      .notNull()
      .references(() => customers.id, { onDelete: "restrict" }),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "restrict" }),
    orderId: uuid("order_id").references(() => orders.id, { onDelete: "restrict" }),
    grantedAt: timestamp("granted_at", { withTimezone: true }).notNull().defaultNow(),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    downloadCount: integer("download_count").notNull().default(0),
    downloadLimit: integer("download_limit").notNull().default(10),
  },
  (t) => [
    index("entitlements_customer_product_idx").on(t.customerId, t.productId),
    uniqueIndex("entitlements_active_uq")
      .on(t.customerId, t.productId)
      .where(sql`${t.revokedAt} is null`),
    check(
      "entitlements_downloads_check",
      sql`${t.downloadCount} >= 0 and ${t.downloadLimit} >= 0 and ${t.downloadCount} <= ${t.downloadLimit}`,
    ),
  ],
);

export const downloadLogs = pgTable("download_logs", {
  id,
  entitlementId: uuid("entitlement_id")
    .notNull()
    .references(() => entitlements.id, { onDelete: "cascade" }),
  fileId: uuid("file_id")
    .notNull()
    .references(() => productFiles.id, { onDelete: "cascade" }),
  ipHash: text("ip_hash"),
  userAgent: varchar("user_agent", { length: 512 }),
  createdAt: timestamps.createdAt,
});

export const webhookEvents = pgTable(
  "webhook_events",
  {
    id,
    provider: varchar("provider", { length: 40 }).notNull(),
    eventId: varchar("event_id", { length: 120 }).notNull(),
    type: varchar("type", { length: 120 }).notNull(),
    payload: jsonb("payload").notNull(),
    processedAt: timestamp("processed_at", { withTimezone: true }),
    createdAt: timestamps.createdAt,
  },
  (t) => [uniqueIndex("webhook_events_provider_event_uq").on(t.provider, t.eventId)],
);

export const reviews = pgTable(
  "reviews",
  {
    id,
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    customerId: uuid("customer_id")
      .notNull()
      .references(() => customers.id, { onDelete: "cascade" }),
    rating: integer("rating").notNull(),
    title: text("title").notNull(),
    body: text("body").notNull(),
    useCase: text("use_case"),
    /** Set by server logic from a real entitlement, never by the browser. */
    verifiedPurchase: boolean("verified_purchase").notNull().default(false),
    status: reviewStatus("status").notNull().default("pending"),
    ...timestamps,
  },
  (t) => [
    check("reviews_rating_check", sql`${t.rating} between 1 and 5`),
    // One review per buyer per product.
    uniqueIndex("reviews_product_customer_uq").on(t.productId, t.customerId),
  ],
);

export const magicTokens = pgTable(
  "magic_tokens",
  {
    id,
    email: text("email").notNull(),
    /** Only the hash is stored; the raw token lives in the email link. */
    tokenHash: text("token_hash").notNull().unique(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    usedAt: timestamp("used_at", { withTimezone: true }),
    createdAt: timestamps.createdAt,
  },
  (t) => [
    index("magic_tokens_hash_expires_idx").on(t.tokenHash, t.expiresAt),
    check("magic_tokens_email_normalised_check", sql`${t.email} = lower(btrim(${t.email}))`),
  ],
);

/**
 * Sensitive owner actions (publish, archive, price change, coupon, resend,
 * review moderation, update notices). Never passwords, secrets or card data.
 */
export const adminAuditLogs = pgTable(
  "admin_audit_logs",
  {
    id,
    action: varchar("action", { length: 60 }).notNull(),
    targetType: varchar("target_type", { length: 40 }).notNull(),
    targetId: uuid("target_id"),
    details: jsonb("details").notNull().default({}),
    createdAt: timestamps.createdAt,
  },
  (t) => [index("admin_audit_logs_created_idx").on(t.createdAt)],
);
