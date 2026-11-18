import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRightIcon, ClockIcon } from "lucide-react";

import { sampleDetails, toSummary } from "@/app/(site)/design-preview/_data/sample-views";
import { Container } from "@/components/layout/container";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Button } from "@/components/ui/button";
import { goals } from "@/lib/brand";
import { levelLabel, productTypeLabel } from "@/lib/catalogue/labels";
import { formatInr } from "@/lib/money";
import { cn } from "@/lib/utils";

import { CoverSheet, DirectionCard, DirectionCover } from "../_components/covers";
import { Figure } from "@/components/product/figure";
import { HeroA, HeroB, HeroC } from "../_components/heroes";
import { directionIds, directions, type Direction, type DirectionId } from "../_lib/directions";
import "../directions.css";

/*
 * Owner review only: three proposed visual directions as static mockups.
 * Sample (seed) content, not the live store. 404 on Vercel production, hidden
 * from search engines. Delete this route once a direction is chosen and built.
 */
export const metadata: Metadata = {
  title: "Design directions (draft)",
  robots: { index: false, follow: false },
};

export const instant = false;

export function generateStaticParams() {
  return [{ id: [] }, ...directionIds.map((id) => ({ id: [id] }))];
}

const summaries = sampleDetails.map(toSummary);
const featured = [
  "freelance-project-tracker",
  "first-salary-budget-workbook",
  "small-shop-social-post-kit",
]
  .map((slug) => summaries.find((p) => p.slug === slug))
  .filter((p) => p !== undefined);

export default async function DirectionsPage({
  params,
}: PageProps<"/design-preview/directions/[[...id]]">) {
  if (process.env.VERCEL_ENV === "production") notFound();
  const { id } = await params;
  if (!id || id.length === 0) return <Overview />;
  const dir = id.length === 1 ? directions[id[0] as DirectionId] : undefined;
  if (!dir) notFound();
  return <DirectionMockup dir={dir} />;
}

