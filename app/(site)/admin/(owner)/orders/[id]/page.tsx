import Link from "next/link";
import { Suspense } from "react";
import { z } from "zod";

import { resendReceiptAction } from "@/app/(site)/admin/actions";
import { ActionForm } from "@/components/admin/action-form";
import { when } from "@/lib/admin/format";
import { requireAdminPage } from "@/lib/admin/guard";
import { getOrder } from "@/lib/admin/records";
import { formatInr } from "@/lib/money";

export default function OrderPage({ params }: PageProps<"/admin/orders/[id]">) {
  return (
    <Suspense fallback={<p className="text-lead text-muted-foreground">Loading order…</p>}>
      <Order params={params} />
    </Suspense>
  );
}

async function Order({ params }: Pick<PageProps<"/admin/orders/[id]">, "params">) {
  await requireAdminPage();
  const id = z.uuid().safeParse((await params).id);
  const order = id.success ? await getOrder(id.data) : null;
  if (!order) return <h1 className="text-h1">Order not found</h1>;
  const rows: [string, string][] = [
    ["Status", order.status],
    ["Product", order.title],
    ["Amount paid", formatInr(order.amount)],
    ["List price", formatInr(order.unitAmount)],
    ["Coupon", order.coupon ?? "—"],
    ["Buyer", `${order.name} <${order.email}>`],
    ["Started", when(order.createdAt)],
    ["Paid", when(order.paidAt)],
    ["Razorpay order", order.razorpayOrderId ?? "—"],
    ["Razorpay payment", order.razorpayPaymentId ?? "—"],
    [
      "Access",
      order.access
        ? order.access.revokedAt
          ? `Removed ${when(order.access.revokedAt)}`
          : `Active · ${order.access.downloadCount} of ${order.access.downloadLimit} downloads used`
        : "None",
    ],
  ];
  return (
    <div className="flex flex-col gap-8">
      <Link href="/admin/orders" className="text-base">
        ← Orders
      </Link>
      <h1 className="text-h1">Order {order.id.slice(0, 8)}</h1>
      <dl className="grid gap-x-6 gap-y-3 text-base sm:grid-cols-[12rem_1fr]">
        {rows.map(([label, value]) => (
          <div key={label} className="contents">
            <dt className="font-medium">{label}</dt>
            <dd className="break-all">{value}</dd>
          </div>
        ))}
      </dl>
      {order.status === "paid" ? (
        <ActionForm
          action={resendReceiptAction}
          submitLabel="Resend receipt and library link"
          variant="outline"
        >
          <input type="hidden" name="orderId" value={order.id} />
          <p className="text-base text-muted-foreground">
            Sends the receipt email again with a fresh one-time library link. Nothing is charged.
          </p>
        </ActionForm>
      ) : null}
    </div>
  );
}
