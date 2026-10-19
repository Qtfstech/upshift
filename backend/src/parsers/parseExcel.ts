import * as XLSX from 'xlsx';
import {isExcludedCampaign, type OwnerSource} from './owners';
import type {AwarenessRow, AwarenessTotal, DailyRow, Dataset, ParseResult, SummaryRow, UndatedDays} from './types';

export type Cell = string | number | boolean | Date | null;
type Aoa = Cell[][];
export type DateOrder = 'dmy' | 'mdy';
type Undated = Omit<DailyRow, 'date'>;

const MONTHS: Record<string, number> = {
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
  jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
};
const WEEKDAYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

const norm = (v: Cell) => String(v ?? '').trim().toLowerCase().replace(/\s+/g, ' ');
const blank = (v: Cell | undefined) => v == null || String(v).trim() === '';

export const campaignKey = (name: string) => name.toLowerCase().replace(/[^a-z0-9]/g, '');

const pad = (n: number) => String(n).padStart(2, '0');
const iso = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;

export function addDays(isoDate: string, n: number) {
  const [y, m, d] = isoDate.split('-').map(Number);
  const t = new Date(y, m - 1, d + n);
  return iso(t.getFullYear(), t.getMonth(), t.getDate());
}

function toNum(v: Cell | undefined): number {
  if (typeof v === 'number') return v;
  if (typeof v === 'string') {
    const n = parseFloat(v.replace(/[₹,\s]/g, '').replace(/^rs\.?/i, ''));
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

const toCount = (v: Cell | undefined) => (blank(v) ? null : toNum(v));

export function toDate(v: Cell, order: DateOrder = 'dmy'): string | null {
  if (blank(v)) return null;
  if (v instanceof Date && !isNaN(v.getTime())) {
    return iso(v.getFullYear(), v.getMonth(), v.getDate());
  }
  if (typeof v === 'number') {
    const p = XLSX.SSF.parse_date_code(v);
    return p ? iso(p.y, p.m - 1, p.d) : null;
  }
  const s = String(v).trim();
  // "18 Sep 2026", "18-Sep-2026", "18 September, 2026"
  let m = s.match(/^(\d{1,2})[\s\-/.]+([a-z]{3,})[\s\-/.,]+(\d{4})$/i);
  if (m && MONTHS[m[2].slice(0, 3).toLowerCase()] !== undefined) {
    return iso(+m[3], MONTHS[m[2].slice(0, 3).toLowerCase()], +m[1]);
  }
  // "18/09/2026" or "9/18/2026" depending on the sheet's order
  m = s.match(/^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{4})$/);
  if (m) {
    const [d, mo] = order === 'dmy' ? [+m[1], +m[2]] : [+m[2], +m[1]];
    return mo >= 1 && mo <= 12 && d >= 1 && d <= 31 ? iso(+m[3], mo - 1, d) : null;
  }
  // "2026-09-18"
  m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (m) return iso(+m[1], +m[2] - 1, +m[3]);
  return null;
}

const weekday = (isoDate: string) => {
  const [y, m, d] = isoDate.split('-').map(Number);
  return WEEKDAYS[new Date(y, m - 1, d).getDay()];
};

/** Work out whether slash dates are day-first or month-first, using a "Day" column when there is one. */
export function guessOrder(dates: Cell[], days?: Cell[]): DateOrder {
  const score = (order: DateOrder) =>
    dates.reduce<number>((s, v, i) => {
      const d = toDate(v, order);
      if (!d) return s;
      const day = days?.[i] ?? null;
      if (!blank(day)) return s + (weekday(d) === norm(day).slice(0, 3) ? 2 : -2);
      return s + 1;
    }, 0);
  return score('mdy') > score('dmy') ? 'mdy' : 'dmy';
}

function findCol(row: Cell[], test: (h: string) => boolean, from = 0, to = row.length) {
  for (let c = Math.max(0, from); c < Math.min(to, row.length); c++) if (test(norm(row[c] ?? null))) return c;
  return -1;
}

const isCampaign = (h: string) => h === 'campaign name' || h === 'campaign';
const isLeads = (h: string) => h === 'leads' || h === 'no. of leads';
const isSpend = (h: string) => h.startsWith('amount') || h === 'spend' || h.startsWith('ad spend');
const isCpl = (h: string) => h.startsWith('cost per lead') || h.startsWith('cpl');
const isDayTotal = (h: string) => h.startsWith('total amount');
const isDate = (h: string) => h === 'date';

const makeRow = (date: string, campaign: string, leads: number, spend: number): DailyRow => ({
  date,
  campaign,
  leads,
  spend,
  cpl: leads > 0 ? spend / leads : null,
});

/** Awareness campaigns put reach in the Leads column ("53,326- Reach") and cost per 1k people in the CPL column. */
const isAwareness = (campaign: string, leadsCell: Cell | undefined, cplCell: Cell | undefined) =>
  /^awareness/i.test(campaign) ||
  (typeof leadsCell === 'string' && /reach/i.test(leadsCell)) ||
  (typeof cplCell === 'string' && /per\s*1k/i.test(cplCell));

/**
 * A summary table: header row `r` with "Campaign Name" in column `cs`, campaigns below it until a blank name.
 * Columns other than Leads / Cost per Lead / Amount are funnel counts, kept under their own headings.
 */
function readSummary(aoa: Aoa, r: number, cs: number, to: number) {
  const header = aoa[r] ?? [];
  const cLeads = findCol(header, isLeads, cs + 1, to);
  const cSpend = findCol(header, isSpend, cs + 1, to);
  const cCpl = findCol(header, isCpl, cs + 1, to);
  const countCols: [number, string][] = [];
  for (let c = cs + 1; c < Math.min(to, header.length); c++) {
    if (c !== cLeads && c !== cSpend && c !== cCpl && !blank(header[c])) countCols.push([c, String(header[c]).trim()]);
  }
  const rows: SummaryRow[] = [];
  const awareness: AwarenessTotal[] = [];
  let rr = r + 1;
  for (; rr < aoa.length; rr++) {
    const line = aoa[rr] ?? [];
    const name = String(line[cs] ?? '').trim();
    if (!name) break;
    const spend = cSpend >= 0 ? toNum(line[cSpend]) : 0;
    if (isAwareness(name, line[cLeads], line[cCpl])) {
      awareness.push({campaign: name, reach: toNum(line[cLeads]), spend, costPer1k: cCpl >= 0 ? toNum(line[cCpl]) || null : null});
      continue;
    }
    const leads = cLeads >= 0 ? toNum(line[cLeads]) : 0;
    rows.push({
      campaign: name,
      leads,
      spend,
      cpl: leads ? spend / leads : null,
      counts: Object.fromEntries(countCols.map(([c, label]) => [label, toCount(line[c])])),
    });
  }
  return {rows, awareness, columns: countCols.map(([, label]) => label), end: rr};
}

/**
 * Vasudha's layout — one table, one row per campaign per day:
 *   [Date] | Campaign Name | Leads | Cost per Lead | Amount Spent | Total Amount Spent
 * With a Date column, the date is written on the first row of each day. Without one, a new day starts
 * where "Total Amount Spent" is filled in or a campaign repeats, and dates are assigned afterwards.
 * A summary table can follow to the right, or below (a second "Campaign Name" header row).
 */
function parseTable(aoa: Aoa, warnings: string[]) {
  const headerIdx = aoa.findIndex((row) => row.some((c) => isCampaign(norm(c))) && row.some((c) => isLeads(norm(c))));
  if (headerIdx < 0) return null;

  const header = aoa[headerIdx];
  const cCampaign = findCol(header, isCampaign);
  const cDate = findCol(header, isDate, 0, cCampaign + 1);
  const cLeads = findCol(header, isLeads, cCampaign);
  const cCpl = findCol(header, isCpl, cCampaign);
  const cSpend = findCol(header, isSpend, cCampaign);
  const cTotal = findCol(header, isDayTotal, cCampaign);
  if (cLeads < 0 || cSpend < 0) return null;
  const mainEnd = Math.max(cCampaign, cLeads, cSpend, cTotal) + 1;

  // The daily rows end where a summary table starts below them (its own "Campaign Name" header).
  let stop = aoa.findIndex((row, i) => i > headerIdx && isCampaign(norm(row?.[cCampaign] ?? null)));
  if (stop < 0) stop = aoa.length;
  const body = aoa.slice(headerIdx + 1, stop);
  const rows: DailyRow[] = [];
  const groups: Undated[][] = [];
  const awareness: AwarenessRow[] = [];

  if (cDate >= 0) {
    const order = guessOrder(body.map((r) => r?.[cDate] ?? null));
    let current: string | null = null;
    body.forEach((row = [], i) => {
      const d = toDate(row[cDate] ?? null, order);
      if (d) current = d;
      else if (!blank(row[cDate])) warnings.push(`Row ${headerIdx + i + 2}: could not read date "${row[cDate]}".`);
      const campaign = String(row[cCampaign] ?? '').trim();
      if (!campaign || (blank(row[cLeads]) && blank(row[cSpend]))) return;
      if (!current) {
        warnings.push(`Row ${headerIdx + i + 2}: "${campaign}" has no date above it — skipped.`);
        return;
      }
      if (isAwareness(campaign, row[cLeads], row[cCpl])) {
        awareness.push({
          date: current,
          campaign,
          reach: toNum(row[cLeads]),
          spend: toNum(row[cSpend]),
          costPer1k: cCpl >= 0 ? toNum(row[cCpl]) || null : null,
        });
        return;
      }
      rows.push(makeRow(current, campaign, toNum(row[cLeads]), toNum(row[cSpend])));
    });
  } else {
    let group: Undated[] = [];
    for (const row of body) {
      const campaign = String(row?.[cCampaign] ?? '').trim();
      if (!campaign || (blank(row[cLeads]) && blank(row[cSpend]))) continue;
      const repeats = group.some((g) => campaignKey(g.campaign) === campaignKey(campaign));
      if (group.length && (repeats || (cTotal >= 0 && !blank(row[cTotal])))) {
        groups.push(group);
        group = [];
      }
      if (isAwareness(campaign, row[cLeads], row[cCpl])) {
        warnings.push(`“${campaign}” skipped — awareness rows need a Date column to be placed on a day.`);
        continue;
      }
      const leads = toNum(row[cLeads]);
      const spend = toNum(row[cSpend]);
      group.push({campaign, leads, spend, cpl: leads > 0 ? spend / leads : null});
    }
    if (group.length) groups.push(group);
  }

  let summary: ReturnType<typeof readSummary> | null = null;
  let summaryTitle: string | null = null;
  if (stop < aoa.length) {
    // Below: the label sits left of the first campaign (e.g. "Sep"), or above the header.
    summary = readSummary(aoa, stop, cCampaign, aoa[stop].length);
    const first = aoa[stop + 1] ?? [];
    const label = first.slice(0, cCampaign).find((c) => !blank(c)) ?? aoa[stop - 1]?.[cCampaign];
    if (!blank(label)) summaryTitle = String(label).trim();
  } else {
    // To the right: its own "Campaign Name" header further along a row; the title is the cell above it.
    for (let r = 0; r < aoa.length; r++) {
      const row = aoa[r] ?? [];
      const cs = findCol(row, isCampaign, mainEnd);
      if (cs < 0) continue;
      const end = row.findIndex((c, i) => i > cs && blank(c));
      summary = readSummary(aoa, r, cs, end < 0 ? row.length : end);
      const above = aoa[r - 1]?.[cs];
      if (!blank(above)) summaryTitle = String(above).trim();
      break;
    }
  }
  return {
    rows,
    groups,
    awareness,
    summary: summary?.rows ?? [],
    summaryColumns: summary?.columns ?? [],
    awarenessSummary: summary?.awareness ?? [],
    summaryTitle,
  };
}

/**
 * Babu's layout — one block per campaign:
 *   Cyber Security-WS | Totals | ...
 *   Date | Day | Amount Spent (Rs) | Leads | CPL (Rs)
 *   9/1/2026 | Tuesday | 0 | 0 | 0
 * The campaign name is the cell above the "Date" header.
 */
function parseBlocks(aoa: Aoa, warnings: string[]) {
  const rows: DailyRow[] = [];
  aoa.forEach((row = [], r) => {
    row.forEach((cell, c) => {
      if (!isDate(norm(cell))) return;
      if (findCol(row, isCampaign, c, c + 6) >= 0) return; // that's the table layout
      const cSpend = findCol(row, isSpend, c + 1, c + 6);
      const cLeads = findCol(row, isLeads, c + 1, c + 6);
      if (cSpend < 0 || cLeads < 0) return;
      const cDay = findCol(row, (h) => h === 'day', c + 1, c + 6);
      const campaign = String(aoa[r - 1]?.[c] ?? '').trim() || `Campaign ${rows.length + 1}`;

      let end = r + 1;
      while (end < aoa.length && !blank(aoa[end]?.[c])) end++;
      const body = aoa.slice(r + 1, end);
      const order = guessOrder(
        body.map((b) => b?.[c] ?? null),
        cDay >= 0 ? body.map((b) => b?.[cDay] ?? null) : undefined,
      );
      body.forEach((b = [], i) => {
        const d = toDate(b[c] ?? null, order);
        if (!d) {
          warnings.push(`${campaign}, row ${r + i + 2}: could not read date "${b[c]}".`);
          return;
        }
        const spend = toNum(b[cSpend]);
        const leads = toNum(b[cLeads]);
        if (spend === 0 && leads === 0) return; // not running / future day
        rows.push(makeRow(d, campaign, leads, spend));
      });
    });
  });
  return rows;
}

const colIndex = (letters: string) => letters.toUpperCase().split('').reduce((n, ch) => n * 26 + ch.charCodeAt(0) - 64, 0) - 1;

/** Use the first spelling seen for each campaign so "BTech 4years Roadmap" and "BTech 4 Years Roadmap" merge. */
function unifyNames(rows: {campaign: string}[]) {
  const names = new Map<string, string>();
  for (const r of rows) {
    const k = campaignKey(r.campaign);
    if (!names.has(k)) names.set(k, r.campaign);
    r.campaign = names.get(k)!;
  }
}

const sameDay = (a: Undated[], b: DailyRow[]) =>
  a.length === b.length &&
  a.every((x) => b.some((y) => campaignKey(y.campaign) === campaignKey(x.campaign) && y.leads === x.leads && Math.abs(y.spend - x.spend) < 0.01));

/** First day's date for an undated sheet: line it up with data already on the dashboard, else end yesterday. */
function guessStart(groups: Undated[][], reference?: Dataset): Pick<UndatedDays, 'start' | 'startSource'> {
  if (reference) {
    const dates = [...new Set(reference.rows.map((r) => r.date))];
    for (let k = 0; k < groups.length; k++) {
      for (const d of dates) {
        if (sameDay(groups[k], reference.rows.filter((r) => r.date === d))) return {start: addDays(d, -k), startSource: 'matched'};
      }
    }
  }
  const t = new Date();
  const today = iso(t.getFullYear(), t.getMonth(), t.getDate());
  return {start: addDays(today, -groups.length), startSource: 'estimated'};
}

/** Give each day group of an undated sheet its date, starting at `start`. */
export function assignDates(groups: Undated[][], start: string): DailyRow[] {
  return groups.flatMap((g, i) => g.map((r) => ({...r, date: addDays(start, i)})));
}

/** Thrown when a file is readable but isn't the layout this person's upload expects (e.g. the other person's file). */
export class WrongLayoutError extends Error {}

type SheetScan = {
  rows: DailyRow[];
  groups: Undated[][];
  summary: SummaryRow[];
  summaryTitle: string | null;
  summaryColumns: string[];
  awareness: AwarenessRow[];
  awarenessSummary: AwarenessTotal[];
  used: string[];
  layout: 'blocks' | 'table' | null;
  hadDateColumn: boolean;
};

function scanSheets(wb: XLSX.WorkBook, sheetNames: string[], columns: [string, string] | undefined, warnings: string[]): SheetScan {
  const out: SheetScan = {
    rows: [],
    groups: [],
    summary: [],
    summaryTitle: null,
    summaryColumns: [],
    awareness: [],
    awarenessSummary: [],
    used: [],
    layout: null,
    hadDateColumn: false,
  };
  for (const sheetName of sheetNames) {
    let aoa = XLSX.utils.sheet_to_json<Cell[]>(wb.Sheets[sheetName], {header: 1, raw: true, defval: null, blankrows: true});
    if (columns) {
      const [from, to] = columns.map(colIndex);
      aoa = aoa.map((r) => (r ?? []).slice(from, to + 1));
    }
    const table = parseTable(aoa, warnings);
    const found = table ? table.rows : parseBlocks(aoa, warnings);
    if (!found.length && !table?.groups.length) continue;
    out.used.push(sheetName);
    out.rows.push(...found);
    out.layout ??= table ? 'table' : 'blocks';
    if (table) {
      out.hadDateColumn ||= table.rows.length > 0;
      out.groups.push(...table.groups);
      out.summary.push(...table.summary);
      out.summaryTitle ??= table.summaryTitle;
      out.summaryColumns.push(...table.summaryColumns.filter((c) => !out.summaryColumns.includes(c)));
      out.awareness.push(...table.awareness);
      out.awarenessSummary.push(...table.awarenessSummary);
    }
  }
  return out;
}

const LAYOUT_NAMES = {
  blocks: 'one block per campaign (Date | Day | Amount Spent | Leads | CPL)',
  table: 'one Campaign Name | Leads | Cost per Lead | Amount Spent table',
};

/**
 * Read a workbook for one person. The file is recognised by its contents, not its name: preferred tab and
 * columns are tried first, then the rest of the workbook. `checks` lists what was found, for the admin to confirm.
 */
export async function parseWorkbook(file: File, source: OwnerSource, reference?: Dataset): Promise<ParseResult> {
  const wb = XLSX.read(await file.arrayBuffer(), {cellDates: true});
  return parseWorkbookData(wb, file.name, source, reference);
}

/** Build a workbook from raw cell values (e.g. rows fetched from Google Sheets) so it goes through the same parser. */
export function workbookFromValues(sheets: {name: string; values: Cell[][]}[]) {
  const wb = XLSX.utils.book_new();
  for (const s of sheets) XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(s.values), s.name.slice(0, 31));
  return wb;
}

