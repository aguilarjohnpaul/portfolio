# Change 01: Website-led offer ladder

Date: Oct 20, 2026 · Approved by JP

Apply these changes to `src/content/*.yaml`, `PHASE1_SPEC.md` and `CLAUDE.md`. Use targeted edits only. Log the change in `DECISIONS.md` and update `TODO-JP.md`. All items are approved.

## Why

Website work is easier for owners to buy and is natively measurable through Google Business Profile history, GA4, Search Console and form tracking. Referral conversations stay inside the work, not as the headline offer. The ladder now leads with the website, feeds into lead pipeline (funnel) work, and leads into ongoing strategy.

**Execution rule:** JP executes only what is one-time, templated and under about 10 hours per client. Recurring or custom work (posting, ad management, design, full rebuilds) goes to partners, who quote separately and bill the client directly. JP edits on any common platform himself.

## 1. Offer ladder (`offers.yaml`)

Replace the old offers. Display order is the ladder.

| id | Name | Type | Price label | One-liner |
|---|---|---|---|---|
| `scorecard` | Is Your Website Losing You Work? | Free | Free | A 3-minute scorecard. See your score and your biggest leak. |
| `website-review` | Website Review | Paid diagnostic | Starting at $950 | An outside-in review of your site, search presence and inquiry path, with fixes ranked. |
| `thirty-day-fix` | The 30-Day Fix | Sprint | Starting at $2,500 | We fix your website's message, inquiry path and tracking in 30 days. |
| `lead-pipelines` | Lead Pipelines | Build | Starting at $3,500 | Pages, follow-up emails and tracking that turn visits and past clients into steady leads. |
| `growth-advisor` | Growth Advisor | Retainer | Starting at $750/month | A monthly review of your leads and numbers, and a steady hand on what's next. |
| `studio-sprint` | White-label Strategy Sprint | Studio partners only | Pricing on request | Unchanged. Shown only on `/studios`. |

Rule under the ladder: "The Website Review fee is credited toward The 30-Day Fix if booked within 30 days."

**Pricing and terms**

| id | Launch | After 3 case studies | Terms |
|---|---|---|---|
| `website-review` | $950 | $1,500 | 50% upfront, 50% on delivery |
| `thirty-day-fix` | $2,500 | $3,500 | 50% upfront, 50% on delivery; review fee credited within 30 days |
| `lead-pipelines` | $3,500 | $5,000 | 50% upfront, 50% on delivery |
| `growth-advisor` | $750/month | $1,250/month | Billed monthly in advance; 3-month minimum |

### `/offers` details

**Website Review**
- Who it's for: owners whose website gets visits but few inquiries, or who aren't sure what it's doing for them.
- What you get:
  - An outside-in review of your website, search presence and Google Business Profile.
  - A 60-minute working session, including how your work finds you today.
  - A written report with fixes ranked by effort and payoff.
  - A 30-minute walkthrough.
- Timeline: about 2 weeks.

**The 30-Day Fix**
- Who it's for: firms ready to fix what the review found.
- What you get:
  - New page structure and copy for your homepage and up to 3 service pages.
  - Google Business Profile cleanup.
  - An inquiry form with a "How did you hear about us? Who referred you?" field.
  - Tracking set up: GA4, Search Console and call tracking.
  - Weekly 30-minute check-ins.
- Edits are made on your current platform. A full rebuild goes to a vetted partner, quoted separately.
- Timeline: 30 days.

**Lead Pipelines**
- Who it's for: firms whose website works and who want steady new leads.
- What you get:
  - A lead offer and landing page.
  - Inquiry and quote follow-up emails.
  - A post-job email asking for a review and a referral.
  - A past-client reactivation sequence.
  - A local search plan and a paid test plan.
- Ongoing posting or ad management goes to your team or vetted partners.
- Timeline: 60 to 90 days.

**Growth Advisor**
- Who it's for: firms that want accountability and someone watching the numbers.
- What you get:
  - A monthly 60-minute review of a simple lead dashboard.
  - Async questions.
  - A quarterly plan refresh.
  - Help directing your vendors and designers.

**FAQ (replace the existing set)**
- **Do I need to start with the Website Review?** No. The scorecard is free and points you to the right step.
- **Do you build websites?** I rewrite and restructure your site and make the edits on your current platform. Full rebuilds go to a vetted partner, quoted separately.
- **Do you run ads or post content for me?** No. I build the plan and the systems. Ongoing posting or ads go to your team or vetted partners.
- **Do you work outside San Antonio?** Yes, everything works remotely.
- **What if my score is already high?** Then Lead Pipelines is usually the next step.

## 2. Founding client program (`founding.yaml`, `home.yaml`)

- Body: "I'm taking on five owner-run service firms at no cost while I build my portfolio. You get the full Website Review and The 30-Day Fix, a $3,450 value."
- What you get: Website Review · The 30-Day Fix · Weekly check-ins for a month.
- How it works: Apply (5 minutes) → 20-minute fit call → Website Review → The 30-Day Fix → Case study.
- What I ask: unchanged.

## 3. Scorecard (`scorecard.yaml`, `/scorecard`, homepage CTAs)

