# Adventures of Huckleberry Finn (Twain) — pinned source

- Book id: `adventures-of-huckleberry-finn` (proposed).
- Author: Mark Twain.
Author: Mark Twain (Samuel Clemens, 1835–1910). Illustrator in the Gutenberg edition: E. W. Kemble; the pictures are not part of this package. The novel appeared in 1884 (UK/Canada) and 1885 (US); 1884 is given from the publishing history and not verified against the file. **Racial term:** the original uses it many times and in the title of chapter 33; it is kept verbatim in `original-en` and `modern-en` and rendered *neger / negre* (with compounds such as *negerstjæler*) in `modern-da` so that a later editorial replacement is a simple find-and-replace. This was a deliberate decision made for easy review, not a recommendation to publish it.
- Rights evidence: Project Gutenberg catalogue pages https://www.gutenberg.org/ebooks/76 state that the work is in the public domain in the USA; recorded 2026-10-21 from the files’ own licence headers. This is Gutenberg’s stated US status, not a jurisdiction-specific review.
- Pinned bytes:
- `books/raw/adventures-of-huckleberry-finn/pg76.txt` — Project Gutenberg eBook 76, “Adventures of Huckleberry Finn”, release date June 29, 2004; 622,460 bytes; SHA-256 `d617a37aa7ae1e1a93dcde2634db2bccb86824e31e29a55230bdbf77d6872d59`.
- Language of all three editions: English (`original-en`, `modern-en`) and Danish (`modern-da`).

## Reading structure

45 reading units, `sections: []`, 2179 paragraphs. Gutenberg front matter, contents lists, illustration lists, transcriber’s notes and footer are excluded. Verse and refrains keep their line breaks (`\n`) and footnotes keep `[n]` markers with the note as its own paragraph.

## Editions

| File | Chapters | Paragraphs | Words | SHA-256 |
| --- | ---: | ---: | ---: | --- |
| `editions/adventures-of-huckleberry-finn-original-en.json` | 45 | 2179 | 109,950 | `a4119a1a0d9b04d8d64c25192ec52de15e8590a2e90b05f09f67e33487473f68` |
| `editions/adventures-of-huckleberry-finn-modern-en.json` | 45 | 2179 | 108,866 | `0bf25b67c3739aca3746533e898b81af4873924e920bde08b4ca40a9c0c5f3ad` |
| `editions/adventures-of-huckleberry-finn-modern-da.json` | 45 | 2179 | 112,481 | `cc0f238525f6afa58b113558c6588fd080959137a8dba459ef7caf43e9446695` |

- `original-en` is the Gutenberg English text and the sole baseline for the derived editions.
- `modern-en` is the Tinct modern-English rendering (US spelling, curly quotes, unspaced em dash), paragraph for paragraph.
- `modern-da` is a Danish rendering produced from the accepted `modern-en`, paragraph for paragraph (same chapters, same paragraph counts, same `\n` counts). Chapter titles were translated by hand; names follow the glossary in `review/DANISH-NOTES.md`.

Owned paths: `books/wip/adventures-of-huckleberry-finn/` and `books/raw/adventures-of-huckleberry-finn/`. No integration, registry change, narration or publication is part of this package.

## Not done

- No acclaim quote is included (none verified against a primary source); onboarding `acclaim` is `[]`. No character cards or threads; `cast` is `[]`.
- No decision on the racial term was taken by an editor; see HANDOFF.
- No Danish onboarding.
