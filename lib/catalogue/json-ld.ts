import { brand } from "@/lib/brand";
import { siteUrl } from "@/lib/site-url";

import { productTypeLabel } from "./labels";
import type { ProductDetail } from "./types";

/* Product structured data. Price and currency come straight from the database row (paise → rupees). */
export function productJsonLd(product: ProductDetail) {
  const price = product.isFree ? 0 : product.priceInr;
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.tagline,
    url: `${siteUrl()}/products/${product.slug}`,
    category: productTypeLabel[product.productType],
    brand: { "@type": "Brand", name: brand.name },
    ...(product.coverImage ? { image: product.coverImage } : {}),
    ...(price == null
      ? {}
      : { offers: { "@type": "Offer", price: (price / 100).toFixed(2), priceCurrency: "INR" } }),
  };
}
