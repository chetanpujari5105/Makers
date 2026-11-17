import { eq } from "drizzle-orm";

import { productContentSchema, requirementSchema } from "@/lib/catalogue/content-schema";

import { getDb } from "./index";
import { categories, productFiles, products } from "./schema";
import { seedCategories, seedProducts } from "./seed-data";
import { describeTarget } from "./target";

/*
 * Idempotent seed — safe to run any number of times.
 * - Categories: created or refreshed by slug (their names live in code).
 * - Sample products: created ONLY if the slug doesn't exist yet, always as
 *   drafts. An existing product is never touched, so owner edits and
 *   publish decisions survive a re-run.
 * - Sample products are seeded only when SEED_SAMPLE_PRODUCTS=true.
 */
async function main() {
  describeTarget();
  const db = getDb();

  for (const category of seedCategories) {
    await db
      .insert(categories)
      .values(category)
      .onConflictDoUpdate({
        target: categories.slug,
        set: {
          name: category.name,
          goalGroup: category.goalGroup,
          description: category.description,
          icon: category.icon,
          sortOrder: category.sortOrder,
        },
      });
  }
  console.warn(`Categories: ${seedCategories.length} ensured.`);

  if (process.env.SEED_SAMPLE_PRODUCTS !== "true") {
    console.warn("Sample products skipped (set SEED_SAMPLE_PRODUCTS=true to seed them).");
    return;
  }

  let created = 0;
  for (const sample of seedProducts) {
    // Fail loudly on bad sample content rather than seeding a broken page.
    const content = productContentSchema.parse(sample.content);
    const requirements = sample.requirements.map((r) => requirementSchema.parse(r));

    const [category] = await db
      .select({ id: categories.id })
      .from(categories)
      .where(eq(categories.slug, sample.categorySlug));
    if (!category) throw new Error(`Unknown category "${sample.categorySlug}" for ${sample.slug}`);

    const [row] = await db
      .insert(products)
      .values({
        slug: sample.slug,
        title: sample.title,
        tagline: sample.tagline,
        shortDescription: sample.shortDescription,
        productType: sample.productType,
        categoryId: category.id,
        level: sample.level,
        priceInr: sample.isFree ? null : (sample.priceInr ?? null),
        isFree: sample.isFree,
        status: "draft",
        isSample: true,
        featured: sample.featured,
        setupTimeMinutes: sample.setupTimeMinutes,
        requirements,
        contentJson: content,
        licenseType: sample.licenseType,
        licenseText: sample.licenseText,
      })
      .onConflictDoNothing({ target: products.slug })
      .returning({ id: products.id });

    if (!row) continue; // already exists — leave it alone
    created++;
    await db.insert(productFiles).values(
      sample.files.map((file, index) => ({
        productId: row.id,
        label: file.label,
        deliveryType: file.deliveryType,
        fileKey: file.fileKey ?? null,
        externalUrl: file.externalUrl ?? null,
        fileName: file.fileName ?? null,
        mimeType: file.mimeType ?? null,
        sortOrder: index,
      })),
    );
  }
  console.warn(
    `Sample products: ${created} created, ${seedProducts.length - created} already existed. All new ones are drafts.`,
  );
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
