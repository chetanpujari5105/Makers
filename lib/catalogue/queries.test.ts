// @vitest-environment node
import { existsSync } from "node:fs";

import { inArray, like } from "drizzle-orm";
import { NextRequest } from "next/server";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { seedProducts } from "@/db/seed-data";

/*
 * Integration tests against the DEVELOPMENT Neon branch in .env.local.
 * They create their own products (prefixed zz-test-), check what the public
 * queries return, and delete them again. Skipped when no database is set
 * (e.g. on Vercel, where tests don't run).
 */
if (!process.env.VERCEL && existsSync(".env.local")) process.loadEnvFile(".env.local");
const hasDb = Boolean(process.env.DATABASE_URL);

const run = `zz-test-${Date.now().toString(36)}`;
const slugs = {
  published: `${run}-published`,
  draft: `${run}-draft`,
  archived: `${run}-archived`,
};
const SECRET = `SECRET-${run}`;
// A real reading-type sample (pdf/ebook) so the content passes validation.
const sample = seedProducts.find((p) => p.content.typeDetails.kind === "reading")!;

describe.skipIf(!hasDb)("public catalogue queries (development database)", () => {
  // Imported lazily so the file loads without a database.
  let q: typeof import("./queries");
  let db: ReturnType<typeof import("@/db").getDb>;
  let schema: typeof import("@/db/schema");

  beforeAll(async () => {
    q = await import("./queries");
    schema = await import("@/db/schema");
    db = (await import("@/db")).getDb();
    const { describeTarget } = await import("@/db/target");
    describeTarget(); // prints the endpoint, refuses mismatched URLs

    const [category] = await db
      .select({ id: schema.categories.id })
      .from(schema.categories)
      .where(inArray(schema.categories.slug, ["learn"]));
    if (!category) throw new Error("Run `npm run db:seed` first (no categories).");

    const rows = await db
      .insert(schema.products)
      .values(
        (["published", "draft", "archived"] as const).map((status) => ({
          slug: slugs[status],
          title: `Zebra test ${status} ${run}`,
          tagline: `Tagline ${run}`,
          shortDescription: "Test fixture",
          productType: sample.productType,
          categoryId: category.id,
          level: "advanced" as const,
          priceInr: 250000,
          isFree: false,
          status,
          setupTimeMinutes: 90,
          requirements: sample.requirements,
          contentJson: sample.content,
          licenseText: "Test license",
        })),
      )
      .returning({ id: schema.products.id });

    await db.insert(schema.productFiles).values(
      rows.flatMap(({ id }) => [
        {
          productId: id,
          label: "Private file",
          deliveryType: "file" as const,
          fileKey: `private/${SECRET}.pdf`,
          fileName: "guide.pdf",
        },
        {
          productId: id,
          label: "Private link",
          deliveryType: "external_link" as const,
          externalUrl: `https://private.example.com/${SECRET}`,
        },
      ]),
    );
  });

  afterAll(async () => {
    if (db) await db.delete(schema.products).where(like(schema.products.slug, `${run}%`));
  });

  it("returns a published product with its files but no private keys or links", async () => {
    const product = await q.getProduct(slugs.published);
    expect(product?.slug).toBe(slugs.published);
    expect(product?.files.map((f) => f.label)).toEqual(["Private file", "Private link"]);
    for (const file of product?.files ?? []) {
      expect(Object.keys(file).sort()).toEqual([
        "deliveryType",
        "fileName",
        "label",
        "mimeType",
        "sizeBytes",
      ]);
    }
    expect(JSON.stringify(product)).not.toContain(SECRET);
    expect(product).not.toHaveProperty("id");
  });

  it("hides draft and archived products everywhere", async () => {
    for (const slug of [slugs.draft, slugs.archived]) {
      expect(await q.getProduct(slug)).toBeNull();
      expect(await q.isPublishedSlug(slug)).toBe(false);
    }
    const all = await q.listProducts({ q: run }, 100);
    expect(all.items.map((p) => p.slug)).toEqual([slugs.published]);
    expect(all.total).toBe(1);
    const sitemap = (await q.listPublishedSlugs()).map((p) => p.slug);
    expect(sitemap).toContain(slugs.published);
    expect(sitemap).not.toContain(slugs.draft);
    expect(sitemap).not.toContain(slugs.archived);
    expect(JSON.stringify(all)).not.toContain(SECRET);
  });

  it("combines search with goal, type, level, price, cost and setup filters", async () => {
    const match = { q: run, goal: "learn", type: sample.productType, level: "advanced" } as const;
    const hit = async (extra: object) =>
      (await q.listProducts({ ...match, ...extra })).items.map((p) => p.slug);

    expect(await hit({ cost: "paid", price: "over-1500", setup: "over-60" })).toEqual([
      slugs.published,
    ]);
    expect(await hit({ cost: "free" })).toEqual([]);
    expect(await hit({ price: "under-500" })).toEqual([]);
    expect(await hit({ setup: "under-15" })).toEqual([]);
    expect(await hit({ level: "beginner" })).toEqual([]);
    expect(await hit({ goal: "create" })).toEqual([]);
  });

  it("searches literally (wildcards typed by a visitor match nothing extra)", async () => {
    expect((await q.listProducts({ q: "%" })).items.every((p) => p.title.includes("%"))).toBe(true);
  });

  it("paginates and sorts by price", async () => {
    const pageOne = await q.listProducts({ sort: "price-desc" }, 1);
    expect(pageOne.items).toHaveLength(1);
    expect(pageOne.pageCount).toBe(pageOne.total);
    const asc = (await q.listProducts({ sort: "price-asc" }, 100)).items;
    const prices = asc.map((p) => p.priceInr ?? 0);
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
  });

  it("proxy answers 404 for unknown, draft and archived slugs and lets published through", async () => {
    const { proxy } = await import("@/proxy");
    const status = async (path: string) => {
      const res = await proxy(new NextRequest(`http://localhost${path}`));
      return res.status;
    };
    expect(await status(`/products/${slugs.published}`)).toBe(200);
    expect(await status(`/products/${slugs.draft}`)).toBe(404);
    expect(await status(`/products/${slugs.archived}`)).toBe(404);
    expect(await status("/products/does-not-exist")).toBe(404);
    expect(await status("/products/Bad_Slug")).toBe(404);
    expect(await status("/category/learn")).toBe(200);
    expect(await status("/category/nope")).toBe(404);
  });
});
