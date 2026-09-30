# Add books — standalone search prototype

Built from `claude/eager-edison-6csbv8` at `962c195e6`. Scope: catalogue search only. No app integration, deploy, book ingestion, upload, account, paid conversion or LLM calls. All application data is read at build time; the browser has no app imports or backend.

## Build and preview

Requires Python 3.9+; no Python packages or runtime JavaScript dependencies. Run from the repository root:

```sh
./addbooks/scripts/build-index
python3 -m http.server 4173 --bind 127.0.0.1 --directory addbooks/site
```

Open [localhost:4173](http://127.0.0.1:4173). Use an HTTP server, not `file://`: module workers and offline caching require localhost or HTTPS. Stop the preview server with Ctrl+C.

The first build downloads Gutenberg's complete RDF archive (~121 MiB compressed), Standard Ebooks' public Atom feed, and the EPUBs listed by that feed to read their package metadata. Only metadata is indexed; EPUB contents are not converted, rendered, uploaded or copied into the site. Downloads are cached under `.cache/`; nothing there is committed. Later builds reuse the downloads:

```sh
./addbooks/scripts/build-index --offline  # no network, requires the cached inputs
./addbooks/scripts/build-index --refresh  # obtain a fresh source snapshot
```

Output:

- `site/data/index.json`: compact UTF-8 JSON, full work and edition records.
- `site/data/index.json.gz`: the same JSON compressed with gzip; the browser downloads this and decompresses it inside its search worker.
- `build-report.json`: counts, exclusions, Tinct matches, ambiguous/unmatched Tinct books, unmatched SE works and source references, input SHA-256 hashes, coverage notes, byte sizes.
- `.cache/grouping-review.json`: complete inventory of same-title groups left separate for review; only a small sample goes in the report.

**The generated index exceeds 5 MB gzipped and is intentionally not committed.** Both generated index files are ignored. Build locally before previewing a fresh checkout. No large raw downloads or EPUBs are committed. The dated numbers and verification results for this branch are in [VERIFICATION.md](VERIFICATION.md).

### Standard Ebooks coverage and full exports

The public [new releases Atom feed](https://standardebooks.org/feeds/atom/new-releases) contains just the 15 latest releases. Full [Atom/OPDS feeds require authorized access](https://standardebooks.org/feeds). This build uses the public feed and explicitly says so in the build report and page footer; it is not the complete SE catalogue. No authentication bypass or substituted unofficial catalogue is used.

If you have an authorized full Atom/OPDS acquisition feed export, keep it inside `.cache/` and build with:

```sh
./addbooks/scripts/build-index --se-feed addbooks/.cache/se-all.xml
```

Repeat `--se-feed` for every exported page. Feed `rel=next` links are reported so incomplete exports are visible; they are not silently followed with credentials. Complete feeds can download many EPUBs for translator metadata, so allow more disk space/time. Use `--offline` once these EPUBs are cached. Never commit a feed containing private access details. The builder does not accept or store credentials. A full export's completeness is reported as unverified rather than inferred from its filename.

## Data and source terms

- **Project Gutenberg:** [complete RDF catalogue](https://www.gutenberg.org/cache/epub/feeds/rdf-files.tar.bz2), documented in [offline catalogues](https://www.gutenberg.org/ebooks/offline_catalogs.html). RDF is used instead of CSV because it includes explicit rights, downloads, translators, author birth/death years and file URLs. The RDF metadata identifies its licence as [CC0](https://creativecommons.org/publicdomain/zero/1.0/). The builder accepts only `Text` entries with the exact rights statement `Public domain in the USA` (optional final period), excluding copyrighted/unknown-rights and non-text records. Text records without an EPUB remain discoverable with `epubUrl: null`. EPUB and cover addresses come from `hasFormat`; they are not guessed.
- **Standard Ebooks:** official Atom/OPDS feed entries plus the referenced EPUB's OPF metadata for translators, subtitles and language tags. SE's [public-domain policy](https://standardebooks.org/about) concerns US public-domain source texts/artwork, with SE contributions dedicated under CC0. The feed's language omission defaults to English, then the EPUB's actual language tags replace it. Author and translator dates are enriched only through an unambiguous Gutenberg name/alias match. The catalogue currently selects the compatible EPUB, retaining source ID, landing page and cover URL.
- **Tinct:** only symbols actually listed in `app/src/data/bookRegistry.ts` `BOOKS` count as live. The builder reads that TypeScript file as text; it does not import or execute it. Staged constants do not qualify. A title-plus-author/alias match adds `onTinct` and `tinctIds`, and supplies a known first-publication year from the live registry. It does not imply an identical translation.

US public-domain status is **not worldwide clearance**. No EU/life+70 rights determination or region gate exists here. A production catalogue/import pipeline must resolve rights for the source text, translation and artwork in the reader's region. See Gutenberg's [permissions and linking guidance](https://www.gutenberg.org/policy/permission.html) and [terms of use](https://www.gutenberg.org/policy/terms_of_use.html). Retaining a Gutenberg file URL in metadata does not authorize a production download/deep-link workflow or remove trademark/licence requirements. The prototype has no EPUB download action. It requests source cover URLs at runtime; unavailable covers fall back to CSS typography. No publisher marketing text or source book text is indexed.

## Work and edition model

Each work has `id`, `title`, `subtitle`, `authors[]`, `translators[]`, `originalLanguage`, `firstPublishedYear`, `subjects[]`, `bookshelves[]`, `language[]`, `editions[]`, `popularity`, `quality`, `onTinct`, and `tinctIds[]`. People have `name`, nullable `birthYear`/`deathYear`, and aliases. Edition records retain source, ID, title/subtitle, author/translator metadata, language, URLs, source rights and downloads. SE records also retain region-specific `languageTags` and referenced `sourceGutenbergIds`.

Grouping is deliberately conservative:

- Unicode/accent/punctuation normalization, leading English articles, exact author names or unambiguous aliases, and the same language set.
- A subtitle after a colon/newline or `; or,` is separated. A volume/part/abridgement subtitle remains in the identity. Namespaced IDs remain stable for the same group: the lowest Gutenberg ID, or the SE source ID if there is no PG member.
- A title ending in `of <exact author name>` can join its shorter form, e.g. *The Odyssey of Homer*. The explicit expanded *Meditations of the Emperor Marcus Aurelius Antoninus* title joins Marcus Aurelius' *Meditations*. These rules preserve each edition's title and translator.
- Unknown/collective authors and generic anthology titles remain separate. No fuzzy title merge, author surname-only merge, or blind `dc:source` merge. SE can cite source volumes, selections or several Gutenberg books; that is evidence for review, not permission to collapse them into one work.
- Standard Ebooks is preferred, then Gutenberg download popularity. Work popularity sums Gutenberg editions' feed download counts; SE has no download metric and contributes zero. It is a snapshot signal, not an all-time readership count.
- Work-level translator and quality describe the preferred edition. Other translators remain on their editions and are searchable. A missing translator stays unknown, never borrowed from another edition.
- Original language stays `null` if the feeds/package metadata do not establish it. An English translation does not become an English original. First-publication year is also nullable; the ebook release date is never substituted. This snapshot has no reliable original-language metadata.

Known grouping gaps include alternative translated titles, different languages, names with honorifics, generic collections, adaptations, multi-volume works and several Tinct titles whose catalogue wording differs. See the actual unmatched/ambiguous rows in the report. No title-only ambiguity earns an On Tinct badge. Stable IDs may change when a later catalogue update changes a group's membership; migration policy belongs to the import stage.

## Search and offline behavior

A module worker builds an inverted token index over titles, authors/aliases, translators, subjects and bookshelves. Ranking combines field weight, exact title matching, an author-query preference, short-title coverage and bounded log-download popularity. Metadata-only Gutenberg index titles receive a penalty. Matching supports prefixes, accent normalization, Dostoevsky spelling variants and bounded edit distance with transpositions (one edit for 4–6 letters, up to two for 7+). All meaningful query tokens must match: the interface does not fill out a “top three” with irrelevant books when fewer than three match.

English is selected initially. Language, Standard Ebooks and subject filters combine; an active filter can browse without a query. The subject menu contains frequent subjects and category bookshelves, while all subjects remain searchable. Results render 24 at a time with “Show more books”. The Add buttons are disabled and visibly say “Coming soon”. No search query leaves the browser.

The local service worker caches the shell, catalogue and requested fonts/covers. Once loaded, searches and offline reloads work. Unvisited covers can fall back to typography offline; Google Fonts can fall back to system serif/monospace if unavailable. “Available offline” appears only after the compressed catalogue is found in cache. Online reloads request fresh local assets/catalogue. Browser storage eviction, private-browser restrictions and device memory limits still apply; this is not an installed native app. The catalogue is ~107 MB uncompressed, so real low-memory phones need profiling before production. Viewport tests alone do not establish low-end device performance.

## Verification

No testing tools are required to use the prototype. Node 20+ runs the search assertions:

```sh
node addbooks/scripts/test-search.mjs
python3 -m unittest discover -s addbooks/scripts -p 'test_*.py'
```

The optional browser check uses Playwright from an existing installation or an isolated QA installation. It adds no app dependency:

```sh
# Optional, only if Playwright is not already available:
npm install --prefix addbooks/.cache/browser-qa --no-save playwright
node addbooks/.cache/browser-qa/node_modules/playwright/cli.js install chromium

PLAYWRIGHT_MODULE="$PWD/addbooks/.cache/browser-qa/node_modules/playwright/index.mjs" \
  node addbooks/scripts/verify-browser.mjs
```

Start the preview server first. Set `ADDBOOKS_URL` if using another local port and optional `CHROMIUM_PATH` for an already installed Chromium binary. Checks always launch isolated headless Chromium with `--mute-audio`; they never use personal browser tabs. Eight viewport PNGs cover empty, results, no results and combined filters at desktop and phone sizes. The script also checks typo search, all four requested queries, French filtering, disabled Add, offline reload, console exceptions and horizontal overflow. Results are saved under `qa/`.

## Next steps and open questions

1. Obtain authorized full SE feed coverage. Review work identity across translations/languages, multi-volume works, anthologies and adaptations; decide whether a work should expose a selectable edition/translator. Improve authority/title mappings and metadata provenance before assigning durable import IDs.
2. Add whole-book Wikisource and open-access books (DOAB/OAPEN, Open Textbook Library), recording region and licence permissions explicitly. Define how download popularity from different providers compares.
3. Add public-domain full-view scans from Internet Archive/HathiTrust behind the quality gate, with region-gated Canada/Australia/Faded Page sources.
4. Build the converter and structural QA gate, then a separate authorized import pipeline. Later: private uploads and modern English. Nothing in this prototype implements or authorizes them.
