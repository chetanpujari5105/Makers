import { existsSync } from "node:fs";

import { defineConfig } from "drizzle-kit";

// Local runs read .env.local; on Vercel the variables are already set.
if (existsSync(".env.local")) process.loadEnvFile(".env.local");

export default defineConfig({
  schema: "./db/schema.ts",
  out: "./db/migrations",
  dialect: "postgresql",
  // Migrations use the DIRECT (unpooled) connection: they hold one session
  // open and run DDL, which a connection pooler can interrupt.
  dbCredentials: { url: process.env.DATABASE_URL_UNPOOLED ?? "" },
  strict: true,
  verbose: true,
});
