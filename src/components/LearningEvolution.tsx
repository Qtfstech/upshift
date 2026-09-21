import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  PenTool,
  Users,
  Briefcase,
  FileCode2,
  Sparkles,
  Zap,
} from 'lucide-react';

// Fast, snappy step durations
// 0: Walks to Project-Based Learning (~1.6s)
// 1: Project-Based dissolves (~1.1s)
// 2: Walks to Internship-Based & immediately dissolves (~1.3s)
// 3: Discovers & chooses Workshop path (~1.1s)
// 4: Workshop-Integrated heading & features bloom in center (~4.5s)
const STEP_DURATIONS = [1600, 1100, 1300, 1100, 4800];

const WIL_FEATURES = [
  {
    icon: Building2,
    title: 'Real Companies',
    badge: 'On-Site in GCCs',
    detail: 'Learn inside global capability centres in Hyderabad, not a classroom.',
    color: '#F2822B',
    bgColor: 'rgba(242,130,43,0.12)',
  },
  {
    icon: PenTool,
    title: 'Real Tools',
    badge: 'Live Industry Stacks',
    detail: 'Hands-on with the cloud, AI and dev tooling teams use every day.',
    color: '#1FB6C9',
    bgColor: 'rgba(31,182,201,0.12)',
  },
  {
    icon: Users,
    title: 'Real Mentors',
    badge: 'Senior Engineers',
    detail: 'Guided by working engineers who review your code and your thinking.',
    color: '#6C4FE0',
    bgColor: 'rgba(108,79,224,0.12)',
  },
  {
    icon: Briefcase,
    title: 'Real Hiring',
    badge: 'Direct Pipeline',
    detail: 'Top performers get in front of hiring managers — a direct route to a job.',
    color: '#3F9142',
    bgColor: 'rgba(63,145,66,0.12)',
  },
];

// Dissolve shards for animation
const DISSOLVE_SHARDS = Array.from({ length: 10 }, (_, i) => {
  const angle = (i / 10) * Math.PI * 2;
  const dist = 32 + (i % 3) * 10;
  return {
    id: i,
    dx: Math.cos(angle) * dist,
    dy: Math.sin(angle) * dist,
    rot: (i * 36) % 360,
    size: 5 + (i % 3) * 3,
  };
});

// Sparkles for celebration
const CELEBRATION_STARS = Array.from({ length: 12 }, (_, i) => {
  const angle = (i / 12) * Math.PI * 2;
  const r = 44 + (i % 3) * 12;
  return {
    id: i,
    x: Math.cos(angle) * r,
    y: Math.sin(angle) * r,
    delay: (i * 0.05) % 0.5,
  };
});

// Small male anime-style student: spiky hair, big glossy eyes, school blazer.
const SKIN = '#FFD9B8';
const HAIR = '#1D2A4D';

