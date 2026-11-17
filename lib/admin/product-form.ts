import { z } from "zod";

import { goals, type GoalSlug } from "@/lib/brand";
import {
  detailsKindFor,
  type ProductTypeKey,
  type TypeDetails,
} from "@/lib/catalogue/content-schema";
import { productSlugSchema } from "@/lib/validators";

/*
 * The owner's product editor works with plain text fields: lists are one
 * item per line, pairs are "first | second". These functions turn the form
 * into database values and back. Saving a draft only checks shapes, so a
 * half-finished product can be saved; publishProblems() decides publishing.
 */

type Kind = TypeDetails["kind"];
type FieldType = "list" | "text" | "long" | "number" | "pairs" | "modules";
export type DetailField = {
  key: string;
  label: string;
  type: FieldType;
  hint?: string;
  pairKeys?: [string, string];
};

/** The type-specific fields shown for each kind of product. */
export const detailFields: Record<Kind, DetailField[]> = {
  notion: [
    { key: "organizes", label: "What it organises", type: "list" },
    { key: "duplicateSteps", label: "How to duplicate it into Notion", type: "list" },
    { key: "customization", label: "Ways to customise it (optional)", type: "list" },
    { key: "notionPlan", label: "Notion plan needed", type: "text", hint: "e.g. Free plan works" },
  ],
  text_resource: [
    { key: "samplePreview", label: "Sample preview (shown publicly)", type: "long" },
    { key: "compatibleApps", label: "Apps it works with", type: "list" },
    {
      key: "whenToUse",
      label: "When to use each part",
      type: "pairs",
      pairKeys: ["name", "use"],
      hint: "Name | when to use it",
    },
    { key: "fileDetails", label: "File details (optional)", type: "text" },
  ],
  model_3d: [
    { key: "dimensions", label: "Dimensions (optional)", type: "text" },
    { key: "formats", label: "File formats", type: "list" },
    { key: "compatibility", label: "Printers / slicers it works with", type: "list" },
    { key: "printSettings.layerHeight", label: "Layer height (only if tested)", type: "text" },
    { key: "printSettings.infill", label: "Infill (only if tested)", type: "text" },
    { key: "printSettings.supports", label: "Supports (only if tested)", type: "text" },
    { key: "printSettings.nozzle", label: "Nozzle (only if tested)", type: "text" },
    { key: "printSettings.material", label: "Material (only if tested)", type: "text" },
    { key: "assembly", label: "Assembly steps (optional)", type: "list" },
  ],
  reading: [
    { key: "contents", label: "What’s inside (chapters or sections)", type: "list" },
    { key: "readingLevel", label: "Reading level (optional)", type: "text" },
    { key: "pageCount", label: "Page count (optional)", type: "number" },
    { key: "extras", label: "Extras (optional)", type: "list" },
  ],
  course: [
    { key: "outcomes", label: "What learners will be able to do", type: "list" },
    {
      key: "modules",
      label: "Modules and lessons",
      type: "modules",
      hint: "A module title on its own line, then its lessons as “- Lesson title | minutes”",
    },
    { key: "access", label: "How access works", type: "text" },
  ],
  design_kit: [
    { key: "software", label: "Software it works with", type: "list" },
    { key: "formats", label: "File formats", type: "list" },
    { key: "importSteps", label: "How to import it", type: "list" },
    { key: "components", label: "Components included (optional)", type: "list" },
  ],
  bundle: [{ key: "combinedOutcome", label: "What the bundle achieves together", type: "long" }],
};

const lines = (value: string) =>
  value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

function splitPair(line: string): [string, string] {
  const at = line.indexOf("|");
  return at < 0 ? [line, ""] : [line.slice(0, at).trim(), line.slice(at + 1).trim()];
}

const pairs = (value: string, [a, b]: [string, string]) =>
  lines(value).map((line) => {
    const [first, second] = splitPair(line);
    return { [a]: first, [b]: second };
  });

