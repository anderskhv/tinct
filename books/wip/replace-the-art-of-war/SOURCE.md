# Source record

Retrieved 2026-10-01. Selected edition: Sun, The Book of War: The Military Classic of the Far East, translated from Chinese by Captain E. F. Calthrop, R.F.A., London: John Murray, 1908. Only The Articles of Suntzu, printed pages 17–74, is included.

## Rights evidence

1. https://www.wikidata.org/wiki/Q110580075 — exact displayed field: "date of death" / "19 December 1915"; additional referenced year: "1915". Consulted through the web reader. The entity JSON download returned HTTP 403; no failed-response file retained.
2. https://archive.org/metadata/bookofwarmilitar00suntuoft — exact catalogue creator heading: "Calthrop, Everard Ferguson, 1876-1915". Independent University of Toronto / Robarts catalogue scan, publisher "London J. Murray", date "1908". Metadata downloaded intact.
3. The 1908 title page, independently transcribed in both the scan OCR and Gutenberg: "TRANSLATED FROM THE CHINESE BY CAPTAIN E. F. CALTHROP, R.F.A." (case and whitespace vary). No additional editor or adapter is credited on the title page.
4. Ancient author: the archive creator field states "Sun-tzu, 6th cent. B.C"; Gutenberg's header independently states "Author: active 6th century B.C. Sunzi". The ancient original predates 1800 by many centuries.

Calthrop is the sole credited translator. No modern editorial contribution, introduction, notes, or adaptation is included. His 1915 death meets the assignment's death-by-1954 rule. Modern transcription is used only to recover the 1908 text; its editorial notes and corrections are excluded. This package relies on the dates above, not the archive's US copyright classification.

## Downloads

- pg44024.txt: https://www.gutenberg.org/cache/epub/44024/pg44024.txt (ebook record https://www.gutenberg.org/ebooks/44024).
- scan-ocr.txt: https://archive.org/download/bookofwarmilitar00suntuoft/bookofwarmilitar00suntuoft_djvu.txt.
- archive-metadata.json: https://archive.org/metadata/bookofwarmilitar00suntuoft.

## Extraction

Extract the second Articles heading through the second Sayings heading. Preserve thirteen source chapter titles and blank-line paragraphs. Join physical wrapped lines; remove italic underscore markup and numbered footnote anchors. Exclude all footnotes, both introductions, Wutzu, transcriber notes and advertisements. Source uses straight quotation marks and apostrophes. Standalone speech introductions and list lead-ins are retained as separate source paragraphs. Restore the printed spelling "frought" at page 40 instead of the transcriber's "fraught" correction. No other modern editorial corrections affect this selection.

## SHA-256

- archive-metadata.json: `291167bdb62c32cce277078c08be0b670f4e103a06455d8c1041b97324188b73`
- pg44024.txt: `e7c0c40f0eb0113715f009977b1bf249cfac8d67f0b6be1a3498290ddb25ade9`
- scan-ocr.txt: `669230af6adb8af6f7b5416d82a0ba4e030a496fd8693d7f0e2d476c70832c35`

The transcribed colon-plus-double-hyphen at paragraph ends is represented by a colon, preserving the source lead-in and paragraph boundary. No source words changed for this punctuation cleanup. Scan OCR XML: https://archive.org/download/bookofwarmilitar00suntuoft/bookofwarmilitar00suntuoft_djvu.xml; SHA-256 `cdf098f15e18c59c8aa64e693eb35f49e013aa61729685f6465d559305645a08`.

## Explicit overlap-repair departures

The delivered original-en is a Calthrop-based edited source, not a wholly verbatim transcription: the assignment's gate-d instruction to re-render flagged paragraphs is applied at chapter 9 paragraph 31 and chapter 12 paragraph 8 (one-based coordinates). Their exact before/after wording is recorded in qa/source-departures.json. This resolves the conflict between the verbatim-source requirement and the numeric overlap threshold using the assignment's explicit repair instruction; it is not a discovered historical variant. An optional clarification was offered but no response was received; no new approval is claimed. The source wording is separately preserved in source/calthrop-verbatim-extracted.json. The modern text was composed from Calthrop, not from the protected reference.

The remaining three N=8 flags are short formulaic wording in source paragraphs 12:6 (camp fire), 13:5 (ruler and general), and 13:22 (use of spy categories). Each has exactly eight words in shared runs. The coordinate-only checker does not reveal the reference wording. No match was investigated by opening the reference.

## Additional downloaded images and complete source hashes

The downloaded JPEGs use https://archive.org/download/bookofwarmilitar00suntuoft/page/nN.jpg, where N is the number in the filename. Leaf 6 is the title page; 7 is its blank verso; 20 is printed page 17; 43 is page 40; 77 is page 74. Title page, opening, printed spelling on page 40, and final page were visually inspected. All retrieved on 2026-10-01. The scan XML provides independent OCR for the full selection. Raw files are retained unchanged.

- archive-metadata.json: `291167bdb62c32cce277078c08be0b670f4e103a06455d8c1041b97324188b73`
- calthrop-verbatim-extracted.json: `9ff95e59dbabb51833515ba85ecf5eef4d38436afe7601591eeebf847eb4b327` (derived extraction, not a download)
- pg44024.txt: `e7c0c40f0eb0113715f009977b1bf249cfac8d67f0b6be1a3498290ddb25ade9`
- scan-djvu.xml: `cdf098f15e18c59c8aa64e693eb35f49e013aa61729685f6465d559305645a08`
- scan-leaf-20.jpg: `5c46485e49b94b52128be01421a1a56b0c09b8d7e16fb0d67bb1361cccffd32d`
- scan-leaf-43.jpg: `f29b04ba46f22947fa656da593e993fd1593cedc448efdfbbdc2644abd72fcb2`
- scan-leaf-6.jpg: `ad1d785a1695cc34287508aba8f3c10d83eb5ca6cf3cb5ff43967dd167334576`
- scan-leaf-7.jpg: `c64cb8e380e28b6a2a8d6327f6bacb140d38d847482e7687b9eaa8f0394319db`
- scan-leaf-77.jpg: `53bbdc8fcba62616d7171af1f98885a488c2ab90c08668b70889ac95df1b24f7`
- scan-ocr.txt: `669230af6adb8af6f7b5416d82a0ba4e030a496fd8693d7f0e2d476c70832c35`
