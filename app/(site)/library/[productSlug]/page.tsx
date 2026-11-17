import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { DownloadIcon, ExternalLinkIcon } from "lucide-react";

import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { getCustomerEmail } from "@/lib/auth/session";
import { licenseLabel } from "@/lib/catalogue/labels";
import { getLibraryProduct } from "@/lib/library/access";
import { productSlugSchema } from "@/lib/validators";

export const metadata: Metadata = { title: "Start here", robots: { index: false } };

/* Private Start Here page: setup steps and protected downloads for an entitled customer. */
export default function StartHerePage({ params }: PageProps<"/library/[productSlug]">) {
  return (
    <Container size="prose" className="flex flex-col gap-10 py-section">
      <Suspense fallback={<p className="text-lead text-muted-foreground">Loading…</p>}>
        <StartHere params={params} />
      </Suspense>
    </Container>
  );
}

function Missing({ signedIn }: { signedIn: boolean }) {
  return (
    <div className="flex flex-col items-start gap-6">
      <h1 className="text-h1">{signedIn ? "This isn’t in your library" : "Please sign in"}</h1>
      <p className="text-lead text-muted-foreground">
        {signedIn
          ? "We couldn’t find this resource among the ones you’ve claimed or bought."
          : "Sign in with a one-time email link to open your resources."}
      </p>
      <Button asChild>
        <Link href="/library">Go to My Library</Link>
      </Button>
    </div>
  );
}

async function StartHere({ params }: Pick<PageProps<"/library/[productSlug]">, "params">) {
  const { productSlug } = await params;
  const email = await getCustomerEmail();
  if (!email) return <Missing signedIn={false} />;
  const slug = productSlugSchema.safeParse(productSlug);
  const product = slug.success ? await getLibraryProduct(email, slug.data) : null;
  if (!product) return <Missing signedIn />;

  const { content } = product;
  const remaining = Math.max(product.downloadLimit - product.downloadCount, 0);

  return (
    <>
      <header className="flex flex-col gap-3">
        <Link href="/library" className="text-base">
          ← My Library
        </Link>
        <h1 className="text-h1">{product.title}</h1>
        <p className="text-lead text-muted-foreground">{product.tagline}</p>
      </header>

      <section aria-labelledby="files-title" className="flex flex-col gap-4">
        <h2 id="files-title" className="text-h2">
          Your files
        </h2>
        {product.files.length === 0 ? (
          <p className="text-base text-muted-foreground">
            The files for this resource are being prepared. Check back soon.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {product.files.map((file) => (
              <li
                key={file.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card p-4"
              >
                <span className="text-base font-medium">{file.label}</span>
                <form action={`/api/download/${file.id}`} method="post">
                  <Button type="submit" variant="outline">
                    {file.deliveryType === "external_link" ? (
                      <>
                        <ExternalLinkIcon aria-hidden="true" /> Open
                      </>
                    ) : (
                      <>
                        <DownloadIcon aria-hidden="true" /> Download
                      </>
                    )}
                  </Button>
                </form>
              </li>
            ))}
          </ul>
        )}
        <p className="text-sm text-muted-foreground">
          Downloads left: {remaining} of {product.downloadLimit}. Each download link works for one
          minute.
        </p>
      </section>

      {content ? (
        <>
          <section aria-labelledby="win-title" className="flex flex-col gap-3">
            <h2 id="win-title" className="text-h2">
              Your first win (about {content.firstWin.minutes} minutes)
            </h2>
            <h3 className="text-h3">{content.firstWin.title}</h3>
            <p className="text-base">{content.firstWin.description}</p>
          </section>

          <section aria-labelledby="steps-title" className="flex flex-col gap-4">
            <h2 id="steps-title" className="text-h2">
              Set it up
            </h2>
            <ol className="flex list-decimal flex-col gap-4 pl-6">
              {content.steps.map((step) => (
                <li key={step.title}>
                  <p className="text-base font-medium">{step.title}</p>
                  <p className="text-base text-muted-foreground">{step.body}</p>
                </li>
              ))}
            </ol>
          </section>

          {content.problems.length > 0 ? (
            <section aria-labelledby="problems-title" className="flex flex-col gap-4">
              <h2 id="problems-title" className="text-h2">
                If something goes wrong
              </h2>
              <dl className="flex flex-col gap-4">
                {content.problems.map((item) => (
                  <div key={item.problem}>
                    <dt className="text-base font-medium">{item.problem}</dt>
                    <dd className="text-base text-muted-foreground">{item.fix}</dd>
                  </div>
                ))}
              </dl>
            </section>
          ) : null}
        </>
      ) : null}

      <section aria-labelledby="license-title" className="flex flex-col gap-3">
        <h2 id="license-title" className="text-h2">
          License and help
        </h2>
        <p className="text-base">
          {licenseLabel[product.licenseType]}. {product.licenseText ?? ""}{" "}
          <Link href="/license">Read the full license</Link>.
        </p>
        <p className="text-base">
          {content?.support ?? "Stuck? "}
          <Link href="/help">Get help</Link>.
        </p>
      </section>
    </>
  );
}
