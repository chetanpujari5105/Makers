import Link from "next/link";
import { Suspense } from "react";
import { z } from "zod";

import {
  addLinkAction,
  deleteSampleProductAction,
  removeFileAction,
  setProductStatusAction,
} from "@/app/(site)/admin/actions";
import { ActionForm } from "@/components/admin/action-form";
import { TextField } from "@/components/admin/fields";
import { ProductEditor } from "@/components/admin/product-editor";
import { UploadForm } from "@/components/admin/upload-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { requireAdminPage } from "@/lib/admin/guard";
import { productFormDefaults } from "@/lib/admin/product-form";
import { getAdminProduct } from "@/lib/admin/products";
import { publishProblems } from "@/lib/catalogue/publish-check";
import { isStorageConfigured } from "@/lib/storage/files";

export default function EditProductPage({ params }: PageProps<"/admin/products/[id]">) {
  return (
    <Suspense fallback={<p className="text-lead text-muted-foreground">Loading product…</p>}>
      <EditProduct params={params} />
    </Suspense>
  );
}

async function EditProduct({ params }: Pick<PageProps<"/admin/products/[id]">, "params">) {
  await requireAdminPage();
  const id = z.uuid().safeParse((await params).id);
  const product = id.success ? await getAdminProduct(id.data) : null;
  if (!product) return <h1 className="text-h1">Product not found</h1>;
  const problems = publishProblems({ ...product, deliveryCount: product.files.length });

  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-4">
        <Link href="/admin/products" className="text-base">
          ← Products
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-h1">{product.title}</h1>
          <Badge variant={product.status === "published" ? "default" : "outline"}>
            {product.status}
          </Badge>
          {product.isSample ? <Badge variant="outline">sample</Badge> : null}
        </div>
        <p className="text-base text-muted-foreground">
          {product.buyerCount} {product.buyerCount === 1 ? "person has" : "people have"} access.
        </p>
        <div className="flex flex-wrap items-start gap-4">
          <Button asChild variant="outline">
            <Link href={`/admin/products/${product.id}/preview`}>Preview page</Link>
          </Button>
          {product.status === "published" ? (
            <Button asChild variant="outline">
              <Link href={`/products/${product.slug}`}>View live page</Link>
            </Button>
          ) : null}
        </div>
        <ActionForm
          action={setProductStatusAction}
          choices={[
            ...(product.status !== "published"
              ? [{ name: "status", value: "published", label: "Publish" }]
              : []),
            ...(product.status === "published"
              ? [
                  {
                    name: "status",
                    value: "archived",
                    label: "Archive (stop selling)",
                    variant: "outline" as const,
                  },
                ]
              : []),
            ...(product.status !== "draft"
              ? [
                  {
                    name: "status",
                    value: "draft",
                    label: "Back to draft",
                    variant: "outline" as const,
                  },
                ]
              : []),
          ]}
        >
          <input type="hidden" name="id" value={product.id} />
        </ActionForm>
        {product.status !== "published" && problems.length > 0 ? (
          <div role="status" className="rounded-xl border border-border bg-card p-5">
            <h2 className="text-h3">Before you can publish</h2>
            <ul className="mt-3 list-disc pl-6 text-base">
              {problems.map((problem) => (
                <li key={problem}>{problem}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </header>

      <section aria-labelledby="files-title" className="flex flex-col gap-5">
        <h2 id="files-title" className="text-h2">
          Files and links buyers receive
        </h2>
        {product.files.length === 0 ? (
          <p className="text-base text-muted-foreground">
            Nothing yet. Upload a file or add a link.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {product.files.map((file) => (
              <li
                key={file.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-card p-4"
              >
                <span className="text-base">
                  <strong>{file.label}</strong> —{" "}
                  {file.deliveryType === "external_link" ? file.externalUrl : file.fileName}
                </span>
                <ActionForm
                  action={removeFileAction}
                  submitLabel="Remove"
                  variant="outline"
                  confirm="Yes, remove it"
                >
                  <input type="hidden" name="fileId" value={file.id} />
                </ActionForm>
              </li>
            ))}
          </ul>
        )}
        {isStorageConfigured() ? (
          <UploadForm productId={product.id} />
        ) : (
          <p className="text-base text-muted-foreground">
            File storage isn’t set up here, so uploads are off. Links still work.
          </p>
        )}
        <ActionForm
          action={addLinkAction}
          submitLabel="Add link"
          variant="outline"
          className="rounded-xl border border-border bg-card p-5"
        >
          <input type="hidden" name="productId" value={product.id} />
          <TextField name="label" label="Link name buyers see" maxLength={120} required />
          <TextField name="url" label="Link (https://…)" type="url" required />
        </ActionForm>
      </section>

      <section aria-labelledby="edit-title" className="flex flex-col gap-5">
        <h2 id="edit-title" className="text-h2">
          Edit details
        </h2>
        <ProductEditor
          productId={product.id}
          values={productFormDefaults(product)}
          isFree={product.isFree}
          featured={product.featured}
          slugLocked={product.status !== "draft" || product.buyerCount > 0}
        />
      </section>

      {product.isSample ? (
        <section aria-labelledby="delete-title" className="flex flex-col gap-3">
          <h2 id="delete-title" className="text-h2">
            Delete this sample
          </h2>
          <p className="text-base text-muted-foreground">
            Removes the sample, its page and its stored files for good. Only works while nobody has
            access to it.
          </p>
          <ActionForm
            action={deleteSampleProductAction}
            submitLabel="Delete sample"
            variant="outline"
            confirm="Yes, delete it"
          >
            <input type="hidden" name="id" value={product.id} />
          </ActionForm>
        </section>
      ) : null}
    </div>
  );
}
