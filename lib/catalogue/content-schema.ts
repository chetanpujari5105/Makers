import { z } from "zod";

/*
 * Shape of the owner-editable product-page content stored in Postgres
 * (products.content_json, products.requirements, products.gallery).
 * Every read from the database is parsed with these schemas, so a bad row
 * shows a clear error instead of a broken page.
 */

const text = z.string().trim().min(1);
const list = z.array(text);

export const requirementSchema = z.object({
  name: text,
  /** Is the tool free, paid, or free with paid upgrades? */
  cost: z.enum(["free", "paid", "free_or_paid"]),
  note: text.optional(),
});

export const galleryImageSchema = z.object({
  src: text,
  alt: text,
  width: z.number().int().positive(),
  height: z.number().int().positive(),
});

const typeDetailsSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("notion"),
    organizes: list.min(1),
    duplicateSteps: list.min(1),
    customization: list.default([]),
    notionPlan: text,
  }),
  z.object({
    kind: z.literal("text_resource"), // markdown resources and prompt packs
    samplePreview: text,
    compatibleApps: list.min(1),
    whenToUse: z.array(z.object({ name: text, use: text })).min(1),
    fileDetails: text.optional(),
  }),
  z.object({
    kind: z.literal("model_3d"),
    dimensions: text.optional(),
    formats: list.min(1),
    compatibility: list.min(1),
    /** Only when tested or supplied by the creator — never invented. */
    printSettings: z
      .object({
        layerHeight: text.optional(),
        infill: text.optional(),
        supports: text.optional(),
        nozzle: text.optional(),
        material: text.optional(),
      })
      .optional(),
    assembly: list.default([]),
  }),
  z.object({
    kind: z.literal("reading"), // pdf, ebook, workbook
    contents: list.min(1),
    readingLevel: text.optional(),
    pageCount: z.number().int().positive().optional(),
    extras: list.default([]),
  }),
  z.object({
    kind: z.literal("course"),
    outcomes: list.min(1),
    modules: z
      .array(
        z.object({
          title: text,
          lessons: z.array(
            z.object({ title: text, minutes: z.number().int().positive().optional() }),
          ),
        }),
      )
      .min(1),
    access: text,
  }),
  z.object({
    kind: z.literal("design_kit"),
    software: list.min(1),
    formats: list.min(1),
    importSteps: list.min(1),
    components: list.default([]),
  }),
  z.object({ kind: z.literal("bundle"), combinedOutcome: text }),
]);

export const productContentSchema = z.object({
  benefit: list.min(1),
  audience: list.min(1),
  notFor: list.default([]),
  firstWin: z.object({ title: text, description: text, minutes: z.number().int().positive() }),
  steps: z
    .array(z.object({ title: text, body: text }))
    .min(3)
    .max(5),
  results: list.min(1),
  problems: z.array(z.object({ problem: text, fix: text })).default([]),
  faq: z.array(z.object({ question: text, answer: text })).default([]),
  support: text.optional(),
  typeDetails: typeDetailsSchema,
});

export type ProductContent = z.infer<typeof productContentSchema>;
export type TypeDetails = ProductContent["typeDetails"];
export type Requirement = z.infer<typeof requirementSchema>;
export type GalleryImage = z.infer<typeof galleryImageSchema>;

/** Which typeDetails kind each product type must use. */
export const detailsKindFor = {
  notion: "notion",
  markdown: "text_resource",
  prompt_pack: "text_resource",
  model_3d: "model_3d",
  pdf: "reading",
  ebook: "reading",
  course: "course",
  design_kit: "design_kit",
  bundle: "bundle",
} as const satisfies Record<string, TypeDetails["kind"]>;

export type ProductTypeKey = keyof typeof detailsKindFor;
