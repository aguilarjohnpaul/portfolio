import { readFileSync } from 'node:fs';
import { parse } from 'yaml';
import { describe, expect, it } from 'vitest';
import { handleScorecard, type ApiData } from './scorecard-api';
import { fakeFetch, post, SHEET } from './test-helpers';

const data = parse(readFileSync(new URL('../content/scorecard.yaml', import.meta.url), 'utf8')) as ApiData;
const sheetEnv = { TURNSTILE_SECRET: 'secret', SHEET_WEBHOOK_URL: SHEET, SHEET_WEBHOOK_SECRET: 'shh' };
const kitEnv = { TURNSTILE_SECRET: 'secret', KIT_API_KEY: 'kit_test' };
// Q3 = 0, Q7 = 1, Q11 = 1, the rest 2 → 20 points, "Built to win work".
const scores = [2, 2, 0, 2, 2, 2, 1, 2, 2, 2, 1, 2];
const good = { email: 'Owner@Example.com', firstName: 'Ana', answers: ['sign-print', ...scores], heroVariant: 'b', turnstileToken: 'tok', website: '' };
const run = (body: object, env: object, f = fakeFetch()) => handleScorecard(post('/api/scorecard', body), env, async () => data, f.fn);

describe('POST /api/scorecard', () => {
  it('sends the server-computed result to the sheet', async () => {
    const f = fakeFetch();
    const res = await run({ ...good, points: 999 }, sheetEnv, f);
    expect(res.status).toBe(200);
    const lead = f.calls.find((c) => c.url === SHEET)!.body;
    expect(lead.type).toBe('scorecard');
    expect(lead.secret).toBe('shh');
    expect(lead.email).toBe('owner@example.com');
    expect(lead.firstName).toBe('Ana');
    expect(lead.industry).toBe('sign-print');
    expect(lead.points).toBe(20);
    expect(lead.max).toBe(24);
    expect(lead.band).toBe('Built to win work');
    expect(lead.topFixes).toHaveLength(3);
    expect(lead.topFixes[0]).toMatch(/^Ask for a review/); // Q3 scored 0, so it comes first
    expect(lead.tags.split(',').sort()).toEqual(['hero-b', 'industry-sign-print', 'scorecard-built-to-win-work']);
  });

  it('falls back to Kit with fields and tags', async () => {
    const f = fakeFetch();
    expect((await run(good, kitEnv, f)).status).toBe(200);
    const sub = f.calls.find((c) => c.url.endsWith('/v4/subscribers'))!;
    expect(sub.body.fields.score_total).toBe('20');
    expect(sub.body.fields.industry).toBe('sign-print');
    const tagNames = f.calls.filter((c) => c.url.endsWith('/v4/tags')).map((c) => c.body.name).sort();
    expect(tagNames).toEqual(['hero-b', 'industry-sign-print', 'scorecard-built-to-win-work']);
  });

  it('prefers the sheet when both are configured', async () => {
    const f = fakeFetch();
    await run(good, { ...sheetEnv, KIT_API_KEY: 'k' }, f);
    expect(f.calls.some((c) => c.url.includes('api.kit.com'))).toBe(false);
  });

  it('silently accepts a filled honeypot', async () => {
    const f = fakeFetch();
    expect((await run({ ...good, website: 'spam' }, sheetEnv, f)).status).toBe(200);
    expect(f.calls).toHaveLength(0);
  });

  it('rejects a failed Turnstile check', async () => {
    const res = await run(good, sheetEnv, fakeFetch({ turnstile: false }));
    expect(res.status).toBe(403);
  });

  it('rejects bad answers, a bad industry and a bad email', async () => {
    expect((await run({ ...good, answers: scores }, sheetEnv)).status).toBe(400);
    expect((await run({ ...good, answers: ['plumbing', ...scores] }, sheetEnv)).status).toBe(400);
    const res = await run({ ...good, email: 'nope' }, sheetEnv);
    expect(await res.json()).toEqual({ error: 'invalid_email' });
  });

  it('returns list_unavailable when saving fails or nothing is configured', async () => {
    expect((await run(good, sheetEnv, fakeFetch({ sheet: { body: { ok: false } } }))).status).toBe(502);
    expect((await run(good, kitEnv, fakeFetch({ kitFail: 500 }))).status).toBe(502);
    expect((await run(good, { TURNSTILE_SECRET: 'secret' })).status).toBe(502);
  });
});
