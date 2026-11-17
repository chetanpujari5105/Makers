// @vitest-environment node
import { existsSync } from "node:fs";

import { and, count, eq, inArray, like } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import { seedProducts } from "@/db/seed-data";

/*
 * Phase 2 integration tests against the DEVELOPMENT Neon branch (.env.local):
 * free claims, leads, magic links and protected downloads. Creates its own
 * zz-test rows and deletes them afterwards. Skipped without a database.
 */
if (!process.env.VERCEL && existsSync(".env.local")) process.loadEnvFile(".env.local");
const hasDb = Boolean(process.env.DATABASE_URL && process.env.MAGIC_LINK_SECRET);

const run = `zz-test-${Date.now().toString(36)}`;
const slugs = { free: `${run}-free`, paid: `${run}-paid`, draft: `${run}-draft` };
const buyer = `${run}@example.test`;
const stranger = `${run}-other@example.test`;
const sample = seedProducts.find((p) => p.content.typeDetails.kind === "reading")!;

function claimRequest(body: Record<string, unknown>) {
  return new Request("http://localhost:3000/api/free-claim", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      origin: "http://localhost:3000",
      "x-forwarded-for": `10.0.0.${Math.floor(Math.random() * 250)}`,
    },
    body: JSON.stringify(body),
  });
}

