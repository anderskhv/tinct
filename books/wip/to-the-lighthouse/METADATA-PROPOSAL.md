# To the Lighthouse — proposed registry and taxonomy metadata

Proposal for the coding agent. Nothing here has been applied to `app/**`.

## Registry `Book` constant (proposed `TO_THE_LIGHTHOUSE` in `app/src/data/bookRegistry.ts`)

| Field | Proposed value |
|---|---|
| `id` | `to-the-lighthouse` |
| `title` | `To the Lighthouse` |
| `author` | `Virginia Woolf` |
| `description` | `A summer house on the Isle of Skye, a boy who wants to sail to the Lighthouse tomorrow, and a painter trying to finish one picture. Woolf follows the Ramsay family and their guests from mind to mind across one evening, ten silent years, and a final morning — her portrait of her own parents, and of time itself.` |
| `year` | `1927` |
| `wordCount` | `69000` (source: 69,323 whitespace-delimited words) |
| `coverColor` / `coverAccent` | `#1c2a33` / `#c9a45c` (sea-dark slate with lamp gold; editorial suggestion, adjust to house palette) |

### Editions (only these two exist)

| key | language | style | label | year | aligned | audio |
|---|---|---|---|---|---|---|
| `original-en` | `en` | `original` | `Woolf (1927)` | 1927 | `true` | per current Grok runtime contract |
| `modern-en` | `en` | `modern` | `Modern English` | — | `true` | per current Grok runtime contract |

- No `modern-da` or any Danish edition (language scope 2026-09-21).
- **Reader defaults (approved edition policy, 2026-09-24):** primary = `modern-en` (Tinct Modern E); Compare = `original-en` (Woolf's English original). Reason: the work was written in English, so there is no human translation to prefer; the original is the natural comparison text. Apply as initial defaults only, never overwriting a reader's saved edition choice.
- `aligned: true` for the pair: identical 42-chapter / 495-paragraph structure, per-chapter counts equal (verified; see `ACCEPTANCE-RECORD.md`).
- Chapter titles are `The Window · 1` … `The Lighthouse · 13`, with `section` and top-level `sections` (three parts), matching the existing `crime-and-punishment` shape. Confirm the reader's TOC renders the part grouping; if it does not use `sections`, the chapter titles remain self-explanatory.

## Library taxonomy (`app/src/data/libraryTaxonomy.ts`)

An entry already exists (`id: "to-the-lighthouse"`, `stub: true`). Proposed changes to that entry only:

| Field | Current | Proposed |
|---|---|---|
| `stub` | `true` | remove (book becomes live) |
| `langs` | `["EN", "DA"]` | `["EN"]` — no Danish edition is prepared |
| `form` | `novel` | unchanged |
| `era` | `contemporary` | unchanged (same as `ulysses`, 1922) |
| `shelves` | `["modernist-novels"]` | unchanged — House **Novels** → Shelf **Modernism** |
| `themes` | `time, perception, family` | unchanged |
| `blurb` | "A summer house, a postponed trip, time itself as the protagonist." | unchanged |

Reading-list memberships:

| List | Current state | Proposed |
|---|---|---|
| Yale Directed Studies (`yale-ds`) | `{ "id": "to-the-lighthouse" }` | unchanged (now resolves to a live book) |
| Columbia Core (`columbia-core`) | `{ "missing": true, "title": "To the Lighthouse", … }` | replace with `{ "id": "to-the-lighthouse" }` |
| Bloom canon (`bloom-canon`) | `{ "missing": true, "title": "To the Lighthouse", … }` | replace with `{ "id": "to-the-lighthouse" }` |

Please verify these list memberships against current main before applying; line positions move.
