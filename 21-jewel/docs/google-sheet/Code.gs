/**
 * 21 Jewel scorecard: Google Sheet + Gmail.
 *
 * Paste this into the Sheet's Extensions → Apps Script editor.
 * Setup steps: docs/google-sheet-setup.md
 *
 * The website posts each scorecard lead here. This script:
 *   1. checks the shared secret,
 *   2. adds a row to the sheet,
 *   3. emails the visitor their breakdown,
 *   4. sends JP a short alert.
 *
 * Script Properties (Project Settings → Script Properties):
 *   WEBHOOK_SECRET  required. Same value as SHEET_WEBHOOK_SECRET in Cloudflare.
 *   ALERT_TO        optional. Where alerts go. Defaults to the account running the script.
 *   SITE_URL        optional. Defaults to https://21jeweladvisory.com
 */

var FROM_ADDRESS = 'johnpaul@21jeweladvisory.com';
var SENDER_NAME = 'JP · 21 Jewel';
var SHEET_NAME = 'Leads';
var HEADERS = [
  'Timestamp', 'Email', 'First name', 'Business', 'Team size',
  'Score', 'Get referred', 'Get hired', 'Get hired again', 'Band', 'Biggest leak',
  'Fix 1', 'Fix 2', 'Fix 3', 'Headline', 'Tags', 'Email status',
];

function doPost(e) {
  var props = PropertiesService.getScriptProperties();
  var lead;
  try {
    lead = JSON.parse(e.postData.contents);
  } catch (err) {
    return reply_({ ok: false, error: 'bad_json' });
  }
  var expected = props.getProperty('WEBHOOK_SECRET');
  if (!expected || lead.secret !== expected) return reply_({ ok: false, error: 'bad_secret' });
  if (!lead.email || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(lead.email)) return reply_({ ok: false, error: 'bad_email' });

  var fixes = (lead.topFixes || []).slice(0, 3);
  var status = 'sent';
  try {
    sendBreakdown_(lead, fixes, props);
  } catch (err) {
    status = 'failed: ' + err.message;
  }

  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    sheet_().appendRow([
      lead.timestamp || new Date().toISOString(), lead.email, lead.firstName, lead.business, lead.teamSize,
      lead.total, lead.referred, lead.hired, lead.again, lead.band, lead.weakestStage,
      fixes[0] || '', fixes[1] || '', fixes[2] || '', lead.heroVariant, lead.tags, status,
    ].map(safeCell_));
  } finally {
    lock.releaseLock();
  }

  try {
    sendAlert_(lead, status, props);
  } catch (err) {
    // The alert is a nice-to-have. The row and the visitor email matter more.
  }

  // Only report success when the visitor's email actually went out.
  return reply_(status === 'sent' ? { ok: true } : { ok: false, error: 'email_failed' });
}

/** Run once from the editor: creates the header row and asks for permissions. */
function setup() {
  sheet_();
  var props = PropertiesService.getScriptProperties();
  if (!props.getProperty('WEBHOOK_SECRET')) {
    throw new Error('Add WEBHOOK_SECRET under Project Settings → Script Properties, then run setup again.');
  }
  Logger.log('Sending as: ' + (fromAddress_() || Session.getEffectiveUser().getEmail()));
  Logger.log('Emails left today: ' + MailApp.getRemainingDailyQuota());
}

function sendBreakdown_(lead, fixes, props) {
  var site = props.getProperty('SITE_URL') || 'https://21jeweladvisory.com';
  var founding = site + '/founding-clients';
  var name = lead.firstName || 'there';
  var subject = 'Is your website losing you work? Your score: ' + lead.total + '/100';

  var text = [
    'Hi ' + name + ',',
    '',
    "Here's your breakdown.",
    '',
    'Get referred: ' + lead.referred + ' · Get hired: ' + lead.hired + ' · Get hired again: ' + lead.again,
    '',
    'Your biggest leak is ' + lead.weakestStage + '. Start with these three fixes:',
    '',
  ].concat(fixes.map(function (f, i) { return (i + 1) + '. ' + f; })).concat([
    '',
    "If you'd like help putting these in place, I'm taking on a few founding clients at no cost in exchange for a case study: " + founding,
    '',
    'JP · 21 Jewel · ' + FROM_ADDRESS,
  ]).join('\n');

  var html =
    '<div style="font-family:Arial,sans-serif;font-size:16px;line-height:1.55;color:#1E3B2F;max-width:560px">' +
    '<p>Hi ' + esc_(name) + ',</p>' +
    "<p>Here's your breakdown.</p>" +
    '<p style="font-size:28px;font-weight:bold;margin:16px 0 4px">' + esc_(lead.total) + ' / 100</p>' +
    '<p style="margin:0 0 16px;color:#606D63">' + esc_(lead.band) + '</p>' +
    '<p>Get referred: <b>' + esc_(lead.referred) + '</b> · Get hired: <b>' + esc_(lead.hired) +
    '</b> · Get hired again: <b>' + esc_(lead.again) + '</b></p>' +
    '<p>Your biggest leak is <b>' + esc_(lead.weakestStage) + '</b>. Start with these three fixes:</p>' +
    '<ol>' + fixes.map(function (f) { return '<li style="margin-bottom:8px">' + esc_(f) + '</li>'; }).join('') + '</ol>' +
    "<p>If you'd like help putting these in place, I'm taking on a few founding clients at no cost in exchange for a case study: " +
    '<a href="' + founding + '" style="color:#9F5835">' + founding.replace(/^https?:\/\//, '') + '</a></p>' +
    '<p>JP · 21 Jewel · ' + FROM_ADDRESS + '</p></div>';

  var options = { htmlBody: html, name: SENDER_NAME, replyTo: FROM_ADDRESS };
  var from = fromAddress_();
  if (from) options.from = from;
  GmailApp.sendEmail(lead.email, subject, text, options);
}

function sendAlert_(lead, status, props) {
  var to = props.getProperty('ALERT_TO') || Session.getEffectiveUser().getEmail();
  var subject = 'New scorecard: ' + lead.total + '/100 · ' + lead.email;
  var body = [
    'Email: ' + lead.email,
    'Name: ' + (lead.firstName || '-'),
    'Business: ' + (lead.business || '-'),
    'Team size: ' + (lead.teamSize || '-'),
    'Score: ' + lead.total + ' (' + lead.band + ')',
    'Biggest leak: ' + lead.weakestStage,
    'Breakdown email: ' + status,
  ].join('\n');
  GmailApp.sendEmail(to, subject, body, { name: '21 Jewel website' });
}

/**
 * Send as johnpaul@ when possible:
 * - the script runs as that account (Google Workspace), or
 * - it's set up in Gmail as a "Send mail as" address.
 * Otherwise send from the running account (replies still go to johnpaul@).
 */
function fromAddress_() {
  var me = Session.getEffectiveUser().getEmail();
  if (me && me.toLowerCase() === FROM_ADDRESS) return '';
  var aliases = GmailApp.getAliases().map(function (a) { return a.toLowerCase(); });
  return aliases.indexOf(FROM_ADDRESS) >= 0 ? FROM_ADDRESS : '';
}

function sheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
  if (sh.getLastRow() === 0) {
    sh.appendRow(HEADERS);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
  }
  return sh;
}

/** Stops typed text like "=HYPERLINK(...)" from running as a formula. */
function safeCell_(v) {
  if (v === null || v === undefined) return '';
  if (typeof v === 'string' && /^[=+\-@]/.test(v)) return "'" + v;
  return v;
}

function esc_(v) {
  return String(v === null || v === undefined ? '' : v)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function reply_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
