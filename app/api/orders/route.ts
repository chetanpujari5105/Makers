import { saveLead } from "@/lib/library/access";
import {
  createLocalOrder,
  findPurchasableProduct,
  ownsProduct,
  setProviderOrderId,
} from "@/lib/payments/orders";
import { isCheckoutOpen, razorpay } from "@/lib/payments/razorpay";
import { hashIp } from "@/lib/security/crypto";
import { guardPublicPost, jsonError } from "@/lib/security/request";
import { orderRequestSchema } from "@/lib/validators";

/*
 * POST /api/orders — starts a paid checkout.
 * 1. Save the lead first, so a cancelled checkout keeps it.
 * 2. Price and currency come from the database; any amount the browser sends is ignored.
 * 3. Create (or reuse, for a double submit) the local order, then the Razorpay order.
 * Returns only what Checkout needs: the public key ID and Razorpay order ID.
 */
export async function POST(request: Request) {
  if (!isCheckoutOpen()) return jsonError(503, "Paid checkout isn’t open yet.");
  const guard = await guardPublicPost(request, "order");
  if ("error" in guard) return guard.error;

  const parsed = orderRequestSchema.safeParse(guard.body);
  if (!parsed.success)
    return jsonError(400, parsed.error.issues[0]?.message ?? "Please check the form.");
  const input = parsed.data;
  if (input.website) return jsonError(400, "Something was wrong with that request.");

  const product = await findPurchasableProduct(input.productSlug);
  if (!product) return jsonError(404, "This resource isn’t available to buy.");

  await saveLead({
    name: input.name,
    email: input.email,
    productId: product.id,
    source: "product_page",
    marketingOptIn: input.marketingOptIn === true,
    ipHash: hashIp(guard.ip),
  });
  if (await ownsProduct(input.email, product.id)) {
    return jsonError(
      409,
      "This email already has this resource. Open My Library to download it — no need to pay again.",
    );
  }

  const order = await createLocalOrder({
    name: input.name,
    email: input.email,
    productId: product.id,
    amount: product.priceInr,
    idempotencyKey: input.idempotencyKey,
  });
  if (!order) return jsonError(409, "Please close this window and try again.");
  if (order.status === "paid" || order.status === "refunded") {
    return jsonError(409, "This order is already complete. Check your email for the receipt.");
  }

  const provider = razorpay();
  let providerOrderId = order.razorpayOrderId;
  if (!providerOrderId) {
    try {
      ({ providerOrderId } = await provider.createOrder({
        amount: product.priceInr,
        currency: "INR",
        receipt: order.id,
      }));
    } catch (error) {
      console.error("razorpay order failed", error);
      return jsonError(502, "We couldn’t start the payment. Please try again in a minute.");
    }
    await setProviderOrderId(order.id, providerOrderId);
  }

  return Response.json({
    ok: true,
    orderId: order.id,
    keyId: provider.publicKeyId,
    razorpayOrderId: providerOrderId,
    amount: product.priceInr,
    currency: "INR",
  });
}
