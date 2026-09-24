# Review: Esther and Daniel passage map (WEB Catholic staging)

Reviewer: independent adversarial review, 2026-09-24. No file other than this one was modified.

## Scope

- `README.md`: "Identity files" paragraph on native codes, and the section "Esther and Daniel: numbering and passage boundaries" with its additions table and "Recommendation for Codex".
- `passage_map.py`.
- `out/esther-daniel-passage-map.json`: all 205 ESG and 530 DAG rows.
- `out/verse-text.json`: ESG and DAG text.
- Live editions `app/public/data/editions/bible-web-en.json` and `bible-kjv-en.json` (read only), BSB `bsb.txt`, and the official `eng-web-c_usfx.zip`.

## Method

- **Inputs.** BSB was downloaded fresh from https://bereanbible.com/bsb.txt into `scratchpad/review-map/`. Its SHA-256 is `2ac3af1d…ca96`, the pinned value. The map's recorded hashes of `verse-text.json` (`de0e8a75…`), live `web-en` (`46d20663…`), live `kjv-en` (`53823ea3…`) and the USFX zip (`6a34804c…`) all equal the current files.
- **Independent parsers.** I wrote my own parsers for the live editions (chapter title `Daniel N` / `Esther N`, superscript verse labels) and for BSB. None of `passage_map.py` was reused, apart from the USFX reader used to check one wording claim. Every recorded `web-en`/`kjv-en` `{chapterNumber, paragraphIndex, verseLabel}` (714 DAG checks, 328 ESG checks) was compared with my parse. **0 mismatches.** Every `bsb.ref` equals `hebrewRef`.
- **Daniel matching.** Each DAG verse was compared by word-sequence similarity against **every** verse of `web-en` Daniel (global argmax). Each mapped DAG and ESG verse was also compared with its ±3 neighbouring verses in `web-en`, `kjv-en` and BSB.
- **Reading by hand.** I read side by side all 19 flagged ESG rows, all of ESG chapters 1, 4 and 9, ESG 2:2–23, 3:1–3, 3:12–15, 5:1–8, 6:5–10, 7:5–10, 8:9–17 and 10:1–14, the bracket boundaries in ESG 1:1, 3:13 and 8:13, and 33 DAG rows in `web-en`, `kjv-en` and BSB.
- **Missing verses.** The absence of ESG 4:6, 9:5 and 9:30 was checked directly in the USFX XML.

## Daniel: checks and evidence

