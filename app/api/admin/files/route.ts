import { revalidateTag } from "next/cache";
import { z } from "zod";

import { getDb } from "@/db";
import { productFiles } from "@/db/schema";
import { isAdmin } from "@/lib/auth/session";
import { isSameOrigin, jsonError } from "@/lib/security/request";
import { allowedUploadTypes, MAX_UPLOAD_BYTES, objectSize } from "@/lib/storage/files";

/*
 * POST /api/admin/files — owner only. Confirms an upload really reached storage
 * (and its size) before recording it as a product file.
 */
const bodySchema = z.object({
  productId: z.uuid(),
  key: z.string().max(400),
  fileName: z.string().trim().min(1).max(200),
  label: z.string().trim().min(1).max(120),
});

export async function POST(request: Request) {
  if (!isSameOrigin(request) || !(await isAdmin()))
    return jsonError(401, "Please sign in as the owner.");

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return jsonError(400, parsed.error.issues[0]?.message ?? "Invalid file.");
  const { productId, key, fileName, label } = parsed.data;
  if (!key.startsWith(`products/${productId}/`))
    return jsonError(400, "That file doesn’t belong to this product.");

  const size = await objectSize(key);
  if (size === null) return jsonError(400, "The upload didn’t arrive. Please try again.");
  if (size > MAX_UPLOAD_BYTES) return jsonError(400, "Files can be up to 200 MB.");

  const extension = fileName.split(".").pop()?.toLowerCase() ?? "";
  await getDb()
    .insert(productFiles)
    .values({
      productId,
      label,
      deliveryType: "file",
      fileKey: key,
      fileName,
      sizeBytes: size,
      mimeType: allowedUploadTypes[extension] ?? "application/octet-stream",
    });
  // The public "What you'll get" list shows file names and sizes.
  revalidateTag("catalogue", "max");
  return Response.json({ ok: true });
}
