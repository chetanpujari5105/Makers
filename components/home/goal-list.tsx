import Link from "next/link";
import { ArrowUpRightIcon } from "lucide-react";

import { goals } from "@/lib/brand";
import { cn } from "@/lib/utils";

/* The four goal cards (PROJECT_SPEC §2.1): the main way into the catalogue. */
export function GoalList() {
  return (
    <ul className="grid gap-px overflow-hidden rounded-xl bg-border sm:grid-cols-2 lg:grid-cols-4">
      {goals.map((goal, index) => (
        <li
          key={goal.slug}
          className="group/goal relative flex bg-card has-[a:focus-visible]:z-10 has-[a:focus-visible]:outline-2 has-[a:focus-visible]:-outline-offset-2 has-[a:focus-visible]:outline-ring"
        >
          <div
            className={cn(
              "flex w-full flex-col gap-4 p-6 transition-colors duration-200 ease-out sm:p-8",
              "pointer-fine:group-hover/goal:bg-primary-soft",
              index === 0 && "lg:pl-8",
            )}
          >
            <h3 className="text-h2">
              <Link
                href={`/category/${goal.slug}`}
                className="text-foreground no-underline after:absolute after:inset-0 after:content-[''] focus-visible:outline-none"
              >
                {goal.label}
              </Link>
            </h3>
            <p className="text-base text-foreground">{goal.description}</p>
            <p className="mt-auto text-sm text-muted-foreground">{goal.examples}</p>
            <ArrowUpRightIcon
              aria-hidden="true"
              className="motion-nudge size-6 text-primary transition-[translate] duration-200 ease-out motion-safe:pointer-fine:group-hover/goal:translate-x-0.5 motion-safe:pointer-fine:group-hover/goal:-translate-y-0.5"
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
