// Fails the check when a placeholder string is about to ship (Change 03 §8.4).
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const roots = ['src', ...(statSync('dist', { throwIfNoEntry: false }) ? ['dist'] : [])];
const bad = [/\[PLACEHOLDER/i, /\[PENDING JP/i, /\[TBD\]/i, /\[CAL_LINK\]/, /\[TALLY_FORM_URL\]/];
const skip = /node_modules|\.astro|snapshot|\.test\.ts$|\.png$|\.ico$|\.woff2?$|\.jpg$|\.svg$/;
const hits = [];
const walk = (dir) => {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (skip.test(p)) continue;
    if (statSync(p).isDirectory()) { walk(p); continue; }
    const text = readFileSync(p, 'utf8');
    for (const re of bad) if (re.test(text)) hits.push(`${p}: ${re}`);
  }
};
roots.forEach(walk);
if (hits.length) {
  console.error('Placeholders found:\n' + hits.join('\n'));
  process.exit(1);
}
console.log(`No placeholders in ${roots.join(', ')}.`);
