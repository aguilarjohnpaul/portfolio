# Analytics setup: Google Analytics 4 + Search Console

About 30 minutes, all free. Do the steps in order. The site is already wired with your ID and is tracking the live domain.

**What each tool answers**
- **Google Analytics 4 (GA4):** who visits, where they came from, and what they do (audit requests, calls, how far down pages people scroll, hero A vs B).
- **Search Console:** which Google searches show your site, how often people click, and whether Google can read every page.

---

## 1. Create the GA4 property

1. Go to **analytics.google.com** and sign in with the Google account you want to own this (your 21 Jewel account).
2. **Admin** (gear, bottom left) → **Create** → **Property**.
   - Property name: `21 Jewel`
   - Time zone: **United States, Central Time**. Currency: **US Dollar**.
3. Business details: Small (1–10). Objective: **Generate leads**.
4. Platform: **Web**.
   - Website URL: `https://21jeweladvisory.com`
   - Stream name: `21jeweladvisory.com`
   - Leave **Enhanced measurement** on, then tap the gear next to it and **turn off "Form interactions"**. The site already sends its own form events, and this avoids double counting.
5. **Create stream**. Copy the **Measurement ID** (starts with `G-`). It's public, not a secret.

## 2. Add the ID to the site (done)

Your ID `G-ZMJHTN6297` is built into the site code (`src/lib/analytics.ts`). No Cloudflare step needed.

- **Don't paste Google's "Install manually" snippet** anywhere. The site already does the same thing; a second copy would count every visit twice.
- **Ignore GA's "Test installation" button** if it says the tag isn't detected. The tag loads after the visitor's first scroll or tap (to keep the site fast), and Google's tester doesn't scroll. Use step 8 instead.
- Only the live domain is tracked. Preview links (`*.pages.dev`) and test builds are ignored.
- To change the ID later, either edit it in `src/lib/analytics.ts` or set a Cloudflare Text variable `PUBLIC_GA_ID` and retry the deployment.

## 3. Tell GA4 about the site's details (do this the same day)

Custom dimensions only collect data from the day you create them, so set them up now.

**Admin** → **Data display** → **Custom definitions** → **Create custom dimension**, once for each row:

| Dimension name | Scope | Parameter / property |
|---|---|---|
| Hero variant | **User** | `hero_variant` |
| Click location | Event | `location` |
| Click target | Event | `target` |
| Scorecard band | Event | `band` |
| Business type | Event | `industry` |
| What's going on | Event | `situation` |
| Offer viewed | Event | `offer_id` |
| Scroll percent | Event | `percent` |

## 4. Mark the events that count as leads

GA4 removed the separate Key events page in 2025. Key events are now the star next to each event.

**Admin** → **Data display** → **Events** → **Recent events** tab → search each name → click the **star** so it fills in:

- `audit_submit` (a Local Search Audit request; fires once on `/thanks/audit`)
- `call_click` (tapped the phone number anywhere)
- `scorecard_email_submit` (scorecard results requested)
- `founding_apply_submit` (add later, when the founding program is on)

GA4 can take 24 to 48 hours to list a brand-new event name in Recent events, even while it is already receiving it. To register one before it arrives: **+ Create event** → exact name → turn on **Mark as key event** → **Create with code** → Create. Never use **Create without code** for these: it builds a second event from page views and double counts.

`close_convert_lead` and `qualify_lead` are GA4 defaults for the "Generate leads" objective. The site doesn't send them; leave or unstar them.

Other events you'll see (Change 03 §10): `audit_start` (first tap into the form), `audit_error`, `cta_click` (every button, with `location` and `target`; `target: cal` is a booking click), `email_click`, `scroll_depth` (25/50/75/90 per page), `learn_read` (50/90 of a guide), `offer_view`, `industry_page_view`, and the scorecard events.

