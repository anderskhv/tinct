# The Merry Adventures of Robin Hood (Pyle) — pinned source

- Book id: `merry-adventures-of-robin-hood` (proposed).
- Author: Howard Pyle.
Author: Howard Pyle (1853–1911), who also illustrated the book; the illustrations are not part of this package. The Gutenberg file states no original publication year; 1883 is the commonly cited date and is **not** verified against the file.
- Rights evidence: Project Gutenberg catalogue pages https://www.gutenberg.org/ebooks/964 state that the work is in the public domain in the USA; recorded 2026-10-21 from the files’ own licence headers. This is Gutenberg’s stated US status, not a jurisdiction-specific review.
- Pinned bytes:
- `books/raw/merry-adventures-of-robin-hood/pg964.txt` — Project Gutenberg eBook 964, “The Merry Adventures of Robin Hood”, release date February 5, 2006; 620,855 bytes; SHA-256 `cbec6b8e95d86e85e8c954addfe35a29ae2d1755b013c36bf491d79c0dd5eda0`.
- Language of all three editions: English (`original-en`, `modern-en`) and Danish (`modern-da`).

## Reading structure

23 reading units, `sections: []`, 1690 paragraphs. Gutenberg front matter, contents lists, illustration lists, transcriber’s notes and footer are excluded. Verse and refrains keep their line breaks (`\n`) and footnotes keep `[n]` markers with the note as its own paragraph.

## Editions

| File | Chapters | Paragraphs | Words | SHA-256 |
| --- | ---: | ---: | ---: | --- |
| `editions/merry-adventures-of-robin-hood-original-en.json` | 23 | 1690 | 110,761 | `5b60ba33d29c57bde1ee1d8abc7c2762db7fb9a6619800afd2d2316e19d229ac` |
| `editions/merry-adventures-of-robin-hood-modern-en.json` | 23 | 1690 | 107,672 | `ecd17d89f666ae143625c3b77b6d1bfbec097ab5f9bf0bc0f50388d885fbf06f` |
| `editions/merry-adventures-of-robin-hood-modern-da.json` | 23 | 1690 | 105,700 | `0293dedda342dc9357adca365b21555f04ad3924992e7667cca033e910f96d45` |

- `original-en` is the Gutenberg English text and the sole baseline for the derived editions.
- `modern-en` is the Tinct modern-English rendering (US spelling, curly quotes, unspaced em dash), paragraph for paragraph.
- `modern-da` is a Danish rendering produced from the accepted `modern-en`, paragraph for paragraph (same chapters, same paragraph counts, same `\n` counts). Chapter titles were translated by hand; names follow the glossary in `review/DANISH-NOTES.md`.

Owned paths: `books/wip/merry-adventures-of-robin-hood/` and `books/raw/merry-adventures-of-robin-hood/`. No integration, registry change, narration or publication is part of this package.

## Not done

- No acclaim quote is included (none verified against a primary source); onboarding `acclaim` is `[]`. No character cards or threads; `cast` is `[]`.
- No ballad sources were consulted; this is Pyle’s own composition.
- No Danish onboarding.
