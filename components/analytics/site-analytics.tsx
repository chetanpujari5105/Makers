"use client";

import { Analytics } from "@vercel/analytics/next";

import { analyticsBeforeSend } from "@/lib/analytics";

// beforeSend is a function, so it must be passed from a client component.
export function SiteAnalytics() {
  return <Analytics beforeSend={analyticsBeforeSend} />;
}
