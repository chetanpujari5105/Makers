import { formatInr } from "@/lib/money";
import { cn } from "@/lib/utils";

/* Price from the database (paise). INR only until USD is enabled and configured. */
export function PriceTag({
  isFree,
  priceInr,
  className,
}: {
  isFree: boolean;
  priceInr: number | null;
  className?: string;
}) {
  const label = isFree ? "Free" : priceInr ? formatInr(priceInr) : null;
  if (!label) return null; // paid but unpriced: never show a made-up price
  return (
    <span
      className={cn("tabular font-display text-[1.375rem] leading-none font-medium", className)}
    >
      {label}
    </span>
  );
}
