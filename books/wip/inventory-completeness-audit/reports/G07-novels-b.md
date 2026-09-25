# Source-completeness audit — G07-novels-b

- **Group:** G07-novels-b
- **Books (priority order):** faust-part-1, werther, frederick-douglass, jerusalem, niels-lyhne, heart-of-darkness, walden, jungle-book, a-little-princess, around-the-world-80-days
- **Audited commit:** main `1a7d89ebd816af8a2ac18239010c34fab4bf48c5` (the local checkout; all served-edition sha256 values below match `inventory.json`)
- **Date:** 2026-09-25
- **Status of every defect:** PROPOSED (a separate reviewer confirms)
- **Machine-readable findings:** `G07-novels-b.findings.json` (28 findings)

## Checks performed

For every book I aligned the whole text of each served source edition against an authoritative source file with `align.py` (k=6, `--min 12`, then every run ≥ 25 examined; shorter runs scanned with `--min 3/4/6`). I compared local raws in `books/raw/<id>/` byte-for-byte with the fetched source. I checked the beginning, ending, division list and titles against the source. For the modern editions I checked each real gap by phrase search and paragraph comparison. I also ran two scans: `modern-en` paragraphs under 60 % of the original's length (original ≥ 80 words, then a sentence-level check), and whole paragraphs that are byte-identical to `original-en` or that are English inside `modern-da`. I cross-checked existing packages and `docs/edition-divergence-audit-2026-09-12.md`.

**Tool caveats**
- Faust `original-en` comes from a bilingual OCR, with German on the left-hand pages and English on the right, plus running heads and line numbers. `align.py` cannot separate the two languages, so I wrote a helper (`bi_align.py`, kept in scratch). It aligns against the full OCR, labels each OCR line as English or German by stopwords, and reports only uncovered **English** runs and edition paragraphs that match **German** OCR lines. Its coverage figure (90.57 %) includes OCR noise. Every gap listed below was checked by hand against the OCR lines.
- Danish Niels Lyhne: I could not reach kb.dk/ADL (proxy 502), and Gutenberg has no Danish edition. I used Runeberg's whole-work OCR text of the 5th edition (1923), which is the edition `SOURCE-da.md` names. I cross-checked it against the page continuity of the local raw and against per-chapter word ratios with Larsen's English translation.
- All downloaded sources are in scratch (`groups/G07-novels-b/src/`). Retrieval times are in `retrieval-log.tsv`.

## Summary

| Book | Verdict | Source edition matched | Source coverage | Findings |
|---|---|---|---|---|
| faust-part-1 | **DEFECTS** | DE: PG #21000; EN: Hayward/Buchheim 1892 (IA cu31924026191910), **not Taylor** | DE 98.59 %; EN 90.57 % (English OCR) | S1×4, S2×8, S3×4, S4×1 |
| werther | COMPLETE-VS-SOURCE | PG #2527 (Boylan) | 99.59 % | S4×1 |
| frederick-douglass | COMPLETE-VS-SOURCE | PG #23 | 99.93 % (Narrative + Appendix) | SCOPE (S3), S4×1 |
| jerusalem | **DEFECTS** | PG #15837 (Howard 1915 = Part I) | 99.94 % | S2×1, S3×2, S4×1 |
| niels-lyhne | COMPLETE-VS-SOURCE | DA: Runeberg 5th ed. 1923; EN: PG #55389 (Larsen) | DA 99.53 %; EN 99.96 % | S4×1 |
| heart-of-darkness | COMPLETE-VS-SOURCE (source edition) | PG #219 | 99.995 % | S2×1 (modern-da only) |
| walden | COMPLETE-VS-SOURCE | PG #205 (Walden part) | 99.96 % | — |
| jungle-book | COMPLETE-VS-SOURCE (source edition) | PG #236 | 99.96 % | S3×1 (modern-en only) |
| a-little-princess | COMPLETE-VS-SOURCE | PG #146 | 99.89 % | — |
| around-the-world-80-days | COMPLETE-VS-SOURCE | PG #103 (Towle) | 99.12 % (the residue is chapter headings) | S4×1 |

