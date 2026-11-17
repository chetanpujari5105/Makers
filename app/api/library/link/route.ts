import { createMagicLink } from "@/lib/auth/magic-link";
import { sendLinkEmail } from "@/lib/email/send";
import { getDb } from "@/db";
import { customers } from "@/db/schema";
import { guardPublicPost, jsonError } from "@/lib/security/request";
import { magicLinkRequestSchema } from "@/lib/validators";
import { eq } from "drizzle-orm";

/*
 * POST /api/library/link — emails a one-time sign-in link.
 * Always gives the same answer, so nobody can use it to find out which
 * emails belong to customers. Links go only to known customers.
 */
const reply = () =>
  Response.json({
    ok: true,
    message: "If that email has a library here, a sign-in link is on its way.",
  });

export async function POST(request: Request) {
  const guard = await guardPublicPost(request, "magicLink");
  if ("error" in guard) return guard.error;

  const parsed = magicLinkRequestSchema.safeParse(guard.body);
  if (!parsed.success)
    return jsonError(400, parsed.error.issues[0]?.message ?? "Please check the form.");
  if (parsed.data.website) return reply();
  const { email } = parsed.data;

  const [customer] = await getDb()
    .select({ id: customers.id })
    .from(customers)
    .where(eq(customers.email, email))
    .limit(1);
  if (!customer) return reply();

  try {
    await sendLinkEmail({
      to: email,
      subject: "Your sign-in link for My Library",
      heading: "Sign in to My Library",
      intro: "Use the button below to open everything you’ve claimed or bought.",
      linkLabel: "Open my library",
      link: await createMagicLink(email),
    });
  } catch (error) {
    console.error("magic-link email failed", error);
  }
  return reply();
}
