# Release Packet — A Vindication of the Rights of Woman, modern-da translation

Status: candidate, awaiting independent review. Not published. Authorized
under the 2026-09-26 assignment's explicit Danish-repair carve-out.

## What this fixes

`modern-da` was served almost entirely in untranslated English:
Dedication, Introduction, and Chapters 1-6, 8 (10-13 by the book's own
Roman numbering), 12, and 13 (14-15 in file chapter numbers) were
byte-identical to `modern-en`. Only file chapters 7, 8, 9 (book Chapters
5, 6, 7) were already genuine, previously-translated Danish. This package
translates every remaining untranslated chapter — 13 of the book's 15
file chapters, all paragraphs not already Danish.

## Baseline

The accepted, complete `modern-en` (no completeness defect for this book
per the audit). Chapters 7-9 (already Danish, untouched by this package)
served as the register/style reference, alongside a dedicated style-guide
document built from Chapter 5's already-accepted pairs (proper-noun
conventions, quotation-mark convention, register).

## Candidate

| Item | Value |
|---|---|
| `editions/vindication-rights-of-woman-modern-da.json` | sha256 `d6d43cfb2f56333a3fc93607eff9098b702192aea503f92ae029ae5a2a4b5571` — 15 chapters, same structure as live; all chapters except 7, 8, 9 replaced with fresh Danish translation |
| Replaces live sha256 | `41ec7c251015ca8079dc88e5845757ac634fbf4c62f6ab03160ed5e686fc8880` |
| Baseline `modern-en` sha256 | `4e7e6143670a4ca29fa6f004587578e56102ac7b2f1b00814ddefb303084ba63` |

Per-chapter paragraph counts, all matching the English baseline exactly:

| Ch | Title | Paragraphs |
|----|-------|-----------|
| 1 | Dedication | 21 |
| 2 | Introduction | 17 |
| 3 | Chapter 1 | 31 |
| 4 | Chapter 2 | 76 |
| 5 | Chapter 3 | 52 |
| 6 | Chapter 4 | 86 |
| 7 | Chapter 5 | 172 (untouched — already Danish) |
| 8 | Chapter 6 | 20 (untouched — already Danish) |
| 9 | Chapter 7 | 42 (untouched — already Danish) |
| 10 | Chapter 8 | 33 |
| 11 | Chapter 9 | 33 |
| 12 | Chapter 10 | 8 |
| 13 | Chapter 11 | 20 |
| 14 | Chapter 12 | 84 |
| 15 | Chapter 13 | 83 |

## Notes on assembly

This translation was produced in three batches (V1: ch1-5; V2: ch6, 10-13;
V3: ch14-15), each independently paragraph-count-verified against the
English baseline before merging. During assembly, 7 paragraphs across
chapters 6, 10, and 13 were found missing from the V2 batch's assigned
index set (a batching gap, not a translation defect — two of the seven
are genuine footnote paragraphs that the batch script skipped, e.g.
chapter 10 paragraph 15, "Footnote. I allude to... Boswell's Life of
Johnson," and chapter 13 paragraph 17, the servant/hair-dressing anecdote
footnote; the other five in chapter 6 are short single-sentence
paragraphs that fell outside the assigned index list for no substantive
reason). All 7 were translated directly during assembly, in the same
register, and are called out here explicitly so independent review can
give them the same scrutiny as the rest.

## Verification performed

- Valid JSON.
- Paragraph counts for all 15 chapters verified programmatically against
  the English baseline — exact match, including the 7 manually-assembled
  paragraphs.
- Chapters 7, 8, 9 confirmed byte-identical to the live file (no scope
  creep, no accidental re-translation of already-correct text).
- Scanned all translated chapters for leftover English (heuristic:
  paragraphs >40 characters containing 3+ common English function words)
  — none found.
- No `[TBD]` or empty paragraphs anywhere.
- Spot-checked paragraphs across all translated chapters against English,
  including the longest passages (Chapter 2's 76 paragraphs, Chapter 4's
  86, the long embedded block quotations from Adam Smith and Forster in
  Chapter 12/13's national-education discussion): faithful, complete, no
  dropped clauses or compressed argument chains.
- Register matches the established Chapter 5 (file chapter 7) style
  reference: contemporary, serious/formal literary Danish, » « guillemets
  for quotations, all proper nouns preserved (Rousseau, Johnson,
  Chesterfield, Smith, Locke, Leibniz, Hume, Milton, Bacon, Sappho,
  Eloisa, Mrs. Macaulay, etc.), long Wollstonecraft periodic sentences
  kept as single flowing Danish sentences rather than split or compressed.

## What independent review should check

Read a substantial sample of the translated chapters against the English
baseline, with particular attention to the 7 manually-assembled paragraphs
(chapter 6: indices 6, 13, 17, 23, 25; chapter 10: index 15; chapter 13:
index 17) since those were not part of either background batch's
self-verified output. Confirm chapters 7-9 are untouched and the register
is consistent with them throughout.
