import { z } from "zod";

import { goalSlugSchema } from "@/lib/validators";

import { detailsKindFor, type ProductTypeKey } from "./content-schema";

/*
 * Explore filters live in the URL (PROJECT_SPEC §2.2), so every value here
 * comes from a visitor and is validated. Anything invalid is ignored rather
 * than shown as an error: an old or hand-edited link still opens Explore.
 */

export const PAGE_SIZE = 12;

const productTypes = Object.keys(detailsKindFor) as [ProductTypeKey, ...ProductTypeKey[]];

export const priceRanges = {
  "under-500": "Under ₹500",
  "500-1500": "₹500 to ₹1,500",
  "over-1500": "Over ₹1,500",
} as const;

export const setupTimes = {
  "under-15": "15 minutes or less",
  "under-60": "Under an hour",
  "over-60": "An hour or more",
} as const;

export const sortOptions = {
  featured: "Featured",
  newest: "Newest",
  "price-asc": "Price: low to high",
  "price-desc": "Price: high to low",
} as const;

type Keys<T> = [keyof T & string, ...(keyof T & string)[]];
const keysOf = <T extends object>(o: T) => Object.keys(o) as Keys<T>;

// URLs can repeat a key (?type=a&type=b); only the first value counts.
const first = (value: unknown) => (Array.isArray(value) ? value[0] : value);
const field = <T extends z.ZodType>(schema: T) =>
  z.preprocess(first, schema.optional().catch(undefined));

export const catalogueFiltersSchema = z.object({
  q: field(
    z
      .string()
      .trim()
      .max(80)
      .transform((q) => q || undefined),
  ),
  goal: field(goalSlugSchema),
  type: field(z.enum(productTypes)),
  level: field(z.enum(["beginner", "intermediate", "advanced"])),
  cost: field(z.enum(["free", "paid"])),
  price: field(z.enum(keysOf(priceRanges))),
  setup: field(z.enum(keysOf(setupTimes))),
  sort: z.preprocess(first, z.enum(keysOf(sortOptions)).catch("featured")).default("featured"),
  page: z.preprocess(first, z.coerce.number().int().min(1).max(1000).catch(1)).default(1),
});

export type CatalogueFilters = z.infer<typeof catalogueFiltersSchema>;
export type CatalogueFilterInput = Partial<CatalogueFilters>;

export function parseCatalogueFilters(searchParams: Record<string, string | string[] | undefined>) {
  return catalogueFiltersSchema.parse(searchParams);
}

/** Number of narrowing filters in use (search and sort don't count). */
export function activeFilterCount(f: CatalogueFilterInput) {
  return [f.goal, f.type, f.level, f.cost, f.price, f.setup].filter(Boolean).length;
}

/** Builds an /explore link that keeps the current filters, with overrides. */
export function exploreHref(f: CatalogueFilterInput, overrides: CatalogueFilterInput = {}) {
  const merged = { ...f, ...overrides };
  const params = new URLSearchParams();
  for (const key of ["q", "goal", "type", "level", "cost", "price", "setup"] as const) {
    const value = merged[key];
    if (value) params.set(key, value);
  }
  if (merged.sort && merged.sort !== "featured") params.set("sort", merged.sort);
  if (merged.page && merged.page > 1) params.set("page", String(merged.page));
  const query = params.toString();
  return query ? `/explore?${query}` : "/explore";
}
