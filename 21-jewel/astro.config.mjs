// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://21jeweladvisory.com',
  output: 'static',
  trailingSlash: 'never',
  build: { format: 'file' },
  integrations: [
    sitemap({ filter: (page) => !/\/(thanks|404)(\/|$)/.test(page) }),
  ],
});
