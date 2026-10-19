import { Crown, Gift, Medal, Trophy } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Reveal } from '../../components/Reveal';
import SectionTag from '../../components/SectionTag';
import { arcApi, istTime, type ArcPrize, type ArcState } from '../arc/api';

interface Board {
  day: number | null;
  category: string | null;
  /** Only once the team has confirmed the day's prize */
  prize: ArcPrize | null;
  top10: { rank: number; title: string | null; firstName: string | null; college: string | null; points: number }[];
  leaderboard: { rank: number; points: number; entries: number; firstName: string | null; college: string | null }[];
}

const card = 'rounded-2xl bg-white border border-ink/5 shadow-card';
/** People who didn't tick "publish" are listed without their name, college or title. */
const hidden = <span className="italic text-ink-muted">Name not shown</span>;

/** Yesterday's winner, the latest Top 10 and the Arc Points table (top 20). */
export default function WinnerBoard({ state }: { state: ArcState | null }) {
  const [board, setBoard] = useState<Board | null>(null);
  useEffect(() => {
    arcApi<Board>('/arc/board')
      .then(setBoard)
      .catch(() => {});
  }, [state?.day, state?.announce?.day]);

  const winner = board?.top10.find((r) => r.rank === 1);

  return (
    <section id="board" className="py-20 scroll-mt-24">
      <div className="container-px">
        <div className="text-center max-w-2xl mx-auto">
          <Reveal>
            <SectionTag label="Winner Board" />
          </Reveal>
          <Reveal delay={0.06}>
            <h2 className="mt-4 font-display font-bold text-3xl sm:text-4xl tracking-tight text-ink">Winners and Arc Points</h2>
          </Reveal>
          {state?.announce && (
            <Reveal delay={0.1}>
              <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-sun/10 px-4 py-1.5 text-sm font-semibold text-sun">
                Day {state.announce.day} winner announced today at {istTime(state.announce.at)}
              </p>
            </Reveal>
          )}
        </div>

        {!board ? (
          <p className="mt-10 text-center text-sm text-ink-muted">Loading the board…</p>
        ) : (
          <div className="mt-10 grid lg:grid-cols-[1.1fr_0.9fr] gap-5 items-start">
            <Reveal>
              <div className="flex flex-col gap-5">
                <div className="relative overflow-hidden rounded-3xl bg-ink text-cream p-7">
                  <div className="pointer-events-none absolute -top-16 -right-10 h-56 w-56 rounded-full bg-sun/30 blur-3xl" />
                  {winner ? (
                    <div className="relative">
                      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-sun-light">
                        <Crown className="h-4 w-4" /> Day {board.day} winner · {board.category}
                      </p>
                      <p className="mt-3 font-display font-bold text-2xl sm:text-3xl leading-snug">{winner.title ?? 'Winner chose not to be shown'}</p>
                      {winner.firstName && (
                        <p className="mt-2 text-cream/75">
                          {winner.firstName}
                          {winner.college && ` · ${winner.college}`}
                        </p>
                      )}
                      <div className="mt-4 flex flex-wrap gap-2 text-sm">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1">
                          <Gift className="h-4 w-4 text-sun-light" /> Prize: {board.prize?.name ?? 'Daily prize'}
                        </span>
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1">
                          <Medal className="h-4 w-4 text-sun-light" /> {winner.points} Arc Points
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="relative">
                      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-sun-light">
                        <Trophy className="h-4 w-4" /> Daily winner
                      </p>
                      <p className="mt-3 font-display font-bold text-2xl">The first winner appears here at 6:00 PM the day after Day 1.</p>
                    </div>
                  )}
                </div>

                {board.top10.length > 0 && (
                  <div className={`${card} p-5`}>
                    <h3 className="font-display font-bold text-lg text-ink">
                      Day {board.day} · {board.category} · Top 10
                    </h3>
                    <ol className="mt-3 divide-y divide-ink/5">
                      {board.top10.map((r) => (
                        <li key={r.rank} className="flex items-start gap-3 py-2.5 text-sm">
                          <span className={`w-6 shrink-0 font-display font-bold ${r.rank === 1 ? 'text-sun' : 'text-ink-muted'}`}>{r.rank}</span>
                          <span className="min-w-0 flex-1">
                            <span className="block font-semibold text-ink">{r.title ?? hidden}</span>
                            {r.firstName && (
                              <span className="text-xs text-ink-muted">
                                {r.firstName}
                                {r.college && ` · ${r.college}`}
                              </span>
                            )}
                          </span>
                          <span className="shrink-0 text-xs font-semibold text-sun">{r.points} pts</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            </Reveal>

            <Reveal delay={0.08}>
              <div className={`${card} p-5`}>
                <h3 className="flex items-center gap-2 font-display font-bold text-lg text-ink">
                  <Medal className="h-5 w-5 text-sun" /> Arc Points · Top 20
                </h3>
                {board.leaderboard.length === 0 ? (
                  <p className="mt-3 text-sm text-ink-muted">No points yet — the table fills up as entries come in.</p>
                ) : (
                  <table className="mt-3 w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs uppercase tracking-wider text-ink-muted">
                        <th className="py-2 w-8">#</th>
                        <th className="py-2">Builder</th>
                        <th className="py-2 text-right">Points</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-ink/5">
                      {board.leaderboard.map((r) => (
                        <tr key={r.rank}>
                          <td className="py-2 font-display font-bold text-ink-muted">{r.rank}</td>
                          <td className="py-2">
                            {r.firstName ? (
                              <>
                                <span className="font-semibold text-ink">{r.firstName}</span> {r.college && <span className="text-xs text-ink-muted">· {r.college}</span>}
                              </>
                            ) : (
                              hidden
                            )}
                          </td>
                          <td className="py-2 text-right font-display font-bold text-sun">{r.points}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </Reveal>
          </div>
        )}
      </div>
    </section>
  );
}
