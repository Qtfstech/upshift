import {Router, type NextFunction, type Request, type Response} from 'express';
import {z} from 'zod';
import {accountFromRequest, logLogin, signSession} from '../account/session.ts';
import {HttpError} from '../auth.ts';
import {contentHash, hasLink, plain, shingles, similarity, textFlags} from '../arc/flags.ts';
import {computePoints} from '../arc/points.ts';
import {arcUpload, removeArcFile} from '../arc/upload.ts';
import {ARC_DAYS, categoryOf, closesAt, currentState, dateOfDay, entryCode, loadDays, opensAt, publicPrize, releasedDays, startDate, winnerAt, type DayConfig} from '../arc/schedule.ts';
import {prisma} from '../db.ts';
import {env} from '../env.ts';
import {phoneFromToken} from '../otp.ts';

/** Winter Arc · AI Idea Challenge — public and participant API. */
export const arcRouter = Router();

const PAGE_VERSION = 'wa-2026-10';
/** The exact text next to each box. Stored with every consent record. */
export const CONSENT_LABELS = {
  age: 'I am 18 years or older.',
  terms:
    'I agree to the Contest Terms and the Privacy Policy. Upshift uses my details to run the challenge, and my entry text is reviewed with AI tools and then by people.',
  publish: 'Show my first name, college and idea title on the Winner Board if I win or reach the Top 10.',
  class_updates: 'Send me updates about Upshift classes by WhatsApp. I can turn this off any time.',
} as const;
type Box = keyof typeof CONSENT_LABELS;

// ---- Participant session: the site-wide login (a 30-day token issued after OTP) ----
interface ArcRequest extends Request {
  arcUserId?: number;
}
async function arcAuth(req: ArcRequest, _res: Response, next: NextFunction) {
  const id = await accountFromRequest(req);
  if (!id) throw new HttpError(401, 'Please sign in with your mobile number.');
  req.arcUserId = id;
  next();
}

const firstName = (name: string) => name.trim().split(/\s+/)[0];

// ---- Simple per-key limits (in memory) ----
const HOUR = 60 * 60 * 1000;
const hits = new Map<string, number[]>();
function limit(key: string, max: number, message: string) {
  const now = Date.now();
  const list = (hits.get(key) ?? []).filter((t) => now - t < HOUR);
  if (list.length >= max) throw new HttpError(429, message);
  list.push(now);
  hits.set(key, list);
}

// ---------------------------------------------------------------- schedule

/**
 * Where the challenge is today, the 20 days (category always; topic and prompt only once announced), the prize for the
 * day people are entering now (only once the team has confirmed it), and whether a winner is due today.
 */
arcRouter.get('/state', async (_req, res) => {
  const now = new Date();
  const state = currentState(now);
  const released = releasedDays(now);
  const days = await loadDays();
  const pub = (d: DayConfig) => ({day: d.day, category: d.category, topic: d.day <= released ? d.topic : null, prompt: d.day <= released ? d.prompt : null});
  const themes = days.map(pub);
  // Today's challenge (its prompt was announced yesterday, so it's shown before 9:00 AM too)
  const today =
    state.phase === 'open' || state.phase === 'between'
      ? {...pub(days[state.day - 1]), opensAt: opensAt(state.day), closesAt: closesAt(state.day)}
      : null;
  // The next theme, announced a day ahead: tomorrow's during the challenge, Day 1 before it starts
  const upNextDay = state.phase === 'open' || state.phase === 'between' ? state.day + 1 : state.phase === 'ended' ? null : 1;
  const upNext =
    upNextDay && upNextDay <= ARC_DAYS
      ? {...pub(days[upNextDay - 1]), date: startDate() ? dateOfDay(upNextDay) : null, closesAt: startDate() ? closesAt(upNextDay) : null}
      : null;
  const next =
    state.phase === 'upcoming' || state.phase === 'between'
      ? {day: state.day, category: days[state.day - 1].category, opensAt: opensAt(state.day)}
      : null;
  const subDay = submissionDay(now);
  const confirmed = subDay ? publicPrize(days[subDay - 1]) : null;
  const prize = confirmed ? {day: subDay, ...confirmed} : null;

  // "Winner announced at 6:00 PM" only on the day it's true: yesterday closed, results not out yet
  let announce: {day: number; at: Date} | null = null;
  if (startDate() && released >= 1) {
    const lastClosed = state.phase === 'open' ? state.day - 1 : state.phase === 'between' ? state.day - 1 : ARC_DAYS;
    if (lastClosed >= 1 && now < winnerAt(lastClosed) && now > closesAt(lastClosed)) announce = {day: lastClosed, at: winnerAt(lastClosed)};
  }
  res.json({phase: state.phase, day: state.day, startDate: startDate(), days: ARC_DAYS, today, next, upNext, prize, announce, themes});
});

