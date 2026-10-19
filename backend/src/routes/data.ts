import {Router} from 'express';
import {z} from 'zod';
import {HttpError, requireAuth} from '../auth.ts';
import {prisma} from '../db.ts';
import {buildFeed, hasData} from '../store.ts';
import {runSync} from '../sync.ts';

export const dataRouter = Router();
dataRouter.use(requireAuth);

/** Everything the dashboard shows, from the tables. `?fresh=1` (the Refresh button) reads the sheets first. */
dataRouter.get('/feed', async (req, res) => {
  if (req.query.fresh === '1') {
    const r = await runSync(true);
    if (!r.ok && !(await hasData())) throw new HttpError(502, r.error ?? 'Could not read the sheets.');
  } else if (!(await hasData())) {
    const r = await runSync(); // first start: nothing stored yet
    if (!(await hasData())) throw new HttpError(502, r.error ?? 'No data has been read from Google Sheets yet.');
  }
  res.json(await buildFeed());
});

dataRouter.get('/sync/runs', async (_req, res) => {
  res.json({runs: await prisma.syncRun.findMany({orderBy: {id: 'desc'}, take: 50})});
});

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use yyyy-mm-dd');
const range = z.object({from: isoDate.optional(), to: isoDate.optional()});
const dateFilter = ({from, to}: z.infer<typeof range>) =>
  from || to ? {gte: from ? new Date(`${from}T00:00:00Z`) : undefined, lte: to ? new Date(`${to}T00:00:00Z`) : undefined} : undefined;
const day = (d: Date | null) => (d ? d.toISOString().slice(0, 10) : null);
const num = (d: {toNumber(): number} | null) => (d == null ? null : d.toNumber());

/** Daily ad spend rows. Filters: owner (babu / vasudha), from, to. */
dataRouter.get('/ads', async (req, res) => {
  const q = range.extend({owner: z.string().optional()}).parse(req.query);
  const rows = await prisma.adSpendRow.findMany({where: {owner: q.owner, date: dateFilter(q)}, orderBy: [{date: 'asc'}, {owner: 'asc'}, {id: 'asc'}]});
  res.json({rows: rows.map((r) => ({owner: r.owner, date: day(r.date), campaign: r.campaign, leads: r.leads, spend: num(r.spend), cpl: num(r.cpl)}))});
});

/** Student payments. Filters: workshop, from, to (payments with no date only show without a date filter). */
dataRouter.get('/sales/payments', async (req, res) => {
  const q = range.extend({workshop: z.string().optional()}).parse(req.query);
  const rows = await prisma.salesPayment.findMany({
    where: {workshop: q.workshop ? {name: q.workshop} : undefined, paidOn: dateFilter(q)},
    include: {workshop: {select: {name: true}}},
    orderBy: [{paidOn: 'desc'}, {id: 'asc'}],
  });
  res.json({payments: rows.map((p) => ({workshop: p.workshop.name, paidOn: day(p.paidOn), amount: num(p.amount), student: p.student}))});
});

/** Revenue and payments per workshop for a period. */
dataRouter.get('/sales/summary', async (req, res) => {
  const q = range.parse(req.query);
  const [workshops, groups] = await Promise.all([
    prisma.salesWorkshop.findMany({orderBy: {position: 'asc'}}),
    prisma.salesPayment.groupBy({by: ['workshopId'], where: {paidOn: dateFilter(q)}, _sum: {amount: true}, _count: {_all: true}}),
  ]);
  const byId = new Map(groups.map((g) => [g.workshopId, g]));
  const rows = workshops.map((w) => {
    const g = byId.get(w.id);
    return {workshop: w.name, students: w.students, payments: g?._count._all ?? 0, revenue: w.amountColumn ? (num(g?._sum.amount ?? null) ?? 0) : null};
  });
  res.json({
    from: q.from ?? null,
    to: q.to ?? null,
    revenue: rows.reduce((s, r) => s + (r.revenue ?? 0), 0),
    payments: rows.reduce((s, r) => s + r.payments, 0),
    workshops: rows.sort((a, b) => (b.revenue ?? 0) - (a.revenue ?? 0)),
  });
});
