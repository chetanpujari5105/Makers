// @vitest-environment node
import { existsSync } from "node:fs";

import { eq, inArray, like, or } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import { seedProducts } from "@/db/seed-data";

import { csvCell } from "./records";

/*
 * Phase 4 owner admin. Part 1 needs no database: every admin action and
 * admin API refuses a visitor who isn't the signed-in owner. Part 2 runs
 * the owner's product, review and update flows against the DEVELOPMENT
 * Neon branch, creating zz-adm rows and deleting them afterwards.
 */
if (!process.env.VERCEL && existsSync(".env.local")) process.loadEnvFile(".env.local");
const hasDb = Boolean(process.env.DATABASE_URL && process.env.MAGIC_LINK_SECRET);

const owner = vi.hoisted(() => ({ signedIn: false }));
vi.mock("@/lib/auth/session", async (original) => ({
  ...(await original<typeof import("@/lib/auth/session")>()),
  isAdmin: async () => owner.signedIn,
}));
vi.mock("next/cache", async (original) => ({
  ...(await original<typeof import("next/cache")>()),
  updateTag: vi.fn(),
  revalidateTag: vi.fn(),
}));

const fd = (fields: Record<string, string>) => {
  const form = new FormData();
  for (const [key, value] of Object.entries(fields)) form.set(key, value);
  return form;
};
const someId = "00000000-0000-4000-8000-000000000000";

describe("owner-only protection", () => {
  it("every admin server action refuses when the owner isn't signed in", async () => {
    owner.signedIn = false;
    const actions = await import("@/app/(site)/admin/actions");
    const names = Object.keys(actions);
    expect(names.length).toBeGreaterThanOrEqual(9);
    for (const name of names) {
      const action = actions[name as keyof typeof actions] as (
        f: FormData,
      ) => Promise<{ ok: boolean; message: string }>;
      const result = await action(
        fd({
          id: someId,
          productId: someId,
          fileId: someId,
          orderId: someId,
          status: "published",
          title: "x",
          slug: "x",
          code: "HACK",
          discountType: "percent",
          value: "50",
          version: "9",
          notes: "hello there",
          label: "x",
          url: "https://x.test",
          active: "true",
        }),
      );
      expect(result, name).toEqual({ ok: false, message: "Please sign in as the owner again." });
    }
  });

  it("admin APIs refuse without the owner login", async () => {
    owner.signedIn = false;
    const exportRoute = await import("@/app/api/admin/leads/export/route");
    expect((await exportRoute.GET()).status).toBe(401);
    const req = (path: string) =>
      new Request(`http://localhost:3000${path}`, {
        method: "POST",
        headers: { "content-type": "application/json", origin: "http://localhost:3000" },
        body: JSON.stringify({
          productId: someId,
          fileName: "a.pdf",
          size: 10,
          key: "k",
          label: "x",
        }),
      });
    expect(
      (await (await import("@/app/api/admin/uploads/route")).POST(req("/api/admin/uploads")))
        .status,
    ).toBe(401);
    expect(
      (await (await import("@/app/api/admin/files/route")).POST(req("/api/admin/files"))).status,
    ).toBe(401);
  });

  it("admin pages send visitors to the login page", async () => {
    owner.signedIn = false;
    const { requireAdminPage } = await import("./guard");
    await expect(requireAdminPage()).rejects.toMatchObject({
      digest: expect.stringContaining("/admin/login"),
    });
  });
});

describe("CSV export", () => {
  it("defuses spreadsheet formulas and quotes commas", () => {
    expect(csvCell("=HYPERLINK(1)")).toBe("'=HYPERLINK(1)");
    expect(csvCell("+91 98")).toBe("'+91 98");
    expect(csvCell("@x")).toBe("'@x");
    expect(csvCell("Smith, Jo")).toBe('"Smith, Jo"');
    expect(csvCell('say "hi"')).toBe('"say ""hi"""');
    expect(csvCell(null)).toBe("");
  });
});

