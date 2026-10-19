/**
 * Moving parsed sheet data in and out of the MySQL tables. The dashboard is served from these tables only.
 */
import {prisma} from './db.ts';
import type {Prisma} from './generated/prisma/client.ts';
import {OWNERS} from './parsers/owners.ts';
import type {SalesData} from './parsers/sales.ts';
import type {Dataset} from './parsers/types.ts';

const toDate = (iso: string) => new Date(`${iso}T00:00:00Z`);
const toIso = (d: Date) => d.toISOString().slice(0, 10);
const num = (d: Prisma.Decimal) => d.toNumber();
const numOrNull = (d: Prisma.Decimal | null) => (d == null ? null : d.toNumber());
const cut = (s: string) => s.slice(0, 191);
const strings = (j: Prisma.JsonValue | null | undefined) => (Array.isArray(j) ? (j as string[]) : []);

export interface SourceMeta {
  fileName: string | null;
  sheetName: string | null;
  checks: string[];
  warnings: string[];
  hash: string;
  at: Date;
}

/** Replace one person's ad-spend data with a fresh parse of their sheet. */
export async function saveOwner(owner: string, ds: Dataset, meta: SourceMeta) {
  const source = {
    fileName: meta.fileName,
    sheetName: meta.sheetName,
    ok: true,
    error: null,
    checks: meta.checks,
    warnings: meta.warnings,
    summaryTitle: ds.summaryTitle,
    summaryColumns: ds.summaryColumns,
    hash: meta.hash,
    dataAt: meta.at,
    checkedAt: meta.at,
  };
  await prisma.$transaction([
    prisma.adSpendRow.deleteMany({where: {owner}}),
    prisma.awarenessRow.deleteMany({where: {owner}}),
    prisma.campaignSummary.deleteMany({where: {owner}}),
    prisma.awarenessSummary.deleteMany({where: {owner}}),
    prisma.adSpendRow.createMany({
      data: ds.rows.map((r) => ({owner, date: toDate(r.date), campaign: cut(r.campaign), leads: Math.round(r.leads), spend: r.spend, cpl: r.cpl})),
    }),
    prisma.awarenessRow.createMany({
      data: ds.awareness.map((r) => ({owner, date: toDate(r.date), campaign: cut(r.campaign), reach: Math.round(r.reach), spend: r.spend, costPer1k: r.costPer1k})),
    }),
    prisma.campaignSummary.createMany({
      data: ds.summary.map((r, i) => ({owner, position: i, campaign: cut(r.campaign), leads: Math.round(r.leads), spend: r.spend, cpl: r.cpl, counts: r.counts})),
    }),
    prisma.awarenessSummary.createMany({
      data: ds.awarenessSummary.map((r, i) => ({owner, position: i, campaign: cut(r.campaign), reach: Math.round(r.reach), spend: r.spend, costPer1k: r.costPer1k})),
    }),
    prisma.sheetSource.upsert({where: {id: owner}, create: {id: owner, ...source}, update: source}),
  ]);
}

/** Replace the sales data with a fresh parse of the sales sheet. */
export async function saveSales(data: SalesData, meta: SourceMeta) {
  const source = {fileName: meta.fileName, sheetName: null, ok: true, error: null, checks: meta.checks, warnings: meta.warnings, hash: meta.hash, dataAt: meta.at, checkedAt: meta.at};
  await prisma.$transaction(async (tx) => {
    await tx.salesPayment.deleteMany();
    await tx.salesWorkshop.deleteMany();
    await tx.salesSkippedTab.deleteMany();
    const seen = new Set<string>();
    for (const [i, t] of data.tabs.entries()) {
      const name = cut(t.name);
      if (seen.has(name)) continue; // two tabs can't share a name in Sheets, but be safe
      seen.add(name);
      const w = await tx.salesWorkshop.create({
        data: {
          position: i,
          name,
          students: t.students,
          amountColumn: t.columns.amount,
          dateColumn: t.columns.date,
          studentColumn: t.columns.student,
          headerRow: t.columns.headerRow,
          detectedBy: t.detectedBy,
          warnings: t.warnings,
        },
      });
      await tx.salesPayment.createMany({
        data: t.payments.map((p) => ({workshopId: w.id, paidOn: p.date ? toDate(p.date) : null, amount: p.amount, student: cut(p.student)})),
      });
    }
    await tx.salesSkippedTab.createMany({data: data.skipped.map((s) => ({name: cut(s.name), reason: cut(s.reason)}))});
    await tx.sheetSource.upsert({where: {id: 'sales'}, create: {id: 'sales', ...source}, update: source});
  }, {timeout: 60_000});
}

