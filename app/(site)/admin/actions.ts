"use server";

import { updateTag } from "next/cache";
import { z } from "zod";

import { audit, ownerOnly, type ActionResult } from "@/lib/admin/guard";
import { readProductForm } from "@/lib/admin/product-form";
import { addLinkFile, removeFile, saveProduct, setProductStatus } from "@/lib/admin/products";
import { getOrder } from "@/lib/admin/records";
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
