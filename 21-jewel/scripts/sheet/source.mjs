// Where the content Sheet's tabs come from, and the committed snapshot that stands in when the Sheet can't be reached.
// Used by the Astro loader at build time and by scripts/sheet-sync.mjs in the nightly Action.
//
// Env:
//   SHEET_CONTENT_ID         the Google Sheet id from its URL (share it as "Anyone with the link can view").
//   SHEET_CONTENT_URL_<TAB>  optional per-tab CSV URL override (e.g. a "Publish to web" CSV link). TAB upper-cased.
//   SHEET_SNAPSHOT=write     also write src/content/snapshot/<tab>.json after a successful fetch.
//   SHEET_CONTENT_OFF=1      skip the Sheet entirely (YAML + snapshot only). Handy for local builds.

import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { parseCsv } from './csv.mjs';

export const TABS = ['strings', 'offers', 'faqs', 'industries', 'testimonials', 'flags', 'guides'];
const SNAPSHOT_DIR = new URL('../../src/content/snapshot/', import.meta.url);

export function tabUrl(tab, env = process.env) {
  const direct = env[`SHEET_CONTENT_URL_${tab.toUpperCase()}`];
  if (direct) return direct;
  const id = env.SHEET_CONTENT_ID;
  if (!id) return null;
  return `https://docs.google.com/spreadsheets/d/${encodeURIComponent(id)}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(tab)}`;
}

/** Fetch one tab as row objects. Throws on network or non-CSV answers. */
export async function fetchTab(tab, { env = process.env, fetcher = fetch, timeoutMs = 10_000 } = {}) {
  const url = tabUrl(tab, env);
  if (!url) throw new Error('SHEET_CONTENT_ID is not set');
  const res = await fetcher(url, { signal: AbortSignal.timeout(timeoutMs), redirect: 'follow' });
  if (!res.ok) throw new Error(`HTTP ${res.status} for tab "${tab}"`);
  const text = await res.text();
  // A sheet that isn't shared answers with an HTML sign-in page.
  if (/^\s*<(!doctype|html)/i.test(text)) throw new Error(`tab "${tab}" returned HTML (is the Sheet shared as "Anyone with the link can view"?)`);
  return parseCsv(text);
}

export function snapshotPath(tab) {
  return new URL(`${tab}.json`, SNAPSHOT_DIR);
}

export function readSnapshot(tab) {
  const p = snapshotPath(tab);
  if (!existsSync(p)) return null;
  try {
    const parsed = JSON.parse(readFileSync(p, 'utf8'));
    return Array.isArray(parsed.rows) ? parsed.rows : null;
  } catch {
    return null;
  }
}

export function writeSnapshot(tab, rows) {
  mkdirSync(SNAPSHOT_DIR, { recursive: true });
  writeFileSync(snapshotPath(tab), JSON.stringify({ tab, fetched: new Date().toISOString(), rows }, null, 2) + '\n');
}

/**
 * Rows for a tab: live Sheet first, then the snapshot, then none.
 * Returns { rows, source: 'sheet' | 'snapshot' | 'none', error? }.
 */
export async function loadTab(tab, opts = {}) {
  const env = opts.env ?? process.env;
  if (env.SHEET_CONTENT_OFF !== '1' && tabUrl(tab, env)) {
    try {
      const rows = await fetchTab(tab, opts);
      if (env.SHEET_SNAPSHOT === 'write') writeSnapshot(tab, rows);
      return { rows, source: 'sheet' };
    } catch (err) {
      const snap = readSnapshot(tab);
      return { rows: snap ?? [], source: snap ? 'snapshot' : 'none', error: err instanceof Error ? err.message : String(err) };
    }
  }
  const snap = readSnapshot(tab);
  return { rows: snap ?? [], source: snap ? 'snapshot' : 'none' };
}
