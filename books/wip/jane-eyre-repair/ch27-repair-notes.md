# Jane Eyre — Chapter 27 (modern-en) — Damage Zone Repair Notes

Source of truth: `ch27-source.json` (1847 original, 163 paragraphs).
Input: `ch27-current-modern-en.json` (163 paragraphs, damage confined to the tail).
Output: `ch27-corrected.json` (163 paragraphs).

## Method

Compared every paragraph in the flight/departure zone (0-based indices ~144–162,
i.e. 1-based paragraphs 145–163) against the source sentence-by-sentence. Six
paragraphs were confirmed genuinely defective (omission, invention, or meaning
inversion) and were re-rendered faithfully from source at the same
modernization register as the rest of the chapter. All other paragraphs in and
around the zone (145–150, 152, 155–157, 163 by 1-based numbering) were checked
and found sound — left untouched. Paragraphs 1–144 were not touched or
re-examined beyond confirming they were out of scope.

Verified by script: diffing `ch27-corrected.json` against
`ch27-current-modern-en.json` shows **exactly 6 changed paragraphs**, all
other 157 paragraphs byte-identical.

## Changed paragraphs (0-based index / 1-based paragraph number)

### Index 150 / Paragraph 151 — the red-room dream vision
**Defect:** Substantial omission in the moon/dream imagery. Current text
compressed "the roof resolved to clouds... I watched her come—watched with the
strangest anticipation... She broke forth as never moon yet burst from
cloud: a hand first penetrated the sable folds and waved them away; then, not
a moon, but a white human form shone in the azure, inclining a glorious brow
earthward. It gazed and gazed on me" down to two thin sentences, losing the
anticipation beat, the hand parting the clouds, and the moon's transformation
into a gazing human figure.
**Fix:** Restored the full sequence — ceiling dissolving to clouds, the
anticipatory watching, the hand parting the dark folds, the moon becoming a
white human form with a glorious bent brow that gazes at Jane — in modern
English, preserving all clauses and images.

### Index 153 / Paragraph 154 — packing before flight
**Defect:** Dropped an entire clause: "I knew where to find in my drawers
some linen, a locket, a ring. In seeking these articles, I encountered the
beads of a pearl necklace Mr. Rochester had forced me to accept a few days
ago. I left that; it was not mine: it was the visionary bride's who had
melted in air. The other articles I made up in a parcel." Current text
replaced this with an invented, conflated detail ("a small silk purse in my
drawer: it held twenty shillings") that isn't in Brontë.
**Fix:** Restored the full packing sequence — linen, locket, ring, the pearl
necklace she deliberately leaves behind (it belongs to "the imaginary bride"),
the parcel of remaining articles — followed by the purse detail, faithful to
source order and content.

### Index 158 / Paragraph 159 — the gate (meaning inversion)
**Defect:** Source: "The great gates were closed and locked; but a wicket in
one of them was only latched" (main gate locked, but a small latched door is
usable). Current wrongly stated "The gate, too, stood open" — inverting
locked-with-an-accessible-wicket into simply open. Checked the water/bread
rationing detail earlier in the same paragraph — both halves ("I got some
water, I got some bread... my strength... must not break down") were intact,
no further fix needed there.
**Fix:** Restored the correct image: gates shut and locked, a latched wicket
in one of them, which Jane slips through and shuts behind her.

### Index 159 / Paragraph 160 — dropped antithesis + invented replacement
**Defect:** Source: "Not one thought was to be given either to the past or
the future" — current kept only the future-focused half ("Not one thought of
the future could be permitted"), dropping Jane's refusal to think of the
*past* as well. Source's actual imagery — "The first was a page so heavenly
sweet—so deadly sad... The last was an awful blank: something like the world
when the deluge was gone by" — was replaced with an invented sentence: "The
first thing to be done was to move past the moors and beyond the reach of
anyone from Thornfield" (not in Brontë).
**Fix:** Restored the full past/future antithesis and Brontë's actual
imagery (the sweet-and-sad page of the past; the post-deluge blank of the
future); removed the invented replacement sentence entirely.

### Index 160 / Paragraph 161 — the worst paragraph (major omission + fabrication)
**Defect:** ~290 words omitted from a ~400-word source paragraph. Missing:
Jane's agony thinking of Rochester "in his room—watching the sunrise,"
hoping she'd return; her longing to go back and be his comforter/redeemer;
the barbed-arrow image of her fear for his self-destruction; the
faithful-birds passage; "I abhorred myself... I had no solace from
self-approbation... I had injured—wounded—left my master. I was hateful in
my own eyes"; "God must have led me on"; her physical and mental collapse —
weeping, delirious walking, weakness, falling, pressing her face to the wet
turf, crawling on hands and knees, then rising again. The current modern-en
also invented a passage with no source basis: "I thought of a drain deep and
dark through which a torrent of blood was pouring, from which no dam could
stop the flow."
**Fix:** Fully restored the paragraph from source — the scaffold-condemned-man
simile, the thought of Rochester watching the sunrise and hoping for her
return, the longing to go back, the barbed-arrow/faithful-birds imagery, the
self-abhorrence and "God must have led me on," and the physical collapse and
recovery — at full emotional weight, in modern English. Removed the
fabricated drain/blood image entirely (no source basis).

### Index 161 / Paragraph 162 — the coach (small omission + fabricated detail check)
**Defect:** Checked the invented-looking line "I counted out my purse. It
came to twenty" against source: source has the driver naming a fare of
thirty shillings and Jane stating she has only twenty, which he agrees to
accept — "counted out my purse" was an embellishment not stated in Brontë
(a legitimate-looking but unverified paraphrase), and more importantly the
paragraph dropped a real detail entirely: "He further gave me leave to get
into the inside, as the vehicle was empty" (that the coach was empty and she
was allowed to ride inside, not merely "outside" as poorer fares often did).
**Fix:** Replaced the paraphrase with a faithful rendering of the fare
exchange (he asks thirty shillings, she says she has only twenty, he agrees
to make it do) and restored the omitted detail that the coach was empty and
she was let inside.

## Confirmation

Script-verified diff of `ch27-corrected.json` vs. `ch27-current-modern-en.json`:
- Changed 0-based indices: **150, 153, 158, 159, 160, 161**
- Changed 1-based paragraph numbers: **151, 154, 159, 160, 161, 162**
- All other 157 of 163 paragraphs are byte-identical to the input file.
- Output paragraph count: 163 (matches source and input exactly).
- Output JSON validated with `python3 -m json.tool`.
