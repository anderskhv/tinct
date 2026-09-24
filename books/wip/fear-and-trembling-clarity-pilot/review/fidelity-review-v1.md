# Fidelity review: candidate-v1 (Problema I and II), checked against the 1895 Danish

Reviewer: independent fidelity pass. I compared the candidate only with `source/original-da-sections-5-6.json` and with the raw OCR (`books/raw/fear-and-trembling/raw.txt`). I did not open `baseline/`, `comparison/` or any English translation.

Method: I read every slot sentence by sentence, Danish against English. For each mid-sentence page-break pair I checked that the moved words are neither lost nor duplicated. I checked both footnotes against the OCR (P-I, lines 2940–2962; P-II, lines 3503–3525). I also scanned the whole candidate for how consistently it renders the key terms.

## Summary table

| Slot | Verdict | BLOCKER | MAJOR | MINOR |
|---|---|---|---|---|
| P-I 0 | Defects | 0 | 2 | 1 |
| P-I 1 | Defects | 0 | 0 | 2 |
| P-I 2 | Defects | 0 | 0 | 1 |
| P-I 3 | PASS | 0 | 0 | 0 |
| P-I 4 | Defects | 0 | 0 | 1 |
| P-I 5 | PASS | 0 | 0 | 0 |
| P-I 6 | PASS | 0 | 0 | 0 |
| P-I 7 | PASS | 0 | 0 | 0 |
| P-I 8 | PASS | 0 | 0 | 0 |
| P-I 9 | PASS | 0 | 0 | 0 |
| P-I 10 | PASS | 0 | 0 | 0 |
| P-I 11 | PASS | 0 | 0 | 0 |
| P-I 12 | PASS | 0 | 0 | 0 |
| P-I 13 | Defects | 0 | 0 | 1 |
| P-I 14 | PASS | 0 | 0 | 0 |
| P-I 15 | PASS | 0 | 0 | 0 |
| P-I 16 | Defects | 0 | 1 | 1 |
| P-I 17 | PASS | 0 | 0 | 0 |
| P-I 18 | Defects | 0 | 0 | 2 |
| P-I 19 | PASS | 0 | 0 | 0 |
| P-I 20 | PASS (boundary checked) | 0 | 0 | 0 |
| P-I 21 | PASS (boundary checked) | 0 | 0 | 0 |
| P-I 22 | Defects | 0 | 0 | 1 |
| P-I 23 | Defects | 0 | 0 | 1 |
| P-I 24 | Defects | 0 | 0 | 3 |
| P-I 25 | PASS (boundary checked) | 0 | 0 | 0 |
| P-I 26 | Defects | 0 | 0 | 1 |
| P-I 27 | PASS | 0 | 0 | 0 |
| P-I 28 | PASS | 0 | 0 | 0 |
| P-I 29 | PASS | 0 | 0 | 0 |
| P-I 30 | PASS (boundary checked) | 0 | 0 | 0 |
| P-I 31 | Defects | 0 | 0 | 1 |
| P-I footnote (Lessing) | Defects | 0 | 0 | 1 |
| P-II 0 | Defects | 0 | 0 | 1 |
| P-II 1 | Defects | 0 | 0 | 1 |
| P-II 2 | PASS (boundary checked) | 0 | 0 | 0 |
| P-II 3 | Defects | 0 | 0 | 1 |
| P-II 4 | Defects | 0 | 0 | 1 |
| P-II 5 | PASS | 0 | 0 | 0 |
| P-II 6 | PASS | 0 | 0 | 0 |
| P-II 7 | Defects | 0 | 0 | 2 |
| P-II 8 | PASS | 0 | 0 | 0 |
| P-II 9 | PASS | 0 | 0 | 0 |
| P-II 10 | Defects | 0 | 0 | 1 |
| P-II 11 | PASS (boundary checked) | 0 | 0 | 0 |
| P-II 12 | Defects | 0 | 0 | 1 |
| P-II 13 | PASS (boundary checked) | 0 | 0 | 0 |
| P-II 14 | PASS | 0 | 0 | 0 |
| P-II 15 | PASS | 0 | 0 | 0 |
| P-II 16 | Defects | 0 | 0 | 1 |
| P-II 17 | PASS (boundary checked) | 0 | 0 | 0 |
| P-II 18 | Defects | 0 | 0 | 1 |
| P-II 19 | PASS | 0 | 0 | 0 |
| P-II 20 | PASS (boundary checked) | 0 | 0 | 0 |
| P-II 21 | PASS | 0 | 0 | 0 |
| P-II 22 | Defects | 0 | 0 | 1 |
| P-II 23 | PASS | 0 | 0 | 0 |
| P-II 24 | Defects | 0 | 0 | 1 |
| P-II 25 | PASS (boundary checked) | 0 | 0 | 0 |
| P-II 26 | PASS | 0 | 0 | 0 |
| P-II 27 | Defects | 0 | 0 | 2 |
| P-II 28 | PASS | 0 | 0 | 0 |
| P-II footnote (wish/duty) | PASS | 0 | 0 | 0 |
| **Total** | | **0** | **3** | **32** |

