# War and Peace — Early-Flags Repair Notes (Chapters 6, 26, 29, 45, 52, 53, 94, 102)

Close-read of all 8 chapters flagged by the mechanical word-ratio scan, paragraph by
paragraph against the Maude source. Verdict per chapter below, followed by a
script-verified paragraph-count table.

## Chapter 6 — Book One (1805), Chapter 6

**Sound. False positive, no changes.**

Full paragraph-by-paragraph comparison found no dropped content, invented content,
inversions, or wrong-attribution errors. Compression is normal modernization (Victorian
sentence-splitting, tightened dialogue tags). Character names already normalized (Pierre,
Prince Andrew, Anna Pavlovna). The bracketed `[Speaking in French]` tags on Lise's and the
vicomte's lines are a deliberate, consistently applied device marking passages Tolstoy
wrote in French in the original (also used the same way in Chapter 26) — not broken
placeholder text, so left as-is.

## Chapter 26 — Book One (1805), Chapter 26

**Defective — fixed.**

- **Defect:** Systematic old-style name spelling. The modern-en text used "Prince Andrei"
  throughout instead of the project's normalized "Prince Andrew" (e.g. "Prince Andrei
  stepped out, helped his small wife down..."; "'Oh, Andrei—I didn't even see you.'";
  "Prince Andrei, seeing his father wouldn't let it go, began reluctantly..."). Source uses
  "Prince Andrew" throughout (per the already-normalized project convention used correctly
  in every other flagged chapter, e.g. Chapter 45, 52, 53).
  **Fix:** Replaced all 16 paragraphs containing "Andrei" with "Andrew" (word-boundary
  replace, including possessive "Andrei's" → "Andrew's"), including inside dialogue
  ("'So you're really going to the war, Andrei?'" → "...Andrew?").
- Content otherwise faithful: numeric details (troop counts: 90,000 / 220,000 Austrians +
  100,000 Russians / 50,000 + 50,000 at Naples / 500,000 total) all preserved correctly, no
  omissions found in the long campaign-plan paragraph or elsewhere. The French
  song-and-footnote structure (Marlborough couplet + translation footnote) is preserved
  intact.

## Chapter 29 — Book Two (1805), Chapter 1

**Defective — fixed.**

- **Defect:** Wrong chapter title. Modern-en file had "Book Two (1805) — Chapter 2"; source
  is "Book Two (1805) — Chapter 1." This is a factual/structural error (misnumbered
  chapter), not a translation issue.
  **Fix:** Corrected title to "Book Two (1805) — Chapter 1" to match source.
- Content otherwise sound: full inspection scene, Dolokhov/regimental-commander
  confrontation, and dialogue all check out faithfully against source, including the
  "degraded into a field marshal, or into a soldier" sarcasm, which is preserved with
  equivalent meaning ("demoted to field marshal, or to private"). Kutuzov spelling already
  correctly normalized (no accent).

## Chapter 45 — Book Two (1805), Chapter 17

**Sound. False positive, no changes.**

Full comparison of the battle/Bagration/Tushin's-battery scene found no dropped content,
invented dialogue, or inversions. All described actions (Bagration's tact, the dragoon
retreat, the accountant's naive questions, the Cossack's death) match source precisely.
Names already normalized (Bagration, Tushin, Zherkov — no accents, consistent with
project style).

## Chapter 52 — Book Three (1805), Chapter 3

**Defective — fixed (minor).**

- **Defect:** Dropped given name in the chapter's opening sentence. Source: "Old Prince
  **Nicholas** Bolkónski received a letter..." Modern-en: "Old Prince Bolkonsky received a
  letter..." — the character's first name (explicitly part of the project's normalized
  name list) was omitted at his introduction in this chapter.
  **Fix:** Restored to "Old Prince Nicholas Bolkonsky received a letter..." Left later
  "Prince Bolkonsky" references unchanged, matching source's own later usage pattern.
- Content otherwise sound and complete, including the full Princess Mary prayer/spiritual
  reflection paragraph at the chapter's end (a long passage that would be an easy place to
  drop material — it is intact and faithfully rendered) and Alpatych/old-prince confrontation
  scene.

## Chapter 53 — Book Three (1805), Chapter 4

**Sound. False positive, no changes.**

