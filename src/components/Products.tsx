import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap,
  Presentation,
  Cloud,
  UserCog,
  School,
  Building2,
  PackageCheck,
  Landmark,
  ChevronDown,
  type LucideIcon,
} from 'lucide-react';
import { Reveal, Stagger, StaggerItem } from './Reveal';
import SectionTag from './SectionTag';

interface ProductItem {
  Icon: LucideIcon;
  name: string;
  teaser: string;
  desc: string;
}

const PRODUCTS: ProductItem[] = [
  {
    Icon: GraduationCap,
    name: 'Workplace-Integrated Learning (WIL)',
    teaser: 'Our core offering — structured training delivered inside real partner companies.',
    desc: "Structured training delivered inside real partner companies — not a classroom, but the actual workplace where the skill is used. Available across multiple domains including Cybersecurity, Robotics, Space Tech, and Agentic AI. Learners work alongside industry professionals on real tools and real problems, building genuine job readiness rather than theoretical knowledge.",
  },
  {
    Icon: Presentation,
    name: 'Company Workshops',
    teaser: 'A first step into the Upshift ecosystem, hosted with partner companies.',
    desc: 'Short, focused sessions hosted with or at partner companies, designed as an entry point into the Upshift ecosystem. Ideal for students and professionals who want a first exposure to a domain before committing to a full Workplace-Integrated Learning track.',
  },
  {
    Icon: Cloud,
    name: 'Cloud & Data Engineering Tracks',
    teaser: 'Premium, industry-aligned tracks in Cloud and Data Engineering.',
    desc: "Premium, industry-aligned training tracks covering Cloud Engineering, Data Engineering, and related high-demand technical roles. Delivered with the same workplace-integrated philosophy as Upshift's core offering — real tools, real environments, real outcomes.",
  },
  {
    Icon: UserCog,
    name: 'Train-the-Trainer — Faculty Upskilling',
    teaser: 'Upskilling engineering college faculty to match current industry expectations.',
    desc: 'A structured upskilling program for engineering college faculty, designed to close the gap between what is taught in classrooms and what the industry currently expects. Colleges partner with Upshift to bring their own teaching staff up to date with current tools, technologies, and placement-readiness standards.',
  },
  {
    Icon: School,
    name: 'Train-the-Trainer — Schools',
    teaser: "Training a school's own teachers to deliver tech curriculum in-house.",
    desc: "A program where Upshift trains a school's own teachers to deliver a structured technology curriculum (such as robotics or foundational AI) independently, on an ongoing basis — enabling schools to build lasting in-house capability rather than depending on external sessions.",
  },
  {
    Icon: Building2,
    name: 'Corporate Employee Upskilling',
    teaser: 'Grow talent from within — and open a real entry-level role in the process.',
    desc: "A program for companies looking to grow talent from within. Upshift upskills an existing employee into a higher-value technical role, allowing the company to save significantly compared to hiring externally at market rate, while retaining institutional knowledge and loyalty. As part of this program, Upshift can also place one of its own trained students into the resulting junior-level vacancy, creating a real internship or entry-level opportunity.",
  },
  {
    Icon: PackageCheck,
    name: 'School Curriculum Integration Package',
    teaser: 'A ready-to-adopt tech module that fits directly into the school timetable.',
    desc: 'A one-time curriculum package that schools can adopt and embed directly into their existing academic timetable — for example, a foundational Agentic AI or robotics module — without disrupting their existing structure.',
  },
  {
    Icon: Landmark,
    name: 'College Curriculum Integration Package',
    teaser: 'An elective or specialization module built for engineering colleges.',
    desc: 'A one-time curriculum package designed for engineering colleges to adopt as an elective or specialization module, embedded into their existing academic program.',
  },
];

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
            One ecosystem, <span className="text-sun">eight ways in</span>.
          </h2>
          <p className="text-ink-muted max-w-sm">
            From a first workshop to full curriculum integration — every product is built on
            the same workplace-integrated philosophy.
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
      </div>
    </section>
  );
}
