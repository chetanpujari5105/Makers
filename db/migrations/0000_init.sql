CREATE TYPE "public"."delivery_type" AS ENUM('file', 'external_link', 'lesson_resource');--> statement-breakpoint
CREATE TYPE "public"."discount_type" AS ENUM('percent', 'fixed');--> statement-breakpoint
CREATE TYPE "public"."goal_group" AS ENUM('create', 'learn', 'work_smarter', 'build_make');--> statement-breakpoint
CREATE TYPE "public"."lead_source" AS ENUM('product_page', 'newsletter', 'free_download');--> statement-breakpoint
CREATE TYPE "public"."license_type" AS ENUM('personal', 'commercial', 'team');--> statement-breakpoint
CREATE TYPE "public"."order_status" AS ENUM('created', 'paid', 'failed', 'refunded');--> statement-breakpoint
CREATE TYPE "public"."product_level" AS ENUM('beginner', 'intermediate', 'advanced');--> statement-breakpoint
CREATE TYPE "public"."product_status" AS ENUM('draft', 'published', 'archived');--> statement-breakpoint
CREATE TYPE "public"."product_type" AS ENUM('pdf', 'ebook', 'course', 'markdown', 'notion', 'design_kit', 'prompt_pack', 'model_3d', 'bundle');--> statement-breakpoint
CREATE TYPE "public"."review_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TABLE "bundle_items" (
	"bundle_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	CONSTRAINT "bundle_items_bundle_id_product_id_pk" PRIMARY KEY("bundle_id","product_id"),
	CONSTRAINT "bundle_items_not_self_check" CHECK ("bundle_items"."bundle_id" <> "bundle_items"."product_id")
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(80) NOT NULL,
	"name" text NOT NULL,
	"goal_group" "goal_group" NOT NULL,
	"description" text NOT NULL,
	"icon" varchar(40),
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "coupons" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(40) NOT NULL,
	"discount_type" "discount_type" NOT NULL,
	"percent_off" integer,
	"amount_off" integer,
	"currency" varchar(3),
	"max_uses" integer,
	"used_count" integer DEFAULT 0 NOT NULL,
	"expires_at" timestamp with time zone,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "coupons_code_unique" UNIQUE("code"),
	CONSTRAINT "coupons_code_normalised_check" CHECK ("coupons"."code" = upper(btrim("coupons"."code"))),
	CONSTRAINT "coupons_discount_check" CHECK (("coupons"."discount_type" = 'percent' and "coupons"."percent_off" between 1 and 100 and "coupons"."amount_off" is null)
        or ("coupons"."discount_type" = 'fixed' and "coupons"."amount_off" > 0 and "coupons"."currency" in ('INR', 'USD') and "coupons"."percent_off" is null)),
	CONSTRAINT "coupons_uses_check" CHECK ("coupons"."used_count" >= 0 and ("coupons"."max_uses" is null or ("coupons"."max_uses" > 0 and "coupons"."used_count" <= "coupons"."max_uses")))
);
--> statement-breakpoint
CREATE TABLE "customers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "customers_email_unique" UNIQUE("email"),
	CONSTRAINT "customers_email_normalised_check" CHECK ("customers"."email" = lower(btrim("customers"."email")))
);
--> statement-breakpoint
CREATE TABLE "download_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entitlement_id" uuid NOT NULL,
	"file_id" uuid NOT NULL,
	"ip_hash" text,
	"user_agent" varchar(512),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "entitlements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"order_id" uuid,
	"granted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"revoked_at" timestamp with time zone,
	"download_count" integer DEFAULT 0 NOT NULL,
	"download_limit" integer DEFAULT 10 NOT NULL,
	CONSTRAINT "entitlements_downloads_check" CHECK ("entitlements"."download_count" >= 0 and "entitlements"."download_limit" >= 0 and "entitlements"."download_count" <= "entitlements"."download_limit")
);
--> statement-breakpoint
CREATE TABLE "leads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"product_id" uuid,
	"source" "lead_source" NOT NULL,
	"marketing_opt_in" boolean DEFAULT false NOT NULL,
	"consent_at" timestamp with time zone,
	"ip_hash" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "leads_email_normalised_check" CHECK ("leads"."email" = lower(btrim("leads"."email"))),
	CONSTRAINT "leads_consent_check" CHECK (not "leads"."marketing_opt_in" or "leads"."consent_at" is not null)
);
--> statement-breakpoint
CREATE TABLE "magic_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"token_hash" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"used_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "magic_tokens_token_hash_unique" UNIQUE("token_hash"),
	CONSTRAINT "magic_tokens_email_normalised_check" CHECK ("magic_tokens"."email" = lower(btrim("magic_tokens"."email")))
);
--> statement-breakpoint
CREATE TABLE "order_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"unit_amount" integer NOT NULL,
	"currency" varchar(3) NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	CONSTRAINT "order_items_amount_check" CHECK ("order_items"."unit_amount" >= 0),
	CONSTRAINT "order_items_quantity_check" CHECK ("order_items"."quantity" > 0),
	CONSTRAINT "order_items_currency_check" CHECK ("order_items"."currency" in ('INR', 'USD'))
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_id" uuid NOT NULL,
	"amount" integer NOT NULL,
	"currency" varchar(3) NOT NULL,
	"status" "order_status" DEFAULT 'created' NOT NULL,
	"provider" varchar(40) DEFAULT 'razorpay' NOT NULL,
	"razorpay_order_id" varchar(64),
	"razorpay_payment_id" varchar(64),
	"razorpay_signature" text,
	"coupon_id" uuid,
	"idempotency_key" varchar(120),
	"paid_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "orders_razorpay_order_id_unique" UNIQUE("razorpay_order_id"),
	CONSTRAINT "orders_idempotency_key_unique" UNIQUE("idempotency_key"),
	CONSTRAINT "orders_amount_check" CHECK ("orders"."amount" > 0),
	CONSTRAINT "orders_currency_check" CHECK ("orders"."currency" in ('INR', 'USD')),
	CONSTRAINT "orders_paid_at_check" CHECK ("orders"."status" <> 'paid' or "orders"."paid_at" is not null)
);
--> statement-breakpoint
CREATE TABLE "product_files" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"label" text NOT NULL,
	"delivery_type" "delivery_type" NOT NULL,
	"file_key" text,
	"external_url" text,
	"file_name" text,
	"size_bytes" integer,
	"mime_type" varchar(120),
	"is_preview" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"version" varchar(40) DEFAULT '1.0' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "product_files_delivery_check" CHECK (("product_files"."delivery_type" = 'file' and "product_files"."file_key" is not null and "product_files"."external_url" is null)
        or ("product_files"."delivery_type" = 'external_link' and "product_files"."external_url" is not null and "product_files"."file_key" is null)
        or ("product_files"."delivery_type" = 'lesson_resource' and ("product_files"."file_key" is not null or "product_files"."external_url" is not null))),
	CONSTRAINT "product_files_size_check" CHECK ("product_files"."size_bytes" is null or "product_files"."size_bytes" >= 0)
);
--> statement-breakpoint
CREATE TABLE "product_updates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"version" varchar(40) NOT NULL,
	"notes" text NOT NULL,
	"created_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(120) NOT NULL,
	"title" text NOT NULL,
	"tagline" text NOT NULL,
	"short_description" text NOT NULL,
	"product_type" "product_type" NOT NULL,
	"category_id" uuid NOT NULL,
	"level" "product_level" NOT NULL,
	"price_inr" integer,
	"price_usd" integer,
	"is_free" boolean DEFAULT false NOT NULL,
	"status" "product_status" DEFAULT 'draft' NOT NULL,
	"is_sample" boolean DEFAULT false NOT NULL,
	"cover_image" text,
	"gallery" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"preview_video_url" text,
	"setup_time_minutes" integer,
	"requirements" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"content_json" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"license_type" "license_type" DEFAULT 'personal' NOT NULL,
	"license_text" text,
	"version" varchar(40) DEFAULT '1.0' NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"mdx_slug" varchar(120),
	"seo_title" text,
	"seo_description" text,
	"sales_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "products_slug_unique" UNIQUE("slug"),
	CONSTRAINT "products_price_check" CHECK (("products"."is_free" and "products"."price_inr" is null and "products"."price_usd" is null)
        or (not "products"."is_free" and ("products"."price_inr" is null or "products"."price_inr" > 0)
            and ("products"."price_usd" is null or "products"."price_usd" > 0))),
	CONSTRAINT "products_published_price_check" CHECK ("products"."status" <> 'published' or "products"."is_free" or "products"."price_inr" is not null),
	CONSTRAINT "products_setup_time_check" CHECK ("products"."setup_time_minutes" is null or "products"."setup_time_minutes" >= 0),
	CONSTRAINT "products_sales_count_check" CHECK ("products"."sales_count" >= 0)
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"customer_id" uuid NOT NULL,
	"rating" integer NOT NULL,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"use_case" text,
	"verified_purchase" boolean DEFAULT false NOT NULL,
	"status" "review_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "reviews_rating_check" CHECK ("reviews"."rating" between 1 and 5)
);
--> statement-breakpoint
CREATE TABLE "webhook_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"provider" varchar(40) NOT NULL,
	"event_id" varchar(120) NOT NULL,
	"type" varchar(120) NOT NULL,
	"payload" jsonb NOT NULL,
	"processed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "bundle_items" ADD CONSTRAINT "bundle_items_bundle_id_products_id_fk" FOREIGN KEY ("bundle_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bundle_items" ADD CONSTRAINT "bundle_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "download_logs" ADD CONSTRAINT "download_logs_entitlement_id_entitlements_id_fk" FOREIGN KEY ("entitlement_id") REFERENCES "public"."entitlements"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "download_logs" ADD CONSTRAINT "download_logs_file_id_product_files_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."product_files"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entitlements" ADD CONSTRAINT "entitlements_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entitlements" ADD CONSTRAINT "entitlements_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entitlements" ADD CONSTRAINT "entitlements_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leads" ADD CONSTRAINT "leads_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_coupon_id_coupons_id_fk" FOREIGN KEY ("coupon_id") REFERENCES "public"."coupons"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_files" ADD CONSTRAINT "product_files_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_updates" ADD CONSTRAINT "product_updates_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "entitlements_customer_product_idx" ON "entitlements" USING btree ("customer_id","product_id");--> statement-breakpoint
CREATE UNIQUE INDEX "entitlements_active_uq" ON "entitlements" USING btree ("customer_id","product_id") WHERE "entitlements"."revoked_at" is null;--> statement-breakpoint
CREATE INDEX "leads_email_created_idx" ON "leads" USING btree ("email","created_at");--> statement-breakpoint
CREATE INDEX "magic_tokens_hash_expires_idx" ON "magic_tokens" USING btree ("token_hash","expires_at");--> statement-breakpoint
CREATE UNIQUE INDEX "order_items_order_product_uq" ON "order_items" USING btree ("order_id","product_id");--> statement-breakpoint
CREATE INDEX "orders_customer_created_idx" ON "orders" USING btree ("customer_id","created_at");--> statement-breakpoint
CREATE INDEX "product_files_product_sort_idx" ON "product_files" USING btree ("product_id","sort_order");--> statement-breakpoint
CREATE INDEX "products_slug_status_idx" ON "products" USING btree ("slug","status");--> statement-breakpoint
CREATE INDEX "products_category_status_idx" ON "products" USING btree ("category_id","status");--> statement-breakpoint
CREATE UNIQUE INDEX "webhook_events_provider_event_uq" ON "webhook_events" USING btree ("provider","event_id");