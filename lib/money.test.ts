import { describe, expect, it } from "vitest";

import { formatInr } from "./money";

describe("formatInr", () => {
  it("shows whole rupees without decimals", () => expect(formatInr(39900)).toBe("₹399"));
  it("keeps paise when present", () => expect(formatInr(39950)).toBe("₹399.50"));
  it("uses Indian digit grouping", () => expect(formatInr(12345600)).toBe("₹1,23,456"));
  it("rejects fractional or negative amounts", () => {
    expect(() => formatInr(10.5)).toThrow();
    expect(() => formatInr(-1)).toThrow();
  });
});
