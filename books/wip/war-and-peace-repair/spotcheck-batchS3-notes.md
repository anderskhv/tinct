# Batch S3 spot-check notes — War and Peace modern-en

Full close read of source (Maude) vs. current modern-en, all paragraphs, all 6 chapters.

## Paragraph-count verification (script-verified)

| Chapter | Source paragraphs | modern-en (current) | corrected | Match |
|---|---|---|---|---|
| 257 | 35 | 35 | 35 | OK |
| 261 | 41 | 41 | 41 | OK |
| 281 | 13 | 13 | 13 | OK |
| 290 | 33 | 33 | 33 | OK |
| 310 | 14 | 14 | 14 | OK |
| 325 | 53 | 53 | 53 | OK |

Verified with a Python script that loads both JSON files and asserts
`len(source[i]['paragraphs']) == len(corrected[i]['paragraphs'])` for every
chapter — all six pass.

## Chapter 257 (Book Eleven, Ch. 28) — SOUND, no changes

Read every paragraph against the Maude source. Dialogue, French-footnote
pairs, and plot beats (Makar Alexeevich's pistol, Pierre's intervention,
Ramballe's gratitude) all match. Character-name normalization already
follows house style (Gerasim, Makar Alexeevich, no accents). No omissions,
inventions, inversions, or factual distortions found.

## Chapter 261 (Book Eleven, Ch. 32) — SOUND, no changes

Read every paragraph against source. The delirium/sphinx/Natasha reunion
sequence — the highest-risk passage for invented or dropped content in this
batch — matches source closely, including the "piti-piti-piti" motif, the
theology-of-love passage, and the reconciliation dialogue. "Prince Andrew"
and "Timokhin" are correctly normalized. No genuine defects found.

## Chapter 281 (Book Thirteen, Ch. 2) — DEFECTIVE, fixed

Two genuine defects found and corrected:

1. **Meaning distortion — "marauders" mistranslated as "stragglers."**
   - Source: "That movement... was so natural that even the Russian
     marauders moved in that direction..."
   - Candidate (before fix): "...even Russian stragglers moved in that
     direction..."
   - Problem: the sentence's point is that the pull toward the
     supply-rich district was so strong that even looters/plunderers
     (people actively seeking loot, not defeated soldiers falling behind)
     drifted that way — a comment on the terrain's gravitational pull, not
     on troop attrition. "Stragglers" swaps in an unrelated image and
     weakens the argument.
   - Fix applied: restored "marauders."

2. **Omitted clauses in the "signs of Russian superiority" list.**
   - Source includes "...the impatience to do what they had been
     assembled for, **which usually shows itself in an army that has been
     resting**; curiosity as to what the French army, **so long lost sight
     of**, was doing..."
   - Candidate (before fix) dropped both bracketed clauses, compressing the
     list and losing Tolstoy's explanatory aside about resting armies and
     the detail that the French army had been "lost sight of" for a long
     stretch.
   - Fix applied: restored both clauses (lightly reworded: "so long out of
     sight" for "so long lost sight of") without retranslating the
     surrounding sentence.

No other defects found in this chapter; Kutuzov's letter exchange with
Napoleon and the rest of the analytical passage are otherwise faithful.

## Chapter 290 (Book Thirteen, Ch. 11) — SOUND, no changes

Read every paragraph against source, including the dog description, the
corporal/Pierre/captain exchange, and the Karataev/Frenchman shirt scene
(the passage with the highest density of small dialogue beats and the
easiest place for a dropped exchange). All content, including the
"sweating hand's an open hand" proverb and the returned scraps of cloth,
is present and undistorted. No genuine defects found.

## Chapter 310 (Book Fourteen, Ch. 12) — DEFECTIVE, fixed

One genuine defect found and corrected:

1. **Factual/place-name distortion — "Dorogobuzh" became "Dorogobuzhsk."**
   - Source: "At Dorogobúzh while the soldiers of the convoy... had gone
     off to pillage their own stores, several of the soldier prisoners
     tunneled under the wall and ran away..."
   - Candidate (before fix): "At Dorogobuzhsk, while the convoy
     soldiers..."
   - Problem: Dorogobuzh is a real town on the French retreat route
     (Smolensk Oblast); "Dorogobuzhsk" is not a real place name and
     misrepresents the location of this incident.
   - Fix applied: corrected to "Dorogobuzh."

No other defects found; the attrition figures (330 → under 100 prisoners,
120 → 60 artillery wagons), the German soldier shot for the marshal's
spoon, and Pierre's reflections on suffering/freedom all match source
faithfully.

## Chapter 325 (Book Fifteen, Ch. 8) — SOUND, no changes

Read every paragraph against source, including the long campfire dialogue
scene (soldiers' talk about French boots, the dead at Mozhaysk, Platov and
Napoleon's "magic word," the stargazing exchange). All content and speaker
attributions match; no dropped or invented lines, no meaning inversions.
Some folk-speech coloring is smoothed (e.g., "'Poleon" → "Napoleon"), which
is a legitimate style choice, not a factual or content defect.

## Summary

- Sound, unchanged: chapters 257, 261, 290, 325
- Defective, fixed: chapters 281, 310
- All fixes were surgical word/clause-level corrections on top of the
  existing modern-en wording — no paragraph was re-translated for prose
  quality, and no paragraph counts changed.
