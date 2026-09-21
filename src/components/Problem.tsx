import { Building2, UserX, Unlink, TrendingDown, type LucideIcon } from 'lucide-react';
import { Reveal, Stagger, StaggerItem } from './Reveal';
import SectionTag from './SectionTag';

interface ProblemCard {
  Icon: LucideIcon;
  title: string;
  desc: string;
}

const CARDS: ProblemCard[] = [
  {
    Icon: Building2,
    title: 'Fixed infrastructure',
    desc: 'Classrooms, seats and physical capacity cap how many students you can reach.',
  },
  {
    Icon: UserX,
    title: 'Fixed trainer supply',
    desc: 'Every new batch needs a new trainer — quality and scale fight each other.',
  },
  {
    Icon: Unlink,
    title: 'Disconnected from hiring',
    desc: 'Students learn a syllabus, not the real tools and problems companies are hiring for.',
  },
  {
    Icon: TrendingDown,
    title: 'Capped revenue',
    desc: 'Fees can only stretch so far before the model stops making sense for anyone.',
  },
];

export default function Problem() {
  return (
    <section id="problem" className="relative py-24 lg:py-28 bg-paper/60">
      <div className="container-px">
        <Reveal>
          <SectionTag label="The Problem" />
        </Reveal>
        <Reveal delay={0.06}>
          <h2 className="mt-5 font-display font-bold text-3xl sm:text-4xl lg:text-5xl text-ink tracking-tight max-w-3xl">
            Classroom training has hit its ceiling.
          </h2>
        </Reveal>
        <Reveal delay={0.12}>
          <p className="mt-5 text-lg text-ink-muted max-w-xl">
            The gap is no longer access to content. It is access to the workplace.
          </p>
        </Reveal>

        <Stagger className="mt-14 grid sm:grid-cols-2 gap-6">
          {CARDS.map((c, i) => (
            <StaggerItem key={c.title}>
              <div className="group h-full rounded-3xl bg-white border border-ink/5 shadow-card p-7 flex gap-5 hover:shadow-lift hover:-translate-y-1 transition-all duration-400">
                <div className="shrink-0 h-12 w-12 rounded-2xl bg-ink/5 flex items-center justify-center font-display font-bold text-ink-muted group-hover:bg-sun/10 group-hover:text-sun transition-colors duration-400">
                  0{i + 1}
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg text-ink flex items-center gap-2">
                    <c.Icon className="h-5 w-5 text-sun" />
                    {c.title}
                  </h3>
                  <p className="mt-2 text-sm text-ink-muted leading-relaxed">{c.desc}</p>
                </div>
              </div>
            </StaggerItem>
          ))}
        </Stagger>

        <Reveal delay={0.1} className="mt-10 rounded-2xl bg-ink px-7 py-6 sm:flex items-center gap-3 text-cream">
          <span className="font-semibold text-sun">The opportunity:</span>
          <span className="font-display font-medium text-lg mt-1 sm:mt-0">
            Move learning closer to where real work happens.
          </span>
        </Reveal>
      </div>
    </section>
  );
}
