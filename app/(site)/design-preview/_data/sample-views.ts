import { seedCategories, seedProducts, type SeedProduct } from "@/db/seed-data";
import type { ProductDetail, ProductSummary } from "@/lib/catalogue/types";

/*
 * Layout drafts only: turns the seed file into the same shapes the real pages
 * will get from the database, so the drafts work before Neon is connected.
 * Real pages never import this — they read published rows from Neon.
 */
function toDetail(p: SeedProduct): ProductDetail {
  const category = seedCategories.find((c) => c.slug === p.categorySlug);
  return {
    slug: p.slug,
    title: p.title,
    tagline: p.tagline,
    productType: p.productType,
    level: p.level,
    isFree: p.isFree,
    priceInr: p.priceInr ?? null,
    setupTimeMinutes: p.setupTimeMinutes,
    goalSlug: p.categorySlug,
    categoryName: category?.name ?? p.categorySlug,
    coverImage: null,
    isSample: true,
    shortDescription: p.shortDescription,
    licenseType: p.licenseType,
    licenseText: p.licenseText,
    requirements: p.requirements,
    gallery: [],
    content: p.content,
    files: p.files.map((f) => ({
      label: f.label,
      deliveryType: f.deliveryType,
      fileName: f.fileName ?? null,
      mimeType: f.mimeType ?? null,
      sizeBytes: null,
    })),
  };
}

export const sampleDetails = seedProducts.map(toDetail);

export function toSummary({
  slug,
  title,
  tagline,
  productType,
  level,
  isFree,
  priceInr,
  setupTimeMinutes,
  goalSlug,
  categoryName,
  coverImage,
  isSample,
}: ProductDetail): ProductSummary {
  return {
    slug,
    title,
    tagline,
    productType,
    level,
    isFree,
    priceInr,
    setupTimeMinutes,
    goalSlug,
    categoryName,
    coverImage,
    isSample,
  };
}
