import type { Metadata } from "next";
import Link from "next/link";

import { LegalPage, OwnerField } from "@/components/legal/legal-page";
import { getCatalogue } from "@/lib/catalogue/catalogue";
import { legal } from "@/lib/brand";
import { formatInr } from "@/lib/money";

// Draft until the owner reviews it; not indexed.
export const metadata: Metadata = { title: "Pricing", robots: { index: false } };

/** Every published product with the full price you pay (from the database, never typed by hand). */
async function allProducts() {
  const first = await getCatalogue({ sort: "newest" });
  const rest = await Promise.all(
    Array.from({ length: first.pageCount - 1 }, (_, i) =>
      getCatalogue({ sort: "newest", page: i + 2 }),
    ),
  );
  return [first, ...rest].flatMap((page) => page.items);
}

export default async function PricingPage() {
  const products = await allProducts();
  return (
    <LegalPage
      title="Pricing"
      intro="The price on each product is the full price you pay. There are no shipping charges, subscriptions or extra fees added at checkout."
    >
      <section>
        <h2>How prices work</h2>
        <ul>
          <li>All prices are in Indian rupees (₹) and are one-time payments.</li>
          <li>
            Tax:{" "}
            <OwnerField
              value={legal.gstin ? "Prices include GST." : null}
              label="tax line, e.g. “Prices include GST” (registered) or “GST is not charged — the seller is not registered under GST” (not registered)"
            />
          </li>
          <li>Kits are digital. You download them; nothing is shipped.</li>
          <li>
            Payments go through Razorpay (cards, UPI, net banking, wallets).{" "}
            <OwnerField
              value={null}
              label="confirm in Razorpay that the buyer is NOT charged a convenience fee, then remove this marker"
            />
          </li>
          <li>
            All sales are final — see{" "}
            <Link href="/refund-policy">Refunds, cancellations and delivery</Link>.
          </li>
        </ul>
      </section>
      <section>
        <h2>Current prices</h2>
        {products.length === 0 ? (
          <p>No kits are published yet.</p>
        ) : (
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-border">
                <th scope="col" className="py-2 pr-4 font-medium">
                  Kit
                </th>
                <th scope="col" className="py-2 text-right font-medium">
                  You pay
                </th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.slug} className="border-b border-border">
                  <td className="py-2 pr-4">
                    <Link href={`/products/${product.slug}`}>{product.title}</Link>
                    {product.isSample ? " (sample)" : null}
                  </td>
                  <td className="py-2 text-right tabular-nums">
                    {product.isFree
                      ? "Free"
                      : product.priceInr != null
                        ? formatInr(product.priceInr)
                        : "Price not set"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </LegalPage>
  );
}
