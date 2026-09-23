# b03 — Source-based verification (V), chapters 10–12

## Coverage
- Ch 10: 38 changed paragraphs checked (tool count 38)
- Ch 11: 52 changed paragraphs checked (tool count 52)
- Ch 12: 41 changed paragraphs checked (tool count 41)
- **Total: 131 of 131.** 129 verified clean, 2 with defects.
- Accessibility items screened: 7 of 7 (A.json indices 0–6).

All ~190 register (contraction) edits in ch 11–12 were checked one by one against the source. None is ungrammatical. Every "'s", "'d" and "'ve" expands correctly: "That's been established", "He's been conscious", "He'd gone there", "he'd made a noose", "It's their ... routine", "I'd like to know". The negative-question flips ("Haven't I", "Didn't you", "won't you", "Can't you", "didn't he admit") all match the source's own negative questions. Luzhin's formality is intact. The pass did not touch his lines (12.24, 12.29, 12.74 and 12.94 keep "I am", "I cannot", "do not" and "So that is how it is"). Only 12.20, 12.24 and 12.29 were changed, to restore his "your mamma". Source italics in the batch (_buts_, _cannot be denied_, _fiancé_, _fiancée_) are preserved. Ch 10 changes are the name normalizations plus local fidelity fixes, and all match the source.

## Defects
1. **11.77** (hesitation, non-blocking): "Ach!" → "A-ach!". The fix replaced "Ha!" but dropped the source's drawn-out "A-ach!". Razumihin is cut off mid-exclamation when the door opens.
2. **12.69** (register, non-blocking): "he isn't cunning, not experienced" → "he is not cunning, not experienced". The source ("he is not cunning, not practised") is an emphatic parallel of negations after "I maintain". The contraction breaks the parallel.

## Accessibility verdict summary
- 0 (10.75 "blow him up") **accept**. This is the source's idiom for scolding, and the replacement keeps the meaning.
- 1 (10.113 "United States of America") **reject**. The source does not explain the joke, and the next sentence names the trousers.
- 2 (11.53 "by/behind the door") **reject**. The source itself says "in the corner by the door" in Nikolay's testimony. Raskolnikov's "Behind the door?" (11.54) and 11.73's "behind the door" are also source wording. The inconsistency is the source's, so the testimony should not be harmonized.
- 3 (11.73 tangled tense) **accept**. It matches the source: "in the flat when Nikolay and Dmitri had just run out of it".
- 4 (12.19 dangling "whose") **accept**. This is a grammar fix.
- 5 (12.27 whiskers) **modify** to "His dark mutton-chop whiskers framed his face nicely on both sides, growing thick down around his shining, clean-shaven chin." The source has the whiskers thickening at the chin, not on the cheeks.
- 6 (12.78 note anchor) **modify** to "And then the great moment came,[*] and". The current handling does not match the source. The source anchors the note in 12.78 ("the great hour struck,[*]") and keeps the "[*] ... --TRANSLATOR'S NOTE." paragraph at 12.79. The candidate (inherited from baseline) keeps 12.79 verbatim but has no anchor in 12.78. The anchor goes in the source's position, after the comma. (Book-wide, outside this batch: the notes at 33.19/33.20 and 39.41/39.42 also lost their anchors and use two different note formats.)

Checked with `apply.py --dry`: defects 2 applied / 0 rejected; accepted and modified accessibility items 5 applied / 0 rejected. No overlaps.

## Verdict
**CLEAN AFTER CORRECTIONS.** Both defects are non-blocking.
