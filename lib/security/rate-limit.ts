import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/*
 * Rate limits for public endpoints (Upstash Redis, free plan). Works with the
 * variable names from Upstash directly or from the Vercel Marketplace.
 * Local development without Upstash uses a simple in-memory counter;
 * a deployed site without Upstash refuses the request rather than run unprotected.
 */
const limits = {
  lead: { tokens: 5, window: "10 m" },
  claim: { tokens: 5, window: "10 m" },
  magicLink: { tokens: 3, window: "15 m" },
  download: { tokens: 30, window: "60 m" },
  adminLogin: { tokens: 5, window: "15 m" },
  order: { tokens: 10, window: "10 m" },
  review: { tokens: 5, window: "60 m" },
} as const;

export type LimitName = keyof typeof limits;

const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
const redis = url && token ? new Redis({ url, token }) : null;

const limiters = new Map<LimitName, Ratelimit>();

export async function rateLimit(name: LimitName, key: string) {
  if (!redis) return localLimit(name, key);
  let limiter = limiters.get(name);
  if (!limiter) {
    const { tokens, window } = limits[name];
    limiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(tokens, window),
      prefix: `rl:${name}`,
    });
    limiters.set(name, limiter);
  }
  const { success } = await limiter.limit(key);
  return success;
}

// shortcut: per-process memory, development only; deployed sites need Upstash.
const local = new Map<string, number[]>();
function localLimit(name: LimitName, key: string) {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Rate limiting is not configured (UPSTASH_REDIS_REST_URL / _TOKEN).");
  }
  const { tokens, window } = limits[name];
  const ms = parseInt(window, 10) * 60 * 1000;
  const now = Date.now();
  const hits = (local.get(`${name}:${key}`) ?? []).filter((t) => now - t < ms);
  hits.push(now);
  local.set(`${name}:${key}`, hits);
  return hits.length <= tokens;
}
