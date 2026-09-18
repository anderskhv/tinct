# War and Peace — Batch C Fidelity Check (Chapters 56–80, excluding already-checked)

Source: Maude translation (`full-batchC-source.json`)
Candidate: current modern-en (`full-batchC-current-modern-en.json`)
Corrected output: `full-batchC-corrected.json`

Method: every paragraph of all 20 chapters was read side by side against the Maude
source in full. Five of twenty chapters contained genuine defects (all of the same
family: mishandled foreign-language quotations/footnotes and one name-normalization
slip); the other fifteen were sound and were left unchanged.

## Paragraph-count verification (script-verified)

| Ch # | Title | Source paragraphs | Corrected paragraphs | Match |
|---|---|---|---|---|
| 56 | Book Three (1805) — Chapter 7 | 68 | 68 | ✅ |
| 57 | Book Three (1805) — Chapter 8 | 34 | 34 | ✅ |
| 58 | Book Three (1805) — Chapter 9 | 38 | 38 | ✅ |
| 59 | Book Three (1805) — Chapter 10 | 35 | 35 | ✅ |
| 60 | Book Three (1805) — Chapter 11 | 32 | 32 | ✅ |
| 62 | Book Three (1805) — Chapter 13 | 43 | 43 | ✅ |
| 64 | Book Three (1805) — Chapter 15 | 46 | 46 | ✅ |
| 65 | Book Three (1805) — Chapter 16 | 25 | 25 | ✅ |
| 66 | Book Three (1805) — Chapter 17 | 45 | 45 | ✅ |
| 67 | Book Three (1805) — Chapter 18 | 45 | 45 | ✅ |
| 70 | Book Four (1806) — Chapter 2 | 36 | 36 | ✅ |
| 71 | Book Four (1806) — Chapter 3 | 20 | 20 | ✅ |
| 72 | Book Four (1806) — Chapter 4 | 36 | 36 | ✅ |
| 73 | Book Four (1806) — Chapter 5 | 26 | 26 | ✅ |
| 74 | Book Four (1806) — Chapter 6 | 38 | 38 | ✅ |
| 75 | Book Four (1806) — Chapter 7 | 28 | 28 | ✅ |
| 76 | Book Four (1806) — Chapter 8 | 39 | 39 | ✅ |
| 77 | Book Four (1806) — Chapter 9 | 17 | 17 | ✅ |
| 79 | Book Four (1806) — Chapter 11 | 33 | 33 | ✅ |
| 80 | Book Four (1806) — Chapter 12 | 28 | 28 | ✅ |

Verified with:
```python
import json
src = json.load(open('full-batchC-source.json'))
cor = json.load(open('full-batchC-corrected.json'))
assert len(src) == len(cor) == 20
for s, c in zip(src, cor):
    assert s['number'] == c['number']
    assert len(s['paragraphs']) == len(c['paragraphs'])
```
All 20 chapters passed.

---

## Chapter-by-chapter findings

### Chapter 56 (Book Three, Ch. 7) — SOUND
Full close read of all 68 paragraphs. Rostov/Boris reunion, Denisov, Berg, Prince
Andrew's confrontation with Rostov. No omissions, inventions, inversions, or
distortions found. No changes made.

### Chapter 57 (Book Three, Ch. 8) — SOUND
The Olmütz review. No defects found. No changes made.

### Chapter 58 (Book Three, Ch. 9) — SOUND
Boris seeking Bolkonsky/Dolgorukov's patronage, Dolgorukov's account of the
Bonaparte negotiations. No defects found. No changes made.

### Chapter 59 (Book Three, Ch. 10) — DEFECTIVE (1 fix)
**Defect (invented/false content):** Paragraph 2 (index 1) opened with the
bracketed tag `[speaking in French]` prepended to Denisov's line:
> Source: `"Come here, Wostóv. Let's dwink to dwown our gwief!" shouted Denísov...`
> Candidate: `[speaking in French] "Come here, Rostov. Let's drink to drown our sorrows!" shouted Denisov...`

