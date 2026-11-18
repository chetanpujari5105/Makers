"use server";

import { updateTag } from "next/cache";
import { z } from "zod";

import { audit, ownerOnly, type ActionResult } from "@/lib/admin/guard";
import { readProductForm } from "@/lib/admin/product-form";
import {
  addLinkFile,
  deleteSampleProduct,
  removeFile,
  saveProduct,
  setProductStatus,
} from "@/lib/admin/products";
import { createCoupon, setCouponActive } from "@/lib/admin/coupons";
import { getOrder } from "@/lib/admin/records";
import { setReviewStatus } from "@/lib/admin/reviews";
import { MAX_UPDATE_EMAILS, publishUpdate } from "@/lib/admin/updates";
import { couponCodeSchema } from "@/lib/payments/coupons";
import { sendReceipt } from "@/lib/payments/orders";

/*
 * Owner server actions. Each one is a public POST endpoint, so each checks
 * the owner cookie itself (ownerOnly) and validates its input with Zod.
 * Storefront data is cached under the "catalogue" tag; changes refresh it.
 */

const id = z.uuid();

export async function saveProductAction(form: FormData): Promise<ActionResult> {
  return ownerOnly(async () => {
    const productId = form.get("id") ? id.safeParse(form.get("id")) : null;
    if (productId && !productId.success) return { ok: false, message: "Unknown product." };
    const read = readProductForm(form);
    if (!read.ok) return read;
    const saved = await saveProduct(productId?.data ?? null, read.values);
    if (!saved.ok) return saved;
    updateTag("catalogue");
    return {
      ok: true,
      message: saved.note ? `Saved. ${saved.note}` : "Saved.",
      href: productId ? undefined : `/admin/products/${saved.id}`,
    };
  });
}

const statusSchema = z.object({ id, status: z.enum(["published", "archived", "draft"]) });

export async function setProductStatusAction(
  form: FormData,
): Promise<ActionResult & { problems?: string[] }> {
  return ownerOnly(async () => {
    const input = statusSchema.safeParse(Object.fromEntries(form));
    if (!input.success) return { ok: false, message: "Unknown product or status." };
    const result = await setProductStatus(input.data.id, input.data.status);
    if (!result.ok) return result;
    updateTag("catalogue");
    const words = {
      published: "Published — it’s live.",
      archived: "Archived — it can’t be bought now; buyers keep access.",
      draft: "Moved back to draft — hidden from the store.",
    };
    return { ok: true, message: words[input.data.status] };
  });
}

const linkSchema = z.object({
  productId: id,
  label: z.string().trim().min(1, "Give the link a name buyers will see.").max(120),
  url: z
    .string()
    .trim()
    .max(1000)
    .regex(/^https:\/\/\S+$/, "The link must start with https://"),
});

export async function addLinkAction(form: FormData): Promise<ActionResult> {
  return ownerOnly(async () => {
    const input = linkSchema.safeParse(Object.fromEntries(form));
    if (!input.success) return { ok: false, message: input.error.issues[0]!.message };
    await addLinkFile(input.data.productId, input.data.label, input.data.url);
    updateTag("catalogue");
    return { ok: true, message: "Link added." };
  });
}

export async function removeFileAction(form: FormData): Promise<ActionResult> {
  return ownerOnly(async () => {
    const fileId = id.safeParse(form.get("fileId"));
    if (!fileId.success) return { ok: false, message: "Unknown file." };
    const result = await removeFile(fileId.data);
    if (!result.ok) return result;
    updateTag("catalogue");
    return { ok: true, message: "Removed." };
  });
}

export async function deleteSampleProductAction(form: FormData): Promise<ActionResult> {
  return ownerOnly(async () => {
    const productId = id.safeParse(form.get("id"));
    if (!productId.success) return { ok: false, message: "Unknown product." };
    const result = await deleteSampleProduct(productId.data);
    if (!result.ok) return result;
    updateTag("catalogue");
    return { ok: true, message: `Deleted ${result.title}.`, href: "/admin/products" };
  });
}

export async function resendReceiptAction(form: FormData): Promise<ActionResult> {
  return ownerOnly(async () => {
    const orderId = id.safeParse(form.get("orderId"));
    if (!orderId.success) return { ok: false, message: "Unknown order." };
    const order = await getOrder(orderId.data);
    if (order?.status !== "paid")
      return { ok: false, message: "Only paid orders have a receipt to resend." };
    // Email only: nothing is charged and no new access is created.
    const sent = await sendReceipt(order.id);
    await audit("receipt_resend", "order", order.id, { sent });
    return sent
      ? { ok: true, message: `Receipt sent again to ${order.email}. No new charge was made.` }
      : { ok: false, message: "The email couldn’t be sent. Please try again later." };
  });
}

