import { createHmac, randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

/*
 * Small crypto helpers. Server-only (node:crypto). Every comparison of a
 * secret-derived value uses timingSafeEqual.
 */

export function requireSecret(name: "SESSION_SECRET" | "MAGIC_LINK_SECRET") {
  const value = process.env[name];
  if (!value || value.length < 32) {
    throw new Error(`${name} is missing or shorter than 32 characters. See .env.example.`);
  }
  return value;
}

/** 32 random bytes as URL-safe text (for magic-link tokens). */
export function randomToken() {
  return randomBytes(32).toString("base64url");
}

export function hmac(secret: string, value: string) {
  return createHmac("sha256", secret).update(value).digest("base64url");
}

export function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

/** Salted one-way hash of an IP address for abuse checks; the IP itself is never stored. */
export function hashIp(ip: string | null) {
  return ip ? hmac(requireSecret("SESSION_SECRET"), `ip:${ip}`).slice(0, 32) : null;
}

const scryptAsync = promisify(scrypt) as (pw: string, salt: Buffer, len: number) => Promise<Buffer>;

/** Format: scrypt:<salt>:<hash>, both base64url. Made by `npm run admin:hash`. */
export async function hashPassword(password: string) {
  const salt = randomBytes(16);
  const hash = await scryptAsync(password, salt, 64);
  return `scrypt:${salt.toString("base64url")}:${hash.toString("base64url")}`;
}

export async function verifyPassword(password: string, stored: string | undefined) {
  const [scheme, salt, hash] = stored?.split(":") ?? [];
  if (scheme !== "scrypt" || !salt || !hash) return false;
  const actual = await scryptAsync(password, Buffer.from(salt, "base64url"), 64);
  return safeEqual(actual.toString("base64url"), hash);
}
