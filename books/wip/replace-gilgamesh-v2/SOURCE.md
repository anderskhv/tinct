# Source and rights evidence - Gilgamesh replacement v2

Retrieval date: 2026-10-01. Package author: Claude (content-only task `replace-gilgamesh-v2`). Rights rule applied for Anders in Denmark: **every credited translator, editor and contributor must be verifiably dead by 1954** (life + 70 expired before 2025). All three works are also US pre-1931 publications.

## What the editions contain

| Source | Credited as | Used for | Paragraphs | Modern words |
|---|---|---|---|---|
| William Muss-Arnolt, "The Gilgamesh Narrative", in R. F. Harper (ed.), *Assyrian and Babylonian Literature*, New York: D. Appleton, 1901, pp. 324-369 | Muss-Arnolt (translator), Harper (editor) | Base text, Tablets I-XII (Nineveh/Neo-Assyrian epic, Haupt numbering) | 116 | 7,619 |
| M. Jastrow Jr. and A. T. Clay, *An Old Babylonian Version of the Gilgamesh Epic*, Yale Oriental Series Researches IV.3, New Haven: Yale UP, 1920, translations of the Pennsylvania tablet (pp. 62-68) and Yale tablet (pp. 87-95) | Jastrow and Clay ("The transliteration and the translation of the two tablets represent the joint work of the two authors", Prefatory Note) | Supplement: Tablet II (Penn tablet), Tablets III-IV (Yale tablet). A separate, older (c. 1700 BC) recension, not merged with the Nineveh text | 32 | 2,006 |
| Robert William Rogers, *Cuneiform Parallels to the Old Testament*, New York: Eaton & Mains, 1912, ch. V pp. 82, 83, 87 ("Translated and edited by Robert William Rogers", title page) | Rogers | Four short paragraphs: Tablet I (one line), VII (dream frame), VIII (lament) | 4 | 138 |

No other translator was used. Text from different sources is never merged inside one paragraph; `provenance-map.json` tags every paragraph with source, pages and notes. Thompson 1928 remains rejected (credits Johannes Friedrich, d.1972). Sandars, Kovacs, George, Mitchell, Colavito and all other living or post-1954 translators were not consulted.

Archive URLs, SHA-256 hashes of the OCR files, and hashes of the retained excerpts are in `extracts/download-manifest.json`. The retained excerpts (`extracts/*.txt`) are the OCR passages the text was taken from. Extraction method: OCR proofread against page images for all Jastrow-Clay translation pages (printed pp. 62-68, 87-95), the Rogers pp. 83 and the Muss-Arnolt p. 335; remaining Muss-Arnolt text was extracted from the OCR and checked by a 3-gram verbatim test against it (every Muss-Arnolt paragraph passes except three, Tablet II p. 331-332, Tablet VIII p. 342 and Tablet X p. 347, where a footnote marker or spaced quotation mark interrupts the OCR; those were compared by eye). Jastrow-Clay paragraphs fail the automatic test only where the OCR interleaves transliteration columns; they were read against the page images instead (pp. 62-68 except 69 commentary, and 87-95). Page-image URL pattern: `https://archive.org/download/{id}/page/n{N}_w1100.jpg`.

## Contributor rights evidence

"Fetched" means the page was retrieved in this session and the quoted text was present. "Carried" means the evidence is taken from the earlier Codex package `origin/content/replace-gilgamesh-codex` SOURCE.md; the page could not be re-fetched here because it is script-rendered, so treat it as unverified by me.

### Muss-Arnolt package (carried from Codex v1, re-checked where marked)

- William Muss-Arnolt (translator): https://en.wikipedia.org/wiki/William_Muss-Arnolt - fetched: "(May 7, 1860 in Cologne - June 25, 1927 in New York)". Second source (carried): https://www.nli.org.il/en/archives/NNL_ARCHIVE_AL997013032349805171/NLI "Muss-Arnolt, William ,(1860-1927 author)". Third (fetched): Open Library author OL2393982A lists birth 1860 (no death date).
- Robert Francis Harper (editor): https://photoarchive.lib.uchicago.edu/db.xqy?show=browse1.xml%7C1241 - fetched: "Harper, Robert Francis, 1864-1914". Archive.org catalog record of the volume (fetched via metadata API): "Harper, Robert Francis, 1864-1914. Assyrian and Babylonian literature; 1901 New York, D. Appleton and company". Open Library OL2500683A: 1864-1914. Carried: https://www.loc.gov/item/01030867/.
- Series editor and selection committee (carried from Codex v1; this session re-fetched the first source of each): Rossiter Johnson - Wikipedia "(27 January 1840 - 3 October 1931)" fetched; Open Library OL114083A 1840-1931 fetched; NYPL carried. Thomas Brackett Reed - Wikipedia "(October 18, 1839 - December 7, 1902)" fetched; https://history.house.gov/HistoricalHighlight/Detail/35912 "Reed died on December 7, 1902" fetched. Ainsworth Rand Spofford - Wikipedia "(September 12, 1825 - August 11, 1908)" fetched; Open Library OL316719A "12 Sep 1825 - 11 Aug 1908" fetched. Edward Everett Hale - Wikipedia "(April 3, 1822 - June 10, 1909)" fetched; Open Library OL316805A 1822-1909 fetched. William Rainey Harper - Wikipedia "(July 24, 1856 - January 10, 1906)" fetched; Open Library OL350740A 1856-1906 fetched.

