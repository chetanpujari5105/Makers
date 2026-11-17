import type { Metadata } from "next";

import { ComingSoon } from "@/components/layout/coming-soon";

// Placeholder until this page is built (see BUILD_PLAN.md). Not indexed.
export const metadata: Metadata = { title: "Refund policy", robots: { index: false } };

export default function Page() {
  return (
    <ComingSoon
      title="Refund policy"
      description="This policy is being written and must be reviewed by the store owner before the store opens."
    />
  );
}
