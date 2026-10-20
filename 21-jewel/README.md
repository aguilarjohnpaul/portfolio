# 21 Jewel website

Marketing site for 21 Jewel, a revenue-strategy advisory for owner-run service firms. Phase 1 has two jobs: get visitors to take the free scorecard, **How Referable Is Your Business?**, and fill five founding client spots.

- Build spec: `PHASE1_SPEC.md`. Project rules: `CLAUDE.md`.
- Your launch checklist: `TODO-JP.md`. Judgment calls: `DECISIONS.md`.
- Stack: Astro (static), plain CSS, Cloudflare Pages + one Pages Function, Kit, Turnstile, PostHog, Tally, Cal.com.

## Commands

```sh
npm install
npm run dev       # local site at http://localhost:4321 (analytics events print to the console)
npm run check     # type check + unit tests
npm run build     # build to dist/ and write CSP hashes into dist/_headers
npm run preview   # serve dist/ (no /api; use `npx wrangler pages dev dist` with .dev.vars for that)
```

## How to change things

- **Change a price:** `src/content/offers.yaml` → set `price_from` on the offer, for example `"$750"`.
- **Change hero copy:** `src/content/home.yaml` → `hero.variants.a` or `hero.variants.b`.
- **Mark a founding spot filled:** `src/content/site.yaml` → raise `founding.filled` by one.
- **Pick the hero winner:** `src/content/site.yaml` → `heroTest.winner: "a"` (or `"b"`).
- **Add a testimonial:** `src/content/testimonials.yaml` → add `{ id, quote, name, role }` to the list. The proof section appears on the homepage automatically.

More in `docs/updating-content.md`. Then run `npm run check && npm run build`, commit and push.

## Where things live

| Path | What |
|---|---|
| `src/content/*.yaml` | All copy |
| `src/styles/tokens.css` | Colors, type sizes, spacing (light and dark) |
| `src/components/` | Small Astro components, one job each |
| `src/lib/scorecard.ts` | Scoring rules (tested in `scorecard.test.ts`) |
| `src/lib/scorecard-api.ts`, `src/lib/kit.ts` | `/api/scorecard` logic (tested in `scorecard-api.test.ts`) |
| `functions/api/scorecard.ts` | The Cloudflare Pages Function |
| `public/_headers` | Security headers and CSP |
| `docs/` | Kit email copy, reading the hero test, updating content |
