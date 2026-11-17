import { when } from "./format";

it("shows owner dates in India time", () => {
  expect(when(new Date("2026-11-17T18:29:59Z"))).toBe("2026-11-17 23:59");
  expect(when(null)).toBe("—");
});
