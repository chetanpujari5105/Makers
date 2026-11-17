import { findPublishedProduct, saveLead } from "@/lib/library/access";
import { hashIp } from "@/lib/security/crypto";
import { guardPublicPost, jsonError } from "@/lib/security/request";
import { buyerFormSchema } from "@/lib/validators";

/*
 * POST /api/leads — saves name + email from the buyer-details dialog before
 * any payment step (Phase 3 calls this before opening checkout).
 * A filled honeypot gets a normal-looking reply and saves nothing.
 */
export async function POST(request: Request) {
  const guard = await guardPublicPost(request, "lead");
  if ("error" in guard) return guard.error;

  const parsed = buyerFormSchema.safeParse(guard.body);
  if (!parsed.success)
    return jsonError(400, parsed.error.issues[0]?.message ?? "Please check the form.");
  const input = parsed.data;
  if (input.website) return Response.json({ ok: true });

  const product = await findPublishedProduct(input.productSlug);
  if (!product) return jsonError(404, "This resource isn’t available.");

  await saveLead({
    name: input.name,
    email: input.email,
    productId: product.id,
    source: "product_page",
    marketingOptIn: input.marketingOptIn === true,
    ipHash: hashIp(guard.ip),
  });
  return Response.json({ ok: true });
}
