/**
 * Money helpers.
 *
 * All money in the database is stored as WHOLE MINOR UNITS (cents) in an
 * integer: $4.50 is stored as 450. This avoids floating-point rounding errors.
 * Convert only at the edges: when reading a form (toMinor) and when showing
 * a value (formatMoney).
 */

/** "4.50" or 4.5 -> 450. Returns null for anything that is not a valid amount. */
export function toMinor(value: string | number, decimals = 2): number | null {
  const text = typeof value === "number" ? String(value) : value.trim().replace(/,/g, "");
  if (!/^-?\d+(\.\d+)?$/.test(text)) return null;
  const [whole, frac = ""] = text.replace("-", "").split(".");
  if (frac.length > decimals) return null; // e.g. 4.505 when only cents allowed
  const minor = Number(whole) * 10 ** decimals + Number(frac.padEnd(decimals, "0") || 0);
  return text.startsWith("-") ? -minor : minor;
}

/** 450 -> 4.5 (for number inputs). */
export function fromMinor(minor: number, decimals = 2): number {
  return minor / 10 ** decimals;
}

const formatters = new Map<string, Intl.NumberFormat>();

/** 450 -> "$4.50" using the business currency. */
export function formatMoney(minor: number, currency = "USD", decimals = 2): string {
  const key = `${currency}:${decimals}`;
  let f = formatters.get(key);
  if (!f) {
    f = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
    formatters.set(key, f);
  }
  return f.format(fromMinor(minor, decimals));
}
