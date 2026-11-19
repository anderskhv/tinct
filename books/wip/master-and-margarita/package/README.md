# The Master and Margarita: book package

Everything except the edition texts, for `master-and-margarita`. **Status:** content candidate, handed off for review; not integrated, not published. Integration steps: [`INTEGRATION.md`](INTEGRATION.md). Proposed registry and taxonomy values: [`metadata.json`](metadata.json).

- Branch `content/mm-package`, built on `content/master-and-margarita` at `1fc9ef027b`, after the independent review fixes were applied.
- Editions checked against: modern-en `c067c7bf19ad3cc094e6ad236b01bd12a905b54a506033d95e55f416023028ee`, modern-da `6ce1f882cb3f4d2e37c1f9209dfa9cf60912d6d31487356532835337f07a45cc`, original-ru `9a2cf57330f217a157f9081f6b982467873369dbdc93a7e1da8a24f5c96c5b3d`.
- Instructions followed: `origin/main` as of 5 Nov 2026 (`books/BOOK-TASK-WORKFLOW.md`, `books/README.md`, `books/AGENTS.md`, `books/CLAUDE.md`, `docs/design-system.md`, `PRIMER-CONTENT-FORMAT.md`, `EDITORIAL.md`, `app/scripts/check-primer-data.mjs`).
- All copy was written in this session from the Tinct editions and the Russian. No published translation or commentary was consulted, and no API was called.

## Artifacts

| File | Model on main | What it is |
|---|---|---|
| `onboarding/master-and-margarita.json` | `app/public/data/onboarding/brothers-karamazov.json` | About, 4 reading angles, 6 cast entries, 3 "why it matters" entries. `acclaim: []` |
| `onboarding/master-and-margarita.da.json` | `…/brothers-karamazov.da.json` | The same in Danish, with Danish name forms from GLOSSARY.md |
| `primer-data/master-and-margarita.en.json` | `app/public/lab/library_2/primer-data/brothers-karamazov.en.json` | Opening (88 words), 5 structure items with chapter ranges, 7 people, 4 context topics, 4 notice items, 5 passage links |
| `primer-data/master-and-margarita.da.json` | `…/brothers-karamazov.da.json` | Danish. The opening (87 words) and 4 passage links quote modern-da, never translated English quotes |
| `intro-data/master-and-margarita.json` | `app/public/lab/library_2/intro-data/brothers-karamazov.json` | Author note, hook, 4-paragraph preface, orientation |
| `preface/master-and-margarita.txt` | `app/src/data/prefaces/brothers-karamazov.txt` | Library preface, 5 paragraphs, 291 words |
| `threads/master-and-margarita-threads.json` | `app/public/data/editions/brothers-karamazov-threads.json` | 24 characters, 163 per-chapter `modern-en` entries, names and epithets in en and da |
| `characters/master-and-margarita.py` | `books/characters/entities/brothers-karamazov.py` | 47 entities, aliases and first-encounter cards |
| `characters/characters.v1.json` | `books/characters/brothers-karamazov/characters.v1.json` and `app/public/data/characters/brothers-karamazov.v1.json` | Compiled binding to modern-en: 47 characters, 4,180 mention spans. The same bytes serve both paths |
| `metadata.json` | `BROTHERS_KARAMAZOV` in `bookRegistry.ts`, `libraryTaxonomy.ts`, `taxonomy.js`, `browse-groups.js` | Registry, taxonomy, defaults and the Danish offer, as data |
| `INTEGRATION.md` | `books/wip/grimms-fairy-tales/INTEGRATION.md` | Exact entries to add and every other file the integration step must touch |

## Validation (run 5 Nov 2026, after merging the review fixes)

- **Primer: the real checker.** `app/scripts/check-primer-data.mjs` from main ran unchanged in a scratch root containing these two primer files, the three editions, a one-book `dist/lab/catalogue.json` (default `modern-en`), a `book-openers.json` entry holding the English opening, and the proposed `primer-structure-ranges.json` entry. Result: `PRIMER_FILES 2 · passages 9 · structure ranges 5 (5 resolved against the contents) · PRIMER_CHECK_PASS`. With shard manifests carrying the Part One / Part Two sections, it still passes, with 5 `WARN unit not shown in the contents` (recorded chapters used). All 9 quotes match their edition paragraph exactly.
- **Shapes.** Every JSON file was compared key by key with its Karamazov model: onboarding en/da, primer en/da, intro, threads and the compiled characters file all match. The only difference is optional by contract: an empty `acclaim` list, and a primer `opening` in the English file (see INTEGRATION.md §3).
- **Characters.** `books/characters/build_generic.py` from main was run with only its edition path and output path redirected to this branch. A separate check confirmed `sourceSha256` and all 3,958 paragraph hashes against modern-en, that every one of the 4,180 spans is exactly the alias text at its UTF-16 offsets, and that **every alias in the entity file matches at least once** (two aliases that occurred only inside longer aliases were removed). No entity was dropped. Every card was checked against the text of its first-mention chapter and gives baseline identity only, with no concealed identity or later plot. "The master of ceremonies" is a separate reference entry, so those words are not linked to the master.
- **Threads.** Every chapter key exists. Every entry's chapter contains the character's name, or an unnamed descriptor for the few unnamed appearances (for example the professor in ch. 1–4, the red-haired fanged man in ch. 10, the naked girl in ch. 10 and 14). Every `searchNames` string occurs in modern-en or modern-da. Summaries describe the situation in the chapter without giving away its ending or later twists.
- **Onboarding.** `openingText` equals modern-en 1:1 and modern-da 1:1 exactly. Facts about Bulgakov are limited to well-documented ones: born in Kiev, trained as a doctor, the 1930 letter to the government about burning a draft, death in March 1940, the 1966–67 *Moskva* publication, the 1973 full Soviet edition, and the 1990 Yanovskaya text. No acclaim quotes, because none was verified in a primary source.
- **Copy rules.** Sentence case throughout (the Karamazov model's title-case cast roles and "why it matters" headings were not copied), no mono, plain text only.

## Not produced, or left open

- **Cover art.** None was generated. The paper cover fallback applies.
- **Author portrait** for the intro page (`author-images.json`). An image needs provenance and is out of scope.
- **Danish character cards.** The card format and `characterReleases` are English only, so Danish forms appear only in the threads names and `searchNames`.
- **Canon/list memberships.** None was verified, so none is proposed.
- **Decisions for Anders:** a second shelf (`satirical-novels`); the `russian-novels` shelf sub; edition labels ("Tinct Modern English" from the brief versus the house "Modern English"); whether the Epilogue gets its own section; the English primer opening for `book-openers.json` (review draft).
