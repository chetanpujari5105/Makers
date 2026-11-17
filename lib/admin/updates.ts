import { and, desc, eq, isNull } from "drizzle-orm";

import { getDb } from "@/db";
import { customers, entitlements, products, productUpdates } from "@/db/schema";
import { createMagicLink } from "@/lib/auth/magic-link";
import { sendLinkEmail } from "@/lib/email/send";

/* Owner-only product updates: version notes on Start Here, optionally emailed to everyone with access. */

// Resend's free plan sends 100 emails a day; leave room for receipts and sign-in links.
export const MAX_UPDATE_EMAILS = 80;

export async function listUpdates() {
  return getDb()
    .select({
      id: productUpdates.id,
      version: productUpdates.version,
      notes: productUpdates.notes,
      createdAt: productUpdates.createdAt,
      product: products.title,
    })
    .from(productUpdates)
    .innerJoin(products, eq(products.id, productUpdates.productId))
    .orderBy(desc(productUpdates.createdAt))
    .limit(50);
}

export async function recipientsFor(productId: string) {
  const rows = await getDb()
    .selectDistinct({ email: customers.email })
    .from(entitlements)
    .innerJoin(customers, eq(customers.id, entitlements.customerId))
    .where(and(eq(entitlements.productId, productId), isNull(entitlements.revokedAt)));
  return rows.map((r) => r.email);
}

/**
 * Saves the update first (so it shows on Start Here even if email fails),
 * then emails each buyer their own one-time library link. Runs once per
 * click; there is no automatic retry, so nobody is emailed twice.
 */
export async function publishUpdate(input: {
  productId: string;
  version: string;
  notes: string;
  notify: boolean;
}) {
  const db = getDb();
  const [product] = await db
    .select({ title: products.title, slug: products.slug })
    .from(products)
    .where(eq(products.id, input.productId))
    .limit(1);
  if (!product) return null;
  const [update] = await db
    .insert(productUpdates)
    .values({
      productId: input.productId,
      version: input.version,
      notes: input.notes,
      createdBy: "owner",
    })
    .returning({ id: productUpdates.id });
  await db
    .update(products)
    .set({ version: input.version, updatedAt: new Date() })
    .where(eq(products.id, input.productId));

  let sent = 0;
  let failed = 0;
  const emails = input.notify ? await recipientsFor(input.productId) : [];
  if (emails.length > MAX_UPDATE_EMAILS) {
    return { updateId: update!.id, title: product.title, sent, failed, skipped: emails.length };
  }
  for (const email of emails) {
    try {
      await sendLinkEmail({
        to: email,
        subject: `Updated: ${product.title} (version ${input.version})`,
        heading: `${product.title} has been updated`,
        intro: `Version ${input.version} is ready in your library. What changed: ${input.notes}`,
        linkLabel: "Open my library",
        link: await createMagicLink(email, `/library/${product.slug}`),
      });
      sent++;
    } catch (error) {
      console.error("update email failed", error);
      failed++;
    }
  }
  return { updateId: update!.id, title: product.title, sent, failed, skipped: 0 };
}
