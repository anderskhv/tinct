# niels-lyhne modern-en re-render handoff

Branch: `content/rerender-niels-lyhne` (cut from `origin/content/typography-apostrophes-pending`)
Candidate: `books/wip/rerender/niels-lyhne/niels-lyhne-modern-en.json`
SHA-256: `66fe341fd5d74b6d0fbdba1a27b5055ae80175d3615e30cff03a3a85ea1e6c38`

Integration (another agent): copy the candidate over `app/public/data/editions/niels-lyhne-modern-en.json`. No `app/**` file was touched here.

## Changed

Chapter 1 only (28 paragraphs). Paragraph indices (0-based) rewritten: 0-4, 6-9, 11-27. Unchanged by design: 5 ("She loved poetry.", 3 words) and 10 (the `* * *` separator). Chapters 2-14 are byte-identical in content to the branch version. Paragraph counts match the original in every chapter.

## Gate (unchanged classifier, scratch copy, absolute prefix)

| | before | after |
|---|---|---|
| ch 1 similarity | 0.851 LIGHT | 0.580 REAL |
| weighted similarity | 0.373 | 0.364 |
| light+mechanical | 1/14 = 7.1% (FAIL) | 0/14 = 0.0% |
| identical long paras | 3/713 = 0.4% | 3/713 = 0.4% |
| truncated quotations / wrapped scaffolding | 0 / 0 | 0 / 0 |

`--gate`: PASS. Only chapter 1 was LIGHT; no chapter was MECHANICAL. Chapter 12 is REAL (0.808) and was left alone.

Checks on chapter 1: every paragraph is at least 75% of the source words (chapter total 2334 vs 2359); exclamation marks 1 vs 1 (paragraph 7, "But the poems!"), 0 shortfall; curly apostrophes kept (family’s, God’s); no bracketed notes; no paragraph ends mid-sentence.

## Spot-reads

1. Para 7: "But the poems!" kept; the poems' girls "so noble and beautiful that they themselves never knew it"; men "raised them high into the sunshine of happiness".
2. Para 23: the bird image (plumage of romance, wing over a tired head) and embers on a bed of ashes preserved in sequence.
3. Para 27: "That was how things stood between husband and wife when Bartholine gave birth to her first child. It was a boy, and they named him Niels."

Names kept: Blid, Bartholine, Lyhne, Lönborggaard, Niels.

## Known issues

- Identical long paragraphs (3) are in chapter 6 (paras 40, 41) and chapter 9 (para 101); pre-existing, within the 5% limit, not touched.
- Chapter 1 as classified begins mid-description of Bartholine (as in the source edition); the Erik/Edele/Fennimore/Mrs. Boye/Gerda/Bigum names occur in later chapters, which are unchanged.
- Spaced em dashes ( — ) used in the rewrite, as in the existing modern-en; "Whitsun" retained from the source.
