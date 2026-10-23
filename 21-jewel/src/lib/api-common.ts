// Shared helpers for the Pages Functions (scorecard and Website Review). Server-only.
import { kitClient, KitError } from './kit';
import { sendToSheet, type Lead } from './sheet';

export interface Env {
  SHEET_WEBHOOK_URL?: string;
  SHEET_WEBHOOK_SECRET?: string;
  KIT_API_KEY?: string;
  KIT_TAG_IDS?: string;
  TURNSTILE_SECRET?: string;
}

export const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });

export const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const clean = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

/** Parse a small JSON body. Returns a Response on failure. */
export async function readBody(request: Request): Promise<Record<string, unknown> | Response> {
  const raw = await request.text();
  if (raw.length > 10_000) return json(413, { error: 'too_large' });
  try {
    const body = JSON.parse(raw);
    return body && typeof body === 'object' ? body : json(400, { error: 'invalid_request' });
  } catch {
    return json(400, { error: 'invalid_request' });
  }
}

/** Turnstile check. Returns a 403 Response when it fails, or null when it passes. */
export async function checkTurnstile(env: Env, token: unknown, request: Request, fetcher: typeof fetch) {
  if (!env.TURNSTILE_SECRET) {
    console.error('TURNSTILE_SECRET is not set');
    return json(403, { error: 'verification_failed' });
  }
  const t = clean(token, 2048);
  if (!t) return json(403, { error: 'verification_failed' });
  const form = new FormData();
  form.append('secret', env.TURNSTILE_SECRET);
  form.append('response', t);
  const ip = request.headers.get('CF-Connecting-IP');
  if (ip) form.append('remoteip', ip);
  try {
    const res = await fetcher('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body: form });
    const out = (await res.json().catch(() => ({}))) as { success?: boolean };
    return out.success === true ? null : json(403, { error: 'verification_failed' });
  } catch (err) {
    console.error('Turnstile verify failed', err);
    return json(403, { error: 'verification_failed' });
  }
}

/**
 * Save a lead: Google Sheet + Gmail when SHEET_WEBHOOK_URL is set, otherwise Kit (fallback).
 * Returns the API response to send.
 */
export async function saveLead(
  env: Env, lead: Lead, kit: { firstName?: string; fields: Record<string, string> }, fetcher: typeof fetch,
): Promise<Response> {
  if (env.SHEET_WEBHOOK_URL) {
    try {
      await sendToSheet(env.SHEET_WEBHOOK_URL, env.SHEET_WEBHOOK_SECRET ?? '', lead, fetcher);
      return json(200, { ok: true });
    } catch (err) {
      console.error(err instanceof Error ? err.message : err);
      return json(502, { error: 'list_unavailable' });
    }
  }
  if (!env.KIT_API_KEY) {
    console.error('Neither SHEET_WEBHOOK_URL nor KIT_API_KEY is set');
    return json(502, { error: 'list_unavailable' });
  }
  let tagIds: Record<string, number> = {};
  try { tagIds = env.KIT_TAG_IDS ? JSON.parse(env.KIT_TAG_IDS) : {}; } catch { console.error('KIT_TAG_IDS is not valid JSON'); }
  const client = kitClient(env.KIT_API_KEY, tagIds, fetcher);
  try {
    await client.upsert({ email: lead.email, firstName: kit.firstName || undefined, fields: kit.fields });
    await client.tag(lead.email, lead.tags.split(',').filter(Boolean));
    return json(200, { ok: true });
  } catch (err) {
    console.error(err instanceof Error ? err.message : err);
    if (err instanceof KitError && err.status === 422) return json(400, { error: 'invalid_email' });
    return json(502, { error: 'list_unavailable' });
  }
}
