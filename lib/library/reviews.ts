import { and, desc, eq, sql } from "drizzle-orm";
import { z } from "zod";

import { getDb } from "@/db";
import { customers, entitlements, orders, products, reviews } from "@/db/schema";
import { productSlugSchema } from "@/lib/validators";

/*
 * Buyer reviews. Only someone with active access can write one (one per
 * product). "Verified purchase" is decided here from a real paid order —
 * never taken from the browser — and free claims are not purchases.
 * Every review waits for the owner's approval before it is shown.
 */

export const reviewInputSchema = z.object({
  productSlug: productSlugSchema,
  rating: z.coerce.number().int().min(1, "Choose 1 to 5 stars.").max(5),
  title: z.string().trim().min(3, "Add a short title.").max(120),
  body: z.string().trim().min(10, "Please write a little more (10 characters or more).").max(2000),
  useCase: z.string().trim().max(200).optional(),
  website: z.string().max(200).optional(),
});
export type ReviewInput = z.infer<typeof reviewInputSchema>;

export async function submitReview(
  email: string,
  input: ReviewInput,
): Promise<"saved" | "already" | "not_allowed"> {
  const result = await getDb().execute(sql`
    with c as (select id from ${customers} where email = ${email}),
    p as (select id from ${products} where slug = ${input.productSlug}),
    ent as (
      select e.order_id from ${entitlements} e, c, p
      where e.customer_id = c.id and e.product_id = p.id and e.revoked_at is null
    )
    insert into ${reviews} (product_id, customer_id, rating, title, body, use_case, verified_purchase)
    select p.id, c.id, ${input.rating}, ${input.title}, ${input.body}, ${input.useCase || null},
      exists (
        select 1 from ent a join ${orders} o on o.id = a.order_id where o.status = 'paid'
      )
    from c, p
    where exists (select 1 from ent)
    on conflict (product_id, customer_id) do nothing
    returning id`);
  if (result.rows.length) return "saved";
  return (await getMyReview(email, input.productSlug)) ? "already" : "not_allowed";
}

/** The signed-in buyer's own review of a product, if any. */
export async function getMyReview(email: string, slug: string) {
  const [row] = await getDb()
    .select({ status: reviews.status })
    .from(reviews)
    .innerJoin(customers, eq(customers.id, reviews.customerId))
    .innerJoin(products, eq(products.id, reviews.productId))
    .where(and(eq(customers.email, email), eq(products.slug, slug)))
    .limit(1);
  return row ?? null;
}

/** Approved reviews for a product page. No names or emails are shown. */
export async function listApprovedReviews(productId: string) {
  return getDb()
    .select({
      id: reviews.id,
      rating: reviews.rating,
      title: reviews.title,
      body: reviews.body,
      useCase: reviews.useCase,
      verifiedPurchase: reviews.verifiedPurchase,
    })
    .from(reviews)
    .where(and(eq(reviews.productId, productId), eq(reviews.status, "approved")))
    .orderBy(desc(reviews.createdAt))
    .limit(20);
}
export type PublicReview = Awaited<ReturnType<typeof listApprovedReviews>>[number];
