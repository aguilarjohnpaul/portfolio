// Google Sheet overrides (Change 03 §8). Pure functions, unit-tested.
// The Sheet can change values that already exist in the YAML. It can't add pages or sections,
// and it never touches links, ids, slugs, flags-by-string or file paths. Anything it can't apply
// becomes a build warning and the YAML value stands.

export type Row = Record<string, string>;
export type TabName = 'strings' | 'offers' | 'faqs' | 'industries' | 'testimonials' | 'flags';
export type OverrideSet = Record<TabName, Row[]>;
export interface Report { applied: string[]; warnings: string[] }

export const emptySet = (): OverrideSet => ({ strings: [], offers: [], faqs: [], industries: [], testimonials: [], flags: [] });
export const newReport = (): Report => ({ applied: [], warnings: [] });

/** Documents whose string fields the `strings` tab may override. */
export const STRING_DOCS = new Set(['site', 'home', 'pages', 'offers', 'industries', 'services', 'faqs']);
/** Field names the `strings` tab may never touch, wherever they appear. */
const DENY = /(^|\.)(href|id|slug|flag|photo|value|checkout_url|url|email|phone|phone_href|google_profile|linkedin|cal|tally|og_image|kind|locale)$/;
/** Exact "<doc>.<path>" keys that stay in the repo even though they are strings: identity, not copy. */
const DENY_KEYS = new Set(['site.brand.name', 'site.brand.legal_name', 'site.brand.founder', 'site.brand.location', 'site.nav.home_label', 'site.nav.skip']);
const MAX_LEN = 2000;

type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj => typeof v === 'object' && v !== null && !Array.isArray(v);

function truthy(v: string | undefined, fallback = true): boolean {
  const s = (v ?? '').trim().toLowerCase();
  if (!s) return fallback;
  if (['true', 'yes', 'y', '1', 'on', 'x'].includes(s)) return true;
  if (['false', 'no', 'n', '0', 'off'].includes(s)) return false;
  return fallback;
}

function cleanText(key: string, raw: string, report: Report): string | null {
  const v = raw.replace(/\r\n?/g, '\n').trim();
  if (!v) return null; // empty cell = no override
  if (v.length > MAX_LEN) { report.warnings.push(`${key}: value longer than ${MAX_LEN} characters, ignored`); return null; }
  if (/<\s*(script|iframe|object|embed)\b/i.test(v)) { report.warnings.push(`${key}: HTML tags aren't allowed, ignored`); return null; }
  if (/^\[[A-Z0-9_ :]+\]$/.test(v)) { report.warnings.push(`${key}: looks like a placeholder, ignored`); return null; }
  return v;
}

/** Walk a dotted path. Returns the parent object/array and the final key, or null when the path doesn't exist. */
function locate(root: unknown, path: string[]): { parent: Obj | unknown[]; key: string | number } | null {
  let cur: unknown = root;
  for (let i = 0; i < path.length - 1; i++) {
    const k = path[i];
    if (Array.isArray(cur)) { const n = Number(k); if (!Number.isInteger(n) || n < 0 || n >= cur.length) return null; cur = cur[n]; }
    else if (isObj(cur) && k in cur) cur = cur[k];
    else return null;
  }
  const last = path[path.length - 1];
  if (Array.isArray(cur)) { const n = Number(last); if (!Number.isInteger(n) || n < 0 || n >= cur.length) return null; return { parent: cur, key: n }; }
  if (isObj(cur) && last in cur) return { parent: cur, key: last };
  return null;
}

/** `strings` tab: key = "<doc>.<dotted.path>", value = new text. Only existing string fields, never denied names. */
export function applyStrings(docName: string, data: Obj, rows: Row[], report: Report): Obj {
  if (!STRING_DOCS.has(docName)) return data;
  const prefix = `${docName}.`;
  for (const row of rows) {
    const key = (row.key ?? '').trim();
    if (!key.startsWith(prefix)) continue;
    const path = key.slice(prefix.length).split('.').filter(Boolean);
    if (!path.length) { report.warnings.push(`${key}: no field after the document name`); continue; }
    if (DENY.test(path.join('.')) || DENY_KEYS.has(key)) { report.warnings.push(`${key}: this field can't be edited from the Sheet`); continue; }
    const hit = locate(data, path);
    if (!hit) { report.warnings.push(`${key}: no such field in ${docName}.yaml`); continue; }
    const current = (hit.parent as Obj)[hit.key as string];
    if (typeof current !== 'string') { report.warnings.push(`${key}: not a text field`); continue; }
    const v = cleanText(key, row.value ?? '', report);
    if (v === null || v === current) continue;
    (hit.parent as Obj)[hit.key as string] = v;
    report.applied.push(key);
  }
  return data;
}

