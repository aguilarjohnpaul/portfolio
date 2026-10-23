// POST /api/review: Turnstile check, then save the Website Review request (Google Sheet or Kit).
// Logic lives in src/lib/review-api.ts so it can be tested.
import { handleReview, type ReviewData } from '../../src/lib/review-api';
import type { Env } from '../../src/lib/api-common';

interface Context {
  request: Request;
  env: Env & { ASSETS: { fetch: (input: Request | URL | string) => Promise<Response> } };
}

export const onRequestPost = async ({ request, env }: Context): Promise<Response> =>
  handleReview(request, env, async () => {
    const res = await env.ASSETS.fetch(new URL('/review-data.json', request.url));
    if (!res.ok) throw new Error(`review-data.json: ${res.status}`);
    return (await res.json()) as ReviewData;
  });
