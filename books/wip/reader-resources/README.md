# Reader resources: proposal (30 September 2026)

A per-book "Resources" tab: links out to the best videos, podcasts, essays, X posts, TikToks and, later, Reddit threads. The first batch covers nine featured books. `resources.json` lists only items whose URL, creator and channel were checked by fetching them. Status: **approved by Anders; every listed item goes in.** Content only; no code.

## How the tab should behave (for integration)
- **One simple list per book, with no before/during/after grouping.** Items with `has_spoilers: true` get a small "Spoilers" tag.
- **Links open outside the app.** Don't embed third-party players. Show the type, creator, length and a one-line "why".
- **Labels are neutral.** Nothing may imply the people or channels endorse Tinct. Anders decided not to filter anyone for controversy.
- Honour each `pre_publish_check` (missing lengths or dates, or links still to be supplied) before items go live.

## Gaps
- **Reddit:** not researched. reddit.com is blocked from the cloud environment.
- **David Deutsch's X posts on Frankenstein** (the parenting point): the URLs are not yet found; the Conversations with Tyler remark stands in for now.
- **Tobi Lütke's Meditations clip on X:** needs the URL.
- **BBC In Our Time** has no episode on Pride and Prejudice or Jekyll and Hyde.
- **Nabokov's Jekyll lecture** is still in copyright, and no legitimate free copy was found.
