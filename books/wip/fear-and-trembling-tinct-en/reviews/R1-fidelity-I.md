# R1 fidelity review — part I (ch7 Problema III, ¶29–41 + n7.47a)

Reviewer: independent fidelity reviewer (Danish → English). Draft: `drafts/I-ch7.json`. Source: `source/original-da-final.json` ch7 ¶29–41. I consulted no English translation. For consistency only, I checked sibling drafts (C, F, G, H, J) and the accepted pilot.

Structure check: 13 slots, indices 29–41. No merges or splits. `dividerBefore: "rule"` on ¶39 matches the source. The German in ¶29 is byte-identical to the source (7 internal `\n`, 8 lines), and the English bracket has 8 lines separated by " / ". n7.47a is kept out of the main text. Its `anchorAfterEn` "Faust is a doubter" is unique in ¶31 and matches the source anchor "…Faust er en Tvivler,". There are no omissions at sentence level anywhere in the range.

## Summary table

| ¶ | Verdict | BLOCKER | MAJOR | MINOR |
|---|---|---|---|---|
| 29 (German verse) | Minor defects | 0 | 0 | 2 |
| 30 | Minor defects | 0 | 0 | 5 |
| 31 | **Major defect** | 0 | 1 | 1 |
| n7.47a | Minor defects | 0 | 0 | 4 |
| 32 | Minor defects | 0 | 0 | 2 |
| 33 | Minor defects | 0 | 0 | 2 |
| 34 | PASS | 0 | 0 | 0 |
| 35 | PASS on modality; minor English | 0 | 0 | 1 |
| 36 | PASS | 0 | 0 | 0 |
| 37 | PASS | 0 | 0 | 0 |
| 38 | Minor defect | 0 | 0 | 1 |
| 39 | Minor defects | 0 | 0 | 2 |
| 40 | PASS | 0 | 0 | 0 |
| 41 | PASS | 0 | 0 | 0 |
| **Total** | | **0** | **1** | **20** |

---

## ¶29: German verse (Richard III, Schlegel–Tieck)

