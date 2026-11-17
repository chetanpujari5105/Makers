import { endCustomerSession } from "@/lib/auth/session";
import { isSameOrigin, redirectTo } from "@/lib/security/request";

export async function POST(request: Request) {
  if (isSameOrigin(request)) await endCustomerSession();
  return redirectTo(request, "/library");
}
