import { getCustomerEmail } from "@/lib/auth/session";
import { reviewInputSchema, submitReview } from "@/lib/library/reviews";
import { guardPublicPost, jsonError } from "@/lib/security/request";

/* POST /api/reviews — a signed-in buyer reviews a product they have. Held for the owner's approval. */
export async function POST(request: Request) {
  const guard = await guardPublicPost(request, "review");
  if ("error" in guard) return guard.error;
  const email = await getCustomerEmail();
  if (!email) return jsonError(401, "Please sign in to My Library first.");

  const parsed = reviewInputSchema.safeParse(guard.body);
  if (!parsed.success)
    return jsonError(400, parsed.error.issues[0]?.message ?? "Please check the form.");
  if (parsed.data.website) return jsonError(400, "Something was wrong with that request.");

  const result = await submitReview(email, parsed.data);
  if (result === "not_allowed")
    return jsonError(403, "Only people who have this resource can review it.");
  if (result === "already")
    return jsonError(409, "You’ve already reviewed this resource. Thank you!");
  return Response.json({
    ok: true,
    message: "Thank you! Your review will appear once it has been checked.",
  });
}
