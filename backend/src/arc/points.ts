import {prisma} from '../db.ts';

/**
 * Arc Points, worked out from the tables each time (no stored totals to drift):
 *  - every valid entry: 1 (valid = not excluded by an admin)
 *  - daily Top 10: +5, daily winner: +10 (published results only)
 *  - every 5 valid entries in a row (consecutive days): +5
 */
export const POINTS = {entry: 1, top10: 5, winner: 10, streak5: 5};

export interface UserPoints {
  userId: number;
  points: number;
  entries: number;
  /** Consecutive valid days ending on the most recent day entered */
  streak: number;
}

export async function computePoints(now = new Date(), userId?: number) {
  const [entries, results] = await Promise.all([
    prisma.arcEntry.findMany({
      where: {OR: [{adminDecision: null}, {adminDecision: 'include'}], ...(userId ? {userId} : {})},
      select: {userId: true, day: true},
    }),
    prisma.arcResult.findMany({
      where: {visibleFrom: {lte: now}, ...(userId ? {entry: {userId}} : {})},
      select: {rank: true, entry: {select: {userId: true}}},
    }),
  ]);

  const days = new Map<number, number[]>();
  for (const e of entries) days.set(e.userId, [...(days.get(e.userId) ?? []), e.day]);

  const totals = new Map<number, UserPoints>();
  for (const [uid, list] of days) {
    const sorted = [...new Set(list)].sort((a, b) => a - b);
    let points = sorted.length * POINTS.entry;
    let run = 0;
    let prev = -1;
    for (const d of sorted) {
      run = d === prev + 1 ? run + 1 : 1;
      if (run % 5 === 0) points += POINTS.streak5;
      prev = d;
    }
    totals.set(uid, {userId: uid, points, entries: sorted.length, streak: run});
  }
  for (const r of results) {
    const t = totals.get(r.entry.userId);
    if (t) t.points += r.rank === 1 ? POINTS.top10 + POINTS.winner : POINTS.top10;
  }
  return totals;
}
