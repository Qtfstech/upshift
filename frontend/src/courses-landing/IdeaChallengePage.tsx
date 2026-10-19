import { ArrowLeft, ArrowRight, BellRing, Gift, Snowflake, UserRound } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Reveal } from '../components/Reveal';
import { useAccount } from '../account/account';
import AccountButton from '../account/AccountButton';
import MyUpshiftSection from '../account/MyUpshiftSection';
import { useArc } from './arc/api';
import ArcEntryCard from './components/ArcEntryCard';
import MyData from './components/MyData';
import WinnerBoard from './components/WinnerBoard';
import { DailyPrizes, HowItWorks, Judging, RulesFaq, ThemeAnnouncement, Themes, WhatToWrite } from './components/WinterArcSections';
import './theme.css';

const COURSES_HREF = './courses';
/** Daily themes, reminders and winners are posted in this WhatsApp group. */
const WHATSAPP_GROUP_HREF = 'https://chat.whatsapp.com/EpyNjUyzWWvF49Fah0BKsp';
const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

export default function IdeaChallengePage() {
  const { state, me, reloadState, reloadMe } = useArc();
  const [myDataOpen, setMyDataOpen] = useState(false);
  const { account, reload: reloadAccount } = useAccount();

  useEffect(() => {
    document.title = 'Winter Arc AI Idea Challenge · Upshift India';
  }, []);

  /** The submit form (mobile check, name, idea) is the card at the top: take people there. */
  const toForm = () => {
    scrollTo('submit');
    setTimeout(() => document.querySelector<HTMLInputElement>('#submit input')?.focus({ preventScroll: true }), 500);
  };
  const dayLabel =
    state?.phase === 'open'
      ? `Day ${state.day} of ${state.days}`
      : state?.phase === 'ended'
        ? 'All 20 days done'
        : state?.phase === 'between'
          ? `Day ${state.day} of ${state.days} · opens 9:00 AM`
          : 'Challenge starts soon';
  const canSubmit = state?.phase !== 'ended';

  return (
    <div className="qt-theme idea-theme relative min-h-screen bg-cream/80 overflow-x-hidden selection:bg-sun selection:text-white">
      <header className="fixed top-0 inset-x-0 z-50 bg-cream/85 backdrop-blur-md shadow-card">
        <div className="container-px flex items-center justify-between h-20">
          <a href="./" className="flex items-center gap-2.5">
            <img src={`${import.meta.env.BASE_URL}upshift-logo-transparent.png`} alt="Upshift India" className="h-11 w-11 object-contain" />
            <span className="leading-tight">
              <span className="block font-display font-bold tracking-[0.2em] text-sm text-ink">UPSHIFT INDIA</span>
              <span className="hidden sm:block text-[10px] tracking-[0.16em] text-ink-muted">UPSKILL TODAY. UPSHIFT TOMORROW.</span>
            </span>
          </a>
          <div className="flex items-center gap-2 sm:gap-4">
            <a href={COURSES_HREF} className="hidden md:inline-flex items-center gap-1.5 text-sm font-medium text-ink-muted hover:text-ink transition-colors">
              <ArrowLeft className="h-4 w-4" /> All courses
            </a>
            {me ? (
              <button
                onClick={() => setMyDataOpen(true)}
                className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-ink-muted hover:text-ink transition-colors cursor-pointer"
              >
                <UserRound className="h-4 w-4" /> My data
              </button>
            ) : (
              <button
                onClick={toForm}
                className="hidden sm:inline-flex items-center gap-2 rounded-full bg-ink text-cream text-sm font-semibold px-5 py-2.5 shadow-soft hover:bg-ink-soft hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
              >
                Submit Your Idea
              </button>
            )}
            <AccountButton account={account} page="idea-challenge" />
          </div>
        </div>
      </header>

      {myDataOpen && me && (
        <MyData
          me={me}
          onClose={() => setMyDataOpen(false)}
          onChanged={reloadMe}
          onSignedOut={() => {
            setMyDataOpen(false);
            reloadMe();
          }}
        />
      )}

      <main className="relative z-10">
        {/* Hero */}
        <section className="relative overflow-hidden pt-28 pb-14 lg:pt-28 lg:pb-16">
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--color-sun-light)_0%,_transparent_55%),radial-gradient(ellipse_at_bottom_right,_var(--color-sky-light)_0%,_transparent_55%)]" />
            <div className="absolute -top-24 -right-20 h-[28rem] w-[28rem] rounded-full bg-sun/10 blur-3xl animate-float" />
            <div className="absolute inset-0 bg-noise" />
          </div>
          <div className="container-px grid lg:grid-cols-[minmax(0,1fr)_minmax(0,39rem)] gap-8 lg:gap-14 items-center">
            <div className="text-center lg:text-left">
              <Reveal>
                <span className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-sun via-[#3D7BF7] to-sky px-4 py-1.5 text-white shadow-lift ring-4 ring-sun/15">
                  <Snowflake className="h-4 w-4" />
                  <span className="text-xs sm:text-sm font-bold uppercase tracking-wider">{dayLabel}</span>
                </span>
              </Reveal>
              <Reveal delay={0.06}>
                <h1 className="mt-5 font-display font-bold text-5xl sm:text-6xl lg:text-[4.25rem] leading-[1.02] tracking-tight text-ink">
                  <span className="text-gradient">Winter Arc</span> AI Idea Challenge
                </h1>
              </Reveal>
              <Reveal delay={0.12}>
                <p className="mt-4 font-display font-bold text-xl sm:text-2xl text-sun">One AI Idea a Day. Exciting Prizes Every Day.</p>
                <p className="mt-3 text-ink-muted max-w-xl mx-auto lg:mx-0 leading-relaxed">
                  Join the free 20-day AI Idea Challenge by Upshift India. Solve real-world problems, submit your ideas, compete for daily prizes, and get recognized
                  for your creativity.
                </p>
                {/* The main USP, above the fold */}
                <div className="mt-5 inline-flex items-center gap-3 rounded-2xl bg-white/85 border border-sun/20 px-4 py-3 shadow-card text-left">
                  <span className="h-10 w-10 shrink-0 rounded-xl bg-sun text-white flex items-center justify-center">
                    <Gift className="h-5 w-5" />
                  </span>
                  <span className="font-display font-bold text-ink leading-snug sm:text-lg">
                    20 Days. 20 Challenges. <span className="text-gradient">Exciting Prizes Every Day!</span>
                  </span>
                </div>
                <p className="mt-3 text-xs text-ink-muted">Theme announced the day before · Entries close 11:59 PM IST · Winners at 6:00 PM the next day</p>
              </Reveal>
              <Reveal delay={0.2} className="mt-6 flex flex-wrap items-center justify-center lg:justify-start gap-3">
                {!me && (
                  <button
                    onClick={toForm}
                    className="rounded-full bg-sun text-white px-6 py-3 font-semibold shadow-soft hover:brightness-110 hover:-translate-y-0.5 transition-all cursor-pointer"
                  >
                    Submit Your Idea
                  </button>
                )}
                <button
                  onClick={() => scrollTo('themes')}
                  className="group inline-flex items-center gap-2 rounded-full border border-ink/15 px-6 py-3 font-semibold text-ink hover:bg-ink/5 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
                >
                  Explore the Daily Challenges
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </button>
              </Reveal>
            </div>
            <Reveal delay={0.1} className="w-full max-w-2xl mx-auto lg:max-w-none">
              <div id="submit" className="scroll-mt-24">
                <ArcEntryCard
                  state={state}
                  me={me}
                  onSubmitted={() => {
                    reloadMe();
                    reloadState();
                    reloadAccount();
                  }}
                />
              </div>
            </Reveal>
          </div>
        </section>

        {/* Logged in: ideas, evening Zoom calls, hackathon team and the workshops clicked on the main page */}
        {account && <MyUpshiftSection account={account} page="idea-challenge" />}

        {/* Keep a lookout: the WhatsApp group gets each theme, reminder and winner first */}
        <section className="pb-12">
          <div className="container-px">
            <Reveal>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 rounded-[2rem] border border-leaf/25 bg-white/85 p-6 sm:p-8 shadow-card">
                <span className="h-12 w-12 shrink-0 rounded-2xl bg-leaf text-white flex items-center justify-center">
                  <BellRing className="h-6 w-6" />
                </span>
                <div className="flex-1">
                  <h2 className="font-display font-bold text-xl sm:text-2xl text-ink">Keep a lookout on our WhatsApp group</h2>
                  <p className="mt-1 text-sm text-ink-muted leading-relaxed">
                    Each day's theme, deadline reminders and the winners are posted there first. Join so you never miss a day.
                  </p>
                </div>
                <a
                  href={WHATSAPP_GROUP_HREF}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-2 rounded-full bg-[#25D366] text-white px-6 py-3 font-semibold shadow-soft hover:brightness-105 hover:-translate-y-0.5 transition-all"
                >
                  Join the WhatsApp group
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </a>
              </div>
            </Reveal>
          </div>
        </section>

        <ThemeAnnouncement state={state} />
        <HowItWorks />
        <DailyPrizes state={state} onSubmit={toForm} />
        <WhatToWrite />
        <WinnerBoard state={state} />
        <Judging />
        <Themes state={state} />
        <RulesFaq />
      </main>

      <footer className="border-t border-ink/10 py-10 pb-24 lg:pb-10">
        <div className="container-px flex flex-wrap items-center justify-between gap-4 text-sm text-ink-muted">
          <span>© {new Date().getFullYear()} Upshift India · Quality Thought</span>
          <div className="flex flex-wrap items-center gap-6">
            {me && (
              <button onClick={() => setMyDataOpen(true)} className="hover:text-ink transition-colors cursor-pointer">
                My data
              </button>
            )}
            <a href={WHATSAPP_GROUP_HREF} target="_blank" rel="noopener noreferrer" className="hover:text-ink transition-colors">
              WhatsApp group
            </a>
            <a href="#faq" className="hover:text-ink transition-colors">
              Rules and FAQ
            </a>
            <a href="mailto:admissions@qualitythought.in" className="hover:text-ink transition-colors">
              admissions@qualitythought.in
            </a>
          </div>
        </div>
      </footer>

      {/* Sticky action on phones */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 p-3 bg-gradient-to-t from-cream via-cream/95 to-transparent">
        <button onClick={canSubmit ? toForm : () => scrollTo('board')} className="w-full rounded-full bg-sun text-white font-semibold py-3.5 shadow-lift cursor-pointer">
          {canSubmit ? (me?.today ? 'Edit my idea' : 'Submit Your Idea') : 'See the Winner Board'}
        </button>
      </div>
    </div>
  );
}
