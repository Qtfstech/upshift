import { Loader2, LogOut, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import { logout } from '../../account/account';
import { arcApi, setArcToken, type ArcMe } from '../arc/api';

/** "My data": what we hold, switches for the optional boxes, sign out and delete. */
export default function MyData({ me, onClose, onChanged, onSignedOut }: { me: ArcMe; onClose: () => void; onChanged: () => void; onSignedOut: () => void }) {
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const u = me.user;

  async function toggle(box: 'publish' | 'class_updates', value: boolean) {
    setBusy(box);
    setError(null);
    try {
      await arcApi('/arc/me/consents', { method: 'PATCH', json: { [box]: value }, auth: true });
      onChanged();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  async function remove() {
    setBusy('delete');
    setError(null);
    try {
      await arcApi('/arc/me', { method: 'DELETE', auth: true });
      setArcToken(null);
      onSignedOut();
    } catch (e) {
      setError((e as Error).message);
      setBusy(null);
    }
  }

  const row = (k: string, v: string | null) => (
    <div className="flex justify-between gap-4 py-2 text-sm">
      <span className="text-ink-muted">{k}</span>
      <span className="text-right font-medium text-ink">{v || '—'}</span>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="mydata-title" onClick={onClose}>
      <div className="w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-3xl bg-white shadow-lift p-6 sm:p-7" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 id="mydata-title" className="font-display font-bold text-2xl text-ink">
            My data
          </h2>
          <button onClick={onClose} aria-label="Close" className="rounded-full p-1.5 text-ink-muted hover:bg-ink/5 cursor-pointer">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 divide-y divide-ink/5">
          {row('Name', u.name)}
          {row('Mobile', `+91 ${u.phone}`)}
          {row('College and city', u.collegeCity)}
          {row('Year · branch', [u.year, u.branch].filter(Boolean).join(' · '))}
          {row('Email', u.email)}
          {row('Entries', `${me.entries.length} (${me.points} Arc Points)`)}
        </div>

        <div className="mt-5 flex flex-col gap-3 rounded-2xl bg-paper/60 p-4">
          {(
            [
              ['publish', u.publishOk, 'Show my first name, college and idea title on the Winner Board'],
              ['class_updates', u.classUpdatesOk, 'Send me updates about Upshift classes by WhatsApp'],
            ] as const
          ).map(([box, on, label]) => (
            <label key={box} className="flex items-center justify-between gap-4 text-sm text-ink-soft cursor-pointer">
              <span>{label}</span>
              <span className="flex items-center gap-2">
                {busy === box && <Loader2 className="h-4 w-4 animate-spin text-sun" />}
                <input type="checkbox" checked={on} disabled={!!busy} onChange={(e) => toggle(box, e.target.checked)} className="h-5 w-5 accent-[var(--color-sun)]" />
              </span>
            </label>
          ))}
        </div>

        {me.entries.length > 0 && (
          <div className="mt-5">
            <h3 className="text-sm font-semibold text-ink">Your entries</h3>
            <ul className="mt-2 flex flex-col gap-1.5 text-sm">
              {me.entries.map((e) => (
                <li key={e.code} className="flex justify-between gap-3">
                  <span className="truncate text-ink-soft">
                    Day {e.day} · {e.title}
                  </span>
                  <span className="font-mono text-xs text-ink-muted">{e.code}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {error && <p className="mt-4 rounded-xl bg-violet/10 text-violet text-sm px-4 py-2.5">{error}</p>}

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-ink/5 pt-5">
          <button
            onClick={async () => {
              await logout('idea-challenge'); // recorded in the sign-in log, then the token is dropped
              onSignedOut();
            }}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-muted hover:text-ink cursor-pointer"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
          {confirmDelete ? (
            <span className="flex items-center gap-2">
              <span className="text-sm text-ink">Delete everything?</span>
              <button onClick={remove} disabled={!!busy} className="rounded-full bg-violet text-white text-sm font-semibold px-4 py-2 cursor-pointer disabled:opacity-60">
                {busy === 'delete' ? 'Deleting…' : 'Yes, delete'}
              </button>
              <button onClick={() => setConfirmDelete(false)} className="text-sm text-ink-muted cursor-pointer">
                Cancel
              </button>
            </span>
          ) : (
            <button onClick={() => setConfirmDelete(true)} className="inline-flex items-center gap-1.5 text-sm font-semibold text-violet hover:underline cursor-pointer">
              <Trash2 className="h-4 w-4" /> Delete my account and entries
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
