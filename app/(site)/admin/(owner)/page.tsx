import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { asc, count, desc, eq } from "drizzle-orm";

import { UploadForm } from "@/components/admin/upload-form";
import { Container } from "@/components/layout/container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getDb } from "@/db";
import { leads, productFiles, products } from "@/db/schema";
import { isAdmin } from "@/lib/auth/session";
import { isStorageConfigured } from "@/lib/storage/files";

export const metadata: Metadata = { title: "Owner admin", robots: { index: false } };

/* Minimal owner-only admin: product files and recent leads. Fuller editing comes in Phase 4. */
export default function AdminPage() {
  return (
    <Container className="flex flex-col gap-10 py-section">
      <Suspense fallback={<p className="text-lead text-muted-foreground">Loading…</p>}>
        <AdminContent />
      </Suspense>
    </Container>
  );
}

async function AdminContent() {
  if (!(await isAdmin())) redirect("/admin/login");
  const db = getDb();
  const [productRows, fileRows, recentLeads, [leadTotal]] = await Promise.all([
    db
      .select({
        id: products.id,
        title: products.title,
        slug: products.slug,
        status: products.status,
        isFree: products.isFree,
      })
      .from(products)
      .orderBy(asc(products.title)),
    db
      .select({
        productId: productFiles.productId,
        label: productFiles.label,
        fileName: productFiles.fileName,
        deliveryType: productFiles.deliveryType,
      })
      .from(productFiles)
      .orderBy(asc(productFiles.sortOrder)),
    db
      .select({
        name: leads.name,
        email: leads.email,
        source: leads.source,
        optIn: leads.marketingOptIn,
        createdAt: leads.createdAt,
        product: products.title,
      })
      .from(leads)
      .leftJoin(products, eq(products.id, leads.productId))
      .orderBy(desc(leads.createdAt))
      .limit(20),
    db.select({ total: count() }).from(leads),
  ]);
  const storageReady = isStorageConfigured();

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-h1">Owner admin</h1>
        <form action="/api/admin/logout" method="post">
          <Button type="submit" variant="outline">
            Sign out
          </Button>
        </form>
      </div>

      <section aria-labelledby="products-title" className="flex flex-col gap-6">
        <h2 id="products-title" className="text-h2">
          Products and files
        </h2>
        {!storageReady ? (
          <p role="status" className="rounded-lg border border-border bg-card p-4 text-base">
            File storage isn’t set up yet, so uploads are switched off.
          </p>
        ) : null}
        {productRows.length === 0 ? (
          <p className="text-base text-muted-foreground">No products yet.</p>
        ) : (
          <ul className="flex flex-col gap-6">
            {productRows.map((product) => {
              const files = fileRows.filter((file) => file.productId === product.id);
              return (
                <li
                  key={product.id}
                  className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5"
                >
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-h3">{product.title}</h3>
                    <Badge variant="outline">{product.status}</Badge>
                    <Badge variant="outline">{product.isFree ? "free" : "paid"}</Badge>
                  </div>
                  <ul className="text-base text-muted-foreground">
                    {files.length === 0 ? <li>No files yet.</li> : null}
                    {files.map((file, index) => (
                      <li key={`${file.label}-${index}`}>
                        {file.label} — {file.fileName ?? file.deliveryType}
                      </li>
                    ))}
                  </ul>
                  {storageReady ? <UploadForm productId={product.id} /> : null}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section aria-labelledby="leads-title" className="flex flex-col gap-4">
        <h2 id="leads-title" className="text-h2">
          Recent leads ({leadTotal?.total ?? 0} in total)
        </h2>
        {recentLeads.length === 0 ? (
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
                {recentLeads.map((lead) => (
                  <tr
                    key={`${lead.email}-${lead.createdAt.toISOString()}`}
                    className="border-b border-border"
                  >
                    <td className="py-2 pr-4">
                      {lead.createdAt.toISOString().slice(0, 16).replace("T", " ")}
                    </td>
                    <td className="py-2 pr-4">{lead.name}</td>
                    <td className="py-2 pr-4">{lead.email}</td>
                    <td className="py-2 pr-4">{lead.product ?? "—"}</td>
                    <td className="py-2">{lead.optIn ? "Yes" : "No"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
