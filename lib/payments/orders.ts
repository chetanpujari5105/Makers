import { and, eq, isNull, sql } from "drizzle-orm";

import { getDb } from "@/db";
import { coupons, customers, entitlements, orderItems, orders, products } from "@/db/schema";
import { createMagicLink } from "@/lib/auth/magic-link";
import { sendLinkEmail } from "@/lib/email/send";
import { formatInr } from "@/lib/money";

/*
 * Paid orders (server only). Amounts and currency always come from the
 * database. The neon-http driver has no transactions, so each multi-step
 * write is one SQL statement; unique indexes make repeats harmless.
 */

/** A published, paid, single product that can be bought now (bundles wait for Phase 4). */
export async function findPurchasableProduct(slug: string) {
  const [row] = await getDb()
    .select({
      id: products.id,
      slug: products.slug,
      title: products.title,
      priceInr: products.priceInr,
    })
    .from(products)
    .where(
      and(
        eq(products.slug, slug),
        eq(products.status, "published"),
        eq(products.isFree, false),
        sql`${products.productType} <> 'bundle'`,
      ),
    )
    .limit(1);
  return row?.priceInr ? { ...row, priceInr: row.priceInr } : null;
}

export async function ownsProduct(email: string, productId: string) {
  const [row] = await getDb()
    .select({ id: entitlements.id })
    .from(entitlements)
    .innerJoin(customers, eq(customers.id, entitlements.customerId))
    .where(
      and(
        eq(customers.email, email),
        eq(entitlements.productId, productId),
        isNull(entitlements.revokedAt),
      ),
    )
    .limit(1);
  return Boolean(row);
}

type LocalOrder = {
  id: string;
  razorpayOrderId: string | null;
  status: "created" | "paid" | "failed" | "refunded";
};

/**
 * Creates the customer (if new), the order and its single item in one
 * statement. A repeated submit with the same idempotency key returns the
 * existing order instead, but only for the same buyer, product, price and coupon.
 */
export async function createLocalOrder(input: {
  name: string;
  email: string;
  productId: string;
  /** What the buyer pays (after any coupon). */
  amount: number;
  /** The product's own price, kept on the order line. */
  listPrice: number;
  couponId: string | null;
  idempotencyKey: string;
}): Promise<LocalOrder | null> {
  const db = getDb();
  const result = await db.execute(sql`
    with c as (
      insert into ${customers} (name, email) values (${input.name}, ${input.email})
      on conflict (email) do update set updated_at = now()
      returning id
    ), o as (
      insert into ${orders} (customer_id, amount, currency, coupon_id, idempotency_key)
      select c.id, ${input.amount}, 'INR', ${input.couponId}, ${input.idempotencyKey} from c
      on conflict (idempotency_key) do nothing
      returning id
    ), i as (
      insert into ${orderItems} (order_id, product_id, unit_amount, currency)
      select o.id, ${input.productId}, ${input.listPrice}, 'INR' from o
      returning order_id
    )
    select (select order_id from i) as id`);
  const newId = (result.rows[0] as { id: string | null } | undefined)?.id;
  if (newId) return { id: newId, razorpayOrderId: null, status: "created" };

  const [existing] = await db
    .select({ id: orders.id, razorpayOrderId: orders.razorpayOrderId, status: orders.status })
    .from(orders)
    .innerJoin(customers, eq(customers.id, orders.customerId))
    .innerJoin(orderItems, eq(orderItems.orderId, orders.id))
    .where(
      and(
        eq(orders.idempotencyKey, input.idempotencyKey),
        eq(customers.email, input.email),
        eq(orderItems.productId, input.productId),
        // A changed coupon or price is a different order, not a repeat.
        eq(orders.amount, input.amount),
        input.couponId ? eq(orders.couponId, input.couponId) : isNull(orders.couponId),
      ),
    )
    .limit(1);
  return existing ?? null;
}

export async function setProviderOrderId(orderId: string, providerOrderId: string) {
  await getDb()
    .update(orders)
    .set({ razorpayOrderId: providerOrderId, updatedAt: new Date() })
    .where(and(eq(orders.id, orderId), isNull(orders.razorpayOrderId)));
}

export async function findOrderByProviderId(providerOrderId: string) {
  const [row] = await getDb()
    .select({
      id: orders.id,
      amount: orders.amount,
      currency: orders.currency,
      status: orders.status,
    })
    .from(orders)
    .where(eq(orders.razorpayOrderId, providerOrderId))
    .limit(1);
  return row ?? null;
}

/**
 * Marks the order paid and grants access, in one statement. Works from
 * "created" or "failed" (Razorpay allows another attempt on the same order).
 * Only the call that actually changes the order returns it, so the browser
 * callback and the webhook can arrive in any order without double access
 * or a second receipt. The amount and currency must match the order. The same
 * statement counts the coupon use and the product's paid sale.
 */
