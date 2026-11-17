import { afterEach, describe, expect, it, vi } from "vitest";

import { describeTarget, endpointOf } from "./target";

const pooled =
  "postgresql://u:secret@ep-cool-dew-123-pooler.ap-southeast-1.aws.neon.tech/db?sslmode=require";
const direct =
  "postgresql://u:secret@ep-cool-dew-123.ap-southeast-1.aws.neon.tech/db?sslmode=require";

afterEach(() => vi.unstubAllEnvs());

describe("database target check", () => {
  it("reads the Neon endpoint without the password", () => {
    expect(endpointOf(pooled)).toEqual({
      host: "ep-cool-dew-123-pooler.ap-southeast-1.aws.neon.tech",
      endpoint: "ep-cool-dew-123",
    });
  });

  it("refuses pooled and direct URLs from different branches", () => {
    vi.stubEnv("DATABASE_URL", pooled);
    vi.stubEnv("DATABASE_URL_UNPOOLED", direct.replace("cool-dew", "other-one"));
    expect(() => describeTarget()).toThrow(/different Neon branches/);
  });

  it("accepts a matching pair", () => {
    vi.stubEnv("DATABASE_URL", pooled);
    vi.stubEnv("DATABASE_URL_UNPOOLED", direct);
    vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(describeTarget()).toBe("ep-cool-dew-123");
  });
});