/** `offers` tab: id, name, price_from, price_suffix, one_liner, active. */
export function applyOffers(data: Obj, rows: Row[], report: Report): Obj {
  const offers = data.offers;
  if (!Array.isArray(offers)) return data;
  const keep: unknown[] = [];
  const byId = new Map<string, Obj>();
  for (const o of offers) if (isObj(o) && typeof o.id === 'string') byId.set(o.id, o);
  const removed = new Set<string>();
  for (const row of rows) {
    const id = (row.id ?? '').trim();
    if (!id) continue;
    const o = byId.get(id);
    if (!o) { report.warnings.push(`offers.${id}: no offer with this id (ids come from offers.yaml)`); continue; }
    if (!truthy(row.active)) { removed.add(id); report.applied.push(`offers.${id}.active=false`); continue; }
    for (const f of ['name', 'one_liner', 'price_suffix'] as const) {
      const v = cleanText(`offers.${id}.${f}`, row[f] ?? '', report);
      if (v !== null && v !== o[f]) { o[f] = v; report.applied.push(`offers.${id}.${f}`); }
    }
    const price = (row.price_from ?? '').trim();
    if (price) {
      if (!/^\$\d{1,3}(,\d{3})*(\.\d{2})?$/.test(price)) report.warnings.push(`offers.${id}.price_from: "${price}" isn't a price like $650 or $1,450`);
      else if (price !== o.price_from) { o.price_from = price; report.applied.push(`offers.${id}.price_from`); }
    }
  }
  for (const o of offers) if (!(isObj(o) && typeof o.id === 'string' && removed.has(o.id))) keep.push(o);
  data.offers = keep;
  return data;
}

/** `faqs` tab: page, order, question, answer, active. A page with at least one active row replaces that page's YAML list. */
export function applyFaqs(data: Obj, rows: Row[], report: Report): Obj {
  const pages = data.pages;
  if (!isObj(pages)) return data;
  const grouped = new Map<string, { order: number; q: string; a: string }[]>();
  for (const row of rows) {
    const page = (row.page ?? '').trim();
    if (!page) continue;
    if (!(page in pages)) { report.warnings.push(`faqs: unknown page "${page}" (pages come from faqs.yaml)`); continue; }
    if (!truthy(row.active)) continue;
    const q = cleanText(`faqs.${page}.question`, row.question ?? '', report);
    const a = cleanText(`faqs.${page}.answer`, row.answer ?? '', report);
    if (!q || !a) { report.warnings.push(`faqs.${page}: a row is missing its question or answer`); continue; }
    const order = Number(row.order);
    if (!grouped.has(page)) grouped.set(page, []);
    grouped.get(page)!.push({ order: Number.isFinite(order) ? order : 1e9, q, a });
  }
  for (const [page, list] of grouped) {
    list.sort((x, y) => x.order - y.order);
    pages[page] = list.map(({ q, a }) => ({ q, a }));
    report.applied.push(`faqs.${page} (${list.length})`);
  }
  return data;
}

