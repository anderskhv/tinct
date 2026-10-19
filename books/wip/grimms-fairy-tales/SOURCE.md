# Grimms’ Fairy Tales — pinned source

- Book id: `grimms-fairy-tales`.
- Authors: Jacob Grimm (1785–1863) and Wilhelm Grimm (1786–1859).
- Digital edition: Project Gutenberg eBook 2591, *Grimms’ Fairy Tales*, release date April 1, 2001, header “Most recently updated: September 20, 2026”; credits Emma Dudding, John Bickers, Dagny and David Widger.
- English baseline: the Gutenberg file states that its text “is based on translations from Edgar Taylor and Marian Edwardes” (raw.txt lines 40–42). Edgar Taylor made the first English translation (1823). The Gutenberg catalogue page carries no separate translator field, so the attribution above is the file’s own statement.
- Rights evidence: https://www.gutenberg.org/ebooks/2591 — “Public domain in the USA”, checked 2026-10-19. This records Gutenberg’s stated US status; it is not a jurisdiction-specific review.
- Download: https://www.gutenberg.org/cache/epub/2591/pg2591.txt. Exact bytes: `books/raw/grimms-fairy-tales/raw.txt` (560,164 bytes).
- Raw SHA-256: `377ebb8ca06cd8bc0b1015ddb54766c44f50dece731c53bb030f1cc00f54092a`.
- No German original was fetched in this assignment (see “Not done”).

## Reading structure

65 reading units, numbered 1–65, `sections: []`. Each tale is one unit, except that the Gutenberg text splits “The Adventures of Chanticleer and Partlet” into three titled units (15–17) and gives “Wedding of Mrs Fox” two stories (58–59). 902 paragraphs. Tale 33 is the Snow White tale, titled **Snowdrop** in this translation; Snow-White and Rose-Red (65) is a different tale. Gutenberg’s front matter, contents list, introduction and footer are excluded; verse and refrains keep their line breaks (`\n`) and paragraph boundaries follow the source.

## Editions

| File | Chapters | Paragraphs | Words | SHA-256 |
| --- | ---: | ---: | ---: | --- |
| `editions/grimms-fairy-tales-original-en.json` | 65 | 902 | 100,401 | `e5aeb318c7ed1e44202f57ec7b7303958823ec63909ca69538fe26bb151a95f3` |
| `editions/grimms-fairy-tales-modern-en.json` | 65 | 902 | 95,492 | `679ab684eaf90eb7cfdd30a869d97f865aba6e0c5aff77951386ca16c7eba6ab` |
| `editions/grimms-fairy-tales-modern-da.json` | 65 | 902 | 93,132 | `3effe2de500dcc3790ef5151d9fc97663e14535944d31f0a4c7074d6be785714` |

- `original-en` is the Gutenberg English text (Taylor/Edwardes) and is the sole baseline for both derived editions.
- `modern-en` is the Tinct modern-English rendering (US spelling, curly quotes, unspaced em dash).
- `modern-da` is a complete Danish rendering produced from the accepted `modern-en`, paragraph for paragraph (same chapters, same paragraph counts, same `\n` counts). Chapter titles are Danish; names follow the glossary in `review/DANISH-NOTES.md`.

Owned paths: `books/wip/grimms-fairy-tales/` and `books/raw/grimms-fairy-tales/`. No integration, registry change, narration or publication is part of this package.

## Not done

- No German edition and no second English translation were fetched; Compare default stays the English original.
- No acclaim quote is included: none was verified against a primary source, so onboarding `acclaim` is `[]`.
- No character cards or threads (an anthology of unconnected tales has no single cast); `cast` is `[]`.
