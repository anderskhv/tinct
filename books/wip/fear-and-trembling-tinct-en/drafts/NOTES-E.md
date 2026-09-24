# NOTES — Part E (chapter 4, Preliminary Expectoration, final ¶18–¶34)

Output: `drafts/E-ch4.json` has 17 slots, indices 18–34, one per printed paragraph. There are no boundary moves, no headings and no dividers (all fields are `null` in the source). The text is about 4,400 words.

## 1. Footnotes: they are not in this range (please reconcile)

The assignment said Part E includes **n4.21a** and **n4.22a**. In `original-da-final.json`, **both notes sit on final ¶17**, which is outside E:

| id | final paragraph | Danish anchor (`anchorAfter`) |
|---|---|---|
| n4.21a | ¶17 (`anchorSlot` 21 in the old v2 numbering) | "…umulig lader sig oversætte fra Idealiteten til Realiteten." |
| n4.22a | ¶17 (`anchorSlot` 22 in the old v2 numbering) | "…da gjælder det om, at Bevægelsen skeer normalt." |

The numbers 21 and 22 are v2/served slot numbers. Final ¶17 merges v2 slots 21–23. None of the final paragraphs 18–34 has any notes, so every slot in `E-ch4.json` has `"notes": []`. I did not put the notes in my JSON, because the brief requires "exactly your slot range".

Whoever drafts ¶17 should carry them. The translations below are offered in case that drafter has not done them; merge them at their discretion. The `anchorAfterEn` must be taken from the ¶17 drafter's English.

- **n4.21a:** "It goes without saying that any other interest whatever, one in which an individual has concentrated for himself the whole reality of actual life, can give occasion for the movement of resignation when it proves unrealizable. I have chosen a love affair to show the movements on, however, because this interest is easier to understand, and so it spares me all the preliminary considerations that, in a deeper sense, could concern only a very few individuals."
- **n4.22a:** "This takes passion. Every movement of infinity comes about through passion, and no reflection can produce a movement. This is the continual leap in existence that explains the movement, whereas mediation is a chimera: in Hegel it is supposed to explain everything, and it is also the only thing he has never tried to explain. Even to make the well-known Socratic distinction between what one understands and what one does not understand takes passion, and still more, naturally, to make the real Socratic movement, the movement of ignorance. But what our age lacks is not reflection but passion. That is why, in a certain sense, our age is actually too tenacious of life to die; for dying is one of the most remarkable leaps. A little verse by a poet has always appealed to me greatly, because after five or six preceding lines in which he has beautifully and simply wished himself good things in life, he ends like this: ein seliger Sprung in die Ewigkeit [a blessed leap into eternity]."
  - The Danish "Tiden" is rendered "our age".
  - "seiglivet" means tough-lived, hard to kill.
  - The German line is kept, with its gloss in square brackets.

## 2. First-use definitions

| Term | Where | Treatment |
|---|---|---|
| the single individual | ¶18 ("whether the movement in the single individual is true or feigned"); again in ¶19 | Bare, following the pilot decision: no free-standing definition. |
| the aesthetic | ¶22: "Faith is therefore not an aesthetic emotion — a stirring of immediate feeling — but something far higher" | A brief gloss taken from the sentence's own contrast ("not the immediate impulse of the heart"). **Conflict to resolve:** STYLE §C says to define "the aesthetic" at first use *in Problema III*, but the brief's table puts first use at ch4 ¶22. I followed the brief. If the book-level review prefers the Problema III wording, ch7 should then use the term bare. |
| irony (and humor, ironist, humorist) | ¶28 | Plain, with no gloss, as the table says. |

All earlier terms are used bare: knight of faith, knight of infinite resignation (shortened to "knight of resignation" where the Danish says *Resignationens Ridder*), infinite resignation, the absurd, movement, paradox, philistinism, incommensurable.

## 3. Foreign-language glosses

- **¶18 *harmonia praestabilita*:** the source spelling is "præstabilita"; I normalized it to "praestabilita", glossed "a pre-established harmony".
- **¶19 *dira necessitas*:** glossed "a harsh necessity".
- **¶19 "Francaiser" → "the française":** the contredanse (a dance form) that follows the basic positions. It has no gloss beyond the context of the dance.
- **¶22 *Thaumaturg*:** "thaumaturge — a worker of wonders".
- **¶34 *Problemata*:** "problemata — questions set for debate". The word is kept because it gives the next three chapters their titles.

