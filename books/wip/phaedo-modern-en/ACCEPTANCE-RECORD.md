# Acceptance Record: Phaedo (Plato, Jowett), modern-en repair

- **Book id / edition:** `phaedo` / `modern-en`
- **Date:** 2026-10-06
- **Status:** **CONTENT ACCEPTED / HANDED OFF.** Not published.
- **Branch:** `claude/inspiring-ritchie-zi00fu`
- **Instruction revision used:** `origin/main` at `4a11ebf7f84334212233f69e1fb2575958648592`; style notes and the gate are the ones on that revision.
- **Owned path:** `books/wip/phaedo-modern-en/` only. No app, registry, live-edition, character-file, modern-da, audio or tooling file was touched.

## Problem and result

The served modern-en was the public-domain source text with spelling and a few word swaps (too close to the original to count as a modernization under the repository gate).

| Measure (unmodified `books/classify-modern-en.py --gate`, scratch mirror) | Result | Limit |
|---|---|---|
| Weighted similarity | **0.747** | <= 0.75 |
| Light + mechanical chapters | **0/9 = 0.0%** | <= 5% |
| Identical long paragraphs | **2/331 = 0.6%** | <= 5% |
| Truncated quotations / scaffolding | 0 / 0 | 0 |
| Words per sentence (paragraphs over 25 words) | source 38.0, served modern-en 25.8, candidate **21.8** | |

Full gate output is in `GATE-OUTPUT.txt`. It was produced by the unmodified gate script running against a scratch mirror that contains the candidate in place of the live file; re-run `python3 books/classify-modern-en.py phaedo --gate` after integration.

## Pinned inputs

| File | Role | sha256 |
|---|---|---|
| `source-original-en.json` | Fidelity anchor. Byte-identical to the served `original-en` at `4a11ebf7` | `c2a1b3b99c2826d41e1692c521d889b3a324afd762723210c7817960ea6c3044` |
| `baseline-live-modern-en.json` | Starting point. Byte-identical to the served `modern-en` at `4a11ebf7` | `2c46156a475567697bb7aadb6a66d362e08ea37cc23fc80d124c2be7e0cff8c7` |

## Accepted candidate

**`candidate.json`, sha256:**
```
31cffde50bfc13b6cba19cdd873c13dab3653b9b82825b3590d51c3b2de63368
```

- **Serialization:** identical to the live file (`json.dumps(indent=2, ensure_ascii=False)`, no trailing newline); drop-in replacement for `app/public/data/editions/phaedo-modern-en.json`.
- **Structure:** 9 chapters, 652 paragraphs. Chapter order, titles and per-chapter paragraph counts are identical to both served editions, so saved places, highlights and notes map 1:1 with no migration.
- **Length:** 26,702 words (source 27,292).
- **Changed against the live modern-en:** 396 of 652 paragraphs (`changed-paragraphs.json`). 216 paragraphs are identical to the source, which are mostly quotations, verse, citations, stage directions and short lines the style note keeps verbatim.

## How it was made

1. **Style note.** `STYLE-NOTE.md`, written for this book (fixed technical terms, quotation handling, markers, typography, things that must not happen).
2. **Rendering.** The book was cut into slices (never splitting a paragraph) and rendered by parallel helpers following `process/RENDER-INSTRUCTIONS.md`. These renders used the instructions as given in `process/RENDER-INSTRUCTIONS.md` (including the depth requirement).
3. **Independent review.** Every paragraph was reviewed once by a helper that did not write it (`process/REVIEW-INSTRUCTIONS.md`). 652 paragraphs were checked and **16 were failed** and corrected with minimal replacements (`reviews/*.review.json`, merged in `reviews/fixes-merged.json`).
4. **Fresh verification.** Every corrected paragraph was re-checked by a different fresh helper (`process/VERIFY-INSTRUCTIONS.md`; `reviews/V*.result.json`): 15 passed, 1 failed (and the failing ones were replaced by the verifier's minimal fix, which is what is in the candidate).
5. **Checks on the final candidate:** the whole-book gate above, structure comparison against both served editions, serialization comparison, dropped-ellipsis check (source ellipses dropped by the candidate: 0), hash comparison of the pinned inputs against `origin/main`.

## Character package impact

466 modern-en mentions: 209 unchanged, 248 moved (proposed re-anchors), 9 need a ruling (`character-card-impact.json` lists only the moved or unresolved ones). Pin check: character file's pinned modern-en sha matches the served live file.

## Open issues (recorded, not blocking acceptance)

1. **Review depth.** Each paragraph was fidelity-reviewed once by a helper other than its renderer, and every correction was re-verified by a fresh helper. Beyond the gate and structure checks I did not re-read the full text myself, and the verification covers corrected paragraphs only (unflagged paragraphs were not read twice). Renderers reported that they did not always do a second full pass against the source.
2. **Per-batch gating** was not run; only the whole-book gate on the final candidate.
3. **Silent source corrections.** Renderers corrected obvious source typos and damage without marking them in the text. The places they reported are listed below; any others were not reported.
4. **modern-da is stale** relative to the new modern-en (Danish is withdrawn; no new Danish was made). Do not present it as tracking the new modern-en.
5. **Audio.** Changed paragraphs invalidate prepared narration for this edition (see RELEASE-PACKET.md).
6. **Tooling.** `books/classify-modern-en.py` raises a NameError on misaligned paragraph counts; `books/audit-truncation.py` has a hard-coded local path. Neither affected this package (counts are aligned; the gate ran in a scratch mirror).

## Book-specific notes

- The whole-book gate result is 0.749 against a limit of 0.75, so the margin is very thin. Re-run the gate after integration; if it is borderline in the real checkout, a few paragraphs in ch5 (p80-159) are the closest to the source and could take a second pass.
- 7:133: the source reads 'they had that ideas exist' (a word is missing); the candidate reads 'they had agreed that ideas exist'. 5:121 'for a for some time' typo normalized.
- Quoted speech in multi-voice paragraphs (ch1, ch2, ch8, ch9) follows the style note's single-quote convention.
- Second look (read-only audit, then mechanical edits in `reviews/fixes-extra.json`): 23 changed paragraphs were word-for-word identical to the source although the served edition had modernized some of them; those are set back to the served modern-en text. Gate similarity moved 0.749 -> 0.747, so the margin is still thin; re-run the gate after integration.
