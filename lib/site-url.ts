/**
 * The public base URL of the site, used for metadata and absolute links.
 * Reads NEXT_PUBLIC_SITE_URL (see .env.example) and falls back to the local
 * development address. Trailing slashes are removed.
 */
export function siteUrl(value: string | undefined = process.env.NEXT_PUBLIC_SITE_URL): string {
  // On Vercel without NEXT_PUBLIC_SITE_URL, use the project's production address.
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  const fallback = vercel ? `https://${vercel}` : "http://localhost:3000";
  const raw = value?.trim();
  if (!raw) return fallback;

  try {
    const url = new URL(raw);
    if (url.protocol !== "http:" && url.protocol !== "https:") return fallback;
    return url.origin;
  } catch {
    return fallback;
  }
}
