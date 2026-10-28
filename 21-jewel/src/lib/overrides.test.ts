import { describe, expect, it } from 'vitest';
import {
  applyGuide, applyFaqs, applyFlags, applyIndustries, applyOffers, applyOverrides, applyStrings, applyTestimonials,
  eligibleStrings, emptySet, newReport,
} from './overrides';

const home = () => ({
  hero: { eyebrow: 'Old eyebrow', primary: { label: 'Go', href: '/audit' }, variants: { a: { h1: 'A', subhead: 'sa' }, b: { h1: 'B', subhead: 'sb' } } },
  pains: { heading: 'Sound familiar?', items: ['one', 'two'] },
});

describe('strings tab', () => {
  it('overrides an existing string by dotted path', () => {
    const r = newReport();
    const d = applyStrings('home', home(), [{ key: 'home.hero.variants.a.h1', value: 'New H1' }, { key: 'home.pains.items.1', value: 'dos' }], r);
    expect((d as any).hero.variants.a.h1).toBe('New H1');
    expect((d as any).pains.items[1]).toBe('dos');
    expect(r.applied).toEqual(['home.hero.variants.a.h1', 'home.pains.items.1']);
    expect(r.warnings).toEqual([]);
  });
  it('ignores empty cells, unknown paths, denied fields and non-strings', () => {
    const r = newReport();
    const d = applyStrings('home', home(), [
      { key: 'home.hero.eyebrow', value: '   ' },
      { key: 'home.hero.nope', value: 'x' },
      { key: 'home.hero.primary.href', value: '/evil' },
      { key: 'home.pains.items', value: 'x' },
      { key: 'home.pains.items.9', value: 'x' },
      { key: 'site.brand.tagline', value: 'other doc' },
    ], r);
    expect((d as any).hero.eyebrow).toBe('Old eyebrow');
    expect((d as any).hero.primary.href).toBe('/audit');
    expect(r.applied).toEqual([]);
    expect(r.warnings).toHaveLength(4);
  });
  it('refuses HTML, placeholders and very long values', () => {
    const r = newReport();
    applyStrings('home', home(), [
      { key: 'home.hero.eyebrow', value: '<script>x</script>' },
      { key: 'home.hero.eyebrow', value: '[PLACEHOLDER: X]' },
      { key: 'home.hero.eyebrow', value: 'a'.repeat(2001) },
    ], r);
    expect(r.warnings).toHaveLength(3);
  });
  it('only touches whitelisted documents', () => {
    const r = newReport();
    const d = applyStrings('testimonials', { intro: { heading: 'x' } }, [{ key: 'testimonials.intro.heading', value: 'y' }], r);
    expect((d as any).intro.heading).toBe('x');
  });
});

describe('offers tab', () => {
  const offers = () => ({ offers: [{ id: 'get-found', name: 'Get Found Setup', price_from: '$650', one_liner: 'x', checkout_url: '' }, { id: 'keep-ranking', name: 'Keep', price_from: '$450', price_suffix: '/month', one_liner: 'y', checkout_url: '' }] });
  it('updates price, name and one-liner by id', () => {
    const r = newReport();
    const d = applyOffers(offers(), [{ id: 'get-found', price_from: '$850', name: 'Get Found', one_liner: '', active: 'TRUE' }], r) as any;
    expect(d.offers[0]).toMatchObject({ price_from: '$850', name: 'Get Found', one_liner: 'x' });
  });
  it('rejects malformed prices and unknown ids, removes inactive offers', () => {
    const r = newReport();
    const d = applyOffers(offers(), [{ id: 'get-found', price_from: '650 dollars' }, { id: 'nope', price_from: '$1' }, { id: 'keep-ranking', active: 'FALSE' }], r) as any;
    expect(d.offers).toHaveLength(1);
    expect(d.offers[0].price_from).toBe('$650');
    expect(r.warnings).toHaveLength(2);
  });
});

