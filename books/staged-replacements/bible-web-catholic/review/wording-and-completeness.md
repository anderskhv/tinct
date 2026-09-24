# Independent review: wording and completeness (WEB Catholic, `eng-web-c`)

Reviewed: 24 September 2026. Reviewer: an independent adversarial agent. It did not modify the artifact and did not import `stage.py` or `verify_artifact.py` (and did not read them before writing its own parser).

## Scope

The following files under `books/staged-replacements/bible-web-catholic/`:

- `out/bible-webc-en.candidate.json`
- `out/verse-text.json`
- `out/verse-crosswalk.json`
- `out/chapter-crosswalk.json`
- `out/official-empty-references.json`
- `out/provenance.json`
- `README.md`

The review covered verbatim wording, completeness, leakage of editorial text, book and chapter order and identity, and README accuracy. `esther-daniel-passage-map.json` and `passage_map.py` were **not** reviewed; the review checked only the ESG and DAG verse text and gaps.

## Downloads (2026-09-24, via proxy)

| File | SHA-256 | Pinned value in README/provenance |
| --- | --- | --- |
| `eng-web-c_usfm.zip` (3,081,773 B, Last-Modified 22 Sep 2026 04:24:18 GMT) | `bdcafa3c…fdf8b` | identical |
| `eng-web-c_usfx.zip` | `6a34804c…6aea2` | identical |
| `eng-web-c_vpl.zip` | `ee8c2447…6d88f` | identical |
| `eng-web-c_readaloud.zip` | `1ea22780…c5cc` | not pinned (downloaded only to test the Genesis claim) |
| `usfx/eng-web-cmetadata.xml` | `d33e3035…41bcd1` | identical |

- All 73 per-book USFM hashes equal `provenance.json → source.usfmMembers`.
- `stage.py` hashes to `13edea4f…`, which equals `provenance.stagerSha256`.
- The output hashes from `sha256sum` equal the README table and `provenance.outputs`.
- The details page matches the README: "2020 stable text edition, Last updated 2026-08-21", public domain, and the trademark condition.

## Method

1. **Own parser** (`scratchpad/review-wording/myparse.py`). It works line by line from the USFM with regular expressions that strip markup. This is a different approach from the author's tokenizer:
   - Footnotes (`\f…\f*`) and cross-references (`\x…\x*`) are deleted as whole spans.
   - `\w`/`\+w word|attrs\w*` becomes `word`.
   - The opening markers `\wj \qs \bk \wh` consume one following space; their closing markers consume none.
   - Heading and intro lines (`\id \h \toc \mt \ms \s1 \sp \cl \is1 \ip`) go to a side list.
   - `\d` becomes `BOOK.C.d` or `BOOK.C.d+N`, chapter-initial text becomes `.pre`, and the `\ip WHEREAS…` line becomes `SIR.PROLOGUE`.
   - Whitespace is collapsed.
2. **Comparison against the candidate.**
   - Every key my parser produced was compared with `verse-text.json` and with text sliced from the candidate paragraphs through the `verse-crosswalk.json` spans (UTF-16, end-exclusive; multiple spans joined with a space).
   - A separate **random sample** was drawn for reporting (seed 20260924). It has **326 verses across all 73 books**: 3 per book, 12 per deuterocanonical book and PSA, plus 8 extra from BAR 6 and 10 extra from DAG 3, 13 and 14.
3. **Third format.** My parse was compared against the VPL export independently of `verify_artifact.py`.
4. **Structure.**
   - Coverage: every UTF-16 unit of every paragraph must be inside exactly one span, or be a superscript label or whitespace.
   - Leakage: string searches for editorial and apparatus text.
   - Word counts per book.
   - Book order and chapter identity against the metadata `bookList`.
   - The sections tree.

## Results

