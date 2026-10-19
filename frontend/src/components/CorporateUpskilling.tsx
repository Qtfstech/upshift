import { ArrowRight, TrendingUp, BrainCircuit, UserPlus, Briefcase, type LucideIcon } from 'lucide-react';
import { Reveal, Stagger, StaggerItem } from './Reveal';
import SectionTag from './SectionTag';

interface Benefit {
  Icon: LucideIcon;
  title: string;
  desc: string;
}

const BENEFITS: Benefit[] = [
  {
    Icon: TrendingUp,
    title: 'Grow talent from within',
    desc: 'Move existing employees into higher-value technical roles instead of hiring externally at market rate.',
  },
  {
    Icon: BrainCircuit,
    title: 'Keep institutional knowledge',
    desc: 'The people who already understand your business become the people who can build its next chapter.',
  },
  {
    Icon: UserPlus,
    title: 'Open a real entry-level role',
    desc: 'As employees move up, junior-level vacancies open up — a natural place for new talent.',
  },
  {
    Icon: Briefcase,
    title: 'Filled from Upshift learners',
    desc: 'Where a vacancy opens, Upshift can connect one of its trained students to an internship or entry-level role.',
  },
];

const STEPS = [
  { label: 'Upskill', desc: 'A cohort of 25 to 30 employees trained for higher-value technical roles.' },
  { label: 'Move up', desc: 'Trained employees step into the new roles inside your company.' },
  { label: 'Backfill', desc: 'The junior vacancy is filled by a trained Upshift learner.' },
];

interface Props {
  onSelect?: (name: string) => void;
}

export default function CorporateUpskilling({ onSelect }: Props) {
  return (
    <section id="corporate-upskilling" className="relative py-24 lg:py-28">
      <div className="container-px">
        <Reveal>
          <SectionTag label="Corporate Employee Upskilling" />
        </Reveal>
        <Reveal delay={0.06} className="mt-5 flex flex-wrap items-end justify-between gap-6">
          <h2 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl text-ink tracking-tight max-w-2xl">
            Your next senior hire is <span className="text-sun">already on your team</span>.
          </h2>
          <p className="text-ink-muted max-w-sm">
            A program for companies that want to grow existing employees into higher-value
            technical roles — and create real opportunities for new talent along the way.
          </p>
        </Reveal>

        <Stagger className="mt-14 grid sm:grid-cols-2 gap-6">
          {BENEFITS.map((b) => (
            <StaggerItem key={b.title}>
              <div className="group h-full rounded-3xl bg-white border border-ink/5 shadow-card p-8 hover:shadow-lift hover:-translate-y-1 transition-all duration-400">
                <div className="h-12 w-12 rounded-2xl bg-sun/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-400">
                  <b.Icon className="h-6 w-6 text-sun" />
                </div>
                <h3 className="mt-5 font-display font-bold text-xl text-ink">{b.title}</h3>
                <p className="mt-2 text-sm text-ink-muted leading-relaxed">{b.desc}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>

        <Reveal delay={0.1} className="mt-10 rounded-3xl bg-paper/70 border border-ink/5 p-8 sm:p-10">
          <h3 className="section-tag !text-ink-soft mb-6">How it works</h3>
          <ol className="grid sm:grid-cols-3 gap-6">
            {STEPS.map((s, i) => (
              <li key={s.label} className="flex items-start gap-3">
                <span className="h-7 w-7 shrink-0 rounded-full bg-sun/10 text-sun text-sm font-bold flex items-center justify-center">
                  {i + 1}
                </span>
                <div>
                  <p className="font-display font-bold text-ink">{s.label}</p>
                  <p className="mt-1 text-sm text-ink-muted leading-relaxed">{s.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </Reveal>

        <Reveal delay={0.1} className="mt-12">
          <button
            onClick={() => onSelect?.('Corporate Employee Upskilling')}
            className="group inline-flex items-center gap-2 rounded-full bg-ink text-cream px-7 py-3.5 font-semibold shadow-soft hover:bg-ink-soft hover:-translate-y-0.5 hover:shadow-lift transition-all duration-300 cursor-pointer"
          >
            Talk to Us About Upskilling
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
        </Reveal>
      </div>
    </section>
  );
}
