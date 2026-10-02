# Source record: Rousseau, Discourse on the Origin of Inequality (`discourse-on-inequality`)

Work: Jean-Jacques Rousseau (1712-1778), *Discours sur l'origine et les fondements de l'inegalite parmi les hommes* (1755).
English witness: *A Discourse upon the Origin and Foundation of the Inequality among Mankind*, "By John James Rousseau, Citizen of Geneva", London: printed for R. and J. Dodsley, in Pallmall, MDCCLXI [1761]. Anonymous English translation. ESTC T62622; lx + 260 pages.
Replaces the live G.D.H. Cole text (Cole d. 1959; life+70 not run out in Denmark). No Cole wording was read or used. Package prepared 2026-10-02.

## Rights evidence (checked independently by this agent, 2026-10-02)

Rousseau d. 2 July 1778.
- BnF authority record https://catalogue.bnf.fr/ark:/12148/cb119228797 : "Mort : 1778-07-02, Ermenonville (Oise)" (re-fetched and read).
- Second source: the Gutenberg #11136 introductory note (read here) and the Oxford University Press key-thinker page cited by the Codex package (src/codex-source-manifest.json; not re-fetched by this agent). The note ("died at Ermenonville ... July 2, 1778").

The translation is anonymous and credits no living-range contributor. Two or more independent sources, all checked:
1. Wikisource, page for the translation (re-fetched): "Translation: This work was published before January 1, 1931 and is anonymous or pseudonymous due to unknown authorship."
2. ESTC T62622 as mirrored by the University of Saskatchewan Grub Street Project https://www.grubstreetproject.net/publications/T62622/ (re-fetched): lists only "Jean-Jacques Rousseau (Author)"; no translator, editor or adapter; imprint exactly as above.
3. Internet Archive item `discourseuponor00rous` (Princeton Theological Seminary Library copy), metadata (re-fetched): creator "Rousseau, Jean-Jacques, 1712-1778", publisher "London, R. and J. Dodsley", date 1761, `possible-copyright-status: NOT_IN_COPYRIGHT`. Title-page OCR (src/ia-djvu.txt) names only Rousseau.
4. Open Library OL13520063M (re-fetched): R. and J. Dodsley, 1761; no translator or contributor.
5. Project Gutenberg #11136 (a 1910 Harvard Classics reprint of the same translation), transcriber's note (src/pg11136.txt, end): "The name of the translator was not given, nor was the name of the author of the introduction."
Conclusion: anonymous London translation of 1761; no translator, editor or adapter is credited anywhere; the work was published 265 years ago, so any person who could plausibly have produced it died long before 1954 (translator would have to be alive and adult in 1761). Publishers (Dodsley) are not authors of the translation. No later editorial matter is used: the Harvard Classics introductory note and Eliot's editorship of the 1910 reprint are NOT included; the Harvard/PG text was used only as a completeness witness.

## Text actually used for original-en

Chosen witness: the 1761 text as transcribed by Wikisource (validated transcription of a different scan of the same edition, IA `discourseuponori00rous`, John Adams copy), extracted by the earlier Codex window (src/codex-original-en.json, SHA-256 e4fab465...1cbe, record of the eight Wikisource chapter pages and hashes in src/codex-source-manifest.json). That package's HTML snapshots remain on branch `content/replace-discourse-on-inequality-codex` under `books/wip/replace-discourse-on-inequality/source/`.
Gutenberg #11136 alone was NOT used as the witness: it is the 1910 Harvard respelling with modernised capitalisation and, as confirmed here, it omits the Dedication, the Preface, the Advertisement and the Notes (it contains only the Question, the Exordium and the two Parts).

Completeness verification against two independent witnesses (scripts in this folder's history; numbers from this session):
- Dedication, Preface, Exordium+Parts versus the IA OCR of `discourseuponor00rous` (a third scan, no Wikisource involvement), word-sequence alignment after folding OCR long-s: Dedication 4107 of 4340 words aligned, Preface 2236 of 2356, Exordium+First+Second Part 24685 of 26238 (remainder = OCR noise, running headers and catchwords). No unmatched block of source text in any of these.
- Exordium, First Part and Second Part versus Gutenberg #11136: 4-gram coverage 0.90-1.00 on every paragraph (differences are Harvard respelling only). No paragraph of Gutenberg missing from the extraction and no extra paragraph in it.
- Paragraph counts: Exordium 7 (+1 Question), First Part 51, Second Part 59, Dedication 23, Preface 13.

## What is included, what is not

Included (both editions, paragraph-aligned): Dedication to the Republic of Geneva (salutation joined to paragraph 1; signature and "Chamberi, 12 June, 1754" are the last paragraph), Preface, Exordium (the Academy of Dijon question as paragraph 1, then the introductory discourse), First Part, Second Part.
Excluded by decision (apparatus, per assignment): Rousseau's nineteen Notes (Wikisource chapter "Notes", 61 paragraphs, ~14,700 words, available in src/codex-original-en.json chapter 8 for a later, separately approved batch), the "Advertisement Concerning the Notes", the Aristotle epigraph on the title page, and all editorial/transcriber material. The note-call markers "(1)" to "(19)" are removed from original-en text (19 deletions of the form " (n)"); nothing else in the 1761 wording is changed.

## original-en cleanup (light only)

From the Codex extraction: long s rendered as s, straight quotation marks and apostrophes, original spelling, capitalisation and Latin retained (non-ASCII limited to the characters in "Ægypt", "quæ", "gravidæque", "Abbé", and circumflexed Latin a in "Humanâ quâ", "vitâ", "dextrâ"). Chapter titles are reader-facing labels. This agent made the following changes only: removal of note-call markers; chapter regrouping (Question + Introduction -> Exordium); titles "Dedication: To the Republic of Geneva", "Preface", "Exordium", "First Part", "Second Part".

## Attribution

Wikisource contributors, "A discourse upon the origin and foundation of the inequality among mankind", English Wikisource, validated transcription of IA scan discourseuponori00rous; text offered under CC BY-SA by Wikisource. The underlying 1761 text is public domain; a faithful transcription of a public-domain text normally carries no independent copyright, but credit and licence notice are retained here (https://creativecommons.org/licenses/by-sa/4.0/). See "Rights doubts" in HANDOFF.md.

## modern-en

Written fresh, paragraph by paragraph, from the 1761 text in the contributor's own words (no Cole text, no Johnston/other later translation, no bulk regex). Latin quotations kept as Latin except the two verse passages that overlapped the protected editions at token level (Second Part paragraphs 30 and 54), which are given in the contributor's own English rendering; Preface paragraph 13 (Persius) and the Hobbes passage's Latin phrase in First Part paragraph 34 are kept in Latin.
