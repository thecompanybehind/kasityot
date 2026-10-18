/**
 * Money is stored in paise (₹1 = 100 paise), as everywhere else in Kasityot.
 * Nothing outside this file should divide by 100.
 */
function rupees(paise: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(paise / 100);
}

/** A trade unit price. Most are blank, which reads as an invitation to ask. */
export function formatTradePrice(paise: number | null): string {
  return paise === null || paise === undefined
    ? "Price on enquiry"
    : `${rupees(paise)} / unit`;
}

/** e.g. "14 Mar 2026". */
export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}
