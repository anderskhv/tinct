# How the original-en candidates were made and checked

Tool revision: `origin/main` at `02c613d8364fc2b37782ea143b3cb92cc9970e06` (8 October 2026), Node v22.22.2.

## Pipeline

1. **Convert with the app's own EPUB converter.** `convertEpub()` comes from `app/src/lab/userBook/epubEdition.ts`. It is the converter behind *Add a book* and *Add to Tinct* public imports. It ran read-only from a scratch driver outside the repository: bundled with esbuild, with jsdom supplying `DOMParser`, the same way `app/scripts/check-public-book-imports.mjs` runs it. The driver follows the spine and the EPUB's own contents for chapter boundaries. It drops the cover, title, copyright and printed contents pages. It keeps italics as `_…_`, keeps headings, labels, list items, subtitles and bylines as per-paragraph `kinds`, and keeps pictures as figure paragraphs.
2. **Before conversion, change markup only, so the converter keeps text it would otherwise drop or garble.** These changes apply to scratch copies of the EPUBs, never the originals. The counts are in each book's `qa/preconversion-log.json`.
   - **R1 note references.** `<a epub:type="noteref">N</a>` becomes `[N]`, which is how built-in editions carry note markers (Hume, Rousseau and others). An already-bracketed reference, `[<a noteref>1</a>]`, becomes `[1]`, not `[[1]]`. Without this step the converter deletes the markers, leaving the notes at chapter end orphaned.
   - **R1b plain note links** (*The Farthest Reaches* only). Its note numbers are untyped `<a href="#fnN">N</a>` links, and they get the same `[N]` treatment.
   - **R2 note backlinks.** A note body begins `[N] …`. A reference-list backlink that already reads `9.` is kept as `9.`.
   - **R3 citations.** `<a epub:type="biblioref">N</a>` is unwrapped so the source's own brackets give `[N]`. Without this, *Bold Conjectures* II would show 39 empty `[]` brackets.
   - **R4 numeric superscripts and subscripts** become Unicode, for example `10⁻⁴³`, `9.8ms⁻²`, `E = mc²`, `H₂O`. *Lords of the Cosmos* sets its exponents as unlinked `scribe_footnote-ref` spans; these are converted the same way. Without this, "10⁻⁴³" read as "10–43".
   - **R5 MathML** (*Bold Conjectures* II, 344 expressions) is written into `alttext`, which the converter reads before raw `textContent`, as a linear form. Examples: `iℏd/dt|ψ⟩ = Ĥ|ψ⟩.` (raw text: `iℏddt|ψ⟩=H^|ψ⟩.`), `σ_Aσ_B ≥ 1/2|⟨[Â,B̂]⟩|`, `ℓ_(rms) = √(a² + b² + c² + …),`. All examples are in the log.
