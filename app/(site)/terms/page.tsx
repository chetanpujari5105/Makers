import type { Metadata } from "next";
import Link from "next/link";

import {
  BusinessDetails,
  GrievanceOfficer,
  LegalPage,
  OwnerField,
} from "@/components/legal/legal-page";
import { brand, legal } from "@/lib/brand";

export const metadata: Metadata = { title: "Terms" };

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of use and sale"
      intro={`These terms apply when you use ${brand.name} or get a kit from it, free or paid.`}
    >
      <section>
        <h2>1. Who you are dealing with</h2>
        <BusinessDetails />
      </section>
      <section>
        <h2>2. What you get</h2>
        <p>
          A kit is a digital product: files or links you download or open. Buying or claiming a kit
          gives you a licence to use it as described on its product page and on the{" "}
          <Link href="/license">licence page</Link>. You don’t buy the copyright, and you may not
          resell, share or publish the files as they are.
        </p>
      </section>
      <section>
        <h2>3. Your library and sign-in</h2>
        <p>
          There are no passwords. We email you a one-time sign-in link that works for 15 minutes.
          Keep access to your email account: anyone who can open your email can open your library.
        </p>
      </section>
      <section>
        <h2>4. Prices and payment</h2>
        <p>
          Prices are shown in Indian rupees and are the full amount you pay (see{" "}
          <Link href="/pricing">Pricing</Link>). Payments are handled by Razorpay; we never see or
          store your card or bank details. A purchase is complete only when the payment is
          confirmed.
        </p>
      </section>
      <section>
        <h2>5. Delivery, refunds and cancellations</h2>
        <p>
          Kits are delivered digitally, straight to your library. All sales are final. Details and
          the few cases where we do put things right are on{" "}
          <Link href="/refund-policy">Refunds, cancellations and delivery</Link>.
        </p>
      </section>
      <section>
        <h2>6. Fair use of the site</h2>
        <ul>
          <li>
            Don’t try to get kits you haven’t claimed or paid for, or share your download links.
          </li>
          <li>Don’t overload, scrape or attack the site.</li>
          <li>Reviews must be honest and about your own use of the kit.</li>
        </ul>
        <p>We may limit downloads or close access if these rules are broken.</p>
      </section>
      <section>
        <h2>7. Results and responsibility</h2>
        <p>
          Kits explain how to get a useful first result, but results depend on how you use them. We
          don’t promise particular outcomes, earnings or time savings.{" "}
          <OwnerField value={null} label="lawyer to add the limitation-of-liability wording" />
        </p>
      </section>
      <section>
        <h2>8. Changes and updates</h2>
        <p>
          We may improve a kit after you get it; updates appear in your library. We may change these
          terms; the version on this page at the time of your purchase applies to it.
        </p>
      </section>
      <section>
        <h2>9. Law and disputes</h2>
        <p>
          These terms are governed by the laws of India. Disputes are handled by the courts of{" "}
          <OwnerField value={legal.jurisdictionCity} label="city" />. Please contact us first — most
          problems are solved quickly by email.
        </p>
      </section>
      <GrievanceOfficer />
    </LegalPage>
  );
}
