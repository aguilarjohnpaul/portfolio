# TODO for JP

Everything the site still needs from you. Updated Oct 28, 2026, after Change 03 went live. Work top to bottom. Nothing here blocks the site from building; each item turns something on. The production branch is `claude/21-jewel-advisory-concept-i3vpz5` (not `main`).

## 1. This week

- [ ] **Leads Sheet script.** Fix the INTERNAL error first: create a standard Google Cloud project, then Apps Script → Project Settings → Change project → paste its project number. Then paste `LEADS-SHEET-Code.gs.txt` over the old code, run `setup` once and `installFollowUps` once, add script property `CAL_URL` = `https://cal.com/21jewel/20min`, and Deploy → Manage deployments → pencil → New version → Deploy. Details: `docs/google-sheet-setup.md`.
- [ ] **Test the audit form** with your own email. You should get the confirmation email, a new row in `Audits` with Status `new`, and the alert.
- [ ] **Content Sheet script.** Paste `CONTENT-SHEET-Code.gs.txt` over the old code, reload the Sheet, then 21J → Refresh keys from site (rebuilds the `guides` tab) → 21J → Publish site. Delete the `guides_old_…` tab once the titles look right.
- [ ] **Deploy hook.** Cloudflare → `21jewel` → Settings → Builds → Deploy hooks → `Sheet publish` on branch `claude/21-jewel-advisory-concept-i3vpz5`. Paste the URL into the content Sheet's script property `DEPLOY_HOOK_URL`. Skip the preview hook for now.
- [ ] **Cloudflare variable.** `SHEET_CONTENT_ID` = the content Sheet id, plain text, Production and Preview. Then retry the latest deployment.
- [ ] **GitHub.** Repo → Settings → Secrets and variables → Actions. Secret `SHEET_CONTENT_ID` = the Sheet id. Variable `SHEET_SYNC_BRANCH` = `claude/21-jewel-advisory-concept-i3vpz5`. Then Actions → Sheet snapshot → Run workflow once.
- [ ] **Test the Sheet round trip.** Change `site.brand.tagline` in the `strings` tab, 21J → Publish site, reload the footer two minutes later, then clear it and publish again.
- [ ] **Purge the Cloudflare cache.** `21jeweladvisory.com` → Caching → Configuration → Purge Everything.
- [ ] **Search Console indexing.** URL Inspection → Request indexing for `/`, `/audit`, `/pricing`, `/services/get-found`, `/industries/roofing` and `/learn/not-showing-up-on-google-maps`. About 10 a day; the sitemap covers the rest.
- [ ] **Google profile links.** Edit profile → Contact. Website: `https://21jeweladvisory.com/?utm_source=google&utm_medium=organic&utm_campaign=gbp`. Appointment link: `https://21jeweladvisory.com/audit?utm_source=google&utm_medium=organic&utm_campaign=gbp`.
- [ ] **Google profile location.** Edit profile → Location. Business address: your San Antonio address, hidden from customers. Service areas: remove Seguin and anything broad, add San Antonio first, then Bexar County and nearby towns (up to 20, within about 2 hours).
- [ ] **GA4 key events.** `docs/analytics-setup.md` steps 3 and 4: custom dimensions `situation` and `percent`, and mark `audit_submit` and `call_click` as key events. They only collect from the day you create them.

## 2. In two weeks

- [ ] **Search Console check.** Pages report: the old URLs (`/review`, `/offers`, `/studios`) should show as redirects, and the sitemap status should say Success.
- [ ] **Google profile check.** Search "21 Jewel Advisory" on Maps and confirm the pin sits in San Antonio, not Seguin.

## 3. When you have them

- [ ] **Photo.** A 4:5 JPG at `public/jp.jpg`, then `photo: /jp.jpg` in `home.yaml` → `about` and `pages.yaml` → `about`. The monogram disappears everywhere.
- [ ] **First testimonial.** A row in the content Sheet's `testimonials` tab. The homepage proof section turns on by itself.
- [ ] **First case study.** One Markdown file in `src/content/case-studies/` with `published: true`, then `flags.showResults: true`. Set `flags.realExamples: true` once the industry example tables can use real numbers.
- [ ] **Terms.** Lawyer review of `pages.yaml` → `terms`, then `flags.showTerms: true`.
- [ ] **Founding program.** `flags.showFounding: true` when you want it public.
- [ ] **Clarity (optional).** Project at clarity.microsoft.com, `PUBLIC_CLARITY_ID` in Cloudflare, `flags.showClarity: true`.
- [ ] **New learn articles.** Ten topics are in the `local-visibility-essay` skill and the project doc `learn-content-backlog.md`. Write with Opus 5.5 using that skill plus `jp-voice`.
- [ ] **Suburb pages (later).** `flags.showAreas` exists, no template yet. Only once there's a client or case study in that town.
- [ ] **Spanish (later).** `flags.showSpanish` exists, nothing built. Human-translated only.

## 4. Done

- [x] Change 03 merged and live (PR #1, Oct 27).
- [x] Search Console Domain property verified for `21jeweladvisory.com`; `sitemap-index.xml` submitted; live test shows the new site.
- [x] `/sitemap.xml` redirects to `/sitemap-index.xml`.
- [x] Google Business Profile Maps link and LinkedIn in the business schema (`sameAs`).
- [x] Taylor'd Prints named on the sign and print page as a case study in progress.
- [x] Six learn guides rewritten as argument-led essays, no FAQ blocks, no prices.
- [x] Content Sheet `guides` tab: blank cells use the guide's own title; defaults shown in `default_*` columns.
- [x] Offer ladder: Free Local Search Audit → Get Found Setup → Get Chosen Setup → Keep Ranking (month-to-month).
- [x] Industries: sign and print, roofing, plumbing, electrical, remodeling, landscaping and tree service. No HVAC, dental or med spa.
- [x] Cal.com link `https://cal.com/21jewel/20min` on `/thanks/audit` and `/about` only.
- [x] Dark mode removed. Phone (737) 391-3041 everywhere. "21 Jewel Advisory" in schema, titles and footer.
