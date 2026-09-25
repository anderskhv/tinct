# Othello — source provenance

- **Source:** Project Gutenberg eBook #1531, *Othello* by William Shakespeare
- **URL:** https://www.gutenberg.org/cache/epub/1531/pg1531.txt
- **Header:** `Title: Othello` / `Author: William Shakespeare` / `Release date: November 1, 1998 [eBook #1531]`, most recently updated September 19, 2025
- **Fetched:** 2026-09-25
- **SHA-256 of `pg1531.txt`:** `340a08eb95d6404c0834906eb7b899ec6503c609ca76eb5b7430bb100cd1e462`
- **License:** public domain in the USA (Project Gutenberg)

## Relationship to the served editions

The served `app/public/data/editions/othello-original-en.json` (SHA-256
`a8e8ae40b054bce1b60dcba35fcd194f08e74829fcc0faa6665456f962b5d1df`) was built from this text. All 1,220 speech paragraphs were matched back to
their source lines, with inline stage directions such as `[_Aside._]` stripped, since the served edition
omits them. 1,218 matched exactly and 2 needed manual unit lists (4.47 and 14.80, which keep an inline
`[_To …_]` direction). Reconstruction from the units reproduces every served paragraph byte-for-byte.
The per-paragraph line units are in `../alignment/original-line-units.json`.

No copyrighted modernization was consulted. Renderers and reviewers worked only from this text and
standard glossing knowledge.
