# Independent review: wuthering-heights modern-da

Package: `books/wip/danish-2026-10-21-b/`, drafted on branch `claude/danish-1021-b`, reviewed on `claude/danish-1021-b-review`.
Candidate after this review: git blob `e71116938c37e760ae4f810ddda9596ed66ef751` (was `5ca7c60872188b3e9924fbcc17b4c4f494bfaa2a`).

**Verdict: ready after fixes.** The fixes below are applied in this branch. The meaning error rate (0.6 per 100 paragraphs) is well under the 3-per-100 threshold, and both narrators' voices come through. This book had the most errors of the three: a recurring English tag-question calque, »en halv snes« (ten) for "half a dozen" (four places), and some slips in De/du. These were fixed throughout the book by grep, not only in the sample. A full second pass is not needed. A native reader's spot check of Joseph's dialect would still be worthwhile (open question 3).

## Method

- Independent reviewer: a separate Claude session (not the drafter), 21 Oct 2026, reading in-conversation. No Anthropic API spend; no integration, merge or deploy.
- Source: `app/public/data/editions/wuthering-heights-modern-en.json` at origin/main; blob verified identical to `wuthering-heights-SOURCE-HASH.txt`.
- Read side by side, EN vs DA: the first and last chapter in full, plus a stratified random sample of the other chapters (seed `20261021-wuthering-heights`, at least 12% of the book's paragraphs, allocated per chapter in proportion to its length; within a chapter, weighted sampling without replacement, weight 1, +1 dialogue, +2 verse/line breaks, +1 over 120 words). Paragraph indices below are 0-based, as in the JSON.
- Whole-book checks: name and address-form greps for the main characters, quote marks (»…« and ›…‹, no straight or curly quotes), dash style, digits, leftover English, and pattern greps for errors found in the sample (tag-question calques, "I declare", "half a dozen", gender agreement).
- House style was checked against the live Danish editions (`a-little-princess`, `frankenstein`, `great-expectations`, `jane-eyre`, `pride-and-prejudice` modern-da): »…« with the comma inside, ›…‹ for inner quotes, straight `'` for elision and genitive, and a spaced em dash ` — ` (about 63,800 em dashes against 742 spaced en dashes across the live corpus). The candidates used a spaced en dash ` – `; this was normalised to `—` throughout.
- Severity: **meaning** = sense changed, dropped or added; **grammar** = wrong Danish grammar, agreement or address form (De/du) in context; **style** = correct but unidiomatic: calque, anglicism, clumsy word order, inconsistent naming. Rates are per 100 paragraphs read, counted before fixes, one count per distinct error.

## Paragraphs read (343 of 1,931, 17.8%)

- Chapter I in full (27) and chapter XXXIV in full (84).
- Random sample, 232 paragraphs (12.0% of the book):
  - ch2: 10, 18, 21, 25, 33, 38, 40, 63, 72, 82, 84, 86
  - ch3: 2, 3, 6, 13, 25, 32, 39, 41
  - ch4: 10, 14, 23, 27, 40
  - ch5: 7
  - ch6: 11, 13
  - ch7: 0, 2, 3, 6, 12, 40, 54, 58
  - ch8: 3, 16, 18, 23, 25, 27, 44, 50, 52
  - ch9: 5, 12, 14, 25, 29, 41, 59, 65, 68, 77, 79, 82, 95, 96, 109, 122
  - ch10: 6, 19, 20, 24, 30, 33, 36, 52, 74, 82, 86, 96, 97
  - ch11: 5, 6, 11, 13, 36, 52, 60, 61, 65
  - ch12: 3, 10, 12, 13, 19, 33, 34, 51, 56, 58, 81
  - ch13: 2, 5, 6, 12, 14, 22, 26, 56
  - ch14: 1, 4, 10, 17
  - ch15: 20, 23, 33, 34, 35, 41
  - ch16: 1, 10, 19
  - ch17: 6, 11, 17, 19, 25, 33, 46, 47, 58, 64, 70, 85
  - ch18: 0, 3, 20, 22, 23, 30, 35
  - ch19: 4, 6, 15, 28
  - ch20: 7, 13, 16, 26, 30, 32
  - ch21: 3, 5, 15, 28, 39, 46, 56, 61, 87, 97, 98, 103, 107, 109, 111
  - ch22: 17, 24, 29, 31
  - ch23: 17, 23, 24, 31, 32, 42, 43, 68, 69, 75
  - ch24: 2, 8, 9, 21, 27, 43, 45
  - ch25: 0, 1
  - ch26: 8, 15, 27, 30
  - ch27: 8, 24, 26, 29, 36, 58, 60, 63, 70, 72
  - ch28: 2, 13, 15, 23, 35
  - ch29: 12, 15, 19
  - ch30: 13, 18, 25, 26, 30
  - ch31: 5, 13, 18, 24, 37
  - ch32: 9, 15, 19, 26, 30, 43, 48, 55, 75, 79, 85
  - ch33: 0, 5, 16, 28, 35, 45, 51
- Context only (not counted): 2:79–2:81, 8:42–8:43, 27:7, 28:16–28:22, 23:11–23:13, 21:16–21:30, 22:20–22:28.

## Error rate in the sample, before fixes

| Severity | Count | Per 100 paragraphs |
|---|---|---|
| Meaning | 2 | 0.6 |
| Grammar | 10 | 2.9 |
| Style | 24 | 7.0 |

- Meaning: 10:97 »en halv snes nevøer« (ten) for "half a dozen nephews"; 9:109 »Takket være Himlen for alt!« means "because of Heaven", not "Thank Heaven for all!".
- Grammar: 1:24 »Hvis jeg var, ville jeg…« (English ellipsis); 7:54 »gøre ære« without »af«; 11:36 »behandlet dig helvedes« (adverb misuse, twice); 12:10 garbled »I alt, der har et følende hjertes navn«; 21:87 Nelly mixes »skam dig, dit« with her De to Cathy; 22:24 Heathcliff switches from De to »du« mid-paragraph; 24:8 »alt for mindet om« (not Danish); 27:63 Heathcliff addresses Cathy with De in a scene where he uses du before and after (27:58, 27:67), plus »det slags« for »den slags«; 28:23 Linton says De to Nelly (he says du to her elsewhere, e.g. 20:13); 30:18 »al sin egen løsøre« (neuter noun).
- Style: tag-question calques (10:52, 10:96, 13:26); »igen« for "in return" (1:12, 11:60); vocative »Catherine, kære!« / »Heathcliff, kære!« (8:50, 15:20); 1:0 »sted … sted«; 1:12 »forbehold« (false friend for "reserve"); 1:15 tangled »ved den modsatte ende af ildstedet af den«; 2:21 »Tilgiv mig endelig!«; 7:2 word order; 8:52; 10:19 »dalens top«; 12:51 »i samme øjeblik« for "this instant"; 13:12 »i gårdens brolagte gård«; 17:64 »en bordkniv fra bordet«; 21:28 »de to fætter og kusine«; 21:107; 23:69 »de unge år«; 24:9 »fortalt … nogen historie« for "told a story" (lied); 27:8 »fornemmelser« for "affectations"; 34:44 »frygter« as a plural noun; 34:63 »sønderrevne« overstates "broken skin".
- Found by whole-book grep outside the sample and fixed: »en halv snes« for "half a dozen" at 7:45, 11:55 and 31:19 (meaning); »det slags« at 24:39 and 29:20 (grammar); tag questions at 12:40, 14:14, 14:16, 17:45, 18:32, 21:80, 22:4, 26:12 and 31:32 (style).

## Review-log decisions (drafter's log, judged)

- Two narrators: accepted. Lockwood's pomposity (»En fuldkommen himmel for en menneskehader«) and Nelly's plain storytelling come through.
- Address forms: the plan is right (De between gentlefolk and from Nelly upward, du in the family and from Heathcliff downward), and a whole-book check shows it mostly held. Exceptions fixed: 21:87, 22:24, 27:63, 28:23. **Kept as found:** in chapter XXII Heathcliff addresses Cathy as »frøken Linton … De« throughout the roadside scene (22:20, 22:22, 22:24, 22:29), while he uses du in chapter XXI and from chapter XXVII on. A cold, ironic formality there is defensible, so I fixed only the mid-paragraph switch. See open question 2.
- Joseph's Yorkshire as light Jutlandish: accepted as a strategy; it reads well where used (»æ mark«, »æ herre«, »ka'«, »ta'«, »I/jer« to his master). It is applied unevenly: some long Joseph speeches (9:109) are plain standard Danish. Hareton's and Zillah's light »æ« is consistent with the log. Not changed; see open question 3.
- Names and places kept in English (Wuthering Heights, Thrushcross Grange/Grange, Heights, Gimmerton, Penistone Crags): accepted; grep shows the forms are consistent. Family plurals »Linton'erne/Earnshaw'erne« are consistent.
- Sermon and Bible references (»Halvfjerds gange syv«, »Du er manden!«, Modløshedens Sump): accepted.
- Units not converted (miles, fod, alen): accepted.

## Fixes made

| Ch:p | Before | After |
|---|---|---|
| 1:0 | Intet andet sted i England, tror jeg, kunne jeg have fundet et sted, der var så | Ingen andre steder i England, tror jeg, kunne jeg have valgt noget, der var så |
| 1:12 | at hans forbehold udspringer af | at hans tilbageholdenhed udspringer af |
| 1:12 | at blive elsket eller hadet igen. | at blive elsket eller hadet til gengæld. |
| 1:15 | Jeg satte mig ved den modsatte ende af ildstedet af den, min husvært gik hen til, | Jeg satte mig ved den ende af ildstedet, der lå over for den, min husvært gik hen til, |
| 1:24 | »Hvis jeg var, ville jeg have sat | »Var jeg det, ville jeg have sat |
| 2:21 | »Tilgiv mig endelig!« | »De må endelig tilgive mig!« |
| 7:2 | »Er Heathcliff her ikke?« | »Er Heathcliff ikke her?« |
| 7:45 | med en halv snes ord | med et halvt dusin ord |
| 7:54 | samle hele sin appetit om og gøre ære; | samle hele sin appetit om og gøre ære af; |
| 8:50 | »Catherine, kære! Catherine!« | »Kære Catherine! Catherine!« |
| 8:52 | som ingen kunne tage fejl af som spøg | som ingen kunne tage for spøg |
| 9:109 | Takket være Himlen for alt! | Gud ske lov for alt! |
| 10:19 | næsten op til dalens top | næsten op til dalens øverste ende |
| 10:52 | »Så kæmper vi til døden, gør vi ikke, Nelly?« | »Så kæmper vi til døden, ikke, Nelly?« |
| 10:96 | »Hun er sin brors arving, er hun ikke?« | »Hun er vel sin brors arving?« |
| 10:97 | »En halv snes nevøer | »Et halvt dusin nevøer |
| 11:36 | Jeg har behandlet dig helvedes, og du vil have hævn! | Jeg har behandlet dig djævelsk, og du vil have hævn! |
| 11:36 | Hvad har jeg gjort dig, der er helvedes?« | Hvad har jeg gjort dig, der er så djævelsk?« |
| 11:55 | en halv snes mænd | et halvt dusin mænd |
| 11:60 | at jeg ville anklage ham igen, | at jeg ville anklage ham til gengæld, |
| 12:10 | I alt, der har et følende hjertes navn, hvad har han | For alt, hvad der har et følende hjerte: Hvad har han |
| 12:40 | Joseph sidder længe oppe, gør han ikke? | Joseph sidder længe oppe, ikke? |
| 12:51 | Stille, i samme øjeblik! | Stille, på stedet! |
| 13:12 | da vi steg af i gårdens brolagte gård | da vi steg af på den brolagte gårdsplads |
| 13:26 | »Så han er kommet tilbage, er han?« | »Nå, så han er kommet tilbage?« |
| 14:14 | af dig, gør han ikke?« | af dig, ikke?« |
| 14:16 | Du har skrevet til ham, har du?« | Du har altså skrevet til ham?« |
| 15:20 | Heathcliff, kære! Det er ikke tid | Kære Heathcliff! Det er ikke tid |
| 17:45 | Så du konspirerer med ham mod mig, gør du, din hugorm? | Så du konspirerer altså med ham mod mig, din hugorm? |
| 17:64 | en bordkniv fra bordet | en kniv fra bordet |
| 18:32 | »Det er _din_ fars hus, er det ikke?« | »Det er _din_ fars hus, ikke?« |
| 21:28 | at de to fætter og kusine skal forelske sig i hinanden | at fætteren og kusinen skal forelske sig i hinanden |
| 21:80 | Du har ikke opført dig ordentligt, har du? | Du har ikke opført dig ordentligt, vel? |
| 21:87 | »Åh, skam dig, dit fjollede barn!« | »Åh, skam Dem, De fjollede barn!« |
| 21:107 | Pæn kærlighed, må jeg sige! | Køn kærlighed, må jeg sige! |
| 22:4 | gør den ikke, Ellen?« | ikke, Ellen?« |
| 22:24 | Gør det, så er du en skat! | Gør det, så er De en skat! |
| 23:69 | har kæmpet sig frem til de unge år | har kæmpet sig frem til sine teenageår |
| 24:8 | alt for mindet om hendes nylige venlighed | alt for optaget af tanken om hendes nylige venlighed |
| 24:8 | narre mig med en historie? | narre mig med en skrøne? |
| 24:9 | Jeg har ikke fortalt dig nogen historie. | Jeg har ikke fortalt dig nogen skrøne. |
| 24:39 | ›ikke noget af det slags‹ | ›ikke noget af den slags‹ |
| 26:12 | har det nogenlunde, vil du ikke?« | har det nogenlunde, vil du ikke nok?« |
| 27:7 | dine fornemmelser!« | dine nykker!« |
| 27:8 | »Mine fornemmelser!« | »Mine nykker!« |
| 28:23 | »Åh, det siger jeg ikke til _Dem_, hvor den er!« | »Åh, det siger jeg ikke til _dig_, hvor den er!« |
| 28:23 | Så, nu har De trættet mig. Gå Deres vej, gå Deres vej!« | Så, nu har du trættet mig. Gå din vej, gå din vej!« |
| 29:20 | noget af det slags, fru Dean | noget af den slags, fru Dean |
| 30:18 | al sin egen løsøre | alt sit eget løsøre |
| 31:19 | en halv snes bøger | et halvt dusin bøger |
| 31:32 | »Nå, virkelig! Træt af at være landflygtig fra verden, er De?« | »Nå, virkelig! Så De er træt af at være landflygtig fra verden?« |
| 34:44 | hundrede grundløse frygter | hundrede grundløse bange anelser |
| 34:63 | fra den sønderrevne hud | fra den skrabede hud |
| 27:63 | (De/Dem/Deres throughout) | du/dig/din throughout; "det slags" -> "den slags" |

Whole book: 433 x "–" -> "—" (house style)

## Gates re-run after fixes

- Alignment: 34 chapters, same numbers, 1,931 paragraphs, per-chapter counts equal to modern-en. PASS.
- Ratio per chapter 1.047–1.135 (window 0.85–1.25). PASS.
- English left: 0. No straight or curly double quotes. PASS.
- Emphasis parity: equal to modern-en in every paragraph.
- `books/danish-lint.py` (read-only wrapper, as for Alice): 55 STRAY-UNDERSCORE (intended `_emphasis_`; one fewer than before because 28:23 `_Dem_` became `_dig_`), 0 on every other check.

## Open questions for Anders

1. Policy: STRATEGY.md still says Danish is out of scope; integration needs it updated or your explicit go.
2. Heathcliff to Cathy in chapter XXII: keep the cold »frøken Linton … De«, or switch to du to match chapters XXI and XXVII–XXXIV?
3. Joseph's dialect is light and uneven. Do you want it stronger and consistent (another pass over all of Joseph's lines), lighter, or left as is? Ideally a native Jutlandic reader would check it.
4. Dash style: normalised to the live editions' spaced em dash (see the Alice review).

