import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserCog, School, ArrowRight } from 'lucide-react';

export default function TrainTrainerBadge() {
  const [open, setOpen] = useState(false);

  // Focus mode: blur + dim the rest of the site while the panel is open.
  useEffect(() => {
    document.documentElement.classList.toggle('trainer-focus', open);
    return () => document.documentElement.classList.remove('trainer-focus');
  }, [open]);

  const goToProducts = () => {
    setOpen(false);
    document.querySelector('#products')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div
      className="absolute -top-11 right-6 z-20 hidden lg:block"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <motion.button
        onClick={() => setOpen((v) => !v)}
        initial={{ y: -14, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="rounded-full bg-ink text-cream text-xs font-semibold px-4 py-2 shadow-lift hover:bg-ink-soft transition-colors duration-300 whitespace-nowrap cursor-pointer"
      >
        Train the Trainer
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.96 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="absolute top-full right-0 mt-3 w-80 rounded-2xl bg-white border border-ink/5 shadow-lift overflow-hidden"
          >
            {/* pointer */}
            <span className="absolute -top-1.5 right-8 h-3 w-3 rotate-45 bg-white border-l border-t border-ink/5" />

            <div className="bg-gradient-to-r from-sun/10 via-violet/10 to-sky/10 px-6 py-5">
              <p className="font-display font-bold text-lg text-ink">Train the Trainer</p>
              <p className="mt-1.5 text-sm text-ink-muted leading-relaxed">
                We upskill your own trainers in AI and modern tech — so they become the
                experts your learners need.
              </p>
            </div>

            <div className="px-6 py-5 space-y-4">
              <div className="flex items-start gap-3">
                <span className="h-9 w-9 rounded-xl bg-sun/10 flex items-center justify-center shrink-0">
                  <UserCog className="h-4.5 w-4.5 text-sun" />
                </span>
                <div>
                  <p className="font-semibold text-sm text-ink">Faculty Upskilling</p>
                  <p className="text-xs text-ink-muted mt-0.5">
                    For engineering colleges — close the gap between classroom and industry.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="h-9 w-9 rounded-xl bg-sky/10 flex items-center justify-center shrink-0">
                  <School className="h-4.5 w-4.5 text-sky" />
                </span>
                <div>
                  <p className="font-semibold text-sm text-ink">Schools</p>
                  <p className="text-xs text-ink-muted mt-0.5">
                    Train your own teachers to deliver robotics & AI curriculum in-house.
                  </p>
                </div>
              </div>

              <button
                onClick={goToProducts}
                className="group inline-flex items-center gap-1.5 text-sm font-semibold text-sun cursor-pointer hover:underline"
              >
                See all programs
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
