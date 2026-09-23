# Book 24 independent re-verification (v1 → v2)

**Verdict: DEFECTS FOUND**

1 blocking defect (¶28, comma splice) and 1 non-blocking defect (¶0, word order that is unclear aloud). Both were introduced by accessibility edits. Fixes are in `b24-reverify.json`.

## Replay

- All 31 edits in `b24-v1-edits.json` were replayed in order on candidate-v1. Each `old` string appeared exactly once in its paragraph.
- The replayed paragraphs equal candidate-v2's paragraphs byte for byte (45 of 45).
- `number` (24) and `title` are unchanged.
- The sha256 of candidate-v2.json is `f55ec9e4841ae41c38e6f410958b8003107cb8815ee48555aaac6f1f03aa4bcb`, which matches.
- Changed paragraphs: 0, 3, 5, 6, 9, 10, 14, 15, 16, 20, 23, 24, 25, 26, 28, 29, 30, 35, 41, 42.

## Mechanical checks (changed paragraphs)

- **Curly double quotes:** “/” counts equal the source in every changed paragraph. ¶5 and ¶9 keep Butler's unclosed quotes (1/0) at the paragraph breaks, as intended.
- **Single quotes:** ‘ counts match the source. The extra ’ are apostrophes.
- **Dashes, semicolons, colons:** no spaced dashes and no semicolons. The only colon added in v1→v2 is ¶30 "and said:". The ¶16 and ¶26 colons were already in v1 (¶26 is Butler's own).
- **Spelling:** no British spellings (checked for -our, grey, towards, -ise and similar).

## Per-paragraph checks

- **¶0.** "where dwell…" became "where the souls and shadows dwell of those who can labor no more". This is faithful but splits "shadows" from "of those", so aloud it reads "dwell of those". **Defect, non-blocking:** keep the noun phrase together.
- **¶3.** "we used to say that Zeus loved you more" is Butler's "we used to say". Faithful.
- **¶5.** "we sacrificed many a fat sheep and many an ox around you" is faithful and clear.
- **¶6.** "Over these bones" is a clarifying noun. The antecedent is the bones of Achilles, Patroclus and Antilochus at the end of ¶5. Nothing is added. OK.
- **¶9.**
  - "who would neither refuse outright to marry nor yet bring the matter to an end" is faithful to "did not say point blank that she would not marry, nor yet bring matters to an end". Neither…nor parses correctly.
  - It is close to accepted B16 ("will neither flatly refuse to marry nor bring the matter to an end"). B16's Butler wording differs ("will neither point blank say"), so identity is not required.
  - "embroidery frame", the web speech and "as the moons waned and many days went by" are **byte-identical to accepted B19 ¶13**. This includes "my skill", which Butler has here and in B19 but not in B2.
  - "ready for the time when death takes him" matches B2 ¶5 and B19 ¶13. OK.
- **¶10.**
  - "and the suitors fell thick on one another" is correct. Butler's "they" follows "let fly his deadly darts", and the Greek (24.181, τοὶ δ' ἀγχιστῖνοι ἔπιπτον) means the men fell, not the arrows. It is the same referent as ¶29 ("attacking the suitors whereon they fell thick").
  - The clarifying noun removes the reading "the arrows fell thick". The speaker is a suitor, but "us ill-fated suitors" earlier in the paragraph makes this natural.
  - "cunningly" is Butler's word. OK.
- **¶14 and ¶15.** "bondservants" and "bondservant" follow B04 for Butler's "bondsmen" and "bondman". "no stranger ever came to me whom I liked better" is faithful. OK.
- **¶16.**
  - "We who were his parents, his mother and I his father, could not throw our arms about him and wrap him in his shroud, nor could his excellent… wife Penelope mourn…" parses correctly: a negative main clause, then "nor could". Nothing is lost.
  - "if ever there was one" is a faithful gloss of "as ever was". OK.
- **¶20.** "the gifts he had promised to give me when he was here" is faithful. "when the heat of heaven lies heavy upon them" keeps Butler's image in a habitual present, and "them" is the vines. OK.
- **¶23.** "surprised" is Butler's word. OK.
- **¶24.** "If only, by Father Zeus, Athena, and Apollo, I were the man I was…" is the correct optative for "Would… that I were". "If I were still the man I was then, and had been in our house yesterday…" is grammatical, and "had been" still depends on "If". OK.
- **¶25.** "each took his proper place" is faithful. OK.
- **¶26.** "Welcome, then," for "All hail, therefore," is the right greeting sense and does not soften it. OK.
- **¶28.** "They took the dead away, each man buried his own dead, and put the bodies…" is a comma splice inside Butler's compound predicate, and "and put" now attaches to "each man". **Defect, blocking:** use "each man burying his own".
- **¶29.** "at which they fell thick on one another" is faithful to "whereon". The antecedent is "the suitors" right before it. OK.
- **¶30.** "laid hold of" is Butler's phrase. "…plainly and in all honesty, and said:" is **confirmed** as the GLOSSARY formula (line 513, B02-P009/P013, and B02 ¶8 in v6). The colon is the sanctioned formula, and ¶31 opens with the speech. OK.
- **¶35.** "she darted down from the highest peaks" is faithful. OK.
- **¶41.**
  - "best friend I have in the world" is Butler's phrase verbatim.
  - "pray to the blue-eyed maiden Athena": "blue-eyed" restores Butler's only use of the epithet, and "maiden" is a plain modern word for "damsel".
  - Adding "Athena" is a deliberate clarifying name. The goddess meant is Athena (Greek: Zeus's grey-eyed daughter), and ¶41's narration has just named Athena as the speaker. It does not break the Mentor disguise in a way Butler doesn't: the goddess speaking of herself in the third person is Homer's own device, and ¶42 "when he had prayed to her" confirms the referent.
  - The semicolon became a comma before "then poise your spear and hurl it", which is grammatical. OK.
- **¶42.** "for the helmet did not stop it" is faithful to "stayed it not", and the causal "for" is kept. OK.

No other additions, omissions, softening, lost causal "for", or name changes were found in the edited spans.
