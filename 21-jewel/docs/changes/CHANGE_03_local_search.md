# Change 03: Local search site (Phase 2)

Date: Oct 27, 2026 · Approved by JP (decisions listed in §0) · Builder: Claude Code

This replaces Change 02's ladder, homepage, nav and industry list. It keeps the stack, the Evergreen tokens, the native forms, the Google Sheet + Gmail lead store, the hero A/B harness, the flag system and the editing rules in `CLAUDE.md`. Where this doc and `PHASE1_SPEC.md` or Change 02 disagree, this doc wins.

## 0. Decisions already made (do not re-open)

- One public service line: **local search for small service businesses**. No brand work. Paid ads never featured. The `/studios` white-label page is retired.
- **Business name** everywhere a machine reads it: **21 Jewel Advisory** (matches the Google Business Profile). Wordmark stays "21 Jewel".
- **Phone:** (737) 391-3041, shown on every page and in schema.
- **Geography:** San Antonio first, greater Texas second. Vertical (industry) pages before suburb pages. Suburb pages exist only as a flag-gated collection with zero entries.
- **Industries:** sign and print (kept), roofing, plumbing, electrical, remodeling, landscaping and tree service. No HVAC, dental or med spa anywhere on the site.
- **Buyer:** the owner. Businesses roughly $300K–$2M, up to $10M when the owner still decides.
- **Ladder:** Free Local Search Audit → Get Found Setup ($650) → Get Chosen Setup ($1,450) → Keep Ranking ($450/month, month-to-month). Names and prices accepted "for now"; all editable from the Sheet.
- **Forms stay native** (Cloudflare Function → Turnstile → Google Sheet + Gmail). No Tally for the audit form. Tally remains only for the hidden founding application.
- **Follow-up** runs in the existing Apps Script with a time-based trigger. No Kit, MailerLite or GoHighLevel for 21J's own leads.
- **Editing surface:** a whitelisted Google Sheet read at build time (§8). Repo YAML stays the fallback and the source of truth for structure.
- **Learning pages:** Claude drafts, JP approves, two per month after the launch set of six.
- **Spanish:** flag only, nothing built.
- **Dark mode: removed.**
- **Analytics:** GA4 stays and gains scroll-depth events. Microsoft Clarity is a flag, default off.
- **Tools policy:** JP may run his own paid tool suite (rank-grid tracker and similar) as cost of goods. Clients never inherit a tool bill. Call tracking is not used; calls are measured with Google profile call clicks, `tel:` click events and the "How did you hear about us?" field.
- **Headshot:** a monogram ships first; a real photo replaces it by setting one path.
- **Launch:** as soon as the acceptance checks in §13 pass.

## 1. What changes, in one screen

| Area | Live today | After Change 03 |
|---|---|---|
| Promise | "More calls from Google. No new software." | **Get found. Get chosen. Get the call.** Hero copy A/B tested (§5). |
| Primary CTA | Free Website Review, scorecard and Book a call compete | **Free Local Search Audit** everywhere. Phone is the secondary. Scorecard demoted to footer, thanks page and learn hub. Booking only on `/thanks/audit` and `/about`. |
| Ladder | Review → Tune-Up $450 → 30-Day Fix $1,250 → Growth Advisor $500/mo (6-month minimum) | Audit → **Get Found Setup** → **Get Chosen Setup** → **Keep Ranking** (month-to-month). §4. |
| Routes | `/review`, `/offers`, `/studios`, `/industries/sign-print` (+hvac/roofing flagged) | `/audit`, `/pricing`, `/services/*` (3), `/industries/*` (6), `/learn` (+6 guides), `/areas/*` (flag, empty). `/studios` and HVAC removed. 301s in §3. |
| Name, phone | "21 Jewel", no phone | "21 Jewel Advisory" in schema, titles, footer; phone in header (mobile), sticky bar, footer, audit page, schema |
| Content source | repo YAML | repo YAML **plus** whitelisted Sheet overrides at build (§8) |
| Theme | light + dark + toggle | light only |
| Analytics | GA4 + Cloudflare Web Analytics | same, plus `scroll_depth`, `audit_submit`, `call_click`; Clarity behind `flags.showClarity` |

