import {
  ShieldCheck,
  Rocket,
  Bot,
  BrainCircuit,
  FlaskConical,
  Lightbulb,
  Clapperboard,
  PenTool,
  Megaphone,
  Video,
  Sparkles,
  Handshake,
  type LucideIcon,
} from 'lucide-react';
import { Reveal, Stagger, StaggerItem } from './Reveal';
import SectionTag from './SectionTag';

interface DomainItem {
  Icon: LucideIcon;
  title: string;
  sub: string;
}

const DOMAINS: DomainItem[] = [
  { Icon: ShieldCheck, title: 'Cybersecurity', sub: 'Security • SOC • Defence' },
  { Icon: Rocket, title: 'Spacetech', sub: 'Space systems • Mission tech' },
  { Icon: Bot, title: 'Robotics', sub: 'Automation • Embedded systems' },
  { Icon: BrainCircuit, title: 'Agentic AI', sub: 'AI agents • Applied AI' },
  { Icon: FlaskConical, title: 'Pharma', sub: 'Life sciences • Industry' },
  { Icon: Lightbulb, title: 'Entrepreneurship', sub: 'Venture building • Startups' },
  { Icon: Clapperboard, title: 'Digital Media', sub: 'Media • Production • Platforms' },
  { Icon: PenTool, title: 'UI / UX Design', sub: 'Product • Experience • Design' },
  { Icon: Megaphone, title: 'Digital Marketing', sub: 'Growth • Performance • Brand' },
  { Icon: Video, title: 'Content Creation', sub: 'Storytelling • Creator economy' },
  { Icon: Sparkles, title: 'And Many More', sub: 'Emerging domains as industry evolves' },
  { Icon: Handshake, title: 'Industry Partners', sub: 'The ecosystem behind every WIL track' },
];

export default function Domains() {
  return (
    <section id="domains" className="relative py-24 lg:py-28 bg-paper/60">
      <div className="container-px">
        <Reveal>
          <SectionTag label="Domains" />
        </Reveal>
        <Reveal delay={0.06}>
          <h2 className="mt-5 font-display font-bold text-3xl sm:text-4xl lg:text-5xl text-ink tracking-tight max-w-3xl">
            Where Upshift builds the next generation of talent.
          </h2>
        </Reveal>
        <Reveal delay={0.12}>
          <p className="mt-5 text-lg text-ink-muted max-w-xl">
            A growing WIL portfolio across emerging technology, life sciences, business and
            creative domains.
          </p>
        </Reveal>

        <Stagger className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-5" staggerChildren={0.06}>
          {DOMAINS.map((d, i) => (
            <StaggerItem key={d.title}>
              <div className="group h-full rounded-2xl bg-white border border-ink/5 shadow-card p-6 flex items-center gap-4 hover:shadow-lift hover:-translate-y-1 hover:border-sun/20 transition-all duration-400">
                <div
                  className={`shrink-0 h-11 w-11 rounded-xl flex items-center justify-center transition-colors duration-400 ${
                    i % 2 === 0 ? 'bg-sun/10 group-hover:bg-sun/20' : 'bg-sky/10 group-hover:bg-sky/20'
                  }`}
                >
                  <d.Icon className={`h-5 w-5 ${i % 2 === 0 ? 'text-sun' : 'text-sky'}`} />
                </div>
                <div>
                  <h3 className="font-display font-bold text-ink">{d.title}</h3>
                  <p className="text-xs text-ink-muted mt-0.5">{d.sub}</p>
                </div>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
