# Acceptance Record: Utilitarianism (Mill), modern-en repair

- **Book id / edition:** `utilitarianism` / `modern-en`
- **Date:** 2026-10-06
- **Status:** **CONTENT ACCEPTED / HANDED OFF.** Not published.
- **Branch:** `claude/inspiring-ritchie-zi00fu`
- **Instruction revision used:** `origin/main` at `4a11ebf7f84334212233f69e1fb2575958648592`; style notes and the gate are the ones on that revision.
- **Owned path:** `books/wip/utilitarianism-modern-en/` only. No app, registry, live-edition, character-file, modern-da, audio or tooling file was touched.

## Problem and result

The served modern-en was the public-domain source text with spelling and a few word swaps (too close to the original to count as a modernization under the repository gate).

| Measure (unmodified `books/classify-modern-en.py --gate`, scratch mirror) | Result | Limit |
|---|---|---|
| Weighted similarity | **0.721** | <= 0.75 |
| Light + mechanical chapters | **0/5 = 0.0%** | <= 5% |
| Identical long paragraphs | **0/94 = 0.0%** | <= 5% |
| Truncated quotations / scaffolding | 0 / 0 | 0 |
| Words per sentence (paragraphs over 25 words) | source 39.8, served modern-en 34.7, candidate **24.5** | |

Full gate output is in `GATE-OUTPUT.txt`. It was produced by the unmodified gate script running against a scratch mirror that contains the candidate in place of the live file; re-run `python3 books/classify-modern-en.py utilitarianism --gate` after integration.

## Pinned inputs

| File | Role | sha256 |
|---|---|---|
| `source-original-en.json` | Fidelity anchor. Byte-identical to the served `original-en` at `4a11ebf7` | `29360c7dbdc7de58c0b4e5794df9dfca5b9ca0199644499f45663130ea3c3acf` |
| `baseline-live-modern-en.json` | Starting point. Byte-identical to the served `modern-en` at `4a11ebf7` | `7457e909ce911b5043c692ccf51e7ce30266b5824aec22c10997931dfb737361` |

## Accepted candidate

**`candidate.json`, sha256:**
```
534c43afa8af1f7dea12997361cd568a0569261d241e72c3fd6f961950a26fa1
```

- **Serialization:** identical to the live file (`json.dumps(indent=2, ensure_ascii=False)`, no trailing newline); drop-in replacement for `app/public/data/editions/utilitarianism-modern-en.json`.
- **Structure:** 5 chapters, 94 paragraphs. Chapter order, titles and per-chapter paragraph counts are identical to both served editions, so saved places, highlights and notes map 1:1 with no migration.
- **Length:** 26,768 words (source 27,499).
- **Changed against the live modern-en:** 94 of 94 paragraphs (`changed-paragraphs.json`). 0 paragraphs are identical to the source, which are mostly quotations, verse, citations, stage directions and short lines the style note keeps verbatim.

## How it was made

1. **Style note.** `STYLE-NOTE.md`, written for this book (fixed technical terms, quotation handling, markers, typography, things that must not happen).
2. **Rendering.** The book was cut into slices (never splitting a paragraph) and rendered by parallel helpers following `process/RENDER-INSTRUCTIONS.md`. The first pass of this book came back too close to the source (gate similarity 0.81 to 0.94), so the whole book was re-rendered from scratch after the render instructions gained a depth requirement (rework sentence structure, not only vocabulary). The numbers above are for the final candidate; the first attempt was not kept.
3. **Independent review.** Every paragraph was reviewed once by a helper that did not write it (`process/REVIEW-INSTRUCTIONS.md`). 94 paragraphs were checked and **8 were failed** and corrected with minimal replacements (`reviews/*.review.json`, merged in `reviews/fixes-merged.json`).
4. **Fresh verification.** Every corrected paragraph was re-checked by a different fresh helper (`process/VERIFY-INSTRUCTIONS.md`; `reviews/V*.result.json`): 8 passed, 0 failed (and the failing ones were replaced by the verifier's minimal fix, which is what is in the candidate).
5. **Checks on the final candidate:** the whole-book gate above, structure comparison against both served editions, serialization comparison, dropped-ellipsis check (source ellipses dropped by the candidate: 0), hash comparison of the pinned inputs against `origin/main`.

## Character package impact

42 modern-en mentions: 0 unchanged, 42 moved (proposed re-anchors), 0 need a ruling (`character-card-impact.json` lists only the moved or unresolved ones). Pin check: character file's pinned modern-en sha matches the served live file.

## Open issues (recorded, not blocking acceptance)

1. **Review depth.** Each paragraph was fidelity-reviewed once by a helper other than its renderer, and every correction was re-verified by a fresh helper. Beyond the gate and structure checks I did not re-read the full text myself, and the verification covers corrected paragraphs only (unflagged paragraphs were not read twice). Renderers reported that they did not always do a second full pass against the source.
2. **Per-batch gating** was not run; only the whole-book gate on the final candidate.
3. **Silent source corrections.** Renderers corrected obvious source typos and damage without marking them in the text. The places they reported are listed below; any others were not reported.
4. **modern-da is stale** relative to the new modern-en (Danish is withdrawn; no new Danish was made). Do not present it as tracking the new modern-en.
5. **Audio.** Changed paragraphs invalidate prepared narration for this edition (see RELEASE-PACKET.md).
6. **Tooling.** `books/classify-modern-en.py` raises a NameError on misaligned paragraph counts; `books/audit-truncation.py` has a hard-coded local path. Neither affected this package (counts are aligned; the gate ran in a scratch mirror).

## Book-specific notes

- Footnote paragraphs and the [B]/[C]/[D] markers are kept as the style note requires. 'Mahomedan' became 'Muslim' (a spelling-level change not covered by the style note).

## Integration (2026-10-21, release text-2026-10-21.5)

Integrated on branch `claude/modern-en-integrate-3`. Method, checks and the card rulings for this book are in
`books/wip/modern-en-release-20261021/RELEASE-5.md`.
- The package was verified against `origin/main`: candidate and baseline hashes, 1:1 structure, and the card pin.
- The gate was re-run on the integrated file and passes.
- Coordinate maps and a `CONTENT_RELEASES` entry carry saved places and highlights.
- Narration re-prepares changed paragraphs by text hash; nothing was generated.

Status: integrated, PR open, not yet published.
