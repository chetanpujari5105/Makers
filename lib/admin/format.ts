/** Date and time for owner tables in India time, e.g. "2026-11-18 14:05". */
export const when = (date: Date | null) =>
  date
    ? date
        .toLocaleString("sv-SE", {
          timeZone: "Asia/Kolkata",
          dateStyle: "short",
          timeStyle: "short",
        })
        .replace(",", "")
    : "—";
