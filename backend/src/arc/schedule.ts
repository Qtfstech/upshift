import {prisma} from '../db.ts';

/** Winter Arc: 20 days. Each day's prompt goes live at 9:00 AM IST and entries close at 11:59 PM IST the same day. */
export const ARC_DAYS = 20;

/** Upshift India's five learning areas, four days each in this order. `className` is the free class we suggest after an entry. */
export const CATEGORIES = [
  {key: 'robotics', name: 'Robotics', className: 'Robotics class'},
  {key: 'cybersecurity', name: 'Cybersecurity', className: 'Cybersecurity class'},
  {key: 'embedded', name: 'Embedded Systems', className: 'Embedded Systems class'},
  {key: 'agentic', name: 'FDE and Agentic AI', className: 'FDE and Agentic AI class'},
  {key: 'content', name: 'AI-Powered Content Creation', className: 'AI Content Creation class'},
] as const;
export const DAYS_PER_CATEGORY = ARC_DAYS / CATEGORIES.length;
export const categoryOf = (day: number) => CATEGORIES[Math.min(CATEGORIES.length - 1, Math.floor((day - 1) / DAYS_PER_CATEGORY))];

export interface DayConfig {
  day: number;
  category: string;
  /** Set by the team in the dashboard; null until then */
  topic: string | null;
  prompt: string | null;
  prize: {name: string; description: string | null; imageUrl: string | null; confirmed: boolean} | null;
  /** The evening Zoom discussion: shown only to invited participants */
  zoomTime: string | null;
  zoomLink: string | null;
}

/** All 20 days with the team's settings (topic, prompt, prize) from arc_days. */
export async function loadDays(): Promise<DayConfig[]> {
  const rows = await prisma.arcDay.findMany();
  return Array.from({length: ARC_DAYS}, (_, i) => {
    const day = i + 1;
    const r = rows.find((x) => x.day === day);
    return {
      day,
      category: categoryOf(day).name,
      topic: r?.topic || null,
      prompt: r?.prompt || null,
      prize: r?.prizeName ? {name: r.prizeName, description: r.prizeDescription || null, imageUrl: r.prizeImageUrl || null, confirmed: r.prizeConfirmed} : null,
      zoomTime: r?.zoomTime || null,
      zoomLink: r?.zoomLink || null,
    };
  });
}

/** The prize as the public sees it: only once the team has confirmed it. */
export const publicPrize = (d: DayConfig) => (d.prize?.confirmed ? {name: d.prize.name, description: d.prize.description, imageUrl: d.prize.imageUrl} : null);

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;
const OPEN_HOUR = 9; // 9:00 AM IST
const WINNER_HOUR = 18; // 6:00 PM IST, the day after

/** UTC instant of a given IST wall-clock time on a calendar date (yyyy-mm-dd). */
const istInstant = (date: string, hour: number, minute = 0, second = 0, ms = 0) =>
  new Date(Date.parse(`${date}T00:00:00Z`) - IST_OFFSET_MS + ((hour * 60 + minute) * 60 + second) * 1000 + ms);

/** The calendar date (yyyy-mm-dd) in IST for an instant. */
const istDate = (t: Date) => new Date(t.getTime() + IST_OFFSET_MS).toISOString().slice(0, 10);

const addDays = (date: string, n: number) => new Date(Date.parse(`${date}T00:00:00Z`) + n * DAY_MS).toISOString().slice(0, 10);

/**
 * Day 1's IST calendar date, set by the admin with Start / Stop on the dashboard's Winter Arc page (arc_settings
 * "startDate"). Kept in memory so the schedule stays synchronous: loaded at boot, replaced on every Start / Stop.
 * null = stopped: the site says "Challenge starts soon" and entries count for Day 1.
 */
let start: string | null = null;
export const startDate = () => start;

export async function loadStartDate() {
  const row = await prisma.arcSetting.findUnique({where: {key: 'startDate'}});
  start = row?.value || null;
}

export async function setStartDate(date: string | null) {
  await prisma.arcSetting.upsert({where: {key: 'startDate'}, create: {key: 'startDate', value: date ?? ''}, update: {value: date ?? ''}});
  start = date;
}

/** Today's IST calendar date (yyyy-mm-dd). */
export const istToday = (now = new Date()) => istDate(now);

/** Calendar date (IST) of a challenge day. */
export const dateOfDay = (day: number) => addDays(startDate()!, day - 1);
export const opensAt = (day: number) => istInstant(dateOfDay(day), OPEN_HOUR);
/** Entries lock after 11:59:59.999 PM IST on the same day. */
export const closesAt = (day: number) => istInstant(dateOfDay(day), 23, 59, 59, 999);
export const winnerAt = (day: number) => istInstant(addDays(dateOfDay(day), 1), WINNER_HOUR);

/**
 * Where the challenge is right now, by server time.
 *  - "not_set": no start date configured yet
 *  - "upcoming": before Day 1 opens
 *  - "open": day `day` is live and taking entries
 *  - "between": the calendar day is `day` but it opens at 9:00 AM (entries for day-1 are closed)
 *  - "ended": after Day 20 closed
 */
export function currentState(now = new Date()) {
  if (!startDate()) return {phase: 'not_set' as const, day: null};
  if (now < opensAt(1)) return {phase: 'upcoming' as const, day: 1};
  const calendarDay = Math.floor((Date.parse(`${istDate(now)}T00:00:00Z`) - Date.parse(`${startDate()}T00:00:00Z`)) / DAY_MS) + 1;
  if (calendarDay > ARC_DAYS) return {phase: 'ended' as const, day: ARC_DAYS};
  if (now < opensAt(calendarDay)) return {phase: 'between' as const, day: calendarDay};
  return {phase: 'open' as const, day: calendarDay};
}

/**
 * Days whose prompt is public. Each day's theme and prompt are announced the day before, so people can plan:
 * before the start, Day 1 is out; on day d, days 1 to d+1 are out.
 */
export const releasedDays = (now = new Date()) => {
  const s = currentState(now);
  if (s.phase === 'not_set' || s.phase === 'upcoming') return 1;
  if (s.phase === 'ended') return ARC_DAYS;
  return Math.min(ARC_DAYS, s.day + 1);
};

export const entryCode = (day: number) => `WA-D${String(day).padStart(2, '0')}-${String(Math.floor(Math.random() * 100000)).padStart(5, '0')}`;
