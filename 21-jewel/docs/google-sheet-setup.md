# Google Sheet + Gmail setup

The scorecard's email form saves each lead to a Google Sheet. It also emails the visitor their breakdown and sends you an alert. This takes about 10 minutes, and a computer is easier than a phone for the Apps Script steps.

## Which Google account?

- **If johnpaul@21jeweladvisory.com is a Google Workspace account,** sign in as johnpaul@ for every step below. Emails then come from johnpaul@ automatically.
- **If it's hosted somewhere else,** use your Gmail account. First add johnpaul@ in Gmail → Settings → Accounts → **Send mail as** (Gmail walks you through it with your mail host's SMTP details). The script detects it and sends from johnpaul@. Until you do this, emails come from your Gmail address, and replies still go to johnpaul@.

## Steps

1. **Create the Sheet.** Go to sheets.new and name it `21 Jewel scorecard`.
2. **Add the script.** In the Sheet, open Extensions → Apps Script. Delete what's there, paste all of `docs/google-sheet/Code.gs`, and click Save.
3. **Make a secret.** Pick a long random string, about 32 or more letters and numbers. A password manager's generator works. This is a password for the connection, not something to remember.
4. **Add Script Properties.** In Apps Script, go to Project Settings (gear icon) → Script Properties → Add:
   - `WEBHOOK_SECRET` = your secret
   - `ALERT_TO` = the address that should get "New scorecard" alerts (optional)
5. **Run setup once.** Back in the Editor, pick `setup` in the function dropdown and click **Run**. Approve the permission prompts: Google warns "unverified app" because it's your own script. Choose Advanced → Go to project → Allow. This creates the `Leads` tab and header row.
6. **Deploy as a web app.** Click Deploy → New deployment → type **Web app**:
   - Execute as: **Me**
   - Who has access: **Anyone**

   Click Deploy and copy the **Web app URL**. It ends in `/exec`.
7. **Connect Cloudflare.** In your Pages project, go to Settings → Variables and Secrets → Production and add:
   - `SHEET_WEBHOOK_URL` = the `/exec` URL (**Secret**)
   - `SHEET_WEBHOOK_SECRET` = the same secret from step 3 (**Secret**)

   Then open Deployments, and from the latest deployment's **⋯** menu choose **Retry deployment**.
8. **Test.** Take the scorecard on the site with your own email. Within a minute you should see:
   - a new row in the `Leads` tab,
   - the breakdown email in your inbox,
   - a "New scorecard" alert.

## Good to know

- **Limits:** a free Gmail account can send to about 100 recipients a day, and Workspace allows about 1,500. Each lead uses 2 (the breakdown plus your alert). To stop alerts, delete the `sendAlert_(...)` call in `doPost`.
- **If an email fails,** the row is still saved with "failed: …" in the Email status column, and the visitor sees "try again in a minute."
- **Changing the script:** after editing, go to Deploy → Manage deployments → pencil icon → Version: New version → Deploy. The URL stays the same.
- **Changing the email wording:** it's in `sendBreakdown_` in the script.
- **Deleting someone's data:** delete their row in the Sheet. That's all the site stores.
- **Moving to Kit later:** set `KIT_API_KEY` and remove `SHEET_WEBHOOK_URL`. The site switches automatically, and the Tags column already matches Kit's tags.
