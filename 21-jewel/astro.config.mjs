// @ts-check
import { readFileSync } from 'node:fs';
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { parse } from 'yaml';

// Industry pages marked indexed: false stay out of the sitemap (they also carry noindex).
const industries = parse(readFileSync(new URL('./src/content/industries.yaml', import.meta.url), 'utf8')).industries;
const noindex = industries.filter((i) => !i.indexed).map((i) => `/industries/${i.slug}`);

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
