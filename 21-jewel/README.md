# 21 Jewel website

Marketing site for 21 Jewel Advisory: local search for San Antonio service businesses. The site's job is a free Local Search Audit request or a phone call. Everything else (services, pricing, industries, guides) exists to earn one of those.

- Current spec: `docs/changes/CHANGE_03_local_search.md`. Project rules: `CLAUDE.md`.
- Your checklist: `TODO-JP.md`. Judgment calls: `DECISIONS.md`.
- Stack: Astro (static), plain CSS, Cloudflare Pages + two Pages Functions, Google Sheet + Gmail (Apps Script) for leads and follow-ups, a second Google Sheet for editing copy at build time, Turnstile, Google Analytics 4 (Clarity behind a flag), Cal.com.

## Commands

```sh
npm install
npm run dev       # local site at http://localhost:4321 (analytics events print to the console)
npm run check     # type check + unit tests
npm run build     # build to dist/ and write CSP hashes into dist/_headers
npm run preview   # serve dist/ (no /api; use `npx wrangler pages dev dist` with .dev.vars for that)
npm run dev:drafts    # same as dev, but guides marked draft: true also build
npm run sheet:sync    # pull the content Sheet into src/content/snapshot/ (the nightly Action does this)
```

## How to change things

**From the Google Sheet (no code, live in about 2 minutes):** `docs/how-to-edit-the-sheet.md`. Headlines, buttons, paragraphs, prices, FAQs, industry headlines, testimonials, guide titles and publish state, and every on/off flag.

**From the repo:**
- **Change a price:** `src/content/offers.yaml` → `price_from`, for example `"$750"` (or the Sheet's `offers` tab).
- **Change hero copy:** `src/content/home.yaml` → `hero.variants.a` / `b` (or the Sheet's `strings` tab).
- **Edit a guide's body:** `src/content/learn/<slug>.md` is plain text with Markdown headings. Edit it on GitHub (pencil icon) and commit; the site rebuilds.
- **Publish or unpublish a guide:** `draft: false` / `true` at the top of its file (or the Sheet's `guides` tab).
- **Show or hide a section or page:** `src/content/site.yaml` → `flags` (or the Sheet's `flags` tab).
- **Pick the hero winner:** `src/content/site.yaml` → `heroTest.winner: "a"` (or `"b"`).
- **Add a testimonial:** `src/content/testimonials.yaml` (or the Sheet's `testimonials` tab). The proof section appears when there is one.
- **Add the photo:** put a 4:5 JPG at `public/jp.jpg` and set `photo: /jp.jpg` in `home.yaml` → `about` and `pages.yaml` → `about`. The monogram disappears.

Then `npm run check && npm run build`, commit and push.

## Where things live

| Path | What |
|---|---|
| `src/content/*.yaml`, `src/content/learn/*.md` | All copy. Guides are Markdown. |
| `src/lib/overrides.ts`, `src/lib/sheet-overrides.ts`, `scripts/sheet/` | The content Sheet: what it may change and how it's read at build |
| `src/content/snapshot/` | Last nightly copy of the Sheet (fallback when Google is unreachable) |
| `src/styles/tokens.css` | Colors, type sizes, spacing |
| `src/components/` | Small Astro components, one job each |
| `src/lib/audit-api.ts`, `src/lib/scorecard-api.ts` | `/api/audit` and `/api/scorecard` logic (tested) |
| `functions/api/` | The Cloudflare Pages Functions |
| `docs/google-sheet/Code.gs` | Leads Sheet script: saves leads, sends emails, runs follow-ups |
| `docs/google-sheet-content/Code.gs` | Content Sheet script: the 21J menu (publish, check, set up tabs) |
| `public/_headers`, `scripts/csp.mjs` | Security headers and CSP |
| `docs/` | Setup guides, follow-up email copy, reading the hero test, change docs |
