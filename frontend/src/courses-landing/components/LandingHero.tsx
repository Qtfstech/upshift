import { ArrowRight, CalendarDays } from 'lucide-react';
import { Reveal } from '../../components/Reveal';
import CoachingIllustration from './CoachingIllustration';

export default function LandingHero() {
  const scrollTo = (href: string) => document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <section id="top" className="relative overflow-hidden pt-32 pb-16 lg:pt-40 lg:pb-20">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--color-sun-light)_0%,_transparent_55%),radial-gradient(ellipse_at_bottom_right,_var(--color-sky-light)_0%,_transparent_55%)]" />
        <div className="absolute -top-24 -right-20 h-[28rem] w-[28rem] rounded-full bg-sun/10 blur-3xl animate-float" />
        <div className="absolute top-1/3 -left-24 h-96 w-96 rounded-full bg-sky/15 blur-3xl animate-floatSlow" />
        <div className="absolute inset-0 bg-noise" />
      </div>

      <div className="container-px grid lg:grid-cols-[1.1fr_0.9fr] gap-10 lg:gap-12 items-center">
        <div className="text-center lg:text-left">
          <Reveal>
            <span className="section-tag justify-center lg:justify-start">
              <span className="h-1.5 w-1.5 rounded-full bg-sun" />
              100% Live, Instructor-led Courses
            </span>
          </Reveal>

          <Reveal delay={0.06}>
            <h1 className="mt-5 font-display font-bold text-4xl sm:text-5xl lg:text-[3.4rem] leading-[1.08] tracking-tight text-ink">
              Launch Your IT Career. <span className="text-gradient">The Right Way.</span>
            </h1>
          </Reveal>

          <Reveal delay={0.12}>
            <p className="mt-6 text-lg text-ink-muted max-w-xl mx-auto lg:mx-0 leading-relaxed">
              We don't just teach technology — we build careers. Live instructor-led courses in AI,
              Cloud, Data and Full Stack, designed around what MNCs are actually hiring for in 2026.
            </p>
          </Reveal>

          <Reveal delay={0.2} className="mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-4">
            <button
              onClick={() => scrollTo('#batches')}
              className="group inline-flex items-center gap-2 rounded-full bg-ink text-cream px-7 py-3.5 font-semibold shadow-soft hover:bg-ink-soft hover:-translate-y-0.5 hover:shadow-lift transition-all duration-300 cursor-pointer"
            >
              Book Free 1-Week Trial
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
            <button
              onClick={() => scrollTo('#courses')}
              className="inline-flex items-center gap-2 rounded-full border border-ink/15 px-7 py-3.5 font-semibold text-ink hover:bg-ink/5 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
            >
              <CalendarDays className="h-4 w-4 text-sun" />
              Explore Courses
            </button>
          </Reveal>

          <Reveal delay={0.28} className="mt-8 inline-flex items-center gap-2 rounded-full bg-white/70 border border-ink/10 px-4 py-2 shadow-card">
            <span className="text-sm font-semibold text-ink-soft tracking-wide">
              New batches starting <span className="text-sun">September 2026</span> — limited seats per cohort
            </span>
          </Reveal>
        </div>

        <Reveal delay={0.18} className="mt-4 lg:mt-0">
          <CoachingIllustration />
        </Reveal>
      </div>
    </section>
  );
}
