import { Reveal, Stagger, StaggerItem } from '../../components/Reveal';
import CountUp from '../../components/CountUp';
import { STATS } from '../data';

export default function StatsSection() {
  return (
    <section className="relative py-20 lg:py-24">
      <div className="container-px">
        <Stagger className="grid grid-cols-2 lg:grid-cols-4 gap-5" staggerChildren={0.08}>
          {STATS.map((s) => (
            <StaggerItem key={s.label}>
              <div className="h-full rounded-3xl bg-white border border-ink/5 shadow-card p-6 sm:p-7 hover:shadow-lift hover:-translate-y-1 transition-all duration-400">
                <div className="font-display font-bold text-3xl sm:text-4xl text-sun">
                  <CountUp to={s.to} prefix={s.prefix} suffix={s.suffix} decimals={s.decimals} />
                </div>
                <p className="mt-3 text-sm text-ink-muted leading-relaxed">{s.label}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
        <Reveal delay={0.1} className="mt-3 text-center text-xs text-ink-muted/70">
          Figures shown are placeholders — replace with verified numbers before this page goes live.
        </Reveal>
      </div>
    </section>
  );
}
