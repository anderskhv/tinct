# Source — Wuthering Heights

- Work: *Wuthering Heights*, Emily Brontë; first published 1847.
- Primary text: Project Gutenberg eBook 768, English plain text, downloaded 2026-09-30.
- Text URL: https://www.gutenberg.org/cache/epub/768/pg768.txt
- Catalogue and rights evidence: https://www.gutenberg.org/ebooks/768 — copyright field: “Public domain in the USA”; author dates 1818–1848.
- Digital edition: release December 1, 1996; most recently updated May 6, 2026; transcription credited to David Price. The downloaded file does not identify a print edition or imprint; do not describe this as a diplomatic transcription of the 1847 first edition.
- Raw artifact: `books/raw/wuthering-heights/raw.txt` (downloaded bytes, including CRLF, retained).
- Pinned raw SHA-256: `e533fe750589f0421d5d744576315f5c2b9b0d69e981179ea0551bbf134c5e02`.
- Validated header before parsing: `Title: Wuthering Heights`; `Author: Emily Brontë`; `[eBook #768]`. All three were asserted and a mismatch raises an error.
- Original edition SHA-256: `1466e339c924109d4dd250143f8e7eae66bceef2f384c93d3f708ff01a58a0a2`.

## Extraction and completeness

Used the existing parser with explicit staging output and `^CHAPTER [IVXLCDM]+$`, then independently reconstructed every chapter from source blank-line paragraphs. There are exactly 34 sequential reading units, Chapter I–XXXIV, with no sections hierarchy: 1,931 paragraphs and 115,815 whitespace-delimited words.

The title and byline before Chapter I, Gutenberg header and footer, and 11 decorative asterisk scene-break blocks are excluded from reading paragraphs. Their chapter locations are preserved in `review/original-validation.json`; no narrative text is removed at those breaks. Paragraph boundaries otherwise follow the source. Hard-wrapped lines become spaces. The first paragraph begins “1801—I have just returned”; the last ends “the sleepers in that quiet earth.” All chapter openings and endings were inspected; no contents list, preface, captions or duplicated reading units were found. This source contains no editorial footnote apparatus in its narrative body.

Source spelling, punctuation, underscore emphasis, dialogue quotation nesting, dialect and accented author name are retained in original-en. Historical descriptions and prejudices belong to the narrators, and are not silently rewritten as editorial assertions. Original-en is committed before any modern-en rendering.

## Rights and later integration

The underlying novel is a public-domain nineteenth-century work; the cited catalogue supplies direct US rights evidence. Preserve this provenance when integrating, and assess publication territories and Gutenberg trademark/licence presentation in the publication workflow. No original art, audio, modern translation or copyrighted added introduction is included.

## Acclaim primary source

The single onboarding excerpt is Charlotte Brontë’s own sentence in the final paragraph of her 1850 editor’s preface, signed Currer Bell. She is Emily’s sister and the editor, not an independent contemporary reviewer; the preface mixes defence with criticism, which the onboarding context discloses.

- Primary text URL: https://www.gutenberg.org/cache/epub/771/pg771.txt
- Readable source: https://www.gutenberg.org/files/771/771-h/771-h.htm (heading: “Editor’s Preface to the New Edition of ‘Wuthering Heights’”).
- Saved bytes: `books/raw/wuthering-heights/acclaim-pg771.txt`.
- SHA-256: `b157f8aa21a5ffabef1c88d83517a54b0dbd90e469c3163be87870616c274e6a`.
- Header validated before excerpt extraction: `Title: Biographical Notes on the Pseudonymous Bells`; `Author: Charlotte Brontë`; `[eBook #771]`.
- Downloaded edition header: released January 1, 1997; most recently updated January 28, 2021; David Price. The legacy HTML labels the collection *Charlotte Brontë’s Notes*. The catalogue lists an April 19, 2021 update; the hash pins the actual downloaded text rather than assuming these metadata dates agree.
- Rights evidence: https://www.gutenberg.org/ebooks/771 — “Public domain in the USA”; Charlotte Brontë 1816–1855. This is an 1850 primary text, not a modern editor’s introduction.
- Quote verification: exact sentence match after collapsing source line-wrap whitespace; curly single quotation marks around the title retained. No cover image or other visual material is used.
- The biographical notice in the same collection identifies Ellis Bell with Emily and discusses publication of *Wuthering Heights* in 1847.