const couponSchema = z
  .object({
    code: couponCodeSchema,
    discountType: z.enum(["percent", "fixed"]),
    value: z.coerce.number().int("Use a whole number.").positive("Enter a discount."),
    maxUses: z
      .string()
      .trim()
      .regex(/^(\d{1,6})?$/, "Uses must be a whole number.")
      .transform((v) => (v ? Number(v) : null))
      .refine((v) => v === null || v > 0, "Uses must be at least 1."),
    expires: z
      .string()
      .trim()
      .regex(/^(\d{4}-\d{2}-\d{2})?$/, "Pick a date.")
      // The end of that day in India.
      .transform((v) => (v ? new Date(`${v}T23:59:59+05:30`) : null))
      .refine((d) => d === null || !Number.isNaN(d.getTime()), "That date doesn’t exist."),
  })
  .refine((c) => c.discountType === "fixed" || c.value <= 90, {
    message: "A percentage coupon can take off at most 90%.",
  })
  .refine((c) => c.discountType === "percent" || c.value <= 100000, {
    message: "A rupee coupon can take off at most ₹1,00,000.",
  });

export async function createCouponAction(form: FormData): Promise<ActionResult> {
  return ownerOnly(async () => {
    const input = couponSchema.safeParse(Object.fromEntries(form));
    if (!input.success) return { ok: false, message: input.error.issues[0]!.message };
    const couponId = await createCoupon({ ...input.data, expiresAt: input.data.expires });
    if (!couponId) return { ok: false, message: "A coupon with that code already exists." };
    await audit("coupon_create", "coupon", couponId, {
      code: input.data.code,
      type: input.data.discountType,
      value: input.data.value,
    });
    return { ok: true, message: `Coupon ${input.data.code} created.` };
  });
}

export async function setCouponActiveAction(form: FormData): Promise<ActionResult> {
  return ownerOnly(async () => {
    const input = z
      .object({ id, active: z.enum(["true", "false"]) })
      .safeParse(Object.fromEntries(form));
    if (!input.success) return { ok: false, message: "Unknown coupon." };
    const active = input.data.active === "true";
    const code = await setCouponActive(input.data.id, active);
    if (!code) return { ok: false, message: "Unknown coupon." };
    await audit(active ? "coupon_activate" : "coupon_deactivate", "coupon", input.data.id, {
      code,
    });
    return { ok: true, message: `${code} ${active ? "turned on" : "turned off"}.` };
  });
}

// Only the status can be changed. "Verified purchase" is not an input here.
const moderateSchema = z.object({ id, status: z.enum(["approved", "rejected", "pending"]) });

export async function moderateReviewAction(form: FormData): Promise<ActionResult> {
  return ownerOnly(async () => {
    const input = moderateSchema.safeParse(Object.fromEntries(form));
    if (!input.success) return { ok: false, message: "Unknown review." };
    if (!(await setReviewStatus(input.data.id, input.data.status)))
      return { ok: false, message: "Unknown review." };
    await audit(`review_${input.data.status}`, "review", input.data.id);
    updateTag("catalogue");
    const words = {
      approved: "Approved — it’s on the product page.",
      rejected: "Rejected — it stays hidden.",
      pending: "Moved back to waiting.",
    };
    return { ok: true, message: words[input.data.status] };
  });
}

const updateSchema = z.object({
  productId: id,
  version: z.string().trim().min(1, "Add a version, like 1.1.").max(40),
  notes: z.string().trim().min(5, "Describe what changed.").max(2000),
});

export async function publishUpdateAction(form: FormData): Promise<ActionResult> {
  return ownerOnly(async () => {
    const input = updateSchema.safeParse(Object.fromEntries(form));
    if (!input.success) return { ok: false, message: input.error.issues[0]!.message };
    const notify = form.get("notify") === "on";
    const result = await publishUpdate({ ...input.data, notify });
    if (!result) return { ok: false, message: "Unknown product." };
    await audit("update_publish", "product", input.data.productId, {
      title: result.title,
      version: input.data.version,
      sent: result.sent,
      failed: result.failed,
      skipped: result.skipped,
    });
    updateTag("catalogue");
    if (result.skipped)
      return {
        ok: true,
        message: `Update saved, but no emails were sent: ${result.skipped} buyers is more than the ${MAX_UPDATE_EMAILS} a day the free email plan allows. Buyers will see it in their library.`,
      };
    if (!notify) return { ok: true, message: "Update saved. Buyers will see it in their library." };
    return {
      ok: result.failed === 0,
      message: `Update saved. Emails sent: ${result.sent}. Failed: ${result.failed}.`,
    };
  });
}
