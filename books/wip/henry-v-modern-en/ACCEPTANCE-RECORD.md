# Acceptance Record: Henry V (Shakespeare), modern-en repair

- **Book id / edition:** `henry-v` / `modern-en`
- **Date:** 2026-10-06
- **Status:** **CONTENT ACCEPTED / HANDED OFF.** Not published.
- **Branch:** `claude/inspiring-ritchie-zi00fu`
- **Instruction revision used:** `origin/main` at `4a11ebf7f84334212233f69e1fb2575958648592`; style notes and the gate are the ones on that revision.
- **Owned path:** `books/wip/henry-v-modern-en/` only. No app, registry, live-edition, character-file, modern-da, audio or tooling file was touched.

## Problem and result

The served modern-en was the public-domain source text with spelling and a few word swaps (too close to the original to count as a modernization under the repository gate).

| Measure (unmodified `books/classify-modern-en.py --gate`, scratch mirror) | Result | Limit |
|---|---|---|
| Weighted similarity | **0.597** | <= 0.75 |
| Light + mechanical chapters | **0/23 = 0.0%** | <= 5% |
| Identical long paragraphs | **5/395 = 1.3%** | <= 5% |
| Truncated quotations / scaffolding | 0 / 0 | 0 |
| Words per sentence (paragraphs over 25 words) | source 18.3, served modern-en 15.8, candidate **12.9** | |

Full gate output is in `GATE-OUTPUT.txt`. It was produced by the unmodified gate script running against a scratch mirror that contains the candidate in place of the live file; re-run `python3 books/classify-modern-en.py henry-v --gate` after integration.

## Pinned inputs

| File | Role | sha256 |
|---|---|---|
| `source-original-en.json` | Fidelity anchor. Byte-identical to the served `original-en` at `4a11ebf7` | `c66a930a2d877fc78b00c4a793a4c63d550f2042609b51c922ec3d9a18da081b` |
| `baseline-live-modern-en.json` | Starting point. Byte-identical to the served `modern-en` at `4a11ebf7` | `f2b9cab47fef45f65a6bb9b53aec30aaaaa33e9944de3e62ee482df133b9bb42` |

## Accepted candidate

**`candidate.json`, sha256:**
```
ec46baaf614b9f6d78b33c837eb77da6250ce8a108a6676928909c713ff0c04f
```

- **Serialization:** identical to the live file (`json.dumps(indent=2, ensure_ascii=False)`, no trailing newline); drop-in replacement for `app/public/data/editions/henry-v-modern-en.json`.
- **Structure:** 23 chapters, 883 paragraphs. Chapter order, titles and per-chapter paragraph counts are identical to both served editions, so saved places, highlights and notes map 1:1 with no migration.
- **Length:** 28,250 words (source 26,750).
- **Changed against the live modern-en:** 608 of 883 paragraphs (`changed-paragraphs.json`). 81 paragraphs are identical to the source, which are mostly quotations, verse, citations, stage directions and short lines the style note keeps verbatim.

## How it was made

1. **Style note.** `PLAY-NOTE.md` for this play plus the shared brief in `process/SHAKESPEARE-BRIEF.md`.
2. **Rendering.** The book was cut into slices (never splitting a paragraph) and rendered by parallel helpers following `process/RENDER-INSTRUCTIONS.md`. These renders used the instructions as given in `process/RENDER-INSTRUCTIONS.md` (including the depth requirement).
3. **Independent review.** Every paragraph was reviewed once by a helper that did not write it (`process/REVIEW-INSTRUCTIONS.md`). 883 paragraphs were checked and **11 were failed** and corrected with minimal replacements (`reviews/*.review.json`, merged in `reviews/fixes-merged.json`).
4. **Fresh verification.** Every corrected paragraph was re-checked by a different fresh helper (`process/VERIFY-INSTRUCTIONS.md`; `reviews/V*.result.json`): 11 passed, 0 failed (and the failing ones were replaced by the verifier's minimal fix, which is what is in the candidate).
5. **Checks on the final candidate:** the whole-book gate above, structure comparison against both served editions, serialization comparison, dropped-ellipsis check (source ellipses dropped by the candidate: 0), hash comparison of the pinned inputs against `origin/main`.

## Character package impact

1324 modern-en mentions: 1026 unchanged, 266 moved (proposed re-anchors), 32 need a ruling (`character-card-impact.json` lists only the moved or unresolved ones). Pin check: character file's pinned modern-en sha matches the served live file.

## Open issues (recorded, not blocking acceptance)

1. **Review depth.** Each paragraph was fidelity-reviewed once by a helper other than its renderer, and every correction was re-verified by a fresh helper. Beyond the gate and structure checks I did not re-read the full text myself, and the verification covers corrected paragraphs only (unflagged paragraphs were not read twice). Renderers reported that they did not always do a second full pass against the source.
2. **Per-batch gating** was not run; only the whole-book gate on the final candidate.
3. **Silent source corrections.** Renderers corrected obvious source typos and damage without marking them in the text. The places they reported are listed below; any others were not reported.
4. **modern-da is stale** relative to the new modern-en (Danish is withdrawn; no new Danish was made). Do not present it as tracking the new modern-en.
5. **Audio.** Changed paragraphs invalidate prepared narration for this edition (see RELEASE-PACKET.md).
6. **Tooling.** `books/classify-modern-en.py` raises a NameError on misaligned paragraph counts; `books/audit-truncation.py` has a hard-coded local path. Neither affected this package (counts are aligned; the gate ran in a scratch mirror).

## Book-specific notes

- Katharine's dialect spellings in the wooing scene were rendered as plain English (per the play note); the French lesson keeps the French with an English dash-gloss. French lines elsewhere are kept verbatim without glosses.
- Renderer flagged: 23:41/23:55 (Henry's wooing puns), 14:63 (a reviewer fixed a reversal of who made the offer to God), 2:9 (Salic law genealogy).
- Served stage directions and speaker labels: the served modern-en already had its stage directions normalized (bracketed, e.g. '[Enter Richard, Duke of Gloucester, alone.]') and some speaker labels disambiguated (e.g. 'KING HENRY V.', 'PRINCE HENRY.', 'KATHERINE.', 'VOLSCIAN.'). The renderers copied these from the source form as instructed. After review, every such paragraph was set back to the served live text mechanically (script, `reviews/fixes-extra.json`): stage-direction paragraphs that equal the source take the live paragraph, and a speech paragraph whose label differs from the live label takes the live label with the candidate's speech text unchanged. These mechanical restorations were not re-read by a reviewer; they only restore text that was already served.
