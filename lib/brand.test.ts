import {
  brand,
  footerNav,
  goals,
  legal,
  libraryLink,
  mobileSecondaryNav,
  primaryNav,
} from "@/lib/brand";

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

  it("leaves every legal and grievance detail for the owner to fill in", () => {
    const { grievanceOfficer, ...rest } = legal;
    for (const value of [...Object.values(rest), ...Object.values(grievanceOfficer)]) {
      expect(value).toBeNull();
    }
  });

  it("links every policy and trust page from the footer", () => {
    const hrefs = footerNav.flatMap((group) => group.links.map((link) => link.href));
    for (const page of ["/about", "/contact", "/pricing", "/terms", "/privacy", "/refund-policy"]) {
      expect(hrefs).toContain(page);
    }
    expect(hrefs).toContain("/contact#grievance");
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
