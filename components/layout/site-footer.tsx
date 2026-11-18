import Link from "next/link";

import { Container } from "@/components/layout/container";
import { brand, footerNav } from "@/lib/brand";

/*
 * Site footer. Support email and social links render ONLY when real values
 * are configured in lib/brand.ts (spec §3.1 item 12).
 */
function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-card">
      <Container className="grid gap-12 py-14 md:grid-cols-[1.4fr_repeat(3,1fr)] md:gap-8">
        <div className="flex max-w-xs flex-col gap-3">
          {/* The logo file, not the inline header copy: below the fold and cached, so pages stay small. */}
          <Link href="/" translate="no" className="inline-flex min-h-11 items-center">
            {/* eslint-disable-next-line @next/next/no-img-element -- a static SVG; next/image would add ~14 KB of JavaScript */}
            <img
              src="/brand/fieldkit-header.svg"
              alt={`${brand.name}, go to the home page`}
              width={136}
              height={32}
              loading="lazy"
              decoding="async"
            />
          </Link>
          <p className="text-base text-muted-foreground">{brand.description}</p>
          {brand.supportEmail ? (
            <a href={`mailto:${brand.supportEmail}`} className="text-base text-foreground">
              {brand.supportEmail}
            </a>
          ) : null}
        </div>

        {footerNav.map((group) => (
          <nav key={group.heading} aria-label={group.heading}>
            <h2 className="font-sans text-sm font-semibold text-foreground">{group.heading}</h2>
            <ul className="mt-3 flex flex-col">
              {group.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="inline-flex min-h-11 items-center text-base text-muted-foreground no-underline pointer-fine:hover:text-foreground pointer-fine:hover:underline"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </Container>

      <Container className="flex flex-col gap-2 border-t border-border py-6 text-sm text-muted-foreground sm:flex-row sm:justify-between">
        <p>
          © {brand.name} — {brand.tagline}. Some interface pieces from{" "}
          <a href="https://rareui.com" rel="noopener">
            Rare UI
          </a>
          .
        </p>
        {brand.socialLinks.length > 0 ? (
          <ul className="flex gap-4">
            {brand.socialLinks.map((link) => (
              <li key={link.href}>
                <a href={link.href} className="text-muted-foreground">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        ) : null}
      </Container>
    </footer>
  );
}

export { SiteFooter };
