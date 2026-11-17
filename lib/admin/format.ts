/** Date and time for owner tables, e.g. "2026-11-18 14:05" (UTC). */
export const when = (date: Date | null) =>
  date ? date.toISOString().slice(0, 16).replace("T", " ") : "—";
