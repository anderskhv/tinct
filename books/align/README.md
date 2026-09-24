# Edition alignment (compare-flip precision) — PILOT

Status: **pilot, format is a draft for review.** Nothing in the app reads these
files yet. Outputs stay under `books/align/` until the format is agreed and the
app integration (Codex) is scheduled.

## Why

The mobile compare flip maps only the *start* of the main page, and inside a
long paragraph it guesses by proportional position. In drama and loose
paraphrases that lands lines away (Hamlet 1.3: "goes withal" → "He can't just
choose for himself", ~5 verse lines early). This data gives the reader
sentence-group correspondences inside long paragraphs so the compare page can
show the passage equivalent to the whole main page (start and end).

## Pipeline

1. `build_alignment.py <bookId>` — deterministic, zero spend. Sentence split +
   monotonic DP scored on shared content words and length ratio. Only paragraphs
   with ≥100 words in either edition (shorter ones fit a phone page; the
   paragraph anchor already suffices). Weak segments are written to a review
   file with `--review-out`.
2. Model pass (Claude Code helper agent, subscription, one at a time) resolves
   only the review file into `overrides/{bookId}.json`.
3. Re-run step 1: overrides are merged and structurally validated.
4. Review report (`review_report.py`) samples auto-accepted (random and
   hardest), model-corrected, and unresolved segments. Checks so far are
   model review, not human verification. The validator checks structure
   only, not meaning.

## Data contract (format version 1)

Defined in [`HANDOFF-codex.md`](HANDOFF-codex.md#data-contract-format-version-1):
edition IDs, sha256 fingerprints of both complete edition files, stable
locations (chapter number + 0-based paragraph index), whitespace-word offsets,
segment kinds `m`/`u`/`s`/`t`, per-paragraph review status, and
`approved: null` until a person signs a book off. Consumers ignore files that
are unapproved or whose fingerprints don't match the served editions.

First-pass data is always marked: paragraphs are `auto` / `auto-flagged`, the
file is `reviewState: "first-pass"` while any unreviewed paragraph remains.
Weak first-pass spots become `u`; nothing is forced into a match.

Files: `build_alignment.py` (first pass, merge, validate),
`test_build_alignment.py`, `review_report.py` (review samples),
`HELPER_PROMPT.md` (model pass instructions), `overrides/` (model/human
reviews), `data/` (outputs), `review/` (reports).

## Pilot results (2026-09-24)

| Book | Long paras | Flagged by pass 1 | Model-resolved | Spot-check |
|---|---|---|---|---|
| hamlet | 65 | 20 (7.6k words) | 20, one helper, ~111k tokens total | 2/2 flagged paras correct line-by-line |
| on-liberty | 113 | 0 | — | modern-en is a light edit; sample correct |
| walden | 347 | 0 | — | 2 random paras correct |
| confessions | 443 | 1 | — | 2 random paras correct |
| frederick-douglass | 118 | 7 | not run | — |
| genealogy-of-morals | 99 | 2 | not run | — |
| peloponnesian-war | 799 | 0 | — | not sampled |
| utilitarianism | 84 | 0 | — | not sampled |

Finding: for English-original prose the modern edition is a light edit and pass
1 is sufficient; model cost concentrates in loose paraphrases (Shakespeare).
