import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap,
  Presentation,
  Building2,
  ChevronDown,
  type LucideIcon,
} from 'lucide-react';
import { Reveal, Stagger, StaggerItem } from './Reveal';
import SectionTag from './SectionTag';

interface ProductItem {
  Icon: LucideIcon;
  name: string;
  tag: string;
  teaser: string;
  desc: string;
}

const PRODUCTS: ProductItem[] = [
  {
    Icon: GraduationCap,
    name: 'Workplace-Integrated Learning (WIL)',
    tag: 'Core learner product · Two-month tracks',
    teaser: 'Structured training delivered inside real partner companies.',
    desc: "Structured training delivered inside real partner-company environments instead of a conventional classroom. Learners work alongside industry professionals on real tools and real problems, building applied job readiness rather than theoretical knowledge. Initial domains: Cybersecurity, Robotics, Space Tech and Agentic AI.",
  },
  {
    Icon: Presentation,
    name: 'Company Workshops',
    tag: 'Entry product · One day',
    teaser: 'A first step into the Upshift ecosystem, hosted with partner companies.',
    desc: 'A short, focused session hosted with or at a partner company. It is the first exposure to a domain and the entry point into the Upshift ecosystem — ideal for students and professionals who want to try a domain before committing to a full Workplace-Integrated Learning track.',
  },
  {
    Icon: Building2,
    name: 'Corporate Employee Upskilling',
    tag: 'B2B product · Sold per company',
    teaser: 'Grow talent from within — and open a real entry-level role in the process.',
    desc: "A program for companies that want to grow existing employees into higher-value technical roles. The company develops internal talent and keeps its institutional knowledge. Where a junior-level vacancy opens up, Upshift can connect one of its trained students to an internship or entry-level role.",
  },
];

const LEARNER_FLOW = ['Company Workshop', 'Qualified learners', 'Workplace-Integrated Learning', 'Internship or entry-level role'];
const COMPANY_FLOW = ['Corporate Employee Upskilling', 'Upskilled employees', 'Junior vacancies open up', 'Filled from Upshift learners'];

export default function Products() {
  const [open, setOpen] = useState<number>(0);

  return (
    <section id="products" className="relative py-24 lg:py-28">
      <div className="container-px">
        <Reveal>
          <SectionTag label="What We Offer" />
        </Reveal>
        <Reveal delay={0.06} className="mt-5 flex flex-wrap items-end justify-between gap-6">
          <h2 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl text-ink tracking-tight max-w-2xl">
            One ecosystem, <span className="text-sun">three ways in</span>.
          </h2>
          <p className="text-ink-muted max-w-sm">
            From a one-day workshop to full Workplace-Integrated Learning and company upskilling —
            every product is built on the same workplace-integrated philosophy.
          </p>
        </Reveal>

        <Stagger className="mt-14 space-y-3">
          {PRODUCTS.map((p, i) => {
            const isOpen = open === i;
            return (
              <StaggerItem key={p.name}>
                <div
                  className={`rounded-2xl border bg-white shadow-card transition-colors duration-300 ${
                    isOpen ? 'border-sun/40' : 'border-ink/5'
                  }`}
                >
                  <button
                    onClick={() => setOpen(isOpen ? -1 : i)}
                    className="w-full flex items-center gap-4 px-6 py-5 text-left cursor-pointer"
                  >
                    <span
                      className={`shrink-0 h-11 w-11 rounded-xl flex items-center justify-center transition-colors duration-300 ${
                        isOpen ? 'bg-sun/10' : 'bg-ink/5'
                      }`}
                    >
                      <p.Icon className={`h-5 w-5 ${isOpen ? 'text-sun' : 'text-ink-muted'}`} />
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block text-[11px] font-semibold uppercase tracking-wider text-sun">{p.tag}</span>
                      <span className="block font-display font-bold text-ink">{p.name}</span>
                      <span className="block mt-0.5 text-sm text-ink-muted truncate">{p.teaser}</span>
                    </span>
                    <motion.span
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                      className="shrink-0 text-ink-muted"
                    >
                      <ChevronDown className="h-5 w-5" />
                    </motion.span>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                        <p className="px-6 pb-6 pl-[4.25rem] text-sm text-ink-muted leading-relaxed">
                          {p.desc}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </StaggerItem>
            );
          })}
        </Stagger>

        <Reveal delay={0.1} className="mt-10 rounded-3xl bg-paper/70 border border-ink/5 p-8 sm:p-10">
          <h3 className="section-tag !text-ink-soft mb-2">How the products connect</h3>
          <p className="text-sm text-ink-muted max-w-2xl">
            A learner funnel on one side, a corporate talent solution on the other — with partner
            companies at the centre of both.
          </p>
          <div className="mt-6 grid md:grid-cols-2 gap-8">
            {[
              { title: 'Learner side', steps: LEARNER_FLOW },
              { title: 'Company side', steps: COMPANY_FLOW },
            ].map((col) => (
              <div key={col.title}>
                <p className="font-display font-bold text-ink mb-3">{col.title}</p>
                <ol className="space-y-2">
                  {col.steps.map((step, i) => (
                    <li key={step} className="flex items-center gap-3 text-sm text-ink-soft">
                      <span className="h-6 w-6 shrink-0 rounded-full bg-sun/10 text-sun text-xs font-bold flex items-center justify-center">
                        {i + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
