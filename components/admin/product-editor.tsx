import { saveProductAction } from "@/app/(site)/admin/actions";
import { goals } from "@/lib/brand";
import { detailFields } from "@/lib/admin/product-form";
import { detailsKindFor, type ProductTypeKey } from "@/lib/catalogue/content-schema";
import { levelLabel, licenseLabel, productTypeLabel } from "@/lib/catalogue/labels";

import { ActionForm } from "./action-form";
import { CheckField, SelectField, TextArea, TextField } from "./fields";

const options = (labels: Record<string, string>) =>
  Object.entries(labels).map(([value, label]) => ({ value, label }));

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="flex flex-col gap-5 rounded-xl border border-border bg-card p-5 sm:p-6">
      <legend className="px-2 text-h3">{title}</legend>
      {children}
    </fieldset>
  );
}

/*
 * The owner's product form. Lists are one item per line; pairs are
 * "first | second". A draft can be saved half-finished; publishing checks
 * that every required section is complete.
 */
export function ProductEditor({
  productId,
  values,
  isFree,
  featured,
  slugLocked,
}: {
  productId?: string;
  values: Record<string, string>;
  isFree: boolean;
  featured: boolean;
  slugLocked: boolean;
}) {
  const type = (values.productType ?? "pdf") as ProductTypeKey;
  const kind = detailsKindFor[type];
  return (
    <ActionForm
      action={saveProductAction}
      submitLabel={productId ? "Save changes" : "Create draft"}
    >
      {productId ? <input type="hidden" name="id" value={productId} /> : null}

      <Group title="Basics">
        <TextField
          name="title"
          label="Title"
          defaultValue={values.title}
          required
          maxLength={200}
        />
        <TextField
          name="slug"
          label="Web address"
          hint={
            slugLocked
              ? "Locked: this product has been published or bought, and links point here."
              : "Lowercase words joined by hyphens, e.g. first-salary-workbook → /products/first-salary-workbook"
          }
          defaultValue={values.slug}
          required
          maxLength={120}
        />
        <TextField
          name="tagline"
          label="One-sentence tagline"
          defaultValue={values.tagline}
          maxLength={300}
        />
        <TextArea
          name="shortDescription"
          label="Short description"
          defaultValue={values.shortDescription}
          rows={3}
        />
        <div className="grid gap-5 sm:grid-cols-3">
          <SelectField
            name="productType"
            label="Product type"
            hint="Changing it? Save first; the type-specific fields then switch."
            defaultValue={type}
            options={options(productTypeLabel)}
          />
          <SelectField
            name="goal"
            label="Goal"
            defaultValue={values.goal}
            options={goals.map((g) => ({ value: g.slug, label: g.label }))}
          />
          <SelectField
            name="level"
            label="Level"
            defaultValue={values.level}
            options={options(levelLabel)}
          />
        </div>
      </Group>

      <Group title="Price and setup">
        <CheckField name="isFree" label="This product is free" defaultChecked={isFree} />
        <TextField
          name="priceRupees"
          label="Price in rupees (paid products)"
          hint="Whole rupees, e.g. 499. Ignored when the product is free."
          defaultValue={values.priceRupees}
          type="number"
          min={1}
        />
        <TextField
          name="setupTimeMinutes"
          label="Setup time in minutes"
          defaultValue={values.setupTimeMinutes}
          type="number"
          min={0}
        />
        <CheckField name="featured" label="Feature on the home page" defaultChecked={featured} />
      </Group>

      <Group title="Images and video">
        <TextField
          name="coverImage"
          label="Cover image link (optional)"
          hint="https://… or a path on this site such as /covers/my-product.png"
          defaultValue={values.coverImage}
        />
        <TextArea
          name="gallery"
          label="Gallery images (optional)"
          hint="One per line: link | description | width | height"
          defaultValue={values.gallery}
          rows={3}
        />
        <TextField
          name="previewVideoUrl"
          label="Preview video link (optional)"
          defaultValue={values.previewVideoUrl}
        />
      </Group>

      <Group title="Product page sections">
        <TextArea
          name="benefit"
          label="What this does for you"
          hint="One point per line"
          defaultValue={values.benefit}
        />
        <TextArea
          name="audience"
          label="Who it’s for"
          hint="One per line"
          defaultValue={values.audience}
        />
        <TextArea
          name="notFor"
          label="Who it’s not for (optional)"
          hint="One per line"
          defaultValue={values.notFor}
          rows={2}
        />
        <div className="grid gap-5 sm:grid-cols-[2fr_1fr]">
          <TextField
            name="firstWinTitle"
            label="First win — title"
            defaultValue={values.firstWinTitle}
          />
          <TextField
            name="firstWinMinutes"
            label="First win — minutes"
            defaultValue={values.firstWinMinutes}
            type="number"
            min={1}
          />
        </div>
        <TextArea
          name="firstWinDescription"
          label="First win — description"
          defaultValue={values.firstWinDescription}
          rows={2}
        />
        <TextArea
          name="steps"
          label="Setup steps (3 to 5)"
          hint="One per line: Step title | what to do"
          defaultValue={values.steps}
          rows={5}
        />
        <TextArea
          name="results"
          label="Results to work towards"
          hint="One per line"
          defaultValue={values.results}
        />
        <TextArea
          name="requirements"
          label="What you need"
          hint="One per line: Tool name | free, paid or free or paid | note (optional)"
          defaultValue={values.requirements}
          rows={3}
        />
        <TextArea
          name="problems"
          label="Common problems (optional)"
          hint="One per line: Problem | how to fix it"
          defaultValue={values.problems}
          rows={3}
        />
        <TextArea
          name="faq"
          label="Questions (optional)"
          hint="One per line: Question | answer"
          defaultValue={values.faq}
          rows={3}
        />
        <TextField name="support" label="Help note (optional)" defaultValue={values.support} />
      </Group>

      <Group title={`Details for ${productTypeLabel[type]}`}>
        {detailFields[kind].map((field) =>
          field.type === "text" || field.type === "number" ? (
            <TextField
              key={field.key}
              name={`td.${field.key}`}
              label={field.label}
              hint={field.hint}
              defaultValue={values[`td.${field.key}`]}
              type={field.type === "number" ? "number" : "text"}
            />
          ) : (
            <TextArea
              key={field.key}
              name={`td.${field.key}`}
              label={field.label}
              hint={field.hint ?? (field.type === "list" ? "One per line" : undefined)}
              defaultValue={values[`td.${field.key}`]}
              rows={field.type === "long" ? 4 : 3}
            />
          ),
        )}
      </Group>

      <Group title="License and search">
        <SelectField
          name="licenseType"
          label="License"
          defaultValue={values.licenseType}
          options={options(licenseLabel)}
        />
        <TextArea
          name="licenseText"
          label="What the license allows"
          defaultValue={values.licenseText}
          rows={3}
        />
        <TextField
          name="version"
          label="Version"
          defaultValue={values.version || "1.0"}
          required
          maxLength={40}
        />
        <TextField name="seoTitle" label="Search title (optional)" defaultValue={values.seoTitle} />
        <TextArea
          name="seoDescription"
          label="Search description (optional)"
          defaultValue={values.seoDescription}
          rows={2}
        />
      </Group>

      <details className="rounded-xl border border-border bg-card p-5">
        <summary className="cursor-pointer text-base font-medium">
          Advanced: page content as JSON
        </summary>
        <p className="mt-3 text-base text-muted-foreground">
          For anything the fields above don’t cover. If you change this box, it replaces the page
          sections and type details above when you save. Leave it alone otherwise.
        </p>
        <input type="hidden" name="advancedOriginal" value={values.advancedJson ?? ""} />
        <TextArea
          name="advancedJson"
          label="Content JSON"
          defaultValue={values.advancedJson}
          rows={14}
          mono
        />
      </details>
    </ActionForm>
  );
}
