"use client";

import Link from "next/link";
import { ArrowRightIcon, MenuIcon, XIcon } from "lucide-react";
import { Dialog as DialogPrimitive } from "radix-ui";

import { Button } from "@/components/ui/button";
import { goals, libraryLink, mobileSecondaryNav } from "@/lib/brand";

/*
 * Mobile menu — a side panel built on the Radix Dialog primitive, so it gets
 * focus trapping, Escape to close and focus return for free. Every link is
 * wrapped in DialogPrimitive.Close so the panel closes on navigation.
 */
function MobileNav() {
  return (
    <DialogPrimitive.Root>
      <DialogPrimitive.Trigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
          <MenuIcon aria-hidden="true" />
        </Button>
      </DialogPrimitive.Trigger>

      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-overlay data-open:animate-in data-open:duration-250 data-open:ease-out data-open:fade-in-0 data-closed:animate-out data-closed:duration-150 data-closed:ease-out data-closed:fade-out-0" />
        <DialogPrimitive.Content
          className="fixed inset-y-0 right-0 z-50 flex w-[min(24rem,calc(100%-3rem))] flex-col overflow-y-auto overscroll-contain bg-card shadow-dialog data-open:animate-in data-open:duration-250 data-open:ease-out data-open:slide-in-from-right data-closed:animate-out data-closed:duration-150 data-closed:ease-out data-closed:slide-out-to-right"
          aria-describedby={undefined}
        >
          <div className="flex items-center justify-between px-6 pt-3">
            <DialogPrimitive.Title className="font-sans text-sm font-medium text-muted-foreground">
              Menu
            </DialogPrimitive.Title>
            <DialogPrimitive.Close asChild>
              <Button variant="ghost" size="icon" className="-mr-3" aria-label="Close menu">
                <XIcon aria-hidden="true" />
              </Button>
            </DialogPrimitive.Close>
          </div>

          <nav
            aria-label="Main"
            className="flex flex-1 flex-col px-6 pt-4 pb-[max(2rem,env(safe-area-inset-bottom))]"
          >
            <ul className="flex flex-col">
              {goals.map((goal) => (
                <li key={goal.slug} className="border-b border-border">
                  <DialogPrimitive.Close asChild>
                    <Link
                      href={`/category/${goal.slug}`}
                      className="flex min-h-16 items-center justify-between gap-4 py-3 text-foreground no-underline"
                    >
                      <span className="flex flex-col">
                        <span className="font-display text-h3">{goal.label}</span>
                        <span className="text-base text-muted-foreground">{goal.description}</span>
                      </span>
                      <ArrowRightIcon aria-hidden="true" className="size-5 shrink-0 text-primary" />
                    </Link>
                  </DialogPrimitive.Close>
                </li>
              ))}
            </ul>

            <ul className="mt-6 flex flex-col gap-1">
              {mobileSecondaryNav.map((link) => (
                <li key={link.href}>
                  <DialogPrimitive.Close asChild>
                    <Link
                      href={link.href}
                      className="flex min-h-11 items-center text-lead text-foreground no-underline"
                    >
                      {link.label}
                    </Link>
                  </DialogPrimitive.Close>
                </li>
              ))}
            </ul>

            <div className="mt-auto pt-8">
              <DialogPrimitive.Close asChild>
                <Button asChild variant="outline" size="lg" className="w-full">
                  <Link href={libraryLink.href}>{libraryLink.label}</Link>
                </Button>
              </DialogPrimitive.Close>
            </div>
          </nav>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

export { MobileNav };
