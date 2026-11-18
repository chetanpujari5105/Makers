// @vitest-environment node
import { createHmac, randomUUID } from "node:crypto";
import { existsSync } from "node:fs";

import { count, eq, inArray, like } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import { seedProducts } from "@/db/seed-data";

/*
 * Phase 3 (Razorpay test mode) against the DEVELOPMENT Neon branch, with
 * Razorpay's API replaced by an in-memory fake. Creates zz-pay rows and
 * deletes them afterwards. Skipped without a database.
 */
if (!process.env.VERCEL && existsSync(".env.local")) process.loadEnvFile(".env.local");
const hasDb = Boolean(process.env.DATABASE_URL && process.env.MAGIC_LINK_SECRET);

const KEY_SECRET = "test-key-secret-0123456789"; // gitleaks:allow (fake test value)
const WEBHOOK_SECRET = "test-webhook-secret-0123456789"; // gitleaks:allow (fake test value)
const run = `zz-pay-${Date.now().toString(36)}`;
const PRICE = 49900;
const sample = seedProducts.find((p) => p.content.typeDetails.kind === "reading")!;
const sign = (secret: string, value: string) =>
  createHmac("sha256", secret).update(value).digest("hex");

/* Fake Razorpay: orders and payments it "knows about". */
const rzpOrders = new Map<string, { amount: number; currency: string }>();
const rzpPayments = new Map<
  string,
  { order_id: string; amount: number; currency: string; status: string; amount_refunded: number }
>();
let orderCalls = 0;
function fakeRazorpay(url: string, init?: RequestInit) {
  if (url === "https://api.razorpay.com/v1/orders" && init?.method === "POST") {
    orderCalls++;
    const body = JSON.parse(String(init.body));
    const id = `order_${randomUUID().replace(/-/g, "").slice(0, 14)}`;
    rzpOrders.set(id, { amount: body.amount, currency: body.currency });
    return Response.json({ id, ...body, status: "created" });
  }
  const pay = url.match(/\/v1\/payments\/(pay_\w+)$/);
  if (pay) {
    const p = rzpPayments.get(pay[1]!);
    return p ? Response.json({ id: pay[1], ...p }) : new Response("{}", { status: 404 });
  }
  return null;
}

