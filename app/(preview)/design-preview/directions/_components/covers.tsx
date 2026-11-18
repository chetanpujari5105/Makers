import type { ProductTypeKey } from "@/lib/catalogue/content-schema";
import { levelLabel, productTypeLabel } from "@/lib/catalogue/labels";
import type { ProductSummary } from "@/lib/catalogue/types";
import { formatInr } from "@/lib/money";
import { cn } from "@/lib/utils";

import type { DirectionId } from "../_lib/directions";
import { Figure } from "@/components/product/figure";

const goalBg: Record<string, string> = {
  create: "bg-cover-create",
  learn: "bg-cover-learn",
  "work-smarter": "bg-cover-work",
  "build-make": "bg-cover-build",
};

/* Detail colour for C's objects (decorative fills, never text). */
const goalObject: Record<string, string> = {
  create: "#d9694a",
  learn: "#3e6fb0",
  "work-smarter": "#2f8f6b",
  "build-make": "#c9962e",
};

const typeOrder: ProductTypeKey[] = [
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

type CoverInput = {
  productType: ProductTypeKey;
  goalSlug: string;
  level?: ProductSummary["level"];
  setupTimeMinutes?: number | null;
};

export function DirectionCover({
  dir,
  product,
  className,
  bare = false,
}: {
  dir: DirectionId;
  product: CoverInput;
  className?: string;
  /** Drawing only: hides the text labels (for small thumbnails). */
  bare?: boolean;
}) {
  const { productType, goalSlug, level, setupTimeMinutes } = product;
  const facts = [
    level ? levelLabel[level] : null,
    setupTimeMinutes ? `${setupTimeMinutes} min setup` : null,
  ]
    .filter(Boolean)
    .join(" · ");
  const frame = cn(
    "relative aspect-[4/3] w-full overflow-hidden",
    goalBg[goalSlug] ?? "bg-muted",
    bare && "[&>span]:hidden",
    className,
  );

  if (dir === "a")
    return (
      <div className={frame} aria-hidden="true">
        <div className="absolute inset-2.5 border border-foreground/20" />
        <span className="absolute top-5 left-5 text-sm font-semibold tracking-[0.12em] text-foreground/75 uppercase">
          Fig. {typeOrder.indexOf(productType) + 1}
        </span>
        <span className="absolute top-5 right-5 text-sm text-foreground/75">
          {productTypeLabel[productType]}
        </span>
        <Figure
          type={productType}
          mode="line"
          className="absolute top-1/2 left-1/2 w-[50%] -translate-x-1/2 -translate-y-[46%] text-foreground"
        />
        {facts ? (
          <span className="absolute bottom-4 left-5 text-sm text-foreground/75">{facts}</span>
        ) : null}
      </div>
    );

  if (dir === "b")
    return (
      <div className={cn(frame, "rounded-[1.25rem]")} aria-hidden="true">
        <span className="absolute top-4 left-4 z-10 -rotate-2 rounded-full bg-white px-3 py-1 text-sm font-semibold text-foreground shadow-[0_2px_0_var(--foreground)] outline-2 outline-foreground">
          {productTypeLabel[productType]}
        </span>
        <Figure
          type={productType}
          mode="flat"
          className="absolute right-[-6%] bottom-[-8%] w-[78%] text-foreground"
        />
      </div>
    );

  return (
    <div className={cn(frame, "rounded-[1.5rem]")} aria-hidden="true">
      <div className="absolute inset-x-[22%] bottom-[16%] h-[7%] rounded-[50%] bg-foreground/10 blur-md" />
      <Figure
        type={productType}
        mode="object"
        accent={goalObject[goalSlug]}
        className="absolute top-[44%] left-1/2 w-[46%] -translate-x-1/2 -translate-y-1/2 drop-shadow-[0_10px_14px_rgb(17_19_18/0.12)]"
      />
      <span className="absolute inset-x-0 bottom-4 text-center text-sm text-muted-foreground">
        {productTypeLabel[productType]}
      </span>
    </div>
  );
}

/* All nine product types, cycling through the four goals. */
export function CoverSheet({ dir }: { dir: DirectionId }) {
  const goals = ["learn", "work-smarter", "create", "build-make"];
  return (
    <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3">
      {typeOrder.map((type, i) => (
        <li key={type} className="flex flex-col gap-2">
          <DirectionCover
            dir={dir}
            product={{
              productType: type,
              goalSlug: goals[i % 4]!,
              level: "beginner",
              setupTimeMinutes: 10 + i * 5,
            }}
          />
          <span className="text-sm text-muted-foreground">
            {productTypeLabel[type]} · {goals[i % 4]}
          </span>
        </li>
      ))}
    </ul>
  );
}

export function DirectionCard({ dir, product }: { dir: DirectionId; product: ProductSummary }) {
  const price = product.isFree ? "Free" : product.priceInr ? formatInr(product.priceInr) : "";
  const meta = `${productTypeLabel[product.productType]} · ${levelLabel[product.level]}`;

  if (dir === "a")
    return (
      <article className="flex flex-col gap-4 border-t border-foreground pt-4">
        <DirectionCover dir="a" product={product} />
        <div className="flex items-baseline justify-between gap-4">
          <h3 className="text-h3">{product.title}</h3>
          <p className="tabular shrink-0 font-display text-h3 text-primary">{price}</p>
        </div>
        <p className="text-muted-foreground">{product.tagline}</p>
        <p className="text-sm text-muted-foreground">{meta}</p>
      </article>
    );

  if (dir === "b")
    return (
      <article className="flex flex-col gap-4 rounded-[1.5rem] bg-card p-3 pb-5 shadow-[0_0_0_2px_var(--foreground)]">
        <DirectionCover dir="b" product={product} />
        <div className="flex flex-col gap-2 px-2">
          <h3 className="text-h3">{product.title}</h3>
          <p className="text-muted-foreground">{product.tagline}</p>
          <div className="flex items-center justify-between gap-4 pt-1">
            <p className="text-sm text-muted-foreground">{meta}</p>
            <p className="tabular rounded-full bg-foreground px-3 py-1 font-semibold text-background">
              {price}
            </p>
          </div>
        </div>
      </article>
    );

  return (
    <article className="flex flex-col gap-3">
      <DirectionCover dir="c" product={product} />
      <div className="flex flex-col gap-1 px-1">
        <p className="text-sm text-muted-foreground">{meta}</p>
        <h3 className="text-[1.25rem] leading-snug">{product.title}</h3>
        <p className="text-muted-foreground">{product.tagline}</p>
        <p className="tabular pt-1 font-semibold">{price}</p>
      </div>
    </article>
  );
}
