import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRightIcon } from "lucide-react";

import { CatalogueEmpty } from "@/components/catalogue/catalogue-empty";
import { Container } from "@/components/layout/container";
import { ProductGrid } from "@/components/product/product-card";
import { goals } from "@/lib/brand";
import { getCatalogue } from "@/lib/catalogue/catalogue";
import { exploreHref } from "@/lib/catalogue/filters";
import { goalSlugSchema } from "@/lib/validators";

/*
 * Goal landing page. Only the four goal slugs exist; proxy.ts returns a real
 * 404 for anything else before this page runs (notFound() here is the backup).
 */
export function generateStaticParams() {
  return goals.map((goal) => ({ slug: goal.slug }));
}

function findGoal(rawSlug: string) {
  const parsed = goalSlugSchema.safeParse(rawSlug);
  return parsed.success ? goals.find((goal) => goal.slug === parsed.data) : undefined;
}

export async function generateMetadata({
  params,
}: PageProps<"/category/[slug]">): Promise<Metadata> {
  const goal = findGoal((await params).slug);
  if (!goal) return { title: "Page not found", robots: { index: false } };
  return {
    title: goal.label,
    description: `${goal.description} ${goal.examples}.`,
    alternates: { canonical: `/category/${goal.slug}` },
  };
}

export default async function CategoryPage({ params }: PageProps<"/category/[slug]">) {
  const goal = findGoal((await params).slug);
  if (!goal) notFound();
  const { items, total } = await getCatalogue({ goal: goal.slug });

  return (
    <Container className="flex flex-col gap-10 py-section">
      <header className="flex max-w-2xl flex-col gap-3">
        <p className="text-sm font-medium tracking-wide text-primary uppercase">Goal</p>
        <h1 className="text-h1">{goal.label}</h1>
        <p className="text-lead text-muted-foreground">{goal.description}</p>
        <p className="text-muted-foreground">{goal.examples}.</p>
      </header>
      {items.length > 0 ? (
        <>
          <ProductGrid products={items} />
          {total > items.length ? (
            <Link
              href={exploreHref({ goal: goal.slug, page: 2 })}
              className="inline-flex min-h-11 items-center gap-1.5 self-start font-medium"
            >
              See more {goal.label} resources
              <ArrowRightIcon aria-hidden="true" className="size-4" />
            </Link>
          ) : null}
        </>
      ) : (
        <CatalogueEmpty
          title={`No ${goal.label} resources yet`}
          body="Resources for this goal will appear here once they’re published."
          action={{ href: "/explore", label: "Explore everything" }}
        />
      )}
    </Container>
  );
}