const run = `zz-adm-${Date.now().toString(36)}`;
const sample = seedProducts.find((p) => p.content.typeDetails.kind === "reading")!;
const complete = {
  tagline: "A short tagline.",
  shortDescription: "What this is.",
  setupTimeMinutes: "20",
  licenseText: "Personal use.",
  priceRupees: "199",
  benefit: sample.content.benefit.join("\n"),
  audience: sample.content.audience.join("\n"),
  firstWinTitle: "Do one thing",
  firstWinDescription: "A quick first result.",
  firstWinMinutes: "10",
  steps: "Open it | Open the file\nRead | Read part one\nTry | Try the first task",
  results: "A clear plan",
  requirements: "A PDF reader | free",
  "td.contents": "Part one\nPart two",
};

describe.skipIf(!hasDb)("owner flows (development database)", () => {
  let db: ReturnType<typeof import("@/db").getDb>;
  let s: typeof import("@/db/schema");
  let actions: typeof import("@/app/(site)/admin/actions");
  let queries: typeof import("@/lib/catalogue/queries");
  let productId = "";
  const slug = `${run}-guide`;
  const emails = {
    paid: `${run}-paid@example.test`,
    free: `${run}-free@example.test`,
    stranger: `${run}-x@example.test`,
  };
  const reviewIds: string[] = [];

  const base = (extra: Record<string, string> = {}) =>
    fd({
      title: "Admin test guide",
      slug,
      productType: "pdf",
      goal: "learn",
      level: "beginner",
      licenseType: "personal",
      version: "1.0",
      ...extra,
    });

  beforeAll(async () => {
    owner.signedIn = true;
    vi.stubEnv("RESEND_API_KEY", ""); // never send real email from tests
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
    s = await import("@/db/schema");
    db = (await import("@/db")).getDb();
    (await import("@/db/target")).describeTarget();
    actions = await import("@/app/(site)/admin/actions");
    queries = await import("@/lib/catalogue/queries");
  });

  afterAll(async () => {
    owner.signedIn = false;
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
    if (!db) return;
    const custs = await db
      .select({ id: s.customers.id })
      .from(s.customers)
      .where(like(s.customers.email, `${run}%`));
    const custIds = custs.map((c) => c.id);
    if (custIds.length) {
      await db.delete(s.reviews).where(inArray(s.reviews.customerId, custIds));
      await db.delete(s.entitlements).where(inArray(s.entitlements.customerId, custIds));
      await db.delete(s.orders).where(inArray(s.orders.customerId, custIds));
      await db.delete(s.customers).where(inArray(s.customers.id, custIds));
    }
    await db.delete(s.magicTokens).where(like(s.magicTokens.email, `${run}%`));
    if (productId) {
      await db
        .delete(s.adminAuditLogs)
        .where(
          or(
            eq(s.adminAuditLogs.targetId, productId),
            reviewIds.length ? inArray(s.adminAuditLogs.targetId, reviewIds) : undefined,
          ),
        );
    }
    await db.delete(s.products).where(like(s.products.slug, `${run}%`));
  });

  it("creates a half-finished draft, refuses to publish it, then publishes it once complete", async () => {
    const created = await actions.saveProductAction(base());
    expect(created.ok).toBe(true);
    productId = created.href!.split("/").pop()!;

    const early = await actions.setProductStatusAction(fd({ id: productId, status: "published" }));
    expect(early.ok).toBe(false);
    expect(early.problems).toContain("Add at least one file or link for buyers to receive.");
    expect(early.problems!.some((p) => p.includes("Setup steps"))).toBe(true);
    expect(await queries.getProduct(slug)).toBeNull();

    expect((await actions.saveProductAction(base({ id: productId, ...complete }))).ok).toBe(true);
    expect(
      (
        await actions.addLinkAction(
          fd({ productId, label: "Guide", url: "https://example.com/guide" }),
        )
      ).ok,
    ).toBe(true);
    const published = await actions.setProductStatusAction(
      fd({ id: productId, status: "published" }),
    );
    expect(published).toMatchObject({ ok: true });
    const live = await queries.getProduct(slug);
    expect(live?.priceInr).toBe(19900);
    expect(live?.content.steps).toHaveLength(3);
  });

  it("a price change shows on the storefront and is logged", async () => {
    expect(
      (await actions.saveProductAction(base({ id: productId, ...complete, priceRupees: "249" })))
        .ok,
    ).toBe(true);
    expect((await queries.getProduct(slug))?.priceInr).toBe(24900);
    const logs = await db
      .select()
      .from(s.adminAuditLogs)
      .where(eq(s.adminAuditLogs.targetId, productId));
    expect(logs.filter((l) => l.action === "price_change").map((l) => l.details)).toContainEqual({
      from: 19900,
      to: 24900,
    });
  });

  it("a live product can't be made incomplete, lose its last file, or change its web address", async () => {
    const broken = await actions.saveProductAction(
      base({ id: productId, ...complete, benefit: "" }),
    );
    expect(broken.ok).toBe(false);
    const moved = await actions.saveProductAction(
      base({ id: productId, ...complete, priceRupees: "249", slug: `${run}-moved` }),
    );
    expect(moved).toMatchObject({ ok: true });
    expect(moved.message).toMatch(/kept/);
    expect(await queries.getProduct(slug)).not.toBeNull();
    const [file] = await db
      .select({ id: s.productFiles.id })
      .from(s.productFiles)
      .where(eq(s.productFiles.productId, productId));
    expect((await actions.removeFileAction(fd({ fileId: file!.id }))).ok).toBe(false);
  });

  it("archiving stops sales but buyers keep their access", async () => {
    const [paidBuyer, freeBuyer] = await db
      .insert(s.customers)
      .values([
        { name: "Paid", email: emails.paid },
        { name: "Free", email: emails.free },
        { name: "Stranger", email: emails.stranger },
      ])
      .returning({ id: s.customers.id });
    const [order] = await db
      .insert(s.orders)
      .values({
        customerId: paidBuyer!.id,
        amount: 24900,
        currency: "INR",
        status: "paid",
        paidAt: new Date(),
      })
      .returning({ id: s.orders.id });
    await db.insert(s.entitlements).values([
      { customerId: paidBuyer!.id, productId, orderId: order!.id },
      { customerId: freeBuyer!.id, productId },
    ]);

    expect(
      (await actions.setProductStatusAction(fd({ id: productId, status: "archived" }))).ok,
    ).toBe(true);
    const { findPurchasableProduct } = await import("@/lib/payments/orders");
    expect(await findPurchasableProduct(slug)).toBeNull();
    expect(await queries.getProduct(slug)).toBeNull();
    const { listLibrary } = await import("@/lib/library/access");
    expect((await listLibrary(emails.paid)).map((p) => p.slug)).toContain(slug);

    // Customer list counts (regression: the subqueries once compared the wrong id).
    const { listCustomers } = await import("./records");
    const paidRow = (await listCustomers()).find((c) => c.email === emails.paid);
    expect(paidRow).toMatchObject({ products: 1, paidOrders: 1, spentPaise: 24900 });
  });

  it("reviews: only buyers can write one; verified purchase comes from a paid order, never the form", async () => {
    const { submitReview } = await import("@/lib/library/reviews");
    const review = { productSlug: slug, rating: 5, title: "Great", body: "Really helped me plan." };
    expect(await submitReview(emails.paid, review)).toBe("saved");
    expect(await submitReview(emails.free, { ...review, rating: 4 })).toBe("saved");
    expect(await submitReview(emails.stranger, review)).toBe("not_allowed");
    expect(await submitReview(emails.paid, review)).toBe("already");

    const rows = await db
      .select({
        id: s.reviews.id,
        verified: s.reviews.verifiedPurchase,
        status: s.reviews.status,
        rating: s.reviews.rating,
      })
      .from(s.reviews)
      .where(eq(s.reviews.productId, productId));
    reviewIds.push(...rows.map((r) => r.id));
    expect(rows.find((r) => r.rating === 5)?.verified).toBe(true);
    const free = rows.find((r) => r.rating === 4)!;
    expect(free).toMatchObject({ verified: false, status: "pending" });

    // The owner can approve it, but can't make it "verified" by sending that field.
    const moderated = await actions.moderateReviewAction(
      fd({ id: free.id, status: "approved", verifiedPurchase: "true", verified_purchase: "true" }),
    );
    expect(moderated.ok).toBe(true);
    const [after] = await db.select().from(s.reviews).where(eq(s.reviews.id, free.id));
    expect(after).toMatchObject({ status: "approved", verifiedPurchase: false });

    const preview = await queries.getProductPreview(productId);
    expect(preview?.reviews).toEqual([
      expect.objectContaining({ rating: 4, verifiedPurchase: false }),
    ]);
  });

  it("a product update is saved, shown in the library, and emailed to each buyer once", async () => {
    const warn = vi.mocked(console.warn);
    warn.mockClear();
    const result = await actions.publishUpdateAction(
      fd({ productId, version: "1.1", notes: "Added a new chapter.", notify: "on" }),
    );
    expect(result).toEqual({ ok: true, message: "Update saved. Emails sent: 2. Failed: 0." });
    expect(
      warn.mock.calls.filter((c) => String(c[0]).includes("Updated: Admin test guide")),
    ).toHaveLength(2);
    const { getLibraryProduct } = await import("@/lib/library/access");
    const library = await getLibraryProduct(emails.free, slug);
    expect(library?.updates[0]).toMatchObject({ version: "1.1", notes: "Added a new chapter." });
  });

  it("over the email cap, an update is saved but nobody is emailed", async () => {
    const extra = await db
      .insert(s.customers)
      .values(
        Array.from({ length: 80 }, (_, i) => ({
          name: "Cap",
          email: `${run}-cap${i}@example.test`,
        })),
      )
      .returning({ id: s.customers.id });
    await db.insert(s.entitlements).values(extra.map((c) => ({ customerId: c.id, productId })));
    const warn = vi.mocked(console.warn);
    warn.mockClear();
    const result = await actions.publishUpdateAction(
      fd({ productId, version: "1.2", notes: "Another chapter.", notify: "on" }),
    );
    expect(result.ok).toBe(true);
    expect(result.message).toMatch(/no emails were sent: 82 buyers is more than the 80/);
    expect(
      warn.mock.calls.filter((c) => String(c[0]).includes("Updated: Admin test guide")),
    ).toHaveLength(0);
  });

  it("only a sample nobody has access to can be deleted, with its files", async () => {
    const del = (id: string) => actions.deleteSampleProductAction(fd({ id }));
    expect(await del(productId)).toEqual({
      ok: false,
      message: "Only sample products can be deleted.",
    });
    await db.update(s.products).set({ isSample: true }).where(eq(s.products.id, productId));
    expect((await del(productId)).message).toMatch(/has access to or ordered/);

    const created = await actions.saveProductAction(
      base({ title: "Sample to delete", slug: `${run}-sample` }),
    );
    const sampleId = created.href!.split("/").pop()!;
    await db.update(s.products).set({ isSample: true }).where(eq(s.products.id, sampleId));
    await actions.addLinkAction(fd({ productId: sampleId, label: "Guide", url: "https://x.test" }));
    expect(await del(sampleId)).toMatchObject({ ok: true, href: "/admin/products" });
    const left = await db
      .select({ id: s.productFiles.id })
      .from(s.productFiles)
      .where(eq(s.productFiles.productId, sampleId));
    expect(left).toHaveLength(0);
    const logs = await db
      .delete(s.adminAuditLogs)
      .where(eq(s.adminAuditLogs.targetId, sampleId))
      .returning({ action: s.adminAuditLogs.action });
    expect(logs.map((l) => l.action)).toContain("product_delete");
  });
});
