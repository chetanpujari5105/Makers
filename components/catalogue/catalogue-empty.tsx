import Link from "next/link";

/* Intentional empty state for catalogue lists (no fake filler products). */
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
    <div className="flex flex-col items-start gap-3 rounded-xl border border-dashed border-input p-8 sm:p-10">
      <p className="font-display text-h3">{title}</p>
      <p className="max-w-prose text-muted-foreground">{body}</p>
      {action ? (
        <Link href={action.href} className="inline-flex min-h-11 items-center font-medium">
          {action.label}
        </Link>
      ) : null}
    </div>
  );
}
