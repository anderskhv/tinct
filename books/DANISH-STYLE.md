# Danish house style (`modern-da`)

**Started 2026-10-22**, when Anders set Danish as work in progress with the plan to roll it out across the library ([language strategy](../STRATEGY.md#language-scope)). This guide applies to every Danish reading edition (`modern-da`) written, reviewed or integrated from now on. Where a rule below says "as the live editions do", the convention was read from the Danish editions Tinct already offers (`OFFERED_DANISH_EDITIONS` in `app/src/data/editionAvailability.ts`).

## Source and structure

- Translate from the current `modern-en` on `origin/main`, paragraph for paragraph. Keep the same chapter numbers, the same paragraph count per chapter and the same line breaks inside a paragraph (verse, letters). Saved places and highlights map by chapter and paragraph index, so the structure must stay 1:1.
- Record the `modern-en` source hash in the package (git blob and SHA-256). On integration it goes in `app/src/data/danishEditionSources/<bookId>.json`; `app/src/data/danishEditionSources.test.ts` (added with the 2026-10-22 integrations) then fails when `modern-en` changes, until the Danish is updated or the record is marked `stale` with a reason.
- Chapter and section titles are translated ("Kapitel 1", "Første del, kapitel 1", "Kapitel 1 — Varsler").
- Keep `_emphasis_` underscores where `modern-en` has them.

## Titles: hr., fru, frøken

Anders, 2026-10-22: "Hr/fru."

- Use **hr.** (with the abbreviation dot), **fru** and **frøken** (written out; not "frk."), as the live editions do: "hr. Darcy", "fru Ramsay", "frøken Dashwood".
- Lower case, except at the start of a sentence (including the first word inside »…«): "Hr. Linton tog hende med", "sagde hr. Linton".
- Never leave Mr., Mrs., Miss, Ms. or Mister in the Danish text. Check every book with a search for `\bMr\.?\s`, `\bMrs\.?\s`, `\bMiss\s` and `\bMs\.?\s` before handing it off.
- English titles of rank stay as they are, with their capital: Sir John, Lady Middleton, Lord. A foreign title the English keeps (madame, monsieur) follows the same lower-case rule as hr. and fru; "madam" as a Danish period title likewise ("madam Dean", "Madam Dean?" at a sentence start).

## Units: leagues are »mil«

Anders, 2026-10-22: "mil."

- A league is **mil**, and the figure is kept: "hundred and fifty leagues" is "hundrede og halvtreds mil". Never "sømil" (a nautical mile is about a third of a league, so it shrinks every distance) and never a conversion to kilometres.
- Keep the author's units and figures in general; do not convert to metric. (Moby-Dick run C restored Melville's units after a metric draft.)
- Not yet settled: English **miles**. Current editions use "miles" (run B), "mil" and "sømil" at sea (Moby-Dick) and "verst" for Russian versts. Do not change figures; ask Anders before normalising miles across books.

## Punctuation

- Quotation marks: »…« outside, ›…‹ inside. No English “…” or "…" marks. Dialogue punctuation sits inside the closing mark: »Ja,« sagde han.
- A quotation that runs over several paragraphs opens each paragraph with » and closes only at its end, as `modern-en` does. Every paragraph whose `modern-en` opens with a quotation mark opens with ».
- Dash: a spaced em dash ( — ), as the live editions do, including before a closing quote for broken-off speech (»Jeg tror —«). Not the en dash (–).
- Ellipsis: the single character …; a spaced ellipsis for a pause ("men … jeg tror").
- Modern counting (halvtreds, firs), never the old forms (halvtredsindstyve); `books/danish-lint.py` checks this.

## Address and register

- De/du follows the source's formality and changes where the relationship changes. Record the switch points in the review log.
- Plain modern Danish, not archaic; keep the author's period without inventing dialect.

## Hyphenation and layout

The reader sets `lang="da"` on Danish text and hyphenates with the Danish patterns (`hyphenation.da`). Do not insert soft hyphens or manual line breaks. Visual QA checks Danish hyphenation, quotation marks, dashes, headings and overflow at 390x844 and 1440x950.

## Integration checklist

A separately assigned step, as for the 2026-10-22 runs B and C:

1. Copy the package's `<bookId>-modern-da.json` byte for byte to `app/public/data/editions/`; when the book's English editions are chapter-sharded, run `node scripts/split-edition-chapters.cjs [--write-registry] <bookId>-modern-da` from `app/`.
2. Register `{ key: 'modern-da', language: 'da', style: 'modern', label: 'Moderne Dansk', aligned: true, hasAudio: false }`, and add `<bookId>/modern-da` to `OFFERED_DANISH_EDITIONS` and `TEXT_ONLY_EDITIONS` (Danish narration is disabled). English stays the default and the default compare edition.
3. Add the source record (`danishEditionSources/<bookId>.json`) and update the pinned list in `editionAvailability.test.ts`.
4. Replacing a withdrawn Danish text with the same paragraph structure needs no coordinate map: saved places and highlights keep their chapter and paragraph (as in the 2026-10-19 Danish rewrites). A change of structure needs a map under `app/public/data/edition-migrations/` and a release in `editionContentRevisions.ts`; stop and ask before that.
5. Visual QA page by page at 390x844 and 1440x950, `npm test`, `CI=1 npm run build`, `npm run verify-bundle`, `node scripts/check-edition-holds.cjs`.

## Live editions that differ (follow-up, not changed yet)

Found on 2026-10-22 by a scan of every `app/public/data/editions/*-modern-da.json` on `origin/main`. Most of these editions are withdrawn (held); the offered ones are marked. Each needs its own assignment.

Titles (Mr./Mrs./Miss left in the Danish, counts of occurrences):

| Edition | Mr. | Mrs. | Miss | Note |
|---|---|---|---|---|
| a-little-princess | 91 | 9 | 328 | **offered** |
| around-the-world-80-days | 389 | 0 | 0 | **offered** |
| pride-and-prejudice | 786 | 346 | 245 | |
| great-expectations | 708 | 164 | 373 | |
| jane-eyre | 483 | 248 | 91 | |
| ulysses | 468 | 109 | 45 | |
| the-awakening | 93 | 143 | 10 | |
| frederick-douglass | 128 | 18 | 0 | |
| jekyll-and-hyde | 121 | 0 | 0 | |
| heart-of-darkness | 52 | 0 | 0 | |
| brothers-karamazov | 8 | 26 | 0 | |
| democracy-in-america | 18 | 0 | 0 | |
| jerusalem | 1 | 17 | 0 | |
| richard-iii | 2 | 16 | 0 | |
| frankenstein | 11 | 4 | 0 | |
| moby-dick | 10 | 11 | 0 | replaced by run C |
| utilitarianism | 10 | 0 | 0 | |
| vindication-rights-of-woman | 3 | 8 | 0 | |
| walden | 5 | 3 | 0 | |
| anna-karenina | 0 | 0 | 7 | |
| on-liberty | 3 | 0 | 0 | |
| federalist-papers, hume-enquiry | 2 | 0 | 0 | |
| leviathan, the-prince, war-and-peace | 1 | 0 | 0 | |
| taming-of-the-shrew | 0 | 1 | 0 | |

Capitalised titles mid-sentence: grimms-fairy-tales (**offered**; "Fru Ræv", "Hr. Ræv", 18) and candide ("Frøken Cunegonde", 11). niels-lyhne follows Jacobsen's own capitalised "Fru Boye" and is left as is.

Leagues not rendered as »mil«:

| Edition | Rendering | Chapter:paragraph (0-based) |
|---|---|---|
| moby-dick | sømil | 41:12, 45:20, 54:8 (replaced by run C) |
| the-tempest | sømil | 2:36, 6:5 |
| paradise-lost | sømil | 4:19 |
| frankenstein | kilometer ("twenty leagues" as "hundrede kilometer") | 18:19 |
| hume-enquiry | kilometer ("two hundred leagues" as "nogle kilometer") | 7:7 |

Dashes: run C's three books used the en dash and were set to the em dash on integration; the older withdrawn editions were not checked.
