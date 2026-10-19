import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';

const LINKS = [
  { href: '#top', label: 'Home' },
  { href: '#batches', label: 'Upcoming Batches' },
  { href: '#courses', label: 'Courses' },
  { href: '#demo-dates', label: 'Free Demo Dates' },
  { href: '#about', label: 'About Us' },
  { href: './idea-challenge', label: 'Idea Challenge' },
];

export default function LandingNavbar() {
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
    if (!href.startsWith('#')) {
      window.location.href = href;
      return;
    }
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-cream/85 backdrop-blur-md shadow-card' : 'bg-transparent'
      }`}
    >
      <div className="container-px flex items-center justify-between h-20">
        <a href="#top" className="flex items-center group">
          <img
            src={`${import.meta.env.BASE_URL}quality-thought-logo.png`}
            alt="Quality Thought"
            className="h-11 sm:h-12 w-auto object-contain"
          />
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
            onClick={() => handleNav('#batches')}
            className="hidden sm:inline-flex items-center gap-2 rounded-full bg-ink text-cream text-sm font-semibold px-5 py-2.5 shadow-soft hover:bg-ink-soft hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
          >
            Book Free 1-Week Trial
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
                onClick={() => handleNav('#batches')}
                className="mt-2 rounded-full bg-ink text-cream text-sm font-semibold px-5 py-3"
              >
                Book Free 1-Week Trial
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
