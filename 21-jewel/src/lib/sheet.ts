// Google Sheet + Gmail lead store. Server-only: runs inside the Pages Function.
// Posts each scorecard lead to JP's Google Apps Script web app (docs/google-sheet/Code.gs),
// which adds a row, emails the visitor their breakdown and alerts JP.

export class SheetError extends Error {}

export interface Lead {
  timestamp: string;
  email: string;
  firstName: string;
  business: string;
  teamSize: string;
  total: number;
  referred: number;
  hired: number;
  again: number;
  band: string;
  weakestStage: string;
  topFixes: string[];
  heroVariant: 'a' | 'b';
  tags: string;
}

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
