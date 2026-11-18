import {
  Atkinson_Hyperlegible_Next,
  Bricolage_Grotesque,
  Hanken_Grotesk,
  Newsreader,
  Schibsted_Grotesk,
} from "next/font/google";

/*
 * Free Google Fonts (SIL Open Font License) for the three direction mockups.
 * Loaded only on /design-preview/directions/*, so the live store's fonts and
 * bundle are unchanged. Weights are limited to keep each direction inside the
 * 120 KB first-screen font budget (docs/UI_AUDIT.md, P3).
 */
export const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  weight: ["500"],
  style: ["normal", "italic"],
  display: "swap",
});

export const schibsted = Schibsted_Grotesk({
  variable: "--font-schibsted",
  subsets: ["latin"],
  display: "swap",
});

export const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  display: "swap",
});

export const atkinson = Atkinson_Hyperlegible_Next({
  variable: "--font-atkinson",
  subsets: ["latin"],
  display: "swap",
});

export const hanken = Hanken_Grotesk({
  variable: "--font-hanken",
  subsets: ["latin"],
  display: "swap",
});
