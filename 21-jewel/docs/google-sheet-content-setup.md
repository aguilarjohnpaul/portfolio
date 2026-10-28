# Content Sheet setup (one time, about 15 minutes)

The site's words, prices, FAQs and on/off switches can be edited from a Google Sheet. The Sheet is read when the site builds, so nothing is fetched in a visitor's browser. If the Sheet can't be reached, the site builds from the last nightly copy, and if there is no copy, from the YAML in the repo. You can't break the site from the Sheet: a value it can't use is skipped with a warning.

This is a second Sheet, separate from the leads Sheet (`docs/google-sheet-setup.md`).

## 1. Create the Sheet

1. Sign in to Google as **johnpaul@21jeweladvisory.com** (create a Google account with that address if there isn't one: accounts.google.com → Create account → "Use my current email address instead").
2. Go to sheets.new and name it **21J Site Content**.
3. Share → General access → **Anyone with the link → Viewer**. The build reads it this way. It holds only website copy, nothing private.
4. Copy the Sheet id from the URL: the long part between `/d/` and `/edit`.

## 2. Add the menu

1. Extensions → Apps Script. Delete what's there, paste all of `docs/google-sheet-content/Code.gs`, save.
2. Project Settings (gear) → Script Properties → add `DEPLOY_HOOK_URL` (step 3 below). `PREVIEW_HOOK_URL` and `SITE_URL` are optional.
3. Reload the Sheet. A **21J** menu appears. Run **21J → Set up tabs from site** and approve the permission prompts (Advanced → Go to project → Allow; it's your own script). The tabs fill themselves from the live site.

## 3. Cloudflare

1. Cloudflare → Workers & Pages → `21jewel` → Settings → Variables and secrets → add `SHEET_CONTENT_ID` = the id from step 1.4, for **Production** and **Preview**. It's not a secret, a plain variable is fine.
2. Settings → Builds → **Deploy hooks** → Create: name `Sheet publish`, branch = the production branch. Copy the URL into the `DEPLOY_HOOK_URL` script property.
3. Optional: a second hook on a `preview` branch → `PREVIEW_HOOK_URL`.
4. Deployments → latest → Retry deployment, so the next build reads the Sheet.

## 4. GitHub (nightly copy)

1. Repo → Settings → Secrets and variables → Actions → **Secrets** → `SHEET_CONTENT_ID` = the Sheet id.
2. Same page → **Variables** → `SHEET_SYNC_BRANCH` = the branch Cloudflare deploys from. The job does nothing until this is set.
3. Actions → **Sheet snapshot** → Run workflow once to test. It commits `21-jewel/src/content/snapshot/*.json` when the Sheet changed.

## 5. Test the round trip

1. In the `strings` tab, find `site.brand.tagline` and type a new tagline in the **value** column.
2. **21J → Publish site.** About two minutes later, reload the site footer.
3. Clear the cell and publish again to put it back.

## Good to know

- **Empty value = no change.** The site keeps the YAML default (shown in the `default` column).
- **What can't be edited from the Sheet:** links, ids, slugs, photos, email and phone. Those are repo edits on purpose.
- **Prices** must look like `$650` or `$1,450`. **Flags** must be `TRUE` or `FALSE`.
- **New pages or keys** appear after **21J → Refresh keys from site**. Your values are never overwritten.
- **Local builds** read the Sheet too when `SHEET_CONTENT_ID` is in `.env`; set `SHEET_CONTENT_OFF=1` to skip it.
- **Something looks wrong on the site?** Run **21J → Check for problems**. The build log in Cloudflare lists every skipped row under "Content Sheet".
