import Link from "next/link";

import { Container } from "@/components/layout/container";

/* Banner on layout drafts so nobody mistakes them for the live store. */
export function DraftNotice({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-b border-warning/30 bg-warning-soft">
      <Container className="flex flex-col gap-2 py-4 text-base text-foreground sm:flex-row sm:items-start sm:justify-between sm:gap-8">
        <div className="flex flex-col gap-1">
          <p className="font-semibold">Layout draft — sample content, not the live store</p>
          <div className="text-foreground/85">{children}</div>
        </div>
        <Link href="/design-preview" className="shrink-0 font-medium">
          Back to design preview
        </Link>
      </Container>
    </div>
  );
}
