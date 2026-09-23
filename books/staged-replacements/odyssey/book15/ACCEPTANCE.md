# Book 15 — ACCEPTED 2026-09-23 at `candidate-v3.json`

sha256 `804bc035dd8440e5457bf590e3cd8e1af9c74760f59bd6f90b6a430891d1cad5`
(`candidate-accepted.json` is a byte-identical copy). Source `source-book15.json` = the
served chapter, derived from PG #1727 (`scripts/pg_source.py`). 48 paragraphs, 1:1 with source.
Starting point: the served modern-en chapter (`live-baseline-book15.json`), repaired
repair-first; `candidate-v1.json` is the reviewed draft (per-paragraph dispositions in
`review-2026-09-23/b15-draft-notes.md`).

| Step | Reviewer | Coverage | Result |
|---|---|---|---|
| Repair draft | Sonnet drafter, repair-first from live | 48/48 | 16 paragraphs actually repaired (the drafter's notes claimed 19), the rest conventions only. Fixed: live had Antinous where Butler has Eurymachus (¶1); Hellas and Achaeans restored; Ctesius; Oicleus; Aurora→Eos; Erinys; hawser; "flying islands"; "a god" |
| Fidelity, source-based | Independent Opus | 48/48 plus continuity against Books 2, 3 and 9–13 | 25 findings, 6 blocking ("lashed"; the chariot line "readily enough", identical to Book 3; "as surely as that he ever lived" restored as an affirmation; "murdered" not softened; an invented "official capacity" removed; no comma after "At this"). All applied, including the Eos gloss |
| Accessibility, candidate only | Fresh Sonnet | 48/48 | 5 findings, 1 blocking (the ¶19 "He" = Polypheides). 4 applied, 2 with wording adjusted to keep Butler's images. "Dawn" for Eos was superseded by the fidelity gloss |
| v1→v2 re-verification | Independent Opus | 29 edits in 15 paragraphs | 1 blocking: a ¶9 run-on created by the accessibility edit. Fixed in v3 |
| v2→v3 re-verification | Same | ¶9 | **VERIFIED CLEAN** |

Evidence: `review-2026-09-23/`.

## Edition-consistency successor v4 (2026-09-23), now the accepted file

`candidate-v4.json`, sha256 `a2b75e42e0d77b387616e1b7bfd51118b590075b273dc2cb8c76c1e8c86ec368`: "mixing bowl" → "mixing-bowl" at ¶7 (×2) and ¶8 (PUNCTUATION §4 table).
Made in the whole-edition consistency pass (`../edition-review-2026-09-23/edition-consistency-edits.json`, with reasons) and independently verified **VERIFIED CLEAN** (`../edition-review-2026-09-23/edition-consistency-verify.md`).


## Edition speech-formula successor(s), now the accepted file: `candidate-v5.json` (2026-09-23)

sha256 `78d1d95921a68a3dfcb51f6647b29b54fce691d11c2ddf19672a45583d1339ec`. Butler's speech-closing formulas are aligned edition-wide ("So he spoke", "So they talked"):
- candidate-v4.json→candidate-v5.json ¶19: "They did as he said and went aboard." → "So he spoke, and they did as he said and went aboard."
Independently verified: **VERIFIED CLEAN** (round 2). See `../edition-review-2026-09-23/edition-formula-verify.md`; the edits and their reasons are in the same folder.
