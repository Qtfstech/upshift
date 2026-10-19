export interface DailyRow {
  /** ISO date (yyyy-mm-dd) */
  date: string;
  campaign: string;
  leads: number;
  spend: number;
  /** Cost per lead (null when there were no leads) */
  cpl: number | null;
}

/**
 * Awareness campaigns report reach ("53,326- Reach", "3.06- Per 1k People") instead of leads. They're kept
 * out of spend / leads / cost-per-lead and shown on their own.
 */
export interface AwarenessRow {
  date: string;
  campaign: string;
  reach: number;
  spend: number;
  /** Cost per 1,000 people reached, as reported */
  costPer1k: number | null;
}

/** Awareness line in a summary table (period total, no date). */
export type AwarenessTotal = Omit<AwarenessRow, 'date'>;

/**
 * Summary table in Vasudha's sheet (to the right of, or below, the daily rows): per-campaign totals plus
 * whatever funnel columns the sheet has — e.g. Interested / Registered, or Conversions / Hot leads / Warm leads.
 */
export interface SummaryRow {
  campaign: string;
  leads: number;
  spend: number;
  cpl: number | null;
  /** Funnel counts keyed by the column heading as written in the sheet; null when the cell is blank */
  counts: Record<string, number | null>;
}

export interface Dataset {
  fileName: string;
  sheetName: string;
  uploadedAt: string;
  rows: DailyRow[];
  summary: SummaryRow[];
  summaryTitle: string | null;
  /** Funnel column headings of the summary table, in sheet order */
  summaryColumns: string[];
  awareness: AwarenessRow[];
  awarenessSummary: AwarenessTotal[];
}

/** A sheet with no Date column: rows are grouped into days, and the admin confirms the first day's date. */
export interface UndatedDays {
  groups: Omit<DailyRow, 'date'>[][];
  start: string;
  /** How `start` was worked out, shown to the admin */
  startSource: 'matched' | 'configured' | 'estimated';
}

export interface ParseResult {
  dataset: Dataset;
  warnings: string[];
  /** What was found in the file, shown to the admin as a checklist */
  checks: string[];
  undated?: UndatedDays;
}

// ---- Sales sheet (one tab per workshop / campaign) ----

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
