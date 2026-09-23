# Book 18 — independent fidelity review (b18-draft.json)

**Verdict: BLOCKING FINDINGS.** There are 7 findings: 1 blocking and 6 non-blocking. They are in `b18-fidelity.json`, written by `fid18_write.py`, which checked that every `old` string is exact and unique in its paragraph. Applying all 7 findings to the draft runs cleanly.

I read all **41 of 41** paragraph pairs against `source-book18.json` (Butler, PG #1727), in packets of 6 to 8 with the neighbouring paragraphs and the live baseline alongside. I then re-read the whole Book for continuity. `b18-draft.json` is byte-identical to `book18/candidate-v1.json`. I compared recurring phrasing with accepted Book 16 (`candidate-accepted.json`), and checked the formulas against the GLOSSARY rows and accepted Books 4, 6, 10, 11, 13 and 15.

## Blocking finding
| ¶ | Draft | Butler | Fix |
|---|---|---|---|
| 13 | "May heaven send you home safely before you meet him when he comes," | "may heaven send you home quietly first that you may not meet with him in the day of his coming" | "May heaven send you home quietly first, so that you won't meet him on the day he comes," The draft loses the negation. Butler's wish is that Amphinomus not meet Odysseus at all, but "before you meet him" assumes that the meeting will happen. This is the warning the paragraph exists to give, and ¶14 shows it failing. The draft also has "safely" for "quietly". This paragraph was also repaired. |

## Non-blocking findings
- ¶9 "forced him forward" drops Butler's "girded him by force". The girding is the parallel to ¶8, where Odysseus girds his rags.
- ¶11 "insufferable" is printed for Butler's "insatiable tramp". Butler's word is about greed, which ties back to the ¶0 glutton.
- ¶13 "a decent person" is printed for "a considerable person". Butler means a person of standing, not a morally decent one.
- ¶22 "as helpless as Irus" is printed for "as limp as Irus". It generalizes a concrete image.
- ¶27 "beautifully embroidered" is printed for "most exquisitely embroidered". The repair also leaves "beautifully" twice in one sentence, where Butler uses two different words.
- ¶36 "jokes" is printed for "gibes". It softens the insult, and ¶34 renders the same word "mock".

## Counts claimed by the drafter, checked
I diffed the draft against `live-baseline-book18.json` with quote typography normalized. **Exactly 20 paragraphs differ, and they are the 20 claimed:** ¶0, 2, 3, 8, 10, 11, 13, 15, 17, 18, 19, 20, 21, 22, 23, 24, 27, 31, 36, 37. The 2 CONVENTIONS paragraphs (¶1, ¶9) and the 19 KEPT paragraphs are identical to live apart from typography. 20 + 2 + 19 = 41. The labels accurately describe what changed. They are not a verdict on fidelity. Only 1 of the 7 findings is in a paragraph the drafter did not change (¶9, labelled CONVENTIONS). The other 6 are in repaired paragraphs (¶11, 13 ×2, 22, 27, 36): each keeps a wording from live that the repairs did not touch, and at ¶27 the repair introduced the doubled "beautifully".

## The requested checks against Butler
| Item | Result |
|---|---|
| Achaeans / Argives restored (¶10, 18, 19, 23, 24) | **CORRECT.** Each matches Butler: Achaeans at ¶10, 18, 19 and 23 ("all the Achaeans in Iasian Argos"), and Argives at ¶24 ("when the Argives set sail for Troy"). Both names are in "Names that change in no Book". No "Greek" is left in the draft. |
| gallery (¶11, 17, 20, 37) | **CORRECT.** Butler has "cloisters" / "cloister" / "roof of the cloister" / "covered cloister". Per the GLOSSARY row these become "gallery", and at ¶37 "covered gallery" (as in B10-P39, B11-P27, B13-P0). ¶20 now matches accepted **B16-P37** word for word ("she stood by one of the pillars supporting the roof of the gallery, holding a veil before her face"). No cloister or colonnade survives. |
| oxen (¶24, ¶36) | **CORRECT.** Butler: "they usually bring oxen and sheep" and "a yoke of tawny oxen". This follows the GLOSSARY "oxen, never cattle" row, and no "cattle" is left in the draft. |
| suppliant (¶21) | **CORRECT.** Butler: "while a suppliant in our house". It matches B15-P22, B16-P8 and B16-P38. |
| "propriety" echo (¶21 → ¶22) | **CORRECT.** Butler: "you had a greater sense of propriety" and then "I cannot, however, behave with perfect propriety at all times". The draft prints both, so Telemachus's echo of his mother is restored. |
| "vainest" (¶13) | **CORRECT.** Butler: "Man is the vainest of all creatures". "without vain glory" is kept as "without vanity", so the bracketing echo holds. |
| concrete details | **CORRECT**, all Butler's: ¶8 "such a thigh"; ¶18 "whiter than sawn ivory"; ¶23 "Iasian Argos"; ¶24 "took my right wrist in his hand" and "cuts me to the very heart"; ¶27 "twelve beautifully made brooch pins of pure gold" → "brooches of pure gold"; ¶36 "tawny", "upon my temples", "think yourself a great man"; ¶3 "a good mind to", "so many boar's tusks". |
| "share his bed" (¶20) | **CORRECT.** Butler: "each one prayed he might win her for his own bed fellow". The earlier "as his wife" had laundered it. "dignified" for "staid" is also correct. |
| "wretch" and "club" (¶31) | **CORRECT.** Butler: "Poor wretch" and "cudgel you about the head". "club" is the plain verb for a weapon-blow. Eurymachus's "You wretch" at ¶37 is kept as well. |
| "thought of another matter" (¶18) | **CORRECT.** Butler: "Minerva bethought her of another matter". It matches the GLOSSARY row and accepted Book 4 ("Then Athena thought of another matter") and Book 6. The "On this" → "At this" at ¶18 is also correct. |
| "suitors" for "wooers" (¶22) | **CORRECT, on precedent.** Butler: "these wooers of yours". Accepted **B15-P42** renders Butler's "most persistent wooer" as "most persistent suitor", and this is the only "wooer" in Book 18. The notes' claim that Butler uses it "in the same breath as 'suitors'" does not fit ¶22, but the precedent holds. |
| ¶10 "thought it best" | **CORRECT.** Butler: "he deemed it best". It matches the B05/B06 formula row. |
| ¶19 "die so sweetly" | **CORRECT.** Butler: "let me die so sweetly". |

## The nested quotation at ¶24
**CORRECT.** Butler: "he took my right wrist in his hand—'Wife,' he said, 'we shall not all of us come safe home … then marry whom you will, and leave this your present home.' This is what he said". In the draft, the quotation opens with `‘Wife,’` and reopens with `he said, ‘not all of us`. It closes with `leave this house.’` before `This is what he said`. All three single quotes are the correct curly glyphs, and the per-paragraph counts of “ ” ‘ match the source. The draft replaces Butler's dash before 'Wife' with a full stop, which introduces no new mark and is acceptable. "leave this your present home" → "leave this house" keeps the sense. The embedded speech's content is complete: the Trojans' bow, spear and chariots, the uncertainty about his return, the care of his parents, and the beard as the signal to remarry.

## Continuity and conventions
- There is no unclosed quotation at any paragraph break in either the source or the draft. The quote-glyph parity check shows no mismatch in any paragraph. There are no ASCII quotes, and no British spellings among those checked (colour, honour, favour, neighbour, grey).
- The Greek-name mapping is complete: no Ulysses, Minerva, Jove, Venus or Diana survives. Ops and Arete do not occur in this Book. The title maps Ulysses → Odysseus twice.
- The class-B bracket at ¶9 ("into the open part of the court") is handled correctly: the mark is dropped and the words kept.
- Recurring phrasing is consistent with Book 16: "Eurymachus, son of Polybus", "Queen Penelope, daughter of Icarius" (¶23, ¶26), "Amphinomus, son of Nisus" (the ¶39 chain), "insolent and cruel", and "At this" for "On this" (¶18, ¶38). ¶37's "Has the wine gone to your head, or do you always babble…" repeats ¶31, just as Butler repeats the line.
- Butler's `whereon` at ¶18 and ¶40 is rendered "and" / a new sentence. That is inconsistent with the Book 4 "at that" row, but accepted Books 14–16 render it the same mixed way, so I have not raised it as a finding.
