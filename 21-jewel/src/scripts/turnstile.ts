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

export interface TurnstileHandle { token: () => Promise<string>; reset: () => void }

const SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=__onTurnstile';

export function loadTurnstile(el: HTMLElement): TurnstileHandle {
  let token = '';
  let id: string | undefined;
  const render = () => {
    id = window.turnstile!.render(el, {
      sitekey: el.dataset.sitekey,
      appearance: 'interaction-only',
      callback: (t: string) => (token = t),
      'expired-callback': () => (token = ''),
      'error-callback': () => { token = ''; },
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
    reset: () => { token = ''; if (window.turnstile && id) window.turnstile.reset(id); },
  };
}
