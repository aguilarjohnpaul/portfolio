# Follow-up emails (Change 03 §7.2)

These run from the leads Sheet's Apps Script (`docs/google-sheet/Code.gs`, `followUps_`) every morning at 9 Central, driven by the **Status** column of the **Audits** tab. You change Status by hand. Nothing goes to a lead while Status is `new`, and nothing ever goes out after `followed-up`, `client` or `stop`.

| Status | What happens |
|---|---|
| `new` (default) | Day 5 after the request: a reminder to **you** that the audit is overdue. The lead gets nothing. |
| `delivered` (+ a date in **Delivered on**) | Day 12: email 1 to the lead. Day 30: email 2 to the lead. |
| `followed-up`, `client`, `stop` | Nothing. |

**Your part:** when you send an audit, set Status to `delivered` and put the date in **Delivered on**. When a lead replies, set Status to `followed-up` (or `client`, or `stop` if they ask). **Next touch** always shows what's queued.

Scorecard leads (the `Leads` tab) get no automated follow-ups; the results email already carries the audit offer.

## Email 1, day 12: "Did you get to the three fixes?"

> Hi there,
>
> It's been about two weeks since I sent the audit for **{business}**. Did you get to any of the three fixes?
>
> If you did, I'd like to hear what moved. If you didn't have the time, that's normal, and it's the whole reason Get Found Setup exists: I do the three fixes and the rest of the profile in 10 business days for $650, and you spend about 30 minutes.
>
> Either way, reply and tell me where things stand, or grab 20 minutes here: {cal}
>
> JP · 21 Jewel Advisory · (737) 391-3041 · johnpaul@21jeweladvisory.com

## Email 2, day 30: "How's the phone?"

> Hi there,
>
> A month ago I sent you the audit for **{business}**. Quick check: is the phone any busier?
>
> If yes, good. Keep asking for reviews after every job; that's the part that compounds. If no, the fastest way to find out why is to compare today's numbers with the ones in the audit. I can do that on a 20-minute call: {cal}
>
> If you'd rather I stop checking in, just reply "stop" and I will.
>
> JP · 21 Jewel Advisory · (737) 391-3041 · johnpaul@21jeweladvisory.com

## Changing the copy

Edit `sendFollowUp_` in `Code.gs`, then Deploy → Manage deployments → New version. Keep the "stop" line in email 2.
