/**
 * 21 Jewel website: Google Sheet + Gmail.
 *
 * Paste this into the Sheet's Extensions → Apps Script editor.
 * Setup steps: docs/google-sheet-setup.md
 *
 * The website posts two kinds of leads here:
 *   - type "scorecard": a scorecard result → Leads tab, results email to the visitor, alert to JP.
 *   - type "audit":     a free Local Search Audit request → Audits tab, confirmation to the requester, alert to JP.
 *
 * Follow-ups (Change 03 §7.2): run `installFollowUps` once from the editor. Every morning at 9 Central,
 * `followUps_` reads the Audits tab and, by the Status column:
 *   new        → day 5: a reminder to JP that the audit is overdue (no email to the lead)
 *   delivered  → day 12: "Did you get to the three fixes?" to the lead; day 30: "How's the phone?" to the lead
 *   anything else (followed-up, client, stop) → nothing
 * JP changes Status by hand. "Next touch" shows what will go out and when. Copy is in docs/follow-up-emails.md.
 *
 * Script Properties (Project Settings → Script Properties):
 *   WEBHOOK_SECRET  required. Same value as SHEET_WEBHOOK_SECRET in Cloudflare.
 *   ALERT_TO        optional. Where alerts go. Defaults to the account running the script.
 *   SITE_URL        optional. Defaults to https://21jeweladvisory.com
 *   AUDIT_DAYS      optional. Audit turnaround in business days. Defaults to 5.
 *   CAL_URL         optional. Booking link for follow-up emails. Defaults to the site's /audit page.
 */

var FROM_ADDRESS = 'johnpaul@21jeweladvisory.com';
var SENDER_NAME = 'JP · 21 Jewel Advisory';
var SIGNATURE = 'JP · 21 Jewel Advisory · (737) 391-3041 · ' + FROM_ADDRESS;
var TABS = {
  scorecard: {
    name: 'Leads',
    headers: ['Timestamp', 'Email', 'First name', 'Business type', 'Score', 'Out of', 'Band',
      'Fix 1', 'Fix 2', 'Fix 3', 'Headline', 'Tags', 'Email status'],
  },
  audit: {
    name: 'Audits',
    headers: ['Timestamp', 'Id', 'Business', 'What they do', 'City or ZIP', 'Website', 'Email', 'Phone',
      "What's going on", 'How they heard', 'Page', 'UTM source', 'UTM medium', 'UTM campaign', 'Headline', 'Tags',
      'Email status', 'Status', 'Delivered on', 'Last touch', 'Next touch'],
  },
};
var STATUS = { NEW: 'new', DELIVERED: 'delivered', FOLLOWED: 'followed-up', CLIENT: 'client', STOP: 'stop' };
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
  // The pre-Change-03 site posts type "review" from /review. Treat it as an audit request so the live form
  // keeps working until the new site is deployed.
  if (lead.type === 'review') lead = reviewToAudit_(lead);
  var type = lead.type === 'audit' ? 'audit' : 'scorecard';

  var status = 'sent';
  try {
    if (type === 'audit') sendAuditConfirmation_(lead, props);
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
  sheet_('audit');
  var props = PropertiesService.getScriptProperties();
  if (!props.getProperty('WEBHOOK_SECRET')) {
    throw new Error('Add WEBHOOK_SECRET under Project Settings → Script Properties, then run setup again.');
  }
  Logger.log('Sending as: ' + (fromAddress_() || Session.getEffectiveUser().getEmail()));
  Logger.log('Emails left today: ' + MailApp.getRemainingDailyQuota());
}

function row_(type, lead, status) {
  var ts = lead.timestamp || new Date().toISOString();
  if (type === 'audit') {
    return [ts, lead.id, lead.business, lead.trade, lead.city, lead.noWebsite ? 'No website yet' : lead.website,
      lead.email, lead.phone, lead.situation, lead.source, lead.page, lead.utm_source, lead.utm_medium, lead.utm_campaign,
      lead.heroVariant, lead.tags, status, STATUS.NEW, '', '', 'JP reminder on day 5'];
  }
  var fixes = (lead.topFixes || []).slice(0, 3);
  return [ts, lead.email, lead.firstName, lead.industry, lead.points, lead.max, lead.band,
    fixes[0] || '', fixes[1] || '', fixes[2] || '', lead.heroVariant, lead.tags, status];
}

