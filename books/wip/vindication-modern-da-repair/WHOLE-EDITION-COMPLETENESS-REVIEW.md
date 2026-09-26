# Whole-Edition Completeness Review — A Vindication of the Rights of Woman, modern-da repair

Reviewer: separate verification pass, requested because the prior ad-hoc
untranslated-English screen (absence of æ/ø/å) is not real language
validation. This review re-scans the entire candidate with actual language
signal and reads a large, evenly-distributed fidelity sample against the
English baseline.

Candidate file: `books/wip/vindication-modern-da-repair/editions/vindication-rights-of-woman-modern-da.json`
Baseline file: `app/public/data/editions/vindication-rights-of-woman-modern-en.json`

Note on state at time of review: `INDEPENDENT-REVIEW.md` (an earlier check)
had flagged one genuine untranslated-English paragraph, file-ch15
(the book's own "Chapter 13") paragraph index 61. `ACCEPTANCE-RECORD.md`
records that this was fixed before acceptance. I confirmed this directly:
the candidate file as it stands now reads
"Desuden, hvordan kan kvinder være retfærdige eller gavmilde, når de er
uretfærdighedens slaver?" at that exact location — fully translated, no
residual English. The rest of this review is a fresh, independent
whole-edition scan performed on the file in its current (post-fix) state,
not a re-check of the old defect.

## 1. Untranslated-English scan — method, coverage, results

**Method (real language signal, not character presence):** For every
paragraph in the 12 translated/untouched-by-repair-scope file-chapters
(1–6, 10–15 — chapters 7, 8, 9 are the pre-existing, already-accepted
Danish and were excluded per the task's scope, exactly as the prior
reviews also excluded them), I tokenized the paragraph into words and
counted matches against two English function-word lists, applied as
**whole-word, case-insensitive** matches:

- **List A ("strong" English signal):** `the, and, of, which, with, this,
  was, were, been, would, could, should, from, his, their, is, not, that`
  — chosen specifically to *exclude* words that are also common, ordinary
  Danish words (`have`, `to`, `her`, `a`, `an` are Danish homographs:
  Danish "have" = garden/have-as-infinitive, "to" = the number two,
  "her" = "here" — these produced large numbers of false positives when
  included, all traceable to correct Danish text, so they were dropped
  from the scoring list to make the signal real rather than a
  homograph-noise generator).
- Flag threshold: **any paragraph with ≥1 List-A hit** (i.e. maximally
  sensitive — lower than the independent review's own stated 3+-word
  threshold, and lower than what would have caught the original defect).
- **Supplementary check:** any paragraph outside ch. 7-9 with more than 6
  words and containing **zero** Danish-specific characters or
  punctuation (æ, ø, å, uppercase equivalents, or the »« guillemets used
  throughout for quotations) — this catches short leftover-English
  sentences that would have too few words for a function-word count to
  fire at all.

**Coverage:** 544 of 544 paragraphs across file-chapters 1–6 and 10–15 —
**100% of every paragraph in the repair's scope**, not a sample. (778
total paragraphs in the book; 234 are chapters 7-9, correctly excluded as
pre-existing/untouched content per the task's scope.)

**Results:**

- List-A scan (≥1 strong English function-word hit): **1 paragraph
  flagged**, out of 544.
  - file-ch10 (book's own Chapter 8), paragraph 15 — a footnote:
    `(*Fodnote. Jeg sigter til forskellige biografiske skrifter, men
    navnlig til Boswells Life of Johnson.)` — flagged on the word "of".
    **Ruled false positive:** this is Wollstonecraft's own footnote
    citing Boswell's *Life of Johnson* by its English title, which is a
    proper noun/book title correctly left untranslated, exactly as the
    prior independent review also found and accepted for this same
    paragraph.
- No-Danish-character supplementary scan: **3 paragraphs flagged**.
  - file-ch3 (book Ch. 1), paragraph 15: `Rousseau anstrenger sig for at
    bevise, at alt VAR ret oprindeligt; en skare af forfattere, at alt ER
    ret nu; og jeg, at alt VIL BLIVE ret.` — **false positive**: this is
    genuine, correctly-translated Danish (VAR/ER/VIL BLIVE are Danish
    verb forms in emphasis caps, mirroring the English "WAS/IS/WILL BE"
    emphasis pattern); it simply has no æ/ø/å in this particular short
    sentence.
  - file-ch10 (book Ch. 8), paragraph 6: `Lad mig betragte dette emne fra
    en anden side.` ("Let me look at this subject from another side.")
    — **false positive**: genuine, correctly-translated short Danish
    sentence with no æ/ø/å by coincidence.
  - file-ch10 (book Ch. 8), paragraph 15: the same Boswell footnote as
    above — **false positive**, same reasoning (proper noun/title kept
    in English deliberately).

**Verdict on untranslated English: none found.** Combining both scans
across 100% of the 544 in-scope paragraphs produced 4 raised flags total
(with 1 paragraph, the footnote, flagged by both methods), and every one
was individually read and confirmed to be either correct Danish prose
that simply lacks æøå characters, or a deliberately-preserved English
proper noun/title inside an otherwise fully-Danish footnote. No
untranslated or partially-untranslated English sentence exists anywhere
in the candidate file at the time of this review.

I also re-ran an independent length-ratio check (Danish paragraph length
÷ English paragraph length, for every English paragraph over 40
characters, outside ch. 7-9) as a cross-check for systematic compression
that might co-occur with dropped English-language sentences: **zero**
paragraphs fell below a 0.6 ratio anywhere in the book. This corroborates
(via a different method) that there is no residual-English or
dropped-content problem the word-based scan could have missed.

## 2. Fidelity sample — coverage and findings

**Sampling method:** for every one of the 12 translated/untouched-by-repair
chapters, I sampled every 3rd paragraph (index 0, 3, 6, 9, …), which
guarantees at least 33% coverage in every single chapter (not
concentrated in the longest ones). I read each sampled Danish paragraph
side-by-side against the corresponding English baseline paragraph in
full, checking specifically for dropped clauses, compressed argument
chains, silently-invented content, and mistranslation.

**Exact coverage, by file-chapter:**

| file-ch | Book chapter | n (paragraphs) | Sampled | % |
|---|---|---|---|---|
| 1 | Dedication | 21 | 7 | 33.3% |
| 2 | Introduction | 17 | 6 | 35.3% |
| 3 | Chapter 1 | 31 | 11 | 35.5% |
| 4 | Chapter 2 | 76 | 26 | 34.2% |
| 5 | Chapter 3 | 52 | 18 | 34.6% |
| 6 | Chapter 4 | 86 | 29 | 33.7% |
| 10 | Chapter 8 | 33 | 11 | 33.3% |
| 11 | Chapter 9 | 33 | 11 | 33.3% |
| 12 | Chapter 10 | 8 | 3 | 37.5% |
| 13 | Chapter 11 | 20 | 7 | 35.0% |
| 14 | Chapter 12 | 84 | 28 | 33.3% |
| 15 | Chapter 13 | 83 | 28 | 33.7% |
| **Total** | | **544** | **185** | **34.0%** |

This is in addition to (not a substitute for) the 7 hand-assembled
paragraphs and the wide-interval longest-chapter sampling already
documented in `INDEPENDENT-REVIEW.md`; there is substantial overlap by
necessity (both reviews sample early/mid/late positions across the same
12 chapters) but this pass reads roughly 3x as many total paragraphs
(185 vs. the prior review's targeted spot-checks) and is the first pass
to guarantee an even ≥30% floor in every chapter individually, including
the previously lightly-sampled ones (ch. 1, 2, 10, 11, 13).

**Findings:** Every one of the 185 sampled paragraphs is a faithful,
complete translation of its English counterpart:

- Wollstonecraft's long periodic sentences — including the longest
  single paragraphs in the book (e.g. file-ch4 para 12, file-ch6 para 78
  on the nature of love, file-ch14 para 45 on Rousseau and Thérèse,
  file-ch15 para 75 on virtue and voluptuousness) — are carried across as
  single flowing Danish sentences with every subordinate clause,
  qualification, and rhetorical aside intact. No clause-dropping or
  silent compression was found in any sampled paragraph.
- Footnotes (file-ch10 para 15; file-ch14 para 42) are present, complete,
  and correctly preserve the English book-title/proper-noun references
  ("Boswells Life of Johnson"; "biskoppen af Autuns" pamphlet).
- Quoted verse and quoted prose (Milton, Pope, the anonymous couplet in
  file-ch6 para 12, Locke's quoted remark in file-ch13 para 12, Hume's
  quoted passage in file-ch6 para 9) are rendered in full in Danish, with
  the »« guillemet convention applied consistently.
- Section markers ("SECTION 13.4/5/6" in the English) are consistently
  translated as "AFSNIT 13.4/5/6" wherever they occur in the sample.
- No invented content (no sentences or clauses present in Danish with no
  counterpart in the English) was observed in any sampled paragraph.
- Register is consistent throughout the sample — formal, literary,
  syntactically ambitious Danish matching the pre-accepted chapters 7-9
  reference style, not a flattened or paraphrased register.

## 3. Final verdicts

**Whole-edition completeness (untranslated-English defects):** CLEAN. A
100%-of-paragraphs scan of every translated/untouched chapter (544/544
paragraphs, chapters 1–6 and 10–15), using two independent real-language
heuristics plus a length-ratio cross-check, found zero genuine
untranslated-English defects. The single previously-known defect
(file-ch15 paragraph 61) is confirmed fixed in the current file. 4 scan
hits were produced across both methods; all 4 were individually read and
are false positives (2 short genuinely-Danish sentences lacking æøå by
coincidence, and 1 footnote's deliberately-preserved English book title,
flagged by both methods). **The whole book is genuinely and completely
translated, with no gaps.**

**Fidelity (against the English baseline):** STRONG. A 185-paragraph
sample (34.0% overall, ≥33% in every one of the 12 chapters
individually) shows full-clause faithfulness with no dropped content,
no compression, and no invention anywhere sampled. Combined with the
zero-hit length-ratio check across all 544 paragraphs (a full-edition,
not sampled, structural signal against compression), there is no
evidence of a fidelity problem anywhere in the book.

**Overall recommendation:** No action required before release on either
axis checked here (completeness or fidelity). This package remains ready
for Codex integration per the existing `ACCEPTANCE-RECORD.md`.
