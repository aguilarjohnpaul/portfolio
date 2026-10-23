// Turnstile site key for the forms. Cloudflare's "always passes" test key keeps local builds working.
import { warn } from './content';

const TEST_KEY = '1x00000000000000000000AA';

export function turnstileSiteKey(): string {
  const key = import.meta.env.PUBLIC_TURNSTILE_SITE_KEY || TEST_KEY;
  if (key === TEST_KEY) warn('PUBLIC_TURNSTILE_SITE_KEY is not set. Using the Turnstile test key.');
  return key;
}
