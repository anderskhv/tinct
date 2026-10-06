# Acceptance Record: History of the Peloponnesian War (Thucydides, Crawley), modern-en repair

- **Book id / edition:** `peloponnesian-war` / `modern-en`
- **Date:** 2026-10-06
- **Status:** **CONTENT ACCEPTED / HANDED OFF.** Not published.
- **Branch:** `claude/inspiring-ritchie-zi00fu`
- **Instruction revision used:** `origin/main` at `4a11ebf7f84334212233f69e1fb2575958648592`; style notes and the gate are the ones on that revision.
- **Owned path:** `books/wip/peloponnesian-war-modern-en/` only. No app, registry, live-edition, character-file, modern-da, audio or tooling file was touched.

## Problem and result

The served modern-en was the public-domain source text with spelling and a few word swaps (too close to the original to count as a modernization under the repository gate).

| Measure (unmodified `books/classify-modern-en.py --gate`, scratch mirror) | Result | Limit |
|---|---|---|
| Weighted similarity | **0.714** | <= 0.75 |
| Light + mechanical chapters | **0/26 = 0.0%** | <= 5% |
| Identical long paragraphs | **4/991 = 0.4%** | <= 5% |
| Truncated quotations / scaffolding | 0 / 0 | 0 |
| Words per sentence (paragraphs over 25 words) | source 40.3, served modern-en 33.2, candidate **22.6** | |

Full gate output is in `GATE-OUTPUT.txt`. It was produced by the unmodified gate script running against a scratch mirror that contains the candidate in place of the live file; re-run `python3 books/classify-modern-en.py peloponnesian-war --gate` after integration.

## Pinned inputs

| File | Role | sha256 |
|---|---|---|
| `source-original-en.json` | Fidelity anchor. Byte-identical to the served `original-en` at `4a11ebf7` | `e50ada55ab4db8be8238f5b201f241478ff145f75073b79e09af48472e5f3d6a` |
| `baseline-live-modern-en.json` | Starting point. Byte-identical to the served `modern-en` at `4a11ebf7` | `c035038d032ca4ec110b18df43b68d5a15c33cfef7c934170699a51313b90f75` |

## Accepted candidate

**`candidate.json`, sha256:**
```
7343a0ac70f35635ac37d5fa6cb2429401cf572754a62891fe8dff24111f4fd6
```

- **Serialization:** identical to the live file (`json.dumps(indent=2, ensure_ascii=False)`, no trailing newline); drop-in replacement for `app/public/data/editions/peloponnesian-war-modern-en.json`.
- **Structure:** 26 chapters, 998 paragraphs. Chapter order, titles and per-chapter paragraph counts are identical to both served editions, so saved places, highlights and notes map 1:1 with no migration.
- **Length:** 200,406 words (source 204,120).
- **Changed against the live modern-en:** 980 of 998 paragraphs (`changed-paragraphs.json`). 11 paragraphs are identical to the source, which are mostly quotations, verse, citations, stage directions and short lines the style note keeps verbatim.

## How it was made

1. **Style note.** `STYLE-NOTE.md`, written for this book (fixed technical terms, quotation handling, markers, typography, things that must not happen).
2. **Rendering.** The book was cut into slices (never splitting a paragraph) and rendered by parallel helpers following `process/RENDER-INSTRUCTIONS.md`. These renders used the instructions as given in `process/RENDER-INSTRUCTIONS.md` (including the depth requirement).
3. **Independent review.** Every paragraph was reviewed once by a helper that did not write it (`process/REVIEW-INSTRUCTIONS.md`). 998 paragraphs were checked and **69 were failed** and corrected with minimal replacements (`reviews/*.review.json`, merged in `reviews/fixes-merged.json`).
4. **Fresh verification.** Every corrected paragraph was re-checked by a different fresh helper (`process/VERIFY-INSTRUCTIONS.md`; `reviews/V*.result.json`): 68 passed, 1 failed (and the failing ones were replaced by the verifier's minimal fix, which is what is in the candidate).
5. **Checks on the final candidate:** the whole-book gate above, structure comparison against both served editions, serialization comparison, dropped-ellipsis check (source ellipses dropped by the candidate: 0), hash comparison of the pinned inputs against `origin/main`.

## Character package impact

394 modern-en mentions: 49 unchanged, 344 moved (proposed re-anchors), 1 need a ruling (`character-card-impact.json` lists only the moved or unresolved ones). Pin check: character file's pinned modern-en sha matches the served live file.

## Open issues (recorded, not blocking acceptance)

1. **Review depth.** Each paragraph was fidelity-reviewed once by a helper other than its renderer, and every correction was re-verified by a fresh helper. Beyond the gate and structure checks I did not re-read the full text myself, and the verification covers corrected paragraphs only (unflagged paragraphs were not read twice). Renderers reported that they did not always do a second full pass against the source.
2. **Per-batch gating** was not run; only the whole-book gate on the final candidate.
3. **Silent source corrections.** Renderers corrected obvious source typos and damage without marking them in the text. The places they reported are listed below; any others were not reported.
4. **modern-da is stale** relative to the new modern-en (Danish is withdrawn; no new Danish was made). Do not present it as tracking the new modern-en.
5. **Audio.** Changed paragraphs invalidate prepared narration for this edition (see RELEASE-PACKET.md).
6. **Tooling.** `books/classify-modern-en.py` raises a NameError on misaligned paragraph counts; `books/audit-truncation.py` has a hard-coded local path. Neither affected this package (counts are aligned; the gate ran in a scratch mirror).

## Book-specific notes

- Source damage that renderers silently repaired (not marked in the text): 5:4 ('You will be the first to break a treaty...' with 'not' missing; the candidate reads 'will not be the first'), 15:21 (a list with missing connective and names, rendered without supplying the missing names), 18:7 ('upon a slight aid specious pretext' read as 'a slight and specious pretext'), 18:21 (a garbled duplicated clause in Nicias's speech; the unreadable fragment 'the quality of allies' was dropped), 19:1 ('do be taken off your guard' read as 'do not'), 25:38 ('a cry arose a Peloponnesian fleet' read as 'a cry went up in the Peloponnesian fleet'), plus a number of duplicated words and stray punctuation marks.
- Names are kept as served, including inconsistent spellings (Onamacles/Onomacles, Spartans/Lacedaemonians). Treaty clauses and oaths stay close to the source on purpose for legal precision; several short clauses are identical to the source.
- A few slices are close to the gate line individually (similarity near 0.78 in the renderers' own per-slice check); the whole-book number is the one that counts.
