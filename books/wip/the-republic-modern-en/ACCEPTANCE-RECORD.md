# Acceptance Record: the-republic, modern-en repair

- **Book id / edition:** `the-republic` / `modern-en`
- **Date:** 2026-10-06
- **Status:** **CONTENT ACCEPTED / HANDED OFF.** Not published.
- **Branch:** `claude/inspiring-ritchie-zi00fu`
- **Instruction revision used:** `origin/main` at `4a11ebf7f84334212233f69e1fb2575958648592`; style notes and the gate are the ones on that revision.
- **Owned path:** `books/wip/the-republic-modern-en/` only. No app, registry, live-edition, character-file, modern-da, audio or tooling file was touched.

## Problem and result

The served modern-en of The Republic is largely a real modernization, but a set of long paragraphs (about 640 across ten chapters, including identical-to-source ones) were left identical or very close to the source text.

| Measure (unmodified `books/classify-modern-en.py --gate`, scratch mirror) | Result | Limit |
|---|---|---|
| Weighted similarity | **0.628** | <= 0.75 |
| Light + mechanical chapters | **0/10 = 0.0%** | <= 5% |
| Identical long paragraphs | **0/2015 = 0.0%** | <= 5% |
| Truncated quotations / scaffolding | 0 / 0 | 0 |
| Words per sentence (paragraphs over 25 words) | source 40.3, served modern-en 28.3, candidate **27.1** | |

Full gate output is in `GATE-OUTPUT.txt`. It was produced by the unmodified gate script running against a scratch mirror that contains the candidate in place of the live file; re-run `python3 books/classify-modern-en.py the-republic --gate` after integration.

## Pinned inputs

| File | Role | sha256 |
|---|---|---|
| `source-original-en.json` | Fidelity anchor. Byte-identical to the served `original-en` at `4a11ebf7` | `338cc5908ed34b108c6775dad4e437feccb19ba86f6fdcd868ea5821d777b0a6` |
| `baseline-live-modern-en.json` | Starting point. Byte-identical to the served `modern-en` at `4a11ebf7` | `02082bbef9bf9026cdcdb11c0bc60e0e518a832d63f19dcbcab65ca794078f57` |

## Accepted candidate

**`candidate.json`, sha256:**
```
2bc78ba1f33b207c52ee98dd47954c82c07afb11b3b70d60f6a41af18b675277
```

- **Serialization:** identical to the live file (`json.dumps(indent=2, ensure_ascii=False)`, no trailing newline); drop-in replacement for `app/public/data/editions/the-republic-modern-en.json`.
- **Structure:** 10 chapters, 4308 paragraphs. Chapter order, titles and per-chapter paragraph counts are identical to both served editions, so saved places, highlights and notes map 1:1 with no migration.
- **Length:** 108,157 words (source 118,264).
- **Changed against the live modern-en:** 218 of 4308 paragraphs (`changed-paragraphs.json`). 632 paragraphs are identical to the source, which are mostly quotations, verse, citations, stage directions and short lines the style note keeps verbatim.

## How it was made

Targeted re-render of the paragraphs listed in the spec (the identical/near-identical long paragraphs only), 1:1 with the source structure. Every re-rendered paragraph (237 in bundle B01 and 72 in bundle B02) was independently reviewed against the source; 5 reviewer FAILs (a reversed concessive sense, 'inferior' -> 'weaker', 'qualities' -> 'parts', an ungrammatical phrase, 'confer reality' -> 'bring real benefits') were replaced and the replacements re-verified (5/5 PASS). Six paragraphs the renderer left identical to source were restored to the served live form. Everything else is unchanged from the served edition.

## Character package impact

193 modern-en mentions: 192 unchanged, 1 moved (proposed re-anchors), 0 need a ruling (`character-card-impact.json` lists only the moved or unresolved ones). Pin check: character file's pinned modern-en sha matches the served live file.

## Open issues (recorded, not blocking acceptance)

1. **Review depth.** Independent review of all re-rendered paragraphs; 5 FAIL then fixed and re-verified. Gate: PASS (similarity 0.628; identical long paragraphs 0.0%).
2. **Per-batch gating** was not run; only the whole-book gate on the final candidate.
3. **Silent source corrections.** Renderers corrected obvious source typos and damage without marking them in the text. The places they reported are listed below; any others were not reported.
4. **modern-da is stale** relative to the new modern-en (Danish is withdrawn; no new Danish was made). Do not present it as tracking the new modern-en.
5. **Audio.** Changed paragraphs invalidate prepared narration for this edition (see RELEASE-PACKET.md).
6. **Tooling.** `books/classify-modern-en.py` raises a NameError on misaligned paragraph counts; `books/audit-truncation.py` has a hard-coded local path. Neither affected this package (counts are aligned; the gate ran in a scratch mirror).
