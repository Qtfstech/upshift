import {Clock, Eye, IndianRupee, Megaphone, Users} from 'lucide-react';
import {useMemo, type ReactNode} from 'react';
import {analyse, campaignOrder, daysBetween} from '../data/analytics';
import {fmtDate, fmtDay, fmtInr, fmtInr2, fmtInrShort, fmtInt, fmtMonth, fmtPct, prevDay} from '../data/format';
import type {OwnerData} from '../data/store';
import type {ChartTheme} from '../theme';
import {CampaignBars, ChartCard, Legend, Sparkline, StackedDaily} from './charts';

/** Metrics from the CEO sheet that have no data source yet. */
const PENDING_METRICS = [
  {name: 'Qualified Leads', view: 'Count + qualification rate'},
  {name: 'Counselling Calls', view: 'Booked / completed'},
  {name: 'Registrations', view: 'Count + product'},
  {name: 'Revenue Booked', view: 'Contracted sales value'},
  {name: 'Revenue Collected', view: 'Actual cash received'},
  {name: 'Pending Collection', view: 'Outstanding amount'},
  {name: 'CAC', view: 'Spend ÷ acquired customer'},
  {name: 'Conversion', view: 'Lead → paid customer'},
];

function Delta({now, before, format, label}: {now: number; before: number | null; format: (n: number) => string; label: string}) {
  if (before == null) return <span className="db-faint">No data for {label}</span>;
  const diff = now - before;
  if (diff === 0) return <span className="db-faint">Same as {label}</span>;
  return (
    <span className="db-muted">
      {diff > 0 ? '▲' : '▼'} {format(Math.abs(diff))} vs {label}
    </span>
  );
}

export type ViewMode = 'day' | 'month';

/** "2026-09" -> "2026-08" */
const prevMonthKey = (m: string) => {
  const [y, mo] = m.split('-').map(Number);
  return mo === 1 ? `${y - 1}-12` : `${y}-${String(mo - 1).padStart(2, '0')}`;
};

/** Last day of a "YYYY-MM" month as an ISO date */
const monthEnd = (m: string) => {
  const [y, mo] = m.split('-').map(Number);
  return `${m}-${String(new Date(y, mo, 0).getDate()).padStart(2, '0')}`;
};

function Breakdown({items, format}: {items: {name: string; color: string; value: number}[]; format: (n: number) => string}) {
  if (!items.length) return null;
  const max = Math.max(...items.map((i) => i.value), 1);
  return (
    <ul className="flex flex-col gap-1.5 mt-1 pt-3 border-t" style={{borderColor: 'var(--border)'}}>
      {items.map((i) => (
        <li key={i.name} className="text-[12px]">
          <div className="flex justify-between gap-3">
            <span className="flex items-center gap-1.5 db-muted min-w-0">
              <span className="db-swatch" style={{background: i.color}} />
              <span className="truncate">{i.name}</span>
            </span>
            <span className="font-medium">{format(i.value)}</span>
          </div>
          <div className="h-1 rounded-full mt-1" style={{background: 'var(--surface-2)'}}>
            <div className="h-1 rounded-full" style={{width: `${(i.value / max) * 100}%`, background: i.color}} />
          </div>
        </li>
      ))}
    </ul>
  );
}

function MetricCard({
  icon,
  name,
  view,
  value,
  children,
  spark,
  sparkColor,
}: {
  icon: ReactNode;
  name: string;
  view: string;
  value: string;
  children?: ReactNode;
  spark?: number[];
  sparkColor?: string;
}) {
  return (
    <div className="db-card p-4 flex flex-col gap-2 min-w-0">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-[13px] font-semibold">
            <span className="db-faint">{icon}</span>
            {name}
          </div>
          <div className="text-[11px] db-faint mt-0.5">{view}</div>
        </div>
        {spark && sparkColor && <Sparkline values={spark} color={sparkColor} />}
      </div>
      <div className="text-[28px] leading-tight font-semibold truncate" title={value}>
        {value}
      </div>
      {children}
    </div>
  );
}

