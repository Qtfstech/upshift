import { ShieldCheck, Video } from 'lucide-react';
import { Reveal } from '../../components/Reveal';
import { RECOGNITIONS, FEATURES } from '../data';

const ICONS = [Video, ShieldCheck];

export default function FeaturesBand() {
  return (
    <section className="relative py-16 border-y border-ink/5 bg-white/60">
      <div className="container-px">
        <Reveal className="grid sm:grid-cols-2 max-w-xl mx-auto gap-6 text-center sm:text-left">
          {FEATURES.map((f, i) => {
            const Icon = ICONS[i];
            return (
              <div key={f} className="flex flex-col sm:flex-row items-center sm:items-start gap-3">
                <span className="h-10 w-10 shrink-0 rounded-xl bg-sun/10 flex items-center justify-center">
                  <Icon className="h-5 w-5 text-sun" />
                </span>
                <p className="font-display font-semibold text-sm text-ink-soft">{f}</p>
              </div>
            );
          })}
        </Reveal>

        <Reveal delay={0.1} className="mt-10 flex flex-wrap items-center justify-center gap-x-10 gap-y-3">
          {RECOGNITIONS.map((r) => (
            <span key={r} className="font-display font-semibold text-sm tracking-wide text-ink-muted/60">
              {r}
            </span>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