function StudentCharacter({
  isWalking,
  isCheering,
}: {
  isWalking: boolean;
  isCheering?: boolean;
}) {
  const swing = isWalking ? 0.32 : 0.5;
  const armAnim = (dir: 1 | -1) =>
    isWalking
      ? { rotate: [-28 * dir, 28 * dir, -28 * dir] }
      : isCheering
      ? { rotate: [-125 * dir, -140 * dir, -125 * dir], y: [0, -2, 0] }
      : { rotate: [4 * dir, -4 * dir, 4 * dir] };
  const legAnim = (dir: 1 | -1) =>
    isWalking
      ? { rotate: [24 * dir, -24 * dir, 24 * dir] }
      : isCheering
      ? { rotate: [-5 * dir, 5 * dir, -5 * dir] }
      : { rotate: 0 };
  const loop = { duration: swing, repeat: Infinity, ease: 'easeInOut' as const };

  return (
    <div
      className="relative flex flex-col items-center pointer-events-none select-none scale-[1.5] sm:scale-[1.7]"
      style={{ filter: 'drop-shadow(0 4px 5px rgba(11,23,57,0.28))' }}
    >
      <motion.div
        className="relative flex flex-col items-center"
        animate={
          isWalking
            ? { y: [0, -3, 0] }
            : isCheering
            ? { y: [0, -5, 0] }
            : { y: [0, -1.5, 0] }
        }
        transition={{
          duration: isWalking ? 0.32 : isCheering ? 0.4 : 1.8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        {/* Head */}
        <div className="relative z-20 h-[22px] w-[22px]">
          {/* Spiky anime hair */}
          <div
            className="absolute -top-[9px] -left-[2px] h-[15px] w-[26px]"
            style={{
              background: HAIR,
              clipPath:
                'polygon(0 100%, 2% 45%, 14% 70%, 24% 8%, 38% 58%, 52% 0, 64% 56%, 78% 10%, 88% 62%, 100% 40%, 100% 100%)',
            }}
          />
          {/* Face */}
          <div
            className="absolute inset-0 rounded-[9px] border border-black/5"
            style={{ background: SKIN }}
          />
          {/* Fringe over the forehead */}
          <div
            className="absolute -top-[1px] left-0 h-[7px] w-[22px] rounded-t-[10px]"
            style={{
              background: HAIR,
              clipPath: 'polygon(0 0, 100% 0, 100% 40%, 82% 100%, 66% 45%, 50% 100%, 34% 45%, 18% 100%, 0 40%)',
            }}
          />
          {/* Big glossy eyes */}
          {[4.5, 12.5].map((left) => (
            <span
              key={left}
              className="absolute top-[9px] h-[6px] w-[4.5px] rounded-full bg-ink"
              style={{ left }}
            >
              <span className="absolute top-[0.5px] left-[0.6px] h-[1.8px] w-[1.8px] rounded-full bg-white" />
              <span className="absolute bottom-[0.6px] right-[0.5px] h-[1px] w-[1px] rounded-full bg-sky/80" />
            </span>
          ))}
          {/* Blush + mouth */}
          <span className="absolute top-[16px] left-[2.5px] h-[2px] w-[3.5px] rounded-full bg-rose-300/70" />
          <span className="absolute top-[16px] right-[2.5px] h-[2px] w-[3.5px] rounded-full bg-rose-300/70" />
          <span
            className={`absolute left-1/2 -translate-x-1/2 border-b-[1.2px] border-ink/70 ${
              isCheering ? 'top-[16.5px] h-[3px] w-[5px] rounded-b-full' : 'top-[17.5px] h-[1px] w-[3px] rounded-full'
            }`}
          />
        </div>

        {/* Torso & arms */}
        <div className="relative z-10 -mt-[1px] flex items-start justify-center">
          <motion.div
            className="mt-[1px] -mr-[1px] h-[15px] w-[5px] origin-top rounded-full bg-ink-soft"
            animate={armAnim(1)}
            transition={loop}
          >
            <span className="absolute -bottom-[1px] left-0 h-[4px] w-[5px] rounded-full" style={{ background: SKIN }} />
          </motion.div>

          {/* Blazer with orange tie */}
          <div className="relative h-[19px] w-[17px] rounded-t-[5px] rounded-b-[2px] bg-gradient-to-b from-ink-soft to-ink border border-white/15 flex flex-col items-center">
            <span className="mt-[0.5px] h-[5px] w-[6px] bg-white" style={{ clipPath: 'polygon(0 0, 100% 0, 50% 100%)' }} />
            <span className="-mt-[1px] h-[8px] w-[3px] bg-sun" style={{ clipPath: 'polygon(20% 0, 80% 0, 100% 70%, 50% 100%, 0 70%)' }} />
          </div>

          <motion.div
            className="mt-[1px] -ml-[1px] h-[15px] w-[5px] origin-top rounded-full bg-ink-soft"
            animate={armAnim(-1)}
            transition={loop}
          >
            <span className="absolute -bottom-[1px] left-0 h-[4px] w-[5px] rounded-full" style={{ background: SKIN }} />
          </motion.div>
        </div>

        {/* Legs */}
        <div className="relative z-0 -mt-[1px] flex gap-[1px]">
          {([1, -1] as const).map((dir) => (
            <motion.div
              key={dir}
              className="flex flex-col items-center origin-top"
              animate={legAnim(dir)}
              transition={loop}
            >
              <div className="h-[11px] w-[7px] bg-[#2B3A67]" />
              <div className={`-mt-[1px] h-[3px] w-[9px] rounded-[2px] border border-ink/40 ${dir === 1 ? 'bg-white' : 'bg-sun'}`} />
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Ground shadow */}
      <motion.div
        className="mt-[1px] h-[4px] w-[20px] rounded-full bg-ink/20 blur-[1px]"
        animate={
          isWalking
            ? { scaleX: [0.8, 1.15, 0.8], opacity: [0.3, 0.5, 0.3] }
            : { scaleX: [0.95, 1.05, 0.95], opacity: [0.35, 0.45, 0.35] }
        }
        transition={{ duration: isWalking ? 0.32 : 1.8, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  );
}

export default function LearningEvolution() {
  const [step, setStep] = useState<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Coordinates on stage for each step
  const characterWaypoints = [
    { x: 34, y: 66, walking: true, cheering: false }, // Step 0: Walks to Project
    { x: 34, y: 62, walking: false, cheering: false }, // Step 1: Project dissolves
    { x: 50, y: 44, walking: false, cheering: false }, // Step 2: Internship dissolves immediately
    { x: 50, y: 58, walking: true, cheering: true },  // Step 3: Chooses Workshop path
    { x: 50, y: 52, walking: false, cheering: true },  // Step 4: Reaches Center of WIL Hub!
  ];

  // On phones the pillars stack below the character and the stage scrolls.
  const [narrow, setNarrow] = useState(() => typeof window !== 'undefined' && window.innerWidth < 640);
  useEffect(() => {
    const onResize = () => setNarrow(window.innerWidth < 640);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const currentCoords = step === 4 && narrow ? { x: 50, y: 17, walking: false, cheering: true } : characterWaypoints[step];

  // Hold the loop while the user is scrolling/reading the pillars.
  const stageRef = useRef<HTMLDivElement>(null);
  const pausedUntil = useRef(0);
  const holdLoop = () => {
    pausedUntil.current = Date.now() + 6000;
  };

  useEffect(() => {
    if (step !== 4) stageRef.current?.scrollTo({ top: 0 });
  }, [step]);

  // Auto-play timeline loop
  useEffect(() => {
    const advance = () => {
      const wait = pausedUntil.current - Date.now();
      if (step === 4 && wait > 0) {
        timerRef.current = setTimeout(advance, wait);
        return;
      }
      setStep((prev) => (prev + 1) % 5);
    };
    timerRef.current = setTimeout(advance, STEP_DURATIONS[step]);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [step]);

  return (
    <div className="relative w-full h-full min-h-[500px] lg:min-h-0 rounded-[2rem] bg-white/90 backdrop-blur-md border border-white shadow-lift p-4 sm:p-5 flex flex-col gap-3 overflow-hidden">
      {/* Soft atmospheric glow (no 3d plane graph) */}
      <div className="pointer-events-none absolute -top-12 -right-12 h-64 w-64 rounded-full bg-sun/12 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 -left-8 h-64 w-64 rounded-full bg-sky/12 blur-3xl" />

      {/* Dynamic Header: Emerges with "Workshop-Integrated Learning" when chosen */}
      <div className="relative z-30 min-h-[64px] flex items-center justify-between">
        <AnimatePresence mode="wait">
          {step === 4 ? (
            <motion.div
              key="wil-heading"
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.4 }}
              className="flex items-center justify-between w-full"
            >
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sun/15 text-sun text-xs font-bold tracking-wide uppercase">
                  <Sparkles className="h-3.5 w-3.5 fill-sun text-sun" />
                  The New Standard
                </div>
                <h3 className="font-display font-extrabold text-ink text-2xl sm:text-[1.7rem] leading-tight mt-1">
                  Workshop-Integrated Learning
                </h3>
                <p className="text-[13px] sm:text-sm text-ink-muted leading-snug mt-0.5">
                  Train, build and get hired — inside real workplaces.
                </p>
              </div>
              <span className="hidden xl:inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold shadow-xs shrink-0">
                <Zap className="h-3.5 w-3.5 fill-emerald-600 text-emerald-600" />
                100% Industry Exposure
              </span>
            </motion.div>
          ) : (
            <motion.div
              key="minimal-step"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2"
            >
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-ink/5 text-ink-soft text-sm font-semibold">
                {step === 0 && 'Heading to Project-Based...'}
                {step === 1 && 'Project-Based Dissolves'}
                {step === 2 && 'Internship Dissolves'}
                {step === 3 && 'Choosing Workshop-Integrated Path...'}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Animation Canvas (Pure and clean: No 3D plane graph) */}
      <div
        ref={stageRef}
        onTouchStart={holdLoop}
        onScroll={holdLoop}
        onWheel={holdLoop}
        className="relative flex-1 w-full min-h-0 sm:min-h-[340px] rounded-2xl bg-gradient-to-b from-paper/50 via-cream/40 to-white/80 border border-ink/[0.04] overflow-y-auto overflow-x-hidden sm:overflow-hidden overscroll-contain touch-pan-y flex items-start"
      >
        {/* Connecting Animated Path */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 400 260"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="glowOrange" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#F2822B" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#F2822B" stopOpacity="1" />
            </linearGradient>
            <filter id="pathGlow">
              <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Path to Project */}
          <path
            d="M 136 172 Q 110 140 76 110"
            fill="none"
            stroke="#94A3B8"
            strokeWidth="2.5"
            strokeDasharray="4 4"
            opacity={step >= 0 ? 0.6 : 0.2}
          />

          {/* Path from Project to Internship */}
          <path
            d="M 68 104 Q 120 60 190 52"
            fill="none"
            stroke="#1FB6C9"
            strokeWidth="2.5"
            strokeDasharray="4 4"
            opacity={step >= 2 ? 0.6 : 0.2}
          />

          {/* Path from Internship to Center Workshop */}
          <path
            d="M 200 52 Q 240 95 200 135"
            fill="none"
            stroke={step >= 3 ? '#F2822B' : '#CBD5E1'}
            strokeWidth={step >= 3 ? 3.5 : 2}
            strokeDasharray={step >= 3 ? 'none' : '4 4'}
            filter={step >= 3 ? 'url(#pathGlow)' : 'none'}
            opacity={step >= 3 ? 1 : 0.25}
          />
        </svg>

        {/* --------------------------------------------- */}
        {/* STATION 1: Project-Based Learning (Left) */}
        {/* --------------------------------------------- */}
        <div className="absolute left-[17%] top-[40%] -translate-x-1/2 -translate-y-1/2 z-10">
          <AnimatePresence mode="wait">
            {step === 0 ? (
              <motion.div
                key="project-station"
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.7 }}
                className="flex flex-col items-center"
              >
                <div className="h-20 w-20 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col items-center justify-center p-2 text-slate-700">
                  <FileCode2 className="h-6 w-6 text-slate-500 mb-1" />
                  <span className="text-[11px] font-bold leading-none text-center">
                    Project-Based
                  </span>
                </div>
              </motion.div>
            ) : step === 1 ? (
              // Immediate clean dissolve
              <motion.div key="project-dissolving" className="relative h-20 w-20 flex items-center justify-center">
                {DISSOLVE_SHARDS.map((shard) => (
                  <motion.div
                    key={shard.id}
                    initial={{ x: 0, y: 0, opacity: 0.9, scale: 1 }}
                    animate={{
                      x: shard.dx,
                      y: shard.dy,
                      opacity: 0,
                      scale: 0,
                      rotate: shard.rot,
                    }}
                    transition={{ duration: 0.9, ease: 'easeOut' }}
                    className="absolute bg-slate-400 rounded-xs shadow-2xs"
                    style={{ width: shard.size, height: shard.size }}
                  />
                ))}
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        {/* --------------------------------------------- */}
        {/* STATION 2: Internship-Based Learning (Top-Center) */}
        {/* --------------------------------------------- */}
        <div className="absolute left-[50%] top-[20%] -translate-x-1/2 -translate-y-1/2 z-10">
          <AnimatePresence mode="wait">
            {step < 2 ? (
              <motion.div
                key="internship-station"
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.7 }}
                className="flex flex-col items-center"
              >
                <div className="h-20 w-20 rounded-2xl bg-white border border-sky-200 shadow-sm flex flex-col items-center justify-center p-2 text-sky-800">
                  <Briefcase className="h-6 w-6 text-sky-600 mb-1" />
                  <span className="text-[11px] font-bold leading-none text-center">
                    Internship
                  </span>
                </div>
              </motion.div>
            ) : step === 2 ? (
              // Fast clean dissolve without lingering
              <motion.div key="internship-dissolving" className="relative h-20 w-20 flex items-center justify-center">
                {DISSOLVE_SHARDS.map((shard) => (
                  <motion.div
                    key={shard.id}
                    initial={{ x: 0, y: 0, opacity: 0.9, scale: 1 }}
                    animate={{
                      x: shard.dx,
                      y: shard.dy,
                      opacity: 0,
                      scale: 0,
                      rotate: shard.rot,
                    }}
                    transition={{ duration: 0.9, ease: 'easeOut' }}
                    className="absolute bg-sky-400 rounded-xs shadow-2xs"
                    style={{ width: shard.size, height: shard.size }}
                  />
                ))}
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        {/* --------------------------------------------- */}
        {/* STATION 3: Workshop-Integrated — 4 detailed pillars around the student */}
        {/* --------------------------------------------- */}
        <AnimatePresence>
          {step === 4 && (
            <motion.div
              key="wil-centerpiece"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="relative w-full min-h-full z-20 p-3 pt-1 sm:absolute sm:inset-0 sm:p-4 grid grid-cols-2 gap-2.5 sm:grid-cols-[1fr_120px_1fr] sm:grid-rows-2 sm:gap-x-1 sm:gap-y-3 content-start"
            >
              {/* Halo + celebration stars around the student (centre column) */}
              <div className="col-span-2 h-[128px] sm:h-auto sm:col-span-1 sm:col-start-2 sm:row-span-2 sm:row-start-1 relative pointer-events-none">
                <motion.div
                  className="absolute left-1/2 top-1/2 h-28 w-28 sm:h-32 sm:w-32 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-dashed border-sun/40"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
                />
                <span className="absolute left-1/2 top-[8%] -translate-x-1/2 inline-flex items-center gap-1 rounded-full bg-ink text-cream text-[10px] font-bold px-2.5 py-1 uppercase tracking-wide whitespace-nowrap">
                  <Zap className="h-3 w-3 text-sun fill-sun" /> WIL
                </span>
                {CELEBRATION_STARS.map((star) => (
                  <motion.div
                    key={star.id}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{
                      opacity: [0, 1, 0],
                      scale: [0.2, 1, 0],
                      x: [0, star.x],
                      y: [0, star.y],
                    }}
                    transition={{
                      duration: 1.4,
                      repeat: Infinity,
                      delay: star.delay,
                      ease: 'easeOut',
                    }}
                    className="absolute left-1/2 top-1/2 h-2 w-2 rounded-full bg-sun"
                  />
                ))}
              </div>

              {WIL_FEATURES.map((feat, idx) => {
                const col = idx % 2 === 0 ? 'sm:col-start-1' : 'sm:col-start-3';
                const row = idx < 2 ? 'sm:row-start-1' : 'sm:row-start-2';
                return (
                  <motion.div
                    key={feat.title}
                    initial={{ opacity: 0, scale: 0.85, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: 0.1 + idx * 0.1, duration: 0.4 }}
                    className={`${col} ${row} rounded-2xl p-3 sm:p-3.5 bg-white/95 backdrop-blur-md border shadow-soft flex flex-col`}
                    style={{ borderColor: feat.color + '40' }}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl flex items-center justify-center shrink-0"
                        style={{ backgroundColor: feat.bgColor }}
                      >
                        <feat.icon className="h-4.5 w-4.5 sm:h-5 sm:w-5" style={{ color: feat.color }} />
                      </span>
                      <div className="min-w-0">
                        <span className="font-display font-bold text-sm sm:text-base text-ink leading-tight block">
                          {feat.title}
                        </span>
                        <span
                          className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wide block leading-tight"
                          style={{ color: feat.color }}
                        >
                          {feat.badge}
                        </span>
                      </div>
                    </div>
                    <p className="mt-2 text-xs sm:text-[13px] text-ink-muted leading-snug">
                      {feat.detail}
                    </p>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* --------------------------------------------- */}
        {/* THE WALKING 3D STUDENT CHARACTER */}
        {/* --------------------------------------------- */}
        <motion.div
          className="absolute z-40 -translate-x-1/2 -translate-y-1/2"
          animate={{
            left: `${currentCoords.x}%`,
            top: `${currentCoords.y}%`,
          }}
          transition={{
            duration: step === 0 ? 1.5 : step === 3 ? 1.0 : 0.5,
            ease: [0.25, 0.1, 0.25, 1],
          }}
        >
          <StudentCharacter
            isWalking={currentCoords.walking}
            isCheering={currentCoords.cheering}
          />
        </motion.div>
      </div>
    </div>
  );
}
