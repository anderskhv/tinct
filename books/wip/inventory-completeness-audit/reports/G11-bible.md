# Source-completeness audit — G11-bible

- **Group:** G11-bible · **Book:** `bible` (The Bible, three served editions)
- **Audited commit:** main `1a7d89ebd816af8a2ac18239010c34fab4bf48c5` (read-only)
- **Date:** 2026-09-25 · **Status of every finding:** PROPOSED (a separate reviewer confirms)

## What was checked

1. **Shards against whole-book JSON.** For each edition I compared the manifest and all 1,189 `chNNNN.json` shards with the whole-book JSON: number, title, `paragraphCount`, paragraph text and `sections`. The reader loads these shards through `loadEditionWindow` / `loadChapterShardedEdition`.
2. **Verse-level comparison with the matched source**, for every chapter of all 66 books in all three editions. My scratch parsers read the served superscript verse labels and each source's verse references. For every verse I checked for missing, extra, duplicated and out-of-order verses, and I compared the tokens of each verse (to catch truncation) and the exact string (case and punctuation kept; whitespace and quote style normalised).
3. **`align.py` whole-text coverage** on preprocessed scratch copies. Superscript verse labels are stripped from the editions, and `C:V` references from the sources. For WEB the `{…}` footnotes were also removed, and I ran it a second time with them kept.
4. **Second, independent export of each translation**, to catch an incomplete primary source (the Symposium failure mode). I compared the served text verse by verse with the eBible KJV USFM, the eBible WEB Classic USFM and the official BSB USFM. I also compared the Psalm superscriptions, Psalm 119 acrostic headings, subscriptions and headings with those USFM markers.
5. **Structure.** Book, chapter and `sections` tree; first and last paragraphs; text-critical verses (Matt 17:21 … Rom 16:24, 1 John 5:7–8, Mark 16:9–20, John 7:53–8:11); versification (Mal 4, Joel 3, 3 John 14/15, Psalm titles). I also scanned for boilerplate and stray apparatus (`Gutenberg`, `***`, `{}`, `<< >>`, URLs, digits). I read the production `/api/edition-patches`: it returned `[]` for all three editions, so no runtime overlay applies.
6. **Existing packages reconciled:** BSB staging on `origin/codex/bsb-staging-20260921` (released as #183, `4d518198d`), the WEB Revelation 22 cleanup and the WEB Catholic staging on `origin/claude/magical-wozniak-dim3fg`, `books/wip/web-revelation-release-20260924.json`, and the historical `qa/reports/structural-report.json`.

**Tool caveats.**
- The `align.py` percentages refer to the preprocessed copies. Its `source_sha256` and `edition_sha256` are hashes of those copies; the original hashes are listed below.
- The verse and USFM parsers are my own scratch scripts, kept in the scratch folder.
- Old releases of the WEB could not be fetched: archive.org answered 429 and reset connections. The source of the WEB Isaiah 8:14 wording is therefore still an open question.
- The Bible has no `modern-en` or `modern-da` any more; both were withdrawn on 2026-09-11 (DECISIONS.md). No translation checks apply.

## bible — The Bible

### Served editions

| key | sha256 (16) | label (registry) | chapters / paragraphs | verse labels |
|---|---|---|---|---|
| `bsb-en` (default) | `8da0bc1ae32d9c2e` | Berean Standard Bible | 1,189 / 38,464 | 31,086 |
| `kjv-en` | `53823ea3d19a3d7b` | King James Version (1611), year 1611 | 1,189 / 6,704 | 31,102 |
| `web-en` | `b0f491656782257e` | World English Bible, year 2000 | 1,189 / 6,704 | 31,102 |

**Shards:** in all three editions the manifest and all 1,189 shards are identical to the whole-book JSON (0 mismatches in number, title, `paragraphCount`, paragraph text or `sections`). The `sections` tree covers chapters 1–1189 exactly once, and every book leaf matches its chapter titles (66 books; 929 OT + 260 NT chapters).

### Sources identified (downloaded to scratch, retrieved 2026-09-25 UTC)

| Edition | Source (served text matches) | Retrieved | sha256 | Header |
|---|---|---|---|---|
| kjv-en | https://www.gutenberg.org/cache/epub/10/pg10.txt | 11:56:09Z | `0204adaed1f25700…` | "The King James Version of the Bible", eBook #10, updated 2024-10-29 |
| web-en | https://www.gutenberg.org/cache/epub/8294/pg8294.txt | 11:56:10Z | `abf7c2da851fc68e…` (= pin in the WEB Revelation packet) | "The World English Bible (WEB), Complete", Author: Anonymous, eBook #8294 (2005, updated 2020-12-26), "From www.ebible.org with slight reformatting by Martin Ward" |
| bsb-en | https://bereanbible.com/bsb.txt | 11:56:36Z | `2ac3af1de52d4e68…` (= BSB staging pin) | "The Holy Bible, Berean Standard Bible … dedicated to the public domain" |

Second exports, used for cross-checks:
- https://ebible.org/Scriptures/eng-kjv_usfm.zip (12:01:46Z, `f01d1af83ab7137d…`): "KJV + Apocrypha, standardized text of 1769"
- https://ebible.org/Scriptures/eng-web_usfm.zip (12:02:25Z, `cc5d6cc5c4cef69e…`): "World English Bible Classic", the current WEB
- https://bereanbible.com/bsb_usfm.zip (12:02:26Z, `a91f7b674487981…`)

**Local raw:** none; there is no `books/raw/bible`.

**Provenance:** the importer of KJV and WEB is not in the repository, because history before `f2064e2d3` is truncated. The served KJV reproduces pg10 verse for verse, including a PG separator. The served WEB is pg8294 with the `{…}` notes removed, which the WEB Revelation and WEB Catholic packets also state. The BSB is the accepted staging candidate, pinned by `app/src/data/bsbRelease.test.ts`.

**Body delimitation:**
- pg10: from the body heading "The First Book of Moses: Called Genesis" to the PG END marker. The TOC and book-title headings are excluded.
- pg8294: from "Book 01 Genesis" to the END marker. The 794 `{…}` translator footnotes (5,458 tokens) are treated as editorial apparatus (SCOPE).
- bsb.txt: the verse lines only; the three header lines are excluded.

### Alignment metrics

| Edition | align.py source covered / edition covered | MISSING runs ≥12 (≥25) | EXTRA / ORDER / DUP | Verse-level vs matched source |
|---|---|---|---|---|
| kjv-en vs pg10 | 99.953 % / 100.0 % (791,803 / 791,413 tok) | 5 (0). All 5 are PG book-title headings, e.g. "…Samuel, otherwise called the First Book of the Kings" | 0 / 0 / 0 | 31,102/31,102 verses exact-equal (case and punctuation kept); 0 missing, 0 extra, 0 duplicate, 0 out of order, 0 truncated |
| web-en vs pg8294 (notes removed) | 99.972 % / 100.0 % (770,267 / 770,050) | 0 (0) | 0 / 0 / 0 | 31,102 slots token-equal (30,996 exact; 106 differ only in the spacing left by note removal). 7 slots are footnote-only in the source and served empty (finding 08) |
| web-en vs pg8294 (notes kept) | 99.292 % / 99.991 % | 124 runs, 2,519 tokens: all `{…}` notes | 0 / – / – | — |
| bsb-en vs bsb.txt | 100.0 % / 100.0 % (730,430 = 730,430) | 0 (0) | 0 / 0 / 0 | 31,086/31,086 non-empty verses token-equal (30,779 exact; 307 differ only by line-break spacing after em-dashes). The 16 official empty references are not labelled, matching the source |

Second-export cross-check:
- **KJV vs eBible KJV (1769):** 30,219 verses identical and 742 that differ only by hyphenation or compounding (Beth-el/Bethel). 141 verses differ in wording by one word or so (finding 06):
  - 116 substitutions: spelling variants, 1611-style readings, and what look like PG typos, e.g. Jonah 1:15 "look" for "took"
  - 14 omissions
  - 8 additions
  - 3 word-order changes

  No verse is missing on either side.
- **WEB vs eBible WEB Classic:** 16,678 identical and 14,422 different. pg8294 is a 2005 snapshot of a translation that has been revised since. The verse inventory is identical except for the position of the Romans doxology. A heuristic scan for content dropped by the old text found only Isaiah 8:14 (finding 07).
- **BSB vs official BSB USFM:** 31,081 identical and 5 different, all trivial export artefacts (`vvv` tokens, "evenif", and the Habakkuk 3:19 subscription marked up separately).

### Structural notes

- All three editions have 66 books with standard Protestant chapter counts. They begin at Genesis 1:1 and end at Revelation 22:21. BSB puts "Amen." in its own paragraph, as the USFM does.
- KJV and WEB titles for single-chapter books read "Obadiah"; BSB reads "Obadiah 1". This is cosmetic.
- KJV and WEB use importer-made verse groups: 6,704 paragraphs, with an identical verse-to-paragraph grouping in all 1,189 chapters. These are not the source's paragraphs. BSB carries the USJ poetry layout, one line per paragraph; this explains the screening MIDSPLIT (9,412) and DUP_ADJ (54) flags, which come from repetitive genealogies and laws. SHORT_CHAPTER (222) reflects genuinely short chapters. All three editions are verse-complete.
- **Text-critical verses match each source.**
  - KJV has all 16 listed verses and the Comma Johanneum (1 John 5:7–8).
  - WEB has the verse text for Matt 17:21, 18:11, 23:14, Mark 7:16, 9:44, 9:46, 11:26, 15:28, Luke 23:17, John 5:4, Acts 28:29 and Rom 16:24. For Luke 17:36, Acts 8:37, 15:34 and 24:7 it has footnotes only, and so does the current WEB. The WEB has no Comma Johanneum.
  - BSB omits all 16 as official empty references and has no Comma Johanneum.
  - All three include Mark 16:9–20 and John 7:53–8:11. BSB has no bracket or heading notes there, because the TXT has none.
- **Versification** matches the sources in all three: Malachi 4 chapters, Joel 3, 3 John 14 verses. WEB places the doxology at Rom 14:23 with inline "(14:24)…(14:26)", as pg8294 does.
- **Psalm superscriptions:**
  - BSB has all 116, folded into verse 1 (the TXT and USFM convention).
  - WEB has all 117 of the current WEB's `\d` titles, wrapped in `<<…>>` exactly as pg8294 formats them. This is source formatting, not a parser artefact (finding 09).
  - KJV has none (finding 01).
- **Verified resolved:** the Gutenberg trailer in WEB Revelation 22 was removed on main (#166, `5dbf20cd2`). The live `web-en` sha equals `acceptedSha256` in `books/wip/web-revelation-release-20260924.json`, and no Gutenberg or eBook text remains in any edition. The KJV `***` separator (finding 04) falls outside that `web-en`-only scan.

### Verdict

**DEFECTS**
- `bsb-en`: COMPLETE-VS-SOURCE.
- `web-en`: COMPLETE-VS-SOURCE, with 4 cosmetic S4 items and 1 uncertain source-version item.
- `kjv-en`: complete against its PG #10 source, but pg10 is itself incomplete against the standard KJV. It lacks all 116 Psalm superscriptions (S2), which is the Symposium failure mode.

### Findings

| ID | Type | Sev | Edition | Location | Extent | Summary |
|---|---|---|---|---|---|---|
| G11-bible-01 | MISSING | S2 | kjv-en | before v1 of 116 psalms (ch 481–623), e.g. before 481.0, 529.0 | 1,046 w | All KJV Psalm superscriptions are absent, e.g. "A Psalm of David, when he fled from Absalom his son." Inherited from pg10, which omits them; the standard 1769 KJV (eBible `\d`) has them |
| G11-bible-02 | MISSING | S4 | kjv-en | ch 597 before vv 1, 9 … 169 (597.0 … 597.33) | 22 headings | Psalm 119 acrostic headings "א ALEPH." … "ת TAU." are absent (pg10 omits them) |
| G11-bible-03 | UNCERTAIN | S4 | kjv-en | after 1062.5, 1078.4, 1091.2, 1097.3, 1103.4, 1107.4, 1111.3, 1116.5, 1119.3, 1125.4, 1129.4, 1132.2, 1133.4, 1146.4 | 186 w | The 14 Pauline subscriptions of printed KJVs are absent, e.g. "Written to the Romans from Corinthus…". They are scribal colophons, not apostolic text, so scope needs a decision |
| G11-bible-04 | EXTRANEOUS | S4 | kjv-en | end of 929.1 (Mal 4:6) | 1 token | The PG OT/NT separator `***` is served after "…smite the earth with a curse." (pg10 line 76401) |
| G11-bible-05 | MISLABELED | S4 | kjv-en | registry label and year | — | "King James Version (1611)" is served as a modern-spelling 66-book text: no 1611 Apocrypha, "Translators to the Reader", Epistle Dedicatory, chapter summaries or marginalia; wording mostly matches the 1769 standard |
| G11-bible-06 | UNCERTAIN | S4 | kjv-en | 141 verses; the 14 omissions are listed in the JSON | 1 word each | Wording inherited from pg10 differs from the 1769 standard. There are 14 one-word omissions, e.g. Esth 8:5 "if I have favour" (1769: "found favour"), Lev 26:11 "And I set" and 1 Sam 10:27 "brought no presents". Other differences look like typos, e.g. Jonah 1:15 "they look up Jonah" and Gal 2:20 "neverthless". Some may be 1611 readings. This needs wording review, not restoration of passages |
| G11-bible-07 | UNCERTAIN | S3 | web-en | 687.2 (Isa 8:14) | ~11 w | "a stumbling stone and a rock that makes them fall" is absent from the served WEB and from pg8294, but present in the current WEB (and in the ASV and KJV equivalents). The next verse's "stumble over it" is left without an antecedent |
| G11-bible-08 | MISLABELED | S4 | web-en | 990.7, 1026.7, 1033.6, 1042.1, 1062.4–1062.5 | 7 labels | Luke 17:36, Acts 8:37, 15:34, 24:7 and Rom 16:25–27 are served as bare verse numbers, because the import removed the source's footnote-only text. Paragraph 1062.5 is just "²⁶  ²⁷". The content decision itself is correct for WEB |
| G11-bible-09 | EXTRANEOUS | S4 | web-en | v1 of 117 psalms (incl. 597.0 "<<ALEPH>>") | markup | Psalm titles are wrapped in literal `<<…>>` delimiters. This is pg8294's ASCII convention, faithful to source, but reads as markup |
| G11-bible-10 | EXTRANEOUS | S4 | web-en | 512.0, 524.0, 623.0 | 50 w | Translator notes are merged into the Ps 34, 46 and 145 titles without braces in pg8294, e.g. "departed.Psalm 34 is an acrostic poem…". The current WEB has them as footnotes |
| G11-bible-11 | MISSING | S4 | web-en | ch 597 (Ps 119) | 21 headings | Only "<<ALEPH>>" is served. BETH…TAV are absent in pg8294; the current WEB has all 22 |

**Evidence details** (boundary excerpts, source line ranges and hashes) are in `G11-bible.findings.json`. Key anchors:
- **01:** Psalm 2 ends "Blessed are all they that put their trust in him." Next comes "¹ Lord, how are they increased…" (481.0). The eBible KJV has `\d` lines in `20-PSAeng-kjv.usfm`, from line 49 (Ps 3) to line 5255 (Ps 145); pg10's Psalms (lines 45998–53301) have none.
- **07:** pg8294 lines 44849–44850 and eBible `24-ISAeng-web.usfm` line 578.
- **08:** pg8294 lines 66280, 69689, 70331, 71089 and 72519–72521.
- **10:** pg8294 lines 38097, 38560 and 41736.

### Scope notes (not defects)

- **KJV:** the Apocrypha, the KJV front matter, the KJV book titles ("Otherwise Called…") and the italics for supplied words are not served. The canon is Protestant, 66 books, per the registry description.
- **WEB:** these are not served:
  - the 794 `{…}` translator footnotes (5,458 tokens)
  - the current WEB's Psalm "BOOK 1–5" headings and Song of Solomon speaker labels, which pg8294 also lacks.

  The `[ ]` brackets around supplied words (1,296 pairs) come from the source.
- **BSB:**
  - the 16 official empty references (skipped verse numbers)
  - section headings, cross-reference lines, footnotes, the Psalms book headings and 44 acrostic `\qa` headings. The TXT export lacks all of these; staging preserved them separately.
  - superscriptions shown as verse 1, per the TXT and USFM convention.

### Open questions

1. KJV (01–03): restore the Psalm superscriptions, and if so, decide on the Psalm 119 headings and the subscriptions. The eBible KJV USFM would be the reference. The subscriptions are a scope call.
2. WEB (07): do we keep serving the 2005 pg8294 snapshot? It differs from the current WEB Classic in 14,422 verses; the WEB Catholic packet already treats them as different texts. Or do we verify Isaiah 8:14 against an early-2000s WEB release first?
3. WEB (08–11): cosmetic handling of empty verse labels, `<< >>` and the merged notes. If the text changes, audio and word-timing sidecars follow the text-change rule in DECISIONS.md (2026-09-11).
