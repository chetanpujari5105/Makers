/**
 * Central brand configuration.
 *
 * Change the store name, tagline and navigation HERE — components read from
 * this file, so a rename never means editing many components.
 *
 * Values marked `null` are owner decisions that have NOT been made yet
 * (see docs/DECISIONS.md). Components must hide anything that is null rather
 * than show a made-up value. Never invent a domain, email or address.
 */

export type GoalSlug = "create" | "learn" | "work-smarter" | "build-make";

export type Goal = {
  slug: GoalSlug;
  /** Matches `goal_group` in PROJECT_SPEC.md §2.1 (used from Phase 1). */
  goalGroup: "create" | "learn" | "work_smarter" | "build_make";
  label: string;
  description: string;
  examples: string;
};

export type NavLink = { label: string; href: string };

export const brand = {
  /** Working name — temporary until the owner decides the final brand. */
  name: "MAKERS",
  tagline: "Learn something. Create something. Make progress.",
  description:
    "Practical digital resources — guides, templates, courses and project files — with clear, step-by-step help to get you started.",

  /** Owner decisions pending. Keep null until real values exist. */
  supportEmail: null as string | null,
  socialLinks: [] as NavLink[],
} as const;

/** The four customer goals (PROJECT_SPEC.md §2.1). Order matters. */
export const goals: readonly Goal[] = [
  {
    slug: "create",
    goalGroup: "create",
    label: "Create",
    description: "Design something you are proud to share.",
    examples: "Figma kits, Canva templates and creative assets",
  },
  {
    slug: "learn",
    goalGroup: "learn",
    label: "Learn",
    description: "Pick up a new skill, one clear step at a time.",
    examples: "Courses, ebooks, workbooks and practical guides",
  },
  {
    slug: "work-smarter",
    goalGroup: "work_smarter",
    label: "Work Smarter",
    description: "Organise your work and save time every week.",
    examples: "Notion workspaces, AI prompt packs and productivity kits",
  },
  {
    slug: "build-make",
    goalGroup: "build_make",
    label: "Build & Make",
    description: "Make real things you can hold and use.",
    examples: "3D models, printable designs and project files",
  },
];

export const primaryNav: readonly NavLink[] = [
  { label: "Explore", href: "/explore" },
  ...goals.map((goal) => ({ label: goal.label, href: `/category/${goal.slug}` })),
  { label: "Free resources", href: "/free" },
];

/** Extra links shown under the goals in the mobile menu. */
export const mobileSecondaryNav: readonly NavLink[] = [
  { label: "Explore everything", href: "/explore" },
  { label: "Free resources", href: "/free" },
  { label: "Help centre", href: "/help" },
];

export const libraryLink: NavLink = { label: "My Library", href: "/library" };

export const footerNav: readonly { heading: string; links: readonly NavLink[] }[] = [
  {
    heading: "Shop",
    links: [
      { label: "Explore", href: "/explore" },
      { label: "Free resources", href: "/free" },
      { label: "Bundles", href: "/bundles" },
      { label: "Find the right resource", href: "/find" },
    ],
  },
  {
    heading: "Help",
    links: [
      { label: "My Library", href: "/library" },
      { label: "Help centre", href: "/help" },
      { label: "Contact", href: "/contact" },
      { label: "About", href: "/about" },
    ],
  },
  {
    heading: "Policies",
    links: [
      { label: "Refund policy", href: "/refund-policy" },
      { label: "Terms", href: "/terms" },
      { label: "Privacy", href: "/privacy" },
      { label: "License", href: "/license" },
    ],
  },
];
