import * as React from "react";

import { cn } from "@/lib/utils";

/** Centres content at the page width with responsive side gutters. */
function Container({
  className,
  size = "page",
  ...props
}: React.ComponentProps<"div"> & { size?: "page" | "prose" }) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-gutter",
        size === "page" ? "max-w-page" : "max-w-prose",
        className,
      )}
      {...props}
    />
  );
}

export { Container };
