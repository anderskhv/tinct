# Source-completeness audit: G05-featured

- **Group:** G05-featured (the approved featured selection; Julius Caesar is covered by G01)
- **Books:** frankenstein, odyssey, jekyll-and-hyde, pride-and-prejudice, meditations, crime-and-punishment, jane-eyre, the-prince, candide
- **Audited commit:** main `1a7d89ebd816af8a2ac18239010c34fab4bf48c5` (read-only)
- **Date:** 2026-09-25
- **Status of every finding:** PROPOSED. A separate reviewer confirms them.

## Summary

| Book | Source edition(s) checked | Verdict | Findings |
|---|---|---|---|
| frankenstein | original-en vs PG #84, plus PG #42324 (1831) and PG #41445 (1818) | DEFECTS | S3: the 1831 Introduction and 1818 Preface are missing |
| odyssey | original-en vs PG #1727 (Butler) | DEFECTS | S2: the known 3.37 splice (fix staged, not released) |
| jekyll-and-hyde | original-en vs PG #43, plus PG #42 | DEFECTS | S3: the dedication "To Katharine de Mattos" is missing |
| pride-and-prejudice | original-en vs PG #1342 | COMPLETE-VS-SOURCE | none |
| meditations | original-en vs PG #15877 (Long) | COMPLETE-VS-SOURCE | S4: the repo provenance record points to Casaubon (already known) |
| crime-and-punishment | original-en vs PG #2554 (Garnett) | COMPLETE-VS-SOURCE | none |
| jane-eyre | original-en vs PG #1260 | COMPLETE-VS-SOURCE | SCOPE (S3 if treated as a defect): the Preface and Note are not served |
| the-prince | original-en vs PG #1232 (Marriott); original-it vs it.wikisource (Italia 1814) | DEFECTS | S2: 48 Marriott footnotes served as body text. S3: 94 Wikisource markers in the Italian. S4: the Dacre credit is misattributed |
| candide | original-en vs PG #19942, plus the Fleming 1901 OCR | DEFECTS | S3: wrong translator label. S4: 34 dangling note markers |

**Verdict counts:** DEFECTS 5 · COMPLETE-VS-SOURCE 4 · SCREENED 0 · NEEDS-INVESTIGATION 0 · SOURCE-NOT-IDENTIFIED 0.
Every book received a whole-text alignment of every source edition (original-en, plus original-it for The Prince).

**No book is missing any body text** against its matching source edition. No chapter, book or part is missing, and no opening or ending is missing. Every served chapter boundary coincides with a source heading.

The defects fall into three kinds:
- **Authorial front matter** that the imported Gutenberg file itself lacked. This is the Symposium failure mode applied to front matter.
- **Non-work text served as reading text.** This covers The Prince's footnotes and the Wikisource page markers, plus the known Odyssey splice.
- **One wrong translator label**, on Candide.

