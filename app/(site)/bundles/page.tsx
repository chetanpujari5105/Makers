import type { Metadata } from "next";

import { ComingSoon } from "@/components/layout/coming-soon";

// Placeholder until this page is built (see BUILD_PLAN.md). Not indexed.
export const metadata: Metadata = { title: "Bundles", robots: { index: false } };

export default function Page() {
  return <ComingSoon title="Bundles" />;
}
