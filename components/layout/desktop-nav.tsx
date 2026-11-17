"use client";

import { Suspense } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { primaryNav } from "@/lib/brand";
import { cn } from "@/lib/utils";

/** Desktop primary navigation. Marks the current page with aria-current. */
function DesktopNav() {
  // The URL is only known at request time on routes like /products/[slug], so
  // the "current page" mark streams in; until then the same links show unmarked.
  return (
    <nav aria-label="Main" className="hidden lg:block">
      <Suspense fallback={<NavLinks pathname="" />}>
        <CurrentNavLinks />
      </Suspense>
    </nav>
  );
}

function CurrentNavLinks() {
  return <NavLinks pathname={usePathname()} />;
}

function NavLinks({ pathname }: { pathname: string }) {
  return (
    <ul className="flex items-center gap-1">
      {primaryNav.map((link) => {
        const current = pathname === link.href || pathname.startsWith(`${link.href}/`);
        return (
          <li key={link.href}>
            <Link
              href={link.href}
              aria-current={current ? "page" : undefined}
              className={cn(
                "inline-flex min-h-11 items-center rounded-full px-3.5 text-base text-muted-foreground no-underline transition-colors duration-150 ease-out",
                "pointer-fine:hover:bg-muted pointer-fine:hover:text-foreground",
                "aria-[current=page]:text-foreground aria-[current=page]:underline aria-[current=page]:decoration-primary aria-[current=page]:decoration-2 aria-[current=page]:underline-offset-[0.5em]",
              )}
            >
              {link.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export { DesktopNav };
