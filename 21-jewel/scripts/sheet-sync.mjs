// Nightly (and on demand): pull every content tab from the Sheet and write src/content/snapshot/*.json.
// The Action commits the snapshot when it changed, so the site builds from the last good copy if Google is down.
// Usage: SHEET_CONTENT_ID=... node scripts/sheet-sync.mjs

import { TABS, fetchTab, writeSnapshot } from './sheet/source.mjs';

if (!process.env.SHEET_CONTENT_ID) {
  console.error('SHEET_CONTENT_ID is not set. Nothing to sync.');
  process.exit(0);
}

let failed = 0;
for (const tab of TABS) {
  try {
    const rows = await fetchTab(tab);
    writeSnapshot(tab, rows);
    console.log(`${tab}: ${rows.length} row(s)`);
  } catch (err) {
    failed++;
    console.error(`${tab}: ${err instanceof Error ? err.message : err}`);
  }
}
process.exit(failed === TABS.length ? 1 : 0);
