# Change 02: Local services ladder and full page plan

Date: Oct 23, 2026 · Approved by JP

**Decisions behind this change**
- Ladder: replace the old ladder with the price brackets.
- Audience: local service businesses.
- Founding program: The 30-Day Fix, free, for 5 clients. **Hidden at launch** (flag `showFounding: false`); copy stays ready.
- Offer names: Claude's pick, editable.

**How to apply.** Same rules as Change 01:
- Make targeted edits to `src/content/*.yaml`, `PHASE1_SPEC.md` and `CLAUDE.md`.
- Log every judgment call in `DECISIONS.md` and add every **[PENDING JP]** item to `TODO-JP.md`.
- Don't touch design tokens, the stack, the theme toggle or the analytics plumbing unless a section below says so.

**What this replaces from Change 01:** the offer ladder and prices, the founding bundle, the hero copy, the scorecard questions and the homepage sections.

**What this keeps:**
- The Evergreen palette, Fraunces + Inter, and light and dark mode.
- Astro on Cloudflare Pages, PostHog, Kit, Tally, Turnstile and Cal.com.
- The hero A/B framework, the "starting at" price labels and the `/studios` page.

---

## 0. Why

- **Buyers:** Local owner-run service businesses (sign and print shops, HVAC, roofing, similar trades) can't afford a $1,500 review or a $3,500 sprint. They can afford $450–$1,250 and a $500 monthly plan.
- **First sale:** The free Website Review is the front door. Google Business Profile and review work gives a fast, visible first win. The 30-Day Fix is the core project. Growth Advisor is the recurring revenue.
- **Measurement:** Everything on the ladder can be measured with free data the owner already has: Google profile performance, review count, map position and a "How did you hear about us?" field.

## 1. Positioning and voice

**One-liner:** I help local service businesses get more calls from Google: a cleaner Google profile, steady reviews, and a website that turns visits into quote requests.

**Who it's for:** owner-run local service businesses with roughly 1–20 staff. Sign and print shops are first, then HVAC, roofing and other trades. Based in San Antonio and working with owners anywhere in the US.

**The promise, said plainly everywhere:**
1. You spend about 30–45 minutes. I do the work.
2. No new software to pay for. I use the tools you already have.
3. No passwords shared. You give me manager access and can remove it anytime.
4. I save your numbers before I start and show you the change.
5. You own everything I set up.

**Never say:**
- "#1 on Google," "guaranteed rankings," "guaranteed leads" or any revenue guarantee.
- Invented stats, client logos or testimonials. Missing facts stay as `[PLACEHOLDER]`.
- Jargon: SEO strategy, funnel, RevOps, GTM, leverage, unlock, supercharge, seamless. Say "showing up on Google" instead of "local SEO" in headlines. "Google profile" is fine; spell out "Google Business Profile" once per page.

**Words owners use:** calls, quote requests, jobs, reviews, showing up on Google, the map, slow months, word of mouth, the shop down the street.

**Voice:** short sentences, active voice, "you" to the reader. JP speaks as "I" on every page. This replaces Change 01, where only some pages used "I." The new offers are personal service, so the first person builds trust.

**Framework line [PENDING JP]:** Change 01 kept "Get referred → Get hired → Get hired again." I propose **"Get found → Get chosen → Get called again"** to match the ladder: profile and pages, then reviews and proof, then follow-up. Keep the original if JP prefers. It's one line in `home.yaml`.

**Footer tagline [PENDING JP]:** "Strategy that keeps time."

## 2. Offer ladder (`offers.yaml`)

Replace all offers. Display order is the ladder.

| id | Name | Type | Price label | One-liner |
|---|---|---|---|---|
| `website-review` | Website Review | Free diagnostic | Free | I look at your website and Google profile and send you the top 3 things costing you calls. |
| `profile-tune-up` | Google Profile Tune-Up | Quick win | Starting at $450 | I clean up your Google profile and set up a simple way to get reviews after every job. |
| `thirty-day-fix` | The 30-Day Fix | Core project | Starting at $1,250 | Your Google profile, reviews and a service page that turns searches into quote requests, done in 30 days. |
| `growth-advisor` | Growth Advisor | Monthly | Starting at $500/month | The 30-Day Fix with $0 upfront, then I keep your profile, reviews and pages working every month. |

**Add-ons** (shown below the ladder as a short list, not as cards):

