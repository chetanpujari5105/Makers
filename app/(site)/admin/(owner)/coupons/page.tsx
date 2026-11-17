import { Suspense } from "react";

import { createCouponAction, setCouponActiveAction } from "@/app/(site)/admin/actions";
import { ActionForm } from "@/components/admin/action-form";
import { SelectField, TextField } from "@/components/admin/fields";
import { Badge } from "@/components/ui/badge";
import { listCoupons } from "@/lib/admin/coupons";
import { when } from "@/lib/admin/format";
import { requireAdminPage } from "@/lib/admin/guard";
import { formatInr } from "@/lib/money";

export default function CouponsPage() {
  return (
    <Suspense fallback={<p className="text-lead text-muted-foreground">Loading coupons…</p>}>
      <Coupons />
    </Suspense>
  );
}

async function Coupons() {
  await requireAdminPage();
  const rows = await listCoupons();
  return (
    <div className="flex flex-col gap-10">
      <h1 className="text-h1">Coupons</h1>
      <p className="text-base text-muted-foreground">
        Coupons work on every paid product. A use is counted only when a payment is confirmed. A
        coupon can never bring a price below ₹1, and free products don’t need one.
      </p>

      <section aria-labelledby="list-title" className="flex flex-col gap-4">
        <h2 id="list-title" className="text-h2">
          Your coupons
        </h2>
        {rows.length === 0 ? (
          <p className="text-base text-muted-foreground">No coupons yet.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {rows.map((c) => (
              <li
                key={c.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-card p-4"
              >
                <div className="flex flex-col gap-1">
                  <span className="flex items-center gap-3 text-base font-medium">
                    {c.code}
                    <Badge variant={c.active ? "default" : "outline"}>
                      {c.active ? "on" : "off"}
                    </Badge>
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {c.discountType === "percent"
                      ? `${c.percentOff}% off`
                      : `${formatInr(c.amountOff ?? 0)} off`}{" "}
                    · used {c.usedCount}
                    {c.maxUses ? ` of ${c.maxUses}` : ""} ·{" "}
                    {c.expiresAt ? `ends ${when(c.expiresAt)} India time` : "no end date"}
                  </span>
                </div>
                <ActionForm
                  action={setCouponActiveAction}
                  submitLabel={c.active ? "Turn off" : "Turn on"}
                  variant="outline"
                >
                  <input type="hidden" name="id" value={c.id} />
                  <input type="hidden" name="active" value={String(!c.active)} />
                </ActionForm>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="new-title" className="flex flex-col gap-4">
        <h2 id="new-title" className="text-h2">
          New coupon
        </h2>
        <ActionForm
          action={createCouponAction}
          submitLabel="Create coupon"
          className="rounded-xl border border-border bg-card p-5"
        >
          <TextField
            name="code"
            label="Code"
            hint="3–40 letters, numbers, - or _ (saved in capitals)"
            required
            maxLength={40}
          />
          <SelectField
            name="discountType"
            label="Discount type"
            defaultValue="percent"
            options={[
              { value: "percent", label: "Percentage off" },
              { value: "fixed", label: "Rupees off" },
            ]}
          />
          <TextField
            name="value"
            label="Discount"
            hint="A percentage (1–90) or whole rupees"
            type="number"
            min={1}
            required
          />
          <TextField name="maxUses" label="Maximum uses (optional)" type="number" min={1} />
          <TextField name="expires" label="Last day it works (optional)" type="date" />
        </ActionForm>
      </section>
    </div>
  );
}