### Corrections to the group notes
1. **Frankenstein. PG #84 is the 1831 text, not the 1818 text.** The served chapter 1 has Elizabeth as a foundling from a peasant family on Lake Como (5.7–5.9). That is the 1831 version; in the 1818 text (PG #41445) she is Alphonse's niece. Against the 1831 print (PG #42324), 99.68% of the served text aligns; against the 1818 print, 87.27% aligns, with 187 order anomalies. The label "Original (1831)" and SOURCE.md are therefore correct. What PG #84 lacks is the 1831 front matter.
2. **Candide. PG #19942 is not Fleming's 1901 translation.** It is the 1918 Boni & Liveright Modern Library edition, whose translator is not credited. See G05-candide-01.
3. **Meditations. `books/raw/meditations` (PG #2680) is Casaubon's 1634 translation.** The served text is Long's, from PG #15877. green-meditations already records this.
4. **The Prince. The served original-en is Marriott (PG #1232) alone.** It is neither Dacres 1640 nor a mix. The final "Edward Dacre, 1640." line is Marriott's own credit for the Petrarch verse translation he quotes.

## Method and tool caveats
- I fetched every source once into scratch (`…/scratchpad/groups/G05-featured/src/`) and recorded its sha256 and UTC retrieval time. Line numbers below refer to the downloaded files; CRLF→LF normalisation does not change them.
- I ran `align.py` with k=6 for every source edition, using both `--min 1` and `--min 12`, and inspected every run of 25 or more tokens. I also scanned the shorter runs; they turned out to be headings, footnote numerals, captions and spelling variants.
- **Extra checks:**
  - chapter-boundary checks: each source heading falls between served chapters, and served chapter starts and ends match the source;
  - Odyssey titles compared with Butler's headlines (24/24 identical);
  - a stray-apparatus regex scan (`[n]`, "illustration", "modifica", page markers, Gutenberg words);
  - a modern-en ratio and adjacent-duplicate scan against original-en, for all 9 books;
  - verification that chapter shards (`editions-chapters/`) are identical to the full JSON, for the sharded Crime and Punishment (all editions) and Jane Eyre (original-en, modern-da);
  - comparison of local raws with current Gutenberg files (token-level).
- **Caveats:**
  - `align.py` ignores punctuation and case.
  - In Homer, repeated formulaic lines can mis-map the `after` coordinate of heading runs, so I verified boundaries separately.
  - For Meditations, I stripped Long's indented footnotes by script before the final alignment. One footnote survived, and I explain it below.
  - No Italian *Il Principe* is on Gutenberg, and liberliber.it returned 404. The Wikisource API rate-limited me (HTTP 429), so I read the 27 rendered pages (Dedica, Capitolo I–XXVI; edition "Italia, 1814", proofread SAL 100%). The source hash is the hash of my assembled text.
  - The Fleming 1901 comparison uses archive.org OCR, so its coverage figure is a lower bound. The identification also rests on the opening and closing wording.

---

## frankenstein — Frankenstein

**Served editions**

| Key | sha256 (first 16) | Label |
|---|---|---|
| original-en | `71008d6d1e14b581` | Original (1831) |
| modern-en | `a99352b3bf5f9d1f` | Modern English |
| modern-da | `f52630181990e7ae` | Moderne Dansk |

**Source identified**
- `https://www.gutenberg.org/cache/epub/84/pg84.txt`, retrieved 2026-09-25T11:55:59Z, sha256 `7810cd483cffcf2c…`. "Frankenstein; or, the modern prometheus", Mary Wollstonecraft Shelley. This is the 1831 text with modernised spelling and no front matter.
- Cross-checked against:
  - PG #42324, the 1831 Colburn & Bentley photo-reprint with the Introduction and Preface (`34a453edf60de4b6…`, 11:55:48Z);
  - PG #41445, the 1818 edition (`54b2faba2485a569…`, 11:55:49Z).
- `books/raw/frankenstein/raw.txt` (`06c37d2c…`) is token-identical to the current PG #84 body.

**Body delimitation.** PG #84: "Letter 1" to the END marker (lines 71–7390). PG #42324: INTRODUCTION to "THE END." (lines 60–7652).

**Alignment**

| Source | Source covered | Edition covered | Runs ≥25 | Other |
|---|---|---|---|---|
| PG #84 | 99.926% | 100.0% | 0 | Only the 28 headings unmatched; 0 EXTRA, 0 order, 0 duplicate |
| PG #42324 (1831) | 95.888% | 99.677% | 4 | 74 + 1901 + 720 + 139 tokens = Introduction and Preface; the rest are spelling variants |
| PG #41445 (1818) | 90.12% | 87.27% | — | 187 order anomalies. Not the served text |

**Structural notes.**
- Letters 1–4 and Chapters 1–24 are all present, and every boundary matches.
- The ending is "…lost in darkness and distance." as in the source.
- The modern-en scan found no drops or duplicates.
- The 1818 Godwin dedication and the *Paradise Lost* epigraph are not in the 1831 print, so I did not count them.

**Verdict: DEFECTS.** The body is complete; the 1831 front matter is missing.

| ID | Type | Severity | Location | Extent | Summary |
|---|---|---|---|---|---|
| G05-frankenstein-01 | MISSING | S3 | before 1.0 | 2,825 words | The 1831 Introduction by Mary Shelley and the 1818 Preface are absent from all editions. |

**Evidence for G05-frankenstein-01**
- **Source:** pg42324 lines 60–268 (INTRODUCTION, signed "M. W. S. London, October 15, 1831", 2,248 words) and lines 269–340 (PREFACE, "Marlow, September, 1817", 577 words).
- **Missing text begins:** "The Publishers of the Standard Novels, in selecting "Frankenstein" for one of their series, expressed a wish…"
- **Missing text ends:** "…has been completed. Marlow, September, 1817."
- **Served text after:** 1.0 "_To Mrs. Saville, England._"
- **Local raw:** does not contain it.
- **modern-en:** absent. **modern-da:** absent.
- **Scope:** the label names the 1831 edition, whose title page advertises the "new Introduction, by the author", so the omission is not a deliberate scope choice. It was inherited from PG #84.
- **Existing repair:** none. green-frankenstein (on main, released) checked completeness only against raw.txt, so the successor inherits the gap.

**Open question.** Should the Introduction and Preface be served as front matter? That is an owner decision.

---

## odyssey — The Odyssey

**Served editions**

| Key | sha256 (first 16) | Label |
|---|---|---|
| original-en | `da03f6ac9dfd5a19` | Butler (Prose, 1900) |
| modern-en | `813127d77b4041f6` | Modern English |
| modern-da | `0b8a114304427d3e` | Moderne Dansk |

**Source identified.** `https://www.gutenberg.org/cache/epub/1727/pg1727.txt`, retrieved 11:55:51Z, sha256 `ffbdb29c3dda284b…`. The Odyssey, translated by Samuel Butler. There is no local raw.

**Body delimitation.** "BOOK I" to "FOOTNOTES:" (lines 375–10842). Excluded: Butler's two prefaces (lines 86–369) and his 186 footnotes. Both are translator apparatus (SCOPE).

**Alignment (original-en)**
- Source covered 99.48%; edition covered 99.87%.
- The 6 missing runs of 25 or more tokens, like all the other short runs, are Butler's book argument headlines. These are served verbatim as the 24 chapter titles (checked: 24/24 identical).
- The only EXTRA run of 25 or more tokens is 42 tokens in 3.37, plus 17 + 10 + 8 + 7 + 6 + 3 tokens in the same paragraph.
- 0 order anomalies, 0 duplicates.

**Structural notes.**
- Books 1–24 are all present, and the ending is "…a covenant of peace between the two contending parties."
- modern-en: the only flags are the 3.36~37 duplicate (the splice) and 5.15, which is a condensation with no content loss.
- Cosmetic, and outside this audit: 1,023 of 1,027 original-en paragraphs keep Gutenberg's hard line wraps.

**Verdict: DEFECTS.** The one defect is known and has a staged fix.

| ID | Type | Severity | Location | Extent | Summary |
|---|---|---|---|---|---|
| G05-odyssey-01 | EXTRANEOUS | S2 | 3.37 | 196 words | An invented Nestor speech plus a paraphrase of 3.36 is spliced onto Butler's last clause of Book III. modern-en and modern-da mirror it. |

**Evidence for G05-odyssey-01**
- **Served text before:** 3.36 ends "…so well did their steeds take them."
- **Served 3.37:** 208 words. Only its first clause is Butler's: "Now when the sun had set and darkness was over the land,". This is pg1727 line 1539, the whole of Butler's paragraph.
- **Extraneous text begins:** 'Nestor said, "It is getting late; it is time we were all in bed.'
- **Extraneous text ends:** "…so well did their steeds carry them."
- **Served text after:** 4.0 "They reached the low lying city of Lacedaemon…"
- **modern-en:** the splice is present. **modern-da:** the splice is present.
- **Existing repair:**
  - `origin/claude/admiring-brahmagupta-rb9sws:books/wip/featured-source-cleanup/odyssey/` (commit `7994156f`) truncates original-en 3.37 to the Gutenberg clause. Not released; PR #163 is on hold.
  - `origin/claude/odyssey-modern-en-completion:books/staged-replacements/odyssey/edition/odyssey-modern-en.candidate.json` (`0a76d6ce`) has 3.37 as Butler's clause only.
  - modern-da is listed as "report only" in the package's `downstream-impact.json`, so no modern-da fix exists.

**Nothing else is missing.**

---

## jekyll-and-hyde — Strange Case of Dr Jekyll and Mr Hyde

**Served editions**

| Key | sha256 (first 16) | Label |
|---|---|---|
| original-en | `dc134b812fa478e4` | Stevenson (1886) |
| modern-en | `7bcc0ee81b68635f` | Modern English |
| modern-da | `5cf16e3333eefe1e` | Moderne Dansk |

**Source identified.**
- `https://www.gutenberg.org/cache/epub/43/pg43.txt`, retrieved 11:56:00Z, sha256 `b43448a88391591f…`. This is the served text.
- Cross-checked against PG #42 (`6f5ebfb79a24bb24…`, 11:56:02Z), which prints the 1886 dedication.
- There is no local raw.

**Alignment**

| Source | Source covered | Edition covered | Runs ≥25 | Other |
|---|---|---|---|---|
| PG #43 (story body, lines 58–2583) | 99.826% | 100.0% | 0 | Only the 10 chapter headings unmatched |
| PG #42 (from "TO", line 40) | 98.86% | 99.571% | 1 | 101 tokens: dedication plus contents list. The other differences are #42/#43 readings (e.g. "toward"/"towards") |

**Structural notes.**
- All 10 chapters are present, and the boundaries match.
- The chapter 6 title follows the 1886 heading ("Remarkable Incident of…").
- The ending, "…the life of that unhappy Henry Jekyll to an end.", is served.
- modern-en: no flags.

**Verdict: DEFECTS.**

| ID | Type | Severity | Location | Extent | Summary |
|---|---|---|---|---|---|
| G05-jekyll-and-hyde-01 | MISSING | S3 | before 1.0 | 48 words | The dedication "To Katharine de Mattos" and its 4-line verse (1886 first edition) are absent from all editions. |

**Evidence for G05-jekyll-and-hyde-01**
- **Source:** pg42 lines 40–46.
- **Missing text begins:** "TO KATHARINE DE MATTOS. It's ill to loose the bands that God decreed to bind;"
- **Missing text ends:** "That the broom is blowing bonnie in the north countrie."
- **Served text after:** 1.0 "Mr. Utterson the lawyer was a man of a rugged countenance…"
- **modern-en:** absent. **modern-da:** absent.
- **Existing repair:** none. green-jekyll-and-hyde (on main, released) verified completeness against PG #43 only, so it inherits the gap.

**Open question.** Should the dedication be served as front matter? That is an owner decision; the label names the 1886 edition.

---

## pride-and-prejudice — Pride and Prejudice

**Served editions**

| Key | sha256 (first 16) | Label |
|---|---|---|
| original-en | `6d968f0064565555` | Original (1813) |
| modern-en | `6c80aa42dd447077` | Modern English |
| modern-da | `3c84f6b06dd8258d` | Moderne Dansk (aligned=false) |

**Source identified.** `https://www.gutenberg.org/cache/epub/1342/pg1342.txt`, retrieved 11:56:03Z, sha256 `3f6bb9d6f78e0293…`. This is the George Allen 1894 illustrated text, with Saintsbury's preface. `books/raw/pride-and-prejudice/raw.txt` is token-identical to it; the two upstream typo fixes are punctuation-only.

**Body delimitation.** From the "Chapter I." illustration (line 696) to CHISWICK PRESS (line 14559). Excluded: Saintsbury's Preface (lines 95–695), which is editorial.

**Alignment.**
- Source covered 99.467%; edition covered 100.0%; 0 runs of 25 or more tokens.
- The 115 short unmatched source runs are all illustration captions, "Copyright 1894 by George Allen" lines, one "H.T. Feb 94" caption signature and chapter headings.
- 0 EXTRA runs, 0 order anomalies, 0 duplicates.

**Structural notes.**
- 61/61 chapter starts and ends match the source.
- The #192 cleanup is verified: the served hashes equal the outputs of featured-source-cleanup, and no mid-sentence splits remain.
- modern-en: no flags.
- modern-da still has the pre-#192 structure: 2,060 paragraphs and the 7 illustration splits flagged as MIDSPLIT. This is presence only, since Danish is out of delivery scope.

**Verdict: COMPLETE-VS-SOURCE** (source edition PG #1342). No findings, and no authorial front matter exists.

---

## meditations — Meditations

**Served editions**

| Key | sha256 (first 16) | Label |
|---|---|---|
| original-en | `7798607dc6d8af0a` | Long Translation (1862) |
| modern-en | `4623d1191fbd1c09` | Modern English |

**Source identified.**
- `https://www.gutenberg.org/cache/epub/15877/pg15877.txt`, retrieved 12:00:19Z, sha256 `6584df7e90d6035e…`. "Thoughts of Marcus Aurelius Antoninus", translated by George Long.
- The local raw is PG #2680: `books/raw/meditations/raw.txt` (`b6e3eb0d…`) is token-identical to the current `pg2680.txt` (`6977474f82a39dd8…`). That is **Meric Casaubon's translation**, with Rouse's introduction; its Book I opens "I. Of my grandfather Verus I have learned to be gentle and meek…". The served text is not derived from it.

**Body delimitation.** Long's "THE THOUGHTS" to "INDEXES." (lines 2120–7174). Long's footnotes (183 indented blocks) and his `[A]` markers were removed for the final alignment. Excluded: Long's Biographical Sketch, his essay on the philosophy of Marcus Aurelius, and the indexes (SCOPE).

**Alignment.**
- **Footnotes removed:** source covered 99.903%; edition covered 99.974%; 0 runs of 25 or more tokens. The residue is book headings, 2 illustration captions, and one note citing Aristophanes that the script missed. 0 order anomalies, 0 duplicates.
- **Unfiltered:** 90.82% / 99.90%; every gap is a footnote.

**Structural notes.**
- All 12 books are present, with Long's section counts: 17/17/16/51/36/59/75/61/42/38/39/36, 487 paragraphs in total.
- The ending is "…for he also who releases thee is satisfied."
- The served text numbers section 1 of each book ("1."), which Long leaves unnumbered. This is cosmetic.
- modern-en: no flags.

**Verdict: COMPLETE-VS-SOURCE** (source edition PG #15877, Long). The one finding below concerns the repository's provenance record, not reader-facing text.

| ID | Type | Severity | Location | Summary |
|---|---|---|---|---|
| G05-meditations-01 | MISLABELED | S4 | `books/raw/meditations/SOURCE.md` + `raw.txt` | SOURCE.md says "George Long" but cites PG #2680, and raw.txt is Casaubon's translation. A repair or review that anchors to raw.txt would compare against the wrong translation. |

**Existing repair.** Already recorded as a "Stale repository record" in `origin/claude/wonderful-archimedes-nhig2x:books/wip/green-meditations/ACCEPTANCE-RECORD.md` (`eb856817`). It is not fixed on main.

---

## crime-and-punishment — Crime and Punishment

**Served editions**

| Key | sha256 (first 16) | Label |
|---|---|---|
| original-en | `6609777b2dfca00f` | Garnett Translation (1914) |
| modern-en | `18be4155497ebdf7` | Modern English |
| modern-da | `04df4893cc4340ba` | Moderne Dansk |

All three editions are sharded; I verified the shards are identical to the full JSON.

**Source identified.** `https://www.gutenberg.org/cache/epub/2554/pg2554.txt`, retrieved 11:56:10Z, sha256 `d139120965c81f10…`. Constance Garnett's translation. `books/raw/crime-and-punishment/raw.txt` (`943fb2b8…`) is token-identical to it.

**Body delimitation.** "PART I" to the END marker (lines 136–22097). Excluded: the Translator's Preface (lines 45–135, about 790 words, a biographical note on Dostoevsky), which is editorial (SCOPE).

**Alignment.** Source covered 99.955%; edition covered 100.0%. The only unmatched text is the 41 Part/Chapter/Epilogue headings. 0 EXTRA runs, 0 order anomalies, 0 duplicates.

**Structural notes.**
- The division is Part I (7) / II (7) / III (6) / IV (6) / V (5) / VI (8) / Epilogue (2), which makes 41 chapters, and every boundary matches.
- The ending is "…but our present story is ended."
- modern-en has a MIDSPLIT at 37.0|37.1 ("…“villain and tyrant” / “began kissing Katia.”"). It reproduces the source, which sets the song line on its own indented line, so it is not a defect.
- The "*****" paragraphs are the source's section breaks.

**Verdict: COMPLETE-VS-SOURCE** (source edition PG #2554). No findings.

---

## jane-eyre — Jane Eyre

**Served editions**

| Key | sha256 (first 16) | Label |
|---|---|---|
| original-en | `d05d18103f439a82` | Original (1847) (sharded; shards verified) |
| modern-en | `0488dac58943afde` | Modern English |
| modern-da | `2c2fad5c5aff97de` | Moderne Dansk (aligned=false) |

**Source identified.** `https://www.gutenberg.org/cache/epub/1260/pg1260.txt`, retrieved 11:56:11Z, sha256 `13414dee2951c3ee…`. `books/raw/jane-eyre/raw.txt` (`dd5986f4…`) is token-identical to it.

**Body delimitation.** From PREFACE (line 59) to the END marker (line 21034). This deliberately includes the authorial Preface and Note.

**Alignment.**
- Source covered 99.471%; edition covered 100.0%.
- There is one run of 25 or more tokens: 920 tokens, which is the Preface plus the Note.
- The rest of the unmatched text is the 38 chapter headings and the removed illustration caption "I said my evening prayers" (after 28.5; the #192 cleanup).
- 0 EXTRA runs, 0 order anomalies, 0 duplicates.

**Structural notes.**
- Chapters 1–38 ("Chapter 38 — Conclusion") are all present, and the boundaries match.
- The ending is "…Amen; even so come, Lord Jesus!"
- No illustration captions remain in original-en or modern-en.
- modern-en has a LONG flag at 17.32. The paragraph keeps Adèle's French and adds a gloss, so it is not a defect.
- modern-da still has the pre-#192 structure: 4,047 paragraphs, 13 caption paragraphs, and 11 chapters that are off by 1–3 paragraphs. This is presence only.

**Verdict: COMPLETE-VS-SOURCE** (source edition PG #1260). The front matter is recorded as a scope item.

| ID | Type | Severity | Location | Extent | Summary |
|---|---|---|---|---|---|
| G05-jane-eyre-01 | SCOPE | S3 if treated as a defect | before 1.0 | 892 words | Charlotte Brontë's Preface to the second edition and her Note to the Third Edition are not served. |

**Evidence for G05-jane-eyre-01**
- **What is missing:** the Preface (dedicated to Thackeray, signed Currer Bell, December 1847) and the Note to the Third Edition (April 1848).
- **Why it is defensible:** the label is "Original (1847)", and the first edition had no preface ("A preface to the first edition… being unnecessary, I gave none").
- **Source:** pg1260 lines 59–153 (794 words) and 154–173 (98 words).
- **Missing text ends:** "…to rectify mistakes which may already have been made, and to prevent future errors."
- **Served text after:** 1.0 "There was no possibility of taking a walk that day."
- **Local raw:** contains it.
- **modern-en and modern-da:** absent.
- **Existing repair:** none. Neither featured-source-cleanup (#192) nor green-jane-eyre (`origin/claude/laughing-hypatia-svxsjf`, `d47d80f8`) discusses the front matter.

---

## the-prince — The Prince

**Served editions**

| Key | sha256 (first 16) | Label |
|---|---|---|
| original-it | `f5d8ecdaa3b7380f` | Il Principe (1532) |
| original-en | `288e7bcf4427ef04` | Marriott (1908) |
| modern-en | `d99629fa3c3e1a34` | Modern English |
| modern-da | `ab97b2cfba5114b6` | Moderne Dansk |

**Sources identified**
- **original-en:** `https://www.gutenberg.org/cache/epub/1232/pg1232.txt`, retrieved 11:56:13Z, sha256 `33496a305f7a4b93…`. The Prince, translated by W. K. Marriott. This is Marriott alone: "Edward Dacre, 1640." is Marriott's credit line for the quoted Petrarch verse (lines 3685–3695). There is no local raw.
- **original-it:** it.wikisource.org "Il Principe", edition "Italia, 1814", proofread, SAL 100%. I read the Dedica and Capitolo I–XXVI pages between 12:05 and 12:07Z; the assembled text has sha256 `5ca5c2674425882…`. Its chapter titles and text match the served Italian. The label year, 1532, is the date of first printing, not of this text; that is a VARIANT, not a defect.

**Body delimitation.**
- **PG #1232:** DEDICATION to "Edward Dacre, 1640." (lines 495–3699). Correctly not served: Marriott's Introduction (lines 91–494), the "Description of the Methods… Duke Valentino…" and "The Life of Castruccio Castracani" (lines 3700–4828), which are editorial matter and other works.
- **Wikisource:** Dedica through Capitolo XXVI, including the Petrarch verses.

**Alignment**

| Edition | Source covered | Edition covered | Runs ≥25 | Other |
|---|---|---|---|---|
| original-en | 98.784% | 99.988% | 0 | Only headings and footnote numerals unmatched. Nothing authorial is missing. The footnote texts are served, so they do not appear as missing |
| original-it | 98.698% | 98.991% | 0 | Unmatched source text is headings only. The 94 unmatched edition runs (282 tokens) are exactly the 94 Wikisource page markers |

**Structural notes.**
- Both source editions have the dedication, chapters I–XXVI and the closing Petrarch verses.
- All boundaries match (26/26 in both editions).
- In original-it, two titles are normalised relative to the 1814 print: chapter 6 reads "prima che fossero occupati", and chapter 18 adds "o più presto temuto che amato". This is cosmetic.
- In original-en and modern-en, paragraph 1.0 is the dedication's salutation line served as a paragraph. This is S4 and cosmetic, so I have not listed it as a finding.
- modern-en flags at 18.3 and 19.4 are added glosses, not defects.

**Verdict: DEFECTS.** No authorial text is missing; the defects are non-work text served as reading text.

| ID | Type | Severity | Location | Extent | Summary |
|---|---|---|---|---|---|
| G05-the-prince-01 | EXTRANEOUS | S2 | 48 paragraphs (below) | 1,618 served words | All 48 of Marriott's translator/editor footnotes are served as standalone body paragraphs in 17 chapters (19% of paragraphs), in original-en, modern-en and modern-da. |
| G05-the-prince-02 | EXTRANEOUS | S3 | original-it, 75 of 92 paragraphs | 94 markers | Wikisource "[p. N modifica]" page/edit links (N = 4–102) sit mid-sentence in 25 of 27 chapters. |
| G05-the-prince-03 | MISLABELED | S4 | modern-en and modern-da, 27.14 | 3 words | The credit "Edward Dacre, 1640." now follows a modern prose paraphrase (English) or a Danish verse, so it misattributes them. |

**Evidence for G05-the-prince-01**
- **Coordinates:** 4.3, 4.11, 4.13, 4.14, 4.21, 4.22, 7.8, 8.2, 8.4, 8.8, 8.10, 8.14, 8.15, 8.18, 9.2, 9.7, 10.6, 10.7, 12.3, 12.6, 13.3, 13.8–13.13, 13.16, 14.1, 14.5, 14.11, 14.12, 14.14, 15.3, 18.1, 18.5, 19.0, 19.2, 19.4, 19.9, 19.13, 20.7, 21.6, 22.8, 24.3, 26.1, 27.4, 27.8.
- **Source:** the " [n] …" footnote blocks in pg1232, lines 645–3639: 48 blocks, 1,666 words including markers. Each served paragraph is 100% covered by one block.
- **Example:**
  - 4.2 ends "…which followed from the causes above mentioned."
  - 4.3 (a footnote): "Duke Lodovico was Lodovico Moro, a son of Francesco Sforza…"
  - 4.4 resumes "Nevertheless Milan was taken from France both the first and the second time."
- **Other examples:**
  - Chapter 18 opens (19.0) with "The present chapter has given greater offence than any other portion of Machiavelli's writings." Burd…
  - 14.14 quotes a House of Commons armaments debate.
  - 26.1 quotes Frederick the Great.
  - 4.11 says "See remark in the introduction…", and that introduction is not served.
- **modern-en:** present (all 48). **modern-da:** present (all 48).
- **Existing repair:** none. green-the-prince (`origin/claude/lucid-turing-vhssi3`, `c287c609`) calls the retained footnote paragraphs "an intentional, previously-accepted structural pattern". Its modern-en was released (`books/wip/three-book-release-20260923.json`), so the live successor inherits the defect.

**Evidence for G05-the-prince-02**
- **Example:** 1.0 reads "…considerato che da me non **[p. 4 modifica]**li possa essere fatto maggior dono…". There are 8 markers in chapter 4 and 11 in chapter 20.
- **Affected editions:** original-it only.
- **Existing repair:** none.

**Evidence for G05-the-prince-03.** original-en 27.13 is Dacres' verse and 27.14 is his credit, which is correct. In modern-en, 27.13 reads "Virtue will advance into battle against fury…" (a paraphrase), yet 27.14 still reads "Edward Dacre, 1640."

**Open question.** Should Marriott's notes be dropped, or rendered as notes, before any further modern-en work? The accepted package treats them as body text.

---

## candide — Candide

**Served editions**

| Key | sha256 (first 16) | Label |
|---|---|---|
| original-en | `fd3eff9b64e01756` | Fleming (1901), translator "William F. Fleming" |
| modern-en | `e7fd2a802ac233b8` | Modern English |
| modern-da | `5d461138e1b097dd` | Moderne Dansk |

**Source identified.**
- `https://www.gutenberg.org/cache/epub/19942/pg19942.txt`, retrieved 11:56:14Z, sha256 `fb3943df826f375c…`. "Candide", Voltaire: the Modern Library edition, Boni & Liveright 1918, introduction by Philip Littell, translator not credited (title page at lines 53–88).
- For comparison, the actual 1901 Fleming text (Werner "Works of Voltaire", vol. 1, Smollett revised by Fleming): `https://archive.org/download/worksofvoltairec01voltiala/worksofvoltairec01voltiala_djvu.txt`, retrieved 12:09:38Z, sha256 `9d141a78ae59b879…`.
- For the French original, PG #4650 (`1cc10ab3268a76aa…`).
- `books/raw/candide` holds SOURCE.md only; it repeats the Fleming attribution.

**Body delimitation.** PG #19942 from the "[Illustration: VOLTAIRE'S CANDIDE]" line to "FOOTNOTES:" (lines 306–4151). Excluded: Littell's introduction and the 35 editorial endnotes (SCOPE).

**Alignment**

| Source | Source covered | Edition covered | Runs ≥25 | Other |
|---|---|---|---|---|
| PG #19942 | 98.944% | 100.0% | 0 | Only the 30 chapter headings unmatched; 0 EXTRA, order or duplicate |
| Fleming 1901 OCR (Candide part 1) | 26.3% | 31.3% | — | A different translation |

**Structural notes.**
- Chapters 1–30 are all present, and the boundaries match.
- Chapter 22 carries the 1761 additions (the Parolignac episode).
- The ending is "…but let us cultivate our garden."
- modern-en: no flags; its note markers were removed.
- Voltaire's title-page fiction ("traduit de l'allemand de M. le docteur Ralph…") is absent from the 1918 translation itself. That is SCOPE: a property of the translation.

**Verdict: DEFECTS.** The text is complete against its real source; the label is wrong.

| ID | Type | Severity | Location | Extent | Summary |
|---|---|---|---|---|---|
| G05-candide-01 | MISLABELED | S3 (label only; a reviewer may read it as S2 "wholesale mislabelling") | `app/src/data/bookRegistry.ts:2278-2280`; `books/raw/candide/SOURCE.md` | whole edition | The edition is labelled "Fleming (1901)", translator William F. Fleming, but the served text is the uncredited 1918 Modern Library translation (PG #19942). |
| G05-candide-02 | EXTRANEOUS | S4 | 34 markers from 1.2 to 27.7 | 34 tokens | Note-reference numerals [1]–[33] and [35] are served inline, but the notes are not served, so every marker dangles. |

**Evidence for G05-candide-01**
- **Served opening:** "In a castle of Westphalia, belonging to the Baron of Thunder-ten-Tronckh, lived a youth…"
- **Fleming 1901 opening:** "In the country of Westphalia, in the castle of the most noble baron of Thunder-ten-tronckh…"
- **Served close:** "let us cultivate our garden". **Fleming close:** "let us take care of our garden".
- **Existing repair:** none. green-candide (released) does not name the translation.

**Evidence for G05-candide-02.** 1.2 reads "The Preceptor Pangloss[1] was the oracle of the family…". The complete list of markers is in the JSON file.

**Open question.** Should the edition be relabelled as the 1918 Modern Library translation (translator uncredited), or re-sourced from the true 1901 Fleming text?

---

## Existing packages reconciled

| Package | Bearing on these findings |
|---|---|
| featured-source-cleanup (`admiring-brahmagupta-rb9sws`, `7994156f`) | Fixes G05-odyssey-01 in original-en; not released. Its Jane Eyre and P&P structure is live (#192) and verified. It does not address the Jane Eyre Preface. |
| Staged Odyssey modern-en (`odyssey-modern-en-completion`, `0a76d6ce`) | Fixes the modern-en side of G05-odyssey-01; modern-da is not fixed. It inherits no other gap, because the Butler body is complete. |
| green-frankenstein, green-jekyll-and-hyde (main, released) | Completeness was checked only against the imported PG #84 and #43. They inherit G05-frankenstein-01 and G05-jekyll-and-hyde-01. |
| green-meditations (`wonderful-archimedes-nhig2x`) | Already documents G05-meditations-01; the served Long text is verified complete. |
| green-crime-and-punishment (`awesome-euler-pjc7jv`) | Consistent with this audit: the only omission it records is the translator's preface (SCOPE). |
| green-pride-and-prejudice (`upbeat-dirac-jw9ghg`), green-jane-eyre (`laughing-hypatia-svxsjf`) | No completeness gaps are recorded; the Jane Eyre front matter is not discussed. |
| green-the-prince, green-candide (`lucid-turing-vhssi3`, released via three-book-release) | They inherit G05-the-prince-01 (explicitly accepted there), G05-the-prince-03 and G05-candide-01. |
