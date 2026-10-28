# 21 Jewel website — project rules for Claude Code

Read this file first, then `docs/changes/CHANGE_03_local_search.md` (the current build spec, Oct 27, 2026). Change 03 wins wherever it disagrees with `PHASE1_SPEC.md` or Change 02; those two stay for history. The spec is the source of truth for scope, copy and behavior. If something in the spec is ambiguous, pick the simplest option that keeps Phase 2 and 3 possible, note it in `DECISIONS.md`, and keep going.

## What this is

Marketing site for **21 Jewel Advisory** (wordmark "21 Jewel"), run by JP (John Paul) in San Antonio, TX. Since **Change 03** (Oct 27, 2026; `docs/changes/CHANGE_03_local_search.md`) it sells **local search** to owner-run service businesses in San Antonio first and Texas second: Google, Bing and Apple profiles, listings, reviews and website pages. Industries: sign and print, roofing, plumbing, electrical, remodeling, landscaping and tree service. Never HVAC, dental or med spa. No brand work. Paid ads are never featured.

**Frame, used everywhere:** Get found. Get chosen. Get the call.

**The site's one job:** a free **Local Search Audit** request (`/audit`) or a phone call to **(737) 391-3041**. Every page ends in one of those. Booking links appear only on `/thanks/audit` and `/about`.

**Ladder (`offers.yaml`):** Free Local Search Audit → Get Found Setup ($650) → Get Chosen Setup ($1,450) → Keep Ranking ($450/month, month-to-month, no minimum). Half of a setup fee credits against the first three months of Keep Ranking within 60 days. Add-ons: extra page $350, partner work quoted separately, advisory hour $150.

**Execution rule:** JP does the one-time setups and the monthly Keep Ranking work himself. Social posting, paid search, design and full rebuilds go to partners who quote and bill the client directly. JP edits on any common website platform.

**Feature flags** (`site.yaml` → `flags`, also editable from the content Sheet): `showFounding`, `showResults`, `showFaq`, `showTerms`, `showAreas`, `showSpanish`, `showClarity`, `showScorecardLink`, `realExamples`. A page or section whose flag is off isn't built at all.

**Two Google Sheets:** the *leads* Sheet (forms post to it; Apps Script emails and follow-ups; `docs/google-sheet/`) and the *content* Sheet (read at build time to override copy, prices, FAQs, flags and guide titles; `docs/google-sheet-content/`, `src/lib/overrides.ts`). The Sheet can change values that exist in the YAML; it cannot add pages or sections, and it never touches links, ids, slugs, photos, contact details or brand identity.

- Domain: `21jeweladvisory.com` (DNS on Cloudflare). `meet21j.com` 301-redirects to it.
- Public email: `johnpaul@21jeweladvisory.com`. Phone: (737) 391-3041.

## Stack (do not swap without asking)

| Layer | Choice | Why |
|---|---|---|
| Framework | Astro, static output, latest stable | Content lives in small files; cheap to edit |
| Styling | Plain CSS + custom properties in `src/styles/tokens.css` | One file to change the look |
| Fonts | `@fontsource-variable/fraunces`, `@fontsource-variable/inter` (self-hosted) | No third-party font requests |
| Hosting | Cloudflare Pages (project `21jewel`, root `21-jewel/`) | Free; DNS already on Cloudflare |
| Server code | Cloudflare Pages Functions in `/functions` | Scorecard email and Local Search Audit requests |
| Leads + follow-ups | Google Sheet + Gmail via JP's Apps Script web app (`docs/google-sheet/`), called only from the Pages Function; a daily trigger sends the day-12 and day-30 follow-ups. Kit API v4 still supported as a fallback. | Free; JP uses Gmail; no new tools |
| Content editing | A second Google Sheet read at build time (`src/lib/overrides.ts`, `scripts/sheet/`), with a nightly snapshot in `src/content/snapshot/` and a deploy-hook "Publish" menu | JP edits copy without code; nothing is fetched in the browser |
| Spam control | Cloudflare Turnstile on the scorecard and audit forms | Free, invisible |
| Analytics + hero test | Google Analytics 4 (`PUBLIC_GA_ID`), loaded lazily, off under GPC/DNT. Scroll depth and learn-read events built in. Microsoft Clarity behind `flags.showClarity` + `PUBLIC_CLARITY_ID`. Search Console for search terms. | Free; JP knows it; funnel by hero variant |
| Founding application | Tally form, embedded | Free; emails JP on submit |
| Booking | Cal.com link (`site.yaml` → `links.cal`) | Free |

Do not add Tailwind, React, a CMS, a CRM, Stripe, Zapier or a database. The content Sheet is the CMS.

## File layout