// ---------------------------------------------------------------- sign-in and registration

/** After OTP: signs in an existing participant, or says registration is needed. */
arcRouter.post('/session', async (req, res) => {
  const phone = phoneFromToken(z.object({phoneToken: z.string()}).parse(req.body).phoneToken);
  const user = await prisma.arcUser.findUnique({where: {phone}, select: {id: true}});
  if (!user) return res.json({registered: false});
  await logLogin(user.id, 'login', 'idea-challenge', req);
  res.json({registered: true, token: signSession(user.id)});
});

const UTM = z.string().trim().max(120).optional().transform((s) => s || null);
const registerBody = z.object({
  phoneToken: z.string(),
  name: z.string().trim().min(2, 'Name needs at least 2 characters.').max(60, 'Name can be at most 60 characters.'),
  collegeCity: z.string().trim().min(2, 'Enter your college and city.').max(191),
  year: z.string().trim().min(1, 'Pick your year.').max(40),
  branch: z.string().trim().min(1, 'Pick your branch.').max(60),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .max(191)
    .optional()
    .transform((s) => s || null)
    .pipe(z.string().email('Enter a valid email address.').nullable()),
  heardFrom: z.string().trim().max(60).optional().transform((s) => s || null),
  utmSource: UTM,
  utmMedium: UTM,
  utmCampaign: UTM,
  /** The terms box is off the form for now (no terms page yet); it's recorded only if sent */
  consents: z.object({age: z.boolean(), terms: z.boolean().optional(), publish: z.boolean(), class_updates: z.boolean()}),
});

arcRouter.post('/register', async (req, res) => {
  // Age gate first: if it isn't ticked, nothing else is read or stored
  if (req.body?.consents?.age !== true) throw new HttpError(400, 'Winter Arc is for learners aged 18 and over.');
  const body = registerBody.parse(req.body);
  const phone = phoneFromToken(body.phoneToken);
  limit(`reg:${req.ip}`, 10, 'Too many sign-ups from this network. Please try again in an hour.');

  if (await prisma.arcUser.findUnique({where: {phone}, select: {id: true}})) throw new HttpError(409, 'This mobile number is already registered. Sign in instead.');
  const {phoneToken: _, consents, ...fields} = body;
  const user = await prisma.arcUser.create({
    data: {
      ...fields,
      phone,
      publishOk: consents.publish,
      classUpdatesOk: consents.class_updates,
      // Record only the boxes that were on the form
      consents: {
        create: (Object.keys(CONSENT_LABELS) as Box[])
          .filter((box) => consents[box] !== undefined)
          .map((box) => ({box, ticked: consents[box]!, label: CONSENT_LABELS[box], pageVersion: PAGE_VERSION})),
      },
    },
  });
  await logLogin(user.id, 'login', 'idea-challenge', req);
  res.status(201).json({registered: true, token: signSession(user.id)});
});

// ---------------------------------------------------------------- the participant's own data

