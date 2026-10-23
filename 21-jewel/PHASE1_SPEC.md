# 21 Jewel — Phase 1 website build spec

Version 1.0 · October 2026 · Owner: JP · Builder: Claude Code

> **Read first:** Change 01 (`docs/changes/CHANGE_01_website_ladder.md`) and Change 02 (`docs/changes/CHANGE_02_local_ladder.md`) override this spec where they conflict. Change 02 is current.

Read `CLAUDE.md` first for stack, file layout and editing rules. This document covers what to build.

---

## 1. Goals and success measures

**Phase 1 runs from now until 3 published case studies.**

| Goal | Measure (PostHog) | Target to judge Phase 1 |
|---|---|---|
| Scorecard is the main action | Scorecard starts ÷ homepage visitors | ≥ 15% |
| Scorecard captures leads | Emails ÷ scorecard completions | ≥ 35% |
| Founding spots fill | Tally applications | 5 qualified applicants |
| Find the stronger headline | Scorecard starts by hero variant | Winner after ~300 visitors per variant |

Phase 1 is not trying to close paid work online. There are no payments, CRM, lead scoring or multi-path router yet (see §13).

## 2. Audience and positioning

> **Superseded by Change 02 (Oct 23, 2026).** Audience is now owner-run local service businesses (sign and print first, then HVAC and roofing), §1 of the change doc. See `docs/changes/CHANGE_02_local_ladder.md` and `DECISIONS.md`.

- **Primary buyer:** an owner of a B2B or local service business with 5 to 20 people (agencies, trades, accounting and bookkeeping, IT services, consultancies, clinics, design studios). Most new work comes from referrals, and referrals have slowed.
- **Their words:** "referrals slowed down," "word of mouth," "leads go quiet," "busy one month, empty the next," "no time to follow up."
- **Promise:** turn word of mouth into steady work by fixing the leaks in how a firm gets referred, gets hired and gets hired again.
- **Framework (use everywhere):** **Get referred → Get hired → Get hired again.**
- **Secondary audiences:**
  - Startup founders. No dedicated page in Phase 1; they can take the scorecard and apply as founding clients.
  - Design studios of 2–10 people. They get one unlinked-from-nav page, `/studios`, reachable from the footer.
- **Values (footer and about):** Honest over impressive · Serve the person, not the project · Build brands that outlast their owners.

## 3. Offers (content in `src/content/offers.yaml`)

> **Superseded by Change 02 (Oct 23, 2026).** Ladder: Website Review (free) → Google Profile Tune-Up ($450) → The 30-Day Fix ($1,250) → Growth Advisor ($500/month), plus add-ons. Prices after 3 case studies: $600 / $1,500 / $650 per month. The tables below are Change 01 history. See `docs/changes/CHANGE_02_local_ladder.md` and `DECISIONS.md`.

Updated by Change 01 (Oct 20, 2026): the ladder leads with the website. Display order is the ladder. If `price_from` is empty, render "Pricing on request" and add a build warning.

**Execution rule:** JP executes only what is one-time, templated and under about 10 hours per client. Recurring or custom work (posting, ad management, design, full rebuilds) goes to partners, who quote separately and bill the client directly. JP edits on any common platform himself.

| id | Name | Type | Price label | One-line description |
|---|---|---|---|---|
| `scorecard` | Is Your Website Losing You Work? | Free | Free | A 3-minute scorecard. See your score and your biggest leak. |
| `website-review` | Website Review | Paid diagnostic | Starting at $950 | An outside-in review of your site, search presence and inquiry path, with fixes ranked. |
| `thirty-day-fix` | The 30-Day Fix | Sprint | Starting at $2,500 | We fix your website's message, inquiry path and tracking in 30 days. |
| `lead-pipelines` | Lead Pipelines | Build | Starting at $3,500 | Pages, follow-up emails and tracking that turn visits and past clients into steady leads. |
| `growth-advisor` | Growth Advisor | Retainer | Starting at $750/month | A monthly review of your leads and numbers, and a steady hand on what's next. |
| `studio-sprint` | White-label Strategy Sprint | Studio partners only | Pricing on request | Strategy delivered under your studio's name. Shown only on `/studios`. |

Rule shown under the ladder: "The Website Review fee is credited toward The 30-Day Fix if booked within 30 days."

**Pricing and terms** (only launch prices and terms appear on the site)

