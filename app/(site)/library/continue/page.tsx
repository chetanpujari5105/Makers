import type { Metadata } from "next";
import { Suspense } from "react";

import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { safeNextPath } from "@/lib/validators";

export const metadata: Metadata = {
  title: "Continue to My Library",
  robots: { index: false },
  referrer: "no-referrer",
};

/*
 * Landing page for one-time email links. Opening it spends nothing: email
 * scanners that pre-open links can't use the token up. Only pressing
 * Continue (a POST) signs the visitor in.
 */
export default function ContinuePage({ searchParams }: PageProps<"/library/continue">) {
  return (
    <Container size="prose" className="flex flex-col items-start gap-6 py-section">
      <h1 className="text-h1">Continue to My Library</h1>
      <Suspense fallback={null}>
        <ContinueForm searchParams={searchParams} />
      </Suspense>
    </Container>
  );
}

async function ContinueForm({
  searchParams,
}: Pick<PageProps<"/library/continue">, "searchParams">) {
  const params = await searchParams;
  const token = typeof params.token === "string" ? params.token : "";
  const next = safeNextPath.parse(typeof params.next === "string" ? params.next : undefined);
  return (
    <form action="/api/library/continue" method="post" className="flex flex-col items-start gap-4">
      <p className="text-lead text-muted-foreground">
        Press Continue to sign in on this device. The link works once.
      </p>
      <input type="hidden" name="token" value={token} />
      {next ? <input type="hidden" name="next" value={next} /> : null}
      <Button type="submit" size="lg">
        Continue
      </Button>
    </form>
  );
}
