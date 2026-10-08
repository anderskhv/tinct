# Integration notes for Codex: Conjecture Institute books

Content package only. No registry, taxonomy, app, script or live-data file was changed. Everything below is a proposal for the coding side. Instruction revision: `origin/main` `02c613d8364fc2b37782ea143b3cb92cc9970e06`.

## Status

| Book id | Text | Onboarding | Cover | Rights | Publication |
|---|---|---|---|---|---|
| `the-sovereign-child` | original-en accepted by content-side checks | ready | ready | granted | not started (Codex) |
| `lords-of-the-cosmos` | same | ready | ready | granted | not started |
| `bold-conjectures-volume-1` | same | ready | ready | granted | not started |
| `bold-conjectures-volume-2` | same | ready | ready | granted | not started |
| `the-farthest-reaches` | same | ready | ready | granted | not started |

"Accepted by content-side checks" means: complete against the source by two independent checks, structure reviewed, no reading text lost (see CONVERSION.md). No independent second reviewer has read the texts. These are publisher texts reproduced as published, not editions Tinct has authored or modernised, so the editorial review that applies to modern-en does not arise.

**Strategy note for Anders:** STRATEGY.md §6 lists "Contemporary fiction / nonfiction" as out of scope for the library. Anders's request of 8 October is a deliberate exception: the first in-copyright, permission-based books, on a new shelf. Codex should not treat these titles as public domain anywhere (badges, SEO copy, "free classic" wording).

## 1. Editions

For each book, copy `<id>/<id>-original-en.json` to `app/public/data/editions/<id>-original-en.json`, byte for byte (SHA-256 in `package-summary.json`). Then run `node scripts/split-edition-chapters.cjs <id>-original-en --write-registry`. **One edition per book**: no modern-en, by owner instruction.

Edition-entry proposal, using the `Edition` fields seen in `bookRegistry.ts`:

```ts
{ key: 'original-en', language: 'en', style: 'original', label: 'Stupple (Original)', year: 2025, aligned: false, hasAudio: <per Grok eligibility> }
```

Labels: Sovereign Child "Stupple (Original)", Lords "Khemani & Chipkin (Original)", both Bold Conjectures "Chipkin, ed. (Original)", Farthest Reaches "Hall (Original)". `aligned: false`, since there is no second edition to align with. Single-edition books may need the Compare / split-pane toggle hidden. Check how the reader behaves with one edition.

### Structural features the reader must handle

- **Figures** (`chapter.figures`, `￼`+id paragraphs). There are 11 in *Lords*, 18 in *Bold Conjectures* II and 1 in *Farthest Reaches*. Copy `<id>/figures/*` to `app/public/data/figures/<id>/` (the `src` paths already point there). They are the EPUB's own images, unchanged; the largest is *Lords* f4.png, 544 KB at 1124×969. Codex may re-encode to WebP if that is the convention, keeping file names or updating `src`. Suggested alt text for *Farthest Reaches* f1 is in CONVERSION.md.
- **`kinds`** (heading, label, item, subtitle, byline, line) on most chapters, and **`links`** (external links by word range) where the book has web links.
- **Sub-section grouping.**
  - *Lords* Chapter 7 is split into 14 reading units (`chapter.section` = "Chapter 7 — A Knowledge-Centered History of Everything") and Chapter 8 into 5. The undivided chapters would be about 23,000 and 6,000 words.
  - *Bold Conjectures* I groups the Closer To Truth introduction and its nine episodes under "Robert Lawrence Kuhn: Closer To Truth".
  - Both books carry a top-level `sections` array covering every chapter once. If the contents menu cannot mix single chapters and groups, fall back to flat chapters and prefix those titles, for example "7 · The Big Bang to Abiogenesis: From Seed to Seed". That is a display choice; the text and chapter numbers stay the same.
- **Note markers** `[N]` and note bodies at the end of chapters (*Lords*, *Bold Conjectures* II, *Farthest Reaches*), as in Hume and Rousseau. Narration will read "[1]" unless the narration text filter skips bracketed note numbers. Check what the current filter does for the Gutenberg books that have notes.
- **Maths** (*Bold Conjectures* II) as linear Unicode text. Narration of equations will be literal and imperfect. Consider excluding that book from opening prewarming.

## 2. Registry (`app/src/data/bookRegistry.ts`)

Use `<id>/metadata-proposal.json` for `title`, `author`, `description`, `year`, `wordCount` (`sourceWordCount`), `coverColor` and `coverAccent`. `altTitles` are proposed for *Lords* and both *Bold Conjectures* volumes. Keep the constants staged until Anders approves publication, then add them to `BOOKS`.

