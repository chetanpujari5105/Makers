// @vitest-environment node
import { readFileSync } from "node:fs";

import { afterEach, describe, expect, it, vi } from "vitest";

import { DOWNLOAD_LINK_SECONDS, downloadUrl, isStorageConfigured } from "./files";

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

describe("download links", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("are signed and expire after 60 seconds (made offline with dummy keys)", async () => {
    vi.stubEnv("STORAGE_ENDPOINT", "https://s3.example.test");
    vi.stubEnv("STORAGE_REGION", "auto");
    vi.stubEnv("STORAGE_ACCESS_KEY_ID", "dummy-key-id");
    vi.stubEnv("STORAGE_SECRET_ACCESS_KEY", "dummy-secret");
    vi.stubEnv("STORAGE_BUCKET", "bucket");
    const url = new URL(await downloadUrl("products/a/guide.pdf", "Guide <1>.pdf"));
    expect(DOWNLOAD_LINK_SECONDS).toBe(60);
    expect(url.searchParams.get("X-Amz-Expires")).toBe("60");
    expect(url.searchParams.get("X-Amz-Signature")).toMatch(/^[0-9a-f]{64}$/);
    expect(url.searchParams.get("response-content-disposition")).toBe(
      'attachment; filename="Guide _1_.pdf"',
    );
  });
});
