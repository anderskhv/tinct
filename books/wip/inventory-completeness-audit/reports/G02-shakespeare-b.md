# Source-completeness audit — G02-shakespeare-b

- **Group:** G02-shakespeare-b (subagent report; all findings `PROPOSED`, for independent review)
- **Books (11):** taming-of-the-shrew, henry-iv-part-2, twelfth-night, measure-for-measure, merry-wives-of-windsor, king-lear, much-ado-about-nothing, antony-and-cleopatra, richard-iii, coriolanus, cymbeline
- **Audited commit:** main `1a7d89ebd816af8a2ac18239010c34fab4bf48c5` (local checkout verified; all 33 edition sha256 match `inventory.json`)
- **Date:** 2026-09-25
- **Machine-readable:** `G02-shakespeare-b.findings.json` (same directory)

## Summary

| Book | Matched source | Verdict | Findings |
|---|---|---|---|
| taming-of-the-shrew | PG #1508 | **DEFECTS** | **S1** Induction (both scenes, ~2,399 words) missing · S4 split speeches |
| henry-iv-part-2 | PG #1518 | **DEFECTS** | **S1** Rumour Induction (~309 words) missing · S4 Epilogue inside 5.5 · S4 split speeches |
| measure-for-measure | PG #23045 (Cambridge 1863) | **DEFECTS** | **S3** 524 margin line numbers served in text · S4 split speeches |
| merry-wives-of-windsor | PG #23044 (Cambridge 1863) | **DEFECTS** | **S3** 515 margin line numbers served in text · S4 split speeches |
| antony-and-cleopatra | PG #1534 | **DEFECTS** | **S3** 8 chapters titled "Scene 0" · S4 split speeches |
| twelfth-night | PG #1526 | COMPLETE-VS-SOURCE | S4 split speeches |
| king-lear | PG #1532 | COMPLETE-VS-SOURCE | S4 split speeches |
| much-ado-about-nothing | PG #1519 | COMPLETE-VS-SOURCE | S4 split speeches |
| richard-iii | PG #1503 | COMPLETE-VS-SOURCE | S4 split speeches |
| coriolanus | PG #1535 | COMPLETE-VS-SOURCE | S4 split speeches |
| cymbeline | PG #1538 | COMPLETE-VS-SOURCE | S4 three split scene titles · S4 split speeches |

Verdict rule used: **DEFECTS** = at least one proposed S1–S3 finding. **COMPLETE-VS-SOURCE** = whole text aligned against the matched source, no authorial text missing, only S4 cosmetic findings. All 11 books had a full-text alignment; none is merely SCREENED.

**Macbeth failure pattern (lost continuations after inline stage directions): negative in all 11 plays.** Every play is an exact ordered-token match to its source, apart from the gaps listed. The same parser does leave a harmless sibling artifact in every play: a speech line that begins with `[...]` starts a new paragraph (see "Cross-cutting" below).

## Method and checks (all books)

1. Served editions and hashes taken from `inventory.json`; sha256 recomputed at the audited commit.
2. The matched source was identified from typography (current PG-team layout `Enter X.` / `[_Exeunt._]` vs the Cambridge `_Duke._` layout with margin numbers) and confirmed by coverage. Every source file was fetched once from `gutenberg.org/cache/epub/N/pgN.txt` and cached in scratch. None of the 11 books has a local raw (`books/raw/<id>` is absent and `book-index.tsv` shows none), so no local-raw comparison applies. For the PG-team plays, the body of the per-play file was diffed against the matching section of PG #100 (`pg100.txt`, sha256 `3cf4b3d4…110a37`, retrieved 2026-09-25T11:53:54Z). Eight are line-for-line identical after whitespace normalisation. King Lear differs only in 13 "Prythee" (#1532, and the served text) vs "Prithee" (#100).
3. `align.py` was run with the defaults (k=6, --min 12) on the body cut: from the first body heading (`INDUCTION` or `ACT I`) to the PG end marker. For the Cambridge files the cut runs from `ACT I.` to `NOTES.`, with the per-scene `NOTES:` blocks and the right-margin line numbers removed by `cambclean.py`.
4. Residual analysis (`analyze.py`) strips the act/scene heading lines, which Tinct serves as chapter titles rather than paragraphs. It then runs `align.py --min 1`, maps every residual run to its source line, and does an **ordered** token-sequence comparison (`difflib`) of the source body against the concatenated edition. This catches short dropped continuations and repeated-passage losses that k-gram coverage alone could miss.
5. Structure checks: the chapter list against the source scene headings (count, order, number, location text); the first and last paragraphs; wrapped two-line headings; headings, boilerplate, licence text or empty paragraphs in the body; speaker-only paragraphs.
6. Translations: per-chapter paragraph counts are equal across original-en, modern-en and modern-da for all books. Each defect was checked for presence in modern-en and modern-da. A whole-passage scan looked for modern-en paragraphs under 62% of the original's words (on originals of 25+ words) and for neighbour duplication: none found. The screening cards carry no `SHORT_VS_ORIG`, `MOD_DUP_ADJ` or count-mismatch flags for this group. Their `MIDSPLIT` flags are explained by the split-speech artifact, and their `SHORT_CHAPTER` flags are genuinely short scenes; both are verified by the token identity.
7. Prior packages: `origin/claude/friendly-albattani-qgyqfi` (head `0252b80`) green-taming-of-the-shrew, green-twelfth-night, green-merry-wives-of-windsor, green-richard-iii, green-coriolanus and green-cymbeline. In all six, `source.json` is hash-identical to the served original-en, so they inherit any source gap. No staged replacements exist for these plays. The codex `*shakespeare-speakers*` branches change only app code, not these editions.

