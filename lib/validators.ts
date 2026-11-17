import { z } from "zod";

import { goals, type GoalSlug } from "@/lib/brand";

/*
 * Zod schemas for external input (CLAUDE.md §4: validate query strings,
 * route params and API bodies with Zod). Later phases add API body schemas
 * here (leads, orders, free claims, magic links…).
 */

const goalSlugs = goals.map((goal) => goal.slug) as [GoalSlug, ...GoalSlug[]];

/** Route param for /category/[slug]: only the four known goal slugs. */
export const goalSlugSchema = z.enum(goalSlugs);

/** Route param for /products/[slug]: lowercase words joined by single hyphens. */
export const productSlugSchema = z
  .string()
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

/** Buyer email: trimmed, lowercased, a real-looking address. */
export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .max(254)
  .pipe(z.email({ message: "Please enter an email address like name@example.com." }));

/**
 * The buyer-details dialog. `website` is a honeypot: a hidden field people
 * never see, so anything typed into it means a bot.
 * Marketing consent is only true when the box was explicitly ticked.
 */
export const buyerFormSchema = z.object({
  productSlug: productSlugSchema,
  name: z.string().trim().min(1, "Please enter your name.").max(100),
  email: emailSchema,
  marketingOptIn: z.literal(true).optional().catch(undefined),
  website: z.string().max(200).optional(),
});

export const magicLinkRequestSchema = z.object({
  email: emailSchema,
  website: z.string().max(200).optional(),
});

/** Only same-site paths like /library/x; never //other.site or https://… */
export const safeNextPath = z
  .string()
  .max(200)
  .regex(/^\/(?![/\\])[\w\-/]*$/)
  .optional()
  .catch(undefined);

/** Paid checkout: the buyer form plus a per-dialog key so double submits reuse one order. No amount — prices come from the database. */
export const orderRequestSchema = buyerFormSchema.extend({
  idempotencyKey: z.uuid(),
  /** Optional; checked and normalised on the server. */
  couponCode: z.string().trim().max(60).optional(),
});

/** What Razorpay Checkout hands the browser after a payment attempt. */
export const paymentVerifySchema = z.object({
  razorpay_order_id: z.string().regex(/^order_[A-Za-z0-9]{6,40}$/),
  razorpay_payment_id: z.string().regex(/^pay_[A-Za-z0-9]{6,40}$/),
  razorpay_signature: z.string().regex(/^[a-f0-9]{64}$/),
});
