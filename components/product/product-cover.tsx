import Image from "next/image";

import type { ProductTypeKey } from "@/lib/catalogue/content-schema";
import { productTypeLabel } from "@/lib/catalogue/labels";
import { cn } from "@/lib/utils";

import { Figure } from "./figure";

/*
 * Product cover. Uses the owner's real cover image when one is set; otherwise
 * draws a "figure plate" (direction A, docs/DESIGN.md): the goal's tint, a thin
 * inset frame, a fixed figure number per product type, and a line drawing of
 * what you get with one vermilion part. Only true facts appear on it, so the
 * catalogue never needs stock photos.
 */

const tint: Record<string, string> = {
  create: "bg-cover-create",
  learn: "bg-cover-learn",
  "work-smarter": "bg-cover-work",
  "build-make": "bg-cover-build",
};

/* Fixed numbering, so "Fig. 6" always means a Notion template. */
const figureOrder: ProductTypeKey[] = [
  "pdf",
  "ebook",
  "course",
  "markdown",
  "prompt_pack",
  "notion",
  "design_kit",
  "model_3d",
  "bundle",
];

type Props = {
  title: string;
  productType: ProductTypeKey;
  goalSlug: string;
  coverImage: string | null;
  /** "card" and "hero" show the figure number and type; "thumb" is the drawing only. */
  size?: "card" | "hero" | "thumb";
  className?: string;
};

export function ProductCover({
  title,
  productType,
  goalSlug,
  coverImage,
  size = "card",
  className,
}: Props) {
  const hero = size === "hero";
  const thumb = size === "thumb";
  const frame = cn(
    "relative w-full overflow-hidden",
    hero ? "aspect-[3/2] lg:aspect-[4/3]" : "aspect-[4/3]",
    tint[goalSlug] ?? "bg-muted",
    className,
  );

  if (coverImage) {
    return (
      <div className={frame}>
        <Image
          src={coverImage}
          alt={hero ? `Cover of ${title}` : ""}
          fill
          sizes={
            hero
              ? "(min-width: 1024px) 50vw, 100vw"
              : "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          }
          className="object-cover"
          priority={hero}
        />
      </div>
    );
  }

  return (
    <div
      className={frame}
      role={hero ? "img" : undefined}
      aria-label={hero ? `Cover of ${title}: ${productTypeLabel[productType]}` : undefined}
      aria-hidden={hero ? undefined : true}
    >
      <div
        className={cn(
          "absolute border border-foreground/20",
          thumb ? "inset-1.5" : hero ? "inset-3 sm:inset-4" : "inset-2.5",
        )}
      />
      {thumb ? null : (
        <div
          className={cn(
            "absolute inset-x-0 top-0 flex items-baseline justify-between gap-3 text-sm text-foreground",
            hero ? "p-7 sm:p-9" : "p-5",
          )}
        >
          <span className="font-semibold tracking-[0.12em] uppercase">
            Fig. {figureOrder.indexOf(productType) + 1}
          </span>
          <span>{productTypeLabel[productType]}</span>
        </div>
      )}
      <Figure
        type={productType}
        mode="line"
        className={cn(
          "absolute top-1/2 left-1/2 -translate-x-1/2 text-foreground",
          thumb
            ? "w-[66%] -translate-y-1/2"
            : hero
              ? "w-[42%] -translate-y-[44%]"
              : "w-[50%] -translate-y-[42%]",
        )}
      />
    </div>
  );
}
