import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Container } from "@/components/layout/container";
import { ProductPage } from "@/components/product/product-page";
import { productTypeLabel } from "@/lib/catalogue/labels";
import { cn } from "@/lib/utils";

import { DraftNotice } from "../../_components/draft-notice";
import { sampleDetails, toSummary } from "../../_data/sample-views";

export const metadata: Metadata = {
  title: "Product page layout draft",
  robots: { index: false, follow: false },
};

// Draft-only page: allowed to block on its params (Next 16 instant-navigation check).
export const instant = false;

export function generateStaticParams() {
  return [{ slug: [] }, ...sampleDetails.map((p) => ({ slug: [p.slug] }))];
}

export default async function ProductDraftPage({
  params,
}: PageProps<"/design-preview/product/[[...slug]]">) {
  if (process.env.VERCEL_ENV === "production") notFound();
  const { slug } = await params;
  if (slug && slug.length > 1) notFound();
  const product = slug?.[0] ? sampleDetails.find((p) => p.slug === slug[0]) : sampleDetails[0];
  if (!product) notFound();

  const related = sampleDetails
    .filter((p) => p.slug !== product.slug)
    .sort(
      (a, b) => Number(b.goalSlug === product.goalSlug) - Number(a.goalSlug === product.goalSlug),
    )
    .slice(0, 3)
    .map(toSummary);

  return (
    <>
      <DraftNotice>
        Each sample shows the sections for its product type. The buy button is disabled (“Opens
        soon”) until checkout is built. Reviews are hidden because there are none. Scroll on a phone
        to see the sticky buy bar.
      </DraftNotice>
      <Container className="pt-6">
        <nav aria-label="Sample products">
          <ul className="flex flex-wrap gap-2">
            {sampleDetails.map((p) => {
              const current = p.slug === product.slug;
              return (
                <li key={p.slug}>
                  <Link
                    href={`/design-preview/product/${p.slug}`}
                    aria-current={current ? "page" : undefined}
                    className={cn(
                      "inline-flex min-h-10 items-center rounded-full border px-4 text-sm no-underline",
                      current
                        ? "border-foreground bg-foreground text-background"
                        : "border-border bg-card text-foreground pointer-fine:hover:border-foreground/60",
                    )}
                  >
                    {productTypeLabel[p.productType]}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </Container>
      <ProductPage product={product} related={related} />
    </>
  );
}