function sendResults_(lead, props) {
  var site = props.getProperty('SITE_URL') || 'https://21jeweladvisory.com';
  var auditUrl = site + '/audit';
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
    "Want me to check this for you? The free Local Search Audit is a 10-minute video and a one-page scorecard with the top 3 things costing you calls: " + auditUrl,
    '',
    SIGNATURE,
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
    "<p>Want me to check this for you? The free Local Search Audit is a 10-minute video and a one-page scorecard with the top 3 things costing you calls: " +
    '<a href="' + auditUrl + '" style="color:#9F5835">' + auditUrl.replace(/^https?:\/\//, '') + '</a></p>' +
    '<p>' + esc_(SIGNATURE) + '</p></div>';

  send_(lead.email, subject, text, html);
}

/** Maps an old /review request onto the audit fields. */
function reviewToAudit_(r) {
  return {
    type: 'audit',
    id: 'r' + new Date().getTime().toString(36),
    timestamp: r.timestamp,
    business: r.business || '',
    trade: r.services || '',
    city: r.city || '',
    website: r.website || '',
    noWebsite: !!r.noWebsite,
    email: r.email,
    phone: r.phone || '',
    situation: 'old form: ' + (r.source || '-'),
    source: [r.name ? 'Name: ' + r.name : '', r.notes ? 'Notes: ' + r.notes : '', r.format ? 'Format: ' + r.format : ''].filter(String).join(' · '),
    page: '/review',
    utm_source: '', utm_medium: '', utm_campaign: '',
    heroVariant: r.heroVariant || 'a',
    tags: r.tags || '',
    secret: r.secret,
  };
}

function sendAuditConfirmation_(lead, props) {
  var days = props.getProperty('AUDIT_DAYS') || '5';
  var cal = props.getProperty('CAL_URL') || '';
  var subject = 'Got it. Your free Local Search Audit is on the way';
  var text = [
    'Hi there,',
    '',
    'Thanks for asking for a Local Search Audit for ' + lead.business + '.',
    'Within ' + days + " business days, I'll send you a 10-minute screen recording and a one-page scorecard: how you show up on Google, Bing and Apple Maps, what your reviews say, whether your site gets the call, and the top 3 fixes, ranked.",
    '',
    cal ? "If you'd rather talk it through live, grab 20 minutes here: " + cal : '',
    'If anything changes, just reply to this email.',
    '',
    SIGNATURE,
  ].filter(function (l) { return l !== null; }).join('\n');
  var html =
    '<div style="font-family:Arial,sans-serif;font-size:16px;line-height:1.55;color:#1E3B2F;max-width:560px">' +
    '<p>Hi there,</p>' +
    '<p>Thanks for asking for a Local Search Audit for <b>' + esc_(lead.business) + '</b>.</p>' +
    '<p>Within ' + esc_(days) + " business days, I'll send you a 10-minute screen recording and a one-page scorecard: how you show up on Google, Bing and Apple Maps, what your reviews say, whether your site gets the call, and the top 3 fixes, ranked.</p>" +
    (cal ? '<p>If you\'d rather talk it through live, grab 20 minutes here: <a href="' + cal + '" style="color:#9F5835">' + cal.replace(/^https?:\/\//, '') + '</a></p>' : '') +
    '<p>If anything changes, just reply to this email.</p>' +
    '<p>' + esc_(SIGNATURE) + '</p></div>';
  send_(lead.email, subject, text, html);
}

function sendAlert_(type, lead, status, props) {
  var to = props.getProperty('ALERT_TO') || Session.getEffectiveUser().getEmail();
  var subject, body;
  if (type === 'audit') {
    subject = 'New audit request: ' + lead.business + ' · ' + lead.trade + ' · ' + lead.city;
    body = [
      'Business: ' + lead.business,
      'What they do: ' + lead.trade,
      'City or ZIP: ' + lead.city,
      'Website: ' + (lead.noWebsite ? 'No website yet' : (lead.website || '-')),
      'Email: ' + lead.email,
      'Phone: ' + (lead.phone || '-'),
      "What's going on: " + lead.situation,
      'How they heard: ' + (lead.source || '-'),
      'Page: ' + (lead.page || '-') + (lead.utm_source ? ' · from ' + lead.utm_source + '/' + lead.utm_medium + '/' + lead.utm_campaign : ''),
      'Headline: ' + lead.heroVariant,
      'Confirmation email: ' + status,
      '',
      'Due in ' + (props.getProperty('AUDIT_DAYS') || '5') + ' business days. Set Status to "delivered" in the Audits tab when you send it.',
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
  GmailApp.sendEmail(to, subject, body, { name: '21 Jewel Advisory website' });
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

/* ---------- Follow-ups (Change 03 §7.2) ---------- */

/** Run once from the editor: a daily trigger at 9am Central. Running it again replaces the old trigger. */
function installFollowUps() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'followUps_') ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('followUps_').timeBased().everyDays(1).atHour(9).inTimezone('America/Chicago').create();
  sheet_('audit');
  SpreadsheetApp.getUi && SpreadsheetApp.getUi().alert('Follow-ups installed. They run every morning at 9 Central.');
}

function followUps_() {
  var props = PropertiesService.getScriptProperties();
  var sh = sheet_('audit');
  if (sh.getLastRow() < 2) return;
  var h = TABS.audit.headers;
  var col = function (name) { return h.indexOf(name) + 1; };
  var values = sh.getRange(2, 1, sh.getLastRow() - 1, h.length).getValues();
  var today = new Date();
  var alertTo = props.getProperty('ALERT_TO') || Session.getEffectiveUser().getEmail();
  var cal = props.getProperty('CAL_URL') || ((props.getProperty('SITE_URL') || 'https://21jeweladvisory.com') + '/audit');

  values.forEach(function (r, i) {
    var row = i + 2;
    var status = String(r[col('Status') - 1] || STATUS.NEW).trim().toLowerCase();
    var email = String(r[col('Email') - 1] || '').trim();
    var business = String(r[col('Business') - 1] || '').trim();
    var created = toDate_(r[col('Timestamp') - 1]);
    var delivered = toDate_(r[col('Delivered on') - 1]);
    var lastTouch = String(r[col('Last touch') - 1] || '');
    var next = '';
    if (!email || !created) return;

    if (status === STATUS.NEW) {
      var age = businessDays_(created, today);
      if (age >= 5 && lastTouch.indexOf('jp-reminder') < 0) {
        GmailApp.sendEmail(alertTo, 'Audit overdue: ' + business, 'The audit for ' + business + ' (' + email + ') was requested ' + age + ' business days ago and is still marked "new".\nSend it, then set Status to "delivered" in the Audits tab.', { name: '21 Jewel Advisory website' });
        lastTouch = 'jp-reminder ' + fmt_(today);
        next = 'Waiting on you';
      } else {
        next = age >= 5 ? 'Waiting on you' : 'JP reminder on day 5';
      }
    } else if (status === STATUS.DELIVERED && delivered) {
      var days = calendarDays_(delivered, today);
      if (days >= 30 && lastTouch.indexOf('day30') < 0) {
        sendFollowUp_(email, business, 30, cal);
        lastTouch = 'day30 ' + fmt_(today);
        next = 'Done. Set Status to followed-up, client or stop';
      } else if (days >= 12 && lastTouch.indexOf('day12') < 0 && lastTouch.indexOf('day30') < 0) {
        sendFollowUp_(email, business, 12, cal);
        lastTouch = 'day12 ' + fmt_(today);
        next = 'Day 30 email on ' + fmt_(addDays_(delivered, 30));
      } else {
        next = days < 12 ? 'Day 12 email on ' + fmt_(addDays_(delivered, 12))
          : days < 30 ? 'Day 30 email on ' + fmt_(addDays_(delivered, 30)) : 'Done';
      }
    } else if (status === STATUS.DELIVERED && !delivered) {
      next = 'Fill in "Delivered on" (a date) to start the follow-ups';
    } else {
      next = 'None (' + status + ')';
    }
    sh.getRange(row, col('Last touch')).setValue(lastTouch);
    sh.getRange(row, col('Next touch')).setValue(next);
  });
}

/** Day 12 and day 30 emails. Copy mirrors docs/follow-up-emails.md. */
function sendFollowUp_(email, business, day, cal) {
  var subject, text, html;
  if (day === 12) {
    subject = 'Did you get to the three fixes?';
    text = [
      'Hi there,',
      '',
      "It's been about two weeks since I sent the audit for " + business + ". Did you get to any of the three fixes?",
      '',
      "If you did, I'd like to hear what moved. If you didn't have the time, that's normal, and it's the whole reason Get Found Setup exists: I do the three fixes and the rest of the profile in 10 business days for $650, and you spend about 30 minutes.",
      '',
      'Either way, reply and tell me where things stand, or grab 20 minutes here: ' + cal,
      '',
      SIGNATURE,
    ].join('\n');
  } else {
    subject = "How's the phone?";
    text = [
      'Hi there,',
      '',
      'A month ago I sent you the audit for ' + business + ". Quick check: is the phone any busier?",
      '',
      "If yes, good. Keep asking for reviews after every job; that's the part that compounds. If no, the fastest way to find out why is to compare today's numbers with the ones in the audit. I can do that on a 20-minute call: " + cal,
      '',
      "If you'd rather I stop checking in, just reply \"stop\" and I will.",
      '',
      SIGNATURE,
    ].join('\n');
  }
  html = '<div style="font-family:Arial,sans-serif;font-size:16px;line-height:1.55;color:#1E3B2F;max-width:560px">' +
    text.split('\n\n').map(function (p) { return '<p>' + esc_(p).replace(/\n/g, '<br>').replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" style="color:#9F5835">$1</a>') + '</p>'; }).join('') + '</div>';
  send_(email, subject, text, html);
}

function toDate_(v) {
  if (v instanceof Date && !isNaN(v)) return v;
  if (!v) return null;
  var d = new Date(v);
  return isNaN(d) ? null : d;
}
function addDays_(d, n) { var x = new Date(d); x.setDate(x.getDate() + n); return x; }
function calendarDays_(a, b) { return Math.floor((b - a) / 86400000); }
function businessDays_(a, b) {
  var n = 0, d = new Date(a);
  while (d < b) { d.setDate(d.getDate() + 1); var w = d.getDay(); if (w !== 0 && w !== 6) n++; }
  return n;
}
function fmt_(d) { return Utilities.formatDate(d, 'America/Chicago', 'MMM d'); }
