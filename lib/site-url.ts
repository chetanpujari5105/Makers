/**
 * The public base URL of the site, used for metadata and absolute links.
 * Reads NEXT_PUBLIC_SITE_URL (see .env.example) and falls back to the local
 * development address. Trailing slashes are removed.
 */
export function siteUrl(value: string | undefined = process.env.NEXT_PUBLIC_SITE_URL): string {
  // On Vercel without NEXT_PUBLIC_SITE_URL: previews use their own branch
  // address (so emailed sign-in links open the preview), production its domain.
  const vercel =
    process.env.VERCEL_ENV === "preview"
      ? process.env.VERCEL_BRANCH_URL
      : process.env.VERCEL_PROJECT_PRODUCTION_URL;
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
