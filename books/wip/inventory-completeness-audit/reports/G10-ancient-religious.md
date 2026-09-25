# Source-completeness audit — G10-ancient-religious

- **Group:** G10-ancient-religious
- **Books (priority order):** the-histories, the-manual, confessions, iliad, divine-comedy, paradise-lost, peloponnesian-war, imitation-of-christ
- **Audited commit:** main `1a7d89ebd816af8a2ac18239010c34fab4bf48c5` (local checkout, read-only)
- **Date:** 2026-09-25. All findings are `status: PROPOSED`. A separate reviewer confirms them.
- **Machine-readable:** `G10-ancient-religious.findings.json` (same folder)

## Checks performed (every book)

1. **Served editions.** I took the editions from `inventory.json`. For the two sharded books (the-histories, peloponnesian-war), I checked that every `editions-chapters/<ed>/chNNNN.json` shard equals the matching chapter in the full edition JSON (0 mismatches). Aligning against the full JSON therefore covers what the app serves.
2. **Authoritative source.** I fetched each source once from Project Gutenberg into scratch and recorded its sha256 and UTC time. Where `books/raw/<id>` exists, I diffed it against the current PG file.
3. **Body delimitation.** I excluded PG boilerplate, contents lists, editorial introductions and translator notes. I kept authorial matter in scope.
4. **`align.py`, whole text.** Run with `--k 6` at `--min 12`, and again at `--min 2/3` to classify short runs. Every run of 25 or more tokens was inspected.
5. **Structure.** For every chapter, canto, section or book unit I compared:
   - its first and last paragraph against the source;
   - its paragraph count per unit against the source;
   - its label against the source marker.
6. **modern-en and modern-da.** These have to be matched paragraph by paragraph, because k-gram alignment does not work on a rewritten text. I screened with:
   - word ratios per paragraph (thresholds 0.45, 0.5 and 0.6) and per chapter;
   - "long" paragraphs (ratio above 2.2);
   - near-duplicate neighbouring paragraphs (Jaccard above 0.6);
   - `[TBD]` or empty placeholders.
   modern-da was checked for presence only.
7. **Existing packages** on other branches were reconciled (see each book).

**Tool caveats**

- Leftover uncovered source tokens are headings, section numerals and footnote numerals. They are explained for each book.
- The modern-edition screens can only detect whole-passage losses. They are not a fidelity review.
- The Wikisource API returned HTTP 429 once. I fetched only one Wikisource page.

## Summary

| Book | Verdict | Source edition (coverage src / ed) | Top findings |
|---|---|---|---|
| the-histories | DEFECTS | Macaulay, PG #2707+#2456 (99.42% / 100%) | **S1** proem missing (01). The 9 absent section labels are all merges; no text is missing (02–10, S4). About 1,316 stray note numerals (11, S4). |
| the-manual | DEFECTS | Long, PG #10661 Encheiridion (98.92% / 99.93%) | modern-en §42 sentence dropped (01, S3, already fixed in the staged repair). Greek-gloss residue (02, S4). |
| confessions | DEFECTS (modern-da only) | Pusey, PG #3296 (99.98% / 100%) | **S1** modern-da Books 10–13 are `[TBD]` placeholders (01). original-en and modern-en are complete. |
| iliad | COMPLETE-VS-SOURCE | Butler, PG #2199 = local raw (99.97% / 100%) | none |
| divine-comedy | COMPLETE-VS-SOURCE | Longfellow, PG #1001–1003 = local raw (99.73% / 100%) | none |
| paradise-lost | DEFECTS | PG #26 = local raw (99.97% / 100%) | Milton's 12 Arguments (01, S3) and "The Verse" (02, S3) not served. modern-da appears abridged (03, S2, UNCERTAIN). |
| peloponnesian-war | COMPLETE-VS-SOURCE | Crawley, PG #7142 = local raw (99.76% / 100%) | Ch. 11 title lacks its ordinal, inherited from PG (01, S4). |
| imitation-of-christ | DEFECTS | Benham, PG #1653 (99.59% / 99.99%) | Book IV opening misplaced into Book III ch. 59 (01, S3). Book divisions missing (02, S3). Headings (03, S4) and footnotes (04, S4) served as body text. |

---

