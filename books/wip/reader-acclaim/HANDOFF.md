# Handoff: reader-acclaim ("Your next book" email content)

- **Status:** content accepted and handed off; **not published**. Content only; no code or live paths were touched.
- **Branch:** `claude/dreamy-faraday-30zl0v`. Instruction revision: `a9d3386a9116` (origin/main at start).
- **Owned path:** `books/wip/reader-acclaim/` only.

## Files
- `cards.json`: 22 book cards and 5 "why read old books" lines, with label, exact quote, source, date, verification level, `recheck` status, binding `qualification`s, and optional `display` and `pre_send_check`.
- `pairings.json`: 19 finished books mapped to 24 next-book suggestions, each with a reason, subject line and classic acclaim reference. Also the eligibility rules and a gap list.
- `email-copy.md`: the template ("finished" and "stalled" openings), card presentation rules and voice rules, with a rendered example.
- `VERIFICATION.md`: fact-check results.
- `research/`: source research (26 and 28 September 2026). The evidence register and matrix are reference material, not send-ready.

## Integration requirements (for the lifecycle-email work)
1. Send only cards with `recheck == "verified"`. Honour `display`, `qualification`, `use` (`listen-only`, `second`, `story`) and `pre_send_check`.
2. Skip any pairing target that is not live, is on a whole-book hold (Macbeth today; see `docs/edition-holds-2026-09-25.md`), or that the reader has already opened. Then fall back to the next target.
3. If the lead card is ineligible, lead with the classic acclaim quote and rewrite the subject to match (pattern in `email-copy.md`).
4. The preheader is the target's library hook (`app/public/lab/library_2/intro-data/{book}.json` `hook.text`). Frankenstein's hook change to "What do we owe the intelligences we create?" is in the Wave 1 brief; use the live value.
5. No photos or likenesses of the people quoted. Nothing implying they endorse Tinct.
6. Frequency and suppression rules are in `email-copy.md`: nothing within 48 hours of reading; at most one lifecycle email every 3 days.

## Open items
- C02 (Tobi): check against the episode audio or the official transcript.
- C05, C14 (Holiday) and C07 (Collison): take screenshots before the first send.
- Gaps with no verified card yet: *Odyssey* (as a target), *Jungle Book*, *Heart of Darkness*, *Jerusalem*, *Niels Lyhne*, Kant, *To the Lighthouse*, *Confessions*, *The Prince*, *Walden*, *Werther*.
