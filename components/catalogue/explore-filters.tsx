import Form from "next/form";
import Link from "next/link";
import { ChevronDownIcon, SearchIcon, SlidersHorizontalIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { goals } from "@/lib/brand";
import { productTypeLabel, levelLabel } from "@/lib/catalogue/labels";
import {
  activeFilterCount,
  exploreHref,
  priceRanges,
  setupTimes,
  sortOptions,
  type CatalogueFilters,
} from "@/lib/catalogue/filters";

/*
 * A GET form (next/form): submitting it writes the filters into the URL, so
 * results can be shared, refreshed and reached with Back. With JavaScript it
 * navigates in place (results crossfade); without it, it's a normal form. Filters sit in a native <details> (keyboard and screen-reader
 * support for free) that starts open whenever a filter is in use.
 */
export function ExploreFilters({ filters }: { filters: CatalogueFilters }) {
  const active = activeFilterCount(filters);

  return (
    <Form action="/explore" role="search" className="flex flex-col gap-4">
      {/* Goal chips: the main choice at a glance. Links, so they work without JS. */}
      <nav aria-label="Goals" className="-mx-gutter overflow-x-auto px-gutter">
        <ul className="flex w-max gap-2 pb-1">
          {[{ slug: undefined, label: "Everything" }, ...goals].map((goal) => {
            const current = filters.goal === goal.slug;
            return (
              <li key={goal.label}>
                <Link
                  href={exploreHref(filters, { goal: goal.slug, page: undefined })}
                  aria-current={current ? "page" : undefined}
                  className="motion-press inline-flex min-h-11 items-center rounded-full border border-input bg-card px-4 text-base text-foreground no-underline transition-[background-color,border-color,color,scale] duration-150 ease-out active:scale-[0.97] aria-[current=page]:border-foreground aria-[current=page]:bg-foreground aria-[current=page]:text-background pointer-fine:hover:border-foreground"
                >
                  {goal.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex flex-1 flex-col gap-2">
          <Label htmlFor="explore-q">Search resources</Label>
          <div className="relative">
            <SearchIcon
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              id="explore-q"
              name="q"
              type="search"
              enterKeyHint="search"
              autoComplete="off"
              maxLength={80}
              defaultValue={filters.q ?? ""}
              placeholder="Try “budget”, “Notion” or “poster”…"
              className="pl-12"
            />
          </div>
        </div>
        <FilterSelect
          id="explore-sort"
          name="sort"
          label="Sort by"
          value={filters.sort}
          options={sortOptions}
          className="sm:w-56"
        />
      </div>

      <details open={active > 0} className="group/filters rounded-xl border border-border bg-card">
        <summary className="flex min-h-12 cursor-pointer list-none items-center gap-2 rounded-xl px-5 font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring [&::-webkit-details-marker]:hidden">
          <SlidersHorizontalIcon aria-hidden="true" className="size-5 text-primary" />
          Filters
          {active > 0 ? <span className="text-muted-foreground">({active} on)</span> : null}
          <ChevronDownIcon
            aria-hidden="true"
            className="ml-auto size-5 transition-[rotate] duration-200 ease-out group-open/filters:rotate-180"
          />
        </summary>
        <div className="grid gap-4 border-t border-border p-5 sm:grid-cols-2 lg:grid-cols-3">
          <FilterSelect
            id="explore-goal"
            name="goal"
            label="Goal"
            value={filters.goal}
            options={Object.fromEntries(goals.map((g) => [g.slug, g.label]))}
          />
          <FilterSelect
            id="explore-type"
            name="type"
            label="Type"
            value={filters.type}
            options={productTypeLabel}
          />
          <FilterSelect
            id="explore-level"
            name="level"
            label="Skill level"
            value={filters.level}
            options={levelLabel}
          />
          <FilterSelect
            id="explore-cost"
            name="cost"
            label="Free or paid"
            value={filters.cost}
            options={{ free: "Free", paid: "Paid" }}
          />
          <FilterSelect
            id="explore-price"
            name="price"
            label="Price"
            value={filters.price}
            options={priceRanges}
          />
          <FilterSelect
            id="explore-setup"
            name="setup"
            label="Setup time"
            value={filters.setup}
            options={setupTimes}
          />
        </div>
      </details>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
        <Button type="submit">Show results</Button>
        {active > 0 || filters.q || filters.sort !== "featured" ? (
          <Link href="/explore" className="inline-flex min-h-11 items-center font-medium">
            Clear all
          </Link>
        ) : null}
      </div>
    </Form>
  );
}

function FilterSelect({
  id,
  name,
  label,
  value,
  options,
  className,
}: {
  id: string;
  name: string;
  label: string;
  value: string | undefined;
  options: Record<string, string>;
  className?: string;
}) {
  const hasAny = name !== "sort";
  return (
    <div className={className}>
      <Label htmlFor={id} className="mb-2 block">
        {label}
      </Label>
      <div className="relative">
        <select
          id={id}
          name={name}
          defaultValue={value ?? ""}
          className="h-12 w-full appearance-none rounded-lg border border-input bg-card pr-11 pl-4 text-base text-foreground transition-[border-color,box-shadow] duration-150 ease-out focus-visible:border-ring focus-visible:shadow-[0_0_0_1px_var(--ring),0_0_0_5px_var(--primary-soft)] focus-visible:outline-none pointer-fine:hover:not-focus:border-foreground/50"
        >
          {hasAny ? <option value="">Any</option> : null}
          {Object.entries(options).map(([key, text]) => (
            <option key={key} value={key}>
              {text}
            </option>
          ))}
        </select>
        <ChevronDownIcon
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 right-4 size-5 -translate-y-1/2 text-muted-foreground"
        />
      </div>
    </div>
  );
}
