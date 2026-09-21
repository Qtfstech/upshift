import { Building2, Wrench, Puzzle, Briefcase, ArrowRight, type LucideIcon } from 'lucide-react';
import { Reveal, Stagger, StaggerItem } from './Reveal';
import SectionTag from './SectionTag';

interface SolutionStep {
  Icon: LucideIcon;
  label: string;
  sub: string;
}

const STEPS: SolutionStep[] = [
  { Icon: Building2, label: 'Real Companies', sub: 'Industry context' },
  { Icon: Wrench, label: 'Real Tools', sub: 'Current technology' },
  { Icon: Puzzle, label: 'Real Problems', sub: 'Hands-on challenges' },
  { Icon: Briefcase, label: 'Real Hiring', sub: 'Career pathways' },
];

export default function Solution() {
  return (
    <section id="solution" className="relative py-24 lg:py-28">
      <div className="container-px">
        <Reveal>
          <SectionTag label="The Solution" />
        </Reveal>
        <Reveal delay={0.06}>
          <h2 className="mt-5 font-display font-bold text-3xl sm:text-4xl lg:text-5xl text-ink tracking-tight max-w-3xl">
            Learning embedded where work is happening.
          </h2>
        </Reveal>
        <Reveal delay={0.12}>
          <p className="mt-5 text-lg text-ink-muted max-w-xl">
            Upshift's core product is Workplace-Integrated Learning (WIL).
          </p>
        </Reveal>

        <Stagger className="mt-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-0 lg:items-stretch">
          {STEPS.map((s, i) => (
            <StaggerItem key={s.label} className="flex items-stretch">
              <div className="group flex-1 rounded-3xl bg-white border border-ink/5 shadow-card p-7 hover:shadow-lift hover:-translate-y-1 transition-all duration-400">
                <div className="h-12 w-12 rounded-2xl bg-sky/10 flex items-center justify-center group-hover:bg-sun/10 transition-colors duration-400">
                  <s.Icon className="h-6 w-6 text-sky group-hover:text-sun transition-colors duration-400" />
                </div>
                <h3 className="mt-5 font-display font-bold text-ink">{s.label}</h3>
                <p className="mt-1 text-sm text-ink-muted">{s.sub}</p>
              </div>
              {i < STEPS.length - 1 && (
                <div className="hidden lg:flex items-center justify-center w-10 shrink-0">
                  <ArrowRight className="h-5 w-5 text-ink/20" />
                </div>
              )}
            </StaggerItem>
          ))}
        </Stagger>

        <Reveal delay={0.1} className="mt-16 grid lg:grid-cols-2 gap-8 items-start">
          <div>
            <p className="font-display text-2xl sm:text-3xl text-ink-muted leading-snug">
              We don't simply teach the next technology.
            </p>
            <p className="mt-2 font-display font-bold text-2xl sm:text-3xl text-sun leading-snug">
              We place learners closer to the ecosystem that creates the next jobs.
            </p>
          </div>
          <p className="text-ink-muted leading-relaxed lg:pt-2 lg:border-l lg:border-ink/10 lg:pl-8">
            WIL is designed for domains where hands-on exposure, specialist mentorship and
            real environments create an advantage over generic online learning — cybersecurity
            floors, robotics labs, mission-design studios and beyond.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
