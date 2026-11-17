import Image from "next/image";

import type { ProductTypeKey } from "@/lib/catalogue/content-schema";
import { productTypeLabel } from "@/lib/catalogue/labels";
import { cn } from "@/lib/utils";

/*
 * Product cover. Uses the owner's real cover image when one is set; otherwise
 * draws a consistent typographic cover (goal tint + a geometric mark for the
 * product type) so the catalogue never needs stock photos.
 */

const tint: Record<string, string> = {
  create: "bg-cover-create",
  learn: "bg-cover-learn",
  "work-smarter": "bg-cover-work",
  "build-make": "bg-cover-build",
};

type Props = {
  title: string;
  productType: ProductTypeKey;
  goalSlug: string;
  coverImage: string | null;
  /** "card" hides the title (the card shows it); "hero" prints it; "thumb" is the mark only. */
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
  const frame = cn(
    "relative w-full overflow-hidden",
    hero ? "aspect-[3/2] lg:aspect-[4/3]" : "aspect-[4/3]",
    hero ? "rounded-xl" : "",
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
      aria-label={hero ? `Cover of ${title}` : undefined}
      aria-hidden={hero ? undefined : true}
    >
      <TypeMark
        type={productType}
        className={cn(
          "absolute text-foreground/75",
          hero
            ? "top-[9%] right-[7%] w-[38%]"
            : size === "thumb"
              ? "inset-x-[18%] top-1/2 w-[64%] -translate-y-1/2"
              : "right-[9%] bottom-[12%] w-[44%]",
        )}
      />
      {size === "thumb" ? null : (
        <div
          className={cn(
            "absolute inset-0 flex flex-col justify-between",
            hero ? "p-6 sm:p-8" : "p-5",
          )}
        >
          <span className="text-sm font-medium text-foreground/80">
            {productTypeLabel[productType]}
          </span>
          {hero ? (
            <span className="max-w-[13ch] font-display text-[clamp(1.75rem,1.2rem+2.2vw,3rem)] leading-[1.02] tracking-[-0.025em] text-balance">
              {title}
            </span>
          ) : null}
        </div>
      )}
    </div>
  );
}

/* Crisp geometric marks — one per product type, drawn on a 120×90 grid. */
function TypeMark({ type, className }: { type: ProductTypeKey; className?: string }) {
  const stroke = {
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  const accent = "var(--primary)";
  let shape: React.ReactNode;

  switch (type) {
    case "pdf":
    case "ebook":
      shape = (
        <>
          <rect
            x="30"
            y="10"
            width="54"
            height="70"
            rx="3"
            fill="none"
            {...stroke}
            transform="rotate(-6 57 45)"
          />
          <rect x="40" y="8" width="54" height="70" rx="3" fill="var(--card)" {...stroke} />
          {[22, 30, 38, 46].map((y) => (
            <line key={y} x1="49" y1={y} x2={y === 46 ? 70 : 85} y2={y} {...stroke} />
          ))}
          <rect x="49" y="56" width="22" height="12" rx="2" fill={accent} />
        </>
      );
      break;
    case "course":
      shape = (
        <>
          {[12, 37, 62].map((y, i) => (
            <g key={y}>
              <rect
                x="18"
                y={y}
                width="84"
                height="18"
                rx="9"
                fill={i === 0 ? accent : "var(--card)"}
                {...(i === 0 ? {} : stroke)}
              />
              <circle cx="31" cy={y + 9} r="4" fill={i === 0 ? "var(--card)" : "currentColor"} />
              <line
                x1="44"
                y1={y + 9}
                x2={i === 0 ? 80 : 88}
                y2={y + 9}
                {...stroke}
                stroke={i === 0 ? "var(--card)" : "currentColor"}
              />
            </g>
          ))}
        </>
      );
      break;
    case "markdown":
    case "prompt_pack":
      shape = (
        <>
          <path
            d="M34 12 C24 12 26 30 18 45 C26 60 24 78 34 78"
            fill="none"
            {...stroke}
            strokeWidth={2}
          />
          <path
            d="M86 12 C96 12 94 30 102 45 C94 60 96 78 86 78"
            fill="none"
            {...stroke}
            strokeWidth={2}
          />
          <line x1="42" y1="32" x2="78" y2="32" {...stroke} />
          <line x1="42" y1="45" x2="70" y2="45" {...stroke} />
          <rect x="42" y="54" width="20" height="8" rx="4" fill={accent} />
        </>
      );
      break;
    case "notion":
      shape = (
        <>
          {[0, 1, 2].flatMap((col) =>
            [0, 1].map((row) => (
              <rect
                key={`${col}-${row}`}
                x={14 + col * 32}
                y={14 + row * 33}
                width="26"
                height="27"
                rx="3"
                fill={col === 1 && row === 0 ? accent : "var(--card)"}
                {...(col === 1 && row === 0 ? {} : stroke)}
              />
            )),
          )}
        </>
      );
      break;
    case "design_kit":
      shape = (
        <>
          <rect x="14" y="20" width="56" height="56" rx="4" fill="var(--card)" {...stroke} />
          <circle cx="74" cy="40" r="28" fill={accent} fillOpacity="0.9" />
          <circle cx="74" cy="40" r="28" fill="none" {...stroke} />
        </>
      );
      break;
    case "model_3d":
      shape = (
        <>
          <path d="M60 8 L98 28 L98 64 L60 84 L22 64 L22 28 Z" fill="var(--card)" {...stroke} />
          <path d="M22 28 L60 48 L98 28 M60 48 L60 84" fill="none" {...stroke} />
          <path d="M60 8 L98 28 L60 48 L22 28 Z" fill={accent} />
        </>
      );
      break;
    case "bundle":
      shape = (
        <>
          <rect x="34" y="8" width="60" height="44" rx="4" fill="var(--card)" {...stroke} />
          <rect x="26" y="22" width="60" height="44" rx="4" fill="var(--card)" {...stroke} />
          <rect x="18" y="36" width="60" height="44" rx="4" fill={accent} />
        </>
      );
      break;
  }

  return (
    <svg viewBox="0 0 120 90" className={className} aria-hidden="true" focusable="false">
      {shape}
    </svg>
  );
}
