import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

// Unit and component tests, based on the official Next.js Vitest guide
// (node_modules/next/dist/docs/01-app/02-guides/testing/vitest.md).
// Vite resolves the "@/..." import alias from tsconfig.json natively.
// End-to-end browser tests (Playwright) are added in Phase 2.
export default defineConfig({
  plugins: [react()],
  resolve: { tsconfigPaths: true },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    include: ["**/*.test.{ts,tsx}"],
    exclude: ["node_modules/**", ".next/**"],
  },
});
