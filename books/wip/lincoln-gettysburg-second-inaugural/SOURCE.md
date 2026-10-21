# Lincoln: The Gettysburg Address and the Second Inaugural Address — pinned source

- Book id: `lincoln-gettysburg-second-inaugural` (proposed).
- Author: Abraham Lincoln.
Both speeches are by Abraham Lincoln (1809–1865), a US president; the texts are the Project Gutenberg transcriptions. The Gutenberg Gettysburg text is one of several textual versions of the speech (Lincoln wrote out five manuscript copies that differ slightly); this package uses the Gutenberg text only and does not compare the manuscripts. The Gutenberg file renders pauses in the speech as ellipses; they are kept in `original-en`.
- Rights evidence: Project Gutenberg catalogue pages https://www.gutenberg.org/ebooks/4 and /8 state that the work is in the public domain in the USA; recorded 2026-10-21 from the files’ own licence headers. This is Gutenberg’s stated US status, not a jurisdiction-specific review.
- Pinned bytes:
- `books/raw/lincoln-gettysburg-second-inaugural/pg4.txt` — Project Gutenberg eBook 4, “Lincoln’s Gettysburg Address”, release date November 1, 1973; 21,788 bytes; SHA-256 `cc749f45ea7b8ef87fd3cd8cb94dc320920d78dab22efea98359a7b6e13e00c2`.
- `books/raw/lincoln-gettysburg-second-inaugural/pg8.txt` — Project Gutenberg eBook 8, “Abraham Lincoln’s Second Inaugural Address”, release date December 1, 1978; 24,107 bytes; SHA-256 `060853cffcbafcea4c8b5893410cd92fd9106323dcd8542b82bc50c78b1cbf94`.
- Language of all three editions: English (`original-en`, `modern-en`) and Danish (`modern-da`).

## Reading structure

2 reading units, `sections: []`, 11 paragraphs. Gutenberg front matter, contents lists, illustration lists, transcriber’s notes and footer are excluded. Verse and refrains keep their line breaks (`\n`) and footnotes keep `[n]` markers with the note as its own paragraph.

## Editions

| File | Chapters | Paragraphs | Words | SHA-256 |
| --- | ---: | ---: | ---: | --- |
| `editions/lincoln-gettysburg-second-inaugural-original-en.json` | 2 | 11 | 964 | `15a144e532edfb4210fdf1138bd9bd34902ed598fe540b0f94160ea468800947` |
| `editions/lincoln-gettysburg-second-inaugural-modern-en.json` | 2 | 11 | 976 | `fab19f4830e355762f923c2f57f5fc60cb23da78408c82e8e4fd5f283c1dc89f` |
| `editions/lincoln-gettysburg-second-inaugural-modern-da.json` | 2 | 11 | 970 | `f6589d8192ffc726c5f2f1917823b26c4233795b4ed76101f5ba98bb5d904e35` |

- `original-en` is the Gutenberg English text and the sole baseline for the derived editions.
- `modern-en` is the Tinct modern-English rendering (US spelling, curly quotes, unspaced em dash), paragraph for paragraph.
- `modern-da` is a Danish rendering produced from the accepted `modern-en`, paragraph for paragraph (same chapters, same paragraph counts, same `\n` counts). Chapter titles were translated by hand; names follow the glossary in `review/DANISH-NOTES.md`.

Owned paths: `books/wip/lincoln-gettysburg-second-inaugural/` and `books/raw/lincoln-gettysburg-second-inaugural/`. No integration, registry change, narration or publication is part of this package.

## Not done

- No acclaim quote is included (none verified against a primary source); onboarding `acclaim` is `[]`. No character cards or threads; `cast` is `[]`.
- The five Gettysburg manuscripts were not compared; the Gutenberg text is a retranscription.
- No Danish onboarding.