3. **After conversion, make structural edits only.** Every operation is listed in each book's `qa/structure-ops.json`.
   - Remove the running "Chapter One" / "Chapter 1" labels: 11 in *The Sovereign Child*, 9 in *Lords*. The EPUB places each one before the next chapter's contents anchor, so it ended the previous chapter.
   - Put titles in house style: "Chapter 1 — Eating What They Want"; essays "1 — The Fate of Spacetime".
   - Remove non-reading apparatus. This is the print index of *Bold Conjectures* I (750 entries of page numbers), the leftover title page of *The Farthest Reaches*, and five dotted rules (`..................`) that separated text from notes in *The Farthest Reaches*.
   - Open the book with the dedication and supporters' acknowledgement where the EPUB made them a separate contents entry (*Bold Conjectures* I and II, *The Farthest Reaches*). This matches what the converter already does with untitled front matter in *The Sovereign Child* and *Lords*.
   - *Bold Conjectures* I: restore the 22 "Link" row labels in the EPISODE DETAILS tables. The converter's `dropLinkLabels` removed only that row label; Date, Interviewer, Source, Show, Episode, Description, Ideas and Topics were kept.
   - *Bold Conjectures* II: mark the byline and subtitle of "Controversial Coffee", whose markup lacked the classes the converter recognises. Every essay, and Violaris's "A Note on These Essays", now opens with a `byline` paragraph (and a `subtitle` paragraph where the essay has one).
   - Restore two figure captions that the converter cut at 600 characters (*Bold Conjectures* II, figures f5 and f8).
   - Link addresses: the text shows what the book prints. The converter replaces a printed address with its link target, for example the book's `youtu.be/x` becomes `http://youtu.be/x`. That adds text not in the book and fails the app's own source check (below), so the printed form is restored: 12 in *The Farthest Reaches*, 2 in *Bold Conjectures* I, and 9 in *Bold Conjectures* I where the book prints `https://` but the link says `http://`. One printed address differs from its link target: *The Farthest Reaches*, Afterword note [13], prints `youtube.com/watch?v=HfuFcTzNQoY` but links the typo `http://syoutube.com/…`. The printed address is kept. The link target stays in the chapter's `links` metadata wherever the converter recorded one.
   - Group sub-sections (`sections` plus `chapter.section`): *Lords of the Cosmos* Chapters 7 and 8, and the nine Closer To Truth episodes in *Bold Conjectures* I. See INTEGRATION.md.
4. **Figures.** Each picture is a figure paragraph (`￼` + id) with `src: /data/figures/<book-id>/fN.ext`. The image file is in `<book-id>/figures/`, unchanged from the EPUB (Node cannot decode, so the converter keeps web formats as they are). Logos and covers were dropped by the converter as decoration.

The scratch driver scripts are deliberately not committed, because content packages may not contain code. The rules above are complete enough to reproduce the output. Codex may adopt them as tooling: see INTEGRATION.md, "Converter follow-ups".

## Verification

Two independent checks, run on every final file:

1. **App verifier** (`verifyEditionAgainstSource()` from `app/src/worker/lib/epubSource.ts`, the check *Add to Tinct* runs). Every paragraph's letters must be found in the EPUB in order. On raw converter output (`qa/app-verifier.json`), *Sovereign Child*, *Lords* and *Bold Conjectures* II passed with 0 removed. *Bold Conjectures* I would have lost 11 paragraphs and *The Farthest Reaches* failed outright (`null`). The only cause in both was the address substitution described above. On the **final** files (`qa/app-verifier-final.json`), all five pass with **0 removed paragraphs**. `renamedChapters` is 11 for *Sovereign Child* and 20 for *Farthest Reaches* only because house-style titles ("Chapter 1 — …") are not literally printed in the book. The Worker check would rename those chapters to "Section N", but no Worker check runs on built-in editions.
2. **Strict completeness check** (`qa/strict-verify.json`, a scratch tool). It compares letters **and digits** (NFKD, lower case), which the app verifier ignores. It proves note numbers, citation numbers, exponents and years survive. Each edition paragraph must occur in the original EPUB in reading order, and every source character not covered by a paragraph, chapter title or figure caption is listed by spine document. `http(s)://` prefixes are ignored on both sides, so a link written either way still matches.

| Book | Chapters | Paragraphs | Words | Figures | Unmatched paragraphs | Source characters covered | What is not covered |
|---|---|---|---|---|---|---|---|
| The Sovereign Child | 15 | 733 | 55,213 | 0 | 0 | 259,498 / 259,983 | copyright page, printed contents, 11 running "Chapter N" labels |
| Lords of the Cosmos | 30 | 800 | 44,090 | 11 | 0 | 226,762 / 228,549 | "This Book Has No Copyright" page (recorded in rights), printed contents, 9 running labels |
| Bold Conjectures I | 26 | 2,254 | 141,161 | 0 | 0 | 649,752 / 668,888 | half-title, printed contents, print index (18,005 characters) |
| Bold Conjectures II | 18 | 1,222 | 74,611 | 18 | 0 | 398,758 / 399,699 | half-title, printed contents; essay headings, which are in the chapter titles in another form |
| The Farthest Reaches | 25 | 382 | 39,924 | 1 | 0 | 187,332 / 188,411 | half-title, printed contents |

