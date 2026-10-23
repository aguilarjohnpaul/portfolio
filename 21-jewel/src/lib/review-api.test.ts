import { describe, expect, it } from 'vitest';
import { handleReview, type ReviewData } from './review-api';
import { fakeFetch, post, SHEET } from './test-helpers';

const data: ReviewData = { sources: ['word-of-mouth', 'google', 'repeat', 'ads', 'not-sure'], formats: ['video', 'pdf'] };
const env = { TURNSTILE_SECRET: 'secret', SHEET_WEBHOOK_URL: SHEET, SHEET_WEBHOOK_SECRET: 'shh' };
const good = {
  name: 'Taylor Smith', email: 'T@Example.com', phone: '210-555-0100', business: 'Shop Co',
  siteUrl: 'https://shop.example', noWebsite: false, city: 'San Antonio', services: 'Banners, yard signs, wraps',
  source: 'word-of-mouth', notes: '', format: 'video', heroVariant: 'a', turnstileToken: 'tok', website_hp: '',
};
const run = (body: object, e: object = env, f = fakeFetch()) => handleReview(post('/api/review', body), e, async () => data, f.fn);

describe('POST /api/review', () => {
  it('saves the request to the Reviews tab with tags', async () => {
    const f = fakeFetch();
    const res = await run(good, env, f);
    expect(res.status).toBe(200);
    const row = f.calls.find((c) => c.url === SHEET)!.body;
    expect(row.type).toBe('review');
    expect(row.email).toBe('t@example.com');
    expect(row.website).toBe('https://shop.example');
    expect(row.format).toBe('video');
    expect(row.tags).toBe('review-requested,source-word-of-mouth');
  });

  it('lists missing required fields', async () => {
    const res = await run({ ...good, business: '', city: ' ' });
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: 'missing_fields', fields: ['business', 'city'] });
  });

  it('rejects an unknown source and a bad email', async () => {
    expect((await run({ ...good, source: 'tv' })).status).toBe(400);
    expect(await (await run({ ...good, email: 'x' })).json()).toEqual({ error: 'invalid_email' });
  });

  it('drops an unknown format instead of failing', async () => {
    const f = fakeFetch();
    await run({ ...good, format: 'fax' }, env, f);
    expect(f.calls.find((c) => c.url === SHEET)!.body.format).toBe('');
  });

  it('honeypot, Turnstile and Kit fallback', async () => {
    const f = fakeFetch();
    expect((await run({ ...good, website_hp: 'x' }, env, f)).status).toBe(200);
    expect(f.calls).toHaveLength(0);
    expect((await run(good, env, fakeFetch({ turnstile: false }))).status).toBe(403);
    const k = fakeFetch();
    expect((await run(good, { TURNSTILE_SECRET: 's', KIT_API_KEY: 'k' }, k)).status).toBe(200);
    const tags = k.calls.filter((c) => c.url.endsWith('/v4/tags')).map((c) => c.body.name).sort();
    expect(tags).toEqual(['review-requested', 'source-word-of-mouth']);
  });
});