describe.skipIf(!hasDb)("Phase 2 access (development database)", () => {
  let access: typeof import("./access");
  let magic: typeof import("@/lib/auth/magic-link");
  let claim: typeof import("@/app/api/free-claim/route");
  let db: ReturnType<typeof import("@/db").getDb>;
  let s: typeof import("@/db/schema");
  const ids: Record<keyof typeof slugs, string> = { free: "", paid: "", draft: "" };
  const fileIds = { file: "", link: "", paidFile: "" };

  beforeAll(async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {}); // dev emails print links
    access = await import("./access");
    magic = await import("@/lib/auth/magic-link");
    claim = await import("@/app/api/free-claim/route");
    s = await import("@/db/schema");
    db = (await import("@/db")).getDb();
    (await import("@/db/target")).describeTarget();

    const [category] = await db.select({ id: s.categories.id }).from(s.categories).limit(1);
    if (!category) throw new Error("Run `npm run db:seed` first (no categories).");

    const rows = await db
      .insert(s.products)
      .values(
        (["free", "paid", "draft"] as const).map((kind) => ({
          slug: slugs[kind],
          title: `Test ${kind} ${run}`,
          tagline: "Test",
          shortDescription: "Test fixture",
          productType: sample.productType,
          categoryId: category.id,
          level: "beginner" as const,
          priceInr: kind === "paid" ? 50000 : null,
          isFree: kind !== "paid",
          status: kind === "draft" ? ("draft" as const) : ("published" as const),
          requirements: sample.requirements,
          contentJson: sample.content,
        })),
      )
      .returning({ id: s.products.id, slug: s.products.slug });
    for (const row of rows)
      ids[(Object.keys(slugs) as (keyof typeof slugs)[]).find((k) => slugs[k] === row.slug)!] =
        row.id;

    const files = await db
      .insert(s.productFiles)
      .values([
        {
          productId: ids.free,
          label: "Guide",
          deliveryType: "file",
          fileKey: `test/${run}.pdf`,
          fileName: "guide.pdf",
        },
        {
          productId: ids.free,
          label: "Template",
          deliveryType: "external_link",
          externalUrl: "https://example.test/private",
        },
        {
          productId: ids.paid,
          label: "Paid",
          deliveryType: "file",
          fileKey: `test/${run}-paid.pdf`,
          fileName: "paid.pdf",
        },
      ])
      .returning({ id: s.productFiles.id });
    [fileIds.file, fileIds.link, fileIds.paidFile] = files.map((f) => f.id) as [
      string,
      string,
      string,
    ];
  });

  afterAll(async () => {
    if (!db) return;
    const custs = await db
      .select({ id: s.customers.id })
      .from(s.customers)
      .where(like(s.customers.email, `${run}%`));
    if (custs.length)
      await db.delete(s.entitlements).where(
        inArray(
          s.entitlements.customerId,
          custs.map((c) => c.id),
        ),
      );
    await db.delete(s.customers).where(like(s.customers.email, `${run}%`));
    await db.delete(s.leads).where(like(s.leads.email, `${run}%`));
    await db.delete(s.magicTokens).where(like(s.magicTokens.email, `${run}%`));
    await db.delete(s.products).where(like(s.products.slug, `${run}%`));
  });

  const entitlementCount = async (email: string) => {
    const [row] = await db
      .select({ n: count() })
      .from(s.entitlements)
      .innerJoin(s.customers, eq(s.customers.id, s.entitlements.customerId))
      .where(eq(s.customers.email, email));
    return row!.n;
  };

  it("free claim saves the lead (no marketing consent) and grants exactly one entitlement", async () => {
    const first = await claim.POST(
      claimRequest({ productSlug: slugs.free, name: "Asha", email: `  ${buyer.toUpperCase()} ` }),
    );
    expect(first.status).toBe(200);
    const second = await claim.POST(
      claimRequest({ productSlug: slugs.free, name: "Asha", email: buyer }),
    );
    expect(second.status).toBe(200);

    expect(await entitlementCount(buyer)).toBe(1);
    const leadRows = await db.select().from(s.leads).where(eq(s.leads.email, buyer));
    expect(leadRows).toHaveLength(2);
    expect(leadRows.every((l) => l.marketingOptIn === false && l.consentAt === null)).toBe(true);
  });

  it("stores consent only when the box was ticked", async () => {
    const email = `${run}-optin@example.test`;
    await claim.POST(
      claimRequest({ productSlug: slugs.free, name: "Ravi", email, marketingOptIn: true }),
    );
    const [lead] = await db.select().from(s.leads).where(eq(s.leads.email, email));
    expect(lead?.marketingOptIn).toBe(true);
    expect(lead?.consentAt).toBeInstanceOf(Date);
  });

  it("refuses paid and unpublished products, and quietly ignores the honeypot", async () => {
    const email = `${run}-blocked@example.test`;
    expect(
      (await claim.POST(claimRequest({ productSlug: slugs.paid, name: "X", email }))).status,
    ).toBe(400);
    expect(
      (await claim.POST(claimRequest({ productSlug: slugs.draft, name: "X", email }))).status,
    ).toBe(404);
    expect(
      (
        await claim.POST(
          claimRequest({ productSlug: slugs.free, name: "X", email, website: "spam" }),
        )
      ).status,
    ).toBe(200);
    expect(await entitlementCount(email)).toBe(0);
    expect(await access.grantFreeEntitlement("X", email, ids.paid)).toBe(false);
    expect(await access.grantFreeEntitlement("X", email, ids.draft)).toBe(false);
    expect(await entitlementCount(email)).toBe(0);
  });

  it("rejects bad input and other websites", async () => {
    expect(
      (await claim.POST(claimRequest({ productSlug: slugs.free, name: "", email: "nope" }))).status,
    ).toBe(400);
    const crossSite = new Request("http://localhost:3000/api/free-claim", {
      method: "POST",
      headers: { "content-type": "application/json", origin: "https://evil.example" },
      body: "{}",
    });
    expect((await claim.POST(crossSite)).status).toBe(403);
  });

  it("magic links work once; replayed, altered and expired tokens fail", async () => {
    const link = new URL(await magic.createMagicLink(buyer, "/library/x"));
    const token = link.searchParams.get("token")!;
    expect(link.pathname).toBe("/library/continue");
    expect(
      await magic.consumeMagicToken(`${token.slice(0, -1)}${token.endsWith("A") ? "B" : "A"}`),
    ).toBeNull();
    expect(await magic.consumeMagicToken(token)).toBe(buyer);
    expect(await magic.consumeMagicToken(token)).toBeNull();

    const expired = "expired-token-value-123456";
    await db.insert(s.magicTokens).values({
      email: buyer,
      tokenHash: magic.hashMagicToken(expired),
      expiresAt: new Date(Date.now() - 1000),
    });
    expect(await magic.consumeMagicToken(expired)).toBeNull();

    const [stored] = await db
      .select({ hash: s.magicTokens.tokenHash })
      .from(s.magicTokens)
      .where(eq(s.magicTokens.email, buyer))
      .limit(1);
    expect(stored?.hash).not.toContain(token);
  });

  const meta = { ipHash: null, userAgent: "vitest" };

  it("only an entitled customer can download, and only files of their product", async () => {
    const ok = await access.authorizeDownload(buyer, fileIds.file, meta);
    expect(ok).toMatchObject({ ok: true, kind: "file", fileKey: `test/${run}.pdf` });
    expect(await access.authorizeDownload(buyer, fileIds.link, meta)).toMatchObject({
      ok: true,
      kind: "link",
    });
    expect(await access.authorizeDownload(stranger, fileIds.file, meta)).toEqual({
      ok: false,
      reason: "not_found",
    });
    expect(await access.authorizeDownload(buyer, fileIds.paidFile, meta)).toEqual({
      ok: false,
      reason: "not_found",
    });
    expect(
      await access.authorizeDownload(buyer, "00000000-0000-4000-8000-000000000000", meta),
    ).toEqual({ ok: false, reason: "not_found" });
  });

  it("enforces the download limit even for simultaneous requests", async () => {
    const [ent] = await db
      .select({ id: s.entitlements.id })
      .from(s.entitlements)
      .innerJoin(s.customers, eq(s.customers.id, s.entitlements.customerId))
      .where(eq(s.customers.email, buyer));
    await db
      .update(s.entitlements)
      .set({ downloadCount: 0, downloadLimit: 3 })
      .where(eq(s.entitlements.id, ent!.id));
    await db.delete(s.downloadLogs).where(eq(s.downloadLogs.entitlementId, ent!.id));

    const results = await Promise.all(
      Array.from({ length: 8 }, () => access.authorizeDownload(buyer, fileIds.file, meta)),
    );
    expect(results.filter((r) => r.ok)).toHaveLength(3);
    expect(results.filter((r) => !r.ok && r.reason === "limit_reached")).toHaveLength(5);
    const [logs] = await db
      .select({ n: count() })
      .from(s.downloadLogs)
      .where(eq(s.downloadLogs.entitlementId, ent!.id));
    expect(logs!.n).toBe(3);
  });

  it("a revoked entitlement can't download or appear in the library", async () => {
    const [ent] = await db
      .select({ id: s.entitlements.id })
      .from(s.entitlements)
      .innerJoin(s.customers, eq(s.customers.id, s.entitlements.customerId))
      .where(and(eq(s.customers.email, buyer), eq(s.entitlements.productId, ids.free)));
    await db
      .update(s.entitlements)
      .set({ revokedAt: new Date(), downloadCount: 0, downloadLimit: 10 })
      .where(eq(s.entitlements.id, ent!.id));
    expect(await access.authorizeDownload(buyer, fileIds.file, meta)).toEqual({
      ok: false,
      reason: "not_found",
    });
    expect(await access.listLibrary(buyer)).toHaveLength(0);
    expect(await access.getLibraryProduct(buyer, slugs.free)).toBeNull();
  });
});