| Check | Result |
| --- | --- |
| DAG 3:24–90, 13:1–64, 14:1–42 (173 verses) are `greek-addition` | **Confirmed.** Source evidence: the notes carry the footnote "The Song of the Three Holy Children … inserted between Daniel 3:23 and Daniel 3:24 …" (stored under ref `DAG.3.23` with `\fr 3:24`) and the footnote "Verses 91-97 were numbered 24-30 in the traditional Hebrew text" at DAG.3.91. The 13:1 and 14:1 notes say Susanna and Bel are "not found in the traditional Hebrew text". Textual evidence: no addition verse scores above 0.35 against any of the 357 `web-en` Daniel verses (noise level). Every mapped verse scores at least 0.63. |
| DAG 3:91–97 = Daniel 3:24–30 | **Confirmed by reading.** For example, DAG 3:91 "Then Nebuchadnezzar the king was astonished and rose up in haste… 'Didn't we cast three men bound…'" matches web-en 3:24 (ch 853, para 4, label 24), kjv-en 3:24 ("astonied … Did not we cast three men bound") and BSB 3:24 ("Suddenly King Nebuchadnezzar jumped up … Did we not throw three men"). The same holds through 3:97 = 3:30 "Then the king promoted Shadrach, Meshach, and Abednego…" in all three. By contrast, DAG 3:24 "They walked in the midst of the fire, praising God" has no counterpart. |
| Daniel 4:1–3 / 3:31–33 and 5:31 / 6:1 boundary risk | **No issue.** `web-en`, `kjv-en` and BSB all use the English boundaries (4:1 "Nebuchadnezzar the king, to all the peoples…", 4:3 "How great are his signs", 5:31 "Darius the Mede received the kingdom", 6:1 "It pleased Darius to set over the kingdom 120…"). DAG uses the same boundaries. The per-chapter counts are identical (3:30, 4:37, 5:31, 6:28) in WEBU, BSB, web-en and kjv-en. The recorded locations (4:1–3 at ch 854 para 0; 5:31 at ch 855 para 6; 6:1 at ch 856 para 0) point at the right text. |
| Hand spot-check of 33 rows | 1:1, 1:21, 2:1, 2:49, 3:1, 3:6, 3:11, 3:23, 3:91, 3:97, 4:1, 4:2, 4:3, 4:4, 4:18, 4:37, 5:1, 5:30, 5:31, 6:1, 6:2, 6:28, 7:1, 7:28, 8:27, 9:1, 9:27, 10:1, 10:21, 11:1, 11:45, 12:1 and 12:13. All recorded web-en/kjv-en locations and BSB refs contain the same passage. |
| Global argmax against web-en | 356/357 DAG verses match their recorded `hebrewRef` best. The exception is DAG 3:6, whose global best is 3:11: the decree is repeated almost verbatim, 0.85 vs 0.79. By reading, DAG 3:6 ("…the same hour") is 3:6, and 3:11 is 3:11. The monotonic alignment got this right. Against kjv-en, 0 neighbour disagreements. The BSB neighbour disagreements (1:5, 2:27, 5:24, 11:18) are paraphrase noise; reading confirms the recorded refs. |
| "DAG 1:2 'part of the vessels' vs WEBU 'some of the vessels'" | Confirmed from USFX. |

**Daniel verdict: the mapping is correct.**

## Esther: bracketed addition spans

| Verse | Recorded span | Check |
| --- | --- | --- |
| ESG 1:1 | `{0, 1964}` | The text has `[` at 0 and `]` at 1963, so `end` 1964 is exclusive, just past `]`. The remainder " And it came to pass after these thingsin the days of Ahasuerus… from India" is the Greek rendering of Hebrew 1:1. Correct. |
| ESG 3:13 | `{192, 2086}` | `[` at 192, `]` at 2085, verse length 2086. Before the bracket: "The message was sent by couriers … destroy the race of the Jews … Adar, and to plunder their goods." This is Hebrew 3:13. Correct. |
| ESG 8:13 | `{57, 3886}` | `[` at 57, `]` at 3885. Before it: "The following is a copy of the letter containing orders:"; after it: "Let the copies be posted… Let all the Jews be ready against this day, to fight against their enemies." Together these are Hebrew 8:13. Correct. |

All three texts are BMP-only (UTF-16 length = code-point length), so the offsets are exact.

**ESG 4:18–47 and 10:4–14.** `[` opens at 4:18 and `]` closes at the end of 4:47. `[` opens at 10:4 and `]` closes at the end of 10:14. No other brackets occur in ESG or DAG. Reading confirms that every verse is addition text: the prayers of Mordecai and Esther, then Mordecai's dream interpreted plus the Ptolemy/Dositheus colophon in 10:14. All 41 verses are `greek-addition` with no Hebrew location. Correct.

## Esther: every flagged row

