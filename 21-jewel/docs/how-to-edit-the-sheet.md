# How to change the site from the Sheet

Open **21J Site Content** in Google Sheets. Edit, then **21J → Publish site**. Live in about two minutes.

| I want to… | Tab | What to do |
|---|---|---|
| Change a headline, button label, paragraph, page title or description | `strings` | Find the row (the `page` column says where it lives, the `default` column shows the current text). Type the new text in **value**. Clear the cell to go back to the default. |
| Change a price or an offer's one-liner | `offers` | Edit `price_from` (like `$650`), `price_suffix` (like `/month`) or `one_liner`. Set `active` to FALSE to hide an offer everywhere. |
| Add, reorder or reword an FAQ | `faqs` | Rows with the same `page` make that page's list, sorted by `order`. Set `active` to FALSE to hide one. The first active row for a page replaces that page's built-in list, so keep every question you want shown. |
| Change an industry page's headline, subhead or example searches | `industries` | Edit `h1`, `sub`, or `search_terms` (separate searches with `\|`). `active` FALSE hides the page. |
| Add a testimonial | `testimonials` | One row per quote: `id` (short, like `joe-signs`), `quote`, `name`, `role`, `city`, `active` TRUE. The first active row turns the proof section on. |
| Turn a section or page on or off | `flags` | Set `on` to TRUE or FALSE. Flags: `showFounding`, `showResults`, `showFaq`, `showTerms`, `showAreas`, `showSpanish`, `showClarity`, `showScorecardLink`, `realExamples`. |
| Rename a guide, change its summary, publish or unpublish it | `guides` | Type in `title`, `seo_title` (the short browser title), `description`, or set `draft` to TRUE (hidden) / FALSE (live). Leave a cell blank to use the guide's own value, shown in the matching `default_` column. A filled cell wins even after the guide is rewritten, so clear it when you're done testing. The body text lives on GitHub (next section). |
| Edit the scorecard questions or the founding program copy | `strings` | Rows starting `scorecard.` and `founding.`. |

## Editing a guide's body

Guide bodies are plain text files with Markdown headings, one per guide, in the repo at `21-jewel/src/content/learn/`. To edit one without touching code: open the file on GitHub, click the pencil, change the words, and click **Commit changes**. Cloudflare rebuilds the site in about two minutes. `#` lines are headings, blank lines separate paragraphs, `[words](/path)` makes a link. Leave the block between the `---` lines at the top alone unless you're changing a title; the Sheet's `guides` tab covers those.

## What you can edit, and what stays in the repo

**From the Sheet:** every headline, subhead, paragraph, button label, trust-strip line, pain line, FAQ question and answer, offer name, price and one-liner, industry headline, subhead and search phrasings, testimonial, page title and meta description, scorecard question and fix, founding-program copy, guide title and summary, and every flag.

**In the repo only (on purpose):** links and URLs, ids and slugs, photos, the phone number, email and business name, the order and existence of sections and pages, form fields, the design tokens, and guide bodies (plain-text files on GitHub, see above).

**Before publishing:** **21J → Check for problems** lists any row the site would skip. Publishing with problems is fine; those rows are ignored and the site keeps its current text.

**Rules the Sheet enforces for you**
- Links, ids, slugs, photos, email and phone can't be changed here. Ask Claude Code for those.
- No HTML. No placeholders like `[TBD]`. Nothing longer than 2,000 characters.
- Prices: `$650`, `$1,450`. Flags: `TRUE` / `FALSE`.

**If the Sheet is unreachable** when the site builds, the site uses last night's copy of it. Nothing goes blank.
