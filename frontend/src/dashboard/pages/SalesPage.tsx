import {AlertTriangle, ChevronLeft, ChevronRight, RefreshCw, X} from 'lucide-react';
import {useMemo, useState} from 'react';
import {Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis} from 'recharts';
import type {LiveControl} from '../DashboardApp';
import {ChartCard} from '../components/charts';
import {fmtDate, fmtInr, fmtInrShort, fmtInt, fmtMonth} from '../data/format';
import {useLive} from '../data/live';
import type {Payment, SalesTab} from '../data/types';
import {useChartTheme} from '../theme';

const ALL = 'all';
const sum = (ps: Payment[]) => ps.reduce((s, p) => s + (p.amount ?? 0), 0);
/** Average over the payments whose amount is in the sheet */
const avgTicket = (ps: Payment[]) => {
  const priced = ps.filter((p) => p.amount != null);
  return priced.length ? fmtInr(sum(priced) / priced.length) : '—';
};
const pad = (n: number) => String(n).padStart(2, '0');

/** Every day of an ISO month, so days without sales show as gaps rather than disappearing. */
function daysOf(month: string) {
  const [y, m] = month.split('-').map(Number);
  const n = new Date(y, m, 0).getDate();
  return Array.from({length: n}, (_, i) => `${month}-${pad(i + 1)}`);
}

function TipBox({title, revenue, count}: {title: string; revenue: number; count: number}) {
  return (
    <div className="db-tooltip">
      <div className="font-semibold mb-1.5">{title}</div>
      <div className="flex justify-between gap-4 py-0.5">
        <span className="db-muted">Revenue</span>
        <span className="font-medium">{fmtInr(revenue)}</span>
      </div>
      <div className="flex justify-between gap-4 py-0.5">
        <span className="db-muted">Payments</span>
        <span className="font-medium">{fmtInt(count)}</span>
      </div>
    </div>
  );
}

