/**
 * Upshift CEO Dashboard — live data feed (Google Apps Script).
 *
 * Runs as the dashboard's Google account. Babu and Vasudha share their sheets with that account as Viewer,
 * so the sheets stay private. This script sends back only the ranges the dashboard needs, and only when the
 * request carries the dashboard password. Setup steps: apps-script/README.md
 *
 * Speed: reading the sheets takes a few seconds, so the script keeps a ready snapshot (refreshed every
 * 5 minutes by a timer — run setup() once to start it). The dashboard gets the snapshot back straight away;
 * its Refresh button asks for a fresh read instead.
 */

// Password for the dashboard sign-in. Change it here (then Deploy → Manage deployments → Edit → New version).
const PASSWORD = 'SET_YOUR_PASSWORD_HERE'; // must match APPS_SCRIPT_PASSWORD in backend/.env

const SOURCES = {
  babu: {
    url: 'PASTE_BABU_SHEET_LINK_HERE', // QT Career campaign - Babu
    tab: 'Reports', // tab name, matched ignoring upper/lower case
    range: '', // '' = whole tab; the dashboard finds every campaign block in it
  },
  vasudha: {
    url: 'PASTE_VASUDHA_SHEET_LINK_HERE', // QT Hitech City META AD SPENT
    // Every tab is sent; the dashboard reads each one that has a Campaign Name / Leads / Amount Spent table.
    allTabs: true,
    keepBlankRows: true, // blank rows mark where her tables end
  },
  // Sales page: every tab is one workshop / campaign with its students, amounts and payment dates.
  // The dashboard finds the Amount and Payment date columns in each tab itself, wherever they are.
  sales: {
    url: 'https://docs.google.com/spreadsheets/d/1Zklgas4U3QwsirA7X2fk1vQjSYkS23K0gTii_-h9XfQ/edit', // Attendees For WS From Meta Leads
    allTabs: true,
  },
};

const SNAPSHOT_KEY = 'snapshot-v2';
const CHUNK_CHARS = 90000; // one cache entry holds at most 100 KB, so a big snapshot is split across several
const SNAPSHOT_SECONDS = 6 * 60 * 60; // kept up to 6 hours; the timer replaces it every 5 minutes

function doPost(e) {
  var body = {};
  try {
    body = JSON.parse(e.postData.contents);
  } catch (err) {}
  if (body.password !== PASSWORD) {
    Utilities.sleep(1500); // slows down password guessing
    return json_(JSON.stringify({ok: false, error: 'unauthorized'}));
  }
  var feed = body.fresh ? null : readCache_();
  return json_(feed || buildSnapshot_());
}

// Opening the web-app link in a browser just confirms it's running; no data is sent without the password.
function doGet() {
  return json_(JSON.stringify({ok: true, service: 'upshift-dashboard'}));
}

/** Timer job: re-read the sheets so the next dashboard load is instant. */
function refreshSnapshot() {
  buildSnapshot_();
}

/** Run once from the editor (select "setup" → Run) to start the 5-minute timer. Safe to run again. */
function setup() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'refreshSnapshot') ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('refreshSnapshot').timeBased().everyMinutes(5).create();
  buildSnapshot_();
  Logger.log('Timer started — snapshot refreshes every 5 minutes.');
}

function buildSnapshot_() {
  var sources = {};
  Object.keys(SOURCES).forEach(function (id) {
    try {
      sources[id] = read_(SOURCES[id]);
    } catch (err) {
      sources[id] = {ok: false, error: String((err && err.message) || err)};
    }
  });
  var feed = JSON.stringify({ok: true, fetchedAt: new Date().toISOString(), sources: sources});
  writeCache_(feed);
  return feed;
}

function writeCache_(feed) {
  var parts = {};
  var n = Math.ceil(feed.length / CHUNK_CHARS);
  for (var i = 0; i < n; i++) parts[SNAPSHOT_KEY + ':' + i] = feed.substr(i * CHUNK_CHARS, CHUNK_CHARS);
  parts[SNAPSHOT_KEY] = String(n);
  try {
    CacheService.getScriptCache().putAll(parts, SNAPSHOT_SECONDS);
  } catch (err) {
    // Too big for the cache: still works, just reads the sheets on every request.
  }
}

function readCache_() {
  var cache = CacheService.getScriptCache();
  var n = Number(cache.get(SNAPSHOT_KEY));
  if (!n) return null;
  var keys = [];
  for (var i = 0; i < n; i++) keys.push(SNAPSHOT_KEY + ':' + i);
  var got = cache.getAll(keys);
  var out = '';
  for (var j = 0; j < n; j++) {
    if (got[keys[j]] == null) return null; // a piece expired: read the sheets afresh
    out += got[keys[j]];
  }
  return out;
}

function read_(src) {
  if (!src.url || src.url.indexOf('PASTE_') === 0) throw new Error('Sheet link not set in the script yet');
  var ss = SpreadsheetApp.openByUrl(src.url);
  var sheets = ss.getSheets();
  if (src.allTabs) {
    return {
      ok: true,
      fileName: ss.getName(),
      tabs: sheets.map(function (s) {
        return {name: s.getName(), hidden: s.isSheetHidden(), values: src.keepBlankRows ? whole_(s) : trimmed_(s)};
      }),
    };
  }
  var sheet = sheets[0];
  if (src.tab) {
    var want = src.tab.toLowerCase();
    sheet =
      sheets.filter(function (s) { return s.getName().toLowerCase() === want; })[0] ||
      sheets.filter(function (s) { return s.getName().toLowerCase().indexOf(want.replace(/s$/, '')) >= 0; })[0];
    if (!sheet) throw new Error('No "' + src.tab + '" tab in ' + ss.getName());
  }
  var lastRow = Math.max(sheet.getLastRow(), 1);
  var range;
  if (src.range) {
    var cols = src.range.split(':');
    range = sheet.getRange(cols[0] + '1:' + cols[1] + lastRow);
  } else {
    range = sheet.getRange(1, 1, lastRow, Math.max(sheet.getLastColumn(), 1));
  }
  return {
    ok: true,
    fileName: ss.getName(),
    sheetName: sheet.getName(),
    startColumn: range.getColumn(),
    values: range.getDisplayValues(), // exactly what's shown in the sheet, e.g. "9/1/2026", "1,569.13"
  };
}

/** A tab's used cells as shown in the sheet, blank rows included. */
function whole_(sheet) {
  var rows = sheet.getLastRow();
  var cols = sheet.getLastColumn();
  if (!rows || !cols) return [];
  return sheet.getRange(1, 1, rows, cols).getDisplayValues();
}

/** A tab's used cells as shown in the sheet, without the blank rows and the empty columns on the right. */
function trimmed_(sheet) {
  var rows = sheet.getLastRow();
  var cols = sheet.getLastColumn();
  if (!rows || !cols) return [];
  var values = sheet.getRange(1, 1, rows, cols).getDisplayValues();
  var width = 0;
  values = values.filter(function (r) {
    for (var c = r.length - 1; c >= 0; c--) {
      if (r[c] !== '') {
        if (c + 1 > width) width = c + 1;
        return true;
      }
    }
    return false;
  });
  return values.map(function (r) { return r.slice(0, width); });
}

function json_(text) {
  return ContentService.createTextOutput(text).setMimeType(ContentService.MimeType.JSON);
}
