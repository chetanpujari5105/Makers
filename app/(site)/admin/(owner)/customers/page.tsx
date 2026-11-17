import { Suspense } from "react";

import { when } from "@/lib/admin/format";
import { requireAdminPage } from "@/lib/admin/guard";
import { listCustomers } from "@/lib/admin/records";
import { formatInr } from "@/lib/money";

export default function CustomersPage() {
  return (
    <Suspense fallback={<p className="text-lead text-muted-foreground">Loading customers…</p>}>
      <Customers />
    </Suspense>
  );
}

async function Customers() {
  await requireAdminPage();
  const rows = await listCustomers();
  return (
    <section className="flex flex-col gap-6">
      <h1 className="text-h1">Customers</h1>
      <p className="text-base text-muted-foreground">
        People who claimed a free product or started a paid checkout.
      </p>
      {rows.length === 0 ? (
        <p className="text-base text-muted-foreground">No customers yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-base">
            <thead>
              <tr className="border-b border-border">
                <th className="py-2 pr-4">Since</th>
                <th className="py-2 pr-4">Name</th>
                <th className="py-2 pr-4">Email</th>
                <th className="py-2 pr-4">Products</th>
                <th className="py-2 pr-4">Paid orders</th>
                <th className="py-2">Spent</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <tr key={c.id} className="border-b border-border">
                  <td className="py-2 pr-4">{when(c.createdAt)}</td>
                  <td className="py-2 pr-4">{c.name}</td>
                  <td className="py-2 pr-4">{c.email}</td>
                  <td className="py-2 pr-4">{c.products}</td>
                  <td className="py-2 pr-4">{c.paidOrders}</td>
                  <td className="py-2">{formatInr(c.spentPaise)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
