// One-time Kit setup: creates the scorecard custom fields and tags.
// Usage: KIT_API_KEY=your_v4_key node scripts/kit-setup.mjs
// Safe to run twice: existing tags are returned, existing fields are skipped.
import { readFileSync } from 'node:fs';
import { parse } from 'yaml';

const key = process.env.KIT_API_KEY;
if (!key) { console.error('Set KIT_API_KEY first.'); process.exit(1); }
const API = 'https://api.kit.com/v4';
const call = async (method, path, body) => {
  const res = await fetch(API + path, {
    method,
    headers: { 'Content-Type': 'application/json', 'X-Kit-Api-Key': key },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`${method} ${path}: ${res.status} ${JSON.stringify(json)}`);
  return json;
};

// Fields the site writes when Kit is the fallback (no SHEET_WEBHOOK_URL).
const FIELDS = ['score_total', 'score_max', 'band', 'industry', 'top_fixes', 'hero_variant',
  'business_name', 'phone', 'website', 'city', 'top_services', 'review_format'];

const sc = parse(readFileSync(new URL('../src/content/scorecard.yaml', import.meta.url), 'utf8'));
const pages = parse(readFileSync(new URL('../src/content/pages.yaml', import.meta.url), 'utf8'));
const TAGS = ['hero-a', 'hero-b', 'review-requested',
  ...sc.bands.map((b) => `scorecard-${b.slug}`),
  ...sc.industry.options.map((o) => `industry-${o.value}`),
  ...pages.review.form.sources.map((o) => `source-${o.value}`)];

const existing = new Set((await call('GET', '/custom_fields?per_page=1000')).custom_fields.map((f) => f.key));
for (const label of FIELDS) {
  if (existing.has(label)) { console.log(`field ${label}: exists`); continue; }
  const { custom_field: f } = await call('POST', '/custom_fields', { label });
  console.log(`field ${label}: created (key ${f.key})`);
  if (f.key !== label) console.warn(`  WARNING: Kit made the key "${f.key}". The site sends "${label}".`);
}

const ids = {};
for (const name of TAGS) ids[name] = (await call('POST', '/tags', { name })).tag.id;
console.log('\nOptional: paste this into the KIT_TAG_IDS environment variable in Cloudflare Pages:');
console.log(JSON.stringify(ids));