| ref | recorded hebrewRef | verdict | note |
| --- | --- | --- | --- |
| ESG.1.7 | EST.1.7 | right (divergent) | Same drinking-vessels and royal-wine clause. The Greek adds the carbuncle cup worth 30,000 talents. |
| ESG.1.13 | EST.1.13 | right (divergent) | The king consults "friends" / "wise men" on legal judgment. The Greek compresses the Hebrew parenthesis. |
| ESG.1.14 | EST.1.14 | right | The list of Persian/Median princes near the king: 3 Greek names against 7 Hebrew names. |
| ESG.1.18 | EST.1.18 | right, partial/overlapping | "Wives of the chiefs of the Persians and Medes, having heard…" = Hebrew 1:18. It also carries "dishonor their husbands", which the Hebrew puts in 1:17. |
| ESG.2.10 | EST.2.10 | right | Paraphrase only. The low score comes from word choice. |
| ESG.2.18 | EST.2.18 | right (divergent) | The feast for Esther. The Greek gives a tax remission where the Hebrew gives a holiday and gifts. |
| ESG.2.19 | EST.2.19 | right, partial | "Mordecai served in the courtyard" = Mordecai at the king's gate. The Greek lacks "when the virgins were gathered the second time". |
| ESG.2.23 | EST.2.23 | right (divergent) | The two chamberlains are hanged and the matter recorded. The Greek adds the commendation of Mordecai. |
| ESG.4.7 | EST.4.7 | right | Mordecai tells Hathach of Haman's promised sum (the Greek has "ten thousand talents"). |
| ESG.5.1 | EST.5.1 | **partial: counterpart embedded in unbracketed Addition D** | Hebrew 5:1's content is present, interleaved with the expansion: "on the third day", "put on her glorious apparel", "He was sitting on his royal throne". About 90% of the verse is Addition D (Esther's approach, the king's anger, her fainting, "God changed the spirit of the king…"), which has no Hebrew counterpart. hebrewRef is right for whole-verse projection only. See defect B1. |
| ESG.5.2 | EST.5.2 | **partial: counterpart embedded in unbracketed Addition D** | Only "having raised the golden sceptre" corresponds to Hebrew 5:2 (the king holds out the sceptre). "Touched the top of the sceptre" is absent. The rest (sceptre on her neck, her speech, fainting again, the servants comfort her) is Addition D. See B1. |
| ESG.8.11 | EST.8.11 | right (divergent) | The letters permit the Jews in every city to help one another and deal with attackers. |
| ESG.9.4 | EST.9.4 | right (divergent) | "The order of the king was in force, that he [Mordecai] should be celebrated in all the kingdom" = Mordecai's fame spreading through the provinces. |
| ESG.9.7 | EST.9.7 | right | 3 names = 3 names, same slots (Pharsannes/Parshandatha, Delphon/Dalphon, Phasga/Aspatha). |
| ESG.9.8 | EST.9.8 | right | 3 = 3 (Pharadatha, Barea, Sarbaca / Poratha, Adalia, Aridatha). |
| ESG.9.9 | EST.9.9 | right | 4 = 4 (Marmasima, Ruphaeus, Arsaeus, Zabuthaeus / Parmashta, Arisai, Aridai, Vaizatha). |
| ESG.9.16 | EST.9.16 | right, overlapping | The Jews in the provinces kill their enemies (15,000 against 75,000). It also includes "on the thirteenth day of Adar", which is Hebrew 9:17a. |
| ESG.9.25 | EST.9.25 | right (divergent) | Haman's scheme turns back on him, and he is hanged with his children. |
| ESG.10.2 | EST.10.2 | right, partial | The king's power is recorded in the book of the Persians and Medes. The Greek lacks the Hebrew clause on "the greatness of Mordecai". |

No flagged row has a wrong hebrewRef. There are no better refs to substitute.

## Hebrew verses with no ESG counterpart

- **Esther 4:6** ("So Hathach went out to Mordecai, to the city square…"). Absent from the USFX (ESG 4 runs 1–5, then 7…). Its content is not merged into a neighbour. ESG 4:5 ends "she sent to learn the truth from Mordecai", and ESG 4:7 "Mordecai showed him…" follows directly. The movement is only implied. **Genuinely unmatched.**
- **Esther 9:5** ("The Jews struck all their enemies with the stroke of the sword…"). Absent from the USFX. ESG 9:2 "In that day, the adversaries of the Jews perished" loosely echoes it. That clause is the Greek's rendering of the day's outcome in its 9:2, and the rest of ESG 9:2 ("no one resisted, through fear of them") is Hebrew 9:2. Mapping Hebrew 9:5 to ESG 9:2 is not justified. **Treat as unmatched.** Optionally note the echo.
- **Esther 9:30** ("He sent letters … to the 127 provinces … with words of peace and truth"). Absent from the USFX. Neither ESG 9:29 ("gave the confirmation of the letter about Purim") nor ESG 9:31 contains the 127 provinces or "peace and truth". **Genuinely unmatched.**