| id | Name | Price label | One-liner |
|---|---|---|---|
| `extra-page` | Extra service page | Starting at $750 | One more page for a service or area you want to show up for. |
| `lead-pipelines` | Lead Pipelines | Ask me | Quote follow-up and past-customer emails that run in the tools you already use. |
| `advisory-hour` | Advisory hour | [PENDING JP] | An hour on whatever is stuck: vendors, a redesign, a new service. |

`studio-sprint` stays as is and is shown only on `/studios`.

**Rule shown under the ladder:** "Start anywhere. What you pay for one step is credited toward the next if you upgrade within 30 days."

How the credit works: the Tune-Up fee comes off The 30-Day Fix. If a Tune-Up client moves to Growth Advisor instead, the fee comes off their first month(s).

**Pricing and terms**

| id | Launch | After 3 case studies | Terms |
|---|---|---|---|
| `website-review` | Free | Free | — |
| `profile-tune-up` | $450 | $600 | Paid upfront. Credited toward The 30-Day Fix within 30 days. |
| `thirty-day-fix` | $1,250 | $1,500 | 50% upfront and 50% on day 30, or 3 equal monthly payments. Tune-Up fee credited within 30 days. |
| `growth-advisor` | $500/month | [PENDING JP], proposed $650/month | Billed monthly in advance. 6-month minimum. The 30-Day Fix is included with $0 upfront. |

**Growth Advisor early-exit term [PENDING JP]:** if a client cancels before month 4, the rest of The 30-Day Fix is due: $1,250 minus $250 for each month paid. This protects JP from clients who leave right after the setup.

**Guarantee** (all paid offers): "If anything in your plan isn't done by the date I gave you, I keep working at no charge until it is." This is a build guarantee only. Never promise rankings, calls or revenue.

**Results timeline** (used in copy): **Install** in 30 days, **Run** for 60, **Prove** at 90. Results checks happen at 30, 60 and 90 days.

