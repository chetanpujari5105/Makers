import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/layout/container";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false },
};

/* Rendered for any URL that does not match a page. */
export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main id="main" tabIndex={-1} className="flex flex-1 flex-col focus:outline-none">
        <Container size="prose" className="flex flex-col items-start gap-6 py-section">
          <h1 className="text-h1">We couldn’t find that page</h1>
          <p className="text-lead text-muted-foreground">
            The link may be old, or the address may have a typo. You can start again from the home
            page.
          </p>
          <Button asChild>
            <Link href="/">Go to the home page</Link>
          </Button>
        </Container>
      </main>
      <SiteFooter />
    </>
  );
}
