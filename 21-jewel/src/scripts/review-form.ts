// Website Review request form: validation, Turnstile, submit to /api/review, then /thanks/review.
import { heroVariant, track } from '../lib/analytics';
import { loadTurnstile, type TurnstileHandle } from './turnstile';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const REQUIRED = ['name', 'email', 'business', 'city', 'services', 'source'] as const;

export function initReviewForm() {
  const form = document.querySelector<HTMLFormElement>('[data-review-form]');
  if (!form) return;
  const f: HTMLFormElement = form;
  const errors = JSON.parse(f.dataset.errors ?? '{}') as Record<string, string>;
  const submit = f.querySelector<HTMLButtonElement>('[data-submit]')!;
  const label = submit.textContent!;
  const site = f.elements.namedItem('siteUrl') as HTMLInputElement;
  const noSite = f.querySelector<HTMLInputElement>('[data-no-website]')!;
  let turnstile: TurnstileHandle | null = null;

  // Load Turnstile once the visitor starts filling the form.
  f.addEventListener('focusin', () => { turnstile ??= loadTurnstile(f.querySelector('[data-turnstile]')!); }, { once: true });
  noSite.addEventListener('change', () => { site.disabled = noSite.checked; if (noSite.checked) site.value = ''; });

  const target = (k: string): HTMLElement | null =>
    k === 'source' ? f.querySelector('fieldset.choices') : (f.elements.namedItem(k) as HTMLElement | null);
  const setErr = (k: string, msg: string) => {
    const el = f.querySelector<HTMLElement>(`[data-err="${k}"]`);
    if (el) el.textContent = msg;
    target(k)?.setAttribute('aria-invalid', msg ? 'true' : 'false');
  };

  f.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(f);
    const val = (k: string) => String(fd.get(k) ?? '').trim();
    setErr('form', '');
    let first: string | null = null;
    for (const k of REQUIRED) {
      const bad = !val(k) ? errors.required : k === 'email' && !EMAIL.test(val(k)) ? errors.invalid_email : '';
      setErr(k, bad);
      if (bad && !first) first = k;
    }
    if (first) {
      const el = target(first);
      (el?.querySelector('input') ?? el)?.focus();
      return;
    }

    submit.disabled = true;
    submit.textContent = submit.dataset.sending ?? label;
    let code = 'network';
    try {
      const res = await fetch('/api/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: val('name'), email: val('email'), phone: val('phone'), business: val('business'),
          siteUrl: val('siteUrl'), noWebsite: noSite.checked, city: val('city'), services: val('services'),
          source: val('source'), notes: val('notes'), format: val('format'),
          website_hp: val('website_hp'), heroVariant: heroVariant(),
          turnstileToken: (await turnstile?.token()) ?? '',
        }),
      });
      const body = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string; fields?: string[] };
      if (res.ok && body.ok) {
        track('review_form_submit', { source_answer: val('source') });
        location.assign('/thanks/review');
        return;
      }
      if (body.error === 'missing_fields' && body.fields) {
        body.fields.forEach((k) => setErr(k, errors.required));
        code = 'missing_fields';
      } else code = body.error && errors[body.error] ? body.error : 'network';
    } catch {}
    track('review_form_error', { error: code });
    if (code === 'invalid_email') setErr('email', errors.invalid_email);
    else if (code !== 'missing_fields') setErr('form', errors[code]);
    if (code === 'verification_failed') turnstile?.reset();
    submit.disabled = false;
    submit.textContent = label;
  });
}
