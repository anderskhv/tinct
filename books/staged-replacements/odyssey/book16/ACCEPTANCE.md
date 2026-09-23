# Book 16 — ACCEPTED 2026-09-23 at `candidate-v3.json`

sha256 `89b3ee4af61c0f97405d4c0dccf67c70767163417888ff947675ae9aaa23c93b`
(`candidate-accepted.json` is a byte-identical copy). Source `source-book16.json` = the
served chapter, derived from PG #1727 (`scripts/pg_source.py`). 45 paragraphs, 1:1 with source.
Starting point: the served modern-en chapter (`live-baseline-book16.json`), repaired
repair-first; `candidate-v1.json` is the reviewed draft (per-paragraph dispositions in
`review-2026-09-23/b16-draft-notes.md`).

| Step | Reviewer | Coverage | Result |
|---|---|---|---|
| Repair draft | Sonnet drafter, repair-first from live | 45/45 | 5 kept, 25 conventions only, 15 repaired ("Good heavens" restored where live had "Damn it"; Cretan; suppliant; insolent; ivy-wood bowls; half-fledged; council; Eumaeus formula) |
| Fidelity, source-based | Independent Opus | 45/45 plus continuity against Books 1–14 | 32 findings, 3 blocking (¶21 "Such as I am, it is I" replaces a tautology that echoed Exodus; ¶22 the nationality question restored; ¶38 Penelope's "break my heart"). All applied |
| Accessibility, candidate only | Fresh Sonnet | 45/45 | 4 findings, 2 blocking (¶21; ¶39 "his blood" ambiguous). All applied; ¶39 adjusted to "that man’s blood" |
| v1→v2 re-verification | Independent Opus | 36 edits in 25 paragraphs | 1 non-blocking (¶22 overlong joined question). Fixed in v3 |
| v2→v3 re-verification | Same | ¶22 | **VERIFIED CLEAN** |

Evidence: `review-2026-09-23/`.


## Edition speech-formula successor(s), now the accepted file: `candidate-v5.json` (2026-09-23)

sha256 `0c34afd1476af6837cbbfbb4cce2442e13008149801f520b8f7af24edaf59b3d`. Butler's speech-closing formulas are aligned edition-wide ("So he spoke", "So they talked"):
- candidate-v3.json→candidate-v4.json ¶29: "While they talked, the ship" → "So they talked, and meanwhile the ship"
- candidate-v3.json→candidate-v4.json ¶36: "His words pleased them, so they rose" → "So he spoke, and his words pleased them well, so they rose"
- candidate-v4.json→candidate-v5.json ¶36: "So he spoke, and his words pleased them well, so they rose immediately" → "So he spoke, and his words pleased them well. They rose immediately"
Independently verified: **VERIFIED CLEAN** (round 2). See `../edition-review-2026-09-23/edition-formula-verify.md`; the edits and their reasons are in the same folder.