export async function fulfilPaidOrder(payment: {
  providerOrderId: string;
  paymentId: string;
  amount: number;
  currency: string;
}) {
  const result = await getDb().execute(sql`
    with o as (
      update ${orders}
      set status = 'paid', paid_at = now(), razorpay_payment_id = ${payment.paymentId}, updated_at = now()
      where razorpay_order_id = ${payment.providerOrderId}
        and status in ('created', 'failed')
        and amount = ${payment.amount} and currency = ${payment.currency}
      returning id, customer_id, coupon_id
    ), g as (
      insert into ${entitlements} (customer_id, product_id, order_id)
      select o.customer_id, oi.product_id, o.id
      from o join ${orderItems} oi on oi.order_id = o.id
      on conflict do nothing
      returning id
    ), s as (
      update ${products} set sales_count = sales_count + 1
      where id in (select oi.product_id from o join ${orderItems} oi on oi.order_id = o.id)
    ), u as (
      -- shortcut: a checkout paid more than an hour after it opened keeps its coupon even if
      -- the coupon has since run out or been turned off (the buyer has paid); the counter
      -- stops at the limit instead of blocking their access.
      update ${coupons} set used_count = used_count + 1, updated_at = now()
      where id = (select coupon_id from o)
        and (max_uses is null or used_count < max_uses)
    )
    select o.id, (select count(*) from g)::int as granted from o`);
  return (result.rows[0] as { id: string; granted: number } | undefined) ?? null;
}

/** A failed attempt; a later successful attempt on the same order still counts. */
export async function markOrderFailed(providerOrderId: string) {
  await getDb()
    .update(orders)
    .set({ status: "failed", updatedAt: new Date() })
    .where(and(eq(orders.razorpayOrderId, providerOrderId), eq(orders.status, "created")));
}

/**
 * After Razorpay confirms a FULL refund: mark the order refunded and revoke
 * the access it granted, in one statement. Partial refunds keep access.
 */
export async function refundOrder(paymentId: string) {
  const result = await getDb().execute(sql`
    with o as (
      update ${orders} set status = 'refunded', updated_at = now()
      where razorpay_payment_id = ${paymentId} and status = 'paid'
      returning id, coupon_id
    ), r as (
      update ${entitlements} set revoked_at = now()
      where order_id in (select id from o) and revoked_at is null
      returning id
    ), s as (
      update ${products} set sales_count = sales_count - 1
      where sales_count > 0
        and id in (select oi.product_id from ${orderItems} oi where oi.order_id in (select id from o))
    ), u as (
      -- A refunded order gives its coupon use back.
      update ${coupons} set used_count = used_count - 1, updated_at = now()
      where used_count > 0 and id in (select coupon_id from o)
    )
    select (select count(*) from o)::int as orders, (select count(*) from r)::int as revoked`);
  return result.rows[0] as { orders: number; revoked: number };
}

/** What the success page may show for an order id: no email or payment details. */
export async function getOrderSummary(orderId: string) {
  const [row] = await getDb()
    .select({ status: orders.status, title: products.title })
    .from(orders)
    .innerJoin(orderItems, eq(orderItems.orderId, orders.id))
    .innerJoin(products, eq(products.id, orderItems.productId))
    .where(eq(orders.id, orderId))
    .limit(1);
  return row ?? null;
}

/**
 * Receipt with a one-time library link. Sent only by the call that marked
 * the order paid. A failure is logged, not thrown: access is already granted
 * and the buyer can request a new link from My Library.
 */
export async function sendReceipt(orderId: string): Promise<boolean> {
  try {
    const [row] = await getDb()
      .select({
        email: customers.email,
        amount: orders.amount,
        title: products.title,
        slug: products.slug,
      })
      .from(orders)
      .innerJoin(customers, eq(customers.id, orders.customerId))
      .innerJoin(orderItems, eq(orderItems.orderId, orders.id))
      .innerJoin(products, eq(products.id, orderItems.productId))
      .where(eq(orders.id, orderId))
      .limit(1);
    if (!row) return false;
    const link = await createMagicLink(row.email, `/library/${row.slug}`);
    await sendLinkEmail({
      to: row.email,
      subject: `Your receipt: ${row.title}`,
      heading: `Thank you — ${row.title} is yours`,
      intro: `We received your payment of ${formatInr(row.amount)} (order ${orderId.slice(0, 8)}). Use the button below to open your library and start with the setup steps.`,
      linkLabel: "Open my library",
      link,
    });
    return true;
  } catch (error) {
    console.error("receipt email failed", error);
    return false;
  }
}