---

## faust-part-1 — Faust, Part One

**Served editions**
| key | sha256 (16) | label |
|---|---|---|
| original-de | `edb0081f759c0eb2` | Goethe (1808) |
| original-en | `bff236838e6e5ee6` | Bayard Taylor (1870) — `aligned: false` |
| modern-en | `9e66da5b45267bfb` | Modern English |
| modern-da | `ce719108b40e89f1` | Moderne Dansk |

**Sources identified**
- `original-de`: <https://www.gutenberg.org/cache/epub/21000/pg21000.txt>, retrieved 2026-09-25T11:57:16Z, sha256 `c82c2d61713437aa…`. *Faust: Eine Tragödie [erster Teil]*, Goethe, 1808 first edition (PGDP). The local `raw-de.txt` is identical apart from the BOM. Body: lines 64–8333, from Zueignung to "Heinrich! Heinrich!". The transcriber's note (lines 8335–8363) is excluded.
- `original-en`: **the served text is not Bayard Taylor's.** It is Abraham Hayward's prose translation as revised by C. A. Buchheim: *The first part of Goethe's Faust, together with the prose translation, notes and appendices of the late Abraham Hayward* (London: G. Bell & Sons, 1892), Cornell scan <https://archive.org/download/cu31924026191910/cu31924026191910_djvu.txt>, retrieved 2026-09-25T12:01:56Z, sha256 `bf20329598ec2df7…`. The body is OCR lines 958–20219; the introduction and notes are excluded.
  - Evidence: served 1.0 is "Ye approach again, ye wavering forms, which once, in the morning of life…". This matches OCR line 963. Taylor's translation opens "Again ye come, ye hovering Forms!", and a 6-gram alignment against Taylor (PG #14591) covers only 4.5 %.
  - The header of `books/parse-faust.py` says "EN source: Hayward 1833/1892 interlinear OCR edition" and the script reads `raw-en-hayward.txt`, **which is not in the repo**.
  - `SOURCE.md` and `raw-en.txt` document Taylor's translation (PG #14591, a complete, byte-identical body). The registry label, the SOURCE.md and the served text therefore all disagree.

**Alignment**
- `original-de`: source 98.593 % / edition 99.104 %. There are 9 runs ≥ 12, all of them scene-opening stage directions or speaker labels. The one EXTRA run (120 tokens) is the transcriber's note. There are no duplicates.
- `original-en` (bilingual method): 90.57 % of English OCR tokens are covered. 99.18 % of edition tokens are found in the OCR, but about 2,500 of those (~7 %) match only German pages. The 11 uncovered English runs of 25 tokens or more are **9 distinct passages, ≈1,873 words**. Everything else uncovered is running heads and line numbers.