### Morris Jastrow Jr. (1861-1921) - co-translator of the Old Babylonian passages

1. https://en.wikipedia.org/wiki/Morris_Jastrow_Jr. - fetched: "Morris Jastrow Jr. (August 13, 1861 - June 22, 1921) was a Polish-born American orientalist".
2. https://openlibrary.org/search/authors.json?q=Morris+Jastrow - fetched: record OL2897386A "Morris Jastrow Jr.", birth 1861, death 1921. Also https://en.wikisource.org/wiki/Author:Morris_Jastrow "(1861-1921)" and the archive.org catalog heading "Jastrow, Morris, 1861-1921" on item `anoldbabylonianv00jastuoft`.

### Albert Tobias Clay (1866-1925) - co-translator and editor of the Yale tablet text

1. https://en.wikipedia.org/wiki/Albert_T._Clay - fetched: "Albert Tobias Clay (December 4, 1866 - September 14, 1925) ... a position which he held until his death in 1925".
2. Open Library OL1319252A "Albert Tobias Clay", birth 1866, death 1925 (fetched); archive.org catalog heading "Clay, Albert Tobias, 1866-1925".

### Robert William Rogers (1864-1930) - translator and editor

1. https://en.wikisource.org/wiki/Author:Robert_William_Rogers - fetched: "Robert William Rogers (1864-1930)" ... "This author died in 1930".
2. Open Library OL1919261A "Rogers, Robert William", 1864-1930 (fetched); archive.org catalog heading "Rogers, Robert William, 1864-1930" on item `cu31924026822175`.

### Other persons named in the three books

- Jastrow-Clay Prefatory Note: introduction, commentary and appendix by Jastrow alone; Yale-tablet text by Clay; translation joint. Acknowledged but not translators or editors: Edward Chiera (collation help, d.1933), Dr. Gordon of the Pennsylvania Museum (access), Arno Poebel (identified the Pennsylvania tablet and made an unpublished copy, d.1958, **not used**), C. E. Keiser (transliteration accent system only; transliteration is not used). The Pennsylvania tablet's first editor, Stephen Langdon (d.1937), is criticised in the book and not used.
- Rogers preface: Stephen Langdon (d.1937) read the religious texts in manuscript; Rudolph Brünnow (d.1917, Wikipedia "April 14, 1917") read proofs. Footnote 4 on p. 81 of the Gilgamesh chapter: the translation "owes most to Jensen" (d.1936) and "Here and there a word or suggestion has been caught from Ungnad, Dhorme, and others". Arthur Ungnad d.1947 (Wikipedia "(1879-1947)", fetched). **Paul Dhorme died 1966** (general knowledge; the Wikipedia page I fetched shows no date clause, so this is not clause-verified).

## Rights doubts (please read)

1. **Rogers / Dhorme.** Rogers is the only credited translator and died 1930, but he acknowledges taking "a word or suggestion" from Paul Dhorme (d.1966) among others. This is an acknowledgement of influence, not a credit, and single-word suggestions are not copyrightable subject matter, but it is not covered by a strict "every contributor d.<1955" reading. Isolated risk: four paragraphs (Tablet I para 2; Tablet VII para 1; Tablet VIII paras 4 and 5), 138 modern words. They can be deleted without affecting any other paragraph; the cost is that Tablet VII would lose its dream frame and Tablet VIII its lament.
2. **Poebel / Pennsylvania tablet.** Poebel (d.1958) is named as the identifier and copyist of the Penn tablet; the translation printed here is Jastrow and Clay's from Clay's collation, and Jastrow explicitly disclaims dependence on Langdon's edition. I regard this as no doubt, but note it.
3. **Carried evidence.** Several second sources for the Muss-Arnolt/Harper package (NLI, LoC, NYPL, LoC finding aid, UChicago library page) could not be re-fetched in this session. Open Library and Wikipedia re-checks agree for every person except Muss-Arnolt's death date, which rests on Wikipedia plus the carried NLI heading.
4. Muss-Arnolt's own notes cite readings by Jensen, Jeremias, Jastrow and others; I found no verbatim reuse of anyone's published translation in the printed lines.

## Edition and independence gates (see HANDOFF.md)

original-en is the free historical text kept as printed (including the translators' gap marks, brackets, "(?)" and asterisks); it is exempt from the overlap gate. modern-en is a fresh paragraph-by-paragraph rendering compared against both protected live English files with `overlap-check.py --allow original-en`.
