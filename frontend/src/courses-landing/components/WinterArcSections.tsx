import { Award, CalendarDays, CheckCircle2, ChevronDown, Clock, Crown, Gift, Lock, Medal, Megaphone, PenLine, Sparkles, Trophy, Video, XCircle } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { Reveal, Stagger, StaggerItem } from '../../components/Reveal';
import SectionTag from '../../components/SectionTag';
import { CATEGORIES, DAYS_PER_CATEGORY, istDate, type ArcState } from '../arc/api';

/** Shown wherever the Zoom discussion is mentioned. */
const ZOOM_NOTE =
  'Each day, our team shortlists the most promising ideas for a live Zoom discussion. Shortlisted participants will be contacted with meeting details. Selection for a Zoom discussion is based on idea quality and does not guarantee a prize or paid-program admission.';

/** Winter Arc · AI Idea Challenge: the participant-facing parts of the guide (no internal judging details). */

function Head({ tag, title, children }: { tag: string; title: ReactNode; children?: ReactNode }) {
  return (
    <div className="text-center max-w-2xl mx-auto">
      <Reveal>
        <SectionTag label={tag} />
      </Reveal>
      <Reveal delay={0.06}>
        <h2 className="mt-4 font-display font-bold text-3xl sm:text-4xl tracking-tight text-ink">{title}</h2>
      </Reveal>
      {children && (
        <Reveal delay={0.1}>
          <p className="mt-3 text-ink-muted leading-relaxed">{children}</p>
        </Reveal>
      )}
    </div>
  );
}

