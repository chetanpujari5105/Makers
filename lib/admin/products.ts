import { and, asc, count, desc, eq, ne } from "drizzle-orm";

import { getDb } from "@/db";
import { categories, entitlements, productFiles, products } from "@/db/schema";
import { goals, type GoalSlug } from "@/lib/brand";
import { publishProblems } from "@/lib/catalogue/publish-check";
import { deleteObject, isStorageConfigured } from "@/lib/storage/files";

import { audit } from "./guard";
import type { ProductValues } from "./product-form";

/* Owner-only product reads and writes. Callers must have checked the owner first. */

export async function listAdminProducts() {
  return getDb()
    .select({
      id: products.id,
      title: products.title,
      slug: products.slug,
      status: products.status,
      productType: products.productType,
      isFree: products.isFree,
      priceInr: products.priceInr,
      salesCount: products.salesCount,
      isSample: products.isSample,
      updatedAt: products.updatedAt,
    })
    .from(products)
    .orderBy(desc(products.updatedAt));
}

export async function getAdminProduct(id: string) {
  const db = getDb();
  const [row] = await db
    .select({
      id: products.id,
      title: products.title,
      slug: products.slug,
      tagline: products.tagline,
      shortDescription: products.shortDescription,
      productType: products.productType,
      goal: categories.slug,
      level: products.level,
      isFree: products.isFree,
      priceInr: products.priceInr,
      status: products.status,
      isSample: products.isSample,
      setupTimeMinutes: products.setupTimeMinutes,
      coverImage: products.coverImage,
      previewVideoUrl: products.previewVideoUrl,
      licenseType: products.licenseType,
      licenseText: products.licenseText,
      version: products.version,
      featured: products.featured,
      seoTitle: products.seoTitle,
      seoDescription: products.seoDescription,
      requirements: products.requirements,
      gallery: products.gallery,
      contentJson: products.contentJson,
    })
    .from(products)
    .innerJoin(categories, eq(categories.id, products.categoryId))
    .where(eq(products.id, id))
    .limit(1);
  if (!row) return null;
  const [files, [buyers]] = await Promise.all([
    db
      .select({
        id: productFiles.id,
        label: productFiles.label,
        deliveryType: productFiles.deliveryType,
        fileName: productFiles.fileName,
        sizeBytes: productFiles.sizeBytes,
        externalUrl: productFiles.externalUrl,
      })
      .from(productFiles)
      .where(eq(productFiles.productId, id))
      .orderBy(asc(productFiles.sortOrder), asc(productFiles.createdAt)),
    db.select({ n: count() }).from(entitlements).where(eq(entitlements.productId, id)),
  ]);
  return { ...row, files, buyerCount: buyers?.n ?? 0 };
}

export type AdminProduct = NonNullable<Awaited<ReturnType<typeof getAdminProduct>>>;

/** The category row for a goal. The four goals live in code; their rows are created on first use. */
async function categoryIdFor(goalSlug: GoalSlug) {
  const index = goals.findIndex((g) => g.slug === goalSlug);
  const goal = goals[index]!;
  const [row] = await getDb()
    .insert(categories)
    .values({
      slug: goal.slug,
      name: goal.label,
      goalGroup: goal.goalGroup,
      description: goal.description,
      sortOrder: index + 1,
    })
    .onConflictDoUpdate({ target: categories.slug, set: { updatedAt: new Date() } })
    .returning({ id: categories.id });
  return row!.id;
}

const problemsFor = (values: ProductValues, deliveryCount: number) =>
  publishProblems({ ...values, contentJson: values.contentJson, deliveryCount });

function isUniqueViolation(error: unknown) {
  const e = error as { code?: string; cause?: { code?: string } };
  return e?.code === "23505" || e?.cause?.code === "23505";
}

/**
 * Creates or updates a product. Drafts may be incomplete. A published
 * product must stay complete, so its edits get the same checks as publishing.
 * The web address is locked once a product has been published or has buyers,
 * because emails and library links point at it.
 */
