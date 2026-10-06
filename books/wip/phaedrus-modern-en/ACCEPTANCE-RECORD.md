# Acceptance Record: phaedrus, modern-en repair

- **Book id / edition:** `phaedrus` / `modern-en`
- **Date:** 2026-10-06
- **Status:** **CONTENT ACCEPTED / HANDED OFF.** Not published.
- **Branch:** `claude/inspiring-ritchie-zi00fu`
- **Instruction revision used:** `origin/main` at `4a11ebf7f84334212233f69e1fb2575958648592`; style notes and the gate are the ones on that revision.
- **Owned path:** `books/wip/phaedrus-modern-en/` only. No app, registry, live-edition, character-file, modern-da, audio or tooling file was touched.

## Problem and result

The served modern-en of the Phaedrus is mostly a real modernization, but chapter 6 (the discussion of rhetoric and the art of speaking) was left very close to the source.

| Measure (unmodified `books/classify-modern-en.py --gate`, scratch mirror) | Result | Limit |
|---|---|---|
| Weighted similarity | **0.708** | <= 0.75 |
| Light + mechanical chapters | **0/6 = 0.0%** | <= 5% |
| Identical long paragraphs | **4/249 = 1.6%** | <= 5% |
| Truncated quotations / scaffolding | 0 / 0 | 0 |
| Words per sentence (paragraphs over 25 words) | source 40.2, served modern-en 26.0, candidate **25.0** | |

Full gate output is in `GATE-OUTPUT.txt`. It was produced by the unmodified gate script running against a scratch mirror that contains the candidate in place of the live file; re-run `python3 books/classify-modern-en.py phaedrus --gate` after integration.

## Pinned inputs

| File | Role | sha256 |
|---|---|---|
| `source-original-en.json` | Fidelity anchor. Byte-identical to the served `original-en` at `4a11ebf7` | `687f5a5e9b73892ce4226633fa3371ba3394bc728edbed38d6147303df6c542c` |
| `baseline-live-modern-en.json` | Starting point. Byte-identical to the served `modern-en` at `4a11ebf7` | `a246a86ca83ff33521735c1ff70681037ed4d956f87e71d0812ddf864979e06c` |

## Accepted candidate

**`candidate.json`, sha256:**
```
5ad44b8b4dbd819c14936e91514f25d8f02a0c81f728ae7d666adaedf8e9575b
```

- **Serialization:** identical to the live file (`json.dumps(indent=2, ensure_ascii=False)`, no trailing newline); drop-in replacement for `app/public/data/editions/phaedrus-modern-en.json`.
- **Structure:** 6 chapters, 408 paragraphs. Chapter order, titles and per-chapter paragraph counts are identical to both served editions, so saved places, highlights and notes map 1:1 with no migration.
- **Length:** 21,635 words (source 23,027).
- **Changed against the live modern-en:** 41 of 408 paragraphs (`changed-paragraphs.json`). 96 paragraphs are identical to the source, which are mostly quotations, verse, citations, stage directions and short lines the style note keeps verbatim.

## How it was made

Targeted re-render of chapter 6 only (55 paragraphs), 1:1 with the source structure. Every paragraph was independently reviewed against the source; 4 reviewer FAILs (a broken sentence, a flattened 'utility or inutility', an added 'green', an unconverted dash) were replaced and the replacements re-verified (4/4 PASS). One paragraph the renderer left identical to source was restored to the served live form. All other chapters are unchanged from the served edition.

## Character package impact

657 modern-en mentions: 635 unchanged, 22 moved (proposed re-anchors), 0 need a ruling (`character-card-impact.json` lists only the moved or unresolved ones). Pin check: character file's pinned modern-en sha matches the served live file.

## Open issues (recorded, not blocking acceptance)

1. **Review depth.** Independent review of all 55 re-rendered paragraphs; 4 FAIL then fixed and re-verified. Gate: PASS (see final-report).
2. **Per-batch gating** was not run; only the whole-book gate on the final candidate.
3. **Silent source corrections.** Renderers corrected obvious source typos and damage without marking them in the text. The places they reported are listed below; any others were not reported.
4. **modern-da is stale** relative to the new modern-en (Danish is withdrawn; no new Danish was made). Do not present it as tracking the new modern-en.
5. **Audio.** Changed paragraphs invalidate prepared narration for this edition (see RELEASE-PACKET.md).
6. **Tooling.** `books/classify-modern-en.py` raises a NameError on misaligned paragraph counts; `books/audit-truncation.py` has a hard-coded local path. Neither affected this package (counts are aligned; the gate ran in a scratch mirror).
