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

  it("uses the owner's own contact and legal details (given 2026-11-18), no invented ones", () => {
    expect(brand.supportEmail).toBe("chetanpujari92@gmail.com");
    expect(brand.socialLinks).toHaveLength(0);
    expect(legal.legalName).toBe("Chetan Kantu Pujari");
    expect(legal.grievanceOfficer).toEqual({
      name: "Chetan Kantu Pujari",
      designation: "Owner",
      email: "chetanpujari92@gmail.com",
      phone: "+91 98341 06594",
    });
    // Not registered under GST and no UDYAM given: these stay empty, never guessed.
    expect(legal.gstin).toBeNull();
    expect(legal.udyam).toBeNull();
    // Owner and lawyer reviewed every policy page (owner, 2026-11-19).
    expect(legal.policiesReviewedOn).toBe("19 November 2026");
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
