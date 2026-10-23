# Reading the hero test

**Comparison window starts Oct 23, 2026, the day the Change 02 hero copy went live (A: "More calls from Google. No new software." B: "Be the shop people call first."). Ignore data from before that date. If PostHog has an experiment set up, reset it.**

The homepage shows one of two headlines (A: referrals, B: feast or famine). Each visitor keeps the same one. Every PostHog event carries `hero_variant`.

## Build the funnel in PostHog

1. Product analytics → New insight → **Funnel**.
2. Steps:
   1. `$pageview` with filter *Current URL path* = `/`
   2. `cta_click` (location `hero`)
   3. `review_form_submit`

   Build a second funnel for the scorecard: `$pageview` → `scorecard_start` → `scorecard_complete` → `scorecard_email_submit`.
3. **Breakdown** by event property `hero_variant`.
4. Conversion window: 1 day. Date range: since launch.
5. Save it as "Hero test funnel".

## When to stop

Stop when each variant has at least **300 homepage visitors** (step 1) and the step 1 → step 2 rate (scorecard starts) is clearly different, for example 18% vs 12%, and the gap has held for a week. If they're within a point or two, keep A or pick the one you like. A tiny gap isn't worth waiting for.

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
