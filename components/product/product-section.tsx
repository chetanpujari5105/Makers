import { cn } from "@/lib/utils";

/* One titled section of the product page. `id` feeds the "On this page" list. */
export function Section({
  id,
  title,
  children,
  className,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className={cn("flex scroll-mt-24 flex-col gap-5", className)}
    >
      <h2 id={`${id}-title`} className="text-h3">
        {title}
      </h2>
      {children}
    </section>
  );
}

export function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-col gap-2.5">
      {items.map((item) => (
        <li key={item} className="flex gap-3">
          <span
            aria-hidden="true"
            className="mt-[0.68em] size-1.5 shrink-0 rounded-full bg-primary"
          />
          {item}
        </li>
      ))}
    </ul>
  );
}