describe('faqs tab', () => {
  it('replaces a page list only when it has active rows, sorted by order', () => {
    const r = newReport();
    const d = applyFaqs({ pages: { home: [{ q: 'old', a: 'old' }], pricing: [{ q: 'p', a: 'p' }] } }, [
      { page: 'home', order: '2', question: 'Second?', answer: 'Yes.', active: '' },
      { page: 'home', order: '1', question: 'First?', answer: 'Yes.', active: 'TRUE' },
      { page: 'home', order: '3', question: 'Hidden?', answer: 'No.', active: 'FALSE' },
      { page: 'unknown', order: '1', question: 'x', answer: 'y' },
    ], r) as any;
    expect(d.pages.home.map((f: any) => f.q)).toEqual(['First?', 'Second?']);
    expect(d.pages.pricing).toHaveLength(1);
    expect(r.warnings).toHaveLength(1);
  });
});

describe('industries, testimonials, flags', () => {
  it('industries: h1, sub, pipe-separated searches, active', () => {
    const r = newReport();
    const d = applyIndustries({ industries: [{ slug: 'roofing', h1: 'a', sub: 'b', searches: [] }, { slug: 'plumbing', h1: 'c', sub: 'd', searches: ['x'] }] },
      [{ slug: 'roofing', h1: 'More calls for roofers', search_terms: 'roof repair san antonio | roofer near me' }, { slug: 'plumbing', active: 'no' }], r) as any;
    expect(d.industries).toHaveLength(1);
    expect(d.industries[0]).toMatchObject({ h1: 'More calls for roofers', sub: 'b', searches: ['roof repair san antonio', 'roofer near me'] });
  });
  it('testimonials: active rows replace the list; incomplete rows warn', () => {
    const r = newReport();
    const d = applyTestimonials({ testimonials: [] }, [{ id: 'Joe Signs', quote: 'Great.', name: 'Joe', role: 'Owner', city: 'San Antonio', active: 'TRUE' }, { id: 'x', quote: '', name: 'y', active: 'TRUE' }], r) as any;
    expect(d.testimonials).toEqual([{ id: 'joe-signs', quote: 'Great.', name: 'Joe', role: 'Owner, San Antonio' }]);
    expect(r.warnings).toHaveLength(1);
  });
  it('flags: only known keys, only TRUE/FALSE', () => {
    const r = newReport();
    const d = applyFlags({ flags: { showFaq: false, showAreas: false } }, [{ key: 'showFaq', on: 'TRUE' }, { key: 'showAreas', on: 'maybe' }, { key: 'showEvil', on: 'TRUE' }], r) as any;
    expect(d.flags).toEqual({ showFaq: true, showAreas: false });
    expect(r.warnings).toHaveLength(2);
  });
  it('applyOverrides routes tabs to the right document', () => {
    const set = emptySet();
    set.flags = [{ key: 'showFaq', on: 'TRUE' }];
    set.strings = [{ key: 'site.brand.tagline', value: 'New line' }];
    const r = newReport();
    const d = applyOverrides('site', { brand: { tagline: 'Old', email: 'a@b.co' }, flags: { showFaq: false } }, set, r) as any;
    expect(d.brand.tagline).toBe('New line');
    expect(d.flags.showFaq).toBe(true);
  });
  it('eligibleStrings lists copy fields and skips links and ids', () => {
    const keys = eligibleStrings('home', home()).map((k) => k.key);
    expect(keys).toContain('home.hero.variants.b.subhead');
    expect(keys).toContain('home.pains.items.0');
    expect(keys).not.toContain('home.hero.primary.href');
    expect(eligibleStrings('testimonials', { a: 'b' })).toEqual([]);
  });
});

describe('guides tab', () => {
  it('changes title, description and draft for the matching slug only', () => {
    const r = newReport();
    const d = applyGuide('a', { title: 'Old', description: 'Old desc', draft: true }, [
      { slug: 'a', title: 'New title', description: '', draft: 'FALSE' },
      { slug: 'b', title: 'Other', draft: 'TRUE' },
    ], r) as any;
    expect(d).toEqual({ title: 'New title', description: 'Old desc', draft: false });
    expect(r.applied).toEqual(['guides.a.title', 'guides.a.draft=false']);
  });
});
