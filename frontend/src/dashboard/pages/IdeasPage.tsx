import {ChevronDown, ChevronRight, Download, Loader2, Paperclip, RefreshCw, Search} from 'lucide-react';
import {Fragment, useCallback, useEffect, useMemo, useState} from 'react';
import {BACKEND_URL} from '../config';
import {api, sessionToken} from '../data/api';

interface Idea {
  id: number;
  name: string;
  email: string;
  phone: string;
  college: string | null;
  stage: string | null;
  title: string;
  category: string;
  problem: string | null;
  phoneVerified?: boolean;
  idea: string;
  fileName?: string | null;
  fileSize?: number | null;
  showOnWall: boolean;
  createdAt: string;
}

const fmtWhen = (iso: string) => new Date(iso).toLocaleString('en-IN', {day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'});

function downloadCsv(ideas: Idea[]) {
  const cols: (keyof Idea)[] = ['createdAt', 'name', 'email', 'phone', 'college', 'stage', 'category', 'title', 'problem', 'idea'];
  const cell = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const csv = [cols.join(','), ...ideas.map((i) => cols.map((c) => cell(c === 'createdAt' ? fmtWhen(i.createdAt) : i[c])).join(','))].join('\n');
  const url = URL.createObjectURL(new Blob(['﻿' + csv], {type: 'text/csv;charset=utf-8'}));
  const a = Object.assign(document.createElement('a'), {href: url, download: `idea-challenge-${new Date().toISOString().slice(0, 10)}.csv`});
  a.click();
  URL.revokeObjectURL(url);
}

/** The file needs the sign-in token, so fetch it and save it rather than linking to it. */
async function downloadFile(idea: Idea) {
  const res = await fetch(`${BACKEND_URL.replace(/\/+$/, '')}/api/ideas/${idea.id}/file`, {headers: {Authorization: `Bearer ${sessionToken()}`}});
  if (!res.ok) throw new Error((await res.json().catch(() => null))?.error ?? "Couldn't download the file.");
  const url = URL.createObjectURL(await res.blob());
  Object.assign(document.createElement('a'), {href: url, download: idea.fileName ?? 'file'}).click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Ideas sent in from the Idea Challenge page (/idea-challenge). */
export default function IdeasPage() {
  const [ideas, setIdeas] = useState<Idea[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [open, setOpen] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setIdeas((await api<{ideas: Idea[]}>('/ideas')).ideas);
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

  const categories = useMemo(() => [...new Set((ideas ?? []).map((i) => i.category))].sort(), [ideas]);
  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (ideas ?? []).filter(
      (i) => (!category || i.category === category) && (!q || [i.name, i.email, i.phone, i.college, i.title, i.problem, i.idea].some((v) => v?.toLowerCase().includes(q))),
    );
  }, [ideas, query, category]);
  const today = (ideas ?? []).filter((i) => new Date(i.createdAt).toDateString() === new Date().toDateString()).length;

  return (
    <div className="mx-auto max-w-[1400px] px-4 sm:px-6 py-6 flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-wider" style={{color: 'var(--accent)'}}>
            Idea Challenge
          </p>
          <h1 className="text-[26px] font-semibold tracking-tight mt-1">Submitted ideas</h1>
          {ideas && (
            <p className="text-[13px] db-muted mt-1">
              {ideas.length} in total · {today} today
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

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2 h-9 px-3 rounded-lg flex-1 min-w-[220px] max-w-[420px]" style={{border: '1px solid var(--border)', background: 'var(--surface)'}}>
          <Search size={14} className="db-faint" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search name, phone, college, idea…" className="flex-1 bg-transparent outline-none text-[13px]" />
        </div>
        <select className="db-select h-9" value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Category">
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </div>

      {error && (
        <div className="rounded-lg px-4 py-3 text-[13px]" style={{background: 'var(--bad-soft)', color: 'var(--bad)'}}>
          {error}
        </div>
      )}

      <section className="db-card overflow-hidden">
        {!ideas ? (
          <div className="px-5 py-10 flex items-center gap-2 text-[13px] db-muted">
            <Loader2 size={16} className="animate-spin" /> Loading…
          </div>
        ) : !shown.length ? (
          <div className="px-5 py-10 text-[13px] db-muted">{ideas.length ? 'No ideas match.' : 'No ideas submitted yet.'}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="db-table">
              <thead>
                <tr>
                  <th />
                  <th>Submitted</th>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>College · stage</th>
                  <th>Category</th>
                  <th>Idea</th>
                </tr>
              </thead>
              <tbody>
                {shown.map((i) => (
                  <Fragment key={i.id}>
                    <tr className="cursor-pointer" onClick={() => setOpen(open === i.id ? null : i.id)}>
                      <td className="db-faint">{open === i.id ? <ChevronDown size={14} /> : <ChevronRight size={14} />}</td>
                      <td className="db-muted">{fmtWhen(i.createdAt)}</td>
                      <td className="font-medium">{i.name}</td>
                      <td>
                        <a href={`tel:${i.phone}`} onClick={(e) => e.stopPropagation()} style={{color: 'var(--accent)'}}>
                          {i.phone}
                          {i.phoneVerified && <span title="Verified with a one-time code"> ✓</span>}
                        </a>
                      </td>
                      <td>
                        <a href={`mailto:${i.email}`} onClick={(e) => e.stopPropagation()} style={{color: 'var(--accent)'}}>
                          {i.email}
                        </a>
                      </td>
                      <td className="db-muted">{[i.college, i.stage].filter(Boolean).join(' · ') || '—'}</td>
                      <td>{i.category}</td>
                      <td className="font-medium max-w-[320px] truncate" title={i.title}>
                        {i.fileName && <Paperclip size={12} className="inline mr-1 db-faint" aria-label="Has a file" />}
                        {i.title}
                      </td>
                    </tr>
                    {open === i.id && (
                      <tr>
                        <td />
                        <td colSpan={7} style={{whiteSpace: 'normal', background: 'var(--surface-2)'}}>
                          <div className="grid md:grid-cols-2 gap-4 py-2 text-[13px] leading-relaxed">
                            <div>
                              <div className="text-[11px] uppercase tracking-wide db-faint mb-1">Problem</div>
                              <p className="whitespace-pre-wrap">{i.problem || <span className="db-faint">Not asked (short form)</span>}</p>
                            </div>
                            <div>
                              <div className="text-[11px] uppercase tracking-wide db-faint mb-1">Idea</div>
                              <p className="whitespace-pre-wrap">{i.idea}</p>
                            </div>
                          </div>
                          {i.fileName && (
                            <button
                              onClick={() => downloadFile(i).catch((e) => setError((e as Error).message))}
                              className="mb-2 inline-flex items-center gap-1.5 text-[13px] font-medium cursor-pointer"
                              style={{color: 'var(--accent)'}}
                            >
                              <Paperclip size={14} /> {i.fileName}
                              {i.fileSize != null && <span className="db-faint"> · {Math.max(1, Math.round(i.fileSize / 1024))} KB</span>}
                            </button>
                          )}
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
