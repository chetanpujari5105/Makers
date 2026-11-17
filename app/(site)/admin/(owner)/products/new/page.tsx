import { Suspense } from "react";

import { ProductEditor } from "@/components/admin/product-editor";
import { requireAdminPage } from "@/lib/admin/guard";
import { productFormDefaults } from "@/lib/admin/product-form";

const blank = {
  title: "",
  slug: "",
  tagline: "",
  shortDescription: "",
  productType: "pdf" as const,
  goal: "learn",
  level: "beginner",
  isFree: false,
  priceInr: null,
  setupTimeMinutes: null,
  coverImage: null,
  previewVideoUrl: null,
  licenseType: "personal",
  licenseText: null,
  version: "1.0",
  featured: false,
  seoTitle: null,
  seoDescription: null,
  requirements: [],
  gallery: [],
  contentJson: {},
};

export default function NewProductPage() {
  return (
    <Suspense fallback={<p className="text-lead text-muted-foreground">Loading…</p>}>
      <NewProduct />
    </Suspense>
  );
}

async function NewProduct() {
  await requireAdminPage();
  return (
    <section className="flex flex-col gap-6">
      <h1 className="text-h1">New product</h1>
      <p className="text-lead text-muted-foreground">
        It starts as a hidden draft. Fill in what you have; you can publish once every required
        section and at least one file or link is in place.
      </p>
      <ProductEditor
        values={productFormDefaults(blank)}
        isFree={false}
        featured={false}
        slugLocked={false}
      />
    </section>
  );
}
