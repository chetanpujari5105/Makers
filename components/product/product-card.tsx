import Link from "next/link";
import { ViewTransition } from "react";

import { Badge } from "@/components/ui/badge";
import { levelLabel, productTypeLabel } from "@/lib/catalogue/labels";
import type { ProductSummary } from "@/lib/catalogue/types";
import { cn } from "@/lib/utils";

import { PriceTag } from "./price-tag";
import { ProductCover } from "./product-cover";

/*
 * Card used everywhere products are listed (direction A): an ink rule, the
 * cover plate, then name + price, outcome, type and level. The whole card is
 * one link (stretched). The plate is a named view transition, so it grows
 * into the product page's cover where the browser supports it.
 */
export function ProductCard({
  product,
  headingLevel = "h3",
  wide = false,
}: {
  product: ProductSummary;
  headingLevel?: "h2" | "h3";
  /** Cover beside the text from tablet up (used when a list has one item). */
  wide?: boolean;
}) {
  const Heading = headingLevel;
  return (
    <article
      className={cn(
        "group/card relative flex h-full flex-col gap-4 border-t border-foreground pt-4 has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-4 has-[a:focus-visible]:outline-ring",
        wide && "sm:grid sm:grid-cols-2 sm:items-start sm:gap-8",
      )}
    >
      <ViewTransition name={`cover-${product.slug}`} share="morph" default="none">
        <ProductCover
          title={product.title}
          productType={product.productType}
          goalSlug={product.goalSlug}
          coverImage={product.coverImage}
          className="motion-lift transition-[translate,box-shadow] duration-200 ease-out pointer-fine:group-hover/card:-translate-y-1 pointer-fine:group-hover/card:shadow-raised"
        />
      </ViewTransition>
      <div className="flex flex-1 flex-col gap-2">
        {product.isSample ? (
          <Badge variant="warning" className="self-start">
            Sample content
          </Badge>
        ) : null}
        <div className="flex items-baseline justify-between gap-4">
          <Heading className="text-h3">
            <Link
              href={`/products/${product.slug}`}
              className="text-foreground no-underline decoration-primary/60 after:absolute after:inset-0 after:content-[''] focus-visible:outline-none pointer-fine:group-hover/card:underline"
            >
              {product.title}
            </Link>
          </Heading>
          <PriceTag
            isFree={product.isFree}
            priceInr={product.priceInr}
            className="shrink-0 text-primary"
          />
        </div>
        <p className="text-base text-muted-foreground">{product.tagline}</p>
        <p className="mt-auto pt-1 text-sm text-muted-foreground">
          {productTypeLabel[product.productType]} · {levelLabel[product.level]}
        </p>
      </div>
    </article>
  );
}

/*
 * Grid that looks deliberate with any count: one product becomes a wide card
 * (cover beside text) on tablet and up instead of a half-empty row.
 */
export function ProductGrid({
  products,
  className,
}: {
  products: ProductSummary[];
  className?: string;
}) {
  return (
    <ul
      className={cn(
        "grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3",
        products.length === 2 && "lg:grid-cols-2",
        className,
      )}
    >
      {products.map((product) => (
        <li
          key={product.slug}
          className={cn(products.length === 1 && "sm:col-span-2 lg:col-span-2")}
        >
          <ProductCard product={product} wide={products.length === 1} />
        </li>
      ))}
    </ul>
  );
}
