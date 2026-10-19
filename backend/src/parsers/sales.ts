import {guessOrder, toDate} from './parseExcel';

/**
 * Sales sheet ("Attendees For WS From Meta Leads"): one tab per workshop / campaign, one row per student.
 * Each tab is laid out differently, so the Amount and Payment date columns are found per tab — by their
 * headings first, and by what the cells contain when a tab has no recognisable headings.
 */

export interface Payment {
  /** ISO date (yyyy-mm-dd); null when the row has an amount but no readable payment date */
  date: string | null;
  /** null when the tab has no amount column: the student paid (there's a payment date) but the sum isn't in the sheet */
  amount: number | null;
  student: string;
}

export interface SalesTab {
  name: string;
  /** Student rows in the tab, paid or not */
  students: number;
  payments: Payment[];
  /** Column letters used, shown on the page so they can be checked against the sheet */
  columns: {amount: string | null; date: string | null; student: string | null; headerRow: number | null};
  /** How the columns were found: by heading, or guessed from the cell contents */
  detectedBy: 'header' | 'content';
  warnings: string[];
}

export interface SalesData {
  fileName: string;
  tabs: SalesTab[];
  /** Tabs with no amount column found */
  skipped: {name: string; reason: string}[];
}

export interface FeedTab {
  name: string;
  hidden?: boolean;
  values: string[][];
}

const norm = (v: string | undefined) => String(v ?? '').trim().toLowerCase().replace(/\s+/g, ' ');
const blank = (v: string | undefined) => v == null || String(v).trim() === '';

export const colLetter = (i: number): string => (i < 26 ? '' : colLetter(Math.floor(i / 26) - 1)) + String.fromCharCode(65 + (i % 26));

/** "₹1,999.00", "Rs. 499/-", "INR 2,500", "1999" → number; null when the cell isn't an amount. */
export function parseAmount(v: string | undefined): number | null {
  if (blank(v)) return null;
  const s = String(v).toLowerCase().replace(/rs\.?|inr|₹|\/-|,|\s/g, '');
  if (!/^-?\d+(\.\d+)?$/.test(s)) return null;
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : null;
}

/** Payment dates often carry a time ("9/1/2026 14:32:10", "2026-09-01T10:00"); only the day matters. */
const stripTime = (v: string) => v.trim().replace(/[\sT,]+\d{1,2}:\d{2}(:\d{2})?(\.\d+)?\s*([ap]\.?m\.?)?$/i, '');

const readDate = (v: string | undefined, order: 'dmy' | 'mdy') => (blank(v) ? null : toDate(stripTime(String(v)), order));

// ---- Heading scores (0 = not this kind of column) ----

function amountScore(h: string) {
  if (!h) return 0;
  if (/date|mode|method|status|\bid\b|ref|utr|txn no|transaction no|balance|due|pending|remaining|discount|refund|phone|mobile|whatsapp|number|gst|%/.test(h)) return 0;
  if (/(amount|amt)\s*(paid|received|collected)|(paid|payment|received|collected)\s*(amount|amt)/.test(h)) return 4;
  if (/^(amount|amt)\b|\bamount\b/.test(h)) return 3;
  if (/\b(fee|fees|price|revenue|paid|received|collected)\b|₹|\(rs\)|\brs\b|\binr\b/.test(h)) return 2;
  if (/\bpayment\b/.test(h)) return 1;
  return 0;
}

function dateScore(h: string) {
  if (!h) return 0;
  if (/birth|dob|workshop date|event date|session|batch|start date|end date|due date|follow/.test(h)) return 0;
  if (/(payment|paid|txn|transaction|purchase|order|received)\s*(date|on|time)|date\s*of\s*(payment|purchase|transaction)|paid on/.test(h)) return 4;
  if (/\bdate\b/.test(h) && /(pay|paid|txn|transaction)/.test(h)) return 4;
  if (/\bdate\b/.test(h)) return /regist|enrol|lead|created/.test(h) ? 1 : 2;
  if (/timestamp/.test(h)) return 1;
  return 0;
}

function studentScore(h: string) {
  if (!h) return 0;
  if (/campaign|workshop|course|ad name|ad set|form|batch|company|college|father|parent/.test(h)) return 0;
  if (/(student|attendee|participant|candidate|customer|full)\s*name/.test(h)) return 3;
  if (/\bname\b/.test(h)) return 2;
  if (/^(student|attendee|participant|candidate)s?$/.test(h)) return 2;
  return 0;
}

const isContact = (h: string) => /e-?mail|phone|mobile|whatsapp|contact/.test(h);

interface Columns {
  headerRow: number | null;
  amount: number;
  date: number;
  student: number;
  contacts: number[];
}

/** Best column for a score, keeping only columns whose cells below the heading look right. */
function pickColumn(header: string[], body: string[][], score: (h: string) => number, cellOk: (v: string) => boolean) {
  let best = -1;
  let bestKey = 0;
  header.forEach((cell, c) => {
    const s = score(norm(cell));
    if (!s) return;
    const filled = body.filter((r) => !blank(r[c]));
    const ok = filled.filter((r) => cellOk(r[c])).length;
    if (filled.length && ok / filled.length < 0.5) return; // e.g. a "Payment" column holding "Done" / "Pending"
    const key = s * 1e6 + ok; // heading first, then how many cells fit
    if (key > bestKey) {
      bestKey = key;
      best = c;
    }
  });
  return best;
}

const looksLikeAmount = (v: string) => parseAmount(v) != null;
const looksLikeDate = (v: string) => readDate(v, 'dmy') != null || readDate(v, 'mdy') != null;