export default function OwnerSection({
  id,
  name,
  data,
  unit,
  mode,
  period: reportDate,
  theme,
}: {
  id: string;
  name: string;
  data: OwnerData;
  /** "workshop" (Babu) or "campaign" (Vasudha) — used in labels */
  unit: 'workshop' | 'campaign';
  mode: ViewMode;
  /** ISO date in day mode, "YYYY-MM" in month mode */
  period: string;
  theme: ChartTheme;
}) {
  const {dataset, isSample} = data;
  const Unit = unit[0].toUpperCase() + unit.slice(1);
  const month = reportDate.slice(0, 7);
  const monthly = mode === 'month';
  // "day" below is the selected period (a day, or a whole month in month mode); "prev" is the one before it.
  const prevKey = monthly ? prevMonthKey(month) : prevDay(reportDate);
  const curLabel = monthly ? fmtMonth(month) : fmtDay(reportDate);
  const prevLabel = monthly ? fmtMonth(prevKey) : fmtDay(prevKey);

  const campaigns = useMemo(() => campaignOrder(dataset.rows), [dataset]);
  const colorOf = useMemo(() => {
    const map = new Map(campaigns.map((c, i) => [c, theme.series[i] ?? theme.other]));
    return (c: string) => map.get(c) ?? theme.other;
  }, [campaigns, theme]);

  const {day, prev, mtd, lastEntry, hasDay, hasPrev} = useMemo(() => {
    const rows = dataset.rows;
    const inPeriod = (date: string, key: string) => (monthly ? date.startsWith(key) : date === key);
    const dayRows = rows.filter((r) => inPeriod(r.date, monthly ? month : reportDate));
    const prevRows = rows.filter((r) => inPeriod(r.date, prevKey));
    // Chart/context range: month to date in day mode, the whole month in month mode.
    const last = monthly ? monthEnd(month) : reportDate;
    const mtdRows = rows.filter((r) => r.date.startsWith(month) && r.date <= last);
    return {
      day: analyse(dayRows, campaigns),
      prev: analyse(prevRows, campaigns),
      mtd: analyse(mtdRows, campaigns, daysBetween(`${month}-01`, last)),
      lastEntry: rows.length ? rows[rows.length - 1].date : null,
      hasDay: dayRows.length > 0,
      hasPrev: prevRows.length > 0,
    };
  }, [dataset, campaigns, reportDate, prevKey, month, monthly]);

  const mtdLegend = mtd.byCampaign.map((c) => ({name: c.campaign, color: colorOf(c.campaign)}));
  const dayBreak = (key: 'spend' | 'leads') =>
    day.byCampaign
      .filter((c) => c[key] > 0)
      .sort((a, b) => b[key] - a[key])
      .map((c) => ({name: c.campaign, color: colorOf(c.campaign), value: c[key]}));
  const monthLabel = fmtMonth(month);
  const ctxLabel = monthly ? monthLabel : `${monthLabel} to date`;

  // Awareness rows for the selected day/month and for the month-to-date (or whole month) context.
  const awareness = dataset.awareness ?? [];
  const awarenessCur = awareness.filter((a) => (monthly ? a.date.startsWith(month) : a.date === reportDate));
  const awarenessCtx = awareness.filter((a) => a.date.startsWith(month) && (monthly || a.date <= reportDate));
  const awarenessNames = [...new Set([...awareness.map((a) => a.campaign), ...(dataset.awarenessSummary ?? []).map((a) => a.campaign)])];
  const sumAwareness = (list: typeof awareness) => ({
    count: list.length,
    reach: list.reduce((t, a) => t + a.reach, 0),
    spend: list.reduce((t, a) => t + a.spend, 0),
  });
  const activeDays = new Set(dataset.rows.filter((r) => r.date.startsWith(month)).map((r) => r.date)).size;
  /** Second line under each headline number: month to date in day mode, daily average in month mode. */
  const context = (total: string, perDay: string) =>
    monthly ? (
      <span className="db-muted">
        {activeDays} active days · avg <b style={{color: 'var(--text)'}}>{perDay}</b>/day
      </span>
    ) : (
      <span className="db-muted">
        {ctxLabel}: <b style={{color: 'var(--text)'}}>{total}</b>
      </span>
    );

  // Funnel counts from the sheet's summary table (period totals, e.g. "Sep-17th to Sep-22nd" — not daily).
  const period = dataset.summaryTitle ?? 'sheet summary';
  /** Total of the summary column whose heading matches, or null if the sheet has no such column / it's empty. */
  const funnelSum = (pattern: RegExp) => {
    const col = dataset.summaryColumns.find((c) => pattern.test(c));
    if (!col || !dataset.summary.some((s) => s.counts[col] != null)) return null;
    return dataset.summary.reduce((t, s) => t + (s.counts[col] ?? 0), 0);
  };
  const summaryLeads = dataset.summary.reduce((t, s) => t + s.leads, 0);
  const summarySpend = dataset.summary.reduce((t, s) => t + s.spend, 0);
  const ofLeads = (n: number) => (summaryLeads ? ` · ${fmtPct(n / summaryLeads)} of ${fmtInt(summaryLeads)} leads` : '');
  function funnelValue(metric: string): {value: string; note: string} | null {
    const interested = funnelSum(/interest/i);
    const hot = funnelSum(/hot/i);
    const warm = funnelSum(/warm/i);
    const registered = funnelSum(/regist/i);
    const conversions = funnelSum(/conversion/i);
    const attended = funnelSum(/attend/i);
    const positives = funnelSum(/positive/i);
    switch (metric) {
      case 'Qualified Leads':
        if (interested != null) return {value: fmtInt(interested), note: `Interested${ofLeads(interested)} · ${period}`};
        if (hot == null && warm == null) return null;
        return {
          value: fmtInt((hot ?? 0) + (warm ?? 0)),
          note: `Hot ${hot ?? 0} + warm ${warm ?? 0} leads${ofLeads((hot ?? 0) + (warm ?? 0))} · ${period}`,
        };
      case 'Counselling Calls':
        return attended == null && positives == null
          ? null
          : {value: attended == null ? '—' : fmtInt(attended), note: `Attended demo${positives != null ? ` · ${fmtInt(positives)} positives` : ''} · ${period}`};
      case 'Registrations':
        return registered == null ? null : {value: fmtInt(registered), note: `Registered · ${period}`};
      case 'Conversion':
        return conversions == null ? null : {value: fmtInt(conversions), note: `Converted${ofLeads(conversions)} · ${period}`};
      case 'CAC':
        return conversions ? {value: fmtInr(summarySpend / conversions), note: `${fmtInr(summarySpend)} ÷ ${conversions} conversions · ${period}`} : null;
      default:
        return null;
    }
  }

  return (
    <section id={id} className="flex flex-col gap-4 scroll-mt-20">
      {/* Section header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full grid place-items-center text-[16px] font-semibold"
            style={{background: 'var(--accent-soft)', color: 'var(--accent)'}}
          >
            {name[0]}
          </div>
          <div>
            <h2 className="text-[20px] font-semibold leading-tight">{name}</h2>
            <p className="text-[12px] db-faint">
              {Unit} ad spend · {dataset.fileName} · last entry {lastEntry ? fmtDate(lastEntry) : '—'}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 text-[12px] font-medium">
          {isSample && (
            <span className="px-2.5 py-1 rounded-full" style={{background: 'var(--surface-2)', color: 'var(--text-2)'}}>
              Sample data
            </span>
          )}
          {!hasDay && (
            <span className="px-2.5 py-1 rounded-full inline-flex items-center gap-1.5" style={{background: 'var(--warn-soft)', color: 'var(--warn)'}}>
              <Clock size={12} /> No {monthly ? 'data' : 'entry'} for {curLabel}
            </span>
          )}
        </div>
      </div>

      {/* Metrics with data */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
        <MetricCard
          icon={<Megaphone size={15} />}
          name="Ad Spend"
          view={`₹ amount + ${unit} · ${curLabel}`}
          value={hasDay ? fmtInr(day.spend) : '—'}
          spark={mtd.byDay.map((d) => d.spend)}
          sparkColor={theme.accent}
        >
          <div className="text-[12px] flex flex-col gap-0.5">
            {hasDay && <Delta now={day.spend} before={hasPrev ? prev.spend : null} format={fmtInr} label={prevLabel} />}
            {context(fmtInr(mtd.spend), fmtInr(activeDays ? day.spend / activeDays : 0))}
          </div>
          <Breakdown items={dayBreak('spend')} format={fmtInr} />
        </MetricCard>
        <MetricCard
          icon={<Users size={15} />}
          name="Leads"
          view={`Total + ${unit} · ${curLabel}`}
          value={hasDay ? fmtInt(day.leads) : '—'}
          spark={mtd.byDay.map((d) => d.leads)}
          sparkColor={theme.accent}
        >
          <div className="text-[12px] flex flex-col gap-0.5">
            {hasDay && <Delta now={day.leads} before={hasPrev ? prev.leads : null} format={fmtInt} label={prevLabel} />}
            {context(fmtInt(mtd.leads), (activeDays ? day.leads / activeDays : 0).toFixed(1))}
          </div>
          <Breakdown items={dayBreak('leads')} format={fmtInt} />
        </MetricCard>
        <MetricCard
          icon={<IndianRupee size={15} />}
          name="Cost per Lead"
          view={`Spend ÷ leads · ${curLabel}`}
          value={hasDay && day.cpl != null ? fmtInr2(day.cpl) : '—'}
          spark={mtd.byDay.filter((d) => d.cpl != null).map((d) => d.cpl as number)}
          sparkColor={theme.accent}
        >
          <div className="text-[12px] flex flex-col gap-0.5">
            {hasDay && day.cpl != null && (
              <Delta now={day.cpl} before={hasPrev ? prev.cpl : null} format={fmtInr2} label={prevLabel} />
            )}
            {!monthly && (
              <span className="db-muted">
                {ctxLabel}: <b style={{color: 'var(--text)'}}>{mtd.cpl == null ? '—' : fmtInr2(mtd.cpl)}</b>
              </span>
            )}
          </div>
          <Breakdown
            items={day.byCampaign
              .filter((c) => c.cpl != null)
              .sort((a, b) => a.cpl! - b.cpl!)
              .map((c) => ({name: c.campaign, color: colorOf(c.campaign), value: c.cpl!}))}
            format={fmtInr2}
          />
        </MetricCard>
      </div>

      {/* Sales-funnel metrics: filled from the sheet's summary table where it has them, otherwise awaiting data */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {PENDING_METRICS.map((m) => {
          const f = funnelValue(m.name);
          return f ? (
            <div key={m.name} className="db-card p-3.5 flex flex-col gap-1">
              <div className="text-[13px] font-semibold">{m.name}</div>
              <div className="text-[11px] db-faint">{m.view}</div>
              <div className="text-[20px] font-semibold mt-1">{f.value}</div>
              <div className="text-[11px] db-muted">{f.note}</div>
            </div>
          ) : (
            <div key={m.name} className="rounded-xl p-3.5 flex flex-col gap-1" style={{border: '1px dashed var(--border)'}}>
              <div className="text-[13px] font-semibold">{m.name}</div>
              <div className="text-[11px] db-faint">{m.view}</div>
              <div className="text-[20px] font-semibold db-faint mt-1">—</div>
              <div className="text-[11px] db-faint">
                {m.name === 'CAC' && mtd.spend > 0 ? `Spend known (${fmtInrShort(mtd.spend)} ${monthly ? monthLabel : 'MTD'}) · needs customers` : 'Awaiting data'}
              </div>
            </div>
          );
        })}
        <div className="col-span-2 lg:col-span-4 rounded-xl p-3.5" style={{border: '1px dashed var(--border)'}}>
          <div className="text-[13px] font-semibold">Top 3 Blockers</div>
          <div className="text-[11px] db-faint">Problem + owner + deadline</div>
          <ol className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2 text-[12px] db-faint">
            {[1, 2, 3].map((n) => (
              <li key={n} className="rounded-lg px-3 py-2" style={{background: 'var(--surface-2)'}}>
                {n}. Awaiting data
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* Awareness (reach) campaigns — kept out of spend, leads and cost per lead */}
      {awarenessNames.length > 0 && (
        <ChartCard
          title="Awareness campaigns"
          subtitle="Reach campaigns · not included in Ad Spend, Leads or Cost per Lead above"
        >
          <div className="flex flex-col gap-3">
            {awarenessNames.map((nameA) => {
              const cur = sumAwareness(awarenessCur.filter((a) => a.campaign === nameA));
              const ctx = sumAwareness(awarenessCtx.filter((a) => a.campaign === nameA));
              const sheet = dataset.awarenessSummary.find((a) => a.campaign === nameA);
              return (
                <div key={nameA} className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-[13px] font-semibold">
                    <Eye size={15} className="db-faint" />
                    {nameA}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      [`Reach · ${curLabel}`, cur.count ? fmtInt(cur.reach) : '—'],
                      [`Spend · ${curLabel}`, cur.count ? fmtInr(cur.spend) : '—'],
                      ['Cost per 1k people', cur.count && cur.reach ? fmtInr2((cur.spend / cur.reach) * 1000) : '—'],
                      [
                        monthly ? `Days running · ${monthLabel}` : `Reach · ${ctxLabel}`,
                        monthly ? String(ctx.count) : ctx.count ? `${fmtInt(ctx.reach)} · ${fmtInr(ctx.spend)}` : '—',
                      ],
                    ].map(([k, v]) => (
                      <div key={k} className="rounded-lg px-3 py-2" style={{background: 'var(--surface-2)'}}>
                        <div className="text-[11px] uppercase tracking-wide db-faint">{k}</div>
                        <div className="text-[18px] font-semibold mt-0.5">{v}</div>
                      </div>
                    ))}
                  </div>
                  {sheet && (
                    <p className="text-[12px] db-muted">
                      Sheet summary ({period}): {fmtInt(sheet.reach)} reach · {fmtInr(sheet.spend)} spent
                      {sheet.costPer1k != null && ` · ${fmtInr2(sheet.costPer1k)} per 1k people`}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </ChartCard>
      )}

      {/* Charts — month to date */}
      {mtd.byCampaign.length > 0 && (
        <>
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <ChartCard
              className="xl:col-span-2"
              title={`Daily ad spend · ${monthLabel}`}
              subtitle={monthly ? `Stacked by ${unit}` : `Stacked by ${unit} · ${fmtDay(reportDate)} highlighted`}
              legend={<Legend items={mtdLegend} />}
            >
              <StackedDaily
                data={mtd.byDay}
                campaigns={campaigns}
                colorOf={colorOf}
                metric="spend"
                format={fmtInr}
                formatAxis={fmtInrShort}
                theme={theme}
                highlight={monthly ? undefined : reportDate}
                height={260}
              />
            </ChartCard>
            <ChartCard title={`Spend by ${unit}`} subtitle={ctxLabel}>
              <CampaignBars
                data={mtd.byCampaign}
                value={(c) => c.spend}
                colorOf={colorOf}
                format={fmtInrShort}
                theme={theme}
                extra={(c) => [
                  {name: 'Exact', value: fmtInr(c.spend)},
                  {name: 'Share', value: fmtPct(c.spendShare)},
                ]}
              />
            </ChartCard>
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <ChartCard
              className="xl:col-span-2"
              title={`Daily leads · ${monthLabel}`}
              subtitle={monthly ? `Stacked by ${unit}` : `Stacked by ${unit} · ${fmtDay(reportDate)} highlighted`}
              legend={<Legend items={mtdLegend} />}
            >
              <StackedDaily
                data={mtd.byDay}
                campaigns={campaigns}
                colorOf={colorOf}
                metric="leads"
                format={fmtInt}
                formatAxis={fmtInt}
                theme={theme}
                highlight={monthly ? undefined : reportDate}
                height={260}
              />
            </ChartCard>
            <ChartCard title={`Cost per lead by ${unit}`} subtitle={`${ctxLabel} · dashed = average`}>
              <CampaignBars
                data={mtd.byCampaign}
                value={(c) => c.cpl}
                colorOf={colorOf}
                format={fmtInrShort}
                theme={theme}
                reference={mtd.cpl}
                referenceLabel="Avg"
                extra={(c) => [
                  {name: 'Leads', value: fmtInt(c.leads)},
                  {name: 'Spend', value: fmtInr(c.spend)},
                ]}
              />
            </ChartCard>
          </div>

          {/* Campaign table */}
          <ChartCard title={`${Unit}s`} subtitle={monthly ? monthLabel : `${fmtDay(reportDate)} and ${monthLabel} to date`}>
            <div className="overflow-x-auto -mx-4 sm:-mx-5">
              <table className="db-table">
                <thead>
                  <tr>
                    <th className="pl-5">{Unit}</th>
                    {!monthly && (
                      <>
                        <th className="num">Spend · {fmtDay(reportDate)}</th>
                        <th className="num">Leads · {fmtDay(reportDate)}</th>
                        <th className="num">CPL · {fmtDay(reportDate)}</th>
                      </>
                    )}
                    <th className="num">Spend · {monthly ? monthLabel : 'MTD'}</th>
                    <th className="num">Leads · {monthly ? monthLabel : 'MTD'}</th>
                    <th className="num">CPL · {monthly ? monthLabel : 'MTD'}</th>
                    <th className="num">Share of spend</th>
                    {monthly && <th className="num">Days active</th>}
                  </tr>
                </thead>
                <tbody>
                  {[...mtd.byCampaign]
                    .sort((a, b) => b.spend - a.spend)
                    .map((c) => {
                      const d = day.byCampaign.find((x) => x.campaign === c.campaign);
                      return (
                        <tr key={c.campaign}>
                          <td className="pl-5">
                            <span className="flex items-center gap-2 font-medium">
                              <span className="db-swatch" style={{background: colorOf(c.campaign)}} />
                              {c.campaign}
                            </span>
                          </td>
                          {!monthly && (
                            <>
                              <td className="num">{d ? fmtInr(d.spend) : '—'}</td>
                              <td className="num">{d ? fmtInt(d.leads) : '—'}</td>
                              <td className="num">{d?.cpl != null ? fmtInr2(d.cpl) : '—'}</td>
                            </>
                          )}
                          <td className="num">{fmtInr(c.spend)}</td>
                          <td className="num">{fmtInt(c.leads)}</td>
                          <td className="num">{c.cpl == null ? '—' : fmtInr2(c.cpl)}</td>
                          <td className="num">{fmtPct(c.spendShare)}</td>
                          {monthly && <td className="num">{c.activeDays}</td>}
                        </tr>
                      );
                    })}
                </tbody>
                <tfoot>
                  <tr className="font-semibold">
                    <td className="pl-5">Total</td>
                    {!monthly && (
                      <>
                        <td className="num">{hasDay ? fmtInr(day.spend) : '—'}</td>
                        <td className="num">{hasDay ? fmtInt(day.leads) : '—'}</td>
                        <td className="num">{day.cpl != null ? fmtInr2(day.cpl) : '—'}</td>
                      </>
                    )}
                    <td className="num">{fmtInr(mtd.spend)}</td>
                    <td className="num">{fmtInt(mtd.leads)}</td>
                    <td className="num">{mtd.cpl == null ? '—' : fmtInr2(mtd.cpl)}</td>
                    <td className="num">100%</td>
                    {monthly && <td className="num">{activeDays}</td>}
                  </tr>
                </tfoot>
              </table>
            </div>
          </ChartCard>
        </>
      )}

      {/* Totals reported in the sheet itself */}
      {dataset.summary.length > 0 && (
        <ChartCard title="Sheet summary" subtitle={`${period} · as reported in the sheet`}>
          <div className="overflow-x-auto -mx-4 sm:-mx-5">
            <table className="db-table">
              <thead>
                <tr>
                  <th className="pl-5">Campaign</th>
                  <th className="num">Leads</th>
                  <th className="num">Cost per lead</th>
                  <th className="num">Amount spent</th>
                  {dataset.summaryColumns.map((label) => (
                    <th key={label} className="num">
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dataset.summary.map((s) => (
                  <tr key={s.campaign}>
                    <td className="pl-5">
                      <span className="flex items-center gap-2 font-medium">
                        <span className="db-swatch" style={{background: colorOf(s.campaign)}} />
                        {s.campaign}
                      </span>
                    </td>
                    <td className="num">{fmtInt(s.leads)}</td>
                    <td className="num">{s.cpl == null ? '—' : fmtInr2(s.cpl)}</td>
                    <td className="num">{fmtInr2(s.spend)}</td>
                    {dataset.summaryColumns.map((label) => (
                      <td key={label} className="num">
                        {s.counts[label] ?? '—'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ChartCard>
      )}
    </section>
  );
}
