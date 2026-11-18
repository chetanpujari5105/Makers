import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2Icon } from "lucide-react";
import { Slot } from "radix-ui";

import { cn } from "@/lib/utils";

/*
 * Button — MAKERS restyle of shadcn/ui.
 * - Default height is 44px (comfortable tap target); `lg` (48px) is for the
 *   main product call-to-action.
 * - Press feedback: subtle scale on :active (removed under reduced motion).
 * - Hover colour changes only on devices with a real pointer.
 * - `loading` disables the button, shows a spinner and sets aria-busy, so
 *   forms can block duplicate submissions.
 */
const buttonVariants = cva(
  [
    "motion-press group/button relative inline-flex shrink-0 items-center justify-center gap-2 rounded-full border border-transparent font-medium whitespace-nowrap select-none",
    "transition-[background-color,border-color,color,scale] duration-150 ease-out",
    "active:not-disabled:scale-[0.97]",
    "disabled:cursor-not-allowed disabled:opacity-55 aria-busy:cursor-progress aria-busy:opacity-85",
    "aria-invalid:border-destructive",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-[1.125em]",
  ],
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-[inset_0_1px_0_oklch(1_0_0/0.12)] pointer-fine:hover:not-disabled:bg-primary-hover",
        secondary:
          "bg-secondary text-secondary-foreground pointer-fine:hover:not-disabled:bg-[color-mix(in_oklch,var(--secondary),var(--foreground)_6%)]",
        outline:
          "border-input bg-card text-foreground pointer-fine:hover:not-disabled:border-foreground/60 pointer-fine:hover:not-disabled:bg-muted",
        ghost: "text-foreground pointer-fine:hover:not-disabled:bg-muted",
        destructive:
          "bg-destructive-soft text-destructive pointer-fine:hover:not-disabled:bg-[color-mix(in_oklch,var(--destructive-soft),var(--destructive)_10%)]",
        link: "h-auto! rounded-sm px-0! text-primary underline decoration-primary/40 underline-offset-[0.22em] active:scale-100! pointer-fine:hover:decoration-primary",
      },
      size: {
        sm: "h-10 px-4 text-sm",
        default: "h-11 px-5 text-base",
        lg: "h-12 px-7 text-[1.0625rem]",
        icon: "size-11",
        "icon-sm": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    /** Shows a spinner, disables the button and announces it as busy. */
    loading?: boolean;
  };

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  loading = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot.Root : "button";

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      disabled={asChild ? undefined : disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && !asChild ? (
        <>
          <Loader2Icon aria-hidden="true" className="animate-spin" />
          {children}
        </>
      ) : (
        children
      )}
    </Comp>
  );
}

export { Button, buttonVariants };
export type { ButtonProps };
