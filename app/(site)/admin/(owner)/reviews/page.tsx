import { Suspense } from "react";

import { moderateReviewAction } from "@/app/(site)/admin/actions";
import { ActionForm } from "@/components/admin/action-form";
import { Badge } from "@/components/ui/badge";
import { when } from "@/lib/admin/format";
import { requireAdminPage } from "@/lib/admin/guard";
import { listReviewsForOwner } from "@/lib/admin/reviews";

export default function ReviewsPage() {
  return (
    <Suspense fallback={<p className="text-lead text-muted-foreground">Loading reviews…</p>}>
      <Reviews />
    </Suspense>
  );
}

async function Reviews() {
  await requireAdminPage();
  const rows = await listReviewsForOwner();
  return (
    <section className="flex flex-col gap-6">
      <h1 className="text-h1">Reviews</h1>
      <p className="text-base text-muted-foreground">
        Reviews appear on product pages only after you approve them. “Verified purchase” is set by
        the store from a real paid order and can’t be changed here.
      </p>
      {rows.length === 0 ? (
        <p className="text-base text-muted-foreground">No reviews yet.</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {rows.map((r) => (
            <li
              key={r.id}
              className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5"
            >
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant={r.status === "approved" ? "default" : "outline"}>{r.status}</Badge>
                <span className="text-base font-medium">
                  {r.rating}/5 · {r.title}
                </span>
              </div>
              <p className="text-base whitespace-pre-line">{r.body}</p>
              <p className="text-sm text-muted-foreground">
                {r.product} · {r.email} · {when(r.createdAt)} ·{" "}
                {r.verifiedPurchase ? "verified purchase" : "free claim (not a purchase)"}
                {r.useCase ? ` · used for: ${r.useCase}` : ""}
              </p>
              <ActionForm
                action={moderateReviewAction}
                variant="outline"
                choices={[
                  ...(r.status !== "approved"
                    ? [{ name: "status", value: "approved", label: "Approve" }]
                    : []),
                  ...(r.status !== "rejected"
                    ? [{ name: "status", value: "rejected", label: "Reject" }]
                    : []),
                ]}
              >
                <input type="hidden" name="id" value={r.id} />
              </ActionForm>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