## 4. Terminology choices a reviewer should check

- **Virkelighed → "reality"** throughout: "no reality can take from him", "led him out into reality", "incommensurable with reality". The standard does not fix this word, and ¶17 (drafted by someone else) may have chosen "actuality". Align this at book level.
- **Vidunder / vidunderlig → "the marvel" / "wonderful", "wondrous".** "Mirakel" (¶31) → "miracle", kept distinct.
- **Forstand → "the understanding".**
- **Forvisning / forvisset → "certainty" / "sure, certain"** (the young girl, ¶22–23). "Forvissede sig om Umuligheden" (¶21) → "assured himself of the impossibility".
- **Prøvelse → "test"** (¶30–33), as the table requires. **forsøges → "be put to the proof"** (¶32, ¶33). **friste Gud → "tempt God"** (¶23).
- **Angst → "anxiety"** and **Nød → "distress"** (¶23, ¶33). **Qval → "torment"** (¶33). **frygte → "fear"** (¶33).
- **latterligt → "ridiculous"** (¶33, last sentence), not "absurd".
- **gribe → "grasp"** throughout, as in "grasp existence" and "grasp the whole of temporality". I avoided "seize" so the verb echoes consistently.
- **faae → "get".** This covers "get the princess", "get her back" and "by faith Abraham got Isaac". Keeping one verb preserves Johannes's plain *faae* refrain.
- **vinde → "win"** (¶24, eternal consciousness, eternity). **give Afkald paa → "renounce"**, and **opgive → "give up"** per the table.
- **blive staaende ved Troen → "stop at faith"** (¶27, four times plus once), per the table.
- **Samtiden / Lovtale** (¶27) → "the highest eulogy on my contemporaries". This echoes the chapter 3 title "Eulogy on Abraham".
- **Resignationens Ridder** (¶26) → "the knight of resignation", keeping Kierkegaard's shortened form.

## 5. Ambiguities: resolved or kept

- **¶18 "dens Gyldighed":** *dens* refers to the love, so I rendered it "that his love is valid". This is a grammatical resolution only.
- **¶18 "forklarede sig i en Kjærlighed til det evige Væsen":** rendered "was transfigured into". *forklare* means both "explain" and "transfigure"; the religious sense is the operative one here.
- **¶18 "introducere sig selv … indføre sig selv":** I kept the doubled self-admission ("introduce herself … introduce himself") to preserve the joke that this is an order you enroll yourself in.
- **¶18 "som der staaer i Visen":** rendered "as the old song has it". The song is not identified, and I added no gloss.
- **¶21 "i Kraft af, at for Gud er Alting muligt":** a Gospel echo, rendered freshly ("for God everything is possible"), not in KJV wording.
- **¶23 "uagtet den har indseet Umuligheden":** *den* is grammatically the unshakability (*Urokkelighed*), so it is rendered "even though faith's unshakability has seen the impossibility". This is a grammatical resolution only.
- **¶25:** the sentence beginning "I can bear everything — even if that dreadful demon … even if madness held up the fool's costume" is an anacoluthon in the Danish: "the demon" is apposed to "madness" and never gets its own verb. **I kept the broken syntax deliberately.**
- **¶25 "Knokkelmanden":** the Danish folk figure of Death as a skeleton, rendered "the skeleton Death".
- **¶26 "Endelighedens Stamherre":** a *Stamherre* holds an entailed family estate. Rendered "the hereditary lord of the finite".
- **¶26:** the refrain "And yet it must be glorious to get the princess" appears twice, identically, as in the Danish.
- **¶28 "som jeg ikke lader mit Ord men min Gjerning dømme":** rendered "which I let not my word but my deed judge". I kept the Danish order and left the ambiguity: does his deed judge the philistinism, or is the philistinism judged by his deed?
- **¶28 "hiin Troens Helt":** rendered "that hero of faith". It refers back to the knight of faith portrayed earlier in the chapter (the tax-collector figure), which is not in E. Please check it against the earlier drafter's wording.
- **¶22 "gaaet til Præsten":** the Danish means confirmation instruction. Rendered "gone to the pastor for instruction"; "for instruction" is the only word added.
- **¶22 "løbe til Herodes som til Pilatus":** this echoes the Danish idiom "from Herod to Pilate" (from pillar to post). The names are kept literally.
- **¶31 "tabe Næse og Mund":** an idiom, rendered "be struck dumb".
- **¶33 "halvfjerde Dag":** three and a half days, rendered "those three and a half days".
- **¶33 "Det troer jeg dog nok":** an everyday "troe", not faith. Rendered "I rather think one should".

