import { ArrowRight, Mail, Phone } from 'lucide-react';
import { Reveal } from '../../components/Reveal';

const FOOTER_LINKS = [
  { href: '#courses', label: 'Courses' },
  { href: '#batches', label: 'Get Started' },
  { href: '#about', label: 'About Us' },
  { href: '#', label: 'Jobs' },
  { href: '#', label: 'Blogs' },
  { href: '#', label: 'Alumni' },
  { href: '#', label: 'Mentors' },
];

export default function LandingFooter() {
  const scrollTo = (href: string) => {
    if (href === '#') return;
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="relative py-16">
      <div className="container-px">
        <Reveal className="rounded-3xl bg-ink px-8 py-12 sm:px-14 sm:py-14 text-center">
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-cream max-w-xl mx-auto">
            Seats for the September 2026 intake are limited.
          </h2>
          <p className="mt-3 text-ink-muted max-w-md mx-auto">
            Book a free 1-week trial or talk to our admissions team about the right track for you.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-4">
            <a
              href="#batches"
              onClick={(e) => {
                e.preventDefault();
                scrollTo('#batches');
              }}
              className="group inline-flex items-center gap-2 rounded-full bg-sun text-ink px-7 py-3.5 font-semibold hover:-translate-y-0.5 hover:shadow-lift transition-all duration-300 cursor-pointer"
            >
              Book Free Trial
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </a>
            <a
              href="mailto:admissions@qualitythought.in"
              className="inline-flex items-center gap-2 rounded-full border border-cream/20 text-cream px-7 py-3.5 font-semibold hover:bg-cream/10 transition-all duration-300 cursor-pointer"
            >
              <Mail className="h-4 w-4" />
              admissions@qualitythought.in
            </a>
          </div>
        </Reveal>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {FOOTER_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => {
                  if (link.href !== '#') {
                    e.preventDefault();
                    scrollTo(link.href);
                  }
                }}
                className="text-sm font-medium text-ink-muted hover:text-ink transition-colors cursor-pointer"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <a href="tel:+911234567890" className="flex items-center gap-2 text-sm font-medium text-ink-muted hover:text-ink transition-colors">
            <Phone className="h-4 w-4 text-sun" />
            +91 123 456 7890
          </a>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-ink-muted/70 border-t border-ink/5 pt-6">
          <span>&copy; {new Date().getFullYear()} Quality Thought. Hyderabad, India.</span>
          <span>NASSCOM · ISO 9001:2015 · Startup India recognised</span>
        </div>
      </div>
    </footer>
  );
}
