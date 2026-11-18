# The Master and Margarita: integration notes

For the separately assigned integration step. Nothing in `app/`, the registry or live data has been changed. Exact values are in [`metadata.json`](metadata.json).

Package built against `content/master-and-margarita` at `1fc9ef027b` (review fixes applied). Edition SHA-256: original-ru `9a2cf573…c5b3d`, modern-en `c067c7bf…028ee`, modern-da `6ce1f882…a45cc`. If the edition texts change again, rebuild the characters file (step 6) and rerun the checks in `README.md`.

## 1. Editions and registry (`app/src/data/bookRegistry.ts`)

Copy the three editions to `app/public/data/editions/` and add, then append `MASTER_AND_MARGARITA` to `BOOKS`:

```ts
export const MASTER_AND_MARGARITA: Book = {
  id: 'master-and-margarita',
  title: 'The Master and Margarita',
  author: 'Mikhail Bulgakov',
  altTitles: ['Master i Margarita', 'Мастер и Маргарита'],
  description: 'Bulgakov\'s great comic novel: the devil and his retinue spend a few spring days turning 1930s Moscow upside down, while a persecuted writer\'s novel tells how Pontius Pilate judged a wandering philosopher. A love story, a satire and a fable about cowardice and mercy.',
  year: 1967,
  wordCount: 150000,
  coverColor: '#17151f',
  coverAccent: '#c9a45c',
  editions: [
    { key: 'original-ru', language: 'ru', style: 'original', label: 'Original (Russian)', year: 1990, aligned: true },
    { key: 'modern-en', language: 'en', style: 'modern', label: 'Tinct Modern English', aligned: true },
    { key: 'modern-da', language: 'da', style: 'modern', label: 'Tinct Modern Danish', aligned: true },
  ],
}
```

- `year` is first publication (Moskva, 1966–67); composition 1928–1940 goes in the library `year` string. `original-ru` `year: 1990` is the Yanovskaya text followed.
- **Labels.** The brief asked for "Original (Russian)", "Tinct Modern English" and "Tinct Modern Danish". Every other book on main uses "Modern English" and "Moderne Dansk", and the original's label is usually a short edition name ("Смерть Ивана Ильича (1886)" for Ivan Ilyich). Check how the edition picker prefixes labels before using the brief's strings, so that "Tinct" is not shown twice.
- **Alignment.** All three editions have the same 33 units and 3,958 paragraphs, 1:1. Unlike Ivan Ilyich's `original-ru` (`aligned: false`), this Russian original is aligned.
- **Defaults.** Primary `modern-en` (from `defaultPrimaryEditionKey`). Compare `original-ru`: with no human English edition, `defaultCompareEditionKey` returns `comparable[0]`, so `original-ru` must be listed first. `humanPrimaryEditionKey` falls back to `modern-en`. No code change is needed; add a test that pins both defaults.
- **Danish.** Add `'master-and-margarita/modern-da'` to `OFFERED_DANISH_EDITIONS` in `app/src/data/editionAvailability.ts`. Anders requested this edition on 5 Nov 2026. Without it, `editionHold` withholds the edition. `check-edition-holds-production.cjs` asserts that Danish is never the default Compare, which holds here.
- **Epilogue.** Chapter 33 has no `section`. If the contents or catch-up code needs every chapter in a section, add `{ title: 'Epilogue' / 'Эпилог' / 'Epilog', chapters: [33] }` to all three editions.
- Also needed: shard generation (`editionShardRegistry.ts`), `editionDifficulty.ts` if `original-ru` needs a rating, `bookMetaGenerated.ts` and the sitemap (`npm run sitemap`), `app/public/read/master-and-margarita/book.html`, `check-book-publication.cjs`, `books/wip_inventory.py`. No `editionContentRevisions.ts` entry is needed, because this is a first release.
- **Audio.** No `hasAudio`. Grok streaming narration for `modern-en` follows the audio task's scope.

## 2. Library taxonomy

- `app/src/data/libraryTaxonomy.ts` `LIBRARY_BOOK_META`: the `libraryTaxonomy` object in `metadata.json` (House Fiction, shelf `russian-novels`, form `novel`, era `contemporary`, year "1928–1940", ySort 1940, langs EN/DA/RU). The shelf sub "Dostoevsky and Tolstoy" no longer covers the shelf. Proposed: "Dostoevsky, Tolstoy and Bulgakov". A second shelf, `satirical-novels`, is optional and needs Anders's decision.
- `app/public/lab/library_2/taxonomy.js` `metadata`: `"master-and-margarita": {"form": "novel", "era": "contemporary"}`.
- `app/public/lab/library_2/browse-groups.js` `compositionYears`: `"master-and-margarita": 1940`.
- Canon and lists: none. No membership was verified in a primary source.

