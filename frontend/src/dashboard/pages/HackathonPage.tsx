import {Download, Loader2, RefreshCw, Search} from 'lucide-react';
import {useCallback, useEffect, useMemo, useState} from 'react';
import {api} from '../data/api';

interface Member {
  id: number;
  position: number;
  name: string;
  phone: string;
  email: string | null;
  organisation: string | null;
}

interface Team {
  id: number;
  teamName: string;
  category: string;
  idea: string | null;
  paid: boolean;
  marketingConsent?: boolean;
  createdAt: string;
  members: Member[];
}

const CATEGORY_LABEL: Record<string, string> = {students: 'Students', graduates: 'Recent graduates', mixed: 'Mixed', experienced: 'Experienced'};
/** Level 1 fee per member */
const FEE = 199;
const fmtWhen = (iso: string) => new Date(iso).toLocaleString('en-IN', {day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'});

/** One CSV row per member, with the team's details repeated. */
function downloadCsv(teams: Team[]) {
  const head = ['Registered', 'Team ID', 'Team', 'Category', 'Fee due', 'Paid', 'Updates OK', 'Member #', 'Name', 'Phone', 'Email', 'College / company', 'Idea'];
  const cell = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const rows = teams.flatMap((t) =>
    t.members.map((m) =>
      [fmtWhen(t.createdAt), t.id, t.teamName, CATEGORY_LABEL[t.category] ?? t.category, FEE * t.members.length, t.paid ? 'Yes' : 'No', t.marketingConsent ? 'Yes' : 'No', m.position, m.name, m.phone, m.email, m.organisation, t.idea]
        .map(cell)
        .join(','),
    ),
  );
  const url = URL.createObjectURL(new Blob(['﻿' + [head.join(','), ...rows].join('\n')], {type: 'text/csv;charset=utf-8'}));
  Object.assign(document.createElement('a'), {href: url, download: `hackathon-teams-${new Date().toISOString().slice(0, 10)}.csv`}).click();
  URL.revokeObjectURL(url);
}

/** Teams registered for the Sober October Hackathon (/hackathon). */
export default function HackathonPage() {
  const [teams, setTeams] = useState<Team[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setTeams((await api<{teams: Team[]}>('/hackathon')).teams);
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  async function togglePaid(t: Team) {
    try {
      await api(`/hackathon/${t.id}`, {method: 'PATCH', json: {paid: !t.paid}});
      setTeams((list) => list?.map((x) => (x.id === t.id ? {...x, paid: !t.paid} : x)) ?? null);
    } catch (e) {
      setError((e as Error).message);
    }
  }

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return teams ?? [];
    return (teams ?? []).filter((t) =>
      [t.teamName, t.idea, ...t.members.flatMap((m) => [m.name, m.phone, m.email, m.organisation])].some((v) => v?.toLowerCase().includes(q)),
    );
  }, [teams, query]);

  const people = (teams ?? []).reduce((n, t) => n + t.members.length, 0);
  const paid = (teams ?? []).filter((t) => t.paid).length;

  return (
    <div className="mx-auto max-w-[1400px] px-4 sm:px-6 py-6 flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-wider" style={{color: 'var(--accent)'}}>
            Sober October Hackathon
          </p>
          <h1 className="text-[26px] font-semibold tracking-tight mt-1">Registered teams</h1>
          {teams && (
            <p className="text-[13px] db-muted mt-1">
              {teams.length} teams · {people} people · {paid} paid
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button className="db-btn" onClick={load} disabled={loading}>
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
          <button className="db-btn db-btn-primary" onClick={() => downloadCsv(shown)} disabled={!shown.length}>
            <Download size={14} /> Download CSV
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 h-9 px-3 rounded-lg max-w-[420px]" style={{border: '1px solid var(--border)', background: 'var(--surface)'}}>
        <Search size={14} className="db-faint" />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search team, name, phone, college…" className="flex-1 bg-transparent outline-none text-[13px]" />
      </div>

      {error && (
        <div className="rounded-lg px-4 py-3 text-[13px]" style={{background: 'var(--bad-soft)', color: 'var(--bad)'}}>
          {error}
        </div>
      )}

      {!teams ? (
        <div className="db-card px-5 py-10 flex items-center gap-2 text-[13px] db-muted">
          <Loader2 size={16} className="animate-spin" /> Loading…
        </div>
      ) : !shown.length ? (
        <div className="db-card px-5 py-10 text-[13px] db-muted">{teams.length ? 'No teams match.' : 'No teams registered yet.'}</div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {shown.map((t) => (
            <section key={t.id} className="db-card p-4 flex flex-col gap-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h2 className="font-semibold text-[16px] truncate">{t.teamName}</h2>
                  <p className="text-[12px] db-muted">
                    #{t.id} · {CATEGORY_LABEL[t.category] ?? t.category} · ₹{FEE * t.members.length} due · {fmtWhen(t.createdAt)}
                  </p>
                </div>
                <button
                  onClick={() => togglePaid(t)}
                  className="shrink-0 rounded-full px-2.5 py-1 text-[12px] font-semibold cursor-pointer"
                  style={t.paid ? {background: 'var(--good-soft, #dcfce7)', color: 'var(--good, #15803d)'} : {background: 'var(--surface-2)', color: 'var(--text-2)'}}
                  title="Click to change"
                >
                  {t.paid ? '✓ Paid' : 'Not paid'}
                </button>
              </div>
              <ul className="flex flex-col gap-1.5 text-[13px]">
                {t.members.map((m) => (
                  <li key={m.id} className="flex flex-wrap items-baseline gap-x-2">
                    <span className="font-medium">
                      {m.name}
                      {m.position === 1 && <span className="db-faint"> (lead)</span>}
                    </span>
                    <a href={`tel:${m.phone}`} style={{color: 'var(--accent)'}}>
                      {m.phone}
                    </a>
                    {m.email && <span className="db-muted">{m.email}</span>}
                    {m.organisation && <span className="db-faint">· {m.organisation}</span>}
                  </li>
                ))}
              </ul>
              {t.idea && <p className="text-[13px] db-muted whitespace-pre-wrap border-t pt-2" style={{borderColor: 'var(--border)'}}>{t.idea}</p>}
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
