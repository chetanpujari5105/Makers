import { describe, expect, it } from "vitest";

import { activeFilterCount, exploreHref, parseCatalogueFilters } from "./filters";
import { productJsonLd } from "./json-ld";
import { likePattern } from "./queries";

describe("parseCatalogueFilters", () => {
  it("reads valid URL values", () => {
    expect(
      parseCatalogueFilters({
        q: "  notion ",
        goal: "work-smarter",
        type: "notion",
        level: "beginner",
        cost: "paid",
        price: "under-500",
        setup: "under-15",
        sort: "price-asc",
        page: "2",
      }),
    ).toEqual({
      q: "notion",
      goal: "work-smarter",
      type: "notion",
      level: "beginner",
      cost: "paid",
      price: "under-500",
      setup: "under-15",
      sort: "price-asc",
      page: 2,
    });
  });

  it("ignores invalid, empty and repeated values instead of failing", () => {
    expect(
      parseCatalogueFilters({
        q: "",
        goal: "admin",
        type: ["pdf", "course"],
        level: "expert",
        cost: "",
        price: "1; drop table",
        sort: "popular",
        page: "-3",
      }),
    ).toEqual({
      q: undefined,
      goal: undefined,
      type: "pdf",
      level: undefined,
      cost: undefined,
      price: undefined,
      setup: undefined,
      sort: "featured",
      page: 1,
    });
    expect(parseCatalogueFilters({ page: "abc" }).page).toBe(1);
    expect(parseCatalogueFilters({ q: "x".repeat(81) }).q).toBeUndefined();
  });
});

describe("exploreHref", () => {
  it("keeps filters, drops defaults and applies overrides", () => {
    const filters = parseCatalogueFilters({ goal: "learn", cost: "free", sort: "newest" });
    expect(exploreHref(filters)).toBe("/explore?goal=learn&cost=free&sort=newest");
    expect(exploreHref(filters, { page: 3 })).toBe(
      "/explore?goal=learn&cost=free&sort=newest&page=3",
    );
    expect(exploreHref(parseCatalogueFilters({}))).toBe("/explore");
    expect(activeFilterCount(filters)).toBe(2);
  });
});

describe("likePattern", () => {
  it("escapes SQL wildcards typed by a visitor", () => {
    expect(likePattern("50%_off\\")).toBe("%50\\%\\_off\\\\%");
  });
});

describe("productJsonLd", () => {
  const base = {
    slug: "a",
    title: "A",
    tagline: "T",
    productType: "pdf" as const,
    coverImage: null,
  };
  it("uses the database price in rupees and INR", () => {
    const ld = productJsonLd({ ...base, isFree: false, priceInr: 39900 } as never);
    expect(ld.offers).toEqual({ "@type": "Offer", price: "399.00", priceCurrency: "INR" });
  });
  it("shows free products as price 0 and leaves out an unpriced product's offer", () => {
    expect(productJsonLd({ ...base, isFree: true, priceInr: null } as never).offers?.price).toBe(
      "0.00",
    );
    expect(productJsonLd({ ...base, isFree: false, priceInr: null } as never)).not.toHaveProperty(
      "offers",
    );
  });
});