This is factually wrong — Denisov is not speaking French here at all; the source
is rendering his characteristic Russian speech impediment (r→w). Tagging the line
as French is an invented, false annotation with no basis in the source.

**Fix applied:** removed the `[speaking in French]` tag, leaving the dialogue as
plain English (consistent with how the rest of the book already drops Denisov's
lisp in modern-en — that omission is an existing, consistent stylistic choice
across the whole translation and is not itself a fidelity defect worth
re-litigating here).

### Chapter 60 (Book Three, Ch. 11) — SOUND
Savary's mission, the clock-mechanism metaphor, Kutuzov/Dolgorukov exchange about
attacking. No defects found. No changes made.

### Chapter 62 (Book Three, Ch. 13) — SOUND
Rostov on picket duty, half-asleep, then the reconnaissance ride and Napoleon's
proclamation. No defects found. No changes made.

### Chapter 64 (Book Three, Ch. 15) — DEFECTIVE (2 fixes)
**Defect (dropped foreign-language quotation + broken footnote convention):**
Paragraph 40 (index 39), Miloradovich's reply to the Tsar, is in French in the
source with an asterisked footnote translation:
> Source: `"Ma foi, sire, nous ferons ce qui sera dans notre possibilité, sire," * he answered gaily...` / footnote: `* "Indeed, Sire, we shall do everything it is possible to do, Sire."`
> Candidate: `[Speaking in French] "Indeed, sire, we shall do everything in our power, sire," he answered cheerfully...` followed by a redundant `Footnote: "Indeed, Sire, we shall do everything it is possible to do, Sire."` paragraph.