| id | Launch | After 3 case studies | Terms |
|---|---|---|---|
| `website-review` | $950 | $1,500 | 50% upfront, 50% on delivery |
| `thirty-day-fix` | $2,500 | $3,500 | 50% upfront, 50% on delivery; review fee credited within 30 days |
| `lead-pipelines` | $3,500 | $5,000 | 50% upfront, 50% on delivery |
| `growth-advisor` | $750/month | $1,250/month | Billed monthly in advance; 3-month minimum |

Full `/offers` details (who it's for, what you get, notes, timelines) live in `offers.yaml`.

## 4. Sitemap

> **Superseded by Change 02 (Oct 23, 2026).** New routes: `/review`, `/about`, `/industries/*`, `/thanks/review`; flag-gated `/founding-clients`, `/terms`, `/results`, `/thanks/founding`. Header button is Free Website Review → `/review`. See `docs/changes/CHANGE_02_local_ladder.md` and `DECISIONS.md`.

| Route | Purpose | In nav |
|---|---|---|
| `/` | Homepage (hero A/B test) | — |
| `/scorecard` | The scorecard, results and email capture (one page, three states) | Button |
| `/offers` | Full offer details | Yes |
| `/founding-clients` | Founding program and embedded Tally application | Yes |
| `/studios` | White-label Strategy Sprint for design studios | Footer only |
| `/privacy` | Privacy policy (PostHog, Kit, Tally, Turnstile) | Footer |
| `/thanks` | Shown after the founding application if Tally redirects | No |
| `/404` | Not found | No |

**Nav:** 21 Jewel (wordmark, links home) · How it works (`/#how`) · Offers · Founding clients · About (`/#about`) · button **Take the scorecard** → `/scorecard`.

On mobile (< 760px), the nav collapses to the wordmark plus a "Menu" button that opens a full-width panel. The scorecard button stays visible in the header.

## 5. Homepage (`src/content/home.yaml`)

> **Superseded by Change 02 (Oct 23, 2026).** Hero A "More calls from Google. No new software.", Hero B "Be the shop people call first." New sections: example review card, pains, Review/Fix/Prove, what you'll need to do, offers + add-ons, promise strip, how I measure, short about, final CTA. Founding band and FAQ hidden by flags. See `docs/changes/CHANGE_02_local_ladder.md` and `DECISIONS.md`.

Follow the approved wireframe ("Homepage Wireframe," template A) section by section. Copy below is final unless JP edits it.

### 5.1 Hero — two variants under test

Both variants share the layout: two columns on desktop, stacked on mobile. Copy is on the left; the sample result card is on the right, and below the copy on mobile.

| Field | Variant A (website) | Variant B (steady leads) |
|---|---|---|
| Eyebrow | Website and lead strategy for owner-run service firms | same |
| H1 | Your next client is checking your website right now. Does it give them a reason to call? | Busy one month, empty the next? Turn your website into a steady source of leads. |
| Subhead | For service businesses with 5 to 20 people. Fix the message, the inquiry path and the follow-up that decide whether a visit becomes a job. | For service businesses with 5 to 20 people. Find where your website and follow-up lose good leads, then fix them in 30 days. |
| Primary button | Is your website losing you work? → `/scorecard` | same |
| Secondary button | See founding client spots → `/founding-clients` | same |
| Micro line | Free · 12 questions · About 3 minutes · Results on screen | same |

**Sample result card** (static, labeled "Sample result"):
- Score: 62 / 100 website score.
- Bars: Get referred 70, Get hired 48 (accent color, the weakest stage), Get hired again 66.
- Footer line: "Biggest leak: no clear next step on mobile."

### 5.2 "Sound familiar?" (surface band)

Three items in a row, stacked on mobile:
1. **Referrals slowed down.** Word of mouth used to keep you busy. Lately it's quieter, and you're not sure why.
2. **Leads go quiet.** People reach out, you send a quote, and then nothing. No one has time to chase.
3. **Busy, then empty.** One month you're turning work away. The next, you're wondering where it went.

### 5.3 How it works (`#how`)

- Eyebrow "How it works". H2 "Get referred. Get hired. Get hired again."
- Intro: "Every referral goes through three stages. Most firms lose work at one of them without seeing it."
- Three cards, each with **Where it breaks** and **What we fix**:

| Stage | Where it breaks | What we fix |
|---|---|---|
| 1. Get referred | Happy clients mean to mention you and forget. | A website and search presence that confirms you the moment someone is referred. |
| 2. Get hired | Slow follow-up, unclear offers, quotes that stall. | A clear site, fast replies and follow-up that turn visits into booked work. |
| 3. Get hired again | The project ends and the client drifts away. | Check-ins and next offers that bring past clients back and keep them referring. |

The numbers are a real sequence, so keep them.

### 5.4 Offers (`#offers`, surface band)

- Eyebrow "Offers". H2 "Start where you are." Intro "Each step builds on the last. The Website Review fee is credited toward The 30-Day Fix if booked within 30 days."
- Five cards from `offers.yaml` (excluding `studio-sprint`), each showing the price label, name and one-liner. Every card links to `/offers#<id>`. The scorecard card links to `/scorecard`.

### 5.5 Founding client program (`#founding`, dark ink band)

- Eyebrow "Founding client program". H2 "Five spots. No fee. An honest case study in return."
- Body: "I'm taking on five owner-run service firms at no cost while I build my portfolio. You get the full Website Review and The 30-Day Fix, a $3,450 value."
- **Spot meter:** 5 dots, filled = taken. Label "[N] of 5 spots open". Values come from `site.yaml` (`founding.total: 5`, `founding.filled: 0`, so launch shows "5 of 5 spots open"). When `filled` reaches 5, the label changes to "All founding spots are taken. Join the waitlist." and the button goes to the Tally form with `?waitlist=1`.
- **What you get:** Website Review · The 30-Day Fix · Weekly check-ins for a month.
- **What I ask:** Before and after numbers · A written case study · An honest testimonial.
- Button: Apply for a spot → `/founding-clients#apply`.

### 5.6 About (`#about`)

- Photo placeholder `[PHOTO OF JP]`, 4:5 aspect ratio.
- H2 "Hi, I'm JP."
- Paragraph 1: "I've spent [X] years in revenue strategy: pipelines, funnels, paid media and the CRM work behind them. Now I help owner-run firms in San Antonio and beyond turn word of mouth into steady work."
- Paragraph 2: "Honest over impressive. I'll tell you what's working, what isn't, and what to fix first."

### 5.7 Proof slot (hidden in Phase 1)

Build the component now and render it only when `case-studies/` or `testimonials.yaml` has entries. Its place is between Founding and About.

### 5.8 Scorecard call to action (`#scorecard`)

- H2 "Is your website losing you work?"
- Body: "Twelve questions. About three minutes. Your score and your biggest leak, on screen."
- Button: Start the scorecard → `/scorecard`.

### 5.9 Footer

- 21 Jewel · `johnpaul@21jeweladvisory.com` (shown as text plus a mailto link) · Book a call (`[CAL_LINK]`) · For design studios: White-label Strategy Sprint (`/studios`) · Privacy · San Antonio, TX · © year.
- The values line in small text.
- Theme toggle: Light / Dark / System.

## 6. The scorecard (`/scorecard`, `src/content/scorecard.yaml`, `src/lib/scorecard.ts`)

> **Superseded by Change 02 (Oct 23, 2026).** Now 12 questions scored 2 / 1 / 0 (24 max) plus an unscored business-type question; bands 0–8 Losing work, 9–16 Leaking calls, 17–24 Built to win work; result shows up to 3 fixes. No stages. See `docs/changes/CHANGE_02_local_ladder.md` and `DECISIONS.md`.

### 6.1 Flow (one page, three states, no page reloads)

1. **Intro:**
   - H1 "Is your website losing you work?"
   - "12 quick questions about how people find you, contact you and come back. You'll see your score and your biggest leak right away."
   - Start button.
2. **Questions:**
   - One question per screen, four answer buttons, progress "Question 4 of 12" plus a bar.
   - Back link; answers are kept.
   - Keyboard: 1–4 selects, Enter advances.
   - Selecting an answer auto-advances after 250ms, with no delay under reduced motion.
3. **Result (shown without email):**
   - Overall score out of 100 and its band name with one-line meaning.
   - The single weakest stage, labeled "Your biggest leak," and the fix for the weakest question in that stage.
4. **Email capture (below the result):**
   - "Get your full breakdown: all three stage scores and your top 3 fixes, sent to your inbox."
   - Fields: first name (optional), email (required), business name (optional), team size (select: Just me, 2–4, 5–20, 21–50, 50+).
   - Turnstile and a hidden honeypot field. Submit button: "Send my breakdown."
5. **After submit:**
   - Reveal the three stage bars on the page as well.
   - Show "Sent. Check your inbox in a few minutes."
   - Secondary actions: "Want help fixing it? See founding client spots" and "Book a call."

State lives in memory, mirrored to `sessionStorage` (`scorecard-v1`) so a refresh doesn't lose progress. Wrap storage access in try/catch.

### 6.2 Questions

Standard options score: **Always = 3 · Usually = 2 · Sometimes = 1 · Rarely or never = 0.** Q7 has custom options. (Questions replaced by Change 01.)

| # | Stage | Question | Fix shown or emailed when the answer scores ≤ 1 |
|---|---|---|---|
| 1 | Get referred | When someone searches your business name, does your website come up first? | Make sure your homepage title includes your business name and what you do, and link your site from your Google Business Profile. |
| 2 | Get referred | Is your Google Business Profile complete and updated in the last 3 months? | Fill every field, add 10 recent photos, and post a short update each month. |
| 3 | Get referred | Does your website show recent reviews, work or client stories? | Add three recent reviews and one short project story to your homepage. |
| 4 | Get referred | When a project wraps up well, do you ask the client for a referral? | Ask at the moment of praise. Add one line to your wrap-up call: "Who else do you know who deals with this?" |
| 5 | Get hired | Can a visitor tell what you do, who it's for and roughly what it costs within 10 seconds? | Rewrite your homepage headline to say what you do and for whom, and add "starting at" prices. |
| 6 | Get hired | Does every page have one clear next step that works on a phone? | Give every page one button ("Request a quote" or "Book a call") and test your form on your phone. |
| 7 | Get hired | How fast do you usually reply to a new inquiry? Options: Within the hour (3) · Same day (2) · Within 1–2 days (1) · Longer (0) | Set an auto-reply that confirms receipt and offers a call time. Aim to reply personally the same business day. |
| 8 | Get hired | Do you follow up on quotes or proposals that haven't been answered? | Follow up on day 2, day 7 and day 14 with a short, useful note, not a "just checking in." |
| 9 | Get hired again | Do you check in with past clients after the work ends? | Put a 30-, 90- and 180-day check-in on your calendar for every finished project. |
| 10 | Get hired again | When a project ends, do you offer a clear next step or service? | Write one natural follow-on offer for your most common project and mention it at wrap-up. |
| 11 | Get hired again | Do you ask happy clients for a Google review? | Send a review link with two prompt questions within a week of a strong finish. |
| 12 | Get hired again | Do you know where each new lead came from, including who referred them? | Add "How did you hear about us? Who referred you?" to your inquiry form and log the answer for every lead. |

### 6.3 Scoring (pure functions in `src/lib/scorecard.ts`, unit-tested with Vitest)

- `stageScore = round(sum of the stage's 4 answers ÷ 12 × 100)`
- `total = round(sum of all 12 answers ÷ 36 × 100)`
- `weakestStage` is the lowest stage score. Ties go to the earlier stage (Get referred > Get hired > Get hired again).
- **Top fixes:** questions scoring ≤ 1, sorted by score ascending then question order. Take the first 3. If fewer than 3 exist, fill with score-2 questions from the weakest stage.
- **On-screen fix:** the lowest-scoring question in `weakestStage`.

**Bands:**

| Score | Band name | Meaning |
|---|---|---|
| 0–39 | Running on luck | Work comes in when it comes in. A few basics would change that fast. |
| 40–69 | Working, but leaking | People find you, but you're losing good work at one or two stages. |
| 70–100 | Built to win work | Your site and follow-up work. The gains now come from new lead sources and consistency. |

Tests must cover: all-zero, all-max, ties, the Q7 custom options, and the top-fix fill rule.

### 6.4 Email capture backend (`functions/api/scorecard.ts`)

- `POST /api/scorecard` with JSON `{ firstName?, email, business?, teamSize, answers[12], total, stages{referred,hired,again}, band, weakestStage, heroVariant, turnstileToken, website(honeypot) }`.
- Steps:
  1. Reject if the honeypot is filled (return 200 silently).
  2. Verify Turnstile with `TURNSTILE_SECRET`.
  3. Recompute the score server-side from `answers` and ignore client totals.
  4. Validate the email.
  5. Create or update the Kit subscriber (API v4, header `X-Kit-Api-Key`).
  6. Write custom fields: `score_total`, `score_referred`, `score_hired`, `score_again`, `band`, `weakest_stage`, `top_fixes` (the 3 fix texts joined by `||`), `team_size`, `business_name`, `hero_variant`.
  7. Add tags: `scorecard-complete`, `band-<slug>`, `weakest-<slug>`, `hero-<a|b>`, and `team-5-20` when that applies.
- Responses: `200 {ok:true}`, `400 {error:"invalid_email"}`, `403 {error:"verification_failed"}`, `502 {error:"list_unavailable"}`. The UI shows a clear message for each, for example: "We couldn't reach our email service. Your score is still on this page. Try again in a minute."
- Confirm current Kit v4 endpoints in Kit's API docs before coding. Do not guess.
- Env vars: `KIT_API_KEY`, `KIT_TAG_IDS` (JSON map) or create tags by name on first run, `TURNSTILE_SECRET`, `PUBLIC_TURNSTILE_SITE_KEY`.

**Results email** (JP builds this in Kit as an automation triggered by the `scorecard-complete` tag; put this copy in `docs/kit-results-email.md`):

> Subject: Is your website losing you work? Your score: {{ subscriber.score_total }}/100
>
> Hi {{ subscriber.first_name | default: "there" }},
>
> Here's your breakdown.
>
> Get referred: {{ score_referred }} · Get hired: {{ score_hired }} · Get hired again: {{ score_again }}
>
> Your biggest leak is **{{ weakest_stage }}**. Start with these three fixes: [top_fixes as a list]
>
> If you'd like help putting these in place, I'm taking on a few founding clients at no cost in exchange for a case study: 21jeweladvisory.com/founding-clients
>
> JP · 21 Jewel · johnpaul@21jeweladvisory.com

## 7. Other pages

> **Superseded by Change 02 (Oct 23, 2026).** Offers FAQ is hidden by `showFaq`. Founding program copy and fit rules changed; the page is hidden by `showFounding`. See `docs/changes/CHANGE_02_local_ladder.md` and `DECISIONS.md`.

### `/offers`

- H1 "Offers". Intro: "Start with the free scorecard, or pick the step that fits where you are. The Website Review fee is credited toward The 30-Day Fix if booked within 30 days."
- One section per offer (anchor = id): name, price label, who it's for, what you get (list), note, timeline, terms, and a button. The scorecard's button is "Take the scorecard." Every other button is "Book a call" (`[CAL_LINK]`) with the secondary link "Or apply as a founding client."
- FAQ (from `offers.yaml`):
  - "Do I need to start with the Website Review?" No. The scorecard is free and points you to the right step.
  - "Do you build websites?" I rewrite and restructure your site and make the edits on your current platform. Full rebuilds go to a vetted partner, quoted separately.
  - "Do you run ads or post content for me?" No. I build the plan and the systems. Ongoing posting or ads go to your team or vetted partners.
  - "Do you work outside San Antonio?" Yes, everything works remotely.
  - "What if my score is already high?" Then Lead Pipelines is usually the next step.

### `/founding-clients`

- H1 "Founding client program". Body from `founding.yaml`; reuse the spot meter.
- **Who it's for:** owner-run service businesses with 5 to 20 people, where the owner can meet weekly for a month and share before and after numbers.
- **The deal:** what you get and what I ask, as in §5.5.
- **How it works:** Apply (5 minutes) → 20-minute fit call → Website Review → The 30-Day Fix → Case study.
- **Apply (`#apply`):** an embedded Tally form (`[TALLY_FORM_URL]`) via Tally's official embed script, lazy-loaded with a "Loading the application…" placeholder. If it fails, show a link to open the form directly.
  - Fields for JP to set up in Tally: name, email, business, website, team size, industry, "Where does most of your new work come from today?", "What's your biggest growth frustration right now?", "Why now?"
  - Track `founding_apply_click` when the section scrolls into view and the visitor interacts.

### `/studios`

- H1 "White-label Strategy Sprint". Intro: "For design studios of 2 to 10 people. You keep the client and the credit. I deliver the strategy behind the work under your name."
- What you get: a positioning and messaging foundation your designers can build on, client-ready deliverables in your template, and a kickoff plus readout run as part of your team.
- How it works: Intro call → Scope and price per project → Delivery in 2–3 weeks.
- Contact: "Email me at johnpaul@21jeweladvisory.com" (text plus mailto) and Book a call.

### `/privacy`

Plain-language policy listing PostHog (analytics), Kit (email), Tally (applications), Turnstile (spam protection) and Cloudflare (hosting), what each stores, and how to ask for deletion (email JP). Add "Last updated" with the build date.

## 8. Hero A/B test

- **Assignment:** an inline script in `<head>` (before CSS paints) does the following:
  1. Reads `localStorage['hero-variant']`.
  2. If it's missing, picks `a` or `b` at 50/50 with `crypto.getRandomValues` and stores it.
  3. Sets `document.documentElement.dataset.hero`.
  4. Wraps storage in try/catch; if storage fails, it still assigns per page view.
- **Rendering:** both hero blocks are in the HTML. CSS shows the one matching `html[data-hero]`. With no JS, variant A shows. This avoids flicker.
- **QA override:** `?hero=a` or `?hero=b` forces and stores a variant.
- **Analytics:** register `hero_variant` as a PostHog super property so every event carries it. Send it to Kit as a tag on email capture.
- **Reading results:** in PostHog, build a funnel `$pageview (/) → scorecard_start → scorecard_complete → scorecard_email_submit`, broken down by `hero_variant`. Document the steps in `docs/reading-the-hero-test.md`.
- **Stop rule:** the test stops when a variant has ≥ 300 homepage visitors and the gap in scorecard-start rate is clear. Then JP picks the winner by setting `heroTest.winner: "a"` in `site.yaml`, which renders only that variant and stops assigning. Add `heroTest.enabled: true/false` too.

## 9. Analytics events (`src/lib/analytics.ts`)

> **Superseded by Change 02 (Oct 23, 2026).** `cta_click` replaces `hero_cta_click`, `nav_scorecard_click` and `offer_card_click`. New: `review_form_submit`, `founding_apply_submit`, `offer_view`, `industry_page_view`. See `docs/changes/CHANGE_02_local_ladder.md` and `DECISIONS.md`.

PostHog Cloud (US) with `PUBLIC_POSTHOG_KEY` and `PUBLIC_POSTHOG_HOST`:
- Settings: autocapture off, pageviews on, session recording off, `persistence: 'localStorage'`, `respect_dnt: true`.
- Load the script after first interaction or idle so it doesn't hurt Lighthouse.
- In dev (`import.meta.env.DEV`), log events to the console instead of sending them.

| Event | When | Properties |
|---|---|---|
| `hero_cta_click` | Either hero button | `cta: scorecard \| founding` |
| `nav_scorecard_click` | Header button | — |
| `scorecard_start` | Start pressed | `source` (referrer path) |
| `scorecard_answer` | Each answer | `q`, `score` |
| `scorecard_complete` | Result shown | `total`, `band`, `weakest_stage` |
| `scorecard_email_submit` | API returns ok | `team_size`, `band` |
| `scorecard_email_error` | API error | `error` |
| `offer_card_click` | Offer card | `offer_id` |
| `founding_apply_click` | Apply button or form opened | `location` |
| `book_call_click` | Any Cal.com link | `location` |
| `email_click` | Any mailto link | `location` |
| `theme_toggle` | Footer toggle | `theme` |

Every event automatically includes `hero_variant`.

## 10. Design system

### 10.1 Tokens (`src/styles/tokens.css`)

Define on `:root`, redefine under `@media (prefers-color-scheme: dark)` guarded by `:root:not([data-theme="light"])`, and again under `:root[data-theme="dark"]`. The footer toggle sets `data-theme` on `<html>` and stores it in `localStorage['theme']`. "System" removes the attribute.

| Token | Light | Dark | Use |
|---|---|---|---|
| `--bg` | `#F3EFE6` | `#0B1612` | Page ground |
| `--surface` | `#FBF9F6` | `#11221B` | Bands, cards |
| `--ink` | `#1E3B2F` | `#F3EFE6` | Headings, body text |
| `--muted` | `#606D63` | `#9EA79D` | Secondary text |
| `--line` | `#D5D6CC` | `#303934` | Borders, bar tracks |
| `--accent` | `#B5643C` | `#B5643C` | Fills, borders, weakest-stage bar. **Never text.** |
| `--accent-text` | `#9F5835` | `#C98A68` | Eyebrows, links, ghost button text |
| `--data` | `#2F7D5B` | `#5FB58C` | Score numerals and bars. Small text only on `--surface` in light mode. |
| `--btn-bg` | `#1E3B2F` | `#F3EFE6` | Primary button |
| `--btn-fg` | `#F3EFE6` | `#1E3B2F` | Primary button text |
| `--band-bg` | `#1E3B2F` | `#173A2D` | Founding band |
| `--band-fg` | `#F3EFE6` | `#F3EFE6` | Founding band text |
| `--band-muted` | `#C9CEC6` | `#C9CEC6` | Founding band secondary text |
| `--band-accent` | `#D9A07F` | `#E0AE8F` | Founding band eyebrow and spot dots |
| `--band-line` | `#3A5A4C` | `#2F5446` | Founding band card borders |
| `--focus` | `#9F5835` | `#E0AE8F` | 2px focus outline, 2px offset |

All text pairs were checked at ≥ 4.5:1, for example ink on ground 10.6:1 light and 16.1:1 dark, and accent-text on surface 5.1:1 light. Keep it that way. Any new pair needs a contrast check.

### 10.2 Type

- Display: Fraunces variable, weight 600, `letter-spacing: -0.01em` at 40px and above, `text-wrap: balance`.
- Body: Inter variable, 400. Labels and buttons 600. Eyebrows: 13px, 600, uppercase, `letter-spacing: 0.08em`, `--accent-text`.
- Scale (desktop / mobile): H1 56/36 · H2 40/30 · H3 24/20 · Lead 19/17 · Body 16/16 · Small 14 · Micro 13. Line-height 1.06 for H1, 1.12 for H2, 1.55 for body.
- Body text max 60ch.

### 10.3 Layout and components

- Container max-width 1200px. Gutter `max(24px, env(safe-area-inset-*))`. Section padding 80px desktop, 56px mobile.
- Radius: 8px buttons, 12px cards, 14px the hero card.
- Borders are 1px `--line`. No shadows. No gradients.
- **Buttons:**
  - Primary: `--btn-bg` / `--btn-fg`, 15px × 22px padding, ≥ 44px tall.
  - Ghost: 2px `--accent` border with `--accent-text` text.
  - Hover darkens 6%. Focus shows the outline.
- **Components to build:** Header, MobileMenu, HeroVariant, SampleResultCard, PainList, StageCards, OfferCard, OfferLadder, FoundingBand, SpotMeter, AboutBlock, ProofSlot (hidden), ScorecardCTA, Footer, ThemeToggle, Scorecard (intro, question, result, email form), FAQ (native `<details>`), TallyEmbed.
- Grids use `repeat(auto-fit, minmax(…, 1fr))` so they wrap without breakpoints. Below 760px everything stacks.
- **Motion:** only a 150ms fade or slide between scorecard questions and the bar fill on result, both disabled under `prefers-reduced-motion`.

## 11. SEO, performance and accessibility

> **Superseded by Change 02 (Oct 23, 2026).** Titles and descriptions per §6 of the change doc (home: "21 Jewel · More calls from Google for local service businesses"). See `docs/changes/CHANGE_02_local_ladder.md` and `DECISIONS.md`.

- **Titles and meta descriptions** in `site.yaml` per page:
  - Home title: "21 Jewel · Turn your website into steady work"
  - Home description: "Website and lead strategy for owner-run service firms. Take the free 3-minute scorecard: Is your website losing you work?"
- **Open Graph:** one static 1200×630 OG image in brand colors with the H1 of variant A (build it as SVG and convert to PNG at build time, or commit a PNG).
- **JSON-LD:** `ProfessionalService` with name, url, email, areaServed "San Antonio, TX" and "United States", founder "JP". Add an `FAQPage` on `/offers`.
- `sitemap.xml` (via `@astrojs/sitemap`), `robots.txt`, canonical URLs on `https://21jeweladvisory.com`.
- **Performance budget:** Lighthouse mobile ≥ 95 in all four categories. Total JS on the homepage < 30KB before PostHog. Fonts preloaded (latin subset only). No layout shift from fonts (`font-display: swap` plus size-adjusted fallbacks).
- **Accessibility (WCAG 2.2 AA):**
  - Semantic landmarks and a skip link.
  - Scorecard answers are a `fieldset` with radio inputs styled as buttons, and progress has `aria-live="polite"`.
  - Every input has a visible label. Error messages are tied with `aria-describedby`.
  - Touch targets ≥ 44px.

## 12. Deployment and setup

### 12.1 Claude Code does

1. Scaffold the Astro project, content collections, components and pages per this spec.
2. Write `functions/api/scorecard.ts` and Vitest tests for `lib/scorecard.ts`.
3. Add `public/_headers` with security headers (CSP allowing only self, PostHog, Tally, Turnstile, Cal.com) and long cache for hashed assets.
4. Create `TODO-JP.md` listing every placeholder and account step below, `DECISIONS.md`, and `docs/` (Kit email copy, reading the hero test, how to update content).
5. Add npm scripts: `dev`, `check` (astro check plus Vitest), `build`, `preview`.
6. Add a README section, "How to change things," with one line each: change a price, change hero copy, mark a founding spot filled, pick the hero winner, add a testimonial.

### 12.2 JP does (also listed in `TODO-JP.md`)

1. Create a GitHub repo and push the project. Connect it to Cloudflare Pages (build command `npm run build`, output `dist`).
2. Add the custom domains `21jeweladvisory.com` and `www` (redirect `www` → apex).
3. In Cloudflare, set a redirect rule on `meet21j.com` and `www.meet21j.com` → `https://21jeweladvisory.com/$path` (301).
4. In Cloudflare Email Routing on `21jeweladvisory.com`, forward `johnpaul@` to his Gmail. Set up "Send mail as" in Gmail if replies should come from that address.
5. Create accounts and copy keys into Cloudflare Pages environment variables:
   - PostHog (project key and host).
   - Kit (API key; build the results email automation from `docs/kit-results-email.md`).
   - Turnstile (site key and secret).
6. Create the Tally application form with the fields in §7 and paste the form URL into `site.yaml`.
7. Create a Cal.com event, "20-minute fit call," and paste the link into `site.yaml`.
8. Fill the placeholders: prices, [X] years, photo, founding spots filled.

## 13. Out of scope for Phase 1 (build hooks, not features)

| Later item | Phase | Hook to leave in Phase 1 |
|---|---|---|
| Case study pages and testimonials | 2 | `case-studies/` collection and a hidden ProofSlot |
| Two-path router (service owners / founders) | 2 | `site.yaml` flag `router.enabled: false`; Hero component accepts a `paths` prop |
| Gated PDF report and nurture sequence | 2 | Kit tags and custom fields already written |
| Payment links for the audit | 2 | `offers.yaml` field `checkout_url` (empty) |
| Exit and value-acceleration path, fractional page | 3 | Nothing beyond the content-collection pattern |
| CRM and lead scoring | 3 | Kit tags provide the data to migrate |

## 14. Build order and acceptance checks

| Step | Build | Done when |
|---|---|---|
| 1 | Scaffold, tokens, fonts, Base layout, Header, Footer, ThemeToggle | Light, dark and system all work; no flash of wrong theme; 360px has no horizontal scroll |
| 2 | Homepage sections from `home.yaml` | Matches the wireframe; all copy comes from YAML |
| 3 | Hero A/B assignment and override | Variants persist across reloads; `?hero=b` forces B; no flicker with JS throttled |
| 4 | Scorecard UI and `lib/scorecard.ts` with tests | All tests pass; keyboard-only run works; refresh mid-quiz keeps answers |
| 5 | `/api/scorecard` Function | Works with Turnstile test keys; Kit subscriber created with fields and tags (in a test Kit account); each error state shows its message |
| 6 | Offers, Founding (Tally embed), Studios, Privacy, 404, Thanks | Tally loads lazily; fallback link works |
| 7 | Analytics wrapper and events | Every event in §9 fires once with `hero_variant` (verify in the console in dev) |
| 8 | SEO, OG, JSON-LD, sitemap, headers | Rich Results test passes; CSP has no console violations |
| 9 | Lighthouse pass | Mobile ≥ 95 in all four categories |
| 10 | `TODO-JP.md`, `DECISIONS.md`, docs, README | JP can follow `TODO-JP.md` start to finish without asking |

## 15. Assumptions to confirm (also in `TODO-JP.md`)

- Confirmed: the meter launches at 5 of 5 open, and the Website Review fee credit lasts 30 days.
- Scorecard length is 12 questions, about 3 minutes.
- The score and biggest leak are shown free; the full breakdown and top 3 fixes are emailed.
- The founding program bundles the Website Review and The 30-Day Fix (Change 01).
- Lead Pipelines runs 60 to 90 days.
