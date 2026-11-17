import Link from "next/link";
import { Suspense } from "react";

import { Badge } from "@/components/ui/badge";
import { when } from "@/lib/admin/format";
import { requireAdminPage } from "@/lib/admin/guard";
import { listOrders } from "@/lib/admin/records";
import { formatInr } from "@/lib/money";

export default function OrdersPage() {
  return (
    <Suspense fallback={<p className="text-lead text-muted-foreground">Loading orders…</p>}>
      <Orders />
    </Suspense>
  );
}

async function Orders() {
  await requireAdminPage();
  const rows = await listOrders();
  return (
    <section className="flex flex-col gap-6">
      <h1 className="text-h1">Orders</h1>
      <p className="text-base text-muted-foreground">
        “created” means checkout was started but no payment was confirmed. Only “paid” orders give
        access.
      </p>
      {rows.length === 0 ? (
        <p className="text-base text-muted-foreground">No orders yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-base">
            <thead>
              <tr className="border-b border-border">
                <th className="py-2 pr-4">When</th>
                <th className="py-2 pr-4">Buyer</th>
                <th className="py-2 pr-4">Product</th>
                <th className="py-2 pr-4">Amount</th>
                <th className="py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((o) => (
                <tr key={o.id} className="border-b border-border">
                  <td className="py-2 pr-4">
                    <Link href={`/admin/orders/${o.id}`}>{when(o.createdAt)}</Link>
                  </td>
                  <td className="py-2 pr-4">{o.email}</td>
                  <td className="py-2 pr-4">{o.title}</td>
                  <td className="py-2 pr-4">
                    {formatInr(o.amount)}
                    {o.coupon ? ` (${o.coupon})` : ""}
                  </td>
                  <td className="py-2">
                    <Badge variant={o.status === "paid" ? "default" : "outline"}>{o.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
