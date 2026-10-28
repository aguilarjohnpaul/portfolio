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
      links: z.array(link), founding_link: link, cta: link, cta_short: text,
    }),
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
      eyebrow: text, primary: link, secondary: link,
      variants: z.object({ a: variant, b: variant }),
    }),
    example: z.object({ label: text, items: z.array(text).length(3), footer: text }),
    pains: z.object({ heading: text, items: z.array(text).min(1) }),
    how: z.object({
      eyebrow: text, heading: text, framework: text,
      steps: z.array(z.object({ name: text, body: text })).length(3),
    }),
    your_part: z.object({ heading: text, items: z.array(text), closing: text }),
    offers: z.object({ eyebrow: text, heading: text }),
    promise: z.object({ label: text, items: z.array(text).min(1) }),
    measure: z.object({ heading: text, body: text, link }),
    founding: z.object({ eyebrow: text, heading: text, body: text, button: link }),
    proof: z.object({ eyebrow: text, heading: text }),
    about: z.object({ photo: z.string(), photo_alt: text, heading: text, paragraphs: z.array(text), link }),
    faq_heading: text,
    final_cta: z.object({ heading: text, body: text, button: link }),
  }),
});

const getItem = z.union([text, z.object({ heading: text, items: z.array(text) })]);
const offers = defineCollection({
  loader: one('offers'),
  schema: z.object({
    page: z.object({
      heading: text, intro: text, ladder_rule: text, addons_heading: text, faq_heading: text,
      dont_do: z.object({ heading: text, body: text }),
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
    faq: z.array(z.object({ q: text, a: text, home: z.boolean().optional() })),
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
    review: z.object({
      heading: text, intro: text, how_heading: text, steps: z.array(text), capacity: text,
      form: z.object({
        heading: text, name: text, email: text, phone: text, business: text, website: text, website_placeholder: text, no_website: text,
        city: text, services: text, services_hint: text, source: text, sources: z.array(option).min(2),
        notes: text, format: text, formats: z.array(option).min(2), honeypot: text,
        submit: text, sending: text, privacy_note: text, privacy_link: text,
      }),
      errors: z.object({
        required: text, invalid_email: text, verification_failed: text, list_unavailable: text, network: text,
      }),
    }),
    about: z.object({
      heading: text, intro: text, paragraphs: z.array(text), differently_heading: text, differently: z.array(text),
      values_heading: text, values: z.array(z.object({ title: text, body: text })),
      photo: z.string(), photo_alt: text, button: link,
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
    thanks_review: z.object({ heading: text, body: text, link }),
    thanks_founding: z.object({ heading: text, body: text, home: text }),
    notfound: z.object({ heading: text, body: text, review: text, home: text }),
  }),
});

const industries = defineCollection({
  loader: one('industries'),
  schema: z.object({
    labels: z.object({
      searches_heading: text, searches_note: text, fixes_heading: text, proof_heading: text,
      addon_label: text, offers_link: link, review_button: link,
    }),
    industries: z.array(z.object({
      slug: z.string().regex(/^[a-z0-9-]+$/),
      flag: flagName,
      indexed: z.boolean(),
      name: text, h1: text, sub: text,
      searches: z.array(text),
      fixes: z.array(text).min(1),
      proof: z.string(),
      addon: z.object({ name: text, body: text, href: text }).optional(),
    })),
  }),
});

const testimonials = defineCollection({
  loader: one('testimonials'),
  schema: z.object({
    testimonials: z.array(z.object({ id: text, quote: text, name: text, role: z.string().optional() })),
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
  site, home, offers, scorecard, founding, pages, industries, testimonials, caseStudies,
};
