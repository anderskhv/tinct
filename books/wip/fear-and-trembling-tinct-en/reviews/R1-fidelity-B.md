# R1 — Fidelity review, Part B (ch3 Eulogy on Abraham, ¶0–13)

Reviewer: independent fidelity reviewer (Danish → English). I compared `drafts/B-ch3.json` with `source/original-da-final.json` (chapter 3, ¶0–13) sentence by sentence, against `STYLE-AND-TERMINOLOGY.md`, `DRAFTING-BRIEF.md` and the register of the pilot Problema I. I consulted no English translation. I grepped the other drafts only to check how *urimelig* and *latterlig* are rendered across the book.

## Summary

| ¶ | Verdict | BLOCKER | MAJOR | MINOR |
|---|---|---|---|---|
| 0 | **Defects** | 0 | **1** | 11 |
| 1 | **Defects** | 0 | **1** | 7 |
| 2 | **Defects** (the MAJOR covers ¶2, ¶3, ¶6 and ¶8) | 0 | **1** | 2 |
| 3 | Defects (minor) | 0 | 0 | 10 |
| 4 | PASS | 0 | 0 | 0 |
| 5 | Defects (minor) | 0 | 0 | 2 |
| 6 | Defects (minor) | 0 | 0 | 5 |
| 7 | Defects (minor) | 0 | 0 | 4 |
| 8 | Defects (minor) | 0 | 0 | 1 |
| 9 | PASS | 0 | 0 | 0 |
| 10 | Defects (minor) | 0 | 0 | 8 |
| 11 | PASS | 0 | 0 | 0 |
| 12 | Defects (minor) | 0 | 0 | 2 |
| 13 | Defects (minor) | 0 | 0 | 2 |
| **Total** | | **0** | **3** | **54** |

**Structure checks: all pass.**
- There are 14 slots, indices 0–13. Nothing is merged, split or moved.
- `dividerBefore: "asterism"` is on ¶13 only, as in the source. Every `sectionHeading` is null.
- `notes` is empty everywhere, which matches the source.
- There are no markers in the text, and the quotes are typographic.

**Omissions.** No clause of any substance is omitted. Every rhetorical question, exclamation, hedge (*vel*, *maaskee*, *jo*), example and allusion is present. The defects are local ones: dropped connectives (*Thi*, *men*), hedges that have become stronger, and parallels or refrains that the second re-rendering has broken.

**Refrain consistency.**

| Danish refrain | Verdict |
|---|---|
| *Abraham troede* → "Abraham had faith" | Consistent everywhere (¶3, ¶7–¶9) |
| *Ved Troen* → "It was by faith that" | Consistent |
| *Det er menneskeligt … saligere at betragte den Troende* | Consistent in ¶2 and ¶3 |
| *Ærværdige Fader Abraham!* ×3 | Consistent |
| *Glemsel* → forgetfulness | Consistent |
| *veemodig* → melancholy | Consistent |
| *Prøvelse/prøve* → test, *friste/Fristelse* → tempt/temptation | Consistent |
| *det var Gud, der prøvede* | Broken in ¶10. ¶6 has a related break ("det var Herren, der paalagde Prøvelsen"). |
| *stride med* → "struggle with" | Broken in ¶0 ("battling against") |
| *skal (ikke) glemmes / mindes* | Mixed "shall" and "will" (¶0, ¶1, ¶3) |
| *Tiden gik hen* → "Time went on" | Broken in ¶0 ("time has gone by") |
| *Elsker* → "lover" | Broken in ¶13 ("the one who loves you") |
| *stor ved* → "great by" | Thinned in ¶1 (see MAJOR 2) |
| *Der var den, der …* | Flattened in ¶1 and varied in ¶2 and ¶3 |

These are minor one at a time. Together, they are the main way the hymnic architecture has been worn down by the anti-echo re-rendering.

---

## MAJOR findings

### MAJOR 1 — ¶0: "han tager Intet af sit Eget" (MEANING SHIFT)