## the-histories — The Histories (Herodotus)

**Served editions**

| key | sha256 (16) | label |
|---|---|---|
| original-en | `f442e468e59838d5` | Macaulay (1890) |
| modern-en | `d79ea955070c9d8c` | Modern English |
| modern-da | `6e7874e0da84539d` | Moderne Dansk |

- 1,525 chapters and 1,626 paragraphs in every edition. Sharded; the shards equal the full JSON.

**Source**

- G. C. Macaulay, *The History of Herodotus*:
  - Vol. 1: https://www.gutenberg.org/cache/epub/2707/pg2707.txt — retrieved 2026-09-25T11:56:11Z, sha256 `b4a845d38e9051690201561803d2aa83f6589a7b3f80273b97d79801981e64a3`, updated May 23, 2025.
  - Vol. 2: https://www.gutenberg.org/cache/epub/2456/pg2456.txt — retrieved 11:55:50Z, sha256 `7b28f25dbed0064cd8f66c662eaa776cccd535cdeb6e3ff94c37dd1cc2a752db`, updated Aug 26, 2025.
- Header: Title "The History of Herodotus — Volume 1/2"; Translator "G. C. Macaulay".
- There is no local raw.

**Body.** The nine ranges from `BOOK I. THE FIRST BOOK…` to `NOTES TO BOOK I`, and so on to Book IX. I excluded Macaulay's Preface and the per-book notes (SCOPE).

**Alignment (original-en)**

- 288,224 source tokens against 286,542 edition tokens.
- Source covered 99.418%; edition covered 100.0%.
- MISSING runs of 12 or more tokens: **1**, the proem (78 tokens including the Book I heading).
- EXTRA, ORDER and DUPLICATE: 0.
- At `--min 3` the only other runs are the 9 book headings, which are served as section titles. The remaining ≈1,525 uncovered tokens are section numerals.

**Structure**

- Per-book label sequences against the standard division (216/182/160/205/126/140/239/144/122 = 1,534): absent labels are 1.44, 4.18, 5.118, 7.35, 7.39, 7.67, 7.76, 7.216 and 8.88. There are no duplicates and no order breaks.
- **I checked all 1,525 served chapter starts. Each begins exactly at its own source section marker.**
- Each of the nine absent labels is a place where the PG text itself has no marker or a malformed one:
  - missing: 44, 35, 67, 216;
  - `18.Beyond`, with no space;
  - `118.` at the end of the previous line;
  - a second `38.` where 39 should be;
  - `76....`;
  - `88,—`.
- In each case the section's text is served inside the preceding section. **Nothing is missing.** 7.35 (the Hellespont scourged), 7.216 (the Anopaia path) and 8.88 (Artemisia, "My men have become women") are all present.
- Four stray markers are served as text: 574.1 `18.Beyond`, 878.0 `… 118. …`, 1063.1 `38. Then`, 1347.1 `88,—`.
- modern-en and modern-da have the same coordinates. I confirmed the merged content is present in both.
- original-en also carries about 1,316 bare note-reference numerals (e.g. "with the Hellenes, 3 and this they say"). modern-en has removed them.

**Modern editions.** The ratio screen is clean. The lowest chapter ratios (7.184 at 0.62, 9.30 at 0.70) come from numbers written in digits. No `[TBD]` placeholders.

**Existing packages.** None found.

**Verdict: DEFECTS.** Apart from the proem, the text is complete against Macaulay.

