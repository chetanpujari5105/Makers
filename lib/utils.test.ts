import { cn } from "@/lib/utils";

describe("cn", () => {
  it("keeps a custom font-size token next to a text colour", () => {
    // Regression: the old helper deleted text-h3 here, shrinking every
    // Dialog and Card title to body size.
    expect(cn("font-display text-h3 text-foreground")).toBe("font-display text-h3 text-foreground");
  });

  it("lets a later font-size token override an earlier one", () => {
    expect(cn("text-base text-muted-foreground", "text-lead")).toBe(
      "text-muted-foreground text-lead",
    );
  });

  it("treats custom spacing and width tokens as conflicts", () => {
    expect(cn("px-gutter", "px-4")).toBe("px-4");
    expect(cn("max-w-page", "max-w-prose")).toBe("max-w-prose");
    expect(cn("shadow-card", "shadow-raised")).toBe("shadow-raised");
  });

  it("ignores falsy values", () => {
    expect(cn("a", false, null, undefined, "b")).toBe("a b");
  });
});
