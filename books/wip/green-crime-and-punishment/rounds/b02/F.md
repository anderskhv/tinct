# b02 fidelity + repair review — Ch 7–9 (Part 1 ch 7; Part 2 ch 1–2)

## Coverage
- Ch 7: 7.0–7.88 (89)
- Ch 8: 8.0–8.173 (174)
- Ch 9: 9.0–9.68 (69)
- **Total: 332.** Matches the batch (89 + 174 + 69 = 332). Source and candidate paragraph counts are equal in all three chapters.

I read every pair side by side, in order, in slices of 18–31 paragraphs, with the neighbouring paragraphs in view.

**8.120 / 8.121 (lead repair) confirmed.** 8.120 now renders only source 8.120: the lock-up threat and "A fine lot, these writers!", 69 words. It no longer contains any 8.121 material ("contemptuous glance", restaurant, steamer, confectioner's). 8.121 renders only source 8.121. There is no duplication across the boundary. One small irony fix to 8.120 is proposed below.

## Findings summary (48 proposals, 13 blocking)
| Category | Count |
|---|---|
| hesitation | 8 |
| omission | 11 |
| meaning | 10 |
| certainty | 6 |
| invented | 7 |
| emphasis | 4 |
| period | 2 |

Most important findings:
- **8.127–8.131, the police-station speech (hesitation/omission, blocking).**
  - 8.127 dropped the narrator's aside "(shattered was the word he used)". It also dropped his trailing-off and added "soon".
  - 8.129 turned "I led a life of... I was very heedless..." into a tidy phrase.
  - 8.131 collapsed "It is for me to explain... how it all happened... In my turn... though I agree with you... it is unnecessary" into coherent speech.

  All three are restored so his feverish, half-formed pleading reads as in the source.
- **7.6 (certainty).** "almost frightened" had become "growing terrified", and "he thought he would have run away" had become "he was sure he would bolt". Both are restored.
- **7.29 (invented).** "Standing wide open" contradicts "six inches". A motive was also added: "a precaution against being left alone with him". The lost repetition "all the time, all that time!" is restored.
- **7.26 (meaning).** He "ran for the door"; the source has "ran into the entry". He then goes to the kitchen, so running for the door misstates what he does.
- **7.27 (omission).** "Obstacles... or crimes to commit" had lost "to commit".
- **7.73 (meaning).** The candidate had him imagine flinging open the door. The source has him shouting to them *through* the door.
- **8.110 (hesitation/period).** Ilya Petrovitch's "again, again, you... you...!" had been removed, and "house of correction" had become "workhouse".
- **9.25 (invented).** "How much he dreaded" was added, which pre-empts the realization in the next sentence. The source says he simply had not realised he would meet Razumihin face to face.
- **9.50 (certainty).** "And then he was gone" asserted what Raskolnikov only wonders ("Can he have gone away?").
- **9.5 (period).** The chalk joke "Standing here strictly forbidden" (the sink is a urinal) had been flattened to "No loitering", which loses the reason his going in looks unsuspicious.
- **Emphasis restored:** 7.34 _he_, 7.37 _he_, 8.146 _He_, and the 9.31 italic title.
- **Latch/bolt:** 7.30 and 7.32 are corrected to "latch" to match the source and the hook mechanism.

## Considered and rejected
- **7.82 "Them!"** Garnett has "Hey!". The candidate's "Them!" matches the Russian ("Они!", "It's them") and is clearer. Changing it to "Hey!" would make it read as the young man shouting, so I left it alone, but it is flagged for the lead.
- **8.79 `_that_`.** Emphasis was added in "It can't be about _that_". The source has no italics here, but it is consistent with 8.90 "_that_" and aids comprehension, so I did not treat it as an invention.
- **9.50 "it's all about _that_".** The same reasoning applies.
- **8.121 "loudmouths" for "town-criers".** This is a plain, faithful gloss of the insult. It is not a lost reference.
- **8.165 "Short and sweet" for "Short and clear".** It keeps the sarcasm.
- **8.162 "in the evening".** This is a harmless clarification.
- **8.138 "or conceal".** This is accurate per 8.104.
- **8.172 "bastards" for "brutes".** This is register only and within his voice.
- **7.48 "Damn!" for "Aie--aie!".** This is an equivalent exclamation.
- **Other rejected candidates.** 8.16's questions for "Surely it isn't...", 9.16's question form, and the many small contractions and plain-word substitutions are faithful. They were left as is.
- **8.0–8.25, the waking passage.** This is largely faithful. Only "What next?", "now, now" and "actually" were restored.

## Checker note
`apply.py ... check --dry` aborts before reporting. The cause is its structural `validate()`, which fails on the current candidate at **13.20** (outside this batch): that paragraph contains a literal newline ("Oh, my handsome soldier,\nDon't beat me for nothing,"), whereas the source has none. I ran the identical exactly-once test on its own over F.json: **48 proposals, 0 rejected.** The lead should fix 13.20, for example by replacing the newline with a space or " / ", before running apply.py on any batch.

## Verdict
After these repairs, the batch is faithful. The murder (ch 7) and the station scene (ch 8) are vivid and close. The main systematic defect was Raskolnikov's broken speech and uncertain states being tidied up, and all of it is addressed. Every passage is resolved; 7.82 is the only judgment call and is left to the lead.