Display decisions for Anders, recorded in the metadata:
- *The Sovereign Child* author: "Aaron Stupple" (OPF) or the cover's "Aaron Stupple with Logan Chipkin".
- *Bold Conjectures* I publisher: "Conjecture Institute" (the book's own page) or "Brownstone Institute" (OPF metadata and the brief).
- Editors: the proposal displays "Logan Chipkin (ed.)". If the `Book` type gains an editor or contributors field, `metadata-proposal.json` has per-chapter contributor maps for both volumes.
- **Rights line.** The app has no copyright field today. Each book needs its copyright line visible somewhere: the book's About/details sheet or the onboarding About step. The lines are in `rights/permission.md` and `metadata-proposal.json`.

## 3. Taxonomy (`app/src/data/libraryTaxonomy.ts`)

Taken from `taxonomy-proposal.json`:
- Add the shelf `critical-rationalism`: `{ title: 'Critical Rationalism', sub: 'Popper, Deutsch and how knowledge grows', hue: 175 }`. The longer description is in the proposal.
- Append it to `LIBRARY_HOUSES` → `philosophy.shelves` after `modern-philosophy`.
- Add five `LIBRARY_BOOK_META` entries: form `philosophy`, era `contemporary`, years 2025/2026 and the proposed blurbs, themes and hues. Add the composition years to `public/lab/library_2/browse-groups.js`, as for other new books.
- Open decisions in the proposal: the "2020s" era versus the existing `contemporary`, and the form for the interview and essay volumes.

## 4. Covers

`<id>/cover.jpg` is the EPUB's own cover at full EPUB resolution: Sovereign 1375×2125, Lords 1500×2250, both Bold Conjectures and Farthest 600×900–957. Generate `app/public/covers/v2/<id>.webp` (and `@2x` where the source is big enough) with the existing cover pipeline. These are real publisher covers, not generated art. Do not overlay a title, and do not crop the title or credit text. The three 600-px covers will look soft at large hero sizes.

## 5. Onboarding

Copy `<id>/onboarding.json` to `app/public/data/onboarding/<id>.json`. The schema follows current files: `about`, `whyItMatters` ×3, `angleCards` ×4, `cast`, `openingText` (verified as an exact paragraph of each edition), and `acclaim: []`.
- **Cast for the collections lists contributors** (interviewers for Volume I, essay authors for Volume II), with roles such as "ESSAY 6 — SUPERINFORMATION". The schema has no separate contributors field. If one is added later, the metadata contributor maps are its source.
- **Acclaim is deliberately empty.** No endorsement could be verified in a primary source with a URL. The only candidate is the quotation printed on *The Sovereign Child*'s front cover: "This transformative book challenges the conventional wisdom of enforcing rules on children." — Ray Scott Percival, PhD, author of *The Myth of the Closed Mind*. It is primary (the publisher's cover) but has no URL. Anders can decide whether the cover itself counts.

## 6. Character cards

None proposed. The monographs are arguments, not narratives, and onboarding `cast` covers people and key ideas. No character sidecars or `characterReleases` entries are needed.

## 7. Narration, AI and sharing

Rights permit AI features (Anthropic chat, xAI Talk), stored AI narration and highlight share images (`rights/permission.md`). No audio was generated. Runtime Grok eligibility, `audioAvailability` entries and any prewarming are Codex's decisions under the current contract. Privacy: no change to personal data, so no privacy notice impact.

## 8. App checks after integration (Codex)

`npm run build` and `npm run verify-bundle`. Add the five ids to `PUBLICATION_BOOKS` in `check-book-publication.cjs` if that check is used. Also verify:
- chapters and contents for the grouped books
- figure rendering, including `large` figures
- byline/subtitle styling on *Bold Conjectures* II essays
- `[N]` markers
- single-edition behaviour (no Compare)
- onboarding steps and cover display on library and shelf

## 9. Converter follow-ups (optional tooling; not needed for these books)

The *Add a book* / *Add to Tinct* converter (`app/src/lab/userBook/epubEdition.ts`) loses or garbles the following, which this package fixed by preparing the markup before conversion (CONVERSION.md, step 2). Readers who upload these same EPUBs themselves get the lossy version.
1. Note references and backlinks are deleted, leaving note bodies orphaned at chapter end. Numeric `biblioref` citations are deleted, leaving `[]`.
2. `<sup>`/`<sub>` numbers are flattened: 10⁻⁴³ becomes "10–43".
3. MathML without `alttext` becomes concatenated `textContent`: `iℏddt|ψ⟩=H^|ψ⟩`.
4. A printed link address is replaced by its href, which then fails the Worker's own `verifyEditionAgainstSource`. *The Farthest Reaches* returns `null`; *Bold Conjectures* I loses 11 paragraphs.
5. `dropLinkLabels` removes table row labels ("Link") that sit beside an address-only cell.
6. Figure captions are cut at 600 characters.
