// Content schemas. A typo or missing field in src/content/*.yaml fails the build.
import { readFileSync } from 'node:fs';
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import type { Loader } from 'astro/loaders';
import { z } from 'astro/zod';
import { parse } from 'yaml';
import { printSummary, withOverrides } from './lib/sheet-overrides';

// Each YAML file is one document, loaded as a single entry with id "main".
// The Google Sheet (Change 03 §8) overrides whitelisted values before the schema check,
// so a Sheet value that breaks the schema fails the build the same way a YAML typo would.
const one = (name: string): Loader => ({
  name: `yaml:${name}`,
  load: async ({ store, parseData, generateDigest, logger, watcher }) => {
    const path = `src/content/${name}.yaml`;
    const read = async () => {
      const raw = parse(readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')) as Record<string, unknown>;
      const merged = await withOverrides(name, raw);
      const data = await parseData({ id: 'main', data: merged });
      store.set({ id: 'main', data, digest: generateDigest(data) });
      printSummary(logger);
    };
    await read();
    if (watcher) {
      watcher.add(path);
      watcher.on('change', (changed) => { if (changed.endsWith(path)) read().catch((e) => logger.error(String(e))); });
    }
  },
});

const link = z.object({ label: z.string(), href: z.string() });
const text = z.string().min(1);
const flagName = z.enum(['', 'showFounding', 'showResults', 'showFaq', 'showTerms', 'showAreas', 'showSpanish', 'showClarity', 'showScorecardLink', 'realExamples']);
const flagged = z.object({ label: text, href: text, flag: flagName });

const site = defineCollection({
  loader: one('site'),
  schema: z.object({
    brand: z.object({
      name: text, legal_name: text, url: z.url(), email: z.email(),
      phone: text, phone_href: z.string().regex(/^\+1\d{10}$/),
      location: text, founder: text,
      tagline: text, one_liner: text, values: z.array(text).min(1),
    }),
    links: z.object({ cal: text, tally: text, google_profile: z.string(), linkedin: z.string() }),
    flags: z.object({
      showFounding: z.boolean(), showResults: z.boolean(), showFaq: z.boolean(), showTerms: z.boolean(),
      showAreas: z.boolean(), showSpanish: z.boolean(), showClarity: z.boolean(),
      showScorecardLink: z.boolean(), realExamples: z.boolean(),
    }),
    founding: z.object({ total: z.number().int().min(1), filled: z.number().int().min(0) }),
    heroTest: z.object({ enabled: z.boolean(), winner: z.enum(['', 'a', 'b']) }),
    router: z.object({ enabled: z.boolean() }),
    nav: z.object({
      skip: text, home_label: text, menu_open: text, menu_close: text,
      groups: z.array(z.object({ label: text, links: z.array(link).min(1) })),
      links: z.array(link), founding_link: link, cta: link, cta_short: text, phone_label: text,
    }),
    sticky: z.object({ call: text, cta: link }),
    trust: z.object({ label: text, items: z.array(text).min(3).max(6) }),
    footer: z.object({
      who_heading: text, industries: z.array(flagged), links_heading: text, links: z.array(flagged),
      bottom: text,
    }),
    spots: z.object({ open_label: text, full_label: text, apply: text, waitlist: text }),
    seo: z.object({
      og_image: text,
      og_image_alt: text,
      pages: z.record(z.string(), z.object({ title: text, description: text })),
    }),
  }),
});

const variant = z.object({ h1: text, subhead: text });
const home = defineCollection({
  loader: one('home'),
  schema: z.object({
    hero: z.object({
      eyebrow: text, primary: link, secondary_label: text, micro: text,
      variants: z.object({ a: variant, b: variant }),
    }),
    example: z.object({ label: text, items: z.array(text).length(3), footer: text }),
    pains: z.object({ heading: text, items: z.array(text).min(1) }),
    how: z.object({
      eyebrow: text, heading: text, intro: text,
      labels: z.object({ means: text, breaks: text, fix: text }),
      steps: z.array(z.object({ name: text, means: text, breaks: text, fix: text, link })).length(3),
    }),
    offers: z.object({ eyebrow: text, heading: text, link }),
    industries: z.object({ eyebrow: text, heading: text, intro: text }),
    measure: z.object({ heading: text, body: text, link }),
    founding: z.object({ eyebrow: text, heading: text, body: text, button: link }),
    proof: z.object({ eyebrow: text, heading: text }),
    about: z.object({ photo: z.string(), photo_alt: text, heading: text, paragraphs: z.array(text), link }),
    learn: z.object({ eyebrow: text, heading: text, link }),
    final_cta: z.object({ heading: text, body: text, button: link, secondary_label: text }),
  }),
});

const getItem = z.union([text, z.object({ heading: text, items: z.array(text) })]);
const offers = defineCollection({
  loader: one('offers'),
  schema: z.object({
    page: z.object({
      heading: text, intro: text, ladder_rule: text, addons_heading: text,
      dont_do: z.object({ heading: text, body: text }),
      measure: z.object({ heading: text, body: text }),
      labels: z.object({
        for: text, get: text, needs: text, your_time: text, timeline: text, terms: text, guarantee: text,
        see_details: text, book_button: text, founding_link: text, starting_at: text, on_request: text,
      }),
    }),
    offers: z.array(z.object({
      id: z.string().regex(/^[a-z0-9-]+$/),
      name: text, type: text, one_liner: text, for: text,
      price_from: z.string(),
      price_suffix: z.string().optional(),
      free: z.boolean().optional(),
      studio_only: z.boolean().optional(),
      get: z.array(getItem),
      needs: z.string().optional(),
      your_time: z.string().optional(),
      timeline: z.string().optional(),
      terms: z.string().optional(),
      guarantee: z.string().optional(),
      note: z.string().optional(),
      button: link.optional(),
      checkout_url: z.string(),
    })),
    addons: z.array(z.object({ id: text, name: text, price_label: text, one_liner: text })),
  }),
});

// Service pages (Change 03 §6.1): one template, prices from offers.yaml by offer id.
const services = defineCollection({
  loader: one('services'),
  schema: z.object({
    labels: z.object({
      get_heading: text, how_heading: text, your_time: text, price_heading: text, not_for_heading: text,
      faq_heading: text, cta_label: text, cta_note: text, call_label: text, breadcrumb_root: text,
    }),
    services: z.array(z.object({
      slug: z.string().regex(/^[a-z0-9-]+$/),
      offer: z.string().regex(/^[a-z0-9-]+$/),
      nav_label: text, h1: text, intro: text,
      get: z.array(text).min(3),
      steps: z.array(z.object({ name: text, body: text, your_time: text })).length(3),
      price_note: text, not_for: text,
    })),
  }),
});

// FAQ lists per page (Change 03 §8). Keys are page ids; the Sheet's faqs tab can replace any list.
const faqs = defineCollection({
  loader: one('faqs'),
  schema: z.object({
    heading: text,
    pages: z.record(z.string().regex(/^[a-z0-9-]+$/), z.array(z.object({ q: text, a: text }))),
  }),
});

const scorecard = defineCollection({
  loader: one('scorecard'),
  schema: z.object({
    intro: z.object({ heading: text, body: text, start: text, micro: text }),
    question_ui: z.object({ progress: text, intro_label: text, back: text, next: text, keyboard_hint: text }),
    industry: z.object({
      id: z.literal(0), text,
      options: z.array(z.object({ label: text, value: z.string().regex(/^[a-z0-9-]+$/) })).min(2),
    }),
    questions: z.array(z.object({
      id: z.number().int().min(1),
      text, fix: text,
      options: z.array(z.object({ label: text, score: z.number().int().min(0).max(2) })).length(3),
    })).length(12),
    bands: z.array(z.object({
      min: z.number().int(), max: z.number().int(), name: text, slug: text, headline: text, body: text,
    })).length(3),
    result: z.object({
      eyebrow: text, score_suffix: text, fixes_label: text, perfect: text, review_button: link, restart: text,
    }),
    email: z.object({
      heading: text, first_name: text, email: text, honeypot: text, submit: text, sending: text,
      privacy_note: text, privacy_link: text,
    }),
    after: z.object({ sent: text }),
    errors: z.object({
      email_required: text, invalid_email: text, verification_failed: text, list_unavailable: text, network: text,
    }),
  }),
});

const titled = z.object({ heading: text, items: z.array(text) });
const founding = defineCollection({
  loader: one('founding'),
  schema: z.object({
    heading: text,
    intro: z.array(text),
    deal: z.object({ heading: text, get_label: text, ask_label: text, get: z.array(text), ask: z.array(text) }),
    fit: titled,
    not_fit: titled,
    apply: z.object({
      heading: text, waitlist_heading: text, loading: text, fallback: text, iframe_title: text, small_print: text,
    }),
  }),
});

const option = z.object({ value: z.string().regex(/^[a-z0-9-]+$/), label: text });
const pages = defineCollection({
  loader: one('pages'),
  schema: z.object({
    audit: z.object({
      heading: text, intro: text, get_heading: text, get: z.array(text).min(2), how_heading: text, steps: z.array(text),
      need_heading: text, need: text, capacity: text, phone_heading: text, phone_label: text,
      form: z.object({
        heading: text, business: text, trade: text, trade_hint: text, city: text, website: text, website_placeholder: text, no_website: text,
        email: text, phone: text, situation: text, situations: z.array(option).min(2), source: text, honeypot: text,
        submit: text, sending: text, privacy_note: text, privacy_link: text,
      }),
      errors: z.object({
        required: text, invalid_email: text, verification_failed: text, list_unavailable: text, network: text,
      }),
    }),
    about: z.object({
      heading: text, intro: text, paragraphs: z.array(text), differently_heading: text, differently: z.array(text),
      values_heading: text, values: z.array(z.object({ title: text, body: text })),
      photo: z.string(), photo_alt: text, button: link, book_label: text,
    }),
    results: z.object({ heading: text, intro: text, empty: text, columns: z.array(text).length(4) }),
    privacy: z.object({
      heading: text, updated_label: text, intro: text, storage: text, deletion: text, deletion_suffix: text,
      services: z.array(z.object({ name: text, body: text })),
    }),
    terms: z.object({
      heading: text, updated_label: text, intro: text, contact: text,
      sections: z.array(z.object({ title: text, body: text })),
    }),
    thanks_audit: z.object({ heading: text, body: text, book: link, link }),
    thanks_founding: z.object({ heading: text, body: text, home: text }),
    notfound: z.object({ heading: text, body: text, cta: link, home: text }),
  }),
});

const industries = defineCollection({
  loader: one('industries'),
  schema: z.object({
    labels: z.object({
      eyebrow: text, searches_heading: text, searches_note: text, breaks_heading: text, fixes_heading: text,
      example_heading: text, example_label: text, example_real_label: text, example_columns: z.array(text).length(2),
      proof_heading: text, faq_heading: text, cta_label: text, cta_note: text, call_label: text, breadcrumb_root: text,
      step_names: z.record(z.string(), text),
    }),
    industries: z.array(z.object({
      slug: z.string().regex(/^[a-z0-9-]+$/),
      flag: flagName,
      indexed: z.boolean(),
      name: text, tile: text, h1: text, sub: text,
      searches: z.array(text).min(4),
      breaks: z.array(z.object({ title: text, body: text })).length(3),
      fixes: z.array(z.object({ step: z.enum(['get-found', 'get-chosen', 'keep-ranking']), body: text })).length(3),
      example: z.object({
        rows: z.array(z.object({ label: text, before: text, after: text })).min(2).max(5),
        note: text,
      }),
      proof: z.string(),
    })),
  }),
});

const testimonials = defineCollection({
  loader: one('testimonials'),
  schema: z.object({
    testimonials: z.array(z.object({ id: text, quote: text, name: text, role: z.string().optional() })),
  }),
});

// Learn hub labels and author box (Change 03 §6.3).
const learnHub = defineCollection({
  loader: one('learn'),
  schema: z.object({
    heading: text, intro: text,
    labels: z.object({ guide: text, answer: text, updated: text, minutes: text, by: text, related: text, faq: text, all: text, back: text, teaser_link: text }),
    empty: z.object({ heading: text, body: text }),
    author: z.object({ name: text, role: text, line: text }),
    cta: z.object({ heading: text, body: text, label: text, call_label: text }),
  }),
});

// Guides and quick answers (Change 03 §6.3). draft: true never builds.
const learn = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/learn' }),
  schema: z.object({
    title: text,
    description: z.string().min(40),
    kind: z.enum(['guide', 'answer']),
    published: z.coerce.date(),
    updated: z.coerce.date(),
    draft: z.boolean().default(true),
    related: z.array(z.string().regex(/^\//)).max(4).default([]),
    faqs: z.array(z.object({ q: text, a: text })).max(8).default([]),
  }),
});

// One Markdown file per case study (Change 02 §4.8). Never show estimates as results.
const caseStudies = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/case-studies' }),
  schema: z.object({
    title: text,
    business: text,              // business type and city; name only with written permission
    starting_point: text,
    what_i_did: z.array(text),
    results: z.array(z.object({ label: text, day0: text, day30: z.string(), day60: z.string(), day90: z.string() })).optional(),
    quote: z.string().optional(),
    published: z.boolean().default(false),
  }),
});

export const collections = {
  site, home, offers, services, faqs, scorecard, founding, pages, industries, testimonials, caseStudies, learnHub, learn,
};
