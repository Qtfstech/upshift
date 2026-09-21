import { Instagram, Linkedin, Mail } from 'lucide-react';
import { UpshiftIcon } from './Logos';

const LINKS = [
  { href: '#workshops', label: 'Workshops' },
  { href: '#solution', label: 'The Method' },
  { href: '#products', label: 'Products' },
  { href: '#domains', label: 'Domains' },
  { href: '#why-now', label: 'Why Hyderabad' },
  { href: '#investors', label: 'Partners' },
  { href: '#contact', label: 'Contact' },
];

export default function Footer() {
  const handleNav = (href: string) => document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <footer className="relative bg-ink text-cream/70 pt-16 pb-8 overflow-hidden">
      <div className="pointer-events-none absolute -top-24 right-0 h-72 w-72 rounded-full bg-sun/10 blur-3xl" />
      <div className="container-px relative grid sm:grid-cols-[1.3fr_1fr_1fr] gap-12">
        <div>
          <div className="flex items-center gap-3">
            <span className="h-11 w-11 rounded-xl bg-white p-1.5 flex items-center justify-center">
              <UpshiftIcon className="h-full w-full object-contain" />
            </span>
            <span className="font-display font-bold text-lg text-cream">Upshift India</span>
          </div>
          <p className="mt-4 text-sm leading-relaxed max-w-xs">
            Upskill Today. Upshift Tomorrow. — Where training meets the workplace.
          </p>
          <div className="mt-6 flex items-center gap-3">
            {[Linkedin, Instagram, Mail].map((Icon, i) => (
              <a
                key={i}
                href="#contact"
                onClick={(e) => {
                  e.preventDefault();
                  handleNav('#contact');
                }}
                className="h-9 w-9 rounded-full bg-cream/10 flex items-center justify-center hover:bg-sun hover:text-ink transition-colors duration-300"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-display font-semibold text-cream mb-4">Explore</h4>
          <ul className="space-y-2.5 text-sm">
            {LINKS.map((l) => (
              <li key={l.href}>
                <button
                  onClick={() => handleNav(l.href)}
                  className="hover:text-sun transition-colors cursor-pointer"
                >
                  {l.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-display font-semibold text-cream mb-4">Contact</h4>
          <ul className="space-y-2.5 text-sm">
            <li>hello@upshiftindia.com</li>
            <li>+91 00000 00000</li>
            <li>Hyderabad, India</li>
          </ul>
        </div>
      </div>

      <div className="container-px mt-14 pt-6 border-t border-cream/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-cream/40">
        <span>© {new Date().getFullYear()} Upshift India. All rights reserved.</span>
        <span>Built for where India's jobs are landing.</span>
      </div>
    </footer>
  );
}
