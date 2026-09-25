# Source-completeness audit — G06-novels-a

- **Group:** G06-novels-a
- **Books (priority order):** don-quixote, moby-dick, brothers-karamazov, war-and-peace, anna-karenina, great-expectations, the-awakening, ulysses, notes-from-underground, ivan-ilyich
- **Audited commit:** main `1a7d89ebd816af8a2ac18239010c34fab4bf48c5` (local checkout, read-only)
- **Date:** 2026-09-25. All findings are `status: PROPOSED`. A separate reviewer confirms them.
- **Machine-readable:** `G06-novels-a.findings.json` (same folder)

## Checks performed (every book)

1. **Served editions** come from `inventory.json`. For all 20 sharded editions I compared `editions-chapters/<ed>/chNNNN.json` with the full JSON. Every `original-en` and `modern-en` shard equals its full file.
2. **Authoritative source.** Each source was fetched once into scratch, with its sha256 and UTC time recorded:
   - Project Gutenberg for nine books;
   - Wikisource EN, Wikisource RU and ilibrary.ru for Ivan Ilyich.
   The three local raws (brothers-karamazov, great-expectations, notes-from-underground) were diffed against the current PG files.
3. **Body delimitation.** I excluded PG boilerplate, contents lists, Ormsby's introduction and transcriber notes. I kept authorial prefaces, dedications, verses, epigraphs, epilogues and datelines in scope.
4. **`align.py`, whole text** (k=6), at `--min 12`, then again at `--min 1` to classify short runs. Every run of 25 or more tokens was inspected.
5. **Paragraph-level checks.** k-gram alignment can hide dropped one-line paragraphs, so I added two checks:
   - `parcmp.py`: difflib alignment of source paragraphs against edition paragraphs;
   - `shortdrop.py`: an exact equality test for every source paragraph of 14 words or fewer, inside its anchored edition window.
6. **Structure.** For every chapter I located its first paragraph in the source and checked that a heading precedes it. I also compared chapter, part and book labels against the source markers. All chapter boundaries in all ten books match the source.
7. **Cross-witness front-matter check.** I compared each work's units against Standard Ebooks tables of contents: Don Quixote, Moby-Dick, Karamazov, Anna Karenina, War and Peace, Great Expectations, The Awakening, Ulysses and Notes from Underground.
8. **modern-en.** I reviewed all `SHORT_VS_ORIG`, `MOD_DUP_ADJ` and `DUP_ADJ` flags. As an extra, I screened every paragraph of 60 or more words at a ratio below 0.55, and every chapter at a ratio below 0.8. modern-da was checked for presence only.
9. **Existing packages** were reconciled:
   - `moby-dick-structural` and `green-moby-dick`, on `origin/claude/charming-shannon-mojaef` @52c72004;
   - the don-quixote, brothers-karamazov, anna-karenina and war-and-peace repair folders, `brothers-karamazov-verse-review` and `green-ivan-ilyich`, on `origin/claude/friendly-albattani-qgyqfi` @0252b80d;
   - `books/wip/ivan-ilyich-en|da` on main (modern-edition batches only).

**Tool caveats**

- PG files use CRLF line endings. Alignment ran on LF-normalised copies, but the sha256 values below are of the files as downloaded. Line numbers are identical in both.
- Leftover uncovered source tokens are chapter headings, part numerals, `[Illustration]` markers and Don Quixote image captions, as explained per book.
- The modern-edition screens detect only whole-passage losses. They are not a fidelity review.
- Wikimedia rate-limited one API call (HTTP 429). The retry used `action=raw` with a generic User-Agent.

## Summary