Word counts are whitespace-delimited and exclude figure tokens. No reading prose is missing in any book.

Other read-only checks: `python3 -m json.tool` on every JSON file; chapter numbering 1…N; `kinds` lengths; link ranges; figure files present; `sections` cover every chapter exactly once; no empty paragraphs; no `[]` or `()` debris; no leftover markup or entities. The apparatus/stub scan pattern from `books/AGENTS.md` gave one false positive: *Lords* Acknowledgments matches `om.` in ordinary prose. `qa/validation.txt` in each book folder records the run.

Not applicable or not runnable here:
- `classify-modern-en.py`, `audit-truncation.py` and `content-verify.py` compare a modern-en edition with its original. These books have no modern-en (by instruction).
- `qa/structural-check.cjs`, `app/scripts/split-edition-chapters.cjs` and `check-book-publication.cjs` work only on live `app/public` paths and registry entries, so they belong to Codex after integration.

## Known text-quality points (reading text is complete; these are presentation issues)

- **Inline maths** (*Bold Conjectures* II). Linear text is readable but loses two-dimensional layout. Examples: `(T₁ ⊗ T₂)^∼ = T₁^(∼) ⊗ T₂^(∼)`, `X^((S))` (double parentheses from nested MathML rows), `(ℓ_(rms))/(ℓ_(mhl))`. Three sentences have a space before a full stop after an inline expression ("asked 0 ." in essay 4, "probability 1 ." in essay 5, "value 1 ." in essay 6), inherited from the source's inline-math spacing. Narration will read the maths literally. If Anders wants it, a later pass could render equations as images or MathML.
- **Note markers are visible `[N]`** in *Lords*, *Bold Conjectures* II and *The Farthest Reaches*, with the notes at the end of each chapter or essay. This follows built-in editions and the books' own layout. *Bold Conjectures* II essays use several schemes: footnotes `[1]`, numbered reference lists `1.`, and one essay's endnotes `[1]`. All are kept as printed.
- **Figure alt text is "Image"** in *Bold Conjectures* II and *The Farthest Reaches* (source alt). Each *Bold Conjectures* II figure has its full caption. *The Farthest Reaches* figure f1 (Preface) is a screenshot of a 17 August 2018 post by David Deutsch ("Explanatory universality. The most significant phenomenon in physics.") quoting Richard Dawkins. Its words exist only in the image. Suggested alt for Codex: "Post by David Deutsch, 17 August 2018: 'Explanatory universality. The most significant phenomenon in physics.', quoting Richard Dawkins: 'An ape brain, evolved for raw survival on the African savanna, is capable, without further evolution, of understanding the expanding universe; of building quantum theory, computers, CERN; of coordinating the pianist's fast fingers; of being moved to tears by Bach & Shakespeare'".
- ***Lords of the Cosmos* captions** are separate paragraphs after their figures (as in the source), not figure captions. Several captions end in a note marker (`…universe.[1]`).
- ***Bold Conjectures* I is a set of transcripts.** The editor warns of "imprecisions, accidental contradictions, and awkward sentences"; square brackets are the editor's insertions; timestamps such as `0:21` lead each turn. All are kept. The bios contain a source typo, "Naval Rakivant".
- ***The Farthest Reaches* uses British spelling and spaced hyphens** ("- David Deutsch[1]", "malaise in many places - "). Kept as printed.
- **Running titles.** Sub-section chapters in *Lords* (for example "The First Tools of Reason") begin with subtitle or heading paragraphs such as "Thales". The first sub-section of Chapters 7 and 8 opens with the chapter heading "7. A Knowledge-Centered History of Everything" as a heading paragraph. Both are kept as in the source.
