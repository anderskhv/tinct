# Sense and Sensibility — source record

Retrieved 2026-09-30 from https://www.gutenberg.org/ebooks/161.txt.utf-8
Catalogue: https://www.gutenberg.org/ebooks/161
Raw SHA-256: `22272ec4d4da2f50cda51edf34ab8486b325c4a99580120db565fb8917228a22`
Parsed original-en SHA-256: `26ccda9547c41d41a808e57c43834c4d9199f9164f7872e297cca4b73820d4c0`

Verified raw header before parsing: `Title: Sense and Sensibility`; `Author: Jane Austen`; eBook #161. This is the novel, first published in 1811. The downloaded header says updated March 16, 2021; the catalogue says March 31, 2021. The byte hash identifies the actual downloaded revision. No translator; English original. Gutenberg mentions another edition (#21839); no text from it has been mixed into this baseline.

## Rights evidence

Jane Austen died in 1817 (Gutenberg author metadata: Austen, Jane, 1775–1817). The catalogue marks this ebook public domain in the USA. Denmark's Copyright Act §63 provides a term of 70 years after the author's death year: https://www.retsinformation.dk/eli/lta/2023/1093 . EU Directive 2006/116/EC, Article 1(1), provides life plus 70 years: https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32006L0116 . Austen's 1811 novel is beyond these terms; public domain in Denmark/EU and the US. This conclusion covers Austen's text, not any modern introduction, illustration or translation. None is included. Gutenberg licensing and trademark boilerplate remains in the archived raw download, excluded from the reading edition.

## Parsing and boundary verification

Existing `books/parse-gutenberg.py` with pattern `^CHAPTER [IVXLCDM]+\.$`; explicit staged output. This selects 50 body headings and excludes the unpunctuated table of contents. Removed terminal `THE END` and `END OF THE FIRST VOLUME` / `END OF THE SECOND VOLUME` as end markers. Excluded title page, illustration placeholder, contents, and Gutenberg header/footer. Joined hard-wrapped lines within each blank-line-delimited paragraph. No prose, spelling or punctuation corrections. Reader titles are Chapter 1 through Chapter 50; integer numbers 1–50; sections empty.

Verified all body text equals the source after whitespace removal and exclusion of chapter headings and the three end markers. Every chapter's full opening and closing paragraph is recorded in `qa/source-boundaries.json`. Chapters: 50. Paragraphs: 1806. Whitespace-delimited words: 118639. First opening: “The family of Dashwood had long been settled in Sussex.” Final ending: “between themselves, or producing coolness between their husbands.”

Pinned modernization baseline and intended Compare edition: this original-en file. Intended primary edition after acceptance: modern-en. One modern paragraph per source paragraph, without structural remapping.

Final boundary audit removed two volume-end marker paragraphs from chapters 22 and 36. No reading prose or existing prose paragraph coordinate changed. The initial source commit precedes this correction; use the corrected SHA-256 above.