**Tool caveats.**
- The align tokeniser counts margin numerals as tokens. In Measure and Merry Wives they appear as 524 and 515 one-token EXTRA runs, below `--min 12`, so the edition-covered figure (~97.8%) is the only sign of them in the default output.
- Chapter titles are not aligned, so scene-heading tokens show as 12–14-token MISSING runs (Lear, Coriolanus, Cymbeline). All of these were checked and are headings.
- For the per-play PG files, a naive `--start '^ACT I…'` matches the contents list. Body cuts by line number were used instead.
- Word counts are whitespace words containing a letter or digit. Token counts are align.py tokens.

---

## taming-of-the-shrew — The Taming of the Shrew

**Served editions:** original-en `2fa6c01140bd2544` "Shakespeare (1623)"; modern-en `65f0c9c6d2da2732`; modern-da `9764e1bffb4062b3`.

**Source:** https://www.gutenberg.org/cache/epub/1508/pg1508.txt, retrieved 2026-09-25T11:55:12Z, sha256 `183c53e671d7f41e55cbe0e069c67b15650e97b0af0d548b2c5991f30dc3d87c`. Title "The Taming of the Shrew", Author William Shakespeare, Credits "the PG Shakespeare Team" (most recently updated September 18, 2025). Its body (lines 114–4901) is line-for-line identical (CRLF-normalised) to the Taming section of PG #100 (pg100 lines 148719–153506). **The matched source contains the Induction**, as does its own contents list and Dramatis Personae ("Persons in the Induction: A LORD, CHRISTOPHER SLY…"). No local raw.

**Body:** `INDUCTION` (line 114) to the end marker. Contents and Dramatis Personae are excluded (SCOPE).

**Alignment (original-en):** source covered 88.583%, edition covered 100.0%. There is one MISSING run of 2,501 tokens (the whole Induction, including headings) and no EXTRA, ORDER or DUPLICATE anomalies. Heading-stripped ordered comparison: identical except one 2,475-token deletion before 1.0.

**Structure:** there are 12 chapters, identical to PG #1508's Act/Scene titles for Acts 1–5. The only divisions missing are Induction Scene 1 ("Before an alehouse on a heath") and Scene 2 ("A bedchamber in the Lord's house"). The served text begins at 1.0 "Flourish. Enter Lucentio and Tranio." and ends at 12.112 `[_Exeunt._]`, which is the source's end. At 1.74–1.79, "[_The Presenters above speak._]", the First Servant, SLY (1.76, 1.78) and the PAGE speak about "the play" with no introduction: this is a suspicious transition caused by the gap.

**Verdict: DEFECTS**

