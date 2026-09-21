# Acceptance Record — The Comedy of Errors (`comedy-of-errors`, modern-en)

**Title:** The Comedy of Errors
**Book ID:** `comedy-of-errors` (staging directory: `green-comedy-of-errors`)
**Author:** William Shakespeare
**Source:** `books/wip/green-comedy-of-errors/source.json` — original-English
edition, 11 chapters (Act 1 Scene 1 through Act 5 Scene 1), 690 paragraphs.
**Candidate:** `books/wip/green-comedy-of-errors/candidate.json` —
modern-English rendering, staged from live app edition files. Same chapter
count, same paragraph count per chapter (14, 31, 43, 87, 69, 69, 47, 39, 32,
99, 160 = 690 total), same order/indices as source. Verified by structural
diff, not by trusting the drafter's notes.

## Review coverage

| Stage | Scope | Result |
|---|---|---|
| Structural check | All 11 chapters, JSON validity, chapter/paragraph counts vs. source | Clean |
| Round 1 — accessibility review (blind) | All 690 paragraphs, candidate-only, no sampling | "Substantially accessible" — 8 optional-polish spots identified, none blocking |
| Round 1 — fidelity review (packeted, vs. source) | All chapters in ~5-10 paragraph packets with neighbor context (`fidelity-review-1-acts-1-3.md`, `fidelity-review-1-acts-4-5.md`) | ACCEPT WITH FIXES REQUIRED — 1 possible-blocking defect, 3 non-blocking notes |
| Fix pass | Ch9 p3 (directional inversion in Dromio's "old Adam" joke), Ch3 p40 (removed unlicensed editorializing addition) | Both applied via scoped edits, no other paragraphs touched |
| Final verification — fix spot-check | Re-derived both fixed paragraphs directly from source with neighboring context | Ch9 p3 fix confirmed correct against the "What! thou mean'st an officer?" follow-up (Dromio is describing an encounter with the sergeant, not an escape from him); Ch3 p40 fix confirmed as clean removal of only the added editorial clause, full Adriana speech content otherwise intact and complete |
| Final verification — whole-book non-sampled pass (Protocol steps C/D) | All 11 chapters, source-vs-candidate re-read for cross-boundary fidelity (twin-pair speaker attribution, wordplay/pun preservation, act/scene-boundary integrity) plus a fresh candidate-only accessibility read as a first-time general-adult reader | Clean — no cross-boundary defects, no repeated/dropped content at boundaries, all twin pairs (Antipholus/Dromio of Syracuse vs. of Ephesus) correctly and consistently speaker-attributed throughout, including the door-lock scene (Ch5) and the final recognition scene (Ch11); wordplay preserved (Time/baldness exchange, Dromio's "world map" geography joke, "why"/"wherefore" pun, final "mirror, not brother" line); accessibility read found no new blocking issues |

## Defect counts by round

- Structural check: 0 defects.
- Round 1 accessibility: 0 blocking, 8 optional-polish flags.
- Round 1 fidelity: 1 possible-blocking defect (Ch9 p3 directional inversion), 3 non-blocking notes (including Ch3 p40 unlicensed addition).
- Fix pass: 2 paragraphs corrected (Ch9 p3, Ch3 p40).
- Final verification: 0 defects found in fix spot-check or whole-book pass.

## Deliberately preserved non-blocking items

The following are known, reviewed, and intentionally left as-is — flags for
possible future polish, not defects:

1. **Ch1 p6** — dense pronoun/referent tracking across the two sets of twin
   boys in Egeon's shipwreck narrative (one long unbroken paragraph).
2. **Ch2 p13** — "Here comes the almanac that tells my exact age" lands a
   beat late on first read.
3. **Ch2 p30** — "...and many other such permissive sins" — grammatically
   awkward phrasing in an otherwise crisp list.
4. **Ch4 p13** — "sport" used as an intransitive verb, minor period usage.
5. **Ch6 p50** — Spanish Armada allusion under the "hot breath of Spain"
   joke not accessible without period context; comprehension survives.
6. **Ch6 p52** — related historical/geographic allusion cluster in the
   Nell "world map" joke.
7. **Ch8 p22** — idiom pileup around the chain/bond wordplay.
8. **Ch11 p146** — extended thirty-three-year "labour"/childbirth metaphor
   in the Abbess's closing speech, inherent to the source text.
9. **Ch6 p68** — word choice "vain" rendered as "silly."

None of these were found worse on re-read during this final pass; all
remain non-blocking.

## Final hash

```
sha256sum candidate.json
5d00ae65df86709d93c51a10f8d6643a29344641ec467f421e7bf69df7574bcd  candidate.json
```

**Date:** 2026-09-21

**Verdict:** ACCEPTED.
