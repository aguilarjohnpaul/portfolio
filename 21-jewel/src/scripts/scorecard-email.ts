// Email capture form: validation, submit to /api/scorecard, and error messages.
import { track } from '../lib/analytics';
import type { TurnstileHandle } from './turnstile';

type Payload = Record<string, unknown>;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function bindEmailForm(
  root: HTMLElement,
  errors: Record<string, string>,
  payload: () => Payload,
  turnstile: () => TurnstileHandle | null,
  onSent: () => void,
) {
  const form = root.querySelector<HTMLFormElement>('[data-email-form]')!;
  const submit = form.querySelector<HTMLButtonElement>('[data-submit]')!;
  const label = submit.textContent!;
  const errEl = (k: string) => form.querySelector<HTMLElement>(`[data-err="${k}"]`)!;

  const setErr = (k: string, input: HTMLElement | null, msg: string) => {
    errEl(k).textContent = msg;
    input?.setAttribute('aria-invalid', msg ? 'true' : 'false');
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const email = String(fd.get('email') ?? '').trim();
    const emailInput = form.elements.namedItem('email') as HTMLInputElement;

    setErr('email', emailInput, !email ? errors.email_required : EMAIL.test(email) ? '' : errors.invalid_email);
    setErr('form', null, '');
    if (errEl('email').textContent) return emailInput.focus();

    submit.disabled = true;
    submit.textContent = submit.dataset.sending ?? label;
    let code = 'network';
    try {
      const res = await fetch('/api/scorecard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...payload(),
          firstName: String(fd.get('firstName') ?? '').trim() || undefined,
          email,
          website: String(fd.get('website') ?? ''),
          turnstileToken: (await turnstile()?.token()) ?? '',
        }),
      });
      const body = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (res.ok && body.ok) {
        track('scorecard_email_submit', { band: String(payload().band) });
        onSent();
        form.hidden = true;
        const sent = root.querySelector<HTMLElement>('[data-sent]')!;
        sent.hidden = false;
        sent.focus();
        return;
      }
      code = body.error && errors[body.error] ? body.error : 'network';
    } catch {}
    track('scorecard_email_error', { error: code });
    if (code === 'invalid_email') setErr('email', emailInput, errors.invalid_email);
    else setErr('form', null, errors[code]);
    if (code === 'verification_failed') turnstile()?.reset();
    submit.disabled = false;
    submit.textContent = label;
  });
}
