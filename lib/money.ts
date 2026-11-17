/*
 * Money is stored as integer minor units (paise). Formatting is display-only:
 * never parse a displayed price back into a chargeable amount.
 */
const inr = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" });
const inrWhole = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export function formatInr(paise: number) {
  if (!Number.isInteger(paise) || paise < 0)
    throw new Error("Price must be a whole number of paise.");
  return paise % 100 === 0 ? inrWhole.format(paise / 100) : inr.format(paise / 100);
}
