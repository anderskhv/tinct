# Batch J Fidelity Check — Notes (chapters 212–233, excl. 222/231)

Method: every paragraph of the Maude source was read against the current
modern-en paragraph for all 20 chapters, in full, sentence by sentence.
Two genuine fidelity defects were found (in 2 of the 20 chapters); the
other 18 chapters are sound as-is. No paragraph merges/splits/drops/adds
were made; only the two flagged sentences were corrected in place.

## Paragraph-count verification (script-checked)

| # | Title | Source paragraphs | Corrected paragraphs | Match |
|---|---|---|---|---|
| 212 | Book Ten (1812) — Chapter 22 | 47 | 47 | ✅ |
| 213 | Book Ten (1812) — Chapter 23 | 10 | 10 | ✅ |
| 214 | Book Ten (1812) — Chapter 24 | 16 | 16 | ✅ |
| 215 | Book Ten (1812) — Chapter 25 | 54 | 54 | ✅ |
| 216 | Book Ten (1812) — Chapter 26 | 40 | 40 | ✅ |
| 217 | Book Ten (1812) — Chapter 27 | 28 | 28 | ✅ |
| 218 | Book Ten (1812) — Chapter 28 | 11 | 11 | ✅ |
| 219 | Book Ten (1812) — Chapter 29 | 35 | 35 | ✅ |
| 220 | Book Ten (1812) — Chapter 30 | 20 | 20 | ✅ |
| 221 | Book Ten (1812) — Chapter 31 | 89 | 89 | ✅ |
| 223 | Book Ten (1812) — Chapter 33 | 12 | 12 | ✅ |
| 224 | Book Ten (1812) — Chapter 34 | 43 | 43 | ✅ |
| 225 | Book Ten (1812) — Chapter 35 | 40 | 40 | ✅ |
| 226 | Book Ten (1812) — Chapter 36 | 28 | 28 | ✅ |
| 227 | Book Ten (1812) — Chapter 37 | 21 | 21 | ✅ |
| 228 | Book Ten (1812) — Chapter 38 | 19 | 19 | ✅ |
| 229 | Book Eleven (1812) — Chapter 39 | 8 | 8 | ✅ |
| 230 | Book Eleven (1812) — Chapter 1 | 17 | 17 | ✅ |
| 232 | Book Eleven (1812) — Chapter 3 | 7 | 7 | ✅ |
| 233 | Book Eleven (1812) — Chapter 4 | 19 | 19 | ✅ |

(Verified programmatically with `json.load` + per-chapter `len(paragraphs)`
comparison against the source file; all 20 chapters match exactly.)

---

## Chapter-by-chapter findings

### 212 — Book Ten, Chapter 22 — SOUND
Kutuzov's review, Boris Drubetskoy, Dolokhov's reconciliation with Pierre.
Close read against source; all dialogue, character motives, and sequence
of events match. No defects. (Minor patronymic-form differences, e.g.
"Kirilych" vs. source "Kirílovich," are stylistic transliteration choices,
not fidelity errors, and are outside the normalized-name list.)

### 213 — Book Ten, Chapter 23 — SOUND
Bennigsen's ride along the line, the hare in the birch wood, the ambush
troops behind the hill. Matches source throughout, including the closing
point that Bennigsen (not Kutuzov) moved the ambush troops without
authorization — preserved correctly, no inversion.

### 214 — Book Ten, Chapter 24 — DEFECTIVE (1 fix)
**Defect (factual/plot distortion — wrong unit type):** Source describes
Timokhin as "formerly Dólokhov's **squadron** commander" (a cavalry
sub-unit), now a battalion commander due to officer shortages. The
modern-en rendered this as "formerly Dolokhov's **company** commander,"
which changes his prior command from a cavalry unit to an infantry one —
a factual distortion of a character's military background.
- Source: "The red-nosed Captain Timókhin, formerly Dólokhov's squadron commander, but now from lack of officers a battalion commander..."
- Candidate (before fix): "The red-nosed Captain Timokhin, formerly Dolokhov's **company** commander, but now, due to the shortage of officers, a battalion commander..."
- Fix applied: "company commander" → "**squadron** commander."

Rest of the chapter (Prince Andrew's eve-of-battle meditation, Pierre's
arrival) is otherwise faithful.

### 215 — Book Ten, Chapter 25 — SOUND
The long Pierre/Andrew/Timokhin dialogue on Barclay, chess, the German
staff officers, prisoners, and the meaning of war, plus the Natasha
memory. Checked line by line; all claims, examples, and rhetorical turns
(including the "left flank weak, right flank overextended" summary and
the "off flank / off wing" mentions) are preserved without inversion.
No defects.

### 216 — Book Ten, Chapter 26 — SOUND
Napoleon's toilette, M. de Beausset, the King of Rome portrait, the
proclamation. All details (Fabvier from Madrid, the Eau de Cologne valet,
the proclamation text, "Take him away!") match the source. No defects.

### 217 — Book Ten, Chapter 27 — SOUND
Napoleon's dispositions for the battle, quoted in full including the gun
counts (24 + 30 + 8 = 62; 16 howitzers; 40 guns; 102 guns total). All
numbers and the four numbered orders match the source exactly, as does
the analysis of why none of them could be carried out. No defects.

