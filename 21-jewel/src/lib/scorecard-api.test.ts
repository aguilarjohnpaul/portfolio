import { readFileSync } from 'node:fs';
import { parse } from 'yaml';
import { describe, expect, it, vi } from 'vitest';
import { handleScorecard, type ApiData } from './scorecard-api';

const sc = parse(readFileSync(new URL('../content/scorecard.yaml', import.meta.url), 'utf8'));
const data: ApiData = { ...sc, team_sizes: sc.email.team_sizes };
const env = { KIT_API_KEY: 'kit_test', TURNSTILE_SECRET: 'secret' };
const answers = [3, 3, 3, 3, 0, 1, 2, 3, 3, 3, 3, 3];

const req = (body: object) =>
  new Request('https://21jeweladvisory.com/api/scorecard', { method: 'POST', body: JSON.stringify(body) });
const good = { email: 'Owner@Example.com', firstName: 'Ana', teamSize: '5-20', answers, total: 999, heroVariant: 'b', turnstileToken: 'tok', website: '' };

function mockFetch(opts: { turnstile?: boolean; existing?: boolean; kitFail?: number } = {}) {
  const calls: { url: string; method: string; body: any }[] = [];
  let tagId = 100;
  const fn = vi.fn(async (url: string | URL | Request, init?: RequestInit) => {
    const u = String(url);
    const method = init?.method ?? 'GET';
    const body = typeof init?.body === 'string' ? JSON.parse(init.body) : init?.body;
    calls.push({ url: u, method, body });
    const res = (status: number, b: unknown) => new Response(JSON.stringify(b), { status });
    if (u.includes('siteverify')) return res(200, { success: opts.turnstile ?? true });
    if (opts.kitFail) return res(opts.kitFail, { errors: ['nope'] });
    if (u.endsWith('/v4/subscribers')) return res(opts.existing ? 200 : 201, { subscriber: { id: 42 } });
    if (u.endsWith('/v4/subscribers/42')) return res(200, { subscriber: { id: 42 } });
    if (u.endsWith('/v4/tags')) return res(201, { tag: { id: tagId++, name: body.name } });
    if (/\/v4\/tags\/\d+\/subscribers$/.test(u)) return res(201, { subscriber: { id: 42 } });
    return res(404, {});
  });
  return { fn: fn as unknown as typeof fetch, calls };
}

const run = (body: object, f: ReturnType<typeof mockFetch>, e: object = env) =>
  handleScorecard(req(body), e, async () => data, f.fn);

describe('POST /api/scorecard', () => {
  it('creates the subscriber with server-computed fields and tags', async () => {
    const f = mockFetch();
    const res = await run(good, f);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    const sub = f.calls.find((c) => c.url.endsWith('/v4/subscribers'))!;
    expect(sub.body.email_address).toBe('owner@example.com');
    expect(sub.body.first_name).toBe('Ana');
    expect(sub.body.fields.score_total).toBe('83'); // recomputed, not 999
    expect(sub.body.fields.score_hired).toBe('50');
    expect(sub.body.fields.weakest_stage).toBe('Get hired');
    expect(sub.body.fields.band).toBe('Built to be referred');
    expect(sub.body.fields.top_fixes.split('||')).toHaveLength(3);
    expect(sub.body.fields.hero_variant).toBe('b');
    const tagNames = f.calls.filter((c) => c.url.endsWith('/v4/tags')).map((c) => c.body.name);
    expect(tagNames.sort()).toEqual(['band-built-to-be-referred', 'hero-b', 'scorecard-complete', 'team-5-20', 'weakest-get-hired'].sort());
    expect(f.calls.filter((c) => /tags\/\d+\/subscribers/.test(c.url))).toHaveLength(5);
  });

  it('updates fields when the subscriber already exists', async () => {
    const f = mockFetch({ existing: true });
    expect((await run(good, f)).status).toBe(200);
    const put = f.calls.find((c) => c.method === 'PUT')!;
    expect(put.url).toMatch(/\/v4\/subscribers\/42$/);
    expect(put.body.fields.score_total).toBe('83');
  });

  it('uses tag ids from KIT_TAG_IDS without creating tags', async () => {
    const f = mockFetch();
    const ids = { 'scorecard-complete': 1, 'band-built-to-be-referred': 2, 'weakest-get-hired': 3, 'hero-b': 4, 'team-5-20': 5 };
    await run(good, f, { ...env, KIT_TAG_IDS: JSON.stringify(ids) });
    expect(f.calls.some((c) => c.url.endsWith('/v4/tags'))).toBe(false);
    expect(f.calls.some((c) => c.url.endsWith('/v4/tags/1/subscribers'))).toBe(true);
  });

  it('silently accepts a filled honeypot without calling anything', async () => {
    const f = mockFetch();
    const res = await run({ ...good, website: 'spam.example' }, f);
    expect(res.status).toBe(200);
    expect(f.calls).toHaveLength(0);
  });

  it('rejects a failed Turnstile check', async () => {
    const f = mockFetch({ turnstile: false });
    const res = await run(good, f);
    expect(res.status).toBe(403);
    expect(await res.json()).toEqual({ error: 'verification_failed' });
  });

  it('rejects a bad email', async () => {
    const res = await run({ ...good, email: 'nope' }, mockFetch());
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: 'invalid_email' });
  });

  it('rejects bad answers', async () => {
    const res = await run({ ...good, answers: [9, 9] }, mockFetch());
    expect(res.status).toBe(400);
  });

  it('returns list_unavailable when Kit fails', async () => {
    const res = await run(good, mockFetch({ kitFail: 500 }));
    expect(res.status).toBe(502);
    expect(await res.json()).toEqual({ error: 'list_unavailable' });
  });

  it('leaves out the team tag for other team sizes', async () => {
    const f = mockFetch();
    await run({ ...good, teamSize: '21-50' }, f);
    const tagNames = f.calls.filter((c) => c.url.endsWith('/v4/tags')).map((c) => c.body.name);
    expect(tagNames).not.toContain('team-5-20');
  });
});
