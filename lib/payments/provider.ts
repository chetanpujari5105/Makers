/*
 * The store talks to its payment company only through this interface, so a
 * second provider could be added later without touching the order logic.
 * Only Razorpay exists (lib/payments/razorpay.ts).
 */
export type ProviderPayment = {
  id: string;
  orderId: string;
  /** Minor units (paise). */
  amount: number;
  currency: string;
  /** Only "captured" means the money is confirmed. "authorized" is still pending. */
  status: "created" | "authorized" | "captured" | "refunded" | "failed";
  amountRefunded: number;
};

export interface PaymentProvider {
  name: "razorpay";
  /** Safe to send to the browser (Checkout needs it). */
  publicKeyId: string;
  createOrder(input: {
    amount: number;
    currency: "INR";
    receipt: string;
  }): Promise<{ providerOrderId: string }>;
  fetchPayment(paymentId: string): Promise<ProviderPayment>;
  verifyCheckoutSignature(input: {
    providerOrderId: string;
    paymentId: string;
    signature: string;
  }): boolean;
  verifyWebhookSignature(rawBody: string, signature: string | null): boolean;
}
