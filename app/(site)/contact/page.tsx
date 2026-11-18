import type { Metadata } from "next";
import Link from "next/link";

import { BusinessDetails, GrievanceOfficer, LegalPage } from "@/components/legal/legal-page";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <LegalPage
      title="Contact us"
      intro="Questions about a kit, a payment or your library? Write to us."
    >
      <section>
        <h2>How to reach us</h2>
        <BusinessDetails />
        <p>
          Please include the email address you used at checkout. For a payment, include the Razorpay
          payment ID from your receipt (it starts with <code>pay_</code>).
        </p>
        <p>
          Lost access to a kit? You can get a new sign-in link yourself on{" "}
          <Link href="/library">My Library</Link>.
        </p>
      </section>
      <GrievanceOfficer />
    </LegalPage>
  );
}
