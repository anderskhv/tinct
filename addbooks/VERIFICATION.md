# Verification — 2 October 2026

Branch: `claude/gifted-brown-m0y7f4`, which carries the original prototype commit (`7313b7a8`, from `codex/addbooks-search-prototype`) on top of `main` at `addc01e99`. Scope is the same: catalogue search only. No app integration, deploy, book ingestion or LLM calls.

## What changed since the 30 September prototype

- **More libraries:** 14 more libraries in 12+ languages alongside Gutenberg and Standard Ebooks. Sources, terms and exclusions are in [README.md](README.md#libraries-in-other-languages-scriptscatalog_sources).
- **Copyright gate:** a **life+70 gate** now applies to every source, Gutenberg included. Only out-of-copyright texts are indexed.
- **Search:**
  - all languages are searched by default;
  - there is a source-library filter;
  - Nordic, German and Polish letters fold (ø→o, æ→ae, ß→ss, ł→l);
  - leading articles are ignored in exact-title ranking;
  - English work titles from Wikidata are search aliases, so "Odysseen" and "Odyssey" meet.
- **Cards:** each card lists every library holding the work, the licence and a "View at …" source link.

## Final end-to-end build (`--offline` from fresh downloads made the same day)

| Measure | Result |
|---|---:|
| Works / editions indexed | **124,979 / 133,813** |
| Languages | 76 |
| Libraries | 16 |
| Works found in more than one library | 4,837 |
| Editions merged into works | 8,834 |
| Editions excluded by the copyright gate | 58,061 |
| Life dates borrowed by unambiguous name match | 14,106 |
| Live Tinct books matched | 76 of 101 |
| Raw / gzipped index | 132.8 MB / 13.0 MB (not committed) |

**Editions per library after the gate:**

| Library | Editions |
|---|---:|
| Gutenberg | 51,489 |
| Wikisource | 48,534 |
| DBNL | 7,429 |
| Projekt Runeberg | 5,919 |
| TextGrid | 4,482 |
| Deutsches Textarchiv | 3,258 |
| Kalliope | 2,636 |
| Wolne Lektury | 2,355 |
| Ebooks libres et gratuits | 2,222 |
| Bibebook | 1,719 |
| Liber Liber | 1,178 |
| Bibliothèque numérique romande | 1,027 |
| Litteraturbanken | 950 |
| Bokselskap | 336 |
| Arkiv for Dansk Litteratur | 269 |
| Standard Ebooks | 10 |

**Works per language (top 16):**

| Language | Works | Language | Works |
|---|---:|---|---:|
| English | 44,284 | Spanish | 5,297 |
| French | 17,802 | Portuguese | 3,656 |
| German | 17,479 | Italian | 2,874 |
| Polish | 10,432 | Finnish | 2,832 |
| Dutch | 7,987 | **Danish** | **2,698** |
| Swedish | 5,836 | Norwegian | 1,557 |
| Latin | 956 | Hungarian | 611 |
| Chinese | 179 | Greek | 175 |

**Copyright gate exclusions (life+70, cutoff: died before 1956):**

| Reason | Editions |
|---|---:|
| Creator died 1956 or later | 10,462 |
| Possibly alive | 1,723 |
| Unverifiable (no dates and no public-domain statement from the library) | 45,876 |

- **By library:** Wikisource 28,568, Gutenberg 26,356, Liber Liber 1,314, Ebooks libres et gratuits 964, BNR 440, DTA 166, Bokselskap 144, others under 70.
- **Gutenberg examples now excluded:** Agatha Christie, E. M. Forster, P. G. Wodehouse, and Gilbert Murray's translations.
- **Unverifiable Gutenberg records:** mostly anonymous, collective or undated records (including the King James Bible and periodicals). Gutenberg's metadata has no first-publication date to clear them.

**Edition licences** (the library's own edition; the texts are all public domain):

| Licence | Editions |
|---|---:|
| PD | 70,984 |
| CC BY-SA 4.0 | 48,846 (Wikisource) |
| CC BY 3.0 DE | 4,482 |
| Non-commercial: Free, non-commercial / CC BY-NC / CC BY-NC-SA | 6,956 |
| Other CC BY / BY-SA | 2,545 |

## Tests

- `python3 -m unittest discover -s addbooks/scripts -p 'test_*.py'`: **18 passed**. These include licence parsing, letter folding, language-aware articles, cross-library grouping, the Runeberg life+70 rule, the copyright gate and date borrowing.
- `node addbooks/scripts/test-search.mjs`: **passed**.
  - The original English cases still pass.
  - 10 multilingual cases pass, each with its language filter: Danish *Eventyr*, German *Faust*, Dutch *Max Havelaar*, Polish *Pan Tadeusz*, Swedish *Röda rummet*, Norwegian *Peer Gynt*, Spanish *Don Quijote*, Portuguese *Os Lusíadas*, Italian *La divina commedia*, French *Les Misérables*.
  - Also checked: "kobenhavn" finds København; Norwegian codes are unified; every edition carries `rights`/`licence`/`copyright`.
  - **No indexed author or translator died within the last 70 years.**
- `verify-browser.mjs` (headless Chromium, Playwright from the environment): **passed** on desktop (1440 × 1080) and phone (390 × 844).
  - Cold local load: 4.4 s / 4.9 s. Offline reload passed. No horizontal overflow, no page errors.
  - Search latency for 10 queries: 61–106 ms.
  - Remote covers were unreachable from this sandbox; typography covers are the designed fallback. The check waits for covers but no longer fails on them.

## Screenshots

| State | Desktop | Phone |
|---|---|---|
| empty | [PNG](qa/desktop-empty.png) | [PNG](qa/phone-empty.png) |
| results ("Odyssey") | [PNG](qa/desktop-results.png) | [PNG](qa/phone-results.png) |
| no-results | [PNG](qa/desktop-no-results.png) | [PNG](qa/phone-no-results.png) |
| filters (Danish + Kalliope, "kobenhavn") | [PNG](qa/desktop-filters.png) | [PNG](qa/phone-filters.png) |

## Known limits

- **Search vs. book:** Wikisource "books" include some single long poems and plays catalogued as works on Wikidata. They are searchable, but not all are book-length.
- **Grouping:** translations in different languages remain separate works, linked only by search aliases.
- **Index size:** the index is 13 MB gzipped / 133 MB raw in the browser worker. Low-memory phones need profiling or language-sharded indexes before production.
- **Spanish:** Spanish coverage relies on Wikisource and Gutenberg. Cervantes Virtual and the Biblioteca Nacional block bulk access.
- **Life+70 scope:** life+70 is the EU term. Region-specific clearance is still required for imports.
