import { Reveal, Stagger, StaggerItem } from './Reveal';
import SectionTag from './SectionTag';
import CountUp from './CountUp';

interface StatItem {
  to: number;
  suffix: string;
  label: string;
}

const STATS: StatItem[] = [
  { to: 355, suffix: '+', label: 'Global Capability Centres now based in Hyderabad' },
  { to: 197, suffix: '', label: 'New GCCs set up in the last 2.5 years' },
  { to: 2, suffix: ' Lakh', label: "Learners targeted by AP's new deep-tech skilling mission" },
];

const DOMAIN_TAGS = ['AI', 'Cybersecurity', 'Data', 'Deep Tech'];
const PARTNERS = ["L'Oréal", 'Vanguard', 'Southwest Airlines', "McDonald's", 'Nestlé'];

export default function WhyNow() {
  return (
    <section id="why-now" className="relative py-24 lg:py-28 bg-paper/60 overflow-hidden">
      <div className="container-px">
        <Reveal>
          <SectionTag label="Why Now" />
        </Reveal>
        <Reveal delay={0.06}>
          <h2 className="mt-5 font-display font-bold text-3xl sm:text-4xl lg:text-5xl text-ink tracking-tight max-w-3xl">
            Hyderabad is the launchpad.
          </h2>
        </Reveal>
        <Reveal delay={0.12}>
          <p className="mt-5 text-lg text-ink-muted max-w-xl">
            The city already has the ingredients for a workplace-learning network.
          </p>
        </Reveal>

        <Stagger className="mt-14 grid sm:grid-cols-3 gap-6">
          {STATS.map((s) => (
            <StaggerItem key={s.label}>
              <div className="h-full rounded-3xl bg-white border border-ink/5 shadow-card p-8 hover:shadow-lift hover:-translate-y-1 transition-all duration-400">
                <div className="font-display font-bold text-4xl sm:text-5xl text-sun">
                  <CountUp to={s.to} suffix={s.suffix} />
                </div>
                <p className="mt-3 text-sm text-ink-muted leading-relaxed">{s.label}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>

        <Reveal delay={0.1} className="mt-8 rounded-2xl bg-white border border-ink/5 shadow-card px-7 py-5 flex flex-wrap gap-3">
          {DOMAIN_TAGS.map((t) => (
            <span key={t} className="rounded-full bg-sky/10 text-sky font-semibold text-sm px-4 py-1.5">
              {t}
            </span>
          ))}
        </Reveal>
      </div>

      <Reveal delay={0.16} className="mt-10">
        <div className="relative py-6 border-y border-ink/5 bg-white/60">
          <div className="flex w-max animate-marquee gap-16 px-8">
            {[...PARTNERS, ...PARTNERS].map((p, i) => (
              <span key={i} className="font-display font-semibold text-xl text-ink-muted/50 whitespace-nowrap">
                {p}
              </span>
            ))}
          </div>
        </div>
      </Reveal>

      <div className="container-px">
        <Reveal delay={0.1} className="mt-14 rounded-2xl bg-ink px-7 py-7 text-center">
          <p className="font-display font-medium text-lg sm:text-xl text-cream max-w-3xl mx-auto">
            This isn't a training gap. It's a placement pipeline sitting right here —
            <span className="text-sun"> and Upshift is the bridge into it.</span>
          </p>
        </Reveal>
      </div>
    </section>
  );
}
