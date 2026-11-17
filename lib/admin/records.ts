import { count, desc, eq, gte, sql, sum } from "drizzle-orm";

import { getDb } from "@/db";
import {
  adminAuditLogs,
  coupons,
  customers,
  downloadLogs,
  entitlements,
  leads,
  orderItems,
  orders,
  products,
} from "@/db/schema";

/* Owner-only reads of real records. Callers must have checked the owner first. */

const daysAgo = (days: number) => new Date(Date.now() - days * 24 * 60 * 60 * 1000);

/** Dashboard numbers, all counted from real rows. */
export async function getMetrics() {
  const db = getDb();
  const since = daysAgo(30);
  const [[paid], [refunded], [leadAll], [leadNew], [dlAll], [dlNew], top, recent, activity] =
    await Promise.all([
      db
        .select({ n: count(), total: sum(orders.amount) })
        .from(orders)
        .where(eq(orders.status, "paid")),
      db.select({ n: count() }).from(orders).where(eq(orders.status, "refunded")),
      db.select({ n: count() }).from(leads),
      db.select({ n: count() }).from(leads).where(gte(leads.createdAt, since)),
      db.select({ n: count() }).from(downloadLogs),
      db.select({ n: count() }).from(downloadLogs).where(gte(downloadLogs.createdAt, since)),
      db
        .select({ title: products.title, sales: count() })
        .from(orderItems)
        .innerJoin(orders, eq(orders.id, orderItems.orderId))
        .innerJoin(products, eq(products.id, orderItems.productId))
        .where(eq(orders.status, "paid"))
        .groupBy(products.title)
        .orderBy(desc(count()))
        .limit(5),
      listOrders(8),
      db
        .select({
          action: adminAuditLogs.action,
          details: adminAuditLogs.details,
          createdAt: adminAuditLogs.createdAt,
        })
        .from(adminAuditLogs)
        .orderBy(desc(adminAuditLogs.createdAt))
        .limit(10),
    ]);
  return {
    paidOrders: paid?.n ?? 0,
    grossPaise: Number(paid?.total ?? 0),
    refundedOrders: refunded?.n ?? 0,
    leadsTotal: leadAll?.n ?? 0,
    leads30: leadNew?.n ?? 0,
    downloadsTotal: dlAll?.n ?? 0,
    downloads30: dlNew?.n ?? 0,
    top,
    recent,
    activity,
  };
}

export async function listOrders(limit = 200) {
  return getDb()
    .select({
      id: orders.id,
      status: orders.status,
      amount: orders.amount,
      createdAt: orders.createdAt,
      email: customers.email,
      title: products.title,
      coupon: coupons.code,
    })
    .from(orders)
    .innerJoin(customers, eq(customers.id, orders.customerId))
    .innerJoin(orderItems, eq(orderItems.orderId, orders.id))
    .innerJoin(products, eq(products.id, orderItems.productId))
    .leftJoin(coupons, eq(coupons.id, orders.couponId))
    .orderBy(desc(orders.createdAt))
    .limit(limit);
}

export async function getOrder(id: string) {
  const db = getDb();
  const [order] = await db
    .select({
      id: orders.id,
      status: orders.status,
      amount: orders.amount,
      currency: orders.currency,
      razorpayOrderId: orders.razorpayOrderId,
      razorpayPaymentId: orders.razorpayPaymentId,
      paidAt: orders.paidAt,
      createdAt: orders.createdAt,
      name: customers.name,
      email: customers.email,
      customerId: customers.id,
      title: products.title,
      productId: products.id,
      unitAmount: orderItems.unitAmount,
      coupon: coupons.code,
    })
    .from(orders)
    .innerJoin(customers, eq(customers.id, orders.customerId))
    .innerJoin(orderItems, eq(orderItems.orderId, orders.id))
    .innerJoin(products, eq(products.id, orderItems.productId))
    .leftJoin(coupons, eq(coupons.id, orders.couponId))
    .where(eq(orders.id, id))
    .limit(1);
  if (!order) return null;
  const [access] = await db
    .select({
      grantedAt: entitlements.grantedAt,
      revokedAt: entitlements.revokedAt,
      downloadCount: entitlements.downloadCount,
      downloadLimit: entitlements.downloadLimit,
    })
    .from(entitlements)
    .where(eq(entitlements.orderId, id))
    .limit(1);
  return { ...order, access: access ?? null };
}

export async function listCustomers() {
  return getDb()
    .select({
      id: customers.id,
      name: customers.name,
      email: customers.email,
      createdAt: customers.createdAt,
      products: sql<number>`(select count(*)::int from ${entitlements} e where e.customer_id = ${customers.id} and e.revoked_at is null)`,
      paidOrders: sql<number>`(select count(*)::int from ${orders} o where o.customer_id = ${customers.id} and o.status = 'paid')`,
      spentPaise: sql<number>`(select coalesce(sum(o.amount), 0)::int from ${orders} o where o.customer_id = ${customers.id} and o.status = 'paid')`,
    })
    .from(customers)
    .orderBy(desc(customers.createdAt))
    .limit(500);
}

/** Leads, newest first. ip_hash is never selected. */
export async function listLeads(options: { optedInOnly?: boolean; limit?: number } = {}) {
  return getDb()
    .select({
      name: leads.name,
      email: leads.email,
      source: leads.source,
      optIn: leads.marketingOptIn,
      consentAt: leads.consentAt,
      createdAt: leads.createdAt,
      product: products.title,
    })
    .from(leads)
    .leftJoin(products, eq(products.id, leads.productId))
    .where(options.optedInOnly ? eq(leads.marketingOptIn, true) : undefined)
    .orderBy(desc(leads.createdAt))
    .limit(options.limit ?? 5000);
}

/**
 * One CSV cell. Text people typed is prefixed with ' when it starts with
 * = + - @ tab or return, so a spreadsheet won't run it as a formula.
 */
export function csvCell(value: unknown) {
  let text = value instanceof Date ? value.toISOString() : String(value ?? "");
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export async function leadsCsv() {
  const rows = await listLeads();
  const header = [
    "created_at",
    "name",
    "email",
    "product",
    "source",
    "marketing_opt_in",
    "consent_at",
  ];
  const lines = rows.map((r) =>
    [r.createdAt, r.name, r.email, r.product, r.source, r.optIn ? "yes" : "no", r.consentAt]
      .map(csvCell)
      .join(","),
  );
  return [header.join(","), ...lines].join("\r\n") + "\r\n";
}
