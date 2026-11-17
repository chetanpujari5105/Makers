import { Suspense } from "react";

import { publishUpdateAction } from "@/app/(site)/admin/actions";
import { ActionForm } from "@/components/admin/action-form";
import { CheckField, SelectField, TextArea, TextField } from "@/components/admin/fields";
import { when } from "@/lib/admin/format";
import { requireAdminPage } from "@/lib/admin/guard";
import { listAdminProducts } from "@/lib/admin/products";
import { listUpdates, MAX_UPDATE_EMAILS } from "@/lib/admin/updates";

export default function UpdatesPage() {
  return (
    <Suspense fallback={<p className="text-lead text-muted-foreground">Loading updates…</p>}>
      <Updates />
    </Suspense>
  );
}

async function Updates() {
  await requireAdminPage();
  const [productRows, updates] = await Promise.all([listAdminProducts(), listUpdates()]);
  return (
    <div className="flex flex-col gap-10">
      <h1 className="text-h1">Product updates</h1>
      <p className="text-base text-muted-foreground">
        Upload the new files on the product page first, then post a note here. The note shows on
        each buyer’s Start Here page and sets the product’s version.
      </p>
      {productRows.length === 0 ? (
        <p className="text-base text-muted-foreground">No products yet.</p>
      ) : (
        <ActionForm
          action={publishUpdateAction}
          submitLabel="Post update"
          className="rounded-xl border border-border bg-card p-5"
          confirm="I’ve checked the note. Post it now (emails, if ticked, go out straight away)."
        >
          <SelectField
            name="productId"
            label="Product"
            options={productRows.map((p) => ({ value: p.id, label: `${p.title} (${p.status})` }))}
          />
          <TextField name="version" label="New version" hint="e.g. 1.1" required maxLength={40} />
          <TextArea name="notes" label="What changed" required rows={4} />
          <CheckField
            name="notify"
            label={`Email everyone who has it (up to ${MAX_UPDATE_EMAILS} people)`}
          />
        </ActionForm>
      )}

      <section aria-labelledby="past-title" className="flex flex-col gap-4">
        <h2 id="past-title" className="text-h2">
          Past updates
        </h2>
        {updates.length === 0 ? (
          <p className="text-base text-muted-foreground">No updates yet.</p>
        ) : (
          <ul className="flex flex-col gap-3 text-base">
            {updates.map((u) => (
              <li key={u.id}>
                <strong>
                  {u.product} {u.version}
                </strong>{" "}
                · {when(u.createdAt)} — {u.notes}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
