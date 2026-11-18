import * as React from "react";

import { cn } from "@/lib/utils";

/*
 * Input — MAKERS restyle of shadcn/ui.
 * - 48px tall, 16px text (stops iOS Safari zooming in on focus).
 * - Border meets the 3:1 non-text contrast target.
 * - Set aria-invalid="true" and aria-describedby="<error id>" to show an error.
 *   Always pair an Input with a visible <Label htmlFor=...>.
 */
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-12 w-full min-w-0 rounded-lg border border-input bg-card px-4 text-base text-foreground",
        "transition-[border-color] duration-150 ease-out",
        "placeholder:text-muted-foreground",
        "pointer-fine:hover:not-disabled:not-focus:border-foreground/50",
        "focus-visible:border-ring focus-visible:shadow-[0_0_0_1px_var(--ring),0_0_0_5px_var(--primary-soft)] focus-visible:outline-none",
        "aria-invalid:border-destructive aria-invalid:focus-visible:shadow-[0_0_0_1px_var(--destructive),0_0_0_5px_var(--destructive-soft)]",
        "disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground",
        "file:mr-3 file:h-8 file:rounded-md file:border-0 file:bg-muted file:px-3 file:text-sm file:font-medium",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
