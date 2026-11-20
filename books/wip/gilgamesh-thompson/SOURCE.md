# Source and rights evidence: Gilgamesh, R. Campbell Thompson 1928

Retrieval date: 16 Nov 2026. Package: `books/wip/gilgamesh-thompson/` (content-only task, approved by Anders 16 Nov 2026).

## The source

R. Campbell Thompson, *The Epic of Gilgamish: a new translation from a collation of the cuneiform tablets in the British Museum rendered literally into English hexameters*. London: Luzac & Co., 46 Great Russell Street, 1928. Printer: Sharp and Sons, Bath. 60 printed pages. Preface signed "R. Campbell Thompson. Nineveh, Christmas, 1927."

- Internet Archive item `thompson-1928-gilgamesh` (https://archive.org/details/thompson-1928-gilgamesh), a Google Books scan uploaded by Robert Bedrosian on 27 Mar 2024. The archive.org metadata lists the creator as "R. Campbell Thompson". The PDF metadata gives the author as "Reginald Campbell Thompson".
- File hashes are in `extracts/download-manifest.json`. The tesseract OCR text is kept in `extracts/thompson-1928-djvu-ocr.txt`. The PDF (2.1 MB) is not committed; its hash is recorded.
- The uploader's description says that an HTML of N. K. Sandars' prose translation is attached to the PDF. Sandars' translation is in copyright. It was not opened, extracted or used. Only Thompson's printed pages were used: the page images and the two OCR layers.
- `epicgilgamish0000rcam` (Thompson's 1930 text edition) was not needed. Every page of the 1928 scan is legible.

**Transcription method.** Every text page (printed pp. 9-60) was read from the page image. The resulting `original-en` was then checked against both OCR layers (Internet Archive tesseract and the Google PDF text layer). 99.0% of its word trigrams occur in the OCR. The only misses are OCR artifacts: accented "removéd", and joins across gap dots. Thompson's own Addenda et Corrigenda (p. 6) were applied; `provenance-map.json` lists them under "conventions".

## Is it Thompson's own translation?

Yes. The title page reads "A new translation ... by R. Campbell Thompson". In the Preface he says that he has "done my utmost to preserve an absolutely literal translation" and that "The present version is based on a fresh collation of the original tablets in the British Museum." He credits earlier editors of the cuneiform *texts* (Smith, Rawlinson, Pinches, Sayce, King, Haupt, Langdon, Clay, Jastrow, Meissner, Weidner, Friedrich, Ungnad). Those are acknowledgements of text editions, not of English wording. The Assyrian, Old Babylonian and Akkadian Boghazköy passages are his own translations from cuneiform.

**One exception: the Hittite passages.** Thompson did not translate the Hittite version from the original. His footnotes say so:

- p. 31 (Fifth Tablet, Col. VI, the fight with Humbaba): "Translation from J. Friedrich, *Alter Orient*, 25, 2. 31, and Ungnad, *Kulturfragen*, 4-5, 20."
- p. 36 (Seventh Tablet, Col. I, the gods' council): "Translation by Friedrich, and Ungnad."

So these English passages are Thompson's English rendering of German translations by Johannes Friedrich and Arthur Ungnad. See rights doubt 1 below.

## Rights evidence

| Person | Role | Life dates | Evidence (fetched 16 Nov 2026) |
|---|---|---|---|
| Reginald Campbell Thompson | Translator; sole credited author | 21 Aug 1876 - 23 May 1941 | Wikidata Q1918460: born 1876-08-21, died 1941-05-23. Open Library OL6033550A "Reginald Campbell Thompson, 21 August 1876 - 23 May 1941". |
| Johannes Friedrich | His German translation of the Hittite version is the basis of 3 paragraphs | 27 Aug 1893 - 12 Aug 1972 | Wikidata Q72333 "German linguist (1893-1972)". Wikipedia disambiguation: "Johannes Friedrich (linguist) (1893-1972), German hittitologist". |
| Arthur Ungnad | Same 3 paragraphs, with Friedrich | 1879 - 1947 | Wikidata Q711755 "German orientalist (1879-1947)". Open Library OL837378A, born 1879. |
| C. J. Gadd | Suggested the single word "ale-wife" for Siduri (Addenda p. 6). It is a suggestion only; the printed text says "Wine-maker". | d. 1969 (general knowledge, not fetched) | Acknowledgement only. No text of his is used. |
| Sir John Miles; Sidney Smith; H. R. Hall; Sir Frederick Kenyon | Thanked in the Preface for "shrewd suggestions" and for help and access | Miles d. 1963; Smith d. 1979; Hall d. 1930; Kenyon d. 1952 (general knowledge, not fetched) | Acknowledgements only. No text of theirs. |
| Ernst Weidner | Published the cuneiform copy (KUB IV 12) of the Akkadian Boghazköy fragment that Thompson translates in a note (Tablet V para 5) | d. 1976 (general knowledge) | A copy of an ancient text, not a translation; Thompson's English is his own. |
| Col. W. H. Beach | Dedicatee | n/a | No contribution. |

**United States.** Published in 1928, so public domain in the US since 1 Jan 2024 (95-year term for works published 1928).

**Denmark / EU (life + 70).** Thompson died in 1941, so his work has been in the public domain since 1 Jan 2012. This covers everything in the package except the Friedrich/Ungnad-derived Hittite passages (doubt 1).

## Rights doubts (please read)

1. **Friedrich-derived Hittite paragraphs (3 paragraphs, 414 original words).** These are Tablet V paras 6-7 (the Sun-god's winds, Humbaba's surrender and plea) and Tablet VII para 2 (the gods' council: "Enkidu shall die"). Thompson's English is expressly a translation of Friedrich's (and Ungnad's) German. Friedrich died in 1972, so his German translation is protected in the EU until the end of 2042. An English rendering of it may be a derivative work under a strict reading. On the other side: Friedrich's *Alter Orient* 25/2 was published in 1925, so it is public domain in the US, and Ungnad (d. 1947) is clear everywhere.
   - Under the strict rule applied to v2 (every contributor dead before 1955), these three paragraphs fail. Most likely this is why v2 rejected Thompson ("credits Johannes Friedrich, d.1972").
   - The paragraphs are isolated: each is its own paragraph in all three editions, and `provenance-map.json` marks it `rightsFlag: FRIEDRICH`. Dropping them deletes the same three indices from original-en, modern-en and modern-da. No other paragraph depends on them.
   - The cost of dropping them: Tablet V loses the account of how Humbaba is beaten. It would go straight from the dreams to "they cut off the head of Humbaba". Tablet VII loses the scene that explains why Enkidu must die.
   - **Needs your decision:** keep them (US-clean; the EU risk is limited to 414 words resting on a 1925 German scholarly translation) or drop them. Recommendation: drop them if the EU strict rule is policy. The epic stays coherent, but those two beats are lost.
2. **The rest of Thompson.** Wording, verse, name forms, notes and corrigenda are Thompson's alone. No doubt.
3. **The modern-en and modern-da renderings** were written fresh in this session from Thompson's text. They share no 8-word run with the old live (Colavito-based) English or Danish files: `gates-last-run.txt`, overlap-check at n=10 and n=8, 0/161 each. The old live text was read only through `git show` into a scratch directory outside the repo, and only as overlap-check input.
