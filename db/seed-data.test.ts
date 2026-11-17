import { describe, expect, it } from "vitest";

import { detailsKindFor, productContentSchema } from "@/lib/catalogue/content-schema";
import { publishProblems } from "@/lib/catalogue/publish-check";

import { seedCategories, seedProducts } from "./seed-data";

describe("sample seed data", () => {
  it("has six products with unique slugs across several types", () => {
    expect(seedProducts).toHaveLength(6);
    expect(new Set(seedProducts.map((p) => p.slug)).size).toBe(6);
    expect(new Set(seedProducts.map((p) => p.productType)).size).toBeGreaterThanOrEqual(5);
  });

  it.each(seedProducts)("$slug is complete enough to publish", (p) => {
    expect(productContentSchema.parse(p.content).typeDetails.kind).toBe(
      detailsKindFor[p.productType],
    );
    expect(seedCategories.some((c) => c.slug === p.categorySlug)).toBe(true);
    expect(
      publishProblems({
        ...p,
        priceInr: p.priceInr ?? null,
        licenseText: p.licenseText,
        contentJson: p.content,
        deliveryCount: p.files.length,
      }),
    ).toEqual([]);
  });

  it("free products carry no price and paid products carry a positive integer price", () => {
    for (const p of seedProducts) {
      if (p.isFree) expect(p.priceInr).toBeUndefined();
      else expect(Number.isInteger(p.priceInr) && p.priceInr! > 0).toBe(true);
    }
  });

  it("never invents reviews, ratings, sales or 3D print settings", () => {
    const json = JSON.stringify(seedProducts).toLowerCase();
    for (const key of ["rating", "reviews", "salescount", "testimonials", "printsettings"]) {
      expect(json).not.toContain(`"${key}":`);
    }
  });
});
