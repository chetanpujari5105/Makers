import Link from "next/link";
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { exploreHref, type CatalogueFilters } from "@/lib/catalogue/filters";

/* Previous / next links that keep every filter in the URL. */
export function Pagination({
  filters,
  page,
  pageCount,
}: {
  filters: CatalogueFilters;
  page: number;
  pageCount: number;
}) {
  if (pageCount <= 1) return null;
  return (
    <nav aria-label="Pages" className="flex flex-wrap items-center justify-between gap-4">
      {page > 1 ? (
        <Button asChild variant="outline">
          <Link href={exploreHref(filters, { page: page - 1 })} rel="prev">
            <ArrowLeftIcon aria-hidden="true" />
            Previous
          </Link>
        </Button>
      ) : (
        <span />
      )}
      <p className="text-muted-foreground">
        Page {page} of {pageCount}
      </p>
      {page < pageCount ? (
        <Button asChild variant="outline">
          <Link href={exploreHref(filters, { page: page + 1 })} rel="next">
            Next
            <ArrowRightIcon aria-hidden="true" />
          </Link>
        </Button>
      ) : (
        <span />
      )}
    </nav>
  );
}
