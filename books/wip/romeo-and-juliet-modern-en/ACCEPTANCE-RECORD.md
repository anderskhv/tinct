# Acceptance Record: romeo-and-juliet, modern-en repair

- **Book id / edition:** `romeo-and-juliet` / `modern-en`
- **Date:** 2026-10-06
- **Status:** **CONTENT ACCEPTED / HANDED OFF.** Not published.
- **Branch:** `claude/inspiring-ritchie-zi00fu`
- **Instruction revision used:** `origin/main` at `4a11ebf7f84334212233f69e1fb2575958648592`; style notes and the gate are the ones on that revision.
- **Owned path:** `books/wip/romeo-and-juliet-modern-en/` only. No app, registry, live-edition, character-file, modern-da, audio or tooling file was touched.

## Problem and result

The served modern-en of Romeo and Juliet is already a real modernization (gate similarity 0.446). It fails the gate on one item only: a truncated-quotation flag at ch16 p4, where the modernization writes an ellipsis for Capulet's interruption although the source has none.

| Measure (unmodified `books/classify-modern-en.py --gate`, scratch mirror) | Result | Limit |
|---|---|---|
| Weighted similarity | **0.446** | <= 0.75 |
| Light + mechanical chapters | **0/25 = 0.0%** | <= 5% |
| Identical long paragraphs | **1/456 = 0.2%** | <= 5% |
| Truncated quotations / scaffolding | 0 / 0 | 0 |
| Words per sentence (paragraphs over 25 words) | source 12.1, served modern-en 9.2, candidate **9.2** | |

Full gate output is in `GATE-OUTPUT.txt`. It was produced by the unmodified gate script running against a scratch mirror that contains the candidate in place of the live file; re-run `python3 books/classify-modern-en.py romeo-and-juliet --gate` after integration.

## Pinned inputs

| File | Role | sha256 |
|---|---|---|
| `source-original-en.json` | Fidelity anchor. Byte-identical to the served `original-en` at `4a11ebf7` | `d7be46edc32ddbb1321be7655ff819bd43e349f6ac59ba8c990fbd236f9f9276` |
| `baseline-live-modern-en.json` | Starting point. Byte-identical to the served `modern-en` at `4a11ebf7` | `47fdf4f9a1b309f6747b48d00add73181cff9cd0a4c0063f81774a1a8a95bae6` |

## Accepted candidate

**`candidate.json`, sha256:**
```
0f7f2f2fbfb6e17d1c070228df6ec190d05bac150eeb16b1d12dc99a24efe04b
```

- **Serialization:** identical to the live file (`json.dumps(indent=2, ensure_ascii=False)`, no trailing newline); drop-in replacement for `app/public/data/editions/romeo-and-juliet-modern-en.json`.
- **Structure:** 25 chapters, 1062 paragraphs. Chapter order, titles and per-chapter paragraph counts are identical to both served editions, so saved places, highlights and notes map 1:1 with no migration.
- **Length:** 25,599 words (source 25,515).
- **Changed against the live modern-en:** 1 of 1062 paragraphs (`changed-paragraphs.json`). 231 paragraphs are identical to the source, which are mostly quotations, verse, citations, stage directions and short lines the style note keeps verbatim.

## How it was made

Targeted fix of exactly one paragraph (ch16 p4): the ellipsis in `next Wednesday... wait, what day is this?` is replaced by a dash (`next Wednesday — no, wait, what day is this?`). Nothing else in the served edition changes (`changed-paragraphs.json` lists the single paragraph). No fidelity review pass was run on this one-word-level edit; the coordinator checked it against the source line ('on Wednesday next, But, soft, what day is this?').

## Character package impact

1626 modern-en mentions: 1626 unchanged, 0 moved (proposed re-anchors), 0 need a ruling (`character-card-impact.json` lists only the moved or unresolved ones). Pin check: character file's pinned modern-en sha matches the served live file.

## Open issues (recorded, not blocking acceptance)

1. **Review depth.** Only one paragraph changed; it was checked by the coordinator against the source line, not by an independent reviewer.
2. **Per-batch gating** was not run; only the whole-book gate on the final candidate.
3. **Silent source corrections.** Renderers corrected obvious source typos and damage without marking them in the text. The places they reported are listed below; any others were not reported.
4. **modern-da is stale** relative to the new modern-en (Danish is withdrawn; no new Danish was made). Do not present it as tracking the new modern-en.
5. **Audio.** Changed paragraphs invalidate prepared narration for this edition (see RELEASE-PACKET.md).
6. **Tooling.** `books/classify-modern-en.py` raises a NameError on misaligned paragraph counts; `books/audit-truncation.py` has a hard-coded local path. Neither affected this package (counts are aligned; the gate ran in a scratch mirror).
