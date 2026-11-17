import { z } from "zod";

import { getCustomerEmail } from "@/lib/auth/session";
import { authorizeDownload } from "@/lib/library/access";
import { hashIp } from "@/lib/security/crypto";
import { rateLimit } from "@/lib/security/rate-limit";
import { clientIp, isSameOrigin, redirectTo } from "@/lib/security/request";
import { downloadUrl, isStorageConfigured } from "@/lib/storage/files";

/*
 * POST /api/download/[fileId] — the only way to a paid or free file.
 * Signed-in customer + active entitlement + download limit, then a
 * 60-second signed storage link (or the private external link). POST, not GET, so link
 * previews and prefetching can't use up downloads.
 */
export async function POST(request: Request, { params }: RouteContext<"/api/download/[fileId]">) {
  const { fileId } = await params;
  const back = (code: string) => redirectTo(request, `/library?download=${code}`);
  if (!isSameOrigin(request)) return back("denied");

  const email = await getCustomerEmail();
  if (!email) return redirectTo(request, "/library");
  if (!z.uuid().safeParse(fileId).success) return back("denied");
  // Check storage before a download is counted.
  if (!isStorageConfigured()) return back("unavailable");

  try {
    if (!(await rateLimit("download", email))) return back("busy");
  } catch (error) {
    console.error("rate limit unavailable", error);
    return back("unavailable");
  }

  const result = await authorizeDownload(email, fileId, {
    ipHash: hashIp(clientIp(request)),
    userAgent: request.headers.get("user-agent"),
  });
  if (!result.ok) return back(result.reason === "limit_reached" ? "limit" : "denied");
  if (result.kind === "link") return Response.redirect(result.url, 303);
  return Response.redirect(await downloadUrl(result.fileKey, result.fileName), 303);
}
