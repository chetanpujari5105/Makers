import Link from "next/link";
import { Suspense } from "react";
import { z } from "zod";

import { ProductPage } from "@/components/product/product-page";
import { requireAdminPage } from "@/lib/admin/guard";
import { getAdminProduct } from "@/lib/admin/products";
import { publishProblems } from "@/lib/catalogue/publish-check";
import { getProductPreview } from "@/lib/catalogue/queries";

/* Owner-only preview of the real product page, for drafts too. Buy buttons don't work here. */
export default function PreviewPage({ params }: PageProps<"/admin/products/[id]/preview">) {
  return (
    <Suspense fallback={<p className="text-lead text-muted-foreground">Loading preview…</p>}>
      <Preview params={params} />
    </Suspense>
  );
}

async function Preview({ params }: Pick<PageProps<"/admin/products/[id]/preview">, "params">) {
  await requireAdminPage();
  const id = z.uuid().safeParse((await params).id);
  const product = id.success ? await getAdminProduct(id.data) : null;
  if (!product) return <h1 className="text-h1">Product not found</h1>;
  const problems = publishProblems({ ...product, deliveryCount: product.files.length });
  const detail = await getProductPreview(product.id).catch(() => null);

  return (
    <div className="flex flex-col gap-6">
      <div
        role="status"
        className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5"
      >
        <p className="text-base">
          <strong>Preview ({product.status}).</strong> This is how the page will look. The buy
          button only works once the product is published.{" "}
          <Link href={`/admin/products/${product.id}`}>Back to editing</Link>
        </p>
        {problems.length ? (
          <ul className="list-disc pl-6 text-base">
            {problems.map((problem) => (
              <li key={problem}>{problem}</li>
            ))}
          </ul>
        ) : null}
      </div>
      {detail ? (
        <ProductPage product={detail} related={[]} />
      ) : (
        <p className="text-lead">
          The page can’t be shown until the sections listed above are complete.
        </p>
      )}
    </div>
  );
}
