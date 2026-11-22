import { Analytics } from "@vercel/analytics/next";
import type { Metadata, Viewport } from "next";
import { Newsreader, Schibsted_Grotesk } from "next/font/google";

import { brand } from "@/lib/brand";
import { siteUrl } from "@/lib/site-url";

import "./globals.css";

/*
 * Direction A type (both SIL Open Font License, docs/DESIGN.md):
 * Schibsted Grotesk (variable) for reading text, Newsreader 500 + italic for
 * headlines. One static weight keeps the font download small.
 */
const body = Schibsted_Grotesk({
  variable: "--font-body-face",
  subsets: ["latin"],
  display: "swap",
});

const display = Newsreader({
  variable: "--font-display-face",
  subsets: ["latin"],
  weight: ["500"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: `${brand.name} — ${brand.tagline}`,
    template: `%s · ${brand.name}`,
  },
  description: brand.description,
  applicationName: brand.name,
  openGraph: { type: "website", siteName: brand.name },
};

export const viewport: Viewport = {
  // Mobile browser bar colour. Keep equal to --palette-paper in app/globals.css.
  themeColor: "#f7f3ec",
  colorScheme: "light",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${body.variable} ${display.variable}`}>
      <body className="flex min-h-dvh flex-col">
        <noscript>
          {/* Scroll entrances start hidden; without JavaScript, show them at once. */}
          <style>{"[data-reveal]{opacity:1!important;transform:none!important}"}</style>
        </noscript>
        <a
          href="#main"
          className="sr-only z-[60] rounded-full bg-primary px-5 py-3 text-primary-foreground focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
        >
          Skip to content
        </a>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
