import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { Container } from "@/components/layout/container";
import { LinkRequestForm } from "@/components/library/link-request-form";
import { ProductCover } from "@/components/product/product-cover";
import { Button } from "@/components/ui/button";
import { getCustomerEmail } from "@/lib/auth/session";
import { listLibrary } from "@/lib/library/access";

export const metadata: Metadata = { title: "My Library", robots: { index: false } };

const notices: Record<string, string> = {
  invalid: "That sign-in link has expired or was already used. Request a new one below.",
  denied: "That file isn’t in your library.",
  limit: "You’ve reached the download limit for this resource. Contact us if you need more.",
  busy: "Too many downloads in a short time. Please wait a little and try again.",
  unavailable: "Downloads aren’t available right now. Please try again later.",
};

export default function LibraryPage({ searchParams }: PageProps<"/library">) {
  return (
    <Container className="flex flex-col gap-10 py-section">
      <h1 className="text-h1">My Library</h1>
      <Suspense fallback={<p className="text-lead text-muted-foreground">Loading your library…</p>}>
        <LibraryContent searchParams={searchParams} />
      </Suspense>
    </Container>
  );
}

async function LibraryContent({ searchParams }: Pick<PageProps<"/library">, "searchParams">) {
  const params = await searchParams;
  const code = [params.link, params.download]
    .flat()
    .find((v) => typeof v === "string" && v in notices);
  const notice = code ? (
    <p role="alert" className="rounded-lg border border-border bg-card p-4 text-base">
      {notices[code]}
    </p>
  ) : null;

  const email = await getCustomerEmail();
  if (!email) {
    return (
      <div className="flex flex-col gap-6">
        {notice}
        <p className="max-w-2xl text-lead text-muted-foreground">
          Everything you’ve claimed or bought lives here. Enter your email and we’ll send you a
          one-time sign-in link. No password needed.
        </p>
        <LinkRequestForm />
      </div>
    );
  }

  const items = await listLibrary(email);
  return (
    <div className="flex flex-col gap-8">
      {notice}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-base text-muted-foreground">Signed in as {email}</p>
        <form action="/api/library/sign-out" method="post">
          <Button type="submit" variant="outline">
            Sign out
          </Button>
        </form>
      </div>
      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-8">
          <p className="text-lead">Your library is empty.</p>
          <p className="mt-2 text-base text-muted-foreground">
            Resources you claim or buy will appear here.{" "}
            <Link href="/free">Browse free resources</Link>.
          </p>
        </div>
      ) : (
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <li key={item.slug} className="flex flex-col gap-3">
              <ProductCover
                size="card"
                title={item.title}
                productType={item.productType}
                goalSlug={item.goalSlug}
                coverImage={item.coverImage}
              />
              <h2 className="text-h3">{item.title}</h2>
              <p className="text-base text-muted-foreground">{item.tagline}</p>
              <Button asChild className="self-start">
                <Link href={`/library/${item.slug}`}>Start here</Link>
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
