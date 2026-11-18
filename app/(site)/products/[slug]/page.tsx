import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { Container } from "@/components/layout/container";
import { ProductPage } from "@/components/product/product-page";
import { brand } from "@/lib/brand";
import { getProduct, getRelated } from "@/lib/catalogue/catalogue";
import { productTypeLabel } from "@/lib/catalogue/labels";
import { productJsonLd } from "@/lib/catalogue/json-ld";
import { productSlugSchema } from "@/lib/validators";

/*
 * Product ("Grow With It") page on published data — the approved layout from
 * /design-preview/product. proxy.ts already returned a real 404 for unknown,
 * draft and archived slugs; notFound() here covers a product unpublished in
 * the last minute. No generateStaticParams: with Cache Components it must
 * return at least one product, and a new store may have none. Data is still
 * cached (lib/catalogue/catalogue.ts).
 */

async function load(params: PageProps<"/products/[slug]">["params"]) {
  const parsed = productSlugSchema.safeParse((await params).slug);
  return parsed.success ? getProduct(parsed.data) : null;
}

export async function generateMetadata({
  params,
}: PageProps<"/products/[slug]">): Promise<Metadata> {
  const product = await load(params);
  if (!product) return { title: "Page not found", robots: { index: false } };
  const description = `${product.tagline} ${productTypeLabel[product.productType]}.`;
  return {
    title: product.title,
    description,
    alternates: { canonical: `/products/${product.slug}` },
    // Sample content must not be indexed as if it were a real product.
    robots: product.isSample ? { index: false } : undefined,
    openGraph: {
      type: "website",
      siteName: brand.name,
      title: product.title,
      description,
      url: `/products/${product.slug}`,
      // This openGraph replaces the root one, so restate the brand image as the fallback.
      images: [product.coverImage ?? "/opengraph-image.png"],
    },
  };
}

export default function ProductRoute({ params }: PageProps<"/products/[slug]">) {
  return (
    <Suspense fallback={<ProductSkeleton />}>
      <ProductContent params={params} />
    </Suspense>
  );
}

async function ProductContent({ params }: Pick<PageProps<"/products/[slug]">, "params">) {
  const product = await load(params);
  if (!product) notFound();
  const related = await getRelated({ slug: product.slug, goalSlug: product.goalSlug });

  return (
    <>
      <script
        type="application/ld+json"
        // JSON-LD from database values; "<" is escaped so text can't close the tag.
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productJsonLd(product)).replace(/</g, "\\u003c"),
        }}
      />
      <ProductPage product={product} related={related} />
    </>
  );
}

/* Same shape and sizes as the product hero, and a screen tall, so nothing jumps. */
function ProductSkeleton() {
  return (
    <Container className="min-h-[100svh] pt-8 sm:pt-12" role="status" aria-live="polite">
      <span className="sr-only">Loading resource…</span>
      <div aria-hidden="true" className="flex flex-col gap-8 motion-safe:animate-pulse">
        <div className="h-5 w-40 bg-muted" />
        <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:items-center md:gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-14">
          <div className="aspect-[3/2] bg-muted lg:aspect-[4/3]" />
          <div className="flex flex-col gap-4">
            <div className="h-5 w-48 bg-muted" />
            <div className="h-12 w-4/5 bg-muted" />
            <div className="h-6 w-full bg-muted" />
            <div className="mt-2 border-t border-border pt-5">
              <div className="flex items-center gap-6">
                <div className="h-8 w-20 bg-muted" />
                <div className="h-12 w-36 rounded-full bg-muted" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
}
