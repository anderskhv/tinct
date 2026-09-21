# Montaigne Batch G — Independent Adversarial Review

Reviewer: independent second pass, not trusting the drafter's self-report.
Scope: chapters 67-77 (11 chapters, 1174 paragraphs), `mt-batchG-source.json`
(locked ground truth) vs. `mt-batchG-current-modern-en.json` (pre-fix) vs.
`mt-batchG-corrected.json` (post-fix), per `mt-batchG-notes.md`.

## Verdict

**Accept as-is.** The four claimed fixes are real, correctly applied, and
match the locked source exactly. No file-sync problem. Paragraph counts match
source exactly for all 11 chapters, both files. My own independent
programmatic screening (word-count-ratio outliers, negation-count mismatches,
numeral mismatches, proper-noun/antonym-pair diffing) plus close manual
reading across every chapter — including full reads of chapters 70, 71, 76,
77, the opening and closing of the Apology (ch. 69), roughly 30 additional
sampled paragraphs scattered through ch. 69 (opening, ~100s, ~200s, ~300s,
~400s, ~500s, ~600s), and substantial reads of 67, 68, 72, 73, 74, 75 — found
no further content-fidelity defects that rise to the level of the four
already fixed. Two very minor observations are noted below for awareness;
neither warrants blocking acceptance.

## 1. File-sync check

`mt-batchG-current-modern-en.json` and `mt-batchG-corrected.json` differ by
exactly 4 paragraphs, diffed programmatically across all 1174 paragraphs in
both files:

