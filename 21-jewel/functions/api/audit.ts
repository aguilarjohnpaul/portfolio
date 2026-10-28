// POST /api/audit: Turnstile check, then save the Local Search Audit request (Google Sheet or Kit).
// Logic lives in src/lib/audit-api.ts so it can be tested.
import { handleAudit, type AuditData } from '../../src/lib/audit-api';
import type { Env } from '../../src/lib/api-common';

interface Context {
  request: Request;
  env: Env & { ASSETS: { fetch: (input: Request | URL | string) => Promise<Response> } };
}

export const onRequestPost = async ({ request, env }: Context): Promise<Response> =>
  handleAudit(request, env, async () => {
    const res = await env.ASSETS.fetch(new URL('/audit-data.json', request.url));
    if (!res.ok) throw new Error(`audit-data.json: ${res.status}`);
    return (await res.json()) as AuditData;
  });
