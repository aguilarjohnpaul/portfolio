# 21 Jewel website — project rules for Claude Code

Read this file first, then `PHASE1_SPEC.md` (the build spec). The spec is the source of truth for scope, copy and behavior. If something in the spec is ambiguous, pick the simplest option that keeps Phase 2 and 3 possible, note it in `DECISIONS.md`, and keep going.

## What this is

Marketing site for **21 Jewel**, run by JP (John Paul) in San Antonio, TX. Since **Change 02** (Oct 23, 2026; full text in `docs/changes/CHANGE_02_local_ladder.md`) it sells to **owner-run local service businesses** (about 1–20 staff): sign and print shops first, then HVAC, roofing and other trades, anywhere in the US.

**One-liner:** I help local service businesses get more calls from Google: a cleaner Google profile, steady reviews, and a website that turns visits into quote requests.

Phase 1 has two jobs:

1. Get **free Website Review** requests (`/review`) and scorecard emails (**Is Your Website Losing You Work?**).
2. Fill five free **founding client** spots (The 30-Day Fix, free). Hidden at launch behind `flags.showFounding`.

**Offer ladder (Change 02):** Website Review (free) → Google Profile Tune-Up ($450) → The 30-Day Fix ($1,250) → Growth Advisor ($500/month). Add-ons: extra service page ($750), Lead Pipelines (ask me), advisory hour ($200/hour).

**Execution rule:**
- JP does one-time, templated work himself, plus the light monthly work inside Growth Advisor (about 3 hours per client per month).
- Ads management, social posting, design, logo work and full site rebuilds go to partners, who quote separately and bill the client directly.
- JP edits on any common platform himself: Wix, Squarespace, WordPress, GoDaddy, Shopify, Google Sites.

**Feature flags** (`site.yaml` → `flags`): `showFounding`, `showResults`, `showHvac`, `showRoofing`, `showFaq`, `showTerms`. A page whose flag is off isn't built at all.

- Domain: `21jeweladvisory.com` (DNS on Cloudflare). `meet21j.com` 301-redirects to it.
- Public email: `johnpaul@21jeweladvisory.com`

## Stack (do not swap without asking)

| Layer | Choice | Why |
|---|---|---|
| Framework | Astro, static output, latest stable | Content lives in small files; cheap to edit |
| Styling | Plain CSS + custom properties in `src/styles/tokens.css` | One file to change the look |
| Fonts | `@fontsource-variable/fraunces`, `@fontsource-variable/inter` (self-hosted) | No third-party font requests |
| Hosting | Cloudflare Pages (project `21jewel`, root `21-jewel/`) | Free; DNS already on Cloudflare |
| Server code | Cloudflare Pages Functions in `/functions` | Scorecard email and Website Review requests |
| Email list | Google Sheet + Gmail via JP's Apps Script web app (`docs/google-sheet/`), called only from the Pages Function. Kit API v4 still supported as a fallback. | Free; JP uses Gmail; secrets never reach the browser |
| Spam control | Cloudflare Turnstile on the scorecard and Website Review forms | Free, invisible |
| Analytics + hero test | Google Analytics 4 (`PUBLIC_GA_ID`), loaded lazily, off under GPC/DNT. Search Console for search terms. | Free; JP knows it; funnel by hero variant |
| Founding application | Tally form, embedded | Free; emails JP on submit |
| Booking | Cal.com link (`site.yaml` → `links.cal`) | Free |

Do not add Tailwind, React, a CMS, a CRM, Stripe, Zapier or a database in Phase 1.

## File layout

```
src/
  content/                 ← ALL copy lives here. Edit these, not components.
    site.yaml              ← brand, contact, nav, footer, feature flags, founding spot counts, SEO
    home.yaml              ← homepage sections, both hero variants
    offers.yaml            ← the 4-step ladder, add-ons, studio sprint, prices, FAQ
    scorecard.yaml         ← 12 questions, options, scoring bands, fixes
    founding.yaml          ← founding program copy
    studios.yaml           ← white-label page copy
    case-studies/          ← empty in Phase 1 (one .md per study later)
    testimonials.yaml      ← empty list in Phase 1
    pages.yaml             ← review, about, results, privacy, terms, thanks and 404 copy
    industries.yaml        ← /industries/* pages (one template)
  styles/
    tokens.css             ← color, type, spacing, radius tokens (light + dark)
    base.css               ← reset, typography, layout primitives
  components/              ← small .astro components, one job each
  layouts/Base.astro
  pages/                   ← index, review, scorecard, offers, about, studios, privacy, 404,
                             industries/[slug], thanks/*, [gated] (founding-clients, terms, results)
  content.config.ts        ← content schemas (Astro 7 location)
  scripts/                 ← browser code for the scorecard, Turnstile
  lib/
    content.ts             ← doc() loader, price label, placeholders
    scorecard.ts           ← pure scoring functions (unit-tested)
    scorecard-api.ts       ← /api/scorecard logic (unit-tested)
    review-api.ts          ← /api/review logic (unit-tested)
    api-common.ts          ← Turnstile check, save to Sheet or Kit
    sheet.ts               ← Google Sheet webhook client (default)
    kit.ts                 ← Kit v4 client (fallback)
    analytics.ts           ← Google Analytics 4 wrapper + event names
    hero.ts                ← hero variant assignment
functions/
  api/scorecard.ts         ← POST: Turnstile check → Google Sheet (or Kit)
  api/review.ts            ← POST: Turnstile check → Google Sheet Reviews tab (or Kit)
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

- Plain words an owner would use: calls, quote requests, jobs, reviews, showing up on Google, the map, slow months, word of mouth, the shop down the street.
- Never say: "#1 on Google," "guaranteed rankings," "guaranteed leads" or any revenue guarantee. The only guarantee is the build guarantee.
- Avoid jargon: SEO strategy, funnel, RevOps, GTM, leverage, "unlock," "supercharge," "seamless." Say "showing up on Google," not "local SEO," in headlines. Spell out "Google Business Profile" once per page; "Google profile" after that.
- Short sentences, active voice. Second person ("you"). JP speaks as "I" on every page.
- Brand values: **Honest over impressive. Serve the person, not the project. Build things that outlast me.**
- Tagline: **Precise work. More calls.**
- Brand names (Mailchimp, Saatva, Howler Brothers, Sendero Provisions) appear only on `/about`, as JP's past experience, text only, never as 21 Jewel clients.
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
