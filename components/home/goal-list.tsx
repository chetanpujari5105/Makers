import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";

import { goals } from "@/lib/brand";

/* The four goals (PROJECT_SPEC §2.1) as a numbered index: the main way into the catalogue. */
export function GoalList() {
  return (
    <ol className="grid sm:grid-cols-2 lg:grid-cols-4">
      {goals.map((goal, index) => (
        <li
          key={goal.slug}
          className="group/goal relative flex flex-col gap-2 border-b border-border py-8 has-[a:focus-visible]:outline-2 has-[a:focus-visible]:-outline-offset-2 has-[a:focus-visible]:outline-ring sm:px-6 sm:odd:border-r sm:odd:pl-0 lg:border-r lg:border-b-0 lg:first:pl-0! lg:last:border-r-0 lg:odd:pl-6"
        >
          <span aria-hidden="true" className="font-display text-h3 text-primary italic">
            0{index + 1}
          </span>
          <h3 className="text-h2">
            <Link
              href={`/category/${goal.slug}`}
              className="inline-flex items-baseline gap-2 text-foreground no-underline after:absolute after:inset-0 after:content-[''] focus-visible:outline-none"
            >
              {goal.label}
              <ArrowRightIcon
                aria-hidden="true"
                className="motion-nudge size-5 shrink-0 self-center text-primary opacity-0 transition-[opacity,translate] ease-out pointer-fine:group-hover/goal:translate-x-1 pointer-fine:group-hover/goal:opacity-100"
              />
            </Link>
          </h3>
          <p>{goal.description}</p>
          <p className="text-sm text-muted-foreground">{goal.examples}</p>
        </li>
      ))}
    </ol>
  );
}
