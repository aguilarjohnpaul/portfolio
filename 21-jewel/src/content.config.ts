// Content schemas. A typo or missing field in src/content/*.yaml fails the build.
import { defineCollection } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { parse } from 'yaml';

// Each YAML file is one document, loaded as a single entry with id "main".
const one = (name: string) =>
  file(`src/content/${name}.yaml`, { parser: (text) => ({ main: parse(text) }) });

const link = z.object({ label: z.string(), href: z.string() });
const text = z.string().min(1);

const site = defineCollection({
  loader: one('site'),
  schema: z.object({
    brand: z.object({
      name: text, url: z.url(), email: z.email(), location: text, founder: text,
      values: z.array(text).min(1),
    }),
    links: z.object({ cal: text, tally: text }),
    founding: z.object({ total: z.number().int().min(1), filled: z.number().int().min(0) }),
    heroTest: z.object({ enabled: z.boolean(), winner: z.enum(['', 'a', 'b']) }),
    router: z.object({ enabled: z.boolean() }),
    nav: z.object({
      skip: text, home_label: text, menu_open: text, menu_close: text,
      links: z.array(link), cta: link, cta_short: text,
    }),
    footer: z.object({
      book_call: text, studios_prefix: text, studios_label: text, privacy: text, theme_label: text,
      theme_options: z.array(z.object({ value: z.enum(['light', 'dark', 'system']), label: text })),
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
      eyebrow: text, primary: link, secondary: link, micro: text,
      variants: z.object({ a: variant, b: variant }),
    }),
    sample: z.object({
      label: text, score: z.number(), score_label: text, footer: text,
      bars: z.array(z.object({ label: text, value: z.number(), weakest: z.boolean().optional() })),
    }),
    pains: z.object({ heading: text, items: z.array(z.object({ title: text, body: text })) }),
    how: z.object({
      eyebrow: text, heading: text, intro: text, breaks_label: text, fix_label: text,
      stages: z.array(z.object({ name: text, breaks: text, fix: text })).length(3),
    }),
    offers: z.object({ eyebrow: text, heading: text, intro: text }),
    founding: z.object({
      eyebrow: text, heading: text, body: text, get_label: text, ask_label: text,
      get: z.array(text), ask: z.array(text), button: link,
    }),
    proof: z.object({ eyebrow: text, heading: text }),
    about: z.object({ photo: z.string(), photo_alt: text, heading: text, paragraphs: z.array(text) }),
    scorecard_cta: z.object({ heading: text, body: text, button: link }),
  }),
});

const offers = defineCollection({
  loader: one('offers'),
  schema: z.object({
    page: z.object({
      heading: text, intro: text, ladder_rule: text, faq_heading: text,
      labels: z.object({
        for: text, get: text, timeline: text, terms: text, scorecard_button: text, book_button: text,
        founding_link: text, starting_at: text, on_request: text,
      }),
    }),
    offers: z.array(z.object({
      id: z.string().regex(/^[a-z0-9-]+$/),
      name: text, type: text, one_liner: text, for: text, timeline: text,
      price_from: z.string(),
      price_suffix: z.string().optional(),
      free: z.boolean().optional(),
      studio_only: z.boolean().optional(),
      get: z.array(text),
      note: z.string().optional(),
      terms: z.string().optional(),
      checkout_url: z.string(),
    })),
    faq: z.array(z.object({ q: text, a: text })),
  }),
});

const option = z.object({ label: text, score: z.number().int().min(0).max(3) });
const scorecard = defineCollection({
  loader: one('scorecard'),
  schema: z.object({
    intro: z.object({ heading: text, body: text, start: text, micro: text }),
    question_ui: z.object({ progress: text, back: text, next: text, keyboard_hint: text }),
    standard_options: z.array(option).length(4),
    stages: z.array(z.object({ id: z.enum(['referred', 'hired', 'again']), name: text, slug: text })).length(3),
    questions: z.array(z.object({
      id: z.number().int(),
      stage: z.enum(['referred', 'hired', 'again']),
      text, fix: text,
      options: z.array(option).length(4).optional(),
    })).length(12),
    bands: z.array(z.object({
      min: z.number(), max: z.number(), name: text, slug: text, meaning: text,
    })).length(3),
    result: z.object({ eyebrow: text, score_suffix: text, leak_label: text, fix_label: text, restart: text }),
    email: z.object({
      heading: text, first_name: text, email: text, business: text, team_size: text,
      team_size_placeholder: text, honeypot: text, submit: text, sending: text,
      privacy_note: text, privacy_link: text,
      team_sizes: z.array(z.object({ value: text, label: text })),
    }),
    after: z.object({ sent: text, stages_heading: text, founding: link, book: text }),
    errors: z.object({
      email_required: text, team_required: text, invalid_email: text,
      verification_failed: text, list_unavailable: text, network: text,
    }),
  }),
});

const list = z.object({ heading: text, items: z.array(text) });
const founding = defineCollection({
  loader: one('founding'),
  schema: z.object({
    heading: text,
    intro: z.array(text),
    for: z.object({ heading: text, body: text }),
    deal: z.object({ heading: text, get_label: text, ask_label: text, get: z.array(text), ask: z.array(text) }),
    steps: list,
    apply: z.object({ heading: text, waitlist_heading: text, loading: text, fallback: text, iframe_title: text }),
  }),
});

const studios = defineCollection({
  loader: one('studios'),
  schema: z.object({
    heading: text, intro: text, get: list, steps: list,
    contact: z.object({ heading: text, email_prefix: text, book: text }),
  }),
});

const pages = defineCollection({
  loader: one('pages'),
  schema: z.object({
    privacy: z.object({
      heading: text, updated_label: text, intro: text, storage: text, deletion: text, deletion_suffix: text,
      services: z.array(z.object({ name: text, body: text })),
    }),
    thanks: z.object({ heading: text, body: text, home: text }),
    notfound: z.object({ heading: text, body: text, home: text, scorecard: text }),
  }),
});

const testimonials = defineCollection({
  loader: one('testimonials'),
  schema: z.object({
    testimonials: z.array(z.object({ id: text, quote: text, name: text, role: z.string().optional() })),
  }),
});

// Phase 2: one Markdown file per case study.
const caseStudies = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/case-studies' }),
  schema: z.object({
    title: text, client: text, summary: text,
    results: z.array(z.object({ label: text, before: text, after: text })).optional(),
    published: z.boolean().default(true),
  }),
});

export const collections = {
  site, home, offers, scorecard, founding, studios, pages, testimonials, caseStudies,
};
