# Book 13 — independent fidelity review (b13-draft.json)

**Verdict: BLOCKING FINDINGS**. 20 findings: 7 blocking and 13 non-blocking. The findings are in `b13-fidelity.json`. Every `old` string was checked by script to be exact and unique in its paragraph.

I read all 38 of 38 paragraphs against `source-book13.json` (Butler, PG #1727) in packets of 5 to 11, with neighbouring paragraphs. I then re-read the whole Book for continuity. I compared its recurring phrasing with accepted Books 1–11 (the successors in `b12-accepted-list.txt`), with direct comparison against Books 10 and 11. `scripts/compound_drift.py` was run with the draft. `b13-draft.json` is byte-identical to `book13/candidate-v1.json`.

## The 14 repaired paragraphs, checked against Butler
The repaired paragraphs are 0, 2, 3, 5, 9, 12, 19, 20, 22, 26, 27, 31, 33 and 36, found by diffing against the live baseline. The notes number the ¶33 repair as "34". Every restored word is Butler's:

| Repair | Butler | Result |
|---|---|---|
| ¶0 "covered gallery" | "the covered cloister" | TRUE. Matches B01, B04, B10 and B11-P27. |
| ¶2 dawn formula | "When the child of morning, rosy-fingered Dawn, appeared" | TRUE. Matches the GLOSSARY Book 2 row and B10-P13. |
| ¶2 "for them", "fallow field", "a pair of oxen" | "a bull for them", "a fallow field with a couple of oxen" | TRUE. |
| ¶3 "Sir" | "Sir, and all of you, farewell" | TRUE. Matches the lowercase/initial "Sir" in B01–B11. |
| ¶3 "drink offerings" | "drink-offerings" | TRUE. D15 open form, as in B03, B04, B07–B11. |
| ¶3 "heaven grant" | "which heaven grant" | TRUE (hazard 5). |
| ¶5 "the double cup" | "the double cup" | TRUE. |
| ¶9 and ¶27 "merman" | "the old merman Phorcys" (both) | TRUE. The word order differs at ¶27 (non-blocking finding). |
| ¶12 "Lord of the Earthquake" | "O Lord of the Earthquake" (vocative, capital L) | TRUE. B03-P0's apposition is lowercase "lord". Butler capitalizes the vocative, so this is not a drift. |
| ¶19 "chastise" / "punishes" | "chastise them … punishes those who do wrong" | TRUE. |
| ¶20 "copper vessels", "javelin" | "goodly coppers", "held a javelin" | TRUE. |
| ¶22 "sir", "Achaean country" | "so, sir, …", "this Achaean country" | TRUE. |
| ¶26 "Achaeans" | "we Achaeans" | TRUE. |
| ¶31 "lording it" | "lording it **in** your house" | PARTLY. The draft has "over" (non-blocking finding, D29). |
| ¶33 "yellow hair", "fine eyes", "beechmast" | "yellow hair", "blear your fine eyes", "beechmast" | TRUE. |
| ¶36 "yellow hair", "thong" | "all his yellow hair", "a twisted thong" | TRUE. |

## Quotation structure
The structure matches Butler index for index. For every paragraph, the counts of “ and ”, whether the paragraph opens with “, and whether it ends with ” are the same in source and draft. The draft has no ‘, no ASCII ' or ", and no spaced em dashes. There is no unclosed quotation at a paragraph break. That is correct for Book 13, where PUNCTUATION §2 records a balance of 0. The comma-continuation at ¶29 is normalized under §3 without changing the pair count.

## Names and hazards
Name counts match the source in every case:

- Ulysses/Odysseus 19/19
- Minerva/Athena 14/14
- Jove/Zeus 11/11
- Neptune/Poseidon 7/7
- Arete 2/2
- Ops 0 and Rhea 0
- Phorcys 2
- Achaean 2, and "Greek" appears 0 times

The class-C bracket at ¶27 (PG 6016, fn 122) is dropped. All its words are kept, and no clause is recast across the boundary. The drafter's notes call this "¶32", which is wrong: it is ¶27. "heaven" is 4/4 only by coincidence. The draft drops ¶5's "that live in heaven" and adds "Good heavens" at ¶16.

## Blocking (7)
- **¶8 and ¶24**: "on the restless sea" should be "on the waves of the weary sea". Accepted B08-P13 prints this line with "weary", and the draft also drops "the waves of".
- **¶9**: "mixing bowls" should be "mixing-bowls". This is a D15 drift, and compound_drift fails on it.
- **¶10**: "ran halfway up onto the shore" loses Butler's measure, "half her own length".
- **¶36**: "a torn wallet" should be "a bag all in holes". Accepted B05 and B09 render "wallet" as "bag", and a listener hears "wallet" as a billfold.
- **¶27**: "persuasive, shrewd, and clever" softens Butler's "shifty".
- **¶27**: "constantly grieving" should be "grieving in vain". Butler's word is "vainly".

## Non-blocking (13)
- **¶3 and ¶19**: "safe passage" should be "an escort", the held word in every accepted Book and four times in this one.
- **¶5**: "that live in heaven" is dropped.
- **¶6**: "claim you" should be "lay their hands on you".
- **¶7**: "pierced" stone is dropped.
- **¶8**: "across the plain" should be "over the course".
- **¶9**: "fresh water always flows" adds detail.
- **¶20**: "loud-roaring sea" should be "sounding sea", as in B06-P15.
- **¶25**: "me, who has" should be "me, who have".
- **¶25**: "silently" is added.
- **¶27**: the merman word order should match ¶9.
- **¶31**: "over" should be "in", and "deal with" should be "lay hands on".

## Drafter-note errors (not findings against the text)
- **Paragraph numbers are off in several places.** The yellow hair / fine eyes / beechmast repair is at ¶33, not ¶34. "Bless my heart" is at ¶16, not ¶21. The bracket is at ¶27, not ¶32. The "¶38" and "¶33/28" references do not match the text.
- **"Book 8 not available" is false.** `book08/candidate-v2.json` is in the accepted list and fixes "the weary sea".
- **The ¶9 and ¶27 merman phrases are not rendered identically.** The notes say they are.
- **The quotation it gives as Butler's ¶0 text is not in the source.** Butler has "held their peace throughout the covered cloister". The notes quote a garbled "τ hushed to silence…".

## Cross-Book notes
- **Book 10 and Book 11.** The dawn formula, "noble son of Laertes", "covered gallery", "drink offering(s)" and "Sir" all agree with them. I saw no drift from Book 11 beyond the findings above.
- **Epithets checked against Books 3 and 8.** "Earth-encircling Poseidon" matches B08-P22. "Zeus's formidable daughter" matches B03-P29. "Zeus's daughter Athena" matches the GLOSSARY Book 3 row.
