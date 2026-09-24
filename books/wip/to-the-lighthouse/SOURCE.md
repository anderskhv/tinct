# To the Lighthouse — source provenance

- **Work:** Virginia Woolf, *To the Lighthouse*. First published 5 May 1927 by the Hogarth Press (London) and Harcourt, Brace & Co. (New York).
- **Book id:** `to-the-lighthouse` (matches the existing taxonomy stub in `app/src/data/libraryTaxonomy.ts`).

## Rights

- **United States:** published 1927; US copyright term for 1927 works expired on 1 January 2023. Public domain.
- **UK / EU and other life+70 countries:** Woolf died 28 March 1941; public domain since 1 January 2012.
- Standard Ebooks' own contributions (markup, corrections) are dedicated to the public domain under CC0 1.0 (`dc:rights` in the ebook's `content.opf`).

## Primary source (fidelity anchor)

| Item | Value |
|---|---|
| Edition | Standard Ebooks, *To the Lighthouse* — https://standardebooks.org/ebooks/virginia-woolf/to-the-lighthouse |
| Source repository | https://github.com/standardebooks/virginia-woolf_to-the-lighthouse at commit `2ba2ffe0d5e8789902cfe86c5cde4753b7b68843` (HEAD of `master` on 2026-09-24) |
| Ebook `dcterms:modified` | 2026-08-04T14:59:35Z |
| File | `source/se.epub`, sha256 `ca2157bf134256a1581b9bb0b9b9975ad3580cfe9e38d253bc841e17a89155ff`, downloaded 2026-09-24 |
| Underlying transcription | Faded Page (https://www.fadedpage.com/showbook.php?pid=20190356), 2019, Delphine Lettau, Al Haines, Howard Ross and Distributed Proofreaders Canada |
| Page scans (SE's `dc:source`) | https://archive.org/details/in.ernet.dli.2015.176580 |
| Text family | **UK Hogarth Press (1927) text.** Confirmed by the witness comparison below: e.g. the end of The Window reads “She had not said it, but he knew it.” (UK) rather than “She had not said it: yet he knew.” (US). |

Standard Ebooks applies its house editorial normalization (some modernized spellings and compounds, e.g. "crystallize", "judgment", "church mice", "today"). These are orthographic only; no wording is changed.

## Witness (completeness check only)

| Item | Value |
|---|---|
| Edition | Project Gutenberg Australia eBook 0100101 (Col Choat, 2001; updated 2008) — https://gutenberg.net.au/ebooks01/0100101.txt |
| File | `source/pgau-0100101.txt`, sha256 `ef850b791b10c390d7f5641eb2841ccb6dbb154223c42ad9743b5f759502854f` |
| Text family | US Harcourt text (it carries the known US readings, e.g. “with its pale footfall upon stair and mat”). Italics rendered as capitals. |

A word-sequence alignment of the whole parsed edition against the witness found 532 differing runs. After removing hyphenation/compound-only differences and one- or two-word spelling variants, 304 remain. All 24 runs where the word counts differ by six or more were inspected; each is a UK/US reading difference of the kind documented between the Hogarth and Harcourt first editions (Woolf corrected the two sets of proofs separately), not a transcription gap. The shorter runs were not individually verified. The source has no stray headings, notes or boilerplate. The US text is **not** used for any reading; this is a completeness check only.

## Parsed edition

`editions/to-the-lighthouse-original-en.json` — parsed from the epub's `chapter-{part}-{n}.xhtml` files.

- sha256 `1662e69cd2781083e2332aeddd1e0c340446bdf2f7929c95da0d008e65b8d4f8`
- 42 chapters, 495 paragraphs, 69,323 whitespace-delimited words.
- Structure: Woolf's own three parts and numbered sections. Each numbered section is one reader chapter, titled `The Window · 1` … `The Window · 19`, `Time Passes · 1` … `Time Passes · 10`, `The Lighthouse · 1` … `The Lighthouse · 13`. Each chapter carries `section` (`Part I — The Window`, `Part II — Time Passes`, `Part III — The Lighthouse`), and the top-level `sections` array groups chapters 1–19, 20–29 and 30–42. This follows the existing `crime-and-punishment` / `brothers-karamazov` edition shape.
- Paragraphs are the source `<p>` paragraphs. Each quoted verse block (`<blockquote>`) is one paragraph with its lines separated by `\n` (as in `jungle-book` / `paradise-lost` editions).
- Normalization: italics → `_…_` (the reader's supported underscore-emphasis convention); SE word joiners (U+2060/U+FEFF) removed; no-break and hair spaces → ordinary spaces; `Mr.`/`Mrs.` abbreviation markup removed. No wording is changed.
- The parser was a throwaway script in the session scratchpad; it is intentionally not committed (content-only assignment). Its behavior is fully described above and can be reproduced by any reviewer from the pinned epub.

Smallest units, both genuine: chapter 15 (The Window · 15) is a single one-line paragraph; chapters 24, 35 and 38 are single paragraphs (Time Passes · 5 and two short Lighthouse interludes).
