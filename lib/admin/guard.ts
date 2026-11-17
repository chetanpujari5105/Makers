import { redirect } from "next/navigation";

import { getDb } from "@/db";
import { adminAuditLogs } from "@/db/schema";
import { isAdmin } from "@/lib/auth/session";

/*
 * Owner checks. Every admin page, server action and admin API checks the
 * signed owner cookie itself: a hidden button or a page redirect is not
 * protection, because actions can be called directly.
 */

export type ActionResult = { ok: boolean; message: string; href?: string };

/** For admin pages: send visitors who aren't the owner to the login page. */
export async function requireAdminPage() {
  if (!(await isAdmin())) redirect("/admin/login");
}

/** For server actions: checks the owner, then runs the action with plain-English errors. */
export async function ownerOnly(run: () => Promise<ActionResult>): Promise<ActionResult> {
  if (!(await isAdmin())) return { ok: false, message: "Please sign in as the owner again." };
  try {
    return await run();
  } catch (error) {
    console.error("admin action failed", error);
    return { ok: false, message: "Something went wrong. Nothing was changed — please try again." };
  }
}

/** Records a sensitive owner action. Never pass passwords, secrets or card data. */
export async function audit(
  action: string,
  targetType: string,
  targetId: string | null,
  details: Record<string, unknown> = {},
) {
  await getDb().insert(adminAuditLogs).values({ action, targetType, targetId, details });
}