- **Danish:** "han tager Intet af sit Eget, men er misundelig paa det Betroede."
- **English:** "He takes nothing that is his own, but he is jealous of what was entrusted to him."
- **Problem:** *tage af sit Eget* means "take from (draw on) what is his own". It echoes John 16:14–15, where the Spirit "shall take of mine". The poet contributes nothing out of his own store; he only draws on the deposit entrusted to him. "Takes nothing that is his own" says something else, and it is close to nonsense: that he declines to take possession of his own property. It also destroys the contrast with *det Betroede* that the *men* sets up (nothing of his own ↔ what was entrusted). The drafter's own NOTES cite the John echo, but the English does not carry it.
- **Fix:** "He takes nothing from what is his own; he is jealous, rather, of what was entrusted to him." A plainer alternative: "He brings nothing of his own, but he is jealous of what was entrusted to him." The first keeps the verb *tage* and the Johannine echo, so I prefer it. Keep "jealous of". It rightly keeps both "possessive" and "envious" open.

### MAJOR 2 — ¶1: the "Der var den, der …" anaphora and the first "var stor ved" series are flattened (VOICE)

- **Danish:** "Saaledes blev der stridt paa Jorden: **der var den, der** overvandt Alt ved sin Kraft, og **der var den, der** overvandt Gud ved sin Afmagt. **Der var den, der** stolede paa sig selv og vandt Alt, **der var den, der** tryg ved sin Styrke offrede Alt, men **den, der** troede Gud, var større end Alle. **Der var den, der var stor ved** sin Kraft, og **den, der var stor ved** sin Viisdom, og **den, der var stor ved** sit Haab, og **den, der var stor ved** sin Kjærlighed, men Abraham var større end Alle, **stor ved** den Kraft … **stor ved** den Viisdom … **stor ved** det Haab … **stor ved** den Kjærlighed …"
- **English:** "one man conquered everything by his power, and another conquered God by his powerlessness. One man relied on himself …; another, safe in his own strength, …; but the one who had faith in God … One man was great by his power, and one by his wisdom, and one by his hope, and one by his love; but Abraham was greater than everyone — great by …"
- **Problem:** This is the climax of the eulogy's litany. The Danish builds it from eight repetitions of "der var den, der" / "den, der", all converging on "den, der troede Gud". It then gives two matched fourfold series, "den, der var stor ved sin X" ×4 and "stor ved den X, hvis …" ×4. The mirrored pair (power/wisdom/hope/love, then each one inverted) is the paradox being staged. The draft has three faults:
  1. It replaces the anaphora with "one man … another". That loses the formula, adds the gendered "man", and cuts the link to "the one who had faith in God".
  2. It prints "was great by" only once in the first series, so the first set of four no longer mirrors the second.
  3. It breaks the paragraph's own "the one who …" pattern ("the one who loved himself", "the one who struggled with God").
- **Fix:** "That is how there was struggle on earth: there was the one who conquered everything by his power, and there was the one who conquered God by his powerlessness. There was the one who relied on himself and won everything; there was the one who, secure in his strength, sacrificed everything; but the one who believed God was greater than everyone. There was the one who was great by his power, and the one who was great by his wisdom, and the one who was great by his hope, and the one who was great by his love; but Abraham was greater than everyone — great by the power whose strength is powerlessness, …". The minors below cover "struggle went", "gained" and "believed God".

### MAJOR 3 — ¶2, ¶3, ¶6, ¶8: *urimelig / det Urimelige* → "preposterous" (DISTINCTION BLUR / register; needs a book-level ruling)

- **Occurrences:**
  - ¶2 "det er jo urimeligt" → "the whole thing was preposterous";
  - ¶3 "det blev urimeligt" → "it became preposterous";
  - ¶6 "gjorde han det Urimelige virkeligt" → "made the preposterous actual";
  - ¶8 "han troede det Urimelige" → "he believed the preposterous".
