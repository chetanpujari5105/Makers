import Link from "next/link";

import { brand } from "@/lib/brand";
import { cn } from "@/lib/utils";

/** Text wordmark. Replace with the real logo once the brand is decided. */
function Wordmark({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      translate="no"
      className={cn(
        "inline-flex min-h-11 items-center font-display text-[1.5rem] leading-none font-semibold tracking-[0.01em] text-foreground no-underline",
        className,
      )}
    >
      {brand.name}
      <span className="sr-only">, go to the home page</span>
    </Link>
  );
}

export { Wordmark };
