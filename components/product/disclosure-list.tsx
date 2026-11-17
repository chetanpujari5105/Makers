import { ChevronDownIcon } from "lucide-react";

/*
 * Accessible accordion built on native <details>/<summary>: keyboard and
 * screen-reader support come from the browser, and it works without JS.
 * Height animation lives in globals.css (.disclosure).
 */
export function DisclosureList({ items }: { items: { title: string; body: string }[] }) {
  return (
    <div className="border-t border-border">
      {items.map((item) => (
        <details key={item.title} className="disclosure group border-b border-border">
          <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-4 text-body font-medium focus-visible:outline-offset-2">
            {item.title}
            <ChevronDownIcon
              aria-hidden="true"
              className="size-5 shrink-0 text-muted-foreground transition-[rotate] duration-200 ease-out group-open:rotate-180"
            />
          </summary>
          <p className="max-w-prose pb-5 text-body text-foreground/85">{item.body}</p>
        </details>
      ))}
    </div>
  );
}
