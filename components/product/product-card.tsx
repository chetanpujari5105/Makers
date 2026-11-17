import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { levelLabel, productTypeLabel } from "@/lib/catalogue/labels";
import type { ProductSummary } from "@/lib/catalogue/types";
import { cn } from "@/lib/utils";

import { PriceTag } from "./price-tag";
import { ProductCover } from "./product-cover";

/* Card used everywhere products are listed: cover, name, outcome, type, level, price. */
export function ProductCard({
  product,
  headingLevel = "h3",
}: {
  product: ProductSummary;
  headingLevel?: "h2" | "h3";
}) {
  const Heading = headingLevel;
  return (
    <Card
      interactive
      className="h-full gap-0 p-0 has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-4 has-[a:focus-visible]:outline-ring"
    >
      <ProductCover
        title={product.title}
        productType={product.productType}
        goalSlug={product.goalSlug}
        coverImage={product.coverImage}
      />
      <div className="flex flex-1 flex-col gap-3 p-5 sm:p-6">
        {product.isSample ? (
          <Badge variant="warning" className="-mt-1">
            Sample content
          </Badge>
        ) : null}
        <Heading className="text-h3">
          <Link
            href={`/products/${product.slug}`}
            className="text-foreground no-underline after:absolute after:inset-0 after:content-[''] focus-visible:outline-none"
          >
            {product.title}
          </Link>
        </Heading>
        <p className="text-base text-muted-foreground">{product.tagline}</p>
        <div className="mt-auto flex items-end justify-between gap-4 pt-3">
          <p className="text-sm text-muted-foreground">
            {productTypeLabel[product.productType]} · {levelLabel[product.level]}
          </p>
          <PriceTag isFree={product.isFree} priceInr={product.priceInr} />
        </div>
      </div>
    </Card>
  );
}

export function ProductGrid({
  products,
  className,
}: {
  products: ProductSummary[];
  className?: string;
}) {
  return (
    <ul className={cn("grid gap-6 sm:grid-cols-2 lg:grid-cols-3", className)}>
      {products.map((product) => (
        <li key={product.slug}>
          <ProductCard product={product} />
        </li>
      ))}
    </ul>
  );
}
