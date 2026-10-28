/**
 * 21 Jewel website: content Sheet menu.
 *
 * Paste this into the "21J Site Content" Sheet's Extensions → Apps Script editor (a different Sheet
 * from the leads one). Setup: docs/google-sheet-content-setup.md. Daily use: docs/how-to-edit-the-sheet.md.
 *
 * FIRST TIME: pick START_HERE in the function dropdown above and click Run. It creates and fills
 * every tab, then reload the Sheet to see the 21J menu. (Clicking Run on onOpen does nothing useful.)
 *
 * Menu "21J":
 *   Publish site            → asks Cloudflare to rebuild production (live in about 2 minutes)
 *   Preview changes         → rebuilds the preview branch instead
 *   Check for problems      → lists rows the site would ignore, before you publish
 *   Set up tabs from site   → creates the tabs and fills them (live site first, then the copy on GitHub)
 *   Refresh keys from site  → adds any new keys and updates the "default" column; never touches your values
 *
 * Script Properties (Project Settings → Script Properties):
 *   DEPLOY_HOOK_URL   required for Publish. Cloudflare Pages → Settings → Builds → Deploy hooks.
 *   PREVIEW_HOOK_URL  optional. A second deploy hook pointed at the preview branch.
 *   SITE_URL          optional. Defaults to https://21jeweladvisory.com
 */

var TABS = ['strings', 'offers', 'faqs', 'industries', 'testimonials', 'flags', 'guides'];
// Where the tab layout comes from, in order. The live site's file exists once Change 03 is deployed;
// until then the copy committed to GitHub is used.
var SEED_FALLBACKS = [
  'https://raw.githubusercontent.com/aguilarjohnpaul/portfolio/claude/21-jewel-advisory-concept-i3vpz5/21-jewel/docs/google-sheet-content/seed.json',
  'https://raw.githubusercontent.com/aguilarjohnpaul/portfolio/claude/change-03-local-search/21-jewel/docs/google-sheet-content/seed.json',
];

/** Run this once from the editor (function dropdown → START_HERE → Run). Then reload the Sheet. */
function START_HERE() {
  setupTabs();
  say_('Done. Close this tab and reload the Sheet: a "21J" menu appears next to Help.');
}

/** Shows a message as a dialog when run from the Sheet, or in the execution log when run from the editor. */
function say_(msg, title) {
  try { SpreadsheetApp.getUi().alert(title ? title + '\n\n' + msg : msg); }
  catch (e) { Logger.log((title ? title + ': ' : '') + msg); try { SpreadsheetApp.getActive().toast(msg.slice(0, 200), '21J', 10); } catch (e2) {} }
}
var EDITABLE = { strings: 'value', offers: null, faqs: null, industries: null, testimonials: null, flags: 'on' };

function onOpen() {
  SpreadsheetApp.getUi().createMenu('21J')
    .addItem('Publish site', 'publishSite')
    .addItem('Preview changes', 'previewSite')
    .addItem('Check for problems', 'checkProblems')
    .addSeparator()
    .addItem('Set up tabs from site', 'setupTabs')
    .addItem('Refresh keys from site', 'refreshKeys')
    .addToUi();
}

function siteUrl_() {
  return (PropertiesService.getScriptProperties().getProperty('SITE_URL') || 'https://21jeweladvisory.com').replace(/\/$/, '');
}

function hook_(name) {
  var url = PropertiesService.getScriptProperties().getProperty(name);
  if (!url) throw new Error(name + ' is not set. Project Settings → Script Properties.');
  var res = UrlFetchApp.fetch(url, { method: 'post', muteHttpExceptions: true });
  if (res.getResponseCode() >= 300) throw new Error('Cloudflare answered ' + res.getResponseCode() + ': ' + res.getContentText().slice(0, 200));
}

