import { describe, expect, it } from "vitest";

import { fileFormat, formatBytes, formatMinutes } from "./labels";

describe("catalogue labels", () => {
  it("formats setup time", () => {
    expect(formatMinutes(15)).toBe("15\u00a0min");
    expect(formatMinutes(60)).toBe("1\u00a0hr");
    expect(formatMinutes(90)).toBe("1\u00a0hr 30\u00a0min");
  });

  it("names a file's format without exposing where it is stored", () => {
    const base = { label: "x", mimeType: null, sizeBytes: null };
    expect(fileFormat({ ...base, deliveryType: "file", fileName: "guide.pdf" })).toBe("PDF");
    expect(fileFormat({ ...base, deliveryType: "external_link", fileName: null })).toBe(
      "Online link",
    );
    expect(fileFormat({ ...base, deliveryType: "lesson_resource", fileName: null })).toBe(
      "Online lessons",
    );
  });

  it("formats file sizes", () => {
    expect(formatBytes(2_500_000)).toBe("2.4 MB");
    expect(formatBytes(300)).toBe("1 KB");
  });
});
