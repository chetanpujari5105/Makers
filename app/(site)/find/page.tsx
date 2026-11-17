import type { Metadata } from "next";

import { ComingSoon } from "@/components/layout/coming-soon";

// Placeholder until this page is built (see BUILD_PLAN.md). Not indexed.
export const metadata: Metadata = { title: "Find the right resource", robots: { index: false } };

export default function Page() {
  return (
    <ComingSoon
      title="Find the right resource"
      description="A short three-question guide that suggests resources for you. It is not ready yet."
    />
  );
}