export function parseWorkbookData(wb: XLSX.WorkBook, fileName: string, source: OwnerSource, reference?: Dataset): ParseResult {
  const warnings: string[] = [];
  const checks: string[] = [];

  // Try the most specific place first, then widen.
  const preferredSheets = source.sheet ? wb.SheetNames.filter((n) => source.sheet!.test(n)) : wb.SheetNames;
  const attempts: {sheets: string[]; columns?: [string, string]; note?: string}[] = [];
  if (preferredSheets.length) {
    if (source.columns) attempts.push({sheets: preferredSheets, columns: source.columns});
    attempts.push({
      sheets: preferredSheets,
      note: source.columns ? `Nothing in columns ${source.columns.join('–')}, so the whole ${source.sheetLabel ?? ''} tab was read.` : undefined,
    });
  }
  if (source.sheet) {
    attempts.push({
      sheets: wb.SheetNames,
      note: preferredSheets.length
        ? `The data wasn't in the ${source.sheetLabel} tab, so every tab was read.`
        : `No ${source.sheetLabel} tab in this file, so every tab was read.`,
    });
  }

  let scan: SheetScan | null = null;
  let attempt: (typeof attempts)[number] | null = null;
  let otherLayout: SheetScan['layout'] = null;
  for (const a of attempts) {
    const scratch: string[] = [];
    const s = scanSheets(wb, a.sheets, a.columns, scratch);
    if (!s.layout) continue;
    if (s.layout !== source.layout) {
      otherLayout ??= s.layout;
      continue;
    }
    scan = s;
    attempt = a;
    warnings.push(...scratch);
    break;
  }

  if (!scan || !attempt) {
    if (otherLayout) {
      throw new WrongLayoutError(
        `This file has ${LAYOUT_NAMES[otherLayout]}, but this upload expects ${LAYOUT_NAMES[source.layout]}.`,
      );
    }
    throw new Error(
      `Couldn't find the campaign data in this file. Expected ${LAYOUT_NAMES[source.layout]}` +
        (source.columns ? ` in columns ${source.columns.join('–')} of the ${source.sheetLabel} tab.` : '.'),
    );
  }

  // What was found — shown as a checklist so the admin knows it's the right file.
  if (attempt.note) warnings.push(attempt.note);
  checks.push(
    attempt.columns
      ? `Read the ${scan.used.join(', ')} tab, columns ${attempt.columns.join('–')}`
      : `Read ${scan.used.length === 1 ? `the ${scan.used[0]} tab` : `tabs ${scan.used.join(', ')}`}`,
  );

  const {rows, groups, summary, summaryTitle, summaryColumns, awareness, awarenessSummary} = scan;
  unifyNames([...rows, ...groups.flat(), ...summary, ...awareness, ...awarenessSummary]);

  // Same campaign + date twice (e.g. duplicated sheets) — keep the first.
  const seen = new Set<string>();
  const unique = rows.filter((r) => {
    const k = `${r.date}|${campaignKey(r.campaign)}`;
    if (seen.has(k)) {
      warnings.push(`Duplicate entry for ${r.campaign} on ${r.date} ignored.`);
      return false;
    }
    seen.add(k);
    return true;
  });

  let undated: UndatedDays | undefined;
  if (groups.length) {
    // Assign dates with excluded campaigns still in place so each day keeps its position; they're dropped just below.
    const kept = groups.map((g) => g.filter((r) => !isExcludedCampaign(r.campaign)));
    // Matching earlier data wins; otherwise the configured first day; otherwise an estimate.
    let {start, startSource} = guessStart(kept, reference);
    if (startSource === 'estimated' && source.firstDate) ({start, startSource} = {start: source.firstDate, startSource: 'configured'});
    unique.push(...assignDates(groups, start));
    undated = {groups: kept, start, startSource};
  }
  unique.sort((a, b) => a.date.localeCompare(b.date));

  const {dataset, removed} = dropExcluded({
    fileName,
    sheetName: scan.used.join(', '),
    uploadedAt: new Date().toISOString(),
    rows: unique,
    summary,
    summaryTitle,
    summaryColumns,
    awareness,
    awarenessSummary,
  });
  if (!dataset.rows.length) throw new Error('This file only contains campaigns that are left out of the dashboard.');

  const names = [...new Set(dataset.rows.map((r) => r.campaign))];
  checks.push(`${names.length} ${source.unit}${names.length === 1 ? '' : 's'}: ${names.join(', ')}`);
  if (removed.length) checks.push(`Left out as planned: ${removed.join(', ')}`);
  for (const want of source.expectCampaigns ?? []) {
    if (!names.some((n) => campaignKey(n).startsWith(campaignKey(want)))) warnings.push(`No “${want}” campaign found in this file.`);
  }
  if (undated) {
    checks.push(
      `No Date column — rows split into ${undated.groups.length} days` +
        (undated.startSource === 'estimated' ? ' (confirm the first date below)' : `, starting ${undated.start}`),
    );
  }
  else checks.push(`Dates read from the sheet (${new Set(dataset.rows.map((r) => r.date)).size} days with spend or leads)`);
  const awarenessNames = [...new Set([...awareness, ...awarenessSummary].map((a) => a.campaign))];
  if (awarenessNames.length) checks.push(`Shown separately, not counted in spend or leads: ${awarenessNames.join(', ')} (reach)`);
  if (summary.length) {
    const cols = summaryColumns.filter((c) => summary.some((s) => s.counts[c] != null));
    checks.push(
      `Summary table${summaryTitle ? ` “${summaryTitle}”` : ''}: ${summary.length} campaigns` +
        (cols.length ? `, with ${cols.join(', ')} filled in` : ''),
    );
  }

  return {dataset, warnings, checks, undated};
}

