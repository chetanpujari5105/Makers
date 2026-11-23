import type { BeforeSendEvent } from "@vercel/analytics/next";

import { goalSlugSchema, productSlugSchema } from "@/lib/validators";

/*
 * Vercel Web Analytics filter: count only the public storefront pages.
 * Everything else (admin, library, checkout, downloads, legal pages, placeholders)
 * sends nothing. Allowed URLs lose their query string and #fragment.
 */
const exactPaths = new Set(["/", "/explore", "/free"]);

function isCountedPath(pathname: string): boolean {
  if (exactPaths.has(pathname)) return true;
  const match = /^\/(category|products)\/([^/]+)$/.exec(pathname);
  if (!match) return false;
  const schema = match[1] === "category" ? goalSlugSchema : productSlugSchema;
  return schema.safeParse(match[2]).success;
}

export function analyticsBeforeSend(event: BeforeSendEvent): BeforeSendEvent | null {
  if (event.type !== "pageview") return null; // no custom events
  let url: URL;
  try {
    url = new URL(event.url);
  } catch {
    return null;
  }
  if (!isCountedPath(url.pathname)) return null;
  return { type: "pageview", url: url.origin + url.pathname };
}
