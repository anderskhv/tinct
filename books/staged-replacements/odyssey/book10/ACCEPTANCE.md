# Book 10 — ACCEPTED 2026-09-23 at `candidate-v3.json`

sha256 `529e49dddfeef32d43b65a2c691d3d4d086b4422a3a6cb20b32b2616dd6fa151`.
`candidate-accepted.json` is a byte-identical copy.

- **Source:** `source-book10.json`. `scripts/pg_source.py` confirms it derives from PG #1727 and is identical, character for character, to the served chapter.
- **Structure:** 49 paragraphs, 1:1 with the source.

## The review behind this acceptance

The draft `candidate-v1.json` (`eedb949e…`) was frozen on 2026-09-13 and had never been reviewed.

The only earlier independent review of Book 10 covered a *different* text: the 2026-09-11 pilot (`6a5e9ef6…`, branch `claude/review-book10-opus`, copied here as `review-2026-09-23/pilot-book10-findings.md`). This round checked every pilot finding against v1:
- All 3 must-fix findings and all 23 worth-improving findings are absent from v1.
- Of the chapter-level findings, only "woollen" survived; it is fixed in v2.

| Step | Reviewer | Coverage | Result |
|---|---|---|---|
| Fidelity, source-based | Independent Opus | 49/49 paragraphs, in packets with context, plus a whole-Book continuity read and a check against the pilot findings | 11 findings, 0 blocking. All applied in v2 |
| Accessibility, candidate only | Fresh Sonnet, blind to the source | 49/49 | 14 findings, 0 blocking. 11 applied (3 with adjusted wording). Rejected: the "nymph"/"sun-god" addition at ¶12, which Butler does not print; the "reprimand" continuity note at ¶36, which is Butler's own wording; "girdle", already fixed by the fidelity round |
| v1 → v2 re-verification | Independent Opus | 22 edits in 17 paragraphs | 2 blocking convention defects introduced by the edits (a spaced dash at ¶7 and a lost parenthesis at ¶42, PUNCTUATION §6), plus 1 non-blocking one (¶21 "first … first"). All three fixed in v3 |
| v2 → v3 re-verification | Same verifier | ¶7, ¶21, ¶42 | **VERIFIED CLEAN** |

Evidence is in `review-2026-09-23/`.
