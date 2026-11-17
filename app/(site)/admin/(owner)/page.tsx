import Link from "next/link";
import { Suspense } from "react";

import { Badge } from "@/components/ui/badge";
import { when } from "@/lib/admin/format";
import { requireAdminPage } from "@/lib/admin/guard";
import { getMetrics } from "@/lib/admin/records";
import { formatInr } from "@/lib/money";

/* Owner dashboard: real numbers from the database only. Nothing is estimated. */
export default function DashboardPage() {
  return (
    <Suspense fallback={<p className="text-lead text-muted-foreground">Loading dashboard…</p>}>
      <Dashboard />
    </Suspense>
  );
}

function Stat({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-xl border border-border bg-card p-5">
      <span className="text-base text-muted-foreground">{label}</span>
      <span className="text-h2">{value}</span>
      {note ? <span className="text-sm text-muted-foreground">{note}</span> : null}
    </div>
  );
}

async function Dashboard() {
  await requireAdminPage();
  const m = await getMetrics();
  return (
    <div className="flex flex-col gap-10">
      <h1 className="text-h1">Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label="Paid revenue (gross)"
          value={formatInr(m.grossPaise)}
          note="Before Razorpay fees and tax. Refunded orders are not included."
        />
        <Stat
          label="Paid orders"
          value={String(m.paidOrders)}
          note={`${m.refundedOrders} refunded`}
        />
        <Stat
          label="New leads (30 days)"
          value={String(m.leads30)}
          note={`${m.leadsTotal} in total`}
        />
        <Stat
          label="Downloads (30 days)"
          value={String(m.downloads30)}
          note={`${m.downloadsTotal} in total`}
        />
      </div>

      <section aria-labelledby="top-title" className="flex flex-col gap-4">
        <h2 id="top-title" className="text-h2">
          Top products by paid sales
        </h2>
        {m.top.length === 0 ? (
          <p className="text-base text-muted-foreground">No paid sales yet.</p>
        ) : (
          <ol className="list-decimal pl-6 text-base">
            {m.top.map((p) => (
              <li key={p.title}>
                {p.title} — {p.sales} {p.sales === 1 ? "sale" : "sales"}
              </li>
            ))}
          </ol>
        )}
      </section>

      <section aria-labelledby="recent-title" className="flex flex-col gap-4">
        <h2 id="recent-title" className="text-h2">
          Recent orders
        </h2>
        {m.recent.length === 0 ? (
          <p className="text-base text-muted-foreground">No orders yet.</p>
        ) : (
          <ul className="flex flex-col gap-2 text-base">
            {m.recent.map((o) => (
              <li key={o.id} className="flex flex-wrap items-center gap-3">
                <Link href={`/admin/orders/${o.id}`}>{when(o.createdAt)}</Link>
                <span>{o.title}</span>
                <span>{formatInr(o.amount)}</span>
                <Badge variant={o.status === "paid" ? "default" : "outline"}>{o.status}</Badge>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="activity-title" className="flex flex-col gap-4">
        <h2 id="activity-title" className="text-h2">
          Your recent admin actions
        </h2>
        {m.activity.length === 0 ? (
          <p className="text-base text-muted-foreground">Nothing recorded yet.</p>
        ) : (
          <ul className="flex flex-col gap-1 text-base">
            {m.activity.map((a, index) => (
              <li key={index}>
                {when(a.createdAt)} — {a.action.replace(/_/g, " ")}
                {typeof (a.details as { title?: string }).title === "string"
                  ? `: ${(a.details as { title: string }).title}`
                  : ""}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
