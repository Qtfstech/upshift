import { ArrowRight, MapPin } from 'lucide-react';
import { Reveal } from './Reveal';
import LearningEvolution from './LearningEvolution';

export default function Hero() {
  const scrollTo = (href: string) => document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <section id="top" className="relative overflow-hidden pt-28 pb-12 lg:pt-32 lg:pb-14">
      {/* ambient background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_#FDECD8_0%,_transparent_55%),radial-gradient(ellipse_at_bottom_right,_#DDF5F7_0%,_transparent_55%)]" />
        <div className="absolute -top-24 -right-20 h-[28rem] w-[28rem] rounded-full bg-sun/10 blur-3xl animate-float" />
        <div className="absolute top-1/3 -left-24 h-96 w-96 rounded-full bg-sky/15 blur-3xl animate-floatSlow" />
        <div className="absolute inset-0 bg-noise" />
      </div>

      <div className="container-px grid lg:grid-cols-[1.1fr_0.9fr] gap-10 lg:gap-12 items-center">
        <div className="focus-blur">
          <Reveal>
            <h1 className="font-display font-bold text-4xl sm:text-5xl lg:text-[3.4rem] leading-[1.08] tracking-tight text-ink">
              Workplace-<span className="text-gradient">Integrated</span> Learning.
            </h1>
          </Reveal>

          <Reveal delay={0.06}>
            <p className="mt-4 font-display font-semibold text-lg sm:text-xl text-ink-soft">
              Built for where India's jobs are landing.
            </p>
          </Reveal>

          <Reveal delay={0.12}>
            <p className="mt-6 text-lg text-ink-muted max-w-xl leading-relaxed">
              From advanced technology training to real workplace exposure — we connect
              learners with the environments, tools and problems that matter. No more
              classrooms disconnected from hiring. Just real companies, real tools, real careers.
            </p>
          </Reveal>

          <Reveal delay={0.26} className="mt-7 flex flex-wrap items-center gap-4">
            <button
              onClick={() => scrollTo('#workshops')}
              className="group inline-flex items-center gap-2 rounded-full bg-ink text-cream px-7 py-3.5 font-semibold shadow-soft hover:bg-ink-soft hover:-translate-y-0.5 hover:shadow-lift transition-all duration-300 cursor-pointer"
            >
              Explore Demo Workshops
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
            <button
              onClick={() => scrollTo('#contact')}
              className="inline-flex items-center gap-2 rounded-full border border-ink/15 px-7 py-3.5 font-semibold text-ink hover:bg-ink/5 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
            >
              Talk to Us
            </button>
          </Reveal>

          <Reveal delay={0.32} className="mt-7 inline-flex items-center gap-2 rounded-full bg-white/70 border border-ink/10 px-4 py-2 shadow-card">
            <MapPin className="h-4 w-4 text-sun" />
            <span className="text-sm font-semibold text-ink-soft tracking-wide">
              HYDERABAD <span className="text-ink-muted mx-1">→</span> INDIA
            </span>
          </Reveal>
        </div>

        {/* visual - 3D Learning Evolution Walkthrough */}
        <div className="relative h-[560px] sm:h-[540px] lg:h-[500px] w-full mt-6 lg:mt-0">
          <div className="focus-blur h-full">
            <LearningEvolution />
          </div>
        </div>
      </div>
    </section>
  );
}
