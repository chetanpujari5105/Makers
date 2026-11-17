import type { NextConfig } from "next";

/*
 * Baseline security headers (PROJECT_SPEC.md §13).
 * A full Content-Security-Policy is added in Phase 3, because it must allow
 * Razorpay Checkout's scripts and frames — adding it now would break checkout
 * later or need guessing. `frame-ancestors` only stops OTHER sites from
 * framing this one; it does not affect Razorpay's popup.
 */
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
];

const nextConfig: NextConfig = {
  // Next.js 16.4 defaults from create-next-app (see docs/DECISIONS.md).
  cacheComponents: true,
  partialPrefetching: true,
  poweredByHeader: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      // One-time sign-in links: never leak the token to other sites or caches.
      {
        source: "/library/continue",
        headers: [
          { key: "Referrer-Policy", value: "no-referrer" },
          { key: "Cache-Control", value: "no-store" },
        ],
      },
    ];
  },
};

export default nextConfig;
