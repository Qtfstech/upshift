import { CalendarDays, Clock, MapPin } from 'lucide-react';
import { Reveal, Stagger, StaggerItem } from '../../components/Reveal';
import SectionTag from '../../components/SectionTag';
import { DEMO_DATES, COURSES } from '../data';

export default function DemoDatesSection() {
  return (
    <section id="demo-dates" className="relative py-24 lg:py-28 bg-paper/60">
      <div className="container-px">
        <Reveal>
          <SectionTag label="Free Demo Sessions" />
        </Reveal>
        <Reveal delay={0.06}>
          <h2 className="mt-5 font-display font-bold text-3xl sm:text-4xl lg:text-5xl text-ink tracking-tight max-w-3xl">
            Try a class before you commit.
          </h2>
        </Reveal>
        <Reveal delay={0.12}>
          <p className="mt-5 text-lg text-ink-muted max-w-xl">
            A free, no-obligation 90-minute live demo for every track — meet the instructors, see how
            a class runs, and ask anything before you enrol.
          </p>
        </Reveal>

        <Stagger className="mt-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-5" staggerChildren={0.08}>
          {DEMO_DATES.map((d) => {
            const course = COURSES.find((c) => c.id === d.courseId)!;
            return (
              <StaggerItem key={d.courseId}>
                <div className="h-full rounded-2xl bg-white border border-ink/5 shadow-card p-6 flex flex-col hover:shadow-lift hover:-translate-y-1 hover:border-sun/20 transition-all duration-400">
                  <div className="h-10 w-10 rounded-xl bg-sun/10 flex items-center justify-center">
                    <course.Icon className="h-5 w-5 text-sun" />
                  </div>
                  <h3 className="mt-4 font-display font-bold text-ink">{course.title}</h3>

                  <div className="mt-4 space-y-2 text-sm text-ink-soft">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 text-ink-muted shrink-0" />
                      {d.date} · {d.day}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-ink-muted shrink-0" />
                      {d.time}
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-ink-muted shrink-0" />
                      {d.mode}
                    </div>
                  </div>

                  <a
                    href={`mailto:admissions@qualitythought.in?subject=${encodeURIComponent(
                      `Reserve demo seat — ${course.title} (${d.date})`,
                    )}`}
                    className="mt-6 inline-flex items-center justify-center rounded-full bg-ink text-cream text-sm font-semibold px-4 py-2.5 hover:bg-ink-soft transition-colors duration-300 cursor-pointer"
                  >
                    Reserve seat
                  </a>
                </div>
              </StaggerItem>
            );
          })}
        </Stagger>
      </div>
    </section>
  );
}
