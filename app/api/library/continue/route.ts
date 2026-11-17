import { consumeMagicToken } from "@/lib/auth/magic-link";
import { startCustomerSession } from "@/lib/auth/session";
import { isSameOrigin, redirectTo } from "@/lib/security/request";
import { safeNextPath } from "@/lib/validators";
import { z } from "zod";

/*
 * POST /api/library/continue — spends a one-time token (from the Continue
 * button on /library/continue) and starts the customer session.
 */
const formSchema = z.object({ token: z.string().regex(/^[\w-]{20,100}$/), next: safeNextPath });

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return redirectTo(request, "/library?link=invalid");
  const parsed = formSchema.safeParse(Object.fromEntries(await request.formData()));
  if (!parsed.success) return redirectTo(request, "/library?link=invalid");

  const email = await consumeMagicToken(parsed.data.token);
  if (!email) return redirectTo(request, "/library?link=invalid");

  await startCustomerSession(email);
  return redirectTo(request, parsed.data.next ?? "/library");
}
