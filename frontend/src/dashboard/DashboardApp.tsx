import {BarChart3, Database, IndianRupee, Lightbulb, Loader2, LogOut, Snowflake, Trophy, Users} from 'lucide-react';
import {useCallback, useEffect, useRef, useState} from 'react';
import LoginGate, {isAuthed, logout, logoutWithNotice, sessionPassword} from './components/LoginGate';
import {LIVE_REFRESH_MS} from './config';
import {fetchLive, getLive, LiveAuthError, loadCache, useLive} from './data/live';
import CeoDashboard from './pages/CeoDashboard';
import AccountsPage from './pages/AccountsPage';
import ArcAdminPage from './pages/ArcAdminPage';
import HackathonTeamsPage from './pages/HackathonPage';
import IdeasPage from './pages/IdeasPage';
import SalesPage from './pages/SalesPage';
import SourcesPage from './pages/SourcesPage';
import './dashboard.css';

type Route = 'dashboard' | 'sales' | 'ideas' | 'arc' | 'hackathon' | 'accounts' | 'sources';

const HREF: Record<Route, string> = {dashboard: '#/', sales: '#/sales', ideas: '#/ideas', arc: '#/winter-arc', hackathon: '#/hackathon', accounts: '#/accounts', sources: '#/sources'};
const TITLE: Record<Route, string> = {
  dashboard: 'CEO Dashboard',
  sales: 'Sales · CEO Dashboard',
  ideas: 'Ideas · CEO Dashboard',
  arc: 'Winter Arc · CEO Dashboard',
  hackathon: 'Hackathon · CEO Dashboard',
  accounts: 'Accounts · CEO Dashboard',
  sources: 'Sources · CEO Dashboard',
};

/** Refresh state handed to the pages. */
export interface LiveControl {
  /** `fresh` makes the server read the sheets now instead of returning what it saved in the last 5 minutes */
  refresh: (fresh?: boolean) => void;
  refreshing: boolean;
  error: string | null;
}

// Hash routing (#/sales, #/sources) keeps this working on static hosting without server rewrites.
const readRoute = (): Route => {
  const h = window.location.hash.replace(/^#\/?/, '');
  if (h === 'sales' || h === 'ideas' || h === 'hackathon' || h === 'accounts') return h;
  if (h === 'winter-arc') return 'arc';
  if (h === 'sources' || h === 'admin') return 'sources';
  return 'dashboard';
};

export default function DashboardApp() {
  const [route, setRoute] = useState<Route>(readRoute);
  const [authed, setAuthed] = useState(isAuthed);
  const [refreshing, setRefreshing] = useState(false);
  const [liveError, setLiveError] = useState<string | null>(null);
  const inFlight = useRef(false);
  const liveResult = useLive();

  const signOut = useCallback(() => {
    logout();
    setAuthed(false);
  }, []);

  const refresh = useCallback(async (fresh = false) => {
    if (inFlight.current) return;
    inFlight.current = true;
    setRefreshing(true);
    try {
      await fetchLive(sessionPassword(), fresh);
      setLiveError(null);
    } catch (e) {
      if (e instanceof LiveAuthError) {
        // Sign-in expired, or the admin password was changed on the server.
        logoutWithNotice(e.message);
        setAuthed(false);
      } else setLiveError(e instanceof Error ? e.message : String(e));
    } finally {
      inFlight.current = false;
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (!authed) return;
    // Show the saved copy straight away (e.g. after a page reload), then load the latest.
    const start = async () => {
      if (!getLive()) await loadCache(sessionPassword());
      refresh();
    };
    start();
    const timer = window.setInterval(() => refresh(), LIVE_REFRESH_MS);
    return () => window.clearInterval(timer);
  }, [authed, refresh]);

  const live: LiveControl = {refresh, refreshing, error: liveError};

  useEffect(() => {
    const on = () => setRoute(readRoute());
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);

  useEffect(() => {
    document.title = TITLE[route];
    window.scrollTo(0, 0);
  }, [route]);

  const tab = (r: Route, label: string, icon: React.ReactNode) => (
    <a
      href={HREF[r]}
      className="flex items-center gap-2 h-9 px-3 rounded-lg text-[14px] font-medium transition-colors"
      style={{
        background: route === r ? 'var(--accent-soft)' : 'transparent',
        color: route === r ? 'var(--accent)' : 'var(--text-2)',
      }}
      aria-current={route === r ? 'page' : undefined}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </a>
  );

  if (!authed) {
    return (
      <div className="db-root">
        <LoginGate onLogin={() => setAuthed(true)} />
      </div>
    );
  }

  return (
    <div className="db-root">
      <nav className="sticky top-0 z-20" style={{background: 'var(--nav)', color: 'var(--nav-text)', borderBottom: '1px solid var(--border)'}}>
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-semibold text-[15px]">
            <span className="w-7 h-7 rounded-md grid place-items-center" style={{background: '#2a78d6'}}>
              <BarChart3 size={16} color="#fff" />
            </span>
            <span className="hidden md:inline">Upshift · CEO Dashboard</span>
          </div>
          <div className="flex items-center gap-1">
            {tab('dashboard', 'Dashboard', <BarChart3 size={16} />)}
            {tab('sales', 'Sales', <IndianRupee size={16} />)}
            {tab('ideas', 'Ideas', <Lightbulb size={16} />)}
            {tab('arc', 'Winter Arc', <Snowflake size={16} />)}
            {tab('hackathon', 'Hackathon', <Trophy size={16} />)}
            {tab('accounts', 'Accounts', <Users size={16} />)}
            {tab('sources', 'Sources', <Database size={16} />)}
            <button
              className="flex items-center gap-2 h-9 px-3 rounded-lg text-[14px] font-medium db-muted hover:bg-[var(--surface-2)]"
              onClick={signOut}
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Log out</span>
            </button>
          </div>
        </div>
      </nav>
      {route === 'arc' ? (
        <ArcAdminPage />
      ) : route === 'hackathon' ? (
        <HackathonTeamsPage />
      ) : route === 'accounts' ? (
        <AccountsPage />
      ) : route === 'ideas' ? (
        <IdeasPage />
      ) : !liveResult ? (
        // Nothing saved on this device yet: the page is open, the first load is on its way.
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 py-16 flex flex-col items-center gap-3 text-[14px] db-muted text-center">
          {liveError ? (
            <>
              <span style={{color: 'var(--bad)'}}>{liveError}</span>
              <button className="db-btn" onClick={() => refresh()}>
                Try again
              </button>
            </>
          ) : (
            <>
              <Loader2 size={22} className="animate-spin" style={{color: 'var(--accent)'}} />
              Loading the latest data…
              <span className="text-[12px] db-faint">Next time, the last data shows here straight away.</span>
            </>
          )}
        </div>
      ) : route === 'sources' ? (
        <SourcesPage live={live} />
      ) : route === 'sales' ? (
        <SalesPage live={live} />
      ) : (
        <CeoDashboard live={live} />
      )}
    </div>
  );
}