**Execution rule** (update in `CLAUDE.md`, replacing Change 01's rule):
- JP does one-time, templated work himself, plus the light monthly work inside Growth Advisor (about 3 hours per client per month).
- Ads management, social posting, design, logo work and full site rebuilds go to partners, who quote separately and bill the client directly.
- JP edits on any common platform himself: Wix, Squarespace, WordPress, GoDaddy, Shopify, Google Sites.

## 3. Sitemap and nav

| Route | Purpose | In nav | Index |
|---|---|---|---|
| `/` | Homepage (hero A/B test) | — | Yes |
| `/review` | Free Website Review request form | Header button | Yes |
| `/scorecard` | The scorecard, results and email capture (one page, three states) | Footer and hero | Yes |
| `/offers` | Full offer details, add-ons and the offers FAQ | Yes | Yes |
| `/founding-clients` | Founding program with the Tally application. Hidden by flag `showFounding: false`; returns 404 while off | No (while hidden) | No (while hidden) |
| `/about` | About JP (new standalone page; the old `/#about` anchor stays as a short version) | Yes | Yes |
| `/industries/sign-print` | Sign and print shops | Footer "Who I help" | Yes |
| `/industries/hvac` | HVAC companies | Footer, behind flag | **noindex until a first client** |
| `/industries/roofing` | Roofing companies | Footer, behind flag | **noindex until a first client** |
| `/results` | Case studies | Hidden by flag `showResults: false` | No until live |
| `/studios` | White-label Strategy Sprint for design studios (unchanged) | Footer only | Yes |
| `/privacy` | Privacy policy (updated) | Footer | Yes |
| `/terms` | Terms of service (new) | Footer | Yes |
| `/thanks/review` | After the review form | No | No |
| `/thanks/founding` | After the founding application (replaces `/thanks`, which should 301 here). Built but unreachable while `showFounding` is off | No | No |
| `/404` | Not found | No | No |

**Header nav:** 21 Jewel wordmark · How it works (`/#how`) · Offers · About · button **Free Website Review** → `/review`. On mobile the button stays visible next to "Menu."

**Footer, column 1:** 21 Jewel · San Antonio, TX · johnpaul@21jeweladvisory.com · tagline.
**Footer, column 2 ("Who I help"):** Sign and print shops · HVAC (when the flag is on) · Roofing (when the flag is on).
**Footer, column 3:** Scorecard · Offers · For studios · Privacy · Terms.
**Footer, bottom line:** "© 2026 21 Jewel. Independent. Not affiliated with Google."

**Feature flags** (`site.yaml`): `showResults`, `showHvac`, `showRoofing`, `showFounding` (all `false`). When `showFounding` turns on, "Founding clients" goes back into the header nav between Offers and About. Also `foundingSpotsTotal: 5` and `foundingSpotsFilled: [PENDING JP]`, which depends on whether Taylor'd Prints counts as spot 1.

## 4. Page-by-page copy

Copy is final unless marked [PENDING JP]. Keep all copy in YAML.

### 4.1 Homepage (`home.yaml`)

**Hero, variant A**
- Eyebrow: For local service businesses
- H1: More calls from Google. No new software.
- Sub: I fix your Google profile, reviews and website so more searches turn into calls. You spend about 30–45 minutes. I show you your numbers before and after.
- Primary button: Get my free Website Review → `/review`
- Secondary link: Or take the 3-minute scorecard → `/scorecard`

**Hero, variant B**
- Eyebrow: For local service businesses
- H1: Be the shop people call first.
- Sub: Same as variant A.
- Buttons: same as variant A.

Changing the hero copy restarts the hero test. Reset the PostHog experiment and note it in `DECISIONS.md`.

**Sample result card** (right column on desktop, below the copy on mobile). Label: "Example Website Review."
1. Your Google profile's main category doesn't match the service that earns you the most.
2. Requesting a quote on a phone takes 5 taps. It should take 1.
3. Your last Google review was 7 months ago.
- Footer line: "Every review ends with the top 3 fixes, ranked by the calls they're likely costing you."

The card must stay labeled as an example. It is not a real client.

**Section: Sound familiar?** (`PainList`)
- The phone is quieter than it should be for how good your work is.
- Customers find you by word of mouth, almost never Google.
- Your website looks fine, but hardly anyone fills out the form.
- Your last Google review was months ago.
- You've paid someone for "SEO" and never saw what they did.

**Section: How it works** (`#how`, `StageCards`, 3 cards)
1. **Review.** I look at your website and Google profile from the outside and send you the top 3 things costing you calls. Free.
2. **Fix.** I fix them myself, using the tools you already have. You spend about 30–45 minutes with me in total.
3. **Prove.** I save your numbers before I start and show you what changed at 30, 60 and 90 days.

Line below the cards: "Get found → Get chosen → Get called again." [PENDING JP, see §1]

**Section: What you'll need to do**
- Add me as a manager on your Google profile. It takes 2 minutes, and no passwords are shared.
- One 20-minute call so I understand your best jobs and customers.
- Approve the words before anything goes live.
- Text me some photos of your work.
- Closing line: "That's it. I handle the rest."

**Section: Offers** (`OfferLadder`): the four cards from §2, then the credit rule, then the add-ons list. Each card shows name, price label, one-liner and a "See details" link to `/offers#{id}`. The Website Review card's button goes to `/review`.

**Promise strip** (4 short items with icons):
- No new software to pay for
- No passwords shared
- No contracts on project work
- You own everything I set up

**Section: How I measure** (short, links to the offers FAQ)
- Heading: You'll see the numbers, not just a report.
- Body: Before I touch anything, I save your Google profile numbers (calls, direction requests, website clicks), your review count and where you show up on the map for your top searches. Google only shows about six months of profile history, so I keep yours from day one. Then I show you the change at 30, 60 and 90 days.

**Founding band** (`FoundingBand` + `SpotMeter`): **hidden while `showFounding` is off.** Render nothing in its place.
- Heading: 5 founding spots: The 30-Day Fix, free.
- Body: I'm building my first case studies. If your business is a fit, I'll do The 30-Day Fix at no cost in exchange for permission to share the results.
- Spot meter: "{open} of 5 spots open."
- Button: See if you're a fit → `/founding-clients`

**Short about** (`#about`, `AboutBlock`)
- Heading: Hi, I'm JP.
- Body: I spent [PLACEHOLDER: years] years in agency marketing and analytics, measuring what campaigns actually did. I started 21 Jewel because owner-run shops get sold marketing they can't see. I do the work myself, I use the tools you already pay for, and I show you the numbers.
- Link: More about me → `/about`
- Photo: [PLACEHOLDER: headshot]

**Proof slot** (`ProofSlot`): hidden until `showResults: true`.

**Homepage FAQ** (5 items; full FAQ on `/offers`): "Do I have to do anything?", "Do you need my passwords?", "Will I be #1 on Google?", "How will I know it worked?" and "Do I need to buy new software?" Answers are in §4.2.

**Final call to action**
- Heading: Find out what's costing you calls.
- Body: The Website Review is free, takes about 3 minutes to request, and you keep the checklist either way.
- Button: Get my free Website Review → `/review`

### 4.2 Offers (`/offers`)

- H1: Offers and prices
- Intro: Four steps. Start anywhere. What you pay for one step is credited toward the next if you upgrade within 30 days.

**Website Review: Free** (`#website-review`)
- Who it's for: owners who want to know why the phone isn't ringing more, without paying to find out.
- What you get:
  - An outside-in look at your website, your Google profile, and how you show up for 3 searches your customers make.
  - The top 3 fixes, ranked by the calls they're likely costing you.
  - A short video walkthrough or PDF, your choice.
  - A do-it-yourself checklist that's yours to keep.
- What I need from you: your website address, and the 3 services that earn you the most.
- Timeline: within [PENDING JP: 5] business days.
- Button: Get my free Website Review → `/review`
- Note: "No sales pitch. If you'd rather fix things yourself, the checklist is yours."

**Google Profile Tune-Up: Starting at $450** (`#profile-tune-up`)
- Who it's for: owners who want a quick, visible win before a bigger project.
- What you get:
  - A full Google profile cleanup: categories, services, service area, hours, description, photos and Q&A.
  - Your review link turned into a short link and a QR code for invoices, your counter and your trucks.
  - A review request message loaded into the invoicing or booking tool you already use.
  - A before-and-after check of your profile numbers and review count at 30 days.
- Your time: about 30 minutes.
- Timeline: work done within 1 week, results checked at 30 days.
- Terms: paid upfront. Credited toward The 30-Day Fix if you upgrade within 30 days.

**The 30-Day Fix: Starting at $1,250** (`#thirty-day-fix`)
- Who it's for: owners ready to turn Google searches into quote requests.
- What you get:
  - Everything in the Tune-Up.
  - One service page for the service that earns you the most, written and built on your current website, with reviews, photos, one-tap calling and a short quote form.
  - Review reply templates for good and bad reviews, plus a one-line script your team can use to ask.
  - A "How did you hear about us?" question added to your booking or invoicing tool, so you can see where jobs come from.
  - Results checked at 30, 60 and 90 days.
- Your time: about 45 minutes in total.
- Timeline: installed in 30 days.
- Terms: 50% upfront and 50% on day 30, or 3 equal monthly payments.
- Guarantee: if anything in your plan isn't done by day 30, I keep working at no charge until it is.

**Growth Advisor: Starting at $500/month** (`#growth-advisor`)
- Who it's for: owners who want this handled every month without thinking about it.
- What you get:
  - The 30-Day Fix, with $0 upfront.
  - Then every month:
    - Google profile posts and photo updates.
    - Replies to your reviews.
    - One new page or website edit.
    - A short report of calls, clicks and reviews, with your history saved past Google's six-month limit.
    - A 30-minute call.
- Terms: billed monthly in advance with a 6-month minimum. If you cancel before month 4, the rest of The 30-Day Fix is due. [PENDING JP, see §2]

**Add-ons:** extra service page (starting at $750), Lead Pipelines (ask me), advisory hour ([PENDING JP]).

**What I don't do myself:** ads management, social media posting (Facebook, Instagram and similar), logo or design work, and full website rebuilds. If you need one, I'll introduce you to a partner who quotes and bills you directly.

**Offers FAQ** (`FAQ` component, with `FAQPage` JSON-LD)
1. **Do I have to do anything?** About 30–45 minutes in total: add me as a manager, one short call, approve the words, and send photos. I do the rest.
2. **Do you need my passwords?** No. You add me as a manager on your Google profile and your website, and you can remove me anytime.
3. **Will I be #1 on Google?** Nobody can honestly promise that, and you should be wary of anyone who does. I promise the work gets done on time and you see the numbers.
4. **How will I know it worked?** Before I start, I save your profile numbers, review count and map position. Google only shows about six months of profile history, so I keep yours from day one. You see the change at 30, 60 and 90 days. In the 30-Day Fix, I also add a "How did you hear about us?" question so you can tie calls to real jobs.
5. **Do I need to buy new software?** No. Everything runs on the tools you already pay for.
6. **I already have a web person. Is that a problem?** No. I can make the changes myself, or hand your web person exactly what to change.
7. **What website platforms do you work on?** Wix, Squarespace, WordPress, GoDaddy, Shopify and Google Sites. If yours isn't listed, ask.
8. **I don't have a website.** [PENDING JP] Proposed answer: "Start with the Google Profile Tune-Up. If you need a site, I'll introduce you to a partner who builds simple ones, and I'll write the words."
9. **Do you only work in San Antonio?** I'm based in San Antonio and work with local service businesses anywhere in the US.
10. **Can I cancel Growth Advisor?** After the 6-month minimum, yes, anytime with 30 days' notice. Project work has no contract beyond the project itself.
11. **Who owns the work?** You do: your profile, your pages, your reviews and your data. When we're done, you remove my access.

### 4.3 Website Review request (`/review`)

- H1: Your free Website Review
- Intro: Tell me about your business. Within [PENDING JP: 5] business days, I'll send you the top 3 things costing you calls, ranked, and a checklist you keep.
- **How it works:** (1) Fill out the form, which takes about 3 minutes. (2) I review your website and Google profile from the outside. (3) You get a short video or PDF. If you want, we can talk it through on a 20-minute call.
- **Form** (Tally embed or native form posting to Tally):
  - Name *
  - Email *
  - Phone (optional)
  - Business name *
  - Website (optional; "No website yet" checkbox)
  - City or area you serve *
  - The 3 services that earn you the most *
  - How do most of your customers find you today? * (Word of mouth / Google / Repeat customers / Ads / Not sure)
  - Anything else I should know?
  - Format: Video or PDF
  - Turnstile check
- Capacity line [PENDING JP]: "I take [5] reviews a week so each one gets real attention."
- After submit: redirect to `/thanks/review`.
- Kit: add the subscriber with tags `review-requested` and `source-{answer}`.

### 4.4 Scorecard (`/scorecard`, `scorecard.yaml`)

- Name: **Is Your Website Losing You Work?** (unchanged).
- Intro H1: Is your website losing you work?
- Intro body: 12 quick questions about your Google profile, your website and how you follow up. It takes about 3 minutes. You get your score and your biggest leaks.
- New unscored question 0 (used for a Kit tag only): "What kind of business do you run?" Options: sign and print / HVAC / roofing / other trade / other service. Tag: `industry-{value}`.

**Questions** (2 / 1 / 0 points each, 24 max). These replace Change 01's set. The referral question is kept as Q10, and Q12 covers lead source.

| # | Question | 2 points | 1 point | 0 points | Fix shown if 0 or 1 |
|---|---|---|---|---|---|
| 1 | When someone searches your main service and your area, do you show up in the map results? | Yes, top 3 | Somewhere further down | Not sure, or no | Tune your Google profile's categories, services and service area so you show up for the searches that matter. |
| 2 | Is your Google profile's main category the exact service that earns you the most? | Yes | Close, but not exact | Not sure | Set your main category to the service that earns you the most. It's the single biggest profile setting. |
| 3 | When did you get your last Google review? | This month | 1–6 months ago | Longer, or never | Ask for a review after every job, with a link or QR code, so reviews keep coming. |
| 4 | Do you ask every customer for a review? | Every job, automatically | Sometimes | Rarely or never | Put the review request in the tool you already use so it goes out on its own. |
| 5 | Do you reply to your Google reviews? | All of them | Some | No | Reply to every review. Short and personal is fine; templates make it fast. |
| 6 | Does your Google profile have recent photos of your actual work? | Added in the last 3 months | Older photos | Few or none | Add real job photos monthly. They show people what they'll get. |
| 7 | On a phone, can someone call you or request a quote from your homepage in one tap? | Yes | It takes a few steps | No, or not sure | Add a one-tap call button and a short quote form at the top of your homepage. |
| 8 | Does your website have its own page for each main service? | Yes | One page lists everything | No website | Give your top service its own page. That's what shows up when people search for it. |
| 9 | Does the first line of your homepage say what you do and where? | Yes | Sort of | No | Make your first line say what you do and where, for example "Custom signs and banners in San Antonio." |
| 10 | After a job, do past customers hear from you again? | Yes, on a schedule | Now and then | Not really | A simple check-in after the job brings repeat work and referrals. |
| 11 | Do you know how many calls or quote requests you got last month? | Exact number | Rough idea | No idea | Check your Google profile's numbers monthly and keep them, since Google only shows about six months. |
| 12 | Do you ask new customers how they found you? | Every time, and I write it down | Sometimes | Never | Add "How did you hear about us?" to your booking or invoice form. |

**Score bands**

| Score | Band name | Result headline | Body |
|---|---|---|---|
| 0–8 | Losing work | You're probably losing calls to the shop down the street. | The good news: the biggest fixes are usually quick. Start with the top 3 below. |
| 9–16 | Leaking calls | You're doing some things right, but calls are slipping through. | A few fixes would close the gaps. Here are your top 3. |
| 17–24 | Built to win work | You're set up to win work. | Keep it up. Here's where you could still tighten up. |

**Result screen**
- Shows the score bar, the band headline and body, and the 3 lowest-scoring answers with their fix text. Ties are broken by question order.
- If fewer than 3 answers scored below 2, show only those. On a perfect 24, replace the fix list with: "No leaks found. Keep doing what you're doing."
- Button: Want me to check this for you? Get a free Website Review → `/review`
- Email form heading: Send me my results and the fix list.
- Email form fields: email (first name optional).
- Kit tags: `scorecard-{band}` and `industry-{value}`.

**Tests:** update `lib/scorecard.ts` tests for 12 questions, a 24-point maximum, the bands above and the tie-break rule.

### 4.5 Founding clients (`/founding-clients`, `founding.yaml`)

**Hidden at launch.** Build the page and keep this copy in `founding.yaml`, but gate the route, the homepage band and the nav link behind `showFounding: false`. Exclude it from `sitemap.xml` while off. Flipping the flag to `true` brings all three back with no other changes.

- H1: 5 founding spots: The 30-Day Fix, free.
- Intro (as JP): I'm building my first case studies. For 5 local service businesses, I'll do The 30-Day Fix, normally starting at $1,250, at no cost.

**What you get**
- Everything in The 30-Day Fix.
- Results checked at 30, 60 and 90 days.

**What I ask in return**
- Manager access to your Google profile and website.
- About 45 minutes of your time.
- Permission to share your before-and-after numbers. You approve the write-up before anything is published.
- An honest testimonial if it worked, and honest feedback either way.

**Good fit**
- Owner-run local service business.
- You have a Google profile and a website, even if they need work.
- You can reply to a text within a day or two.

**Not a fit**
- Franchises with corporate-controlled profiles.
- Businesses that mainly need ads managed.
- Anyone who wants guaranteed rankings.

**Spot meter:** "{open} of 5 spots open."

**Application** (Tally embed): name, email, phone, business name, website, Google profile link or business name and city, top 3 services, "How do most customers find you today?", "Why now?"

After submitting, redirect to `/thanks/founding`. Kit tag: `founding-applicant`.

**Small print:** Spots are filled in the order applications fit. If yours isn't a fit, I'll tell you why and send you a free Website Review instead.

### 4.6 About (`/about`)

- H1: Hi, I'm JP.
- Body:
  - I spent [PLACEHOLDER: years] years in agency marketing and analytics. My job was measuring what campaigns actually did, not what they claimed.
  - I started 21 Jewel because owner-run shops get sold marketing they can't see. Monthly fees, vague reports, no idea what changed.
  - I work differently:
    - I do the work myself.
    - I use the tools you already pay for.
    - I save your numbers before I start, so we both know what changed.
  - I'm based in San Antonio and work with a small number of businesses at a time.
- **What I believe** (brand values, one line each):
  - **Honest over impressive.** I'll tell you what will and won't help, even if it means a smaller project.
  - **Serve the person, not the project.** Your time matters, so I keep your part to minutes.
  - **Build things that outlast me.** You own everything, and it keeps working after we're done.
- Photo: [PLACEHOLDER: headshot]
- Button: Get my free Website Review → `/review`

### 4.7 Industry pages (`industries.yaml`, one template)

The template sections are: hero → "What your customers search for" → "What I fix" → "Proof" → final call to action. Every page links back to `/offers` and `/review`.

**`/industries/sign-print` (live)**
- H1: More quote requests for sign and print shops.
- Sub: Your customers search for banners, yard signs, vehicle graphics and storefront signs, often with an event date coming up. I make sure they find you and can ask for a quote in one tap.
- What they search for: example searches like "custom banners near me," "vehicle wraps San Antonio" and "yard signs fast." These are examples, not search volumes.
- What I fix:
  - A Google profile that lists your real products.
  - A page for your top product.
  - A quote form that asks for size, quantity and due date.
  - Reviews after every order.
- Proof: "Case study in progress." [PENDING JP: Taylor'd Prints' permission to be named. Never name his corporate clients.]
- Related add-on: Lead Pipelines (quote follow-up).

**`/industries/hvac` (behind the flag, noindex)**
- H1: More calls from Google for HVAC companies.
- Sub: When the AC quits, people search on their phone and call the first company that looks trustworthy. I make sure that's you.
- What I fix:
  - Service area and services on your Google profile.
  - A page for your top service (repair, install or maintenance).
  - Review requests after every call, sent from the field software you already use.
  - One-tap calling.
- Proof: hidden until the first client.

**`/industries/roofing` (behind the flag, noindex)**
- H1: More inspection requests for roofing companies.
- Sub: Homeowners compare roofers on reviews and photos. I make sure yours are current and that requesting an inspection is easy.
- What I fix:
  - Photos of real jobs.
  - Steady reviews.
  - A page for your top service (repair, replacement or inspection).
  - A short inspection request form.
- Proof: hidden until the first client.

### 4.8 Results (`/results`, hidden)

Template for later, one Markdown file per study in `content/case-studies/`:
- Business type and city (name only with written permission)
- Starting point
- What I did
- Numbers at 30, 60 and 90 days (with screenshots)
- Owner quote

Never show estimates as results.

### 4.9 Studios (`/studios`)

No changes. It stays footer-only.

### 4.10 Privacy (`/privacy`, update)

Add these items to the existing policy:
- **The Website Review form:** what's collected and why, stored in Tally and Kit.
- **Cal.com bookings.**
- **Client work access:**
  - Manager access to a client's Google profile and website is used only for the agreed work.
  - Access is removed when the work ends.
  - Saved performance numbers are stored privately and never shared without permission.
- Keep the existing PostHog, Kit, Tally and Turnstile sections.

### 4.11 Terms (`/terms`, new)

Plain-language outline. **[PENDING JP: have a lawyer review before publishing. This is not legal advice.]**
1. **What I provide:** the offer as described on `/offers` at the time of purchase.
2. **Payment:** offer terms per §2, credits within 30 days, and Growth Advisor's minimum and early exit.
3. **The guarantee:** the build guarantee only. No guarantee of rankings, calls, leads or revenue.
4. **Your part:** access, approvals and photos. Delays on your side move the dates.
5. **Ownership:** you own your profile, pages, content and data.
6. **Access:** manager access only. You remove it at the end.
7. **Partners:** partner work is quoted and billed by the partner directly.
8. **Cancellation:** project work is paid as described. Growth Advisor requires 30 days' notice after the minimum.
9. **Contact:** johnpaul@21jeweladvisory.com.

### 4.12 Thank-you pages and 404

**`/thanks/review`**
- H1: Got it. Your review is on the way.
- Body: I'll send it within [PENDING JP: 5] business days to the email you gave me. While you wait, the 3-minute scorecard shows where you stand.
- Link: Take the scorecard → `/scorecard`

**`/thanks/founding`**
- H1: Thanks for applying.
- Body: I read every application myself and will reply within [PENDING JP: 3] business days, yes or no, with a reason.

**`/404`**
- H1: This page isn't here.
- Body: But your free Website Review is.
- Buttons: Get my free Website Review → `/review` · Go home → `/`

## 5. Measurement rules (Google profile data limits)

These rules drive the copy in §4 and JP's delivery checklist. Put them in `docs/measurement.md`.

**Google's limits**
- The Performance view in a Google Business Profile shows about **6 months** of history.
- Downloads from the profile panel cover at most **90 days per report**.
- Google's API, used by third-party reporting tools, returns up to **18 months**.

**Rules**
1. **Day 0, before any change:**
   - Screenshot the Performance view.
   - Export the last 6 months in 90-day chunks.
   - Record the review count and rating.
   - Screenshot the map results for the 3 money searches from 3 spots in the service area.
   - Save it all in the client's folder.
2. **Days 30, 60 and 90:** repeat the same captures. Compare the same-length periods.
3. **Seasonality:** for HVAC and roofing, compare against the same months last year when data exists. Otherwise, say plainly that the comparison isn't seasonal.
4. **Growth Advisor:** export every month so the client's history grows past Google's 6-month window.
5. **Attribution wording:** present calls, clicks, reviews and map position as signs of progress. Claim jobs only when the "How did you hear about us?" field shows them.
6. **Tools:** JP may use a reporting tool on his side. Clients never pay for new software.

## 6. SEO, structured data and analytics

**Titles and descriptions** (`site.yaml`)

| Page | Title | Description |
|---|---|---|
| `/` | 21 Jewel · More calls from Google for local service businesses | I fix your Google profile, reviews and website so more searches turn into calls. San Antonio-based. Free Website Review. |
| `/review` | Free Website Review · 21 Jewel | Get the top 3 things costing you calls, ranked, plus a checklist you keep. Free for local service businesses. |
| `/scorecard` | Is Your Website Losing You Work? · 21 Jewel | 12 quick questions about your Google profile, website and follow-up. Get your score and biggest leaks in 3 minutes. |
| `/offers` | Offers and prices · 21 Jewel | Free Website Review, Google Profile Tune-Up from $450, The 30-Day Fix from $1,250, Growth Advisor from $500/month. |
| `/founding-clients` (when shown) | Founding clients: The 30-Day Fix, free · 21 Jewel | 5 spots for local service businesses. Free 30-Day Fix in exchange for sharing the results. |
| `/about` | About JP · 21 Jewel | Agency and analytics background. I do the work myself, use your existing tools and show you the numbers. |
| `/industries/sign-print` | More quote requests for sign and print shops · 21 Jewel | Google profile, reviews and a quote-ready page for sign and print shops. |
| `/industries/hvac` | More calls from Google for HVAC companies · 21 Jewel | Google profile, reviews and one-tap calling for HVAC companies. |
| `/industries/roofing` | More inspection requests for roofing companies · 21 Jewel | Photos, reviews and an easy inspection request for roofing companies. |

**Open Graph image:** rebuild with variant A's H1.

**JSON-LD**
- `ProfessionalService`: keep, and update the description to the §1 one-liner. `areaServed` stays "San Antonio, TX" and "United States."
- Add an `OfferCatalog` with the four offers and their starting prices.
- `FAQPage` on `/offers` and on `/` (homepage FAQ items only).

**Analytics events** (`lib/analytics.ts`; keep the existing scorecard events)
- `cta_click` {location, target}
- `review_form_submit` {source_answer}
- `founding_apply_submit` (fires only when `showFounding` is on)
- `offer_view` {offer_id}, fired when an offer anchor scrolls into view
- `industry_page_view` {industry}

Retire any event names tied to the old offer ids.

## 7. Removals

After applying, none of these strings may remain in `src/` (search them):
- Old prices: "$950", "$2,500", "$3,450", "$3,500", "$5,000", "$750/month", "$1,250/month"
- "Turn referrals into steady work"
- "How referable"

Also check:
- `lead-pipelines` exists only as an add-on, with no price.
- The old `/thanks` route 301s to `/thanks/founding` (in `_redirects`). While `showFounding` is off, it 301s to `/` instead.

## 8. Pending for JP (add to `TODO-JP.md`)

1. Framework line: "Get found → Get chosen → Get called again," or keep "Get referred → Get hired → Get hired again."
2. Footer tagline: confirm "Strategy that keeps time."
3. Growth Advisor price after case studies (proposed $650/month) and the early-exit formula.
4. Advisory hour rate.
5. Website Review turnaround (proposed 5 business days) and weekly capacity (proposed 5).
6. Founding application reply time (proposed 3 business days).
7. Whether Taylor'd Prints counts as founding spot 1, and his permission to be named.
8. The no-website FAQ answer (§4.2, item 8).
9. Years of experience and a headshot for `/about` and the homepage.
10. A lawyer review of `/terms`.
11. Offer names: confirm "Google Profile Tune-Up" (it avoids sounding like "The 30-Day Fix").
12. When to turn on `showFounding` and show the founding program publicly.

## 9. Done when

- `npm run check && npm run build` pass. Scorecard unit tests pass with 12 questions, a 24-point maximum, the new bands and the tie-break rule.
- Every route in §3 renders, with the right flags and noindex settings.
- With `showFounding: false`: no founding band on the homepage, no "Founding clients" nav link, `/founding-clients` returns 404 and isn't in `sitemap.xml`.
- None of the §7 strings remain.
- Lighthouse mobile is still ≥ 95 in all four categories.
- `DECISIONS.md` and `TODO-JP.md` are updated.

## 10. QA log (Oct 23, 2026)

Update (Oct 23, 2026): founding program hidden behind `showFounding: false` per JP. Nav, homepage band, route, sitemap and analytics event are all gated; no copy removed.

Checked on the second pass:
- Names and prices match everywhere (Tune-Up $450, The 30-Day Fix $1,250, Growth Advisor $500/month, extra page $750).
- No old prices or old headlines remain outside §0 (context) and §7 (removal list).
- Guarantee wording is build-only everywhere. No ranking, call or revenue promises.
- Time claims are consistent: owner time 30–45 minutes, review form about 3 minutes, scorecard about 3 minutes.
- Google profile data limits (about 6 months on screen, 90-day downloads, 18 months via the API) match §5 wherever the copy mentions them.

Fixed on the second pass:
- Hero said "about 30 minutes"; changed to 30–45 to match the offers.
- Final call to action said 5 minutes to request a review; changed to about 3 to match `/review`.
- "No social posting" could be read as excluding Google profile posts, which Growth Advisor includes; clarified as Facebook, Instagram and similar.
- Added how the credit works when a Tune-Up client moves to Growth Advisor.
- Added scorecard behavior when fewer than 3 answers miss, and on a perfect score.