const optionalText = (value: string) => value.trim() || undefined;
const optionalInt = (value: string) =>
  /^\d+$/.test(value.trim()) ? Number(value.trim()) : undefined;

function parseModules(value: string) {
  const modules: { title: string; lessons: { title: string; minutes?: number }[] }[] = [];
  for (const line of lines(value)) {
    if (line.startsWith("-")) {
      const [title, minutes] = splitPair(line.slice(1).trim());
      if (!modules.length) modules.push({ title: "", lessons: [] });
      modules.at(-1)!.lessons.push({ title, minutes: optionalInt(minutes) });
    } else {
      modules.push({ title: line, lessons: [] });
    }
  }
  return modules;
}

function readDetail(field: DetailField, value: string) {
  switch (field.type) {
    case "list":
      return lines(value);
    case "pairs":
      return pairs(value, field.pairKeys!);
    case "number":
      return optionalInt(value);
    case "modules":
      return parseModules(value);
    default:
      return optionalText(value);
  }
}

function writeDetail(field: DetailField, value: unknown): string {
  if (value == null) return "";
  switch (field.type) {
    case "list":
      return Array.isArray(value) ? value.join("\n") : "";
    case "pairs": {
      const [a, b] = field.pairKeys!;
      return Array.isArray(value)
        ? value
            .map((item: Record<string, string>) => `${item[a] ?? ""} | ${item[b] ?? ""}`)
            .join("\n")
        : "";
    }
    case "modules":
      return Array.isArray(value)
        ? value
            .flatMap((m: { title: string; lessons?: { title: string; minutes?: number }[] }) => [
              m.title,
              ...(m.lessons ?? []).map((l) => `- ${l.title}${l.minutes ? ` | ${l.minutes}` : ""}`),
            ])
            .join("\n")
        : "";
    default:
      return String(value);
  }
}

function getPath(object: Record<string, unknown>, path: string) {
  return path
    .split(".")
    .reduce<unknown>((at, key) => (at as Record<string, unknown>)?.[key], object);
}

function setPath(object: Record<string, unknown>, path: string, value: unknown) {
  if (value === undefined) return;
  const keys = path.split(".");
  let at = object;
  for (const key of keys.slice(0, -1)) at = (at[key] ??= {}) as Record<string, unknown>;
  at[keys.at(-1)!] = value;
}

const goalSlugs = goals.map((goal) => goal.slug) as [GoalSlug, ...GoalSlug[]];
const productTypes = Object.keys(detailsKindFor) as [ProductTypeKey, ...ProductTypeKey[]];
// Links shown on public pages must be https or a path on this site, never javascript: etc.
const publicUrl = z
  .string()
  .trim()
  .max(500)
  .refine((v) => v === "" || /^https:\/\/\S+$/.test(v) || /^\/(?!\/)\S*$/.test(v), {
    message: "Links must start with https:// or /",
  });

const columnsSchema = z.object({
  title: z.string().trim().min(1, "Add a title.").max(200),
  slug: productSlugSchema.refine(Boolean, "Add a web address."),
  tagline: z.string().trim().max(300),
  shortDescription: z.string().trim().max(2000),
  productType: z.enum(productTypes),
  goal: z.enum(goalSlugs),
  level: z.enum(["beginner", "intermediate", "advanced"]),
  isFree: z.boolean(),
  priceRupees: z
    .string()
    .trim()
    .regex(/^(\d{1,7})?$/, "Price must be whole rupees, like 499."),
  setupTimeMinutes: z
    .string()
    .trim()
    .regex(/^(\d{1,5})?$/, "Setup time must be a number of minutes."),
  coverImage: publicUrl,
  previewVideoUrl: publicUrl,
  licenseType: z.enum(["personal", "commercial", "team"]),
  licenseText: z.string().trim().max(3000),
  version: z.string().trim().min(1, "Add a version, like 1.0.").max(40),
  featured: z.boolean(),
  seoTitle: z.string().trim().max(200),
  seoDescription: z.string().trim().max(500),
});

