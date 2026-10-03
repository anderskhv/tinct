# Alice — integration notes (2026-09-30)

Branch `integration/new-books-alice-wh-middlemarch`. Staged only: the `ALICE_IN_WONDERLAND` constant is in `app/src/data/bookRegistry.ts` but not in `BOOKS`.

Live editions are the pinned package files (original SHA-256 `aec5399b…`, verified equal to `HANDOFF.md`); re-serialised as 2-space JSON like the other editions, text unchanged. 12 chapters, 789 paragraphs, gate PASS re-run on the live paths (weighted 0.528, 0 light/mechanical, 25 of 546 identical long paragraphs = 4.6%, close to the 5% limit).

Open items carried from `HANDOFF.md`: the original is Gutenberg's Millennium Fulcrum Edition 3.0, not the 1865 first impression, so the registry label avoids claiming a first printing; the picture reference at 9:43 and the frontispiece reference at 11:3 remain in the text with no illustrations; verse stanzas and underscore emphasis need a visual check in the reader; verse paragraphs 10:25, 10:26, 10:59, 10:70, 12:45, 12:46 were flagged for extra editorial attention.

The original edition is not chapter-sharded (150 KB).

## Not done

Character sidecar (`characters/identity-proposal.json` has 31 identities, first-mention coordinates but no spoiler-gated card copy), cover art, SEO pages, `audioAvailability.json` entries, review by Anders.

## Update 2026-10-02

Independent editorial review fixes applied and content ACCEPTED (see `HANDOFF.md`, `EDITORIAL-FIXES.md`). Live edition hashes changed: original `eb5d6211…` (4:25 “Why” emendation), modern `ce04a1b4…`. All verse is now verbatim, so the unchanged classifier reports identical long paragraphs 31/546 = 5.7% (GATE FAIL on that measure only); all 31 are verse, prose 0/515, accepted under the documented verse exemption. The 10:25/10:26/10:59/10:70/12:45/12:46 flag is resolved (verbatim). Character asset rebuilt (revision `2026-10-02.1`).
