import { eq } from "drizzle-orm";
import { z } from "zod";

import { getDb } from "@/db";
import { coupons } from "@/db/schema";

/*
 * Store-wide coupons for paid INR checkout. All maths is in whole paise.
 * A use is counted when the payment is confirmed (fulfilPaidOrder), so an
 * abandoned checkout never burns a use.
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
  if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses)
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
      expiresAt: coupons.expiresAt,
      active: coupons.active,
    })
    .from(coupons)
    .where(eq(coupons.code, code))
    .limit(1);
  return row ?? null;
}
