import { and, asc, desc, eq, isNull, sql } from "drizzle-orm";

import { getDb } from "@/db";
import { categories, customers, entitlements, leads, productFiles, products } from "@/db/schema";
import { productContentSchema } from "@/lib/catalogue/content-schema";

/*
 * Server-only access rules for leads, free claims, My Library and downloads.
 * Prices, "free" status and entitlements always come from the database,
 * never from the browser. The neon-http driver has no interactive
 * transactions, so each multi-step write is a single SQL statement.
 */

type LeadInput = {
  name: string;
  email: string;
  productId: string | null;
  source: "product_page" | "free_download";
  marketingOptIn: boolean;
  ipHash: string | null;
};

export async function saveLead(lead: LeadInput) {
  await getDb()
    .insert(leads)
    .values({ ...lead, consentAt: lead.marketingOptIn ? new Date() : null });
}

/** Published product by slug, with the commercial facts the server needs. */
export async function findPublishedProduct(slug: string) {
  const [row] = await getDb()
    .select({
      id: products.id,
      title: products.title,
      slug: products.slug,
      isFree: products.isFree,
    })
    .from(products)
    .where(and(eq(products.slug, slug), eq(products.status, "published")))
    .limit(1);
  return row ?? null;
}

/**
 * Finds or creates the customer and grants one active entitlement, in one
 * statement. A repeat claim changes nothing (the partial unique index on
 * active entitlements makes the insert a no-op). Returns true if new.
 */
export async function grantFreeEntitlement(name: string, email: string, productId: string) {
  const result = await getDb().execute(sql`
    with c as (
      insert into ${customers} (name, email) values (${name}, ${email})
      on conflict (email) do update set updated_at = now()
      returning id
    ), p as (
      select id from ${products}
      where id = ${productId} and status = 'published' and is_free = true
    )
    insert into ${entitlements} (customer_id, product_id)
    select c.id, p.id from c, p
    on conflict do nothing
    returning id`);
  return result.rows.length > 0;
}

/** Products the signed-in customer can open, newest first. */
export async function listLibrary(email: string) {
  return getDb()
    .select({
      slug: products.slug,
      title: products.title,
      tagline: products.tagline,
      productType: products.productType,
      goalSlug: categories.slug,
      coverImage: products.coverImage,
      grantedAt: entitlements.grantedAt,
    })
    .from(entitlements)
    .innerJoin(customers, eq(customers.id, entitlements.customerId))
    .innerJoin(products, eq(products.id, entitlements.productId))
    .innerJoin(categories, eq(categories.id, products.categoryId))
    .where(and(eq(customers.email, email), isNull(entitlements.revokedAt)))
    .orderBy(desc(entitlements.grantedAt));
}

/** One entitled product with its Start Here content and file list (ids only, no keys or links). */
export async function getLibraryProduct(email: string, slug: string) {
  const db = getDb();
  const [row] = await db
    .select({
      productId: products.id,
      slug: products.slug,
      title: products.title,
      tagline: products.tagline,
      productType: products.productType,
      goalSlug: categories.slug,
      coverImage: products.coverImage,
      licenseType: products.licenseType,
      licenseText: products.licenseText,
      contentJson: products.contentJson,
      downloadCount: entitlements.downloadCount,
      downloadLimit: entitlements.downloadLimit,
    })
    .from(entitlements)
    .innerJoin(customers, eq(customers.id, entitlements.customerId))
    .innerJoin(products, eq(products.id, entitlements.productId))
    .innerJoin(categories, eq(categories.id, products.categoryId))
    .where(and(eq(customers.email, email), eq(products.slug, slug), isNull(entitlements.revokedAt)))
    .limit(1);
  if (!row) return null;

  const files = await db
    .select({
      id: productFiles.id,
      label: productFiles.label,
      deliveryType: productFiles.deliveryType,
      fileName: productFiles.fileName,
      sizeBytes: productFiles.sizeBytes,
    })
    .from(productFiles)
    .where(and(eq(productFiles.productId, row.productId), eq(productFiles.isPreview, false)))
    .orderBy(asc(productFiles.sortOrder));

  const { contentJson, productId: _productId, ...rest } = row;
  const content = productContentSchema.safeParse(contentJson);
  return { ...rest, content: content.success ? content.data : null, files };
}

export type DownloadResult =
  | { ok: true; kind: "file"; fileKey: string; fileName: string | null }
  | { ok: true; kind: "link"; url: string }
  | { ok: false; reason: "not_found" | "limit_reached" };

/**
 * Checks that `email` holds an active entitlement to the product this file
 * belongs to. Stored files also use up one download: the count goes up only
 * while it is below the limit, in the same statement that writes the
 * download log, so parallel requests can't exceed the limit.
 * Unknown files and files of other products look the same ("not_found").
 */
export async function authorizeDownload(
  email: string,
  fileId: string,
  meta: { ipHash: string | null; userAgent: string | null },
): Promise<DownloadResult> {
  const db = getDb();
  const [file] = await db
    .select({
      productId: productFiles.productId,
      fileKey: productFiles.fileKey,
      externalUrl: productFiles.externalUrl,
      fileName: productFiles.fileName,
    })
    .from(productFiles)
    .where(eq(productFiles.id, fileId))
    .limit(1);
  if (!file) return { ok: false, reason: "not_found" };

  const [active] = await db
    .select({ id: entitlements.id })
    .from(entitlements)
    .innerJoin(customers, eq(customers.id, entitlements.customerId))
    .where(
      and(
        eq(customers.email, email),
        eq(entitlements.productId, file.productId),
        isNull(entitlements.revokedAt),
      ),
    )
    .limit(1);
  if (!active) return { ok: false, reason: "not_found" };

  if (!file.fileKey) {
    return file.externalUrl
      ? { ok: true, kind: "link", url: file.externalUrl }
      : { ok: false, reason: "not_found" };
  }

  const result = await db.execute(sql`
    with e as (
      update ${entitlements} set download_count = download_count + 1
      where id = ${active.id} and revoked_at is null and download_count < download_limit
      returning id
    )
    insert into download_logs (entitlement_id, file_id, ip_hash, user_agent)
    select e.id, ${fileId}, ${meta.ipHash}, ${meta.userAgent?.slice(0, 512) ?? null} from e
    returning id`);
  if (result.rows.length === 0) return { ok: false, reason: "limit_reached" };
  return { ok: true, kind: "file", fileKey: file.fileKey, fileName: file.fileName };
}
