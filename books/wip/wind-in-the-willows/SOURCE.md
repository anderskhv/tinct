# The Wind in the Willows (Grahame) — pinned source

- Book id: `wind-in-the-willows` (proposed).
- Author: Kenneth Grahame (1859–1932). Work first published 1908; the year is the commonly cited date and is **not** stated in the Gutenberg file.
- Source: Project Gutenberg eBook #289, “The Wind in the Willows” by Kenneth Grahame. The Gutenberg catalogue page is https://www.gutenberg.org/ebooks/289. On 2026-11-19 gutenberg.org answered “Temporarily Down for Maintenance” (HTTP 503), so the plain-text file was fetched from the Project Gutenberg mirror `https://gutenberg.pglaf.org/2/8/289/289-0.txt` (same eBook number and path scheme).
- Pinned bytes: `books/raw/wind-in-the-willows/pg289.txt` — 338,658 bytes, SHA-256 `9d07138ca7a6dd98c0f93a74dde2418053a1e49b05bc4e0cba25901d99cb4dc5` (CRLF line endings, UTF-8).
- Rights evidence: this is a Project Gutenberg public-domain text (Gutenberg states US public-domain status for its files; Grahame died in 1932). Gutenberg’s catalogue page could not be reached on the retrieval date, so the rights statement rests on the Project Gutenberg file (which carries the `*** START OF THE PROJECT GUTENBERG EBOOK 289 ***` marker) and on the author’s death date; it is **not** a jurisdiction-specific review. Please confirm the catalogue entry when gutenberg.org is back.
- Validation note: the mirror copy starts at the `*** START` marker, so the usual `Title:` / `Author:` header lines are not in the file. Title and author were confirmed from the text itself (“The Wind in the Willows by Kenneth Grahame”, contents of twelve chapters) and by the full-length match (58,290 words).
- Edition note: the file contains no illustrations, no editor’s preface and no translator; the single text `[Illustration]` line at the top was dropped.

## Reading structure

12 reading units (the twelve chapters), `sections: []`, 916 paragraphs. The Gutenberg contents list, the `[Illustration]` line and the licence footer are excluded. Chapter titles are the book’s own titles in title case. Songs and verse keep their line breaks (`\n`); the Gutenberg italic marks `_word_` are kept. Speeches that run across paragraphs follow the original’s own quotation marks (a few original quote marks are unmatched in the Gutenberg text and were kept as they are).

## Editions

| File | Chapters | Paragraphs | Words | SHA-256 |
| --- | ---: | ---: | ---: | --- |
| `editions/wind-in-the-willows-original-en.json` | 12 | 916 | 58,290 | `3d20f6d2711282404ca5a2ce7bcaf8bea31d0ee170d582ee854f46624e23dd21` |
| `editions/wind-in-the-willows-modern-en.json` | 12 | 916 | 59,049 | `de3e7fadc27d3f5fff0d263a6f8d19f1333b09e52ffe9d642fe7f712262aba94` |
| `editions/wind-in-the-willows-modern-da.json` | 12 | 916 | 60,238 | `f2ace210bdc89bbd10ad4b26d3e85df93d775f4a8674ba64aae906a4a980b46e` |

- `original-en` is the Gutenberg English text and the sole baseline for the derived editions.
- `modern-en` is the Tinct modern-English rendering (US spelling, curly quotes, unspaced em dash), paragraph for paragraph.
- `modern-da` is a Danish translation made from the accepted `modern-en`, paragraph for paragraph (same chapters, same paragraph counts, same `\n` counts). Chapter titles were translated by hand; fixed terms are in `review/DANISH-NOTES.md`.

Owned paths: `books/wip/wind-in-the-willows/` and `books/raw/wind-in-the-willows/`. No integration, registry change, narration or publication is part of this package.
