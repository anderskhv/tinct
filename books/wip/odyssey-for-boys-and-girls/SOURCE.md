# The Story of the Odyssey (Church) — “Odyssey for Boys and Girls” — pinned source

- Book id: `odyssey-for-boys-and-girls` (proposed).
- Author: Alfred J. Church.
Author: Alfred John Church (1829–1912). The Gutenberg file is titled *The Story of the Odyssey*; it states no original publication year, and the year above (1892) is the commonly cited first publication date and has **not** been verified against the file. The Tinct working title “Odyssey for Boys and Girls” is not the title on the Gutenberg file.
- Rights evidence: Project Gutenberg catalogue pages https://www.gutenberg.org/ebooks/6370 state that the work is in the public domain in the USA; recorded 2026-10-21 from the files’ own licence headers. This is Gutenberg’s stated US status, not a jurisdiction-specific review.
- Pinned bytes:
- `books/raw/odyssey-for-boys-and-girls/pg6370.txt` — Project Gutenberg eBook 6370, “The Story of the Odyssey”, release date August 1, 2004; 263,261 bytes; SHA-256 `8b3032ee3391fac9186ae19344ea61089cad0b166d307f9790933b16d001488d`.
- Language of all three editions: English (`original-en`, `modern-en`) and Danish (`modern-da`).

## Reading structure

25 reading units, `sections: []`, 747 paragraphs. Gutenberg front matter, contents lists, illustration lists, transcriber’s notes and footer are excluded. Verse and refrains keep their line breaks (`\n`) and footnotes keep `[n]` markers with the note as its own paragraph.

## Editions

| File | Chapters | Paragraphs | Words | SHA-256 |
| --- | ---: | ---: | ---: | --- |
| `editions/odyssey-for-boys-and-girls-original-en.json` | 25 | 747 | 45,003 | `8a67f2154b14e08b1c1d085e25ba172564525a884fea517e04f206d584924ffa` |
| `editions/odyssey-for-boys-and-girls-modern-en.json` | 25 | 747 | 42,982 | `5fd94995e89d0696dc0e30c3949a0404f761fec1c55d61055edf7b780cf871bf` |
| `editions/odyssey-for-boys-and-girls-modern-da.json` | 25 | 747 | 41,604 | `0a967d5924f1927bf69f10e931b42a2098a8c94288be51de71bd315add6722ad` |

- `original-en` is the Gutenberg English text and the sole baseline for the derived editions.
- `modern-en` is the Tinct modern-English rendering (US spelling, curly quotes, unspaced em dash), paragraph for paragraph.
- `modern-da` is a Danish rendering produced from the accepted `modern-en`, paragraph for paragraph (same chapters, same paragraph counts, same `\n` counts). Chapter titles were translated by hand; names follow the glossary in `review/DANISH-NOTES.md`.

Owned paths: `books/wip/odyssey-for-boys-and-girls/` and `books/raw/odyssey-for-boys-and-girls/`. No integration, registry change, narration or publication is part of this package.

## Not done

- No acclaim quote is included (none verified against a primary source); onboarding `acclaim` is `[]`. No character cards or threads; `cast` is `[]`.
- No Greek original and no second translation were fetched. The live app has `odyssey` (a Homer translation); this package is a different work and needs a different id.
- No Danish onboarding.
