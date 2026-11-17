import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import * as schema from "./schema";

/*
 * Database client for the running app. Uses the POOLED Neon connection string
 * (DATABASE_URL) over HTTP, which suits short-lived serverless functions.
 * Migrations use the direct connection instead (see drizzle.config.ts).
 *
 * shortcut: the HTTP driver can't run interactive transactions; Phase 3
 * (payment fulfilment) switches the write path to the WebSocket Pool driver.
 */
let client: ReturnType<typeof drizzle<typeof schema>> | undefined;

export function getDb() {
  if (!client) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL is not set. See README → Database setup.");
    client = drizzle({ client: neon(url), schema });
  }
  return client;
}

export function hasDatabaseUrl() {
  return Boolean(process.env.DATABASE_URL);
}
