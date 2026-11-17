import type { MetadataRoute } from "next";

import { goals } from "@/lib/brand";
import { getPublishedSlugs } from "@/lib/catalogue/catalogue";
import { siteUrl } from "@/lib/site-url";

/*
 * Only real, public pages: published products, the goal pages and the built
 * catalogue pages. Drafts, archived and sample products, placeholders ("being built"),
 * /design-preview, My Library and admin are left out.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const products = await getPublishedSlugs();
  return [
    { url: `${base}/` },
    { url: `${base}/explore` },
    { url: `${base}/free` },
    ...goals.map((goal) => ({ url: `${base}/category/${goal.slug}` })),
    ...products
      .filter((p) => !p.isSample) // sample pages are noindex until replaced
      .map((p) => ({ url: `${base}/products/${p.slug}`, lastModified: p.updatedAt })),
  ];
}
