// @ts-check
import { readFileSync } from 'node:fs';
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { parse } from 'yaml';

import { readdirSync } from 'node:fs';

// Industry pages marked indexed: false stay out of the sitemap (they also carry noindex).
const industries = parse(readFileSync(new URL('./src/content/industries.yaml', import.meta.url), 'utf8')).industries;
const noindex = industries.filter((i) => !i.indexed).map((i) => `/industries/${i.slug}`);
// /learn stays out of the sitemap until at least one guide is published (draft: false).
const learnDir = new URL('./src/content/learn/', import.meta.url);
const anyGuide = process.env.SHOW_DRAFTS === '1' || readdirSync(learnDir).some((f) => f.endsWith('.md') && /^draft:\s*false/m.test(readFileSync(new URL(f, learnDir), 'utf8')));
if (!anyGuide) noindex.push('/learn');

export default defineConfig({
  site: 'https://21jeweladvisory.com',
  output: 'static',
  trailingSlash: 'never',
  build: { format: 'file' },
  integrations: [
    sitemap({
      filter: (page) => {
        const path = new URL(page).pathname.replace(/\/$/, '');
        return !/\/(thanks|404)(\/|$)/.test(path) && !noindex.includes(path);
      },
    }),
  ],
});
