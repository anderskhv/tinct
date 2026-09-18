Model: opus

# Chapter 321 — round-two verification (independent)

Files verified:
- predecessor: `ch321-corrected.json`
- round-two: `ch321-corrected-r2.json`
- log: `ch321-corrections-log-r2.md`
- source: `ch321-source.json` (Maude)

## Diff (computed with Python, not read from the log)

Changed paragraph indices: **[12]**. Exactly the one index the log claims. No
unlogged change, no logged change missing.

Structure: `number` 321 unchanged and equal to source; `title`
"Book Fifteen (1812 - 13) — Chapter 4" unchanged and equal to source; paragraph
count 18 → 18, source 18; no empty paragraphs; key set unchanged; JSON parses.

## Per-change verdict

### p12 — footnote slot restored to Maude's English (rule 5)

Source p12: `* Knight without fear and without reproach.`

Before: `(Knight without fear and without reproach.)`
After:  `* Knight without fear and without reproach.`

Correct. The source's footnote is a **translation**, not a gloss, so rule 4's
parenthesised form does not apply; rule 5 governs, because the maxim itself stays
inline at p11. The after text is byte-identical to the source slot, and the slot is
preserved as its own paragraph rather than merged or deleted. `?`/`!` parity 0/0.
**ACCEPT.**

## Convention conformance (p11, the governing dialogue paragraph — unchanged this round)

p11 already reads: "...this man who styled himself chevalier sans peur et sans
reproche, \"the knight without fear and without reproach,\" and who loved to parley
with the French...". That is rule 3 plus rule 5: a quoted maxim kept inline because
the wording is the point, English immediately after, and no `*` marker left dangling
in the paragraph. Source p11 carries the marker ("that chevalier sans peur et sans
reproche * as he styled himself"); the modern-en paragraph correctly carries none.

Regex over all 18 paragraphs: the only `*` in the file is the slot marker at p12 —
matching the source's only `*` paragraph, at the same index. No bracket tag anywhere.

The English now appears twice (inline at p11 and in the slot at p12), which is what
rule 5 accepts: it prevents the *foreign* wording being printed twice, and the slot
must keep Maude's line as it is. Not a finding.

## Reader check

p12 reads as an ordinary footnote line and is now visually marked as one, so a
reader does not mistake it for a stray parenthetical sentence in the narrative.

## edition_checks.py

`python3 books/edition_checks.py war-and-peace --candidate ch321-corrected-r2.json`
→ **0 BLOCK**. No `bracket-tag`, no `footnote-slot-bare`, no
`footnote-orphan-marker` flag for ch321. ch321-scoped flags are seven pre-existing
`long-sentence` entries (p2, p6, p7, p11, p14, p15, p16), none of them at the
changed index and none introduced by this round. Remaining flags are whole-edition
and source-side.

## New findings

None.

Verification: ACCEPT
sha256: 0ed6b2b72f4e6943ffb21a75f3eb9ee998e775350ae82c28026fb790953fbff6
