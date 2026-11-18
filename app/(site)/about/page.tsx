import type { Metadata } from "next";
import Link from "next/link";

import { BusinessDetails, LegalPage } from "@/components/legal/legal-page";
import { brand } from "@/lib/brand";

// Draft until the owner reviews it; not indexed.
export const metadata: Metadata = { title: "About", robots: { index: false } };

export default function AboutPage() {
  return (
    <LegalPage
      title={`About ${brand.name}`}
      intro={`${brand.name} is a collection of practical digital kits — templates, guides, workbooks and project files — made by ${brand.ownerName}.`}
    >
      <section>
        <h2>What we make</h2>
        <p>
          Every kit is built to be used, not just downloaded. Each product page says what it helps
          you do, who it is for, what you get, and how to get a first result quickly.
        </p>
      </section>
      <section>
        <h2>Who runs it</h2>
        <p>
          {brand.name} is run by {brand.ownerName}, an educator and digital creator. It is a
          one-person store: there are no other sellers.
        </p>
        <BusinessDetails />
      </section>
      <section>
        <h2>Questions</h2>
        <p>
          See <Link href="/contact">Contact</Link> for how to reach us, and{" "}
          <Link href="/pricing">Pricing</Link> for what things cost.
        </p>
      </section>
    </LegalPage>
  );
}
