import Link from "next/link";
import { ArrowRightIcon, BookOpenCheckIcon, EyeIcon, ScaleIcon, SearchIcon } from "lucide-react";

import { Container } from "@/components/layout/container";
import { PriceTag } from "@/components/product/price-tag";
import { ProductGrid } from "@/components/product/product-card";
import { ProductCover } from "@/components/product/product-cover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ProductSummary } from "@/lib/catalogue/types";

import { GoalList } from "./goal-list";

/*
 * Homepage (PROJECT_SPEC §3.1, section order kept). Takes real published
 * products only. Left out until they exist: bundles (none yet), newsletter
 * (Phase 2 lead capture) and any "secure checkout" claim (Phase 3).
 */

const promises = [
  {
    icon: BookOpenCheckIcon,
    title: "A setup guide with every resource",
    body: "Each one comes with simple steps, a quick first win and fixes for common problems.",
  },
  {
    icon: EyeIcon,
    title: "See everything before you decide",
    body: "Every page shows what you’ll get, what you need and who it’s for — before we ask for anything.",
  },
  {
    icon: ScaleIcon,
    title: "A license in plain English",
    body: "Each resource says clearly what you can and can’t do with it.",
  },
];

export function HomeView({
  featured,
  free,
}: {
  featured: ProductSummary[];
  free: ProductSummary[];
}) {
  return (
    <>
      {/* 2–4. Hero + search prompt */}
      <section aria-labelledby="hero-title" className="pt-14 pb-section sm:pt-20">
        <Container className="grid gap-12 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:items-end lg:gap-16">
          <div className="flex flex-col items-start gap-8">
            <h1 id="hero-title" className="text-display">
              Learn something.
              <br />
              Create something.
              <br />
              <em className="font-display text-primary italic">Make progress.</em>
            </h1>
            <p className="max-w-[34rem] text-lead text-muted-foreground">
              Practical digital resources — guides, templates, courses and project files — each with
              clear, step-by-step help so you can actually use what you get.
            </p>
          </div>

          <form
            action="/explore"
            method="get"
            role="search"
            className="flex flex-col gap-4 rounded-xl bg-card p-6 shadow-card sm:p-8"
          >
            <Label htmlFor="home-search" className="font-display text-h3 font-normal">
              What would you like to achieve?
            </Label>
            <div className="relative">
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
                placeholder="Try “budget”, “Notion” or “poster”"
                className="pl-12"
              />
            </div>
            <Button type="submit" size="lg" className="w-full sm:w-auto sm:self-start">
              Search resources
            </Button>
          </form>
        </Container>
      </section>

      {/* 5. Goals */}
      <section
        id="goals"
        aria-labelledby="goals-title"
        className="scroll-mt-20 border-t border-border bg-card py-section"
      >
        <Container className="flex flex-col gap-10">
          <div className="flex max-w-2xl flex-col gap-3">
            <h2 id="goals-title" className="text-h2">
              Start with a goal
            </h2>
            <p className="text-lead text-muted-foreground">
              You don’t need to know file types — pick what you want to do.
            </p>
          </div>
          <GoalList />
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
            <ProductGrid products={featured} />
          ) : (
            <div className="flex flex-col items-start gap-3 rounded-xl border border-dashed border-input p-8 sm:p-10">
              <p className="font-display text-h3">The first resources are on their way</p>
              <p className="max-w-prose text-muted-foreground">
                Nothing has been published yet. Check back soon — or browse the goals above to see
                what’s planned.
              </p>
            </div>
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
            <ul className="grid gap-4 md:grid-cols-2">
              {free.map((product) => (
                <li
                  key={product.slug}
                  className="group/free relative grid grid-cols-[7rem_1fr] items-center gap-5 rounded-xl bg-background p-3 pr-5 has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-2 has-[a:focus-visible]:outline-ring sm:grid-cols-[9rem_1fr]"
                >
                  <ProductCover
                    title={product.title}
                    productType={product.productType}
                    goalSlug={product.goalSlug}
                    coverImage={product.coverImage}
                    size="thumb"
                    className="rounded-lg"
                  />
                  <div className="flex flex-col gap-1.5">
                    <h3 className="font-sans text-body font-semibold">
                      <Link
                        href={`/products/${product.slug}`}
                        className="text-foreground no-underline after:absolute after:inset-0 after:content-[''] focus-visible:outline-none pointer-fine:group-hover/free:underline"
                      >
                        {product.title}
                      </Link>
                    </h3>
                    <p className="text-base text-muted-foreground">{product.tagline}</p>
                    <PriceTag
                      isFree
                      priceInr={null}
                      className="font-sans text-base font-semibold text-success"
                    />
                  </div>
                </li>
              ))}
            </ul>
          </Container>
        </section>
      ) : null}

      {/* 8. Finder CTA */}
      <section aria-labelledby="finder-title" className="py-section">
        <Container>
          <div className="flex flex-col items-start gap-6 rounded-xl bg-primary p-8 text-primary-foreground sm:p-12 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex max-w-xl flex-col gap-3">
              <h2 id="finder-title" className="text-h2 text-primary-foreground">
                Not sure where to start?
              </h2>
              <p className="text-lead text-primary-foreground/85">
                Answer three quick questions and we’ll suggest a resource that fits.
              </p>
            </div>
            <Button asChild size="lg" variant="secondary">
              <Link href="/find">
                Find the right resource
                <ArrowRightIcon aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </Container>
      </section>

      {/* 10. Trust */}
      <section
        aria-labelledby="trust-title"
        className="border-t border-border pt-section pb-section"
      >
        <Container className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] lg:gap-16">
          <h2 id="trust-title" className="text-h2">
            What you can expect from every resource
          </h2>
          <ul className="flex flex-col divide-y divide-border border-y border-border">
            {promises.map(({ icon: Icon, title, body }) => (
              <li key={title} className="grid grid-cols-[2rem_1fr] gap-4 py-6">
                <Icon aria-hidden="true" className="mt-0.5 size-6 text-primary" />
                <div className="flex flex-col gap-1">
                  <p className="font-medium">{title}</p>
                  <p className="text-muted-foreground">{body}</p>
                </div>
              </li>
            ))}
          </ul>
        </Container>
      </section>
    </>
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
