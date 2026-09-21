import {
  ShieldCheck,
  Bot,
  Rocket,
  Sprout,
  Clock,
  Users,
  CheckCircle2,
  ArrowUpRight,
  type LucideIcon,
} from 'lucide-react';
import { Reveal, Stagger, StaggerItem } from './Reveal';
import SectionTag from './SectionTag';
import WorkshopCard3D from './WorkshopCard3D';

interface WorkshopItem {
  key: string;
  name: string;
  Icon: LucideIcon;
  accent: 'sun' | 'sky' | 'violet' | 'leaf';
  tagline: string;
  points: string[];
}

const WORKSHOPS: WorkshopItem[] = [
  {
    key: 'cybersecurity',
    name: 'Cybersecurity',
    Icon: ShieldCheck,
    accent: 'sun',
    tagline: 'Think like a defender. Hunt like an attacker.',
    points: [
      'Live threat simulation & SOC walkthrough',
      'Hands-on with real security tooling',
      'Meet practitioners defending real networks',
    ],
  },
  {
    key: 'robotics',
    name: 'Robotics',
    Icon: Bot,
    accent: 'sky',
    tagline: 'Build, wire and program your first bot.',
    points: [
      'Hands-on embedded systems & automation build',
      'Work with real sensors, actuators & control logic',
      'Guided live by robotics engineers',
    ],
  },
  {
    key: 'spacetech',
    name: 'Spacetech',
    Icon: Rocket,
    accent: 'violet',
    tagline: 'Get a taste of mission-grade engineering.',
    points: [
      'Intro to space systems & mission tech',
      'Simulate a real mission-design challenge',
      'Meet spacetech industry mentors',
    ],
  },
  {
    key: 'agritech',
    name: 'Agritech',
    Icon: Sprout,
    accent: 'leaf',
    tagline: 'Grow the future of smart farming.',
    points: [
      'Hands-on with precision agri-tech tools',
      'Explore IoT sensors, drones & farm data',
      'Meet agritech innovators and founders',
    ],
  },
];

const ACCENT = {
  sun: { bg: 'bg-sun/10', text: 'text-sun', ring: 'group-hover:ring-sun/40', grad: 'from-sun/15' },
  sky: { bg: 'bg-sky/10', text: 'text-sky', ring: 'group-hover:ring-sky/40', grad: 'from-sky/15' },
  violet: { bg: 'bg-violet/10', text: 'text-violet', ring: 'group-hover:ring-violet/40', grad: 'from-violet/15' },
  leaf: { bg: 'bg-leaf/10', text: 'text-leaf', ring: 'group-hover:ring-leaf/40', grad: 'from-leaf/15' },
};

interface WorkshopsProps {
  onSelectWorkshop?: (name: string) => void;
}

export default function Workshops({ onSelectWorkshop }: WorkshopsProps) {
  return (
    <section id="workshops" className="relative py-24 lg:py-28">
      <div className="container-px">
        <Reveal>
          <SectionTag label="1 Day Workshop" />
        </Reveal>
        <Reveal delay={0.06} className="mt-5 flex flex-wrap items-end justify-between gap-6">
          <h2 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl text-ink tracking-tight max-w-2xl">
            Learn from <span className="text-sun">Top Product-Based</span> &amp; MNC Companies.
          </h2>
          <p className="text-ink-muted max-w-sm">
            Four flagship tracks, one flat demo price. A hands-on first step into Upshift's
            Workplace-Integrated Learning model — before you commit to a full program.
          </p>
        </Reveal>

        <Stagger className="mt-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {WORKSHOPS.map((w) => {
            const a = ACCENT[w.accent];
            return (
              <StaggerItem key={w.key}>
                <div
                  className={`group relative h-full rounded-3xl bg-white border border-ink/5 shadow-card hover:shadow-lift p-8 flex flex-col transition-all duration-500 hover:-translate-y-2 ring-1 ring-transparent hover:ring-2 overflow-hidden ${a.ring}`}
                >
                  <div
                    className={`absolute inset-x-0 -top-24 h-40 bg-gradient-to-b ${a.grad} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                  />

                  <div className="relative flex items-center justify-between">
                    <div
                      className={`h-14 w-14 rounded-2xl ${a.bg} flex items-center justify-center transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6`}
                    >
                      <w.Icon className={`h-7 w-7 ${a.text}`} />
                    </div>
                    <span className="inline-flex items-center rounded-full bg-ink px-3 py-1 text-xs font-semibold text-cream tracking-wide">
                      DEMO WORKSHOP
                    </span>
                  </div>

                  <h3 className="relative mt-6 font-display font-bold text-2xl text-ink">{w.name}</h3>
                  <p className={`relative mt-1.5 font-medium ${a.text}`}>{w.tagline}</p>

                  {/* Dedicated 3D Interactive Model for this track */}
                  <div className="relative mt-3 mb-2 rounded-2xl bg-cream/50 border border-ink/5 p-2 overflow-hidden">
                    <WorkshopCard3D
                      track={w.key as 'cybersecurity' | 'robotics' | 'spacetech' | 'agritech'}
                      accentColor={w.accent}
                    />
                  </div>

                  <ul className="relative mt-4 space-y-3 flex-1">
                    {w.points.map((p) => (
                      <li key={p} className="flex items-start gap-2.5 text-sm text-ink-muted leading-relaxed">
                        <CheckCircle2 className={`h-4 w-4 mt-0.5 shrink-0 ${a.text}`} />
                        {p}
                      </li>
                    ))}
                  </ul>

                  <div className="relative mt-7 flex items-center gap-4 text-xs font-semibold text-ink-muted uppercase tracking-wide">
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" /> 1 Day
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5" /> Hyderabad
                    </span>
                  </div>

                  <div className="relative mt-6 flex items-center justify-between rounded-2xl bg-cream/80 border border-ink/5 px-5 py-4">
                    <div>
                      <div className="text-2xl font-display font-bold text-ink">₹499</div>
                      <div className="text-xs text-ink-muted">one-time demo fee</div>
                    </div>
                    <button
                      onClick={() => onSelectWorkshop?.(w.name)}
                      className="group/btn inline-flex items-center gap-1.5 rounded-full bg-ink text-cream text-sm font-semibold px-4 py-2.5 hover:bg-ink-soft transition-colors cursor-pointer"
                    >
                      Reserve Seat
                      <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
                    </button>
                  </div>
                </div>
              </StaggerItem>
            );
          })}
        </Stagger>
      </div>
    </section>
  );
}