| ID | Type | Sev | Location (C.P) | Words | Summary | modern-en / modern-da |
|---|---|---|---|---|---|---|
| G10-the-histories-01 | MISSING | **S1** | before 1.0 | 65 | Proem missing. The served text starts at "Those of the Persians…" when it should start at "This is the Showing forth of the Inquiry of Herodotus of Halicarnassos…" (pg2707 l.189–194). | absent / absent |
| G10-the-histories-02 | MISLABELED | S4 | inside 43.0 | 130 | 1.44 is merged into 1.43 ("And Croesus was very greatly disturbed…"), pg2707 l.863–874 | same / same |
| G10-the-histories-03 | MISLABELED | S4 | 574.1 | 174 | 4.18 is the second paragraph of 4.17 ("18.Beyond them dwell the Neuroi…"), l.11734–11748 | same / same |
| G10-the-histories-04 | MISLABELED | S4 | inside 878.0 | 212 | 5.118 is inside 5.117 with a stray "118." (pg2456 l.2008–2025) | same / same |
| G10-the-histories-05 | MISLABELED | S4 | inside 1060.0 | 155 | 7.35 (Xerxes scourges the Hellespont) is inside 7.34 (l.5546–5558) | same / same |
| G10-the-histories-06 | MISLABELED | S4 | 1063.1 | 275 | 7.39 is served as 7.38 ¶2 with a stray "38." (l.5624–5644) | same / same |
| G10-the-histories-07 | MISLABELED | S4 | inside 1090.0 | 89 | 7.67 (the Caspians…) is inside 7.66 (l.6009–6017) | same / same |
| G10-the-histories-08 | MISLABELED | S4 | 1098.1 | 74 | 7.76 is served as 7.75 ¶2 with a stray "76.... 73" (l.6094–6099) | same / same |
| G10-the-histories-09 | MISLABELED | S4 | inside 1237.0 | 78 | 7.216 (the Anopaia path) is inside 7.215 (l.8150–8156) | same / same |
| G10-the-histories-10 | MISLABELED | S4 | 1347.1 | 194 | 8.88 (Artemisia) is served as 8.87 ¶2 with a stray "88,—" (l.10421–10435) | same / same |
| G10-the-histories-11 | EXTRANEOUS | S4 | 818 paragraphs | — | About 1,316 inline footnote numerals are served, but the notes themselves are not | removed / removed |

Boundary excerpts for 01:

- Served before: (start of work).
- Missing starts: "This is the Showing forth of the Inquiry of Herodotus of Halicarnassos, to the end that".
- Missing ends: "…the causes may be remembered for which these waged war with one another."
- Served after: "Those of the Persians who have knowledge of history declare that the Phenicians first began the quarrel."

The excerpts for 02–10 are in the JSON.

---

## the-manual — The Manual (Epictetus, *Encheiridion*)

**Served editions**

| key | sha256 (16) | label |
|---|---|---|
| original-en | `23835259e0a0d522` | Long (1877) |
| modern-en | `2ac0db1347defd5b` | Modern English |
| modern-da | `08b3e433b8b9c74c` | Moderne Dansk |

- 52 sections and 68 paragraphs.

**Source**

- George Long, *A Selection from the Discourses of Epictetus with the Encheiridion*: https://www.gutenberg.org/cache/epub/10661/pg10661.txt
- Retrieved 2026-09-25T11:56:02Z; sha256 `7915eac7442daed1fbc461b8a281ecc315c5e619126d50d914c29c39fa3b2209`; updated Oct 28, 2024.
- Header translator: George Long.
- There is no local raw.

**Body.** From `THE ENCHEIRIDION, OR MANUAL.` (l.4542) to the PG end marker. The rest of the file is the selected Discourses, a different work.

**Alignment (original-en).** Source covered 98.916%; edition covered 99.926%.

- The only run of 12 or more tokens is Long's Greek glosses in §1. At `--min 2`: the heading, plus all 13 `[Greek: …]` glosses (35 tokens).
- EXTRA: 6 tokens, at the join left where a gloss was stripped.
- ORDER and DUPLICATE: 0.

**Structure**

- Long numbers the chapters I–LII. His L is the standard 50+51, and his LII is the standard 53.
- All 52 served sections begin at Long's numerals, and the paragraph count of every section equals Long's.
- **The closing quotations are present** at 52.0–52.3:
  - "Lead me, O Zeus…";
  - "But whoso nobly yields…";
  - "O Crito…".

**Modern editions**

- At the 0.45 threshold the ratio screen is clean. At 0.62 it surfaced §10 and §42.
- §10 is compression only.
- **§42 drops a whole sentence**, Long's "true conjunction" illustration.
- modern-da, which was rendered from modern-en, lacks it too.

**Existing packages.** Both of these restore §42:

- `origin/codex/manual-complete-repair-2026-09-17` @01ddd9b2, `books/wip/manual-repair-2026-09-17/accepted.json`. Its ledger reason is "restore examples, qualifications, historical content and argument steps".
- `green-manual/candidate.json` on `origin/claude/friendly-albattani-qgyqfi` @e5c60041.

