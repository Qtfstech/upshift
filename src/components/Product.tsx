import { BookOpen, Hammer, Handshake, CheckCircle2, type LucideIcon } from 'lucide-react';
import { Reveal, Stagger, StaggerItem } from './Reveal';
import SectionTag from './SectionTag';

interface StepItem {
  Icon: LucideIcon;
  label: string;
  desc: string;
}

const STEPS: StepItem[] = [
  {
    Icon: BookOpen,
    label: 'Learn',
    desc: 'Structured technical learning built around the domain.',
  },
  {
    Icon: Hammer,
    label: 'Build',
    desc: 'Projects, labs and challenges inside relevant work contexts.',
  },
  {
    Icon: Handshake,
    label: 'Connect',
    desc: 'Startups, companies, mentors and real career pathways.',
  },
];

const DIFFERENTIATORS = [
  'Designed for domains where physical / ecosystem exposure matters',
  'Industry collaboration is part of the learning experience',
  'Learners graduate with evidence of applied capability, not only certificates',
];

export default function Product() {
  return (
    <section id="product" className="relative py-24 lg:py-28">
      <div className="container-px">
        <Reveal>
          <SectionTag label="The Product" />
        </Reveal>
        <Reveal delay={0.06}>
          <h2 className="mt-5 font-display font-bold text-3xl sm:text-4xl lg:text-5xl text-ink tracking-tight max-w-3xl">
            One core offering. <span className="text-sun">Workplace-Integrated Learning.</span>
          </h2>
        </Reveal>
        <Reveal delay={0.12}>
          <p className="mt-5 text-lg text-ink-muted max-w-xl">
            The demo workshops are your first step in; WIL is the full company architecture.
          </p>
        </Reveal>

        <Stagger className="mt-14 grid sm:grid-cols-3 gap-6">
          {STEPS.map((s, i) => (
            <StaggerItem key={s.label}>
              <div className="group relative h-full rounded-3xl bg-white border border-ink/5 shadow-card p-8 hover:shadow-lift hover:-translate-y-1 transition-all duration-400 overflow-hidden">
                <span className="absolute top-6 right-7 font-display font-bold text-5xl text-ink/[0.04]">0{i + 1}</span>
                <div className="h-12 w-12 rounded-2xl bg-sun/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-400">
                  <s.Icon className="h-6 w-6 text-sun" />
                </div>
                <h3 className="relative mt-5 font-display font-bold text-xl text-ink">{s.label}</h3>
                <p className="relative mt-2 text-sm text-ink-muted leading-relaxed">{s.desc}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>

        <Reveal delay={0.1} className="mt-14 rounded-3xl bg-paper/70 border border-ink/5 p-8 sm:p-10">
          <h3 className="section-tag !text-ink-soft mb-6">What makes WIL different</h3>
          <div className="grid sm:grid-cols-3 gap-6">
            {DIFFERENTIATORS.map((d) => (
              <div key={d} className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-sky shrink-0 mt-0.5" />
                <p className="text-sm text-ink-soft leading-relaxed">{d}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
