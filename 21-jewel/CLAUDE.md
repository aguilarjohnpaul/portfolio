# 21 Jewel website — project rules for Claude Code

Read this file first, then `PHASE1_SPEC.md` (the build spec). The spec is the source of truth for scope, copy and behavior. If something in the spec is ambiguous, pick the simplest option that keeps Phase 2 and 3 possible, note it in `DECISIONS.md`, and keep going.

## What this is

Marketing site for **21 Jewel**, a solo revenue-strategy advisory run by JP (John Paul) in San Antonio, TX. It sells to owner-run service businesses (roughly 5–20 people) whose referrals have slowed. Phase 1 has two jobs:

1. Get visitors to take the free scorecard, **How Referable Is Your Business?**, and leave an email.
2. Fill five free **founding client** spots in exchange for case studies.

- Domain: `21jeweladvisory.com` (DNS on Cloudflare). `meet21j.com` 301-redirects to it.
- Public email: `johnpaul@21jeweladvisory.com`

## Stack (do not swap without asking)

| Layer | Choice | Why |
|---|---|---|
| Framework | Astro, static output, latest stable | Content lives in small files; cheap to edit |
| Styling | Plain CSS + custom properties in `src/styles/tokens.css` | One file to change the look |
| Fonts | `@fontsource-variable/fraunces`, `@fontsource-variable/inter` (self-hosted) | No third-party font requests |
| Hosting | Cloudflare Pages, deployed from GitHub `main` | Free; DNS already on Cloudflare |
| Server code | Cloudflare Pages Functions in `/functions` | Scorecard email capture only |
| Email list | Kit (ConvertKit) API v4, called only from the Pages Function | Free tier; API key never reaches the browser |
| Spam control | Cloudflare Turnstile on the scorecard email form | Free, invisible |
| Analytics + hero test | PostHog Cloud (free tier), events only | Funnel by hero variant |
| Founding application | Tally form, embedded | Free; emails JP on submit |
| Booking | Cal.com link (`[CAL_LINK]`) | Free |

Do not add Tailwind, React, a CMS, a CRM, Stripe, Zapier or a database in Phase 1.

## File layout

```
src/
  content/                 ← ALL copy lives here. Edit these, not components.
    site.yaml              ← brand, contact, nav, footer, feature flags, founding spot counts
    home.yaml              ← homepage sections, both hero variants
    offers.yaml            ← the five offers + studio sprint, prices
    scorecard.yaml         ← 12 questions, options, scoring bands, fixes
    founding.yaml          ← founding program copy
    studios.yaml           ← white-label page copy
    case-studies/          ← empty in Phase 1 (one .md per study later)
    testimonials.yaml      ← empty list in Phase 1
    pages.yaml             ← privacy, thanks and 404 copy
  styles/
    tokens.css             ← color, type, spacing, radius tokens (light + dark)
    base.css               ← reset, typography, layout primitives
  components/              ← small .astro components, one job each
  layouts/Base.astro
  pages/                   ← index, scorecard, founding-clients, offers, studios, privacy, 404
  content.config.ts        ← content schemas (Astro 7 location)
  scripts/                 ← browser code for the scorecard, Turnstile
  lib/
    content.ts             ← doc() loader, price label, placeholders
    scorecard.ts           ← pure scoring functions (unit-tested)
    scorecard-api.ts       ← /api/scorecard logic (unit-tested)
    kit.ts                 ← Kit v4 client
    analytics.ts           ← PostHog wrapper + event names
    hero.ts                ← hero variant assignment
functions/
  api/scorecard.ts         ← POST: Turnstile check → Kit subscriber + tags
public/                    ← favicon, og image, robots.txt, _redirects, _headers
scripts/                   ← csp.mjs (runs after build), kit-setup.mjs, og/ image maker
```

Content schemas are defined with Astro content collections (`src/content.config.ts`) so a typo in YAML fails the build instead of shipping.

## Editing rules (keep token use low)

These rules matter more than style preferences. JP updates this site through Claude and pays per token.

1. **Copy changes go in `src/content/*.yaml` only.** Never hard-code user-facing text in components.
2. **Look changes go in `src/styles/tokens.css` only** unless a layout change is requested.
3. Use targeted edits (Edit tool, exact string replace). Do not rewrite or re-read whole files to change a line.
4. Before reading a file, check whether `CLAUDE.md`, the spec or `DECISIONS.md` already answers the question.
5. Keep components under ~120 lines. Split rather than grow.
6. Don't regenerate the scorecard questions, offers or copy unless asked. They were chosen deliberately.
7. After changes, run `npm run check && npm run build` once. Don't loop on cosmetic fixes JP didn't ask for.
8. Log any judgment call in `DECISIONS.md`: one line each, newest first.

## Voice (for any copy you must write)

- Plain words an owner would use: referrals, word of mouth, leads, follow-up, steady work, slow months.
- Avoid jargon: RevOps, GTM, funnel optimization, synergy, leverage, "unlock," "supercharge," "seamless."
- Short sentences, active voice. Second person ("you"). JP speaks in first person ("I") on founding, about and studios pages.
- Brand values: **Honest over impressive. Serve the person, not the project. Build brands that outlast their owners.**
- No invented stats, client logos or testimonials. Missing facts stay as `[PLACEHOLDER]` and are listed in `TODO-JP.md`.
- No emoji. No em-dash-heavy writing.

## Brand tokens (summary; full values in the spec)

- Palette "Evergreen". Light: ground `#F3EFE6`, surface `#FBF9F6`, ink `#1E3B2F`, muted `#606D63`, accent fill `#B5643C`, accent text `#9F5835`, data green `#2F7D5B`, line `#D5D6CC`.
- Dark mode is required. It follows the visitor's OS setting, with a manual toggle in the footer.
- Type: Fraunces 600 for headings, Inter 400/500/600 for everything else.
- All text meets WCAG AA (4.5:1). The pale accent `#B5643C` is never used for text; use the accent-text token.

## Definition of done (every change)

- `npm run check` and `npm run build` pass.
- No horizontal scroll at 360px width; Lighthouse mobile ≥ 95 for performance, accessibility, best practices and SEO.
- Keyboard focus is visible; every form control has a label.
- New placeholders are added to `TODO-JP.md`.