Both packages lock the served original-en (sha `23835259…`) as their source. I verified that source is complete against Long, so this is not a Symposium-type failure.

**Verdict: DEFECTS.** original-en is COMPLETE-VS-SOURCE; the defects are in modern-en.

| ID | Type | Sev | Location | Words | Summary | modern-en / modern-da |
|---|---|---|---|---|---|---|
| G10-the-manual-01 | MISSING | S3 | 42.0 | 29 | modern-en omits "for if a man shall suppose the true conjunction to be false … deceived about it" (pg10661 l.5211–5213) | absent / absent |
| G10-the-manual-02 | MISSING | S4 | 10 sections (1.0 … 51.0) | 14 | Long's 13 Greek glosses are stripped, leaving broken parentheses: 40.0 "(, dominæ)", 51.0 "(part, )" and "(precepts, )" (l.4548–5342) | n/a |

Omitting the glosses is a defensible choice; only the leftover residue is a defect.

---

## confessions — Confessions (Augustine)

**Served editions**

| key | sha256 (16) | label |
|---|---|---|
| original-en | `64b39a8ae77d7175` | Pusey (1838) |
| modern-en | `949e4f77fd317601` | Modern English |
| modern-da | `4935d43ca05f87da` | Moderne Dansk |

- 13 books and 462 paragraphs.

**Source**

- E. B. Pusey, *The Confessions of St. Augustine*: https://www.gutenberg.org/cache/epub/3296/pg3296.txt
- Retrieved 11:55:51Z; sha256 `ef3fa6267968c875def9091a1882d14b525a85bbf6996a3e2f130a775b2e22d2`; updated Sep 15, 2026.
- There is no local raw.

**Body.** From `BOOK I` to the PG end marker.

**Alignment (original-en).** Source covered 99.977%; edition covered 100.0%. There are no runs of 12 or more tokens. At `--min 2` only the "BOOK n" headings are unmatched.

**Structure**

- The paragraph counts of all 13 books equal PG (38, 18, 21, 31, 25, 27, 27, 31, 38, 70, 41, 42, 53), and every book's first and last paragraph match.
- The served ending "GRATIAS TIBI DOMINE" (13.52) **is in PG #3296**. It is the centred colophon after "Amen." (l.9367), so it is source text, not boilerplate.
- Whether Pusey's 1838 printing carries it is unverified. That is an open question and cosmetic only.

**Modern editions**

- The served modern-en (sha `949e4f77…`) is byte-identical to the `confessions-modern-en` candidate on `origin/claude/peaceful-thompson-akn7f0`, released in #192. The ratio screen is clean, with chapter ratios of 1.05–1.12.
- In modern-da, **Books 10–13 (206 paragraphs) are all `[TBD]`**.
  - The edition is registered: `bookRegistry.ts` lists `CONFESSIONS.editions` modern-da with `hasAudio: true`.
  - `confessions-repair/PROGRESS.md` (`origin/claude/friendly-albattani-qgyqfi` @c7acd031) records Danish only as "not touched … flagged for later".
  - Danish is outside the 2026-09-21 delivery scope. It needs a decision: hide the edition or mark it incomplete.

**Verdict: DEFECTS**, in modern-da only. original-en is COMPLETE-VS-SOURCE and modern-en is clean.

| ID | Type | Sev | Location | Words | Summary | modern-en / modern-da |
|---|---|---|---|---|---|---|
| G10-confessions-01 | MISSING | S1 | 10.0–13.52 | 48,618 (orig) | modern-da Books 10–13 are placeholder "[TBD]". They follow 9.37 "…må mere rigeligt blive opfyldt for hende." The missing text starts "Let me know Thee, O Lord, who knowest me" (pg3296 l.5345–9367). | present / absent |

---

## iliad — The Iliad (Homer)

**Served editions**

| key | sha256 (16) | label |
|---|---|---|
| original-en | `3ba331f36cb935cb` | Butler (1898) |
| modern-en | `d424a2e68fd2e302` | Modern English |
| modern-da | `07123206c3467abd` | Moderne Dansk |

- 24 books and 1,137 paragraphs.

**Source**

