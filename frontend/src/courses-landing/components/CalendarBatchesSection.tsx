import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Users, MapPin, CalendarCheck, Check, Mail } from 'lucide-react';
import { Reveal } from '../../components/Reveal';
import SectionTag from '../../components/SectionTag';
import { BATCHES, COURSES } from '../data';

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

export default function CalendarBatchesSection() {
  const entries = useMemo(
    () =>
      [...BATCHES]
        .map((batch) => ({ batch, date: new Date(batch.startDate) }))
        .sort((a, b) => a.date.getTime() - b.date.getTime()),
    [],
  );

  const [selectedId, setSelectedId] = useState(entries[0].batch.courseId);
  const [monthCursor, setMonthCursor] = useState(
    () => new Date(entries[0].date.getFullYear(), entries[0].date.getMonth(), 1),
  );

  const selected = entries.find((e) => e.batch.courseId === selectedId) ?? entries[0];
  const course = COURSES.find((c) => c.id === selected.batch.courseId)!;
  const today = new Date();

  const cells = useMemo(() => {
    const year = monthCursor.getFullYear();
    const month = monthCursor.getMonth();
    const firstWeekday = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const grid: (Date | null)[] = Array(firstWeekday).fill(null);
    for (let d = 1; d <= daysInMonth; d++) grid.push(new Date(year, month, d));
    return grid;
  }, [monthCursor]);

  const changeMonth = (delta: number) =>
    setMonthCursor((prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));

  const bookHref = `mailto:admissions@qualitythought.in?subject=${encodeURIComponent(
    `Book seat — ${course.title} (${selected.batch.startDate})`,
  )}`;

  return (
    <section id="batches" className="relative py-24 lg:py-28 bg-paper/60">
      <div className="container-px">
        <Reveal>
          <SectionTag label="Upcoming Batches" />
        </Reveal>
        <Reveal delay={0.06}>
          <h2 className="mt-5 font-display font-bold text-3xl sm:text-4xl lg:text-5xl text-ink tracking-tight max-w-3xl">
            Pick a date. See the batch. Book your seat.
          </h2>
        </Reveal>
        <Reveal delay={0.12}>
          <p className="mt-5 text-lg text-ink-muted max-w-xl">
            New cohorts launch through September and October 2026. Tap a highlighted date on the
            calendar to see that batch's details.
          </p>
        </Reveal>

        <div className="mt-14 grid lg:grid-cols-[0.85fr_1.15fr] gap-6 items-start">
          {/* Selected batch / booking panel */}
          <Reveal delay={0.1} className="rounded-3xl bg-white border border-ink/5 shadow-card p-7 sm:p-8">
            <div className="h-12 w-12 rounded-xl bg-sun/10 flex items-center justify-center">
              <course.Icon className="h-6 w-6 text-sun" />
            </div>
            <h3 className="mt-5 font-display font-bold text-xl text-ink">{course.title}</h3>
            <p className="mt-2 text-sm text-ink-muted leading-relaxed">{course.tagline}</p>

            <div className="mt-5 flex flex-wrap gap-2 text-[11px] font-semibold uppercase tracking-wide">
              <span className="rounded-full bg-paper px-3 py-1 text-ink-soft">{course.duration}</span>
              <span className="rounded-full bg-paper px-3 py-1 text-ink-soft">{course.level}</span>
            </div>

            <ul className="mt-5 space-y-2">
              {course.highlights.map((h) => (
                <li key={h} className="flex items-start gap-2 text-sm text-ink-soft">
                  <Check className="h-4 w-4 text-leaf shrink-0 mt-0.5" />
                  {h}
                </li>
              ))}
            </ul>

            <div className="mt-6 space-y-2.5 border-t border-ink/5 pt-5 text-sm text-ink-soft">
              <div className="flex items-center gap-2">
                <CalendarCheck className="h-4 w-4 text-sun shrink-0" />
                Batch starts <span className="font-semibold text-ink">{selected.batch.startDate}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-ink-muted shrink-0" />
                {selected.batch.mode}
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-ink-muted shrink-0" />
                {selected.batch.seatsLeft} of {selected.batch.cohortSize} seats left
              </div>
            </div>

            <a
              href={bookHref}
              className="mt-7 group inline-flex w-full items-center justify-center gap-2 rounded-full bg-ink text-cream text-sm font-semibold px-6 py-3.5 hover:bg-ink-soft hover:-translate-y-0.5 hover:shadow-lift transition-all duration-300 cursor-pointer"
            >
              <Mail className="h-4 w-4" />
              Book This Batch
            </a>
          </Reveal>

          {/* Big calendar */}
          <Reveal delay={0.16} className="rounded-3xl bg-white border border-ink/5 shadow-card p-6 sm:p-8">
            <div className="flex items-center justify-between">
              <p className="font-display font-bold text-lg sm:text-xl text-ink">
                {MONTH_NAMES[monthCursor.getMonth()]} {monthCursor.getFullYear()}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => changeMonth(-1)}
                  aria-label="Previous month"
                  className="h-9 w-9 rounded-full border border-ink/10 flex items-center justify-center text-ink-muted hover:bg-ink/5 hover:text-ink transition-colors cursor-pointer"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => changeMonth(1)}
                  aria-label="Next month"
                  className="h-9 w-9 rounded-full border border-ink/10 flex items-center justify-center text-ink-muted hover:bg-ink/5 hover:text-ink transition-colors cursor-pointer"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-7 gap-1.5 sm:gap-2 text-center">
              {WEEKDAYS.map((w, i) => (
                <span key={i} className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted py-1">
                  {w}
                </span>
              ))}

              {cells.map((date, i) => {
                if (!date) return <span key={i} />;
                const match = entries.find((e) => sameDay(e.date, date));
                const isSelected = match && match.batch.courseId === selectedId;
                const isToday = sameDay(date, today);

                if (!match) {
                  return (
                    <span
                      key={i}
                      className={`aspect-square flex items-center justify-center rounded-xl text-sm ${
                        isToday ? 'ring-1 ring-ink/15 text-ink-soft font-semibold' : 'text-ink-muted/50'
                      }`}
                    >
                      {date.getDate()}
                    </span>
                  );
                }

                return (
                  <button
                    key={i}
                    onClick={() => setSelectedId(match.batch.courseId)}
                    className={`group relative aspect-square flex flex-col items-center justify-center gap-0.5 rounded-xl text-sm font-bold transition-all duration-300 cursor-pointer ${
                      isSelected
                        ? 'bg-ink text-cream shadow-lift scale-105'
                        : 'bg-sun/10 text-sun hover:bg-sun/20 hover:-translate-y-0.5'
                    }`}
                  >
                    {date.getDate()}
                    <span className={`h-1 w-1 rounded-full ${isSelected ? 'bg-sun' : 'bg-sun'}`} />
                  </button>
                );
              })}
            </div>

            <p className="mt-6 flex items-center gap-2 text-xs text-ink-muted">
              <span className="h-2.5 w-2.5 rounded-full bg-sun/20 border border-sun/40" />
              Highlighted dates have a batch starting — tap one to see details
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