function publishSite() {
  var problems = problems_();
  var ui = SpreadsheetApp.getUi();
  if (problems.length) {
    var go = ui.alert('Some rows will be ignored', problems.slice(0, 12).join('\n') + (problems.length > 12 ? '\n…' : '') + '\n\nPublish anyway? The site keeps its current text for those rows.', ui.ButtonSet.YES_NO);
    if (go !== ui.Button.YES) return;
  }
  hook_('DEPLOY_HOOK_URL');
  SpreadsheetApp.getActive().toast('Building. Live in about 2 minutes.', '21J', 8);
}

function previewSite() {
  hook_('PREVIEW_HOOK_URL');
  SpreadsheetApp.getActive().toast('Preview building. Check the Cloudflare preview link in about 2 minutes.', '21J', 8);
}

function checkProblems() {
  var problems = problems_();
  if (!problems.length) say_('No problems found. Everything here will apply on the next publish.');
  else say_(problems.join('\n'), problems.length + ' row(s) the site will ignore');
}

/** Rows the site would skip. Mirrors the checks in src/lib/overrides.ts. */
function problems_() {
  var out = [];
  var rows;
  rows = rows_('flags');
  rows.forEach(function (r, i) {
    var v = String(r.on || '').trim().toUpperCase();
    if (r.key && ['TRUE', 'FALSE', 'YES', 'NO', ''].indexOf(v) < 0) out.push('flags row ' + (i + 2) + ': "' + r.on + '" is not TRUE or FALSE');
  });
  rows = rows_('offers');
  rows.forEach(function (r, i) {
    var p = String(r.price_from || '').trim();
    if (p && !/^\$\d{1,3}(,\d{3})*(\.\d{2})?$/.test(p)) out.push('offers row ' + (i + 2) + ': price "' + p + '" should look like $650 or $1,450');
  });
  rows = rows_('faqs');
  rows.forEach(function (r, i) {
    var active = String(r.active || 'TRUE').trim().toUpperCase() !== 'FALSE';
    if (active && r.page && (!r.question || !r.answer)) out.push('faqs row ' + (i + 2) + ': missing question or answer');
  });
  rows = rows_('guides');
  rows.forEach(function (r, i) {
    var v = String(r.draft || '').trim().toUpperCase();
    if (r.slug && v && ['TRUE', 'FALSE', 'YES', 'NO'].indexOf(v) < 0) out.push('guides row ' + (i + 2) + ': draft "' + r.draft + '" is not TRUE or FALSE');
  });
  rows = rows_('strings');
  rows.forEach(function (r, i) {
    var v = String(r.value || '');
    if (/<\s*(script|iframe|object|embed)\b/i.test(v)) out.push('strings row ' + (i + 2) + ': HTML is not allowed');
    if (v.length > 2000) out.push('strings row ' + (i + 2) + ': longer than 2,000 characters');
    if (/^\[[A-Z0-9_ :]+\]$/.test(v.trim())) out.push('strings row ' + (i + 2) + ': looks like a placeholder');
  });
  return out;
}

function seed_() {
  var urls = [siteUrl_() + '/content-seed.json'].concat(SEED_FALLBACKS);
  var tried = [];
  for (var i = 0; i < urls.length; i++) {
    var res = UrlFetchApp.fetch(urls[i], { muteHttpExceptions: true, followRedirects: true });
    var text = res.getContentText();
    if (res.getResponseCode() === 200 && text.charAt(0) === '{') {
      try { var data = JSON.parse(text); if (data.columns && data.strings) return data; } catch (e) {}
    }
    tried.push(urls[i] + ' (' + res.getResponseCode() + ')');
  }
  throw new Error('Could not read the tab layout from any source:\n' + tried.join('\n'));
}

function sheet_(name, headers) {
  var ss = SpreadsheetApp.getActive();
  var sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight('bold');
    sh.setFrozenRows(1);
  }
  return sh;
}

