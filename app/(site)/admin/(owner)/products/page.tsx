import Link from "next/link";
import { Suspense } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { requireAdminPage } from "@/lib/admin/guard";
import { listAdminProducts } from "@/lib/admin/products";
import { productTypeLabel } from "@/lib/catalogue/labels";
import { formatInr } from "@/lib/money";

export default function ProductsPage() {
  return (
    <Suspense fallback={<p className="text-lead text-muted-foreground">Loading products…</p>}>
      <Products />
    </Suspense>
  );
}

async function Products() {
  await requireAdminPage();
  const rows = await listAdminProducts();
  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-h1">Products</h1>
        <Button asChild>
          <Link href="/admin/products/new">New product</Link>
        </Button>
      </div>
      {rows.length === 0 ? (
        <p className="text-base text-muted-foreground">
          No products yet. Create your first one — it starts as a hidden draft.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {rows.map((p) => (
            <li
              key={p.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-4"
            >
              <div className="flex flex-col gap-1">
                <Link href={`/admin/products/${p.id}`} className="text-base font-medium">
                  {p.title}
                </Link>
                <span className="text-sm text-muted-foreground">
                  {productTypeLabel[p.productType]} ·{" "}
                  {p.isFree ? "Free" : p.priceInr ? formatInr(p.priceInr) : "No price yet"} ·{" "}
                  {p.salesCount} paid {p.salesCount === 1 ? "sale" : "sales"}
                </span>
              </div>
              <div className="flex gap-2">
                {p.isSample ? <Badge variant="outline">sample</Badge> : null}
                <Badge variant={p.status === "published" ? "default" : "outline"}>{p.status}</Badge>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