## 3. Onboarding, primer, intro, preface

- `onboarding/master-and-margarita.json` and `.da.json` → `app/public/data/onboarding/`. `acclaim` is empty: no quote was verified in a primary source. `openingText` is modern-en/modern-da 1:1, because paragraph 1:0 is the *Faust* epigraph.
- `primer-data/master-and-margarita.en.json` and `.da.json` → `app/public/lab/library_2/primer-data/`. Also add:
  - `app/public/lab/library_2/book-openers.json`: an entry with `workId: "master-and-margarita"` and `opening` equal byte for byte to the English file's `opening`. The English opening is kept in the primer file because no openers entry exists yet; `check-primer-data.mjs` compares the SHA-256. Mark it `editorialStatus: "review draft"`, `publicationApproved: false` until Anders approves it.
  - `app/scripts/primer-structure-ranges.json`:
    ```json
    "master-and-margarita": {"paragraphs": false, "items": [
      {"first": 1, "last": 6, "kept": false, "en": "Chapters 1–6", "da": "Kapitel 1–6"},
      {"first": 7, "last": 12, "kept": false, "en": "Chapters 7–12", "da": "Kapitel 7–12"},
      {"first": 13, "last": 18, "kept": false, "en": "Chapters 13–18", "da": "Kapitel 13–18"},
      {"first": 19, "last": 24, "kept": false, "en": "Chapters 19–24", "da": "Kapitel 19–24"},
      {"first": 25, "last": 33, "kept": false, "en": "Chapter 25 – epilogue", "da": "Kapitel 25 – epilog"}]}
    ```
    With shard manifests present, the contents show "Part One, 1. …", so the checker reports these ranges as `WARN unit not shown in the contents` and uses the recorded chapters. That is a warning, not an error.
- `intro-data/master-and-margarita.json` → `app/public/lab/library_2/intro-data/`. Add the hook to `reviewed-introductions.js`. `check-reviewed-introductions.mjs` asserts exactly 101 source books from two `books/wip/*` copy files and needs an author-images entry. Both need updating, and Bulgakov has no portrait in `author-images.json` yet (an image needs provenance and is out of scope here).
- `preface/master-and-margarita.txt` → `app/src/data/prefaces/`, plus an entry in `docs/design/library-prefaces/manifest.json`.

## 4. Threads

`threads/master-and-margarita-threads.json` → `app/public/data/editions/`. 24 characters and 163 chapter entries (`modern-en`), with names and epithets in en and da. The loader is convention-based and `threadsAvailability.ts` needs no change. Roles: `fallen-angel` for Woland, Koroviev, Behemoth and Azazello (the value Paradise Lost uses), `creature` for Hella, `mortal` for everyone else. The reader does not display roles.

## 5. Characters

- `characters/master-and-margarita.py` → `books/characters/entities/master-and-margarita.py`. Then, from `books/characters/`, run `python3 build_generic.py master-and-margarita` against the registered `app/public/data/editions/master-and-margarita-modern-en.json`. The result must equal `characters/characters.v1.json` byte for byte (the same compiler was run here with only its input/output paths redirected).
- Copy the compiled file to `books/characters/master-and-margarita/characters.v1.json` and `app/public/data/characters/master-and-margarita.v1.json`.
- `app/src/services/characters/characterCards.ts` `characterReleases`: `'master-and-margarita': { editions: ['modern-en'], revision: '2026-11-05.1' }`. This is English only: the card format has no Danish, and there is no English original.
- `master-of-ceremonies` is a deliberate `reference` entry. It owns the phrase "the master of ceremonies" (ch. 12, 15, 17, 33), so that the longer span wins and those words are not linked to the master.

## 6. Other

- `DECISIONS.md`: record the registration and the Compare default.
- Privacy: no personal-data change.
- Rights: public domain in Denmark/EU since 2011. Anders accepted the US risk on 5 Nov 2026.
- Visual QA page by page before shipping (CLAUDE.md product policy).