export type ProductValues = {
  title: string;
  slug: string;
  tagline: string;
  shortDescription: string;
  productType: ProductTypeKey;
  goal: GoalSlug;
  level: "beginner" | "intermediate" | "advanced";
  isFree: boolean;
  priceInr: number | null;
  setupTimeMinutes: number | null;
  coverImage: string | null;
  previewVideoUrl: string | null;
  licenseType: "personal" | "commercial" | "team";
  licenseText: string | null;
  version: string;
  featured: boolean;
  seoTitle: string | null;
  seoDescription: string | null;
  requirements: unknown[];
  gallery: unknown[];
  contentJson: Record<string, unknown>;
};

const text = (form: FormData, key: string) => String(form.get(key) ?? "");

/** Builds product-page content from the section fields. */
function contentFromFields(form: FormData, productType: ProductTypeKey) {
  const kind = detailsKindFor[productType];
  const typeDetails: Record<string, unknown> = { kind };
  for (const field of detailFields[kind]) {
    setPath(typeDetails, field.key, readDetail(field, text(form, `td.${field.key}`)));
  }
  const minutes = optionalInt(text(form, "firstWinMinutes"));
  return {
    benefit: lines(text(form, "benefit")),
    audience: lines(text(form, "audience")),
    notFor: lines(text(form, "notFor")),
    firstWin: {
      title: text(form, "firstWinTitle").trim(),
      description: text(form, "firstWinDescription").trim(),
      ...(minutes ? { minutes } : {}),
    },
    steps: pairs(text(form, "steps"), ["title", "body"]),
    results: lines(text(form, "results")),
    problems: pairs(text(form, "problems"), ["problem", "fix"]),
    faq: pairs(text(form, "faq"), ["question", "answer"]),
    ...(optionalText(text(form, "support")) ? { support: text(form, "support").trim() } : {}),
    typeDetails,
  };
}

/**
 * Reads the editor form. The "advanced" JSON box wins only when the owner
 * actually changed it; otherwise the section fields are the source.
 */
export function readProductForm(
  form: FormData,
): { ok: true; values: ProductValues } | { ok: false; message: string } {
  const parsed = columnsSchema.safeParse({
    ...Object.fromEntries(Object.keys(columnsSchema.shape).map((k) => [k, text(form, k)])),
    isFree: form.get("isFree") === "on",
    featured: form.get("featured") === "on",
  });
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]!.message };
  const v = parsed.data;

  let contentJson: Record<string, unknown> = contentFromFields(form, v.productType);
  const advanced = text(form, "advancedJson").trim();
  if (advanced && advanced !== text(form, "advancedOriginal").trim()) {
    try {
      const json = JSON.parse(advanced);
      if (!json || typeof json !== "object" || Array.isArray(json)) throw new Error();
      contentJson = json;
    } catch {
      return {
        ok: false,
        message: "The advanced box isn’t valid JSON. Fix it or undo your change.",
      };
    }
  }

  const priceRupees = v.priceRupees ? Number(v.priceRupees) : null;
  if (!v.isFree && priceRupees !== null && priceRupees < 1)
    return { ok: false, message: "A paid price must be at least ₹1." };

  return {
    ok: true,
    values: {
      title: v.title,
      slug: v.slug,
      tagline: v.tagline,
      shortDescription: v.shortDescription,
      productType: v.productType,
      goal: v.goal,
      level: v.level,
      isFree: v.isFree,
      // Free products carry no price at all (database rule).
      priceInr: v.isFree || priceRupees === null ? null : priceRupees * 100,
      setupTimeMinutes: v.setupTimeMinutes ? Number(v.setupTimeMinutes) : null,
      coverImage: v.coverImage || null,
      previewVideoUrl: v.previewVideoUrl || null,
      licenseType: v.licenseType,
      licenseText: v.licenseText || null,
      version: v.version,
      featured: v.featured,
      seoTitle: v.seoTitle || null,
      seoDescription: v.seoDescription || null,
      requirements: lines(text(form, "requirements")).map((line) => {
        const [name = "", cost = "", note = ""] = line.split("|").map((part) => part.trim());
        // "free or paid" → free_or_paid; anything unknown is caught by the publish check.
        return {
          name,
          cost: cost.toLowerCase().replace(/[\s-]+/g, "_"),
          ...(note ? { note } : {}),
        };
      }),
      gallery: lines(text(form, "gallery")).map((line) => {
        const [src = "", alt = "", width = "", height = ""] = line.split("|").map((p) => p.trim());
        return { src, alt, width: Number(width) || 0, height: Number(height) || 0 };
      }),
      contentJson,
    },
  };
}