- **Assessment:** The drafter is right to keep *urimelig* apart from *det Absurde*. The four renderings are consistent, and this is the only chapter that uses the word (grep of the source). But "preposterous" is the wrong key.
  - Its core is ridicule: outrageous, laughably contrary to sense. That puts it in the semantic field of *latterlig*, which the standard reserves for "ridiculous" and fences off from the faith vocabulary.
  - *Urimelig* is literally *u-rimelig*, "un-reasonable": contrary to what is reasonable or likely. In ¶2 it is set explicitly against "hans jordiske Forstand", his earthly understanding. It carries no scorn.
  - "He believed the preposterous" is also the Eulogy's thesis sentence and the forerunner of "by virtue of the absurd" in ch4. In English it sounds flippant, almost comic, which is a voice defect at the most quotable point of the chapter.
- **Fix:** Use **"unreasonable / the unreasonable"**, which is literal, keeps the link to *Forstand*, and stays distinct from "absurd":
  - ¶2: "would have thought: but this is unreasonable."
  - ¶3: "Time went on; it became unreasonable; Abraham had faith."
  - ¶6: "he had made the unreasonable actual."
  - ¶8: "he believed the unreasonable."

  If "the unreasonable" is judged too flat, a second choice is "what defies reason" (¶6 "made what defies reason actual"; ¶8 "he believed what defies reason"). Either way, record the rendering in STYLE-AND-TERMINOLOGY §C so that no later part slides into "absurd" or "preposterous".

---

## Per-paragraph findings

### ¶0 — MAJOR 1 (above), plus 11 MINOR

1. **MINOR / MEANING (image).** "en bundløs Tomhed, **aldrig mættet**" → "which nothing ever fills". *Mættet* means "sated". It is the hunger image that prepares "altid hungrig lurede paa sit Bytte" a few lines later. Fix: "a bottomless emptiness, never sated".
2. **MINOR / VOICE.** "dersom den ene Slægt stod op efter den anden som Løvet i Skoven, **dersom** den ene Slægt afløste den anden som Fuglesangen i Skoven" → "suppose the generations sprang up … like leaves in a wood, **and** replaced one another like the songs of birds". Two *dersom* clauses have been merged into one. This is the only place where the anaphora "suppose … suppose" drops a beat. Fix: "…like leaves in a wood; suppose one generation replaced the other like birdsong in a wood".
3. **MINOR / ENGLISH.** "lurked, forever hungry, for its prey". "Lurk for" is not idiomatic. Fix: "lay in wait, forever hungry, for its prey".
4. **MINOR / MEANING (connective).** "glad ved, at det dog ikke er ham selv, **at** hans Kjærlighed kan være Beundring" → "glad that it is not himself after all, **so that** his love is free to be admiration". The second *at* is parallel to the first, as a second object of *glad ved*. "So that … free to" turns it into a consequence and adds "free". Fix: "glad that it is not himself after all, glad that his love can be admiration."
5. **MINOR / AMBIGUITY FLATTENED.** "kan Intet gjøre uden **minde om**, hvad der er gjort" → "All he can do is **remind people of** what has been done". *Minde om* here is "call to mind, commemorate". "Remind people" adds an audience and narrows the sense. ¶13 renders the same verb "remembers". Fix: "All he can do is call to mind what has been done".
6. **MINOR / CONNECTIVE.** "Han følger sit Hjertes Valg, **men** naar han har fundet det Søgte" → "…; **and** when he has found". The *men* contrasts a private choice with a public proclamation. Fix: "but when he has found…".
7. **MINOR / CONSISTENCY.** "hans **ydmyge** Gjerning" → "his **lowly** task". ¶13 renders *ydmyg* "humble" twice, and the poet's humility there echoes this passage. Fix: "his humble task".
8. **MINOR / REFRAIN.** "**strider** han Dag og Nat **med** Glemselens Underfundighed" → "**battling** night and day **against** the craft of forgetfulness". *Stride med* is the refrain of ¶1 and ¶13 ("struggle with"). The poet's struggle with forgetfulness is the lesser counterpart of the struggle with God. "Battling" also collides with *kæmpe* ("fought", ¶5). The NOTES table lists this refrain but misses ¶0. Fix: "struggling day and night with the craft of forgetfulness".
9. **MINOR / VOICE (chiasmus).** "Helten er **ligesom** hans bedre Væsen" → "**something like** his better being", but "Digteren er **ligesom** Heltens bedre Væsen" → "**like** the hero's better being". The mirror (the hero is the poet's better being; the poet is the hero's) should be worded identically. Fix: "as it were, his better being" and "as it were, the hero's better being".
10. **MINOR / REFRAIN (modality).** "Derfor **skal** Ingen være glemt" → "no one who was great **will** be forgotten". ¶1 answers it directly with "Nei! Ingen **skal** glemmes" → "**shall** be forgotten", and "Enhver skal mindes" is "shall" too. ¶3 "derfor skal han heller ikke glemmes" is also rendered "will". *Skal* here is a decree or promise, so use "shall" everywhere (¶0, ¶1, ¶3). Fix: "So no one who was great shall be forgotten." ¶3: "therefore he too shall not be forgotten."
11. **MINOR / REFRAIN.** "jo længere **Tiden gik hen**" → "the more time **has gone by**". This is the ¶3 refrain "Time went on", and the tense is also shifted. Fix: "the longer time went on, the more faithfully he clings to him."

