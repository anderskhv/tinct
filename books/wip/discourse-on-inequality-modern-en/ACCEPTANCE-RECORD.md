# Acceptance Record: Discourse on Inequality (Rousseau, Cole), modern-en repair

- **Book id / edition:** `discourse-on-inequality` / `modern-en`
- **Date:** 2026-10-06
- **Status:** **CONTENT ACCEPTED / HANDED OFF.** Not published.
- **Branch:** `claude/inspiring-ritchie-zi00fu`
- **Instruction revision used:** `origin/main` at `4a11ebf7f84334212233f69e1fb2575958648592`; style notes and the gate are the ones on that revision.
- **Owned path:** `books/wip/discourse-on-inequality-modern-en/` only. No app, registry, live-edition, character-file, modern-da, audio or tooling file was touched.

## Problem and result

The served modern-en was the public-domain source text with spelling and a few word swaps (too close to the original to count as a modernization under the repository gate).

| Measure (unmodified `books/classify-modern-en.py --gate`, scratch mirror) | Result | Limit |
|---|---|---|
| Weighted similarity | **0.713** | <= 0.75 |
| Light + mechanical chapters | **0/4 = 0.0%** | <= 5% |
| Identical long paragraphs | **5/166 = 3.0%** | <= 5% |
| Truncated quotations / scaffolding | 0 / 0 | 0 |
| Words per sentence (paragraphs over 25 words) | source 45.1, served modern-en 37.9, candidate **24.1** | |

Full gate output is in `GATE-OUTPUT.txt`. It was produced by the unmodified gate script running against a scratch mirror that contains the candidate in place of the live file; re-run `python3 books/classify-modern-en.py discourse-on-inequality --gate` after integration.

## Pinned inputs

| File | Role | sha256 |
|---|---|---|
| `source-original-en.json` | Fidelity anchor. Byte-identical to the served `original-en` at `4a11ebf7` | `d3e7e7975ac634b98f685abcd7f6aae64b3621a74db31e1d229f2b6cfc4ba3bd` |
| `baseline-live-modern-en.json` | Starting point. Byte-identical to the served `modern-en` at `4a11ebf7` | `78356e4ffdf62ec28c056fe871521967da428d31fafe694cad8b064f7019c62f` |

## Accepted candidate

**`candidate.json`, sha256:**
```
07d61b6e3daabbe3d82c788120c68ac5ff2fd40bb79ac336aaf2dee7b9e5f504
```

- **Serialization:** identical to the live file (`json.dumps(indent=2, ensure_ascii=False)`, no trailing newline); drop-in replacement for `app/public/data/editions/discourse-on-inequality-modern-en.json`.
- **Structure:** 4 chapters, 170 paragraphs. Chapter order, titles and per-chapter paragraph counts are identical to both served editions, so saved places, highlights and notes map 1:1 with no migration.
- **Length:** 30,613 words (source 31,639).
- **Changed against the live modern-en:** 167 of 170 paragraphs (`changed-paragraphs.json`). 9 paragraphs are identical to the source, which are mostly quotations, verse, citations, stage directions and short lines the style note keeps verbatim.

## How it was made

1. **Style note.** `STYLE-NOTE.md`, written for this book (fixed technical terms, quotation handling, markers, typography, things that must not happen).
2. **Rendering.** The book was cut into slices (never splitting a paragraph) and rendered by parallel helpers following `process/RENDER-INSTRUCTIONS.md`. The first pass of this book came back too close to the source (gate similarity 0.81 to 0.94), so the whole book was re-rendered from scratch after the render instructions gained a depth requirement (rework sentence structure, not only vocabulary). The numbers above are for the final candidate; the first attempt was not kept.
3. **Independent review.** Every paragraph was reviewed once by a helper that did not write it (`process/REVIEW-INSTRUCTIONS.md`). 170 paragraphs were checked and **14 were failed** and corrected with minimal replacements (`reviews/*.review.json`, merged in `reviews/fixes-merged.json`).
4. **Fresh verification.** Every corrected paragraph was re-checked by a different fresh helper (`process/VERIFY-INSTRUCTIONS.md`; `reviews/V*.result.json`): 14 passed, 0 failed (and the failing ones were replaced by the verifier's minimal fix, which is what is in the candidate).
5. **Checks on the final candidate:** the whole-book gate above, structure comparison against both served editions, serialization comparison, dropped-ellipsis check (source ellipses dropped by the candidate: 0), hash comparison of the pinned inputs against `origin/main`.

## Character package impact

69 modern-en mentions: 3 unchanged, 60 moved (proposed re-anchors), 6 need a ruling (`character-card-impact.json` lists only the moved or unresolved ones). Pin check: character file's pinned modern-en sha matches the served live file.

## Open issues (recorded, not blocking acceptance)

1. **Review depth.** Each paragraph was fidelity-reviewed once by a helper other than its renderer, and every correction was re-verified by a fresh helper. Beyond the gate and structure checks I did not re-read the full text myself, and the verification covers corrected paragraphs only (unflagged paragraphs were not read twice). Renderers reported that they did not always do a second full pass against the source.
2. **Per-batch gating** was not run; only the whole-book gate on the final candidate.
3. **Silent source corrections.** Renderers corrected obvious source typos and damage without marking them in the text. The places they reported are listed below; any others were not reported.
4. **modern-da is stale** relative to the new modern-en (Danish is withdrawn; no new Danish was made). Do not present it as tracking the new modern-en.
5. **Audio.** Changed paragraphs invalidate prepared narration for this edition (see RELEASE-PACKET.md).
6. **Tooling.** `books/classify-modern-en.py` raises a NameError on misaligned paragraph counts; `books/audit-truncation.py` has a hard-coded local path. Neither affected this package (counts are aligned; the gate ran in a scratch mirror).

## Book-specific notes

- 3:21: the source reads 'any other Are than that of the heavens' (OCR damage). The candidate renders 'fire' (a guess from context). Please confirm against Cole's text.
- 4:55: the source reads 'longs of kings' (damaged); a renderer read it as 'lords of kings'. 4:54: a stray 'I' ('happiness and I virtue') was dropped. 4:3 and 4:24: 'vigorous in light' and 'very fang' were read as 'fighting' and 'long' (guesses).
- Stray typos in the source were silently corrected by renderers in several places ('pur reason', 'Other surgical', 'Would accrue', 'docs').
- 1:13: the source's parenthetical '(not to make you happy, for your ancestors have saved you that trouble)' is kept (restored by a reviewer fix).
- Second look (read-only audit, then one direct edit in `reviews/fixes-extra.json`, not re-verified): ch4 p55 'the lords of kings' (a renderer guess at the damaged 'longs of kings') is replaced by 'the kings of kings', matching Rousseau's 'les Rois des Rois' and the served baseline. ch3 p21 ('are' read as 'fire') audited as faithful.
