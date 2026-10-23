# Reading the hero test

**Comparison window starts the day Google Analytics goes live (Change 02 hero copy, A: "More calls from Google. No new software." B: "Be the shop people call first.").**

The homepage shows one of two headlines. Each visitor keeps the same one. GA4 stores it as the user property `hero_variant` (set up as a custom dimension in `docs/analytics-setup.md`, step 3).

## Build the funnel in GA4

1. GA4 → **Explore** → **Funnel exploration**.
2. **Steps** (edit with the pencil):
   1. `page_view` where **Page path and screen class** exactly matches `/`
   2. `cta_click` where **Click location** = `hero`
   3. `review_form_submit`
3. **Breakdown:** drag in **Hero variant**.
4. Date range: since GA4 went live. Leave **Make open funnel** off.
5. Rename the tab "Hero test" (it saves automatically).

Duplicate the tab for the scorecard: `page_view` (`/`) → `scorecard_start` → `scorecard_complete` → `scorecard_email_submit`, same breakdown.

## When to stop

Stop when each variant has at least **300 homepage visitors** (step 1) and the step 1 → step 2 rate (hero button clicks) is clearly different, for example 18% vs 12%, and the gap has held for a week. If they're within a point or two, keep A or pick the one you like. A tiny gap isn't worth waiting for.

## Pick the winner

In `src/content/site.yaml`:

```yaml
heroTest:
  enabled: true
  winner: "b"   # or "a"
```

Commit and push. The site then shows only the winner and stops assigning variants.

## Check it yourself

Add `?hero=a` or `?hero=b` to the homepage URL to force a variant. It sticks for that browser.
