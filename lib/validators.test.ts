import { goalSlugSchema } from "@/lib/validators";

describe("goalSlugSchema", () => {
  it("accepts the four goal slugs", () => {
    for (const slug of ["create", "learn", "work-smarter", "build-make"]) {
      expect(goalSlugSchema.safeParse(slug).success).toBe(true);
    }
  });

  it("rejects anything else", () => {
    for (const slug of ["nope", "", "CREATE", "../admin", "create "]) {
      expect(goalSlugSchema.safeParse(slug).success).toBe(false);
    }
  });
});