Passes worth recording:
- "Erindringens Genius" → "the presiding spirit of recollection" is acceptable. "Presiding" is a mild gloss, but plain "genius" would mislead.
- "misundelig paa" → "jealous of" is correct, and it keeps both readings open.
- "vel kraftesløs … men ogsaa forklaret, som et Minde er det" is excellent.

### ¶1 — MAJOR 2 (above), plus 7 MINOR

12. **MINOR / REFRAIN.** "blev stor **ved** sig selv" → "grew great **by means of** himself", next to "grew great **by** his devotion". This breaks the "great by" chain in its first link. Fix: "grew great through himself" is possible, but only if every "stor ved" in ¶1 becomes "great through". Otherwise accept "great by himself" (the context rules out "alone").
13. **MINOR / MEANING.** "**i Forhold til** dets Storhed" (and twice more) → "**in keeping with**". The sense is proportional: the greatness corresponds to the magnitude of what is loved, expected or struggled with. "In keeping with" means "consistent with". Fix: "in proportion to" at all three places.
14. **MINOR / VOICE.** "det Mulige … det Evige … det Umulige" → "what was possible … what is eternal … the impossible". The three matched substantives are broken up, with a stray tense shift. Fix: "by expecting the possible, another by expecting the eternal; but the one who expected the impossible…".
15. **MINOR / MEANING.** "i Forhold til sin **Forventning**" → "in keeping with **what he expected**". *Forventning* is a key word of the chapter (¶3 "expectation" ×6). Fix: "in proportion to his expectation".
16. **MINOR / ENGLISH & SENSE.** "**Saaledes blev der stridt** i Verden / paa Jorden" → "That is how **the struggle went**". "Went" suggests an outcome ("how it turned out"). The Danish means "thus was there struggling". Fix: "So there was struggle in the world, man against man, one against a thousand… So there was struggle on earth:".
17. **MINOR / BIBLE–DISTINCTION.** "den, der **troede Gud**" → "the one who **had faith in God**". *Troe Gud* (no *paa*) is "believe God", taking God at his word. It is the wording of Gen. 15:6 / Rom. 4:3 in the Danish Bible ("Abraham troede Gud"). The standard allows "believe" for *troe* with an object, and the NOTES table says so, but here the draft chose "had faith in". Fix: "the one who believed God".
18. **MINOR / CONSISTENCY.** "stolede paa sig selv og **vandt** Alt" → "**gained** everything". ¶13 "Du **vandt** jo Alt" → "you had **won** everything" echoes this line: Abraham wins everything, as the self-reliant man did. Fix: "won everything".

