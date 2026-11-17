import { NextResponse, type NextRequest } from "next/server";

import { isPublishedSlug } from "@/lib/catalogue/queries";
import { goalSlugSchema, productSlugSchema } from "@/lib/validators";

/*
 * Real HTTP 404s for unknown catalogue URLs. With Cache Components the page
 * starts streaming (status 200) before it can call notFound(), so the Next 16
 * docs (guides/streaming.md, "Status codes") say to decide in Proxy instead.
 * Drafts and archived products get the same 404 as a slug that never existed.
 */
export async function proxy(request: NextRequest) {
  const [, section, slug = ""] = request.nextUrl.pathname.split("/");
  const exists =
    section === "category" ? goalSlugSchema.safeParse(slug).success : await productExists(slug);
  if (exists) return NextResponse.next();
  return NextResponse.rewrite(new URL("/_not-found", request.url), { status: 404 });
}

async function productExists(slug: string) {
  if (!productSlugSchema.safeParse(slug).success) return false;
  try {
    return await isPublishedSlug(slug);
  } catch (error) {
    // Database unreachable: let the page render, so its error state shows
    // "try again" instead of telling the visitor the product doesn't exist.
    console.error("Proxy product check failed", error);
    return true;
  }
}

export const config = { matcher: ["/category/:slug", "/products/:slug"] };
