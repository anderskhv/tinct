# b13 fidelity + repair review (F)

Source: Garnett 1914 (`source.json`). Candidate: `candidate.json`. Proposals: `rounds/b13/F.json` (71).

## Coverage

- Ch 39 (Part 6, Chapter 8): 39.0–39.85 (86)
- Ch 40 (Epilogue, Chapter 1): 40.0–40.19 (20)
- Ch 41 (Epilogue, Chapter 2): 41.0–41.29 (30)
- **Total: 136 paragraphs**, matching the batch count (86 + 20 + 30 = 136). Every pair was read side by side, in order, in slices of 11–31 paragraphs.

## Findings summary

71 proposals, 19 of them blocking.

| Category | Count |
|---|---|
| omission | 22 |
| meaning | 16 |
| emphasis | 12 |
| certainty | 8 |
| hesitation | 7 |
| invented | 4 |
| period | 1 |
| reference | 1 |

Most important:

- **39.83, the confession.** The candidate rewrote it as "It was I who killed ..., and robbed them" and dropped the source's italics. Restored exactly: `_It was I killed the old pawnbroker woman and her sister Lizaveta with an axe and robbed them._`
- **39.22, the "Campany" sign.** The candidate corrected the misspelt sign to "Company", which makes "that letter a" meaningless. Restored 'Campany' and italic _a_. Also removed an invented "Good God" and restored the hesitation "interesting... in its way... (Ha-ha-ha! ...)", "Foo! how people shove" and "peasant woman".
- **Ilya Petrovitch scene (39.39–39.79).**
  - Restored the hesitations 39.63 "I... was acquainted... my sister" and 39.65 "I saw him yesterday... he... was drinking wine".
  - 39.48: the invented "overwrought nerves" goes back to "Bigotry and fanaticism!"
  - 39.46: restored "and a learned one too... and so to say the first steps" and "But I'm forgetting to ask you".
  - 39.74: "He fancied that a porter pushed past him" (F6). The candidate had "vaguely aware of".
  - Restored _friendship_, _nihil est_ and _like a man_ (39.35).
- **39.7 / 39.8, Raskolnikov at Sonia's.** Restored "Tfoo!", "how I shall surprise him", "Ah! what am I coming to!" and "he talked incoherently". Without them he is made more composed than the source.
- **40.3.**
  - Restored "*perhaps* partly because" (certainty).
  - Restored "through melancholy and fanaticism" (Nikolay).
  - The student passage was muddled: the source says the student had maintained his father since age 13 and that Raskolnikov spent his last penny. Restored.
  - Restored "Five Corners", "burnt" and "fairly well confirmed".
- **40.7:** restored the dropped "when certain sinister influences could be removed" and "She assured Razumihin that her son would be one day a great statesman".
- **40.12:** "within five years at most" reversed the source's "at least".
- **Epilogue 2, the refusal to repent is kept intact.**
  - 41.0: _blunder_ restored; "destroyed himself" goes back to "come to grief".
  - 41.3: the invented gloss "in this new freedom from distraction" goes back to the paradox `_in freedom_`.
  - 41.5: restored the "of course... of course" repetition, the hesitation "punish me for the letter of the law... and that's enough", and _they were right_.
  - 41.8 "dimly aware" and 41.10 "would never have admitted" (F6).
  - 41.9 "meanness", not "cowardice".
- **Ending.** Conversion certainty is not raised anywhere.
  - The lead's known items are fixed: 41.24 fancied→noticed (now "It had even seemed to him"), 41.25 "for long" instead of "coherently", _all_, and 41.28 _only_.
  - 41.21: removed the invented repetition "loved her, loved her" and restored the trailing "...".
  - 41.27: kept "now" in "Can't her convictions be mine now?"
- **Plague dream (41.16).** Restored "strange" and "They did not know how to judge". The rest of the detail is intact.

## Considered and rejected

- 39.42 "The translator's note read: ..." is an existing convention for rendering Garnett's footnote aloud, and the content is complete. Left alone.
- 39.0 "did not need to ask -- she knew" and "how quickly they became friends" are close enough to the source. Not a real defect.
- 39.27 "He's boozed" → "That one's been drinking", 39.39 "A-ah!" → "Well, well!", 39.56 "crop-headed wenches" → "short-haired females" and 41.0 "parti-coloured" → "striped convict's coat" are acceptable modernizations.
- 39.33 "remarks and the laughter": the laughter comes from 39.28, so nothing is invented.
- 40.2 "All this was almost crudely blunt": the meaning is preserved.
- 40.14 "continual fancies" dropped: minor, left.
- 41.4's added closing quote: typographic only.
- 41.22, 41.23, 41.26 and 41.29 carry the religious language (resurrection, risen again, New Testament, Lazarus, regeneration) faithfully. No change.
- Minor dropped trailing ellipses (39.54 "citizen....", 39.61 "him....") and "Hulloa!" (39.76) were not worth an edit.

## Tooling note

`apply.py ... --dry` currently **crashes before reporting**. `validate()` asserts no newline, and candidate **13.20** contains `"Oh, my handsome soldier,\nDon't beat me for nothing,"`. The source has no newline there ("soldier Don't"). This is a pre-existing defect outside this batch, and the lead should fix it before applying.

I ran the same logic without `validate()`: all 71 proposals match exactly once, 0 are rejected, and they also apply cleanly in sequence.

## Verdict

After these repairs the batch is faithful. Ch 40 and the ending of Ch 41 were already largely sound; the defects were concentrated in Ch 39's dialogue (hesitation, emphasis, small inventions) and in 40.3 and 40.7 (dropped facts). No passage is unresolved.
