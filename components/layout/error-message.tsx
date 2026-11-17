"use client";

import { useEffect } from "react";

import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";

/*
 * Shared "something went wrong" message for error boundaries.
 * Never shows the raw error to visitors. Phase 5 replaces console.error with
 * monitoring that scrubs personal data.
 */
function ErrorMessage({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Container size="prose" className="flex flex-col items-start gap-6 py-section">
      <h1 className="text-h1">Something went wrong</h1>
      <p className="text-lead text-muted-foreground">
        This page didn’t load properly. Please try again. If it keeps happening, come back a little
        later.
      </p>
      <Button onClick={() => retry()}>Try again</Button>
    </Container>
  );
}

export { ErrorMessage };
