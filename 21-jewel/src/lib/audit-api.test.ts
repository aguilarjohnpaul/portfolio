import { describe, expect, it } from 'vitest';
import { handleAudit, type AuditData } from './audit-api';
import { fakeFetch, post, SHEET } from './test-helpers';

const data: AuditData = { situations: ['quiet', 'paying', 'maps', 'reviews', 'check'] };
const env = { TURNSTILE_SECRET: 'secret', SHEET_WEBHOOK_URL: SHEET, SHEET_WEBHOOK_SECRET: 'shh' };
const good = {
  business: 'Shop Co', trade: 'Sign shop', city: '78209', siteUrl: 'https://shop.example', noWebsite: false,
  email: 'T@Example.com', phone: '210-555-0100', situation: 'paying', source: 'A friend',
  page: '/industries/sign-print', utm: { utm_source: 'Google', utm_medium: 'organic', utm_campaign: 'gbp' },
  heroVariant: 'b', turnstileToken: 'tok', website_hp: '',
};
const run = (body: object, e: object = env, f = fakeFetch()) => handleAudit(post('/api/audit', body), e, async () => data, f.fn);

describe('POST /api/audit', () => {
  it('saves the request to the Sheet with tags, utm and an id', async () => {
    const f = fakeFetch();
    const res = await run(good, env, f);
    expect(res.status).toBe(200);
    const out = (await res.json()) as { ok: boolean; id: string };
    expect(out.ok).toBe(true);
    expect(out.id).toMatch(/^[a-z0-9]{8,}$/);
    const row = f.calls.find((c) => c.url === SHEET)!.body;
    expect(row.type).toBe('audit');
    expect(row.id).toBe(out.id);
    expect(row.email).toBe('t@example.com');
    expect(row.trade).toBe('Sign shop');
    expect(row.utm_source).toBe('Google');
    expect(row.heroVariant).toBe('b');
    expect(row.tags).toBe('audit-requested,situation-paying,utm-google');
  });

  it('lists missing required fields', async () => {
    const res = await run({ ...good, business: '', city: ' ' });
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: 'missing_fields', fields: ['business', 'city'] });
  });

  it('rejects an unknown situation and a bad email', async () => {
    expect((await run({ ...good, situation: 'other' })).status).toBe(400);
    expect(await (await run({ ...good, email: 'x' })).json()).toEqual({ error: 'invalid_email' });
  });

  it('ignores junk utm and keeps going', async () => {
    const f = fakeFetch();
    const res = await run({ ...good, utm: 'nope' }, env, f);
    expect(res.status).toBe(200);
    expect(f.calls.find((c) => c.url === SHEET)!.body.utm_source).toBe('');
  });

  it('honeypot, Turnstile and Kit fallback', async () => {
    const f = fakeFetch();
    expect((await run({ ...good, website_hp: 'x' }, env, f)).status).toBe(200);
    expect(f.calls).toHaveLength(0);
    expect((await run(good, env, fakeFetch({ turnstile: false }))).status).toBe(403);
    const k = fakeFetch();
    expect((await run(good, { TURNSTILE_SECRET: 's', KIT_API_KEY: 'k' }, k)).status).toBe(200);
    const tags = k.calls.filter((c) => c.url.endsWith('/v4/tags')).map((c) => c.body.name).sort();
    expect(tags).toEqual(['audit-requested', 'situation-paying', 'utm-google']);
  });
});
