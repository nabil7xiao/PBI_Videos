/** Date and number display helpers. Dates are shown as DD/MM/YYYY. */

const dateFmt = new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });
const dateTimeFmt = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export function formatDate(d: Date | string | null | undefined): string {
  return d ? dateFmt.format(new Date(d)) : "—";
}

export function formatDateTime(d: Date | string | null | undefined): string {
  return d ? dateTimeFmt.format(new Date(d)) : "—";
}

/** Quantity with up to 3 decimals, no trailing zeros: 2 -> "2", 0.25 -> "0.25". */
export function formatQty(q: number | string | { toString(): string }): string {
  const n = Number(q.toString());
  return n.toLocaleString("en-US", { maximumFractionDigits: 3 });
}
