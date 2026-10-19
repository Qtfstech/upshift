/** Where each person's figures live in their Excel file. */
/**
 * Where each person's figures live in their Excel file. Files are recognised by their contents, never by
 * file name (names change when files are downloaded and re-uploaded).
 */
export interface OwnerSource {
  /** Usual file name, shown on the admin page for reference only */
  fileHint: string;
  /** "blocks": one Date/Day/Amount Spent/Leads block per campaign. "table": one Campaign Name table. */
  layout: 'blocks' | 'table';
  /** Prefer sheets whose name matches (falls back to every sheet) */
  sheet?: RegExp;
  sheetLabel?: string;
  /** Prefer this column range, e.g. ['AF', 'AP'] (falls back to the whole sheet) */
  columns?: [string, string];
  /** Campaigns the file should contain; missing ones are flagged in the upload check */
  expectCampaigns?: string[];
  /** For a sheet with no Date column: the date of its first day (used when it can't be matched to earlier data) */
  firstDate?: string;
  /** What each line of spend is called on the dashboard: Babu runs workshops, Vasudha runs campaigns */
  unit: 'workshop' | 'campaign';
}

/** People whose ad-spend sheets feed the CEO dashboard. Add an entry here to add another upload slot + section. */
export const OWNERS = [
  {
    id: 'babu',
    name: 'Babu',
    source: {
      fileHint: 'QT Career campaign - Babu',
      layout: 'blocks',
      unit: 'workshop',
      sheet: /report/i,
      sheetLabel: 'Reports',
      expectCampaigns: ['Cyber Security', 'Robotics', 'Content Creation'],
    },
  },
  {
    id: 'vasudha',
    name: 'Vasudha',
    source: {fileHint: 'QT Hitech City META AD SPENT', layout: 'table', unit: 'campaign', firstDate: '2026-09-18'},
  },
] as const satisfies readonly {id: string; name: string; source: OwnerSource}[];

export type OwnerId = (typeof OWNERS)[number]['id'];

export const ownerById = (id: OwnerId) => OWNERS.find((o) => o.id === id)!;

/** Campaigns left out of the dashboard entirely (matched ignoring case, spaces and suffixes like "-A1"). */
const EXCLUDED_CAMPAIGNS = ['Master Class'];

const squash = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
export const isExcludedCampaign = (name: string) => EXCLUDED_CAMPAIGNS.some((x) => squash(name).startsWith(squash(x)));
