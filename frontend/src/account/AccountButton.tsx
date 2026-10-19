import { ChevronDown, LayoutDashboard, LogIn, LogOut, Rocket, Snowflake } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { logout, type Account, type Page } from './account';
import LoginModal from './LoginModal';

/** Top-right of the main page, Idea Challenge and Hackathon: "Log in", or the account name with a small menu. */
export default function AccountButton({ account, page, dark = false }: { account: Account | null; page: Page; dark?: boolean }) {
  const [loginOpen, setLoginOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const close = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setMenuOpen(false);
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [menuOpen]);

  const base = import.meta.env.BASE_URL;
  const chip = dark
    ? 'border-white/15 text-white hover:bg-white/10'
    : 'border-ink/15 text-ink hover:bg-ink/5';

  if (!account) {
    return (
      <>
        <button
          onClick={() => setLoginOpen(true)}
          className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2.5 text-sm font-semibold transition cursor-pointer ${chip}`}
        >
          <LogIn className="h-4 w-4" /> Log in
        </button>
        {loginOpen && <LoginModal page={page} onClose={() => setLoginOpen(false)} />}
      </>
    );
  }

  const links = [
    { href: `${base}#my-upshift`, label: 'My Upshift', Icon: LayoutDashboard },
    { href: `${base}idea-challenge`, label: 'Idea Challenge', Icon: Snowflake },
    { href: `${base}hackathon`, label: 'Hackathon', Icon: Rocket },
  ];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setMenuOpen((v) => !v)}
        className={`inline-flex items-center gap-2 rounded-full border pl-1.5 pr-3 py-1.5 text-sm font-semibold transition cursor-pointer ${chip}`}
        aria-expanded={menuOpen}
        title={account.user.name}
      >
        <span className="h-7 w-7 rounded-full bg-sun text-white flex items-center justify-center font-display font-bold">{account.user.firstName[0]?.toUpperCase()}</span>
        <span className="max-w-[8rem] truncate">{account.user.firstName}</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
      </button>
      {menuOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-ink/10 shadow-lift p-1.5 text-left text-ink z-[60]">
          <div className="px-3 py-2 border-b border-ink/5 mb-1">
            <p className="font-semibold truncate">{account.user.name}</p>
            <p className="text-xs text-ink-muted">+91 {account.user.phone}</p>
          </div>
          {links.map((l) => (
            <a key={l.label} href={l.href} onClick={() => setMenuOpen(false)} className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm hover:bg-ink/5">
              <l.Icon className="h-4 w-4 text-sun" /> {l.label}
            </a>
          ))}
          <button
            onClick={() => {
              setMenuOpen(false);
              logout(page);
            }}
            className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-ink-muted hover:bg-ink/5 cursor-pointer"
          >
            <LogOut className="h-4 w-4" /> Log out
          </button>
        </div>
      )}
    </div>
  );
}