function rows_(name) {
  var sh = SpreadsheetApp.getActive().getSheetByName(name);
  if (!sh || sh.getLastRow() < 2) return [];
  var values = sh.getDataRange().getValues();
  var headers = values[0].map(function (h) { return String(h).trim().toLowerCase(); });
  return values.slice(1).map(function (r) {
    var o = {};
    headers.forEach(function (h, i) { o[h] = r[i]; });
    return o;
  });
}

/** First run: create every tab and fill it from the site. Existing tabs are left alone (use Refresh). */
function setupTabs() {
  var seed = seed_();
  var ss = SpreadsheetApp.getActive();
  var made = [];
  TABS.forEach(function (tab) {
    if (ss.getSheetByName(tab)) return;
    var headers = seed.columns[tab];
    var sh = sheet_(tab, headers);
    var data = seed[tab].map(function (row) {
      return headers.map(function (h) {
        if (tab === 'strings' && h === 'value') return '';
        if (tab === 'strings' && h === 'notes') return '';
        var v = row[h];
        return v === undefined ? '' : (typeof v === 'boolean' ? (v ? 'TRUE' : 'FALSE') : v);
      });
    });
    if (data.length) sh.getRange(2, 1, data.length, headers.length).setValues(data);
    sh.autoResizeColumns(1, headers.length);
    if (tab === 'strings') { sh.setColumnWidth(2, 420); sh.setColumnWidth(3, 420); }
    made.push(tab + ' (' + data.length + ')');
  });
  var first = ss.getSheetByName('Sheet1');
  if (first && ss.getSheets().length > 1 && first.getLastRow() === 0) ss.deleteSheet(first);
  say_(made.length ? 'Created: ' + made.join(', ') + '\n\nEdit the "value" column (strings), prices (offers) or "on" (flags), then 21J → Publish site.' : 'All tabs already exist. Use "Refresh keys from site" to pick up new keys.');
}

/** Add new keys and update the "default" column on strings; add new ids/slugs/flags elsewhere. Never overwrites your edits. */
function refreshKeys() {
  var seed = seed_();
  var added = 0, updated = 0;
  // strings
  var sh = sheet_('strings', seed.columns.strings);
  var existing = rows_('strings');
  var byKey = {};
  existing.forEach(function (r, i) { byKey[String(r.key).trim()] = i + 2; });
  seed.strings.forEach(function (s) {
    var row = byKey[s.key];
    if (row) {
      var cell = sh.getRange(row, 3);
      if (String(cell.getValue()) !== s.default) { cell.setValue(s.default); updated++; }
    } else {
      sh.appendRow([s.key, '', s.default, s.page, '']);
      added++;
    }
  });
  // keyed tabs: add missing rows only
  var keyed = { offers: 'id', industries: 'slug', flags: 'key', guides: 'slug' };
  Object.keys(keyed).forEach(function (tab) {
    var k = keyed[tab];
    var t = sheet_(tab, seed.columns[tab]);
    var have = {};
    rows_(tab).forEach(function (r) { have[String(r[k]).trim()] = true; });
    seed[tab].forEach(function (row) {
      if (have[row[k]]) return;
      t.appendRow(seed.columns[tab].map(function (h) { var v = row[h]; return typeof v === 'boolean' ? (v ? 'TRUE' : 'FALSE') : (v === undefined ? '' : v); }));
      added++;
    });
  });
  // faqs: add pages that have no rows yet
  var f = sheet_('faqs', seed.columns.faqs);
  var pagesHave = {};
  rows_('faqs').forEach(function (r) { pagesHave[String(r.page).trim()] = true; });
  seed.faqs.forEach(function (row) {
    if (pagesHave[row.page]) return;
    f.appendRow([row.page, row.order, row.question, row.answer, 'TRUE']);
    added++;
  });
  sheet_('testimonials', seed.columns.testimonials);
  say_('Refreshed. ' + added + ' row(s) added, ' + updated + ' default(s) updated. Your values were not changed.');
}
