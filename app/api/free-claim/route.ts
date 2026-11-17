import { createMagicLink } from "@/lib/auth/magic-link";
import { sendLinkEmail } from "@/lib/email/send";
import { findPublishedProduct, grantFreeEntitlement, saveLead } from "@/lib/library/access";
import { hashIp } from "@/lib/security/crypto";
import { guardPublicPost, jsonError } from "@/lib/security/request";
import { buyerFormSchema } from "@/lib/validators";

/*
 * POST /api/free-claim — for published FREE products only.
 * 1. Save the lead (kept even if a later step fails).
 * 2. Find/create the customer and grant one entitlement (idempotent).
 * 3. Email a one-time link to My Library. The browser never receives access
 *    directly, so typing someone else's email can't open their library.
 */
export async function POST(request: Request) {
  const guard = await guardPublicPost(request, "claim");
  if ("error" in guard) return guard.error;

  const parsed = buyerFormSchema.safeParse(guard.body);
  if (!parsed.success)
    return jsonError(400, parsed.error.issues[0]?.message ?? "Please check the form.");
  const input = parsed.data;
  if (input.website) return Response.json({ ok: true });

  const product = await findPublishedProduct(input.productSlug);
  if (!product) return jsonError(404, "This resource isn’t available.");
  if (!product.isFree) return jsonError(400, "This resource isn’t free.");

  await saveLead({
    name: input.name,
    email: input.email,
    productId: product.id,
    source: "free_download",
    marketingOptIn: input.marketingOptIn === true,
    ipHash: hashIp(guard.ip),
  });
  await grantFreeEntitlement(input.name, input.email, product.id);

  try {
    const link = await createMagicLink(input.email, `/library/${product.slug}`);
    await sendLinkEmail({
      to: input.email,
      subject: `Your free resource: ${product.title}`,
      heading: `${product.title} is ready`,
      intro:
        "It’s now in your library. Use the button below to open it and start with the setup steps.",
      linkLabel: "Open my library",
      link,
    });
  } catch (error) {
    console.error("free-claim email failed", error);
    return jsonError(
      502,
      "Your resource is saved, but we couldn’t send the email. Please use “Email me a link” on the My Library page.",
    );
  }
  return Response.json({ ok: true });
}
