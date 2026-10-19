import { ArrowRight, Building2, Wrench, Users, Route, type LucideIcon } from 'lucide-react';
import { Reveal, Stagger, StaggerItem } from './Reveal';
import SectionTag from './SectionTag';

interface Item {
  Icon: LucideIcon;
  title: string;
  desc: string;
}

const PARTNER_GIVES: Item[] = [
  {
    Icon: Building2,
    title: 'A real workplace',
    desc: 'Host the session at your office or lab so participants see the domain where it is actually practised.',
  },
  {
    Icon: Wrench,
    title: 'Tools & projects',
    desc: 'Share the real tools, mentors and problems your team works with, scoped into a one-day format.',
  },
];

const PARTNER_GETS: Item[] = [
  {
    Icon: Users,
    title: 'Qualified talent in the room',
    desc: 'Meet motivated learners who chose to spend a day in your domain, before any hiring decision.',
  },
  {
    Icon: Route,
    title: 'A pipeline into more',
    desc: 'Interested participants move on to Workplace-Integrated Learning, and your company becomes part of the Upshift ecosystem.',
  },
];

interface Props {
  onSelect?: (name: string) => void;
}

function Column({ heading, items }: { heading: string; items: Item[] }) {
  return (
    <div>
      <h3 className="section-tag !text-ink-soft mb-5">{heading}</h3>
      <Stagger className="space-y-4">
        {items.map((it) => (
          <StaggerItem key={it.title}>
            <div className="flex items-start gap-4 rounded-2xl bg-white border border-ink/5 shadow-card p-6">
              <span className="h-11 w-11 shrink-0 rounded-xl bg-sun/10 flex items-center justify-center">
                <it.Icon className="h-5 w-5 text-sun" />
              </span>
              <div>
                <p className="font-display font-bold text-ink">{it.title}</p>
                <p className="mt-1 text-sm text-ink-muted leading-relaxed">{it.desc}</p>
              </div>
            </div>
          </StaggerItem>
        ))}
      </Stagger>
    </div>
  );
}

export default function CompanyWorkshops({ onSelect }: Props) {
  return (
    <section id="company-workshops" className="relative py-24 lg:py-28 bg-paper/60">
      <div className="container-px">
        <Reveal>
          <SectionTag label="Company Workshops" />
        </Reveal>
        <Reveal delay={0.06} className="mt-5 flex flex-wrap items-end justify-between gap-6">
          <h2 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl text-ink tracking-tight max-w-2xl">
            Host a workshop. <span className="text-sun">Open the door.</span>
          </h2>
          <p className="text-ink-muted max-w-sm">
            A short, focused one-day session hosted with or at your company — the first exposure to
            a domain and the entry point into the Upshift ecosystem.
          </p>
        </Reveal>

        <div className="mt-14 grid md:grid-cols-2 gap-10">
          <Column heading="What your company brings" items={PARTNER_GIVES} />
          <Column heading="What your company gets" items={PARTNER_GETS} />
        </div>

        <Reveal delay={0.1} className="mt-12">
          <button
            onClick={() => onSelect?.('Host a Company Workshop')}
            className="group inline-flex items-center gap-2 rounded-full bg-ink text-cream px-7 py-3.5 font-semibold shadow-soft hover:bg-ink-soft hover:-translate-y-0.5 hover:shadow-lift transition-all duration-300 cursor-pointer"
          >
            Host a Workshop With Us
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
        </Reveal>
      </div>
    </section>
  );
}