export async function saveProduct(
  id: string | null,
  values: ProductValues,
): Promise<{ ok: true; id: string; note?: string } | { ok: false; message: string }> {
  const db = getDb();
  const { goal, ...columns } = values;
  const categoryId = await categoryIdFor(goal);
  try {
    if (!id) {
      const [row] = await db
        .insert(products)
        .values({ ...columns, categoryId, status: "draft" })
        .returning({ id: products.id });
      await audit("product_create", "product", row!.id, { title: values.title });
      return { ok: true, id: row!.id };
    }

    const existing = await getAdminProduct(id);
    if (!existing) return { ok: false, message: "That product no longer exists." };
    let note: string | undefined;
    const slugLocked = existing.status !== "draft" || existing.buyerCount > 0;
    if (slugLocked && values.slug !== existing.slug) {
      columns.slug = existing.slug;
      note =
        "The web address can’t change after publishing or once someone has it, so it was kept.";
    }
    if (existing.status === "published") {
      const problems = problemsFor(values, existing.files.length);
      if (problems.length)
        return {
          ok: false,
          message: `Not saved — a live product must stay complete. ${problems[0]}`,
        };
    }
    await db
      .update(products)
      .set({ ...columns, categoryId, updatedAt: new Date() })
      .where(eq(products.id, id));
    if (existing.priceInr !== values.priceInr || existing.isFree !== values.isFree) {
      await audit("price_change", "product", id, {
        from: existing.isFree ? "free" : existing.priceInr,
        to: values.isFree ? "free" : values.priceInr,
      });
    }
    return { ok: true, id, note };
  } catch (error) {
    if (isUniqueViolation(error))
      return { ok: false, message: "Another product already uses that web address." };
    throw error;
  }
}

/** Publish (only when complete), archive, or move back to draft. */
export async function setProductStatus(
  id: string,
  status: "published" | "archived" | "draft",
): Promise<{ ok: true } | { ok: false; message: string; problems?: string[] }> {
  const product = await getAdminProduct(id);
  if (!product) return { ok: false, message: "That product no longer exists." };
  if (status === "published") {
    const problems = publishProblems({ ...product, deliveryCount: product.files.length });
    if (problems.length) return { ok: false, message: "Not published yet.", problems };
  }
  await getDb()
    .update(products)
    .set({ status, updatedAt: new Date() })
    .where(and(eq(products.id, id), ne(products.status, status)));
  await audit(
    `product_${status === "published" ? "publish" : status === "archived" ? "archive" : "unpublish"}`,
    "product",
    id,
    {
      title: product.title,
    },
  );
  return { ok: true };
}

/** Adds an https link as a delivery item (e.g. a Notion duplicate link or video course). */
export async function addLinkFile(productId: string, label: string, url: string) {
  await getDb()
    .insert(productFiles)
    .values({ productId, label, deliveryType: "external_link", externalUrl: url });
  await audit("file_add_link", "product", productId, { label });
}

/** Removes a delivery item (and its stored file). A live product must keep at least one. */
export async function removeFile(
  fileId: string,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const db = getDb();
  const [file] = await db
    .select({
      productId: productFiles.productId,
      fileKey: productFiles.fileKey,
      label: productFiles.label,
    })
    .from(productFiles)
    .where(eq(productFiles.id, fileId))
    .limit(1);
  if (!file) return { ok: false, message: "That file was already removed." };
  const product = await getAdminProduct(file.productId);
  if (product?.status === "published" && product.files.length <= 1)
    return { ok: false, message: "A live product needs at least one file. Add the new one first." };
  await db.delete(productFiles).where(eq(productFiles.id, fileId));
  if (file.fileKey && isStorageConfigured()) await deleteObject(file.fileKey);
  await audit("file_remove", "product", file.productId, { label: file.label });
  return { ok: true };
}
