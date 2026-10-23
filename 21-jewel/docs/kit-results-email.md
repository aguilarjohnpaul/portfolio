# Kit results email (fallback only)

The site sends emails through the Google Sheet + Gmail script (`docs/google-sheet/Code.gs`). Use this only if you switch to Kit (set `KIT_API_KEY` and remove `SHEET_WEBHOOK_URL`).

Build it in Kit as an automation. **Trigger:** any tag starting `scorecard-` is added (`scorecard-losing-work`, `scorecard-leaking-calls`, `scorecard-built-to-win-work`). **Action:** send this email.

Custom fields the site writes (run `scripts/kit-setup.mjs` once to create them):
`score_total`, `score_max`, `band`, `industry`, `top_fixes`, `hero_variant`.

`top_fixes` holds up to three fixes joined by `||`. Kit uses Liquid, so split it into a list as shown below.

---

**Subject:** Is your website losing you work? Your score: {{ subscriber.score_total }}/{{ subscriber.score_max }}

Hi {{ subscriber.first_name | default: "there" }},

Your score: {{ subscriber.score_total }} / {{ subscriber.score_max }} ({{ subscriber.band }})

{% assign fixes = subscriber.top_fixes | split: "||" %}
{% if fixes.size > 0 %}
Your top fixes:
{% for fix in fixes %}
- {{ fix }}
{% endfor %}
{% else %}
No leaks found. Keep doing what you're doing.
{% endif %}

Want me to check this for you? I'll look at your website and Google profile and send you the top 3 things costing you calls. It's free: 21jeweladvisory.com/review

JP · 21 Jewel · johnpaul@21jeweladvisory.com
