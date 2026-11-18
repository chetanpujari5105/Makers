import Link from "next/link";
import { ArrowRightIcon, SearchIcon } from "lucide-react";

import { CatalogueEmpty } from "@/components/catalogue/catalogue-empty";
import { Container } from "@/components/layout/container";
import { Reveal } from "@/components/motion/reveal";
import { PriceTag } from "@/components/product/price-tag";
import { ProductGrid } from "@/components/product/product-card";
import { ProductCover } from "@/components/product/product-cover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ProductTypeKey } from "@/lib/catalogue/content-schema";
import { productTypeLabel } from "@/lib/catalogue/labels";
import type { ProductSummary } from "@/lib/catalogue/types";
import { cn } from "@/lib/utils";

import { GoalList } from "./goal-list";

/*
 * Homepage (PROJECT_SPEC §3.1, section order kept), direction A "Field Notes".
 * Takes real published products only. Left out until they exist: bundles and
 * newsletter. With fewer than three products the hero plates fall back to
 * plain type plates (no product names), never invented products.
 */

const steps = ["Pick a goal", "Follow the guide", "Get your first win"];

const promises = [
  {
    title: "A setup guide with every resource",
    body: "Each one comes with simple steps, a quick first win and fixes for common problems.",
  },
  {
    title: "See everything before you decide",
    body: "Every page shows what you’ll get, what you need and who it’s for — before we ask for anything.",
  },
  {
    title: "A license in plain English",
    body: "Each resource says clearly what you can and can’t do with it.",
  },
];

/* Shown in the hero when fewer than three products are published. */
const typePlates: { productType: ProductTypeKey; goalSlug: string }[] = [
  { productType: "notion", goalSlug: "work-smarter" },
  { productType: "pdf", goalSlug: "learn" },
  { productType: "design_kit", goalSlug: "create" },
];

