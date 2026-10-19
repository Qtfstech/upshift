import { motion } from 'framer-motion';
import { Building2, Handshake, TrendingUp, ArrowUpRight } from 'lucide-react';
import { Reveal } from './Reveal';
import SectionTag from './SectionTag';

const PULSE = { duration: 2.2, repeat: Infinity, ease: 'easeInOut' as const };

function AnimatedHandshake() {
  return (
    <div className="flex items-center justify-center gap-4">
      <motion.span
        className="h-14 w-14 rounded-full bg-sky/15 flex items-center justify-center"
        animate={{ x: [0, 8, 0] }}
        transition={PULSE}
      >
        <Building2 className="h-6 w-6 text-sky" />
      </motion.span>
      <motion.span
        className="h-16 w-16 rounded-full bg-sun/15 flex items-center justify-center ring-4 ring-sun/10"
        animate={{ scale: [1, 1.14, 1] }}
        transition={PULSE}
      >
        <Handshake className="h-7 w-7 text-sun" />
      </motion.span>
      <motion.span
        className="h-14 w-14 rounded-full bg-violet/15 flex items-center justify-center"
        animate={{ x: [0, -8, 0] }}
        transition={PULSE}
      >
        <TrendingUp className="h-6 w-6 text-violet" />
      </motion.span>
    </div>
  );
}

export default function Investors() {
  return (
    <section id="investors" className="relative py-24 lg:py-28 bg-paper/60">
      <div className="container-px">
        <Reveal>
          <SectionTag label="Investors & Partners" />
        </Reveal>
        <Reveal delay={0.06} className="mt-5 flex flex-wrap items-end justify-between gap-6">
          <h2 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl text-ink tracking-tight max-w-2xl">
            Our esteemed <span className="text-sun">investors</span> &amp; partners.
          </h2>
          <p className="text-ink-muted max-w-sm">
            We collaborate with quality thought leaders across industry — and we're always
            looking for new partnerships that help learners land in the real workplace.
          </p>
        </Reveal>

        <Reveal delay={0.1} className="mt-14 rounded-3xl bg-white border border-ink/5 shadow-soft p-8 sm:p-12 grid lg:grid-cols-[0.85fr_1.15fr] gap-10 items-center">
          <div className="rounded-2xl border border-ink/10 bg-cream/50 h-44 flex items-center justify-center p-6">
            <img
              src={`${import.meta.env.BASE_URL}quality-thought-logo.png`}
              alt="Quality Thought"
              className="max-h-full max-w-full object-contain"
            />
          </div>

          <div>
            <AnimatedHandshake />
            <p className="mt-6 text-center lg:text-left text-ink-muted leading-relaxed">
              We're proud to be collaborating with <span className="font-semibold text-ink-soft">Quality Thought</span> —
              and we're actively looking for more partners and investors who believe in bringing
              real workplace exposure to India's learners.
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.16} className="mt-8 rounded-2xl bg-ink px-7 py-8 sm:flex items-center justify-between gap-6 text-center sm:text-left">
          <div className="flex items-center gap-3 justify-center sm:justify-start">
            <span className="h-11 w-11 rounded-xl bg-cream/10 flex items-center justify-center shrink-0">
              <Handshake className="h-5 w-5 text-sun" />
            </span>
            <p className="font-display font-medium text-lg text-cream">
              Looking for more partnerships — let's build the workplace-learning network together.
            </p>
          </div>
          <a
            href="#contact"
            onClick={(e) => { e.preventDefault(); document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' }); }}
            className="mt-5 sm:mt-0 inline-flex items-center gap-2 rounded-full bg-sun text-ink font-semibold px-6 py-3 hover:-translate-y-0.5 transition-all duration-300 shrink-0"
          >
            Partner With Us <ArrowUpRight className="h-4 w-4" />
          </a>
        </Reveal>
      </div>
    </section>
  );
}
