# Book 11 — ACCEPTED 2026-09-23 at `candidate-v3.json`

sha256 `ab36f39b519dcc5ff8bfb122b0fcf122731ca68ffaa9a3004d94edb5c6651d96`
(`candidate-accepted.json` is a byte-identical copy). Source `source-book11.json` = the
served chapter, derived from PG #1727 (`scripts/pg_source.py`). 54 paragraphs, 1:1 with source.
Starting point: the served modern-en chapter (`live-baseline-book11.json`), repaired
repair-first; `candidate-v1.json` is the reviewed draft (per-paragraph dispositions in
`review-2026-09-23/b11-draft-notes.md`).

| Step | Reviewer | Coverage | Result |
|---|---|---|---|
| Repair draft | Sonnet drafter, repair-first from live | 54/54 | 0 kept, 37 conventions only, 17 repaired, 0 rewritten. Repairs: frame quotation marks restored to Butler's structure; flattened ethnonyms (Greek/Greece → Achaeans/Argives/Danaans/Hellas) restored; dropped words and softened language restored; name drifts corrected. Coordinator: Tiresias (Cast display name, D8) and Bacchus→Dionysus (D5) |
| Fidelity, source-based | Independent Opus | 54/54 plus a continuity read | 23 findings, 5 blocking (¶8 prophecy quotation ×2, ¶8 "your people shall bless you", ¶1 "crossed in love", ¶23 Pollux→Polydeuces). All applied |
| Accessibility, candidate only | Fresh Sonnet | 54/54 | 10 findings, 3 blocking. 8 applied (2 with adjusted wording). Rejected ¶44: the Trojan-prisoners explanation is scholarly interpretation that Butler does not print. Rejected ¶21: superseded by the fidelity fix |
| v1→v2 re-verification | Independent Opus | 31 edits in 20 paragraphs | 1 blocking (¶42: "him" ambiguous after the gloss) and 3 non-blocking (¶3 "so…So"; the "At this," comma at ¶11 and ¶53). All fixed in v3 |
| v2→v3 re-verification | Same | ¶3, 11, 42, 53 | **VERIFIED CLEAN** |

Evidence: `review-2026-09-23/`.

## Edition-consistency successor v4 (2026-09-23), now the accepted file

`candidate-v4.json`, sha256 `42cdf8484f653f363d74647a8dd7eaa04268547f2991c08100ecb9dceb472ba7`: ¶7 "belonging to the sun god" → "belonging to the sun" (Butler: "the sun"; "god" was added).
Made in the whole-edition consistency pass (`../edition-review-2026-09-23/edition-consistency-edits.json`, with reasons) and independently verified **VERIFIED CLEAN** (`../edition-review-2026-09-23/edition-consistency-verify.md`).
