# Acceptance Record: On the Genealogy of Morals (Nietzsche, Samuel), modern-en repair

- **Book id / edition:** `genealogy-of-morals` / `modern-en`
- **Date:** 2026-10-06
- **Status:** **CONTENT ACCEPTED / HANDED OFF.** Not published.
- **Branch:** `claude/inspiring-ritchie-zi00fu`
- **Instruction revision used:** `origin/main` at `4a11ebf7f84334212233f69e1fb2575958648592`; style notes and the gate are the ones on that revision.
- **Owned path:** `books/wip/genealogy-of-morals-modern-en/` only. No app, registry, live-edition, character-file, modern-da, audio or tooling file was touched.

## Problem and result

The served modern-en was the public-domain source text with spelling and a few word swaps (too close to the original to count as a modernization under the repository gate).

| Measure (unmodified `books/classify-modern-en.py --gate`, scratch mirror) | Result | Limit |
|---|---|---|
| Weighted similarity | **0.731** | <= 0.75 |
| Light + mechanical chapters | **0/4 = 0.0%** | <= 5% |
| Identical long paragraphs | **2/118 = 1.7%** | <= 5% |
| Truncated quotations / scaffolding | 0 / 0 | 0 |
| Words per sentence (paragraphs over 25 words) | source 40.4, served modern-en 38.8, candidate **25.6** | |

Full gate output is in `GATE-OUTPUT.txt`. It was produced by the unmodified gate script running against a scratch mirror that contains the candidate in place of the live file; re-run `python3 books/classify-modern-en.py genealogy-of-morals --gate` after integration.

## Pinned inputs

| File | Role | sha256 |
|---|---|---|
| `source-original-en.json` | Fidelity anchor. Byte-identical to the served `original-en` at `4a11ebf7` | `2377b4157b8e28c24a35bcb25e98c2b51a25be3abf0cb5bde71a59aa75550f4f` |
| `baseline-live-modern-en.json` | Starting point. Byte-identical to the served `modern-en` at `4a11ebf7` | `72ca79453b9a485fa0a8277df452809dba80b87ecaf6985121e020ef51d30a9c` |

## Accepted candidate

**`candidate.json`, sha256:**
```
f108ea298f97f055749347e71a5bfbe55398409c79b4162e7691735331677c6f
```

- **Serialization:** identical to the live file (`json.dumps(indent=2, ensure_ascii=False)`, no trailing newline); drop-in replacement for `app/public/data/editions/genealogy-of-morals-modern-en.json`.
- **Structure:** 4 chapters, 124 paragraphs. Chapter order, titles and per-chapter paragraph counts are identical to both served editions, so saved places, highlights and notes map 1:1 with no migration.
- **Length:** 50,062 words (source 51,776).
- **Changed against the live modern-en:** 116 of 124 paragraphs (`changed-paragraphs.json`). 7 paragraphs are identical to the source, which are mostly quotations, verse, citations, stage directions and short lines the style note keeps verbatim.

## How it was made

1. **Style note.** `STYLE-NOTE.md`, written for this book (fixed technical terms, quotation handling, markers, typography, things that must not happen).
2. **Rendering.** The book was cut into slices (never splitting a paragraph) and rendered by parallel helpers following `process/RENDER-INSTRUCTIONS.md`. The first pass of this book came back too close to the source (gate similarity 0.81 to 0.94), so the whole book was re-rendered from scratch after the render instructions gained a depth requirement (rework sentence structure, not only vocabulary). The numbers above are for the final candidate; the first attempt was not kept.
3. **Independent review.** Every paragraph was reviewed once by a helper that did not write it (`process/REVIEW-INSTRUCTIONS.md`). 124 paragraphs were checked and **27 were failed** and corrected with minimal replacements (`reviews/*.review.json`, merged in `reviews/fixes-merged.json`).
4. **Fresh verification.** Every corrected paragraph was re-checked by a different fresh helper (`process/VERIFY-INSTRUCTIONS.md`; `reviews/V*.result.json`): 27 passed, 0 failed (and the failing ones were replaced by the verifier's minimal fix, which is what is in the candidate).
5. **Checks on the final candidate:** the whole-book gate above, structure comparison against both served editions, serialization comparison, dropped-ellipsis check (source ellipses dropped by the candidate: 0), hash comparison of the pinned inputs against `origin/main`.

## Character package impact

14 modern-en mentions: 1 unchanged, 11 moved (proposed re-anchors), 2 need a ruling (`character-card-impact.json` lists only the moved or unresolved ones). Pin check: character file's pinned modern-en sha matches the served live file.

## Open issues (recorded, not blocking acceptance)

1. **Review depth.** Each paragraph was fidelity-reviewed once by a helper other than its renderer, and every correction was re-verified by a fresh helper. Beyond the gate and structure checks I did not re-read the full text myself, and the verification covers corrected paragraphs only (unflagged paragraphs were not read twice). Renderers reported that they did not always do a second full pass against the source.
2. **Per-batch gating** was not run; only the whole-book gate on the final candidate.
3. **Silent source corrections.** Renderers corrected obvious source typos and damage without marking them in the text. The places they reported are listed below; any others were not reported.
4. **modern-da is stale** relative to the new modern-en (Danish is withdrawn; no new Danish was made). Do not present it as tracking the new modern-en.
5. **Audio.** Changed paragraphs invalidate prepared narration for this edition (see RELEASE-PACKET.md).
6. **Tooling.** `books/classify-modern-en.py` raises a NameError on misaligned paragraph counts; `books/audit-truncation.py` has a hard-coded local path. Neither affected this package (counts are aligned; the gate ran in a scratch mirror).

## Book-specific notes

- Source typos and damage silently corrected by renderers (not marked in the text): 'bad science' for 'bad conscience' (section 18), 'docs' for 'does' (section 24), 'tresspass', 'righteousness ness', 'Ail sufferers', 'intellegible', 'misunderstanded (sic)' kept with '(sic)'. HTML tags (<b>marriage</b>) in the source were rendered as plain text or kept as served as the style note says.
- Renderer flagged: 1:4 (Samuel's 'tainted by either pique or intolerance' kept literally), 3:21 and 4:3/4:8 (long paragraphs, restructured heavily).

## Integration (2026-10-21, release text-2026-10-21.5)

Integrated on branch `claude/modern-en-integrate-3`. Method, checks and the card rulings for this book are in
`books/wip/modern-en-release-20261021/RELEASE-5.md`.
- The package was verified against `origin/main`: candidate and baseline hashes, 1:1 structure, and the card pin.
- The gate was re-run on the integrated file and passes.
- Coordinate maps and a `CONTENT_RELEASES` entry carry saved places and highlights.
- Narration re-prepares changed paragraphs by text hash; nothing was generated.

Status: integrated, PR open, not yet published.