| ID | Type | Sev | Location | Extent | Evidence |
|---|---|---|---|---|---|
| G02-taming-of-the-shrew-01 | MISSING | **S1** | before 1.0 | 2,399 words (Ind.1 1,144 + Ind.2 1,255; 2,475 tokens) | Missing from "INDUCTION. SCENE I. Before an alehouse on a heath. Enter Hostess and Sly. SLY. I'll pheeze you, in faith." to "…sit by my side and let the world slip: we shall ne'er be younger." Served after: 1.0 "Flourish. Enter Lucentio and Tranio." Source: pg1508.txt lines 114–587 (Ind.1 116–342, Ind.2 344–587); pg100.txt 148719–149192. modern-en **absent**; modern-da **absent**. Local raw: none. |
| G02-taming-of-the-shrew-02 | MISPLACED | S4 | 18 speech-initial + 8 mid-speech splits; 13 continuation paragraphs | 0 (text complete) | e.g. 1.9 "KATHERINA." / 1.10 "[_To Baptista_] I pray you, sir, is it your will" / 1.11 "To make a stale of me…" (pg1508 line 673, one speech). modern-en and modern-da have the same split. |

**Existing records:** there is no repair. `origin/claude/friendly-albattani-qgyqfi:books/wip/green-taming-of-the-shrew/ACCEPTANCE-RECORD.md` (added in `69f163693`, 2026-09-21), lines 51–54, says: "The absent Induction / Christopher Sly frame is a genuine property of the locked `source.json` … Confirmed in rounds 1, 3 and 4. **Not a candidate defect.**" Lines 171–172 list it again under accepted non-blocking items. **This is an audit-process failure of the Symposium type.** That `source.json` is a copy of the served original-en (sha256 `2fa6c011…`), so three rounds confirmed the absence against the incomplete import itself and never against PG #1508, which has the Induction. The accepted modern-en candidate inherits the gap. The reader impact is also raised by `app/public/data/onboarding/taming-of-the-shrew.json`: it tells readers "The play starts with a frame…", has a "The Lost Frame" card, and offers the reading angle "attend to the play's opening frame — the trick on Christopher Sly". The served text contains none of it.

**Open questions:** Restoring the Induction needs two new leading units in all three editions, plus modern-en and modern-da renderings. Chapter numbering will shift for every Taming coordinate (character data, highlights, audio). Re-open the green acceptance.

---

## henry-iv-part-2 — Henry IV, Part 2

**Served editions:** original-en `5312386825366dc9` "Shakespeare (1600)"; modern-en `5488605e212b451b`; modern-da `789c2f3e84b5af3f`.

**Source:** https://www.gutenberg.org/cache/epub/1518/pg1518.txt, retrieved 2026-09-25T11:59:52Z, sha256 `c399c5dbb16c7008f176a8c4efaa5cdb387a0145623855a4d5e42bb65e400d22`. Title "King Henry IV, Part 2", PG Shakespeare Team (updated September 19, 2025). Its body is identical to the PG #100 section, where `INDUCTION` is at pg100 line 46034 and `EPILOGUE.` at 51105. No local raw.

**Body:** `INDUCTION` (line 126) to the end marker (line 5230).

**Alignment (original-en):** 98.409% / 100.0%. There is one MISSING run of 328 tokens (the Induction) and no EXTRA, ORDER or DUP anomalies. Heading-stripped ordered comparison: one 321-token deletion before 1.0, plus one inserted token, "EPILOGUE", which is the heading served as 19.51.

**Structure:** there are 19 chapters, identical to PG #1518's 19 scenes. Ch1 keeps the source location "**The same**", which in the source means the Induction's "Warkworth. Before the castle"; with the Induction gone, the label points at nothing. The Epilogue is present and complete (317 words, 19.52–19.54). It is not its own unit: its heading "EPILOGUE." is body paragraph 19.51 inside ch19 "Act 5, Scene 5 — A public place near Westminster Abbey".

**Verdict: DEFECTS**