- https://www.gutenberg.org/cache/epub/2199/pg2199.txt — retrieved 11:55:52Z; sha256 `72673dcefeaa5d302b4ac1cc9ce6fd0b236831e816de41391e5cfe138ab5b077`; updated Aug 16, 2022.
- Header: "The Iliad"; Translator: Samuel Butler.
- **`books/raw/iliad/raw.txt` is identical to PG #2199** apart from the BOM.

**Body.** From `BOOK I.` to the end marker. PG #2199 has no preface and no footnotes.

**Alignment.** Source covered 99.969%; edition covered 100.0%. There are no runs of 12 or more tokens. Only the 24 "BOOK n" headings are unmatched.

**Structure.** In every book, the paragraph count and the first and last paragraph are identical to the source. Butler's italic summaries are served as N.0 in all three editions. They belong to the matched source edition, so this is SCOPE, although they appear as ordinary body text.

**Modern editions.** The screen is clean, with chapter ratios of 0.96–1.00.

**Existing packages.** None.

**Verdict: COMPLETE-VS-SOURCE.** There are no findings.

---

## divine-comedy — The Divine Comedy (Dante, Longfellow)

**Served editions**

| key | sha256 (16) | label |
|---|---|---|
| original-en | `494a37942b0005c1` | Longfellow Translation (1867) |
| modern-en | `5938ed2727d6a26e` | Modern English |
| modern-da | `d46657c4f927cb42` | Moderne Dansk |

- 100 cantos and 4,812 tercets.

**Source**

| PG # | sha256 | retrieved (UTC) |
|---|---|---|
| 1001 (Hell) | `10fad2f10aaffec3bfe3fd63266544f7fd5bba576cd5c63afe68e8212849754d` | 11:55:54Z |
| 1002 (Purgatory) | `dbc134de583109a0496499c7b380b40850c2f5917fd0a2ef99ce57ceab2c83b4` | 11:55:55Z |
| 1003 (Paradise) | `1d3caefa714846480a0ce44067396bc755b23ac78de41772c6d6bc98aa24095a` | 11:55:56Z |

- URLs: `https://www.gutenberg.org/cache/epub/100N/pg100N.txt`.
- All three are titled "Divine Comedy, Longfellow's Translation" and credit Henry Wadsworth Longfellow as translator. All three were updated Oct 29, 2024.
- **The local `raw.txt` is the concatenation of the three files** (only the BOMs differ).

**Body.** Each part runs from "Canto I" to its end. For Paradiso, the body stops at `APPENDIX`, which holds Longfellow's own six sonnets (SCOPE). Longfellow's notes are not in PG and are not served (SCOPE).

**Alignment.** Source covered 99.732%; edition covered 100.0%. There are no runs of 12 or more tokens; only the 100 canto headings are unmatched.

**Structure.** The tercet count and the first and last tercet of every canto are identical to the source.

**Modern editions.** The 468 MIDSPLIT flags come from sentences carrying over between tercets. I checked 1.13–1.14 and 49.0–49.1: that is redistribution, not omission. Chapter ratios are 0.90–1.07.

**Verdict: COMPLETE-VS-SOURCE.** There are no findings.

---

## paradise-lost — Paradise Lost (Milton)

**Served editions**

| key | sha256 (16) | label |
|---|---|---|
| original-en | `56c47aa192f17e38` | Original (1674) |
| modern-en | `87727e7760ea487d` | Modern English |
| modern-da | `266ada0a3a74b083` | Moderne Dansk |

- 12 books and 1,188 paragraphs.

**Sources**

- **PG #26:** https://www.gutenberg.org/cache/epub/26/pg26.txt — retrieved 11:55:58Z; sha256 `aeedc9f33e0c2a6422d2f557462fb87cd2430974c6aed30a26803be5394a741a`; updated Aug 21, 2026.
  - `books/raw/paradise-lost/raw.txt` is identical to it apart from the "updated" line and a 3-line transcriber note.
  - PG #26 is Raben's 1960s etext of an **unidentified modern-spelling edition**. It opens with a PG volunteer introduction (excluded).
  - PG #26 has **no Arguments and no "The Verse"**. PG #20, fetched to check, has none either.