- German kept exactly, line breaks intact, opening "…" and the source's full stop after "baar." preserved. The bracketed English is a faithful line-by-line rendering of the German. The enjambment "halb kaum fertig / Gemacht" is kept. "hink' ich wo vorbei" → "if I limp past them anywhere" is correct (*wo* = *irgendwo*). Lines 1–2 are a single construction in German ("aller Reize baar, / vor … Nymphen mich zu brüsten" = lacking the charms to strut before nymphs). The English "bare of every charm / To strut before…" keeps that reading, which is acceptable given the source's full stop.
- **MINOR (MEANING SHIFT).** "Geschändet von der tückischen Natur" → "Disgraced by treacherous Nature". *geschändet* here is physical defilement or disfigurement, not social disgrace. **Fix:** "Defaced by treacherous Nature" or "Disfigured by treacherous Nature".
- **MINOR (FORMAT, cross-part).** I puts `\n` before the bracket and capitalizes each English line. J-ch7 ¶46, the other German verse block, puts a space before the bracket and lowercases continuation lines. Neither breaks §B, which is silent on the point, but the book needs one convention. **Fix:** harmonize at assembly (recommend I's `\n` form for verse).
- NOTE (not counted): NOTES-I says the German has "eight `\n` breaks". It has seven, and the eighth is the break before the bracket.

## ¶30

Sentence-by-sentence coverage is complete. Every sentence is present, including the stepmother simile, the Baggesen/Kildevalle quip, the Latin with its gloss, and the madness/genius questions. The irony toward the "younger versifiers" is kept.

- **MINOR (MEANING SHIFT, modality).** "Saadanne Naturer som Glosters kan man ikke frelse ved at mediere dem…" → "are not to be saved by mediating them…". "Are not to be" can read as "ought not to be". The Danish says *cannot*. **Fix:** "Natures such as Gloucester's cannot be saved by mediating them into an idea of society."
- **MINOR (ENGLISH / MEANING).** "med en phantastisk Forudsætning" → "with a fantastic presupposition". In modern English "fantastic" means "wonderful". *phantastisk* is "belonging to the imagination, fanciful". **Fix:** "and therefore on a fanciful presupposition" (or "on a presupposition of the imagination").
- **MINOR (DISTINCTION BLUR / AMBIGUITY).** "medens det Geniale er Forkjærlighedens Udtryk" → "while what is brilliant in him is the expression of divine favor". Two issues:
  - "brilliant" breaks the lexical family Geniet / det Geniale / Genialiteten (genius), which the paragraph is built on. The same happens with "de mest geniale Forfattere" → "most brilliant authors", which is tolerable.
  - *Forkjærlighed* is partiality or predilection, the counterpart of *Misundelse* (envy). "Favor" is softer. Supplying "divine" from the parallel is defensible.

  **Fix:** "while the genius in him is the expression of the divine partiality" (or "of divine predilection").
- **MINOR (ENGLISH).** "kan man construere den ene ud af den anden" → "Can the one be construed out of the other?" "Construe" means "interpret". *construere* means "construct, derive". **Fix:** "Can the one be constructed out of the other?" or "derived from the other?".
- **MINOR (small shift).** "burde Digteren nærmest først gjøre Allarm" → "the poets ought to be the very first to sound the alarm". The singular generic "the poet" has become plural. That is harmless for sense, but it loses Johannes's pointed singular before he turns on the plural "versifiers". **Fix:** "the poet ought, first and foremost, to raise the alarm."
- SENSITIVE: PASS, with an advisory note. "Cumberlands Jøden er saaledes ogsaa en Dæmon, om han end gjør det Gode" → "Cumberland's Jew, too, is a demon, even though he does good." Assessment against §E:
  - "Jew" is not a slur.
  - The phrase names the title figure of Cumberland's play *The Jew* (1794), a sympathetic character. The sentence follows directly from "by nature or by historical circumstance", so the point is exclusion from the universal and not blame. The text is explicit that the individual "bears no guilt" and that the figure "does good".
  - The period reference is kept correctly and without a gloss (§A.9).

  Advisory for the book-level review: a cold reader may take "Cumberland's Jew" as an ethnic label rather than a play's title character. If a gloss is judged essential, the minimal one is "the Jew of Cumberland's play". Do not remove or soften the term.
- PASS on the demonic terminology ("demonic paradox", "the beginning of the demonic", "a demon"). *Dæmon* → "demon" is literal and needed for "even though he does good".

## ¶31

- **MAJOR (DISTINCTION BLUR: the single individual).** "at en Enkelt ved at være skjult og ved sin Taushed vil frelse det Almene" → "a single individual who wants to save the universal by being concealed and by his silence".
  - *en Enkelt* is ordinary Danish for "an individual" or "someone". C-ch4 ¶6 renders the book's only other *en Enkelt* as "someone".
  - "Single individual" is the fixed rendering of the technical *den Enkelte*. Using it here tells the reader that Faust already occupies that category.
  - That undercuts the chapter's hinge at ¶37: "Kan Tvivleren derimod **blive** den Enkelte…" ("If, on the other hand, the doubter can **become** the single individual…"). The whole point is that the silent Faust who saves the universal is *not yet* the single individual in the absolute relation.

  **Fix:** "I will imagine one more case: an individual who wants to save the universal by being concealed and by his silence."
- **MINOR (VOICE).** "Dertil kan jeg bruge Sagnet om Faust" → "For this purpose the legend of Faust will serve." Johannes's first person disappeared, apparently while re-rendering against the screen. In this stretch he is the poet-manqué assembling his own case ("I will imagine…", "Let us make a small change", "my Faust"). **Fix:** "For this I can use the legend of Faust."
- Otherwise PASS:
  - κατ’ ἐξοχήν is kept and glossed ("the doubter above all others").
  - The ironic "when after all everyone has experienced doubt" is kept.
  - The royal-bonds and front-margin joke is intact.
  - "the same beaten track" adds "same", which is implicit in the Danish and acceptable.

## n7.47a (footnote to ¶31)

Complete: the ironist sketch, the fan series (every "han veed" clause present), the Aristophanes/Voltaire turn, the magnanimity argument, the ethical/aesthetic contrast and the closing "one more design". No omission.

- **MINOR (AMBIGUITY FLATTENED, modality: *tør*).** "Men tør han tie." → "But may he keep silent?" and "naar han har den, tør han saa tie" → "when he has it, may he then keep silent?". In 1843 Danish *turde* has both senses: "have the courage" and "be permitted, be entitled". Both are live here.
  - For the permission reading: the note then turns to what ethics determines ("Ethiken er en farlig Videnskab…"), and it ends with the paradox as the only way silence could be legitimate.
  - For the courage reading: the second question comes right after "I demand this magnanimity of him" (*Høimod*: literally high courage), and the passage goes on in the vocabulary of venturing ("paa den Conto vover man ikke Sligt").
  - "May" keeps only the first sense. "Dare he keep silent?" keeps both, because English "dare" in a question carries "has he the nerve" and "has he the right".
  - It also matches the book's practice elsewhere: J-ch7 ¶47 "da tør han ikke trøste" → "he dares not comfort", the pilot's "dares not flee" and "ventures to say", and G-ch7 ¶18 "does not dare approach". A reader of this edition will meet *tør* as "dare" everywhere else in Problema III.

  **Fix:** "But dare he keep silent?" and "but when he has it, dare he then keep silent?". Flag *tør* for book-level harmonization. C-ch4 ¶6 uses "may" for "man tør tale".
- **MINOR (MEANING SHIFT).** "om end Latterens Fordømmelse maaskee vil opdrage en frelst ung Slægt" → "even if the verdict of laughter…". *Fordømmelse* is condemnation, not a neutral verdict. It also echoes the note's own "lade Latteren dømme den forvildede Tid" and the chapter's *dømme*/condemn chain. **Fix:** "even if laughter's condemnation may perhaps bring up a young generation that is saved".
- **MINOR (ENGLISH / AMBIGUITY).** "Æsthetisk Høimod kan ikke hjælpe; thi paa den Conto vover man ikke Sligt" → "…for on that account one does not venture such things." "On that account" reads as "for that reason". The Danish means "on the strength of that" (on that credit). **Fix:** "for one does not venture such things on the strength of that."
- **MINOR (DISTINCTION / ENGLISH).** "en Forklaring af en Heros's Liv, der paa en sørgelig Maade forklarer dette … i denne Heros" → "a hero's life … in a sorry way … in this hero". Johannes uses the Greek-Latin *Heros*, distinct from *Helt* (the tragic hero, the aesthetic hero), and the English merges them. "In a sorry way" also reads as "shabbily" rather than "sadly, deplorably". **Fix:** "an explanation of a great hero's life (a *heros*) that explains it in a lamentable way", or at least "a sad way". Keep "hero" if the book prefers, but record the choice.
- PASS:
  - "the patient" is kept literal.
  - "ridiculousness" follows the standard's *Latterlighed* = ridiculous.
  - "lives there hidden" is right for *boer skjult* (skjult → hidden is permitted).
  - "Men tør han tie." ending in a period → question mark is correct: 1895 punctuation often ends questions with a period.

## ¶32

- **MINOR (AMBIGUITY, grammatical only, left unresolved).** "om Nogen vil bedrage ved at indbilde ham, at han har gjennemgaaet Tvivlen" → "if anyone tries to deceive him by making him believe that he has gone through doubt". Two readings are possible:
  - In context the second *han* is most naturally the deceiver, who claims to have gone through doubt. The next clause is about hearing whether a tried man or a Münchhausen (a braggart about his own exploits) is speaking.
  - The English invites the odd reading that Faust is being persuaded that *Faust* has gone through doubt.

  Standard §A.2 asks for pronoun resolution here. **Fix:** "if anyone tries to deceive him by persuading him that they themselves have gone through doubt".
- **MINOR (ENGLISH / terminology over-application).** "om det er en forsøgt Mand, der taler" → "whether it is a man who has been put to the proof who is speaking". *en forsøgt Mand* is a set phrase ("a tried, experienced man"). The fixed rule for the verb *forsøge* makes this clumsy, with a double "who". **Fix:** "whether the one speaking is a tried man or a Münchhausen". "Tried" keeps the root sense of *forsøge* without clashing with *Prøvelse* = test.
- PASS:
  - "cry of anxiety" (*Angest*) is correct, not "fear".
  - "thought's authorization" (*Bemyndigelse*) is consistent with ¶37 "authorization".
  - "He hides" for *skjuler* is correct.
  - The "girl … fruit of a sinful love" simile is intact.
  - "brings himself as a sacrifice" is literal; "offers himself as a sacrifice" would be more idiomatic. Optional, not counted.

## ¶33

- **MINOR (ENGLISH / AMBIGUITY).** "Denne Idee realiserer Faust." → "Faust realizes this idea." A modern reader may take "realizes" as "comes to understand". **Fix:** "Faust makes this idea real" or "Faust carries out this idea".
- **MINOR (MEANING SHIFT, logic).** "…der tvivle een Time i hvert Semester paa Kathederet, men forøvrigt kunne gjøre alt Andet, som da ogsaa dette uden Aandens Tilstand eller i Kraft af Aand" → "…but otherwise can do everything else — the doubting included, which they too manage without being in the condition of spirit and without acting by virtue of spirit". Two problems:
  - "Everything else … the doubting included" is self-contradictory, since doubting is not "else".
  - "they too" wrongly implies some other agents.

  The Danish: they can do everything else, *as they also do this* (the doubting), without the state of spirit or by virtue of spirit. The "without spirit" qualifies both. **Fix:** "…but otherwise can do everything else, just as they do this too, without being in a state of spirit or acting by virtue of spirit."
- PASS:
  - The Gregory of Rimini parallel, including *friste* → "tempted", which correctly keeps the fixed term.
  - tortor infantium / tortor heroum, both glossed.
  - The Margaret/concave-mirror sentence.
  - "life's daily bread" vs "joy's daily bread" and "nourishment" vs "food" (*Næring*/*Føde*) are kept distinct.
  - "pride" (*Stolthed*) is correctly kept apart from ¶36 "arrogance" (*Hovmod*).
  - Johannes's self-mocking "I am most inventive where tormenting heroes is concerned" is kept.

## ¶34 — PASS

Complete, including the parenthesis and the full clown catalogue:
- the doctor's certificate (keeps the *Doctor-Attest* double sense);
- "swear they have doubted everything" (fixed term);
- the express messengers and sprinters;
- *wirthschaften*, kept and glossed;
- fine and coarse sand.

"or perhaps, or perhaps" is kept. The "infinite passion" sentences are exact.

Check only, no defect: "gaae i Slæber" → "shuffle around in slippers". *Slæber* (slippers) fits the image of domestic sloppiness, and the drafter's reading is sound.

## ¶35 — modality PASS; 1 MINOR

- *tør* check. "Du tør ikke have Medlidenhed med det Almene" → "you may not have pity on the universal". **PASS.**
  - Ethics speaks in commands ("Du skal anerkjende…"), and here *tør ikke* is prohibitive: "you are not permitted to".
  - "Dare not" would wrongly make it a matter of the addressee's nerve.
  - English "may not" is a clear prohibition in this imperative frame. "Must not" is an acceptable alternative if the book-level pass wants to avoid any "might not" misreading.

  This differs from the note, where both senses are live (see n7.47a).
- **MINOR (ENGLISH, referent).** "thi om det ikke skeer, det faaer han først bag efter at vide, og Udfaldet kan ikke hjælpe Een" → "For only afterward does he find out whether that fails to happen; and the outcome is of no help to anyone". "That" has no clear antecedent. It means "whether the confusion does not in fact follow". *Een* is the generic "one" (the agent himself), so "anyone" broadens it slightly. **Fix:** "For whether it does not come to that, he learns only afterward; and the outcome cannot help a person, either in the moment of action or with regard to responsibility."
- PASS:
  - "ethics condemns him" (*dømmer*) and "judges a doubter harshly" (*bedømmer*) are distinguished.
  - "the movements happen in the normal way" is correct.
  - "sweet-tooths" (*Slikmunde*) is kept.
  - "the outcome" (*Udfaldet*) is the fixed term.
  - "responsibility" (*Ansvar*) is correct.

## ¶36 — PASS

"on his own responsibility" (*paa eget An- og Tilsvar*), "a small spiritual trial" (*Anfægtelse*, fixed term), "keep tormenting" (*pine*) and "hidden arrogance" (*krypt Hovmod*) are all accurate. The universal's reproach is complete, and the second question is correctly given its question mark.

## ¶37 — PASS

"become the single individual who as the single individual stands in an absolute relation to the absolute" is exact. "Turn his doubt into guilt" is right (*Skyld* = guilt). The concessive "even if he may get another doubt" is kept. "His silence can receive an authorization" shifts the subject from "he" to "his silence" without changing the sense. Acceptable.

## ¶38 — 1 MINOR

- **MINOR (ENGLISH / AMBIGUITY).** "Der forekommer endog Steder … som anprise Ironi, kun at den bruges til at skjule det Bedre" → "Indeed, the New Testament contains passages that commend irony — only it is used to hide what is better." "Only it is used…" reads as a flat statement. The Danish *kun at* restricts which irony is commended. *endog* is "even". **Fix:** "There are even passages in the New Testament that commend irony, provided only that it is used to hide what is better."
- PASS:
  - The Hegel sentence keeps its irony ("our age has good reasons not to give up … for it had better simply beware of irony").
  - Matt. 6:17–18 is freshly rendered from the Danish.
  - "incommensurable with reality" and "permitted to deceive" (*har Lov*) are correct.
  - "flit about with loose talk of the idea of the congregation" is correct.

## ¶39 — 2 MINOR

- **MINOR (ENGLISH, gloss needed).** "at Uforstaaeligheden kunde blive mere desultorisk" → "might become more desultory". *desultorisk* goes back to Latin *desultor*, the circus rider who leaps from horse to horse, so it means "leaping, discontinuous". English "desultory" now means chiefly "half-hearted, aimless", which gives the modern reader the wrong sense. §A.5 allows a dictionary-supported gloss. **Fix:** "more desultory (in the old sense: moving by leaps)". Use no further interpretation; the drafter's "made more palpable" should *not* be added.
- **MINOR (ADDITION, slight).** "i Misvisningens Øieblik" → "at the moment their compass needle swings off true". This correctly identifies *Misvisning* as compass declination. But it adds "their" and spells out a needle the Danish only implies, which turns one noun into an explicit conceit. It is not a meaning error. **Fix (leaner):** "at the moment of their deviation, like a compass needle's, could as it were indicate the boundary of the unknown land". Alternatively keep the current wording and record it as a deliberate first-and-only expansion.
- PASS:
  - "I have not forgotten, and the reader may now perhaps be good enough to remember" keeps the ironic courtesy.
  - "Abraham I cannot understand; him I can only admire" keeps Johannes's refrain and word order.
  - "stages", "sphere", "the paradox of sin", "far easier to explain than Abraham" are all correct.
  - The divider is correct.

## ¶40 — PASS

Complete, including "not to Sarah, not to Eliezer, not to Isaac". "The three ethical authorities" (*Instantser*) matches F-ch7 ¶1 "intermediate ethical authorities". Keep it; do not switch to "courts".

## ¶41 — PASS

"Aesthetics permitted — indeed, demanded — silence" is exact. So are:
- "an offense to aesthetics" (*Forargelse*);
- Johannes's "my sacrificing myself / someone else for my own sake";
- "by virtue of his accidental particularity" (*Enkelthed* = particularity, fixed);
- "human foreknowledge";
- "demands disclosure" (*Aabenbarelse* → disclosure, not revelation);
- "can speak, but will not".

The concealment/disclosure/silence terms are consistent.

---

## Terminology audit (range-wide)

| Term | Result |
|---|---|
| skjult / skjule / Taushed / tie / Aabenbarelse | concealed / hides / silence / keep silent / disclosure — **consistent**; no "revelation" |
| det Dæmoniske | the demonic — consistent |
| det Almene, den Enkelte | consistent, **except ¶31 *en Enkelt* (MAJOR above)** |
| Tvivl / Tvivler / tvivle om Alt | doubt / doubter / doubted everything — consistent |
| Anfægtelse / friste | spiritual trial / tempted — correct; no Prøvelse in range |
| Angest | anxiety — correct |
| det Æsthetiske / Æsthetiken / Ethiken / det Ethiske | aesthetic / aesthetics / ethics / the ethical — correct |
| Udfaldet, Ansvar, Bevægelse, uendelig Bevægelse, Lidenskab, Enkelthed, incommensurabel, Forargelse | correct |
| *tør* | ¶30 "if I dare say so" OK; ¶35 "may not" OK; n7.47a "may" → recommend "dare" |

## Overall judgment

This is a strong, complete and faithful draft. There are no omissions, no additions of interpretation, the voice is well kept (with one lapse in ¶31), the verse is handled correctly and the footnote is complete and correctly anchored. The one **MAJOR** is the ¶31 "a single individual" for *en Enkelt*. It must be fixed because it collapses the category distinction that ¶37 depends on. The 20 MINOR items are local fixes of wording or modality. Most important among them:
- *tør* → "dare" in n7.47a;
- the ¶33 "everything else — the doubting included" logic;
- the ¶32 pronoun;
- a dictionary gloss for "desultory".

**Verdict: accept after revision.** Fix the MAJOR and apply the MINOR fixes; no re-draft needed.