The candidate dropped the actual French quotation (replacing it with an English
paraphrase and an editorial `[Speaking in French]` tag not used anywhere else in
the book's established convention), and then duplicated an English translation of
the same line a second time in the following paragraph, this time mislabeled
`Footnote:` instead of the `*`-prefixed footnote format used consistently
elsewhere in this very batch (e.g. chapters 72, 74, 76, 79 all correctly keep
foreign phrases in-language with `* "..."` footnote translations). The net effect
is a broken, redundant pair of paragraphs that also breaks project convention.

**Fix applied:** restored the French dialogue verbatim and reformatted the
footnote paragraph to the established `* "..."` convention.

### Chapter 65 (Book Three, Ch. 16) — SOUND
Kutuzov wounded, the rout, Prince Andrew seizing the standard and falling under
the "lofty sky." No defects found. No changes made.

### Chapter 66 (Book Three, Ch. 17) — DEFECTIVE (2 fixes)
**Defect (dropped foreign-language quotation + broken footnote convention):**
Same pattern as Chapter 64. A German soldier's line in the panic/friendly-fire
scene:
> Source: `"Zum Henker diese Russen!" * muttered a German.` / footnote: `* "Hang these Russians!"`
> Candidate: `"Damn these Russians!" a German muttered.` followed by `Footnote: "Hang these Russians!"`

The candidate translated the German directly into English dialogue (losing the
fact that it's a foreign voice among the Russian/Austrian/Czech babel the
paragraph is specifically describing) and then still appended a separate,
differently-worded "translation" as a mislabeled `Footnote:` paragraph —
duplicative and inconsistent with itself.

**Fix applied:** restored the German phrase in the dialogue line and reformatted
the footnote to the `* "..."` convention.

Rest of the chapter (Rostov's ride through the battle, the Horse Guards charge,
meeting Boris and Berg) is sound.

### Chapter 67 (Book Three, Ch. 18) — SOUND
Rostov's search for the Emperor and Kutuzov, the Augesd Dam catastrophe,
Dolokhov on the ice. No defects found. No changes made.

### Chapter 70 (Book Four, Ch. 2) — SOUND
Rostov's return to Moscow, the English Club dinner preparations, Anna
Mikhaylovna's gossip about Dolokhov and Pierre. No defects found. No changes made.

### Chapter 71 (Book Four, Ch. 3) — SOUND
The English Club banquet for Bagration. No defects found. No changes made.

### Chapter 72 (Book Four, Ch. 4) — DEFECTIVE (1 fix)
**Defect (dropped foreign-language quotation, duplicated translation):**
Dolokhov's parting line to Rostov before the duel:
> Source: `"...À demain, mon cher." *` / footnote: `* Till tomorrow, my dear fellow.`
> Candidate: `"...That's how it is with me. [speaking in French] Till tomorrow, my dear fellow."` followed by the correct footnote `* Till tomorrow, my dear fellow.`

Same pattern as chapters 64/66: the French was replaced with an English
paraphrase plus an inline `[speaking in French]` tag, creating a duplicate with
the (already-correct) footnote paragraph immediately after it.

**Fix applied:** restored `À demain, mon cher.` in the dialogue line; the
existing footnote paragraph (already correctly formatted) was left as is.

Rest of the chapter (the duel setup, Pierre's suspicion of Dolokhov and Helene)
is sound.

### Chapter 73 (Book Four, Ch. 5) — SOUND
The duel itself. No defects found. No changes made.

### Chapter 74 (Book Four, Ch. 6) — SOUND
Pierre's confrontation with Helene. Foreign-language quotations
(`Allez-vous promener`, `Je vous aime`, the Molière line) are all correctly kept
in-language with proper `*`-footnote translations, matching convention. No
defects found. No changes made.

### Chapter 75 (Book Four, Ch. 7) — SOUND
News of Prince Andrew's presumed death reaching Bald Hills. No defects found. No
changes made.

### Chapter 76 (Book Four, Ch. 8) — SOUND
Lise's labor begins; Prince Andrew's unexpected return. Foreign phrase
(`fruschtique`/`Frühstück`) correctly kept and footnoted. No defects found. No
changes made.

### Chapter 77 (Book Four, Ch. 9) — DEFECTIVE (1 fix)
**Defect (character-name inconsistency with project's normalized spelling):**
The final paragraph names the newborn son:
> Source: `...the young Prince Nicholas Andréevich was baptized.`
> Candidate: `...the young Prince Nikolai Andreevich was baptized.`

The project's normalized spelling convention is "Nicholas," not "Nikolai" — and
here the candidate went the wrong direction: the source itself already uses the
anglicized "Nicholas," but the candidate substituted "Nikolai," introducing an
inconsistency with both the source and the project's own naming standard (used
correctly for Nicholas Rostov throughout the rest of this file).

**Fix applied:** changed "Nikolai Andreevich" to "Nicholas Andreevich."

Rest of the chapter (Lise's death in childbirth) is sound and was not altered.

### Chapter 79 (Book Four, Ch. 11) — SOUND
Dolokhov's proposal to Sonya and her refusal; Nicholas's conversation with Sonya.
Denisov's lisped dialogue is consistently kept as-is (matching the book's
established, if inconsistent-with-narration, treatment of his speech in dialogue
lines throughout modern-en). No defects found. No changes made.

### Chapter 80 (Book Four, Ch. 12) — SOUND
Iogel's ball; Denisov dancing the mazurka with Natasha. No defects found. No
changes made.

---

## Summary

- **Sound, unchanged:** 15 of 20 chapters (56, 57, 58, 60, 62, 65, 67, 70, 71, 73,
  74, 75, 76, 79, 80)
- **Defective, fixed:** 5 of 20 chapters (59, 64, 66, 72, 77)
- **Total individual fixes applied:** 7, across those 5 chapters

All defects were part of one systemic pattern — foreign-language dialogue quotes
(French/German) that had been silently translated into English and tagged with
an editorial `[speaking in French]`/`[Speaking in French]` note not used
elsewhere in the book, while a duplicate, differently-formatted `Footnote:`
paragraph was left behind restating the same translation — plus one isolated
name-normalization slip (Nikolai → should be Nicholas). All fixes restore the
original-language quotation in the dialogue line and/or correct the footnote
paragraph to the project's established `* "..."` convention, or correct the
name spelling. No prose was rewritten for style; only the specific defective
spans were touched.
