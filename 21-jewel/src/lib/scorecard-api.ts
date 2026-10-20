// Handler for POST /api/scorecard (spec §6.4). Kept separate from the Function file so it can be unit-tested.
import { computeResult, isValidAnswers, type ScorecardData, type StageId } from './scorecard';
import { kitClient, KitError } from './kit';
import { sendToSheet, type Lead } from './sheet';

export interface Env {
  SHEET_WEBHOOK_URL?: string;
  SHEET_WEBHOOK_SECRET?: string;
  KIT_API_KEY?: string;
  KIT_TAG_IDS?: string;
  TURNSTILE_SECRET?: string;
}

export interface ApiData extends ScorecardData {
  stages: { id: StageId; name: string; slug: string }[];
  team_sizes: { value: string }[];
}

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const clean = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

async function verifyTurnstile(secret: string, token: string, ip: string | null, fetcher: typeof fetch) {
  if (!token) return false;
  const form = new FormData();
  form.append('secret', secret);
  form.append('response', token);
  if (ip) form.append('remoteip', ip);
  try {
    const res = await fetcher('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body: form });
    const out = (await res.json().catch(() => ({}))) as { success?: boolean };
    return out.success === true;
  } catch (err) {
    console.error('Turnstile verify failed', err);
    return false;
  }
}

export async function handleScorecard(
  request: Request, env: Env, loadData: () => Promise<ApiData>, fetcher: typeof fetch = fetch,
): Promise<Response> {
  const raw = await request.text();
  if (raw.length > 10_000) return json(413, { error: 'too_large' });
  let body: Record<string, unknown>;
  try { body = JSON.parse(raw); } catch { return json(400, { error: 'invalid_request' }); }

  // 1. Honeypot: pretend it worked.
  if (clean(body.website, 200)) return json(200, { ok: true });

  // 2. Turnstile.
  if (!env.TURNSTILE_SECRET) {
    console.error('TURNSTILE_SECRET is not set');
    return json(403, { error: 'verification_failed' });
  }
  const ip = request.headers.get('CF-Connecting-IP');
  if (!(await verifyTurnstile(env.TURNSTILE_SECRET, clean(body.turnstileToken, 2048), ip, fetcher))) {
    return json(403, { error: 'verification_failed' });
  }

  // 3. Recompute the score from answers; ignore client totals.
  let data: ApiData;
  try { data = await loadData(); } catch (err) {
    console.error(err);
    return json(500, { error: 'server_error' });
  }
  if (!isValidAnswers(body.answers, data)) return json(400, { error: 'invalid_answers' });
  const r = computeResult(body.answers, data);
  const slug = (id: StageId) => data.stages.find((s) => s.id === id)!.slug;

  // 4. Email.
  const email = clean(body.email, 254).toLowerCase();
  if (!EMAIL.test(email)) return json(400, { error: 'invalid_email' });

  const teamSize = clean(body.teamSize, 20);
  const team = data.team_sizes.some((t) => t.value === teamSize) ? teamSize : '';
  const hero = body.heroVariant === 'b' ? 'b' : 'a';

  // 5. Build the lead once. Every value comes from the server-side result.
  const firstName = clean(body.firstName, 80);
  const business = clean(body.business, 120);
  const weakestName = data.stages.find((s) => s.id === r.weakestStage)!.name;
  const fixes = r.topFixes.map((q) => q.fix);
  const tags = ['scorecard-complete', `band-${r.band.slug}`, `weakest-${slug(r.weakestStage)}`, `hero-${hero}`];
  if (team === '5-20') tags.push('team-5-20');

  // 6. Save it: Google Sheet + Gmail if configured, else Kit (Phase 2 fallback).
  if (env.SHEET_WEBHOOK_URL) {
    const lead: Lead = {
      timestamp: new Date().toISOString(),
      email, firstName, business, teamSize: team,
      total: r.total, referred: r.stages.referred, hired: r.stages.hired, again: r.stages.again,
      band: r.band.name, weakestStage: weakestName, topFixes: fixes, heroVariant: hero, tags: tags.join(','),
    };
    try {
      await sendToSheet(env.SHEET_WEBHOOK_URL, env.SHEET_WEBHOOK_SECRET ?? '', lead, fetcher);
    } catch (err) {
      console.error(err instanceof Error ? err.message : err);
      return json(502, { error: 'list_unavailable' });
    }
    return json(200, { ok: true });
  }

  if (!env.KIT_API_KEY) {
    console.error('Neither SHEET_WEBHOOK_URL nor KIT_API_KEY is set');
    return json(502, { error: 'list_unavailable' });
  }
  let tagIds: Record<string, number> = {};
  try { tagIds = env.KIT_TAG_IDS ? JSON.parse(env.KIT_TAG_IDS) : {}; } catch { console.error('KIT_TAG_IDS is not valid JSON'); }

  const kit = kitClient(env.KIT_API_KEY, tagIds, fetcher);
  try {
    await kit.upsert({
      email,
      firstName: firstName || undefined,
      fields: {
        score_total: String(r.total),
        score_referred: String(r.stages.referred),
        score_hired: String(r.stages.hired),
        score_again: String(r.stages.again),
        band: r.band.name,
        weakest_stage: weakestName,
        top_fixes: fixes.join('||'),
        team_size: team,
        business_name: business,
        hero_variant: hero,
      },
    });
    await kit.tag(email, tags);
  } catch (err) {
    console.error(err instanceof Error ? err.message : err);
    if (err instanceof KitError && err.status === 422) return json(400, { error: 'invalid_email' });
    return json(502, { error: 'list_unavailable' });
  }
  return json(200, { ok: true });
}