Of the 63 items (61 slots and 2 footnotes), 36 pass outright. I found no BLOCKER.

## Findings by slot: Problema I

### P-I 0: 2 MAJOR, 1 MINOR

1. **MAJOR: meaning shift and distinction blur (the single individual).**
   - DA: "Umiddelbar sandselig og sjælelig bestemmet er den Enkelte den Enkelte, der i det Almene har sit τέλος"
   - EN: "The single individual — the individual person, defined as he immediately is, a being of senses and soul — is the single individual who has his telos in the universal."
   - In the source, "umiddelbar … bestemmet" is an adverbial qualification: *taken* immediately, the single individual has his telos in the universal. The candidate turns it into a dash apposition, and TERMINOLOGY.md treats that apposition as the term's first-use definition. As a result, "the single individual" is defined as the immediate, sensuous-psychical person. That definition then governs "the single individual as the single individual" in faith, which the source explicitly separates from immediacy (P-II 2–3: faith's inwardness "is not identical with the first" and is not "the immediate"). The paradox of P-I 2 and P-I 4 depends on this difference: the individual returns "through the universal". The apposition collapses it.
   - Fix: "Taken immediately — as a being of senses and soul — the single individual is the individual who has his telos in the universal." If a first-use definition of *den Enkelte* is still wanted, use a neutral one, for example "the single individual (the individual human being as this one person)", and keep the immediacy clause as a qualification.
