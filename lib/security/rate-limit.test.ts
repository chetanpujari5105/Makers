// @vitest-environment node
import { describe, expect, it, vi } from "vitest";

vi.stubEnv("SESSION_SECRET", "test-session-secret-that-is-long-enough-123");

const { limitKey, rateLimit } = await import("./rate-limit");

describe("rate limit keys", () => {
  it("never contain the raw IP or email", () => {
    for (const raw of ["203.0.113.7", "buyer@example.test"]) {
      const key = limitKey(raw);
      expect(key).not.toContain(raw);
      expect(key).toHaveLength(32);
      expect(limitKey(raw)).toBe(key); // stable, so limits still add up
    }
  });

  it("still blocks after the allowed number of tries (local counter)", async () => {
    const results = [];
    for (let i = 0; i < 4; i++) results.push(await rateLimit("magicLink", "198.51.100.9"));
    expect(results).toEqual([true, true, true, false]);
  });
});