| Book | Verdict | Source (coverage: source % / edition %) | Top findings |
|---|---|---|---|
| don-quixote | DEFECTS | Ormsby, PG #996 (98.54 / 100) | **S1** Part I Prologue "Idle reader" missing (01). Part I commendatory verses missing (02, S2). Part I dedication missing (03, S3). Part II dedication and prologue misplaced into "Part 1, Chapter 52" (04, S3). Headings served as body text (05, S4). |
| moby-dick | DEFECTS | PG #2701 (98.00 / 100) | **S1** Etymology and Extracts missing (01, known, package ready). Hawthorne dedication absent (02, S3, UNCERTAIN, new). Split titles (03, S4, known). Invented Epilogue subtitle (04, S4). modern-en sentence-block omissions (05, S2, known). |
| brothers-karamazov | DEFECTS | Garnett, PG #28054 = local raw (99.83 / 100) | John 12:24 epigraph absent (01, S3, UNCERTAIN). Part headings served at chapter ends (02, S4). "THE END", "FOOTNOTES" and translator notes served as the last paragraphs (03, S4). "From the Author" is not in Garnett (SCOPE). |
| war-and-peace | DEFECTS | Maude, PG #2600 (99.86 / 100) | Last chapter of 16 Books labelled with the next Book (01, S3). modern-en tail omissions and drift (02, S2, known). |
| anna-karenina | DEFECTS | Garnett, PG #1399 (99.87 / 100) | Eight Parts not represented; Part headings served at the end of the previous Part (01, S3). Epigraph not in Garnett (SCOPE). |
| great-expectations | COMPLETE-VS-SOURCE | PG #1400 = local raw (99.93 / 100) | modern-en 26.0 drops a 215-word passage (01, S2, modern-en only). |
| the-awakening | DEFECTS | PG #160, novel only (99.78 / 99.98) | 22 one-line dialogue paragraphs dropped at import (01, S2). |
| ulysses | DEFECTS | PG #4300 (99.99 / 100) | Closing dateline missing (01, S4). Three-part division not represented (02, S4). |
| notes-from-underground | COMPLETE-VS-SOURCE | Garnett, PG #600 = local raw (99.92 / 100) | none |
| ivan-ilyich | DEFECTS | RU: Wikisource/az.lib.ru, cross-checked with ilibrary (99.81 / 99.95). EN: Maude, Wikisource (99.89 / 100.00) | Editorial footnotes served in original-ru (01, S4). Both source editions are otherwise complete. |

Verdicts: DEFECTS 8, COMPLETE-VS-SOURCE 2. Findings: S1 ×2, S2 ×5, S3 ×6, S4 ×8.

---

## don-quixote — Don Quixote (Cervantes, tr. Ormsby)

**Served editions**

| key | sha256 (16) | label |
|---|---|---|
| original-en | `f7f7785e59136d88` | Ormsby (1885) |
| modern-en | `6610ca122d1db97f` | Modern English |
| modern-da | `4865fe9fbead9055` | Moderne Dansk |

- 126 chapters and 3,939 paragraphs in every edition.
- The original-en and modern-en shards equal the full JSON.
- The **modern-da shards differ from the modern-da full JSON**: all 126 titles and 1,653 paragraphs. Presence checks were done on both versions.

**Source**

- https://www.gutenberg.org/cache/epub/996/pg996.txt, retrieved 2026-09-25T11:54:15Z, sha256 `2864143e9addf498…d24d4`.
- Header: *Don Quixote* / Miguel de Cervantes Saavedra / Translator: John Ormsby.
- There is no local raw.
- Standard Ebooks' Ormsby edition gives the same unit list: Part I Dedication, Preface, Some Commendatory Verses; Part II Dedication, Preface.

**Body delimitation:** from "THE AUTHOR'S PREFACE / Idle reader" (line 2099) to the PG end marker. Ormsby's introduction and the ebook editor's note are excluded (SCOPE).

**Alignment (original-en):** 413,113 source tokens and 406,991 edition tokens. Coverage 98.544% of source and 100.0% of edition.

- There are 15 MISSING runs of 12 or more tokens (4,161 tokens), 14 of them 25 or more. **All of them fall inside the Part I front matter** (source tokens 0–4,277).
- 0 EXTRA, 0 ORDER, 0 DUPLICATE.
- The paragraph-level checks find no dropped short paragraphs; the only unmatched items are image captions.

**Structure**

- Part I has 52 chapters and Part II has 74, matching the source.
- Every chapter's paragraph 0 is its descriptive heading, and the titles are generic.
- The Part II front matter sits inside Part I, chapter 52.

**Verdict: DEFECTS**

