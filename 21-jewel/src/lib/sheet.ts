// Google Sheet + Gmail lead store. Server-only: runs inside the Pages Function.
// Posts each lead to JP's Google Apps Script web app (docs/google-sheet/Code.gs), which adds a row
// (Leads tab for the scorecard, Reviews tab for Website Review requests), emails the visitor and alerts JP.

export class SheetError extends Error {}

/** Scorecard result (type "scorecard") goes to the Leads tab. */
export interface ScorecardLead {
  type: 'scorecard';
  timestamp: string;
  email: string;
  firstName: string;
  industry: string;
  points: number;
  max: number;
  band: string;
  headline: string;
  topFixes: string[];
  heroVariant: 'a' | 'b';
  tags: string;
}

/** Website Review request (type "review") goes to the Reviews tab. */
export interface ReviewRequest {
  type: 'review';
  timestamp: string;
  name: string;
  email: string;
  phone: string;
  business: string;
  website: string;
  noWebsite: boolean;
  city: string;
  services: string;
  source: string;
  notes: string;
  format: string;
  heroVariant: 'a' | 'b';
  tags: string;
}

export type Lead = ScorecardLead | ReviewRequest;

export async function sendToSheet(url: string, secret: string, lead: Lead, fetcher: typeof fetch = fetch) {
  let res: Response;
  try {
    res = await fetcher(url, {
      method: 'POST',
      // text/plain keeps Apps Script from rejecting the request; the body is still JSON.
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ secret, ...lead }),
      // Apps Script answers with a 302 to script.googleusercontent.com.
      redirect: 'follow',
      signal: AbortSignal.timeout(10_000),
    });
  } catch (err) {
    throw new SheetError(`Sheet request failed: ${err instanceof Error ? err.message : err}`);
  }
  const body = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
  if (!res.ok || body.ok !== true) {
    throw new SheetError(`Sheet rejected the lead: ${res.status} ${body.error ?? ''}`.trim());
  }
}
