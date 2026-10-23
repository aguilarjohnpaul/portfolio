// PostHog wrapper and event names (spec §9, Change 02 §6). Browser-only.
// Loads PostHog after the first interaction or when the browser is idle.
// In dev, events are logged to the console instead of sent.

// Change 02 (§6): cta_click replaces hero_cta_click, nav_scorecard_click and offer_card_click.
export type EventName =
  | 'cta_click' | 'scorecard_start' | 'scorecard_answer' | 'scorecard_complete'
  | 'scorecard_email_submit' | 'scorecard_email_error'
  | 'review_form_submit' | 'review_form_error' | 'founding_apply_submit' | 'offer_view' | 'industry_page_view'
  | 'book_call_click' | 'email_click' | 'theme_toggle';

type Props = Record<string, string | number | boolean | undefined>;
type Client = { capture: (e: string, p?: Props) => void };

const KEY = import.meta.env.PUBLIC_POSTHOG_KEY as string | undefined;
const HOST = (import.meta.env.PUBLIC_POSTHOG_HOST as string | undefined) || 'https://us.i.posthog.com';
const queue: [EventName, Props | undefined][] = [];
let client: Client | null = null;
let started = false;

export function heroVariant(): 'a' | 'b' {
  return document.documentElement.dataset.hero === 'b' ? 'b' : 'a';
}

export function track(event: EventName, props?: Props): void {
  if (import.meta.env.DEV) {
    console.info('[analytics]', event, { ...props, hero_variant: heroVariant() });
    return;
  }
  if (!KEY) return;
  if (client) client.capture(event, props);
  else queue.push([event, props]);
}

async function load() {
  const { default: posthog } = await import('posthog-js/dist/module.slim');
  posthog.init(KEY!, {
    api_host: HOST,
    autocapture: false,
    capture_pageview: true,
    capture_pageleave: false,
    disable_session_recording: true,
    disable_surveys: true,
    persistence: 'localStorage',
    respect_dnt: true,
  });
  posthog.register({ hero_variant: heroVariant() });
  client = posthog;
  queue.splice(0).forEach(([e, p]) => posthog.capture(e, p));
}

/** Track clicks on any element with data-event="name" and data-prop-*="value". */
function bindClicks() {
  document.addEventListener('click', (e) => {
    const el = (e.target as Element | null)?.closest<HTMLElement>('[data-event]');
    if (!el) return;
    const props: Props = {};
    for (const [k, v] of Object.entries(el.dataset)) {
      if (k.startsWith('prop') && k.length > 4) props[k[4].toLowerCase() + k.slice(5)] = v;
    }
    track(el.dataset.event as EventName, props);
  });
}

export function initAnalytics(): void {
  if (started) return;
  started = true;
  bindClicks();
  if (import.meta.env.DEV || !KEY) return;
  let fired = false;
  const go = () => {
    if (fired) return;
    fired = true;
    load().catch(() => {});
  };
  for (const ev of ['pointerdown', 'keydown', 'scroll', 'touchstart']) {
    addEventListener(ev, go, { once: true, passive: true });
  }
  const idle = () =>
    'requestIdleCallback' in window ? requestIdleCallback(go, { timeout: 4000 }) : setTimeout(go, 3000);
  if (document.readyState === 'complete') idle();
  else addEventListener('load', idle, { once: true });
}