2. **MAJOR: addition that flattens an ambiguity (spiritual trial).**
   - DA: "da er han i Anfægtelse, af hvilken han kun arbeider sig ud, ved angrende at opgive sig selv …"
   - EN: "he is in a spiritual trial — an inner assault he must resist — and he can work his way out of it only by …"
   - "He must resist" is not in the source, and it is not part of the dictionary sense. It builds the ethical verdict into the definition. That hurts later passages that depend on *Anfægtelse* cutting both ways: P-II 6 ("if he does resist it, he will not come to fulfill the so-called absolute duty"), P-II 20 (Abraham's wishes are "only spiritual trials") and P-II 23 (the possibility of turning back "can just as well be a spiritual trial as the truth"). With the gloss in place, a reader of P-II 6 meets a definition that says resistance is obligatory, while the text says resistance defeats the absolute duty.
   - Fix: "he is in a spiritual trial — an inner assault on him —".
3. **MINOR: omission.**
   - DA: "Det hviler immanent i sig selv"
   - EN: "It rests within itself."
   - "Immanent" is dropped. It is a technical qualifier, and the teleological suspension works against it (a telos *outside* the ethical).
   - Fix: "It rests immanently in itself."

### P-I 1: 2 MINOR

1. **MINOR: addition (gloss).**
   - DA: "i det Sædeliges Teleologi"
   - EN: "… ethical life — the morality that is lived out in family, society and state."
   - The triad of family, society and state is Hegel's *Sittlichkeit* brought in from outside the text. It is not in the source, and it is not the dictionary sense of *Sædelighed*. The gloss is accurate about Hegel, but it interprets more than it defines, which Rule 2 forbids.
   - Fix: "ethical life — the morality lived out in a people's shared customs and institutions —". Alternatively, keep the current gloss and record it as a conscious exception.
2. **MINOR: word sense.**
   - DA: "hjemvises og udvises som en Morder"
   - EN: "sent back to a lower court and exposed as a murderer"
   - *udvises* means expelled or turned out, not "exposed".
   - Fix: "sent back to a lower court and expelled as a murderer".

### P-I 2: 1 MINOR

- **MINOR: distinction blur.**
  - DA: "nu som den Enkelte isolerer sig som højere end det Almene"
  - EN: "sets himself apart … as higher"
  - *isolerer sig* anticipates P-II 26 ("the true knight of faith is always absolute isolation"), and the candidate renders the P-II word literally.
  - Fix: "now isolates himself, as the single individual, as higher than the universal".

### P-I 3: PASS

The Boileau line has been corrected from the OCR ("qui l'admire") and glossed. The "fortabe sig / fordybe sig" wordplay is adequately kept.

### P-I 4: 1 MINOR

- **MINOR: addition, and a clause detached from its sentence.**
  - DA: "…at den Enkelte som den Enkelte staaer i et absolut Forhold til det Absolute. Dette Standpunkt lader sig ikke mediere"
  - EN: separate sentence "The single individual as the single individual stands in an absolute relation to the absolute. This position cannot be mediated — that is, it cannot be settled by being brought under the universal and explained there —"
  - In the source, the absolute-relation clause is the last member of the "faith is this paradox, that …" definition. As a free-standing sentence it reads as a new assertion rather than part of the definition. In the gloss, "and explained there" adds a second idea.
  - Fix: "… stands above it — that the single individual as the single individual stands in an absolute relation to the absolute. This position cannot be mediated — that is, cannot be brought under the universal — for all mediation …"

### P-I 5 to P-I 12: PASS

- **P-I 6:** "a later one" is left unidentified, and "in a certain mad sense" is kept.
- **P-I 7:** the gloss for the teleology of the ethical is acceptable.
- **P-I 8:** the father is not named early, the "only three people" detail is kept, and line 687 is correctly reconstructed from "v. 68 7."
- **P-I 9 to 10:** complete.
- **P-I 11:** "a test in which we are being tried" follows the policy.
- **P-I 12:** complete.

### P-I 13: 1 MINOR

- **MINOR: addition (interpretive gloss).**
  - DA: "en Følelse, der har sin Dialektik i sit Forhold til Sædelighedens Idee"
  - EN: "… to the idea of ethical life — a feeling, that is, that is weighed against that higher idea."
  - "Weighed against" interprets the relation, and "higher" is not in the clause.
  - Fix: "to a feeling whose dialectic lies in its relation to the idea of ethical life (its worth is decided by that relation)". Alternatively, drop the gloss.

### P-I 14, P-I 15: PASS

P-I 15 renders "a test, a temptation" and the source's own definition of temptation correctly.

### P-I 16: 1 MAJOR, 1 MINOR

1. **MAJOR: distinction blur (the paradox).**
   - DA: "og derfor lader det Paradoxe deri sig mediere i det Almene"
   - EN: "and therefore the paradox in his situation can be mediated in the universal"
   - The source says *det Paradoxe*, "the paradoxical element in it", and not *Paradoxet*. Throughout both Problemata, "the paradox" is the fixed term for faith's paradox, which "cannot be mediated" (P-I 6, P-I 30, P-II 6). Saying that "the paradox" in the tragic hero's situation *can* be mediated makes the key term contradict itself.
   - Fix: "and therefore whatever is paradoxical in it can be mediated in the universal".
2. **MINOR: meaning shift of scope.**
   - DA: "men det Ethiske er det Guddommelige"
   - EN: "for him the ethical is the divine"
   - "For him" relativizes a claim the source states outright, and repeats outright in P-II 0 ("the ethical is the universal, and as such also the divine").
   - Fix: "but the ethical is the divine".

### P-I 17: PASS

### P-I 18: 2 MINOR

1. **MINOR: word sense.**
   - DA: "hvis han bliver forstyrret i sig selv"
   - EN: "suppose he becomes confused in himself"
   - *Forstyrret* means deranged or disturbed, which is stronger than "confused".
   - Fix: "suppose he becomes deranged in himself".
2. **MINOR: addition.**
   - DA: "Ordets Blad"
   - EN: "the fig leaf of the word"
   - "Fig" makes an image explicit that the source leaves implied. It is defensible, because the nakedness image supports it.
   - Fix (if strictness is wanted): "the leaf of the word".
- Otherwise complete. The horror religiosus gloss, the triple "everything", the rhetorical questions and the poet/apostle antithesis are all present. *Angst* is rendered "anxiety", in line with the policy.

### P-I 19: PASS

"In terms of the idea (that is, in principle)" follows the policy.

### P-I 20 and P-I 21: PASS

- **The boundary:** the Danish of P-I 20 ends mid-clause ("…hører et Svar i / Retning af Paradoxet, da lyder det gjerne saaledes"). The candidate completes the sentence in slot 20 and opens slot 21 with "When one does, it usually runs like this". Nothing is lost or duplicated. "Forsaavidt" (insofar as) becomes a statement plus "when one does", which is acceptable.
- **P-I 21:** the skandalon gloss, the lecturers, "police and newspapers", erectioris ingenii and the beginning/outcome argument are all present.

### P-I 22: 1 MINOR

- **MINOR: terminology inconsistency (Rule 2, define once).**
  - DA: "i sin Dialektik"
  - EN: "in its dialectic — in the way it works —"
  - This is a second, different gloss of *Dialektik* after the one in P-I 13, and it is looser.
  - Fix: remove the gloss here ("is, in its dialectic, entirely heterogeneous with the hero's existence").

### P-I 23: 1 MINOR

- **MINOR: word sense.**
  - DA: "for 30 Secler"
  - EN: "for thirty pieces of silver"
  - The source names shekels. The candidate substitutes the familiar biblical phrase. The substitution is harmless.
  - Fix: "thirty shekels", or accept it as is.
- The triad order ("Angsten, Nøden, Paradoxet" becomes "the anxiety, the distress, the paradox") correctly follows the source.

### P-I 24: 3 MINOR

1. **MINOR: distinction blur (tested vs tried).**
   - DA: "Angsten og Nøden, hvori de Store blive forsøgte"
   - EN: "in which the great are tested"
   - The policy maps *forsøges* to "tried" and *prøves* to "tested".
   - Fix: "in which the great are tried".
2. **MINOR: meaning shift, plus inconsistent rendering of *ophæve*.**
   - DA: "og paa eengang ville ophøie den og ophæve den derved, at han paa en nedrig Maade ophøjede den"
   - EN: "at once wanting to exalt it and abolishing it by exalting it in a servile way"
   - "Ville" governs both verbs, so the source means *wanting* to exalt it *and* to cancel it. The exalt/cancel pun (*ophøie* / *ophæve*) is lost, and *ophæve* gets "abolish" instead of the fixed "cancel".
   - Fix: "at once wanting to exalt it and to cancel it by exalting it in a servile way".
3. **MINOR: ambiguity introduced.**
   - DA: "det tilintetgjør man selv"
   - EN: "that they destroy themselves"
   - The English naturally reads as reflexive (the people destroy themselves). The source means that one destroys *it* oneself.
   - Fix: "people themselves destroy it".

### P-I 25 and P-I 26: 1 MINOR (in P-I 26)

- **The boundary:** P-I 25 ends at "disse" and P-I 26 opens "Billeder frem". The candidate completes "called up these images cannot get rid of them again" in slot 25 and starts slot 26 at "And if he sins against them". Nothing is lost or duplicated. PASS.
- **P-I 26, MINOR: word sense.**
  - DA: "Hvilken Qvinde blev dog krænket som Maria"
  - EN: "so humiliated"
  - *Krænket* means wronged or offended. "Humiliated" narrows it.
  - Fix: "What woman was ever so wronged as Mary?"
- Otherwise complete. The source's "Nøden og Qvalen og Paradoxet" is correctly "the distress, the torment and the paradox", and "greater than heroes … through them" is correct.

### P-I 27 to P-I 29: PASS

### P-I 30 and P-I 31: 1 MINOR (in P-I 31)

- **The boundary:** P-I 30 ends "Troen er et" and P-I 31 opens "Vidunder". The candidate repeats "Faith is a miracle" in slot 31 and drops the dangling words from slot 30. Nothing is lost or duplicated. PASS.
- **P-I 31, MINOR: footnote marker in the wrong place.** The OCR (line 2940) places the marker after "er i Lidenskab *)" (all human life unites in passion), before "og Troen er en Lidenskab". The candidate puts it at the end of the sentence.
  - Fix: "for what unites all human life is passion,* and faith is a passion."

### P-I footnote (Lessing): 1 MINOR

- **MINOR: word sense.**
  - DA: "Lessing har etsteds yttret"
  - EN: "Lessing once said"
  - *Etsteds* means "somewhere" (in some place in his writings).
  - Fix: "Lessing has somewhere said".
- The rest is complete. The German is kept whole, the bracketed English is accurate, and the citation is present.

## Findings by slot: Problema II

### P-II 0: 1 MINOR

- **MINOR: addition, recorded against the content decision.**
  - DA: "hvormed et Menneske elsker Kafferne istedenfor at elske sin Næste"
  - EN: "loves a far-off African people instead of loving his neighbor"
  - Leaving out the slur is justified. "Far-off" is an explanatory addition, although it serves the point the source is making (the remote instead of the near). Nothing in the argument is lost.
  - Keep it, or use the lighter "loves a distant African people".
- Everything else passes: the tautology gloss, the sphere image, God as a vanishing point, the phantom's speech.

### P-II 1: 1 MINOR

- **MINOR: an ambiguity is resolved.**
  - DA: "thi ved det Andet har han afsagt Dommen baade over Abraham og over Troen"
  - EN: "for by the latter he has pronounced judgment"
  - "Det Andet" can mean "the latter" or "the other thing". The second reading refers to his system's premise that the incommensurable is accidental. "The latter" commits to one reading.
  - Fix: "for by the other he has pronounced judgment on both Abraham and faith". Alternatively, keep "the latter" and accept the reading.

### P-II 2 and P-II 3: 1 MINOR (in P-II 3)

- **The boundary:** P-II 2 ends "men en ny" and P-II 3 opens "Inderlighed." The candidate completes "is a new inwardness" in slot 2, and slot 3 opens "This must not be overlooked." Nothing is lost or duplicated. PASS.
- **P-II 3, MINOR: word sense.**
  - DA: "Denne Opgave er allerede en passende for menneskelige Kræfter"
  - EN: "That task is in itself one suited to human strength"
  - *Allerede* means "already": this task is already one that fully occupies human powers.
  - Fix: "This task is already one suited to human powers".

### P-II 4: 1 MINOR

- **MINOR: word sense.**
  - DA: "en nu sjeldnere dogmatisk Distinction"
  - EN: "a theological distinction now less often heard"
  - Fix: "a distinction from dogmatics, now less often heard", or "a dogmatic distinction".
- *Tilintetgjøres* rendered as "abolished" (not "cancelled") correctly keeps the difference from *ophæve*.

### P-II 5, P-II 6: PASS

In P-II 6, "if he does resist it … if he does not resist it" is correct. "Flagrantly" for *himmelskrigende* (crying to heaven) is acceptable.

### P-II 7: 2 MINOR

1. **MINOR: pronoun referent.**
   - DA: "(at gjøre det Forfærdelige, den gjør, for sin egen Skyld)"
   - EN: "(doing the terrible thing it does for its own sake)"
   - The Danish "den … sin" is literally "it … its own". However, the paragraph has just set up the pairing "for God's sake / for his own sake" (the individual's). "For its own sake" in English suggests faith acting for faith's sake.
   - Fix: "(doing the terrible thing it does for one's own sake)".
2. **MINOR: omission of a hedge.**
   - DA: "Man indbilder sig vel"
   - EN: "People imagine"
   - The *vel* is lost.
   - Fix: "People no doubt imagine".
- The slot-final "fatte", which the served Danish drops at the page break, is correctly restored ("which I can grasp even better"). Johannes's admission "since I lack the courage" stays in the first person.

### P-II 8, P-II 9: PASS

The Greek and Latin are restored and glossed (μισεῖν, per μείωσιν, κατ' ἀναλογίαν, nihili facio). The irony of "tasteful" and "haggling" is kept.

### P-II 10: 1 MINOR

- **MINOR: modality.**
  - DA: "han skal ikke udelukke sig selv"
  - EN: "will not shut himself out"
  - *Skal* here is normative: he need not, or should not, shut himself out.
  - Fix: "need not shut himself out".

### P-II 11 and P-II 12: 1 MINOR (in P-II 12)

- **The boundary:** P-II 11 ends "ønske at opdage og" and P-II 12 opens "deri see en Sikkerhed …, hvis han opdagede, at hun som Datter og Søster var fuldkommen". The candidate moves "discover that she was perfect in love as a daughter and a sister" into slot 11, and slot 12 keeps "In that he would see a guarantee …". All the content is present. The Danish conditional ("if he discovered") becomes the object of "wish to discover", which is an acceptable restructuring. PASS.
- **P-II 12, MINOR: addition of modality.**
  - DA: "elske ham som ingen Anden i Riget"
  - EN: "as no one else in the kingdom could"
  - Fix: "would love him as no one else in the kingdom does".

### P-II 13 and P-II 14: PASS

The split is marked with a dash, and nothing is lost. The OCR garble "G?" is correctly read through as "paa". The ironic "one is supposed to" (*skal man*) is kept.

### P-II 15: PASS

"The distress and anxiety in the paradox" follows the source's order.

### P-II 16 and P-II 17: 1 MINOR (in P-II 16)

- **The boundary:** P-II 16 ends "og saa snart den" and P-II 17 opens "Enkelte er kommen ind i Paradoxet". The candidate moves the whole clause to slot 17 ("And as soon as the single individual has entered the paradox"). Nothing is lost or duplicated. PASS.
- **P-II 16, MINOR: word sense.**
  - DA: "(som det Ethiske)"
  - EN: "(in the sense of the ethical)"
  - *Som* means "such as" or "as". The ethical is given as an *example* of a higher expression of the universal, not as a sense of it.
  - Fix: "(such as the ethical)".
- **P-II 17:** the "tested … tried" pair is correct.

### P-II 18: 1 MINOR

- **MINOR: modality.**
  - DA: "han skal ikke være bange for at sige"
  - EN: "will not be afraid to say"
  - The sentence is normative, and the candidate itself goes on with "But he must also say it".
  - Fix: "should not be afraid to say".
- "Anxiety and trembling" for "Angst og Bævelse" follows the policy.

### P-II 19: PASS

### P-II 20 and P-II 21: PASS

- **The boundary:** P-II 20 ends "berømt ved sit Tilnavn" and P-II 21 opens "Cunctator". The candidate completes the name in slot 20 ("famous by the surname Cunctator, 'the Delayer'"), and slot 21 opens "He stopped the enemy by delaying". Nothing is lost or duplicated.
- **P-II 20:** "tried and tested" and "tested and tempted" follow the policy. The "Hvilebogstav" image is glossed accurately.
- **P-II 21:** "Yet Abraham does not save the state" makes the referent explicit, which is correct in context.

### P-II 22: 1 MINOR

- **MINOR: addition.**
  - DA: "at han siger Du til Gud i Himlene"
  - EN: "so that he speaks to God in heaven as one speaks to an intimate, saying 'you'"
  - The gloss is needed to explain the Danish Du/De distinction, and it does not interpret the argument. It is acceptable, but it is longer than a first-use definition.
  - Shorter option: "that he says 'thou' (the intimate 'you') to God in heaven".

### P-II 23: PASS

### P-II 24 and P-II 25: 1 MINOR (in P-II 24)

- **The boundary:** P-II 24 ends "ene om" and P-II 25 opens "Alt." The candidate completes "alone in everything" in slot 24. Nothing is lost or duplicated. PASS.
- **P-II 24, MINOR: word order that invites a misparse.**
  - EN: "to concentrate the whole of the ethical that he is breaking into a single moment"
  - This can be read as "breaking [it] into a single moment".
  - Fix: "to concentrate into a single moment the whole of the ethical that he is breaking".
- The footnote marker in P-II 24 is correctly placed (after "af sin ganske Sjæl"), matching OCR line 3482.
- **P-II 25:** vielleicht and das Ausserordentliche are kept and glossed. "Case for the poorhouse" for *Hospitalslem* is acceptable.

### P-II 26: PASS

The Mester Jackel and Gulddaasen glosses are acceptable. The first-person admission "since it is what I do myself" is kept.

### P-II 27: 2 MINOR

1. **MINOR: intensification.**
   - DA: "der er noget mere bevendt end"
   - EN: "worth far more"
   - Fix: "worth rather more than".
2. **MINOR: object changed.**
   - DA: "mindst til Een, der vil paanøde sig"
   - EN: "least of all from someone who wants to force it on him"
   - The source means someone who wants to force *himself* on him.
   - Fix: "least of all that of someone who wants to force himself on him".

### P-II 28: PASS

The candidate correctly leaves out "precisely" before "because it has always existed". The source has no *netop* here, unlike P-I 2 and P-I 4.

### P-II footnote (wish/duty): PASS

It is checked against OCR lines 3503–3525. It is complete, and "give it up" keeps the singular *den*.

## Overall judgment

**Arguments and examples.** Every argument step, example and rhetorical question in the 61 slots and 2 footnotes is present. These include Agamemnon, Jephthah and Brutus, the three counterfactuals, Mary, the apostles and eighteen centuries, the Luke 14 exegesis and the tower, the husband and wife, Cain, Cunctator, the sectarians, and witness versus teacher. I found no omitted sentence, no invented argument and no content in the wrong slot. All ten mid-sentence page-break pairs were rebuilt without loss or duplication. The known OCR loss ("fatte") is restored.

**Qualifications and hedges.** These are almost all kept, including "in a certain mad sense", "in a certain sense", "perhaps", "if possible", "so to speak" and "to speak quite humanly". The hedge losses are minor ("People imagine" for *indbilder sig vel*; normative *skal* read as predictive "will" in P-II 10 and P-II 18).

**Paradoxes.** "Never existed … because it has always existed" is kept unexplained all three times, with *netop* ("precisely") correctly present in P-I and absent in P-II 28. The three-way either/or is intact in P-I 4 and P-II 28. "Either a murderer or a believer" is intact.

**Voice.** Johannes's first person and his admissions ("I cannot understand Abraham", "I lack the courage", "it is what I do myself") are preserved. Nothing is attributed to Kierkegaard.

**Terminology.** The candidate largely holds its fixed renderings:
- single individual, universal, ethical, ethical life
- spiritual trial, test (tested / tried), temptation
- anxiety (never "fear"), distress, torment
- the source's own word order in each triad

The exceptions are one *forsøgte* rendered "tested" (P-I 24), one *ophæve* rendered "abolish" (P-I 24), and a second, inconsistent gloss of "dialectic" (P-I 22).

**Where the candidate does not yet meet the standard: the glosses.** Two glosses (P-I 0) and one term collapse (P-I 16) introduce distinctions or verdicts that the source does not make:

1. **The first-use definition of "the single individual" (P-I 0)** turns the source's "taken immediately" qualification into a definition. That erases the difference between the immediate individual and the individual of faith, and the paradox depends on that difference.
2. **The definition of "spiritual trial" as something "he must resist" (P-I 0)** builds the ethical verdict into a term the text later uses from both sides (P-II 6, 20, 23).
3. **"The paradox" in the tragic hero's case (P-I 16)** renders *det Paradoxe* ("the paradoxical element") as "the paradox", which then "can be mediated". The fixed term contradicts itself.

These three are easy to fix at the wording level; the proposed wordings are above. Once they are fixed, and the minor items are taken or consciously waived, the candidate would preserve every argument, example, qualification, paradox and deliberate ambiguity I could find in the Danish.

**Verdict:** not approved as is, because of 3 MAJOR defects. It is approvable after revision. I found no BLOCKER.
