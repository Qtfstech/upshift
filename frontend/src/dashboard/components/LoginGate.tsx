import {BarChart3, Eye, EyeOff, Lock, User} from 'lucide-react';
import {useState, type FormEvent} from 'react';
import {api, clearToken, sessionToken, setToken} from '../data/api';
import {clearLive} from '../data/live';

// The password is also kept for this tab only: it unlocks the encrypted copy of the data saved on this device.
const PW_KEY = 'upshift-dashboard:pw';
const NOTICE_KEY = 'upshift-dashboard:signout-notice';

export const isAuthed = () => Boolean(sessionToken());

export function sessionPassword() {
  try {
    return sessionStorage.getItem(PW_KEY) ?? '';
  } catch {
    return '';
  }
}

/** Sign out with a message shown on the sign-in screen (e.g. the sign-in expired). */
export function logoutWithNotice(message: string) {
  try {
    sessionStorage.setItem(NOTICE_KEY, message);
  } catch {
    /* ignore */
  }
  logout();
}

export function logout() {
  try {
    sessionStorage.removeItem(PW_KEY);
  } catch {
    /* ignore */
  }
  clearToken();
  clearLive();
}

export default function LoginGate({onLogin}: {onLogin: () => void}) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(() => {
    try {
      const notice = sessionStorage.getItem(NOTICE_KEY);
      sessionStorage.removeItem(NOTICE_KEY);
      return notice;
    } catch {
      return null;
    }
  });
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const r = await api<{token: string}>('/auth/login', {method: 'POST', json: {username, password}});
      setToken(r.token);
      try {
        sessionStorage.setItem(PW_KEY, password);
      } catch {
        /* no saved copy this time */
      }
      onLogin();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign-in failed.');
    } finally {
      setBusy(false);
    }
  }

  const field = {border: `1px solid ${error ? 'var(--bad)' : 'var(--border)'}`, background: 'var(--surface)'};

  return (
    <div className="min-h-screen grid place-items-center px-4">
      <form onSubmit={submit} className="db-card w-full max-w-[380px] p-7 flex flex-col gap-5">
        <div className="flex items-center gap-2 font-semibold text-[15px]">
          <span className="w-8 h-8 rounded-md grid place-items-center" style={{background: 'var(--accent)'}}>
            <BarChart3 size={17} color="#fff" />
          </span>
          Upshift · CEO Dashboard
        </div>
        <div>
          <h1 className="text-[20px] font-semibold">Sign in</h1>
          <p className="text-[13px] db-muted mt-1">Enter the admin username and password.</p>
        </div>
        <label className="flex flex-col gap-1.5">
          <span className="text-[13px] font-medium">Username</span>
          <div className="flex items-center gap-2 h-11 px-3 rounded-lg" style={field}>
            <User size={16} className="db-faint" />
            <input
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setError(null);
              }}
              autoFocus
              autoComplete="username"
              autoCapitalize="none"
              required
              className="flex-1 bg-transparent outline-none text-[14px]"
            />
          </div>
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-[13px] font-medium">Password</span>
          <div className="flex items-center gap-2 h-11 px-3 rounded-lg" style={field}>
            <Lock size={16} className="db-faint" />
            <input
              type={show ? 'text' : 'password'}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(null);
              }}
              autoComplete="current-password"
              required
              className="flex-1 bg-transparent outline-none text-[14px]"
            />
            <button type="button" className="db-faint" onClick={() => setShow((s) => !s)} aria-label={show ? 'Hide password' : 'Show password'}>
              {show ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {error && (
            <span className="text-[12px]" style={{color: 'var(--bad)'}}>
              {error}
            </span>
          )}
        </label>
        <button type="submit" className="db-btn db-btn-primary justify-center h-11" disabled={busy}>
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}
