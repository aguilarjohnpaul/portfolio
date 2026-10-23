// Handler for POST /api/scorecard (Change 02 §4.4). Kept separate from the Function file so it can be unit-tested.
import { computeResult, isValidAnswers, type ScorecardData } from './scorecard';
import { checkTurnstile, clean, EMAIL, json, readBody, saveLead, type Env } from './api-common';

export type { Env } from './api-common';
export type ApiData = ScorecardData;

export async function handleScorecard(
  request: Request, env: Env, loadData: () => Promise<ApiData>, fetcher: typeof fetch = fetch,
): Promise<Response> {
  const body = await readBody(request);
  if (body instanceof Response) return body;

  // 1. Honeypot: pretend it worked.
  if (clean(body.website, 200)) return json(200, { ok: true });

  // 2. Turnstile.
  const blocked = await checkTurnstile(env, body.turnstileToken, request, fetcher);
  if (blocked) return blocked;

  // 3. Recompute the score from the answers; ignore anything else the browser sends.
  let data: ApiData;
  try { data = await loadData(); } catch (err) {
    console.error(err);
    return json(500, { error: 'server_error' });
  }
  if (!isValidAnswers(body.answers, data)) return json(400, { error: 'invalid_answers' });
  const [industry, ...scores] = body.answers;
  const r = computeResult(scores, data);

  // 4. Email.
  const email = clean(body.email, 254).toLowerCase();
  if (!EMAIL.test(email)) return json(400, { error: 'invalid_email' });
  const firstName = clean(body.firstName, 80);
  const hero = body.heroVariant === 'b' ? 'b' : 'a';
  const fixes = r.topFixes.map((q) => q.fix);
  const tags = [`scorecard-${r.band.slug}`, `industry-${industry}`, `hero-${hero}`];

  // 5. Save (Google Sheet + Gmail, or Kit as the fallback).
  return saveLead(env, {
    type: 'scorecard',
    timestamp: new Date().toISOString(),
    email, firstName, industry,
    points: r.points, max: r.max, band: r.band.name, headline: r.band.headline,
    topFixes: fixes, heroVariant: hero, tags: tags.join(','),
  }, {
    firstName,
    fields: {
      score_total: String(r.points), score_max: String(r.max), band: r.band.name,
      industry, top_fixes: fixes.join('||'), hero_variant: hero,
    },
  }, fetcher);
}
