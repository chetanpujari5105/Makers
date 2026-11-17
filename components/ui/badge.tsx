import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";

import { cn } from "@/lib/utils";

/*
 * Badge — small, readable labels (level, product type, status).
 * Text is 14px minimum. Status variants (success/warning/destructive) must
 * always carry a text label: colour is never the only signal.
 * Do NOT use badges for fake scarcity, discounts or popularity.
 */
const badgeVariants = cva(
  "inline-flex h-7 w-fit shrink-0 items-center gap-1.5 rounded-full border border-transparent px-3 text-[0.875rem] leading-none font-medium whitespace-nowrap [&>svg]:pointer-events-none [&>svg]:size-3.5",
  {
    variants: {
      variant: {
        default: "bg-muted text-foreground",
        accent: "bg-primary-soft text-primary-soft-foreground",
        outline: "border-border bg-card text-foreground",
        success: "bg-success-soft text-success",
        warning: "bg-warning-soft text-warning",
        destructive: "bg-destructive-soft text-destructive",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span";

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