| Check | Result |
| --- | --- |
| Random sample (326 verses, 73 books) vs `verse-text.json` and crosswalk spans | **0 mismatches** |
| Full corpus: all 35,519 non-empty keys (35,379 verses, 117 chapter-initial `\d`, 21 Psalm 119 `d+N`, `SIR.51.pre`, `SIR.PROLOGUE`) | **0 mismatches** vs spans. 0 mismatches vs `verse-text.json` for all verse rows. Superscriptions, `pre` and the prologue exist only in the crosswalk, by design. |
| Keys in the candidate but not in my parse, or the reverse | none |
| Words per book, my parse vs candidate paragraphs with labels removed | equal for all 73 books (859,933 words in total) |
| Span coverage | 10,618 paragraphs: 0 uncovered characters, 0 overlapping spans |
| Empty references | my parse finds exactly 29 empty `\v` slots, the same set as `official-empty-references.json`. None has a span or text. |
| ESG 4:6, 9:5, 9:30 | absent from the USFM (no `\v`), from the candidate and from the crosswalk. The neighbours 4:5/4:7, 9:4/9:6 and 9:29/9:31 are present. |
| Verse ranges | the 5 range refs (SIR 11:15-16, 16:15-16, 19:18-19, 22:9-10, 26:19-27) are all official empties. The reading text therefore has no range labels (`⁻` count is 0). |
| `\wj` boundaries | no glued quote or letter boundaries anywhere: 0 hits in the candidate for `[a-z][“‘][A-Za-z]`, `[.,;!?][”’][A-Za-z]`, `[a-z]\.[A-Z][a-z]` or a space before punctuation. Spot checks (MAT 4:4, 5:3, 26:26; LUK 23:43; MRK 5:41; REV 22:16) are correct. |
| Selah (`\qs`) | 74 `\qs` Selah plus 1 place name ("from Selah"), 75 occurrences in the candidate. PSA 3:2 ends "…in God.” Selah.". PSA 68:32 ends "Lord—Selah—" (USFM-correct). |
| Nested `\+w`/`\+wh`/`\+bk` inside footnotes | no leakage: 0 occurrences of Hebrew script, "omitted by the best authorities", "Some manuscripts", "Gr. ", `\` or `\|` in the reading text |
| Psalm superscriptions | 138 in total, each its own unlabeled paragraph (for example PSA 3 paragraph 0) |
| Psalm 119 | ALEPH … TAV are separate paragraphs before verses 1, 9, …, 169 |
| Sirach prologue | 310 words, complete from "WHEREAS many and great things…" to "…so as to live according to the law.". It is paragraph 0 of Sirach 1. The `\is1` heading and the `\ip` intro sentence are not in the reading text. |
| SIR 51 title line | "A Prayer of Jesus the son of Sirach." is paragraph 0 of Sirach 51, unlabeled |
| Greek additions | DAG 3:24–90 (3:24 "They walked in the midst of the fire…") and 3:91–97 are present, as are DAG 13:1–64, DAG 14:1–42, ESG 4:18–47 and ESG 10:4–14. The ESG brackets `[ … ]` are kept. BAR 6:1–72 is present. |
| Revelation 22 | the last paragraph is "²¹ The grace of the Lord Jesus Christ be with all the saints. Amen." There is no Gutenberg text: "Gutenberg" and "PROJECT" occur 0 times in the whole candidate. |
| Editorial leakage | 0 occurrences of "THE HISTORY OF SUSANNA", "BOOK 1"/"BOOK 5", "Deuterocanonical", "is recognized as", "Commonly Called", "Ecclesiaticus", "Letter of Jeremy", "THE SONG OF THE THREE" or "BEL AND THE DRAGON". No Song of Songs paragraph starts with a speaker label (Beloved, Lover, Friends). |
| Book order | the order in `chapter-crosswalk.json` equals the metadata `bookList` (73 codes, native Catholic order). The USFM file-name numbering is *not* that order (for example TOB is numbered after MAL), so the stager correctly did not use the file order. |
| Chapter identity | the (bookCode, chapter) list per book equals the USFM `\c` sequence for all 73 books. `chapterNumber` runs 1..1328 contiguously. Every title ends with its biblical chapter. The sections tree lists 1..1328 once, in order, and each of its 73 leaves holds one book. |
| ESG/DAG codes | `ESG` (10 chapters) and `DAG` (14 chapters) are kept. No `EST` or `DAN` appears. |
| VPL comparison (my own) | 33,727 equal. There are 143 differences, all explained: 117 psalm superscriptions folded into v1, 21 Psalm 119 letters folded into the preceding verse, 4 Song of Solomon speaker labels, and 1 VPL space in PSA 68:32. Five VPL keys use range-start numbering for empties, for example `SIR 11:15`. VPL has no GEN. |

## README claims checked

The following claims are correct:

- the counts: 73 books, 1,328 chapters, 10,618 paragraphs, 35,379 non-empty verses, 138 superscriptions, 29 empties, 4 `\nb`
- 2,021 notes, which equals 1,678 `\f` plus 343 `\x`
- the deuterocanonical chapter counts
- the hashes
- **VPL lacks Genesis**: verified, the VPL book list starts at EXO
- **the read-aloud build lacks Genesis**: verified, the zip has no `GEN` files and starts at `003_EXO`
- **WEBC ≠ live `web-en`**: verified. `app/public/data/editions/bible-web-en.json` reads "Yahweh is my shepherd: I shall lack nothing", while WEBC PSA 23:1 reads "The LORD is my shepherd; I shall lack nothing." The Gutenberg #8294 origin was not independently traced, but the live file contains Gutenberg references.

## Defects and notes

1. **should-fix: README links to files that do not exist.**
   - `README.md` links to [REVIEW.md](REVIEW.md) twice ("Independent review: see REVIEW.md"; "The independent review checked them by hand; see REVIEW.md").
   - Its Reproduce block runs `sha256sum -c SHA256SUMS`, and it says "`SHA256SUMS` covers every committed file".
   - Neither `REVIEW.md` nor `SHA256SUMS` exists in the folder. The ESG hand-check claim therefore has no evidence behind it.
   - Fix: add the files, or remove or correct these statements.
2. **note: a README VPL statement is slightly inaccurate.**
   - README: "117 unnumbered lines (superscriptions and `SIR.51.pre`) folded into verse 1".
   - Actual: all 117 are psalm superscriptions. The VPL does **not** fold `SIR.51.pre`: "A Prayer of Jesus the son of Sirach." is absent from the VPL entirely, and VPL SIR 51:1 starts "I will give thanks…".
   - This does not affect the candidate, which contains the line and matches both USFM and USFX.
3. **note: there are more source word-joins than the one the README mentions.**
   - The source USFM has footnotes placed between words with no space on either side. Removing the footnote verbatim yields glued text in three places:
     - ESG 1:1 "these thingsin the days" (the README mentions this one)
     - ESG 8:13 "kindness of theirbenefactors have"
     - 1MA 4:40 "solemn trumpets,and cried"
   - All three appear identically in the VPL, which makes them faithful to eBible's own renderings. Keeping them is consistent with the "unchanged text" trademark condition.
   - The integrator should know that readers will see these three joins. The README could list all three rather than "for example" one.
4. **note: the README describes range labels that cannot occur.** The README describes range labels (`¹⁵⁻¹⁶`), but every source range is an official empty. No range label appears in the reading text, so the statement is harmless but moot.

No blocking defects were found. No canonical text was dropped, no editorial or apparatus text leaked, and every checked verse matches the source wording and punctuation exactly (after whitespace normalisation).

## Presentation decisions for the integrator (not defects)

- **Sirach prologue.**
  - The source places it in the book introduction (`\is1` + `\ip`), before `\c 1`.
  - The candidate places it as unlabeled paragraph 0 of Sirach 1, with no "Prologue" heading in the reading text. The heading is kept only in the sidecar.
  - Without a rendered heading, a reader may take it for chapter 1 text. Recommendation: render the `front-matter`/`layout` heading, or a "Prologue" label.
- **Psalm superscriptions and Psalm 119 letters** are unlabeled paragraphs. This follows the source's English numbering, in which superscriptions carry no verse number, so no meaning changes. They should be styled distinctly so they do not read as verse text.
- **Song of Solomon speaker labels** (Beloved, Lover, Friends) are removed to `layout.json`.
  - The candidate also splits paragraphs at speaker changes in the middle of a verse. For example, SNG 1:4 continues in unlabeled paragraphs 2 and 3.
  - The labels are editorial in WEB, but they carry interpretive information about who is speaking. Without them the dialogue attribution is lost unless `layout.json` is rendered.
- **Poetry line breaks** (`\q1`–`\q3`) and **section headings** exist only in `layout.json`. Until they are rendered, poetry reads as prose paragraphs. This does not change the wording.
- **Red-letter (`\wj`)** styling is dropped. The text is kept.
- **Empty verse slots** get no text and no label, so the numbering jumps (for example Acts 8:36 → 8:38). The explanatory footnotes are only in `official-empty-references.json`/`notes.json`.

Verdict: ACCEPT
