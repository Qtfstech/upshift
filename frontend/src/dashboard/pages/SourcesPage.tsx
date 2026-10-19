import {AlertTriangle, Check, RefreshCw} from 'lucide-react';
import type {ReactNode} from 'react';
import type {LiveControl} from '../DashboardApp';
import {analyse, campaignOrder, dateRange} from '../data/analytics';
import {fmtDate, fmtDay, fmtInr, fmtInr2, fmtInt} from '../data/format';
import {useLive} from '../data/live';
import type {Dataset} from '../data/types';

function Stats({items}: {items: [string, string][]}) {
  return (
    <dl className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      {items.map(([k, v]) => (
        <div key={k} className="rounded-lg px-3 py-2" style={{background: 'var(--surface-2)'}}>
          <dt className="text-[11px] uppercase tracking-wide db-faint">{k}</dt>
          <dd className="text-[14px] font-semibold mt-0.5">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

function datasetStats(ds: Dataset): [string, string][] {
  const campaigns = campaignOrder(ds.rows);
  const dates = dateRange(ds.rows);
  const a = analyse(ds.rows, campaigns);
  return [
    ['Campaigns', String(campaigns.length)],
    ['Dates', dates.length ? `${fmtDay(dates[0])} – ${fmtDate(dates[dates.length - 1])}` : '—'],
    ['Rows', fmtInt(ds.rows.length)],
    ['Total spend', fmtInr(a.spend)],
    ['Total leads', fmtInt(a.leads)],
    ['CPL', a.cpl == null ? '—' : fmtInr2(a.cpl)],
  ];
}

/** One sheet: connection status, what was found in it, and anything that needs a look. */
function SourceCard(props: {name: string; file: string; error: string | null; hasData: boolean; checks: string[]; warnings: string[]; children?: ReactNode}) {
  const {name, file, error, hasData, checks, warnings, children} = props;
  return (
    <section className="db-card p-5 flex flex-col gap-4 min-w-0">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full grid place-items-center font-semibold" style={{background: 'var(--accent-soft)', color: 'var(--accent)'}}>
          {name[0]}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="font-semibold">{name}</h2>
          <p className="text-[12px] db-faint truncate">{file}</p>
        </div>
        <span
          className="px-2.5 py-1 rounded-full text-[12px] font-medium"
          style={error ? {background: 'var(--bad-soft)', color: 'var(--bad)'} : {background: 'var(--good-soft)', color: 'var(--good)'}}
        >
          {error ? 'Problem' : 'Connected'}
        </span>
      </div>
      {error && (
        <div className="rounded-lg px-4 py-3 text-[13px] flex items-start gap-2" style={{background: 'var(--bad-soft)', color: 'var(--bad)'}}>
          <AlertTriangle size={16} className="mt-0.5 flex-none" />
          <span>
            {error}
            {hasData && ' The dashboard keeps showing the last data that was saved.'}
          </span>
        </div>
      )}
      {checks.length > 0 && (
        <ul className="rounded-lg px-4 py-3 text-[13px] flex flex-col gap-1" style={{background: 'var(--good-soft)', color: 'var(--good)'}}>
          {checks.map((c) => (
            <li key={c} className="flex items-start gap-2">
              <Check size={14} className="mt-0.5 flex-none" />
              {c}
            </li>
          ))}
        </ul>
      )}
      {warnings.length > 0 && (
        <ul className="rounded-lg px-4 py-3 text-[12px] list-disc pl-8" style={{background: 'var(--warn-soft)', color: 'var(--warn)'}}>
          {warnings.map((w, i) => (
            <li key={i}>{w}</li>
          ))}
        </ul>
      )}
      {children}
    </section>
  );
}

/** What the backend read from each Google Sheet, so problems are easy to spot. */
export default function SourcesPage({live}: {live: LiveControl}) {
  const result = useLive();
  const sales = result?.sales;
  const salesTabs = sales?.data?.tabs ?? [];
  const payments = salesTabs.flatMap((t) => t.payments);

  return (
    <div className="mx-auto max-w-[1400px] px-4 sm:px-6 py-6 flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[24px] font-semibold tracking-tight">Data sources</h1>
          <p className="text-[13px] db-muted mt-1">
            The server reads the Google Sheets every 5 minutes and saves them in the database
            {result && ` · last read ${new Date(result.fetchedAt).toLocaleString('en-IN')}`}.
          </p>
        </div>
        <button className="db-btn db-btn-primary" onClick={() => live.refresh(true)} disabled={live.refreshing}>
          <RefreshCw size={16} className={live.refreshing ? 'animate-spin' : ''} />
          {live.refreshing ? 'Reading sheets…' : 'Refresh now'}
        </button>
      </div>
      {live.error && (
        <div className="rounded-lg px-4 py-3 text-[13px]" style={{background: 'var(--bad-soft)', color: 'var(--bad)'}}>
          {live.error}
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
        {(result?.owners ?? []).map((o) => (
          <SourceCard
            key={o.id}
            name={o.name}
            file={`${o.fileName ?? o.fileHint}${o.sheetName ? ` · ${o.sheetName} tab` : ''}`}
            error={o.error}
            hasData={!!o.data}
            checks={o.checks}
            warnings={o.warnings}
          >
            {o.data && <Stats items={datasetStats(o.data.dataset)} />}
          </SourceCard>
        ))}
        {sales && (
          <SourceCard
            name="Sales"
            file={sales.data?.fileName ?? 'Attendees For WS From Meta Leads'}
            error={sales.error}
            hasData={!!sales.data}
            checks={salesTabs.map((t) => `${t.name}: amount ${t.columns.amount ?? 'not in sheet'}, date ${t.columns.date ?? '—'}`)}
            warnings={(sales.data?.skipped ?? []).map((s) => `${s.name}: ${s.reason}`)}
          >
            {sales.data && (
              <Stats
                items={[
                  ['Workshops', String(salesTabs.length)],
                  ['Students', fmtInt(salesTabs.reduce((s, t) => s + t.students, 0))],
                  ['Payments', fmtInt(payments.length)],
                  ['Revenue', fmtInr(payments.reduce((s, p) => s + (p.amount ?? 0), 0))],
                ]}
              />
            )}
          </SourceCard>
        )}
      </div>
    </div>
  );
}
