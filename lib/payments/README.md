# lib/payments/

Razorpay: **live** keys on Vercel Production, **test** keys locally, previews closed. Server only. Never trust browser-supplied prices.

- `provider.ts` — the `PaymentProvider` interface.
- `razorpay.ts` — Razorpay adapter and `isCheckoutOpen()` (live keys only on Production, test keys only locally, never on previews).
- `orders.ts` — order creation, fulfilment, failure, refund and receipt; one SQL statement per multi-step write.
