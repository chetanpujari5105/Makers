import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ComingSoon } from "@/components/layout/coming-soon";
import { goals } from "@/lib/brand";
import { goalSlugSchema } from "@/lib/validators";

/*
 * Placeholder goal page until Phase 1 builds the real category page.
 * The route param is validated with Zod; only the four goal slugs exist and
 * anything else is notFound(). (Under Cache Components `dynamicParams` is not
 * available — see docs/HANDOFF.md "Known issues" about the HTTP status.)
 */
export function generateStaticParams() {
  return goals.map((goal) => ({ slug: goal.slug }));
}

function findGoal(rawSlug: string) {
  const parsed = goalSlugSchema.safeParse(rawSlug);
  if (!parsed.success) return undefined;
  return goals.find((goal) => goal.slug === parsed.data);
}

export async function generateMetadata({
  params,
}: PageProps<"/category/[slug]">): Promise<Metadata> {
  const goal = findGoal((await params).slug);
  return { title: goal?.label ?? "Page not found", robots: { index: false } };
}

export default async function CategoryPage({ params }: PageProps<"/category/[slug]">) {
  const goal = findGoal((await params).slug);
  if (!goal) notFound();

  return (
    <ComingSoon
      title={goal.label}
      description={`${goal.description} Resources for this goal — ${goal.examples.toLowerCase()} — will appear here once they’re published.`}
    />
  );
}
