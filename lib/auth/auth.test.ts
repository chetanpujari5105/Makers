// @vitest-environment node
import { describe, expect, it, vi } from "vitest";

import { renderLinkEmail, senderFrom } from "@/lib/email/send";
import { hashPassword, verifyPassword } from "@/lib/security/crypto";
import { safeNextPath } from "@/lib/validators";

import { signValue, verifyValue } from "./signed-cookie";

vi.stubEnv("SESSION_SECRET", "test-session-secret-that-is-long-enough-123");

describe("signed cookies", () => {
  const exp = Date.now() + 60_000;

  it("accepts an untouched value of the right kind", () => {
    expect(
      verifyValue(signValue({ sub: "a@b.test", kind: "customer", exp }), "customer")?.sub,
    ).toBe("a@b.test");
  });

  it("rejects tampering, the wrong kind and expired values", () => {
    const value = signValue({ sub: "a@b.test", kind: "customer", exp });
    const [, sig] = value.split(".");
    const forged = `${Buffer.from(JSON.stringify({ sub: "owner@b.test", kind: "admin", exp })).toString("base64url")}.${sig}`;
    expect(verifyValue(forged, "admin")).toBeNull();
    expect(verifyValue(value, "admin")).toBeNull();
    expect(verifyValue(value, "customer", exp + 1)).toBeNull();
    expect(verifyValue(`${value}.x`, "customer")).toBeNull();
    expect(verifyValue(undefined, "customer")).toBeNull();
  });
});

describe("admin password hash", () => {
  it("verifies the right password only", async () => {
    const stored = await hashPassword("correct horse battery");
    expect(stored).not.toContain("correct");
    expect(await verifyPassword("correct horse battery", stored)).toBe(true);
    expect(await verifyPassword("wrong horse battery", stored)).toBe(false);
    expect(await verifyPassword("x", undefined)).toBe(false);
    // Pasted with its name from `npm run admin:hash` output.
    expect(await verifyPassword("correct horse battery", `ADMIN_PASSWORD_HASH=${stored}\n`)).toBe(
      true,
    );
    expect(await verifyPassword("wrong horse battery", `ADMIN_PASSWORD_HASH=${stored}`)).toBe(
      false,
    );
  });
});

describe("safe redirect after sign-in", () => {
  it("allows same-site paths only", () => {
    expect(safeNextPath.parse("/library/my-guide")).toBe("/library/my-guide");
    for (const bad of [
      "//evil.example",
      "/\\evil.example",
      "https://evil.example",
      "javascript:alert(1)",
      "/a?b=c",
    ]) {
      expect(safeNextPath.parse(bad)).toBeUndefined();
    }
  });
});

describe("access email", () => {
  it("contains the one-time link and escapes text", async () => {
    const { html, text } = await renderLinkEmail({
      to: "a@b.test",
      subject: "s",
      heading: "<b>Guide</b> is ready",
      intro: "Hi",
      linkLabel: "Open my library",
      link: "https://makers.test/library/continue?token=abc",
    });
    expect(html).toContain("https://makers.test/library/continue?token=abc");
    expect(html).not.toContain("<b>Guide</b>");
    expect(text).toContain("expires in 15 minutes");
  });

  it("sends under the brand name, keeping the configured address", () => {
    expect(senderFrom("MAKERS <onboarding@resend.dev>")).toBe("Fieldkit <onboarding@resend.dev>");
    expect(senderFrom(" hello@mail.example ")).toBe("Fieldkit <hello@mail.example>");
  });
});
