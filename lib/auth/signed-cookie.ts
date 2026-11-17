import { hmac, requireSecret, safeEqual } from "@/lib/security/crypto";

/*
 * Signed, expiring cookie values: base64url(JSON payload) + "." + HMAC.
 * Used for the buyer session and the owner (admin) session. The browser can
 * read the payload but can't change it without breaking the signature.
 */

type Payload = { sub: string; kind: "customer" | "admin"; exp: number };

export function signValue(payload: Payload) {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${hmac(requireSecret("SESSION_SECRET"), body)}`;
}

export function verifyValue(value: string | undefined, kind: Payload["kind"], now = Date.now()) {
  if (!value) return null;
  const [body, signature, extra] = value.split(".");
  if (!body || !signature || extra !== undefined) return null;
  if (!safeEqual(signature, hmac(requireSecret("SESSION_SECRET"), body))) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString()) as Payload;
    if (payload.kind !== kind || typeof payload.sub !== "string" || payload.exp < now) return null;
    return payload;
  } catch {
    return null;
  }
}

export const cookieOptions = (maxAgeSeconds: number) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: maxAgeSeconds,
});
