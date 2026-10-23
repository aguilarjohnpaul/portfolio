// Test-only fake fetch for the Pages Function handlers.
import { vi } from 'vitest';

export const SHEET = 'https://script.google.com/macros/s/TEST/exec';

export function fakeFetch(opts: { turnstile?: boolean; sheet?: { status?: number; body?: unknown }; kitFail?: number; existing?: boolean } = {}) {
  const calls: { url: string; method: string; init?: RequestInit; body: any }[] = [];
  let tagId = 100;
  const fn = vi.fn(async (url: string | URL | Request, init?: RequestInit) => {
    const u = String(url);
    const method = init?.method ?? 'GET';
    const body = typeof init?.body === 'string' ? JSON.parse(init.body) : init?.body;
    calls.push({ url: u, method, init, body });
    const res = (status: number, b: unknown) => new Response(JSON.stringify(b), { status });
    if (u.includes('siteverify')) return res(200, { success: opts.turnstile ?? true });
    if (u === SHEET) return res(opts.sheet?.status ?? 200, opts.sheet?.body ?? { ok: true });
    if (opts.kitFail) return res(opts.kitFail, { errors: ['nope'] });
    if (u.endsWith('/v4/subscribers')) return res(opts.existing ? 200 : 201, { subscriber: { id: 42 } });
    if (u.endsWith('/v4/subscribers/42')) return res(200, { subscriber: { id: 42 } });
    if (u.endsWith('/v4/tags')) return res(201, { tag: { id: tagId++, name: body.name } });
    if (/\/v4\/tags\/\d+\/subscribers$/.test(u)) return res(201, { subscriber: { id: 42 } });
    return res(404, {});
  });
  return { fn: fn as unknown as typeof fetch, calls };
}

export const post = (path: string, body: object) =>
  new Request(`https://21jeweladvisory.com${path}`, { method: 'POST', body: JSON.stringify(body) });
