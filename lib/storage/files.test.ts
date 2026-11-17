// @vitest-environment node
import { readFileSync } from "node:fs";

import { afterEach, describe, expect, it, vi } from "vitest";

import { isStorageConfigured } from "./files";

const names = [
  "STORAGE_ENDPOINT",
  "STORAGE_ACCESS_KEY_ID",
  "STORAGE_SECRET_ACCESS_KEY",
  "STORAGE_BUCKET",
];

describe("storage settings", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("is configured only when every STORAGE_* setting is present", () => {
    for (const name of names) vi.stubEnv(name, "x");
    expect(isStorageConfigured()).toBe(true);
    vi.stubEnv("STORAGE_ACCESS_KEY_ID", "");
    expect(isStorageConfigured()).toBe(false);
  });

  it("uses only names documented in .env.example", () => {
    const example = readFileSync(".env.example", "utf8");
    for (const name of [...names, "STORAGE_REGION"])
      expect(example).toMatch(new RegExp(`^${name}=`, "m"));
  });
});
