import { analyticsBeforeSend } from "@/lib/analytics";

const site = "https://makers-alpha.vercel.app";
const view = (path: string) => analyticsBeforeSend({ type: "pageview", url: site + path });

describe("analyticsBeforeSend", () => {
  it("keeps a public product page view and strips query string and fragment", () => {
    expect(view("/products/gta-6-clipping-playbook?utm_source=x&email=a%40b.com#faq")).toEqual({
      type: "pageview",
      url: `${site}/products/gta-6-clipping-playbook`,
    });
  });

  it.each(["/", "/explore?type=guide&page=2", "/free", "/category/work-smarter"])(
    "keeps public catalogue page %s",
    (path) => {
      expect(view(path)?.url).toBe(site + path.split("?")[0]);
    },
  );

  it.each([
    "/admin",
    "/admin/login",
    "/admin/orders/123",
    "/library",
    "/library/continue?token=secret",
    "/library/gta-6-clipping-playbook",
    "/checkout/success?order=abc",
    "/api/payments/verify",
    "/api/download/abc",
    "/api/webhooks/razorpay",
    "/privacy",
    "/pricing",
    "/find",
    "/bundles",
    "/design-preview",
    "/products/gta-6-clipping-playbook/extra",
    "/products/Not_A_Slug",
    "/category/unknown-goal",
    "/explore/",
  ])("drops %s", (path) => {
    expect(view(path)).toBeNull();
  });

  it("drops custom events, even on a public page", () => {
    expect(analyticsBeforeSend({ type: "event", url: `${site}/products/x` })).toBeNull();
  });

  it("drops an unparseable URL", () => {
    expect(analyticsBeforeSend({ type: "pageview", url: "not a url" })).toBeNull();
  });
});