arcRouter.get('/me', arcAuth, async (req: ArcRequest, res) => {
  const now = new Date();
  const [user, entries, points] = await Promise.all([
    prisma.arcUser.findUniqueOrThrow({where: {id: req.arcUserId}}),
    prisma.arcEntry.findMany({
      where: {userId: req.arcUserId},
      orderBy: {day: 'asc'},
      select: {day: true, code: true, title: true, problem: true, idea: true, howItWorks: true, firstTest: true, tools: true, fileName: true, updatedAt: true},
    }),
    computePoints(now, req.arcUserId),
  ]);
  const state = currentState(now);
  const mine = points.get(user.id);
  // A streak counts as current if the last entry is today or the last closed day
  const lastDay = entries.at(-1)?.day ?? 0;
  const currentDay = state.phase === 'open' ? state.day : state.phase === 'between' ? state.day - 1 : state.phase === 'ended' ? ARC_DAYS : 0;
  const streak = mine && lastDay >= currentDay - 1 ? mine.streak : 0;
  const subDay = submissionDay();
  const today = subDay ? (entries.find((e) => e.day === subDay) ?? null) : null;
  res.json({
    user: {
      name: user.name,
      firstName: firstName(user.name),
      phone: user.phone,
      collegeCity: user.collegeCity,
      year: user.year,
      branch: user.branch,
      email: user.email,
      publishOk: user.publishOk,
      classUpdatesOk: user.classUpdatesOk,
      createdAt: user.createdAt,
    },
    points: mine?.points ?? 0,
    validEntries: mine?.entries ?? 0,
    streak,
    today,
    entries: entries.map(({day, code, title, updatedAt}) => ({day, code, title, updatedAt})),
  });
});

/** Turn the optional boxes on or off. Each change is recorded. */
arcRouter.patch('/me/consents', arcAuth, async (req: ArcRequest, res) => {
  const body = z.object({publish: z.boolean().optional(), class_updates: z.boolean().optional()}).parse(req.body);
  const changes = (['publish', 'class_updates'] as const).filter((b) => body[b] !== undefined);
  await prisma.$transaction([
    prisma.arcUser.update({
      where: {id: req.arcUserId},
      data: {...(body.publish !== undefined && {publishOk: body.publish}), ...(body.class_updates !== undefined && {classUpdatesOk: body.class_updates})},
    }),
    ...changes.map((box) =>
      prisma.arcConsent.create({data: {userId: req.arcUserId!, box, ticked: body[box]!, label: CONSENT_LABELS[box], pageVersion: PAGE_VERSION}}),
    ),
  ]);
  res.json({ok: true});
});

/** "My data": delete the account, entries and consent records. */
arcRouter.delete('/me', arcAuth, async (req: ArcRequest, res) => {
  const files = await prisma.arcEntry.findMany({where: {userId: req.arcUserId, fileStored: {not: null}}, select: {fileStored: true}});
  await prisma.arcUser.delete({where: {id: req.arcUserId}});
  await Promise.all(files.map((f) => removeArcFile(f.fileStored)));
  res.json({ok: true});
});

// ---------------------------------------------------------------- today's entry

const box = (label: string, min: number, max: number) =>
  z
    .string()
    .transform(plain)
    .pipe(
      z
        .string()
        .min(min, `${label} needs at least ${min} characters.`)
        .max(max, `${label} can be at most ${max} characters.`)
        .refine((s) => !hasLink(s), 'Links are not allowed. Describe it in words.'),
    );

const entryBody = z.object({
  title: box('Title', 3, 80).refine((s) => !s.includes('\n'), 'Title must be a single line.'),
  problem: box('The problem', 100, 500),
  idea: box('The idea', 100, 600),
  howItWorks: box('How it works', 80, 500),
  firstTest: box('First 7-day test', 60, 400),
  tools: z
    .string()
    .optional()
    .transform((s) => (s ? plain(s) : ''))
    .pipe(z.string().max(150, 'Tools can be at most 150 characters.').refine((s) => !hasLink(s), 'Links are not allowed. Describe it in words.'))
    .transform((s) => s || null),
});

type EntryFields = z.infer<typeof entryBody>;

/**
 * Which day a submission right now counts for. Entries are taken even before the challenge starts:
 * before Day 1 (or with no start date set) they count for Day 1; before 9:00 AM they count for that calendar day.
 * null once Day 20 has closed. Server time decides, not the phone's clock.
 */