## Unflagged ESG sample (26 rows, read by hand)

These rows were read by hand: 1:1 (core), 1:2, 1:5, 1:9, 1:11, 1:17, 1:21, 2:2, 2:3, 2:12, 2:15, 2:22, 3:1, 3:13 (core), 3:14, 4:2, 4:5, 4:12, 4:13, 5:3, 5:6, 6:6, 6:8, 6:10, 7:6, 7:9, 8:12, 8:13 (core), 8:17, 9:6, 9:17, 9:23, 9:27 and 10:3.

**All have the right counterpart.** Several are boundary-overlapping but still principally the recorded verse:
- ESG 1:17 lacks Hebrew 1:17's "contempt for their husbands", which moves to ESG 1:18.
- ESG 9:27 ends with "a memorial kept in every generation, city, family, and province", which is Hebrew 9:28a.

The bag-of-words neighbour test flagged some of these because the Greek is shorter or reuses stock phrases: 6:7 "the man whom the king wishes to honor", and 5:3/5:6 "What is your request". Reading shows no misplacement.

## Defects

### Blocking

**B1. ESG 5:1–2 (Addition D) cannot be handled safely by a consumer following the README.**
- **The data.** Both rows are `kind: "hebrew-tradition-counterpart"`. They have no `additionSpans`, only a free-text `unbracketedGreekExpansion` and `review: "check-by-hand"`.
- **What the README says.** Recommendation bullet 1 says: for `hebrew-tradition-counterpart*` rows, use `hebrewRef` and the recorded locations. Bullet 3 says a partial selection "inside an embedded addition span (… 5:1–2) must never project". No span exists for 5:1–2, so a consumer cannot test bullet 3.
- **The failure.** A consumer keyed on `kind` projects a highlight of "But God changed the spirit of the king to gentleness…" (ESG 5:1) or of Esther's speech "I saw you, my lord, as an angel of God" (ESG 5:2) onto Esther 5:1 / 5:2 in web-en (ch 431 para 0), kjv-en and BSB. Those are passages that do not contain that text. Since about 90% of each verse is addition, this is the likely case, not an edge case.
- **Exact fix** (hebrewRef and locations unchanged):
  - `ESG.5.1` and `ESG.5.2`: set `"kind": "hebrew-tradition-counterpart-with-unbracketed-addition"` and add `"projection": "whole-verse-only"` (or `"partialSelection": "unmapped"`). This makes them fail an exact-match `kind == "hebrew-tradition-counterpart"` test, and anything keyed on the suffix must read the new field.
  - `summary.versesWithEmbeddedAddition` for ESG: add `ESG.5.1` and `ESG.5.2`, or add a separate `versesWithUnbracketedAddition: ["ESG.5.1","ESG.5.2"]`.
  - README, Recommendation bullet 3: replace it with "ESG 1:1, 3:13, 8:13: a selection lying wholly inside `additionSpans` returns unmapped. ESG 5:1–2 have no reliable span: only a whole-verse position or whole-verse selection may project to Esther 5:1 / 5:2. Any partial selection in ESG 5:1–2 returns unmapped."

### Should-fix