## 2. Positioning and voice

**Who it's for.** Owner-run service businesses in San Antonio and the surrounding counties who already pay for leads (Angi, Thumbtack, Yelp Ads, LSAs) or live on word of mouth, and who are not technical. They buy calls and quote requests, not SEO.

**The frame, used on every page.** **Get found. Get chosen. Get the call.**
- Get found: your profile shows up when someone nearby searches for what you do, on Google, Bing, Apple Maps and the directories that feed them.
- Get chosen: reviews, photos and a page that answers the questions they'd ask on the phone.
- Get the call: a tap-to-call button, a short quote form and a same-day reply.

This replaces "Review. Fix. Prove." and "Get found → Get hired → Get hired again." Proof survives as a trust point: "Numbers before, numbers after."

**Trust strip** (under every primary CTA, five short lines, no logos):
- I do the work myself.
- Month-to-month. No contracts.
- You own every login.
- No new software to pay for.
- San Antonio. I can drive to you.

**Voice** (adds to `CLAUDE.md`):
- Owner words: calls, quote requests, showing up on Google, reviews, Maps, "the phone's quiet."
- Never in body copy: SEO (page titles and the learn hub may use it because people search for it), AEO, GEO, citations (say "listings"), NAP (say "name, address and phone"), optimize, leverage, unlock, seamless, journey, solutions.
- "Google profile" in body copy; "Google Business Profile" once per page where it helps search.
- One concrete number on every service and industry page (a price, a timeframe, a count).
- First person singular. Short sentences. No em dashes, emoji or exclamation points.
- Nothing invented. Proof sections render only when the Sheet or the collections have rows.

## 3. Sitemap, nav, redirects

| Route | Purpose | Nav | Schema |
|---|---|---|---|
| `/` | Home | wordmark | ProfessionalService, WebSite |
| `/services/get-found` | Get Found Setup | Services ▾ | Service, FAQPage, BreadcrumbList |
| `/services/get-chosen` | Get Chosen Setup | Services ▾ | Service, FAQPage, BreadcrumbList |
| `/services/keep-ranking` | Keep Ranking | Services ▾ | Service, FAQPage, BreadcrumbList |
| `/pricing` | All brackets, add-ons, credit rule, FAQ | Yes | FAQPage, OfferCatalog |
| `/industries/<slug>` | sign-print, roofing, plumbing, electrical, remodeling, landscaping-tree | Industries ▾ | Service, FAQPage, BreadcrumbList |
| `/learn` | Hub | Yes | CollectionPage |
| `/learn/<slug>` | Guides and quick answers | — | Article + Person, FAQPage, BreadcrumbList |
| `/audit` | Free Local Search Audit form (rewrite of `/review`) | Header button | — |
| `/thanks/audit` | After submit | — | — |
| `/about` | JP | Yes | Person |
| `/scorecard` | Kept as built (Oct 23 questions). Footer link only. | footer | — |
| `/privacy`, `/404` | Updated | footer / — | — |
| `/results`, `/founding-clients`, `/terms`, `/thanks/founding` | Flag-gated as today | — | — |
| `/areas/<slug>` | **Flag `showAreas`, collection empty.** Not built. | — | — |
| `/es/*` | **Flag `showSpanish`.** Astro i18n configured `en` only. Not built. | — | — |