**Reading scroll depth and time on page:** Reports → Engagement → Events → `scroll_depth`, add the `percent` dimension and a page filter. Average engagement time per page is under Reports → Engagement → Pages and screens. If you later want heatmaps and recordings, set `flags.showClarity: true` in `site.yaml` (or the Sheet's flags tab), add `PUBLIC_CLARITY_ID` in Cloudflare, and the Clarity line on the privacy page turns on with it.

## 5. Two housekeeping settings

- **Keep data longer:** Admin → Data collection and modification → **Data retention**. Set both dropdowns (user-level data including key events, and event data) to **14 months**, leave "Reset user data on new activity" on → Save. The default of 2 months is too short for 30/60/90-day comparisons.
- **Don't count yourself (optional):** Admin → Data streams → your stream → **Configure tag settings** → Show more → **Define internal traffic** → add your home and office IP (search "what is my IP"). Then Admin → Data collection and modification → **Data filters** → click **Internal Traffic** if it's listed (or **Create Filter** → Internal Traffic → Exclude) → set to **Active** → Save. Active filters remove matching visits permanently. Phone traffic on cellular can't be filtered this way; that's fine.

## 6. Search Console

1. Go to **search.google.com/search-console** → **Add property** → **Domain** → `21jeweladvisory.com`.
2. Verify. Google detects Cloudflare and offers to add the record for you: tap **Start verification** and approve in Cloudflare.
   - If it doesn't offer that, copy the TXT record → Cloudflare → **DNS** → **Records** → **Add record**: Type `TXT`, Name `@`, Content = the value Google gave you → Save → back in Search Console tap **Verify**. It can take a few minutes.
3. **Sitemaps** (left menu) → enter `sitemap-index.xml` → **Submit**.
4. **URL inspection** (top bar) → paste `https://21jeweladvisory.com/` → **Request indexing**. Repeat for `/audit`, `/pricing` and `/industries/roofing`.
5. Link it to GA4: GA4 **Admin** → **Product links** → **Search Console links** → **Link** → pick the property → pick the web stream → Submit.

Search data shows up after 2–3 days.

## 7. Tag your Google Business Profile link

So visits from your own Google profile show up separately from other Google traffic:

Google Business Profile → **Edit profile** → **Contact** → Website:

```
https://21jeweladvisory.com/?utm_source=google&utm_medium=organic&utm_campaign=gbp
```

Do the same for clients' profiles when you work on them (with their website address). It's part of how you show them profile-driven visits.

## 8. Check it works

1. In **Chrome** (not Brave, DuckDuckGo or a browser with an ad blocker or "Global Privacy Control" on; the site respects those and won't track), open `https://21jeweladvisory.com/?ga_debug=1`.
2. Scroll once, then tap a few buttons and start the scorecard.
3. GA4 → **Admin** → **Data display** → **DebugView**: you should see `page_view`, `scroll_depth`, `cta_click` and `scorecard_start`, each with `hero_variant`.
4. GA4 → **Reports** → **Realtime** also shows you within a minute.

## What to look at each week (10 minutes)

- **Reports → Acquisition → Traffic acquisition:** where visitors came from (Google search, your profile `gbp`, direct, referrals).
- **Reports → Engagement → Events:** `audit_submit`, `call_click` and `scorecard_email_submit` counts.
- **Search Console → Performance:** the searches that showed your site, clicks and average position.
- **Hero test:** see `docs/reading-the-hero-test.md`.

## Events the site sends

| Event | When | Details sent |
|---|---|---|
| `page_view` | Every page (GA4 automatic) | |
| `cta_click` | Any main button | `location` (hero, header, footer, final-cta…), `target` |
| `scorecard_start` / `scorecard_answer` / `scorecard_complete` | Scorecard steps | `band`, `industry`, `total` |
| `scorecard_email_submit` / `scorecard_email_error` | Results email form | `band` or `error` |
| `audit_start` / `audit_submit` / `audit_error` | Local Search Audit form | `situation` or `error` |
| `offer_view` | An offer scrolls into view on `/pricing` | `offer_id` |
| `industry_page_view` | An industry page loads | `industry` |
| `call_click`, `email_click` | Phone or email tapped | `location` |
| `scroll_depth`, `learn_read` | 25/50/75/90 percent of a page; 50/90 of a guide | `percent` |
| `founding_apply_submit` | Tally application sent (founding program only) | |

Every event also carries `hero_variant` (a or b). Nothing typed into a form (names, emails, phone numbers) is ever sent to Google Analytics.
