import type {DailyRow} from './types';

export interface CampaignStat {
  campaign: string;
  leads: number;
  spend: number;
  cpl: number | null;
  spendShare: number;
  leadShare: number;
  activeDays: number;
  zeroLeadDays: number;
}

export interface DayStat {
  date: string;
  leads: number;
  spend: number;
  cpl: number | null;
  /** per-campaign values keyed by `leads:<name>` and `spend:<name>` */
  [key: string]: number | string | null;
}

/** Campaigns in order of first appearance — this order fixes each campaign's colour. */
export function campaignOrder(rows: DailyRow[]) {
  const seen: string[] = [];
  for (const r of rows) if (!seen.includes(r.campaign)) seen.push(r.campaign);
  return seen;
}

export function dateRange(rows: DailyRow[]) {
  return [...new Set(rows.map((r) => r.date))].sort();
}

/** Every calendar day from `start` to `end` inclusive (ISO dates). */
export function daysBetween(start: string, end: string) {
  const out: string[] = [];
  const [y, m, d] = start.split('-').map(Number);
  for (let t = new Date(y, m - 1, d); ; t.setDate(t.getDate() + 1)) {
    const s = `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;
    if (s > end) break;
    out.push(s);
  }
  return out;
}

export function analyse(rows: DailyRow[], campaigns: string[], days = dateRange(rows)) {
  const leads = rows.reduce((s, r) => s + r.leads, 0);
  const spend = rows.reduce((s, r) => s + r.spend, 0);

  const byCampaign: CampaignStat[] = campaigns
    .map((campaign) => {
      const rs = rows.filter((r) => r.campaign === campaign);
      const l = rs.reduce((s, r) => s + r.leads, 0);
      const sp = rs.reduce((s, r) => s + r.spend, 0);
      return {
        campaign,
        leads: l,
        spend: sp,
        cpl: l > 0 ? sp / l : null,
        spendShare: spend ? sp / spend : 0,
        leadShare: leads ? l / leads : 0,
        activeDays: new Set(rs.map((r) => r.date)).size,
        zeroLeadDays: rs.filter((r) => r.leads === 0 && r.spend > 0).length,
      };
    })
    .filter((c) => c.activeDays > 0);

  const byDay: DayStat[] = days.map((date) => {
    const rs = rows.filter((r) => r.date === date);
    const l = rs.reduce((s, r) => s + r.leads, 0);
    const sp = rs.reduce((s, r) => s + r.spend, 0);
    const d: DayStat = {date, leads: l, spend: sp, cpl: l > 0 ? sp / l : null};
    for (const c of campaigns) {
      const cr = rs.filter((r) => r.campaign === c);
      d[`leads:${c}`] = cr.length ? cr.reduce((s, r) => s + r.leads, 0) : null;
      d[`spend:${c}`] = cr.length ? cr.reduce((s, r) => s + r.spend, 0) : null;
    }
    return d;
  });

  const withLeads = byCampaign.filter((c) => c.cpl != null);
  const best = withLeads.reduce<CampaignStat | null>((b, c) => (!b || c.cpl! < b.cpl! ? c : b), null);
  const worst = withLeads.reduce<CampaignStat | null>((b, c) => (!b || c.cpl! > b.cpl! ? c : b), null);
  const zeroLeadSpend = rows.filter((r) => r.leads === 0).reduce((s, r) => s + r.spend, 0);
  const peakDay = byDay.reduce<DayStat | null>((b, d) => (!b || d.leads > b.leads ? d : b), null);

  return {
    leads,
    spend,
    cpl: leads ? spend / leads : null,
    days,
    avgDailySpend: days.length ? spend / days.length : 0,
    avgDailyLeads: days.length ? leads / days.length : 0,
    zeroLeadSpend,
    byCampaign,
    byDay,
    best,
    worst,
    peakDay,
  };
}
