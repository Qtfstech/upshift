import { ArrowRight, Award, Check, Clock, PlayCircle, Sparkles } from 'lucide-react';
import { Reveal, Stagger, StaggerItem } from '../../components/Reveal';
import SectionTag from '../../components/SectionTag';
import { whatsappHref } from '../whatsapp';

export interface PathStep {
  price: string;
  title: string;
  duration: string;
  summary: string;
  points: string[];
  next: string | null;
}

/** The paid ladder that follows the Idea Challenge: ₹9 → ₹99 → ₹999. */
export const PATH: PathStep[] = [
  {
    price: '₹9',
    title: 'Build Your First AI Agent',
    duration: '1 hour · live',
    summary: 'Everyone builds a simple agent in the browser with free tools — like a college FAQ bot or a study buddy.',
    points: ['Certificate of completion', 'Session replay'],
    next: '₹99',
  },
  {
    price: '₹99',
    title: 'Build and Ship an AI Agent Project',
    duration: '3 hours · live',
    summary: 'Take your agent further and ship it.',
    points: ['Add a knowledge base', 'Add guardrails', 'Build a mini-project', 'Demo showcase and feedback'],
    next: '₹999',
  },
  {
    price: '₹999',
    title: 'Full-day Workshop',
    duration: '8 hours · pick one',
    summary: 'A full day on the track you choose. Each ends with a counselling slot.',
    points: [
      'AI agent bootcamp day',
      'Train Inside Industry day — cyber with Blue Cloud, robotics or AI with Anvi',
      'Data analyst, cloud data engineering or video editing',
    ],
    next: null,
  },
];

/** What happens in the ₹9 hour, minute by minute. */
export const NINE_RUPEE_AGENDA = [
  { minutes: 5, label: 'Demo' },
  { minutes: 10, label: 'What an agent is' },
  { minutes: 30, label: 'Build together' },
  { minutes: 10, label: 'Test and share' },
  { minutes: 5, label: 'Next step' },
];

/** Booking happens on WhatsApp, with the session already named in the message. */
export const bookHref = (step: PathStep, name?: string) =>
  whatsappHref(`Hi! I'd like to book the ${step.price} session: ${step.title}.${name ? ` My name is ${name}.` : ''}`);

/** Agenda of the ₹9 hour as a proportional bar, so the 30-minute build reads as the main event. */
export function AgendaBar() {
  return (
    <div>
      <div className="flex h-3 rounded-full overflow-hidden gap-0.5">
        {NINE_RUPEE_AGENDA.map((a, i) => (
          <div
            key={a.label}
            style={{ flexGrow: a.minutes }}
            className={i === 2 ? 'bg-sun' : 'bg-sun/30'}
            title={`${a.minutes} min · ${a.label}`}
          />
        ))}
      </div>
      <ol className="mt-3 grid grid-cols-2 sm:grid-cols-5 gap-x-3 gap-y-2 text-xs">
        {NINE_RUPEE_AGENDA.map((a, i) => (
          <li key={a.label} className="flex flex-col">
            <span className={`font-mono font-semibold ${i === 2 ? 'text-sun' : 'text-ink-soft'}`}>{a.minutes} min</span>
            <span className="text-ink-muted leading-snug">{a.label}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

export default function LearningPathSection({ name }: { name?: string }) {
  return (
    <section id="path" className="relative py-24 lg:py-28 bg-paper/60">
      <div className="container-px">
        <Reveal>
          <SectionTag label="From idea to agent" />
        </Reveal>
        <Reveal delay={0.06}>
          <h2 className="mt-5 font-display font-bold text-3xl sm:text-4xl lg:text-5xl text-ink tracking-tight max-w-3xl">
            Your path: <span className="text-gradient">₹9 → ₹99 → ₹999</span>
          </h2>
        </Reveal>
        <Reveal delay={0.12}>
          <p className="mt-5 text-lg text-ink-muted max-w-2xl">
            Start with one live hour for ₹9 and build a working AI agent. Each step leads to the next, so you only go further
            when you're ready.
          </p>
        </Reveal>

        <Stagger className="mt-14 grid lg:grid-cols-3 gap-5" staggerChildren={0.1}>
          {PATH.map((step, i) => (
            <StaggerItem key={step.price}>
              <div
                className={`relative h-full rounded-3xl p-7 flex flex-col transition-all duration-400 hover:-translate-y-1 ${
                  i === 0 ? 'bg-ink text-cream shadow-lift' : 'bg-white border border-ink/5 shadow-card hover:shadow-lift'
                }`}
              >
                {i === 0 && (
                  <span className="absolute -top-3 left-7 inline-flex items-center gap-1 rounded-full bg-sun text-white text-xs font-semibold px-3 py-1">
                    <Sparkles className="h-3 w-3" /> Start here
                  </span>
                )}
                <div className="flex items-baseline justify-between gap-3">
                  <span className={`font-display font-bold text-5xl ${i === 0 ? 'text-sun' : 'text-ink'}`}>{step.price}</span>
                  <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${i === 0 ? 'text-cream/70' : 'text-ink-muted'}`}>
                    <Clock className="h-3.5 w-3.5" />
                    {step.duration}
                  </span>
                </div>
                <h3 className={`mt-4 font-display font-bold text-xl ${i === 0 ? 'text-cream' : 'text-ink'}`}>{step.title}</h3>
                <p className={`mt-2 text-sm leading-relaxed ${i === 0 ? 'text-cream/75' : 'text-ink-muted'}`}>{step.summary}</p>

                {i === 0 && (
                  <div className="mt-5 rounded-2xl bg-cream/10 p-4 [&_.text-ink-soft]:text-cream [&_.text-ink-muted]:text-cream/65">
                    <p className="text-xs font-semibold uppercase tracking-wider text-cream/60 mb-3">The hour</p>
                    <AgendaBar />
                  </div>
                )}

                <ul className="mt-5 space-y-2.5 text-sm flex-1">
                  {step.points.map((p) => (
                    <li key={p} className="flex items-start gap-2.5">
                      {i === 0 ? (
                        p.startsWith('Certificate') ? (
                          <Award className="h-4 w-4 mt-0.5 shrink-0 text-sun" />
                        ) : (
                          <PlayCircle className="h-4 w-4 mt-0.5 shrink-0 text-sun" />
                        )
                      ) : (
                        <Check className="h-4 w-4 mt-0.5 shrink-0 text-sun" />
                      )}
                      <span className={i === 0 ? 'text-cream/90' : 'text-ink-soft'}>{p}</span>
                    </li>
                  ))}
                </ul>

                <div className={`mt-6 pt-5 border-t flex items-center justify-between gap-3 ${i === 0 ? 'border-cream/15' : 'border-ink/10'}`}>
                  <span className={`text-xs ${i === 0 ? 'text-cream/60' : 'text-ink-muted'}`}>
                    {step.next ? (
                      <>
                        Next step: <b className={i === 0 ? 'text-cream' : 'text-ink'}>{step.next}</b>
                      </>
                    ) : (
                      'Ends with a counselling slot'
                    )}
                  </span>
                  <a
                    href={bookHref(step, name)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`group inline-flex items-center gap-1.5 rounded-full text-sm font-semibold px-4 py-2.5 transition-all duration-300 ${
                      i === 0 ? 'bg-sun text-white hover:brightness-110' : 'bg-ink text-cream hover:bg-ink-soft'
                    }`}
                  >
                    Book {step.price}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </a>
                </div>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
