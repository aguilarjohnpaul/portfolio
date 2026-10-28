# TODO for JP

Everything the site still needs from you after Change 03 (Oct 27, 2026). Work top to bottom. Nothing here blocks the site from building or looking finished; each item turns something on.

## 1. Before merging to the live branch (about 45 minutes)

- [ ] **Leads Sheet script.** Open the leads Sheet → Extensions → Apps Script. Paste the new `docs/google-sheet/Code.gs` over the old one. Run `setup` once (adds the `Audits` tab), run `installFollowUps` once (daily 9am follow-up check), then Deploy → Manage deployments → pencil → New version → Deploy. Add script property `CAL_URL` = your Cal.com link. Details: `docs/google-sheet-setup.md`, `docs/follow-up-emails.md`.
- [ ] **Content Sheet.** 15 minutes, once: `docs/google-sheet-content-setup.md`. After that you edit the site from the Sheet (`docs/how-to-edit-the-sheet.md`).
- [ ] **Cloudflare variables.** `SHEET_CONTENT_ID` (plain text, Production and Preview). Everything else already exists.
- [ ] **GitHub.** Secret `SHEET_CONTENT_ID` and variable `SHEET_SYNC_BRANCH` = the branch Cloudflare deploys from, so the nightly snapshot runs.
- [ ] **Google profile links.** In `src/content/site.yaml` → `links`, paste `google_profile` (your Business Profile's public Maps URL) and `linkedin`. They feed the `sameAs` schema. Both can stay empty; nothing breaks.
- [ ] **Google Business Profile.** Website field → `https://21jeweladvisory.com/?utm_source=google&utm_medium=organic&utm_campaign=gbp`. Appointment link → `https://21jeweladvisory.com/audit?utm_source=google&utm_medium=organic&utm_campaign=gbp-appt`. Business name on the profile: **21 Jewel Advisory**, phone **(737) 391-3041**, same as the site.

## 2. After merging (same day)

- [ ] **Search Console.** Sitemaps → submit `https://21jeweladvisory.com/sitemap-index.xml` again. Then URL inspection → Request indexing for `/`, `/audit`, `/pricing`, the three `/services/*` pages and the six `/industries/*` pages. Two weeks later, check Pages for the old URLs (`/review`, `/offers`, `/studios`) showing as redirects.
- [ ] **GA4.** `docs/analytics-setup.md` steps 3 and 4: add the new custom dimensions (`situation`, `percent`) and mark `audit_submit` and `call_click` as key events. They only collect from the day you create them.
- [ ] **Test the audit form** with your own email. You should get the confirmation, see the row in `Audits` with Status `new`, and get the alert.
- [ ] **Test the Sheet round trip.** Change `site.brand.tagline` in the `strings` tab, 21J → Publish site, reload the footer.

## 3. When you have them

- [ ] **Photo.** Put a 4:5 JPG at `public/jp.jpg`, then set `photo: /jp.jpg` in `src/content/home.yaml` → `about` and `src/content/pages.yaml` → `about`. The monogram disappears everywhere, including the author box on guides.
- [ ] **First testimonial.** Add a row to the content Sheet's `testimonials` tab (or `src/content/testimonials.yaml`). The proof section on the homepage turns on by itself.
- [ ] **First case study.** One Markdown file in `src/content/case-studies/` with `published: true`, then set `flags.showResults: true`. Also set `flags.realExamples: true` once the industry pages' example tables can be replaced with real numbers (edit the rows in `industries.yaml` first).
- [ ] **Taylor'd Prints.** Written permission to name him, then replace "Case study in progress." in `industries.yaml` → `sign-print` → `proof`.
- [ ] **Terms.** Lawyer review of `pages.yaml` → `terms`, then `flags.showTerms: true`.
- [ ] **Founding program.** `flags.showFounding: true` when you want it public. Tally form fields and redirect are already set.
- [ ] **Clarity (optional).** Create a project at clarity.microsoft.com, add `PUBLIC_CLARITY_ID` in Cloudflare, set `flags.showClarity: true`. The privacy page line and the CSP update themselves.
- [ ] **Suburb pages (later).** `flags.showAreas` exists but the `areas` collection has no template yet. Build it only when you have a client or case study in that town.
- [ ] **Spanish (later).** `flags.showSpanish` exists; nothing is built. Human-translated only.

## 4. Decided and done (for the record)

- [x] Offer ladder: Free Local Search Audit → Get Found Setup $650 → Get Chosen Setup $1,450 → Keep Ranking $450/month, month-to-month. Half a setup fee credits against the first three months of Keep Ranking within 60 days.
- [x] Industries: sign and print, roofing, plumbing, electrical, remodeling, landscaping and tree service. No HVAC, dental or med spa.
- [x] Six guides published (edit them in the Sheet's `guides` tab for title and publish state, or on GitHub for the body).
- [x] Cal.com link `https://cal.com/21jewel/20min`, shown on `/thanks/audit` and `/about` only.
- [x] Dark mode removed. Phone (737) 391-3041 everywhere. Name "21 Jewel Advisory" in schema, titles and footer.
