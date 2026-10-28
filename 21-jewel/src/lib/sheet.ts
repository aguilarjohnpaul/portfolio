// Google Sheet + Gmail lead store. Server-only: runs inside the Pages Function.
// Posts each lead to JP's Google Apps Script web app (docs/google-sheet/Code.gs), which adds a row
// (Leads tab for the scorecard, Audits tab for Local Search Audit requests), emails the visitor and alerts JP.

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

/** Local Search Audit request (type "audit") goes to the Audits tab. */
export interface AuditRequest {
  type: 'audit';
  id: string;
  timestamp: string;
  business: string;
  trade: string;
  city: string;
  website: string;
  noWebsite: boolean;
  email: string;
  phone: string;
  situation: string;
  source: string;
  page: string;
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  heroVariant: 'a' | 'b';
  tags: string;
}

export type Lead = ScorecardLead | AuditRequest;

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
