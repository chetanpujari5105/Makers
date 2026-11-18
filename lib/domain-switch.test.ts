// @vitest-environment node
/*
 * Domain switch proof: every absolute URL the site builds comes from the one
 * NEXT_PUBLIC_SITE_URL setting (docs/DOMAIN_SWITCH.md).
 */
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/catalogue/catalogue", () => ({
  getPublishedSlugs: async () => [
    { slug: "real-kit", isSample: false, updatedAt: new Date("2026-11-18") },
    { slug: "sample-kit", isSample: true, updatedAt: new Date("2026-11-18") },
  ],
}));
vi.mock("@/db", () => ({
  getDb: () => ({ insert: () => ({ values: async () => undefined }) }),
}));

const FAKE = "https://fieldkitt.example";

describe("absolute URLs follow NEXT_PUBLIC_SITE_URL", () => {
  beforeAll(() => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", `${FAKE}/`);
    vi.stubEnv("MAGIC_LINK_SECRET", "test-magic-link-secret-that-is-long-enough");
  });
  afterAll(() => vi.unstubAllEnvs());

  it("sitemap, robots, JSON-LD and the emailed sign-in link all use the setting", async () => {
    const { default: sitemap } = await import("@/app/sitemap");
    const { default: robots } = await import("@/app/robots");
    const { productJsonLd } = await import("@/lib/catalogue/json-ld");
    const { createMagicLink } = await import("@/lib/auth/magic-link");

    const urls = [
      ...(await sitemap()).map((entry) => entry.url),
      robots().sitemap as string,
      productJsonLd({ slug: "real-kit", isFree: true, productType: "pdf" } as never).url,
      await createMagicLink("a@example.test"),
    ];
    for (const url of urls) expect(new URL(url).origin).toBe(FAKE);
    expect(urls.some((url) => url.includes("sample-kit"))).toBe(false);
  });
});
