import { describe, expect, it } from "vitest";

import { couponCodeSchema, priceAfterCoupon, type Coupon } from "./coupons";

const base: Coupon = {
  id: "c",
  discountType: "percent",
  percentOff: 10,
  amountOff: null,
  currency: null,
  maxUses: null,
  usedCount: 0,
  expiresAt: null,
  active: true,
};

describe("priceAfterCoupon", () => {
  it("takes a percentage off in whole paise, rounding the discount down", () => {
    expect(priceAfterCoupon(9999, { ...base, percentOff: 15 })).toEqual({ ok: true, amount: 8500 });
  });
  it("takes a fixed rupee amount off", () => {
    const fixed = {
      ...base,
      discountType: "fixed" as const,
      percentOff: null,
      amountOff: 5000,
      currency: "INR",
    };
    expect(priceAfterCoupon(9900, fixed)).toEqual({ ok: true, amount: 4900 });
  });
  it("refuses a USD fixed coupon on a rupee price", () => {
    const usd = {
      ...base,
      discountType: "fixed" as const,
      percentOff: null,
      amountOff: 100,
      currency: "USD",
    };
    expect(priceAfterCoupon(9900, usd).ok).toBe(false);
  });
  it("never goes below ₹1", () => {
    expect(priceAfterCoupon(9900, { ...base, percentOff: 100 }).ok).toBe(false);
    const big = {
      ...base,
      discountType: "fixed" as const,
      percentOff: null,
      amountOff: 9850,
      currency: "INR",
    };
    expect(priceAfterCoupon(9900, big).ok).toBe(false);
  });
  it("refuses inactive, expired and used-up coupons", () => {
    expect(priceAfterCoupon(9900, { ...base, active: false }).ok).toBe(false);
    expect(priceAfterCoupon(9900, { ...base, expiresAt: new Date(Date.now() - 1000) }).ok).toBe(
      false,
    );
    expect(priceAfterCoupon(9900, { ...base, maxUses: 2, usedCount: 2 }).ok).toBe(false);
    expect(priceAfterCoupon(9900, { ...base, maxUses: 2, usedCount: 1 }).ok).toBe(true);
  });
  it("normalises codes", () => {
    expect(couponCodeSchema.parse("  launch-10 ")).toBe("LAUNCH-10");
    expect(couponCodeSchema.safeParse("a b").success).toBe(false);
  });
});