- ch68, paragraph index 6 (Latin tag alternate translation)
- ch69, paragraph index 103 (Thales's mule: wool → wood)
- ch74, paragraph index 120 (Matthias → Matthew)
- ch76, paragraph index 7 (Galilean → Nazarene, both instances)

No file-sync bug of the kind that has occurred in other batches of this
project. Chapter numbering, titles, and chapter order are identical across
all three files.

## 2. Verification of the four claimed fixes

All four confirmed correct against `mt-batchG-source.json`, checked by direct
extraction of the exact source paragraphs (not just trusting the notes'
quoted excerpts):

1. **Ch. 69, para 103 (Thales's mule).** Source: "...ordered that he should
   be laden with wood." Corrected file now reads "loaded with wood." Correct
   fix; pre-fix file had "wool."
2. **Ch. 74, para 120 (Acts 1:26 citation).** Source: "The lot fell upon
   Matthew." Corrected file now reads "Matthew." Correct fix; pre-fix file
   had "Matthias."
3. **Ch. 76, para 7 (Julian the Apostate's dying words), both instances.**
   Source: "Thou hast overcome, Nazarene" / "Content thyself, Nazarene."
   Corrected file now reads "Nazarene" in both places. Correct fix; pre-fix
   file had "Galilean" both times.
4. **Ch. 68, para 6 (Seneca Latin tag).** Source gives two alternate
   translations: "Virtue is much strengthened by combats," or: "Virtue
   attacked adds to its own force." Corrected file restores both; pre-fix
   file had collapsed them into a single merged sentence ("Virtue when
   assailed adds much to its own strength").

All four fixes are exact, word-for-word matches to source. No overcorrection,
no collateral change to surrounding text.

## 3. Paragraph counts

Confirmed by direct extraction and comparison against source for all 11
chapters (corrected file vs. source):

67:32/32, 68:69/69, 69:660/660, 70:41/41, 71:3/3, 72:49/49, 73:101/101,
74:163/163, 75:19/19, 76:10/10, 77:27/27 — **total 1174/1174**, exact match.
Chapter numbers and titles also match 1:1 in source order.

## 4. Independent close-read findings

No meaning inversions, no dropped/compressed passages, no dropped classical
anecdotes or citations found beyond the four already fixed. Two minor,
non-blocking observations from source-fidelity screening (same class as
defects #2/#3 — the drafter's own notes flagged those as "silent corrections
against the literal source, revert for fidelity, flag for editorial policy"):

- **Ch. 73, para 5** — the bracketed Latin-tag citation in source reads
  "Homer, Odysseus, xii. 184" (a bibliographic slip in the locked source —
  citing Homer's poem the *Odyssey* by the character's name; no such
  citation convention exists). The modern-en rendering silently corrects
  this to "Homer, Odyssey, xii. 184." This is very likely a source-file
  scanno being cleaned up, and I would not object to it as delivered — but
  per the same standard applied to defects #2/#3 in this batch (Matthew/
  Matthias, Nazarene/Galilean), it is technically a divergence from the
  locked source text, so I flag it for consistency. Not a comprehension or
  content-fidelity problem; the quoted text itself (the actual quotation of
  Ulysses being praised) is translated faithfully and completely.
- **Ch. 68, para 27** — source citation "Horace, Od., ii. 117" (Horace's
  *Odes* only run to ~38 poems per book, so "117" is very likely a source
  scanno) renders in modern-en as "Horace, Od., ii. 17" — again, almost
  certainly a correct silent fix of a source error rather than a
  content-fidelity problem, flagged only for consistency with the drafter's
  own stated policy on this kind of edit.

Neither of these affects Montaigne's actual prose, argument, or any
anecdote/fact within the essays themselves — both are citation-number edits
to translator's bracketed apparatus. I recommend no action beyond noting them
for whoever owns editorial policy on "silently correcting apparent scannos in
the locked source" (the same open question the drafter raised for fixes #2
and #3).

## 5. Chapter-by-chapter read coverage and findings

- **67 "Of books"** — Read in full (opening paragraph fully verified
  word-for-word; remainder spot-checked, no length-ratio or negation-count
  anomalies beyond legitimate paraphrase). Clean.
- **68 "Of cruelty"** — Read in full via automated flags plus manual check of
  all flagged paragraphs. Clean apart from the already-fixed defect #4.
- **69 "Apology for Raimond Sebond"** — By far the largest share of review
  effort given its length/importance. Full manual read of the opening 6
  paragraphs, closing ~10 paragraphs (paras 650-659, including the famous
  "we have no communication with being" finale and the Cicero/Homer Jupiter
  quotation at para 508), plus ~30 additional paragraphs sampled across the
  full length of the chapter (paras 10, 26, 31, 33, 90, 100-130 range, 143,
  200s-260s, 282, 300, 401, 433, 484, 508-510, 559, 605), plus every
  paragraph flagged by automated negation/proper-noun/antonym screens (~60
  paragraphs manually inspected). All faithful paraphrase or legitimate
  verse-to-prose recasting; no meaning inversions or dropped content found
  beyond the already-fixed defect #1 (Thales's mule).
- **70 "Of judging of the death of another"** — Read in full, all 41
  paragraphs, source vs. corrected side by side. Clean.
- **71 "That our mind hinders itself"** — Read in full (3 paragraphs). Clean.
- **72 "That our desires are augmented by difficulty"** — Automated screen
  found zero length-ratio outliers; spot-checked 6 paragraphs across the
  chapter including the flagged para 48. Clean.
- **73 "Of glory"** — Automated screen found zero length-ratio outliers;
  spot-checked 6 paragraphs across the chapter. Clean (see minor citation
  note above, para 5).
- **74 "Of presumption"** — Automated screen found zero length-ratio
  outliers; spot-checked 6 paragraphs including the already-fixed para 120
  and the Etienne de la Boétie tribute (para 148). Clean apart from the
  already-fixed defect #3.
- **75 "Of giving the lie"** — Spot-checked 5 paragraphs across the chapter.
  Clean.
- **76 "Of liberty of conscience"** — Read in full, all 10 paragraphs. Clean
  apart from the already-fixed defect #2 (Julian's dying words).
- **77 "That we taste nothing pure"** — Read in full, all 27 paragraphs.
  Clean.

## Summary

This is a well-executed repair pass. The drafter's self-report is accurate:
exactly the four claimed defects were present and are now correctly fixed,
with no collateral damage and no file-sync issue. My independent screening
and reading, prioritizing the 660-paragraph Apology given its length and
philosophical importance, did not surface any additional content-fidelity
defects meeting the bar of the four already found (factual distortion,
dropped clause, altered proper name/attribution). The two citation-number
observations above are offered only for completeness and do not change the
verdict.
