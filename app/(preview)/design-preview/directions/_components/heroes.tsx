import Link from "next/link";
import { ArrowRightIcon, SearchIcon } from "lucide-react";

import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { goals } from "@/lib/brand";
import type { ProductSummary } from "@/lib/catalogue/types";
import { cn } from "@/lib/utils";

import { DirectionCover } from "./covers";
import { Figure } from "@/components/product/figure";

function SearchRow({ id, className, big }: { id: string; className?: string; big?: boolean }) {
  return (
    <form
      action="/explore"
      method="get"
      role="search"
      className={cn("flex w-full gap-2", className)}
    >
      <label htmlFor={id} className="sr-only">
        Search resources
      </label>
      <div className="relative flex-1">
        <SearchIcon
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          id={id}
          name="q"
          type="search"
          autoComplete="off"
          placeholder="Try “budget”, “Notion” or “poster”…"
          className={cn("pl-12", big && "h-14 rounded-full text-lg")}
        />
      </div>
      <Button type="submit" size="lg" className={cn(big && "h-14 px-8")}>
        Search
      </Button>
    </form>
  );
}

/* A — "The open workbook" */
export function HeroA({ covers }: { covers: ProductSummary[] }) {
  const steps = ["Pick a goal", "Follow the guide", "Get your first win"];
  return (
    <section className="pt-12 pb-16 sm:pt-16 lg:pb-24">
      <Container className="grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-16">
        <div className="flex flex-col items-start gap-7">
          <h1 className="text-[clamp(2.75rem,1.9rem+4vw,5.25rem)] leading-[0.98]">
            Make something <em className="text-primary italic">this&nbsp;week.</em>
          </h1>
          <p className="max-w-[32rem] text-lead text-muted-foreground">
            Practical guides, templates and kits. Every one comes with setup steps and a quick first
            win.
          </p>
          <SearchRow id="hero-a-search" className="max-w-[34rem]" />
          <ol className="grid w-full max-w-[34rem] grid-cols-3 gap-4 border-t border-foreground/80 pt-4">
            {steps.map((step, i) => (
              <li key={step} className="flex flex-col gap-1">
                <span className="font-display text-h3 text-primary italic">0{i + 1}</span>
                <span className="text-base leading-snug">{step}</span>
              </li>
            ))}
          </ol>
        </div>
        {/* Staggered plates that never overlap each other's labels */}
        <div className="mx-auto grid w-full max-w-[34rem] grid-cols-2 items-start gap-4 sm:gap-6">
          {covers.slice(0, 3).map((p, i) => (
            <figure
              key={p.slug}
              className={cn(
                "bg-card p-2 shadow-[0_1px_2px_rgb(29_27_23/0.08),0_18px_40px_-18px_rgb(29_27_23/0.35)]",
                i === 0 && "-rotate-[1.5deg]",
                i === 1 && "row-span-2 mt-[45%] rotate-1",
                i === 2 && "-rotate-[0.5deg]",
              )}
            >
              <DirectionCover dir="a" product={p} className="max-sm:[&>span]:hidden" />
              <figcaption className="px-1 pt-2 pb-0.5 text-sm text-muted-foreground">
                {p.title}
              </figcaption>
            </figure>
          ))}
        </div>
      </Container>
    </section>
  );
}

/* B — "Goal bento" */
export function HeroB() {
  const types = {
    create: "design_kit",
    learn: "course",
    "work-smarter": "notion",
    "build-make": "model_3d",
  } as const;
  const tint: Record<string, string> = {
    create: "bg-cover-create",
    learn: "bg-cover-learn",
    "work-smarter": "bg-cover-work",
    "build-make": "bg-cover-build",
  };
  return (
    <section className="pt-12 pb-16 sm:pt-16">
      <Container className="flex flex-col gap-10">
        <div className="flex max-w-4xl flex-col gap-6">
          <h1 className="text-[clamp(2.75rem,1.8rem+4.2vw,5.5rem)] leading-[0.95]">
            What do you want to get better at?
          </h1>
          <p className="max-w-[36rem] text-lead text-muted-foreground">
            Practical guides, templates and kits — each with step-by-step help and a quick first
            win.
          </p>
          <SearchRow id="hero-b-search" big className="max-w-[40rem]" />
        </div>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {goals.map((goal) => (
            <li
              key={goal.slug}
              className={cn(
                "relative flex min-h-56 flex-col gap-2 overflow-hidden rounded-[1.5rem] p-6 shadow-[0_0_0_2px_var(--foreground)]",
                tint[goal.slug],
              )}
            >
              <h2 className="text-h2">
                <Link
                  href={`/category/${goal.slug}`}
                  className="text-foreground no-underline after:absolute after:inset-0"
                >
                  {goal.label}
                </Link>
              </h2>
              <p className="max-w-[16rem] text-base text-foreground">{goal.description}</p>
              <Figure
                type={types[goal.slug as keyof typeof types]}
                mode="flat"
                className="absolute right-[-8%] bottom-[-14%] w-[52%] text-foreground"
              />
              <ArrowRightIcon aria-hidden="true" className="mt-auto size-6" />
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

/* C — "The shelf" */
export function HeroC({ covers }: { covers: ProductSummary[] }) {
  return (
    <section className="pt-14 pb-16 sm:pt-20">
      <Container className="flex flex-col items-center gap-7 text-center">
        <h1 className="max-w-4xl text-[clamp(2.5rem,1.7rem+3.6vw,4.75rem)] leading-[1.02]">
          Practical resources.{" "}
          <span className="text-muted-foreground">Each with a setup guide and a first win.</span>
        </h1>
        <SearchRow id="hero-c-search" className="max-w-[34rem]" />
      </Container>
      <div className="mt-12 [scrollbar-width:none] overflow-x-auto pb-4">
        <ul className="mx-auto flex w-max snap-x snap-mandatory gap-5 px-gutter lg:w-full lg:max-w-page lg:justify-center">
          {covers.slice(0, 5).map((p) => (
            <li key={p.slug} className="w-[min(68vw,15rem)] shrink-0 snap-start lg:w-[13.5rem]">
              <DirectionCover dir="c" product={p} />
              <p className="mt-3 text-center text-base font-medium">{p.title}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
