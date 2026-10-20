interface ImportMetaEnv {
  readonly PUBLIC_POSTHOG_KEY?: string;
  readonly PUBLIC_POSTHOG_HOST?: string;
  readonly PUBLIC_TURNSTILE_SITE_KEY?: string;
}
interface ImportMeta { readonly env: ImportMetaEnv }