function submissionDay(now = new Date()): number | null {
  const state = currentState(now);
  if (state.phase === 'open' || state.phase === 'between') return state.day;
  if (state.phase === 'not_set' || state.phase === 'upcoming') return 1;
  return null;
}

function openDay() {
  const day = submissionDay();
  if (!day) throw new HttpError(403, 'Winter Arc has ended. Entries are closed.');
  return day;
}

/** Deadline for a day's entries, when a start date is set. */
const deadline = (day: number) => (startDate() ? closesAt(day) : null);

/** Create or edit a participant's entry for a day, with the auto-flags. */
async function saveEntry(userId: number, day: number, body: EntryFields, ip: string) {
  limit(`entry:${userId}`, 40, 'Too many saves in an hour. Please try again a little later.');
  limit(`entry-ip:${ip}`, 200, 'Too many saves from this network. Please try again later.');

  // Auto-flags: text checks + exact repeat (any day) + near-duplicate (same day, another participant)
  const hash = contentHash(body);
  const reasons = textFlags(body);
  const exact = await prisma.arcEntry.findFirst({where: {contentHash: hash, NOT: {userId, day}}, select: {code: true}});
  if (exact) reasons.push(`exact duplicate of ${exact.code}`);
  else {
    const mine = shingles(body);
    const sameDay = await prisma.arcEntry.findMany({
      where: {day, NOT: {userId}},
      select: {code: true, title: true, problem: true, idea: true, howItWorks: true, firstTest: true},
    });
    const near = sameDay.find((e) => similarity(mine, shingles(e)) > 0.8);
    if (near) reasons.push(`near duplicate of ${near.code}`);
  }
  const flagReason = reasons.join('; ').slice(0, 255);

  const existing = await prisma.arcEntry.findUnique({where: {userId_day: {userId, day}}, select: {id: true}});
  if (existing) return prisma.arcEntry.update({where: {id: existing.id}, data: {...body, contentHash: hash, flagReason}});
  for (let attempt = 0; ; attempt++) {
    try {
      return await prisma.arcEntry.create({data: {...body, userId, day, code: entryCode(day), contentHash: hash, flagReason}});
    } catch (e) {
      if (attempt >= 5 || (e as {code?: string}).code !== 'P2002') throw e; // P2002: the random code was taken, try another
    }
  }
}

/** Save today's five-box entry (create or edit), for a signed-in participant. Locked after 11:59 PM IST. */
arcRouter.put('/entry', arcAuth, async (req: ArcRequest, res) => {
  const day = openDay();
  const entry = await saveEntry(req.arcUserId!, day, entryBody.parse(req.body), req.ip ?? 'unknown');
  res.json({ok: true, code: entry.code, day, savedAt: entry.updatedAt, closesAt: deadline(day)});
});

// ---- The short form on the page: verified mobile + name + one idea box ----

const shortBody = z.object({
  name: z.string().trim().min(2, 'Name needs at least 2 characters.').max(60, 'Name can be at most 60 characters.'),
  /** Idea heading (one line). Optional so older pages still work; then it's taken from the first words of the idea. */
  title: z
    .string()
    .optional()
    .transform((s) => (s ? plain(s).replace(/\n/g, ' ') : ''))
    .pipe(z.string().max(80, 'Idea heading can be at most 80 characters.').refine((s) => !hasLink(s), 'Links are not allowed. Describe it in words.')),
  /** Idea solution */
  idea: box('Idea solution', 50, 2000),
  /** From POST /api/otp/verify. Not needed when already signed in (Authorization header). */
  phoneToken: z.string().optional(),
});

/** First words of the idea, as the entry title (judges see it on the board and in the admin list). */
const titleFrom = (idea: string) => {
  const first = idea.split('\n')[0].trim();
  return first.length <= 80 ? first : `${first.slice(0, 77).replace(/\s+\S*$/, '')}…`;
};

/**
 * Submit today's idea in one go. Signs the person in (creating their account on first use) from a verified
 * mobile number, or from an existing session. Editing is the same call again, until 11:59 PM IST.
 * Sent as multipart/form-data when there's a `file` (optional; a new file replaces the old one), or as JSON.
 */
