import { useState } from 'react';
import { ChevronRight, Check, Clock, UserRound, Wallet, ArrowRight } from 'lucide-react';
import { Reveal } from '../../components/Reveal';
import SectionTag from '../../components/SectionTag';
import { COURSES, CATEGORIES } from '../data';

export default function CoursesSection() {
  const [selectedId, setSelectedId] = useState(COURSES[0].id);
  const course = COURSES.find((c) => c.id === selectedId)!;

  return (
    <section id="courses" className="relative py-24 lg:py-28">
      <div className="container-px">
        <Reveal>
          <SectionTag label="Courses" />
        </Reveal>
        <Reveal delay={0.06} className="mt-5 flex flex-wrap items-end justify-between gap-6">
          <h2 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl text-ink tracking-tight max-w-2xl">
            Eight tracks. <span className="text-sun">One live, instructor-led method.</span>
          </h2>
          <p className="text-ink-muted max-w-sm">
            Every track is capped, mentor-led, and ends with mock interviews and placement support —
            not a certificate nobody hires for.
          </p>
        </Reveal>

        <Reveal delay={0.12} className="mt-14 grid lg:grid-cols-[360px_1fr] gap-6 items-start">
          {/* Category list */}
          <div className="rounded-3xl bg-white border border-ink/5 shadow-card p-4 sm:p-5">
            {CATEGORIES.map((cat) => (
              <div key={cat} className="mb-5 last:mb-0">
                <p className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-ink-muted">{cat}</p>
                <div className="space-y-1.5">
                  {COURSES.filter((c) => c.category === cat).map((c) => {
                    const active = c.id === selectedId;
                    return (
                      <button
                        key={c.id}
                        onClick={() => setSelectedId(c.id)}
                        className={`w-full flex items-center gap-3 rounded-xl px-3 py-3 text-left transition-all duration-300 cursor-pointer ${
                          active ? 'bg-ink text-cream shadow-soft' : 'text-ink-soft hover:bg-paper'
                        }`}
                      >
                        <span
                          className={`shrink-0 h-8 w-8 rounded-lg flex items-center justify-center ${
                            active ? 'bg-cream/15' : 'bg-sun/10'
                          }`}
                        >
                          <c.Icon className={`h-4 w-4 ${active ? 'text-cream' : 'text-sun'}`} />
                        </span>
                        <span className={`flex-1 min-w-0 text-sm font-semibold truncate ${active ? 'text-cream' : 'text-ink'}`}>
                          {c.title}
                        </span>
                        <ChevronRight className={`h-4 w-4 shrink-0 ${active ? 'text-cream/70' : 'text-ink-muted/50'}`} />
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Detail panel */}
          <div className="rounded-3xl bg-white border border-ink/5 shadow-card p-7 sm:p-9">
            <span className="inline-flex items-center rounded-full bg-leaf/10 text-leaf text-xs font-bold uppercase tracking-wide px-3 py-1.5">
              Online · {course.duration}
            </span>
            <h3 className="mt-4 font-display font-bold text-2xl sm:text-3xl text-ink tracking-tight">{course.title}</h3>
            <p className="mt-3 text-ink-muted leading-relaxed max-w-2xl">{course.tagline}</p>

            <div className="mt-6 grid grid-cols-3 gap-3 sm:gap-4">
              <div className="rounded-2xl bg-paper/70 p-4">
                <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
                  <Clock className="h-3.5 w-3.5" /> Duration
                </p>
                <p className="mt-1.5 font-display font-bold text-leaf">{course.duration}</p>
              </div>
              <div className="rounded-2xl bg-paper/70 p-4">
                <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
                  <UserRound className="h-3.5 w-3.5" /> Mentor
                </p>
                <p className="mt-1.5 font-display font-bold text-leaf truncate">{course.mentor}</p>
              </div>
              <div className="rounded-2xl bg-paper/70 p-4">
                <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
                  <Wallet className="h-3.5 w-3.5" /> CTC Range
                </p>
                <p className="mt-1.5 font-display font-bold text-leaf">{course.ctc}</p>
              </div>
            </div>

            <div className="mt-6 rounded-2xl bg-[radial-gradient(ellipse_at_top_left,_var(--color-sun-light)_0%,_transparent_60%),radial-gradient(ellipse_at_bottom_right,_var(--color-sky-light)_0%,_transparent_60%)] bg-ink/[0.03] p-8 sm:p-10 flex items-center justify-center">
              <course.Icon className="h-16 w-16 text-sun/70" strokeWidth={1.25} />
            </div>

            <ul className="mt-6 grid sm:grid-cols-3 gap-3">
              {course.highlights.map((h) => (
                <li key={h} className="flex items-start gap-2 text-sm text-ink-soft">
                  <Check className="h-4 w-4 text-leaf shrink-0 mt-0.5" />
                  {h}
                </li>
              ))}
            </ul>

            <a
              href="#demo-dates"
              onClick={(e) => {
                e.preventDefault();
                document.querySelector('#demo-dates')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="mt-7 group/link inline-flex items-center gap-2 rounded-full bg-ink text-cream text-sm font-semibold px-6 py-3 hover:bg-ink-soft hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
            >
              See free demo dates
              <ArrowRight className="h-4 w-4 transition-transform group-hover/link:translate-x-1" />
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