| ID | Type | Sev | Location | Extent | Summary | Evidence (source; modern-en / modern-da; repair) |
|---|---|---|---|---|---|---|
| 01 | MISSING | **S1** | before 1.0 | 2,588 w | Part I Prologue ("The Author's Preface") absent | pg996.txt 2099–2331. Starts "Idle reader: thou mayest believe me without any oath that I would this book…". Ends "…may God give thee health, and not forget me. Vale." Book opens at 1.0 "WHICH TREATS OF THE CHARACTER AND PURSUITS…". Absent in modern-en and modern-da. No repair. |
| 02 | MISSING | S2 | before 1.0 | 1,409 w | Part I "Some Commendatory Verses" absent: Urganda the Unknown; Amadis; Belianis; Oriana; Gandalin; el Donoso; Orlando; the Phoebus sonnet; Solisdan; the Babieca–Rocinante dialogue | pg996.txt 2335–2626. Starts "URGANDA THE UNKNOWN / To the book of Don Quixote of la Mancha / If to be welcomed by the good". Ends "…They're both as sorry hacks as Rocinante." Absent in both modern editions. No repair. |
| 03 | MISSING | S3 | before 1.0 | 198 w | Dedication of Part I to the Duke of Béjar absent | pg996.txt 2634–2658. Starts "In belief of the good reception and honours that Your Excellency bestows…". Ends "…littleness of so humble a service. Miguel de Cervantes". Absent in both modern editions. |
| 04 | MISPLACED | S3 | 52.47–52.61 (label "Part 1, Chapter 52") | 1,971 w | Part II front matter served as the last 15 paragraphs of Part I, chapter 52: "Volume II", the Dedication to the Count of Lemos, and the Part II Author's Preface ("God bless me, gentle (or it may be plebeian) reader…") | Source places it at pg996.txt 21695–21889, between Part I ch. LII and Part II ch. I. Before it comes 52.46 "_Forse altro cantera con miglior plettro._". It ends "…and also the Second Part of 'Galatea.'" and is followed by 53.0 "OF THE INTERVIEW THE CURATE AND THE BARBER…". Same position in modern-en and modern-da (full file and shards). The repair's dq-batchE notes and review cite "ch. 52, paras 47–61" without flagging the placement. |
| 05 | MISLABELED | S4 | x.0 of all 126 chapters | — | Descriptive chapter headings are served as body paragraph 0 under generic titles ("Part 1, Chapter 1") | Same pattern in modern-en and modern-da. |

**Open questions**

- Who translated the two dedications in PG #996 is not stated. Their English is not Ormsby's style, so the PG editor may have supplied them. They are Cervantes's authorial matter either way.

## moby-dick — Moby-Dick (Melville)

**Served editions**

| key | sha256 (16) | label |
|---|---|---|
| original-en | `30974242d9ee3eae` | Original (1851) |
| modern-en | `2ab04dd727bbe580` | Modern English |
| modern-da | `208eb3954e5eb637` | Moderne Dansk |

- 136 units (135 chapters plus the Epilogue) and 2,432 paragraphs in every edition. The shards equal the full JSON.

**Source**

- https://www.gutenberg.org/cache/epub/2701/pg2701.txt, retrieved 11:54:16Z, sha256 `907420db6c4b68c7…a18b`. This is the same file that the packages cite.
- Header: *Moby Dick; Or, The Whale* / Herman Melville.
- There is no local raw.

**Body:** from "ETYMOLOGY." (line 336) to the PG end marker. The transcriber's notes are excluded.

**Alignment:** 218,631 source tokens and 214,215 edition tokens. Coverage 97.998% of source and 100.0% of edition.

- 10 MISSING runs of 12 or more tokens:
  - the 6 runs of 25 or more are all Etymology and Extracts (source tokens 0–3,731);
  - the other 4 are chapter-heading tokens (56, 57, 73, 120).
- 0 EXTRA, 0 ORDER, 0 DUPLICATE, and no dropped short paragraphs.
- The Epilogue is complete, including the Job epigraph (136.0–136.2).

**Package claims verified**

`moby-dick-structural` is accurate:

- Etymology and Extracts are absent (lines 336–843);
- chapter titles 56, 57 and 73 are split;
- nothing else is missing from Chapter 1 through the Epilogue.

It does **not** cover the Hawthorne dedication or the Epilogue subtitle.

**Verdict: DEFECTS**

