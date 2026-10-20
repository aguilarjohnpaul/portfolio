// POST /api/scorecard: Turnstile check, then Kit subscriber, fields and tags.
// Logic lives in src/lib/scorecard-api.ts so it can be tested.
import { handleScorecard, type ApiData, type Env } from '../../src/lib/scorecard-api';

interface Context {
  request: Request;
  env: Env & { ASSETS: { fetch: (input: Request | URL | string) => Promise<Response> } };
}

export const onRequestPost = async ({ request, env }: Context): Promise<Response> =>
  handleScorecard(request, env, async () => {
    const res = await env.ASSETS.fetch(new URL('/scorecard-data.json', request.url));
    if (!res.ok) throw new Error(`scorecard-data.json: ${res.status}`);
    return (await res.json()) as ApiData;
  });