export function HomeView({
  featured,
  free,
}: {
  featured: ProductSummary[];
  free: ProductSummary[];
}) {
  const shown = [...featured, ...free]
    .filter((p, i, all) => all.findIndex((q) => q.slug === p.slug) === i)
    .slice(0, 3);

  return (
    <>
      {/* 2–4. Hero: headline, search, three steps, and the figure plates */}
      <section aria-labelledby="hero-title" className="pt-12 pb-section sm:pt-16">
        <Container className="grid items-center gap-12 md:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)] md:gap-10 lg:gap-16">
          <div className="flex flex-col items-start gap-7">
            <h1
              id="hero-title"
              className="text-[clamp(2.75rem,1.9rem+4vw,5.25rem)] leading-[0.98] tracking-[-0.02em]"
            >
              Make something <em className="text-primary italic">this&nbsp;week.</em>
            </h1>
            <p className="max-w-[32rem] text-lead text-muted-foreground">
              Practical guides, templates and kits. Every one comes with setup steps and a quick
              first win.
            </p>
            <form
              action="/explore"
              method="get"
              role="search"
              className="flex w-full max-w-[34rem] gap-2"
            >
              <label htmlFor="home-search" className="sr-only">
                Search resources
              </label>
              <div className="relative flex-1">
                <SearchIcon
                  aria-hidden="true"
                  className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  id="home-search"
                  name="q"
                  type="search"
                  enterKeyHint="search"
                  autoComplete="off"
                  maxLength={80}
                  placeholder="Try “budget” or “Notion”…"
                  className="pl-12"
                />
              </div>
              <Button type="submit" size="lg">
                Search
              </Button>
            </form>
            <ol className="grid w-full max-w-[34rem] grid-cols-3 gap-4 border-t border-foreground pt-4">
              {steps.map((step, i) => (
                <li key={step} className="flex flex-col gap-1">
                  <span aria-hidden="true" className="font-display text-h3 text-primary italic">
                    0{i + 1}
                  </span>
                  <span className="text-base leading-snug">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          <HeroPlates products={shown} />
        </Container>
      </section>

      {/* 5. Goals: a numbered index */}
      <section
        id="goals"
        aria-labelledby="goals-title"
        className="scroll-mt-20 border-t border-foreground"
      >
        <Container>
          <h2 id="goals-title" className="sr-only">
            Start with a goal
          </h2>
          <Reveal>
            <GoalList />
          </Reveal>
        </Container>
      </section>

      {/* 6. Featured */}
      <section aria-labelledby="featured-title" className="py-section">
        <Container className="flex flex-col gap-10">
          <SectionHeader
            id="featured-title"
            title="Featured resources"
            href="/explore"
            linkLabel="Explore everything"
          />
          {featured.length > 0 ? (
            <ProductGrid products={featured} reveal />
          ) : (
            <CatalogueEmpty
              title="The first resources are on their way"
              body="Nothing has been published yet. Browse the goals above to see what’s planned, or check back soon."
            />
          )}
        </Container>
      </section>

      {/* 7. Free strip */}
      {free.length > 0 ? (
        <section aria-labelledby="free-title" className="border-y border-border bg-card py-section">
          <Container className="flex flex-col gap-10">
            <SectionHeader
              id="free-title"
              title="Free to download"
              description="Try a resource before you buy anything."
              href="/free"
              linkLabel="All free resources"
            />
            <ul className="grid gap-x-8 gap-y-6 md:grid-cols-2">
              {free.map((product, index) => (
                <Reveal
                  as="li"
                  key={product.slug}
                  index={index}
                  className="group/free relative grid grid-cols-[7rem_1fr] items-center gap-5 border-t border-foreground pt-4 has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-4 has-[a:focus-visible]:outline-ring sm:grid-cols-[9rem_1fr]"
                >
                  <ProductCover
                    title={product.title}
                    productType={product.productType}
                    goalSlug={product.goalSlug}
                    coverImage={product.coverImage}
                    size="thumb"
                  />
                  <div className="flex flex-col gap-1.5">
                    <h3 className="text-h3">
                      <Link
                        href={`/products/${product.slug}`}
                        className="text-foreground no-underline decoration-primary/60 after:absolute after:inset-0 after:content-[''] focus-visible:outline-none pointer-fine:group-hover/free:underline"
                      >
                        {product.title}
                      </Link>
                    </h3>
                    <p className="text-base text-muted-foreground">{product.tagline}</p>
                    <PriceTag isFree priceInr={null} className="text-primary" />
                  </div>
                </Reveal>
              ))}
            </ul>
          </Container>
        </section>
      ) : null}

      {/* 8. Finder CTA */}
      <section aria-labelledby="finder-title" className="py-section">
        <Container>
          <Reveal className="flex flex-col items-start gap-6 bg-foreground p-8 text-background sm:p-12 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex max-w-xl flex-col gap-3">
              <h2 id="finder-title" className="text-h2 text-background">
                Not sure where to start?
              </h2>
              <p className="text-lead text-background/85">
                Answer three quick questions and we’ll suggest a resource that fits.
              </p>
            </div>
            <Button asChild size="lg" variant="secondary">
              <Link href="/find">
                Find the right resource
                <ArrowRightIcon aria-hidden="true" />
              </Link>
            </Button>
          </Reveal>
        </Container>
      </section>

      {/* 10. Trust: numbered promises */}
      <section aria-labelledby="trust-title" className="border-t border-foreground pb-section">
        <Container className="grid gap-10 pt-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] lg:gap-16">
          <h2 id="trust-title" className="text-h2">
            What you can expect from every resource
          </h2>
          <ol className="flex flex-col divide-y divide-border border-b border-border">
            {promises.map(({ title, body }, i) => (
              <li key={title} className="grid grid-cols-[3rem_1fr] gap-4 py-6 first:pt-0">
                <span aria-hidden="true" className="font-display text-h3 text-primary italic">
                  0{i + 1}
                </span>
                <div className="flex flex-col gap-1">
                  <p className="font-semibold">{title}</p>
                  <p className="text-muted-foreground">{body}</p>
                </div>
              </li>
            ))}
          </ol>
        </Container>
      </section>
    </>
  );
}

/*
 * Three staggered plates that never overlap each other's text. Real products
 * link to their page; when fewer than three exist, the rest are type plates
 * captioned with the type only.
 */
function HeroPlates({ products }: { products: ProductSummary[] }) {
  const plates = [
    ...products.map((p) => ({ key: p.slug, product: p, ...p })),
    ...typePlates.slice(products.length).map((t) => ({ key: t.productType, product: null, ...t })),
  ];
  return (
    <ul className="mx-auto grid w-full max-w-[34rem] grid-cols-2 items-start gap-4 sm:gap-6">
      {plates.map((plate, i) => (
        <li
          key={plate.key}
          className={cn(
            "group/plate motion-lift relative bg-card p-2 shadow-raised transition-[translate] duration-200 ease-out has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-4 has-[a:focus-visible]:outline-ring pointer-fine:hover:-translate-y-1",
            i === 0 && "-rotate-[1.5deg]",
            i === 1 && "row-span-2 mt-[45%] rotate-1",
            i === 2 && "-rotate-[0.5deg]",
          )}
        >
          <ProductCover
            title={plate.product?.title ?? productTypeLabel[plate.productType]}
            productType={plate.productType}
            goalSlug={plate.goalSlug}
            coverImage={plate.product?.coverImage ?? null}
            className="max-lg:[&>div:nth-child(2)]:hidden"
          />
          <p className="px-1 pt-2 pb-0.5 text-sm text-muted-foreground">
            {plate.product ? (
              <Link
                href={`/products/${plate.product.slug}`}
                className="text-muted-foreground no-underline after:absolute after:inset-0 after:content-[''] focus-visible:outline-none pointer-fine:group-hover/plate:text-foreground pointer-fine:group-hover/plate:underline"
              >
                {plate.product.title}
              </Link>
            ) : (
              productTypeLabel[plate.productType]
            )}
          </p>
        </li>
      ))}
    </ul>
  );
}

function SectionHeader({
  id,
  title,
  description,
  href,
  linkLabel,
}: {
  id: string;
  title: string;
  description?: string;
  href: string;
  linkLabel: string;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex flex-col gap-3">
        <h2 id={id} className="text-h2">
          {title}
        </h2>
        {description ? <p className="text-lead text-muted-foreground">{description}</p> : null}
      </div>
      <Link
        href={href}
        className="group/more inline-flex min-h-11 items-center gap-1.5 font-medium"
      >
        {linkLabel}
        <ArrowRightIcon
          aria-hidden="true"
          className="motion-nudge size-4 transition-[translate] duration-200 ease-out pointer-fine:group-hover/more:translate-x-0.5"
        />
      </Link>
    </div>
  );
}