## 6. Proper names and allusions

- Daub (Karl Daub) is kept without a gloss.
- The New Testament allusions are rendered freshly, not in KJV text:
  - Herod and Pilate;
  - the rich young man;
  - faith as a grain of mustard seed;
  - "every good gift" (James 1:17).
- Mount Moriah and the ram are kept.
- The Roman "censor general" is kept.

## 7. Doubts about the Danish text

None material. The ¶18–¶34 text reads cleanly. "Francaiser" is spelled without a cedilla in the source, which is a period spelling; I rendered it "française".

## 8. Independence screen

Command: `python3 …/scratchpad/screen.py drafts/E-ch4.json 14`

The **first pass** listed about 50 runs, many at 20–38 words. For each one I could equally well have phrased another way, I re-rendered from the Danish, staying equally accurate (for example ¶18's butterfly and princess sentences, ¶24's censor sentence and ¶33's leech sentence).

The **final pass** lists 3 runs, all kept:

| ¶ | Run | Why it is kept |
|---|---|---|
| ¶24 | "…the very least thing more than my eternal consciousness, for this is the paradox. The movements are often confused." (19 words) | Forced by close renderings of two short Danish sentences ("thi dette er det Paradoxe. Man forvexler ofte Bevægelserne.") using fixed terms ("the paradox", "the movements"). |
| ¶24 | "…make the infinite movement of resignation. In resignation I renounce everything. I make this movement" (15 words) | Fixed terminology and a short Danish sentence ("Ved Resignationen giver jeg Afkald paa Alt"). |
| ¶26 | "…be deceived by itself. And yet it must be glorious to get the princess! And yet" (16 words) | Johannes's refrain ("Og dog maa det være herligt at faae Prindsessen"), rendered closely. |

The screen's summary lines, verbatim:

```
TOTAL words 4331; in shared 8-word runs 25.7%; in runs>=12 8.1%; in runs>=16 0.8%
Calibration (Problema I-II): Lowrie vs Hong single-reference 12-word 3.8%, 16-word 1.4%. Diagnostic only; not legal clearance.
```

The runs of 12 words or more (8.1%) are mostly fixed-term chains, such as "make the infinite movement of resignation" and "by virtue of the absurd", together with short, plain Danish sentences. I did not distort anything to lower the number.

## 9. Revision r1 (after R1 fidelity review), 2026-09-24

- **Files:**
  - The pre-edit draft is saved as `drafts/history/E-ch4.r0.json`.
  - The full table of findings and new wordings is in `reviews/R1-applied-E.md`.
- **Result:** all 3 MAJOR and all 16 MINOR findings were applied. None was declined.
- **Changes that supersede §4:**
  - **Virkelighed → "actuality"** (book-level ruling, STYLE §C): ¶18 ×2, ¶28. *Realitet* ("reality") does not occur in ¶18–¶34.
    - In the §1 courtesy translation of n4.21a, the phrase "the whole reality of actual life" should read **"the whole reality of actuality"**, per the ruling.
  - **fatte → "comprehend" / "understand"; gribe → "grasp".**
    - ¶27: "comprehended the horror of life", "comprehend the thought", "This I cannot comprehend."
    - ¶18: "He has understood the deep secret".
    - Every remaining "grasp" in E renders *gribe*.
  - **faae → "get" without exception.** ¶24 now reads "by faith I get everything".
  - **det Paradoxe → "what is paradoxical"** (¶24). The §8 justification for that run as "fixed terminology" is withdrawn; the run no longer appears.
  - **The refrain in ¶26** now ends in a full stop both times, with no exclamation mark.
  - **The ¶22 aesthetic gloss** now reads "(the aesthetic being the sphere of immediate feeling)".
  - **The ¶24 conditional** "kan Du troe det" now reads "if you can believe it."
- **Screen after r1:** `TOTAL words 4332; in shared 8-word runs 25.3%; in runs>=12 8.3%; in runs>=16 0.4%`. Three runs remain:
  - ¶18 (15 words): forced, the reviewer's m1 wording following *modsiger / Modsigelse*;
  - ¶24 (15 words): fixed terms;
  - ¶26 (16 words): the refrain.
  - One new ¶26 run was re-rendered: "someone like that is no knight".
