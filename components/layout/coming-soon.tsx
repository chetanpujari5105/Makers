import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";

import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";

/*
 * Honest placeholder for routes that exist in the navigation but are built
 * in a later phase. It never pretends the feature works. Each page that uses
 * it also sets `robots: { index: false }` so search engines skip it.
 * Replace the page file with the real page when its phase is built.
 */
function ComingSoon({ title, description }: { title: string; description?: string }) {
  return (
    <Container size="prose" className="flex flex-col items-start gap-6 py-section">
      <h1 className="text-h1">{title}</h1>
      <p className="text-lead text-muted-foreground">
        {description ??
          "This part of the store is still being built. It will open in a later update."}
      </p>
      <Button asChild variant="outline">
        <Link href="/">
          <ArrowLeftIcon aria-hidden="true" />
          Back to the home page
        </Link>
      </Button>
    </Container>
  );
}

export { ComingSoon };
