import {AlertTriangle, ChevronLeft, ChevronRight, RefreshCw} from 'lucide-react';
import type {LiveControl} from '../DashboardApp';
import {useLive} from '../data/live';
import {useMemo, useState} from 'react';
import OwnerSection, {type ViewMode} from '../components/OwnerSection';
import {fmtDay, fmtInr, fmtInr2, fmtInt, fmtLongDate, fmtMonth} from '../data/format';
import {useOwners} from '../data/store';
import {useChartTheme} from '../theme';

export default function CeoDashboard({live}: {live: LiveControl}) {
  const owners = useOwners();
  const liveResult = useLive();
  const liveErrors = liveResult ? owners.filter((o) => o.error) : [];
  const theme = useChartTheme();

  const dates = useMemo(
    () => [...new Set(owners.flatMap((o) => o.data.dataset.rows.map((r) => r.date)))].sort(),
    [owners],
  );
  const months = useMemo(() => [...new Set(dates.map((d) => d.slice(0, 7)))], [dates]);

  const [mode, setMode] = useState<ViewMode>('day');
  const [pickedDay, setPickedDay] = useState<string | null>(null);
  const [pickedMonth, setPickedMonth] = useState<string | null>(null);

  const options = mode === 'day' ? dates : months;
  const picked = mode === 'day' ? pickedDay : pickedMonth;
  const setPicked = mode === 'day' ? setPickedDay : setPickedMonth;
  const period = picked && options.includes(picked) ? picked : options[options.length - 1];
  const idx = options.indexOf(period);
  const label = (p: string) => (mode === 'day' ? fmtLongDate(p) : fmtMonth(p));

  if (!period) {
    return <div className="mx-auto max-w-[1400px] px-4 py-10 db-muted">No data uploaded yet.</div>;
  }

  return (
    <div className="mx-auto max-w-[1400px] px-4 sm:px-6 py-6 flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-wider" style={{color: 'var(--accent)'}}>
            {mode === 'day' ? 'Daily' : 'Monthly'} CEO / Founder dashboard
          </p>
          <h1 className="text-[26px] font-semibold tracking-tight mt-1">{label(period)}</h1>
          {liveResult && (
            <p className="text-[12px] db-muted mt-1 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{background: live.error ? 'var(--warn)' : liveResult.fromCache ? 'var(--text-3)' : 'var(--good)'}} />
              {liveResult.fromCache ? 'Showing saved data from ' : 'Live from Google Sheets · updated '}
              {new Date(liveResult.fetchedAt).toLocaleString('en-IN', {day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'})}
              <button
                className="inline-flex items-center gap-1 font-medium"
                style={{color: 'var(--accent)'}}
                onClick={() => live.refresh(true)}
                disabled={live.refreshing}
              >
                <RefreshCw size={12} className={live.refreshing ? 'animate-spin' : ''} />
                {live.refreshing ? (liveResult.fromCache ? 'Loading latest data…' : 'Refreshing…') : 'Refresh'}
              </button>
            </p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex p-1 rounded-lg" style={{background: 'var(--surface-2)', border: '1px solid var(--border)'}} role="tablist">
            {(['day', 'month'] as const).map((m) => (
              <button
                key={m}
                role="tab"
                aria-selected={mode === m}
                onClick={() => {
                  // Keep the two pickers in step: switching to monthly opens the month of the chosen day.
                  if (m === 'month' && mode === 'day') setPickedMonth(period.slice(0, 7));
                  setMode(m);
                }}
                className="h-8 px-3.5 rounded-md text-[13px] font-medium transition-colors"
                style={mode === m ? {background: 'var(--surface)', color: 'var(--text)', boxShadow: '0 1px 2px rgba(0,0,0,0.08)'} : {color: 'var(--text-2)'}}
              >
                {m === 'day' ? 'Daily' : 'Monthly'}
              </button>
            ))}
          </div>
          <button className="db-btn px-2.5" disabled={idx <= 0} onClick={() => setPicked(options[idx - 1])} aria-label="Previous">
            <ChevronLeft size={16} />
          </button>
          <select className="db-select h-9" value={period} onChange={(e) => setPicked(e.target.value)} aria-label="Report period">
            {[...options].reverse().map((d) => (
              <option key={d} value={d}>
                {label(d)}
              </option>
            ))}
          </select>
          <button className="db-btn px-2.5" disabled={idx >= options.length - 1} onClick={() => setPicked(options[idx + 1])} aria-label="Next">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {(live.error || liveErrors.length > 0) && (
        <div className="rounded-xl px-4 py-3 flex items-start gap-2 text-[13px]" style={{background: 'var(--warn-soft)', color: 'var(--warn)'}}>
          <AlertTriangle size={16} className="mt-0.5 flex-none" />
          <div className="flex flex-col gap-0.5">
            {live.error && <span>Latest refresh failed: {live.error} Showing the last loaded data.</span>}
            {liveErrors.map((o) => (
              <span key={o.id}>
                {o.name}'s sheet: {o.error}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* At a glance — one card per person, not combined */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        {owners.map((o) => {
          const rows = o.data.dataset.rows;
          const cur = rows.filter((r) => (mode === 'day' ? r.date === period : r.date.startsWith(period)));
          const month = period.slice(0, 7);
          const mtdRows = rows.filter((r) => r.date.startsWith(month) && (mode === 'month' || r.date <= period));
          const spend = cur.reduce((s, r) => s + r.spend, 0);
          const leads = cur.reduce((s, r) => s + r.leads, 0);
          const mtdSpend = mtdRows.reduce((s, r) => s + r.spend, 0);
          const mtdLeads = mtdRows.reduce((s, r) => s + r.leads, 0);
          const activeDays = new Set(cur.map((r) => r.date)).size;
          return (
            <a
              key={o.id}
              href={`#section-${o.id}`}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(`section-${o.id}`)?.scrollIntoView({behavior: 'smooth'});
              }}
              className="db-card p-4 sm:p-5 flex flex-col gap-3 hover:brightness-[0.98]"
            >
              <div className="flex items-center justify-between">
                <span className="text-[15px] font-semibold">{o.name}</span>
                <span className="text-[12px] db-faint">
                  {cur.length
                    ? `${new Set(cur.map((r) => r.campaign)).size} ${o.unit}s${mode === 'day' ? ' live' : ` · ${activeDays} days`}`
                    : `No ${mode === 'day' ? 'entry' : 'data'} for ${mode === 'day' ? fmtDay(period) : fmtMonth(period)}`}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  ['Ad spend', cur.length ? fmtInr(spend) : '—'],
                  ['Leads', cur.length ? fmtInt(leads) : '—'],
                  ['Cost per lead', leads ? fmtInr2(spend / leads) : '—'],
                ].map(([k, v]) => (
                  <div key={k} className="min-w-0">
                    <div className="text-[11px] uppercase tracking-wide db-faint">{k}</div>
                    <div className="text-[22px] font-semibold truncate">{v}</div>
                  </div>
                ))}
              </div>
              <div className="text-[12px] db-muted pt-2 border-t" style={{borderColor: 'var(--border)'}}>
                {mode === 'day' ? (
                  <>
                    Month to date: <b style={{color: 'var(--text)'}}>{fmtInr(mtdSpend)}</b> spent ·{' '}
                    <b style={{color: 'var(--text)'}}>{fmtInt(mtdLeads)}</b> leads
                    {mtdLeads > 0 && ` · CPL ${fmtInr2(mtdSpend / mtdLeads)}`}
                  </>
                ) : (
                  <>
                    Daily average: <b style={{color: 'var(--text)'}}>{fmtInr(activeDays ? spend / activeDays : 0)}</b> spent ·{' '}
                    <b style={{color: 'var(--text)'}}>{(activeDays ? leads / activeDays : 0).toFixed(1)}</b> leads
                  </>
                )}
              </div>
            </a>
          );
        })}
      </div>

      {owners.map((o) => (
        <div key={o.id} className="flex flex-col gap-4">
          <hr style={{borderColor: 'var(--border)'}} />
          <OwnerSection id={`section-${o.id}`} name={o.name} data={o.data} unit={o.unit} mode={mode} period={period} theme={theme} />
        </div>
      ))}
    </div>
  );
}