Passes: the closing four paradoxes are exact. "Afmagt → powerlessness", "Daarskab → foolishness", "Vanvid → madness" and "Had til sig selv → hatred of oneself" are all right.

### ¶2 — MAJOR 3 (above), plus 2 MINOR

19. **MINOR / VOICE (formula).** "**Der var i Verden ogsaa den, der** levede forviist" → "**Someone else in the world also** lived banished". The same formula in ¶3 ("Der var den i Verden, der ogsaa havde en Forventning") is rendered "There was another in the world who…". The two figures (the exile, the one who expected) are deliberately parallel. Fix, in both places: "There was also one in the world who lived banished…" / "There was one in the world who also had an expectation."
20. **MINOR / HEDGE.** "ellers var han vel **ikke** vandret ud, men havde **tænkt**, det er jo urimeligt" → "he would **never** have set out, but would have **reasoned** that the whole thing was…". "Never" strengthens *ikke*. "Reasoned" and "the whole thing" are additions, and the direct thought loses its *jo*. Fix: "Otherwise, presumably, he would not have set out, but would have thought: this is unreasonable, after all."

Passes: "Han lod Eet tilbage, tog Eet med sig…" keeps its chiasm; "fristede … hans Sjæl" → "tempted his soul" is correct; the "Det er menneskeligt…" refrain is correct.

### ¶3 — 10 MINOR

21. **MINOR / MEANING.** "**Muligheden var der**" → "**it was possible**". The Danish noun matters because the chapter plays possible against impossible. Fix: "Time went on; the possibility was there; Abraham had faith."
22. **MINOR / ENGLISH.** "han var ikke **ussel** nok til at have glemt" → "not so **mean-spirited**". *Ussel* means wretched, paltry or base; "mean-spirited" means unkind. Fix: "not so wretched as to forget".
23. **MINOR / CONSISTENCY.** "Sorgen **bedrog** ham ikke, som Livet havde gjort det" → "sorrow did not **cheat** him", but later "**bedraget** af Livet" → "**deceived** by life". It is the same verb, and it states the same fact about life. Fix: "sorrow did not deceive him, as life had done".
24. **MINOR / ADDITION.** "medens **Tiderne gik**" → "as **the seasons turned**". This adds imagery. Fix: "as the times went by".
25. **MINOR / OMISSION.** "sang han ikke for Sara **sit** veemodige Qvad" → "a melancholy song". Fix: "he did not sing Sarah to sleep with his melancholy lay" (or "…lull Sarah with his melancholy song").
26. **MINOR / ECHO.** "holdt Forjættelsen **fast**" → "**would not let** the promise **go**". This loses the verbal echo with "fastholde" (→ "hold fast") a few lines later, which is the paragraph's point, and it adds a volitional "would". Fix: "held fast to the promise".
27. **MINOR / ENGLISH (scope).** "jeg skjuler intet hemmeligt Nag, **fordi** Du negtede det" → "I bear no hidden grudge because you refused it". The English can be misread as "the reason I bear no grudge is that you refused". Fix: "I hide no secret grudge against you for refusing it."
28. **MINOR / HEDGE.** "da var **vel** Sara død af Sorg" → "would **no doubt** have died". *Vel* is "presumably" (the draft uses that for *vel* in ¶2). Fix: "Sarah would probably have died of grief".
29. **MINOR / ECHO.** "Abraham og Sara **vare unge nok** til at ønske" → "had **youth enough** to wish". The previous sentence has "var ung nok" ×2 → "young enough". The third repetition is the point. Fix: "were young enough to wish".
30. **MINOR / ECHO.** "for med stor Besværlighed at faae det **opfyldt** i Alderdommen" → "**granted**". This loses the link to "Opfyldelsen" / "Forjættelsens Opfyldelse" ("fulfillment") later in the paragraph. Fix: "so that with great difficulty it may be fulfilled in old age?"

