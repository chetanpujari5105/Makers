import { z } from "zod";

import { goals, type GoalSlug } from "@/lib/brand";

/*
 * Zod schemas for external input (CLAUDE.md §4: validate query strings,
 * route params and API bodies with Zod). Later phases add API body schemas
 * here (leads, orders, free claims, magic links…).
 */

const goalSlugs = goals.map((goal) => goal.slug) as [GoalSlug, ...GoalSlug[]];

/** Route param for /category/[slug]: only the four known goal slugs. */
export const goalSlugSchema = z.enum(goalSlugs);
