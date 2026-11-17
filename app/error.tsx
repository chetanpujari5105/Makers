"use client"; // Error boundaries must be Client Components

import { ErrorMessage } from "@/components/layout/error-message";

/*
 * Catches errors in the storefront shell itself (header, footer, mobile menu)
 * that app/(site)/error.tsx cannot catch. Renders inside the root layout, so
 * fonts and styles still load. global-error.tsx is only for root-layout failures.
 */
export default function RootError({ error, retry }: { error: unknown; retry: () => void }) {
  return (
    <main id="main" className="flex flex-1 flex-col">
      <ErrorMessage error={error} retry={retry} />
    </main>
  );
}
