# TODO for JP

Work top to bottom. Each step says where to click or what to edit. Copy edits are all in `src/content/`.

## 1. Fill the placeholders

- [ ] **Your photo.** (On hold.) Add `public/jp.jpg` (4:5, about 960×1200). In `home.yaml` set `about.photo: /jp.jpg` and `about.photo_alt: JP, founder of 21 Jewel`.
- [x] **Cal.com link.** Set to `https://cal.com/21jewel/20min`.
- [x] **Tally form URL.** Set to `https://tally.so/r/7XRqva`.
- [ ] **Founding spots filled.** `src/content/site.yaml` → `founding.filled` (launches at 0 = "5 of 5 spots open").

## 2. Copy I wrote

- [x] Approved by JP on Oct 20, 2026 (scorecard "Who it's for", thanks page, privacy page, email form note and errors, short header button).

## 3. Put the code on GitHub and Cloudflare Pages

- [ ] Create a GitHub repo (for example `21jeweladvisory`) and push the contents of this `21-jewel/` folder to its `main` branch. (Or keep it in `portfolio` and set the root directory below to `21-jewel`.)
- [ ] Cloudflare dashboard → Workers & Pages → Create → Pages → Connect to Git → pick the repo.
  - Framework preset: Astro. Build command: `npm run build`. Output directory: `dist`. Root directory: blank (or `21-jewel`).
  - Environment variable `NODE_VERSION` = `22`.
- [ ] Pages project → Custom domains → add `21jeweladvisory.com` and `www.21jeweladvisory.com`.
- [ ] Rules → Redirect Rules on `21jeweladvisory.com`: `www.21jeweladvisory.com/*` → `https://21jeweladvisory.com/${1}` (301).
- [ ] Rules → Redirect Rules on `meet21j.com`: hostname is `meet21j.com` or `www.meet21j.com` → `https://21jeweladvisory.com` + path (301, keep query string). Both hostnames need a proxied DNS record (an `AAAA` to `100::` works).

## 4. Email address

- [ ] Cloudflare → `21jeweladvisory.com` → Email → Email Routing → forward `johnpaul@` to your Gmail.
- [ ] Optional: Gmail → Settings → Accounts → "Send mail as" `johnpaul@21jeweladvisory.com`, so replies come from that address.

## 5. Accounts and keys

Add each key in Pages project → Settings → Variables and secrets (Production and Preview). Redeploy after adding.

- [ ] **PostHog** (US Cloud, free). Project settings → copy the project API key.
  - `PUBLIC_POSTHOG_KEY` = `phc_...`
  - `PUBLIC_POSTHOG_HOST` = `https://us.i.posthog.com`
  - If you choose EU Cloud instead, the CSP in `public/_headers` needs the EU hosts too.
- [ ] **Turnstile.** Cloudflare → Turnstile → Add widget for `21jeweladvisory.com`, mode "Invisible" or "Managed".
  - `PUBLIC_TURNSTILE_SITE_KEY` = site key
  - `TURNSTILE_SECRET` = secret key (mark as secret)
- [ ] **Kit.** Settings → Developer → create a **V4** API key (V3 keys won't work).
  - `KIT_API_KEY` = the key (mark as secret)
  - On your computer, run once: `KIT_API_KEY=... node scripts/kit-setup.mjs`. It creates the 10 custom fields and all tags, and prints a `KIT_TAG_IDS` value. Paste it in as an environment variable too (optional, saves API calls).
  - Build the results email automation from `docs/kit-results-email.md`.

## 6. Tally application form

- [ ] Create the form with these fields: name, email, business, website, team size, industry, "Where does most of your new work come from today?", "What's your biggest growth frustration right now?", "Why now?"
- [ ] Design → colors: background `#FBF9F6`, text `#1E3B2F`, buttons `#1E3B2F` with text `#F3EFE6`, accent `#9F5835`, input borders `#D5D6CC`. Font: Inter (Fraunces for headings if offered). Corner radius about 8px.
- [ ] Settings → notifications → email you on each submission.
- [ ] Optional: Settings → redirect on completion → `https://21jeweladvisory.com/thanks`.
- [ ] Optional: add a hidden field `waitlist` so you can tell waitlist sign-ups apart.
- [x] Share link added to `site.yaml`.

## 7. Cal.com

- [x] Event "20-minute fit call" created and linked.

## 8. Test the live site

- [ ] Take the scorecard with your own email. Check Kit has the subscriber, the 10 fields and the tags, and that the results email arrives.
- [ ] Submit the Tally form once. Check you get the notification.
- [ ] Check PostHog → Activity shows `scorecard_start`, `scorecard_complete` and `scorecard_email_submit`, each with `hero_variant`.
- [ ] Build the hero test funnel (`docs/reading-the-hero-test.md`).
- [ ] Visit `meet21j.com` and `www.21jeweladvisory.com` and confirm both land on `https://21jeweladvisory.com`.

## 9. Assumptions to confirm (spec §15)

- [ ] The meter launches at 5 of 5 open, and the audit fee credit lasts 30 days. (Marked confirmed in the spec.)
- [ ] The scorecard is 12 questions, about 3 minutes.
- [ ] The score and biggest leak show free; the full breakdown and top 3 fixes are emailed.
- [ ] The founding program bundles the Referral Leak Audit and the 30-Day Referral System.
- [ ] The Lead Growth Roadmap is a 90-day plan.
