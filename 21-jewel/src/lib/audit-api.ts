// Handler for POST /api/audit (Change 03 §7): the free Local Search Audit request form.
import { checkTurnstile, clean, EMAIL, json, readBody, saveLead, type Env } from './api-common';

export interface AuditData { situations: string[] }

const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign'] as const;

export async function handleAudit(
  request: Request, env: Env, loadData: () => Promise<AuditData>, fetcher: typeof fetch = fetch,
): Promise<Response> {
  const body = await readBody(request);
  if (body instanceof Response) return body;

  if (clean(body.website_hp, 200)) return json(200, { ok: true, id: 'ok' }); // honeypot

  const blocked = await checkTurnstile(env, body.turnstileToken, request, fetcher);
  if (blocked) return blocked;

  let data: AuditData;
  try { data = await loadData(); } catch (err) {
    console.error(err);
    return json(500, { error: 'server_error' });
  }

  const utmIn = (body.utm && typeof body.utm === 'object' ? body.utm : {}) as Record<string, unknown>;
  const utm = Object.fromEntries(UTM_KEYS.map((k) => [k, clean(utmIn[k], 100)])) as Record<(typeof UTM_KEYS)[number], string>;
  const f = {
    business: clean(body.business, 160),
    trade: clean(body.trade, 160),
    city: clean(body.city, 160),
    website: clean(body.siteUrl, 300),
    noWebsite: body.noWebsite === true,
    email: clean(body.email, 254).toLowerCase(),
    phone: clean(body.phone, 40),
    situation: clean(body.situation, 40),
    source: clean(body.source, 200),
    page: clean(body.page, 300),
  };
  const missing = (['business', 'trade', 'city', 'email', 'situation'] as const).filter((k) => !f[k]);
  if (missing.length) return json(400, { error: 'missing_fields', fields: missing });
  if (!EMAIL.test(f.email)) return json(400, { error: 'invalid_email' });
  if (!data.situations.includes(f.situation)) return json(400, { error: 'missing_fields', fields: ['situation'] });

  const hero = body.heroVariant === 'b' ? 'b' : 'a';
  const id = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
  const tags = ['audit-requested', `situation-${f.situation}`, ...(utm.utm_source ? [`utm-${utm.utm_source.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`] : [])];
  const res = await saveLead(env, {
    type: 'audit', id, timestamp: new Date().toISOString(), ...f, ...utm, heroVariant: hero, tags: tags.join(','),
  }, {
    firstName: undefined,
    fields: {
      business_name: f.business, trade: f.trade, city: f.city, phone: f.phone,
      website: f.noWebsite ? 'none' : f.website, situation: f.situation, lead_source: f.source, hero_variant: hero,
      ...utm,
    },
  }, fetcher);
  if (res.status !== 200) return res;
  return json(200, { ok: true, id });
}