**S1. The map's top-level `note` is false for ESG.** It says rows are paired "by monotonic similarity alignment. Equal numbers are never assumed…". In fact ESG pairs are built purely from equal chapter:verse numbers (`passage_map.py`: `h = hcode + "." + r.split(".",1)[1]`) and then scored. The README (line 85) describes this honestly, but the JSON consumers read does not.
- Replacement `note`: "Correspondence, not identity. DAG rows pair each verse with the best Hebrew-tradition verse by monotonic similarity alignment against WEB Updated DAN. ESG rows record the source introduction's claim that ESG numbering follows the Hebrew verse numbers outside the additions; that claim is measured (scores), flagged where weak, and was checked by hand in review/esther-daniel-map.md. It is not assumed from number equality alone. Offsets are UTF-16, end-exclusive, within the verse text in verse-text.json."

**S2. The `passage_map.py` docstring misstates the method.** Step 2 says "Every ESG/DAG verse is aligned … by a monotonic similarity alignment", which is true only for DAG. Step 3 says "The same alignment is run against Tinct's live … editions", which is false: live locations are looked up by `hebrewRef` after a per-chapter count comparison, then scored. The fix is to reword both steps to match the code.

**S3. README line 99 gives the wrong count.** It says "**18** ESG verses are flagged `divergent-greek-wording-check-by-hand`". The map has **17**. With 5:1–2 the total is 19 (`summary.flaggedForReview` has 19 entries). Change "18" to "17".

**S4. The README cites a review that does not exist.** Line 11 ("Independent review: see REVIEW.md") and line 99 ("The independent review checked them by hand; see REVIEW.md") point to a `REVIEW.md` that is not in the package. Point both at `review/esther-daniel-map.md`, or create REVIEW.md, before publishing.

### Notes (non-blocking)

- **N1.** README says "Before any lookup by reference, `passage_map.py` checks that the chapter verse counts … equal". The script records the booleans (`hebrewVersificationEqualsBsb/Live`) but does not abort when they are false. Make it `sys.exit` on mismatch, or say "records".
- **N2.** README and the script say "the source footnote at 3:24". In `notes.json` that footnote is keyed `DAG.3.23`; its internal `\fr` is 3:24. A consumer looking up `DAG.3.24` will not find it.
- **N3.** Boundary overlaps in rows marked `ok` or flagged: ESG 1:18 (+Hebrew 1:17b), 9:16 (+9:17a), 9:27 (+9:28a) and 10:2 (Mordecai clause missing). Verse-level projection still lands on the principal counterpart. The README's suggestion of chapter-level projection for Esther remains the safer default for highlights. Optionally add `"boundaryNote"` to those rows.
- **N4.** The README gives only the ESG/DAG → 66-book direction. For the reverse direction, `hebrewRef` is unique across rows (164 ESG, 357 DAG; checked), so a reverse lookup is well defined. A reverse partial selection into ESG 1:1, 3:13, 8:13 or 5:1–2 cannot be offset-mapped and should land on the whole verse. For reading positions (not highlights) on addition verses, "unmapped" should fall back to the nearest preceding counterpart (for example ESG 4:18–47 → Esther 4:17, ESG 10:4–14 → Esther 10:3, DAG 3:24–90 → Daniel 3:23), per the "never lose reading position" rule. This belongs in the integration spec.
- **N5.** README table, Addition E: the introduction also lists "8:12" among the "really long" verses, but the long verse in the markup is 8:13. That is consistent with what the table says; it could be quoted for completeness.

## Numbering statements in the README: checks

All of the following are accurate:
- 205/530 verses; 357 DAN verses all paired; 173 DAG addition verses; 164 ESG counterparts.
- Hebrew Esther 4 ends at 17 and 10 ends at 3; Addition C is 30 verses (4:18–47) and Addition F is 11 verses (10:4–14).
- ESG has no 4:6, 9:5 or 9:30.
- DAG 3:91–97 = Daniel 3:24–30, and "DAG 3:24 is not Daniel 3:24".
- The introduction's "after 4:17 / 8:12 / 10:3" against the markup; Addition D unbracketed at 5:1–2.
- The Addition A–F placements.

Apart from S1 and S2, which are method descriptions and not claims of identity, nothing in the README or map equates equal numbers with identity. The README states the opposite explicitly at lines 67, 80, 85 and 97.

Verdict: REJECT