- New name: **Is Your Website Losing You Work?**
- Hero and CTA buttons: "Is your website losing you work?"
- Intro: "12 quick questions about how people find you, contact you and come back. You'll see your score and your biggest leak right away."
- Keep the three stages, the scoring math, the Kit fields and the tags. Replace the questions and fixes as below.
- Options score Always = 3 · Usually = 2 · Sometimes = 1 · Rarely or never = 0. Q7 keeps the custom reply-speed options.

| # | Stage | Question | Fix |
|---|---|---|---|
| 1 | Get referred | When someone searches your business name, does your website come up first? | Make sure your homepage title includes your business name and what you do, and link your site from your Google Business Profile. |
| 2 | Get referred | Is your Google Business Profile complete and updated in the last 3 months? | Fill every field, add 10 recent photos, and post a short update each month. |
| 3 | Get referred | Does your website show recent reviews, work or client stories? | Add three recent reviews and one short project story to your homepage. |
| 4 | Get referred | When a project wraps up well, do you ask the client for a referral? | Ask at the moment of praise. Add one line to your wrap-up call: "Who else do you know who deals with this?" |
| 5 | Get hired | Can a visitor tell what you do, who it's for and roughly what it costs within 10 seconds? | Rewrite your homepage headline to say what you do and for whom, and add "starting at" prices. |
| 6 | Get hired | Does every page have one clear next step that works on a phone? | Give every page one button ("Request a quote" or "Book a call") and test your form on your phone. |
| 7 | Get hired | How fast do you usually reply to a new inquiry? (Within the hour 3 · Same day 2 · Within 1–2 days 1 · Longer 0) | Set an auto-reply that confirms receipt and offers a call time. Aim to reply personally the same business day. |
| 8 | Get hired | Do you follow up on quotes or proposals that haven't been answered? | Follow up on day 2, day 7 and day 14 with a short, useful note, not a "just checking in." |
| 9 | Get hired again | Do you check in with past clients after the work ends? | Put a 30-, 90- and 180-day check-in on your calendar for every finished project. |
| 10 | Get hired again | When a project ends, do you offer a clear next step or service? | Write one natural follow-on offer for your most common project and mention it at wrap-up. |
| 11 | Get hired again | Do you ask happy clients for a Google review? | Send a review link with two prompt questions within a week of a strong finish. |
| 12 | Get hired again | Do you know where each new lead came from, including who referred them? | Add "How did you hear about us? Who referred you?" to your inquiry form and log the answer for every lead. |

**Bands**
- 0–39 **Running on luck**: "Work comes in when it comes in. A few basics would change that fast."
- 40–69 **Working, but leaking**: "People find you, but you're losing good work at one or two stages."
- 70–100 **Built to win work**: "Your site and follow-up work. The gains now come from new lead sources and consistency."

Update the Kit results email in `docs/kit-results-email.md` to use the new name. The founding invitation line stays.

## 4. Homepage copy (`home.yaml`)

- **How it works, "What we fix" lines:**
  - Get referred: "A website and search presence that confirms you the moment someone is referred."
  - Get hired: "A clear site, fast replies and follow-up that turn visits into booked work."
  - Get hired again: unchanged.
- **Offers section:** pulls the new offers automatically.
- **Hero A and B copy:** replace both variants. This restarts the hero test, so reset the comparison window in `docs/reading-the-hero-test.md` to start on the deploy date.

| Field | Variant A (website) | Variant B (steady leads) |
|---|---|---|
| Eyebrow | Website and lead strategy for owner-run service firms | same |
| H1 | Your next client is checking your website right now. Does it give them a reason to call? | Busy one month, empty the next? Turn your website into a steady source of leads. |
| Subhead | For service businesses with 5 to 20 people. Fix the message, the inquiry path and the follow-up that decide whether a visit becomes a job. | For service businesses with 5 to 20 people. Find where your website and follow-up lose good leads, then fix them in 30 days. |
| Primary button | Is your website losing you work? → `/scorecard` | same |
| Secondary button | See founding client spots → `/founding-clients` | same |
| Micro line | Free · 12 questions · About 3 minutes · Results on screen | same |

- **Sample result card:** keep the layout. Change the footer line to "Biggest leak: no clear next step on mobile."
- **SEO (`site.yaml`):**
  - Home title: "21 Jewel · Turn your website into steady work"
  - Home description: "Website and lead strategy for owner-run service firms. Take the free 3-minute scorecard: Is your website losing you work?"
  - Regenerate the OG image with the variant A H1.

## 5. `CLAUDE.md` and `PHASE1_SPEC.md`

- Replace the scorecard name and every old offer name and description throughout.
- In `CLAUDE.md` "What this is," change Phase 1 job 1 to: "Get visitors to take the free scorecard, **Is Your Website Losing You Work?**, and leave an email."
- Add the execution rule from "Why" above to `CLAUDE.md` under "What this is."

## 6. Done when

- `npm run check && npm run build` pass, and scorecard unit tests pass with the new questions.
- No old offer names remain anywhere in `src/` (search for "Referral Leak Audit", "30-Day Referral System", "Lead Growth Roadmap", "Monthly Growth Advisor", "How Referable").
- No `[PENDING JP]` items remain. Hero test assignment still works with both new variants, and `?hero=a` / `?hero=b` still force each one.
