import { desc, eq } from "drizzle-orm";

import { getDb } from "@/db";
import { coupons } from "@/db/schema";

/* Owner-only coupon reads and writes. Callers must have checked the owner first. */

export async function listCoupons() {
  return getDb()
    .select({
      id: coupons.id,
      code: coupons.code,
      discountType: coupons.discountType,
      percentOff: coupons.percentOff,
      amountOff: coupons.amountOff,
      maxUses: coupons.maxUses,
      usedCount: coupons.usedCount,
      expiresAt: coupons.expiresAt,
      active: coupons.active,
    })
    .from(coupons)
    .orderBy(desc(coupons.createdAt));
}

export async function createCoupon(input: {
  code: string;
  discountType: "percent" | "fixed";
  value: number;
  maxUses: number | null;
  expiresAt: Date | null;
}) {
  const [row] = await getDb()
    .insert(coupons)
    .values({
      code: input.code,
      discountType: input.discountType,
      percentOff: input.discountType === "percent" ? input.value : null,
      // Fixed coupons are rupees in the form, paise in the database; INR only.
      amountOff: input.discountType === "fixed" ? input.value * 100 : null,
      currency: input.discountType === "fixed" ? "INR" : null,
      maxUses: input.maxUses,
      expiresAt: input.expiresAt,
    })
    .onConflictDoNothing({ target: coupons.code })
    .returning({ id: coupons.id });
  return row?.id ?? null;
}

export async function setCouponActive(id: string, active: boolean) {
  const [row] = await getDb()
    .update(coupons)
    .set({ active, updatedAt: new Date() })
    .where(eq(coupons.id, id))
    .returning({ code: coupons.code });
  return row?.code ?? null;
}