| ID | Type | Sev | Location | Extent | Summary | Evidence / status |
|---|---|---|---|---|---|---|
| 01 | MISSING | **S1** | before 1.0 | about 3,600 w | "Etymology" (Late Consumptive Usher) and "Extracts" (Sub-Sub-Librarian) absent | pg2701.txt 336–838. Starts "ETYMOLOGY. (Supplied by a Late Consumptive Usher…) The pale Usher—threadbare in coat". Ends "…And King of the boundless sea.' —Whale Song." Absent in both modern editions. **Known**: restored in `moby-dick-structural` (front-matter original-en `03e85576…` and modern-en `3cca436f…`); accepted, not released. |
| 02 | UNCERTAIN | S3 | before 1.0 | 15 w | Dedication "In token of my admiration for his genius, this book is inscribed to Nathaniel Hawthorne." absent | Not in PG #2701 (the matched source). It is in the 1851 edition and in Standard Ebooks (`dedication.xhtml`, sha `7a8e7a2e…`). Absent everywhere in the served book. The structural package does not include it. |
| 03 | MISLABELED | S4 | 56.0, 57.0, 73.0 | 11 w | Chapter titles cut by the PG line wrap; the fragments are served as paragraph 0 | **Known**, and fixed in `moby-dick-structural`. |
| 04 | MISLABELED | S4 | ch136 title | — | "Epilogue — The Drama's Done": the subtitle is invented, since the source heading is just "Epilogue" (line 21933) | modern-da has "Epilog — Dramaet er forbi". New. |
| 05 | MISSING (modern-en) | S2 | 22 paragraphs below 45% (44.8, 53.8, 55.3, 55.12, 56.7, 56.8, 65.2, 65.4, 68.4, 75.2, 75.3, 75.7, 79.1, 80.1, 80.4, 80.5, 112.0, 115.3, 115.4, 118.1, 121.2, 125.0) and 30 more at 45–55% | about 3,200 w | Live modern-en drops whole sentence-blocks. The 22 flagged paragraphs render 5,283 source words in 2,047. Example: 80.5 loses "Now, of course, this canal is filled… magnitude of his spinal cord." (96 w) | modern-da follows modern-en (1,933 w). **Known**: all 52 paragraphs are rewritten in `green-moby-dick/candidate.json` `1a3f31bb…`; accepted, not released. |

## brothers-karamazov — The Brothers Karamazov (Dostoevsky, tr. Garnett)

**Served editions**

| key | sha256 (16) | label |
|---|---|---|
| original-en | `b8ada3e43c6f997a` | Garnett (1912) |
| modern-en | `5b2d957d5fdca2f1` | Modern English |
| modern-da | `9dc6d62c74ef9097` | Moderne Dansk |

- 96 chapters, 5,836 paragraphs and 13 sections (Books 1–12 plus the Epilogue).
- The modern-da shards differ from the modern-da full JSON in 78 chapter titles.

**Source**

- https://www.gutenberg.org/cache/epub/28054/pg28054.txt, retrieved 11:54:16Z, sha256 `2e75c187cb750df3…d22fe`.
- Header: *The Brothers Karamazov* / Fyodor Dostoyevsky / Translator: Constance Garnett.
- The local raw `books/raw/brothers-karamazov/raw.txt` (sha `142c0d45…`) equals the current file, apart from the BOM, 8 trailing spaces and the "updated" date.

**Body:** from "PART I / Book I" to the PG end marker, including "THE END" and "FOOTNOTES".

**Alignment:** 359,482 source tokens and 358,823 edition tokens. Coverage 99.825% of source and 100.0% of edition.

- 6 runs of 12 or more tokens, all book or chapter headings.
- 0 EXTRA, 0 ORDER, 0 DUPLICATE, and no dropped short paragraphs.
- MIDSPLIT 77.45|46 reproduces the source's verse layout.

**Verdict: DEFECTS** (the text is complete; the defects are apparatus and front matter)

