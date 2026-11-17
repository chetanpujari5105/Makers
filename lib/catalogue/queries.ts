import { and, asc, count, desc, eq, gt, ilike, lte, ne, or, sql, type SQL } from "drizzle-orm";
import { z } from "zod";

import { getDb } from "@/db";
import { categories, productFiles, products } from "@/db/schema";

import { galleryImageSchema, productContentSchema, requirementSchema } from "./content-schema";
import { PAGE_SIZE, type CatalogueFilterInput } from "./filters";
import type { ProductDetail, ProductSummary, PublicFile } from "./types";

/*
 * Public catalogue reads. Two rules hold for every function here:
 * 1. Only `published` products are returned. Drafts and archived products
 *    behave exactly as if they don't exist.
 * 2. Columns are listed explicitly. Private file keys and private links
 *    (product_files.file_key / external_url) are never selected, so a page
 *    can't leak them by mistake.
 * Pages call the cached wrappers in ./catalogue.ts, not these directly.
 */

const isPublished = eq(products.status, "published");

const summaryColumns = {
  slug: products.slug,
  title: products.title,
  tagline: products.tagline,
  productType: products.productType,
  level: products.level,
  isFree: products.isFree,
  priceInr: products.priceInr,
  setupTimeMinutes: products.setupTimeMinutes,
  goalSlug: categories.slug,
  categoryName: categories.name,
  coverImage: products.coverImage,
  isSample: products.isSample,
};

function summaries() {
  return getDb()
    .select(summaryColumns)
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id));
}

/** `%` and `_` typed by a visitor are searched for literally. */
export function likePattern(text: string) {
  return `%${text.replace(/[\\%_]/g, "\\$&")}%`;
}

function filterConditions(f: CatalogueFilterInput) {
  const conditions: (SQL | undefined)[] = [isPublished];
  if (f.q) {
    const pattern = likePattern(f.q);
    conditions.push(
      or(
        ilike(products.title, pattern),
        ilike(products.tagline, pattern),
        ilike(products.shortDescription, pattern),
      ),
    );
  }
  if (f.goal) conditions.push(eq(categories.slug, f.goal));
  if (f.type) conditions.push(eq(products.productType, f.type));
  if (f.level) conditions.push(eq(products.level, f.level));
  if (f.cost) conditions.push(eq(products.isFree, f.cost === "free"));
  // Prices are stored in paise: ₹500 = 50000.
  if (f.price === "under-500") conditions.push(sql`${products.priceInr} < 50000`);
  if (f.price === "500-1500") conditions.push(sql`${products.priceInr} between 50000 and 150000`);
  if (f.price === "over-1500") conditions.push(gt(products.priceInr, 150000));
  if (f.setup === "under-15") conditions.push(lte(products.setupTimeMinutes, 15));
  if (f.setup === "under-60") conditions.push(sql`${products.setupTimeMinutes} < 60`);
  if (f.setup === "over-60") conditions.push(sql`${products.setupTimeMinutes} >= 60`);
  return and(...conditions);
}

const price = sql`coalesce(${products.priceInr}, 0)`;
const orderBy = {
  featured: [desc(products.featured), desc(products.createdAt), asc(products.slug)],
  newest: [desc(products.createdAt), asc(products.slug)],
  "price-asc": [asc(price), asc(products.title), asc(products.slug)],
  "price-desc": [desc(price), asc(products.title), asc(products.slug)],
} as const;

export async function listProducts(f: CatalogueFilterInput = {}, pageSize = PAGE_SIZE) {
  const where = filterConditions(f);
  const page = f.page ?? 1;
  const [items, [totals]] = await Promise.all([
    summaries()
      .where(where)
      .orderBy(...orderBy[f.sort ?? "featured"])
      .limit(pageSize)
      .offset((page - 1) * pageSize),
    getDb()
      .select({ n: count() })
      .from(products)
      .innerJoin(categories, eq(products.categoryId, categories.id))
      .where(where),
  ]);
  const total = totals?.n ?? 0;
  return {
    items: items satisfies ProductSummary[],
    total,
    page,
    pageCount: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function listFeatured(limit = 6): Promise<ProductSummary[]> {
  return summaries()
    .where(and(isPublished, eq(products.featured, true)))
    .orderBy(desc(products.createdAt), asc(products.slug))
    .limit(limit);
}

export async function listRelated(
  product: Pick<ProductSummary, "slug" | "goalSlug">,
  limit = 3,
): Promise<ProductSummary[]> {
  return summaries()
    .where(and(isPublished, ne(products.slug, product.slug)))
    .orderBy(
      desc(sql`${categories.slug} = ${product.goalSlug}`),
      desc(products.featured),
      desc(products.createdAt),
    )
    .limit(limit);
}

export async function isPublishedSlug(slug: string) {
  const rows = await getDb()
    .select({ slug: products.slug })
    .from(products)
    .where(and(isPublished, eq(products.slug, slug)))
    .limit(1);
  return rows.length > 0;
}

export async function listPublishedSlugs() {
  return getDb()
    .select({ slug: products.slug, updatedAt: products.updatedAt, isSample: products.isSample })
    .from(products)
    .where(isPublished)
    .orderBy(asc(products.slug));
}

const requirementsSchema = z.array(requirementSchema);
const gallerySchema = z.array(galleryImageSchema);

export function getProduct(slug: string): Promise<ProductDetail | null> {
  return loadProduct(and(isPublished, eq(products.slug, slug))!);
}

/**
 * Owner preview (admin only — the caller checks): any status, by id. Throws
 * if the page content is incomplete; the preview shows what is missing.
 */
export function getProductPreview(id: string): Promise<ProductDetail | null> {
  return loadProduct(eq(products.id, id));
}

async function loadProduct(where: SQL): Promise<ProductDetail | null> {
  const db = getDb();
  const [row] = await db
    .select({
      ...summaryColumns,
      id: products.id,
      shortDescription: products.shortDescription,
      licenseType: products.licenseType,
      licenseText: products.licenseText,
      requirements: products.requirements,
      gallery: products.gallery,
      contentJson: products.contentJson,
    })
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .where(where)
    .limit(1);
  if (!row) return null;

  const files: PublicFile[] = await db
    .select({
      label: productFiles.label,
      deliveryType: productFiles.deliveryType,
      fileName: productFiles.fileName,
      mimeType: productFiles.mimeType,
      sizeBytes: productFiles.sizeBytes,
    })
    .from(productFiles)
    .where(eq(productFiles.productId, row.id))
    .orderBy(asc(productFiles.sortOrder));

  // Published products passed these checks in db:publish; a failure here means
  // the row was edited by hand, and the error page is better than a half page.
  // Zod also drops any unknown keys hiding in the JSON.
  const { id: _id, contentJson, requirements, gallery, ...rest } = row;
  return {
    ...rest,
    content: productContentSchema.parse(contentJson),
    requirements: requirementsSchema.parse(requirements),
    gallery: gallerySchema.parse(gallery),
    files,
  };
}
