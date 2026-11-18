import { createHmac } from "node:crypto";

import { safeEqual } from "@/lib/security/crypto";

import type { PaymentProvider, ProviderPayment } from "./provider";

/*
 * Razorpay adapter (server only). Uses Razorpay's REST API directly; only
 * two calls are needed (create order, fetch payment), so no SDK.
 */
const API = "https://api.razorpay.com/v1";

/**
 * Razorpay keys are present and right for this site: LIVE keys only on Vercel
 * Production, TEST keys only locally, nothing on Vercel previews (they share
 * the production database, so a test-card purchase there would grant real
 * access). Payment confirmations (browser check + webhook) need only this, so
 * a payment already in progress still grants access after checkout is closed.
 */
export function paymentsConfigured() {
  const e = process.env;
  if (!e.RAZORPAY_KEY_ID || !e.RAZORPAY_KEY_SECRET || !e.RAZORPAY_WEBHOOK_SECRET) return false;
  if (e.VERCEL_ENV === "preview") return false;
  return e.RAZORPAY_KEY_ID.startsWith(e.VERCEL_ENV === "production" ? "rzp_live_" : "rzp_test_");
}

/**
 * New paid checkouts. On Production this also needs the on/off switch
 * CHECKOUT_ENABLED=true (default OFF), so deploying code never opens
 * payments by accident. Locally, test keys alone open test checkout.
 */
export function isCheckoutOpen() {
  if (!paymentsConfigured()) return false;
  return process.env.VERCEL_ENV !== "production" || process.env.CHECKOUT_ENABLED === "true";
}

/** True when checkout is open with test keys (no real money): buyers are told so. */
export const isTestCheckout = () =>
  isCheckoutOpen() && process.env.RAZORPAY_KEY_ID!.startsWith("rzp_test_");

const hex = (secret: string, value: string) =>
  createHmac("sha256", secret).update(value).digest("hex");

export function razorpay(): PaymentProvider {
  if (!paymentsConfigured()) throw new Error("Razorpay is not configured for this environment.");
  const keyId = process.env.RAZORPAY_KEY_ID!;
  const keySecret = process.env.RAZORPAY_KEY_SECRET!;
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET!;
  const auth = `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`;

  async function call(path: string, init?: RequestInit) {
    const response = await fetch(`${API}${path}`, {
      ...init,
      headers: { Authorization: auth, "Content-Type": "application/json" },
      cache: "no-store",
    });
    // The error body can echo request details; log only the status.
    if (!response.ok)
      throw new Error(`Razorpay ${init?.method ?? "GET"} failed: ${response.status}`);
    return response.json() as Promise<Record<string, unknown>>;
  }

  return {
    name: "razorpay",
    publicKeyId: keyId,

    async createOrder({ amount, currency, receipt }) {
      const order = await call("/orders", {
        method: "POST",
        body: JSON.stringify({
          amount,
          currency,
          receipt,
          // Capture automatically (per order, overriding account settings), so a
          // successful payment becomes "captured" without a manual step.
          payment: {
            capture: "automatic",
            capture_options: { automatic_expiry_period: 12, refund_speed: "normal" },
          },
        }),
      });
      return { providerOrderId: String(order.id) };
    },

    async fetchPayment(paymentId) {
      const p = await call(`/payments/${encodeURIComponent(paymentId)}`);
      return {
        id: String(p.id),
        orderId: String(p.order_id),
        amount: Number(p.amount),
        currency: String(p.currency),
        status: p.status as ProviderPayment["status"],
        amountRefunded: Number(p.amount_refunded ?? 0),
      };
    },

    verifyCheckoutSignature({ providerOrderId, paymentId, signature }) {
      return safeEqual(hex(keySecret, `${providerOrderId}|${paymentId}`), signature);
    },

    verifyWebhookSignature(rawBody, signature) {
      return Boolean(signature) && safeEqual(hex(webhookSecret, rawBody), signature!);
    },
  };
}
