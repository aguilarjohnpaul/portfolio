// After `astro build`: hash every inline script in dist/*.html and write the
// hashes into dist/_headers so the Content-Security-Policy allows exactly those.
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';

const dist = new URL('../dist/', import.meta.url).pathname;
const files = readdirSync(dist, { recursive: true }).filter((f) => String(f).endsWith('.html'));
const hashes = new Set();
const DATA_TYPES = /type\s*=\s*["'](application\/(ld\+)?json)["']/i;

for (const f of files) {
  const html = readFileSync(join(dist, String(f)), 'utf8');
  for (const [, attrs, body] of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    if (/\bsrc\s*=/.test(attrs) || DATA_TYPES.test(attrs) || !body.trim()) continue;
    hashes.add(`'sha256-${createHash('sha256').update(body).digest('base64')}'`);
  }
}

const path = join(dist, '_headers');
const headers = readFileSync(path, 'utf8');
if (!headers.includes('{{SCRIPT_HASHES}}')) throw new Error('dist/_headers is missing {{SCRIPT_HASHES}}');
writeFileSync(path, headers.replaceAll('{{SCRIPT_HASHES}}', [...hashes].sort().join(' ')));
console.log(`CSP: ${hashes.size} inline script hash(es) written to dist/_headers`);

// Old /thanks route: send it to /thanks/founding when the founding program is on, otherwise home.
// /founding → /founding-clients only exists while the founding program is on.
const site = parse(readFileSync(new URL('../src/content/site.yaml', import.meta.url), 'utf8'));
const target = site.flags.showFounding ? '/thanks/founding' : '/';
const redirects = join(dist, '_redirects');
const extra = [`/thanks ${target} 301`, ...(site.flags.showFounding ? ['/founding /founding-clients 301'] : [])];
writeFileSync(redirects, readFileSync(redirects, 'utf8').trimEnd() + '\n' + extra.join('\n') + '\n');
console.log(`Redirects: /thanks → ${target}`);
