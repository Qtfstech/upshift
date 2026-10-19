import {
  ArrowRight,
  Award,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Cpu,
  GraduationCap,
  Laptop,
  Loader2,
  MapPin,
  MessageCircle,
  MessageSquareText,
  Rocket,
  Star,
  Trophy,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { Reveal, Stagger, StaggerItem } from '../components/Reveal';
import { BACKEND_URL } from '../dashboard/config';
import { WHATSAPP_DISPLAY, whatsappHref } from '../courses-landing/whatsapp';
import { arcToken } from '../courses-landing/arc/api';
import { trackProduct, useAccount, type Account } from '../account/account';
import AccountButton from '../account/AccountButton';
import './hackathon.css';

// ---- Event facts (Sober October Hackathon brief) ----
const NAME = 'Sober October Hackathon';
const FEE_L1 = 199; // per member, online
const FEE_L2 = 799; // per member, offline finale
const PRIZE_L1 = 50000; // 10 winners
const PRIZE_L2 = 100000; // 10 winners
const WINNERS = 10;
const TEAM_SIZES = [1, 2, 4];
const PROBLEM_STATEMENTS = 4;

const inr = (n: number) => `₹${n.toLocaleString('en-IN')}`;
const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
const ASK = whatsappHref(`Hi! I have a question about the ${NAME}.`);

const KEY_DATES = [
  { date: 'Wed Oct 14', what: 'Registration opens' },
  { date: 'Wed Oct 28', what: 'Registration closes, 11:59 PM' },
  { date: 'Fri Oct 30, 6 PM', what: 'Live online kickoff: problem statements, rules and scoring' },
  { date: 'Sat Oct 31', what: 'Two live mentor clinics, 11 AM and 6 PM' },
  { date: 'Sun Nov 1, 6 PM', what: 'Level 1 submission deadline' },
  { date: 'Thu Nov 5', what: 'Level 1 winners announced' },
  { date: 'Tue Nov 10, 6 PM', what: 'Finale seats confirmed by paying ₹799 per person' },
  { date: 'Sat Nov 14', what: 'Offline finale and awards, Hyderabad' },
];

const SCORING = {
  l1: [
    { label: 'Working demo', points: 30 },
    { label: 'Problem and relevance', points: 20 },
    { label: 'Technical depth', points: 20 },
    { label: 'Usability and impact', points: 20 },
    { label: 'Presentation', points: 10 },
  ],
  l2: [
    { label: 'Working prototype', points: 30 },
    { label: 'Pitch', points: 25 },
    { label: 'Impact', points: 20 },
    { label: 'Handling the twist', points: 15 },
    { label: 'Originality', points: 10 },
  ],
};

const FINALE_PLAN = [
  { time: '9:00 AM', what: 'Check-in and team desk' },
  { time: '10:00 AM', what: 'Twist problem revealed' },
  { time: '10:30 AM – 3:30 PM', what: 'Build, with lunch and mentors' },
  { time: '4:00 – 5:30 PM', what: 'Pitches in three rooms: 5 minutes plus 3 minutes of questions per team' },
  { time: '5:45 – 6:15 PM', what: 'Top 5 teams pitch on stage' },
  { time: '6:30 PM', what: 'Awards and photos' },
];

const FAQ = [
  { q: 'Do I need to know AI?', a: 'No. Beginners can team up with experienced builders, and AI assistants are allowed.' },
  { q: 'Can I join alone?', a: 'Yes. Teams can have 1, 2 or 4 members.' },
  { q: 'How much does it cost?', a: `Level 1 is ${inr(FEE_L1)} per member. Only teams that win Level 1 and choose to attend the finale pay ${inr(FEE_L2)} per member for Level 2.` },
  { q: 'Is the offline finale compulsory?', a: 'No. Level 1 is a complete event with its own prizes. The finale is for Level 1 winners who choose to attend.' },
  { q: 'I live outside Hyderabad.', a: 'You can still take part in Level 1 online. The finale is in person, and travel and stay are your own.' },
  { q: 'Is the prize guaranteed?', a: 'Prizes go to the top-scoring teams. Internships are considered, not guaranteed.' },
  { q: 'Can I register after Oct 28?', a: 'No. Registration closes at 11:59 PM on Oct 28.' },
  { q: 'Can I change my team?', a: 'Yes, until the kickoff on Fri Oct 30. Every member must have registered and paid.' },
];

const RULES = [
  { k: 'Eligibility', v: '18 or older, student or recent graduate.' },
  { k: 'Originality', v: 'Build during the event window. Open-source libraries and AI tools are allowed — say what you used. Copied work is disqualified.' },
  { k: 'Judging', v: "Scoring criteria are published. The judges' decision is final." },
  { k: 'Skill only', v: 'Winners are chosen on merit. There is no chance element, no betting and no stake.' },
  { k: 'Your work is yours', v: 'You keep ownership. You allow Upshift to show your demo, with credit, on a non-exclusive basis.' },
  { k: 'Conduct', v: 'Be respectful. Harassment or cheating means removal without refund.' },
  { k: 'Refunds', v: 'Full refund if Upshift cancels the event. Otherwise fees are non-refundable once paid. All fees include GST.' },
  { k: 'Your data', v: 'We collect your name, phone, email and college to run the event. Only with your consent do we tell you about Upshift programmes.' },
  { k: 'Independence', v: 'Upshift India is a private company and is not affiliated with any government body.' },
];

function Logo() {
  return (
    <a href="./" className="flex items-center gap-3">
      <img src={`${import.meta.env.BASE_URL}upshift-logo-transparent.png`} alt="Upshift India" className="h-11 w-11 object-contain" />
      <span className="leading-tight">
        <span className="block font-display font-bold tracking-[0.2em] text-sm">UPSHIFT INDIA</span>
        <span className="hidden sm:block text-[10px] tracking-[0.18em] text-[var(--hk-muted)]">UPSKILL TODAY. UPSHIFT TOMORROW.</span>
      </span>
    </a>
  );
}

function Header({ account }: { account: Account | null }) {
  return (
    <header className="fixed top-0 inset-x-0 z-50 border-b border-[var(--hk-border)] bg-[#05060d]/75 backdrop-blur-md">
      <div className="container-px flex items-center justify-between py-3">
        <Logo />
        <nav className="hidden md:flex items-center gap-6 text-sm text-[var(--hk-muted)]">
          {[
            ['levels', 'Levels'],
            ['dates', 'Dates'],
            ['prizes', 'Prizes'],
            ['faq', 'FAQ'],
          ].map(([id, label]) => (
            <button key={id} onClick={() => scrollTo(id)} className="hover:text-[var(--hk-text)] transition cursor-pointer">
              {label}
            </button>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <AccountButton account={account} page="hackathon" dark />
          <button onClick={() => scrollTo('register')} className="hk-btn px-4 sm:px-5 py-2.5 text-sm">
            Register
          </button>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden pt-28 pb-16 lg:pt-32 lg:pb-24">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 hk-grid" />
        <div className="hk-orb h-[26rem] w-[26rem] -top-24 -left-24 bg-[var(--hk-cyan)]" />
        <div className="hk-orb h-[30rem] w-[30rem] top-20 -right-32 bg-[var(--hk-violet)] [animation-delay:-4s]" />
        <div className="hk-scan" />
      </div>

      <div className="relative container-px grid lg:grid-cols-[1.1fr_0.9fr] gap-12 items-center">
        <div className="text-center lg:text-left">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-[var(--hk-border)] bg-white/5 px-4 py-1.5 font-mono text-xs tracking-wider text-[var(--hk-cyan)]">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--hk-lime)] opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--hk-lime)]" />
              </span>
              ONLINE TO OFFLINE AI HACKATHON
            </span>
          </Reveal>
          <Reveal delay={0.06}>
            <h1 className="mt-6 font-display font-bold text-5xl sm:text-7xl leading-[0.95] tracking-tight uppercase">
              <span className="hk-gradient-text">Sober October</span>
              <br />
              Hackathon
            </h1>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="mt-5 font-display font-bold text-2xl sm:text-3xl text-[var(--hk-lime)]">Stay sharp. Ship an AI agent.</p>
            <p className="mt-4 text-lg text-[var(--hk-muted)] max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Submit your AI agent online in Level 1. The winners advance to a one-day offline finale in Hyderabad.
            </p>
          </Reveal>
          <Reveal delay={0.18} className="mt-7 flex flex-wrap justify-center lg:justify-start gap-3">
            {[
              { k: 'Level 1 · Online', v: `${inr(FEE_L1)}/member` },
              { k: 'Level 2 · Offline', v: `${inr(FEE_L2)}/member` },
              { k: 'Team size', v: '1, 2 or 4' },
            ].map((c) => (
              <div key={c.k} className="rounded-2xl border border-[var(--hk-border)] bg-white/[0.03] px-4 py-2.5 text-left">
                <div className="font-mono text-[10px] uppercase tracking-widest text-[var(--hk-muted)]">{c.k}</div>
                <div className="font-display font-bold text-lg">{c.v}</div>
              </div>
            ))}
          </Reveal>
          <Reveal delay={0.24} className="mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-4">
            <button onClick={() => scrollTo('register')} className="hk-btn group px-8 py-4 text-base">
              Register · {inr(FEE_L1)} per member
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </button>
            <a href={ASK} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full border border-[var(--hk-border)] px-6 py-4 font-semibold hover:bg-white/5 transition">
              <MessageCircle className="h-5 w-5 text-[var(--hk-lime)]" /> Ask on WhatsApp
            </a>
          </Reveal>
          <Reveal delay={0.3}>
            <p className="mt-5 inline-flex items-center gap-2 text-sm text-[var(--hk-muted)]">
              <CalendarDays className="h-4 w-4 shrink-0 text-[var(--hk-cyan)]" /> Registration Oct 14 – Oct 28 · Build weekend Oct 30 – Nov 1 · Finale Sat Nov 14
            </p>
          </Reveal>
        </div>

        {/* Prizes — the first thing people should see */}
        <Reveal delay={0.15}>
          <div className="hk-glow-card p-7 sm:p-9 text-center">
            <div className="mx-auto h-16 w-16 rounded-2xl bg-gradient-to-br from-[#fde047] to-[var(--hk-lime)] flex items-center justify-center shadow-[0_0_40px_rgba(163,230,53,0.45)] animate-float">
              <Trophy className="h-8 w-8 text-[#05060d]" />
            </div>
            <p className="mt-5 font-mono text-xs uppercase tracking-[0.3em] text-[var(--hk-muted)]">Total cash prizes</p>
            <p className="mt-2 font-display font-bold text-5xl sm:text-6xl hk-prize-text leading-none">
              {inr(PRIZE_L1 + PRIZE_L2)}
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3 text-left">
              <div className="rounded-xl bg-white/[0.04] border border-[var(--hk-border)] p-3.5">
                <div className="font-mono text-[10px] uppercase tracking-widest text-[var(--hk-cyan)]">Level 1 · Online</div>
                <div className="mt-1 font-display font-bold text-2xl">{inr(PRIZE_L1)}</div>
                <div className="text-xs text-[var(--hk-muted)]">{WINNERS} winners</div>
              </div>
              <div className="rounded-xl bg-white/[0.04] border border-[var(--hk-lime)]/30 p-3.5">
                <div className="font-mono text-[10px] uppercase tracking-widest text-[var(--hk-lime)]">Level 2 · Finale</div>
                <div className="mt-1 font-display font-bold text-2xl">{inr(PRIZE_L2)}</div>
                <div className="text-xs text-[var(--hk-muted)]">{WINNERS} winners</div>
              </div>
            </div>
            <p className="mt-5 text-sm text-[var(--hk-muted)]">plus internship and campus ambassador opportunities</p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function SectionHead({ tag, title, children }: { tag: string; title: ReactNode; children?: ReactNode }) {
  return (
    <div className="text-center max-w-2xl mx-auto">
      <Reveal>
        <span className="font-mono text-xs uppercase tracking-[0.3em] text-[var(--hk-cyan)]">{`// ${tag}`}</span>
      </Reveal>
      <Reveal delay={0.06}>
        <h2 className="mt-3 font-display font-bold text-3xl sm:text-4xl tracking-tight">{title}</h2>
      </Reveal>
      {children && (
        <Reveal delay={0.1}>
          <p className="mt-3 text-[var(--hk-muted)] leading-relaxed">{children}</p>
        </Reveal>
      )}
    </div>
  );
}

function Bullets({ items, color = 'var(--hk-cyan)' }: { items: string[]; color?: string }) {
  return (
    <ul className="flex flex-col gap-2 text-sm text-[var(--hk-muted)]">
      {items.map((t) => (
        <li key={t} className="flex gap-2.5">
          <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" style={{ color }} />
          <span>{t}</span>
        </li>
      ))}
    </ul>
  );
}

function Levels() {
  return (
    <section id="levels" className="py-20 scroll-mt-16">
      <div className="container-px">
        <SectionHead tag="two levels" title="Online first, then the finale">
          Everyone builds online in Level 1. The {WINNERS} Level 1 winners advance to a one-day offline finale.
        </SectionHead>
        <div className="mt-12 grid lg:grid-cols-2 gap-6">
          <Reveal>
            <div className="hk-card h-full p-7 sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="inline-flex items-center gap-2 rounded-full bg-[var(--hk-cyan)]/10 px-3 py-1 font-mono text-xs text-[var(--hk-cyan)]">
                  <Laptop className="h-3.5 w-3.5" /> LEVEL 1 · ONLINE
                </span>
                <span className="font-display font-bold text-2xl">
                  {inr(FEE_L1)}
                  <span className="text-sm font-normal text-[var(--hk-muted)]"> /member</span>
                </span>
              </div>
              <h3 className="mt-5 font-display font-bold text-2xl">Submit your solution online</h3>
              <p className="mt-2 text-[var(--hk-muted)]">
                A 48-hour build weekend from home, Oct 30 – Nov 1. Pick one of <b className="text-[var(--hk-text)]">{PROBLEM_STATEMENTS} problem statements</b>,
                shared at the live kickoff.
              </p>
              <div className="mt-6 grid sm:grid-cols-2 gap-6">
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider">What you submit</p>
                  <Bullets items={['A 3-minute demo video', 'A link to your working prototype or code', 'A one-page write-up: problem, user, how the agent works, what comes next']} />
                </div>
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider">What {inr(FEE_L1)} covers</p>
                  <Bullets items={['Review and scoring by judges', 'Two live mentor clinics', 'An e-certificate of participation', 'A seat in the community group']} />
                </div>
              </div>
              <div className="mt-6 flex items-center gap-3 rounded-xl border border-[var(--hk-cyan)]/30 bg-[var(--hk-cyan)]/5 px-4 py-3">
                <Trophy className="h-5 w-5 shrink-0 text-[var(--hk-cyan)]" />
                <span className="text-sm">
                  <b>{WINNERS} winners</b> share <b className="text-[var(--hk-cyan)]">{inr(PRIZE_L1)}</b> in cash prizes
                </span>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <div className="hk-card h-full p-7 sm:p-8 border-[var(--hk-lime)]/30">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="inline-flex items-center gap-2 rounded-full bg-[var(--hk-lime)]/10 px-3 py-1 font-mono text-xs text-[var(--hk-lime)]">
                  <MapPin className="h-3.5 w-3.5" /> LEVEL 2 · OFFLINE FINALE
                </span>
                <span className="font-display font-bold text-2xl">
                  {inr(FEE_L2)}
                  <span className="text-sm font-normal text-[var(--hk-muted)]"> /member</span>
                </span>
              </div>
              <h3 className="mt-5 font-display font-bold text-2xl">One day in Hyderabad</h3>
              <p className="mt-2 text-[var(--hk-muted)]">
                Sat Nov 14 in Hitech City, Hyderabad. Level 1 winners build and pitch in person: a twist problem on the day, mentors on the floor and a panel to
                pitch to.
              </p>
              <div className="mt-6 grid sm:grid-cols-2 gap-6">
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider">How you get a seat</p>
                  <Bullets
                    color="var(--hk-lime)"
                    items={['Level 1 winners announced Thu Nov 5', `Pay ${inr(FEE_L2)} per person before Tue Nov 10, 6 PM`, 'Unconfirmed seats go to the waitlist', 'Exact address shared with finalists']}
                  />
                </div>
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider">What {inr(FEE_L2)} covers</p>
                  <Bullets color="var(--hk-lime)" items={['Venue, lunch and snacks', 'A swag kit and finalist certificate', 'Mentors on the floor all day', 'Travel and stay are not included']} />
                </div>
              </div>
              <div className="mt-6 flex items-center gap-3 rounded-xl border border-[var(--hk-lime)]/30 bg-[var(--hk-lime)]/5 px-4 py-3">
                <Trophy className="h-5 w-5 shrink-0 text-[var(--hk-lime)]" />
                <span className="text-sm">
                  <b>{WINNERS} winners</b> share <b className="text-[var(--hk-lime)]">{inr(PRIZE_L2)}</b> in cash prizes
                </span>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function KeyDates() {
  return (
    <section id="dates" className="py-20 border-y border-[var(--hk-border)] bg-[var(--hk-surface)]/40 scroll-mt-16">
      <div className="container-px">
        <SectionHead tag="key dates" title="Mark your calendar" />
        <Stagger className="relative mt-12 max-w-3xl mx-auto" staggerChildren={0.05}>
          <div className="absolute left-[7px] top-2 bottom-2 w-px bg-gradient-to-b from-[var(--hk-cyan)] via-[var(--hk-violet)] to-[var(--hk-lime)]" />
          {KEY_DATES.map((d, i) => (
            <StaggerItem key={d.date}>
              <div className="relative flex gap-5 pb-6">
                <span
                  className={`relative z-10 mt-1.5 h-[15px] w-[15px] shrink-0 rounded-full border-2 border-[#05060d] ${
                    i === KEY_DATES.length - 1 ? 'bg-[var(--hk-lime)] shadow-[0_0_14px_var(--hk-lime)]' : 'bg-[var(--hk-cyan)]'
                  }`}
                />
                <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-4">
                  <span className="font-mono text-sm font-semibold text-[var(--hk-cyan)] sm:w-40 shrink-0">{d.date}</span>
                  <span className="text-[var(--hk-text)]">{d.what}</span>
                </div>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

function Challenge() {
  return (
    <section className="py-20">
      <div className="container-px grid lg:grid-cols-2 gap-10 items-start">
        <div>
          <Reveal>
            <span className="font-mono text-xs uppercase tracking-[0.3em] text-[var(--hk-cyan)]">{'// the challenge'}</span>
          </Reveal>
          <Reveal delay={0.06}>
            <h2 className="mt-3 font-display font-bold text-3xl sm:text-4xl tracking-tight">Build an AI agent for a real problem</h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-4 text-[var(--hk-muted)] leading-relaxed">
              Pick one of the {PROBLEM_STATEMENTS} problem statements, find a real person with a real problem, and build an AI agent that helps them. It must
              work in a demo, not only in a slide.
            </p>
          </Reveal>
          <Reveal delay={0.14} className="mt-6 grid grid-cols-2 gap-3 max-w-md">
            <div className="hk-card p-4">
              <div className="font-display font-bold text-4xl text-[var(--hk-cyan)]">{PROBLEM_STATEMENTS}</div>
              <div className="text-sm text-[var(--hk-muted)]">problem statements, shared at kickoff</div>
            </div>
            <div className="hk-card p-4">
              <div className="font-display font-bold text-4xl text-[var(--hk-violet)]">48h</div>
              <div className="text-sm text-[var(--hk-muted)]">to build and submit</div>
            </div>
          </Reveal>
        </div>
        <Stagger className="grid gap-4" staggerChildren={0.08}>
          <StaggerItem>
            <div className="hk-card p-6">
              <h3 className="flex items-center gap-2 font-display font-bold text-lg">
                <Star className="h-5 w-5 text-[var(--hk-lime)]" /> What a strong entry looks like
              </h3>
              <div className="mt-3">
                <Bullets
                  color="var(--hk-lime)"
                  items={['One specific user and one clear problem', 'An agent that takes real actions, not only chat replies', 'A demo that works end to end, shown in three minutes', 'Any AI tools are welcome. Tell us which ones you used.']}
                />
              </div>
            </div>
          </StaggerItem>
          <StaggerItem>
            <div className="hk-card p-6">
              <h3 className="flex items-center gap-2 font-display font-bold text-lg">
                <MessageSquareText className="h-5 w-5 text-[var(--hk-cyan)]" /> Tips from the judges
              </h3>
              <div className="mt-3">
                <Bullets
                  items={['Pick one user and one problem. Do not try to solve everything.', 'Show your agent taking an action, not only answering questions.', 'Test the demo three times before you record it. Keep the video under three minutes.']}
                />
              </div>
            </div>
          </StaggerItem>
        </Stagger>
      </div>
    </section>
  );
}

function ScoreBars({ title, rows, color }: { title: string; rows: { label: string; points: number }[]; color: string }) {
  return (
    <div className="hk-card p-6 sm:p-7">
      <h3 className="font-display font-bold text-lg">{title}</h3>
      <div className="mt-5 flex flex-col gap-3.5">
        {rows.map((r) => (
          <div key={r.label} className="grid grid-cols-[8.5rem_1fr_2rem] sm:grid-cols-[11rem_1fr_2rem] items-center gap-3 text-sm">
            <span className="text-[var(--hk-muted)]">{r.label}</span>
            <div className="h-2.5 rounded-full bg-white/5 overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${(r.points / 30) * 100}%`, background: color }} />
            </div>
            <span className="font-mono font-semibold text-right">{r.points}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Scoring() {
  return (
    <section className="py-20 border-y border-[var(--hk-border)] bg-[var(--hk-surface)]/40">
      <div className="container-px">
        <SectionHead tag="judging" title="How you're scored (100 points each)" />
        <Reveal className="mt-12 grid lg:grid-cols-2 gap-6">
          <ScoreBars title="Level 1 · Online" rows={SCORING.l1} color="linear-gradient(90deg, var(--hk-cyan), var(--hk-violet))" />
          <ScoreBars title="Level 2 · Offline finale" rows={SCORING.l2} color="linear-gradient(90deg, var(--hk-lime), #fde047)" />
        </Reveal>
        <Reveal delay={0.1} className="mt-10">
          <div className="hk-card p-6 sm:p-7 max-w-4xl mx-auto">
            <h3 className="flex items-center gap-2 font-display font-bold text-lg">
              <MapPin className="h-5 w-5 text-[var(--hk-lime)]" /> Finale day · Saturday, Nov 14
            </h3>
            <div className="mt-4 divide-y divide-[var(--hk-border)]">
              {FINALE_PLAN.map((p) => (
                <div key={p.time} className="grid sm:grid-cols-[12rem_1fr] gap-1 sm:gap-4 py-3 text-sm">
                  <span className="font-mono font-semibold text-[var(--hk-lime)]">{p.time}</span>
                  <span className="text-[var(--hk-muted)]">{p.what}</span>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Prizes() {
  const perks: { Icon: LucideIcon; title: string; text: string }[] = [
    { Icon: Building2, title: 'Internships', text: 'Selected finalists, including runners-up, are considered for internships with Upshift India and partner companies. Not guaranteed to any team.' },
    { Icon: Users, title: 'Campus ambassadors', text: 'Strong performers can be invited to represent Upshift India at their college, with a certificate, referral rewards and early access to workshops.' },
    { Icon: Award, title: 'Certificates for everyone', text: 'Everyone who submits in Level 1 gets an e-certificate. Finalists get a finale certificate.' },
    { Icon: MessageSquareText, title: 'Feedback you can use', text: 'Every team that submits gets its score and judge comments.' },
  ];
  return (
    <section id="prizes" className="py-20 scroll-mt-16">
      <div className="container-px">
        <SectionHead tag="what winners get" title={<>{inr(PRIZE_L1 + PRIZE_L2)} in cash prizes, and a way into Upshift</>} />
        <Reveal className="mt-12 grid sm:grid-cols-2 gap-5 max-w-4xl mx-auto">
          <div className="hk-glow-card p-7 text-center">
            <p className="font-mono text-xs uppercase tracking-widest text-[var(--hk-cyan)]">Level 1 · Online</p>
            <p className="mt-2 font-display font-bold text-5xl hk-gradient-text">{inr(PRIZE_L1)}</p>
            <p className="mt-2 text-[var(--hk-muted)]">shared by {WINNERS} winners</p>
          </div>
          <div className="hk-glow-card p-7 text-center">
            <p className="font-mono text-xs uppercase tracking-widest text-[var(--hk-lime)]">Level 2 · Offline finale</p>
            <p className="mt-2 font-display font-bold text-5xl hk-prize-text">{inr(PRIZE_L2)}</p>
            <p className="mt-2 text-[var(--hk-muted)]">shared by {WINNERS} winners</p>
          </div>
        </Reveal>
        <Reveal delay={0.05}>
          <p className="mt-4 text-center text-xs text-[var(--hk-muted)]">Prizes are paid after identity verification and are subject to applicable tax deductions.</p>
        </Reveal>
        <Stagger className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-5" staggerChildren={0.06}>
          {perks.map((p) => (
            <StaggerItem key={p.title}>
              <div className="hk-card h-full p-6">
                <p.Icon className="h-6 w-6 text-[var(--hk-violet)]" />
                <h3 className="mt-4 font-display font-bold">{p.title}</h3>
                <p className="mt-1.5 text-sm text-[var(--hk-muted)] leading-relaxed">{p.text}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

function WhoCanJoin() {
  return (
    <section className="py-20 border-y border-[var(--hk-border)] bg-[var(--hk-surface)]/40">
      <div className="container-px">
        <SectionHead tag="who can join" title="Students and recent graduates, 18+" />
        <Stagger className="mt-10 grid md:grid-cols-2 gap-5 max-w-4xl mx-auto" staggerChildren={0.08}>
          <StaggerItem>
            <div className="hk-card h-full p-7">
              <GraduationCap className="h-7 w-7 text-[var(--hk-cyan)]" />
              <h3 className="mt-4 font-display font-bold text-xl">Who can join</h3>
              <div className="mt-3">
                <Bullets items={['Students and recent graduates from any college or branch', 'You must be 18 or older', 'B.Tech and engineering students are especially welcome']} />
              </div>
            </div>
          </StaggerItem>
          <StaggerItem>
            <div className="hk-card h-full p-7">
              <Users className="h-7 w-7 text-[var(--hk-violet)]" />
              <h3 className="mt-4 font-display font-bold text-xl">Teams</h3>
              <div className="mt-3">
                <Bullets color="var(--hk-violet)" items={['Teams of 1, 2 or 4 members', 'Members can be from different colleges', `${inr(FEE_L1)} per member for Level 1`]} />
              </div>
            </div>
          </StaggerItem>
        </Stagger>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------- registration form

interface Member {
  name: string;
  phone: string;
  email: string;
  organisation: string;
}
const emptyMember = (): Member => ({ name: '', phone: '', email: '', organisation: '' });

const CATEGORIES: { value: string; label: string; Icon: LucideIcon }[] = [
  { value: 'students', label: 'Students', Icon: GraduationCap },
  { value: 'graduates', label: 'Recent graduates', Icon: Award },
  { value: 'mixed', label: 'Mixed', Icon: Users },
];

function Label({ children }: { children: ReactNode }) {
  return <span className="mb-1.5 block text-[13px] font-semibold text-[var(--hk-text)]">{children}</span>;
}

function Registered({ teamName, id, members }: { teamName: string; id: number; members: number }) {
  const total = FEE_L1 * members;
  const msg = `Hi! We registered team "${teamName}" (ID #${id}, ${members} member${members === 1 ? '' : 's'}) for the ${NAME}. We'd like to pay the Level 1 fee: ${inr(FEE_L1)} × ${members} = ${inr(total)}.`;
  return (
    <div className="hk-glow-card p-8 sm:p-10 text-center max-w-2xl mx-auto">
      <CheckCircle2 className="mx-auto h-14 w-14 text-[var(--hk-lime)]" />
      <h3 className="mt-5 font-display font-bold text-3xl">Team “{teamName}” is in!</h3>
      <p className="mt-2 text-[var(--hk-muted)]">
        Registration ID <span className="font-mono text-[var(--hk-cyan)]">#{id}</span>. One step left: pay the Level 1 fee of{' '}
        <b className="text-[var(--hk-text)]">
          {inr(FEE_L1)} × {members} = {inr(total)}
        </b>{' '}
        on WhatsApp to confirm your spot.
      </p>
      <a
        href={whatsappHref(msg)}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackProduct({ key: 'hackathon', name: `${NAME} · Level 1`, price: total, action: 'pay_whatsapp', page: 'hackathon' })}
        className="hk-btn mt-7 px-8 py-4 text-base"
      >
        <MessageCircle className="h-5 w-5" /> Pay {inr(total)} on WhatsApp
      </a>
      <p className="mt-4 text-sm text-[var(--hk-muted)]">WhatsApp: {WHATSAPP_DISPLAY}</p>
    </div>
  );
}

function RegisterForm({ account }: { account: Account | null }) {
  const [teamName, setTeamName] = useState('');
  const [category, setCategory] = useState('');
  const [members, setMembers] = useState<Member[]>([emptyMember()]);

  // Logged in: fill in the team lead from the account (only boxes still empty)
  useEffect(() => {
    if (!account) return;
    setMembers((list) =>
      list.map((m, i) => (i === 0 ? { ...m, name: m.name || account.user.name, phone: m.phone || account.user.phone } : m)),
    );
  }, [account?.user.phone]); // eslint-disable-line react-hooks/exhaustive-deps
  const [idea, setIdea] = useState('');
  const [adult, setAdult] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [website, setWebsite] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ id: number; teamName: string; members: number } | null>(null);

  const setMember = (i: number, k: keyof Member, v: string) => {
    setMembers(members.map((m, j) => (j === i ? { ...m, [k]: v } : m)));
    setError(null);
  };
  /** Keeps what was typed for the members that stay */
  const setSize = (n: number) => setMembers(Array.from({ length: n }, (_, i) => members[i] ?? emptyMember()));

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    if (!category) return setError('Pick who the team is: students, recent graduates or mixed.');
    if (!adult) return setError('All team members must be 18 or older.');
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`${BACKEND_URL.replace(/\/+$/, '')}/api/hackathon`, {
        method: 'POST',
        // Signed in: the team is linked to the account (shows under "My Upshift")
        headers: { 'Content-Type': 'application/json', ...(arcToken() ? { Authorization: `Bearer ${arcToken()}` } : {}) },
        body: JSON.stringify({ teamName, category, idea, members, adult, marketingConsent, website }),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) throw new Error(body?.error ?? 'Something went wrong. Please try again.');
      setDone({ id: body.id, teamName: body.teamName ?? teamName, members: body.members ?? members.length });
      document.getElementById('register')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (err) {
      setError(err instanceof TypeError ? "Couldn't reach our server. Check your internet connection and try again." : (err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  if (done) return <Registered {...done} />;

  return (
    <form onSubmit={submit} className="hk-glow-card p-6 sm:p-9 max-w-4xl mx-auto flex flex-col gap-6">
      <div className="grid md:grid-cols-[1fr_auto] gap-5">
        <label>
          <Label>Team name</Label>
          <input className="hk-input" value={teamName} onChange={(e) => setTeamName(e.target.value)} required minLength={2} maxLength={120} placeholder="e.g. Neural Ninjas" />
        </label>
        <div>
          <Label>Team size</Label>
          <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Team size">
            {TEAM_SIZES.map((n) => (
              <button
                key={n}
                type="button"
                role="radio"
                aria-checked={members.length === n}
                onClick={() => setSize(n)}
                className={`min-w-[5rem] rounded-xl border px-3 py-2.5 text-sm font-bold transition cursor-pointer ${
                  members.length === n
                    ? 'border-[var(--hk-cyan)] bg-[var(--hk-cyan)]/10 text-[var(--hk-cyan)]'
                    : 'border-[var(--hk-border)] text-[var(--hk-muted)] hover:border-[var(--hk-cyan)]/50'
                }`}
              >
                {n === 1 ? 'Solo' : `${n} members`}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div>
        <Label>Who's in the team?</Label>
        <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Team category">
          {CATEGORIES.map((c) => (
            <button
              key={c.value}
              type="button"
              role="radio"
              aria-checked={category === c.value}
              onClick={() => {
                setCategory(c.value);
                setError(null);
              }}
              className={`flex items-center justify-center gap-2 rounded-xl border px-2 py-2.5 text-xs sm:text-sm font-semibold transition cursor-pointer ${
                category === c.value
                  ? 'border-[var(--hk-cyan)] bg-[var(--hk-cyan)]/10 text-[var(--hk-cyan)]'
                  : 'border-[var(--hk-border)] text-[var(--hk-muted)] hover:border-[var(--hk-cyan)]/50'
              }`}
            >
              <c.Icon className="h-4 w-4 shrink-0" />
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-display font-bold text-lg">Team members</h3>
          <span className="text-xs text-[var(--hk-muted)]">Everyone's mobile number is needed</span>
        </div>
        <div className="mt-4 flex flex-col gap-4">
          {members.map((m, i) => (
            <div key={i} className="rounded-2xl border border-[var(--hk-border)] bg-white/[0.02] p-4 sm:p-5">
              <span className="mb-3 block font-mono text-xs uppercase tracking-widest text-[var(--hk-cyan)]">{i === 0 ? 'Member 1 · Team lead' : `Member ${i + 1}`}</span>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <label>
                  <Label>Full name</Label>
                  <input className="hk-input" value={m.name} onChange={(e) => setMember(i, 'name', e.target.value)} required minLength={2} maxLength={120} autoComplete={i === 0 ? 'name' : 'off'} />
                </label>
                <label>
                  <Label>Mobile number</Label>
                  <input className="hk-input" value={m.phone} onChange={(e) => setMember(i, 'phone', e.target.value)} required inputMode="tel" placeholder="98765 43210" autoComplete={i === 0 ? 'tel' : 'off'} />
                </label>
                <label>
                  <Label>Email{i > 0 && <span className="font-normal text-[var(--hk-muted)]"> · optional</span>}</Label>
                  <input className="hk-input" type="email" value={m.email} onChange={(e) => setMember(i, 'email', e.target.value)} required={i === 0} autoComplete={i === 0 ? 'email' : 'off'} />
                </label>
                <label>
                  <Label>College</Label>
                  <input className="hk-input" value={m.organisation} onChange={(e) => setMember(i, 'organisation', e.target.value)} required maxLength={191} />
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>

      <label>
        <Label>
          What do you want to build? <span className="font-normal text-[var(--hk-muted)]">· optional</span>
        </Label>
        <textarea className="hk-input min-h-[80px]" value={idea} onChange={(e) => setIdea(e.target.value)} maxLength={2000} placeholder="A rough idea is fine — the problem statements are shared at kickoff." />
      </label>

      {/* Hidden from people; bots that fill every field get caught by it. */}
      <input type="text" name="website" value={website} onChange={(e) => setWebsite(e.target.value)} tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

      <div className="flex flex-col gap-2.5 text-sm">
        <label className="flex items-start gap-2.5 cursor-pointer">
          <input type="checkbox" checked={adult} onChange={(e) => setAdult(e.target.checked)} className="mt-0.5 h-4 w-4 accent-[var(--hk-cyan)]" />
          <span>Every member of the team is 18 or older, and we agree to the rules below.</span>
        </label>
        <label className="flex items-start gap-2.5 cursor-pointer text-[var(--hk-muted)]">
          <input type="checkbox" checked={marketingConsent} onChange={(e) => setMarketingConsent(e.target.checked)} className="mt-0.5 h-4 w-4 accent-[var(--hk-cyan)]" />
          <span>Tell us about Upshift programmes too (optional).</span>
        </label>
      </div>

      {error && <p className="rounded-xl border border-[var(--hk-error)]/30 bg-[var(--hk-error)]/10 px-4 py-3 text-sm text-[var(--hk-error)]">{error}</p>}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-[var(--hk-border)] pt-5">
        <p className="text-sm text-[var(--hk-muted)]">
          Level 1 fee:{' '}
          <b className="text-[var(--hk-text)]">
            {inr(FEE_L1)} × {members.length} = {inr(FEE_L1 * members.length)}
          </b>{' '}
          · GST included · pay on WhatsApp after registering
        </p>
        <button type="submit" disabled={busy} className="hk-btn px-8 py-4 text-base">
          {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <Rocket className="h-5 w-5" />}
          {busy ? 'Registering…' : 'Register team'}
        </button>
      </div>
    </form>
  );
}

function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="py-20 scroll-mt-16">
      <div className="container-px grid lg:grid-cols-2 gap-10 items-start">
        <div>
          <Reveal>
            <span className="font-mono text-xs uppercase tracking-[0.3em] text-[var(--hk-cyan)]">{'// questions'}</span>
            <h2 className="mt-3 font-display font-bold text-3xl tracking-tight">Questions</h2>
          </Reveal>
          <div className="mt-6 flex flex-col gap-3">
            {FAQ.map((f, i) => (
              <div key={f.q} className="rounded-[1.25rem] border border-[var(--hk-border)] bg-[var(--hk-surface)] overflow-hidden">
                <button onClick={() => setOpen(open === i ? null : i)} className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left font-semibold cursor-pointer" aria-expanded={open === i}>
                  {f.q}
                  <ChevronDown className={`h-4 w-4 shrink-0 text-[var(--hk-cyan)] transition-transform ${open === i ? 'rotate-180' : ''}`} />
                </button>
                {open === i && <p className="px-5 pb-4 -mt-1 text-sm text-[var(--hk-muted)] leading-relaxed">{f.a}</p>}
              </div>
            ))}
          </div>
        </div>
        <div>
          <Reveal>
            <span className="font-mono text-xs uppercase tracking-[0.3em] text-[var(--hk-cyan)]">{'// rules'}</span>
            <h2 className="mt-3 font-display font-bold text-3xl tracking-tight">The fine print, in plain words</h2>
          </Reveal>
          <Reveal delay={0.06} className="mt-6">
            <ul className="rounded-[1.25rem] border border-[var(--hk-border)] bg-[var(--hk-surface)] p-6 flex flex-col gap-3.5 text-sm">
              {RULES.map((r) => (
                <li key={r.k} className="flex gap-2.5">
                  <Cpu className="h-4 w-4 mt-0.5 shrink-0 text-[var(--hk-violet)]" />
                  <span className="text-[var(--hk-muted)]">
                    <b className="text-[var(--hk-text)]">{r.k}:</b> {r.v}
                  </span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

export default function HackathonPage() {
  const { account } = useAccount();
  useEffect(() => {
    document.title = `${NAME} · Upshift India`;
  }, []);

  return (
    <div className="hack-theme relative min-h-screen overflow-x-hidden selection:bg-[var(--hk-cyan)] selection:text-[#05060d]">
      <Header account={account} />
      <main>
        <Hero />
        <Levels />
        <KeyDates />
        <Challenge />
        <Scoring />
        <Prizes />
        <WhoCanJoin />
        <section id="register" className="py-20 scroll-mt-16">
          <div className="container-px">
            <SectionHead tag="register" title="Register your team">
              Teams of 1, 2 or 4. Add everyone's name, mobile number and college. Level 1 is {inr(FEE_L1)} per member. Registration closes Wed Oct 28, 11:59 PM.
            </SectionHead>
            <Reveal delay={0.1} className="mt-10">
              <RegisterForm account={account} />
            </Reveal>
          </div>
        </section>
        <Faq />
      </main>
      <footer className="border-t border-[var(--hk-border)] py-10">
        <div className="container-px flex flex-wrap items-center justify-between gap-6 text-sm text-[var(--hk-muted)]">
          <Logo />
          <span>© {new Date().getFullYear()} Upshift India · {NAME}</span>
          <a href={ASK} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 hover:text-[var(--hk-text)] transition">
            <MessageCircle className="h-4 w-4" /> {WHATSAPP_DISPLAY}
          </a>
        </div>
      </footer>
    </div>
  );
}
