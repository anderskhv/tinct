# The Arabian Nights Entertainments (Lang) — pinned source

- Book id: `arabian-nights`.
- Editor/adapter: Andrew Lang (1844–1912). Lang’s preface states that the stories are translated from the French version of Antoine Galland, shortened in places, with the poetry and some passages omitted; the book is therefore an adapted selection after Galland, not a translation from Arabic.
- Digital edition: Project Gutenberg eBook 128, *The Arabian Nights Entertainments*, release date May 1, 1994, most recently updated October 29, 2024; produced by Christy Phillips and John Hamm, HTML version by Al Haines.
- Rights evidence: https://www.gutenberg.org/ebooks/128 — Gutenberg catalogue page retrieved 2026-10-19 lists author Lang, Andrew, 1844–1912. The text was published in 1898. Gutenberg’s stated US status for this file is recorded in its header licence; no separate jurisdiction review was done.
- Download: https://www.gutenberg.org/cache/epub/128/pg128.txt. Exact bytes: `books/raw/arabian-nights/raw.txt` (629,143 bytes).
- Raw SHA-256: `9b3f88ffdb36b112f8b3f23899efd71dbb7572cc765f33e9ad5a1a0f44f57eea`.

## Reading structure

35 reading units: Lang’s preface (1), the frame story “The Arabian Nights” (2) and 33 tales or tale groups (3–35), including the seven voyages of Sindbad (17–23). 1,826 paragraphs. Gutenberg front matter, contents, illustration list and footer are excluded. Chapter titles in `modern-en` use modern spellings (Baghdad, Vizier, Genie, Ali Cogia, Calender, curly apostrophes); `original-en` keeps Lang’s titles.

## Editions

| File | Chapters | Paragraphs | Words | SHA-256 |
| --- | ---: | ---: | ---: | --- |
| `editions/arabian-nights-original-en.json` | 35 | 1826 | 111,099 | `17ea5db0314a10a51ae001a691ae59af098fcee946652ce679d6071f45622d2d` |
| `editions/arabian-nights-modern-en.json` | 35 | 1826 | 107,425 | `386e22ddf5373746e98ccaedbd87fb03b5b756baeafb7c4c0e4a9c6c859a7a2d` |
| `editions/arabian-nights-modern-da.json` | 35 | 1826 | 106,326 | `816253bf78a0f9fe28fdb81194c5bdea05c2d93d2771017bc4100db5c36ffab9` |

- `original-en` is Lang’s Gutenberg text and the sole baseline for both derived editions.
- `modern-en` is the Tinct modern-English rendering with these swaps: Bagdad→Baghdad, vizir→vizier, Genius/Geni→genie/genies, Mahommedan/Mussulman→Muslim.
- `modern-da` is a complete Danish rendering produced from the accepted `modern-en`, paragraph for paragraph. “Genie” is rendered *ånd*; English miles are “engelske mil”; glossary and open choices are in `review/DANISH-NOTES.md`.

Owned paths: `books/wip/arabian-nights/` and `books/raw/arabian-nights/`. No integration, registry change, narration or publication is part of this package.

## Not done

- No Arabic original and no other translation (Burton, Lane, Haddawy, Galland’s French) were fetched; Compare default stays Lang’s English.
- Lang’s selection omits most of the Nights (it is far from the 1001 nights). The title “1001 Nights” in search catalogues refers to the same tradition; this package covers this selection only.
- No acclaim quote is included (none verified); onboarding `acclaim` is `[]`. No character cards or threads.
