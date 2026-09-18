Model: opus

# Chapter 327 — round-two verification (independent)

Files verified:
- predecessor: `ch327-corrected.json`
- round-two: `ch327-corrected-r2.json`
- log: `ch327-corrections-log-r2.md`
- source: `ch327-source.json` (Maude)

## Diff (computed with Python, not read from the log)

Changed paragraph indices: **[5]**. Exactly the one index the log claims. No
unlogged change, no logged change missing.

Structure: `number` 327 unchanged and equal to source; `title`
"Book Fifteen (1812 - 13) — Chapter 10" unchanged and equal to source; paragraph
count 28 → 28, source 28; no empty paragraphs; key set unchanged (`number`,
`title`, `paragraphs`); JSON parses.

## Per-change verdict

### p5 — restores "and so forth"

Source: "...he would answer with his phrases (which they thought were mere phrases)
about a 'golden bridge,' about the impossibility of crossing the frontier with a
crowd of tatterdemalions, **and so forth**. They had heard all that before."

Before: "...the impossibility of crossing the frontier with a mob of ragged men.
They had heard all that before."

After: "...the impossibility of crossing the frontier with a mob of ragged men,
**and so forth**. They had heard all that before."

Correct, and it answers exactly the omission the round-one verification recorded.
Re-deriving from the source: "and so forth" closes Kutuzov's list of remembered
phrases and does real work — it tells the reader the staff officers are dismissing
an open-ended, familiar litany, not just the two items named. Without it, "They had
heard all that before" refers back to a closed pair; with it, the contempt is for
the whole repertoire, which is Tolstoy's point in the paragraph.

Placement and punctuation match the source: comma before the phrase, inside the
same sentence, immediately after the "tatterdemalions" clause. Nothing else in the
paragraph moved — "golden bridge", "mob of ragged men", the boots-and-supplies
clause, "old and stupid", "military geniuses" are all byte-identical to the
predecessor. No meaning added or sharpened beyond the restored source phrase.
`?`/`!` parity with source: 0/0 → 0/0. **ACCEPT.**

## Reader check

The sentence is long but the restored phrase sits at a natural clause boundary and
makes the following sentence land better. No new obscurity.

## edition_checks.py

`python3 books/edition_checks.py war-and-peace --candidate ch327-corrected-r2.json`
→ **0 BLOCK**. No `bracket-tag`, no `footnote-slot-bare`, no
`footnote-orphan-marker` flag for ch327 (this chapter has no footnote slots in
source or candidate — zero `*` paragraphs in either). ch327-scoped flags are three
pre-existing `long-sentence` entries (p1, p10, p11), none at the changed index and
none introduced by this round. Remaining flags are whole-edition and source-side
(title-sequence, title-duplicate, name-variant).

## New findings

None.

Verification: ACCEPT
sha256: 09ff99362da542dd32e04f6f7af3b9d56b9fbb5f01cbabaf5fbf26c7474713e1
