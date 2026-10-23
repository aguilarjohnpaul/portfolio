# Analytics setup: Google Analytics 4 + Search Console

About 30 minutes, all free. Do the steps in order. The site is already wired: it sends events as soon as you add the ID in step 2.

**What each tool answers**
- **Google Analytics 4 (GA4):** who visits, where they came from, and what they do (scorecard, review requests, booking clicks, hero A vs B).
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

## 2. Add the ID to Cloudflare

1. Cloudflare dashboard → **Workers & Pages** → **21jewel** → **Settings** → **Variables and secrets** → **Add**.
   - Type: **Text** (not Secret)
   - Name: `PUBLIC_GA_ID`
   - Value: your `G-…` ID
   - Environment: **Production** (add it to Preview too if you want test builds tracked)
2. **Deployments** → latest production deployment → **⋯** → **Retry deployment**. The ID is read when the site builds, so this step is required.

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
| Found you via | Event | `source_answer` |
| Offer viewed | Event | `offer_id` |

## 4. Mark the events that count as leads

**Admin** → **Data display** → **Key events** → **New key event**. Type each name exactly:

- `review_form_submit` (a Website Review request)
- `scorecard_email_submit` (scorecard results requested)
- `book_call_click` (clicked to book a call)
- `founding_apply_submit` (add later, when the founding program is on)

## 5. Two housekeeping settings

- **Keep data longer:** Admin → Data collection and modification → **Data retention** → **14 months** → Save. The default of 2 months is too short for 30/60/90-day comparisons.
- **Don't count yourself (optional):** Admin → Data streams → your stream → **Configure tag settings** → Show more → **Define internal traffic** → add your home and office IP (search "what is my IP"). Then Admin → **Data filters** → Internal Traffic → set to **Active**. Phone traffic on cellular can't be filtered this way; that's fine.

## 6. Search Console

1. Go to **search.google.com/search-console** → **Add property** → **Domain** → `21jeweladvisory.com`.
2. Verify. Google detects Cloudflare and offers to add the record for you: tap **Start verification** and approve in Cloudflare.
   - If it doesn't offer that, copy the TXT record → Cloudflare → **DNS** → **Records** → **Add record**: Type `TXT`, Name `@`, Content = the value Google gave you → Save → back in Search Console tap **Verify**. It can take a few minutes.
3. **Sitemaps** (left menu) → enter `sitemap-index.xml` → **Submit**.
4. **URL inspection** (top bar) → paste `https://21jeweladvisory.com/` → **Request indexing**. Repeat for `/review` and `/industries/sign-print`.
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
3. GA4 → **Admin** → **DebugView**: you should see `page_view`, `cta_click`, `scorecard_start`, each with `hero_variant`.
4. GA4 → **Reports** → **Realtime** also shows you within a minute.

## What to look at each week (10 minutes)

- **Reports → Acquisition → Traffic acquisition:** where visitors came from (Google search, your profile `gbp`, direct, referrals).
- **Reports → Engagement → Key events:** review requests, scorecard emails, booking clicks.
- **Search Console → Performance:** the searches that showed your site, clicks and average position.
- **Hero test:** see `docs/reading-the-hero-test.md`.

## Events the site sends

| Event | When | Details sent |
|---|---|---|
| `page_view` | Every page (GA4 automatic) | |
| `cta_click` | Any main button | `location` (hero, header, footer, final-cta…), `target` |
| `scorecard_start` / `scorecard_answer` / `scorecard_complete` | Scorecard steps | `band`, `industry`, `total` |
| `scorecard_email_submit` / `scorecard_email_error` | Results email form | `band` or `error` |
| `review_form_submit` / `review_form_error` | Website Review form | `source_answer` or `error` |
| `offer_view` | An offer scrolls into view on `/offers` | `offer_id` |
| `industry_page_view` | An industry page loads | `industry` |
| `book_call_click`, `email_click`, `theme_toggle` | Those clicks | |
| `founding_apply_submit` | Tally application sent (founding program only) | |

Every event also carries `hero_variant` (a or b). Nothing typed into a form (names, emails, phone numbers) is ever sent to Google Analytics.
