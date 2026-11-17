import type { Metadata } from "next";

import { ComingSoon } from "@/components/layout/coming-soon";

// Placeholder until this page is built (see BUILD_PLAN.md). Not indexed.
export const metadata: Metadata = { title: "My Library", robots: { index: false } };

export default function Page() {
  return (
    <ComingSoon
      title="My Library"
      description="Soon you’ll be able to get back to everything you’ve claimed or bought using a one-time email link — no password needed. This isn’t switched on yet."
    />
  );
}
