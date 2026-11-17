import { siteUrl } from "@/lib/site-url";

describe("siteUrl", () => {
  it("falls back to localhost when the variable is missing or empty", () => {
    expect(siteUrl(undefined)).toBe("http://localhost:3000");
    expect(siteUrl("   ")).toBe("http://localhost:3000");
  });

  it("returns only the origin, without a trailing slash or path", () => {
    expect(siteUrl("https://example.com/")).toBe("https://example.com");
    expect(siteUrl("https://example.com/some/path?x=1")).toBe("https://example.com");
  });

  it("rejects values that are not http(s) URLs", () => {
    expect(siteUrl("not a url")).toBe("http://localhost:3000");
    expect(siteUrl("javascript:alert(1)")).toBe("http://localhost:3000");
  });

  it("on Vercel, uses the branch address for previews and the domain for production", () => {
    vi.stubEnv("VERCEL_PROJECT_PRODUCTION_URL", "makers.example");
    vi.stubEnv("VERCEL_BRANCH_URL", "makers-git-x.example");
    vi.stubEnv("VERCEL_ENV", "preview");
    expect(siteUrl(undefined)).toBe("https://makers-git-x.example");
    vi.stubEnv("VERCEL_ENV", "production");
    expect(siteUrl(undefined)).toBe("https://makers.example");
    vi.unstubAllEnvs();
  });
});
