import type { Metadata } from "next";
import Link from "next/link";

import { LegalPage } from "@/components/legal/legal-page";
import { brand } from "@/lib/brand";

// Draft until the owner reviews it; not indexed.
export const metadata: Metadata = {
  title: "Refunds, cancellations and delivery",
  robots: { index: false },
};

export default function RefundPolicyPage() {
  return (
    <LegalPage
      title="Refunds, cancellations and delivery"
      intro="Kits are digital downloads you get straight away, so all sales are final."
    >
      <section>
        <h2>No refunds</h2>
        <p>
          Once a purchase is complete and the kit is in your library, we don’t offer refunds or
          exchanges. Please read the product page — what’s included, what you need and the licence —
          before you buy. Free kits let you try the format first.
        </p>
      </section>
      <section>
        <h2>When we will put things right</h2>
        <ul>
          <li>
            <strong>You paid but never got access</strong>, and we can’t fix it — we return the
            payment.
          </li>
          <li>
            <strong>You were charged twice</strong> for the same kit — we return the extra payment.
          </li>
        </ul>
        <p>
          Write to us from <Link href="/contact">Contact</Link> within 7 days of the payment, with
          the email you used and the Razorpay payment ID. Returned payments go back to the original
          payment method through Razorpay; banks usually take 5–7 working days to show them.
        </p>
      </section>
      <section>
        <h2>Cancelling</h2>
        <p>
          You can cancel at any point before the payment completes: close the payment window and
          nothing is charged. If money left your account but the payment failed, your bank or
          Razorpay normally returns it automatically. If it hasn’t arrived after 7 working days,
          contact us with the payment ID.
        </p>
      </section>
      <section>
        <h2>Delivery</h2>
        <ul>
          <li>
            Everything is delivered digitally. Nothing is shipped and there are no delivery charges.
          </li>
          <li>
            Right after a free claim or a confirmed payment, the kit appears in{" "}
            <Link href="/library">My Library</Link> and we email you a sign-in link.
          </li>
          <li>
            If the email doesn’t arrive within an hour, check your spam folder, then ask for a new
            link on My Library or contact {brand.name}.
          </li>
          <li>
            Each kit can be downloaded a limited number of times (shown in your library). If you run
            out, contact us.
          </li>
        </ul>
      </section>
    </LegalPage>
  );
}
