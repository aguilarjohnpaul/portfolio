# TODO for JP

Work top to bottom. Each step says where to click or what to edit. Copy edits are all in `src/content/`.

## 0. After Change 02 (local services ladder, Oct 23, 2026)

**Open**
- [ ] **Re-paste the Apps Script.** Copy the new `docs/google-sheet/Code.gs` over the old one, run `setup` once (it adds the `Reviews` tab), then Deploy → Manage deployments → pencil icon → Version: New version → Deploy. Until you do, Website Review requests fail to save. Steps are in `docs/google-sheet-setup.md`.
- [ ] **Headshot** for `/about` and the homepage: add `public/jp.jpg` (4:5), then set `photo: /jp.jpg` in `home.yaml` → `about` and in `pages.yaml` → `about`.
- [ ] **Lawyer review of the terms** (`pages.yaml` → `terms`), then set `flags.showTerms: true` in `site.yaml`. Not legal advice.
- [ ] **Taylor'd Prints:** written permission to name him on the sign-print page. Until then it says "Case study in progress." Never name his corporate clients. He is not a founding spot.
- [ ] **When to show the founding program:** set `flags.showFounding: true`. The homepage band, nav link, `/founding-clients` and `/thanks/founding` all come back.
- [ ] **Tally application form:** before turning founding on, update its fields to name, email, phone, business name, website, Google profile link (or business name and city), top 3 services, "How do most customers find you today?" and "Why now?" Set its redirect to `https://21jeweladvisory.com/thanks/founding`.
- [ ] **FAQ:** built and hidden. Set `flags.showFaq: true` to show it on the homepage and `/offers`.
- [ ] **HVAC and roofing pages:** set `flags.showHvac` / `flags.showRoofing` to build them. They stay noindexed until you set `indexed: true` in `industries.yaml` (after a first client).
- [ ] **Raise prices after 3 case studies:** Tune-Up $600, The 30-Day Fix $1,500, Growth Advisor $650/month (`offers.yaml` → `price_from`).

**Decided on Oct 23, 2026** (logged in `DECISIONS.md`)
- [x] Framework line: "Get found → Get hired → Get hired again."
- [x] Tagline: "Precise work. More calls."
- [x] Growth Advisor: $650/month after 3 case studies; early exit before month 4 owes $1,250 − $250 × months paid.
- [x] Advisory hour: $200/hour.
- [x] Website Review turnaround 5 business days, 5 reviews a week. Founding reply 3 business days.
- [x] Offer name: Google Profile Tune-Up.
- [x] No-website FAQ answer: as proposed (hidden with the FAQ).
- [x] Bio: 8 years. Brand names only on `/about`.

## 1. Fill the placeholders

- [ ] **Your photo.** (On hold; see section 0.)
- [x] **Cal.com link.** Set to `https://cal.com/21jewel/20min`.
- [x] **Tally form URL.** Set to `https://tally.so/r/7XRqva`.
- [x] **Founding spots filled:** 0 (Taylor'd Prints is not a founding spot). Raise `founding.filled` in `site.yaml` as spots fill.

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

- [x] You already own the johnpaul@21jeweladvisory.com mailbox (no Cloudflare Email Routing needed).
- [ ] If it isn't a Google Workspace account, add it in Gmail → Settings → Accounts → "Send mail as", so scorecard emails come from johnpaul@ (see `docs/google-sheet-setup.md`).

## 5. Accounts and keys

Add each key in Pages project → Settings → Variables and secrets (Production and Preview). Redeploy after adding.

- [ ] **PostHog** (later; the site runs fine without it) (US Cloud, free). Project settings → copy the project API key.
  - `PUBLIC_POSTHOG_KEY` = `phc_...`
  - `PUBLIC_POSTHOG_HOST` = `https://us.i.posthog.com`
  - If you choose EU Cloud instead, the CSP in `public/_headers` needs the EU hosts too.
- [x] **Turnstile.** Widget created and keys added.
  - `PUBLIC_TURNSTILE_SITE_KEY` = site key
  - `TURNSTILE_SECRET` = secret key (mark as secret)
- [ ] **Google Sheet + Gmail** (scorecard emails). Follow `docs/google-sheet-setup.md`. It ends with two Secrets in Cloudflare: `SHEET_WEBHOOK_URL` and `SHEET_WEBHOOK_SECRET`.
- Kit is no longer needed. The site still supports it (`KIT_API_KEY`, `scripts/kit-setup.mjs`, `docs/kit-results-email.md`) if you switch later.

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

- [ ] Take the scorecard with your own email. Check a row appears in the Sheet's `Leads` tab, the breakdown email arrives, and you get the "New scorecard" alert.
- [ ] Submit the Tally form once. Check you get the notification.
- [ ] Check PostHog → Activity shows `scorecard_start`, `scorecard_complete` and `scorecard_email_submit`, each with `hero_variant`.
- [ ] Build the hero test funnel (`docs/reading-the-hero-test.md`).
- [ ] Visit `meet21j.com` and `www.21jeweladvisory.com` and confirm both land on `https://21jeweladvisory.com`.

## 9. Assumptions to confirm (spec §15)

- [x] The meter launches at 5 of 5 open, and the Website Review fee credit lasts 30 days.
- [ ] The scorecard is 12 questions, about 3 minutes.
- [ ] The score and biggest leak show free; the full breakdown and top 3 fixes are emailed.
- [x] The founding program bundles the Website Review and The 30-Day Fix (Change 01).
- [x] Lead Pipelines runs 60 to 90 days (Change 01).
