# Acceptance Record: jekyll-and-hyde, modern-en repair

- **Book id / edition:** `jekyll-and-hyde` / `modern-en`
- **Date:** 2026-10-06
- **Status:** **CONTENT ACCEPTED / HANDED OFF.** Not published.
- **Branch:** `claude/inspiring-ritchie-zi00fu`
- **Instruction revision used:** `origin/main` at `4a11ebf7f84334212233f69e1fb2575958648592`; style notes and the gate are the ones on that revision.
- **Owned path:** `books/wip/jekyll-and-hyde-modern-en/` only. No app, registry, live-edition, character-file, modern-da, audio or tooling file was touched.

## Problem and result

The served modern-en of Strange Case of Dr Jekyll and Mr Hyde is mostly a real modernization, but chapters 1, 2, 5, 7, 8 and 9 contain long paragraphs that were left identical or very close to the source (e.g. the Enfield narration in chapter 1, Poole's speeches in chapter 8).

| Measure (unmodified `books/classify-modern-en.py --gate`, scratch mirror) | Result | Limit |
|---|---|---|
| Weighted similarity | **0.701** | <= 0.75 |
| Light + mechanical chapters | **0/10 = 0.0%** | <= 5% |
| Identical long paragraphs | **1/256 = 0.4%** | <= 5% |
| Truncated quotations / scaffolding | 0 / 0 | 0 |
| Words per sentence (paragraphs over 25 words) | source 25.3, served modern-en 24.5, candidate **20.4** | |

Full gate output is in `GATE-OUTPUT.txt`. It was produced by the unmodified gate script running against a scratch mirror that contains the candidate in place of the live file; re-run `python3 books/classify-modern-en.py jekyll-and-hyde --gate` after integration.

## Pinned inputs

| File | Role | sha256 |
|---|---|---|
| `source-original-en.json` | Fidelity anchor. Byte-identical to the served `original-en` at `4a11ebf7` | `dc134b812fa478e45dfbe647db97ad0294463587b4b68a01a956f5c9fb34532b` |
| `baseline-live-modern-en.json` | Starting point. Byte-identical to the served `modern-en` at `4a11ebf7` | `7bcc0ee81b68635f017b8324fab9dc2e4cc3fc0febb827e0431ce876a2d0ac6b` |

## Accepted candidate

**`candidate.json`, sha256:**
```
640dc4ea5d7d56f4b015b000404b5275c5cf9223b9979ed6bfb3765155c4883d
```

- **Serialization:** identical to the live file (`json.dumps(indent=2, ensure_ascii=False)`, no trailing newline); drop-in replacement for `app/public/data/editions/jekyll-and-hyde-modern-en.json`.
- **Structure:** 10 chapters, 339 paragraphs. Chapter order, titles and per-chapter paragraph counts are identical to both served editions, so saved places, highlights and notes map 1:1 with no migration.
- **Length:** 25,254 words (source 25,531).
- **Changed against the live modern-en:** 236 of 339 paragraphs (`changed-paragraphs.json`). 23 paragraphs are identical to the source, which are mostly quotations, verse, citations, stage directions and short lines the style note keeps verbatim.

## How it was made

Targeted re-render of chapters 1, 2, 5, 7, 8 and 9 (about 260 paragraphs), 1:1 with the source structure and following the style note ('study' for 'cabinet', 'glass cupboards' for 'glass presses', and so on). Every paragraph was independently reviewed against the source; 8 reviewer FAILs (dropped hedges such as 'maybe' and 'a good deal frightened', a changed sense of 'On your side', a banned term, 'annotated' -> 'covered') were replaced and the replacements re-verified (8/8 PASS). Chapters 3, 4, 6 and 10 are unchanged from the served edition.

## Character package impact

504 modern-en mentions: 272 unchanged, 232 moved (proposed re-anchors), 0 need a ruling (`character-card-impact.json` lists only the moved or unresolved ones). Pin check: character file's pinned modern-en sha matches the served live file.

## Open issues (recorded, not blocking acceptance)

1. **Review depth.** Independent review of all re-rendered paragraphs; 8 FAIL then fixed and re-verified. Gate: PASS (similarity 0.701; identical long paragraphs 0.4%).
2. **Per-batch gating** was not run; only the whole-book gate on the final candidate.
3. **Silent source corrections.** Renderers corrected obvious source typos and damage without marking them in the text. The places they reported are listed below; any others were not reported.
4. **modern-da is stale** relative to the new modern-en (Danish is withdrawn; no new Danish was made). Do not present it as tracking the new modern-en.
5. **Audio.** Changed paragraphs invalidate prepared narration for this edition (see RELEASE-PACKET.md).
6. **Tooling.** `books/classify-modern-en.py` raises a NameError on misaligned paragraph counts; `books/audit-truncation.py` has a hard-coded local path. Neither affected this package (counts are aligned; the gate ran in a scratch mirror).
