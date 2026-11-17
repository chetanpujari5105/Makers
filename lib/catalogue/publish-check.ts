import {
  detailsKindFor,
  productContentSchema,
  requirementSchema,
  type ProductTypeKey,
} from "./content-schema";

/*
 * Plain-English reasons a product can't be published yet (PROJECT_SPEC §2.3).
 * Used by the publish script now and by the admin editor in Phase 4.
 */
export type PublishCandidate = {
  title: string;
  tagline: string;
  shortDescription: string;
  productType: ProductTypeKey;
  isFree: boolean;
  priceInr: number | null;
  setupTimeMinutes: number | null;
  licenseText: string | null;
  requirements: unknown;
  contentJson: unknown;
  deliveryCount: number;
};

export function publishProblems(p: PublishCandidate): string[] {
  const problems: string[] = [];
  if (!p.title.trim()) problems.push("Add a title.");
  if (!p.tagline.trim()) problems.push("Add a one-sentence tagline.");
  if (!p.shortDescription.trim()) problems.push("Add a short description.");
  if (!p.isFree && !p.priceInr)
    problems.push("Set a price in rupees, or mark the product as free.");
  if (p.setupTimeMinutes == null) problems.push("Add an estimated setup time.");
  if (!p.licenseText?.trim()) problems.push("Explain what the license allows.");
  if (p.deliveryCount === 0) problems.push("Add at least one file or link for buyers to receive.");

  if (
    !Array.isArray(p.requirements) ||
    !p.requirements.every((r) => requirementSchema.safeParse(r).success)
  ) {
    problems.push(
      "Fix the “What you need” list — each item needs a name and whether it is free or paid.",
    );
  }

  const content = productContentSchema.safeParse(p.contentJson);
  if (!content.success) {
    problems.push(
      "Some product-page sections are missing or incomplete (benefit, audience, first win, 3–5 setup steps, results or type details).",
    );
  } else if (content.data.typeDetails.kind !== detailsKindFor[p.productType]) {
    problems.push("The type-specific details don’t match the product type.");
  }
  return problems;
}
