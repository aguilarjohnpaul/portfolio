/**
 * 21 Jewel website: Google Sheet + Gmail.
 *
 * Paste this into the Sheet's Extensions → Apps Script editor.
 * Setup steps: docs/google-sheet-setup.md
 *
 * The website posts two kinds of leads here:
 *   - type "scorecard": a scorecard result → Leads tab, results email to the visitor, alert to JP.
 *   - type "review":    a free Website Review request → Reviews tab, confirmation to the requester, alert to JP.
 *
 * Script Properties (Project Settings → Script Properties):
 *   WEBHOOK_SECRET  required. Same value as SHEET_WEBHOOK_SECRET in Cloudflare.
 *   ALERT_TO        optional. Where alerts go. Defaults to the account running the script.
 *   SITE_URL        optional. Defaults to https://21jeweladvisory.com
 *   REVIEW_DAYS     optional. Review turnaround in business days. Defaults to 5.
 */

var FROM_ADDRESS = 'johnpaul@21jeweladvisory.com';
var SENDER_NAME = 'JP · 21 Jewel';
var TABS = {
  scorecard: {
    name: 'Leads',
    headers: ['Timestamp', 'Email', 'First name', 'Business type', 'Score', 'Out of', 'Band',
      'Fix 1', 'Fix 2', 'Fix 3', 'Headline', 'Tags', 'Email status'],
  },
  review: {
    name: 'Reviews',
    headers: ['Timestamp', 'Name', 'Email', 'Phone', 'Business', 'Website', 'City or area', 'Top services',
      'How customers find them', 'Format', 'Notes', 'Headline', 'Tags', 'Email status'],
  },
};
var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

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
  if (!lead.email || !EMAIL_RE.test(lead.email)) return reply_({ ok: false, error: 'bad_email' });
  var type = lead.type === 'review' ? 'review' : 'scorecard';

  var status = 'sent';
  try {
    if (type === 'review') sendReviewConfirmation_(lead, props);
    else sendResults_(lead, props);
  } catch (err) {
    status = 'failed: ' + err.message;
  }

  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    sheet_(type).appendRow(row_(type, lead, status).map(safeCell_));
  } finally {
    lock.releaseLock();
  }

  try {
    sendAlert_(type, lead, status, props);
  } catch (err) {
    // The alert is a nice-to-have. The row and the visitor email matter more.
  }

  // Only report success when the visitor's email actually went out.
  return reply_(status === 'sent' ? { ok: true } : { ok: false, error: 'email_failed' });
}

/** Run once from the editor: creates both tabs and asks for permissions. */
function setup() {
  sheet_('scorecard');
  sheet_('review');
  var props = PropertiesService.getScriptProperties();
  if (!props.getProperty('WEBHOOK_SECRET')) {
    throw new Error('Add WEBHOOK_SECRET under Project Settings → Script Properties, then run setup again.');
  }
  Logger.log('Sending as: ' + (fromAddress_() || Session.getEffectiveUser().getEmail()));
  Logger.log('Emails left today: ' + MailApp.getRemainingDailyQuota());
}

function row_(type, lead, status) {
  var ts = lead.timestamp || new Date().toISOString();
  if (type === 'review') {
    return [ts, lead.name, lead.email, lead.phone, lead.business, lead.noWebsite ? 'No website yet' : lead.website,
      lead.city, lead.services, lead.source, lead.format, lead.notes, lead.heroVariant, lead.tags, status];
  }
  var fixes = (lead.topFixes || []).slice(0, 3);
  return [ts, lead.email, lead.firstName, lead.industry, lead.points, lead.max, lead.band,
    fixes[0] || '', fixes[1] || '', fixes[2] || '', lead.heroVariant, lead.tags, status];
}

