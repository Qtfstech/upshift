import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';

const LINKS = [
  { href: '#workshops', label: 'Workshops' },
  { href: '#solution', label: 'The Method' },
  { href: '#products', label: 'Products' },
  { href: '#domains', label: 'Domains' },
  { href: '#why-now', label: 'Why Hyderabad' },
  { href: '#investors', label: 'Partners' },
  { href: '#contact', label: 'Contact' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleNav = (href: string) => {
    setOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header
      className={`focus-blur fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-cream/85 backdrop-blur-md shadow-card' : 'bg-transparent'
      }`}
    >
      <div className="container-px flex items-center justify-between h-24">
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            handleNav('#top');
          }}
          className="flex items-center gap-3 group"
        >
          <div className="h-11 w-11 transition-transform duration-300 group-hover:rotate-6">
            <img src={`${import.meta.env.BASE_URL}logo-icon.png`} alt="Upshift India" className="h-full w-full object-contain" />
          </div>
          <span className="flex flex-col leading-tight gap-0.5">
            <span className="font-display font-bold text-lg tracking-tight text-ink">
              Upshift <span className="text-sun">India</span>
            </span>
            <span className="font-mono text-[10px] uppercase tracking-wide text-ink-muted">
              Upskill Today. Upshift Tomorrow.
            </span>
            <span className="font-mono text-[9px] uppercase tracking-wide text-ink-muted/70">
              Where training meets the workplace
            </span>
          </span>
        </a>

        <nav className="hidden lg:flex items-center gap-8">
          {LINKS.map((link) => (
            <button
              key={link.href}
              onClick={() => handleNav(link.href)}
              className="text-sm font-medium text-ink-muted hover:text-ink transition-colors relative group cursor-pointer"
            >
              {link.label}
              <span className="absolute -bottom-1 left-0 h-px w-0 bg-sun transition-all duration-300 group-hover:w-full" />
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={() => handleNav('#workshops')}
            className="hidden sm:inline-flex items-center gap-2 rounded-full bg-ink text-cream text-sm font-semibold px-5 py-2.5 shadow-soft hover:bg-ink-soft hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
          >
            Book a Demo Seat
          </button>
          <button
            onClick={() => setOpen((v) => !v)}
            className="lg:hidden p-2 rounded-full hover:bg-ink/5 transition-colors cursor-pointer"
            aria-label="Toggle menu"
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden overflow-hidden bg-cream/95 backdrop-blur-md border-t border-ink/5"
          >
            <div className="container-px py-6 flex flex-col gap-4">
              {LINKS.map((link) => (
                <button
                  key={link.href}
                  onClick={() => handleNav(link.href)}
                  className="text-left text-base font-medium text-ink-soft"
                >
                  {link.label}
                </button>
              ))}
              <button
                onClick={() => handleNav('#workshops')}
                className="mt-2 rounded-full bg-ink text-cream text-sm font-semibold px-5 py-3"
              >
                Book a Demo Seat
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
