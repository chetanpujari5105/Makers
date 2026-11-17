import type { ProductTypeKey } from "./content-schema";
import type { PublicFile } from "./types";

export const productTypeLabel: Record<ProductTypeKey, string> = {
  pdf: "PDF workbook",
  ebook: "Ebook",
  course: "Course",
  markdown: "Markdown guide",
  notion: "Notion template",
  design_kit: "Design kit",
  prompt_pack: "Prompt pack",
  model_3d: "3D model",
  bundle: "Bundle",
};

export const levelLabel = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
} as const;

export const licenseLabel = {
  personal: "Personal use",
  commercial: "Commercial use",
  team: "Team use",
} as const;

export const costLabel = { free: "Free", paid: "Paid", free_or_paid: "Free or paid" } as const;

export function formatMinutes(minutes: number) {
  if (minutes < 60) return `${minutes}\u00a0min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h}\u00a0hr ${m}\u00a0min` : `${h}\u00a0hr`;
}

export function fileFormat(file: PublicFile) {
  const ext = file.fileName?.split(".").pop();
  if (ext && ext !== file.fileName) return ext.toUpperCase();
  return file.deliveryType === "lesson_resource" ? "Online lessons" : "Online link";
}

export function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
