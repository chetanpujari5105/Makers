import { eq, sql } from "drizzle-orm";
import { z } from "zod";

import { getDb } from "@/db";
import { coupons, orders } from "@/db/schema";

/*
 * Store-wide coupons for paid INR checkout. All maths is in whole paise.
 * A use is counted when the payment is confirmed (fulfilPaidOrder). An
 * unpaid checkout holds its use for an hour, so one single-use code can't be
 * opened on many products at once; after that, an abandoned checkout frees it.
 */

/** Codes are stored upper-case and trimmed (the database refuses anything else). */
export const couponCodeSchema = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^[A-Z0-9_-]{3,40}$/, "Coupon codes use 3–40 letters, numbers, - or _.");

export type Coupon = {
  id: string;
  discountType: "percent" | "fixed";
  percentOff: number | null;
  amountOff: number | null;
  currency: string | null;
  maxUses: number | null;
  usedCount: number;
  /** Checkouts with this coupon opened in the last hour and not yet paid: held uses. */
  heldCount?: number;
  expiresAt: Date | null;
  active: boolean;
};

/** Razorpay's smallest INR charge is ₹1 (100 paise). */
export const MIN_CHARGE_PAISE = 100;

export function priceAfterCoupon(
  price: number,
  coupon: Coupon,
  now = new Date(),
): { ok: true; amount: number } | { ok: false; message: string } {
  if (!coupon.active) return { ok: false, message: "This coupon isn’t active." };
  if (coupon.expiresAt && coupon.expiresAt <= now)
    return { ok: false, message: "This coupon has expired." };
  if (coupon.maxUses !== null && coupon.usedCount + (coupon.heldCount ?? 0) >= coupon.maxUses)
    return { ok: false, message: "This coupon has been used up." };
  let amount: number;
  if (coupon.discountType === "percent") {
    // Round the discount down, so the buyer never pays less than the stated percentage allows.
    amount = price - Math.floor((price * (coupon.percentOff ?? 0)) / 100);
  } else {
    if (coupon.currency !== "INR")
      return { ok: false, message: "This coupon can’t be used with rupee prices." };
    amount = price - (coupon.amountOff ?? 0);
  }
  if (amount < MIN_CHARGE_PAISE)
    return {
      ok: false,
      message: "This coupon would make the price less than ₹1, so it can’t be used here.",
    };
  return { ok: true, amount };
}

export async function findCoupon(code: string): Promise<Coupon | null> {
  const [row] = await getDb()
    .select({
      id: coupons.id,
      discountType: coupons.discountType,
      percentOff: coupons.percentOff,
      amountOff: coupons.amountOff,
      currency: coupons.currency,
      maxUses: coupons.maxUses,
      usedCount: coupons.usedCount,
      heldCount: sql<number>`(select count(*)::int from ${orders} o
        where o.coupon_id = ${coupons}.id and o.status in ('created', 'failed')
          and o.created_at > now() - interval '1 hour')`,
      expiresAt: coupons.expiresAt,
      active: coupons.active,
    })
    .from(coupons)
    .where(eq(coupons.code, code))
    .limit(1);
  return row ?? null;
}
