// /content-seed.json: everything the content Sheet can edit, with the current YAML defaults.
// The Sheet's Apps Script (docs/google-sheet-content/Code.gs) reads this to create and refresh the tabs,
// so new keys show up in the Sheet without anyone retyping them. Values here are the YAML defaults,
// not the Sheet overrides, on purpose: the "default" column should show what the site falls back to.
import type { APIRoute } from 'astro';
import { parse } from 'yaml';
import { STRING_DOCS, eligibleStrings } from '../lib/overrides';

// YAML text is bundled at build time (the endpoint is prerendered, so no filesystem reads at render).
const raw = import.meta.glob('../content/*.yaml', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;
const yaml = (name: string) => {
  const text = raw[`../content/${name}.yaml`];
  if (text === undefined) throw new Error(`No such content file: ${name}.yaml`);
  return parse(text) as Record<string, any>;
};

export const GET: APIRoute = () => {
  const strings: { key: string; default: string; page: string }[] = [];
  for (const docName of STRING_DOCS) {
    let data: Record<string, unknown>;
    try { data = yaml(docName); } catch { continue; }
    for (const s of eligibleStrings(docName, data)) {
      const page = s.key.split('.').slice(0, 2).join('.');
      strings.push({ key: s.key, default: s.value, page });
    }
  }
  const offers = (yaml('offers').offers as any[]).map((o) => ({
    id: o.id, name: o.name, price_from: o.price_from ?? '', price_suffix: o.price_suffix ?? '', one_liner: o.one_liner, active: true,
  }));
  const faqsDoc = yaml('faqs');
  const faqs: { page: string; order: number; question: string; answer: string; active: boolean }[] = [];
  for (const [page, list] of Object.entries(faqsDoc.pages as Record<string, { q: string; a: string }[]>)) {
    list.forEach((f, i) => faqs.push({ page, order: i + 1, question: f.q, answer: f.a, active: true }));
  }
  const industries = (yaml('industries').industries as any[]).map((i) => ({
    slug: i.slug, h1: i.h1, sub: i.sub, search_terms: (i.searches ?? []).join(' | '), active: true,
  }));
  const flags = Object.entries(yaml('site').flags as Record<string, boolean>).map(([key, on]) => ({ key, on }));
  const testimonials = ((yaml('testimonials').testimonials ?? []) as any[]).map((t) => ({
    id: t.id, quote: t.quote, name: t.name, role: t.role ?? '', city: '', active: true,
  }));
  const guideFiles = import.meta.glob('../content/learn/*.md', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;
  const guides = Object.entries(guideFiles).map(([path, text]) => {
    const fm = parse(text.split(/^---\s*$/m)[1] ?? '') as Record<string, unknown>;
    // Edit columns start blank (blank = use the guide's own frontmatter); the default_* columns show the current values.
    // A filled edit cell pins that value, so a rewritten guide's new title can't be hidden by an old copy in the Sheet.
    return {
      slug: path.split('/').pop()!.replace(/\.md$/, ''), title: '', seo_title: '', description: '', draft: '',
      default_title: fm.title ?? '', default_seo_title: fm.seo_title ?? '', default_description: fm.description ?? '',
      default_draft: fm.draft !== false,
    };
  });
  const body = {
    generated: new Date().toISOString(),
    columns: {
      strings: ['key', 'value', 'default', 'page', 'notes'],
      offers: ['id', 'name', 'price_from', 'price_suffix', 'one_liner', 'active'],
      faqs: ['page', 'order', 'question', 'answer', 'active'],
      industries: ['slug', 'h1', 'sub', 'search_terms', 'active'],
      testimonials: ['id', 'quote', 'name', 'role', 'city', 'active'],
      flags: ['key', 'on'],
      guides: ['slug', 'title', 'seo_title', 'description', 'draft', 'default_title', 'default_seo_title', 'default_description', 'default_draft'],
    },
    strings, offers, faqs, industries, testimonials, flags, guides,
  };
  return new Response(JSON.stringify(body), {
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'public, max-age=300' },
  });
};
