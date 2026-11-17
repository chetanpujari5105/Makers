import { cacheLife } from "next/cache";

import type { CatalogueFilterInput } from "./filters";
import * as queries from "./queries";

/*
 * Cached catalogue reads for pages. The "minutes" profile refreshes about once
 * a minute, so a product published with `npm run db:publish` shows up within a
 * few minutes without a redeploy. Tests use ./queries.ts directly.
 */

export async function getCatalogue(filters: CatalogueFilterInput) {
  "use cache";
  cacheLife("minutes");
  return queries.listProducts(filters);
}

export async function getFeatured() {
  "use cache";
  cacheLife("minutes");
  return queries.listFeatured();
}

export async function getProduct(slug: string) {
  "use cache";
  cacheLife("minutes");
  return queries.getProduct(slug);
}

export async function getRelated(product: { slug: string; goalSlug: string }) {
  "use cache";
  cacheLife("minutes");
  return queries.listRelated(product);
}

export async function getPublishedSlugs() {
  "use cache";
  cacheLife("minutes");
  return queries.listPublishedSlugs();
}