- **Standard Ebooks:** https://standardebooks.org/ebooks/john-milton/paradise-lost/text/single-page — retrieved 12:06:05Z; sha256 `81b6f57a…`; based on HathiTrust scans. It has `argument-1…12`.
- **Wikisource "Paradise Lost (1674)/The Verse":** retrieved 12:07:16Z; sha256 `2df9967d…`.

**Alignment (original-en against PG #26).** Source covered 99.97%; edition covered 100.0%. Only the 12 "Book n" headings are unmatched.

**Cross-check against Standard Ebooks.** The 12 Arguments are the only substantive missing runs. The rest are spelling variants such as "re-visit" and "cried'st". The poem text is therefore complete.

**Modern editions**

- modern-en: 87 MIDSPLIT flags from sentence carry-over. Chapter ratios are 1.02–1.08, with no omissions detected.
- modern-da looks heavily condensed (presence check only):
  - Book 2 has 2,762 Danish words against 8,010 in the original (34%).
  - Book 6 is at 53%, Book 5 at 72% and Book 1 at 82%. The other books are at 0.98–1.04.
  - Paragraphs drift: Danish 2.26 renders the original 2.23.
  - 40 Danish paragraphs in Book 2 are under 25 words. The original has 1.

**Verdict: DEFECTS.** The poem is complete, but the labelled 1674 edition's authorial Arguments and note are not served.

| ID | Type | Sev | Location | Words | Summary | modern-en / modern-da |
|---|---|---|---|---|---|---|
| G10-paradise-lost-01 | MISSING | S3 | before each Book (1.0 … 12.0) | 2,399 | Milton's prose Arguments are absent. Book 1's begins "This First Book proposes, first in brief, the whole subject…" and ends "…the infernal Peers there sit in council." They are inherited from PG #26. | absent / absent |
| G10-paradise-lost-02 | MISSING | S3 | before 1.0 | 236 | "The Verse" is absent: "THE measure is English Heroic Verse without Rime…" through "…modern bondage of Rimeing." | absent / absent |
| G10-paradise-lost-03 | UNCERTAIN | S2 | Books 2, 6, 5, 1 (modern-da) | ≈10,000 (est.) | modern-da appears abridged, with paragraph drift. Needs a Danish reader. | present / partial |

Open question for 01 and 02: serve the Arguments with each Book, or change the label "Original (1674)"?

---

## peloponnesian-war — History of the Peloponnesian War (Thucydides, Crawley)

**Served editions**

| key | sha256 (16) | label |
|---|---|---|
| original-en | `e50ada55ab4db8be` | Crawley (1874) |
| modern-en | `c035038d032ca4ec` | Modern English |
| modern-da | `be09de1996e60086` | Moderne Dansk |

- 26 chapters, 8 sections and 998 paragraphs. Sharded; the shards equal the full JSON.

**Source**

- https://www.gutenberg.org/cache/epub/7142/pg7142.txt — retrieved 11:55:59Z; sha256 `b7df28eabde17b252e38e808c5d9c287ac69d9503e2958ba74bd316922963b14`; updated Apr 3, 2026.
- Translator: Richard Crawley.
- **The local `raw.txt` is identical to it.**

**Body.** From `BOOK I` to the end marker. I excluded Crawley's dedication to Connop Thirlwall, which is translator matter (SCOPE).

**Alignment.** Source covered 99.762%; edition covered 100.0%.

- There are 25 missing runs of 12 or more tokens (2 of 25 or more). Together they are exactly the 26 chapter headings, and those are served as chapter titles. All 26 titles match PG.
- "THE END" is not served.

**Structure.** The paragraph counts and first and last paragraphs of all 26 chapters equal PG.

- DUP_ADJ 15.31~32 and 16.26~27 are genuine parallel treaty clauses in the source.
- The bracketed final sentence is Crawley's.

**Modern editions.** The screen is clean, with chapter ratios of 0.92–1.00.

**Verdict: COMPLETE-VS-SOURCE.** There is one cosmetic item, inherited from the source.

| ID | Type | Sev | Location | Summary |
|---|---|---|---|---|
| G10-peloponnesian-war-01 | MISLABELED | S4 | chapter 11 title | The title reads "Year of the War—Campaigns of Demosthenes…" with no ordinal. Its neighbours are "Fifth…" and "Seventh…". The same wording is in PG #7142 (l.6999–7003) and in the local raw. The correct ordinal should be confirmed against a Crawley print. |

---

## imitation-of-christ — The Imitation of Christ (Thomas à Kempis)

**Served editions**

| key | sha256 (16) | label |
|---|---|---|
| original-en | `43902ea5bf50af97` | Benham (1886) |
| modern-en | `8805af64c4357b3f` | Modern English |
| modern-da | `02c25fe5430acc68` | Moderne Dansk |

- 114 chapters and 774 paragraphs. There are no sections.

**Source**

- William Benham's translation: https://www.gutenberg.org/cache/epub/1653/pg1653.txt — retrieved 11:56:00Z; sha256 `7631799607b0ede62f1bd7ed2a8eb62d89524451a3c41e9ad2b5cbf4c2aa5383`; updated May 5, 2023.
- Header translator: William Benham.
- There is no local raw.

**Body.** From `THE FIRST BOOK` to the end marker. I excluded the editorial "INTRODUCTORY NOTE" (SCOPE).

**Alignment.** Source covered 99.59%; edition covered 99.987%.

- There are no runs of 12 or more tokens.
- The unmatched source tokens are "CHAPTER n", "THE FIRST BOOK ADMONITIONS PROFITABLE FOR THE SPIRITUAL LIFE" and the "THE nth BOOK" words.
- **In all 114 chapters, the served paragraph list equals the source's paragraph list.**

**Structure**

- Every chapter's descriptive title is served as body paragraph N.0.
- 76 scripture-reference footnote blocks are served as body paragraphs. The book **ends on the footnote "(1) Proverbs xxv. 27 (Vulg.)."** (114.7).
- The book titles for Books II–IV sit at the end of the previous book (25.12, 37.17, 96.7). The opening of Book IV sits at 96.8–96.11.
- Chapter labels restart at "Chapter 1" at ch 26, 38 and 97, and no book label shows which book the reader is in.
- The short ch 102 (Book IV ch 6) is short in the source as well.

**Modern editions.** They have the same structure. The ratio screen is clean.

**Verdict: DEFECTS.** The text is complete, but its structure is wrong.

| ID | Type | Sev | Location | Summary | modern-en / modern-da |
|---|---|---|---|---|---|
| G10-imitation-of-christ-01 | MISPLACED | S3 | 96.7–96.11, should be before 97.0 | The opening of Book IV sits at the end of Book III ch. 59: "OF THE SACRAMENT OF THE ALTAR", "A devout exhortation to the Holy Communion", "The Voice of Christ" and "Come unto Me…" with its notes. About 95 words; pg1653 l.5670–5688. | same / same |
| G10-imitation-of-christ-02 | MISLABELED | S3 | whole book | The four-book division is not shown. There are no sections, chapter numbering restarts three times, the Book II–IV titles sit at 25.12/37.17/96.7, and the Book I title and "THE nth BOOK" are absent. Source l.217–218, 1595–1596, 2376–2377, 5670–5671. | same / same |
| G10-imitation-of-christ-03 | MISPLACED | S4 | N.0 in all 114 chapters | Chapter descriptive titles are served as body text, while the chapter titles are generic "Chapter N". | same / same |
| G10-imitation-of-christ-04 | EXTRANEOUS | S4 | 76 paragraphs, incl. final 114.7 | Footnote blocks are served as body text. original-en also has 180 inline "(n)" markers. In modern-en and modern-da the note paragraphs are left orphaned. | present / present |

---

## Open questions (for the reviewer)

1. **Paradise Lost.** Is omitting the Arguments and "The Verse" an intended scope choice? The label says "Original (1674)", but the imported PG #26 is a modern-spelling etext of an unidentified edition.
2. **Confessions and Paradise Lost modern-da.** Both are registered and served. Confessions modern-da has `[TBD]` for Books 10–13, and Paradise Lost modern-da appears condensed. Under the English-only language scope, should these be hidden or marked incomplete?
3. **Confessions.** Is "GRATIAS TIBI DOMINE" in Pusey's 1838 printing? PG #3296 has it; it is cosmetic either way.
4. **Thucydides.** What is the correct ordinal in the Chapter XI heading?
