# The Story of the Iliad (Church) — “Iliad for Boys and Girls” — pinned source

- Book id: `iliad-for-boys-and-girls` (proposed).
- Author: Alfred J. Church.
Author: Alfred John Church (1829–1912). The Gutenberg file states “Original publication: New York: The Macmillan Company, 1920”; Gutenberg’s own catalogue title is *The Story of the Iliad*. The Tinct working title “Iliad for Boys and Girls” is not the title on the Gutenberg file and should be checked before registry use.
- Rights evidence: Project Gutenberg catalogue pages https://www.gutenberg.org/ebooks/74231 state that the work is in the public domain in the USA; recorded 2026-10-21 from the files’ own licence headers. This is Gutenberg’s stated US status, not a jurisdiction-specific review.
- Pinned bytes:
- `books/raw/iliad-for-boys-and-girls/pg74231.txt` — Project Gutenberg eBook 74231, “The story of the Iliad”, release date August 12, 2024; 254,114 bytes; SHA-256 `89571ecb1097b58ef43f62ff27bfc1ea073a96ba45e9504cf590bbf04ac3334a`.
- Language of all three editions: English (`original-en`, `modern-en`) and Danish (`modern-da`).

## Reading structure

24 reading units, `sections: []`, 675 paragraphs. Gutenberg front matter, contents lists, illustration lists, transcriber’s notes and footer are excluded. Verse and refrains keep their line breaks (`\n`) and footnotes keep `[n]` markers with the note as its own paragraph.

## Editions

| File | Chapters | Paragraphs | Words | SHA-256 |
| --- | ---: | ---: | ---: | --- |
| `editions/iliad-for-boys-and-girls-original-en.json` | 24 | 675 | 42,708 | `ba6ac86dcec94b85312bb8afcb45c3834f045ac2984833ba9e9adb0ee78121d2` |
| `editions/iliad-for-boys-and-girls-modern-en.json` | 24 | 675 | 41,379 | `cf336e05035b1a032a5bf58b52aa2d546dee61313cd99d8e489750675721b89b` |
| `editions/iliad-for-boys-and-girls-modern-da.json` | 24 | 675 | 39,694 | `bbc513e8fb984967669b4a72b720194c040f33f2d95660585bc429d4fca368f2` |

- `original-en` is the Gutenberg English text and the sole baseline for the derived editions.
- `modern-en` is the Tinct modern-English rendering (US spelling, curly quotes, unspaced em dash), paragraph for paragraph.
- `modern-da` is a Danish rendering produced from the accepted `modern-en`, paragraph for paragraph (same chapters, same paragraph counts, same `\n` counts). Chapter titles were translated by hand; names follow the glossary in `review/DANISH-NOTES.md`.

Owned paths: `books/wip/iliad-for-boys-and-girls/` and `books/raw/iliad-for-boys-and-girls/`. No integration, registry change, narration or publication is part of this package.

## Not done

- No acclaim quote is included (none verified against a primary source); onboarding `acclaim` is `[]`. No character cards or threads; `cast` is `[]`.
- No Greek original and no second English translation were fetched. The live app already has `iliad` (a Homer translation); this package is a different work and needs a different id.
- No Danish onboarding.
