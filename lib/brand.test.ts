import { brand, footerNav, goals, libraryLink, mobileSecondaryNav, primaryNav } from "@/lib/brand";

describe("brand configuration", () => {
  it("lists the four customer goals from the spec, in order", () => {
    expect(goals.map((goal) => goal.goalGroup)).toEqual([
      "create",
      "learn",
      "work_smarter",
      "build_make",
    ]);
  });

  it("does not invent contact details before the owner provides them", () => {
    expect(brand.supportEmail).toBeNull();
    expect(brand.socialLinks).toHaveLength(0);
  });

  it("uses only internal links in the navigation", () => {
    const hrefs = [
      ...primaryNav,
      ...mobileSecondaryNav,
      libraryLink,
      ...footerNav.flatMap((group) => group.links),
    ].map((link) => link.href);
    for (const href of hrefs) {
      expect(href.startsWith("/")).toBe(true);
    }
  });
});
