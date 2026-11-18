import type { ReactNode } from "react";

import { Container } from "@/components/layout/container";
import { brand, legal } from "@/lib/brand";

/*
 * Shared pieces for the policy and trust pages. Every page is a DRAFT until
 * the owner (and ideally a lawyer) reviews it. Missing owner details render
 * as a visible marker, never a made-up value (docs/DECISIONS.md).
 */

/** An owner detail, or a clearly marked gap when it hasn't been filled in. */
function OwnerField({ value, label }: { value: string | null; label: string }) {
  if (value) return <>{value}</>;
  return (
    <mark className="rounded-sm bg-warning-soft px-1 text-warning">[Owner to fill: {label}]</mark>
  );
}

function LegalPage({
  title,
  intro,
  children,
}: {
  title: string;
  intro?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Container size="prose" className="flex flex-col gap-8 py-section">
      <header className="flex flex-col gap-4">
        <h1 className="text-h1">{title}</h1>
        {legal.policiesReviewedOn ? (
          <p className="text-base text-muted-foreground">
            Last reviewed: {legal.policiesReviewedOn}.
          </p>
        ) : (
          <p
            role="note"
            className="rounded-lg border border-warning/40 bg-warning-soft px-4 py-3 text-base text-warning"
          >
            <strong>Draft: owner/lawyer review required.</strong> This page is a starting point, not
            legal advice, and hasn’t been checked by a lawyer. Last reviewed:{" "}
            <OwnerField value={legal.policiesReviewedOn} label="review date" />.
          </p>
        )}
        {intro ? <div className="text-lead text-muted-foreground">{intro}</div> : null}
      </header>
      <div className="flex flex-col gap-8 text-base leading-relaxed [&_a]:text-primary [&_a]:underline [&_h2]:text-h3 [&_li]:ml-5 [&_li]:list-disc [&_section]:flex [&_section]:flex-col [&_section]:gap-3">
        {children}
      </div>
    </Container>
  );
}

/** Who sells: legal name, address, registration and contact. */
function BusinessDetails() {
  return (
    <dl className="grid gap-x-6 gap-y-2 sm:grid-cols-[12rem_1fr]">
      <dt className="font-medium">Store</dt>
      <dd>
        {brand.name} — {brand.tagline}
      </dd>
      <dt className="font-medium">Seller (legal name)</dt>
      <dd>
        <OwnerField value={legal.legalName} label="legal name" />
      </dd>
      <dt className="font-medium">Address</dt>
      <dd>
        <OwnerField value={legal.address} label="postal address" />
      </dd>
      <dt className="font-medium">Registration</dt>
      <dd>
        <OwnerField
          value={legal.registration}
          label="e.g. “Individual, not registered under GST” or “Sole proprietorship”"
        />
        {legal.gstin ? <> · GSTIN {legal.gstin}</> : null}
        {legal.udyam ? <> · UDYAM {legal.udyam}</> : null}
      </dd>
      <dt className="font-medium">Email</dt>
      <dd>
        <OwnerField value={brand.supportEmail} label="support email" />
      </dd>
      <dt className="font-medium">Phone</dt>
      <dd>
        <OwnerField value={legal.phone} label="phone number" />
      </dd>
    </dl>
  );
}

/** Grievance Officer (Consumer Protection (E-Commerce) Rules 2020, IT Rules 2021). */
function GrievanceOfficer() {
  const officer = legal.grievanceOfficer;
  return (
    <section id="grievance" aria-labelledby="grievance-title" className="scroll-mt-24">
      <h2 id="grievance-title">Grievance Officer</h2>
      <p>If you have a complaint about the store, a purchase or your personal data, contact:</p>
      <dl className="grid gap-x-6 gap-y-2 sm:grid-cols-[12rem_1fr]">
        <dt className="font-medium">Name</dt>
        <dd>
          <OwnerField value={officer.name} label="grievance officer name" />
        </dd>
        <dt className="font-medium">Designation</dt>
        <dd>
          <OwnerField value={officer.designation} label="designation" />
        </dd>
        <dt className="font-medium">Email</dt>
        <dd>
          <OwnerField value={officer.email} label="grievance email" />
        </dd>
        <dt className="font-medium">Phone</dt>
        <dd>
          <OwnerField value={officer.phone} label="grievance phone" />
        </dd>
      </dl>
      <p>
        We acknowledge every complaint within <strong>48 hours</strong> and aim to resolve it within{" "}
        <strong>one month</strong> of receiving it.
      </p>
    </section>
  );
}

export { BusinessDetails, GrievanceOfficer, LegalPage, OwnerField };