### 218 — Book Ten, Chapter 28 — SOUND
The "Napoleon's cold" historiographical digression, including the
St. Bartholomew's Day analogy and Voltaire reference. Matches source,
including the source's own internal date inconsistency (24th vs. 26th of
August), which is preserved faithfully rather than "corrected" — this is
Tolstoy's own text, not a translation error. No defects.

### 219 — Book Ten, Chapter 29 — SOUND
Napoleon and Rapp before the battle, the chessboard remark, the medicine
monologue, "the wine is drawn and must be drunk." All matches. No defects.

### 220 — Book Ten, Chapter 30 — SOUND
Pierre wakes, rides to the knoll, the panorama of smoke and cannon fire.
Descriptive passage checked closely for dropped imagery — nothing
omitted. No defects.

### 221 — Book Ten, Chapter 31 — DEFECTIVE (1 fix)
**Defect (factual distortion — reversed direction):** In period
horsemanship terminology, the "off" side of a horse is its right side (the
"near" side is the left, where a rider mounts). Source: the adjutant's
horse was wounded "in the off foreleg" — i.e., the *right* foreleg. The
modern-en rendered this as "the **left** foreleg," reversing the actual
side of the wound.
- Source: "‘Why... she’s wounded!’ said the adjutant. ‘In the off foreleg above the knee. A bullet, no doubt...’"
- Candidate (before fix): "‘She's been wounded!’ said the adjutant. ‘In the **left** foreleg above the knee...’"
- Fix applied: "left foreleg" → "**right** foreleg" (plain-English equivalent of "off foreleg").

Rest of this long chapter (Pierre's ride into the battle, the Raevsky
Redoubt battery scenes, the wounded young officer, the ammunition-wagon
explosion) checked in full and is faithful — no other defects.

### 223 — Book Ten, Chapter 33 — SOUND
The historiographic account of the main action between Borodino and
Bagration's fortifications, the false/outdated adjutant reports. Matches
source in full, including the Davout-reported-killed/actually-alive
detail. No defects.

### 224 — Book Ten, Chapter 34 — SOUND
Napoleon's reserves, Belliard, Berthier, the de Beausset lunch exchange,
Napoleon's dawning dread, the refusal to commit the Guard. All matches,
including "at eight hundred leagues from France, I will not have my
Guard destroyed." No defects.

### 225 — Book Ten, Chapter 35 — SOUND
Kutuzov's command style, the Wolzogen confrontation, Raevsky, the order
to attack the next day. Checked closely, including the "spirit of the
army" passage and the false-but-effective rumor mechanism. No defects.

### 226 — Book Ten, Chapter 36 — SOUND
Prince Andrew's regiment under bombardment, the men's coping rituals, the
shell that wounds him. All details preserved (the little dog, the trace
horse, "It's shameful, sir!", the wound to his abdomen). No defects.

### 227 — Book Ten, Chapter 37 — SOUND
The dressing station, the amputations, the recognition of Anatole
Kuragin, and Prince Andrew's realization about love and compassion.
Checked in full; no omissions or inversions found. No defects.

### 228 — Book Ten, Chapter 38 — SOUND
Napoleon's private despair, the long quoted St. Helena memoir passage
(with all its figures — 400,000 across the Vistula, 140,000
French-speakers, 50,000 French losses, etc.). All numbers and quoted text
match the source precisely. No defects.

### 229 — Book Eleven, Chapter 39 — SOUND
The aftermath across the field, the "moral victory" analysis, the
half-army-lost figures on both sides. Matches source, including the
capitalized "ONE HALF" / "HALF" emphasis preserved as in the source. No
defects.

### 230 — Book Eleven, Chapter 1 — SOUND
The Achilles-and-the-tortoise / calculus-of-history essay chapter.
Checked closely for any softened or inverted philosophical claims — none
found; the argument's structure and each example (the clock, the
locomotive, the oak buds) match the source's logic exactly. No defects.

### 232 — Book Eleven, Chapter 3 — SOUND
Kutuzov on Poklonny Hill, the council-of-war atmosphere, Bennigsen's
motives, Kutuzov's internal anguish over abandoning Moscow. Matches
source in full. No defects.

### 233 — Book Eleven, Chapter 4 — SOUND
The Council of Fili: Malasha's-eye view, Barclay, Bennigsen's proposal,
Kutuzov's Friedland rebuttal, and the final order to retreat ("I order a
retreat... They shall eat horseflesh yet, like the Turks!"). Checked in
full; all figures, quotes, and character positions match. No defects.

---

## Summary

- **Chapters checked:** 20
- **Sound (no changes):** 18 — 212, 213, 215, 216, 217, 218, 219, 220,
  223, 224, 225, 226, 227, 228, 229, 230, 232, 233
- **Defective (fixed):** 2 — 214, 221
- **Character-name normalization:** already compliant (Andrew, Kutuzov,
  Mary, no accents) throughout; no changes needed on that front.
- **Paragraph counts:** verified identical to source for all 20 chapters
  (table above).
