import { Container } from "@/components/layout/container";

/*
 * Shown while a storefront page is loading. Announced to screen readers.
 * Shaped like a page hero (headline + plate) and at least one screen tall, so
 * the footer stays out of view and nothing jumps when the page arrives
 * (docs/UI_AUDIT.md P1: this placeholder used to cause a 0.4–0.6 layout shift).
 */
export default function Loading() {
  return (
    <Container className="min-h-[100svh] pt-12 sm:pt-16" role="status" aria-live="polite">
      <span className="sr-only">Loading…</span>
      <div
        aria-hidden="true"
        className="grid items-center gap-12 motion-safe:animate-pulse md:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)] md:gap-10 lg:gap-16"
      >
        <div className="flex flex-col gap-5">
          <div className="h-14 w-11/12 bg-muted sm:h-20" />
          <div className="h-14 w-2/3 bg-muted sm:h-20" />
          <div className="mt-3 h-5 w-full max-w-[32rem] bg-muted" />
          <div className="h-5 w-4/5 max-w-[32rem] bg-muted" />
          <div className="mt-3 h-12 w-full max-w-[34rem] rounded-full bg-muted" />
        </div>
        <div className="aspect-[4/3] w-full bg-muted" />
      </div>
    </Container>
  );
}
