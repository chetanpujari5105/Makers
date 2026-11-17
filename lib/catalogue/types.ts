import type { GalleryImage, ProductContent, ProductTypeKey, Requirement } from "./content-schema";

/*
 * What public pages receive. Deliberately has NO file keys or private links:
 * the query layer never selects them, so a page can't leak them by mistake.
 */
export type ProductSummary = {
  slug: string;
  title: string;
  tagline: string;
  productType: ProductTypeKey;
  level: "beginner" | "intermediate" | "advanced";
  isFree: boolean;
  priceInr: number | null;
  setupTimeMinutes: number | null;
  goalSlug: string;
  categoryName: string;
  coverImage: string | null;
  isSample: boolean;
};

export type PublicFile = {
  label: string;
  deliveryType: "file" | "external_link" | "lesson_resource";
  fileName: string | null;
  mimeType: string | null;
  sizeBytes: number | null;
};

export type ProductDetail = ProductSummary & {
  shortDescription: string;
  licenseType: "personal" | "commercial" | "team";
  licenseText: string | null;
  requirements: Requirement[];
  gallery: GalleryImage[];
  content: ProductContent;
  files: PublicFile[];
};
