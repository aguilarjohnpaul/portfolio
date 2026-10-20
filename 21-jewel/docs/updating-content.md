# Updating content

All words on the site live in `src/content/*.yaml`. All colors and sizes live in `src/styles/tokens.css`. You shouldn't need to touch anything else for everyday changes.

| To change | Edit | Field |
|---|---|---|
| Prices | `offers.yaml` | `price_from` on each offer, for example `"$750"`. Empty shows "Pricing on request". |
| Monthly price label | `offers.yaml` | `price_suffix: /month` on the advisor offer |
| Hero headlines | `home.yaml` | `hero.variants.a` and `hero.variants.b` |
| Founding spots taken | `site.yaml` | `founding.filled` (0 to 5). At 5 the site switches to the waitlist. |
| Hero test winner | `site.yaml` | `heroTest.winner: "a"` or `"b"` |
| Cal.com link | `site.yaml` | `links.cal` |
| Tally form | `site.yaml` | `links.tally` |
| Your photo | put `jp.jpg` (4:5) in `public/`, then `home.yaml` | `about.photo: /jp.jpg`, and set `about.photo_alt` to something like "JP, founder of 21 Jewel" |
| Years of experience | `home.yaml` | replace `[X]` in `about.paragraphs` |
| Scorecard wording | `scorecard.yaml` | question `text` and `fix`. Keep 12 questions and 4 options each. |
| Page titles for Google | `site.yaml` | `seo.pages` |
| A testimonial | `testimonials.yaml` | add an entry (see the example in the file) |
| A case study | `src/content/case-studies/` | copy `example.md`, fill it in, set `published: true` |

If you make a typo in a YAML field name, `npm run build` fails and tells you which field. That's on purpose.

After any change: `npm run check && npm run build`, then commit and push. Cloudflare Pages deploys `main` automatically.
