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
  /** Brand locked 2026-11-18 (docs/DECISIONS.md). Logo files: public/brand/. */
  name: "Fieldkitt",
  tagline: "Practical kits by Chetan",
  ownerName: "Chetan",
  description:
    "Ready-to-use digital kits, practical guides and creative resources. Clear steps to help you learn, create and get things done.",

  /** Owner decisions pending. Keep null until real values exist. */
  domain: null as string | null,
  /** Owner provided 2026-11-18. */
  supportEmail: "chetanpujari92@gmail.com" as string | null,
  socialLinks: [] as NavLink[],
} as const;

type OwnerValue = string | null;

/**
 * Business and legal details shown on the policy pages, contact page and
 * invoices. ALL are owner decisions: keep null until real values exist.
 * Owner provided name, address, phone, email, GST status and courts on 2026-11-18.
 * Pages render a null as a visible "[Owner to fill: …]" marker, never a guess.
 */
export const legal = {
  /** Full legal name of the person or business that sells (as on PAN/GST). */
  legalName: "Chetan Kantu Pujari" as OwnerValue,
  /** Full postal address, as it should appear on invoices. */
  address:
    "344, Near Water Tank, Ghadgewasti, Baramati MIDC, Baramati, Maharashtra 413133" as OwnerValue,
  phone: "+91 98341 06594" as OwnerValue,
  /** e.g. "Individual, not registered under GST" or "Sole proprietorship". */
  registration: "Individual, not registered under GST" as OwnerValue,
  /** GSTIN if registered; leave null if not registered. */
  gstin: null as OwnerValue,
  /** UDYAM (MSME) number if registered. */
  udyam: null as OwnerValue,
  /** City whose courts handle disputes (Terms). */
  jurisdictionCity: "Baramati, Maharashtra" as OwnerValue,
  /** Date the owner (or a lawyer) last reviewed the policies. */
  policiesReviewedOn: null as OwnerValue,
  /** Required by the Consumer Protection (E-Commerce) Rules 2020 and IT Rules 2021. */
  grievanceOfficer: {
    name: "Chetan Kantu Pujari" as OwnerValue,
    designation: "Owner" as OwnerValue,
    email: "chetanpujari92@gmail.com" as OwnerValue,
    phone: "+91 98341 06594" as OwnerValue,
  },
};

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
      { label: "Grievance officer", href: "/contact#grievance" },
    ],
  },
  {
    heading: "Policies",
    links: [
      { label: "Pricing", href: "/pricing" },
      { label: "Refunds and delivery", href: "/refund-policy" },
      { label: "Terms", href: "/terms" },
      { label: "Privacy", href: "/privacy" },
      { label: "License", href: "/license" },
    ],
  },
];
