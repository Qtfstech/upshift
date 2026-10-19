import {Loader2, RefreshCw} from 'lucide-react';
import {useCallback, useEffect, useState} from 'react';
import {api} from '../data/api';

interface Person {
  id: number;
  name: string;
  phone: string;
}
interface Overview {
  accounts: number;
  active7d: number;
  products: {productKey: string; productName: string; clicks: number; signedInClicks: number}[];
  logins: {id: number; event: string; page: string; ip: string | null; userAgent: string | null; createdAt: string; user: Person}[];
  clicks: {id: number; productKey: string; productName: string; price: number | null; action: string; page: string; createdAt: string; user: Person | null}[];
  recentAccounts: {
    id: number;
    name: string;
    phone: string;
    createdAt: string;
    lastLoginAt: string | null;
    _count: {entries: number; productClicks: number; hackathonTeams: number};
  }[];
}

const PAGE_LABEL: Record<string, string> = {main: 'Main page', 'idea-challenge': 'Idea Challenge', hackathon: 'Hackathon'};
const fmt = (iso: string) => new Date(iso).toLocaleString('en-IN', {day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit', timeZone: 'Asia/Kolkata'});
/** "Chrome · Android" from a user agent, enough to tell devices apart */
function device(ua: string | null) {
  if (!ua) return '';
  const browser = /Edg\//.test(ua) ? 'Edge' : /Chrome\//.test(ua) ? 'Chrome' : /Firefox\//.test(ua) ? 'Firefox' : /Safari\//.test(ua) ? 'Safari' : 'Browser';
  const os = /Android/.test(ua) ? 'Android' : /iPhone|iPad/.test(ua) ? 'iOS' : /Windows/.test(ua) ? 'Windows' : /Mac OS/.test(ua) ? 'Mac' : /Linux/.test(ua) ? 'Linux' : '';
  return [browser, os].filter(Boolean).join(' · ');
}

const th = 'px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wider db-muted';
const td = 'px-3 py-2 align-top';

/** Website accounts (OTP login on the main page, Idea Challenge and Hackathon): sign-in log and product interest. */
export default function AccountsPage() {
  const [data, setData] = useState<Overview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setData(await api<Overview>('/account-admin'));
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

  return (
    <div className="mx-auto max-w-[1400px] px-4 sm:px-6 py-6 flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-wider" style={{color: 'var(--accent)'}}>
            Website login
          </p>
          <h1 className="text-[26px] font-semibold tracking-tight mt-1">Accounts and activity</h1>
          {data && (
            <p className="text-[13px] db-muted mt-1">
              {data.accounts} accounts · {data.active7d} signed in during the last 7 days
            </p>
          )}
        </div>
        <button className="db-btn" onClick={load} disabled={loading}>
          {loading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />} Refresh
        </button>
      </div>

      {error && (
        <div className="rounded-lg px-4 py-3 text-[13px]" style={{background: 'var(--bad-soft)', color: 'var(--bad)'}}>
          {error}
        </div>
      )}
      {!data && !error && (
        <div className="py-10 flex items-center gap-2 text-[13px] db-muted">
          <Loader2 size={16} className="animate-spin" /> Loading…
        </div>
      )}

      {data && (
        <>
          {/* Product interest */}
          <section className="db-card overflow-x-auto">
            <h2 className="px-4 pt-4 font-semibold">Product interest</h2>
            <p className="px-4 text-[12px] db-muted">Workshop "Reserve Seat", free class, company enquiry and hackathon payment clicks.</p>
            <table className="mt-2 w-full text-[13px]">
              <thead>
                <tr>
                  <th className={th}>Product</th>
                  <th className={`${th} text-right`}>Clicks</th>
                  <th className={`${th} text-right`}>By logged-in people</th>
                </tr>
              </thead>
              <tbody>
                {data.products.length === 0 && (
                  <tr>
                    <td className={`${td} db-muted`} colSpan={3}>
                      No clicks yet.
                    </td>
                  </tr>
                )}
                {data.products.map((p) => (
                  <tr key={p.productKey} style={{borderTop: '1px solid var(--border)'}}>
                    <td className={td}>
                      {p.productName} <span className="font-mono text-[11px] db-faint">{p.productKey}</span>
                    </td>
                    <td className={`${td} text-right font-semibold`}>{p.clicks}</td>
                    <td className={`${td} text-right`}>{p.signedInClicks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <div className="grid xl:grid-cols-2 gap-5 items-start">
            {/* Sign-in log */}
            <section className="db-card overflow-x-auto">
              <h2 className="px-4 pt-4 font-semibold">Sign-in log</h2>
              <p className="px-4 text-[12px] db-muted">Latest 200 logins and logouts.</p>
              <table className="mt-2 w-full text-[13px]">
                <thead>
                  <tr>
                    <th className={th}>When</th>
                    <th className={th}>Who</th>
                    <th className={th}>Event</th>
                    <th className={th}>Where</th>
                  </tr>
                </thead>
                <tbody>
                  {data.logins.map((l) => (
                    <tr key={l.id} style={{borderTop: '1px solid var(--border)'}}>
                      <td className={`${td} whitespace-nowrap`}>{fmt(l.createdAt)}</td>
                      <td className={td}>
                        <span className="font-medium">{l.user.name}</span>
                        <div className="text-[12px] db-muted">{l.user.phone}</div>
                      </td>
                      <td className={td} style={{color: l.event === 'login' ? 'var(--accent)' : 'var(--text-2)'}}>
                        {l.event}
                      </td>
                      <td className={td}>
                        {PAGE_LABEL[l.page] ?? l.page}
                        <div className="text-[12px] db-faint">{device(l.userAgent)}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>

            {/* Recent clicks */}
            <section className="db-card overflow-x-auto">
              <h2 className="px-4 pt-4 font-semibold">Recent product clicks</h2>
              <p className="px-4 text-[12px] db-muted">Latest 200. "Not logged in" clicks have no account.</p>
              <table className="mt-2 w-full text-[13px]">
                <thead>
                  <tr>
                    <th className={th}>When</th>
                    <th className={th}>Who</th>
                    <th className={th}>Product</th>
                    <th className={th}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {data.clicks.map((c) => (
                    <tr key={c.id} style={{borderTop: '1px solid var(--border)'}}>
                      <td className={`${td} whitespace-nowrap`}>{fmt(c.createdAt)}</td>
                      <td className={td}>
                        {c.user ? (
                          <>
                            <span className="font-medium">{c.user.name}</span>
                            <div className="text-[12px] db-muted">{c.user.phone}</div>
                          </>
                        ) : (
                          <span className="db-faint">Not logged in</span>
                        )}
                      </td>
                      <td className={td}>
                        {c.productName}
                        {c.price != null && <span className="db-muted"> · ₹{c.price}</span>}
                      </td>
                      <td className={td}>
                        {c.action.replace(/_/g, ' ')}
                        <div className="text-[12px] db-faint">{PAGE_LABEL[c.page] ?? c.page}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          </div>

          {/* Accounts */}
          <section className="db-card overflow-x-auto">
            <h2 className="px-4 pt-4 font-semibold">Newest accounts</h2>
            <table className="mt-2 w-full text-[13px]">
              <thead>
                <tr>
                  <th className={th}>Name</th>
                  <th className={th}>Mobile</th>
                  <th className={th}>Joined</th>
                  <th className={th}>Last login</th>
                  <th className={`${th} text-right`}>Ideas</th>
                  <th className={`${th} text-right`}>Product clicks</th>
                  <th className={`${th} text-right`}>Hackathon teams</th>
                </tr>
              </thead>
              <tbody>
                {data.recentAccounts.map((a) => (
                  <tr key={a.id} style={{borderTop: '1px solid var(--border)'}}>
                    <td className={`${td} font-medium`}>{a.name}</td>
                    <td className={td}>{a.phone}</td>
                    <td className={`${td} whitespace-nowrap`}>{fmt(a.createdAt)}</td>
                    <td className={`${td} whitespace-nowrap`}>{a.lastLoginAt ? fmt(a.lastLoginAt) : '—'}</td>
                    <td className={`${td} text-right`}>{a._count.entries}</td>
                    <td className={`${td} text-right`}>{a._count.productClicks}</td>
                    <td className={`${td} text-right`}>{a._count.hackathonTeams}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </>
      )}
    </div>
  );
}
