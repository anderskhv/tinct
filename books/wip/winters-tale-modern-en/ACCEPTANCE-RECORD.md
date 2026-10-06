# Acceptance Record: The Winter's Tale (Shakespeare), modern-en repair

- **Book id / edition:** `winters-tale` / `modern-en`
- **Date:** 2026-10-06
- **Status:** **CONTENT ACCEPTED / HANDED OFF.** Not published.
- **Branch:** `claude/inspiring-ritchie-zi00fu`
- **Instruction revision used:** `origin/main` at `4a11ebf7f84334212233f69e1fb2575958648592`; style notes and the gate are the ones on that revision.
- **Owned path:** `books/wip/winters-tale-modern-en/` only. No app, registry, live-edition, character-file, modern-da, audio or tooling file was touched.

## Problem and result

The served modern-en was the public-domain source text with spelling and a few word swaps (too close to the original to count as a modernization under the repository gate).

| Measure (unmodified `books/classify-modern-en.py --gate`, scratch mirror) | Result | Limit |
|---|---|---|
| Weighted similarity | **0.597** | <= 0.75 |
| Light + mechanical chapters | **0/15 = 0.0%** | <= 5% |
| Identical long paragraphs | **2/457 = 0.4%** | <= 5% |
| Truncated quotations / scaffolding | 0 / 0 | 0 |
| Words per sentence (paragraphs over 25 words) | source 15.1, served modern-en 14.2, candidate **11.6** | |

Full gate output is in `GATE-OUTPUT.txt`. It was produced by the unmodified gate script running against a scratch mirror that contains the candidate in place of the live file; re-run `python3 books/classify-modern-en.py winters-tale --gate` after integration.

## Pinned inputs

| File | Role | sha256 |
|---|---|---|
| `source-original-en.json` | Fidelity anchor. Byte-identical to the served `original-en` at `4a11ebf7` | `e725492b2ca705fc0dc46687b555a88e106100dff1b76a2cc0900473ea0b4295` |
| `baseline-live-modern-en.json` | Starting point. Byte-identical to the served `modern-en` at `4a11ebf7` | `b85a81abca26b0a3d5ba2afe80e39afc13618c44b1de3addff024be57d53c346` |

## Accepted candidate

**`candidate.json`, sha256:**
```
413088916f3cca207d55b0fb0c78bb151fe4859a3ff299c117a0b5dae9d4663b
```

- **Serialization:** identical to the live file (`json.dumps(indent=2, ensure_ascii=False)`, no trailing newline); drop-in replacement for `app/public/data/editions/winters-tale-modern-en.json`.
- **Structure:** 15 chapters, 911 paragraphs. Chapter order, titles and per-chapter paragraph counts are identical to both served editions, so saved places, highlights and notes map 1:1 with no migration.
- **Length:** 26,830 words (source 25,744).
- **Changed against the live modern-en:** 766 of 911 paragraphs (`changed-paragraphs.json`). 194 paragraphs are identical to the source, which are mostly quotations, verse, citations, stage directions and short lines the style note keeps verbatim.

## How it was made

1. **Style note.** `PLAY-NOTE.md` for this play plus the shared brief in `process/SHAKESPEARE-BRIEF.md`.
2. **Rendering.** The book was cut into slices (never splitting a paragraph) and rendered by parallel helpers following `process/RENDER-INSTRUCTIONS.md`. These renders used the instructions as given in `process/RENDER-INSTRUCTIONS.md` (including the depth requirement).
3. **Independent review.** Every paragraph was reviewed once by a helper that did not write it (`process/REVIEW-INSTRUCTIONS.md`). 911 paragraphs were checked and **16 were failed** and corrected with minimal replacements (`reviews/*.review.json`, merged in `reviews/fixes-merged.json`).
4. **Fresh verification.** Every corrected paragraph was re-checked by a different fresh helper (`process/VERIFY-INSTRUCTIONS.md`; `reviews/V*.result.json`): 16 passed, 0 failed (and the failing ones were replaced by the verifier's minimal fix, which is what is in the candidate).
5. **Checks on the final candidate:** the whole-book gate above, structure comparison against both served editions, serialization comparison, dropped-ellipsis check (source ellipses dropped by the candidate: 0), hash comparison of the pinned inputs against `origin/main`.

## Character package impact

1059 modern-en mentions: 799 unchanged, 260 moved (proposed re-anchors), 0 need a ruling (`character-card-impact.json` lists only the moved or unresolved ones). Pin check: character file's pinned modern-en sha matches the served live file.

## Open issues (recorded, not blocking acceptance)

1. **Review depth.** Each paragraph was fidelity-reviewed once by a helper other than its renderer, and every correction was re-verified by a fresh helper. Beyond the gate and structure checks I did not re-read the full text myself, and the verification covers corrected paragraphs only (unflagged paragraphs were not read twice). Renderers reported that they did not always do a second full pass against the source.
2. **Per-batch gating** was not run; only the whole-book gate on the final candidate.
3. **Silent source corrections.** Renderers corrected obvious source typos and damage without marking them in the text. The places they reported are listed below; any others were not reported.
4. **modern-da is stale** relative to the new modern-en (Danish is withdrawn; no new Danish was made). Do not present it as tracking the new modern-en.
5. **Audio.** Changed paragraphs invalidate prepared narration for this edition (see RELEASE-PACKET.md).
6. **Tooling.** `books/classify-modern-en.py` raises a NameError on misaligned paragraph counts; `books/audit-truncation.py` has a hard-coded local path. Neither affected this package (counts are aligned; the gate ran in a scratch mirror).

## Book-specific notes

- Renderer flagged: 12:213 (Camillo's 'disliken the truth of your own seeming', rendered loosely), 13:41 (Leontes's 'print your royal father off'), 13:8 (Paulina's Alexander/successor lines). Please look at those.
- Speaker prefixes without periods ('CLEOMENES Sir') and mid-sentence paragraph splits (12:197-199, 12:221-223, 12:241-246) are kept as served.
