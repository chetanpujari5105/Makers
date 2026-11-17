import { Container } from "@/components/layout/container";

/* Shown while a storefront page is loading. Announced to screen readers. */
export default function Loading() {
  return (
    <Container className="py-section" role="status" aria-live="polite">
      <span className="sr-only">Loading…</span>
      <div aria-hidden="true" className="flex flex-col gap-4 motion-safe:animate-pulse">
        <div className="h-12 w-2/3 max-w-xl rounded-lg bg-muted" />
        <div className="h-5 w-full max-w-prose rounded-md bg-muted" />
        <div className="h-5 w-5/6 max-w-prose rounded-md bg-muted" />
      </div>
    </Container>
  );
}
