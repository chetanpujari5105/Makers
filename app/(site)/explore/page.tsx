import type { Metadata } from "next";

import { ComingSoon } from "@/components/layout/coming-soon";

// Placeholder until this page is built (see BUILD_PLAN.md). Not indexed.
export const metadata: Metadata = { title: "Explore", robots: { index: false } };

export default function Page() {
  return (
    <ComingSoon
      title="Explore"
      description="Search and browse every resource. The catalogue opens in a later update."
    />
  );
}
