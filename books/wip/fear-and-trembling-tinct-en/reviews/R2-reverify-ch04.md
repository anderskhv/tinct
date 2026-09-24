# R2 re-verification — Ch. 4 "Preliminary Expectoration" (readability edits, Parts C/D/E)

Verifier: fresh, independent, Danish → English. Inputs: `source/original-da-final.json` ch4, current `drafts/C-ch4.json`, `drafts/D-ch4.json`, `drafts/E-ch4.json`, the R2 applied logs and diffs, `R1-readability-ch04.md`, `STYLE-AND-TERMINOLOGY.md`, `DRAFTING-BRIEF.md`. No other English translation consulted. I also word-diffed each current draft against its pre-R2 copy (`drafts/history/*-ch4.r2.json`) to catch changes the logs do not mention.

## Summary

**Verdict: NOT approvable as it stands.** It becomes approvable once the seven items in §1 are fixed (six reverted regressions plus n4.21a). Those are one-line edits, and the text for each is already approved. After that fix the chapter is approvable, and the MINOR items in §2 are recommended but do not block.

- **BLOCKER (process): the R2 edits to Parts C and D were made on a stale text.** They silently undo all six fixes from the R1 re-verification round (`R1-reverify-applied-CE.md`, `R1-reverify-applied-D.md`). None of the six reversions is in the R2 applied logs, and the R2 diffs show them only as unexplained "before → after" changes. Two of them bring back violations of the book rulings (*tør*; *fatte*/*gribe*). Part E is clean: its five reverify fixes are all still present.
- **MAJOR: n4.21a changed a rendering that the standard prescribes word for word.** STYLE §C prescribes "the whole reality of actuality" for this note. The note now reads "the whole reality of what is actual".
- **The genuine R2 edits are faithful overall.** The one permitted added explanation (the mediation gloss in n4.22a) sits where the brief's table says, and the dictionary gloss "in an unequal marriage" is within policy. None of the other edits adds interpretation. There are 9 MINOR wording defects (§2), each with a fix. None of them is a blocker.
- **Readability:** of 40 items, 20 are RESOLVED, 10 PARTLY and 10 NOT. All 10 NOT, and the unresolved part of every PARTLY, are IDEA-level or source-level. Settling them would take explanation that the Danish lacks, so the drafters were right to refuse. See the §3 table.

---

## 1. Blocking / major defects

### 1a. Regressions of R1-reverify fixes (BLOCKER as a set)

Proof: `drafts/history/C-ch4.r2.json` and `D-ch4.r2.json` (the pre-R2 copies) contain the reverify wording. The current drafts contain the older, rejected R1 wording again.

| # | ¶ | Danish | Current (regressed) | Must be (approved reverify wording) | Severity of the individual item |
|---|---|---|---|---|---|
| R1 | C ¶6 | *saa tænker jeg vel, man **tør** tale uden Fare derom* | "one **may** speak of it without danger" | "one **dares** to speak of it without danger". The *tør* ruling of 2026-09-24 says "dare" unless the Danish is a prohibition. It also restores the echo of "If I do not dare" two sentences earlier. | MAJOR (ruling) |
| R2 | C ¶7 | *naar det **opfattes** i sin Storhed* | "when it is **grasped** in its greatness" | "when it is **understood** in its greatness". "Grasp" is reserved for *gribe*. | MAJOR (ruling) |
| R3 | C ¶4 | *slig tankeløs Lovprisen* | "such thoughtless **glorification**" | "such thoughtless **praise**". This keeps the *Lov-* family and avoids the modern sense of "glorifying a crime". | MINOR |
| R4 | D ¶16 | *ingen pyntet Borgermand, der Søndag-Eftermiddag gaaer ud paa Fresberg* | "no **solid** citizen, dressed up for his Sunday-afternoon walk out to Frederiksberg" | "no dressed-up citizen walking out to Frederiksberg on a Sunday afternoon". "Solid" is not in the Danish, and it pre-empts "He is solid through and through". | MINOR |
| R5 | D ¶17 | *og dog er **Forholdet** et saadant* | "the **relationship** is such that" | "the **circumstances** are such that" | MINOR |
| R6 | D ¶12 | *Dette har han nemlig ikke gjort* | "For he did not do this" | "For he did no such thing" | MINOR |

**Fix:** re-apply R1–R6 exactly as in the right-hand column. Then check that the candidate build (`fear-and-trembling-modern-en.candidate.json` and `candidate/review/ch04.md`) picks up the corrected drafts. Both currently carry the regressed text.

### 1b. n4.21a — MAJOR (terminology vs. an explicit standard entry)

- **Danish:** *hvilkensomhelst anden Interesse, i hvilken et Individ har **hele Virkelighedens Realitet** for sig concentreret*.
- **Now:** "the whole reality of what is actual".
- **The standard says:** STYLE §C, *Realitet* row: "In n4.21a both occur: 'the whole reality of actuality'." `R1-reverify-applied-D.md` also records that no change was needed here.
- The new wording keeps the *Virkelighed*/*Realitet* split, because "actual" belongs to the same word family as "actuality". So it is not a meaning error. But it overrides an explicit ruling without an editor's decision. For the newcomer it only halves the tautology: "reality of what is actual" still reads as a near-synonym pair (PARTLY).
- **Fix:** revert to "the whole reality of actuality". If the lead prefers the new wording, log a ruling and amend the STYLE §C row first. The reviewer's confusion here is the term distinction itself, which the book keeps on purpose.

---

## 2. Sentence-by-sentence check of the genuine R2 edits

Each changed sentence was compared with the Danish. Unless an edit is listed below with a defect, it is faithful: no omission, no addition beyond the permitted glosses, terminology intact, grammatical, and the voice kept.

### Part C (¶4, ¶6, ¶7, ¶10, ¶11)

| ¶ | Edit | Check against the Danish | Finding |
|---|---|---|---|
| 4 | "Or perhaps, just as he had ethically forgotten that Isaac was the son, that speaker had also forgotten something that corresponds to it." | Danish: *Eller havde maaskee hiin Taler glemt Noget, der svarede til den ethiske Forglemmelse, at Isaak var Sønnen.* "Something" (*Noget*) is correctly left unnamed. Casting *den ethiske Forglemmelse* as the speaker's own act is supported by ¶2, where the speaker swaps "Isaac" and "the best". Two problems remain. (a) "ethically forgotten" is odd English: it suggests forgetting *in an ethical manner*. (b) "corresponds to **it**" most naturally takes "that Isaac was the son" as its referent, not the forgetting. The Danish says the thing corresponds to the *forgetting*. "Also" is an inference, but a harmless one. | **MINOR.** Fix: "Or perhaps that speaker had forgotten something that corresponds to his ethical forgetting — his forgetting that Isaac was the son." |
| 4 | "the faith that makes the imitating hard for him" | *den Tro, der gjør ham det svært*: *det* = *eftergjøre*. Correct. | OK. Optional smoothing: "that makes imitating it hard for him". |
| 6 | "if, on the strength of that, everyone wanted to do the terrible deed that love has sanctified as an immortal exploit" | *hvis derfor Enhver vilde gjøre det Forfærdelige, som Kjærligheden har helliget som udødelig Bedrift*. "On the strength of that" is a fair rendering of *derfor* (it names the passing feeling as the ground). "Deed" narrows *det Forfærdelige* ("the terrible"). The narrowing is licensed by the relative clause (*Bedrift*), but it breaks the echo with "what is terrible in Abraham's deed" (¶7) and "the terrible" (¶10), both *det Forfærdelige*. | **MINOR.** Fix: "to do the terrible thing that love has sanctified…", or "to do what is terrible, which love has sanctified…". |
| 7 | "would, of course, be a spiritual trial — an inner assault on him" | *saa var jo enhver Tanke om at offre Isaak en Anfægtelse*. "Of course" = *jo*. "On him" matches the pilot's own gloss in P-ch5 ("an inner assault on him"), so it is consistent. | OK. |
| 7 | "so that if God wanted Isaac, God would have to take him himself" | *saa Gud selv maatte tage Isaak, hvis han vilde have ham*. Faithful. | OK. |
| 7 | "though not here, in time" | *men i Tiden bliver han det ikke*. "Here" is a small deictic addition. It stays within "in time" and does not add "this life", but the Danish does not have it. | **MINOR (optional).** A closer fix that still removes the "punctually" reading: "— though he does not become so within time." |
| 7 | "Would not even the most believing ages have passed that same judgment on such a person?" | *Vilde man, selv i de mest troende Tider, ikke dømme saaledes om et saadant Menneske?* The subject moves from *man* (people) to the ages. That is idiomatic and loses nothing. | OK. |
| 10 | "I cannot help looking at her pictures" | *at jeg maa see derpaa, … hun maler*. The referent is resolved from "she paints" in the same sentence. | OK. |
| 10 | "For me, God's love is incommensurable — … — with the whole of actuality, and that in both a direct and an inverse sense." | *Guds Kjærlighed er mig, baade i direkte og omvendt Forstand, incommensurabel for hele Virkeligheden*. The reordering is complete. The gloss is at its prescribed first use. | OK. |
| 10 | "married with the left hand — in an unequal marriage" | *viet til venstre Haand*. A dictionary-sense idiom gloss, which the task permits. It does not say who ranks lower. | OK (permitted). |
| 10 | "For I do not deny, and never shall deny, that this is humility." | *thi at det er Ydmyghed, det negter jeg ikke og skal aldrig negte*. Faithful. | OK. |
| 11 | "Are all my contemporaries … Unless I am much mistaken about them, they are inclined rather to take pride in doing what they probably do not even believe me capable of — namely, the imperfect." | *Mon virkelig Enhver i min Samtid … Dersom jeg ikke har taget meget feil af den, da er den snarere tilbøielig til at være stolt af at gjøre hvad den vel end ikke troer mig istand til ɔ: det Ufuldkomne.* *Samtid* is rendered by "contemporaries" with plural "they". That is legitimate. The irony is intact. | OK. |
| 11 | "for if I had, I would have held back even at the very last minute — though without arriving at Mount Moriah too late on that account." | *thi da havde jeg holdt igjen selv i det sidste Minut, uden at jeg derfor var kommen for silde*. *da* = "in that case" (had I loved as Abraham did). That is the only coherent reading, so resolving it is a permitted grammatical disambiguation. "Held back" is kept unexplained, correctly. | OK. |

### Part D (¶12, ¶13, ¶14, ¶16, ¶17, n4.21a, n4.22a)

| ¶ | Edit | Check against the Danish | Finding |
|---|---|---|---|
| 12 | "arrived at the state he was in at the start" | *naaet hen til sin første Tilstand*. Faithful, and it avoids glossing the double movement. | OK. |
| 12 | "to lose one's understanding — and with it the whole of finitude, since the understanding is the broker who handles all its exchanges — and then…" | *tabe sin Forstand og dermed hele den Endelighed, hvis Vexel-Mægler den er*. The Danish has a relative clause ("whose bill-broker it is"). "Since" makes explicit a link that *dermed* implies, which the standard allows. "**All**" is an intensifier not in the Danish. | NIT. Fix: "the broker who handles its exchanges". |
| 12 | "turns his reflection on himself / on God" | *reflekterer paa sig selv / paa Gud*. The direction is right, and the category of reflection is kept. **But** ¶28 (Part E) repeats the same Danish verb with *ogsaa*: *Ironi og Humor reflektere **ogsaa** paa sig selv*. That "also" points back to ¶12. ¶28 still reads "Irony and humor also reflect on themselves". So one Danish phrase now has two renderings, and the backward link is weakened. | **MINOR (consistency).** Fix ¶28: "Irony and humor also turn their reflection on themselves, and therefore…". |
| 13 | "The last stage to vanish from his sight is infinite resignation" | *Det sidste Stadium, han taber af Sigte*. Faithful. The drafter was right to reject "last one in sight", which inverts the meaning. The first-use gloss is present, as the brief prescribes. | OK. |
| 14 | "cheat God out of the first movement of faith" | *bedrage Gud for*. Idiomatic and faithful. The drafter correctly declined to add "(resignation)". | OK. |
| 14 | "Perhaps one or two may **even** manage this" | *Maaskee lykkes det En og Anden*. "Even" is an irony cue the Danish does not contain. It is the same kind of cue the drafters rightly refused for "Abraham's *supposed* pettiness" (¶11). | **MINOR (addition of tone).** Fix: "Perhaps one or two may manage this; for our age…". |
| 16 | "his remaining in finitude bore no trace of the cowed, anxious drill of a trained animal" | *hans Forbliven i Endeligheden havde intet Spor af en forknyt beængstet Dressur*. *Dressur* is the breaking-in of animals, so "of a trained animal" spells out the word's dictionary sense. It is at the edge of the permitted idiom-gloss class, but inside it: no new idea, no new image beyond the word itself. | OK (acceptable). |
| 17 | "the whole result of his thinking it through" | *hele Tanke-Operationens Resultat*. The sense is kept, but "it" has no antecedent (the love? the situation?), and the phrase is slightly awkward. | **MINOR.** Fix: "the whole result of his reasoning", or "the whole result of his thought-process". |
| n4.21a | see §1b | | MAJOR |
| n4.22a | "mediation (Hegel's term for reconciling opposites in a higher unity) is a chimera" | *Mediationen er en Chimaire, som hos Hegel skal forklare Alt*. The gloss is exactly the brief's text, at the brief's location. I confirmed from the source that *Mediation*/*mediere* occurs nowhere earlier in ch1–4 (ch4 ¶2 has *Mediterende*). The parenthesis does not disturb the anchor. | OK (permitted). |

### Part E (¶19, ¶21, ¶23, ¶24, ¶25, ¶26, ¶28)

| ¶ | Edit | Check against the Danish | Finding |
|---|---|---|---|
| 19 | "must necessarily be present **in the movement**, one is **thereby** saying … — **and that** strikes me as crass materialism" | *nødvendigt maa være tilstede, saa siger man dermed … hvilket forekommer mig*. "Thereby" = *dermed*. "In the movement" makes explicit the location that the previous clause implies (*om Bevægelsen er normal*). It is a grammatical resolution and adds no idea. | OK. |
| 21 | "But to possess it in this way is, of course, at the same time to give it up; and yet for the understanding such possessing is no absurdity." | *det er ved at resignere derpaa, men denne Besidden er jo tillige en Opgiven, men dog er denne Besidden for Forstanden ingen Absurditet*. The Danish also lacks a noun antecedent. "In this way" ties the phrase to "by resigning it" without importing "in the eternal sense". Faithful. | OK. |
| 23 | "for what, then, is tempting God?" | *thi hvad er da det at friste Gud?* Faithful. *friste* = "tempt", as ruled. | OK. |
| 24 | "where he stands on it" | *paa Scalaen, for at see, hvor han er*. "On it" makes the referent explicit. | OK. |
| 25 | "…the skeleton Death who frightens people — even if madness held up…" | The anacoluthon is genuinely in the Danish (the demon clause has no verb), and it is preserved. The dash marks the restart. | OK. |
| 25 | "I will not become a sulker" | *Suurmuler*. Faithful, and the register is now level. | OK. |
| 26 | The parenthesis is moved ahead of the climax as its own sentence: "It was conceivable too, of course, that … future happiness. To get the princess in this way…" | Nothing is dropped, and the move stays within the paragraph. **But** the Danish parenthesis opens with ***thi***: it gives the reason why *saaledes* ("in this way") carries the stress, since the knight of resignation could also get her. As a free-standing sentence after "a stranger and a foreigner", the reason-giving link is gone. The new sentence can even be read as continuing the "stranger" point. The standard requires connectives to be made explicit, not dropped. | **MINOR (lost connective).** Fix, which makes *thi* explicit without adding an idea: "…a stranger and a foreigner. For it was conceivable too, of course, that the knight of resignation might get the princess; but his soul had seen through the impossibility of their future happiness. So it is getting her **in this way** that counts: to get the princess in this way, …". A lighter alternative is to keep the move but begin the following sentence "No — to get the princess in this way…". |
| 28 | "which I let be judged not by my word but by my deed" | *som jeg ikke lader mit Ord men min Gjerning dømme*. The passive keeps the Danish sense (my deed judges it) and its order. | OK. |
| 28 | "their elasticity lies in the individual's being incommensurable with actuality" | *de have deres Elasticitet i, at Individet er incommensurabelt for Virkeligheden*. Faithful. "Actuality" follows the ruling. | OK. See ¶12 for the "reflect on themselves" consistency fix in the preceding clause. |

The ¶26 refrain is still intact. All the Part E reverify fixes are still present: "provided you can believe it", "point out that the journey", "still dares to turn around", "before he really dies", "some bit of finitude".

---

## 3. Readability items: is the obstacle removed?

Ratings assume the §1 and §2 fixes are applied. IDEA means the remaining difficulty is in the Danish, and no further wording change is owed.

| ¶ | Reader's item | Result | Note |
|---|---|---|---|
| 4 | "ethical forgetting" | PARTLY | The syntax is clearer. With the §2 fix the "corresponds to what" question is answered. That the forgotten thing is faith comes from the next sentence, as in the Danish. |
| 4 | "makes it hard" referent | RESOLVED | |
| 6 | "terrible thing that love has sanctified" | PARTLY (IDEA) | The Danish names no example. |
| 7 | spiritual-trial logic | PARTLY (IDEA) | The gloss cannot say "temptation, not test" without adding. The contrast is carried by "Only such a man is given such a test". |
| 7 | "God himself must take Isaac" | RESOLVED | |
| 7 | "not in time" | RESOLVED | |
| 7 | "judge … in this way" | RESOLVED | |
| 8–10 | "movement" before the swimming image | NOT (IDEA/order) | Correctly left alone, per the brief. |
| 10 | "direct and inverse sense" | PARTLY (IDEA) | The main claim now comes first. The phrase itself is unexplained in the Danish. |
| 10 | "married with the left hand" | RESOLVED | Dictionary gloss. |
| 10 | "For that this is humility I do not deny" | RESOLVED | |
| 10 | "looking at it" | RESOLVED | |
| 11 | "the imperfect" pronoun chain | RESOLVED | The irony is still left to the reader, as in the Danish. |
| 11 | "for then … held back" | RESOLVED (referent) / PARTLY (IDEA) | "Held back" is left unexplained, as in the Danish. |
| 11 | "tragic hero" and "king's service" | NOT (IDEA) | Correctly kept. The brief says no gloss. |
| 12 | "first condition" | RESOLVED | |
| 12 | "exchange broker" | PARTLY | The metaphor is Kierkegaard's own, now readable in its own clause. |
| 12 | "reflects on" | RESOLVED | Align ¶28, per §2. |
| 13 | "loses sight of" | RESOLVED | |
| 14 | "first movement of faith" / "succeed at it" / "for" | PARTLY | The referent of "this" is fixed. The identification with resignation and the sarcastic "for" are IDEA-level. |
| 16 | "cowed and anxious drilling" | RESOLVED | |
| 17 + n | reality vs actuality | PARTLY | See §1b. The distinction is deliberate, and the reader is not owed an explanation. |
| 17 | "does not give up his love" | NOT (IDEA) | "Give up" is a fixed term, and ¶18 resolves the point. The drafter was right to keep it. |
| 17 | two conditions blur | PARTLY (IDEA) | The Danish repeats the failure clause verbatim. |
| 17 n | "mediation" | RESOLVED | The gloss is where the brief puts it. |
| 19 | necessity → death → materialism | PARTLY (IDEA) | The Danish supplies no bridge. |
| 21 | "this possessing" | RESOLVED | |
| 23 | "tempt God" | NOT (IDEA) | Not a wording obstacle. Correctly left. |
| 25 | "even if … even if" | RESOLVED | The anacoluthon is kept and marked. |
| 25 | "sourpuss" | RESOLVED | |
| 26 | parenthesis at the climax | RESOLVED | Restore *thi*, per §2. |
| 28 | "let my deed … pass judgment" | RESOLVED | |
| 28 | "have their elasticity in" | PARTLY (IDEA) | |
| 24 | "which scale?" | RESOLVED | |
| 22 | Herod/Pilate | NOT (source) | Kept, correctly. |
| 24 | "starve myself out" | NOT (source) | Kept, correctly. |
| 25 | "romance" | NOT (source) | Kept, correctly. |
| 27 | Daub; coach and four | NOT (source) | Kept, correctly. |
| 0–2 | ornamental allusions | NOT (source) | Kept, correctly. The reader rated them LIGHT. |
| 11 | "Abraham's pettiness" cue | NOT (source) | "Supposed" is correctly refused. For consistency, ¶14's "even" should go too. |

The decisions not to change wording (KEPT) are all sound. None of them withholds a fix the Danish would permit.

---

## 4. Required actions before approval

1. Re-apply R1–R6 (§1a) in `drafts/C-ch4.json` and `drafts/D-ch4.json`, and regenerate the candidate files.
2. n4.21a: revert to "the whole reality of actuality", or log a ruling and amend STYLE §C.
3. Recommended MINOR fixes:
   - ¶4 "ethically forgotten … it";
   - ¶6 "deed";
   - ¶14 "even";
   - ¶17 "thinking it through";
   - ¶26 restore *thi*;
   - ¶28 "turn their reflection on themselves", to match ¶12;
   - optional: ¶7 "here" and ¶12 "all".

The fixes in items 1 and 2 restore text that has already been approved, or follow the standard verbatim. They need no further review round beyond a diff check that the R2 readability edits survived.
