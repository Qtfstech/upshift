import {createHash} from 'node:crypto';
import {prisma} from './db.ts';
import {env} from './env.ts';
import {OWNERS} from './parsers/owners.ts';
import {parseWorkbookData, workbookFromValues} from './parsers/parseExcel.ts';
import {parseSales, type FeedTab} from './parsers/sales.ts';
import {loadOwnerDataset, markFailed, markUnchanged, saveOwner, saveSales} from './store.ts';

const KEEP_RUNS_DAYS = 30;

/** One sheet as the Apps Script sends it. */
interface FeedSource {
  ok: boolean;
  error?: string;
  fileName?: string;
  sheetName?: string;
  startColumn?: number;
  values?: string[][];
  tabs?: FeedTab[];
}

export interface SyncResult {
  ok: boolean;
  error?: string;
}

let inFlight: Promise<SyncResult> | null = null;

/**
 * Read the sheets through the Apps Script feed and store them in the tables. Only one read runs at a time; a
 * second caller waits for the one in progress. `fresh` makes the script read the sheets now instead of using
 * its 5-minute snapshot.
 */
export function runSync(fresh = false): Promise<SyncResult> {
  inFlight ??= doSync(fresh).finally(() => (inFlight = null));
  return inFlight;
}

async function fetchFeed(fresh: boolean) {
  // Apps Script answers with a redirect; fetch follows it (as a GET), like a browser does.
  const res = await fetch(env.APPS_SCRIPT_URL, {
    method: 'POST',
    headers: {'Content-Type': 'text/plain'},
    body: JSON.stringify({password: env.APPS_SCRIPT_PASSWORD, fresh}),
    signal: AbortSignal.timeout(180_000),
  });
  const text = await res.text();
  let json: {ok: boolean; error?: string; fetchedAt?: string; sources?: Record<string, FeedSource>};
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(`The Google Sheets feed sent back something unexpected (HTTP ${res.status}).`);
  }
  if (!json.ok) {
    throw new Error(json.error === 'unauthorized' ? 'APPS_SCRIPT_PASSWORD in backend/.env does not match PASSWORD in the Apps Script.' : (json.error ?? 'The feed returned an error.'));
  }
  return {at: json.fetchedAt ? new Date(json.fetchedAt) : new Date(), sources: json.sources ?? {}};
}

/** Bump when the parsers change, so sheets that haven't changed are still read again with the new code. */
const PARSER_VERSION = 2;

/** The sheet's contents plus how it is read: a change to either means it is parsed again. */
const fingerprint = (id: string, src: FeedSource) => {
  const config = OWNERS.find((o) => o.id === id)?.source ?? null;
  const settings = JSON.stringify(config, (_k, v) => (v instanceof RegExp ? String(v) : v));
  return createHash('sha256').update(`${PARSER_VERSION}|${settings}|${JSON.stringify(src)}`).digest('hex');
};
const message = (e: unknown) => (e instanceof Error ? e.message : String(e));

/** Parse and save one sheet. Returns what happened, for the sync log. */
async function storeSource(id: string, src: FeedSource | undefined, at: Date): Promise<string> {
  if (!src) {
    await markFailed(id, 'This sheet was not in the feed. Check SOURCES in the Apps Script.', at);
    return 'missing';
  }
  if (!src.ok) {
    await markFailed(id, src.error ?? 'The sheet could not be read.', at, src.fileName);
    return src.error ?? 'error';
  }
  const hash = fingerprint(id, src);
  const current = await prisma.sheetSource.findUnique({where: {id}, select: {hash: true}});
  if (current?.hash === hash) {
    await markUnchanged(id, at);
    return 'unchanged';
  }

  try {
    if (id === 'sales') {
      const data = parseSales(src.fileName ?? 'Sales sheet', src.tabs ?? []);
      const checks = data.tabs.map((t) => `${t.name}: ${t.payments.length} payments from ${t.students} students`);
      await saveSales(data, {fileName: src.fileName ?? null, sheetName: null, checks, warnings: data.skipped.map((s) => `${s.name}: ${s.reason}`), hash, at});
      return 'saved';
    }
    const owner = OWNERS.find((o) => o.id === id)!;
    const cells = (rows: string[][]) => rows.map((r) => r.map((c) => (c === '' ? null : c)));
    // Every visible tab (allTabs in the Apps Script), or the one tab it picked. The parser reads each tab that
    // has the expected layout and combines them.
    const sheets = src.tabs
      ? src.tabs.filter((t) => !t.hidden).map((t) => ({name: t.name, values: cells(t.values)}))
      : (() => {
          // Put the columns back where they are in the sheet (e.g. AF onward) so the column rules still apply.
          const pad = Array(Math.max((src.startColumn ?? 1) - 1, 0)).fill(null);
          return [{name: src.sheetName ?? 'Sheet1', values: cells(src.values ?? []).map((r) => [...pad, ...r])}];
        })();
    const wb = workbookFromValues(sheets);
    // The stored data helps line up dates for a sheet without a Date column.
    const parsed = parseWorkbookData(wb, src.fileName ?? owner.source.fileHint, owner.source, (await loadOwnerDataset(id)) ?? undefined);
    await saveOwner(id, parsed.dataset, {fileName: src.fileName ?? null, sheetName: parsed.dataset.sheetName || null, checks: parsed.checks, warnings: parsed.warnings, hash, at});
    return 'saved';
  } catch (e) {
    await markFailed(id, message(e), at, src.fileName);
    return message(e);
  }
}

async function doSync(fresh: boolean): Promise<SyncResult> {
  const run = await prisma.syncRun.create({data: {fresh}});
  try {
    const {at, sources} = await fetchFeed(fresh);
    const summary: Record<string, string> = {};
    for (const id of [...OWNERS.map((o) => o.id), 'sales']) summary[id] = await storeSource(id, sources[id], at);
    await prisma.syncRun.update({where: {id: run.id}, data: {ok: true, finishedAt: new Date(), sources: summary}});
    await prisma.syncRun.deleteMany({where: {startedAt: {lt: new Date(Date.now() - KEEP_RUNS_DAYS * 864e5)}}});
    return {ok: true};
  } catch (e) {
    const error = message(e);
    await prisma.syncRun.update({where: {id: run.id}, data: {ok: false, error, finishedAt: new Date()}});
    console.error(`[sync] ${error}`);
    return {ok: false, error};
  }
}

export function startSyncTimer() {
  runSync();
  setInterval(() => runSync(), env.SYNC_INTERVAL_MINUTES * 60_000);
  console.log(`[sync] reading the sheets every ${env.SYNC_INTERVAL_MINUTES} min`);
}
