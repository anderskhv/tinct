# Beautiful Stories from Shakespeare (Nesbit) — pinned source

- Book id: `beautiful-stories-from-shakespeare` (proposed).
- Author: E. Nesbit.
Author: E. (Edith) Nesbit (1858–1924). The Gutenberg file does not state the original publication year; 1907 is the commonly cited date and is **not** verified against the file. The volume retells twenty plays;
- Rights evidence: Project Gutenberg catalogue pages https://www.gutenberg.org/ebooks/1430 state that the work is in the public domain in the USA; recorded 2026-10-21 from the files’ own licence headers. This is Gutenberg’s stated US status, not a jurisdiction-specific review.
- Pinned bytes:
- `books/raw/beautiful-stories-from-shakespeare/pg1430.txt` — Project Gutenberg eBook 1430, “Beautiful Stories from Shakespeare”, release date August 1, 1998; 307,495 bytes; SHA-256 `2ec7c551a9bbbb9264914cc4738559e2349d0e3f3631bdba3f0b0bc5d784e136`.
- Language of all three editions: English (`original-en`, `modern-en`) and Danish (`modern-da`).

## Reading structure

22 reading units, `sections: []`, 1194 paragraphs. Gutenberg front matter, contents lists, illustration lists, transcriber’s notes and footer are excluded. Verse and refrains keep their line breaks (`\n`) and footnotes keep `[n]` markers with the note as its own paragraph.

## Editions

| File | Chapters | Paragraphs | Words | SHA-256 |
| --- | ---: | ---: | ---: | --- |
| `editions/beautiful-stories-from-shakespeare-original-en.json` | 22 | 1194 | 42,566 | `12686aeb1c9d24ccf73b27e57eb48f2b38917d67fbadc74e33951cb273610ce5` |
| `editions/beautiful-stories-from-shakespeare-modern-en.json` | 22 | 1194 | 43,030 | `c7e35c4ad3798f9349773874e2ff8cea98fc297c8acca61a699ba1012c42cd83` |
| `editions/beautiful-stories-from-shakespeare-modern-da.json` | 22 | 1194 | 43,593 | `7827b1c2ecd924a7f06c5b512d2c2fc828367ef1e697891fd4428eeb97fe1441` |

- `original-en` is the Gutenberg English text and the sole baseline for the derived editions.
- `modern-en` is the Tinct modern-English rendering (US spelling, curly quotes, unspaced em dash), paragraph for paragraph.
- `modern-da` is a Danish rendering produced from the accepted `modern-en`, paragraph for paragraph (same chapters, same paragraph counts, same `\n` counts). Chapter titles were translated by hand; names follow the glossary in `review/DANISH-NOTES.md`.

Owned paths: `books/wip/beautiful-stories-from-shakespeare/` and `books/raw/beautiful-stories-from-shakespeare/`. No integration, registry change, narration or publication is part of this package.

## Not done

- No acclaim quote is included (none verified against a primary source); onboarding `acclaim` is `[]`. No character cards or threads; `cast` is `[]`.
- Shakespeare’s plays themselves are separate works already in the live app; this package is a retelling and needs its own id.
- No Danish onboarding.
