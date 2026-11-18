import * as React from "react";

import { cn } from "@/lib/utils";

/*
 * Card — MAKERS restyle of shadcn/ui.
 * Elevation is a soft shadow only (no border + shadow "ghost card").
 * `interactive` adds the hover lift for cards that are links; put the link
 * on the CardTitle (or wrap the card in one) so it is keyboard reachable.
 */
function Card({
  className,
  interactive = false,
  ...props
}: React.ComponentProps<"div"> & { interactive?: boolean }) {
  return (
    <div
      data-slot="card"
      data-interactive={interactive || undefined}
      className={cn(
        "group/card relative flex flex-col gap-4 overflow-hidden rounded-xl bg-card p-6 text-card-foreground shadow-card",
        interactive &&
          // shortcut: overflow-hidden would clip a faded shadow layer, so the raised shadow switches without a fade; this card is only on /design-preview.
          "motion-lift transition-[translate] ease-out focus-within:shadow-raised pointer-fine:hover:-translate-y-0.5 pointer-fine:hover:shadow-raised",
        className,
      )}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="card-header" className={cn("flex flex-col gap-1.5", className)} {...props} />
  );
}

function CardTitle({ className, ...props }: React.ComponentProps<"h3">) {
  return (
    <h3
      data-slot="card-title"
      className={cn("font-display text-h3 text-card-foreground", className)}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="card-description"
      className={cn("text-base text-muted-foreground", className)}
      {...props}
    />
  );
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="card-action" className={cn("absolute top-6 right-6", className)} {...props} />
  );
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="card-content" className={cn("text-base", className)} {...props} />;
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("mt-auto flex items-center gap-3 pt-2", className)}
      {...props}
    />
  );
}

export { Card, CardHeader, CardFooter, CardTitle, CardAction, CardDescription, CardContent };
