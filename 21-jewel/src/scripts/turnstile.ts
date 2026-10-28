// Loads Cloudflare Turnstile only when the email form is shown.
declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string;
      reset: (id?: string) => void;
    };
    __onTurnstile?: () => void;
  }
}

export interface TurnstileHandle { token: () => Promise<string>; reset: () => void; error: () => string }

const SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=__onTurnstile';

export function loadTurnstile(el: HTMLElement): TurnstileHandle {
  let token = '';
  let lastError = '';
  let id: string | undefined;
  const render = () => {
    id = window.turnstile!.render(el, {
      sitekey: el.dataset.sitekey,
      appearance: 'interaction-only',
      callback: (t: string) => { token = t; lastError = ''; },
      'expired-callback': () => { token = ''; },
      // Error codes are listed at developers.cloudflare.com/turnstile/troubleshooting/client-side-errors/
      // 110200 = this domain isn't in the widget's hostname list; 400020 = wrong site key.
      'error-callback': (code: string) => { token = ''; lastError = String(code || 'unknown'); console.warn('[turnstile] error', lastError); return true; },
    });
  };
  if (window.turnstile) render();
  else {
    window.__onTurnstile = render;
    const s = document.createElement('script');
    s.src = SRC;
    s.async = true;
    s.defer = true;
    document.head.append(s);
  }
  return {
    // Waits up to 8 seconds for the invisible check to finish.
    token: async () => {
      for (let i = 0; !token && i < 40; i++) await new Promise((r) => setTimeout(r, 200));
      return token;
    },
    reset: () => { token = ''; lastError = ''; if (window.turnstile && id) window.turnstile.reset(id); },
    error: () => lastError,
  };
}