function Ticks({ items, bad = false }: { items: string[]; bad?: boolean }) {
  const Icon = bad ? XCircle : CheckCircle2;
  return (
    <ul className="flex flex-col gap-2 text-sm text-ink-soft">
      {items.map((t) => (
        <li key={t} className="flex gap-2.5">
          <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${bad ? 'text-violet' : 'text-leaf'}`} />
          <span>{t}</span>
        </li>
      ))}
    </ul>
  );
}

const card = 'rounded-2xl bg-white border border-ink/5 shadow-card';

// ---------------------------------------------------------------- how it works

const STEPS = [
  { time: 'Day before', title: 'Read the theme', text: "Each day's challenge is announced the day before, from one of our five learning areas. Plan ahead." },
  { time: 'Before 11:59 PM', title: 'Write your entry', text: 'Verify your mobile, add your name and write your idea — about 300 words. One entry a day, and you can edit until the deadline.' },
  { time: 'Overnight', title: 'We score it', text: 'Entries are first scored with AI tools using the public rubric. People then read the top ones and pick the winner.' },
  { time: '6:00 PM next day', title: 'See the Winner Board', text: "The day's winner, their prize and the Top 10 are posted with their idea titles." },
];

const POINTS = [
  { k: 'Every valid entry', v: '1' },
  { k: 'Daily Top 10', v: '+5' },
  { k: 'Daily winner', v: '+10' },
  { k: '5 entries in a row', v: '+5' },
];

export function HowItWorks() {
  return (
    <section id="how" className="py-20 scroll-mt-24">
      <div className="container-px">
        <Head tag="How it works" title="Your day in the Arc takes 15 minutes">
          You don't need to code. You need a real problem, a clear idea for how AI or technology can help, and a way to test it. Every challenge comes from
          one of Upshift India's five learning areas. Join on Day 1 or on Day 12 — every day stands on its own.
        </Head>

        <Stagger className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-5" staggerChildren={0.07}>
          {STEPS.map((s, i) => (
            <StaggerItem key={s.title}>
              <div className={`${card} h-full p-6`}>
                <div className="flex items-center justify-between">
                  <span className="h-9 w-9 rounded-xl bg-sun text-white font-display font-bold flex items-center justify-center">{i + 1}</span>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-sun">
                    <Clock className="h-3.5 w-3.5" /> {s.time}
                  </span>
                </div>
                <h3 className="mt-4 font-display font-bold text-lg text-ink">{s.title}</h3>
                <p className="mt-1.5 text-sm text-ink-muted leading-relaxed">{s.text}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>

        <div className="mt-8 grid lg:grid-cols-[1.2fr_0.8fr] gap-5">
          <Reveal>
            <div className="h-full rounded-3xl bg-ink text-cream p-7 sm:p-8 relative overflow-hidden">
              <div className="pointer-events-none absolute -top-20 -right-16 h-64 w-64 rounded-full bg-sun/30 blur-3xl" />
              <h3 className="relative flex items-center gap-2 font-display font-bold text-xl">
                <Gift className="h-5 w-5 text-sun-light" /> What you can win
              </h3>
              <ul className="relative mt-5 grid sm:grid-cols-2 gap-4 text-sm">
                {[
                  { Icon: Gift, k: 'Daily winner', v: "An exciting prize for the day's best idea" },
                  { Icon: Trophy, k: 'Daily Top 10', v: 'A place on the Winner Board and a certificate' },
                  { Icon: Video, k: 'Shortlisted ideas', v: 'A live Zoom discussion with the Upshift team' },
                  { Icon: Sparkles, k: 'Everyone', v: 'Arc Points and a free class suggestion that fits your idea' },
                ].map((w) => (
                  <li key={w.k} className="flex gap-3">
                    <w.Icon className="h-5 w-5 shrink-0 text-sky" />
                    <span>
                      <b className="block">{w.k}</b>
                      <span className="text-cream/70">{w.v}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
          <Reveal delay={0.08}>
            <div className={`${card} h-full p-7`}>
              <h3 className="font-display font-bold text-xl text-ink">Arc Points</h3>
              <div className="mt-4 divide-y divide-ink/5">
                {POINTS.map((p) => (
                  <div key={p.k} className="flex items-center justify-between py-2.5 text-sm">
                    <span className="text-ink-soft">{p.k}</span>
                    <span className="font-display font-bold text-lg text-sun">{p.v}</span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------- next theme, announced a day ahead

/** "Tomorrow's challenge": each day's challenge is announced the day before. Shown once the team has set it in the dashboard. */
export function ThemeAnnouncement({ state }: { state: ArcState | null }) {
  const u = state?.upNext;
  if (!u || !(u.topic || u.prompt)) return null;
  const started = state!.phase === 'open' || state!.phase === 'between';
  const label = started ? "Tomorrow's challenge" : 'First challenge';
  return (
    <section id="theme" className="pt-4 pb-16 scroll-mt-24">
      <div className="container-px">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2rem] border border-sun/20 bg-gradient-to-br from-sun-light via-white to-sky-light p-6 sm:p-10">
            <div className="pointer-events-none absolute -top-16 -right-10 h-56 w-56 rounded-full bg-sun/20 blur-3xl" />
            <div className="relative grid lg:grid-cols-[1.4fr_1fr] gap-8 items-center">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full bg-sun text-white px-4 py-1.5 text-xs font-bold uppercase tracking-wider shadow-soft">
                  <Megaphone className="h-3.5 w-3.5" /> {label} · announced
                </span>
                <p className="mt-5 font-mono text-sm font-semibold text-sun">
                  DAY {String(u.day).padStart(2, '0')} · {u.category.toUpperCase()}
                </p>
                <h2 className="mt-1 font-display font-bold text-4xl sm:text-5xl tracking-tight text-ink">{u.topic ?? u.category}</h2>
                {u.prompt && <p className="mt-3 text-xl text-ink-soft leading-snug">"{u.prompt}"</p>}
                <p className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-ink">
                  <CalendarDays className="h-4 w-4 text-sun" />
                  {u.date ? `Submit on ${istDate(u.closesAt!)} · until 11:59 PM IST` : 'Submission date announced soon'}
                </p>
              </div>
              <div className="rounded-2xl bg-white/80 border border-ink/5 p-6 shadow-card">
                <h3 className="font-display font-bold text-lg text-ink">Why we announce it a day early</h3>
                <ul className="mt-3 flex flex-col gap-2 text-sm text-ink-soft">
                  {['Think it through overnight', 'Talk to a real person who has the problem', 'Come back ready to write a sharp idea'].map((t) => (
                    <li key={t} className="flex gap-2.5">
                      <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0 text-leaf" />
                      {t}
                    </li>
                  ))}
                </ul>
                <p className="mt-4 text-xs text-ink-muted">Every day's challenge is announced the day before its submission day.</p>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------- what to write

const BOXES = [
  { box: 'Title', what: 'A plain name for your idea', limit: 80 },
  { box: 'The problem', what: 'Who has it, and how bad is it? Name one real kind of person', limit: 500 },
  { box: 'The idea', what: 'What does the AI do for that person?', limit: 600 },
  { box: 'How it works', what: 'What goes in, what the AI does, what comes out', limit: 500 },
  { box: 'First 7-day test', what: 'How would you try it with a few real people, and how will you know it worked?', limit: 400 },
  { box: 'Tools (optional)', what: 'Any tools or AI models you would use', limit: 150 },
];

const EXAMPLE = [
  { k: 'Title', v: 'Hostel Washing Machine Alert (Embedded Systems)' },
  {
    k: 'The problem',
    v: 'Our hostel has 220 students and 6 washing machines on the ground floor. Students carry their laundry down 4 floors only to find every machine busy. In a quick poll, 31 of 40 friends said this happens at least twice a week.',
  },
  {
    k: 'The idea',
    v: 'A small vibration sensor on each machine tells a WhatsApp bot which machines are running. An AI model learns how long each wash cycle takes and answers "Machine 3 free in about 12 minutes".',
  },
  {
    k: 'How it works',
    v: 'Input: vibration readings from a low-cost board on each machine. AI step: spot when a cycle starts and estimate when it ends. Output: a live status the student gets by sending "laundry" on WhatsApp.',
  },
  { k: 'First 7-day test', v: 'Fit 2 machines for one week and ask 20 students to check before going down. It worked if wasted trips drop by half in a repeat poll.' },
  { k: 'Tools', v: 'ESP32 board, vibration sensor, Google Sheets, WhatsApp Business, any language model' },
];

export function WhatToWrite() {
  const [showExample, setShowExample] = useState(false);
  return (
    <section className="py-20 bg-paper/60 scroll-mt-24" id="write">
      <div className="container-px">
        <Head tag="What to write" title="Five points. Short and specific.">
          Cover these in your idea box — about 300 words. English or Hinglish is fine. No links, images or attachments: everything is plain text, so every
          entry is read the same way.
        </Head>

        <Reveal className="mt-10">
          <div className={`${card} overflow-hidden max-w-4xl mx-auto`}>
            {BOXES.map((b, i) => (
              <div key={b.box} className={`grid grid-cols-[auto_1fr_auto] items-center gap-4 px-5 py-3.5 ${i % 2 ? 'bg-paper/40' : ''}`}>
                <span className="h-7 w-7 rounded-lg bg-sun/10 text-sun text-xs font-bold flex items-center justify-center">{i < 5 ? i + 1 : '+'}</span>
                <div>
                  <p className="font-semibold text-ink">{b.box}</p>
                  <p className="text-sm text-ink-muted">{b.what}</p>
                </div>
                <span />
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.05} className="mt-6 max-w-4xl mx-auto">
          <button
            onClick={() => setShowExample(!showExample)}
            className="w-full flex items-center justify-between gap-3 rounded-2xl border-2 border-dashed border-sun/40 bg-white px-5 py-4 text-left font-semibold text-ink hover:border-sun transition cursor-pointer"
            aria-expanded={showExample}
          >
            <span className="flex items-center gap-2">
              <PenLine className="h-5 w-5 text-sun" /> See an example entry
            </span>
            <ChevronDown className={`h-5 w-5 text-sun transition-transform ${showExample ? 'rotate-180' : ''}`} />
          </button>
          {showExample && (
            <div className={`${card} mt-3 border-l-4 border-l-sun p-6 flex flex-col gap-3 text-sm`}>
              <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">Example (not a real submission)</p>
              {EXAMPLE.map((e) => (
                <p key={e.k} className="text-ink-soft leading-relaxed">
                  <b className="text-ink">{e.k}:</b> {e.v}
                </p>
              ))}
            </div>
          )}
        </Reveal>

        <Stagger className="mt-6 grid md:grid-cols-2 gap-5 max-w-4xl mx-auto" staggerChildren={0.08}>
          <StaggerItem>
            <div className={`${card} h-full p-6`}>
              <h3 className="font-display font-bold text-lg text-ink">Strong entries</h3>
              <div className="mt-3">
                <Ticks items={['Name a real person and a real situation', 'Include one number or one detail you saw yourself', 'Say exactly what the AI does', 'Have a test you could start tomorrow']} />
              </div>
            </div>
          </StaggerItem>
          <StaggerItem>
            <div className={`${card} h-full p-6`}>
              <h3 className="font-display font-bold text-lg text-ink">Weak entries</h3>
              <div className="mt-3">
                <Ticks bad items={['"An app that uses AI to help everyone"', 'A long list of features with no user', 'Buzzwords instead of steps', 'The same entry pasted on several days']} />
              </div>
            </div>
          </StaggerItem>
        </Stagger>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------- how winners are picked

const RUBRIC = [
  { k: 'Real problem and target user', v: 25 },
  { k: 'Technical or AI solution relevance', v: 25 },
  { k: 'Feasibility and seven-day test', v: 20 },
  { k: 'Originality', v: 15 },
  { k: 'Clarity', v: 15 },
];

export function Judging() {
  return (
    <section className="py-20">
      <div className="container-px">
        <Head tag="How winners are picked" title="Same rubric for everyone, every day">
          Every entry is scored out of 100 on the same five points, whichever of the five learning areas the day is from. The score looks at what you
          wrote — not your college, your name or how polished the writing is.
        </Head>
        <div className="mt-12 grid lg:grid-cols-2 gap-5">
          <Reveal>
            <div className={`${card} h-full p-7`}>
              <div className="flex flex-col gap-4">
                {RUBRIC.map((r) => (
                  <div key={r.k}>
                    <div className="flex justify-between text-sm">
                      <span className="text-ink-soft">{r.k}</span>
                      <span className="font-display font-bold text-ink">{r.v}</span>
                    </div>
                    <div className="mt-1.5 h-2.5 rounded-full bg-paper overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-sun to-sky" style={{ width: `${(r.v / 25) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-6 text-sm text-ink-muted">
                <b className="text-ink">If scores are close:</b> the higher "real problem and target user" score wins, then the higher "feasibility and
                seven-day test" score, then the judges' call. Decisions are final.
              </p>
            </div>
          </Reveal>
          <Stagger className="grid gap-5" staggerChildren={0.08}>
            <StaggerItem>
              <div className={`${card} p-6`}>
                <h3 className="font-display font-bold text-lg text-ink">What happens after you submit</h3>
                <div className="mt-3">
                  <Ticks
                    items={[
                      'Entries are anonymised. Reviewers see a code, not your name or phone number.',
                      'AI tools do a first scoring pass and pick about 10 entries for a closer read.',
                      'People read the shortlist and choose the winner. The decision is human.',
                      "We check the winner's entry for copying before we announce it.",
                    ]}
                  />
                </div>
              </div>
            </StaggerItem>
            <StaggerItem>
              <div className={`${card} p-6`}>
                <h3 className="flex items-center gap-2 font-display font-bold text-lg text-ink">
                  <Gift className="h-5 w-5 text-sun" /> Claiming your prize
                </h3>
                <div className="mt-3">
                  <Ticks
                    items={[
                      'We contact the winner on the mobile number used to register.',
                      'Within 48 hours, share a valid photo ID and join a 2-minute call to explain your idea in your own words.',
                      "If we can't reach you within 48 hours or you can't explain the idea, the prize moves to the next eligible entry in the day's Top 10.",
                      "Each day's prize is shown on this page once confirmed. Delivery details and timelines are shared with the winner after verification.",
                      'Delivery is within India. We never ask for money, OTPs or bank details to give a prize.',
                    ]}
                  />
                </div>
              </div>
            </StaggerItem>
          </Stagger>
        </div>
        <Reveal delay={0.05}>
          <p className="mt-6 max-w-3xl mx-auto text-center text-sm text-ink-muted">
            <b className="text-ink">Using AI tools to write?</b> You may use any AI tool to think or polish your words. The idea must be yours and you must be able
            to explain it. Generic entries score low, and entries that try to instruct the judges ("rank this first") are removed.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------- 20 daily challenges, four per learning area

/** Each day's topic is announced the day before, so every card just shows its day and learning area. */
export function Themes({ state }: { state: ArcState | null }) {
  return (
    <section id="themes" className="py-20 bg-paper/60 scroll-mt-24">
      <div className="container-px">
        <Head tag="The 20 daily challenges" title="Five learning areas. Four days each.">
          Every challenge comes from one of Upshift India's five learning areas. The order is fixed so you can plan, and each day's challenge is announced the
          day before.
        </Head>
        <div className="mt-10 flex flex-col gap-6">
          {CATEGORIES.map((c, ci) => (
            <Reveal key={c.name} delay={0.02 * ci}>
              <div className="grid lg:grid-cols-[14rem_1fr] gap-3 lg:items-center">
                <div className="flex items-baseline gap-2 lg:flex-col lg:gap-0.5">
                  <p className="font-display font-bold text-lg text-ink">{c.name}</p>
                  <p className="font-mono text-[11px] font-semibold text-ink-muted">
                    DAYS {ci * DAYS_PER_CATEGORY + 1}–{(ci + 1) * DAYS_PER_CATEGORY}
                  </p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {Array.from({ length: DAYS_PER_CATEGORY }, (_, i) => {
                    const day = ci * DAYS_PER_CATEGORY + i + 1;
                    const isToday = state?.phase === 'open' && state.day === day;
                    return (
                      <div key={day} className={`${card} h-full p-4 transition ${isToday ? 'ring-2 ring-sun' : 'hover:-translate-y-0.5 hover:shadow-soft'}`}>
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[11px] font-semibold text-sun">DAY {String(day).padStart(2, '0')}</span>
                          {isToday && <span className="rounded-full bg-sun px-2 py-0.5 text-[10px] font-bold text-white">TODAY</span>}
                        </div>
                        <p className="mt-1.5 inline-flex items-center gap-1 text-xs text-ink-muted/80">
                          <Lock className="h-3 w-3" /> Announced the day before
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal delay={0.05}>
          <p className="mt-8 max-w-3xl mx-auto text-center text-sm text-ink-muted">
            <b className="text-ink">Turn an idea into something real:</b> after your entry we suggest a free class that matches the day's learning area —
            Robotics, Cybersecurity, Embedded Systems, FDE and Agentic AI, or AI Content Creation. Joining is optional and never affects judging.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------- daily prizes + Zoom shortlist

const PRIZE_POINTS = [
  { Icon: Crown, k: 'Daily winner and prize', v: "One winner every day, announced at 6:00 PM the next day with the day's prize." },
  { Icon: Trophy, k: 'Daily Top 10 recognition', v: 'The ten best ideas of the day go up on the Winner Board.' },
  { Icon: Award, k: 'Certificate for the Top 10', v: 'Every Top 10 participant gets a certificate.' },
  { Icon: Medal, k: 'Arc Points and leaderboard', v: 'Earn points for every entry, Top 10 place, win and streak.' },
];

/** The day's prize comes from the dashboard and appears only once the team has confirmed it. */
export function DailyPrizes({ state, onSubmit }: { state: ArcState | null; onSubmit: () => void }) {
  const prize = state?.prize ?? null;
  return (
    <section id="prizes" className="py-20 scroll-mt-24">
      <div className="container-px">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2rem] bg-ink text-cream px-6 py-12 sm:px-12 lg:py-14">
            <div className="pointer-events-none absolute -top-24 -right-16 h-80 w-80 rounded-full bg-sun/30 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-28 -left-16 h-80 w-80 rounded-full bg-sky/20 blur-3xl" />
            <div className="relative grid lg:grid-cols-2 gap-8 items-stretch">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/15 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-sun-light">
                  <Gift className="h-3.5 w-3.5" /> 20 Days. 20 Challenges. Exciting Prizes Every Day!
                </span>
                <h2 className="mt-5 font-display font-bold text-3xl sm:text-4xl tracking-tight">
                  Exciting Prizes. <span className="text-gradient">Every Single Day.</span>
                </h2>
                <p className="mt-4 text-cream/75 leading-relaxed max-w-xl">
                  Every day brings a new challenge, a fresh opportunity to stand out, and exciting prizes for the best ideas.
                </p>
                <ul className="mt-6 grid sm:grid-cols-2 gap-4 text-sm">
                  {PRIZE_POINTS.map((p) => (
                    <li key={p.k} className="flex gap-3">
                      <p.Icon className="h-5 w-5 shrink-0 text-sky" />
                      <span>
                        <b className="block">{p.k}</b>
                        <span className="text-cream/70">{p.v}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-col gap-4">
                {/* Today's prize */}
                <div className="rounded-2xl bg-white/[0.06] border border-white/10 p-5 sm:p-6 flex gap-4 items-center">
                  {prize?.imageUrl ? (
                    <img src={prize.imageUrl} alt={prize.name} className="h-20 w-20 sm:h-24 sm:w-24 shrink-0 rounded-xl object-cover bg-white/10" loading="lazy" />
                  ) : (
                    <span className="h-20 w-20 sm:h-24 sm:w-24 shrink-0 rounded-xl bg-gradient-to-br from-sun to-sky flex items-center justify-center">
                      <Gift className="h-9 w-9 text-white" />
                    </span>
                  )}
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wider text-sun-light">{prize ? `Day ${prize.day} prize` : "Today's prize"}</p>
                    <p className="mt-1 font-display font-bold text-xl leading-snug">{prize ? prize.name : 'An exciting prize for the best idea'}</p>
                    <p className="mt-1 text-sm text-cream/70 leading-relaxed">{prize ? prize.description : 'Prize details are revealed here once confirmed.'}</p>
                  </div>
                </div>

                {/* Zoom shortlist */}
                <div className="rounded-2xl bg-white/[0.06] border border-white/10 p-5 sm:p-6 flex flex-col flex-1">
                  <h3 className="flex items-center gap-2 font-display font-bold text-xl">
                    <Video className="h-5 w-5 text-sky" /> A live Zoom discussion for shortlisted ideas
                  </h3>
                  <p className="mt-2 text-sm text-cream/75 leading-relaxed">{ZOOM_NOTE}</p>
                  <p className="mt-2 text-xs text-cream/60">The Zoom shortlist is separate from the Top 10: an idea can be on one, both or neither.</p>
                  <button onClick={onSubmit} className="mt-5 lg:mt-auto w-full rounded-full bg-sun text-white font-semibold px-6 py-3 hover:brightness-110 transition cursor-pointer">
                    Submit Your Idea
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------- rules and FAQ

const FAQ = [
  [
    'What are the challenges about?',
    "Upshift India's five learning areas, four days each: Robotics (Days 1–4), Cybersecurity (5–8), Embedded Systems (9–12), FDE and Agentic AI (13–16) and AI-Powered Content Creation (17–20).",
  ],
  ['Do I need to join from Day 1?', 'No. Join any day. Points add up from the day you start.'],
  ['Can I enter every day?', 'Yes, one entry per day. Missing a day is fine.'],
  ['What can I win?', "The day's winner gets that day's prize, shown on this page once confirmed. The Top 10 get a place on the Winner Board and a certificate, and everyone earns Arc Points."],
  ['Can I win more than once?', 'Yes. Each day is a fresh contest.'],
  ['Do I have to know coding?', 'No. The idea and the test matter, not code.'],
  ['Which time zone is used?', 'Indian Standard Time. The deadline is 11:59 PM IST.'],
  ['How do I know if I won?', 'Check the Winner Board at 6:00 PM next day. Winners also get a message on their registered number.'],
  ['How do I claim a prize?', "We contact you on your registered number. Within 48 hours, share a valid photo ID and join a 2-minute call to explain your idea. Delivery details and timelines are shared after verification."],
  ['What if I miss the call?', "If we can't reach you within 48 hours, the prize moves to the next eligible entry in that day's Top 10."],
  ['Will I get a Zoom call with the team?', ZOOM_NOTE],
  ['Is the Zoom shortlist the same as the Top 10?', 'No. They are separate. An idea can be in the Top 10, on the Zoom shortlist, both or neither.'],
];

const RULES = [
  'Entry is free. No purchase or payment is needed to enter or to win.',
  'You must be 18 or older and live in India.',
  'Register with your own mobile number. One account per person.',
  'One entry per day. Edit until 11:59 PM IST, then it locks.',
  'The idea must be your own. Copied, repeated or manipulative entries are removed.',
  'No links, images or attachments. Plain text only.',
  'Every entry is judged on the same public rubric. Prizes are awarded on merit, not by chance or draw.',
  "Each day's prize is named on this page only once it is confirmed. Winners are verified with a photo ID and a short call before any prize is given.",
  'Being shortlisted for a Zoom discussion does not guarantee a prize or paid-program admission.',
  'Free classes are optional and never affect judging.',
  'You keep ownership of your idea. AI tools see only your entry text and a code — not your name, phone or college.',
  'You can ask us to delete your data at any time.',
];

export function RulesFaq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="py-20 bg-paper/60 scroll-mt-24">
      <div className="container-px grid lg:grid-cols-2 gap-10 items-start">
        <div>
          <Reveal>
            <SectionTag label="Questions" />
            <h2 className="mt-4 font-display font-bold text-3xl tracking-tight text-ink">Questions</h2>
          </Reveal>
          <div className="mt-6 flex flex-col gap-3">
            {FAQ.map(([q, a], i) => (
              <div key={q} className={`${card} overflow-hidden`}>
                <button onClick={() => setOpen(open === i ? null : i)} className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left font-semibold text-ink cursor-pointer" aria-expanded={open === i}>
                  {q}
                  <ChevronDown className={`h-4 w-4 shrink-0 text-sun transition-transform ${open === i ? 'rotate-180' : ''}`} />
                </button>
                {open === i && <p className="px-5 pb-4 -mt-1 text-sm text-ink-muted leading-relaxed">{a}</p>}
              </div>
            ))}
          </div>
        </div>
        <div>
          <Reveal>
            <SectionTag label="Rules" />
            <h2 className="mt-4 font-display font-bold text-3xl tracking-tight text-ink">The fine print, in plain words</h2>
          </Reveal>
          <Reveal delay={0.06} className={`${card} mt-6 p-6`}>
            <Ticks items={RULES} />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
