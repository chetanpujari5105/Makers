import type { Metadata } from "next";
import Link from "next/link";

import { CatalogueEmpty } from "@/components/catalogue/catalogue-empty";
import { Container } from "@/components/layout/container";
import { ProductGrid } from "@/components/product/product-card";
import { getCatalogue } from "@/lib/catalogue/catalogue";
import { exploreHref } from "@/lib/catalogue/filters";

export const metadata: Metadata = {
  title: "Free resources",
  description: "Free guides, templates and project files you can use straight away.",
  alternates: { canonical: "/free" },
};

export default async function FreePage() {
  const { items, total } = await getCatalogue({ cost: "free", sort: "newest" });

  return (
    <Container className="flex flex-col gap-10 py-section">
      <header className="flex max-w-2xl flex-col gap-3">
        <h1 className="text-h1">Free resources</h1>
        <p className="text-lead text-muted-foreground">
          Try a resource before you buy anything. Each one comes with the same setup guide as a paid
          one.
        </p>
      </header>
      {items.length > 0 ? (
        <>
          <ProductGrid products={items} />
          {total > items.length ? (
            <Link href={exploreHref({ cost: "free" })} className="self-start font-medium">
              See all {total} free resources
            </Link>
          ) : null}
        </>
      ) : (
        <CatalogueEmpty
          title="No free resources yet"
          body="Free resources will appear here once they’re published."
        />
      )}
    </Container>
  );
}
