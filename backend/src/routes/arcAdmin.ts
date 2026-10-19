import path from 'node:path';
import {Router} from 'express';
import {z} from 'zod';
import {HttpError, requireAuth} from '../auth.ts';
import {maskName} from '../arc/flags.ts';
import {ARC_UPLOAD_DIR} from '../arc/upload.ts';
import {ARC_DAYS, categoryOf, closesAt, currentState, dateOfDay, istToday, loadDays, setStartDate, startDate, winnerAt} from '../arc/schedule.ts';
import {prisma} from '../db.ts';
import {env} from '../env.ts';

/**
 * Winter Arc admin (dashboard sign-in): day view, day settings (topic, prompt, prize), flags, judging pack export,
 * scores and the Zoom shortlist, winners, code lookup, claim tracker and the tracking report.
 */
export const arcAdminRouter = Router();
arcAdminRouter.use(requireAuth);

const BATCH = 100;
const dayParam = (v: unknown) => {
  const d = Number(v);
  if (!Number.isInteger(d) || d < 1 || d > ARC_DAYS) throw new HttpError(400, `Day must be 1 to ${ARC_DAYS}.`);
  return d;
};
/** Entries that go to the judges: clean and not excluded, or flagged and then included by a person. */
const judgeable = (day: number) => ({day, OR: [{flagReason: '', adminDecision: null}, {adminDecision: 'include'}]});

/** Day list with counts. */
arcAdminRouter.get('/days', async (_req, res) => {
  const [entries, results, config] = await Promise.all([
    prisma.arcEntry.findMany({select: {day: true, flagReason: true, adminDecision: true, shortlisted: true}}),
    prisma.arcResult.findMany({select: {day: true, visibleFrom: true}}),
    loadDays(),
  ]);
  const now = new Date();
  const state = currentState(now);
  const days = Array.from({length: ARC_DAYS}, (_, i) => {
    const day = i + 1;
    const list = entries.filter((e) => e.day === day);
    const published = results.find((r) => r.day === day);
    return {
      ...config[i],
      date: startDate() ? dateOfDay(day) : null,
      closed: startDate() ? now > closesAt(day) : false,
      entries: list.length,
      flagged: list.filter((e) => e.flagReason && !e.adminDecision).length,
      excluded: list.filter((e) => e.adminDecision === 'exclude').length,
      judgeable: list.filter((e) => (!e.flagReason && !e.adminDecision) || e.adminDecision === 'include').length,
      shortlisted: list.filter((e) => e.shortlisted).length,
      results: published ? {visibleFrom: published.visibleFrom} : null,
    };
  });
  const [users, consentsOn, converted] = await Promise.all([
    prisma.arcUser.count(),
    prisma.arcUser.count({where: {classUpdatesOk: true}}),
    prisma.arcUser.count({where: {entries: {some: {workshopConverted: true}}}}),
  ]);
  res.json({
    startDate: startDate(),
    phase: state.phase,
    currentDay: state.day,
    users,
    classUpdatesOk: consentsOn,
    converted,
    shortlistPerDay: env.ARC_SHORTLIST_PER_DAY,
    days,
  });
});

/**
 * Start or stop the event. Start sets Day 1's date (default today, IST; Day 1 opens 9:00 AM that day, or at once if
 * that's past). Stop clears it: the site shows "Challenge starts soon" until the next Start.
 */