```
src/
  content/                 ← ALL copy lives here. Edit these, not components.
    site.yaml              ← brand, contact, nav groups, sticky bar, trust strip, flags, SEO titles
    home.yaml              ← homepage sections, both hero variants
    offers.yaml            ← the ladder, add-ons, pricing-page labels, "how I measure"
    services.yaml          ← /services/* pages (one template)
    industries.yaml        ← /industries/* pages (one template): searches, breaks, fixes, example table
    faqs.yaml              ← FAQ lists keyed by page id (home, pricing, audit, each service and industry slug)
    learn.yaml             ← learn hub labels, author box, CTA
    learn/*.md             ← guides and quick answers (frontmatter + Markdown; draft: true never builds)
    pages.yaml             ← audit, about, results, privacy, terms, thanks and 404 copy
    scorecard.yaml         ← 12 questions, options, bands, fixes
    founding.yaml          ← founding program copy (flag-gated)
    testimonials.yaml      ← proof slot (renders when non-empty)
    case-studies/          ← one .md per study (published: true to show)
    snapshot/              ← nightly copy of the content Sheet (committed by the Action)
  styles/tokens.css, base.css
  components/              ← small .astro components, one job each (Header, NavGroup, MobileMenu, StickyBar,
                             TrustStrip, Monogram, Headshot, Breadcrumbs, CtaBlock, GuideCard, AuthorBox, …)
  layouts/Base.astro       ← accepts `seo` override, `noindex`, `stickyBar`
  pages/                   ← index, audit, pricing, about, scorecard, privacy, 404, services/[slug],
                             industries/[slug], learn/index, learn/[slug], thanks/*, [gated],
                             content-seed.json, llms.txt, audit-data.json, scorecard-data.json
  content.config.ts        ← schemas; every YAML loader applies the content Sheet before validating
  scripts/                 ← browser code: audit form, scorecard, Turnstile
  lib/
    content.ts             ← doc(), guides(), navLinks(), priceLabel(), flags
    overrides.ts           ← what the content Sheet may change (unit-tested)
    sheet-overrides.ts     ← loads the Sheet once per build, applies, prints one summary
    schema.ts              ← JSON-LD builders (ProfessionalService, Service, Article, Person, FAQ, breadcrumbs, speakable)
    audit-api.ts, scorecard-api.ts, api-common.ts, sheet.ts, kit.ts   ← Function logic (tested)
    analytics.ts           ← GA4 wrapper, event names, utm capture, scroll depth, Clarity flag
    hero.ts                ← hero variant assignment
functions/api/audit.ts, scorecard.ts
scripts/csp.mjs (after build), no-placeholders.mjs (in check), sheet-sync.mjs, sheet/, og/
docs/                      ← setup guides, change docs, follow-up email copy, both Apps Scripts
.github/workflows/sheet-sync.yml (repo root)
```

Content schemas are defined with Astro content collections (`src/content.config.ts`) so a typo in YAML, or a Sheet value that breaks a schema, fails the build instead of shipping.

## Editing rules (keep token use low)

These rules matter more than style preferences. JP updates this site through Claude and pays per token.

1. **Copy changes go in `src/content/*.yaml` only.** Never hard-code user-facing text in components.
2. **Look changes go in `src/styles/tokens.css` only** unless a layout change is requested.
3. Use targeted edits (Edit tool, exact string replace). Do not rewrite or re-read whole files to change a line.
4. Before reading a file, check whether `CLAUDE.md`, the spec or `DECISIONS.md` already answers the question.
5. Keep components under ~120 lines. Split rather than grow.
6. Don't regenerate the scorecard questions, offers, industry pages or guides unless asked. They were chosen deliberately.
9. Every new string in YAML is automatically editable from the content Sheet, so never hard-code copy and never put a link, id or slug in a field whose name doesn't say so (`href`, `id`, `slug`, `url`, …).
10. Placeholders fail `npm run check`. A section without real content renders nothing, behind a flag or an empty-collection check.
7. After changes, run `npm run check && npm run build` once. Don't loop on cosmetic fixes JP didn't ask for.
8. Log any judgment call in `DECISIONS.md`: one line each, newest first.

## Voice (for any copy you must write)

- Owner words: calls, quote requests, jobs, reviews, showing up on Google, the map, Maps, listings, "the phone's quiet," the shop down the street.
- Never in body copy: SEO (page titles and guides may use it because people search for it), AEO, GEO, citations (say "listings"), NAP (say "name, address and phone"), optimize, leverage, unlock, seamless, journey, solutions, funnel, RevOps, GTM.
- Never say: "#1 on Google," "guaranteed rankings," "guaranteed leads" or any revenue guarantee. The only guarantee is the build guarantee.
- "Google profile" in body copy; "Google Business Profile" once per page where it helps search.
- One concrete number on every service, industry and guide page (a price, a timeframe, a count). Specific beats impressive.
- Short sentences, active voice, "you" to the reader. JP speaks as "I" on every page. No em dashes, emoji or exclamation points.
- Brand values: **Honest over impressive. Serve the person, not the project. Build things that outlast me.**
- Tagline: **Get found. Get chosen. Get the call.**
- Brand names (Mailchimp, Saatva, Howler Brothers, Sendero Provisions) appear only on `/about`, as JP's past experience, text only, never as 21 Jewel clients.
- No invented stats, client logos or testimonials. Industry example tables are labeled "Example, not a client" until `flags.realExamples` is true.

## Brand tokens (summary; full values in the spec)

- Palette "Evergreen": ground `#F3EFE6`, surface `#FBF9F6`, ink `#1E3B2F`, muted `#606D63`, accent fill `#B5643C`, accent text `#9F5835`, data green `#2F7D5B`, line `#D5D6CC`.
- Light mode only (dark mode was removed in Change 03; the values are kept as a comment in `tokens.css`).
- Type: Fraunces 600 for headings, Inter 400/500/600 for everything else.
- All text meets WCAG AA (4.5:1). The pale accent `#B5643C` is never used for text; use the accent-text token.

## Definition of done (every change)

- `npm run check` (types, unit tests, no placeholders) and `npm run build` pass.
- No horizontal scroll at 360px or 375px; Lighthouse mobile ≥ 95 for performance, accessibility, best practices and SEO (Change 03 shipped at 99–100).
- Keyboard focus is visible; every form control has a label; tap targets ≥ 24px (44px for buttons).
- Every page still ends in the audit CTA and the phone. Schema describes only content that is on the page.
- Anything that needs JP (a key, a photo, a decision) goes in `TODO-JP.md`, never as a placeholder in the site.
