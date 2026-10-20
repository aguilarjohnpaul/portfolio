# Kit results email

Build this in Kit as an automation: **Trigger:** tag added, `scorecard-complete`. **Action:** send this email.

Custom fields the site writes (run `scripts/kit-setup.mjs` once to create them):
`score_total`, `score_referred`, `score_hired`, `score_again`, `band`, `weakest_stage`, `top_fixes`, `team_size`, `business_name`, `hero_variant`.

`top_fixes` holds the three fixes joined by `||`. Kit uses Liquid, so split it into a list as shown below.

---

**Subject:** Your referability score: {{ subscriber.score_total }}/100

Hi {{ subscriber.first_name | default: "there" }},

Here's your breakdown.

Get referred: {{ subscriber.score_referred }} · Get hired: {{ subscriber.score_hired }} · Get hired again: {{ subscriber.score_again }}

Your biggest leak is **{{ subscriber.weakest_stage }}**. Start with these three fixes:

{% assign fixes = subscriber.top_fixes | split: "||" %}
{% for fix in fixes %}
- {{ fix }}
{% endfor %}

If you'd like help putting these in place, I'm taking on a few founding clients at no cost in exchange for a case study: 21jeweladvisory.com/founding-clients

JP · 21 Jewel · johnpaul@21jeweladvisory.com

---

Test it: take the scorecard on the live site with your own email, then check the subscriber in Kit has the fields and tags filled in and that the email arrives.
