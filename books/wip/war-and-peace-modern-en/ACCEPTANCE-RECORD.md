# Acceptance Record: war-and-peace, modern-en repair

- **Book id / edition:** `war-and-peace` / `modern-en`
- **Date:** 2026-10-06
- **Status:** **CONTENT ACCEPTED / HANDED OFF.** Not published.
- **Branch:** `claude/inspiring-ritchie-zi00fu`
- **Instruction revision used:** `origin/main` at `4a11ebf7f84334212233f69e1fb2575958648592`; style notes and the gate are the ones on that revision.
- **Owned path:** `books/wip/war-and-peace-modern-en/` only. No app, registry, live-edition, character-file, modern-da, audio or tooling file was touched.

## Problem and result

The served modern-en of War and Peace is a real modernization for most of the book, but 25 chapters (158, 168-170, 173, 175, 181, 183, 185, 255, 260-261, 263, 265-267, 269-274, 276-278) were left identical or very close to the source (the Authority-check long-paragraph list), so the reader sees unmodernized runs in the middle of an otherwise modernized text.

| Measure (unmodified `books/classify-modern-en.py --gate`, scratch mirror) | Result | Limit |
|---|---|---|
| Weighted similarity | **0.682** | <= 0.75 |
| Light + mechanical chapters | **0/365 = 0.0%** | <= 5% |
| Identical long paragraphs | **39/8595 = 0.5%** | <= 5% |
| Truncated quotations / scaffolding | 0 / 0 | 0 |
| Words per sentence (paragraphs over 25 words) | source 22.9, served modern-en 20.9, candidate **20.6** | |

Full gate output is in `GATE-OUTPUT.txt`. It was produced by the unmodified gate script running against a scratch mirror that contains the candidate in place of the live file; re-run `python3 books/classify-modern-en.py war-and-peace --gate` after integration.

## Pinned inputs

| File | Role | sha256 |
|---|---|---|
| `source-original-en.json` | Fidelity anchor. Byte-identical to the served `original-en` at `4a11ebf7` | `6112db117bbc36641e45240ff4a0ecd7d63a2975bdd691a6ad1624a6c6879864` |
| `baseline-live-modern-en.json` | Starting point. Byte-identical to the served `modern-en` at `4a11ebf7` | `d3ecdb9d013f45e5681b1c091b6a018564e33d7eab1072cb247c284698a5f3f6` |

## Accepted candidate

**`candidate.json`, sha256:**
```
16d0f165ce7cbbed2914ca5a5adacebe296b2f298670aac4604e35d7525f7e9f
```

- **Serialization:** identical to the live file (`json.dumps(indent=2, ensure_ascii=False)`, no trailing newline); drop-in replacement for `app/public/data/editions/war-and-peace-modern-en.json`.
- **Structure:** 365 chapters, 11340 paragraphs. Chapter order, titles and per-chapter paragraph counts are identical to both served editions, so saved places, highlights and notes map 1:1 with no migration.
- **Length:** 534,771 words (source 561,695).
- **Changed against the live modern-en:** 578 of 11340 paragraphs (`changed-paragraphs.json`). 223 paragraphs are identical to the source, which are mostly quotations, verse, citations, stage directions and short lines the style note keeps verbatim.

## How it was made

Targeted re-render of only those 25 chapters (about 660 paragraphs), 1:1 with the source structure and following the style note (French kept with footnotes, scripture and prayers kept near-verbatim). Every paragraph was independently reviewed against the source; 10 reviewer FAILs (dropped hedges such as 'usually', 'vainly'; a reversed 'vice versa'; an invented phrase; ungrammatical sentences) were replaced and the replacements verified by a fresh verifier (9 PASS, 1 FAIL whose verifier-supplied wording was then applied but not re-verified: ch168 p0). Six punctuation fixes replace ellipses where the render had dropped them (`fixes-extra.json`, applied mechanically). Everything else is unchanged from the served edition. Pre-existing note: the served original-en and served modern-en carry different chapter titles for chapters 28-32 ('Book Two (1805) — Chapter 28' in the original vs 'Chapter 1' in modern-en, and so on); the candidate keeps the served modern-en titles unchanged.

## Character package impact

8466 modern-en mentions: 8024 unchanged, 440 moved (proposed re-anchors), 2 need a ruling (`character-card-impact.json` lists only the moved or unresolved ones). Pin check: character file's pinned modern-en sha matches the served live file.

## Open issues (recorded, not blocking acceptance)

1. **Review depth.** Independent review of all re-rendered paragraphs; 10 FAIL then fixed; 9/10 re-verified PASS; the last (168:0) uses the verifier's own replacement wording and was not re-verified. Gate: PASS (similarity 0.682; identical long paragraphs 0.5%).
2. **Per-batch gating** was not run; only the whole-book gate on the final candidate.
3. **Silent source corrections.** Renderers corrected obvious source typos and damage without marking them in the text. The places they reported are listed below; any others were not reported.
4. **modern-da is stale** relative to the new modern-en (Danish is withdrawn; no new Danish was made). Do not present it as tracking the new modern-en.
5. **Audio.** Changed paragraphs invalidate prepared narration for this edition (see RELEASE-PACKET.md).
6. **Tooling.** `books/classify-modern-en.py` raises a NameError on misaligned paragraph counts; `books/audit-truncation.py` has a hard-coded local path. Neither affected this package (counts are aligned; the gate ran in a scratch mirror).
