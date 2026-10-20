// Regenerates public/og.png, apple-touch-icon.png and favicon.ico.
// Optional, not part of the build. Needs Playwright: NODE_PATH=$(npm root -g) node scripts/og/make-images.mjs
import { createRequire } from 'node:module';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// Resolve Playwright from this project or from NODE_PATH (a global install).
const { chromium } = createRequire(process.env.NODE_PATH ? `${process.env.NODE_PATH}/` : import.meta.url)('playwright');
const here = (p) => fileURLToPath(new URL(p, import.meta.url));
const browser = await chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {});
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.goto('file://' + here('./og.html'));
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: here('../../public/og.png') });

const svg = readFileSync(here('../../public/favicon.svg'), 'utf8');
const icon = async (size, square = false) => {
  await page.setViewportSize({ width: size, height: size });
  const art = (square ? svg.replace('rx="14"', 'rx="0"') : svg).replace('<svg ', `<svg width="${size}" height="${size}" `);
  await page.setContent(`<style>html,body{margin:0;background:transparent}svg{display:block}</style>${art}`);
  return page.screenshot({ omitBackground: true });
};
writeFileSync(here('../../public/apple-touch-icon.png'), await icon(180, true));
const png = await icon(32);
// ICO file with one embedded 32x32 PNG.
const head = Buffer.alloc(22);
head.writeUInt16LE(0, 0); head.writeUInt16LE(1, 2); head.writeUInt16LE(1, 4);
head.writeUInt8(32, 6); head.writeUInt8(32, 7); head.writeUInt16LE(1, 10); head.writeUInt16LE(32, 12);
head.writeUInt32LE(png.length, 14); head.writeUInt32LE(22, 18);
writeFileSync(here('../../public/favicon.ico'), Buffer.concat([head, png]));
await browser.close();
console.log('Images written to public/');