const OLD_FUNNEL_FIELDS: [string, string][] = [
  ['interested', 'No. of Interested'],
  ['registered', 'No. of Registered'],
  ['attended', 'No. of Attended for demo'],
  ['positives', 'Positives'],
  ['conversions', 'Conversions'],
];

/** Bring data saved by an older version of the dashboard (uploads, saved copy) up to the current shape. */
export function normalizeDataset(ds: Dataset): Dataset {
  const columns = new Set(ds.summaryColumns ?? []);
  const summary = (ds.summary ?? []).map((s) => {
    if (s.counts) return s;
    const old = s as unknown as Record<string, number | null>;
    const counts: Record<string, number | null> = {};
    for (const [field, label] of OLD_FUNNEL_FIELDS) {
      if (field in old) {
        counts[label] = old[field] ?? null;
        columns.add(label);
      }
    }
    return {campaign: s.campaign, leads: s.leads, spend: s.spend, cpl: s.cpl, counts};
  });
  return {...ds, summary, summaryColumns: [...columns], awareness: ds.awareness ?? [], awarenessSummary: ds.awarenessSummary ?? []};
}

/** Remove excluded campaigns (see owners.ts). */
export function dropExcluded(ds: Dataset): {dataset: Dataset; removed: string[]} {
  const removed = [...new Set([...ds.rows, ...ds.summary].filter((r) => isExcludedCampaign(r.campaign)).map((r) => r.campaign))];
  if (!removed.length) return {dataset: ds, removed};
  return {
    dataset: {
      ...ds,
      rows: ds.rows.filter((r) => !isExcludedCampaign(r.campaign)),
      summary: ds.summary.filter((r) => !isExcludedCampaign(r.campaign)),
    },
    removed,
  };
}
