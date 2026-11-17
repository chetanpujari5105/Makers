import {
  detailsKindFor,
  galleryImageSchema,
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
  gallery?: unknown;
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

  if (
    p.gallery !== undefined &&
    (!Array.isArray(p.gallery) || !p.gallery.every((g) => galleryImageSchema.safeParse(g).success))
  ) {
    problems.push(
      "Fix the gallery — each image needs a link, a description, a width and a height.",
    );
  }

  const content = productContentSchema.safeParse(p.contentJson);
  if (!content.success) {
    const seen = new Set<string>();
    for (const issue of content.error.issues) {
      const key = String(issue.path[0] ?? "");
      const label = sectionLabels[key] ?? key;
      if (seen.has(label)) continue;
      seen.add(label);
      const detail = key === "typeDetails" && issue.path[1] ? ` (${String(issue.path[1])})` : "";
      problems.push(`Complete “${label}”${detail}${sizeHint(key, issue)}.`);
    }
  } else if (content.data.typeDetails.kind !== detailsKindFor[p.productType]) {
    problems.push("The type-specific details don’t match the product type.");
  }
  return problems;
}

const sectionLabels: Record<string, string> = {
  benefit: "What this does for you",
  audience: "Who it’s for",
  notFor: "Who it’s not for",
  firstWin: "Your first win (title, description and minutes)",
  steps: "Setup steps",
  results: "Results to work towards",
  problems: "Common problems",
  faq: "Questions",
  support: "Help note",
  typeDetails: "Type-specific details",
};

function sizeHint(key: string, issue: { code: string; path: PropertyKey[] }) {
  if (key === "steps" && issue.path.length === 1) return " — it needs 3 to 5 steps";
  if (issue.code === "too_small" && issue.path.length <= 2) return " — add at least one item";
  return "";
}