type StoredProduct = {
  title: string;
  slug: string;
  tagline: string;
  shortDescription: string;
  productType: ProductTypeKey;
  goal: string;
  level: string;
  isFree: boolean;
  priceInr: number | null;
  setupTimeMinutes: number | null;
  coverImage: string | null;
  previewVideoUrl: string | null;
  licenseType: string;
  licenseText: string | null;
  version: string;
  featured: boolean;
  seoTitle: string | null;
  seoDescription: string | null;
  requirements: unknown;
  gallery: unknown;
  contentJson: unknown;
};

/** The editor's starting text for every field. */
export function productFormDefaults(p: StoredProduct): Record<string, string> {
  const content = (p.contentJson ?? {}) as Record<string, unknown>;
  const details = (content.typeDetails ?? {}) as Record<string, unknown>;
  const firstWin = (content.firstWin ?? {}) as Record<string, unknown>;
  const asLines = (value: unknown) => (Array.isArray(value) ? value.join("\n") : "");
  const asPairs = (value: unknown, [a, b]: [string, string]) =>
    Array.isArray(value)
      ? value
          .map((item: Record<string, unknown>) => `${item[a] ?? ""} | ${item[b] ?? ""}`)
          .join("\n")
      : "";
  const defaults: Record<string, string> = {
    title: p.title,
    slug: p.slug,
    tagline: p.tagline,
    shortDescription: p.shortDescription,
    productType: p.productType,
    goal: p.goal,
    level: p.level,
    priceRupees: p.priceInr ? String(p.priceInr / 100) : "",
    setupTimeMinutes: p.setupTimeMinutes == null ? "" : String(p.setupTimeMinutes),
    coverImage: p.coverImage ?? "",
    previewVideoUrl: p.previewVideoUrl ?? "",
    licenseType: p.licenseType,
    licenseText: p.licenseText ?? "",
    version: p.version,
    seoTitle: p.seoTitle ?? "",
    seoDescription: p.seoDescription ?? "",
    requirements: Array.isArray(p.requirements)
      ? p.requirements
          .map((r: Record<string, unknown>) =>
            [r.name ?? "", r.cost ?? "", r.note ?? ""].join(" | ").replace(/ \| $/, ""),
          )
          .join("\n")
      : "",
    gallery: Array.isArray(p.gallery)
      ? p.gallery
          .map((g: Record<string, unknown>) => [g.src, g.alt, g.width, g.height].join(" | "))
          .join("\n")
      : "",
    benefit: asLines(content.benefit),
    audience: asLines(content.audience),
    notFor: asLines(content.notFor),
    results: asLines(content.results),
    firstWinTitle: String(firstWin.title ?? ""),
    firstWinDescription: String(firstWin.description ?? ""),
    firstWinMinutes: firstWin.minutes == null ? "" : String(firstWin.minutes),
    steps: asPairs(content.steps, ["title", "body"]),
    problems: asPairs(content.problems, ["problem", "fix"]),
    faq: asPairs(content.faq, ["question", "answer"]),
    support: String(content.support ?? ""),
    advancedJson: JSON.stringify(content, null, 2),
  };
  for (const field of detailFields[detailsKindFor[p.productType]]) {
    defaults[`td.${field.key}`] = writeDetail(field, getPath(details, field.key));
  }
  return defaults;
}
