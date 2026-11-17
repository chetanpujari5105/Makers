/* Request helpers shared by the API routes. */

/** The visitor's IP as Vercel reports it (first x-forwarded-for entry). Never stored raw. */
export function clientIp(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null;
}

/**
 * Rejects POSTs sent from another website (cross-site request forgery).
 * Browsers always send Origin on POST; a missing Origin (curl, server) is allowed
 * because it can't carry the visitor's cookies from another site.
 */
export function isSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    return new URL(origin).host === new URL(request.url).host;
  } catch {
    return false;
  }
}

export function jsonError(status: number, message: string) {
  return Response.json({ ok: false, message }, { status });
}

/** 303 = "see other": after a form POST the browser loads the target with GET. */
export function redirectTo(request: Request, path: string) {
  return Response.redirect(new URL(path, request.url), 303);
}