**Removed from the build:** `/studios`, `/industries/hvac` (and its YAML entry), `/review`, `/offers`, `/thanks/review`. **301s in `public/_redirects`:** `/review → /audit`, `/thanks/review → /thanks/audit`, `/offers → /pricing`, `/offers#* → /pricing` (anchors can't redirect; add the old ids as anchors on `/pricing` that map to the new brackets), `/studios → /`, `/industries/hvac → /industries`. Wait, there is no `/industries` index; send `/industries/hvac → /`.

**Header:** 21 Jewel · Services ▾ · Industries ▾ · Pricing · Learn · About · button **Free audit** → `/audit`. Desktop dropdowns are plain lists on hover and focus, keyboard reachable. Mobile (< 760px): wordmark, a phone icon button (`tel:+17373913041`, 44px), Menu. The menu panel lists everything flat with group labels.

**Sticky bar (mobile only):** two buttons, "Call (737) 391-3041" and "Free audit", 56px tall, safe-area aware, on every page except `/audit`, hidden while any form is in view (IntersectionObserver on `form`).

**Footer:** column 1: 21 Jewel Advisory · (737) 391-3041 · email · San Antonio, TX · tagline. Column 2 "Who I help": the six industries. Column 3 "More": Pricing · Learn · Scorecard · About · Privacy · Terms (flag). Bottom: "© {year} 21 Jewel Advisory. Independent. Not affiliated with Google." No theme toggle.

### 3.1 Why industries before suburbs
Industry pages carry content that differs page to page. Suburb pages for a business with one service-area profile get no map-pack help and match the pattern Google's spam policy names under doorway abuse. Build them only with something true to say: a client there, a case study. Collection `areas` exists with schema `{slug, name, county, intro, proof[], faqs[]}`; render only entries with at least one `proof` item. Greater Texas is a line on the home and about pages: "San Antonio first. Anywhere in Texas by phone and screen share."

## 4. Offers (`offers.yaml`; prices and one-liners overridable from the Sheet)

| id | Name | Type | From | What JP does | Hours |
|---|---|---|---|---|---|
| `audit` | Free Local Search Audit | Free | $0 | A 10-minute screen recording plus a one-page scorecard: how you show up on Google, Bing and Apple Maps, what your reviews say, whether your site gets the call. Top 3 fixes ranked by calls lost. Delivered in 5 business days. | 1–1.5 |
| `get-found` | Get Found Setup | One-time | $650 | Google profile rebuilt (categories, services, hours, service area, 15+ photos, Q&A, products). Bing Places and Apple Business Connect claimed and matched. The 10 listings that matter fixed to one name, address and phone. Review link, QR and a text/email ask script. 3 months of profile posts drafted. Baseline numbers saved (calls, directions, site clicks, rank grid). | 6–8 |
| `get-chosen` | Get Chosen Setup | One-time | $1,450 | Homepage and up to 3 service pages rewritten and restructured on the owner's current platform. FAQ blocks and schema on each. Tap-to-call and a 5-field quote form with "How did you hear about us?". GA4, Search Console wired. Speed and mobile fixes within the platform's limits. Requires Get Found or an equivalent profile already in shape. | 10–14 |
| `keep-ranking` | Keep Ranking | Month-to-month | $450/mo | Monthly: 4 profile posts with the owner's photos, review asks sent and every review answered, listings checked, one new page or guide per quarter, a one-page report (calls, directions, site clicks, rank grid) and a 20-minute call. Cancel any month. | 3–4 /mo |

**Credit rule:** half of any setup fee is credited against the first three months of Keep Ranking when it starts within 60 days.

**Add-ons** (`/pricing` only, under "If you need more"): extra service page $350 · extra industry or area page $350 · organic social posting and paid search set up through a vetted partner, quoted separately · advisory hour $150.

**Guarantee** (unchanged): build guarantee only. Never rankings, calls or revenue.

**Prices after three case studies** (kept in the Sheet's `offers` tab as `price_later`, not shown): Get Found $850, Get Chosen $1,950, Keep Ranking $600/mo.

**Upsell path** (for `docs/` and the day-30 call, not the site): Audit → Get Found (almost everyone; produces the first before/after inside 30 days) → Keep Ranking (asked on the day-30 report call) → Get Chosen when the profile sends visits the site wastes. Review management and posting live inside Keep Ranking, never as separate SKUs.

## 5. Homepage (`home.yaml`; strings overridable from the Sheet)

1. **Hero** (A/B via the existing harness; reset the comparison window on deploy).

| Field | Variant A | Variant B |
|---|---|---|
| Eyebrow | Local search for San Antonio service businesses | same |
| H1 | When someone nearby searches for what you do, show up. Then get the call. | Tired of paying for leads? Show up on your own when San Antonio searches for what you do. |
| Sub | I fix how your business shows up on Google, Bing and Maps, and make sure the people who find you call. One person, month-to-month, and you own every login. | Google, Bing and Maps already send your competitors free calls. I set your business up to get its share, month-to-month, and you keep every login. |
| Primary | Get my free Local Search Audit → `/audit` | same |
| Secondary | Call or text (737) 391-3041 → `tel:+17373913041` | same |
| Micro | Free · 10-minute video · Delivered in 5 business days | same |

   Example card (right column; below copy on mobile), label "Example audit": three ranked findings, each with a number; one of the three names Bing or Apple Maps.
2. **Trust strip** (§2).
3. **Sound familiar?** "The phone's quiet, and you can't tell why." / "You're paying Angi or Thumbtack for leads your competitor gets free." / "Your last Google review is from a year ago." / "You paid someone for SEO and never saw what they did."
4. **Get found. Get chosen. Get the call.** Three cards (what it means · what usually breaks · what I fix), each linking to its service page. Keep the phone swipe carousel pattern already built.
5. **Pricing preview.** Audit card first, then the three brackets with "from" prices and one-liners. Link to `/pricing`.
6. **Industries.** Six tiles.
7. **Numbers before, numbers after.** The existing `MeasureBlock`, trimmed.
8. **Proof slot** (renders when `testimonials` or published case studies exist).
9. **About teaser.** Monogram or photo, two sentences, link.
10. **Learn teaser.** Three latest guides.
11. **Closing CTA.** "Find out what's costing you calls." Audit button + phone.

Remove "What you'll need to do" as a home section (two lines move to `/audit`). Remove the scorecard link from the hero.

## 6. Page templates

**Service page** (`/services/*`, from `services.yaml`): H1 as the outcome; 40–60 word opening that states what, who, price and timeframe; What you get (numbers in it) · How it works (3 steps; owner's time under 45 minutes total) · Price and credit rule · Who it's not for (one honest paragraph) · FAQ (5+, owner phrasing, direct first sentence) · CTA block with phone.

**Industry page** (`/industries/*`, `industries.yaml`, extend the template): H1 "More [calls / quote requests / inspection requests] for San Antonio [trade]." · What your customers search for (6–10 real query phrasings) · What usually breaks for [trade] (3 items specific to the trade) · What I fix first (mapped to the brackets) · A worked example labeled "Example" until `flags.realExamples` is on · FAQ (5) · CTA. 600–900 words of distinct content per page. Shared blocks limited to the trust strip and CTA.

**Learn** (`src/content/learn/*.md`, frontmatter `{title, description, kind: guide|answer, published, updated, draft, faqs[], related[]}`; `draft: true` never builds):
- Guide: 1,200–2,000 words, H2s as questions, 40–60 word opening with one hard number, FAQ block (5), author box (JP, role, one-line credential, monogram or photo), "Last updated."
- Quick answer: 300–500 words, one question, one answer, one next step.
- Launch set, in order: (1) Why your business isn't showing up on Google Maps, and the 20-minute fix (2) How to get more Google reviews without nagging customers (3) The Google Business Profile checklist for San Antonio service businesses (4) What a lead really costs: Angi, Thumbtack and Yelp Ads vs. your own Google profile (5) What local SEO costs in San Antonio, and what you should get for the money (6) The 10 listings every local business needs.
- Every guide ends with the audit CTA.

**Audit page** (`/audit`, `pages.yaml → audit`, rewrite of the review page and form): H1 "Your free Local Search Audit." 40-word explanation · What you get (3 lines) · How it works (request → 5 business days → 10-minute video and one-page scorecard → optional 20-minute call) · The form (§7) · "What I'll need from you: nothing. Everything I look at is public." · FAQ (Is it really free? What do you do with my info? Do I have to buy anything?) · Phone as the alternative.

## 7. Lead capture and follow-up (native, as built)

**Form fields** (7 visible, one column, labels above): Business name* · What you do* (short text) · City or ZIP* · Website (optional, with "No website yet") · Best email* · Phone (optional: "if you'd rather I text you") · What's going on?* (select: My phone's too quiet / I'm paying for leads and want my own / Not showing up on Maps / Reviews are stale or bad / Not sure, just check) · How did you hear about me? (short text). Hidden: honeypot, Turnstile token, `hero_variant`, `page`, `utm_source/medium/campaign` read from the URL or `sessionStorage`. Consent line: "I'll email you the audit and nothing else unless you ask." Submit: **Send my audit request.** Redirect `/thanks/audit`.

**Backend:** `functions/api/audit.ts` (rename of `review.ts`) → `lib/audit-api.ts` → `sendToSheet` with `type: 'audit'`. Apps Script gets an `Audits` tab (rename of `Reviews`, keep old tab readable) with the new columns plus `Status` (new, delivered, followed-up, client, stop) and `Next touch` (date). Confirmation email to the requester, alert to JP, as today.

**Follow-up (Apps Script time-based trigger, daily 9:00 Central, `followUps_()`):** Day 5 reminder to JP if `Status` is still `new`. Day 12 to the lead ("Did you get to the three fixes?") if `Status` is `delivered`. Day 30 to the lead ("How's the phone?") if still `delivered`. Any reply JP logs by changing `Status`. `stop` halts everything. Copy for the three emails in `docs/follow-up-emails.md`. Scorecard leads get the same Day 12 and Day 30 touches.

**Phone:** `tel:+17373913041` everywhere, `data-event="call_click"` with `data-prop-location`.

**Booking:** Cal.com link only on `/thanks/audit`, in the confirmation email, and on `/about`.

## 8. Content pipeline: Google Sheet → build

**Shape.** One Sheet, **"21J Site Content,"** owned by a Google account on `johnpaul@21jeweladvisory.com` (create one with that address; it does not need to be Gmail). It is separate from the leads Sheet. Tabs and columns:

| Tab | Columns | Used for |
|---|---|---|
| `strings` | `key, value, page, notes` | Whitelisted copy: hero fields (both variants), subheads, CTA labels, trust-strip lines, micro lines, titles and descriptions |
| `offers` | `id, name, price_from, price_suffix, one_liner, price_later, active` | Prices and one-liners on home and `/pricing` |
| `faqs` | `page, order, question, answer, active` | FAQ blocks and FAQPage schema |
| `industries` | `slug, h1, sub, search_terms` (pipe-separated), `active` | Industry page tops; body sections stay in YAML |
| `testimonials` | `id, quote, name, role, city, active` | Proof slot (renders only when a row is active) |
| `flags` | `key, on` | Every flag in `site.yaml → flags` |

Only keys the loader knows are read. Unknown keys and columns are logged as build warnings and ignored. The Sheet changes values; it cannot add pages or sections.

**Read path (build time).** Each tab is published to the web as CSV. URLs go in Cloudflare Pages env vars `SHEET_CONTENT_STRINGS_CSV` and so on (not secrets, but keep them out of the repo). `src/lib/loaders/sheet-overrides.ts` is an Astro content-layer object loader: fetches each CSV during `astro build`, parses it (quoted fields, embedded newlines), validates rows with zod (`parseData`), writes to the store with `generateDigest`. `src/lib/content.ts → doc()` merges overrides onto the YAML document for the known keys only. Nothing is fetched in the browser.

**Fallback.** When `SHEET_SNAPSHOT=write`, the loader also writes `src/content/snapshot/<tab>.json`. If a fetch or validation fails at build, the loader logs the key and uses the snapshot for that tab; if there is no snapshot, YAML stands. Every whitelisted key has a YAML default, so no page ever ships a hole.

**Publish path.** Apps Script bound to the content Sheet adds a menu **21J → Publish site** (POST to a Cloudflare Pages Deploy Hook stored in Script Properties; toast "Building. Live in about 2 minutes.") and **21J → Preview changes** (second hook, `preview` branch). `.github/workflows/sheet-sync.yml` runs nightly: fetches the CSVs, writes the snapshot, commits if changed. Pages keeps building on push.

**No placeholders.** Any section that depends on content JP doesn't have is behind a flag or an empty-collection check and renders nothing until it has data. `npm run check` fails on the string `[PLACEHOLDER` anywhere in `src/` or `dist/`. `TODO-JP.md` lists what each flag needs before it can turn on.

**Flags after this change** (`site.yaml → flags`, mirrored in the Sheet): `showFounding, showResults, showFaq, showTerms, showAreas, showSpanish, showClarity, showScorecardLink, realExamples`. Remove `showHvac`, `showRoofing`.

## 9. SEO and answer-engine requirements

- **Titles:** `[Outcome or topic] · San Antonio · 21 Jewel Advisory`, under 60 characters. Home: "Local search for San Antonio service businesses · 21 Jewel Advisory". Descriptions 140–155 characters with one number each.
- **Schema (validated in the Rich Results test):** site-wide `ProfessionalService` with `name` "21 Jewel Advisory", `telephone` "+1-737-391-3041", `email`, `url`, `areaServed` (San Antonio; Bexar, Comal, Guadalupe, Kendall, Medina counties; Texas), `founder` Person, `sameAs` (Google profile URL, LinkedIn; from `site.yaml → links`), `priceRange` computed from the ladder, `knowsAbout`. Per page: `Service` with `offers`; `FAQPage` only for visible FAQs; `Article` + `Person` on learn pages; `BreadcrumbList` below the home page; `speakable` on the opening paragraph's selector for service, industry and learn pages.
- **Answer-first writing:** service, industry and learn pages open with a 40–60 word direct answer containing one number; H2s are questions where natural; FAQ answers open with the answer.
- **Internal links:** home → services, industries, learn; each industry → the three services and two guides; each guide → one service and one industry; breadcrumbs everywhere.
- **Google profile:** website field → `https://21jeweladvisory.com/?utm_source=google&utm_medium=organic&utm_campaign=gbp`; appointment link → `/audit?utm_source=google&utm_medium=organic&utm_campaign=gbp-appt`.
- **Technical:** canonical everywhere, sitemap regenerated, `_redirects` from §3, `_headers` CSP updated (add `https://www.clarity.ms` and `https://*.clarity.ms` only when the flag is on; drop `tally.so` from script-src unless founding is on). Fonts as today. Lighthouse mobile ≥ 95 ×4 stays the bar.
- **Optional:** `public/llms.txt` listing pages with one-line summaries.

## 10. Analytics

- GA4 `G-ZMJHTN6297` stays, with the `data-event` wiring. Events: `audit_start` (first field focus), `audit_submit` (thanks page, once per submission id in the query string), `call_click`, `email_click`, `cta_click`, `pricing_view`, `offer_view`, `industry_page_view`, `learn_read` ({percent: 50|90}), `scroll_depth` ({percent: 25|50|75|90}, once each per page), plus the scorecard events. Remove `theme_toggle`, `book_call_click` becomes `cta_click {target: cal}`. Mark `audit_submit` and `call_click` as key events in GA4 (`docs/analytics-setup.md`).
- Keep the DNT/GPC gate and the lazy load; document both in `docs/analytics-setup.md`.
- Clarity: `flags.showClarity` (default false). When on, load after GA4 on the same idle trigger with masked inputs; add to the privacy page and the CSP.

## 11. CRO rules

- One primary CTA per page (the audit). Phone always secondary. Nothing else above the fold asks for a click.
- "From" prices on home and pricing. Owners who can't afford $450/month self-select out.
- Buttons say what happens: "Get my free Local Search Audit," "Send my audit request," "Call (737) 391-3041." Never "Submit," "Learn more," "Get started."
- Trust strip under every primary CTA.
- Native `<details>` FAQs; first open per page tracked.
- Forms: 7 visible fields, phone optional, one column, labels above, errors tied with `aria-describedby`.
- Touch targets ≥ 44px (fix the footer email link, currently 17px tall).
- Keep the phone swipe carousels for card rows; add a visible partial card and a small "swipe" hint.

## 12. Design

- Keep Evergreen tokens, Fraunces + Inter, container, radii, 1px lines, no shadows or gradients.
- **Remove dark mode:** delete `ThemeToggle`, `themeScript`, the `prefers-color-scheme` block and `[data-theme]` block from `tokens.css` (leave the dark values in a comment block), the `theme_*` keys in `site.yaml`, the `theme-color` dark meta, and `color-scheme: light dark`.
- New components: `StickyBar`, `TrustStrip`, `IndustryTile`, `PricingCard`, `GuideCard`, `AuthorBox`, `Breadcrumbs`, `Monogram` (initials "JP" in brand colors, 4:5, used wherever `photo` is empty; replaces the `[PLACEHOLDER: headshot]` alt text).
- OG image regenerated with variant A's H1 and the phone number.

## 13. Done when

- `npm run check && npm run build` pass; the check fails on `[PLACEHOLDER` anywhere in `src/` or `dist/`.
- Sheet loader: a bad row produces a build warning, not a broken page; removing the CSV env vars produces a working site from snapshot or YAML.
- Publish button: a string edited in the Sheet and **21J → Publish site** is live within 3 minutes.
- No horizontal overflow at 360px and 375px on every route. The sticky bar never covers a form control.
- Lighthouse mobile ≥ 95 ×4 on `/`, `/services/get-found`, `/industries/roofing`, the first guide, `/audit`.
- Rich Results test passes on one page per template; no schema describes absent content.
- Every event in §10 fires once, verified with `?ga_debug=1` in DebugView.
- None of these strings remain in `src/`: "Website Review", "Tune-Up", "30-Day Fix", "Growth Advisor", "Get hired", "Review. Fix. Prove.", "HVAC", "studio", "$450" (as a one-time price), "$1,250", "$500/month".
- `TODO-JP.md` lists only: photo path, Google profile URL and LinkedIn URL for `sameAs`, Sheet CSV env vars, deploy hook URLs, Apps Script re-paste and trigger, Clarity project id (if ever). Nothing else is left for JP.

## 14. Build order

1. Removals and renames: dark mode, `/studios`, HVAC, `/review` → `/audit` routes, name → 21 Jewel Advisory, phone everywhere, redirects, flags.
2. Sheet loader, snapshot, nightly Action, deploy-hook docs, Apps Script content menu. Prove the round trip with one string.
3. Nav (dropdowns, phone button), `StickyBar`, `TrustStrip`, `Monogram`, homepage sections per §5.
4. `offers.yaml` rewrite, `services.yaml`, `/services/*`, `/pricing`.
5. `industries.yaml` rewrite (six), template extension.
6. `/audit`, `/thanks/audit`, `audit-api.ts` + tests, Apps Script `Audits` tab and follow-up trigger, GA4 events.
7. Learn hub and six guides (`draft: true` until JP approves each).
8. Schema, OG, sitemap, headers, privacy page, Clarity flag.
9. QA per §13, `TODO-JP.md`, `DECISIONS.md`, `docs/how-to-edit-the-sheet.md` (one page, screenshots, written for JP).
