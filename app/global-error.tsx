"use client"; // Error boundaries must be Client Components

import { useEffect } from "react";

import "./globals.css";

/*
 * Last-resort error page, used only if the root layout itself fails.
 * It replaces the whole document, so it renders its own <html> and <body>.
 */
export default function GlobalError({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="flex min-h-dvh items-center justify-center bg-background p-6 font-sans text-foreground">
        <title>Something went wrong</title>
        <main className="flex max-w-prose flex-col items-start gap-6">
          <h1 className="font-display text-h1">Something went wrong</h1>
          <p className="text-lead text-muted-foreground">
            The site couldn’t load. Please try again in a moment.
          </p>
          <button
            type="button"
            onClick={() => retry()}
            className="inline-flex h-11 items-center rounded-full bg-primary px-5 text-base font-medium text-primary-foreground"
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