arcAdminRouter.put('/event', async (req, res) => {
  const body = z
    .discriminatedUnion('action', [
      z.object({action: z.literal('start'), date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Pick a date.').optional()}),
      z.object({action: z.literal('stop')}),
    ])
    .parse(req.body);
  await setStartDate(body.action === 'start' ? (body.date ?? istToday()) : null);
  const state = currentState();
  res.json({startDate: startDate(), phase: state.phase, currentDay: state.day});
});

/** A day's settings: topic and prompt (announced the day before), and the prize (shown on the site once confirmed). */
const text = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .nullable()
    .transform((s) => s || null);
arcAdminRouter.put('/day/:day/config', async (req, res) => {
  const day = dayParam(req.params.day);
  const data = z
    .object({
      topic: text(80),
      prompt: text(255),
      prizeName: text(120),
      prizeDescription: text(500),
      prizeImageUrl: text(500).refine((s) => !s || /^https?:\/\//i.test(s), 'Prize image must be a full https:// address.'),
      prizeConfirmed: z.boolean().default(false),
      zoomTime: text(60),
      zoomLink: text(500).refine((s) => !s || /^https:\/\//i.test(s), 'Zoom link must be a full https:// address.'),
    })
    .parse(req.body);
  if (data.prizeConfirmed && !data.prizeName) throw new HttpError(400, 'Add the prize name before marking it confirmed.');
  await prisma.arcDay.upsert({where: {day}, update: data, create: {day, ...data}});
  res.json({ok: true});
});

/** A day's entries: code and text only (no personal data), with flags. */
arcAdminRouter.get('/day/:day/entries', async (req, res) => {
  const day = dayParam(req.params.day);
  const entries = await prisma.arcEntry.findMany({
    where: {day},
    orderBy: [{flagReason: 'desc'}, {id: 'asc'}],
    select: {
      code: true,
      title: true,
      problem: true,
      idea: true,
      howItWorks: true,
      firstTest: true,
      tools: true,
      fileName: true,
      fileSize: true,
      flagReason: true,
      adminDecision: true,
      score: true,
      shortlisted: true,
      zoomInvited: true,
      zoomAttended: true,
      workshopConverted: true,
      updatedAt: true,
    },
  });
  res.json({day, category: categoryOf(day).name, entries});
});

/**
 * Update an entry: include or exclude it (null resets to the automatic state), its score, the Zoom shortlist and
 * invitation/attendance, and paid-workshop conversion. Send only the fields that change.
 */
arcAdminRouter.patch('/entry/:code', async (req, res) => {
  const data = z
    .object({
      adminDecision: z.enum(['include', 'exclude']).nullable(),
      score: z.number().int().min(0).max(100).nullable(),
      shortlisted: z.boolean(),
      zoomInvited: z.boolean(),
      zoomAttended: z.boolean(),
      workshopConverted: z.boolean(),
    })
    .partial()
    .parse({...req.body, ...(req.body?.decision !== undefined && {adminDecision: req.body.decision})}); // "decision": the older name
  const code = String(req.params.code);
  const entry = await prisma.arcEntry.findUnique({where: {code}, select: {id: true, day: true, shortlisted: true}});
  if (!entry) throw new HttpError(404, 'No entry with that code.');
  if (data.shortlisted && !entry.shortlisted) {
    const taken = await prisma.arcEntry.count({where: {day: entry.day, shortlisted: true}});
    if (taken >= env.ARC_SHORTLIST_PER_DAY)
      throw new HttpError(400, `The Day ${entry.day} shortlist is full (${env.ARC_SHORTLIST_PER_DAY}). Remove someone first, or change ARC_SHORTLIST_PER_DAY.`);
  }
  await prisma.arcEntry.update({where: {id: entry.id}, data});
  res.json({ok: true});
});

/** Download an entry's attachment. (Attachments are for people to look at; the judging pack is text only.) */
arcAdminRouter.get('/entry/:code/file', async (req, res) => {
  const entry = await prisma.arcEntry.findUnique({where: {code: String(req.params.code)}, select: {fileName: true, fileStored: true}});
  if (!entry?.fileStored || !entry.fileName) throw new HttpError(404, 'This entry has no file.');
  res.download(path.join(ARC_UPLOAD_DIR, path.basename(entry.fileStored)), entry.fileName, (err) => {
    if (err && !res.headersSent) res.status(404).json({error: 'The file is missing on the server.'});
  });
});

// ---------------------------------------------------------------- judging pack

const csvCell = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
const oneLine = (s: string) => s.replace(/\s*\n\s*/g, ' ');

async function packEntries(day: number) {
  const entries = await prisma.arcEntry.findMany({
    where: judgeable(day),
    orderBy: {code: 'asc'}, // random codes, so this order says nothing about who or when
    select: {code: true, userId: true, title: true, problem: true, idea: true, howItWorks: true, firstTest: true, tools: true, updatedAt: true, user: {select: {name: true}}},
  });
  // Mask the participant's own name if they wrote it in the text
  return entries.map((e) => {
    const m = (s: string) => oneLine(maskName(s, e.user.name));
    return {...e, title: m(e.title), problem: m(e.problem), idea: m(e.idea), howItWorks: m(e.howItWorks), firstTest: m(e.firstTest), tools: e.tools ? m(e.tools) : ''};
  });
}

arcAdminRouter.get('/day/:day/export-info', async (req, res) => {
  const day = dayParam(req.params.day);
  const count = await prisma.arcEntry.count({where: judgeable(day)});
  res.json({day, count, batches: Math.ceil(count / BATCH), closed: startDate() ? new Date() > closesAt(day) : false});
});

/** ?file=batch&n=1 (text, 100 entries) · ?file=all (CSV, no personal data) · ?file=key (CSV: code → participant ID, admin only) */
arcAdminRouter.get('/day/:day/export', async (req, res) => {
  const day = dayParam(req.params.day);
  const file = String(req.query.file ?? 'batch');
  const dd = String(day).padStart(2, '0');
  const entries = await packEntries(day);
  const config = (await loadDays())[day - 1];
  const theme = [`Day ${day}`, config.category, config.topic].filter(Boolean).join(' | ');

  if (file === 'batch') {
    const n = Math.max(1, Number(req.query.n) || 1);
    const slice = entries.slice((n - 1) * BATCH, n * BATCH);
    if (!slice.length) throw new HttpError(404, 'That batch is empty.');
    const text = slice
      .map((e) =>
        [
          '=== ENTRY ===',
          `CODE: ${e.code}`,
          `THEME: ${theme}`,
          `TITLE: ${e.title}`,
          `PROBLEM: ${e.problem}`,
          `IDEA: ${e.idea}`,
          `HOW IT WORKS: ${e.howItWorks}`,
          `FIRST TEST: ${e.firstTest}`,
          `TOOLS: ${e.tools}`,
          '=== END ===',
        ]
          .filter((line) => !/^[A-Z ]+: $/.test(line)) // short-form entries have only TITLE and IDEA
          .join('\n'),
      )
      .join('\n\n');
    res.attachment(`day${dd}_batch${String(n).padStart(2, '0')}.txt`).type('text/plain; charset=utf-8').send(text + '\n');
  } else if (file === 'all') {
    const rows = [['code', 'title', 'problem', 'idea', 'how_it_works', 'first_test', 'tools', 'submitted'].join(',')].concat(
      entries.map((e) => [e.code, e.title, e.problem, e.idea, e.howItWorks, e.firstTest, e.tools, e.updatedAt.toISOString()].map(csvCell).join(',')),
    );
    res.attachment(`day${dd}_all.csv`).type('text/csv; charset=utf-8').send('﻿' + rows.join('\n'));
  } else if (file === 'key') {
    const rows = ['code,participant_id'].concat(entries.map((e) => `${e.code},${e.userId}`));
    res.attachment(`day${dd}_key.csv`).type('text/csv; charset=utf-8').send(rows.join('\n'));
  } else throw new HttpError(400, 'file must be batch, all or key.');
});

// ---------------------------------------------------------------- winners

arcAdminRouter.get('/day/:day/results', async (req, res) => {
  const day = dayParam(req.params.day);
  const results = await prisma.arcResult.findMany({
    where: {day},
    orderBy: {rank: 'asc'},
    select: {id: true, rank: true, visibleFrom: true, contacted: true, idChecked: true, callDone: true, shipped: true, entry: {select: {code: true, title: true}}},
  });
  res.json({day, results});
});

/** Enter the Top 10 codes in order (first = winner) and publish. Shown on the board from 6:00 PM IST the next day. */
arcAdminRouter.post('/day/:day/results', async (req, res) => {
  const day = dayParam(req.params.day);
  const codes = z
    .array(z.string().trim().toUpperCase())
    .min(1, 'Enter at least the winner.')
    .max(10, 'At most 10 codes.')
    .parse(req.body?.codes)
    .filter(Boolean);
  if (new Set(codes).size !== codes.length) throw new HttpError(400, 'Each code can be listed once.');
  const entries = await prisma.arcEntry.findMany({where: {code: {in: codes}}, select: {id: true, code: true, day: true, adminDecision: true}});
  for (const c of codes) {
    const e = entries.find((x) => x.code === c);
    if (!e) throw new HttpError(400, `No entry with code ${c}.`);
    if (e.day !== day) throw new HttpError(400, `${c} is a Day ${e.day} entry, not Day ${day}.`);
    if (e.adminDecision === 'exclude') throw new HttpError(400, `${c} was excluded.`);
  }
  const now = new Date();
  const visibleFrom = startDate() && winnerAt(day) > now ? winnerAt(day) : now;
  await prisma.$transaction([
    prisma.arcResult.deleteMany({where: {day}}),
    ...codes.map((c, i) => prisma.arcResult.create({data: {day, rank: i + 1, entryId: entries.find((e) => e.code === c)!.id, visibleFrom}})),
  ]);
  res.json({ok: true, visibleFrom});
});

/** Winner claim steps. */
arcAdminRouter.patch('/result/:id/claim', async (req, res) => {
  const data = z.object({contacted: z.boolean(), idChecked: z.boolean(), callDone: z.boolean(), shipped: z.boolean()}).partial().parse(req.body);
  const r = await prisma.arcResult.update({where: {id: Number(req.params.id) || 0}, data}).catch(() => null);
  if (!r) throw new HttpError(404, 'Result not found.');
  res.json({ok: true});
});

/** Who is behind a code. Every lookup is logged. */
arcAdminRouter.get('/resolve/:code', async (req, res) => {
  const code = String(req.params.code).trim().toUpperCase();
  const entry = await prisma.arcEntry.findUnique({
    where: {code},
    select: {day: true, title: true, user: {select: {id: true, name: true, phone: true, email: true, collegeCity: true, year: true, branch: true, publishOk: true}}},
  });
  await prisma.arcAccessLog.create({data: {code, admin: env.ADMIN_USERNAME, ip: req.ip ?? null}});
  if (!entry) throw new HttpError(404, 'No entry with that code.');
  res.json({code, day: entry.day, title: entry.title, participant: entry.user});
});

// ---------------------------------------------------------------- tracking report

/**
 * One row per entry (all days, or ?day=n): participant ID, category and day, timestamps, score and judging status,
 * shortlist and Zoom status, the free class suggested, and paid-workshop conversion. No names or phone numbers.
 */
arcAdminRouter.get('/report', async (req, res) => {
  const day = req.query.day ? dayParam(req.query.day) : null;
  const entries = await prisma.arcEntry.findMany({
    where: day ? {day} : {},
    orderBy: [{day: 'asc'}, {createdAt: 'asc'}],
    select: {
      code: true,
      userId: true,
      day: true,
      createdAt: true,
      updatedAt: true,
      flagReason: true,
      adminDecision: true,
      score: true,
      shortlisted: true,
      zoomInvited: true,
      zoomAttended: true,
      workshopConverted: true,
      result: {select: {rank: true}},
      user: {select: {classUpdatesOk: true}},
    },
  });
  const status = (e: (typeof entries)[number]) =>
    e.adminDecision === 'exclude'
      ? 'excluded'
      : e.result?.rank === 1
        ? 'winner'
        : e.result
          ? `top10 (#${e.result.rank})`
          : e.flagReason && !e.adminDecision
            ? 'flagged, needs review'
            : e.score != null
              ? 'scored'
              : 'in judging';
  const yesNo = (b: boolean) => (b ? 'yes' : 'no');
  const header = [
    'participant_id',
    'entry_code',
    'day',
    'category',
    'submitted_at',
    'last_edited_at',
    'score',
    'judging_status',
    'shortlisted',
    'zoom_invited',
    'zoom_attended',
    'class_recommended',
    'class_updates_consent',
    'workshop_converted',
  ];
  const rows = entries.map((e) =>
    [
      e.userId,
      e.code,
      e.day,
      categoryOf(e.day).name,
      e.createdAt.toISOString(),
      e.updatedAt.toISOString(),
      e.score ?? '',
      status(e),
      yesNo(e.shortlisted),
      yesNo(e.zoomInvited),
      yesNo(e.zoomAttended),
      categoryOf(e.day).className,
      yesNo(e.user.classUpdatesOk),
      // Conversion is tracked only with consent
      e.user.classUpdatesOk ? yesNo(e.workshopConverted) : 'not tracked',
    ]
      .map(csvCell)
      .join(','),
  );
  const name = day ? `winter-arc_day${String(day).padStart(2, '0')}_report.csv` : 'winter-arc_report.csv';
  res.attachment(name).type('text/csv; charset=utf-8').send('﻿' + [header.join(','), ...rows].join('\n'));
});