arcRouter.post('/submit', arcUpload.single('file'), async (req, res) => {
  const file = req.file;
  try {
    res.json(await submit(req, file));
  } catch (e) {
    await removeArcFile(file?.filename); // don't keep files of entries that weren't saved
    throw e;
  }
});

async function submit(req: Request, file: Express.Multer.File | undefined) {
  const day = openDay();
  const body = shortBody.parse(req.body);

  // Who: an existing session, or a freshly verified mobile number
  // (an expired session falls back to the phone token)
  let userId = await accountFromRequest(req);
  if (!userId) {
    const phone = phoneFromToken(body.phoneToken);
    limit(`reg:${req.ip}`, 20, 'Too many sign-ups from this network. Please try again in an hour.');
    const user = await prisma.arcUser.upsert({where: {phone}, update: {}, create: {phone, name: body.name}});
    userId = user.id;
    await logLogin(userId, 'login', 'idea-challenge', req); // a fresh OTP sign-in from the form
  }
  await prisma.arcUser.update({where: {id: userId}, data: {name: body.name}});

  let entry = await saveEntry(userId, day, {title: body.title.length >= 3 ? body.title : titleFrom(body.idea), problem: '', idea: body.idea, howItWorks: '', firstTest: '', tools: null}, req.ip ?? 'unknown');
  if (file) {
    await removeArcFile(entry.fileStored);
    entry = await prisma.arcEntry.update({
      where: {id: entry.id},
      data: {fileName: file.originalname.slice(0, 191), fileStored: file.filename, fileType: file.mimetype.slice(0, 120), fileSize: file.size},
    });
  }
  // The free class that fits this day's category (optional; never part of judging)
  const {name: category, className} = categoryOf(day);
  return {ok: true, token: signSession(userId), code: entry.code, day, savedAt: entry.updatedAt, closesAt: deadline(day), fileName: entry.fileName, recommended: {category, className}};
}

// ---------------------------------------------------------------- Winner Board

/**
 * Yesterday's winner, the latest Top 10 and the Arc Points table (top 20). Names only for people who ticked "publish".
 * The day's prize is listed only once the team has confirmed it.
 */
arcRouter.get('/board', async (_req, res) => {
  const now = new Date();
  const latest = await prisma.arcResult.findFirst({where: {visibleFrom: {lte: now}}, orderBy: {day: 'desc'}, select: {day: true}});
  const top10 = latest
    ? await prisma.arcResult.findMany({
        where: {day: latest.day, visibleFrom: {lte: now}},
        orderBy: {rank: 'asc'},
        select: {rank: true, entry: {select: {title: true, userId: true, user: {select: {name: true, collegeCity: true, publishOk: true}}}}},
      })
    : [];
  const days = await loadDays();
  const latestDay = latest ? days[latest.day - 1] : null;

  const totals = await computePoints(now);
  const points = [...totals.values()].sort((a, b) => b.points - a.points || b.entries - a.entries).slice(0, 20);
  const users = await prisma.arcUser.findMany({where: {id: {in: points.map((p) => p.userId)}}, select: {id: true, name: true, collegeCity: true, publishOk: true}});
  const byId = new Map(users.map((u) => [u.id, u]));

  res.json({
    day: latest?.day ?? null,
    category: latestDay?.category ?? null,
    prize: latestDay ? publicPrize(latestDay) : null,
    top10: top10.map((r) => {
      const u = r.entry.user;
      const pts = totals.get(r.entry.userId)?.points ?? 0;
      return u.publishOk
        ? {rank: r.rank, title: r.entry.title, firstName: firstName(u.name), college: u.collegeCity, points: pts}
        : {rank: r.rank, title: null, firstName: null, college: null, points: pts};
    }),
    leaderboard: points.map((p, i) => {
      const u = byId.get(p.userId);
      return {rank: i + 1, points: p.points, entries: p.entries, firstName: u?.publishOk ? firstName(u.name) : null, college: u?.publishOk ? u.collegeCity : null};
    }),
  });
});