| ID | Type | Sev | Location | Extent | Evidence |
|---|---|---|---|---|---|
| G02-henry-iv-part-2-01 | MISSING | **S1** | before 1.0 | 309 words (Rumour's 40-line speech 297; 321 tokens) | Missing from "INDUCTION. Warkworth. Before the castle. Enter Rumour, painted full of tongues. RUMOUR. Open your ears;" to "From Rumour's tongues They bring smooth comforts false, worse than true wrongs. [Exit.]" Served after: 1.0 "Enter Lord Bardolph." (ch1 "Act 1, Scene 1 — The same"). Source: pg1518.txt lines 126–175 (speech 134–173); pg100.txt 46034–46083. modern-en **absent**; modern-da **absent** (the only "Rumour/Rumor/Rygte" is Warwick at 8.17). |
| G02-henry-iv-part-2-02 | MISLABELED | S4 | 19.51–19.54 | Epilogue present (317 words) | 19.50 "[_Exeunt._]" / 19.51 "EPILOGUE." / 19.52 "First my fear; then my curtsy; last my speech." Source line 5197 has the Epilogue as its own division. modern-en 19.51 "EPILOGUE."; modern-da 19.51 "EPILOG.". |
| G02-henry-iv-part-2-03 | MISPLACED | S4 | 9 + 4 splits; 5 continuation paragraphs | 0 | e.g. 5.41 "POINS." / 5.42 "[_Reads_.] "John Falstaff, knight," Every man must know that, as oft as" / 5.43 "he has occasion to name himself…" (pg1518 line 1466). |

**Existing records:** there is no green package and no repair. `books/characters/henry-iv-part-2/README.md` line 3 claims "All nineteen scenes … including the Induction and the Epilogue", which is **incorrect**. The Rumour card ("The figure painted full of tongues who speaks the Induction", cards.md 169–171) is bound only to Warwick's common-noun "Rumour" at 8:17 (source-review.md 239). The character package therefore inherits and hides the gap.

**Open questions:** Restore the Induction as a leading unit, and decide whether the Epilogue becomes its own unit. The ch1 label stays "The same" only if the Induction's location is restored.

---

## twelfth-night — Twelfth Night

**Served:** original-en `bf69ddee77f588e6` "Shakespeare (1623)"; modern-en `95580e0b935cdfce`; modern-da `6082c3cbef7468f7`.
**Source:** https://www.gutenberg.org/cache/epub/1526/pg1526.txt, retrieved 2026-09-25T11:59:54Z, sha256 `500cbdb31a25122829ed349ffe2bc903fbb05a5e77334573f80cd976a9565977`. PG Shakespeare Team; identical to the PG #100 section. No local raw. Body lines 96–4525.
**Alignment:** 99.396% / 100.0%, 0 runs ≥12. Heading-stripped ordered comparison: **identical** (21,567 tokens).
**Structure:** 18 chapters match 18 scenes with identical titles. Opens "Enter Orsino, Duke of Illyria…" and closes with Feste's song and `[_Exit._]`, as in the source. All songs present.
**Verdict: COMPLETE-VS-SOURCE** (source PG #1526).

| ID | Type | Sev | Location | Evidence |
|---|---|---|---|---|
| G02-twelfth-night-01 | MISPLACED | S4 | 23 + 5 splits; 12 continuation paragraphs | 10.52 "MALVOLIO." / 10.53 "[_Reads._] _To the unknown beloved…_ Her very" / 10.54 "phrases! By your leave, wax…" (pg1526 line 2014). Same in modern-en and modern-da. |

Green package `green-twelfth-night` (accepted): source.json = served original-en. No completeness gap to inherit.

---

## measure-for-measure — Measure for Measure

**Served:** original-en `b99ee3fc8f98dca8` "Shakespeare (1623)"; modern-en `d0e5a5ae2cf437bb`; modern-da `f5e4e26b9dc5ac80`.
**Source:** https://www.gutenberg.org/cache/epub/23045/pg23045.txt, retrieved 2026-09-25T12:00:10Z, sha256 `b4653789e8af7e78b247dd943f1acc9b1df457358b771a9fc90e770cc7659b19`. Title "Measure for Measure", Editor William George Clark (Cambridge edition Vol. I, 1863, Clark & Glover; updated September 27, 2025). The PG-team text (PG #100 section = #1530) gives only ~90% two-way coverage, so it is not the matched edition. The served typography (`_Duke._`, `[_Exeunt._` left unclosed, margin numbers) is Cambridge. No local raw.
**Body:** `ACT I.` (line 137) to `NOTES.` (5133). The 17 per-scene `NOTES:` collation blocks and the margin numbers are removed.
**Alignment:** raw including the NOTES blocks gives 78.873% / 100% (the gap is all editorial apparatus). Cleaned source: **99.359% / 97.792%**. The single MISSING run of 27 tokens is a transcriber's note (lines 3518–3521), correctly not served. EXTRA: 524 one-token runs, all margin numerals. With digit tokens dropped, the ordered comparison is identical apart from that note.
**Structure:** 17 chapters match 17 Cambridge scenes (Act 4 has 6); locations match. Speeches that continue after a mid-speech entry have no repeated label, as in the source layout.
**Verdict: DEFECTS**

| ID | Type | Sev | Location | Extent | Evidence |
|---|---|---|---|---|---|
| G02-measure-for-measure-01 | EXTRANEOUS | **S3** | all 17 chapters (e.g. 1.3, 17.184) | 524 numerals | 1.3 "…your own science **5** Exceeds, in that, the lists of all advice"; 17.184 "…I know her virtue. **525** Thanks, good friend Escalus". Source: pg23045 right-margin numbers (line 150 "5", line 4931 "525"). modern-en **0**; modern-da **0**. This is the scale's "stray apparatus" (S4), raised to S3 because it runs through the whole play. Reviewer may adjust. |
| G02-measure-for-measure-02 | MISPLACED | S4 | 4 mid-speech splits; 5 continuation paragraphs | 0 | 5.105 "_Pom._ I thank your worship…" / 5.106 "[_Aside_] but I shall follow it as the flesh and fortune shall" / 5.107 "better determine." (pg23045 lines 1303–1305, one speech). |

No green package. Audio for both editions is held (`app/src/data/audioAvailability.json` `held_books`), so the numerals are not currently voiced. Re-check before any audio release. The Dramatis Personae, the NOTES and the transcriber's notes are editorial and correctly not served (SCOPE).

---

## merry-wives-of-windsor — The Merry Wives of Windsor

**Served:** original-en `4ee59167c634e42e` "Shakespeare (1623)"; modern-en `9c5531e4d3ff43f4`; modern-da `f41ce14ebf382e02`.
**Source:** https://www.gutenberg.org/cache/epub/23044/pg23044.txt, retrieved 2026-09-25T12:00:13Z, sha256 `466e363503f03b6d8d42f20bb46feb72a12774ac5f472b09bbaebd683f61a1e2`, Cambridge edition Vol. I (Clark & Glover, 1863). The PG-team text gives ~90% coverage, so it is not the matched edition. No local raw.
**Body:** `ACT I.` (line 180) to `NOTES.` (4906), with the 23 NOTES blocks and the margin numbers removed. The Q1 (1602) text reprinted literatim after the NOTES (about lines 5055–7430) is an editorial appendix and is correctly not served (SCOPE).
**Alignment:** raw 84.035% / 100% (apparatus). Cleaned: **99.178% / 97.868%**. The single MISSING run of 27 tokens is the transcriber's note on the letter layout (lines 1205–1208). EXTRA: 515 one-token numerals. The ordered comparison is otherwise identical. Falstaff's letter (5.2–5.3) is complete.
**Structure:** 23 chapters match 23 Cambridge scenes, with matching locations. SHORT_CHAPTER flags (1.2, 4.3, 5.2, 5.4) are genuinely short scenes.
**Verdict: DEFECTS**

| ID | Type | Sev | Location | Extent | Evidence |
|---|---|---|---|---|---|
| G02-merry-wives-of-windsor-01 | EXTRANEOUS | **S3** | 22 of 23 chapters (e.g. 5.2, 23.85) | 515 numerals | 5.2 "…You are **5** not young, no more am I"; 23.85 "…by a country fire; **230** Sir John and all." Source: pg23044 line 1217 "5", line 4822 "230". modern-en **0**; modern-da **0**. |
| G02-merry-wives-of-windsor-02 | MISPLACED | S4 | 6 mid-speech splits; 1 continuation paragraph | 0 | 10.19 "_Mrs Ford._ Do so. Go tell thy master I am alone." / 10.20 "[_Exit Robin._] Mistress Page, remember you your cue." (pg23044 line 2617). Also 8.44/8.45, where the bracketed Quarto insertion "[for missing your meetings and appointments]." is split off. |

**Existing records:** `green-merry-wives-of-windsor` (hard-parked for dialect) uses the served original-en as `source.json` (`4ee59167…`). Its `fidelity-review-1.md` "apparatus scan" searched only collation sigla (`Pope`, `Rowe`, `F1`…), reported "0 hits", and missed the 515 numerals. Audio is held for this book.

---

## king-lear — King Lear

**Served:** original-en `6a8c008eae109059` "Shakespeare (1608)"; modern-en `9f4719b82396b06f`; modern-da `b330f5edaddf7217`.
**Source:** https://www.gutenberg.org/cache/epub/1532/pg1532.txt, retrieved 2026-09-25T11:59:56Z, sha256 `b4f8145ac519fcea19ce1fe0f7a87eb18738a6f89c1a73b5fb6491244204ba20`. PG Shakespeare Team (updated September 19, 2025). This per-play file, not PG #100, is the exact match: it keeps "Prythee" ×13 as the served text does, where the #100 section now reads "Prithee" (VARIANT). No local raw. Body lines 112–6142.
**Alignment:** 99.214% / 100.0%. The 3 MISSING runs ≥12 (39 tokens) are all scene headings. Heading-stripped ordered comparison: **identical** (28,139 tokens).
**Structure:** 26 chapters match 26 scenes. It is a conflated text, as expected: Quarto-only passages are present (the mock trial at 15.11, the whole 4.3 scene in ch19, the servants' coda at 16.68), and so are Folio-only ones (the Fool's prophecy at 11.18). Quarto/Folio differences are therefore not defects here.
**Verdict: COMPLETE-VS-SOURCE** (source PG #1532).

| ID | Type | Sev | Location | Evidence |
|---|---|---|---|---|
| G02-king-lear-01 | MISPLACED | S4 | 23 + 17 splits; 26 continuation paragraphs | 1.26 "CORDELIA." / 1.27 "[_Aside._] Then poor Cordelia," / 1.28 "And yet not so; since, I am sure…" (pg1532 line 237). Kent's farewell 1.59–1.62 is split into four paragraphs. |

Scope note: the label "Shakespeare (1608)" (the Q1 year) sits on a conflated modern text. This is a library-wide label convention and is not reported as a defect.

---

## much-ado-about-nothing — Much Ado About Nothing

**Served:** original-en `dd00eb7a88235b98` "Shakespeare (1600)"; modern-en `3b92db2e6ffc9d6b`; modern-da `2d45f4afa4ee771a`.
**Source:** https://www.gutenberg.org/cache/epub/1519/pg1519.txt, retrieved 2026-09-25T11:59:59Z, sha256 `959dd69cc60e8a10885f4f9e0b62147b4770d7a69cf39d6acec82538ddf27cca`. PG Shakespeare Team; identical to the #100 section. Body lines 132–4631.
**Alignment:** 99.463% / 100.0%, 0 runs ≥12. Ordered comparison: **identical** (22,767 tokens).
**Structure:** 17 chapters match 17 scenes, including the source's mixed-case "Scene III." headings in Acts 3–4. Ends with "[Dance. Exeunt.]", as in the source.
**Verdict: COMPLETE-VS-SOURCE** (source PG #1519).

| ID | Type | Sev | Location | Evidence |
|---|---|---|---|---|
| G02-much-ado-about-nothing-01 | MISPLACED | S4 | 17 + 1 splits; 10 continuation paragraphs | 6.29 "BENEDICK." / 6.30 "[Aside] And he had been a dog that should have howled" / 6.31 "thus, they would have hanged him;…" (pg1519 line 1592). |

---

## antony-and-cleopatra — Antony and Cleopatra

**Served:** original-en `1e768f7514f9746c` "Shakespeare (1623)"; modern-en `6cd4739c60b8cda9`; modern-da `97f45e0b01d5a14a`.
**Source:** https://www.gutenberg.org/cache/epub/1534/pg1534.txt, retrieved 2026-09-25T12:00:01Z, sha256 `7ebf4c16e0ba2f7a412ac27520e14ed447c7741c65aa85ff88606dbac8689f19`. PG Shakespeare Team; identical to the #100 section. Body lines 181–6676.
**Alignment:** 98.778% / 100.0%, 0 runs ≥12; the residue is its 47 heading lines. Ordered comparison: **identical** (26,587 tokens).
**Structure:** 42 chapters match 42 scenes in the same order with the same locations. The SHORT_CHAPTER flags (6 chapters, flagged in each of the 3 editions) are genuinely short battle scenes. **But scenes XI–XV get the number 0**, because the parser handles roman numerals only up to X; Coriolanus 1.10 is labelled correctly.
**Verdict: DEFECTS**

| ID | Type | Sev | Location | Evidence |
|---|---|---|---|---|
| G02-antony-and-cleopatra-01 | MISLABELED | **S3** | titles ch23–25, ch36–40 (all 3 editions) | ch23/24/25 "Act 3, Scene 0 — …" = source III.xi/xii/xiii (pg1534 lines 3813, 3961, 4039). ch36–40 "Act 4, Scene 0 — …" = IV.xi–xv (lines 5131, 5143, 5225, 5249, 5563). This includes 3.13 ("one other gaudy night"), 4.14 (Antony's death) and 4.15 (the monument). The labels also appear on the public `app/public/read/antony-and-cleopatra/book.html`. modern-da has "Akt 3, Scene 0". No other served edition in the repo has a "Scene 0" title. S3 rather than S4 because famous scenes are mislabelled in the TOC and on a public page; the text itself is intact. |
| G02-antony-and-cleopatra-02 | MISPLACED | S4 | 23 + 4 splits; 18 continuation paragraphs | 11.40 "MENAS." / 11.41 "[_Aside_.] Thy father, Pompey, would ne'er have made this treaty.—" / 11.42 "You and I have known, sir." (pg1534 line 2399). |

---

## richard-iii — Richard III

**Served:** original-en `891ead74f6cbcfa6` "Shakespeare (1597)"; modern-en `30204ef16006235b`; modern-da `15ce2bdaa6368395`.
**Source:** https://www.gutenberg.org/cache/epub/1503/pg1503.txt, retrieved 2026-09-25T12:00:03Z, sha256 `8e11eb22f09dbac1b5fd390c7ab353b5b294e6f8074db21fa76e03b4c17592a2`. PG Shakespeare Team (updated September 18, 2025); identical to the #100 section. Body lines 135–6508.
**Alignment:** 99.442% / 100.0%, 0 runs ≥12. Ordered comparison: **identical** (31,362 tokens).
**Structure:** 25 chapters match 25 scenes. Opens "Enter Richard, Duke of Gloucester, alone." and ends with Richmond and `[_Exeunt._]`.
**Verdict: COMPLETE-VS-SOURCE** (source PG #1503).

| ID | Type | Sev | Location | Evidence |
|---|---|---|---|---|
| G02-richard-iii-01 | MISPLACED | S4 | 32 + 19 splits; 38 continuation paragraphs | 3.40 "QUEEN MARGARET." / 3.41 "[_Aside._] And lessened be that small, God, I beseech Him!" / 3.42 "Thy honour, state, and seat, is due to me." (pg1503 line 1060). The Duchess's addresses at 16.35–16.38 are also split. |

Green package `green-richard-iii` (accepted): source.json = served original-en. No completeness gap.

---

## coriolanus — Coriolanus

**Served:** original-en `d0381f3053901dbb` "Shakespeare (1623)"; modern-en `cb7175962445184e`; modern-da `187cf22c3daab3d6`.
**Source:** https://www.gutenberg.org/cache/epub/1535/pg1535.txt, retrieved 2026-09-25T12:00:05Z, sha256 `88eee215f35f02ba23749b88a8a25be4f7f854c1510f15e49e76287a7c6d758b`. PG Shakespeare Team; identical to the #100 section. Body lines 114–6478.
**Alignment:** 99.289% / 100.0%. The single run ≥12 (13 tokens) is the 1.8 heading. Ordered comparison: **identical** (29,589 tokens).
**Structure:** 29 chapters match 29 scenes (Act 1 has 10, and "Scene 10" is labelled correctly).
**Verdict: COMPLETE-VS-SOURCE** (source PG #1535).

| ID | Type | Sev | Location | Evidence |
|---|---|---|---|---|
| G02-coriolanus-01 | MISPLACED | S4 | 9 + 2 splits; 8 continuation paragraphs | 11.82 "CORIOLANUS." / 11.83 "[_To Volumnia and Virgilia_.] Your hand, and yours." / 11.84 "Ere in our own house I do shade my head…" (pg1535 line 1884). |

Green package `green-coriolanus` (accepted): source.json = served original-en. No completeness gap.

---

## cymbeline — Cymbeline

**Served:** original-en `5f25167f50db13c8` "Shakespeare (1623)"; modern-en `9fbacf6307e227a6`; modern-da `0ed7dbb0a97f3921`.
**Source:** https://www.gutenberg.org/cache/epub/1538/pg1538.txt, retrieved 2026-09-25T12:00:08Z, sha256 `8c28e78377ca8cb34e9bb570a7d123cae740a246fc60fc073ef79322a0840062`. PG Shakespeare Team; identical to the #100 section. Body lines 122–5918. Globe scene list for the mapping: https://shakespeare.mit.edu/cymbeline/index.html (retrieved 2026-09-25T12:08:14Z, sha256 `7dacfb25…46b3`).
**Alignment:** 99.262% / 100.0%. The two runs ≥12 are headings. Ordered comparison: **identical** (29,585 tokens).
**Structure: the 29 chapters are PG #1538's own 29 scene divisions, not parser splits.** Against the Globe/MIT 27, the served text splits two Globe scenes, each at a cleared stage:
- **Globe 1.1** = served ch1 (the two Gentlemen, ending `[_Exeunt._]`) + ch2 "The same", which starts at "Enter Queen, Posthumus and Imogen."
- **Globe 3.6** = served ch18 (Imogen alone, ending "[_Exit into the cave._]") + ch19 "The same", which starts at "Enter Belarius, Guiderius and Arviragus."

As a result, served 1.3–1.7 = Globe 1.2–1.6 and served 3.8 = Globe 3.7; everything else maps 1:1. The Folger count of 28 presumably adopts one of these splits (not verified here). The structure is faithful to the matched source, but citations will differ from Globe numbering. Three two-line source headings are split (finding 01).
**Verdict: COMPLETE-VS-SOURCE** (source PG #1538; S4 findings only).

| ID | Type | Sev | Location | Evidence |
|---|---|---|---|---|
| G02-cymbeline-01 | MISLABELED | S4 | titles ch9, ch10, ch26; paragraphs 9.0, 10.0, 26.0 | ch9 title ends "…a trunk" and 9.0 is "in one corner."; ch10 ends "…adjoining Imogen's" and 10.0 is "apartments."; ch26 ends "…between the British and Roman" and 26.0 is "camps." (pg1538 lines 1542–1543, 1625–1626, 4545–4546). modern-en has the same fragments; modern-da has "i et hjørne.", "værelser.", "lejre.". |
| G02-cymbeline-02 | MISPLACED | S4 | 37 + 6 splits; 35 continuation paragraphs | 3.12 "SECOND LORD." / 3.13 "[_Aside._] As many inches as you have oceans." / 3.14 "Puppies!" (pg1538 line 525). |

Green package `green-cymbeline` (accepted) records "19 mid-sentence source breaks" as a source property (the split artifact) and did not notice the split titles.

---

## Cross-cutting observations

1. **Two Induction losses of the Symposium type.** Taming and 2H4 both lose the frame that precedes Act 1, and the matched PG files contain it in both cases. This is consistent with an importer that begins at the first `ACT I` heading. The same pattern should be checked in G01 (Henry V's Prologue is already known). In both books the chapter-1 location metadata still reflects the lost frame: "The same" in 2H4, and the orphaned Presenters/Sly lines in Taming.
2. **Split-speech artifact (sibling of the Macbeth bug), all 11 plays.** When a speech line begins with an inline stage direction, the importer starts a new paragraph. The result is a speaker-only paragraph ("MALVOLIO."), then an SD+first-line paragraph, then an unlabelled continuation that often begins mid-sentence. In the Cambridge plays this happens mid-speech. Across the group there are 191 speech-initial splits, 76 mid-speech splits and 171 unlabelled continuation paragraphs. modern-en and modern-da mirror the split exactly. **No words are lost in these 11 plays**, unlike Macbeth. Each piece is its own paragraph unit in the edition JSON, and therefore its own displayed paragraph, audio unit and highlight anchor. A repair would merge paragraphs in all three editions and remap coordinates.
3. **Parser label bugs:** roman numerals ≥ XI become 0 (Antony only in this repo), and two-line scene headings are cut after the first line (Cymbeline ×3).
4. **Edition labels** ("Shakespeare (1600/1608/1623)") give first-publication years. The texts are modern editorial texts: PG-team, or Cambridge 1863 for Measure and Merry Wives. This is noted as scope only.
5. **Green-programme process:** all six green packages used the served original-en as `source.json`. In Taming this turned a missing Induction into "accepted". In Merry Wives an apparatus scan limited to collation sigla missed 515 numerals. Cymbeline accepted 19 split breaks as source properties. None of the packages compared against an external authoritative file.

## Scratch artefacts (not part of the repo)

The downloaded sources, cleaned bodies, the `analyze.py` / `cambclean.py` / `splitscan` / `seqcmp.py` / `build_findings.py` scripts and all align outputs are under `/tmp/claude-0/-home-user-tinct/93e13969-8fc2-5d26-b841-c55c3e5a62a3/scratchpad/groups/G02-shakespeare-b/` (`src/`, `out/`).
