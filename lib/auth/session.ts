import { cookies } from "next/headers";

import { cookieOptions, signValue, verifyValue } from "./signed-cookie";

/*
 * Buyer session: who signed in through a one-time email link. Holds only the
 * (normalised) email; entitlements are always re-read from the database.
 */
export const CUSTOMER_COOKIE = "makers_session";
const CUSTOMER_DAYS = 30;

export async function getCustomerEmail() {
  const store = await cookies();
  return verifyValue(store.get(CUSTOMER_COOKIE)?.value, "customer")?.sub ?? null;
}

export async function startCustomerSession(email: string) {
  const maxAge = CUSTOMER_DAYS * 24 * 60 * 60;
  const value = signValue({ sub: email, kind: "customer", exp: Date.now() + maxAge * 1000 });
  (await cookies()).set(CUSTOMER_COOKIE, value, cookieOptions(maxAge));
}

export async function endCustomerSession() {
  (await cookies()).delete(CUSTOMER_COOKIE);
}

/* Owner session for /admin. Shorter life; separate cookie. */
export const ADMIN_COOKIE = "makers_admin";
const ADMIN_HOURS = 8;

export async function isAdmin() {
  const store = await cookies();
  const payload = verifyValue(store.get(ADMIN_COOKIE)?.value, "admin");
  return Boolean(payload && payload.sub === process.env.ADMIN_EMAIL?.trim().toLowerCase());
}

export async function startAdminSession(email: string) {
  const maxAge = ADMIN_HOURS * 60 * 60;
  const value = signValue({ sub: email, kind: "admin", exp: Date.now() + maxAge * 1000 });
  (await cookies()).set(ADMIN_COOKIE, value, cookieOptions(maxAge));
}

export async function endAdminSession() {
  (await cookies()).delete(ADMIN_COOKIE);
}
