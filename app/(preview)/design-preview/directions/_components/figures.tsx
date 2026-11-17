import type { SVGAttributes } from "react";

import type { ProductTypeKey } from "@/lib/catalogue/content-schema";

/*
 * One drawing per product type, on a 120×90 grid. Each part has a role
 * (surface, line, accent); the three directions paint the roles differently:
 *   line   — A Field Notes: technical line drawing, one vermilion part
 *   flat   — B Bright Workshop: thick ink outlines, solid shapes
 *   object — C Clear Shelf: soft white objects, goal colour as the detail
 */
export type FigureMode = "line" | "flat" | "object";
type Paint = Record<"surface" | "line" | "accent", SVGAttributes<SVGElement>>;

function paints(mode: FigureMode, accent: string): Paint {
  const round = { strokeLinecap: "round", strokeLinejoin: "round" } as const;
  if (mode === "line")
    return {
      surface: { fill: "var(--card)", stroke: "currentColor", strokeWidth: 1.25, ...round },
      line: { fill: "none", stroke: "currentColor", strokeWidth: 1.25, ...round },
      accent: { fill: accent, stroke: "currentColor", strokeWidth: 1.25, ...round },
    };
  if (mode === "flat")
    return {
      surface: { fill: "#ffffff", stroke: "currentColor", strokeWidth: 3, ...round },
      line: { fill: "none", stroke: "currentColor", strokeWidth: 3, ...round },
      accent: { fill: "currentColor", stroke: "currentColor", strokeWidth: 3, ...round },
    };
  return {
    surface: { fill: "#ffffff" },
    line: { fill: "none", stroke: "#b9bab4", strokeWidth: 2.5, ...round },
    accent: { fill: accent },
  };
}

const shapes: Record<ProductTypeKey, (p: Paint) => React.ReactNode> = {
  pdf: (p) => (
    <>
      <rect x="34" y="6" width="52" height="78" rx="3" {...p.surface} />
      {[20, 28].map((y) => (
        <line key={y} x1="43" y1={y} x2="77" y2={y} {...p.line} />
      ))}
      {[42, 56, 70].map((y, i) => (
        <g key={y}>
          <rect
            x="43"
            y={y - 4}
            width="8"
            height="8"
            rx="1.5"
            {...(i === 0 ? p.accent : p.surface)}
          />
          <line x1="56" y1={y} x2={i === 2 ? 68 : 77} y2={y} {...p.line} />
        </g>
      ))}
    </>
  ),
  ebook: (p) => (
    <>
      <path d="M60 20 Q40 11 16 15 V75 Q40 71 60 80 Z" {...p.surface} />
      <path d="M60 20 Q80 11 104 15 V75 Q80 71 60 80 Z" {...p.surface} />
      <line x1="60" y1="20" x2="60" y2="80" {...p.line} />
      {[30, 40, 50].map((y) => (
        <line key={y} x1="24" y1={y - 4} x2="52" y2={y} {...p.line} />
      ))}
      <path d="M78 12 h9 v24 l-4.5 -4 l-4.5 4 Z" {...p.accent} />
    </>
  ),
  course: (p) => (
    <>
      {[10, 36, 62].map((y, i) => (
        <g key={y}>
          <rect x="16" y={y} width="88" height="20" rx="10" {...(i === 0 ? p.accent : p.surface)} />
          {i === 0 ? (
            <path d={`M28 ${y + 5} L37 ${y + 10} L28 ${y + 15} Z`} fill="#ffffff" />
          ) : (
            <circle cx="32" cy={y + 10} r="4" {...p.line} />
          )}
          <line
            x1="46"
            y1={y + 10}
            x2={i === 0 ? 84 : 92}
            y2={y + 10}
            {...p.line}
            {...(i === 0 ? { stroke: "#ffffff" } : {})}
          />
        </g>
      ))}
    </>
  ),
  markdown: (p) => (
    <>
      <rect x="28" y="6" width="64" height="78" rx="3" {...p.surface} />
      <path d="M40 18 v14 M48 18 v14 M37 22 h14 M37 28 h14" {...p.line} />
      <rect x="56" y="20" width="26" height="10" rx="2" {...p.accent} />
      {[44, 54, 64, 74].map((y, i) => (
        <line key={y} x1="38" y1={y} x2={i === 3 ? 64 : 82} y2={y} {...p.line} />
      ))}
    </>
  ),
  prompt_pack: (p) => (
    <>
      <path
        d="M14 14 h60 a8 8 0 0 1 8 8 v18 a8 8 0 0 1 -8 8 h-42 l-10 9 v-9 h-8 a8 8 0 0 1 -8 -8 v-18 a8 8 0 0 1 8 -8 Z"
        {...p.surface}
      />
      <line x1="22" y1="26" x2="70" y2="26" {...p.line} />
      <line x1="22" y1="36" x2="56" y2="36" {...p.line} />
      <path
        d="M46 52 h56 a8 8 0 0 1 8 8 v12 a8 8 0 0 1 -8 8 h-6 v8 l-10 -8 h-40 a8 8 0 0 1 -8 -8 v-12 a8 8 0 0 1 8 -8 Z"
        {...p.accent}
      />
    </>
  ),
  notion: (p) => (
    <>
      {[0, 1, 2].flatMap((col) =>
        [0, 1].map((row) => (
          <rect
            key={`${col}-${row}`}
            x={14 + col * 32}
            y={12 + row * 34}
            width="26"
            height="28"
            rx="3"
            {...(col === 1 && row === 0 ? p.accent : p.surface)}
          />
        )),
      )}
    </>
  ),
  design_kit: (p) => (
    <>
      <rect x="12" y="24" width="50" height="50" rx="4" {...p.surface} />
      <path d="M58 80 L80 42 L102 80 Z" {...p.surface} />
      <circle cx="70" cy="34" r="22" {...p.accent} />
    </>
  ),
  model_3d: (p) => (
    <>
      <path d="M60 6 L98 26 L98 64 L60 84 L22 64 L22 26 Z" {...p.surface} />
      <path d="M60 6 L98 26 L60 46 L22 26 Z" {...p.accent} />
      <path d="M60 46 L60 84 M22 26 L60 46 L98 26" {...p.line} />
    </>
  ),
  bundle: (p) => (
    <>
      <rect x="36" y="6" width="62" height="44" rx="4" {...p.surface} />
      <rect x="28" y="22" width="62" height="44" rx="4" {...p.surface} />
      <rect x="20" y="38" width="62" height="44" rx="4" {...p.accent} />
    </>
  ),
};

export function Figure({
  type,
  mode,
  accent = "var(--primary)",
  className,
}: {
  type: ProductTypeKey;
  mode: FigureMode;
  accent?: string;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 120 90"
      className={className}
      aria-hidden="true"
      focusable="false"
      overflow="visible"
    >
      {shapes[type](paints(mode, accent))}
    </svg>
  );
}
