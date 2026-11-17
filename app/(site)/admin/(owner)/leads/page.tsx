import Link from "next/link";
import { Suspense } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { when } from "@/lib/admin/format";
import { requireAdminPage } from "@/lib/admin/guard";
import { listLeads } from "@/lib/admin/records";

export default function LeadsPage({ searchParams }: PageProps<"/admin/leads">) {
  return (
    <Suspense fallback={<p className="text-lead text-muted-foreground">Loading leads…</p>}>
      <Leads searchParams={searchParams} />
    </Suspense>
  );
}

async function Leads({ searchParams }: Pick<PageProps<"/admin/leads">, "searchParams">) {
  await requireAdminPage();
  const optedInOnly = (await searchParams).optin === "1";
  const rows = await listLeads({ optedInOnly, limit: 300 });
  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-h1">Leads</h1>
        <Button asChild variant="outline">
          <a href="/api/admin/leads/export">Download all as CSV</a>
        </Button>
      </div>
      <p className="text-base text-muted-foreground">
        Everyone who filled in a buyer form. Only people marked <strong>Subscribed</strong> agreed
        to marketing emails — the others gave their email for a download or receipt only.
      </p>
      <p className="text-base">
        {optedInOnly ? (
          <Link href="/admin/leads">Show everyone</Link>
        ) : (
          <Link href="/admin/leads?optin=1">Show subscribed only</Link>
        )}
      </p>
      {rows.length === 0 ? (
        <p className="text-base text-muted-foreground">No leads yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-base">
            <thead>
              <tr className="border-b border-border">
                <th className="py-2 pr-4">When</th>
                <th className="py-2 pr-4">Name</th>
                <th className="py-2 pr-4">Email</th>
                <th className="py-2 pr-4">Product</th>
                <th className="py-2">Marketing</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((lead, index) => (
                <tr key={index} className="border-b border-border">
                  <td className="py-2 pr-4">{when(lead.createdAt)}</td>
                  <td className="py-2 pr-4">{lead.name}</td>
                  <td className="py-2 pr-4">{lead.email}</td>
                  <td className="py-2 pr-4">{lead.product ?? "—"}</td>
                  <td className="py-2">
                    {lead.optIn ? (
                      <Badge>Subscribed</Badge>
                    ) : (
                      <Badge variant="outline">Not subscribed</Badge>
                    )}
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
