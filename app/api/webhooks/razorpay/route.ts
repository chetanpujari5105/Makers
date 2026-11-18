import { createHash } from "node:crypto";

import { and, eq, isNull } from "drizzle-orm";

import { getDb } from "@/db";
import { webhookEvents } from "@/db/schema";
import { fulfilPaidOrder, markOrderFailed, refundOrder, sendReceipt } from "@/lib/payments/orders";
import { paymentsConfigured, razorpay } from "@/lib/payments/razorpay";
import { jsonError } from "@/lib/security/request";

type Entity = Record<string, unknown>;

/*
 * POST /api/webhooks/razorpay — Razorpay's server-to-server notices; the
 * authoritative path. The signature is checked against the exact raw body
 * before anything is parsed. Each event ID is stored once (unique index);
 * a repeat of a fully processed event is acknowledged and ignored. Every
 * handler is idempotent, so re-running an unfinished event is safe.
 * Only IDs, amounts and statuses are stored — not emails, phones or card data.
 */
export async function POST(request: Request) {
  if (!paymentsConfigured()) return jsonError(503, "Payments aren’t configured.");
  const raw = await request.text();
  const provider = razorpay();
  if (!provider.verifyWebhookSignature(raw, request.headers.get("x-razorpay-signature"))) {
    return jsonError(400, "Invalid signature.");
  }

  let body: { event?: string; payload?: Record<string, { entity?: Entity }> };
  try {
    body = JSON.parse(raw);
  } catch {
    return jsonError(400, "Invalid body.");
  }
  const type = String(body.event ?? "unknown");
  const payment = body.payload?.payment?.entity;
  const refund = body.payload?.refund?.entity;
  const eventId =
    request.headers.get("x-razorpay-event-id") ?? createHash("sha256").update(raw).digest("hex");

  const db = getDb();
  const summary = {
    paymentId: payment?.id ?? refund?.payment_id ?? null,
    orderId: payment?.order_id ?? null,
    amount: payment?.amount ?? refund?.amount ?? null,
    currency: payment?.currency ?? refund?.currency ?? null,
    status: payment?.status ?? refund?.status ?? null,
  };
  await db
    .insert(webhookEvents)
    .values({ provider: "razorpay", eventId, type, payload: summary })
    .onConflictDoNothing();
  const [event] = await db
    .select({ processedAt: webhookEvents.processedAt })
    .from(webhookEvents)
    .where(and(eq(webhookEvents.provider, "razorpay"), eq(webhookEvents.eventId, eventId)));
  if (event?.processedAt) return Response.json({ ok: true, duplicate: true });

  if ((type === "payment.captured" || type === "order.paid") && payment?.status === "captured") {
    const paid = await fulfilPaidOrder({
      providerOrderId: String(payment.order_id),
      paymentId: String(payment.id),
      amount: Number(payment.amount),
      currency: String(payment.currency),
    });
    if (paid) await sendReceipt(paid.id);
  } else if (type === "payment.failed" && payment?.order_id) {
    await markOrderFailed(String(payment.order_id));
  } else if (type === "refund.processed" && refund?.payment_id) {
    // Ask Razorpay for the payment's refund total: only a full refund removes access.
    const refunded = await provider.fetchPayment(String(refund.payment_id));
    if (refunded.amountRefunded >= refunded.amount) await refundOrder(refunded.id);
  }

  await db
    .update(webhookEvents)
    .set({ processedAt: new Date() })
    .where(
      and(
        eq(webhookEvents.provider, "razorpay"),
        eq(webhookEvents.eventId, eventId),
        isNull(webhookEvents.processedAt),
      ),
    );
  return Response.json({ ok: true });
}
