# Source and rights

- Work: The Adventures of Sherlock Holmes.
- Author: Arthur Conan Doyle (1859–1930).
- First collection publication: 1892.
- Requested and fetched source: Project Gutenberg #1661; no substitution of #48320.
- Catalogue: https://www.gutenberg.org/ebooks/1661
- Download: https://www.gutenberg.org/cache/epub/1661/pg1661.txt
- Retrieved: 2026-09-30. Gutenberg header update date: October 10, 2023.
- Exact raw-byte SHA-256: `922e2a12ccb43a4c9544c260b2166c6ad2097aeb5957faeee113f173bb857cd0`.
- Header verified before parsing: `Title: The Adventures of Sherlock Holmes`; `Author: Arthur Conan Doyle`.
- Credits: an anonymous Project Gutenberg volunteer and Jose Menendez.

## Rights evidence

The Gutenberg catalogue identifies Doyle as 1859–1930 and expressly marks this ebook public domain in the USA: https://www.gutenberg.org/ebooks/1661 . The source is the original English text, with no modern translator or copyrighted editorial additions.

Denmark: Ophavsretsloven § 63 provides protection through 70 years after the author's death year: https://www.retsinformation.dk/eli/lta/2023/1093 (official PDF: https://www.retsinformation.dk/api/pdf/238630).

EU: Directive 2006/116/EC Article 1(1) sets life plus 70 years; Article 8 calculates terms from 1 January of the following year: https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32006L0116 . Applying this rule to Doyle's death in 1930 puts expiry at the end of 2000, hence public domain from 1 January 2001. This is the rights calculation for Doyle's text; no illustrations or later adaptations are included.

## Parsing contract

Use the committed books/parse-gutenberg.py with custom story-heading pattern `^[IVX]+\. [A-Z]`. The parser drops front matter and Gutenberg licence/footer and joins hard-wrapped lines within blank-line-delimited source paragraphs. Twelve story headings are the only chapter units. Remove the three standalone internal division labels I., II., III. in story 1; preserve all narrative, dialogue, advertisements, documents and signatures. No illustration captions occur in this text. Plain-text underscore emphasis is retained as supplied. Short dialogue and letter signatures are authentic, not stubs.

Use concise story titles for chapters 7–12 (drop “The Adventure of”); SOURCE-REVIEW.json records the source headings and opening/ending text. Follow the existing English-original jekyll-and-hyde JSON format: chapters containing number, title and paragraphs, with no hierarchy.
