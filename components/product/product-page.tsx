import Link from "next/link";
import { ChevronRightIcon, ClockIcon, FileIcon, LinkIcon, SparklesIcon } from "lucide-react";

import { Container } from "@/components/layout/container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  costLabel,
  fileFormat,
  formatBytes,
  formatMinutes,
  levelLabel,
  licenseLabel,
  productTypeLabel,
} from "@/lib/catalogue/labels";
import type { ProductDetail, ProductSummary } from "@/lib/catalogue/types";

import { DisclosureList } from "./disclosure-list";
import { PriceTag } from "./price-tag";
import { ProductGrid } from "./product-card";
import { ProductCover } from "./product-cover";
import { BulletList, Section } from "./product-section";
import { StickyBuyBar } from "./sticky-buy-bar";
import { TypeDetailsSection } from "./type-details";

/*
 * The "Grow With It" product page (PROJECT_SPEC §4.1, section order kept).
 * Sections with no real content are left out rather than padded.
 * Reviews are omitted until real, moderated reviews exist.
 * Buying opens in Phase 2/3; until then the button is honestly disabled.
 */
export function ProductPage({
  product,
  related,
}: {
  product: ProductDetail;
  related: ProductSummary[];
}) {
  const { content } = product;
  const ctaLabel = product.isFree ? "Download free" : "Get this";
  const preview =
    content.typeDetails.kind === "text_resource" ? content.typeDetails.samplePreview : null;

  const toc = [
    { id: "benefit", label: "What this does for you" },
    { id: "audience", label: "Who it’s for" },
    { id: "included", label: "What you’ll get" },
    { id: "inside", label: insideLabel(product) },
    ...(preview || product.gallery.length > 0 ? [{ id: "preview", label: "Preview" }] : []),
    { id: "first-win", label: "Your first win" },
    { id: "setup", label: "How to set it up" },
    { id: "results", label: "Results to work towards" },
    { id: "needs", label: "What you need" },
    ...(content.problems.length > 0 ? [{ id: "problems", label: "Common problems" }] : []),
    { id: "license", label: "License and support" },
    ...(content.faq.length > 0 ? [{ id: "faq", label: "Questions" }] : []),
  ];

  return (
    <>
      {/* 1. Hero */}
      <section
        id="product-hero"
        aria-labelledby="product-title"
        className="pt-8 pb-14 sm:pt-12 sm:pb-20"
      >
        <Container className="flex flex-col gap-8">
          <nav aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
              <li>
                <Link href="/explore" className="text-muted-foreground hover:text-foreground">
                  Explore
                </Link>
              </li>
              <li className="flex items-center gap-1.5">
                <ChevronRightIcon aria-hidden="true" className="size-3.5" />
                <Link
                  href={`/category/${product.goalSlug}`}
                  className="text-muted-foreground hover:text-foreground"
                >
                  {product.categoryName}
                </Link>
              </li>
            </ol>
          </nav>

          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:items-center lg:gap-14">
            <ProductCover
              size="hero"
              title={product.title}
              productType={product.productType}
              goalSlug={product.goalSlug}
              coverImage={product.coverImage}
            />

            <div className="flex flex-col items-start gap-6">
              {product.isSample ? (
                <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                  <Badge variant="warning">Sample content</Badge>
                  To be reviewed by the owner before it goes live.
                </p>
              ) : null}
              <div className="flex flex-col gap-4">
                <h1 id="product-title" className="text-h1">
                  {product.title}
                </h1>
                <p className="text-lead text-foreground/85">{product.tagline}</p>
              </div>

              <dl className="flex flex-wrap gap-2">
                <dt className="sr-only">Type</dt>
                <dd>
                  <Badge variant="outline">{productTypeLabel[product.productType]}</Badge>
                </dd>
                <dt className="sr-only">Level</dt>
                <dd>
                  <Badge variant="outline">{levelLabel[product.level]}</Badge>
                </dd>
                {product.setupTimeMinutes != null ? (
                  <>
                    <dt className="sr-only">Setup time</dt>
                    <dd>
                      <Badge variant="outline">
                        <ClockIcon aria-hidden="true" />
                        {formatMinutes(product.setupTimeMinutes)} to set up
                      </Badge>
                    </dd>
                  </>
                ) : null}
              </dl>

              <BuyBlock price={product} ctaLabel={ctaLabel} />
              <p className="text-base text-muted-foreground">{product.shortDescription}</p>
            </div>
          </div>
        </Container>
      </section>

      <StickyBuyBar watchId="product-hero">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{product.title}</p>
            <PriceTag isFree={product.isFree} priceInr={product.priceInr} className="text-lg" />
          </div>
          <Button disabled aria-describedby="buy-note">
            {ctaLabel}
          </Button>
        </div>
      </StickyBuyBar>

      {/* 2–14. The guide */}
      <div className="border-t border-border bg-card">
        <Container className="grid gap-12 py-section lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-16">
          <aside className="hidden lg:block">
            <nav aria-label="On this page" className="sticky top-24 flex flex-col gap-3">
              <p className="text-sm font-medium text-muted-foreground">On this page</p>
              <ul className="flex flex-col border-l border-border">
                {toc.map((item) => (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      className="-ml-px block border-l border-transparent py-1.5 pl-4 text-sm text-muted-foreground no-underline hover:border-foreground hover:text-foreground"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>

          <div className="flex max-w-prose flex-col gap-16">
            <Section id="benefit" title="What this does for you">
              {content.benefit.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </Section>

            <Section id="audience" title="Who it’s for">
              <BulletList items={content.audience} />
              {content.notFor.length > 0 ? (
                <p className="text-muted-foreground">
                  <span className="font-medium text-foreground">Probably not for you if: </span>
                  {content.notFor.join("; ")}.
                </p>
              ) : null}
            </Section>

            <Section id="included" title="What you’ll get">
              <ul className="flex flex-col divide-y divide-border rounded-xl border border-border">
                {product.files.map((file) => (
                  <li key={file.label} className="flex items-center gap-4 px-5 py-4">
                    {file.fileName ? (
                      <FileIcon aria-hidden="true" className="size-5 shrink-0 text-primary" />
                    ) : (
                      <LinkIcon aria-hidden="true" className="size-5 shrink-0 text-primary" />
                    )}
                    <span className="flex-1 font-medium">{file.label}</span>
                    <span className="tabular text-sm text-muted-foreground">
                      {fileFormat(file)}
                      {file.sizeBytes ? ` · ${formatBytes(file.sizeBytes)}` : ""}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="text-base text-muted-foreground">
                Everything is delivered to your library, with this guide alongside it.
              </p>
            </Section>

            <TypeDetailsSection details={content.typeDetails} />

            {preview ? (
              <Section id="preview" title="Preview">
                <figure className="flex flex-col gap-3">
                  <blockquote className="rounded-xl bg-muted p-6 text-base whitespace-pre-line">
                    {preview}
                  </blockquote>
                  <figcaption className="text-sm text-muted-foreground">
                    A sample from the pack.
                  </figcaption>
                </figure>
              </Section>
            ) : null}

            <section
              id="first-win"
              aria-labelledby="first-win-title"
              className="flex scroll-mt-24 flex-col gap-3 rounded-xl bg-primary-soft p-6 sm:p-8"
            >
              <p className="flex items-center gap-2 text-sm font-medium text-primary-soft-foreground">
                <SparklesIcon aria-hidden="true" className="size-4" />
                About {content.firstWin.minutes} minutes
              </p>
              <h2 id="first-win-title" className="text-h3">
                Your first win: {lowerFirst(content.firstWin.title)}
              </h2>
              <p>{content.firstWin.description}</p>
            </section>

            <Section id="setup" title="How to set it up">
              <ol className="flex flex-col gap-6">
                {content.steps.map((step, index) => (
                  <li key={step.title} className="grid grid-cols-[2.5rem_1fr] gap-4">
                    <span
                      aria-hidden="true"
                      className="tabular flex size-10 items-center justify-center rounded-full border border-primary/30 font-display text-lg text-primary"
                    >
                      {index + 1}
                    </span>
                    <div className="flex flex-col gap-1 pt-1.5">
                      <h3 className="font-sans text-body font-semibold">
                        <span className="sr-only">Step {index + 1}: </span>
                        {step.title}
                      </h3>
                      <p className="text-foreground/85">{step.body}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </Section>

            <Section id="results" title="Results you can work towards">
              <BulletList items={content.results} />
              <p className="text-base text-muted-foreground">
                These are examples of what you can do with it — not promises. Your results depend on
                your own time and situation.
              </p>
            </Section>

            <Section id="needs" title="What you need">
              <ul className="flex flex-col divide-y divide-border border-y border-border">
                {product.requirements.map((req) => (
                  <li
                    key={req.name}
                    className="flex flex-col gap-1 py-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6"
                  >
                    <div>
                      <p className="font-medium">{req.name}</p>
                      {req.note ? (
                        <p className="text-base text-muted-foreground">{req.note}</p>
                      ) : null}
                    </div>
                    <Badge
                      variant={req.cost === "free" ? "success" : "default"}
                      className="sm:mt-0.5"
                    >
                      {costLabel[req.cost]}
                    </Badge>
                  </li>
                ))}
              </ul>
            </Section>

            {content.problems.length > 0 ? (
              <Section id="problems" title="Common problems and fixes">
                <DisclosureList
                  items={content.problems.map((p) => ({ title: p.problem, body: p.fix }))}
                />
              </Section>
            ) : null}

            <Section id="license" title="License and support">
              <div className="flex flex-col gap-2">
                <p className="font-medium">{licenseLabel[product.licenseType]}</p>
                {product.licenseText ? (
                  <p className="text-foreground/85">{product.licenseText}</p>
                ) : null}
              </div>
              <p className="text-foreground/85">
                {content.support ?? "Stuck or something not working?"}{" "}
                <Link href="/help">Visit the help centre</Link>.
              </p>
            </Section>

            {content.faq.length > 0 ? (
              <Section id="faq" title="Questions">
                <DisclosureList
                  items={content.faq.map((f) => ({ title: f.question, body: f.answer }))}
                />
              </Section>
            ) : null}

            <section
              aria-labelledby="final-cta-title"
              className="flex flex-col gap-5 rounded-xl bg-background p-6 sm:p-8"
            >
              <h2 id="final-cta-title" className="text-h3">
                Ready to start?
              </h2>
              <BuyBlock price={product} ctaLabel={ctaLabel} noteId="buy-note-final" />
            </section>
          </div>
        </Container>
      </div>

      {related.length > 0 ? (
        <section aria-labelledby="next-steps-title" className="py-section">
          <Container className="flex flex-col gap-10">
            <h2 id="next-steps-title" className="text-h2">
              Where to go next
            </h2>
            <ProductGrid products={related} />
          </Container>
        </section>
      ) : null}

      {/* Space so the mobile buy bar never covers the footer's last line */}
      <div aria-hidden="true" className="h-20 lg:hidden" />
    </>
  );
}

function BuyBlock({
  id,
  price,
  ctaLabel,
  noteId = "buy-note",
}: {
  id?: string;
  price: Pick<ProductDetail, "isFree" | "priceInr">;
  ctaLabel: string;
  noteId?: string;
}) {
  return (
    <div id={id} className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
        <PriceTag isFree={price.isFree} priceInr={price.priceInr} className="text-[1.75rem]" />
        <Button size="lg" disabled aria-describedby={noteId}>
          {ctaLabel}
        </Button>
      </div>
      <p id={noteId} className="text-sm text-muted-foreground">
        Opens soon — buying and downloads are still being set up.
      </p>
    </div>
  );
}

function insideLabel(product: ProductDetail) {
  switch (product.content.typeDetails.kind) {
    case "notion":
      return "Inside the workspace";
    case "text_resource":
      return "Where to use it";
    case "course":
      return "What you’ll learn";
    case "design_kit":
      return "What’s in the kit";
    case "model_3d":
      return "Files and printing";
    case "bundle":
      return "What the bundle does";
    default:
      return "What’s inside";
  }
}

function lowerFirst(text: string) {
  return text.charAt(0).toLowerCase() + text.slice(1);
}
