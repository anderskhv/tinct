# b09 fidelity + repair review: Ch 26–29 (Part 4 ch 6 to Part 5 ch 3)

## Coverage

| Chapter | Range read | Paragraphs |
|---|---|---|
| Ch 26 (Part 4, Ch 6) | 26.0–26.105 | 106 |
| Ch 27 (Part 5, Ch 1) | 27.0–27.91 | 92 |
| Ch 28 (Part 5, Ch 2) | 28.0–28.39 | 40 |
| Ch 29 (Part 5, Ch 3) | 29.0–29.78 | 79 |
| **Total** | | **317** |

I read every source/candidate pair in order and side by side, using `view.py pair`. The total matches the batch spec (317). I found no cross-boundary drift or duplication: every paragraph's content stays in its own paragraph.

## Findings summary

There are **139 proposals** in `F.json`, and **20** of them are blocking. `apply.py check --dry` accepts all 139 and rejects none.

| Category | Count |
|---|---|
| hesitation (F4) | 32 |
| omission | 31 |
| emphasis (F5) | 31 |
| register | 17 |
| meaning | 13 |
| certainty (F6) | 6 |
| invented | 3 |
| syntax | 3 |
| period (F7) | 2 |
| reference | 1 |

### Most important findings

**F4 hesitation.** These chapters have the heaviest losses, as expected.

- **26.21:** Nikolay's "I... killed... with an axe" was smoothed.
- **26.87:** Raskolnikov's "then... then what can they do to him?" was flattened.
- **27.19:** Lebeziatnikov's muddle on fighting and equality had all four breaks removed ("unthinkable... I am not so stupid... there is fighting... confound it"), which made his muddle read as coherent.
- **27.90:** His "if I were to be married, pfoo! I mean if I were to marry" was lost.
- **27.10:** Luzhin's "at that... at the widow's" was lost.
- **27.50:** Luzhin's "I wanted to speak to her about... However", where he breaks off to hide his object, was lost.
- **27.69:** Sonia's broken-off "more comprehen..." was lost.
- **27.73:** Sonia's "and... and... and" was cut down.
- **27.80:** "once in her life" was lost.
- **29.64:** Raskolnikov's delicate "the... character of Sofya Semyonovna, that is, hinted at..." was compressed into a flat paraphrase.

**Known F7 items.**

- **27.7:** "system of Fourier and the Darwinian theory" is restored.
- **27.2:** Luzhin's "why on earth was I such a Jew?" had been softened to "stingy". It is restored under the F7 policy (compare 6.3).

**Meaning and certainty.**

- **29.52:** Lebeziatnikov's testimony "I knew for certain it was a hundred-rouble note" had become "I happened to know". This is the linchpin of the exposure, so the fix is blocking. "I saw everything clearly" also overstates what he admits about the view from the window.
- **26.46:** "whom he had invited to the police station" had become "tried to drag".
- **26.67:** "circumstantially" had become "with hard evidence", and the concessive "though playing a bold game" was lost.
- **27.30:** "what is stupid here" had become "degrading".
- **27.5:** "certain interesting circles" had become "notorious", and Luzhin's motive "Couldn't he gain something through them?" was dropped.
- **27.79:** "Tomorrow it will all fall upon you again" had become "you'll all be back to having nothing", which loses the burden that falls on Sonia.
- **28.16:** "My late husband would have done them honour" had been made factual. The break "and, of course, he is not like..." with its turn to Amalia had been dropped.
- **28.27:** The trailing "that they were both..." was cut.
- **29.72:** "till that moment she had fancied" had become "until that day she'd believed". "Had felt" had become "had always known".

**F5 emphasis.** The lost italics are restored:

- Ch 26: _good-bye_, _the_ house, _might_, _facts_, _from underground_, _trivial_, _delirium_, _psychology_, _cuts both ways_.
- Ch 27: _being shown up_, _here_, _of use_, _useful_, _interesting_, _her_, _saw_, _legal_, _legality_.
- Ch 28: _keenly_, _dare_, _business_, _that young person_, _are_ ladies, _gold_, plus the foreign-word italics _Pani_, _pan_, _die Wäsche_, _dame_, _Vater (aus Berlin)_.
- Ch 29: _compelled_, _compassion_ (ironic), _Gott der Barmherzige!_, _pan_.

**Register.** Porfiry's and Luzhin's sniggering "he-he" had been normalized to "ha-ha" in 17 places. It is restored as part of their voices. The candidate keeps "he-he" in other chapters.

**Chronology in Ch 29.** I checked Luzhin's account in 29.8 against 27.52–27.84: the counting, then Sonia's entry, the ten roubles, seeing her to the door, the ten minutes with Lebeziatnikov, Lebeziatnikov going out, and the missing note. I also checked Lebeziatnikov's account in 29.49, 29.52 and 29.57: he saw the note taken up during the ten-rouble handover, saw it shifted from the right hand to the left as Luzhin rose, and saw it slipped in at the door, then stopped at Kobilatnikov's on his way. Both accounts match the source and the earlier scene. The only chronology drift in the chapter was 29.72 ("that moment" had become "that day"), which is fixed.

## Considered and rejected

- **27.34, "modern":** The source reads "timid, chaste and modern", an evident Garnett or typesetting slip for "modest". The candidate's "modest" is correct, and I left it.
- **27.6, "half-animate abortions":** The candidate has "half-formed creatures". The sense of a misbegotten thing is kept, and restoring the literal word would mislead modern listeners, so I left it.
- **29.67, "lajdak":** The candidate glosses it as "scoundrel", which a listener needs. I restored only the italic on _pan_.
- **27.43, "something unpleasant" versus "indecent":** Lebeziatnikov does mean the indecent reading, so this is not a real distortion.
- **28.36:** The candidate puts "and probably something worse" inside quotation marks, which the source does not. This is a harmless typographical choice.
- **29.14:** "House porter" became "building superintendent". This is acceptable modernization.
- **Minor dropped trailing ellipses:** Several are left where no hesitation is lost, including 26.2, 27.28, 27.54 and 29.45. Many others are restored where they mark faltering speech.
- **Luzhin's "preternatural":** It was rendered "abnormal" in 27.66–27.67. This is plainer but faithful. The fix that matters is keeping Sonia's broken-off word in 27.69.

## Verdict

After these repairs the batch is faithful. It keeps Lebeziatnikov's jargon and his muddle, Luzhin's calculating, hedged stiffness, Katerina Ivanovna's grand indignation and Amalia's broken German. I left no passage unresolved.

One item needs the lead's policy call: 27.2 "such a Jew" is restored under F7 as the source's period prejudice, voiced by Luzhin. If the house policy differs, drop that one proposal. The rest of the paragraph's repairs do not depend on it.
