import { and, eq, gt, isNull } from "drizzle-orm";

import { getDb } from "@/db";
import { magicTokens } from "@/db/schema";
import { hmac, randomToken, requireSecret } from "@/lib/security/crypto";
import { siteUrl } from "@/lib/site-url";

/*
 * One-time email links (PROJECT_SPEC §7): only a keyed hash of the token is
 * stored, links expire after 15 minutes and work once. The link opens a
 * "Continue" page; the token is spent only when that button is pressed, so
 * email scanners that pre-open links can't use it up.
 */
export const MAGIC_LINK_MINUTES = 15;

export function hashMagicToken(token: string) {
  return hmac(requireSecret("MAGIC_LINK_SECRET"), token);
}

/** Creates a token for `email` and returns the link to put in the email. */
export async function createMagicLink(email: string, next?: string) {
  const token = randomToken();
  await getDb()
    .insert(magicTokens)
    .values({
      email,
      tokenHash: hashMagicToken(token),
      expiresAt: new Date(Date.now() + MAGIC_LINK_MINUTES * 60 * 1000),
    });
  const params = new URLSearchParams({ token });
  if (next) params.set("next", next);
  return `${siteUrl()}/library/continue?${params}`;
}

/**
 * Spends a token. One UPDATE statement marks it used only if it is unused and
 * unexpired, so two clicks at once can't both succeed. Returns the email or null.
 */
export async function consumeMagicToken(token: string) {
  const [row] = await getDb()
    .update(magicTokens)
    .set({ usedAt: new Date() })
    .where(
      and(
        eq(magicTokens.tokenHash, hashMagicToken(token)),
        isNull(magicTokens.usedAt),
        gt(magicTokens.expiresAt, new Date()),
      ),
    )
    .returning({ email: magicTokens.email });
  return row?.email ?? null;
}