function sendResults_(lead, props) {
  var site = props.getProperty('SITE_URL') || 'https://21jeweladvisory.com';
  var review = site + '/review';
  var name = lead.firstName || 'there';
  var fixes = (lead.topFixes || []).slice(0, 3);
  var subject = 'Is your website losing you work? Your score: ' + lead.points + '/' + lead.max;
  var fixText = fixes.length
    ? ['Your top fixes:', ''].concat(fixes.map(function (f, i) { return (i + 1) + '. ' + f; }))
    : ["No leaks found. Keep doing what you're doing."];

  var text = [
    'Hi ' + name + ',',
    '',
    'Your score: ' + lead.points + ' / ' + lead.max + ' (' + lead.band + ')',
    lead.headline,
    '',
  ].concat(fixText).concat([
    '',
    "Want me to check this for you? I'll look at your website and Google profile and send you the top 3 things costing you calls. It's free: " + review,
    '',
    'JP · 21 Jewel · ' + FROM_ADDRESS,
  ]).join('\n');

  var html =
    '<div style="font-family:Arial,sans-serif;font-size:16px;line-height:1.55;color:#1E3B2F;max-width:560px">' +
    '<p>Hi ' + esc_(name) + ',</p>' +
    '<p style="font-size:28px;font-weight:bold;margin:16px 0 4px">' + esc_(lead.points) + ' / ' + esc_(lead.max) + '</p>' +
    '<p style="margin:0 0 4px;font-weight:bold">' + esc_(lead.band) + '</p>' +
    '<p style="margin:0 0 16px;color:#606D63">' + esc_(lead.headline) + '</p>' +
    (fixes.length
      ? '<p>Your top fixes:</p><ol>' + fixes.map(function (f) { return '<li style="margin-bottom:8px">' + esc_(f) + '</li>'; }).join('') + '</ol>'
      : "<p>No leaks found. Keep doing what you're doing.</p>") +
    "<p>Want me to check this for you? I'll look at your website and Google profile and send you the top 3 things costing you calls. It's free: " +
    '<a href="' + review + '" style="color:#9F5835">' + review.replace(/^https?:\/\//, '') + '</a></p>' +
    '<p>JP · 21 Jewel · ' + FROM_ADDRESS + '</p></div>';

  send_(lead.email, subject, text, html);
}

function sendReviewConfirmation_(lead, props) {
  var site = props.getProperty('SITE_URL') || 'https://21jeweladvisory.com';
  var days = props.getProperty('REVIEW_DAYS') || '5';
  var scorecard = site + '/scorecard';
  var name = (lead.name || '').split(/\s+/)[0] || 'there';
  var subject = 'Got it. Your free Website Review is on the way';
  var format = lead.format === 'pdf' ? 'a PDF' : lead.format === 'video' ? 'a short video' : 'a short video or PDF';

  var text = [
    'Hi ' + name + ',',
    '',
    'Thanks for asking for a Website Review for ' + lead.business + '.',
    "Within " + days + " business days, I'll send you " + format + ' with the top 3 things costing you calls, ranked, and a checklist you keep.',
    '',
    'While you wait, the 3-minute scorecard shows where you stand: ' + scorecard,
    '',
    'If anything changes, just reply to this email.',
    '',
    'JP · 21 Jewel · ' + FROM_ADDRESS,
  ].join('\n');

  var html =
    '<div style="font-family:Arial,sans-serif;font-size:16px;line-height:1.55;color:#1E3B2F;max-width:560px">' +
    '<p>Hi ' + esc_(name) + ',</p>' +
    '<p>Thanks for asking for a Website Review for <b>' + esc_(lead.business) + '</b>.</p>' +
    '<p>Within ' + esc_(days) + " business days, I'll send you " + format +
    ' with the top 3 things costing you calls, ranked, and a checklist you keep.</p>' +
    '<p>While you wait, the 3-minute scorecard shows where you stand: <a href="' + scorecard + '" style="color:#9F5835">' +
    scorecard.replace(/^https?:\/\//, '') + '</a></p>' +
    '<p>If anything changes, just reply to this email.</p>' +
    '<p>JP · 21 Jewel · ' + FROM_ADDRESS + '</p></div>';

  send_(lead.email, subject, text, html);
}

function sendAlert_(type, lead, status, props) {
  var to = props.getProperty('ALERT_TO') || Session.getEffectiveUser().getEmail();
  var subject, body;
  if (type === 'review') {
    subject = 'New Website Review request: ' + lead.business + ' · ' + lead.city;
    body = [
      'Name: ' + lead.name,
      'Email: ' + lead.email,
      'Phone: ' + (lead.phone || '-'),
      'Business: ' + lead.business,
      'Website: ' + (lead.noWebsite ? 'No website yet' : (lead.website || '-')),
      'City or area: ' + lead.city,
      'Top services: ' + lead.services,
      'How customers find them: ' + lead.source,
      'Format: ' + (lead.format || '-'),
      'Notes: ' + (lead.notes || '-'),
      'Confirmation email: ' + status,
    ].join('\n');
  } else {
    subject = 'New scorecard: ' + lead.points + '/' + lead.max + ' · ' + lead.email;
    body = [
      'Email: ' + lead.email,
      'Name: ' + (lead.firstName || '-'),
      'Business type: ' + (lead.industry || '-'),
      'Score: ' + lead.points + '/' + lead.max + ' (' + lead.band + ')',
      'Results email: ' + status,
    ].join('\n');
  }
  GmailApp.sendEmail(to, subject, body, { name: '21 Jewel website' });
}

function send_(to, subject, text, html) {
  var options = { htmlBody: html, name: SENDER_NAME, replyTo: FROM_ADDRESS };
  var from = fromAddress_();
  if (from) options.from = from;
  GmailApp.sendEmail(to, subject, text, options);
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

function sheet_(type) {
  var tab = TABS[type];
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(tab.name) || ss.insertSheet(tab.name);
  if (sh.getLastRow() === 0) {
    sh.appendRow(tab.headers);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, tab.headers.length).setFontWeight('bold');
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