| ID | Type | Sev | Location | Extent | Summary | Evidence |
|---|---|---|---|---|---|---|
| 01 | UNCERTAIN | S3 | before 1.0 | 35 w | The novel's epigraph is absent: "Verily, verily, I say unto you, Except a corn of wheat fall into the ground and die…" (John 12:24) | Not in the PG #28054 front matter; the verse is only quoted inside the narrative (lines 13170 and 14404). Standard Ebooks' Garnett edition, checked against archive.org scans, prints it (`epigraph.xhtml`, sha `31d878d2…`). Absent in all editions. |
| 02 | MISPLACED | S4 | 24.42, 41.49, 62.37 | 6 w | "PART II", "PART III" and "PART IV" are served as the last body paragraph of the previous Book's final chapter. "PART I" is absent, and the sections list Books only | Source lines 7418, 15145, 24583. Same in modern-en and modern-da. The repair batch notes keep these markers by design. |
| 03 | EXTRANEOUS | S4 | 96.76–96.86 | 122 w | "THE END", "FOOTNOTES" and Garnett's nine translator footnotes are served after "Hurrah for Karamazov!" (96.75). The book ends on "[9] Gogol is meant." | Source lines 37251–37284. Markers [1]–[9] remain in the body (16.34 … 85.5). Same in modern-en and modern-da. |

**SCOPE:** Dostoevsky's preface "From the Author" is not part of Garnett's translation. It is absent from PG #28054 and from Standard Ebooks' Garnett edition, so this is not an import loss.

## war-and-peace — War and Peace (Tolstoy, tr. Maude)

**Served editions**

| key | sha256 (16) | label |
|---|---|---|
| original-en | `6112db117bbc3664` | Maude Translation (1922) |
| modern-en | `d3ecdb9d013f45e5` | Modern English |
| modern-da | `773c92e160681723` | Moderne Dansk |

- 365 chapters and 11,340 paragraphs in every edition. The shards equal the full JSON.

**Source**

- https://www.gutenberg.org/cache/epub/2600/pg2600.txt, retrieved 11:54:17Z, sha256 `2d5bb2ad5f422765…d1b2b`.
- Header: *War and Peace* / graf Leo Tolstoy / Translator: Aylmer Maude (and Louise Maude).
- There is no local raw.

**Body:** from "BOOK ONE: 1805" to the PG end marker.

**Alignment:** 572,641 source tokens and 571,855 edition tokens. Coverage 99.863% of source and 100.0% of edition.

- **0** MISSING runs of 12 or more tokens. Even at `--min 3`, only 17 heading runs remain.
- 0 EXTRA, 0 ORDER, 0 DUPLICATE, and no dropped short paragraphs.
- All 365 chapters begin at the right source chapter.

**Verdict: DEFECTS**

| ID | Type | Sev | Location | Summary | Evidence |
|---|---|---|---|---|---|
| 01 | MISLABELED | S3 | titles of ch 28, 49, 68, 84, 106, 132, 145, 167, 190, 229, 263, 279, 298, 317, 337, 353 | The final chapter of 16 of the 17 Books and Epilogues carries the **next** Book's name. For example, ch28 "Book Two (1805) — Chapter 28" is Book One ch. XXVIII, and ch353 "Second Epilogue — Chapter 16" is First Epilogue ch. XVI. This creates duplicate TOC labels, such as two "Book Five (1806 - 07) — Chapter 16" | The parser attached each "BOOK …" heading, which follows these chapters in the source (e.g. line 6632), to the preceding chapter. modern-en has the same 16, and in addition ch28–32 read "Book Two — Chapter 1–5" (ch32 and ch33 are both "Chapter 5"). modern-da has the same 16. Partly known: `war-and-peace-repair/PROGRESS.md` names only ch337 and ch353, not fixed. |
| 02 | MISSING (modern-en) | S2 | e.g. 150.12, 350.1–350.5, 355.x, 357.19, 358.14–358.18, 359.x, 361.27, 362.x, 365.11 | Live modern-en omits and drifts in the essay chapters 333–365. Examples: original 358.18 ("If the Deity issues a command, expresses His will…", 112 w) is not rendered anywhere in ch358; 350.1 (the presents, 92 w) is lost and later paragraphs shift; 150.12 is the placeholder "(French verse translated.)" | modern-da has full content at these points. **Known**: repaired in `war-and-peace-repair` (tail batches A–C accepted, drift fix including ch358, batch G for 150.12); not released. |

- The modern-en `MOD_DUP_ADJ` and `DUP_ADJ` flags are the inline-translation plus translated-footnote convention, not duplication defects.
- Tolstoy's "Some Words about War and Peace" is not in PG #2600 (SCOPE, not expected).

## anna-karenina — Anna Karenina (Tolstoy, tr. Garnett)

**Served editions**