Checked and accepted:
- The two *Er det … / Saa var det …* sentences are rendered as questions. The final period in "…i Alderdommen." looks like a period question, not an assertion.
- Joining "Hvis Abraham havde vaklet … Han havde sagt" into one sentence is acceptable.
- "fullness of time" and the Moses sentence are accurate.

### ¶4 — PASS

"Then there was gladness in Abraham's house, when Sarah stood a bride on their golden wedding day." This is exact.

### ¶5 — 2 MINOR

31. **MINOR / ENGLISH–ALLUSION.** "hiin **aarvaagne** Fjende, der aldrig **blunder**" → "that sleepless enemy who never **nods**". "Nods" reads as "Homer nods", or as a nod of the head. It also loses the Ps. 121:4 ring of *blunde* ("slumber"). *Aarvaagen* means "watchful". Fix: "that watchful enemy who never slumbers".
32. **MINOR / ENGLISH (Bible).** "tag Isaak Din **eneste** Søn … **gaa hen** i det Land Morija" → "your **one and only** son … **go off** to the land". "One and only" is a colloquial cliché, and "go off" is casual. Fix: "Take Isaac, your only son, whom you love; go to the land of Moriah, and there sacrifice him as a burnt offering on a mountain I will show you." "Point out" is fine too, but *vise* is "show".

Passes: "put to the proof" (*forsøges*) and "God tempted Abraham" follow the standard.

### ¶6 — 5 MINOR

33. **MINOR / MEANING.** "Alt **forspildt**" (×3) → "**squandered**". "Squandered" implies a prodigal agent spending something recklessly. *Forspildt* here means "wasted, lost, brought to nothing", with no one squandering anything. Fix: "wasted" (e.g. "So everything was wasted"; "All was wasted!"; "Now everything was to be wasted!"). Use "lost" if "wasted" feels thin.
34. **MINOR / ENGLISH.** "**forfærdeligere** end om det aldrig var skeet" → "**more terribly** than if it had never been". The Danish adjective is predicative. The English adverb makes "squandered more terribly" nonsense. Fix: "— more terrible than if it had never happened!"
35. **MINOR / MEANING.** "Er der ingen Medlidenhed med den ærværdige Olding, ingen med det uskyldige Barn!" → "Does no one pity …, does no one pity …!". The Danish is impersonal ("is there no pity"), and it includes God's pity, so "no one" narrows the target. The elliptical "ingen med…" is also lost. Fix: "Is there no pity for the venerable old man, none for the innocent child!"
36. **MINOR / VOICE (refrain).** "**det var Herren, der** paalagde Prøvelsen" → "the test was laid on him by the Lord". The cleft prefigures "det var Gud, der prøvede ham" at the end of the paragraph. Fix: "and it was the Lord who laid the test on him."
37. **MINOR / OMISSION (connective).** "**Thi** Afsked skulde Abraham vel tage med Isaak…" → the "For" is dropped. It explains why the blessing hour will not come. Fix: "For Abraham would indeed say farewell to Isaac…".

Passes: the two "Who is this…" pairs (the ?/! split is an acceptable reading); "Slægtens herlige Ihukommelse" left open; "woe — woe to the messenger"; "But it was God who was testing Abraham."

### ¶7 — 4 MINOR

38. **MINOR / HEDGE.** "da havde han **vel** lettere kastet Alt bort" → "it would **surely** have been easier". Fix: "he would presumably have found it easier to throw everything away".
39. **MINOR / MEANING (concession).** "der yderst i Synskredsen aner sin Gjenstand, **dog** adskilt fra den ved et svælgende Dyb" → "…while a gaping chasm … keeps it apart". The *dog* ("yet") is lost. Fix: "which dimly senses its object at the very edge of the horizon, yet is separated from it by a gaping chasm in which despair plays its game."
40. **MINOR / ENGLISH.** "Isaak, hans **Kjæreste** i Livet" → "the dearest **thing** in his life". This turns Isaac into an object. Fix: "Isaac, the one dearest to him in life".
41. **MINOR / ADDITION.** "en Kjærlighed, for hvilken det kun var et fattigt Udtryk" → "a love **so great** that…". "So great" is not in the Danish. Fix: "He embraced Isaac with a love for which it was only a poor expression to say that he faithfully fulfilled a father's duty to love his son". "Omfattede" is "embraced", which is better than "held".

