// Google Analytics 4 wrapper and event names (spec §9, Change 02 §6). Browser-only.
// gtag.js loads after the first interaction or when the browser is idle, so it
// never slows the first paint. Events before that wait in window.dataLayer.
// Nothing loads when the visitor sends Global Privacy Control or Do Not Track.
// In dev, events are logged to the console instead of sent.

// Change 02 (§6): cta_click replaces hero_cta_click, nav_scorecard_click and offer_card_click.
export type EventName =
  | 'cta_click' | 'scorecard_start' | 'scorecard_answer' | 'scorecard_complete'
  | 'scorecard_email_submit' | 'scorecard_email_error'
  | 'review_form_submit' | 'review_form_error' | 'founding_apply_submit' | 'offer_view' | 'industry_page_view'
  | 'book_call_click' | 'email_click' | 'theme_toggle';

type Props = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window { dataLayer: unknown[]; gtag: (...args: unknown[]) => void }
  interface Navigator { globalPrivacyControl?: boolean }
}

const GA_ID = import.meta.env.PUBLIC_GA_ID as string | undefined;
let enabled = false;
let started = false;

export function heroVariant(): 'a' | 'b' {
  return document.documentElement.dataset.hero === 'b' ? 'b' : 'a';
}

function optedOut(): boolean {
  return navigator.globalPrivacyControl === true || navigator.doNotTrack === '1';
}

export function track(event: EventName, props?: Props): void {
  if (import.meta.env.DEV) {
    console.info('[analytics]', event, { ...props, hero_variant: heroVariant() });
    return;
  }
  if (!enabled) return;
  window.gtag('event', event, { ...props, hero_variant: heroVariant() });
}

function setup() {
  window.dataLayer = window.dataLayer || [];
  // gtag.js reads the Arguments object, so this must be a plain function.
  window.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer.push(arguments);
  };
  const variant = heroVariant();
  const debug = new URLSearchParams(location.search).has('ga_debug');
  window.gtag('js', new Date());
  window.gtag('set', 'user_properties', { hero_variant: variant });
  window.gtag('config', GA_ID, { hero_variant: variant, ...(debug ? { debug_mode: true } : {}) });
  enabled = true;
}

function load() {
  const s = document.createElement('script');
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_ID!)}`;
  document.head.append(s);
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
  if (import.meta.env.DEV || !GA_ID || optedOut()) return;
  setup();
  let fired = false;
  const go = () => {
    if (fired) return;
    fired = true;
    load();
  };
  for (const ev of ['pointerdown', 'keydown', 'scroll', 'touchstart']) {
    addEventListener(ev, go, { once: true, passive: true });
  }
  const idle = () =>
    'requestIdleCallback' in window ? requestIdleCallback(go, { timeout: 4000 }) : setTimeout(go, 3000);
  if (document.readyState === 'complete') idle();
  else addEventListener('load', idle, { once: true });
}