**Structural notes**
- Both source editions have all 28 units: Zueignung/Dedication, Vorspiel/Prelude, Prolog/Prologue, and every scene including Walpurgisnacht, Walpurgisnachtstraum (Oberon and Titania's Golden Wedding) and Kerker/Dungeon. The exceptions are the gaps listed below.
- The Macbeth-type loss (speech continuations dropped after inline stage directions) does **not** occur. The English gaps come from whole OCR pages that the parser skipped. The Easter gap, for example, is two consecutive English pages.
- The paragraph counts differ (DE 1,056 vs EN 895). This is expected for two independent editions.

**Verdict: DEFECTS**

| ID | Type | Sev | Editions | Location | Words | Summary |
|---|---|---|---|---|---|---|
| G07-faust-part-1-01 | MISLABELED | S2 | original-en | label/registry | whole | Labelled "Bayard Taylor (1870)", but the text is Hayward/Buchheim prose (1892 OCR); SOURCE.md/raw say Taylor; the Hayward raw is not in the repo |
| G07-faust-part-1-02 | MISSING | S1 | oe, me, md | after 3.16; 4.0 starts mid-sentence | 242 | The end of the Prologue ("Mephistopheles (alone). I like to see the Ancient One…"), the NIGHT heading, and the first ~207 words of Faust's opening monologue ("I have now, alas… mastered philosophy") |
| G07-faust-part-1-03 | MISSING | S1 | oe, me, md | inside 4.26 | 398 | The Easter sequence: the goblet raised, the bells, "Christ is arisen!", "The tear is flowing, earth has me again", and the choruses |
| G07-faust-part-1-04 | MISSING | S1 | oe, me, md | inside 6.0 | 274 | "It is written: In the beginning was the Word… the Deed" and the lines around it |
| G07-faust-part-1-05 | MISSING | S2 | oe, me, md | inside 6.1 | 110 | Spell of the four elements and conjuration ("Sylph vanish, Kobold shall toil…") |
| G07-faust-part-1-06 | MISSING | S2 | oe, me, md | after 13.5 | 185 | Martha dresses Margaret; the knock; Mephistopheles enters ("…Mrs. Martha Schwerdtlein") |
| G07-faust-part-1-07 | MISSING | S2 | oe, me, md | 19.21 mid-sentence | 192 | Margaret's horror of Mephistopheles ("…he can love no living soul") and Faust's replies |
| G07-faust-part-1-08 | MISSING | S2 | oe, me, md | inside 24.9 | 157 | Witches' chorus "To the Brocken the witches repair!" and the Voices (Baubo, Ilsenstein) |
| G07-faust-part-1-09 | MISSING | S2 | oe, me, md | after 24.23 | 235 | Parvenu, Author, Mephistopheles grown old, the Huckster-Witch, and the reply "Done, happened!…" |
| G07-faust-part-1-10 | MISSING | S3 | oe (me/md partial) | 2.11 mid-sentence | 80 | Close of the Prelude ("…from Heaven, through the World, to Hell"); 2.11 ends with the OCR residue "and birds," |
| G07-faust-part-1-11 | EXTRANEOUS | S2 | original-en | 68 paragraphs in 15 chapters | ~2,500 | German facing-page OCR served as English text (55 paragraphs mostly German, e.g. 6.12–6.15, 21.0, 27.6–27.12), plus line numbers and running heads ("96 STU DIRZIMMER.", "A= neige, 3230") |
| G07-faust-part-1-12 | EXTRANEOUS | S2 | modern-en, modern-da | the 55 German-bleed positions | ~2,300 | modern-en renders those positions in English, which creates duplicates (6.12–6.13 ≈ 6.16–6.18; 9.13 ≈ 9.15; 17.1–17.4 ≈ 17.6–17.9) and misattributions (9.47, 17.5, 27.8, 27.10). It also adds lines with no source: 27.11 "I will not falter! Forward—I must save her!", 27.12 "The horses know the way. Onward, then, into the night!" |
| G07-faust-part-1-13 | MISLABELED | S3 | modern-da | 77 paragraphs in ch7, 11–14, 25–28 | 786 | Untranslated English (copies of modern-en) inside "Moderne Dansk", including the ending 28.53–28.54 |
| G07-faust-part-1-14 | EXTRANEOUS | S1 | original-de | 28.69 (final paragraph) | 95 | The PG transcriber's note (DE+EN) is appended to the last line "Heinrich! Heinrich!" |
| G07-faust-part-1-15 | MISLABELED | S3 | original-de | 5.0–5.10, 5.19 | 674 | Vor dem Thor: ~17 speaker labels dropped, so lines are merged under the wrong speakers (5.1 "ANDRE." carries 6 speakers' lines) |
| G07-faust-part-1-16 | MISSING | S3 | original-de | first paragraph of ~24 scenes; after 28.67 | ~150 | Scene-opening stage directions and first-speaker labels dropped (17 scenes open unattributed, e.g. Dom 23.0 Böser Geist; 7 open with fragments: "am Spinnrade allein.", "Thürchen."); "(verschwindet mit Faust.)" missing |
| G07-faust-part-1-17 | EXTRANEOUS | S4 | original-de | 2.0, 3.20, 25.0–25.2, 7.85, 21.0, 25.23 | ~12 | Heading fragments ("lustige Person._", "Der Tragödie"; "OBERONS. Intermezzo." parsed as a speech) and Antiqua "#…#" markup |

**Boundary evidence (original-en; OCR = IA djvu.txt; excerpts ≤ 20 words)**
- **-02:** served 3.16 "…do ye fix firm with everlasting thoughts. [Heaven closes, the Archangels disperse." → missing, OCR lines 2016–2019 and 2096–2149, "Mephistopheles (alone). I like to see the Ancient One occasionally…" through "…that I may no longer, with" → served 4.0 "bitter sweat, be obliged to speak of what I do no know;". The modern editions have the same gap: modern-en 4.0 begins "FAUST. ... with bitter sweat", and modern-da is the same.
- **-03:** "…I shall not now display my wit on your" → missing, OCR lines 3383–3533, "devices. Here is a juice which soon intoxicates." through "Near to creative joy." → "Ah! on earth's bosom Are we for suffering here!". modern-en marks the gap with "..."; modern-da lacks the passage.
- **-04:** "…the hallowed tones which now possess my whole" → missing, OCR lines 5184–5222, "soul. We are accustomed to see men deride what they do not understand" through "…I cannot endure so" → "troublesome a companion near to me." The passage is absent from all three English and Danish editions; `original-de` has "im Anfang war das Wort/…die That".
- **-05:** "Salamander shall glow, Undine twine," → missing, OCR lines 5411–5456 → "Through all heaven diffused". **-06:** 13.5 "Now, only see! do but look at them ! Q" → missing, OCR lines 12316–12358 → 13.6 "MEPHISTOPHELES (ASIDE TO HER). I know you now". **-07:** 19.21 "…but, much as I long" → missing, OCR lines 15271–15319 → 19.22 "Ah, did I but sleep alone!". **-08:** "…a raving witch-song streams along the whole mountain." → missing, OCR lines 17271–17313 → "Wizards (half-chorus). We steal along like snails". **-09:** 24.23 "…that was the true golden age." → missing, OCR lines 17760–17800 → 24.24 "FAUST. I must endeavour to keep my senses!". **-10:** 2.11 "…She will then and birds," → missing, OCR lines 1617–1625 → 3.0.
- **Existing repairs:** none found. No Faust package exists on any branch.

**Open questions**
1. Which English source is intended? The label says Taylor, and the complete Taylor raw (PG #14591) is already in the repo. The served text is a defective Hayward/Buchheim OCR, and `modern-en`/`modern-da` are built on it.
2. `modern-en` contains lines with no source counterpart at the German-bleed positions. All 55 positions need review, not just the samples cited.

---

## werther — The Sorrows of Young Werther

**Served editions:** original-en `db7393bfc33628a2` "Boylan (1779)"; modern-en `f45d353204e356b3`; modern-da `e97c294c690fe118`.

**Source:** <https://www.gutenberg.org/cache/epub/2527/pg2527.txt>, retrieved 2026-09-25T11:56:59Z, sha256 `d3d603003a385308…`. Title *The Sorrows of Young Werther*; Translator: R. Dillon Boylan; the text says "Edited by Nathen Haskell Dole". There is no local raw. Body: lines 47–4085, from the PREFACE to "No priest attended." (Book I, Book II, The Editor to the Reader).

**Alignment:** source 99.59 % / edition 100.0 %. There are no runs ≥ 12. The only runs ≥ 3 are 5 heading runs (the dates are carried as chapter titles).

**Structure:**
- The Preface, all 82 dated letters and "The Editor to the Reader" are present in source order (82 source date headings = chapters 2–83). The Editor's section is chapter 84, with 122 paragraphs. It includes the final letters, the Ossian recital, the death and the burial.
- The book boundaries are correct: Book Two starts at October 20, 1771.
- The years in the chapter titles are editorial but consistent with the source ("JANUARY 8, 1772.").
- `modern-en` and `modern-da` have no truncated or English paragraphs.

**Verdict: COMPLETE-VS-SOURCE**

| ID | Type | Sev | Editions | Location | Summary |
|---|---|---|---|---|---|
| G07-werther-01 | MISLABELED | S4 | original-en | label; ch1 section | Label year 1779, but Boylan's translation dates from 1854 (Bohn). The Preface carries section "Book One" |

**Existing packages:**
- green-werther (`origin/claude/friendly-albattani-qgyqfi`, 0252b80d) is a modern-en package. Its `source.json` equals the live `original-en`, and it records no completeness issue. Its partD notes a modern-en clause taken from the German, which is translation variance.
- `books/wip/werther` on main holds drafting batches.

**Open question:** `werther-original-de.json` (83 chapters) exists in public data but is not registered. It was not audited.

---

## frederick-douglass — Narrative of the Life of Frederick Douglass

**Served editions:** original-en `64bc808575f55364` "Douglass (1845)"; modern-en `695db129557f3393`; modern-da `45495079dc5f8ac4`.

**Source:** <https://www.gutenberg.org/cache/epub/23/pg23.txt>, retrieved 2026-09-25T11:57:00Z, sha256 `234c15348a66919b…`. *Narrative of the Life of Frederick Douglass, an American Slave* (Boston, Anti-Slavery Office, 1845). There is no local raw. Body: lines 520–3740, from CHAPTER I to "LYNN, Mass., April 28, 1845", including the Appendix.

**Alignment:** Narrative and Appendix, source 99.929 % / edition 100.0 %, with no runs ≥ 3. Counting the 1845 front matter, coverage falls to 88.955 %, and the one missing run (4,533 tokens) is exactly the front matter plus the PG biographical note.

**Structure:**
- Chapters I–XI and the Appendix (the "A Parody" poem, signature and date) are complete.
- The 10.26|27 break before the Hamlet quotation mirrors the source.
- The underscore italics display literally, because the reader renders `*…*` but not `_…_`.

**Verdict: COMPLETE-VS-SOURCE** for the Narrative. The front matter is SCOPE.

| ID | Type | Sev | Editions | Location | Words | Summary |
|---|---|---|---|---|---|---|
| G07-frederick-douglass-01 | SCOPE (decision needed) | S3 | all | before 1.0 | 4,185 | Garrison's Preface (lines 79–371, ~3,115 words) and Wendell Phillips's letter (lines 378–486, ~1,070 words) are not served. They are not by Douglass, so exclusion is defensible, but they belong to the 1845 book |
| G07-frederick-douglass-02 | EXTRANEOUS | S4 | all | e.g. 12.10 | — | Literal `_italic_` markup (~45 spans in oe), e.g. "LYNN, _Mass., April_ 28, 1845." |

**Existing package:** green-frederick-douglass (friendly-albattani) is a PARKED modern-en package concerning Matthew 23 wording. Its `source.json` equals the live `original-en`, and it does not discuss the front matter. The PG biographical note (lines 488–518) is a later addition and is correctly excluded.

---

## jerusalem — Jerusalem

**Served editions:** original-en `747b53bedd58d9ba` "Howard (1915)"; modern-en `6cdbf3a5904a26d5`; modern-da `c1552e9a9a3a311b`.

**Source:** <https://www.gutenberg.org/cache/epub/15837/pg15837.txt>, retrieved 2026-09-25T12:14:48Z, sha256 `cc5df0ba5e17cba5…`. *Jerusalem*, Selma Lagerlöf; Translator: Velma Swanston Howard; introduction by Henry Goddard Leach. There is no local raw.
- This is Howard's 1915 translation of **Part I** (*I Dalarne*, 1901): Book One (The Ingmarssons I–IV), Book Two (7 chapters) and Book Three (9 chapters).
- Part II (*I Jerusalem*, 1902) was published separately by Howard as *The Holy City: Jerusalem II* (1918) and is **not served**. This is SCOPE: the registry year (1901) and description fit Part I.
- Body: lines 285–9362.

**Alignment:** source 99.936 % / edition 100.0 %, with no runs ≥ 12. The ending is intact ("…we want to go home.").

**Structure / modern editions:**
- Line 6474 is the second half of the quotation "…is UNITY, / UNITY, UNITY.", but the parser read it as a heading and created a **spurious chapter 10**.
- `modern-en` truncates 17 paragraphs in chapters 1–8. The sentence-level check shows the closing sentence blocks are dropped. `modern-da` has the same truncations.
- `modern-en` chapters 15–18 are byte-identical to `original-en`.

**Verdict: DEFECTS.** `original-en` is text-complete; the defects are structural and in the modern editions.

| ID | Type | Sev | Editions | Location | Words | Summary |
|---|---|---|---|---|---|---|
| G07-jerusalem-01 | MISPLACED | S3 | all | 9.74 / ch10 | 2 | 9.74 is cut off at "…as easy as death is UNITY,"; the next line, "UNITY, UNITY.", became the chapter title "Book Three — Unity, Unity.", so one source chapter is split in two (18 chapters served for the source's 17) |
| G07-jerusalem-02 | MISSING | S2 | modern-en, modern-da | 1.11, 1.17, 1.24, 1.103, 1.109, 1.115, 3.33, 5.0, 5.8, 5.21, 5.22, 5.50, 6.59, 7.7, 7.13, 8.47, 8.148 | ~1,734 | Closing sentences dropped. Example: 1.24 goes from 284 to 87 words, ending "…charged with murder." and losing "But she couldn't have been in her right mind" through "It comes to the same thing,' says father." (source lines 500–518). Similarly 6.59 goes from 342 to 92 words (lines 3877–3897) |
| G07-jerusalem-03 | MISLABELED | S3 | modern-en | ch15–18 (338 paragraphs) | 16,179 | Byte-identical to `original-en` under the "Modern English" label. Also listed at 28.7 % verbatim in `docs/edition-divergence-audit-2026-09-12.md` (not acted on) |
| G07-jerusalem-04 | EXTRANEOUS | S4 | all | 1.55, 1.87, 1.132, 1.307, 8.235 | 6 | "II", "III", "IV", "BOOK TWO" and "BOOK THREE" served as body paragraphs |

**Scope:** Part II not served (confirm intent). Leach's Introduction (lines 90–284) is editorial and correctly excluded.

---

## niels-lyhne — Niels Lyhne

**Served editions:** original-da `3e90c0967db4e214` "Original (1880)"; original-en `5f30145593a20bee` "Larsen (1919)"; modern-en `88dc925851aae72f`; modern-da `497ef5e8a0d3c3d8`.

**Sources**
- `original-da`: Runeberg whole-work OCR text, <https://runeberg.org/download.pl?mode=ocrtext&work=nielslyhne>, retrieved 2026-09-25T12:18:55Z, sha256 `00245873d94d88d6…`. This is *Niels Lyhne*, 5th edition (Gyldendal 1923; facsimile made 2009), the edition named in `SOURCE-da.md`.
  - The local `raw-da-pages.txt` has pages 6–272 in sequence, none of them empty.
  - kb.dk/ADL was unreachable (502), and there is no Danish Gutenberg text.
  - The chapter word ratios between the Danish and Larsen's English are 0.99–1.06 throughout, so there is no chapter-level gap.
- `original-en`: <https://www.gutenberg.org/cache/epub/55389/pg55389.txt>, retrieved 11:57:31Z, sha256 `f74540e73c74397b…`. Translator: Hanna Astrup Larsen (American-Scandinavian Foundation, 1919). The local `raw-en.txt` is identical apart from the BOM. Body: lines 247–7053.

**Alignment:**
- `original-da`: 99.531 % / 99.877 %, with no runs ≥ 12. The residue is Runeberg `<sp>`/`<h2>` markup.
- `original-en`: 99.96 % / 100.0 %, with no runs.
- Both have 14 chapters, and the ending ("…den vanskelige Død" / "…the difficult death") is intact.

**Verdict: COMPLETE-VS-SOURCE** (both source editions).

| ID | Type | Sev | Editions | Location | Summary |
|---|---|---|---|---|---|
| G07-niels-lyhne-01 | MISPLACED | S4 | original-da, modern-da | 152 boundaries, e.g. 1.8\|1.9 | Paragraphs are split mid-sentence at the page breaks of the page raw (1.8 ends "…ingensinde fra" at "=== PAGE 8 ==="). No text is lost; modern-da inherits the splits |

**Scope:** Larsen's Introduction and translator's note are editorial and correctly excluded. Jacobsen's short signed composition note at the front of the 1923 edition is not served; it is not part of the novel. The label year 1880 is the first-publication date.

---

## heart-of-darkness — Heart of Darkness

**Served editions:** original-en `9d7234592e087f7d` "Conrad (1899)"; modern-en `169c288c26f0c8c0`; modern-da `b0d43952a120819a`.

**Source:** <https://www.gutenberg.org/cache/epub/219/pg219.txt>, retrieved 11:57:01Z, sha256 `c0b0bc91c7695f9d…`, British spelling ("sombre"). PG #526, the American-spelling text, gives 99.28 %/99.35 %, so **#219 is the match**. Body: lines 49–3379, Parts I–III, which are chapters 1–3.

**Alignment:** 99.995 % / 100.0 %, with no runs. The opening and the ending ("…into the heart of an immense darkness.") are intact.

**Verdict: COMPLETE-VS-SOURCE** for the source edition.

| ID | Type | Sev | Editions | Location | Words | Summary |
|---|---|---|---|---|---|---|
| G07-heart-of-darkness-01 | MISLABELED | S2 | modern-da | ch3 (3.0–3.86) | 11,593 | All of Part III in "Moderne Dansk" (87 of 87 paragraphs) is byte-identical to `original-en`; there is no Danish text for about 30 % of the book |

Note: the 2026-09-12 divergence audit lists heart-of-darkness `modern-en` at 46.2 % verbatim, which is a quality issue rather than a completeness issue.

---

## walden — Walden

**Served editions:** original-en `880a909fb8da73db` "Thoreau (1854)"; modern-en `d2d20614cb168f7d`; modern-da `a289d165e360133b`.

**Source:** <https://www.gutenberg.org/cache/epub/205/pg205.txt>, retrieved 11:57:04Z, sha256 `2d9a76a2e3e81…`. *Walden, and On The Duty Of Civil Disobedience*. Body: lines 81–9419, from Economy to THE END.

**Alignment:** 99.957 % / 100.0 %, with no runs. All 18 chapters are present, including the "Complemental Verses", and the ending ("The sun is but a morning star.") is intact.
- The MIDSPLIT flags (account tables and set-off quotations) mirror the source layout.
- `modern-da` keeps 6 quoted English verse passages in English, which looks deliberate.

**Scope:** "On the Duty of Civil Disobedience" (lines 9421–10248, ~9,330 words) is a separate essay appended in PG #205 and is not served. This is SCOPE and defensible.

**Verdict: COMPLETE-VS-SOURCE.** No findings.

---

## jungle-book — The Jungle Book

**Served editions:** original-en `f1a9afbb1c7ee5ab` "Kipling (1894)"; modern-en `821357c6bb7dc016`; modern-da `574838d49e38cec0`.

**Source:** <https://www.gutenberg.org/cache/epub/236/pg236.txt>, retrieved 11:57:05Z, sha256 `571353c4c69d1270…`. PG #35997 (Century Co. 1910) gives 98.35 %, with variants such as "Chaunt", so **#236 is the match**. Body: lines 56–5412.

**Alignment:** 99.958 % / 100.0 %, with no runs. All 7 stories with their epigraph verses and all 7 songs are present:
- Hunting-Song of the Seeonee Pack
- Road-Song of the Bandar-Log
- Mowgli's Song
- Lukannon
- Darzee's Chant
- Shiv and the Grasshopper
- Parade Song of the Camp Animals

The song titles are served as body paragraphs. Neither edition has a preface.

**Verdict: COMPLETE-VS-SOURCE** for the source edition.

| ID | Type | Sev | Editions | Location | Summary |
|---|---|---|---|---|---|
| G07-jungle-book-01 | MISLABELED | S3 | modern-en | ch1 (154/154 paragraphs) | "Mowgli's Brothers" in `modern-en` is byte-identical to `original-en`. The divergence audit lists this book at 42.8 % verbatim (not acted on) |

---

## a-little-princess — A Little Princess

**Served editions:** original-en `db6f42f1bdcc817a` "Original (1905)"; modern-en `5e359e936c37e8e7`; modern-da `3df7d45b3c5249db`.

**Source:** <https://www.gutenberg.org/cache/epub/146/pg146.txt>, retrieved 11:57:07Z, sha256 `004c4e47ab69973d…`. The local `raw.txt` is identical apart from the BOM. Body: lines 77–7849.

**Alignment:** 99.887 % / 100.0 %. The only run (12 tokens) is PG's closing line, which is correctly excluded. All 19 chapters are present and the ending is intact. The flag at 1.17 ("MISS MINCHIN,") is the brass-plate text shown in the source.

**Verdict: COMPLETE-VS-SOURCE.** No findings.

---

## around-the-world-80-days — Around the World in Eighty Days

**Served editions:** original-en `e23ae1708c6e0365` "George Towle (1873)"; modern-en `13b90c0526762af9`; modern-da `2d9a0c994c7eac94`.

**Source:** <https://www.gutenberg.org/cache/epub/103/pg103.txt>, retrieved 11:57:08Z, sha256 `6f608ea2da50caf7…`. Translator: George M. Towle. Body: lines 82–7961.

**Alignment:** 99.123 % / 100.0 %. All 32 runs ≥ 12 (the longest is 23 tokens) are chapter headings, which are carried as chapter titles. All 37 chapters are present and the ending is intact.

**Verdict: COMPLETE-VS-SOURCE**

| ID | Type | Sev | Editions | Location | Summary |
|---|---|---|---|---|---|
| G07-around-the-world-80-days-01 | EXTRANEOUS | S4 | all | 34.22 (marker in 34.20) | Towle's footnote "[1] A somewhat remarkable eccentricity on the part of the London clocks!—TRANSLATOR." is served as a body paragraph. modern-da renders it "— OVERSÆTTEREN" |

---

## Top findings by severity

- **S1:**
  - G07-faust-part-1-02: Faust's opening monologue and the end of the Prologue are missing.
  - G07-faust-part-1-03: the Easter scene is missing.
  - G07-faust-part-1-04: "In the beginning was the Word/Deed" is missing.
  - These three affect `original-en`, and are absent from `modern-en` and `modern-da` as well.
  - G07-faust-part-1-14: the transcriber's note is appended to the German ending.
- **S2:**
  - G07-faust-part-1-01: the Taylor label sits on Hayward text.
  - G07-faust-part-1-05 to -09: five further missing Hayward passages, 110–235 words each.
  - G07-faust-part-1-11: German OCR text in the English edition.
  - G07-faust-part-1-12: duplicated, misattributed or invented lines in `modern-en`.
  - G07-jerusalem-02: 17 truncated `modern-en` paragraphs.
  - G07-heart-of-darkness-01: Part III of `modern-da` is English.
- **S3:**
  - G07-faust-part-1-10, -13, -15, -16
  - G07-jerusalem-01, -03
  - G07-jungle-book-01
  - G07-frederick-douglass-01 (SCOPE decision)
