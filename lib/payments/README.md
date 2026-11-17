# lib/payments/

Phase 3, Razorpay **test mode**. Server only. Never trust browser-supplied prices.

- `provider.ts` — the `PaymentProvider` interface.
- `razorpay.ts` — Razorpay adapter and `isCheckoutOpen()` (test keys only, never on Vercel Production).
- `orders.ts` — order creation, fulfilment, failure, refund and receipt; one SQL statement per multi-step write.
