import { describe, expect, it } from "vitest";

import { publishProblems } from "./publish-check";

const empty = {
  title: "",
  tagline: "",
  shortDescription: "",
  productType: "pdf" as const,
  isFree: false,
  priceInr: null,
  setupTimeMinutes: null,
  licenseText: null,
  requirements: [],
  contentJson: {},
  deliveryCount: 0,
};

describe("publishProblems", () => {
  it("lists every missing required field in plain English", () => {
    const problems = publishProblems(empty);
    expect(problems).toContain("Set a price in rupees, or mark the product as free.");
    expect(problems).toContain("Add at least one file or link for buyers to receive.");
    expect(problems.length).toBeGreaterThanOrEqual(7);
  });

  it("does not ask a free product for a price", () => {
    expect(publishProblems({ ...empty, isFree: true })).not.toContain(
      "Set a price in rupees, or mark the product as free.",
    );
  });
});