function findByHeader(values: string[][]): Columns | null {
  const scan = Math.min(values.length, 30);
  let best: Columns | null = null;
  let bestScore = 0;
  for (let r = 0; r < scan; r++) {
    const header = values[r];
    const body = values.slice(r + 1, r + 301);
    const amount = pickColumn(header, body, amountScore, looksLikeAmount);
    const date = pickColumn(header, body, dateScore, looksLikeDate);
    // No amount column: still usable when there's a clear "Payment date" column (paid = date filled in).
    if (amount < 0 && (date < 0 || dateScore(norm(header[date])) < 4)) continue;
    const student = pickColumn(header, body, studentScore, (v) => parseAmount(v) == null);
    const score = (amount >= 0 ? amountScore(norm(header[amount])) : 0) + (date >= 0 ? dateScore(norm(header[date])) : 0) + (student >= 0 ? 1 : 0);
    if (score > bestScore) {
      bestScore = score;
      const contacts = header.map((h, c) => (isContact(norm(h)) ? c : -1)).filter((c) => c >= 0);
      best = {headerRow: r, amount, date, student, contacts};
    }
  }
  return best;
}

/**
 * No usable headings: take the column where most cells are dates as the payment date, and the column where
 * most cells are money-like numbers as the amount (skipping phone numbers and 1, 2, 3… serial numbers).
 */
function findByContent(values: string[][]): Columns | null {
  const width = Math.max(0, ...values.map((r) => r.length));
  let amount = -1;
  let amountHits = 0;
  let date = -1;
  let dateHits = 0;
  for (let c = 0; c < width; c++) {
    const cells = values.map((r) => r[c]).filter((v) => !blank(v));
    if (cells.length < 2) continue;
    const dates = cells.filter(looksLikeDate).length;
    const nums = cells.map(parseAmount).filter((n): n is number => n != null);
    const money = nums.filter((n) => n > 0 && n < 1e6).length;
    const serial = nums.length >= 3 && nums.every((n, i) => i === 0 || n === nums[i - 1] + 1);
    if (dates / cells.length >= 0.6 && dates > dateHits) {
      date = c;
      dateHits = dates;
    } else if (!serial && money / cells.length >= 0.6 && money > amountHits) {
      amount = c;
      amountHits = money;
    }
  }
  return amount >= 0 ? {headerRow: null, amount, date, student: -1, contacts: []} : null;
}

const isTotalRow = (row: string[]) => row.some((v) => /^(grand\s*)?total\b|^sum\b/.test(norm(v)));

export function parseSalesTab(tab: FeedTab): SalesTab | {skip: string} {
  const values = tab.values.map((r) => r.map((c) => String(c ?? '')));
  if (!values.length) return {skip: 'Empty tab'};
  const byHeader = findByHeader(values);
  const cols = byHeader ?? findByContent(values);
  if (!cols) return {skip: 'No amount or payment date column found'};

  const warnings: string[] = [];
  const start = cols.headerRow == null ? 0 : cols.headerRow + 1;
  const header = cols.headerRow == null ? null : values[cols.headerRow];
  const body = values.slice(start);
  const order = cols.date >= 0 ? guessOrder(body.map((r) => (blank(r[cols.date]) ? null : stripTime(r[cols.date])))) : 'dmy';
  const idCols = [cols.student, ...cols.contacts].filter((c) => c >= 0);

  let students = 0;
  let unreadable = 0;
  const payments: Payment[] = [];
  body.forEach((row, i) => {
    if (isTotalRow(row)) return;
    if (header && row.every((v, c) => norm(v) === norm(header[c]))) return; // heading repeated further down
    const hasPerson = idCols.length ? idCols.some((c) => !blank(row[c])) : !blank(row[cols.amount]);
    if (!hasPerson) return;
    students++;
    let amount: number | null = null;
    if (cols.amount >= 0) {
      amount = parseAmount(row[cols.amount]);
      if (amount == null) {
        if (!blank(row[cols.amount])) unreadable++;
        return;
      }
      if (amount <= 0) return;
    } else if (blank(row[cols.date])) return;
    const date = cols.date >= 0 ? readDate(row[cols.date], order) : null;
    if (cols.date >= 0 && !date && !blank(row[cols.date]) && warnings.length < 5) {
      warnings.push(`Row ${start + i + 1}: could not read payment date "${row[cols.date]}".`);
    }
    const student = cols.student >= 0 ? row[cols.student].trim() : (cols.contacts.map((c) => row[c]).find((v) => !blank(v)) ?? '').trim();
    payments.push({date, amount, student});
  });

  if (cols.amount < 0) warnings.push('No amount column — paid students are counted from the payment date, but revenue is left out. Add an "Amount" column to this tab to include it.');
  if (cols.date < 0) warnings.push('No payment date column found — this tab only counts in "All time".');
  if (!byHeader) warnings.push('No headings recognised — columns were guessed from the cell contents. Please check them.');
  if (unreadable) warnings.push(`${unreadable} amount cell${unreadable > 1 ? 's' : ''} not a number (e.g. "Paid", "Pending") — left out.`);

  return {
    name: tab.name.trim(),
    students,
    payments,
    columns: {
      amount: cols.amount >= 0 ? colLetter(cols.amount) : null,
      date: cols.date >= 0 ? colLetter(cols.date) : null,
      student: cols.student >= 0 ? colLetter(cols.student) : null,
      headerRow: cols.headerRow == null ? null : cols.headerRow + 1,
    },
    detectedBy: byHeader ? 'header' : 'content',
    warnings,
  };
}

export function parseSales(fileName: string, tabs: FeedTab[]): SalesData {
  const out: SalesData = {fileName, tabs: [], skipped: []};
  for (const t of tabs) {
    const r = parseSalesTab(t);
    if ('skip' in r) out.skipped.push({name: t.name, reason: r.skip});
    else out.tabs.push(r);
  }
  return out;
}
