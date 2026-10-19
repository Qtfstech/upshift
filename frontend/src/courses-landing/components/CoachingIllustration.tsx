import { motion } from 'framer-motion';
import { GraduationCap, BookOpen, Play, Radio } from 'lucide-react';

const AVATARS = [
  { initial: 'A', color: '#E85D25' },
  { initial: 'P', color: '#F5A623' },
  { initial: 'R', color: '#C1391C' },
  { initial: 'K', color: '#4C9A2A' },
];

export default function CoachingIllustration() {
  return (
    <div className="relative h-[440px] sm:h-[480px] w-full">
      <div className="pointer-events-none absolute -top-6 -left-4 h-14 w-14 rounded-2xl bg-white shadow-card flex items-center justify-center animate-float">
        <GraduationCap className="h-6 w-6 text-sun" />
      </div>
      <div className="pointer-events-none absolute top-10 -right-3 h-12 w-12 rounded-2xl bg-white shadow-card flex items-center justify-center animate-floatSlow">
        <BookOpen className="h-5 w-5 text-ink-soft" />
      </div>

      {/* Illustrated "photo card" standing in for a real classroom image */}
      <div className="relative mx-auto h-full max-w-sm rounded-[2.5rem] overflow-hidden shadow-lift">
        <div className="absolute inset-0 bg-gradient-to-br from-sun via-sun to-violet" />
        <div className="absolute -top-16 -right-16 h-56 w-56 rounded-full bg-white/10" />
        <div className="absolute -bottom-20 -left-14 h-64 w-64 rounded-full bg-white/10" />
        <div className="absolute inset-0 bg-noise opacity-30" />

        <div className="relative h-full flex flex-col items-center justify-center px-8 text-center">
          <span className="absolute top-6 left-6 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 shadow-card">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
            </span>
            <span className="text-[11px] font-bold uppercase tracking-wide text-ink">Live</span>
          </span>

          <motion.div
            className="relative"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <div className="h-40 w-56 rounded-2xl bg-white shadow-2xl p-3.5 flex flex-col">
              <div className="flex items-center gap-1.5 px-0.5">
                <span className="h-2 w-2 rounded-full bg-sun" />
                <span className="h-2 w-2 rounded-full bg-sky" />
                <span className="h-2 w-2 rounded-full bg-leaf" />
              </div>
              <div className="mt-2 flex-1 rounded-xl bg-paper flex items-center justify-center">
                <span className="h-11 w-11 rounded-full bg-sun/15 flex items-center justify-center">
                  <Play className="h-5 w-5 text-sun ml-0.5" fill="currentColor" />
                </span>
              </div>
            </div>

            <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 flex -space-x-3">
              {AVATARS.map((a, i) => (
                <span
                  key={i}
                  className="h-9 w-9 rounded-full ring-2 ring-white flex items-center justify-center font-display font-bold text-xs text-white shadow-card"
                  style={{ backgroundColor: a.color }}
                >
                  {a.initial}
                </span>
              ))}
            </div>
          </motion.div>

          <p className="mt-9 font-display font-bold text-lg text-white">Live, Face-to-Face Coaching</p>
          <p className="mt-1.5 text-sm text-white/85 max-w-[15rem]">
            Small batches. Real mentors. Real careers.
          </p>

          <span className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold text-white">
            <Radio className="h-3.5 w-3.5" />
            32 learners in this session
          </span>
        </div>
      </div>
    </div>
  );
}
