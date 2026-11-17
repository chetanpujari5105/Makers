import { audit } from "@/lib/admin/guard";
import { leadsCsv } from "@/lib/admin/records";
import { isAdmin } from "@/lib/auth/session";
import { jsonError } from "@/lib/security/request";

/* GET /api/admin/leads/export — owner only. All leads as CSV, with the marketing opt-in column. */
export async function GET() {
  if (!(await isAdmin())) return jsonError(401, "Please sign in as the owner.");
  const csv = await leadsCsv();
  await audit("leads_export", "lead", null);
  return new Response(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="leads-${new Date().toISOString().slice(0, 10)}.csv"`,
      "cache-control": "no-store",
    },
  });
}