| key | sha256 (16) | label |
|---|---|---|
| original-en | `6318124f6f65f5de` | Garnett (1901) |
| modern-en | `e19b01c5f4c5264b` | Modern English |
| modern-da | `c7048c6c35247219` | Moderne Dansk |

- 239 chapters and 7,442 paragraphs. There are no sections. The shards equal the full JSON.

**Source**

- https://www.gutenberg.org/cache/epub/1399/pg1399.txt, retrieved 11:54:18Z, sha256 `a3e29e08c15c63bb…7571`.
- Header: *Anna Karenina* / graf Leo Tolstoy / Translator: Constance Garnett.

**Alignment:** 358,532 source tokens and 358,052 edition tokens. Coverage 99.866% of source and 100.0% of edition. 0 MISSING runs of 12 or more tokens, and nothing EXTRA, ORDER, DUPLICATE or dropped.

**Verdict: DEFECTS**

| ID | Type | Sev | Location | Summary | Evidence |
|---|---|---|---|---|---|
| 01 | MISLABELED | S3 | all titles; 34.29, 69.66, 101.32, 124.35, 157.73, 189.40, 220.22 | The eight Parts are not represented. Titles restart at "Chapter 1" eight times (chs 1, 35, 70, 102, 125, 158, 190, 221), giving 35 distinct titles for 239 chapters. "PART TWO" to "PART EIGHT" are served as the last paragraph of the previous Part, e.g. 34.28 "…not meaning to return till late at night." → 34.29 "PART TWO" → 35.0 "At the end of the winter…". "PART ONE" is absent | Source lines 57, 5833, 11868, 17439, 21522, 26969, 32777, 37549. Same in modern-en and modern-da. `ak-batchB` notes keep the divider by design. |

**SCOPE:** the epigraph "Vengeance is mine; I will repay" is absent from PG #1399 and from Standard Ebooks' scan-checked Garnett edition. It was never part of this translation's text.

## great-expectations — Great Expectations (Dickens)

**Served editions**

| key | sha256 (16) | label |
|---|---|---|
| original-en | `e4c4863487b9b9ce` | Original (1861) |
| modern-en | `760e685ddbc2b7cf` | Modern English (not sharded) |
| modern-da | `a44e786c7e531372` | Moderne Dansk |

**Source**

- https://www.gutenberg.org/cache/epub/1400/pg1400.txt, retrieved 11:54:46Z, sha256 `9a637118af8e953e…6f8`.
- Header: *Great Expectations* / Charles Dickens, "[1867 Edition]".
- The local raw (sha `097f25ad…`) equals it, apart from the BOM.

**Alignment:** 188,927 source tokens and 188,795 edition tokens. Coverage 99.93% of source and 100.0% of edition. Only the 14 `[Illustration]` markers are unserved. The two stage-end lines ("THIS IS THE END OF THE FIRST/SECOND STAGE…") are served.