Passes: "Jacob had twelve sons, and one he loved" keeps the double reading.

### ¶8 — 1 MINOR

42. **MINOR / CONSISTENCY.** "en ledende Stjerne, der **frelser** den Ængstede" → "**rescues** the anxious". The same verb is rendered "saved" in ¶3 ("frelst Mange"), and *frelse* carries a salvific sense. Fix: "a guiding star that saves the anxious".

On the drafter's query about *at*: **the reading is confirmed.** "Lad Isaak aldrig faae det at vide, at han maa trøste sig ved sin Ungdom" is optative or final. *Maa* is the older "may", as in ¶9 "at han maatte bevæge Herren". The alternative "must console himself" is much weaker. A small improvement: "so that he may take comfort in his youth". The optative "may" is closer than "can". This is optional and not counted.

Passes: the counterfactual series (correctly without "bound Isaac"); "the child of the promise"; "Ængstede → the anxious", in line with *Angest*.

### ¶9 — PASS

"hoping to move the Lord" is an acceptable rendering of "at han maatte bevæge Herren".

### ¶10 — 8 MINOR

43. **MINOR / ENGLISH.** "**de** tunge Tilskikkelser" → "heavy **dispensations**". The article is dropped. "Dispensations" is opaque theological jargon to a newcomer, and it risks being read as "exemptions". Fix: "the heavy visitations" (or "the heavy trials of fortune"; the drafter's worry about collision with "test" and "spiritual trial" argues for "visitations").
44. **MINOR / ENGLISH.** "flyttede **dog** ikke Foden sig…" → "**Even so**, did your foot not drag … **all the same**". *Dog* is rendered twice. Fix: drop "all the same".
45. **MINOR / VOICE.** "**Ikke saaledes** Abraham" → "Abraham was not like that", but "**Ikke saaledes** med Abraham" → "With Abraham it was different". This is a formula and should be worded alike. Fix: "Not so Abraham." / "Not so with Abraham."
46. **MINOR / VOICE.** "Han talte **Intet** til Sara, **Intet** til Elieser" → "He said not a word to Sarah or to Eliezer". The repetition is lost. Fix: "He said nothing to Sarah, nothing to Eliezer".
47. **MINOR / CONSISTENCY & OMISSION.** "der var jo dog Ingen, der i den Forstand var **Forjættelsens Barn**" → "none of those children was **a child of promise**". ¶8 has "the child of the promise". "Jo dog" ("after all") is dropped, and "none of those children" narrows *Ingen*. Fix: "yet there was, after all, no one who was the child of the promise in the sense that Isaac was for Abraham."
48. **MINOR / VOICE.** The second "**Der var mangen Fader**, der mistede sit Barn" → "Many fathers lost their child". The anaphora with the first ("There were many fathers who…") is broken. Fix: "There were many fathers who lost their child; but then it was God…".
49. **MINOR / REFRAIN.** "Han vidste, **det var Gud** den Almægtige, **der prøvede ham**" → "He knew that the one testing him was God Almighty". This is the ¶6 refrain. Fix: "He knew it was God Almighty who was testing him".
50. **MINOR / ADDITION.** "det tungeste Offer, der kunde fordres af ham" → "anyone could demand of him". This adds an agent. Fix: "the heaviest sacrifice that could be demanded of him".

Passes:
- The Abraham/Gen. 3:9 conflation is kept, rightly.
- "Hide me … Fall on me" is fresh.
- "did you answer, or did you not — perhaps quietly, in a whisper?" is acceptable and keeps the ambiguity.
- "Had the temptation not, by its very nature, exacted from him a vow of silence?" is good.

### ¶11 — PASS

The paragraph is exact. The hedge "perhaps" is kept, the emendation "rarer still" is correct, and the irony of "it was only a test" survives.

### ¶12 — 2 MINOR

51. **MINOR / OMISSION (connective).** "**Thi** hans Tilbagetog var en Flugt" → "His retreat would have been a flight". The "For" is dropped. Fix: "For his retreat would have been a flight, his rescue a chance…". "Mere accident" adds "mere"; "a chance" or "an accident" is enough.
52. **MINOR / ADDITION.** "Dette skulde da nævnes ikke som Ararat … men nævnes som **en Forfærdelse**" → "**But** it would be named … as **a place of horror**". "But" adds a contrast between sentences, and "place of" is added. Fix: "It would then be mentioned not as Ararat is, where the Ark came to rest, but mentioned as a horror, because it was here that Abraham doubted."

### ¶13 — 2 MINOR

53. **MINOR / VOICE (apostrophe).** "men **Du behøver** ingen sildig Elsker" → "but no late-born lover **is needed**". The passive drops the "you" in a passage built on *Du*. Fix: "but you need no late-coming lover to wrench your memory from the grip of forgetfulness".
54. **MINOR / REFRAIN.** "og dog lønner Du **Din Elsker herligere** end Nogen" → "you reward **the one who loves you more richly** than anyone else does". The sentence before says "lover", and so does ¶0, so the "lover" refrain breaks here. *Herligere* is "more gloriously"; *herlig* runs through the chapter as "glorious" and "splendid". Fix: "and yet you reward your lover more gloriously than anyone does".

Passes:
- "Venerable Father Abraham!" appears three times, consistently.
- "Second father of our kind!" is left open.
- "that divine madness which the pagans admired" follows the nearest antecedent correctly.
- "got no further than faith" keeps the "go further" echo.
- The contrast between "in the beyond" and "here" is kept.

---

## Notes on the drafter's NOTES

- The NOTES table says *troe* with an object gives "the one who believes". The text actually has "the one who has faith keeps an eternal youth" (¶3, *den, der troer*), which is correct for the intransitive verb. Update the NOTES; no text change is needed.
- The NOTES list of refrains should add *stride med* in ¶0, *Tiden gik hen* in ¶0 and *Der var den, der* (¶1–¶3) once the fixes above are applied.

## Overall judgment

The draft is **accurate at the level of propositions**. Nothing substantive is missing, no allusion is lost, the terminology table (test/temptation/put to the proof, faith/believe, anxiety) is followed, and the Genesis and other biblical renderings are fresh and follow Kierkegaard's Danish wording. ¶4, ¶9 and ¶11 are clean, and the four closing paradoxes of ¶1 and the ¶13 apostrophes are exact.

The weaknesses come from re-rendering sentences twice to avoid echoes:

1. **One real sense error** (MAJOR 1, "takes nothing that is his own").
2. **Erosion of the eulogy's architecture.** The ¶1 litany is flattened (MAJOR 2), and about a dozen minors each break an anaphora, a refrain or a verbal echo (*stride med*, *skal glemmes*, *Tiden gik hen*, *Elsker*, *det var Gud der prøvede*, *Ikke saaledes*, *Der var mangen Fader*, *fastholde*, *young enough*).
3. **A key term in the wrong register** (MAJOR 3, "preposterous"), which needs a book-level ruling.
4. **Scattered hedge strengthenings** (*vel* → "no doubt" or "surely") and dropped connectives (*Thi*, *men*).

**Verdict: revise, then accept.** The fixes are all local, and no paragraph needs re-drafting from scratch. The independence screen should be re-run after the fixes. The restored anaphoras are Kierkegaard's own repetitions, not borrowed phrasing, and short formulaic repeats of that kind are forced renderings under the brief's rule.
