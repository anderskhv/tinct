# WEB Catholic independent staging

Prepared: 24 September 2026 · Content-only handoff for Codex

## Status and boundary

This packet stages the World English Bible (Catholic), eBible.org `eng-web-c`, as a **separate 73-book edition**. It does not replace, merge with or rename BSB, KJV or WEB (`web-en`). **Nothing is registered or published by this packet.** No app code, registry, live editions, shared tooling, character data or audio was changed.

Codex owns integration, the BSB default switch, and publication. Before this packet, the repository had no WEB Catholic package: the BSB staging README lists "the separate 73-book WEB Catholic collection" as deferred work, and no branch or PR contains one.

Independent review: see [REVIEW.md](REVIEW.md).

## Source

| Item | Value |
| --- | --- |
| Translation | World English Bible (Catholic), abbreviation WEBC, eBible ID `eng-web-c`, "2020 stable text edition", with the site last updated on 2026-08-21 |
| Details | https://ebible.org/find/details.php?id=eng-web-c |
| Rights | Public domain. The name "World English Bible" is an eBible.org trademark. The name may be used only for unchanged text (https://ebible.org/web/). The wording here is unchanged; only markup is removed. |
| Primary input | `https://ebible.org/Scriptures/eng-web-c_usfm.zip` · SHA-256 `bdcafa3c1f88d9d491595c987c137caaf39b45109aecccda87959542d8fbdf8b` · 3,081,773 bytes · Last-Modified 22 Sep 2026 04:24:18 GMT |
| Independent check input | `https://ebible.org/Scriptures/eng-web-c_usfx.zip` · SHA-256 `6a34804c71b8aa2930e851a023511f702fff4dd5a5e427c393f9d6a84fe6aea2`, which also contains the native book list in `eng-web-cmetadata.xml` (SHA-256 `d33e3035…41bcd1`) |
| Tertiary check input | `https://ebible.org/Scriptures/eng-web-c_vpl.zip` · SHA-256 `ee8c24472b7201b0d7383925e18e11dccf05011d83b9618246395a3f1b96d88f` |
| Per-book USFM hashes | `out/provenance.json` → `source.usfmMembers` |

Raw downloads are not committed because the repository `.gitignore` excludes raw sources. `stage.py` fails closed if a download's hash differs from the pinned value. eBible rebuilds these archives often, so a newer download may not match the pins. If the pins stop matching, the committed `out/verse-text.json` remains the canonical extract. Re-stage from the new source only after a new review.

**WEBC and the live `web-en` are different texts.** The live `web-en` is the classic WEB from Project Gutenberg #8294 (for example "Yahweh is my shepherd"). WEBC is a subset of the WEB *Updated* text ("The LORD is my shepherd"). The two must not share an edition key, audio or cached text identity.

## What the candidate contains

`out/bible-webc-en.candidate.json` uses the standard Tinct edition format (`sections` + `chapters`), serialised with 2-space indentation and UTF-8. Proposed edition key: `webc-en`. The key is only a proposal; Codex owns the final key.

- **73 books in the source's native Catholic order** (official DBL `bookList`). The order is Genesis–Nehemiah, Tobit, Judith, Esther (Greek), 1–2 Maccabees, Job, Psalms, Proverbs, Ecclesiastes, Song of Solomon, Wisdom, Sirach, Isaiah, Jeremiah, Lamentations, Baruch, Ezekiel, Daniel (Greek), Hosea–Malachi, and then the 27 New Testament books.
- **1,328 chapters, 10,618 paragraphs, 35,379 non-empty verses.** Deuterocanonical chapters: TOB 14, JDT 16, ESG 10, 1MA 16, 2MA 15, WIS 19, SIR 51, BAR 6 (chapter 6 is the Letter of Jeremiah), DAG 14.
- **Additional passages within books are preserved:**
  - the Greek additions to Esther inside ESG
  - Daniel 3:24–90 (the Prayer of Azariah and the Song of the Three)
  - Daniel 13 (Susanna) and Daniel 14 (Bel and the Dragon)
  - the Sirach prologue, as paragraph 0 of Sirach 1 under key `SIR.PROLOGUE`
  - the unnumbered title line of Sirach 51 (`SIR.51.pre`)
- **Reading text:**
  - Each verse starts with a superscript label, as in the live Bible editions: `¹ `, and for source verse ranges `¹⁵⁻¹⁶`.
  - Paragraphs follow the source markers (`\p \m \pi1 \mi \pc`).
  - Consecutive poetry lines (`\q1–\q3`) and list lines (`\li1`) form one paragraph until a `\b` break or a prose marker. Line starts are recorded in `layout.json`.
  - The 138 psalm superscriptions (`\d`) are their own paragraphs, with no verse label. Keys are `PSA.N.d`, and for the Psalm 119 letter headings `PSA.119.d+N` (the heading after verse N).
- **Kept out of the reading text** and stored in sidecars instead:
  - Strong's numbers
  - footnotes and cross references (`notes.json`, 2,021 notes with their references)
  - section and major headings, and the Song of Solomon speaker labels (`layout.json` → `headingsBefore`)
  - book introductions and the Psalms chapter label (`front-matter.json`)
  - words-of-Jesus (red-letter) styling, which is not transferred

  The source's `\wj`, `\qs` (Selah), `\bk` and `\add` text is kept, and only their markers are removed.
- **Empty verse slots are not filled:** 29 official empty references. Examples: Sirach 26:19–27, "omitted by the best authorities"; Luke 17:36; Acts 8:37; Romans 16:25. They are listed in `official-empty-references.json`, with the source notes. They get no label and no text in the reading edition.
- **Wording anomalies are preserved.** For example, the source typo "thingsin" in ESG 1:1 is kept. Psalm 68:32 renders as "Lord—Selah—", as both USFM and USFX mark it up. The VPL export inserts a space there.

## Identity files for integration

| File | Use |
| --- | --- |
| `out/chapter-crosswalk.json` | `{editionKey, sourceSha256, chapters:[{chapterNumber, bookCode, biblicalChapter}]}`, the same shape as `BibleEditionChapterMap` on `codex/bible-reference-integration-20260924`. `sourceSha256` is the candidate hash. |
| `out/verse-crosswalk.json` | Source-native reference `BOOK.C.V` → UTF-16, end-exclusive spans `{chapterNumber, paragraphIndex, start, end}`. The spans exclude the verse label. A verse may span paragraphs. |
| `out/verse-text.json` | Canonical verse text: one row per reference, with `book`, `chapter` and `verse` exactly as in the source. |
| `out/esther-daniel-passage-map.json` | Evidence-based Greek Esther and Greek Daniel correspondences (next section). |
| `out/layout.json`, `out/notes.json`, `out/front-matter.json` | Presentation and apparatus. None of this is reading text. |

**Book codes are the source's native USFM codes.** Greek Esther is `ESG` and Greek Daniel is `DAG`, never `EST` or `DAN`. The exact mapper on the integration branch will therefore return `target-chapter-missing` for Esther and Daniel between `webc-en` and any 66-book edition. That outcome is correct. Any cross-edition Esther or Daniel projection must go through the passage map, not through number equality.

## Esther and Daniel: numbering and passage boundaries

Run `passage_map.py`. Every WEBC verse is compared with the Hebrew-tradition text in the same official package: WEB Updated `EST` and `DAN`, which are carried in the USFX archive but are outside the Catholic book list. The comparison produces scores, not assumptions. Before any lookup by reference, `passage_map.py` checks that the chapter verse counts in the Hebrew-tradition books equal those in BSB (`bsb.txt`, SHA-256 `2ac3af1d…ca96`, the same file pinned by the BSB staging package) and in the live `web-en` and `kjv-en` editions. They are equal in all three. Each row then carries the edition-local location and similarity scores for `web-en`, `kjv-en` and BSB.

### Daniel (`DAG`, 14 chapters, 530 verses)

- Monotonic word-sequence alignment against WEB Updated `DAN` pairs **all 357** Hebrew-tradition verses, with no weak pairs.
- **Greek additions (173 verses), confirmed both by the source markup and by the alignment gaps:**
  - DAG 3:24–90, the Prayer of Azariah and the Song of the Three. The source footnote at 3:24 identifies them.
  - DAG 13:1–64, Susanna
  - DAG 14:1–42, Bel and the Dragon
- **Renumbered passage:** DAG 3:91–97 = Hebrew-tradition Daniel 3:24–30. The same numbers are different passages: **DAG 3:24 is not Daniel 3:24** in `web-en`, `kjv-en` or BSB.
- All other DAG verses carry their Hebrew-tradition number. The wording is close to WEB Updated Daniel, but it is not word-identical: in 1:2, for example, DAG reads "part of the vessels" where WEB Updated reads "some of the vessels". The source metadata's statement that other books equal WEB Updated does not hold for Daniel's shared portions.

### Esther (`ESG`, 10 chapters, 205 verses)

- ESG is a translation of the whole book **from the Greek Septuagint**, not the Hebrew text with inserts. Word-level alignment therefore cannot establish correspondence. The source's introduction says that its numbering follows the Hebrew verse numbers outside the bracketed additions. The map records that numbering claim for each verse. It is not passage identity. Each verse also gets a measured similarity score and a content-word overlap score.
- **Greek additions come from the source's square brackets:**

  | Traditional label | WEBC location | Note |
  | --- | --- | --- |
  | A (Mordecai's dream and the plot) | Embedded at the start of **ESG 1:1** (bracketed span; offsets in the map) | 1:1 also holds the Greek rendering of Hebrew 1:1 |
  | B (the king's first letter) | Embedded at the end of **ESG 3:13** | |
  | C (the prayers of Mordecai and Esther) | Separate verses **ESG 4:18–47** | The introduction says "after 4:17", but the markup numbers these 30 verses. **Hebrew Esther 4 ends at verse 17.** |
  | D (Esther before the king) | **ESG 5:1–2, not bracketed** | The introduction names 5:1 as lengthened. This packet flags it explicitly. |
  | E (the king's second letter) | Embedded in **ESG 8:13** | The introduction says "after 8:12", but the bracket opens inside 8:13 |
  | F (Mordecai's dream interpreted) | Separate verses **ESG 10:4–14** | **Hebrew Esther 10 ends at verse 3** |

  Traditional letters are for orientation only. External numberings are not used for mapping. These include the Vulgate or KJV-Apocrypha chapters 11–16 and the lettered A–F verses of some editions. **A reference such as "Esther 10:4" or "Esther 4:20" in another edition must not be matched to ESG by number.**
- **Hebrew verses with no WEBC counterpart:** Esther 4:6, 9:5 and 9:30. These verses are absent from every official WEBC export (USFM, USFX and VPL), and they are not filled.
- **18 ESG verses are flagged `divergent-greek-wording-check-by-hand`** because their content-word overlap is below 0.3, plus 5:1–2 for Addition D. Examples: 1:7, 1:13–14, 9:7–9 (the lists of Haman's sons, with different transliterations), 10:2. The independent review checked them by hand; see REVIEW.md. The flags stay in the map so that Codex can choose chapter-level rather than verse-level projection for Esther.

### Recommendation for Codex

For Esther and Daniel, project across editions only through `esther-daniel-passage-map.json`:
- For `kind: hebrew-tradition-counterpart*` rows, use `hebrewRef` and the recorded `web-en`, `kjv-en` and `bsb` locations.
- For `greek-addition` rows and Hebrew verses without a counterpart, return **unmapped**.
- A partial-verse selection inside an embedded addition span (ESG 1:1, 3:13, 8:13, 5:1–2) must never project to the Hebrew-tradition verse.

## Validation

`verify_artifact.py` does not import the stager. It rebuilds every verse from the **USFX XML**, a different file and format from the USFM, and compares the result with text read back from the candidate through the crosswalk spans:

- 35,518 text keys (verses, superscriptions, `SIR.51.pre`) plus the Sirach prologue: **0 mismatches, 0 missing, 0 extra**
- chapter identities per book equal those in the USFX file; the book order equals the official native list; the section tree lists every chapter once, in order
- all 29 empty references are declared in the USFX file and are empty there
- full span coverage: every character of every paragraph is inside exactly one span, is a verse label, or is a single separator space; every label matches its verse ID
- **VPL export** (third format; **Genesis is missing from this VPL build and from the read-aloud build**, a defect in eBible's export): 143 differences, **0 unexplained**. There are four kinds:
  - 117 unnumbered lines (superscriptions and `SIR.51.pre`) folded into verse 1
  - 21 Psalm 119 letter headings folded into the preceding verse
  - 4 Song of Solomon speaker labels folded into verse text
  - 1 extra space before the Selah marker in Psalm 68:32
- output hashes equal `provenance.json`

A bug found during verification was fixed before acceptance. The first stager removed the space after closing character markers (for example `righteousness.”Then`). The USFX comparison caught this in 142 verses. The tokenizer now follows the USFM rule: a delimiter space follows only an *opening* marker.

### Reproduce

```bash
# from this folder, with the three official zips and bsb.txt downloaded
python3 stage.py --usfm-zip eng-web-c_usfm.zip --usfx-zip eng-web-c_usfx.zip
python3 verify_artifact.py --usfx-zip eng-web-c_usfx.zip --vpl-zip eng-web-c_vpl.zip
python3 passage_map.py --usfx-zip eng-web-c_usfx.zip --bsb-txt bsb.txt
sha256sum -c SHA256SUMS
```

## Output hashes (SHA-256)

| File | SHA-256 |
| --- | --- |
| `out/bible-webc-en.candidate.json` | `ecaee43e09e68d5411091da3110a5280abe09e0cf5d39f10cc247571f37c5bfb` |
| `out/verse-text.json` | `de0e8a7584fc4eee3a561739027862a18a1b4011c6570246f7340ce1bc798f59` |
| `out/verse-crosswalk.json` | `8c4cfa877244b81a89bf445e9a377fe20de564e7837b5ba71bf72d39539b5fed` |
| `out/chapter-crosswalk.json` | `42cb12ff4ba8a8c10a18cd92082632a12d5fa5bf0a3d9ca3dfaa08928f939e84` |
| `out/esther-daniel-passage-map.json` | `7a05f1e16e54ffd0dab3e22c3effc2fa5cbe25437bbb18af4987f1ebb046c5d0` |

`SHA256SUMS` covers every committed file in this folder.

## Integration items for Codex (not done here)

1. Register the edition under Codex's chosen key and taxonomy.
   - The book group assignments in `sections` are a presentation proposal that reuses the `web-en` section titles. The source defines only the order.
   - The chapter titles use the source's short names (`Esther (Greek) 4`, `Daniel (Greek) 3`). Relabelling them for display is fine, but it must not change `bookCode`.
2. Generate chapter shards with the existing tooling.
3. Decide how to render the `layout.json` material: poetry line breaks, headings, speaker labels and the `\nb` continuation flags (4 paragraphs). This packet does not encode it in the reading text.
4. Position and highlight projection: use the chapter and verse crosswalks, and use the passage map for ESG/DAG. Never apply equal paragraph indices or offsets across editions.
5. Onboarding, character cards and audio for this edition are not included. No audio exists for this edition, and existing WEB or KJV audio must not be reused.
