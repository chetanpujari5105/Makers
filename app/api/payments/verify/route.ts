import { findOrderByProviderId, fulfilPaidOrder, sendReceipt } from "@/lib/payments/orders";
import { paymentsConfigured, razorpay } from "@/lib/payments/razorpay";
import { guardPublicPost, jsonError } from "@/lib/security/request";
import { paymentVerifySchema } from "@/lib/validators";

/*
 * POST /api/payments/verify — the browser's fast path after Checkout succeeds.
 * Checks the Razorpay signature, then asks Razorpay itself whether the payment
 * is captured and matches the order's amount and currency. Only then is access
 * granted. The browser is NOT signed in: access arrives by email, like free
 * claims (anyone can type any email into the form). The webhook does the same
 * work independently, so either may arrive first.
 */
export async function POST(request: Request) {
  if (!paymentsConfigured()) return jsonError(503, "Paid checkout isn’t open yet.");
  const guard = await guardPublicPost(request, "order");
  if ("error" in guard) return guard.error;

  const parsed = paymentVerifySchema.safeParse(guard.body);
  if (!parsed.success) return jsonError(400, "We couldn’t confirm this payment.");
  const {
    razorpay_order_id: providerOrderId,
    razorpay_payment_id: paymentId,
    razorpay_signature: signature,
  } = parsed.data;

  const order = await findOrderByProviderId(providerOrderId);
  const provider = razorpay();
  if (!order || !provider.verifyCheckoutSignature({ providerOrderId, paymentId, signature })) {
    return jsonError(400, "We couldn’t confirm this payment.");
  }
  if (order.status === "paid")
    return Response.json({ ok: true, status: "paid", orderId: order.id });

  let payment;
  try {
    payment = await provider.fetchPayment(paymentId);
  } catch (error) {
    console.error("razorpay payment lookup failed", error);
    return Response.json({ ok: true, status: "pending", orderId: order.id });
  }
  if (
    payment.orderId !== providerOrderId ||
    payment.amount !== order.amount ||
    payment.currency !== order.currency
  ) {
    return jsonError(400, "We couldn’t confirm this payment.");
  }
  if (payment.status === "authorized") {
    return Response.json({ ok: true, status: "pending", orderId: order.id });
  }
  if (payment.status !== "captured") return jsonError(400, "This payment didn’t go through.");

  const paid = await fulfilPaidOrder({
    providerOrderId,
    paymentId,
    amount: payment.amount,
    currency: payment.currency,
  });
  if (paid) await sendReceipt(paid.id);
  return Response.json({ ok: true, status: "paid", orderId: order.id });
}
