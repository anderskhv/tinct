# Symposium — READY in staging

Branch: `content/modern-en-repair-r1`. Baseline and instruction revision: `221d6b78d950e36ed2b18fbe6fd800cdd7d44abc`.
Owned path: `books/wip/modern-en-repair-r1/symposium/`.
Original copied byte-for-byte from live original-en; candidate began as live modern-en. Chapters 2, 4, 5, 6, 7, 8 received direct sentence-by-sentence rendering. REAL chapters 1 and 3 remain unchanged; neither contained an identical paragraph over 40 words requiring the specified exception. No external generation API or mechanical replacement pass.

## Changed paragraphs (one-based, versus live modern-en)
- Chapter 1: unchanged (REAL).
- Chapter 2: 1, 2, 3, 5, 6, 7, 8
- Chapter 3: unchanged (REAL).
- Chapter 4: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10
- Chapter 5: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18
- Chapter 6: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13
- Chapter 7: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69
- Chapter 8: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47
Verse quotations and short acknowledgements may remain unchanged; quotations are not removed to reduce similarity. Dialogue remains dialogue, in its existing paragraph boundaries, and has been rendered into modern English.

## Gates and structure
Before: similarity 0.866; LIGHT/MECHANICAL 6/8 (75%); identical long paragraphs 3/170 (1.8%); scaffolding 0; truncated quotations 0; FAIL.
After: absolute-path whole-book PASS; similarity 0.500; LIGHT/MECHANICAL 0/8 (0%); identical long paragraphs 5/170 (2.9%); scaffolding 0; truncated quotations 0. Raw results in `gate-before.txt` and `gate-after.txt`.
All 8 chapters and paragraph counts 49/8/12/10/18/13/69/47 retained. Every paragraph meets 75% of source word count; minimum 0.755. Every rewritten chapter preserves paragraph-level exclamation counts. Untouched chapter 1 already has two additional exclamation marks in its opening paragraph; retained under the instruction to leave REAL chapters unchanged, with no source exclamation dropped.

## SHA-256
- `symposium-modern-en.json`: `d6954715286adb42d2a7292bf6dc5c6cf3c4d2c65baadee04223197d1227f1f7`
- `symposium-original-en.json`: `3521a12d5d5acd6d4ac83f53747192c5ae592f7bf5e965c9c9bff881965495a6`

## Spot-read notes
- Chapter 2 paragraphs 1–3: Phaedrus’s oldest-god claim and absence of recorded parents remain; Hesiod’s verse remains complete; the transition to Parmenides and Generation is preserved. Also checked the Parmenides verse in paragraph 4.
- Chapter 4 paragraphs 1–3: both kinds of love are extended from souls to bodies and nature; medical opposites, Asclepius, Heracleitus, bow/lyre, harmony, rhythm, and musical education are all retained. The apparent tension over discord is kept rather than editorially resolved.
- Chapter 5 paragraphs 1–3: Aristophanes’s distinct praise, three sexes, anatomy, sun/earth/moon parentage, Otys and Ephialtes, Zeus’s division, Apollo’s reshaping, purse/navel/shoemaker images, and the halves’ near-starvation all survive in order.
Also reviewed the stages of Diotima’s ascent and continuity/immortality argument, and Alcibiades’s seduction story, Potidaea/Delium examples, Silenus comparison, and final comedy/tragedy discussion. Cited verse remains complete. Love, beauty, the good, temperance, justice, generation, daimon, and absolute beauty are kept as philosophical terms.

## Known issues and impact
Inherited source references (Rep., Arist. Pol., Gorgias/Gorg., supra, and others) remain rather than being replaced with invented citations. Apparent source errors such as “saving” for “saying” in chapter 5 and the missing word in “is and the same” in chapter 7 are rendered according to their clear local meaning. The unusual source title “Sthenoaoea” and “Hyppolytus” spelling are preserved. Historical sexual and gender claims remain the speakers’ claims; no editorial correction added.
`books/characters/symposium/` exists: true. Existing character descriptions and text references may need a later wording cross-check. No character files edited.
No publication, deployment, app, registry, script, test, or configuration edits. Anthropic API spend: zero.
