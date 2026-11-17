/*
 * Shows which Neon database a script is about to touch, WITHOUT printing the
 * password. Neon hostnames start with the compute endpoint ID (ep-…), which is
 * shown next to each branch in the Neon console → Branches → <branch> →
 * Computes. Compare the two before running migrations or seeds.
 */
export function endpointOf(url: string | undefined) {
  if (!url) return undefined;
  try {
    const host = new URL(url).hostname;
    return { host, endpoint: host.split(".")[0]!.replace(/-pooler$/, "") };
  } catch {
    throw new Error("The database URL is not a valid connection string.");
  }
}

export function describeTarget() {
  const pooled = endpointOf(process.env.DATABASE_URL);
  const direct = endpointOf(process.env.DATABASE_URL_UNPOOLED);
  if (!pooled && !direct) throw new Error("DATABASE_URL and DATABASE_URL_UNPOOLED are not set.");
  if (pooled && direct && pooled.endpoint !== direct.endpoint) {
    throw new Error(
      `DATABASE_URL (${pooled.endpoint}) and DATABASE_URL_UNPOOLED (${direct.endpoint}) point to different Neon branches. Copy both from the same branch.`,
    );
  }
  const endpoint = (pooled ?? direct)!.endpoint;
  console.warn(`Database target: Neon endpoint ${endpoint}`);
  return endpoint;
}
