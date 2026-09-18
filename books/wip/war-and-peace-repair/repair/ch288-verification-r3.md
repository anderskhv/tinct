Model: opus

# Chapter 288 — round-three verification (independent)

Files verified:
- predecessor: `ch288-corrected-r2.json`
- round-three: `ch288-corrected-r3.json`
- log: `ch288-corrections-log-r3.md`
- source: `ch288-source.json` (Maude)

## Diff (computed with Python, not read from the log)

Changed paragraph indices: **[8, 9]**. Exactly the two indices the log claims. No
unlogged change, no logged change missing.

Structure: `number` 288 unchanged and equal to source; `title`
"Book Thirteen (1812) — Chapter 9" unchanged and equal to source; paragraph count
18 → 18, source 18; no empty paragraphs; key set unchanged (`number`, `title`,
`paragraphs`); JSON parses.

## Per-change verdicts

### p8 — orphan footnote marker replaced by the inline English (rule 3)

Source: "...should enter Moscow à la maraude * to obtain provisions for themselves..."

Before: "...entering Moscow à la maraude * to obtain provisions..."
After:  "...entering Moscow à la maraude (as looters) to obtain provisions..."

Correct. The French stays inline — this is Napoleon's own decree term, the case
rule 3 covers — and the English follows immediately. The stray `*`, which in
modern-en pointed at nothing a reader could use, is gone. Nothing else in the
sentence moved: word order, "take turns entering", "so that the army might have
its future provided for" are all as in r2. `?`/`!` parity with source: 0/0 → 0/0.
**ACCEPT.**

### p9 — footnote slot restored to Maude's English (rule 5)

Source: `* As looters.`

Before: `* (As looters.)`
After:  `* As looters.`

Correct. Rule 5 applies: the foreign wording stayed inline at p8, so the slot keeps
Maude's English footnote **as it is**, not a parenthesised gloss (rule 4's
parenthesised form is only for slots that gloss rather than translate). The after
text is byte-identical to the source slot. **ACCEPT.**

## Convention conformance

- Foreign wording inline only where the wording is the point: yes (p8, decree term).
- English immediately after the French: yes.
- Slot preserved, never deleted or merged: yes, p9 still the only `*` paragraph,
  matching the source's only `*` paragraph at the same index.
- No orphan `*` left in the dialogue paragraph: confirmed by regex over all 18
  paragraphs — the only `*` in the file is the slot marker at p9.
- No bracket tag anywhere in the chapter.

## Reader check

p8 now reads cleanly: a reader who does not know French gets "as looters" in place,
without hunting for a footnote. p9 reads as a plain footnote line.

## edition_checks.py

`python3 books/edition_checks.py war-and-peace --candidate ch288-corrected-r3.json`
→ **0 BLOCK**. No `bracket-tag`, no `footnote-slot-bare`, no
`footnote-orphan-marker` flag for ch288. The only ch288-scoped flag is
`long-sentence ch288 p7: 62 words`, which is pre-existing and untouched by this
round. All other flags are whole-edition and source-side (title-sequence,
title-duplicate, name-variant).

## New findings

None.

Verification: ACCEPT
sha256: 4e3703f2fa78788749aa55be67c77d572421b640b6c6214b5c28cc3b676ed02b
