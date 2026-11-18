# Verification — 2 October 2026

Branch: `claude/gifted-brown-m0y7f4`, which carries the original prototype commit (`7313b7a8`, from `codex/addbooks-search-prototype`) on top of `main` at `addc01e99`. Scope is the same: catalogue search only. No app integration, deploy, book ingestion or LLM calls.

## What changed since the 30 September prototype

- **More libraries:** 9 more libraries in 12+ languages alongside Gutenberg and Standard Ebooks, all with editions usable commercially. Sources, terms and exclusions are in [README.md](README.md#libraries-in-other-languages-scriptscatalog_sources).
- **Copyright gate:** a **life+70 gate** now applies to every source, Gutenberg included. Only out-of-copyright texts are indexed.
- **Search:**
  - all languages are searched by default;
  - there is a source-library filter;
  - Nordic, German and Polish letters fold (ø→o, æ→ae, ß→ss, ł→l);
  - leading articles are ignored in exact-title ranking;
  - English work titles from Wikidata are search aliases, so "Odysseen" and "Odyssey" meet.
- **Cards:** each card lists every library holding the work, the licence and a "View at …" source link.

## Final end-to-end build (`--offline` from downloads made 2 October)

| Measure | Result |
|---|---:|
| Works / editions indexed | **122,753 / 129,186** |
| Languages | 76 |
| Libraries | 11 |
| Works found in more than one library | 3,604 |
| Editions merged into works | 6,433 |
| Editions excluded by the copyright gate | 52,724 |
| Clearly old anonymous texts kept (scripture, early works, dated issues) | 2,421 |
| Editions excluded for a non-commercial licence | 1,976 (Deutsches Textarchiv) |
| Life dates borrowed by unambiguous name match | 8,033 |
| Live Tinct books matched | 76 of 101 |
| Raw / gzipped index | 129.1 MB / 12.6 MB (not committed) |

**Editions per library after the gates:**

| Library | Editions |
|---|---:|
| Gutenberg | 53,211 |
| Wikisource | 49,233 |
| DBNL | 7,429 |
| Projekt Runeberg | 5,919 |
| TextGrid | 4,482 |
| Kalliope | 2,636 |
| Wolne Lektury | 2,355 |
| Bibebook | 1,719 |
| Deutsches Textarchiv | 1,334 |
| Litteraturbanken | 858 |
| Standard Ebooks | 10 |

**Works per language (top 13):**

| Language | Works | Language | Works |
|---|---:|---|---:|
| English | 46,251 | Portuguese | 3,659 |
| French | 16,082 | Finnish | 2,837 |
| German | 16,010 | **Danish** | **2,518** |
| Polish | 10,531 | Italian | 2,232 |
| Dutch | 8,014 | Norwegian | 1,292 |
| Swedish | 5,754 | Latin | 962 |
| Spanish | 5,323 | | |

**Copyright gate exclusions (life+70, cutoff: died before 1956):**

| Reason | Editions |
|---|---:|
| Creator died 1956 or later | 10,356 |
| Possibly alive | 1,722 |
| Unverifiable (no dates, no public-domain statement, no old-anonymous evidence) | 40,646 |

- **By library:** Wikisource 27,869, Gutenberg 24,634, Deutsches Textarchiv 114, Wolne Lektury 66, Runeberg 23, others under 10.
- **Gutenberg examples now excluded:** Agatha Christie, E. M. Forster, P. G. Wodehouse, and Gilbert Murray's translations.
- **Gutenberg examples now kept by the old-anonymous rule:** the King James and Douay-Rheims Bibles, and dated Victorian magazine issues.

**Edition licences** (the library's own edition; every text is public domain; no non-commercial licences remain):

| Licence | Editions |
|---|---:|
| PD | 72,706 |
| CC BY-SA 4.0 (Wikisource) | 49,545 |
| CC BY 3.0 DE (TextGrid) | 4,482 |
| Other CC BY / BY-SA | 2,453 |

## Tests

- `python3 -m unittest discover -s addbooks/scripts -p 'test_*.py'`: **18 passed**. These include licence parsing, letter folding, language-aware articles, cross-library grouping, the Runeberg life+70 rule, the copyright gate, date borrowing, non-commercial detection and the old-anonymous evidence rules.
- `node addbooks/scripts/test-search.mjs`: **passed**.
  - The original English cases still pass.
  - 10 multilingual cases pass, each with its language filter: Danish *Eventyr*, German *Faust*, Dutch *Max Havelaar*, Polish *Pan Tadeusz*, Swedish *Röda rummet*, Norwegian *Peer Gynt*, Spanish *Don Quijote*, Portuguese *Os Lusíadas*, Italian *La divina commedia*, French *Les Misérables*.
  - Also checked: "kobenhavn" finds København; Norwegian codes are unified; the King James Bible is found; every edition carries `rights`/`licence`/`copyright`.
  - **No indexed author or translator died within the last 70 years, and no edition has a non-commercial licence.**
- `verify-browser.mjs` (headless Chromium, Playwright from the environment): **passed** on desktop (1440 × 1080) and phone (390 × 844).
  - Cold local load: 6.7 s / 5.1 s. Offline reload passed. No horizontal overflow, no page errors.
  - Search latency for 10 queries: 61–102 ms.
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
- **Spanish and Italian:** Spanish relies on Wikisource and Gutenberg; Cervantes Virtual and the Biblioteca Nacional block bulk access. Italian relies on Wikisource and Gutenberg since Liber Liber (non-commercial editions) was removed.
- **Life+70 scope:** life+70 is the EU term. Region-specific clearance is still required for imports.
