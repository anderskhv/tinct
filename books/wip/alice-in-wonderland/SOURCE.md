# Alice’s Adventures in Wonderland — pinned source

- Book id: `alice-in-wonderland`.
- Author: Lewis Carroll (Charles Lutwidge Dodgson, 1832–1898).
- Original publication: 1865. English original; no translator.
- Digital edition: Project Gutenberg eBook 11, **THE MILLENNIUM FULCRUM EDITION 3.0**, credited to Arthur DiBianca and David Widger. Header release date June 27, 2008; last update June 26, 2025.
- Catalogue and rights evidence: https://www.gutenberg.org/ebooks/11 — author, title, language, eBook number and “Public domain in the USA” checked September 30, 2026. The raw download includes Gutenberg’s complete reuse notice and licence. This records the source’s stated US status; it does not substitute for jurisdiction-specific publication review.
- Download: https://www.gutenberg.org/cache/epub/11/pg11.txt (also available through https://www.gutenberg.org/ebooks/11.txt.utf-8).
- Exact bytes: `books/raw/alice-in-wonderland/raw.txt`.
- Raw SHA-256: `01b38ea4c710a84bc18d0bd41271a5a1a92b94e97b2812f4dece97d4a694725e`.
- Header validation before parsing: exact `Title: Alice's Adventures in Wonderland`, `Author: Lewis Carroll`, and `[eBook #11]` assertions passed. A mismatch raises an error.
- Instruction revision: `37876e623fd7bb69cce705a5fe14dfde9e8500d3` (`origin/main` at checkout creation).

## Reading structure

Twelve flat reading units, numbered 1–12, with the source’s chapter subtitles and `sections: []`. The existing Gutenberg parser was used to inspect chapter boundaries; the final content extraction keeps the source’s blank-line paragraph boundaries and internal line breaks, including verse stanzas and the Mouse’s tail. Multi-stanza poems retain all their stanzas in sequence. No poem is condensed or turned into prose.

Excluded: Gutenberg header/footer and licence, front-matter title/author/edition label, contents list, the front-matter illustration placeholder, nine lines of decorative asterisks (six in chapter 1, three in chapter 5), and the terminal `THE END` label. Chapter headings are represented by chapter metadata, not duplicate reading paragraphs. There are no other illustration captions in the selected reading body.

Paragraph counts by chapter: **24, 26, 48, 42, 75, 80, 105, 71, 92, 81, 74, 71**; total **789**. Whitespace-delimited word count: **26,309**. All 12 beginnings and endings checked against the pinned raw text, from Alice beside her sister to the sister’s imagining Alice’s later life and “the happy summer days.”

Pinned original JSON SHA-256: `c7d770162fd2dbc6cfc829d8e74f22f8cb403e88dbea219a9aaae37512683134`.

## Editorial baseline

This English original is the sole baseline for the modern rendering and the proposed Compare default. Retain Carroll’s deliberate mistakes, logic, wordplay, invented words, names, French accents and shifts in voice. Verse quotations remain intact where a paraphrase would destroy the parody or a later joke. The modern edition is for the general Tinct reader, not a children’s adaptation.

Owned paths: `books/wip/alice-in-wonderland/` and `books/raw/alice-in-wonderland/`. No integration, registry change, narration or publication is authorized in this assignment.
