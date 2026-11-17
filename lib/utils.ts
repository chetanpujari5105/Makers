import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/*
 * Merges Tailwind class names, letting later classes override earlier ones.
 *
 * tailwind-merge must be told about the custom tokens in app/globals.css,
 * otherwise it misreads them — e.g. it would treat `text-h3` (a font size)
 * as a text COLOUR and delete it when `text-foreground` follows.
 * When you add a new @theme token in globals.css, add its name here too.
 */
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: ["display", "h1", "h2", "h3", "lead", "body"],
      spacing: ["gutter", "section"],
      container: ["page", "prose"],
      shadow: ["card", "raised", "dialog"],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
