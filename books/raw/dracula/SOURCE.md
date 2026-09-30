# Dracula — source and rights

- Work: Dracula (1897), Bram Stoker (1847–1912), English original.
- Project Gutenberg ebook: https://www.gutenberg.org/ebooks/345
- Exact download: https://www.gutenberg.org/cache/epub/345/pg345.txt
- Retrieved: 2026-09-30. Gutenberg header revision: 2025-09-24.
- Raw file: `raw.txt`, unchanged download bytes (UTF-8, CRLF).
- Raw SHA-256: `96cd16eacdbfebae8fdda5591f66e0cc8ee76be18e0cd1aca02bc00615782d28`.
- Verified header: `Title: Dracula`; `Author: Bram Stoker`; `[eBook #345]`.
- Edition identified in the source: New York, Grosset & Dunlap; copyright 1897 by Bram Stoker; printed at the Country Life Press, Garden City, N.Y. This imprint is not asserted to be the first edition.
- The complete 27-chapter novel, not an annotated adaptation or an illustrated variant. The source includes a publisher colophon placeholder in front matter; that ornament does not make this a separately illustrated narrative edition. No illustrations, captions, annotations, or modern introductions enter the reading text.

## Rights evidence

The Gutenberg catalogue identifies Stoker as 1847–1912 and marks #345 public domain in the USA: https://www.gutenberg.org/ebooks/345 . The source itself records the 1897 US copyright. The underlying novel is public domain in the US.

For Denmark, §63 of the Copyright Act provides the author's life plus 70 years, counted through the end of the death year: https://www.retsinformation.dk/eli/lta/2023/1093 . EU Directive 2006/116/EC, Articles 1 and 8, provides life plus 70 years and calendar-year calculation: https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32006L0116 . Stoker's death in 1912 puts the end of that term at 31 December 1982. The underlying novel is therefore public domain in Denmark/EU as well. No later editor's annotations, translation, or artwork are used.

## Reading text and source mapping

`books/wip/dracula/editions/dracula-original-en.json` is the pinned English baseline. The existing `books/parse-gutenberg.py` was run with the anchored chapter pattern `^CHAPTER [IVXLCDM]+$` and an explicit staged output path. This excludes the contents list and leaves exactly 27 flat reading units. The JSON follows the existing English-original novel shape (Jekyll and Hyde): chapters with number, title and string paragraphs, plus an empty sections array.

Blank-line-delimited paragraphs of the downloaded plain text are authoritative. Wrapped lines are joined with spaces. Diary titles, letter titles, dates, signatures, newspaper headings and quotations remain in order as paragraphs within their chapters. Source underscores indicating italics and double-hyphen dash notation are retained in original-en. No lexical modernization is applied to the original.

Ornamental rows consisting only of asterisks are excluded. In Chapter 27 the complete final NOTE, including Jonathan Harker's signature, is retained; THE END and all following publisher advertisements are excluded. Gutenberg licensing boilerplate, title/imprint pages, dedication and contents are excluded. The short authorial prefatory statement beginning “How these papers...” is preserved separately in `source-frontmatter.txt`; it is not an invented 28th chapter or inserted into Jonathan's diary.

`qa/source-structure.json` records every chapter's opening, ending, count and exact mapping from the existing parser's paragraph indices to the cleaned baseline (all indices one-based). All retained paragraphs were matched to their chapter in the downloaded source. No diary/letter/newspaper subdivision becomes a separate reading unit.
