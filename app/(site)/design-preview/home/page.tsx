import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { HomeView } from "@/components/home/home-view";
import { seedProducts } from "@/db/seed-data";

import { DraftNotice } from "../_components/draft-notice";
import { sampleDetails, toSummary } from "../_data/sample-views";

export const metadata: Metadata = {
  title: "Homepage layout draft",
  robots: { index: false, follow: false },
};

export default function HomeDraftPage() {
  if (process.env.VERCEL_ENV === "production") notFound();
  const summaries = sampleDetails.map(toSummary);

  return (
    <>
      <DraftNotice>
        Shows the six sample products as if they were published. Not shown yet, by design: bundles
        (none exist), newsletter signup (Phase 2) and checkout claims (Phase 3). The search box
        links to Explore, which is built after you approve this layout.
      </DraftNotice>
      <HomeView
        featured={summaries.filter((p) => featuredSlugs.has(p.slug))}
        free={summaries.filter((p) => p.isFree)}
      />
    </>
  );
}

// Mirrors `featured: true` in db/seed-data.ts.
const featuredSlugs = new Set(seedProducts.filter((p) => p.featured).map((p) => p.slug));
