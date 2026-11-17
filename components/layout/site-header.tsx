import Link from "next/link";
import { LibraryIcon, SearchIcon } from "lucide-react";

import { Container } from "@/components/layout/container";
import { DesktopNav } from "@/components/layout/desktop-nav";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Wordmark } from "@/components/layout/wordmark";
import { Button } from "@/components/ui/button";
import { libraryLink } from "@/lib/brand";

/*
 * Site header. Search links to /explore, where real search arrives in
 * Phase 1 — there is no fake search box here. No cart/bag indicator: the
 * spec only shows one if a cart is implemented.
 */
function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background">
      <Container className="flex h-16 items-center justify-between gap-4 lg:h-[4.5rem]">
        <Wordmark />
        <DesktopNav />
        <div className="flex items-center gap-1 sm:gap-2">
          <Button asChild variant="ghost" size="icon" aria-label="Search the catalogue">
            <Link href="/explore">
              <SearchIcon aria-hidden="true" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex">
            <Link href={libraryLink.href}>
              <LibraryIcon aria-hidden="true" />
              {libraryLink.label}
            </Link>
          </Button>
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="sm:hidden"
            aria-label={libraryLink.label}
          >
            <Link href={libraryLink.href}>
              <LibraryIcon aria-hidden="true" />
            </Link>
          </Button>
          <MobileNav />
        </div>
      </Container>
    </header>
  );
}

export { SiteHeader };
