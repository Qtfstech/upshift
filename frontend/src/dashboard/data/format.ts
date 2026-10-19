const inr0 = new Intl.NumberFormat('en-IN', {style: 'currency', currency: 'INR', maximumFractionDigits: 0});
const inr2 = new Intl.NumberFormat('en-IN', {style: 'currency', currency: 'INR', minimumFractionDigits: 2, maximumFractionDigits: 2});
const int = new Intl.NumberFormat('en-IN');

export const fmtInr = (n: number) => inr0.format(n);
export const fmtInr2 = (n: number) => inr2.format(n);
export const fmtInt = (n: number) => int.format(Math.round(n));
export const fmtPct = (n: number) => `${(n * 100).toFixed(1)}%`;

export function fmtInrShort(n: number) {
  if (Math.abs(n) >= 1e5) return `₹${(n / 1e5).toFixed(1)}L`;
  if (Math.abs(n) >= 1e3) return `₹${(n / 1e3).toFixed(1)}k`;
  return `₹${Math.round(n)}`;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** "2026-09-18" -> "18 Sep" */
export function fmtDay(iso: string) {
  const [, m, d] = iso.split('-').map(Number);
  return `${d} ${MONTHS[m - 1]}`;
}

/** "2026-09-18" -> "18 Sep 2026" */
export function fmtDate(iso: string) {
  return `${fmtDay(iso)} ${iso.slice(0, 4)}`;
}

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/** "2026-09-25" -> "Friday, 25 Sep 2026" */
export function fmtLongDate(iso: string) {
  const [y, m, d] = iso.split('-').map(Number);
  return `${WEEKDAYS[new Date(y, m - 1, d).getDay()]}, ${fmtDate(iso)}`;
}

/** "2026-09" -> "Sep 2026" */
export function fmtMonth(isoMonth: string) {
  return `${MONTHS[+isoMonth.slice(5, 7) - 1]} ${isoMonth.slice(0, 4)}`;
}

/** Calendar day before an ISO date. */
export function prevDay(iso: string) {
  const [y, m, d] = iso.split('-').map(Number);
  const t = new Date(y, m - 1, d - 1);
  return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;
}