**Verdict: COMPLETE-VS-SOURCE** (source edition PG #1400). There is one modern-en defect:

| ID | Type | Sev | Location | Extent | Summary | Evidence |
|---|---|---|---|---|---|---|
| 01 | MISSING (modern-en) | S2 | modern-en 26.0 | 215 w | modern-en renders 297 source words in 65 and drops Jaggers's hand-washing passage. The loss runs from "I asked him where we should come to (for I had no idea where he lived)" to "…scraped the case out of his nails before he put his coat on." | original-en 26.0 and the local raw have it. modern-da 26.0 is also absent (65 w). No repair package exists on any branch. modern-en 26.1–26.2 also contain sentences not in the source ("capital punishment and flogging"); that is out of scope, but the chapter needs a fidelity pass. |

- The label "Original (1861)" sits on PG's "[1867 Edition]" text. This is an edition-label nuance only.

## the-awakening — The Awakening (Chopin)

**Served editions**

| key | sha256 (16) | label |
|---|---|---|
| original-en | `78824e511ea979f2` | Original (1899) |
| modern-en | `06a1d8570cba2c31` | Modern English |
| modern-da | `9afc197ea21772a6` | Moderne Dansk |

- 39 chapters and 1,044 paragraphs. Not sharded.

**Source**

- https://www.gutenberg.org/cache/epub/160/pg160.txt, retrieved 11:54:47Z, sha256 `31d4577d25580…161a`.
- Header: *The Awakening, and Selected Short Stories* / Kate Chopin.
- Body: "THE AWAKENING / I" (line 105) up to "BEYOND THE BAYOU". The short stories are out of scope.

**Alignment:** 50,680 source tokens and 50,581 edition tokens. Coverage 99.783% of source and 99.976% of edition.

- Only one run of 12 or more tokens (16 tokens, ch21).
- At `--min 1`, and with the paragraph-equality check, **22 one-line paragraphs are missing**.
- The shortest paragraph served anywhere is 21 characters. The importer evidently discarded every paragraph under about 20 characters.
- The same check on the other nine books found no such drops.

**Verdict: DEFECTS**

| ID | Type | Sev | Location | Extent | Summary | Evidence |
|---|---|---|---|---|---|---|
| 01 | MISSING | S2 | after 8.27, 10.21, 10.23, 10.37, 12.17, 12.18, 12.32, 15.44, 21.8, 21.16, 21.17, 21.18, 22.11, 25.22 (×3), 27.9, 30.31, 31.17, 34.6, 34.19, 36.31 | 56 w, 22 paragraphs | Short dialogue replies dropped, leaving exchanges incoherent. Examples: 30.31 "…he began to sing:" is followed directly by 30.32 "Stop!", because the song line "Ah! si tu savais!" is missing. Mlle Reisz's refusals "Oh, no." / "No." / "No, and again, no." (21.16–21.18) are gone. Edna's "No!" / "Day after?" / "No, no." to Arobin (25.22) are gone. So is Edna's "Your wife!" (36.31) | pg160.txt lines 1090, 1422, 1428, 1494, 1703, 1707, 1758, 2241, 3113, 3141, 3145, 3149, 3279, 3800, 3802, 3804, 4117, 4480, 4588, 5015, 5055, 5368. The full list is in the JSON (`dropped_lines`). Absent in modern-en and modern-da at all 22 places. No repair exists. |

## ulysses — Ulysses (Joyce)

**Served editions**

| key | sha256 (16) | label |
|---|---|---|
| original-en | `ddc3418890b6a623` | Original (1922) |
| modern-en | `ac853e0de7c6f8da` | Modern English |
| modern-da | `b0cff115dcc73fbb` | Moderne Dansk |

- 18 episodes and 7,148 paragraphs. There are no sections. The shards equal the full JSON.

**Source**

- https://www.gutenberg.org/cache/epub/4300/pg4300.txt, retrieved 11:54:40Z, sha256 `e03094626f9528cf…ebbf9e`.
- Header: *Ulysses* / James Joyce.

**Alignment:** 269,533 source tokens and 269,509 edition tokens. Coverage 99.991% of source and 100.0% of edition.

- At `--min 1` the only unserved tokens are the part and episode numerals and the closing dateline.
- No dropped short paragraphs.
- The Aeolus headlines (the `HEADING_LIKE` flags) and the Ithaca terminal dot (17.653) are authorial and correctly served.

**Verdict: DEFECTS** (minor)

| ID | Type | Sev | Location | Summary | Evidence |
|---|---|---|---|---|---|
| 01 | MISSING | S4 | after 18.7 | Joyce's closing dateline "Trieste-Zurich-Paris / 1914-1921" is absent. The book ends "…yes I said yes I will Yes." | Lines 32861–32863. Absent in modern-en and modern-da. |
| 02 | MISLABELED | S4 | structure | The three-part division is not represented: I (episodes 1–3), II (4–15), III (16–18) | Lines 72, 2505, 25730. The Homeric episode titles are editorial navigation labels (SCOPE). |

## notes-from-underground — Notes from Underground (Dostoevsky, tr. Garnett)

**Served editions**

| key | sha256 (16) | label |
|---|---|---|
| original-en | `c600f3f5ac650824` | Garnett (1918) |
| modern-en | `8df3e74890b26ce3` | Modern English |
| modern-da | `5654b6b12c596775` | Moderne Dansk |

- 21 chapters, 495 paragraphs and 2 sections (Part 1 "Underground", Part 2 "Apropos of the Wet Snow").

**Source**

- https://www.gutenberg.org/cache/epub/600/pg600.txt, retrieved 11:54:41Z, sha256 `6ce7d6ff7288263f…079e`.
- Header: *Notes from the Underground* / Fyodor Dostoyevsky / Translator: Constance Garnett.
- The local raw (sha `3761d2a3…`) equals it, apart from the BOM, the date and 3 blank lines.

**Alignment:** 44,687 source tokens and 44,649 edition tokens. Coverage 99.917% of source and 100.0% of edition. Only the title, part and chapter headings are unserved.

- The author's note is at 1.0.
- The Nekrasov epigraph is at 12.0.
- The editor's closing note is at 21.22.

**Verdict: COMPLETE-VS-SOURCE** (PG #600). No findings. The `SHORT_CHAPTER` flags are long single-paragraph chapters in the source.

## ivan-ilyich — The Death of Ivan Ilyich (Tolstoy)

**Served editions**

| key | sha256 (16) | label |
|---|---|---|
| original-ru | `3e9654b561b5e2c6` | Смерть Ивана Ильича (1886) |
| original-en | `2b9d02f6a874058e` | Maude (Louise & Aylmer Maude) |
| modern-en | `1bb15d1bc0758fea` | Modern English |
| modern-da | `7b420f9e7d3d8a47` | Moderne Dansk |

- 12 chapters. original-ru has 374 paragraphs and original-en has 298. They are independent sources, so they are not paragraph-aligned, as expected.

**Sources**

- **RU:** https://ru.wikisource.org/wiki/Смерть_Ивана_Ильича_(Толстой) (`action=raw`, text taken from az.lib.ru), retrieved 12:07:46Z, wikitext sha `ce05ddc070d5b96c…5533`. Body is "== I ==" up to "== Примечания ==".
  - Independent cross-check: https://ilibrary.ru/text/7/p.1–12, retrieved 12:12:10–12:12:47Z, assembled text sha `2f7cb7361076702c…ec92`.
- **EN:** https://en.wikisource.org/wiki/The_Death_of_Ivan_Ilych plus the /I…/XII subpages (`action=raw`), retrieved 12:06:28–12:07:08Z, assembled text sha `11267756f5d42358…ab5b`. Header: translator Louise and Aylmer Maude.

**Alignment**

- original-ru vs Wikisource: 17,548 source tokens and 17,524 edition tokens. Coverage 99.812% of source and 99.949% of edition. 0 runs of 5 or more tokens.
- original-ru vs ilibrary: coverage 99.727% of source and 99.88% of edition. The only difference is a footnote.
- original-en vs Wikisource: coverage 99.89% of source and 99.996% of edition. 0 runs of 5 or more tokens; only chapter numerals and the Wikisource typo "r" for "replied" at 1.3 differ.
- The Russian-to-English word ratio per chapter is 0.75–0.85, so there is no chapter-scale gap in either language.
- `green-ivan-ilyich` `source.json` equals the live original-en.

**Verdict: DEFECTS** (minor)

| ID | Type | Sev | Location | Extent | Summary | Evidence |
|---|---|---|---|---|---|---|
| 01 | EXTRANEOUS | S4 | original-ru 1.55, 2.31–2.36, 6.14, plus the marker "passe4" in 2.8 | 33 w | The az.lib.ru editorial glosses of French and Latin phrases ("Prim. антикварном магазине (от франц. bric-a-brac).", "1 гордость семьи (франц.)" … "Prim. 7 устройство, сооружение (франц.).") are served as body paragraphs at chapter ends | The Wikisource wikitext has the same apparatus inline (lines 319, 585–595, 1307). Not applicable to modern-en or modern-da. |

**Needs investigation** (typo class, outside completeness): original-ru has a few character-level artefacts that are not in either witness:

- 2.15 "Vпосле"
- 3.21 "к артах"
- 4.10 "но переставая"
- 5.14 "н е"
- 8.31 "вс- врут"
- 2.11 "следователями"

## Cross-book notes for the lead

- **Parser patterns seen in this group**, each likely library-wide:
  - authorial front matter dropped whenever it precedes the first "CHAPTER" (Don Quixote, Moby-Dick);
  - Part and Book headings attached to the wrong chapter or served as body text (War and Peace, Anna Karenina, Karamazov, and the Don Quixote Part II front matter);
  - a filter that drops paragraphs under about 20 characters (The Awakening).
- **modern-da sharding inconsistency.** For don-quixote and brothers-karamazov, the modern-da chapter shards differ from the modern-da full JSON. The client loads shards first and falls back to the full file.
