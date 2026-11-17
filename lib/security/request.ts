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
  // Modern browsers say where a request came from, even when a no-referrer
  // policy makes them send `Origin: null` (as on /library/continue).
  const site = request.headers.get("sec-fetch-site");
  if (site) return site === "same-origin";
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

/**
 * Shared guard for public POST endpoints: same-site origin, rate limit, a
 * JSON body. Returns the parsed body or a ready error response.
 * A missing rate-limit service on a deployed site gives 503, not a crash.
 */
export async function guardPublicPost(
  request: Request,
  limit: import("./rate-limit").LimitName,
): Promise<{ body: unknown; ip: string | null } | { error: Response }> {
  if (!isSameOrigin(request)) return { error: jsonError(403, "This request isn’t allowed.") };
  const ip = clientIp(request);
  const { rateLimit } = await import("./rate-limit");
  try {
    if (!(await rateLimit(limit, ip ?? "unknown"))) {
      return { error: jsonError(429, "Too many tries. Please wait a few minutes and try again.") };
    }
  } catch (error) {
    console.error("rate limit unavailable", error);
    return { error: jsonError(503, "This isn’t available right now. Please try again later.") };
  }
  try {
    return { body: await request.json(), ip };
  } catch {
    return { error: jsonError(400, "Something was wrong with that request.") };
  }
}
