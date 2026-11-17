import { asc, desc, eq, sql } from "drizzle-orm";

import { getDb } from "@/db";
import { customers, products, reviews } from "@/db/schema";

/* Owner-only review moderation. The owner can change only the status, never "verified purchase". */

export async function listReviewsForOwner() {
  return (
    getDb()
      .select({
        id: reviews.id,
        status: reviews.status,
        rating: reviews.rating,
        title: reviews.title,
        body: reviews.body,
        useCase: reviews.useCase,
        verifiedPurchase: reviews.verifiedPurchase,
        createdAt: reviews.createdAt,
        product: products.title,
        email: customers.email,
      })
      .from(reviews)
      .innerJoin(products, eq(products.id, reviews.productId))
      .innerJoin(customers, eq(customers.id, reviews.customerId))
      // Waiting reviews first.
      .orderBy(asc(sql`${reviews.status} <> 'pending'`), desc(reviews.createdAt))
      .limit(300)
  );
}

export async function setReviewStatus(id: string, status: "approved" | "rejected" | "pending") {
  const [row] = await getDb()
    .update(reviews)
    .set({ status, updatedAt: new Date() })
    .where(eq(reviews.id, id))
    .returning({ id: reviews.id });
  return Boolean(row);
}
