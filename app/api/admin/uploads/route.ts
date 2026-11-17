import { randomUUID } from "node:crypto";
import { z } from "zod";

import { isAdmin } from "@/lib/auth/session";
import { isSameOrigin, jsonError } from "@/lib/security/request";
import {
  allowedUploadTypes,
  isStorageConfigured,
  MAX_UPLOAD_BYTES,
  uploadUrl,
} from "@/lib/storage/r2";

/*
 * POST /api/admin/uploads — owner only. Checks the file type and size, then
 * returns a 5-minute signed PUT link so the browser uploads straight to the
 * private R2 bucket. The file is recorded only after /api/admin/files confirms it.
 */
const bodySchema = z.object({
  productId: z.uuid(),
  fileName: z.string().trim().min(1).max(200),
  size: z.number().int().positive().max(MAX_UPLOAD_BYTES, "Files can be up to 200 MB."),
});

export async function POST(request: Request) {
  if (!isSameOrigin(request) || !(await isAdmin()))
    return jsonError(401, "Please sign in as the owner.");
  if (!isStorageConfigured()) return jsonError(503, "File storage (R2) isn’t set up yet.");

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return jsonError(400, parsed.error.issues[0]?.message ?? "Invalid upload.");
  const { productId, fileName, size } = parsed.data;

  const extension = fileName.split(".").pop()?.toLowerCase() ?? "";
  const contentType = allowedUploadTypes[extension];
  if (!contentType) return jsonError(400, `“.${extension}” files aren’t allowed.`);

  const safeName = fileName.replace(/[^\w.\-]/g, "_").slice(-120);
  const key = `products/${productId}/${randomUUID()}-${safeName}`;
  return Response.json({
    ok: true,
    key,
    contentType,
    uploadUrl: await uploadUrl(key, contentType, size),
  });
}