function Overview() {
  return (
    <main id="main" className="mx-auto flex max-w-3xl flex-col gap-6 px-6 py-16">
      <h1 className="text-h1">Three design directions</h1>
      <p className="text-lead text-muted-foreground">
        Static mockups built from the sample products. Pick one: A, B or C. Research and reasoning
        are in <code>docs/DESIGN_DIRECTIONS.md</code>.
      </p>
      <ul className="flex flex-col gap-3">
        {directionIds.map((id) => (
          <li key={id}>
            <Link href={`/design-preview/directions/${id}`} className="font-display text-h3">
              {directions[id].letter}. {directions[id].name}
            </Link>
            <p className="text-muted-foreground">{directions[id].oneLiner}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}

function DirectionMockup({ dir }: { dir: Direction }) {
  const product = sampleDetails.find((p) => p.slug === "freelance-project-tracker")!;
  return (
    <div className={cn("dir min-h-dvh", `dir-${dir.id}`, dir.fontClasses)}>
      <div className="border-b border-warning/30 bg-warning-soft">
        <Container className="flex flex-wrap items-center justify-between gap-x-8 gap-y-2 py-3 text-base">
          <p>
            <strong>
              Direction {dir.letter}: {dir.name}.
            </strong>{" "}
            Mockup with sample content, not the live store.
          </p>
          <nav aria-label="Directions" className="flex gap-5">
            {directionIds.map((id) => (
              <Link
                key={id}
                href={`/design-preview/directions/${id}`}
                aria-current={id === dir.id ? "page" : undefined}
                className="font-medium aria-[current=page]:underline"
              >
                {directions[id].letter}
              </Link>
            ))}
          </nav>
        </Container>
      </div>
      <SiteHeader />
      <main id="main">
        {dir.id === "a" ? <HeroA covers={featured} /> : null}
        {dir.id === "b" ? <HeroB /> : null}
        {dir.id === "c" ? <HeroC covers={summaries} /> : null}

        {dir.id !== "b" ? <Goals id={dir.id} /> : null}

        <section className="py-section">
          <Container className="flex flex-col gap-10">
            <div className="flex items-end justify-between gap-6">
              <h2 className="text-h2">Good places to start</h2>
              <Link
                href="/explore"
                className="inline-flex min-h-11 items-center gap-1.5 font-medium"
              >
                See everything <ArrowRightIcon aria-hidden="true" className="size-4" />
              </Link>
            </div>
            <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((p) => (
                <li key={p.slug}>
                  <DirectionCard dir={dir.id} product={p} />
                </li>
              ))}
            </ul>
          </Container>
        </section>

        <ProductSketch dir={dir} product={product} />

        <section className="border-t border-border py-section">
          <Container className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]">
            <div className="flex flex-col gap-4">
              <h2 className="text-h2">Cover system</h2>
              <p className="text-muted-foreground">{dir.covers}</p>
              <p className="text-muted-foreground">
                Real cover images replace these automatically when the owner uploads one.
              </p>
            </div>
            <CoverSheet dir={dir.id} />
          </Container>
        </section>

        <Spec dir={dir} />
      </main>
      <SiteFooter />
    </div>
  );
}

function Goals({ id }: { id: DirectionId }) {
  const types = {
    create: "design_kit",
    learn: "course",
    "work-smarter": "notion",
    "build-make": "model_3d",
  } as const;
  if (id === "a")
    return (
      <section className="border-t border-foreground/80">
        <Container>
          <h2 className="sr-only">Start with a goal</h2>
          <ol className="grid sm:grid-cols-2 lg:grid-cols-4">
            {goals.map((g, i) => (
              <li
                key={g.slug}
                className="relative flex flex-col gap-2 border-b border-border py-8 sm:border-r sm:px-6 sm:first:pl-0 lg:border-b-0 lg:last:border-r-0"
              >
                <span className="font-display text-h3 text-primary italic">0{i + 1}</span>
                <h3 className="text-h2">
                  <Link
                    href={`/category/${g.slug}`}
                    className="text-foreground no-underline after:absolute after:inset-0"
                  >
                    {g.label}
                  </Link>
                </h3>
                <p>{g.description}</p>
                <p className="text-sm text-muted-foreground">{g.examples}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>
    );
  return (
    <section className="py-12">
      <Container className="flex flex-col gap-8">
        <h2 className="text-h2">Start with a goal</h2>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {goals.map((g) => (
            <li key={g.slug} className="relative flex flex-col gap-3 rounded-[1.5rem] bg-card p-6">
              <DirectionCover
                dir="c"
                product={{ productType: types[g.slug as keyof typeof types], goalSlug: g.slug }}
                className="rounded-2xl"
              />
              <h3 className="text-[1.375rem]">
                <Link
                  href={`/category/${g.slug}`}
                  className="text-foreground no-underline after:absolute after:inset-0"
                >
                  {g.label}
                </Link>
              </h3>
              <p className="text-muted-foreground">{g.description}</p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

function ProductSketch({
  dir,
  product,
}: {
  dir: Direction;
  product: (typeof sampleDetails)[number];
}) {
  const price = product.priceInr ? formatInr(product.priceInr) : "Free";
  const first = product.content.firstWin;
  return (
    <section className="border-t border-border bg-card py-section">
      <Container className="flex flex-col gap-10">
        <h2 className="text-h2">Product page sketch</h2>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-start">
          <DirectionCover
            dir={dir.id}
            product={product}
            className={dir.id === "a" ? "" : undefined}
          />
          <div className="flex flex-col gap-5">
            <p className="text-sm text-muted-foreground">
              {productTypeLabel[product.productType]} · {levelLabel[product.level]} ·{" "}
              <ClockIcon aria-hidden="true" className="inline size-4 align-[-2px]" />{" "}
              {product.setupTimeMinutes} min to set up
            </p>
            <h3 className="text-h1">{product.title}</h3>
            <p className="max-w-[34rem] text-lead text-muted-foreground">{product.tagline}</p>
            <div className="flex items-center gap-5">
              <p className="tabular font-display text-h2">{price}</p>
              <Button size="lg">Get this</Button>
            </div>
            <div
              className={cn(
                "mt-2 flex flex-col gap-2 p-6",
                dir.id === "a" && "border-t-2 border-primary bg-background",
                dir.id === "b" &&
                  "rounded-[1.25rem] bg-cover-build shadow-[0_0_0_2px_var(--foreground)]",
                dir.id === "c" && "rounded-2xl bg-primary-soft",
              )}
            >
              <p
                className={cn(
                  "text-sm font-semibold",
                  dir.id === "c" ? "text-primary-soft-foreground" : "text-foreground",
                )}
              >
                Your first win · about {first.minutes} minutes
              </p>
              <p className="font-display text-h3">{first.title}</p>
              <p className="max-w-[60ch]">{first.description}</p>
            </div>
            <ol className="flex flex-col gap-4">
              {product.content.steps.slice(0, 3).map((s, i) => (
                <li key={s.title} className="grid grid-cols-[2.75rem_1fr] gap-4">
                  <span
                    className={cn(
                      "flex size-11 items-center justify-center font-display text-h3",
                      dir.id === "a" && "text-primary italic",
                      dir.id === "b" && "rounded-full bg-foreground text-background",
                      dir.id === "c" && "rounded-full bg-primary-soft text-primary-soft-foreground",
                    )}
                  >
                    {i + 1}
                  </span>
                  <div>
                    <p className="font-semibold">{s.title}</p>
                    <p className="max-w-[60ch] text-muted-foreground">{s.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <p className="text-sm text-muted-foreground">
            Phone buy bar (appears after the title scrolls away):
          </p>
          <div className="w-full max-w-[390px] overflow-hidden rounded-[1.5rem] border border-border bg-background">
            <div className="h-24 p-4 text-sm text-muted-foreground">…page content…</div>
            <div className="flex items-center gap-3 bg-card px-4 pt-3 pb-4 shadow-[0_-12px_24px_-16px_rgb(0_0_0/0.25)]">
              <div className="w-14 shrink-0 overflow-hidden rounded-md">
                <DirectionCover
                  dir={dir.id}
                  product={{ productType: product.productType, goalSlug: product.goalSlug }}
                  className="rounded-none"
                  bare
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-base font-semibold">{product.title}</p>
                <p className="tabular text-base">{price}</p>
              </div>
              <Button size="lg" className="shrink-0">
                Get this
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

function Spec({ dir }: { dir: Direction }) {
  return (
    <section className="border-t border-border py-section">
      <Container className="grid gap-12 lg:grid-cols-3">
        <div className="flex flex-col gap-4">
          <h2 className="text-h2">Palette</h2>
          <ul className="flex flex-col gap-2">
            {dir.palette.map((s) => (
              <li key={s.name} className="flex items-center gap-3">
                <span
                  className="size-10 shrink-0 rounded-lg border border-border"
                  style={{ background: s.hex }}
                />
                <span>
                  <span className="font-semibold">{s.name}</span>{" "}
                  <span className="text-muted-foreground">{s.hex}</span>
                  <br />
                  <span className="text-sm text-muted-foreground">{s.note}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col gap-4">
          <h2 className="text-h2">Type</h2>
          <p className="font-display text-h2">Aa — Make progress.</p>
          <p>
            <strong>Headlines:</strong> {dir.typePairing.display}
            <br />
            <strong>Reading:</strong> {dir.typePairing.body}
          </p>
          <p className="text-muted-foreground">{dir.typePairing.note}</p>
          <h2 className="pt-4 text-h2">Signature hero</h2>
          <p className="text-muted-foreground">{dir.hero}</p>
        </div>
        <div className="flex flex-col gap-4">
          <h2 className="text-h2">Motion language</h2>
          <ul className="flex list-disc flex-col gap-2 pl-5">
            {dir.motion.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
          <p className="text-sm text-muted-foreground">Draws on: {dir.references.join(", ")}.</p>
          <p className="text-sm text-muted-foreground">Risk: {dir.risks}</p>
          <div className="flex items-center gap-3 pt-2">
            <Figure
              type="notion"
              mode={dir.id === "a" ? "line" : dir.id === "b" ? "flat" : "object"}
              className="w-16 text-foreground"
            />
            <span className="text-sm text-muted-foreground">Figure style</span>
          </div>
        </div>
      </Container>
    </section>
  );
}