/** A sheet that couldn't be read: note the error, keep its last good data in the tables. */
export async function markFailed(id: string, error: string, at: Date, fileName?: string) {
  const data = {ok: false, error, checkedAt: at, hash: null, ...(fileName ? {fileName} : {})};
  await prisma.sheetSource.upsert({where: {id}, create: {id, ...data}, update: data});
}

/** Sheet read again with the same contents: only note the time. */
export const markUnchanged = (id: string, at: Date) => prisma.sheetSource.update({where: {id}, data: {checkedAt: at, ok: true, error: null}});

export async function loadOwnerDataset(owner: string): Promise<Dataset | null> {
  const src = await prisma.sheetSource.findUnique({where: {id: owner}});
  if (!src?.dataAt) return null;
  const [rows, awareness, summary, awarenessSummary] = await Promise.all([
    prisma.adSpendRow.findMany({where: {owner}, orderBy: [{date: 'asc'}, {id: 'asc'}]}),
    prisma.awarenessRow.findMany({where: {owner}, orderBy: [{date: 'asc'}, {id: 'asc'}]}),
    prisma.campaignSummary.findMany({where: {owner}, orderBy: {position: 'asc'}}),
    prisma.awarenessSummary.findMany({where: {owner}, orderBy: {position: 'asc'}}),
  ]);
  return {
    fileName: src.fileName ?? '',
    sheetName: src.sheetName ?? '',
    uploadedAt: src.dataAt.toISOString(),
    rows: rows.map((r) => ({date: toIso(r.date), campaign: r.campaign, leads: r.leads, spend: num(r.spend), cpl: numOrNull(r.cpl)})),
    summary: summary.map((r) => ({campaign: r.campaign, leads: r.leads, spend: num(r.spend), cpl: numOrNull(r.cpl), counts: (r.counts ?? {}) as Record<string, number | null>})),
    summaryTitle: src.summaryTitle,
    summaryColumns: strings(src.summaryColumns),
    awareness: awareness.map((r) => ({date: toIso(r.date), campaign: r.campaign, reach: r.reach, spend: num(r.spend), costPer1k: numOrNull(r.costPer1k)})),
    awarenessSummary: awarenessSummary.map((r) => ({campaign: r.campaign, reach: r.reach, spend: num(r.spend), costPer1k: numOrNull(r.costPer1k)})),
  };
}

async function loadSales(): Promise<SalesData | null> {
  const src = await prisma.sheetSource.findUnique({where: {id: 'sales'}});
  if (!src?.dataAt) return null;
  const [workshops, skipped] = await Promise.all([
    prisma.salesWorkshop.findMany({orderBy: {position: 'asc'}, include: {payments: {orderBy: {id: 'asc'}}}}),
    prisma.salesSkippedTab.findMany({orderBy: {id: 'asc'}}),
  ]);
  return {
    fileName: src.fileName ?? 'Sales sheet',
    tabs: workshops.map((w) => ({
      name: w.name,
      students: w.students,
      payments: w.payments.map((p) => ({date: p.paidOn ? toIso(p.paidOn) : null, amount: numOrNull(p.amount), student: p.student})),
      columns: {amount: w.amountColumn, date: w.dateColumn, student: w.studentColumn, headerRow: w.headerRow},
      detectedBy: w.detectedBy === 'content' ? 'content' : 'header',
      warnings: strings(w.warnings),
    })),
    skipped: skipped.map((s) => ({name: s.name, reason: s.reason})),
  };
}

/** Everything the dashboard shows, built from the tables. */
export async function buildFeed() {
  const sources = await prisma.sheetSource.findMany();
  const byId = new Map(sources.map((s) => [s.id, s]));
  const checked = sources.map((s) => s.checkedAt?.getTime() ?? 0);
  const owners = await Promise.all(
    OWNERS.map(async (o) => {
      const s = byId.get(o.id);
      const dataset = await loadOwnerDataset(o.id);
      return {
        id: o.id,
        name: o.name,
        unit: o.source.unit,
        fileHint: o.source.fileHint,
        data: dataset ? {dataset, isSample: false} : null,
        fileName: s?.fileName ?? null,
        sheetName: s?.sheetName ?? null,
        checks: strings(s?.checks),
        warnings: strings(s?.warnings),
        error: s ? s.error : 'Not read yet.',
      };
    }),
  );
  const salesSrc = byId.get('sales');
  return {
    fetchedAt: new Date(checked.length ? Math.max(...checked) : Date.now()).toISOString(),
    owners,
    sales: {data: await loadSales(), error: salesSrc ? salesSrc.error : 'Not read yet.'},
  };
}

export const hasData = async () => (await prisma.sheetSource.count({where: {dataAt: {not: null}}})) > 0;
