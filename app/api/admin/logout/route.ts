import { endAdminSession } from "@/lib/auth/session";
import { isSameOrigin, redirectTo } from "@/lib/security/request";

export async function POST(request: Request) {
  if (isSameOrigin(request)) await endAdminSession();
  return redirectTo(request, "/admin/login");
}
