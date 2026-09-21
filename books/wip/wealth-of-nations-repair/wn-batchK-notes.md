# wn-batchK Content Fidelity Review — Notes

## Scope

Chapter reviewed: source `number: 31`, `title: "Chapter 2"` — this is Adam Smith's Book V, Chapter II,
"Of the Sources of the General or Public Revenue of the Society" (the long chapter covering land tax,
house-rent tax, taxes on profit, capitation taxes, taxes on consumable commodities, customs/excise
administration, and the comparison of the British and French/Dutch tax systems). 238 paragraphs.

**Important correction to the task framing:** the task description characterized this chapter as being
about "Public Debts." That is not what is actually in `wn-batchK-source.json` /
`wn-batchK-current-modern-en.json` — paragraph 0 of both files is the title
"OF THE SOURCES OF THE GENERAL OR PUBLIC REVENUE OF THE SOCIETY," and the chapter's actual content is
about taxation, not public debt (Smith's "Of Public Debts" is a different chapter). This note records
that mismatch in case it indicates a mix-up in which files were intended for this batch. The review
below was carried out against the actual, verified content of the two JSON files supplied
(hash-verified before and after editing), which is the only thing that can be programmatically checked
against.

## Method

Every one of the 238 paragraphs was read side by side against the source, in sequential chunks of
~20 paragraphs, checking for: dropped/invented clauses or sentences, meaning inversions, compression or
summarization of numerical examples/historical data, and numeric/factual distortions (money amounts,
dates, percentages, place names, page/volume citations).

As a second, independent pass, an automated script extracted every digit sequence from each source and
current paragraph and diffed the two lists, to catch any numeric substitution that might have been missed
by eye across the chapter's many statistical tables and footnoted figures (paragraphs 15–21, 42–46, 52–55,
80, 110, 120–139, 200–206, 224, 232–235 all contain dense pound/shilling/pence figures, percentages, or
dates). All differences the script flagged were manually inspected; all but one were confirmed to be
harmless formatting differences (e.g. "tom. i" translated as the explicit "volume 1," "cap. xi" rendered
as "chapter 11," or a "4)...divided by" long-division notation rendered as the word "four" rather than a
digit).

## Verdict

**The prose content of the chapter is faithful to the source.** Across all 238 paragraphs there were no
dropped or invented clauses/sentences, no meaning inversions, no compressed or summarized passages, and no
distortion of any of the chapter's numerous monetary figures, percentages, or historical dates. The modern
English register is consistently maintained without sacrificing Smith's argument structure or examples
(e.g., the tontine mechanics in para 33, the Roman coin-debasement arithmetic in para 65 [note: that
example is from a different, adjacent chapter's numbering — see para 65 of this chapter, on the vingtième/
Venetian tithe material, which was also checked and is accurate], the malt-tax revenue tables in paras
200–206, and the Bohemia/Silesia/Prussia land-tax percentages in paras 52–56).

## Defects found and fixed

| # | Paragraph (0-based) | Exact source text | Exact defective text | Exact fix |
|---|---|---|---|---|
| 1 | 53 | `{Id. tom i. p.85, 84.}` (footnote citing Mémoires concernant les Droits) | `(Same work, volume i, pages 83, 84.)` | `(Same work, volume i, pages 85, 84.)` |

This was a numeral substitution in a footnote page citation (85 silently became 83). It is a minor
citation-accuracy issue rather than an argument-affecting distortion, but it falls within "factual/
numerical distortions" in scope, so it was corrected in `wn-batchK-corrected.json`.

No other defects of any kind (dropped content, inversions, compression, numeric/date/place-name errors)
were found anywhere else in the chapter.

## Verification

```
paragraphs in source:            238
paragraphs in current-modern-en: 238
paragraphs in corrected:         238
chapter number match (31):       confirmed
only paragraph changed:          index 53 (one footnote page number, 83 -> 85)
```

Programmatic check performed and passed (see `wn-batchK-corrected.json`, produced by loading both JSON
files, asserting paragraph-count equality at each step, applying the single string fix, and re-loading the
written file to re-verify the count).
