# Acceptance Record — Jerusalem, modern-da whole-edition repair

**Status: ACCEPTED, ready for Codex integration. Not published.**

| Item | Value |
|---|---|
| Package | `books/wip/jerusalem-modern-da-repair/` |
| Branch | `claude/cool-clarke-ngd780` |
| Final candidate sha256 | `6f6cd917ea610763f025623a055b8e043e4398651fe6095c1943f000606b6297` |
| Replaces live sha256 | `c1552e9a9a3a311b75e1d83ee104ff33c71c1a538bf68fd4bfd5d4f000a78223` |
| Independent reviewers | Two rounds: a whole-edition review (`INDEPENDENT-REVIEW.md`) and a targeted confirmatory recheck (`RECHECK.md`), both separate Claude agent instances |
| Review verdicts | Round 1: **DO NOT ACCEPT (yet)** — 10 defects found beyond the 61 originally-claimed fixes. Fixed, plus 2 more found during the required chapter-4 full read. Round 2 (recheck): **ACCEPT** |

## Repair and review history

### Structural fix and initial 61-paragraph retranslation
Merged the spurious 18th-chapter split (same defect the English repair
fixed), completed the "ENHED, ENHED, ENHED!" quote, corrected the
`sections` array. Retranslated the 28 paragraphs already known from the
English repair's review history (chapter 3: 16, 35, 36; chapter 5: 16,
17, 38-60) plus 33 more found by this repair's own 100%-automated
length/digit scan and ~25% manual stride sample.

### Round 1 — whole-edition independent review (`INDEPENDENT-REVIEW.md`)
Confirmed structure, merge seam, and all 61 originally-claimed fixes
correct. Using a deliberately different method (fact/dialogue comparison
across 100% of paragraphs, rather than another length-ratio pass), found
**10 further genuine defects** in paragraphs the repair had left
untouched — dropped closing sentences, fabricated dialogue/motivation,
and one fabrication-by-addition, six of the ten clustered in chapter 4
(the Karin/Halvor courtship storyline), suggesting incomplete coverage
there specifically. Verdict: DO NOT ACCEPT yet; recommended fixing the 10
plus a focused chapter-4 re-read.

### Fix pass
Fixed all 10 confirmed defects, then — per the reviewer's recommendation
— read all 202 paragraphs of chapter 4 in full against the English,
finding **2 more defects of the same class** (a dropped closing sentence,
a dropped causal detail) not caught by either the automated scan or
round 1's sample. Fixed both. Total: 12 paragraphs corrected in this
round, on top of the original 61.

### Round 2 — confirmatory recheck (`RECHECK.md`)
Re-verified all 12 fixed paragraphs against the English: all now
faithful and complete, no duplication or awkward seams at any boundary.
Spot-checked 15 additional chapter-4 paragraphs outside the fixed indices
to confirm nothing else was accidentally altered during the fix pass —
clean. **Verdict: ACCEPT.**

## What "accepted" does not mean

Accepted for integration; not published, not live. Codex owns integration
and the serialized release process per `books/BOOK-TASK-WORKFLOW.md`.

## ADDENDUM (see `books/wip/jerusalem-heading-fragment-fix/`) — superseded hash

The hash above is now historical. A follow-up fix removed 5
heading-fragment paragraphs (G07-jerusalem-04) from this file too.
Current, final, independently re-reviewed hash:

`editions/jerusalem-modern-da.json` sha256
`702f29c4e1ee0785c7cbf72f29b29315154ff2ca82e769fc3ae6d2475449dc2c`
(17 chapters, 1782 paragraphs).

See `books/wip/jerusalem-heading-fragment-fix/RELEASE-PACKET.md` for the
full fix description and `INDEPENDENT-REVIEW.md` for the verification
that nothing else in this file changed.
