# Acceptance Record: much-ado-about-nothing, modern-en repair

- **Book id / edition:** `much-ado-about-nothing` / `modern-en`
- **Date:** 2026-10-06
- **Status:** **CONTENT ACCEPTED / HANDED OFF.** Not published.
- **Branch:** `claude/inspiring-ritchie-zi00fu`
- **Instruction revision used:** `origin/main` at `4a11ebf7f84334212233f69e1fb2575958648592`; style notes and the gate are the ones on that revision.
- **Owned path:** `books/wip/much-ado-about-nothing-modern-en/` only. No app, registry, live-edition, character-file, modern-da, audio or tooling file was touched.

## Problem and result

The served modern-en of Much Ado About Nothing is largely a real modernization (gate similarity 0.681 on the candidate), but chapters 15, 16 and 17 contain long runs that were left close to or identical to the source (identical long paragraphs, near-source dialogue).

| Measure (unmodified `books/classify-modern-en.py --gate`, scratch mirror) | Result | Limit |
|---|---|---|
| Weighted similarity | **0.681** | <= 0.75 |
| Light + mechanical chapters | **0/17 = 0.0%** | <= 5% |
| Identical long paragraphs | **3/427 = 0.7%** | <= 5% |
| Truncated quotations / scaffolding | 0 / 0 | 0 |
| Words per sentence (paragraphs over 25 words) | source 15.8, served modern-en 12.4, candidate **12.1** | |

Full gate output is in `GATE-OUTPUT.txt`. It was produced by the unmodified gate script running against a scratch mirror that contains the candidate in place of the live file; re-run `python3 books/classify-modern-en.py much-ado-about-nothing --gate` after integration.

## Pinned inputs

| File | Role | sha256 |
|---|---|---|
| `source-original-en.json` | Fidelity anchor. Byte-identical to the served `original-en` at `4a11ebf7` | `dd00eb7a88235b9852807ce3d52b7bc5c99d2dd391816465e063fffd0d2c7628` |
| `baseline-live-modern-en.json` | Starting point. Byte-identical to the served `modern-en` at `4a11ebf7` | `3b92db2e6ffc9d6b06eb0e3e6b15edaba45f2ed3495ddb2cb999c5b10eddf1af` |

## Accepted candidate

**`candidate.json`, sha256:**
```
e93fb1e66e2c9dc2d7266357fe143cf44c4943847f81009b9b507425dd2859f1
```

- **Serialization:** identical to the live file (`json.dumps(indent=2, ensure_ascii=False)`, no trailing newline); drop-in replacement for `app/public/data/editions/much-ado-about-nothing-modern-en.json`.
- **Structure:** 17 chapters, 1118 paragraphs. Chapter order, titles and per-chapter paragraph counts are identical to both served editions, so saved places, highlights and notes map 1:1 with no migration.
- **Length:** 21,996 words (source 22,347).
- **Changed against the live modern-en:** 97 of 1118 paragraphs (`changed-paragraphs.json`). 152 paragraphs are identical to the source, which are mostly quotations, verse, citations, stage directions and short lines the style note keeps verbatim.

## How it was made

Targeted re-render of chapters 15-17 only (127 paragraphs) following the play note: speaker labels and bracketed stage directions kept in the served live form, structure 1:1. Every paragraph was independently reviewed against the source; 4 reviewer FAILs (a flattened 'double-dealer' pun, a reversed speaker in 'Question:', an added 'really'/tense change, a dropped 'Alas') were replaced and the replacements re-verified by a fresh verifier (4/4 PASS). All other chapters are unchanged from the served edition.

## Character package impact

1647 modern-en mentions: 1597 unchanged, 50 moved (proposed re-anchors), 0 need a ruling (`character-card-impact.json` lists only the moved or unresolved ones). Pin check: character file's pinned modern-en sha matches the served live file.

## Open issues (recorded, not blocking acceptance)

1. **Review depth.** Independent review of all 127 re-rendered paragraphs; 4 FAIL then fixed and re-verified. Gate: PASS (0.681; 0.7% identical long paragraphs).
2. **Per-batch gating** was not run; only the whole-book gate on the final candidate.
3. **Silent source corrections.** Renderers corrected obvious source typos and damage without marking them in the text. The places they reported are listed below; any others were not reported.
4. **modern-da is stale** relative to the new modern-en (Danish is withdrawn; no new Danish was made). Do not present it as tracking the new modern-en.
5. **Audio.** Changed paragraphs invalidate prepared narration for this edition (see RELEASE-PACKET.md).
6. **Tooling.** `books/classify-modern-en.py` raises a NameError on misaligned paragraph counts; `books/audit-truncation.py` has a hard-coded local path. Neither affected this package (counts are aligned; the gate ran in a scratch mirror).
