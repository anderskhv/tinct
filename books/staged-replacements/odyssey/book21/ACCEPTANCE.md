# Book 21 — ACCEPTED 2026-09-23 at `candidate-v3.json`

sha256 `32251019456dd6b6d73dd945d4229200b31a620e819feda0d970b319636b87dc`
(`candidate-accepted.json` is a byte-identical copy). Source `source-book21.json` = the
served chapter, derived from PG #1727 (`scripts/pg_source.py`). 42 paragraphs, 1:1 with source.
Starting point: the served modern-en chapter (`live-baseline-book21.json`), repaired
repair-first; `candidate-v1.json` is the reviewed draft (per-paragraph dispositions in
`review-2026-09-23/b21-draft-notes.md`).

| Step | Reviewer | Coverage | Result |
|---|---|---|---|
| Repair draft | Sonnet drafter, repair-first from live | 42/42 | 21 kept, 21 repaired (gallery ×5; stockman; At this; Achaeans restored where live had Greeks; "pavement" where live had "threshold"; handle-holes; cupbearer; mixing-bowl; bard; typography) |
| Fidelity, source-based | Independent Opus | 42/42 plus continuity against Books 1, 18, 19 and 20 | 14 findings, 1 blocking (¶31 formula "kept her son's words in her heart", as in Book 1). All applied |
| Accessibility, candidate only | Fresh Sonnet | 42/42 | 5 findings, 1 blocking. 3 applied: Iphitus named; "stronger than you"; the ¶39 arrow sentence restructured with Butler's "Achaeans" kept (the proposal to change it to "suitors" was rejected under the name rule). Rejected: an added "of Messene"; ¶10, superseded by the fidelity fix |
| v1→v2 re-verification | Independent Opus | 17 edits in 13 paragraphs | 2 non-blocking (¶39: an added semicolon and a lost "for"; ¶0: pronoun and parallelism). Fixed in v3 |
| v2→v3 re-verification | Same | ¶0, ¶39 | **VERIFIED CLEAN** |

Evidence: `review-2026-09-23/`.


## Edition speech-formula successor(s), now the accepted file: `candidate-v5.json` (2026-09-23)

sha256 `d4896082617d79a6bcb46531faefa3ee3c4e3d7b9b5f57d4cf69785eb6f75c75`. Butler's speech-closing formulas are aligned edition-wide ("So he spoke", "So they talked"):
- candidate-v3.json→candidate-v4.json ¶34: "This made them all laugh heartily, which put them" → "So he spoke, and they all laughed heartily, which put them"
- candidate-v4.json→candidate-v5.json ¶34: "in a better mood with Telemachus. So Eumaeus brought" → "in a better mood with Telemachus. Then Eumaeus brought"
Independently verified: **VERIFIED CLEAN** (round 2). See `../edition-review-2026-09-23/edition-formula-verify.md`; the edits and their reasons are in the same folder.
