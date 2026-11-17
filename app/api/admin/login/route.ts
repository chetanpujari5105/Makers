import { z } from "zod";

import { startAdminSession } from "@/lib/auth/session";
import { safeEqual, verifyPassword } from "@/lib/security/crypto";
import { rateLimit } from "@/lib/security/rate-limit";
import { clientIp, isSameOrigin, redirectTo } from "@/lib/security/request";

/* POST /api/admin/login — owner sign-in with ADMIN_EMAIL + ADMIN_PASSWORD_HASH. */
const formSchema = z.object({
  email: z.string().trim().toLowerCase().max(254),
  password: z.string().max(200),
});

export async function POST(request: Request) {
  const fail = (code: string) => redirectTo(request, `/admin/login?error=${code}`);
  if (!isSameOrigin(request)) return fail("invalid");
  try {
    if (!(await rateLimit("adminLogin", clientIp(request) ?? "unknown"))) return fail("busy");
  } catch {
    return fail("unavailable");
  }

  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const hash = process.env.ADMIN_PASSWORD_HASH;
  if (!adminEmail || !hash) return fail("unavailable");

  const parsed = formSchema.safeParse(Object.fromEntries(await request.formData()));
  if (!parsed.success) return fail("invalid");
  // Always run the slow password check, so a wrong email takes as long as a wrong password.
  const passwordOk = await verifyPassword(parsed.data.password, hash);
  if (!passwordOk || !safeEqual(parsed.data.email, adminEmail)) return fail("invalid");

  await startAdminSession(adminEmail);
  return redirectTo(request, "/admin");
}
