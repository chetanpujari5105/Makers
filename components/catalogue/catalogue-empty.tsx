import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";

/*
 * Intentional empty state for lists (no fake filler products): a small stack
 * of blank cover plates, one plain sentence and, when useful, one action.
 */
export function CatalogueEmpty({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: { href: string; label: string };
}) {
  return (
    <div className="grid items-center gap-8 border-t border-foreground pt-8 sm:grid-cols-[12rem_1fr]">
      <div aria-hidden="true" className="relative h-28 w-40">
        <div className="absolute inset-0 translate-x-3 -translate-y-2 rotate-3 bg-cover-learn shadow-card" />
        <div className="absolute inset-0 -rotate-2 bg-cover-create shadow-card" />
        <div className="absolute inset-2 -rotate-2 border border-foreground/20" />
      </div>
      <div className="flex flex-col items-start gap-3">
        <p className="font-display text-h3">{title}</p>
        <p className="max-w-prose text-muted-foreground">{body}</p>
        {action ? (
          <Link
            href={action.href}
            className="inline-flex min-h-11 items-center gap-1.5 font-medium"
          >
            {action.label}
            <ArrowRightIcon aria-hidden="true" className="size-4" />
          </Link>
        ) : null}
      </div>
    </div>
  );
}
