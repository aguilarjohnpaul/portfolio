// Handler for POST /api/review (Change 02 §4.3): the free Website Review request form.
import { checkTurnstile, clean, EMAIL, json, readBody, saveLead, type Env } from './api-common';

export interface ReviewData { sources: string[]; formats: string[] }

export async function handleReview(
  request: Request, env: Env, loadData: () => Promise<ReviewData>, fetcher: typeof fetch = fetch,
): Promise<Response> {
  const body = await readBody(request);
  if (body instanceof Response) return body;

  if (clean(body.website_hp, 200)) return json(200, { ok: true }); // honeypot

  const blocked = await checkTurnstile(env, body.turnstileToken, request, fetcher);
  if (blocked) return blocked;

  let data: ReviewData;
  try { data = await loadData(); } catch (err) {
    console.error(err);
    return json(500, { error: 'server_error' });
  }

  const f = {
    name: clean(body.name, 120),
    email: clean(body.email, 254).toLowerCase(),
    phone: clean(body.phone, 40),
    business: clean(body.business, 160),
    website: clean(body.siteUrl, 300),
    noWebsite: body.noWebsite === true,
    city: clean(body.city, 160),
    services: clean(body.services, 500),
    source: clean(body.source, 40),
    notes: clean(body.notes, 2000),
    format: clean(body.format, 20),
  };
  const missing = (['name', 'email', 'business', 'city', 'services', 'source'] as const).filter((k) => !f[k]);
  if (missing.length) return json(400, { error: 'missing_fields', fields: missing });
  if (!EMAIL.test(f.email)) return json(400, { error: 'invalid_email' });
  if (!data.sources.includes(f.source)) return json(400, { error: 'missing_fields', fields: ['source'] });
  if (f.format && !data.formats.includes(f.format)) f.format = '';

  const hero = body.heroVariant === 'b' ? 'b' : 'a';
  const tags = ['review-requested', `source-${f.source}`];
  return saveLead(env, {
    type: 'review', timestamp: new Date().toISOString(), ...f, heroVariant: hero, tags: tags.join(','),
  }, {
    firstName: f.name.split(/\s+/)[0],
    fields: {
      business_name: f.business, phone: f.phone, website: f.noWebsite ? 'none' : f.website, city: f.city,
      top_services: f.services, review_format: f.format, hero_variant: hero,
    },
  }, fetcher);
}
