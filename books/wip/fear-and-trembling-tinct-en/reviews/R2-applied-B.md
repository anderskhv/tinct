# R2 applied — Part B (ch3 Eulogy on Abraham): readability wording fixes

This round applies the wording fixes from `reviews/R1-readability-ch03.md`. The pre-edit snapshot is `drafts/history/B-ch3.r2.json`, the version committed as "B approved with reverify items". I checked each item against `source/original-da-final.json` and added no explanation.

## Items

- **M2, ¶0.** Danish: "han tager Intet af sit Eget, men er misundelig paa det Betroede".
  - CHANGED "He takes nothing from what is his own; he is jealous, rather, of what was entrusted to him." → "He draws on nothing of his own, but he is jealous of what was entrusted to him."
  - *tage af* is "take from" or "draw on", so "draws on" keeps the verb's sense (and the John 16:14 echo) and is no longer garbled.
  - I did not use "adds", because the Danish verb is *tage*, not *tilføie*. I did not use "jealously guards", because *misundelig paa* is "jealous of" (R1 ruling), which keeps both the possessive and the envious reading.
  - *men* is restored as "but".
- **M3, ¶0.** Danish: "thi Digteren er ligesom Heltens bedre Væsen".
  - CHANGED "For the poet is, as it were, the hero's better being:" → "For the poet, in turn, is as it were the hero's better being:"
  - *Thi* is kept as "For". "In turn" marks the mirror that the Danish sets up by repeating "er ligesom … bedre Væsen" with the roles swapped. It is the lightest possible signal and adds no content.
- **M5, ¶3.** KEPT "For Moses struck the rock with his rod, but he did not have faith."
  - The Danish connective is *thi*: "… efter Forjættelsen og efter Troen; **thi** Moses slog Klippen med sin Stav, men han troede ikke".
  - The sentence gives the ground for "according to faith" by the contrary case. Dropping "For" or changing it to "Whereas" would remove a connective that Kierkegaard wrote, and R1 fidelity finding 37/51 asked for his *Thi* to be restored elsewhere.
- **M1, ¶0.** KEPT "But that is exactly why it is not so."
  - It renders "Men derfor er det ikke saaledes" literally and plainly.
  - The abruptness is the Danish's own. It is an idea-level leap, and no pure wording change reduces it without adding an argument.
- **M4, ¶3 ("hold it fast after one has given it up").** KEPT. It is idea-level, and the wording is exact to "fastholde det, efter at have opgivet det".
- **M6, ¶11 ("We all know it — it was only a test").** KEPT. It is idea-level irony, exact to "Vi vide det Alle — det var kun en Prøvelse". Any wording change would signal the irony, which the Danish does not do.
- **M7, ¶12 (the ram counterfactual).** KEPT. It is idea-level, and the chapter itself never narrates the ending. Supplying it would be adding content.
- **LIGHT, ¶0, stiff inversion.**
  - CHANGED "Of what the hero does, the poet can do nothing;" → "The poet can do nothing of what the hero does;"
  - This follows the Danish order: "Denne kan Intet gjøre af hvad hiin gjør".
- **LIGHT, ¶0, tense mix.**
  - CHANGED "the longer time went on, the more faithfully he clings to him." → "the longer time goes on, the more faithfully he clings to him."
  - The Danish mixes tenses ("gik hen … hænger"), but the English mix read as ungrammatical. The present tense matches "his lover will come" and "clings". Only the tense changes; the refrain wording "time … on" is kept.
- **LIGHT, ¶0, "craft of forgetfulness".**
  - CHANGED → "the cunning of forgetfulness".
  - *Underfundighed* means cunning or wiliness.
- **LIGHT, ¶7, "poor expression".**
  - CHANGED "He embraced Isaac with a love for which it was only a poor expression to say that he faithfully fulfilled a father's duty to love his son" → "He embraced Isaac with a love that was only poorly expressed by saying that he faithfully fulfilled a father's duty to love his son"
  - The Danish is "for hvilken det kun var et fattigt Udtryk, at …". The sense and the *kun* are kept, and the syntax is less clunky.
- **LIGHT, ¶10, the whisper question.**
  - CHANGED "did you answer, or did you not — perhaps quietly, in a whisper?" → "did you answer, or did you not — or perhaps quietly, in a whisper?"
  - The Danish is "svarede Du da, eller svarede Du ikke, maaskee sagte, og hviskende?". The third option is an alternative to the first two, and the added "or" makes that clear.
  - I kept the three-way structure. I did not use the reviewer's "did you answer at all — or only…", which drops the Danish alternative "or did you not".
- **LIGHT, ¶10, "place appointed".**
  - CHANGED "and early in the morning he was at the place appointed, on Mount Moriah" → "and early in the morning he was at the agreed spot on Mount Moriah"
  - The Danish is "aarle om Morgenen var han paa det aftalte Sted, paa Morija-Bjerget", so *aftalte* is "agreed". I kept "early in the morning", because it is the Danish.
  - I did not use the reviewer's "in good time", which would change the meaning. The oddness of the time sequence is Kierkegaard's own.
  - "spot" rather than "place" also avoids a shared run that "appointed place" created.
- **LIGHT, ¶12, "and nor would".**
  - CHANGED "Then Abraham would not have been forgotten, and nor would Mount Moriah." → "…, and neither would Mount Moriah."
  - This is standard English for "ei heller Morija-Bjerget". The bare "nor would Mount Moriah" created a new 12-word shared run, so I used "and neither".

The other LIGHT observations are not wording defects, or they were ruled on in R1 fidelity: "by himself", "believed God" and the elliptical refrain "contemplating the believer more blessed", which is elliptical in the Danish too. The outside-knowledge items are not wording defects either. All of these are unchanged.

## Checks

- JSON is valid (`python3 -m json.tool`). There are 14 slots, and ¶13 still has `dividerBefore: "asterism"`.
- **Screen, minrun 14, after R2:** `TOTAL words 3459; in shared 8-word runs 18.0%; in runs>=12 3.6%; in runs>=16 1.5%`
- **Screen before R2** (the snapshot, same settings): `TOTAL words 3460; in shared 8-word runs 18.3%; in runs>=12 3.6%; in runs>=16 1.5%`.
- **No new long run.** The runs of 14 or more words are the same three as in the snapshot, all in ¶3:
  - "it became unreasonable; Abraham had faith. There was one…";
  - "he too shall not be forgotten. Then he sorrowed…";
  - "that Abraham and Sarah were young enough to wish, and that faith had preserved their wish and…".
- The third of those runs comes from the ¶3 wording in the approved snapshot, which differs from my R1 re-rendering. I left it untouched because it was not in this round's scope.
- A diff at minrun 12 between the snapshot and the current file shows no added runs.
