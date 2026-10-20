# Decisions

Judgment calls made while building Phase 1. One line each, newest first.

- 2026-10-20 · The Tally form sits in a frame that stays light in dark mode (`--embed-*` tokens), because the embedded form can't follow the site's theme.
- 2026-10-20 · Added `nav.cta_short` ("Scorecard"): the full header button wrapped onto two lines on 360px phones.
- 2026-10-20 · Analytics loads `posthog-js/dist/module.slim` (about 50KB gzipped, loaded after first interaction or idle) instead of the full build, to protect Lighthouse.
- 2026-10-20 · CSP allows inline scripts by SHA-256 hash, written into `dist/_headers` by `scripts/csp.mjs` after each build. Styles use `'unsafe-inline'` because bar widths are set with inline styles; scripts stay locked down.
- 2026-10-20 · The Function reads scoring data from `/scorecard-data.json` (built from `scorecard.yaml`) through `env.ASSETS`, so the server and the browser always use the same questions and fixes. Fix texts are therefore public in the page source, which is fine: they are advice, not secrets.
- 2026-10-20 · Function logic lives in `src/lib/scorecard-api.ts` and `src/lib/kit.ts` (unit-tested with a fake Kit); `functions/api/scorecard.ts` is a thin wrapper.
- 2026-10-20 · Kit: `POST /v4/subscribers` returns 200 for an existing email, so the Function then calls `PUT /v4/subscribers/{id}` to save the new fields. Tags are created by name (`POST /v4/tags` is idempotent) unless `KIT_TAG_IDS` is set. Subscribers are created with `state: active` (no double opt-in) because the visitor asked for the email.
- 2026-10-20 · Custom fields must exist in Kit before the API can write them. `scripts/kit-setup.mjs` creates them once, plus all tags.
- 2026-10-20 · If Turnstile or Kit can't be reached, the API returns `verification_failed` (403) or `list_unavailable` (502) rather than crashing. Bad answer arrays return 400 `invalid_answers`; the UI shows the generic "try again" message for it.
- 2026-10-20 · Team size is required on the email form (spec lists it without "optional"). It also drives the `team-5-20` tag.
- 2026-10-20 · Scorecard keyboard: 1–4 select and auto-advance; arrow keys change the selection without advancing (so arrowing through options doesn't skip questions); Enter advances. A visible Next button is there too.
- 2026-10-20 · The waitlist state: when `founding.filled` = `total`, buttons read "Join the waitlist", the apply heading changes, and the Tally URL gets `?waitlist=1`. The homepage button still goes to `/founding-clients#apply`.
- 2026-10-20 · Placeholders for links: until `links.cal` is set, "Book a call" opens an email to JP. Until `links.tally` is set, the application section shows JP's email. Both print a build warning.
- 2026-10-20 · Price labels: "Starting at [PRICE]" shows while prices are placeholders (with a build warning). Empty `price_from` shows "Pricing on request", as the spec says. The studio sprint shows "Pricing on request" with no warning.
- 2026-10-20 · Wrote short copy where the spec had none: scorecard "Who it's for" ("Any owner who wants a quick, honest read on how new work finds them."), advisor timeline ("Ongoing, month to month"), privacy page, thanks page ("reply within two business days"), 404, form errors and the email privacy note. Listed in TODO-JP.md to confirm.
- 2026-10-20 · Small pages' copy (privacy, thanks, 404) lives in a new `src/content/pages.yaml`, so no copy is hard-coded.
- 2026-10-20 · Added a `--error` color token (light `#A3352B`, 5.9:1 on ground; dark `#F0A196`, 8.1:1 on surface).
- 2026-10-20 · Font fallbacks (Georgia for Fraunces, Arial for Inter) use approximate size-adjust values. Measured layout shift is 0.
- 2026-10-20 · Logo: a simple faceted-jewel mark in the band accent color on ink, used for the favicon and the OG image. Replace freely; regenerate images with `scripts/og/make-images.mjs`.
- 2026-10-20 · Astro 7 requires content schemas at `src/content.config.ts` (the old `src/content/config.ts` location throws). Each YAML file loads as one entry with id `main`.
- 2026-10-20 · Built in the `21-jewel/` folder of the `portfolio` repo because the new repo didn't exist yet. It is self-contained and can be moved to its own repo as-is. In Cloudflare Pages, set the root directory to `21-jewel` while it lives here.
