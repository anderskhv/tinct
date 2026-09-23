# Book 20 — ACCEPTED 2026-09-23 at `candidate-v3.json`

sha256 `620c69bfc396f1c8a66fb5383bdf106d0a8e7826200656ee7a06befa6902be66`
(`candidate-accepted.json` is a byte-identical copy). Source `source-book20.json` = the
served chapter, derived from PG #1727 (`scripts/pg_source.py`). 36 paragraphs, 1:1 with source.
Starting point: the served modern-en chapter (`live-baseline-book20.json`), repaired
repair-first; `candidate-v1.json` is the reviewed draft (per-paragraph dispositions in
`review-2026-09-23/b20-draft-notes.md`).

| Step | Reviewer | Coverage | Result |
|---|---|---|---|
| Repair draft | Sonnet drafter, repair-first from live | 36/36 | 15 kept, 21 repaired (cloister→gallery ×8 where live had courtyard/colonnades; live's "Furies" back to Erinyes; Oceanus; the dropped sentence "So he prayed" restored; Theoclymenus's vision; "heifer's foot", which Book 22 calls back; Sicels; Diana→Artemis in the title) |
| Fidelity, source-based | Independent Opus | 36/36 plus continuity against Books 3, 16–18 and 22 | 12 findings, 0 blocking. All applied, including Philoetius → Butler's "stockman", which now binds Books 21, 22 and 24. The quote-count differences at ¶7/14/16/27/28 were checked and are legitimate |
| Accessibility, candidate only | Fresh Sonnet | 36/36 | 4 findings, 0 blocking. All applied (¶6 adjusted so it adds nothing) |
| v1→v2 re-verification | Independent Opus | 16 edits in 13 paragraphs | 1 blocking (an added colon at ¶0) and 2 non-blocking (an added semicolon at ¶27; "Someone" → Butler's "any one" at ¶3). Fixed in v3 |
| v2→v3 re-verification | Same | ¶0, 3, 27 | **VERIFIED CLEAN** |

Evidence: `review-2026-09-23/`.

## Edition-consistency successor v4 (2026-09-23), now the accepted file

`candidate-v4.json`, sha256 `e1792c20bec736b4b56cfdac686f2c55eeb0c55f9a9d066907c923d06f6ff378`: ¶21 "mixing bowls" → "mixing-bowls" (Butler's own form; PUNCTUATION §4).
Made in the whole-edition consistency pass (`../edition-review-2026-09-23/edition-consistency-edits.json`, with reasons) and independently verified **VERIFIED CLEAN** (`../edition-review-2026-09-23/edition-consistency-verify.md`).


## Edition speech-formula successor(s), now the accepted file: `candidate-v6.json` (2026-09-23)

sha256 `5439858a09e9d2ffe7d55ab1454a417240942b2c38e985752994ec4ae67c18c2`. Butler's speech-closing formulas are aligned edition-wide ("So he spoke", "So they talked") and Butler's ¶2 omission is restored:
- candidate-v4.json→candidate-v5.json ¶12: "She spoke, and they did exactly" → "So she spoke, and they did exactly"
- candidate-v4.json→candidate-v5.json ¶14: "While they talked, Melanthius the goatherd arrived," → "So they talked. Meanwhile Melanthius the goatherd arrived,"
- candidate-v4.json→candidate-v5.json ¶20: "While they talked, the suitors were plotting" → "So they talked. Meanwhile the suitors were plotting"
- candidate-v4.json→candidate-v5.json ¶31: "He spoke, and they all laughed" → "So he spoke, and they all laughed"
- candidate-v5.json→candidate-v6.json ¶2: "considering how many there are" → "seeing how many of them there always are"
- candidate-v5.json→candidate-v6.json ¶2: "even if Zeus and you help me succeed in killing them, where can I escape to from their families’ revenge afterward?”" → "supposing that with Zeus’s help and yours I succeed in killing them, I must ask you to consider where I am to escape to from their avengers when it is all over.”"
Independently verified: **VERIFIED CLEAN** (round 2). See `../edition-review-2026-09-23/edition-formula-verify.md`; the edits and their reasons are in the same folder.

## Punctuation-convention successor v7 (2026-09-23), now the accepted file

`candidate-v7.json`, sha256 `573dc1cb5a0cfad0dd288feea4395f5bffcd155aa16b425968179104a59d4436`. PUNCTUATION §6: colons the modern text had added before a quotation are replaced with Butler's own mark (comma, full stop or dash). The edits and reasons are in `../edition-review-2026-09-23/edition-colon-edits.json`, independently verified **VERIFIED CLEAN** in `edition-colon-verify.md`.
