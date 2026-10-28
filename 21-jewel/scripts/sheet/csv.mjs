// Small RFC 4180 CSV parser: quoted fields, doubled quotes, embedded newlines, CRLF.
// Returns an array of row objects keyed by the header row (headers trimmed and lower-cased).

export function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;
  const src = text.replace(/^﻿/, '');
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (quoted) {
      if (c === '"') {
        if (src[i + 1] === '"') { field += '"'; i++; }
        else quoted = false;
      } else field += c;
      continue;
    }
    if (c === '"') { quoted = true; continue; }
    if (c === ',') { row.push(field); field = ''; continue; }
    if (c === '\r') continue;
    if (c === '\n') { row.push(field); rows.push(row); row = []; field = ''; continue; }
    field += c;
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  if (!rows.length) return [];
  const headers = rows[0].map((h) => h.trim().toLowerCase());
  return rows
    .slice(1)
    .filter((r) => r.some((v) => v.trim() !== ''))
    .map((r) => Object.fromEntries(headers.map((h, i) => [h, (r[i] ?? '').trim()])));
}

/** "TRUE", "yes", "1", "on" → true; "FALSE", "no", "0", "off", "" → false; anything else → null. */
export function parseBool(v) {
  const s = String(v ?? '').trim().toLowerCase();
  if (['true', 'yes', 'y', '1', 'on', 'x'].includes(s)) return true;
  if (['false', 'no', 'n', '0', 'off', ''].includes(s)) return false;
  return null;
}