let ip = 0;
const post = (path: string, body: unknown, headers: Record<string, string> = {}) =>
  new Request(`http://localhost:3000${path}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      origin: "http://localhost:3000",
      "x-forwarded-for": `10.9.${Math.floor(++ip / 250)}.${ip % 250}`,
      ...headers,
    },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });

describe.skipIf(!hasDb)("Phase 3 payments (development database, fake Razorpay)", () => {
  let db: ReturnType<typeof import("@/db").getDb>;
  let s: typeof import("@/db/schema");
  let ordersRoute: typeof import("@/app/api/orders/route");
  let verifyRoute: typeof import("@/app/api/payments/verify/route");
  let webhookRoute: typeof import("@/app/api/webhooks/razorpay/route");
  let access: typeof import("@/lib/library/access");
  let warn: { mock: { calls: unknown[][] } };
  const ids = { paid: "", free: "", bundle: "" };
  let fileId = "";

  beforeAll(async () => {
    vi.stubEnv("RAZORPAY_KEY_ID", "rzp_test_fake123");
    vi.stubEnv("RAZORPAY_KEY_SECRET", KEY_SECRET);
    vi.stubEnv("RAZORPAY_WEBHOOK_SECRET", WEBHOOK_SECRET);
    vi.stubEnv("VERCEL_ENV", "");
    warn = vi.spyOn(console, "warn").mockImplementation(() => {}); // dev emails print here
    vi.spyOn(console, "error").mockImplementation(() => {});
    const realFetch = globalThis.fetch;
    vi.spyOn(globalThis, "fetch").mockImplementation(async (input, init) => {
      const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
      return fakeRazorpay(url, init) ?? realFetch(input, init);
    });

    s = await import("@/db/schema");
    db = (await import("@/db")).getDb();
    (await import("@/db/target")).describeTarget();
    ordersRoute = await import("@/app/api/orders/route");
    verifyRoute = await import("@/app/api/payments/verify/route");
    webhookRoute = await import("@/app/api/webhooks/razorpay/route");
    access = await import("@/lib/library/access");

    const [category] = await db.select({ id: s.categories.id }).from(s.categories).limit(1);
    if (!category) throw new Error("Run `npm run db:seed` first (no categories).");
    const rows = await db
      .insert(s.products)
      .values(
        (["paid", "free", "bundle"] as const).map((kind) => ({
          slug: `${run}-${kind}`,
          title: `Pay test ${kind}`,
          tagline: "Test",
          shortDescription: "Test fixture",
          productType: kind === "bundle" ? ("bundle" as const) : sample.productType,
          categoryId: category.id,
          level: "beginner" as const,
          priceInr: kind === "free" ? null : PRICE,
          isFree: kind === "free",
          status: "published" as const,
          requirements: sample.requirements,
          contentJson: sample.content,
        })),
      )
      .returning({ id: s.products.id, slug: s.products.slug });
    for (const row of rows) ids[row.slug.slice(run.length + 1) as keyof typeof ids] = row.id;
    const [file] = await db
      .insert(s.productFiles)
      .values({
        productId: ids.paid,
        label: "Guide",
        deliveryType: "file",
        fileKey: `test/${run}.pdf`,
        fileName: "guide.pdf",
      })
      .returning({ id: s.productFiles.id });
    fileId = file!.id;
  });

  afterAll(async () => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
    if (!db) return;
    const custs = await db
      .select({ id: s.customers.id })
      .from(s.customers)
      .where(like(s.customers.email, `${run}%`));
    const custIds = custs.map((c) => c.id);
    if (custIds.length) {
      await db.delete(s.entitlements).where(inArray(s.entitlements.customerId, custIds));
      await db.delete(s.orders).where(inArray(s.orders.customerId, custIds));
    }
    await db.delete(s.coupons).where(like(s.coupons.code, `${run.toUpperCase()}%`));
    await db.delete(s.webhookEvents).where(like(s.webhookEvents.eventId, `${run}%`));
    await db.delete(s.customers).where(like(s.customers.email, `${run}%`));
    await db.delete(s.leads).where(like(s.leads.email, `${run}%`));
    await db.delete(s.magicTokens).where(like(s.magicTokens.email, `${run}%`));
    await db.delete(s.products).where(like(s.products.slug, `${run}%`));
  });

  const buyer = (n: string) => `${run}-${n}@example.test`;
  async function startOrder(email: string, extra: Record<string, unknown> = {}) {
    const key = randomUUID();
    const res = await ordersRoute.POST(
      post("/api/orders", {
        productSlug: `${run}-paid`,
        name: "Test Buyer",
        email,
        idempotencyKey: key,
        ...extra,
      }),
    );
    return { res, key, body: (await res.json()) as Record<string, string> };
  }
  function pay(razorpayOrderId: string, status = "captured", amount = PRICE) {
    const paymentId = `pay_${randomUUID().replace(/-/g, "").slice(0, 14)}`;
    rzpPayments.set(paymentId, {
      order_id: razorpayOrderId,
      amount,
      currency: "INR",
      status,
      amount_refunded: 0,
    });
    return {
      razorpay_order_id: razorpayOrderId,
      razorpay_payment_id: paymentId,
      razorpay_signature: sign(KEY_SECRET, `${razorpayOrderId}|${paymentId}`),
    };
  }
  const verify = (body: unknown) => verifyRoute.POST(post("/api/payments/verify", body));
  function webhook(event: string, entity: Record<string, unknown>, eventId = randomUUID()) {
    // Like Razorpay: order.paid carries the payment AND the order; other events carry one entity.
    const payload =
      event === "order.paid"
        ? { payment: { entity }, order: { entity: { id: entity.order_id, status: "paid" } } }
        : { [event.split(".")[0]!]: { entity } };
    const raw = JSON.stringify({ event, payload });
    return webhookRoute.POST(
      post("/api/webhooks/razorpay", raw, {
        "x-razorpay-signature": sign(WEBHOOK_SECRET, raw),
        "x-razorpay-event-id": `${run}-${eventId}`,
      }),
    );
  }
  async function entitlementCount(email: string) {
    const [row] = await db
      .select({ n: count() })
      .from(s.entitlements)
      .innerJoin(s.customers, eq(s.customers.id, s.entitlements.customerId))
      .where(eq(s.customers.email, email));
    return row!.n;
  }
  const orderRow = async (id: string) =>
    (await db.select().from(s.orders).where(eq(s.orders.id, id)))[0]!;
  const receipts = () =>
    warn.mock.calls.filter((c) => String(c[0]).includes("Your receipt")).length;

  it("the checkout switch: test keys locally; live keys + CHECKOUT_ENABLED on production; never previews", async () => {
    const { isCheckoutOpen, isTestCheckout, paymentsConfigured } = await import("./razorpay");
    const site = (env: string, key: string, enabled?: string) => {
      vi.stubEnv("VERCEL_ENV", env);
      vi.stubEnv("RAZORPAY_KEY_ID", key);
      vi.stubEnv("CHECKOUT_ENABLED", enabled ?? "");
      return isCheckoutOpen();
    };
    try {
      // Localhost: test keys only (the switch isn't needed for test mode).
      expect(site("", "rzp_test_fake123")).toBe(true);
      expect(isTestCheckout()).toBe(true);
      expect(site("", "rzp_live_abc", "true")).toBe(false);
      // Production: live keys AND the switch; test keys never.
      expect(site("production", "rzp_live_abc")).toBe(false); // switch OFF by default
      expect((await startOrder(buyer("prod-off"))).res.status).toBe(503);
      expect(site("production", "rzp_live_abc", "false")).toBe(false);
      expect(site("production", "rzp_live_abc", "1")).toBe(false); // only the exact word "true"
      expect(site("production", "rzp_live_abc", "true")).toBe(true);
      expect(isTestCheckout()).toBe(false);
      expect(site("production", "rzp_test_fake123", "true")).toBe(false);
      // Previews share the production database: never, whatever the keys or switch.
      expect(site("preview", "rzp_live_abc", "true")).toBe(false);
      expect(site("preview", "rzp_test_fake123", "true")).toBe(false);
      // Switch OFF on production still lets confirmations finish (keys are right).
      site("production", "rzp_live_abc");
      expect(paymentsConfigured()).toBe(true);
    } finally {
      site("", "rzp_test_fake123");
    }
  });

  it("emergency OFF: no new checkouts, but a payment already made still grants access", async () => {
    const email = buyer("switch-off");
    const { body } = await startOrder(email);
    const result = pay(body.razorpayOrderId!);
    vi.stubEnv("VERCEL_ENV", "production");
    vi.stubEnv("RAZORPAY_KEY_ID", "rzp_live_abc");
    vi.stubEnv("CHECKOUT_ENABLED", "");
    try {
      expect((await startOrder(buyer("switch-off-new"))).res.status).toBe(503);
      expect((await verify(result)).status).toBe(200);
      expect(await entitlementCount(email)).toBe(1);
    } finally {
      vi.stubEnv("VERCEL_ENV", "");
      vi.stubEnv("RAZORPAY_KEY_ID", "rzp_test_fake123");
    }
  });

  it("buyer closes the tab after paying: order.paid alone grants access and sends one receipt", async () => {
    const email = buyer("closed-tab");
    const { body } = await startOrder(email);
    const result = pay(body.razorpayOrderId!);
    const entity = {
      id: result.razorpay_payment_id,
      ...rzpPayments.get(result.razorpay_payment_id),
    };
    const before = receipts();
    // No browser /verify call at all — only Razorpay's server-to-server notice.
    expect((await webhook("order.paid", entity)).status).toBe(200);
    expect((await orderRow(body.orderId!)).status).toBe("paid");
    expect(await entitlementCount(email)).toBe(1);
    expect(receipts()).toBe(before + 1);
    // Razorpay also sends payment.captured for the same payment: still one entitlement, one receipt.
    expect((await webhook("payment.captured", entity)).status).toBe(200);
    expect(await entitlementCount(email)).toBe(1);
    expect(receipts()).toBe(before + 1);
  });

  it("charges the database price, ignoring any amount the browser sends", async () => {
    const before = orderCalls;
    const { res, body } = await startOrder(buyer("tamper"), { amount: 1, currency: "USD" });
    expect(res.status).toBe(200);
    expect(body.keyId).toBe("rzp_test_fake123");
    expect(JSON.stringify(body)).not.toContain(KEY_SECRET);
    expect((await orderRow(body.orderId!)).amount).toBe(PRICE);
    expect(rzpOrders.get(body.razorpayOrderId!)).toEqual({ amount: PRICE, currency: "INR" });
    expect(orderCalls).toBe(before + 1);
    const [lead] = await db
      .select()
      .from(s.leads)
      .where(eq(s.leads.email, buyer("tamper")));
    expect(lead?.marketingOptIn).toBe(false);
  });

  it("a double submit reuses the same order", async () => {
    const email = buyer("double");
    const key = randomUUID();
    const send = () =>
      ordersRoute.POST(
        post("/api/orders", { productSlug: `${run}-paid`, name: "D", email, idempotencyKey: key }),
      );
    const first = await (await send()).json();
    const before = orderCalls;
    const second = await (await send()).json();
    expect(second.razorpayOrderId).toBe(first.razorpayOrderId);
    expect(orderCalls).toBe(before);
  });

  it("refuses free products, bundles and unknown products", async () => {
    for (const slug of [`${run}-free`, `${run}-bundle`, `${run}-missing`]) {
      const res = await ordersRoute.POST(
        post("/api/orders", {
          productSlug: slug,
          name: "X",
          email: buyer("refuse"),
          idempotencyKey: randomUUID(),
        }),
      );
      expect(res.status).toBe(404);
    }
  });

  it("a tampered signature, a mismatched amount or an uncaptured payment grants nothing", async () => {
    const email = buyer("bad");
    const { body } = await startOrder(email);
    const good = pay(body.razorpayOrderId!);
    const forged = { ...good, razorpay_signature: sign("wrong-secret", "x") };
    expect((await verify(forged)).status).toBe(400);

    expect((await verify(pay(body.razorpayOrderId!, "captured", PRICE - 100))).status).toBe(400);
    expect((await verify(pay(body.razorpayOrderId!, "failed"))).status).toBe(400);

    const pending = await verify(pay(body.razorpayOrderId!, "authorized"));
    expect(await pending.json()).toMatchObject({ ok: true, status: "pending" });
    expect(await entitlementCount(email)).toBe(0);
    expect((await orderRow(body.orderId!)).status).toBe("created");
  });

  it("a verified payment grants exactly one entitlement and one receipt, even when repeated", async () => {
    const email = buyer("ok");
    const { body } = await startOrder(email);
    const result = pay(body.razorpayOrderId!);
    const sentBefore = receipts();
    const first = await verify(result);
    expect(await first.json()).toMatchObject({ ok: true, status: "paid", orderId: body.orderId });
    expect((await verify(result)).status).toBe(200);
    expect(await entitlementCount(email)).toBe(1);
    expect(receipts()).toBe(sentBefore + 1);
    const order = await orderRow(body.orderId!);
    expect(order.status).toBe("paid");
    expect(order.paidAt).toBeInstanceOf(Date);
    expect(
      await access.authorizeDownload(email, fileId, { ipHash: null, userAgent: "t" }),
    ).toMatchObject({
      ok: true,
    });

    // Already owned: no second order or charge.
    expect((await startOrder(email)).res.status).toBe(409);
  });

  it("webhook first, then the browser: one entitlement; repeated events are ignored", async () => {
    const email = buyer("hook");
    const { body } = await startOrder(email);
    const result = pay(body.razorpayOrderId!);
    const entity = {
      id: result.razorpay_payment_id,
      ...rzpPayments.get(result.razorpay_payment_id),
    };

    const eventId = randomUUID();
    expect((await webhook("payment.captured", entity, eventId)).status).toBe(200);
    expect(await entitlementCount(email)).toBe(1);
    expect(await (await webhook("payment.captured", entity, eventId)).json()).toMatchObject({
      duplicate: true,
    });
    expect((await webhook("order.paid", entity)).status).toBe(200);
    expect(await (await verify(result)).json()).toMatchObject({ status: "paid" });
    expect(await entitlementCount(email)).toBe(1);
  });

  it("rejects webhooks with a bad signature", async () => {
    const raw = JSON.stringify({ event: "payment.captured", payload: {} });
    const res = await webhookRoute.POST(
      post("/api/webhooks/razorpay", raw, { "x-razorpay-signature": sign("wrong", raw) }),
    );
    expect(res.status).toBe(400);
    const tampered = await webhookRoute.POST(
      post("/api/webhooks/razorpay", `${raw} `, {
        "x-razorpay-signature": sign(WEBHOOK_SECRET, raw),
      }),
    );
    expect(tampered.status).toBe(400);
  });

  it("a failed attempt grants nothing; a later successful attempt on the same order does", async () => {
    const email = buyer("retry");
    const { body } = await startOrder(email);
    const failed = pay(body.razorpayOrderId!, "failed");
    await webhook("payment.failed", {
      id: failed.razorpay_payment_id,
      ...rzpPayments.get(failed.razorpay_payment_id),
    });
    expect((await orderRow(body.orderId!)).status).toBe("failed");
    expect(await entitlementCount(email)).toBe(0);

    const ok = pay(body.razorpayOrderId!);
    await webhook("payment.captured", {
      id: ok.razorpay_payment_id,
      ...rzpPayments.get(ok.razorpay_payment_id),
    });
    expect((await orderRow(body.orderId!)).status).toBe("paid");
    expect(await entitlementCount(email)).toBe(1);
  });

  it("only a confirmed full refund removes access", async () => {
    const email = buyer("refund");
    const { body } = await startOrder(email);
    const result = pay(body.razorpayOrderId!);
    await verify(result);
    const paymentId = result.razorpay_payment_id;
    const payment = rzpPayments.get(paymentId)!;

    payment.amount_refunded = 1000;
    await webhook("refund.processed", { id: "rfnd_1", payment_id: paymentId, amount: 1000 });
    expect(await access.listLibrary(email)).toHaveLength(1);

    payment.amount_refunded = PRICE;
    await webhook("refund.processed", {
      id: "rfnd_2",
      payment_id: paymentId,
      amount: PRICE - 1000,
    });
    expect((await orderRow(body.orderId!)).status).toBe("refunded");
    expect(await access.listLibrary(email)).toHaveLength(0);
    expect(await access.authorizeDownload(email, fileId, { ipHash: null, userAgent: "t" })).toEqual(
      {
        ok: false,
        reason: "not_found",
      },
    );
  });

  const salesCount = async () =>
    (
      await db
        .select({ n: s.products.salesCount })
        .from(s.products)
        .where(eq(s.products.id, ids.paid))
    )[0]!.n;
  const usedCount = async (code: string) =>
    (
      await db.select({ n: s.coupons.usedCount }).from(s.coupons).where(eq(s.coupons.code, code))
    )[0]!.n;

  it("a coupon lowers the database price; its use and the sale count only after payment", async () => {
    const code = `${run.toUpperCase()}-TEN`;
    await db
      .insert(s.coupons)
      .values({ code, discountType: "percent", percentOff: 10, maxUses: 1 });
    const sales = await salesCount();

    const { res, body } = await startOrder(buyer("coupon"), {
      couponCode: ` ${code.toLowerCase()} `,
      amount: 1,
    });
    expect(res.status).toBe(200);
    const discounted = PRICE - Math.floor(PRICE / 10);
    expect((await orderRow(body.orderId!)).amount).toBe(discounted);
    expect(rzpOrders.get(body.razorpayOrderId!)).toEqual({ amount: discounted, currency: "INR" });
    expect(await usedCount(code)).toBe(0);

    // Paying the full price on a discounted order is refused (amount mismatch); the right amount works.
    expect((await verify(pay(body.razorpayOrderId!, "captured", PRICE))).status).toBe(400);
    expect((await verify(pay(body.razorpayOrderId!, "captured", discounted))).status).toBe(200);
    expect(await usedCount(code)).toBe(1);
    expect(await salesCount()).toBe(sales + 1);

    // maxUses 1 is now used up.
    const second = await startOrder(buyer("coupon-2"), { couponCode: code });
    expect(second.res.status).toBe(400);
    expect(second.body.message).toMatch(/used up/);
  });

  it("an open, unpaid checkout holds a single-use coupon", async () => {
    const code = `${run.toUpperCase()}-ONCE`;
    await db
      .insert(s.coupons)
      .values({ code, discountType: "percent", percentOff: 10, maxUses: 1 });
    expect((await startOrder(buyer("hold-1"), { couponCode: code })).res.status).toBe(200);
    const second = await startOrder(buyer("hold-2"), { couponCode: code });
    expect(second.res.status).toBe(400);
    expect(second.body.message).toMatch(/used up/);
  });

  it("refuses unknown coupons, and a changed coupon with the same key is not a repeat", async () => {
    expect((await startOrder(buyer("badcode"), { couponCode: "NOPE-NOT-REAL" })).res.status).toBe(
      400,
    );
    const code = `${run.toUpperCase()}-FIFTY`;
    await db
      .insert(s.coupons)
      .values({ code, discountType: "fixed", amountOff: 5000, currency: "INR" });
    const email = buyer("switch");
    const first = await startOrder(email);
    const again = await ordersRoute.POST(
      post("/api/orders", {
        productSlug: `${run}-paid`,
        name: "Test Buyer",
        email,
        idempotencyKey: first.key,
        couponCode: code,
      }),
    );
    expect(again.status).toBe(409);
  });

  it("a full refund takes the paid sale and the coupon use back", async () => {
    const code = `${run.toUpperCase()}-REFUND`;
    await db
      .insert(s.coupons)
      .values({ code, discountType: "percent", percentOff: 20, maxUses: 5 });
    const { body } = await startOrder(buyer("refund-count"), { couponCode: code });
    const amount = PRICE - Math.floor(PRICE / 5);
    const result = pay(body.razorpayOrderId!, "captured", amount);
    expect((await verify(result)).status).toBe(200);
    const sales = await salesCount();
    expect(await usedCount(code)).toBe(1);
    const payment = rzpPayments.get(result.razorpay_payment_id)!;
    payment.amount_refunded = amount;
    await webhook("refund.processed", {
      id: "rfnd_3",
      payment_id: result.razorpay_payment_id,
      amount,
    });
    expect(await salesCount()).toBe(sales - 1);
    expect(await usedCount(code)).toBe(0);
  });
});
