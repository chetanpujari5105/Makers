import Link from "next/link";
import { ViewTransition } from "react";
import { ChevronRightIcon, FileIcon, LinkIcon } from "lucide-react";

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

import { isCheckoutOpen } from "@/lib/payments/razorpay";

import { ClaimDialog } from "./claim-dialog";
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
 * Reviews: only owner-approved ones; the section is left out when there are none.
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
  const reviews = product.reviews ?? [];
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
    ...(reviews.length > 0 ? [{ id: "reviews", label: "Reviews" }] : []),
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

          <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:items-center md:gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-14">
            <ViewTransition name={`cover-${product.slug}`} share="morph" default="none">
              <ProductCover
                size="hero"
                title={product.title}
                productType={product.productType}
                goalSlug={product.goalSlug}
                coverImage={product.coverImage}
                className="shadow-raised"
              />
            </ViewTransition>

            <div className="flex flex-col items-start gap-6">
              {product.isSample ? (
                <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                  <Badge variant="warning">Sample content</Badge>
                  To be reviewed by the owner before it goes live.
                </p>
              ) : null}
              <div className="flex flex-col gap-4">
                <dl className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
                  <dt className="sr-only">Type</dt>
                  <dd className="basis-full font-semibold tracking-[0.08em] text-foreground uppercase">
                    {productTypeLabel[product.productType]}
                  </dd>
                  <dt className="sr-only">Level</dt>
                  <dd>{levelLabel[product.level]}</dd>
                  {product.setupTimeMinutes != null ? (
                    <>
                      <dt className="sr-only">Setup time</dt>
                      <dd className="before:mr-2 before:content-['·']">
                        {formatMinutes(product.setupTimeMinutes)} to set up
                      </dd>
                    </>
                  ) : null}
                </dl>
                <h1 id="product-title" className="text-h1">
                  {product.title}
                </h1>
                <p className="text-lead text-foreground/85">{product.tagline}</p>
              </div>

              <div className="w-full border-t border-foreground pt-5">
                <BuyBlock product={product} ctaLabel={ctaLabel} />
              </div>
              <p className="max-w-[65ch] text-base text-muted-foreground">
                {product.shortDescription}
              </p>
            </div>
          </div>
        </Container>
      </section>

      <StickyBuyBar watchId="product-hero">
        <div className="flex items-center gap-3">
          <ProductCover
            size="thumb"
            title={product.title}
            productType={product.productType}
            goalSlug={product.goalSlug}
            coverImage={product.coverImage}
            className="w-14 shrink-0"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{product.title}</p>
            <PriceTag isFree={product.isFree} priceInr={product.priceInr} className="text-lg" />
          </div>
          <ProductCta product={product} ctaLabel={ctaLabel} noteId="buy-note" />
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

          <div className="flex max-w-[65ch] flex-col gap-16">
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
              <ul className="flex flex-col divide-y divide-border border-y border-foreground">
                {product.files.map((file) => (
                  <li
                    key={file.label}
                    className="flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-4"
                  >
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
              className="flex scroll-mt-24 flex-col gap-3 border-t-2 border-primary bg-background p-6 sm:p-8"
            >
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold tracking-[0.08em] text-primary uppercase">
                  First win
                </span>{" "}
                · about {content.firstWin.minutes} minutes
              </p>
              <h2 id="first-win-title" className="text-h3">
                {content.firstWin.title}
              </h2>
              <p>{content.firstWin.description}</p>
            </section>

            <Section id="setup" title="How to set it up">
              <ol className="flex flex-col gap-6">
                {content.steps.map((step, index) => (
                  <li
                    key={step.title}
                    className="grid grid-cols-[3rem_1fr] gap-4 border-t border-border pt-4"
                  >
                    <span
                      aria-hidden="true"
                      className="tabular font-display text-h3 leading-none text-primary italic"
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div className="flex flex-col gap-1">
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

            {reviews.length > 0 ? (
              <Section id="reviews" title="Reviews">
                <p className="text-foreground/85">
                  {(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)} out
                  of 5 from {reviews.length} {reviews.length === 1 ? "review" : "reviews"}. Every
                  review is checked by us before it appears.
                </p>
                <ul className="flex flex-col gap-5">
                  {reviews.map((review) => (
                    <li key={review.id} className="flex flex-col gap-1.5">
                      <p className="font-medium">
                        <span aria-label={`${review.rating} out of 5`}>
                          {"★".repeat(review.rating)}
                          {"☆".repeat(5 - review.rating)}
                        </span>{" "}
                        {review.title}
                      </p>
                      <p className="text-foreground/85">{review.body}</p>
                      <p className="text-sm text-muted-foreground">
                        {review.verifiedPurchase ? "Verified purchase" : "Has this resource"}
                        {review.useCase ? ` · Used it for: ${review.useCase}` : ""}
                      </p>
                    </li>
                  ))}
                </ul>
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
              className="flex flex-col gap-5 border-t border-foreground bg-background p-6 sm:p-8"
            >
              <h2 id="final-cta-title" className="text-h3">
                Ready to start?
              </h2>
              <BuyBlock product={product} ctaLabel={ctaLabel} noteId="buy-note-final" />
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
            <ProductGrid products={related} reveal />
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
  product,
  ctaLabel,
  noteId = "buy-note",
}: {
  id?: string;
  product: Pick<
    ProductDetail,
    "slug" | "title" | "isFree" | "priceInr" | "productType" | "goalSlug" | "coverImage"
  >;
  ctaLabel: string;
  noteId?: string;
}) {
  return (
    <div id={id} className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
        <PriceTag isFree={product.isFree} priceInr={product.priceInr} className="text-[1.75rem]" />
        <ProductCta product={product} ctaLabel={ctaLabel} noteId={noteId} />
      </div>
      <p id={noteId} className="text-sm text-muted-foreground">
        {product.isFree
          ? "Free. We’ll email you a one-time link to your library."
          : isCheckoutOpen()
            ? "Secure payment by Razorpay (test mode — no real money). Your library link arrives by email."
            : "Opens soon — paid checkout is still being set up."}
      </p>
    </div>
  );
}

/* Free and paid products open the buyer-details dialog; paid checkout only when Razorpay test mode is set up. */
function ProductCta({
  product,
  ctaLabel,
  noteId,
}: {
  product: Pick<
    ProductDetail,
    "slug" | "title" | "isFree" | "priceInr" | "productType" | "goalSlug" | "coverImage"
  >;
  ctaLabel: string;
  noteId: string;
}) {
  if (product.isFree || (product.priceInr && isCheckoutOpen())) {
    return (
      <ClaimDialog
        slug={product.slug}
        title={product.title}
        priceInr={product.isFree ? null : product.priceInr}
        ctaLabel={ctaLabel}
        describedBy={noteId}
        cover={
          <ProductCover
            size="thumb"
            title={product.title}
            productType={product.productType}
            goalSlug={product.goalSlug}
            coverImage={product.coverImage}
          />
        }
      />
    );
  }
  return (
    <Button size="lg" disabled aria-describedby={noteId}>
      {ctaLabel}
    </Button>
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
