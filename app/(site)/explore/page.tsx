import type { Metadata } from "next";
import { Suspense } from "react";

import { CatalogueEmpty } from "@/components/catalogue/catalogue-empty";
import { ExploreFilters } from "@/components/catalogue/explore-filters";
import { Pagination } from "@/components/catalogue/pagination";
import { Container } from "@/components/layout/container";
import { ProductGrid } from "@/components/product/product-card";
import { getCatalogue } from "@/lib/catalogue/catalogue";
import { activeFilterCount, exploreHref, parseCatalogueFilters } from "@/lib/catalogue/filters";

export const metadata: Metadata = {
  title: "Explore",
  description: "Search and filter every published resource by goal, type, level, price and time.",
  alternates: { canonical: "/explore" },
};

export default function ExplorePage({ searchParams }: PageProps<"/explore">) {
  return (
    <Container className="flex flex-col gap-10 py-section">
      <header className="flex max-w-2xl flex-col gap-3">
        <h1 className="text-h1">Explore</h1>
        <p className="text-lead text-muted-foreground">
          Search every resource, or narrow them down by goal, type, level, price and setup time.
        </p>
      </header>
      {/* searchParams are per-request, so the results stream in after the page frame. */}
      <Suspense fallback={<ResultsSkeleton />}>
        <ExploreResults searchParams={searchParams} />
      </Suspense>
    </Container>
  );
}

async function ExploreResults({ searchParams }: Pick<PageProps<"/explore">, "searchParams">) {
  const filters = parseCatalogueFilters(await searchParams);
  const { items, total, page, pageCount } = await getCatalogue(filters);
  const narrowed = Boolean(filters.q) || activeFilterCount(filters) > 0;

  return (
    <>
      {/* key: re-mount so the form's values follow client-side navigation (e.g. “Clear all”). */}
      <ExploreFilters key={exploreHref(filters)} filters={filters} />
      <section aria-labelledby="results-title" className="flex flex-col gap-8">
        <h2 id="results-title" className="text-h3" aria-live="polite">
          {total === 1 ? "1 resource" : `${total} resources`}
          {filters.q ? ` for “${filters.q}”` : null}
        </h2>
        {items.length > 0 ? (
          <ProductGrid products={items} />
        ) : narrowed ? (
          <CatalogueEmpty
            title="Nothing matches these filters"
            body="Try fewer filters or a shorter search word."
            action={{ href: "/explore", label: "Clear all filters" }}
          />
        ) : total > 0 ? (
          <CatalogueEmpty
            title="This page is empty"
            body="There are fewer resources than this page number."
            action={{ href: "/explore", label: "Go to the first page" }}
          />
        ) : (
          <CatalogueEmpty
            title="The first resources are on their way"
            body="Nothing has been published yet. Check back soon."
          />
        )}
        <Pagination filters={filters} page={page} pageCount={pageCount} />
      </section>
    </>
  );
}

/* Matches the filters form and the card grid, and fills the screen, so nothing jumps. */
function ResultsSkeleton() {
  return (
    <div role="status" aria-live="polite" className="min-h-[100svh]">
      <span className="sr-only">Loading resources…</span>
      <div aria-hidden="true" className="flex flex-col gap-4 motion-safe:animate-pulse">
        <div className="mt-7 h-12 w-full rounded-lg bg-muted" />
        <div className="h-12 w-full rounded-xl bg-muted" />
        <div className="h-11 w-36 rounded-full bg-muted" />
        <div className="mt-4 mb-4 h-8 w-40 bg-muted" />
        <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex flex-col gap-4 border-t border-border pt-4">
              <div className="aspect-[4/3] bg-muted" />
              <div className="h-7 w-3/4 bg-muted" />
              <div className="h-5 w-full bg-muted" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