export default function SalesPage({live}: {live: LiveControl}) {
  const liveResult = useLive();
  const sales = liveResult?.sales;
  const data = sales?.data ?? null;
  const theme = useChartTheme();

  const [period, setPeriod] = useState<string>(ALL);
  const [workshop, setWorkshop] = useState<string>(ALL);

  const tabs = data?.tabs ?? [];
  const months = useMemo(
    () => [...new Set(tabs.flatMap((t) => t.payments.map((p) => p.date?.slice(0, 7)).filter((m): m is string => !!m)))].sort(),
    [tabs],
  );
  const shown = workshop === ALL ? tabs : tabs.filter((t) => t.name === workshop);
  const inPeriod = (p: Payment) => period === ALL || (p.date?.startsWith(period) ?? false);

  const perTab = shown
    .map((t) => {
      const ps = t.payments.filter(inPeriod);
      const dated = t.payments.filter((p) => p.date).map((p) => p.date!).sort();
      return {tab: t, payments: ps, revenue: sum(ps), last: dated[dated.length - 1] ?? null};
    })
    .sort((a, b) => b.revenue - a.revenue || a.tab.name.localeCompare(b.tab.name));
  const payments = perTab.flatMap((r) => r.payments);
  const revenue = sum(payments);
  const undated = period === ALL ? payments.filter((p) => !p.date) : [];
  const withSales = perTab.filter((r) => r.payments.length > 0).length;
  const unpriced = payments.filter((p) => p.amount == null).length;

  // Revenue over time: by month for "All time", by day within a month.
  const series = useMemo(() => {
    const keys = period === ALL ? months : daysOf(period);
    const byKey = new Map(keys.map((k) => [k, {key: k, revenue: 0, count: 0}]));
    for (const p of payments) {
      if (!p.date) continue;
      const b = byKey.get(period === ALL ? p.date.slice(0, 7) : p.date);
      if (b) {
        b.revenue += p.amount ?? 0;
        b.count++;
      }
    }
    return [...byKey.values()];
  }, [payments, period, months]);

  // Revenue by workshop: top 10, the rest folded into "Other".
  const byWorkshop = useMemo(() => {
    const ranked = perTab.filter((r) => r.revenue > 0).map((r) => ({name: r.tab.name, revenue: r.revenue, count: r.payments.length}));
    if (ranked.length <= 10) return ranked;
    const rest = ranked.slice(9);
    return [...ranked.slice(0, 9), {name: `Other (${rest.length})`, revenue: rest.reduce((s, r) => s + r.revenue, 0), count: rest.reduce((s, r) => s + r.count, 0)}];
  }, [perTab]);

  const periodLabel = period === ALL ? 'All time' : fmtMonth(period);
  const idx = months.indexOf(period);
  const issues = [...(data?.skipped ?? []).map((s) => `${s.name}: ${s.reason}`), ...tabs.flatMap((t) => t.warnings.map((w) => `${t.name}: ${w}`))];

  if (!data) {
    return (
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 py-10">
        <div className="db-card p-5 flex flex-col gap-2 text-[14px] max-w-[720px]">
          <span className="font-semibold">The sales sheet isn't connected yet</span>
          {sales?.error ? (
            <span style={{color: 'var(--bad)'}}>{sales.error}</span>
          ) : (
            <span className="db-muted">
              The server hasn't saved any sales data yet. Check that the Apps Script includes the sales sheet (apps-script/Code.gs) and
              that "Attendees For WS From Meta Leads" is shared with the dashboard's Google account.
            </span>
          )}
          <div>
            <button className="db-btn mt-2" onClick={() => live.refresh(true)} disabled={live.refreshing}>
              <RefreshCw size={14} className={live.refreshing ? 'animate-spin' : ''} />
              Check again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1400px] px-4 sm:px-6 py-6 flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-wider" style={{color: 'var(--accent)'}}>
            Sales · workshops &amp; campaigns
          </p>
          <h1 className="text-[26px] font-semibold tracking-tight mt-1">{periodLabel}</h1>
          {liveResult && (
            <p className="text-[12px] db-muted mt-1 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{background: live.error || sales?.error ? 'var(--warn)' : liveResult.fromCache ? 'var(--text-3)' : 'var(--good)'}} />
              {data.fileName} · {liveResult.fromCache ? 'saved data from ' : 'updated '}
              {new Date(liveResult.fetchedAt).toLocaleString('en-IN', {day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'})}
              <button className="inline-flex items-center gap-1 font-medium" style={{color: 'var(--accent)'}} onClick={() => live.refresh(true)} disabled={live.refreshing}>
                <RefreshCw size={12} className={live.refreshing ? 'animate-spin' : ''} />
                {live.refreshing ? 'Refreshing…' : 'Refresh'}
              </button>
            </p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select className="db-select h-9 max-w-[260px]" value={workshop} onChange={(e) => setWorkshop(e.target.value)} aria-label="Workshop">
            <option value={ALL}>All workshops ({tabs.length})</option>
            {[...tabs].sort((a, b) => a.name.localeCompare(b.name)).map((t) => (
              <option key={t.name} value={t.name}>
                {t.name}
              </option>
            ))}
          </select>
          <button className="db-btn px-2.5" disabled={period === ALL || idx <= 0} onClick={() => setPeriod(months[idx - 1])} aria-label="Previous month">
            <ChevronLeft size={16} />
          </button>
          <select className="db-select h-9" value={period} onChange={(e) => setPeriod(e.target.value)} aria-label="Period">
            <option value={ALL}>All time</option>
            {[...months].reverse().map((m) => (
              <option key={m} value={m}>
                {fmtMonth(m)}
              </option>
            ))}
          </select>
          <button
            className="db-btn px-2.5"
            disabled={!months.length || (period !== ALL && idx >= months.length - 1)}
            onClick={() => setPeriod(period === ALL ? months[months.length - 1] : months[idx + 1])}
            aria-label="Next month"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {(live.error || sales?.error) && (
        <div className="rounded-xl px-4 py-3 flex items-start gap-2 text-[13px]" style={{background: 'var(--warn-soft)', color: 'var(--warn)'}}>
          <AlertTriangle size={16} className="mt-0.5 flex-none" />
          <span>{sales?.error ? `Sales sheet: ${sales.error}` : `Latest refresh failed: ${live.error}`} Showing the last loaded data.</span>
        </div>
      )}

      {/* Headline numbers */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          [
            'Revenue',
            fmtInr(revenue),
            unpriced
              ? `+ ${fmtInt(unpriced)} paid with no amount in the sheet`
              : undated.length
                ? `incl. ${fmtInr(sum(undated))} with no payment date`
                : periodLabel,
          ],
          ['Payments', fmtInt(payments.length), `${fmtInt(shown.reduce((s, t) => s + t.students, 0))} students listed`],
          ['Average ticket', avgTicket(payments), 'Revenue ÷ payments with an amount'],
          [workshop === ALL ? 'Workshops with sales' : 'Workshop', workshop === ALL ? `${withSales} / ${tabs.length}` : workshop, workshop === ALL ? 'Tabs in the sheet' : 'Filtered'],
        ].map(([k, v, sub]) => (
          <div key={k} className="db-card p-4 sm:p-5 min-w-0">
            <div className="text-[11px] uppercase tracking-wide db-faint">{k}</div>
            <div className="text-[24px] font-semibold truncate mt-1" title={v}>
              {v}
            </div>
            <div className="text-[12px] db-muted mt-1 truncate">{sub}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title={period === ALL ? 'Revenue by month' : 'Revenue by day'} subtitle={`By payment date${workshop === ALL ? '' : ` · ${workshop}`}`}>
          {series.some((s) => s.revenue > 0) ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={series} margin={{top: 8, right: 8, left: 0, bottom: 0}} barCategoryGap={series.length > 12 ? '18%' : '28%'}>
                <CartesianGrid vertical={false} stroke={theme.grid} />
                <XAxis
                  dataKey="key"
                  tickFormatter={(k: string) => (period === ALL ? fmtMonth(k) : String(+k.slice(8)))}
                  tick={{fill: theme.textMuted, fontSize: 12}}
                  axisLine={{stroke: theme.axis}}
                  tickLine={false}
                  interval="preserveStartEnd"
                  minTickGap={8}
                />
                <YAxis tickFormatter={fmtInrShort} tick={{fill: theme.textMuted, fontSize: 12}} axisLine={false} tickLine={false} width={56} />
                <Tooltip
                  cursor={{fill: theme.grid, fillOpacity: 0.6}}
                  content={({active, payload}) => {
                    const d = active && payload?.[0]?.payload;
                    return d ? <TipBox title={period === ALL ? fmtMonth(d.key) : fmtDate(d.key)} revenue={d.revenue} count={d.count} /> : null;
                  }}
                />
                <Bar dataKey="revenue" fill={theme.accent} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[280px] grid place-items-center text-[13px] db-faint">No dated payments in {periodLabel}.</div>
          )}
        </ChartCard>

        <ChartCard title="Revenue by workshop" subtitle={periodLabel}>
          {byWorkshop.length ? (
            <ResponsiveContainer width="100%" height={Math.max(160, byWorkshop.length * 30 + 20)}>
              <BarChart data={byWorkshop} layout="vertical" margin={{top: 0, right: 16, left: 0, bottom: 0}} barCategoryGap="22%">
                <CartesianGrid horizontal={false} stroke={theme.grid} />
                <XAxis type="number" tickFormatter={fmtInrShort} tick={{fill: theme.textMuted, fontSize: 12}} axisLine={{stroke: theme.axis}} tickLine={false} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={150}
                  tick={{fill: theme.text, fontSize: 12}}
                  tickFormatter={(n: string) => (n.length > 22 ? `${n.slice(0, 21)}…` : n)}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{fill: theme.grid, fillOpacity: 0.6}}
                  content={({active, payload}) => {
                    const d = active && payload?.[0]?.payload;
                    return d ? <TipBox title={d.name} revenue={d.revenue} count={d.count} /> : null;
                  }}
                />
                <Bar dataKey="revenue" fill={theme.accent} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[160px] grid place-items-center text-[13px] db-faint">No payments in {periodLabel}.</div>
          )}
        </ChartCard>
      </div>

      {/* Per-workshop table */}
      <section className="db-card overflow-hidden">
        <header className="px-4 sm:px-5 pt-4 pb-3">
          <h3 className="text-[15px] font-semibold">Workshops &amp; campaigns</h3>
          <p className="text-[12px] db-faint mt-0.5">
            One row per tab. Payments and revenue are for {period === ALL ? 'all time' : periodLabel}; click a row to see its payments. "Columns read" shows where the amount and payment date were found.
          </p>
        </header>
        <div className="overflow-x-auto">
          <table className="db-table">
            <thead>
              <tr>
                <th>Workshop / campaign</th>
                <th className="num">Students</th>
                <th className="num">Payments</th>
                <th className="num">Revenue</th>
                <th className="num">Avg ticket</th>
                <th>Last payment</th>
                <th>Columns read</th>
              </tr>
            </thead>
            <tbody>
              {perTab.map(({tab, payments: ps, revenue: rev, last}) => (
                <tr key={tab.name} className="cursor-pointer" onClick={() => setWorkshop(workshop === tab.name ? ALL : tab.name)}>
                  <td className="font-medium">{tab.name}</td>
                  <td className="num">{fmtInt(tab.students)}</td>
                  <td className="num">{fmtInt(ps.length)}</td>
                  <td className="num font-medium">{tab.columns.amount ? fmtInr(rev) : <span className="db-faint" title="No amount column in this tab">—</span>}</td>
                  <td className="num">{avgTicket(ps)}</td>
                  <td>{last ? fmtDate(last) : '—'}</td>
                  <td className="db-muted">
                    <ColumnsUsed tab={tab} />
                  </td>
                </tr>
              ))}
            </tbody>
            {perTab.length > 1 && (
              <tfoot>
                <tr>
                  <td className="font-semibold">Total</td>
                  <td className="num">{fmtInt(perTab.reduce((s, r) => s + r.tab.students, 0))}</td>
                  <td className="num">{fmtInt(payments.length)}</td>
                  <td className="num font-semibold">{fmtInr(revenue)}</td>
                  <td className="num">{avgTicket(payments)}</td>
                  <td colSpan={2} />
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </section>

      {/* Payments of one workshop */}
      {workshop !== ALL && (
        <section className="db-card overflow-hidden">
          <header className="px-4 sm:px-5 pt-4 pb-3 flex items-start justify-between gap-3">
            <div>
              <h3 className="text-[15px] font-semibold">Payments · {workshop}</h3>
              <p className="text-[12px] db-faint mt-0.5">
                {fmtInt(payments.length)} payments in {period === ALL ? 'all time' : periodLabel}, latest first
              </p>
            </div>
            <button className="db-btn h-8 px-2.5" onClick={() => setWorkshop(ALL)} aria-label="Show all workshops">
              <X size={14} /> All workshops
            </button>
          </header>
          <div className="overflow-auto max-h-[480px]">
            <table className="db-table">
              <thead>
                <tr>
                  <th>Payment date</th>
                  <th>Student</th>
                  <th className="num">Amount</th>
                </tr>
              </thead>
              <tbody>
                {[...payments]
                  .sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''))
                  .map((p, i) => (
                    <tr key={i}>
                      <td>{p.date ? fmtDate(p.date) : <span className="db-faint">No date</span>}</td>
                      <td>{p.student || <span className="db-faint">—</span>}</td>
                      <td className="num">{p.amount == null ? <span className="db-faint">Not in sheet</span> : fmtInr(p.amount)}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {issues.length > 0 && (
        <details className="db-card px-4 sm:px-5 py-3 text-[13px]">
          <summary className="cursor-pointer font-medium flex items-center gap-2" style={{color: 'var(--warn)'}}>
            <AlertTriangle size={14} /> {issues.length} note{issues.length > 1 ? 's' : ''} from reading the sheet
          </summary>
          <ul className="mt-2 flex flex-col gap-1 db-muted list-disc pl-5">
            {issues.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}

function ColumnsUsed({tab}: {tab: SalesTab}) {
  const c = tab.columns;
  return (
    <span title={c.headerRow ? `Headings on row ${c.headerRow}` : 'No headings — guessed from the cells'}>
      Amount {c.amount ?? <span style={{color: 'var(--warn)'}}>none</span>} · Date {c.date ?? '—'}
      {tab.detectedBy === 'content' && <span style={{color: 'var(--warn)'}}> · guessed</span>}
    </span>
  );
}
