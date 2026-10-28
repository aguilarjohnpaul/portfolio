// Build-time glue between the Google Sheet (scripts/sheet/source.mjs) and the YAML content loaders.
// Loads every tab once per build, applies overrides per document, and prints one summary.
// Never runs in the browser.

import { TABS, loadTab } from '../../scripts/sheet/source.mjs';
import { applyOverrides, emptySet, newReport, type OverrideSet, type Report, type TabName } from './overrides';

interface Loaded { set: OverrideSet; sources: Record<string, string>; errors: string[] }
let loading: Promise<Loaded> | null = null;
const report: Report = newReport();
let summaryPrinted = false;

async function loadAll(): Promise<Loaded> {
  const set = emptySet();
  const sources: Record<string, string> = {};
  const errors: string[] = [];
  await Promise.all(
    (TABS as TabName[]).map(async (tab) => {
      const r = await loadTab(tab);
      set[tab] = r.rows;
      sources[tab] = r.source;
      if (r.error) errors.push(`${tab}: ${r.error}${r.source === 'snapshot' ? ' (used the snapshot)' : ' (used YAML only)'}`);
    }),
  );
  return { set, sources, errors };
}

/** The Sheet's rows, fetched once per build. */
export function overrides(): Promise<Loaded> {
  if (!loading) loading = loadAll();
  return loading;
}

/** Apply the Sheet to one YAML document in place. */
export async function withOverrides<T extends Record<string, unknown>>(docName: string, data: T): Promise<T> {
  const { set } = await overrides();
  applyOverrides(docName, data, set, report);
  return data;
}

type Log = { info: (s: string) => void; warn: (s: string) => void };
let timer: ReturnType<typeof setTimeout> | null = null;

/** Print one per-build summary shortly after the last loader finishes. Safe to call from every loader. */
export function printSummary(log: Log): void {
  if (summaryPrinted) return;
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => { summaryPrinted = true; summary(log).catch(() => {}); }, 100);
}

async function summary(log: Log) {
  const { sources, errors } = await overrides();
  const live = Object.values(sources).filter((s) => s === 'sheet').length;
  const snap = Object.values(sources).filter((s) => s === 'snapshot').length;
  if (live === 0 && snap === 0) {
    log.info('Content Sheet: not configured (SHEET_CONTENT_ID unset) and no snapshot. YAML only.');
  } else {
    log.info(`Content Sheet: ${live} tab(s) live, ${snap} from snapshot. ${report.applied.length} override(s) applied.`);
  }
  for (const e of errors) log.warn(`Content Sheet: ${e}`);
  for (const w of report.warnings) log.warn(`Content Sheet: ${w}`);
}

/** For tests and the seed endpoint. */
export const currentReport = () => report;