/** `industries` tab: slug, h1, sub, search_terms (pipe-separated), active. */
export function applyIndustries(data: Obj, rows: Row[], report: Report): Obj {
  const list = data.industries;
  if (!Array.isArray(list)) return data;
  const bySlug = new Map<string, Obj>();
  for (const i of list) if (isObj(i) && typeof i.slug === 'string') bySlug.set(i.slug, i);
  const removed = new Set<string>();
  for (const row of rows) {
    const slug = (row.slug ?? '').trim();
    if (!slug) continue;
    const ind = bySlug.get(slug);
    if (!ind) { report.warnings.push(`industries.${slug}: no industry with this slug (slugs come from industries.yaml)`); continue; }
    if (!truthy(row.active)) { removed.add(slug); report.applied.push(`industries.${slug}.active=false`); continue; }
    for (const f of ['h1', 'sub'] as const) {
      const v = cleanText(`industries.${slug}.${f}`, row[f] ?? '', report);
      if (v !== null && v !== ind[f]) { ind[f] = v; report.applied.push(`industries.${slug}.${f}`); }
    }
    const terms = (row.search_terms ?? '').split('|').map((s) => s.trim()).filter(Boolean);
    if (terms.length) { ind.searches = terms; report.applied.push(`industries.${slug}.searches (${terms.length})`); }
  }
  data.industries = list.filter((i) => !(isObj(i) && typeof i.slug === 'string' && removed.has(i.slug)));
  return data;
}

/** `testimonials` tab: id, quote, name, role, city, active. Any active rows replace the YAML list. */
export function applyTestimonials(data: Obj, rows: Row[], report: Report): Obj {
  const out: Obj[] = [];
  for (const row of rows) {
    if (!truthy(row.active)) continue;
    const id = (row.id ?? '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const quote = cleanText(`testimonials.${id || '?'}.quote`, row.quote ?? '', report);
    const name = cleanText(`testimonials.${id || '?'}.name`, row.name ?? '', report);
    if (!id || !quote || !name) { report.warnings.push('testimonials: a row is missing id, quote or name'); continue; }
    const role = [row.role, row.city].map((s) => (s ?? '').trim()).filter(Boolean).join(', ');
    out.push({ id, quote, name, ...(role ? { role } : {}) });
  }
  if (out.length) { data.testimonials = out; report.applied.push(`testimonials (${out.length})`); }
  return data;
}

/** `flags` tab: key, on. Only keys that exist in site.yaml flags. */
export function applyFlags(data: Obj, rows: Row[], report: Report): Obj {
  const flags = data.flags;
  if (!isObj(flags)) return data;
  for (const row of rows) {
    const key = (row.key ?? '').trim();
    if (!key) continue;
    if (!(key in flags)) { report.warnings.push(`flags.${key}: unknown flag (flags come from site.yaml)`); continue; }
    const s = (row.on ?? '').trim().toLowerCase();
    const on = ['true', 'yes', 'y', '1', 'on', 'x'].includes(s) ? true : ['false', 'no', 'n', '0', 'off'].includes(s) ? false : null;
    if (on === null) { report.warnings.push(`flags.${key}: "${row.on}" isn't TRUE or FALSE`); continue; }
    if (flags[key] !== on) { flags[key] = on; report.applied.push(`flags.${key}=${on}`); }
  }
  return data;
}

/** Apply every relevant tab to one YAML document. `data` is mutated and returned. */
export function applyOverrides(docName: string, data: Obj, set: OverrideSet, report: Report): Obj {
  applyStrings(docName, data, set.strings, report);
  if (docName === 'offers') applyOffers(data, set.offers, report);
  if (docName === 'faqs') applyFaqs(data, set.faqs, report);
  if (docName === 'industries') applyIndustries(data, set.industries, report);
  if (docName === 'testimonials') applyTestimonials(data, set.testimonials, report);
  if (docName === 'site') applyFlags(data, set.flags, report);
  return data;
}

/** Every "<doc>.<path>" the strings tab may edit, with its current value. Used to seed the Sheet. */
export function eligibleStrings(docName: string, data: unknown): { key: string; value: string }[] {
  if (!STRING_DOCS.has(docName)) return [];
  const out: { key: string; value: string }[] = [];
  const walk = (node: unknown, path: string[]) => {
    if (typeof node === 'string') {
      const key = `${docName}.${path.join('.')}`;
      if (path.length && !DENY.test(path.join('.')) && !DENY_KEYS.has(key) && node.trim()) out.push({ key, value: node });
      return;
    }
    if (Array.isArray(node)) node.forEach((v, i) => walk(v, [...path, String(i)]));
    else if (isObj(node)) for (const [k, v] of Object.entries(node)) walk(v, [...path, k]);
  };
  walk(data, []);
  return out;
}
