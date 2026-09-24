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
4. Human spot-check of samples from BOTH auto-accepted and model-resolved
   paragraphs. The validator checks structure only, not meaning.

## Draft data contract — `data/{bookId}-align.json`

```json
{
  "bookId": "hamlet",
  "version": 1,
  "source": "original-en",
  "target": "modern-en",
  "sourceSha256": "<sha256 of served source edition file>",
  "targetSha256": "<sha256 of served target edition file>",
  "minWords": 100,
  "chapters": { "3": { "5": [[0,0],[1,1],[14,11],[41,33]] } }
}
```

- Location: `chapters[<chapter.number>][<paragraph index, 0-based>]`.
- Each pair `[sourceWord, targetWord]` is where a corresponding segment begins in
  each edition. A segment runs to the next pair (or paragraph end).
- **Offset convention:** word index = position in a plain whitespace split
  (`text.split()` / `/\S+/g`) of the served paragraph string. Same space as
  the app's `tokenizeHearingWords` (underscore-emphasis stripping never changes
  token count — `app/src/lab/labEmphasis.tsx`).
- Invariants: first pair `[0,0]`; both columns strictly increasing; indices in
  range. Paragraphs absent from `chapters` fall back to today's mapping.
- **Staleness:** if either edition file's sha256 differs from the recorded
  value, the whole file is ignored (fall back) until regenerated. An editorial
  correction therefore degrades to today's behaviour, never to wrong matches.
  (Open question: per-paragraph hashes instead, so one repair doesn't disable a
  whole book.)

### Open questions before generating at scale

- **Unresolved / one-sided material.** Proposed: optional
  `"gaps": {"<ch>": {"<p>": [["s", from, to], ["t", from, to]]}}` marking
  source- or target-only spans (omitted or added material) so the reader shows
  them as context rather than forcing a pair. Not yet emitted.
- **Finer boundaries in verse drama.** Use speaker labels and verse-line
  offsets (`app/public/data/editions/{bookId}-lines.json`) as extra candidate
  boundaries, since Shakespeare sentences can span many lines.
- Per-paragraph hashes vs whole-file hash (above).

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
