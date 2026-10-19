import { Flame, Loader2, Star } from 'lucide-react';
import { istDate, istTime, type ArcMe, type ArcState } from '../arc/api';
import IdeaSubmitForm from './IdeaSubmitForm';

/**
 * Right-hand card on the Winter Arc page: the challenge header and the submit form (mobile check, name, idea, file).
 * The form is always there, even before the challenge starts (those entries count for Day 1), until Day 20 ends.
 */

const shell = 'rounded-3xl bg-white/95 backdrop-blur border border-ink/5 shadow-lift p-5 sm:p-6 text-left';

export default function ArcEntryCard({ state, me, onSubmitted }: { state: ArcState | null; me: ArcMe | null; onSubmitted: () => void }) {
  if (state?.phase === 'ended') {
    return (
      <div className={`${shell} flex flex-col items-center text-center gap-3 py-12`}>
        <div className="h-14 w-14 rounded-2xl bg-sun/10 text-sun flex items-center justify-center">
          <Star className="h-7 w-7" />
        </div>
        <h3 className="font-display font-bold text-2xl text-ink">Winter Arc has ended</h3>
        <p className="text-ink-muted max-w-md">Thank you for every idea. Check the Winner Board below for the results.</p>
      </div>
    );
  }

  // What the header says depends on where the challenge is today
  const t = state?.today;
  const n = state?.next;
  const pill = t ? `Day ${t.day} of ${state!.days} · ${t.category}` : n ? `Day ${n.day} · ${n.category}` : 'Winter Arc · AI Idea Challenge';
  const heading = t ? (t.prompt ?? t.topic ?? `Today's ${t.category} challenge`) : 'Submit your AI idea';
  const sub = t
    ? 'Closes tonight at 11:59 PM IST.'
    : n
      ? `Day ${n.day}'s prompt goes live ${istDate(n.opensAt)}, ${istTime(n.opensAt)} IST. You can send your idea now.`
      : 'The challenge starts soon. You can send your idea now.';

  return (
    <div className={shell}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-sun/10 px-2.5 py-0.5 text-xs font-bold text-sun">
          {!state && <Loader2 className="h-3 w-3 animate-spin" />}
          {pill}
        </span>
        {me && (
          <span className="flex items-center gap-1.5 text-xs font-semibold text-ink-soft">
            <span className="inline-flex items-center gap-1 rounded-full bg-paper px-2.5 py-0.5" title="Days in a row">
              <Flame className="h-3.5 w-3.5 text-sun" /> {me.streak} streak
            </span>
            <span className="rounded-full bg-paper px-2.5 py-0.5">{me.points} Arc Points</span>
          </span>
        )}
      </div>
      <h3 className="mt-1.5 font-display font-bold text-xl text-ink leading-snug">{heading}</h3>
      <p className="mt-0.5 text-sm text-ink-muted">{sub}</p>
      <div className="mt-4 border-t border-ink/5 pt-4">
        <IdeaSubmitForm me={me} onSubmitted={onSubmitted} />
      </div>
    </div>
  );
}
