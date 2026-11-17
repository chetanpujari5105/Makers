"use client"; // Error boundaries must be Client Components

import { ErrorMessage } from "@/components/layout/error-message";

/*
 * Catches errors inside storefront pages; the header and footer stay visible.
 * Next.js 16 passes `retry` (re-fetch and re-render) — see node_modules/next/dist/docs.
 */
export default function SiteError({ error, retry }: { error: unknown; retry: () => void }) {
  return <ErrorMessage error={error} retry={retry} />;
}