Long chapter (Anatole's introduction, the foot-touching scene under the clavichord,
Mademoiselle Bourienne's fantasy, the old prince's inner monologue about marrying off Mary)
checked paragraph by paragraph. All plot beats, including the potentially awkward detail
of Anatole touching Bourienne's foot under the piano while appearing to look at Mary, are
preserved faithfully — nothing softened or dropped. Two footnote-marker asterisks ("*
Anna Pavlovna." / "* The little one is charming.") are dropped from the modern-en
formatting versus source, but the footnote content itself is present as its own paragraph
in both files — this is a trivial formatting inconsistency with the asterisk convention
still used correctly in Chapter 26, not a content-fidelity defect, so left unchanged.

## Chapter 94 — Book Five (1806-07), Chapter 10

**Sound. False positive, no changes.**

Pierre's estate-management chapter, including all specific ruble figures in his budget
(80,000 / 30,000 / 15,000 / 150,000 / 70,000 / 10,000 / 100,000) and the steward's
deceptions (the chapel built by the richest peasants while nine-tenths of the village was
impoverished; the "third reduced on paper, half increased in practice" manorial-labor
fraction), all check out exactly against source. Nothing dropped, inverted, or invented.

## Chapter 102 — Book Five (1806-07), Chapter 18

**Defective — fixed.**

- **Defect:** Denisov's signature speech impediment (his inability to pronounce "r",
  rendered by Tolstoy as "w" — e.g. "Wostóv," "Empewo'," "wobber," "bwinging," "afwaid,"
  "countwy," "honowably," "degwaded," "w'iting," "stwaight," "Tweasuwy," "gwovel") was
  silently normalized away in the modern-en text in his two speaking passages, removing a
  defining characterization trait that is a recurring device throughout the whole novel
  (other characters reference his stutter directly elsewhere in the book).
  **Fix:** Restored the stutter in Denisov's two lines:
  - Greeting: "Rostov! How are you?" → "Wostov! How are you, how are you?"
  - Rant about the petition: "Me — petition the Emperor!... If I were a robber... bringing
    robbers to justice... not afraid of anyone... my country honorably... And they want to
    demote me?... I'm writing to them straight... If I had robbed the Treasury..." →
    "Me — petition the Empewo'!... If I were a wobber... bwinging wobbers to justice... not
    afwaid of anyone... my countwy honowably... And am I to be degwaded?... I'm w'iting to
    them stwaight... If I had wobbed the Tweasuwy..." (also "Let them try me" → "Let them
    twy me").
  - "Haven't I said I'm not going to grovel?" → "...gwovel?"
  Note: "And they want to demote me?" was also changed back to "And am I to be degwaded?"
  to match source phrasing directly (the modern paraphrase had swapped in a word with no
  "r," which is why the stutter had nowhere to land).
- Content otherwise sound: hospital ward description, Tushin's cameo, the Uhlan's advice,
  and the petition mechanics all check out faithfully against source.

## Paragraph-count verification (script-verified)

| Chapter | Title | Source paragraphs | Corrected paragraphs | Match |
|---|---|---|---|---|
| 6 | Book One (1805) — Chapter 6 | 43 | 43 | OK |
| 26 | Book One (1805) — Chapter 26 | 50 | 50 | OK |
| 29 | Book Two (1805) — Chapter 1 | 39 | 39 | OK |
| 45 | Book Two (1805) — Chapter 17 | 25 | 25 | OK |
| 52 | Book Three (1805) — Chapter 3 | 71 | 71 | OK |
| 53 | Book Three (1805) — Chapter 4 | 54 | 54 | OK |
| 94 | Book Five (1806-07) — Chapter 10 | 19 | 19 | OK |
| 102 | Book Five (1806-07) — Chapter 18 | 20 | 20 | OK |

Verified with:
```python
import json
data = json.load(open('early-flags-corrected.json', encoding='utf-8'))
src = json.load(open('early-flags-source.json', encoding='utf-8'))
for ch, s in zip(data, src):
    assert ch['number'] == s['number'] and len(ch['paragraphs']) == len(s['paragraphs'])
```
All 8 chapters passed. `early-flags-corrected.json` is valid JSON
(`python3 -m json.tool` clean).

## Summary

- **Sound (false positives, unchanged):** Chapters 6, 45, 53, 94 — four of eight flagged
  chapters had no genuine defects; the ratio flag was a false positive (normal
  modernization compression).
- **Defective (fixed):** Chapters 26, 29, 52, 102 — four had genuine, fixable defects: a
  systematic Andrei→Andrew name-normalization miss (26), a mislabeled chapter number (29),
  a dropped given name at a character's introduction (52), and a silently normalized-away
  character speech impediment that erases a recurring characterization device (102).
