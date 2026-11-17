import { count, eq } from "drizzle-orm";

import { publishProblems } from "@/lib/catalogue/publish-check";

import { getDb } from "./index";
import { productFiles, products } from "./schema";
import { describeTarget } from "./target";

/*
 * Publish or hide a product until the admin dashboard exists (Phase 4).
 *   npm run db:publish -- <slug>               make it public (after checks)
 *   npm run db:publish -- <slug> --unpublish   back to draft
 *   npm run db:publish -- <slug> --archive     hide it for good (keeps history)
 */
async function main() {
  const [slug, flag] = process.argv.slice(2);
  if (!slug || (flag && flag !== "--unpublish" && flag !== "--archive")) {
    throw new Error("Usage: npm run db:publish -- <product-slug> [--unpublish | --archive]");
  }
  describeTarget();
  const db = getDb();

  const [product] = await db.select().from(products).where(eq(products.slug, slug));
  if (!product) throw new Error(`No product with the slug "${slug}".`);

  const status = flag === "--unpublish" ? "draft" : flag === "--archive" ? "archived" : "published";

  if (status === "published") {
    const [files] = await db
      .select({ n: count() })
      .from(productFiles)
      .where(eq(productFiles.productId, product.id));
    const problems = publishProblems({ ...product, deliveryCount: files?.n ?? 0 });
    if (problems.length > 0) {
      throw new Error(`“${product.title}” can’t be published yet:\n- ${problems.join("\n- ")}`);
    }
    if (product.isSample) {
      console.warn("Note: this is SAMPLE content. Its page will say so until you replace it.");
    }
  }

  await db.update(products).set({ status }).where(eq(products.id, product.id));
  console.warn(`“${product.title}” is now ${status}. Public pages refresh within about 5 minutes.`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
