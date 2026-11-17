import { ArrowDownIcon } from "lucide-react";

import { GoalList } from "@/components/home/goal-list";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";

/*
 * Phase 0 home page: a simple branded placeholder (BUILD_PLAN.md Phase 0).
 * It shows no products, counts, prices or search box, because none exist yet.
 * Phase 1 adds featured resources, the free strip and real search.
 */

const promise = [
  "What it helps you do, in plain words",
  "Who it’s for — and who may not need it",
  "Exactly what you’ll receive",
  "A small first win you can get quickly",
  "Simple setup steps and common fixes",
];

export default function HomePage() {
  return (
    <>
      <section aria-labelledby="hero-title" className="pt-14 pb-section sm:pt-20">
        <Container className="grid gap-12 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:items-end lg:gap-16">
          <div className="flex flex-col items-start gap-8">
            <h1 id="hero-title" className="text-display">
              Learn something.
              <br />
              Create something.
              <br />
              <em className="font-display text-primary italic">Make progress.</em>
            </h1>
            <p className="max-w-[34rem] text-lead text-muted-foreground">
              Practical digital resources — guides, templates, courses and project files — each with
              clear, step-by-step help so you can actually use what you get.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <Button asChild size="lg">
                <a href="#goals">
                  Start with a goal
                  <ArrowDownIcon aria-hidden="true" />
                </a>
              </Button>
              <p className="text-base text-muted-foreground">
                The shop is being set up. Resources will appear here once they’re published.
              </p>
            </div>
          </div>

          <aside
            aria-labelledby="promise-title"
            className="rounded-xl bg-card p-6 shadow-card sm:p-8"
          >
            <h2 id="promise-title" className="text-h3">
              Every resource comes with a guide
            </h2>
            <ul className="mt-5 flex flex-col">
              {promise.map((item) => (
                <li
                  key={item}
                  className="flex gap-3 border-t border-border py-3 text-base first:border-t-0 first:pt-0 last:pb-0"
                >
                  <span
                    aria-hidden="true"
                    className="mt-[0.6em] size-1.5 shrink-0 rounded-full bg-primary"
                  />
                  {item}
                </li>
              ))}
            </ul>
          </aside>
        </Container>
      </section>

      <section
        id="goals"
        aria-labelledby="goals-title"
        className="scroll-mt-20 border-t border-border bg-card py-section"
      >
        <Container className="flex flex-col gap-10">
          <div className="flex max-w-2xl flex-col gap-3">
            <h2 id="goals-title" className="text-h2">
              What would you like to achieve?
            </h2>
            <p className="text-lead text-muted-foreground">
              Choose a goal. You don’t need to know file types — we’ll point you to the right
              resource.
            </p>
          </div>

          <GoalList />
        </Container>
      </section>
    </>
  );
}
