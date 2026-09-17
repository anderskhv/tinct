# Confessions Book 9 — Independent Adversarial Review

**Reviewer:** independent (did not draft this candidate)
**Source (ground truth):** `book09-source.json` — Pusey 1838, 38 paragraphs
**Candidate:** `book09-candidate.json` — sha256 `76800a80bf81c5e30985f0c759bfb37bc8c2a166ee838d1d55addfca16c766af`
**Structure:** 38 source paragraphs / 38 candidate paragraphs, strict one-to-one. No merges, splits, drops, or inventions.

---

## 1. Question-mark parity — independently recounted

Counted programmatically (`str.count('?')` per paragraph, source vs candidate, zipped and diffed). **Not** taken from the drafter's table.

**Result: 38/38 paragraphs match exactly. Source total 39 "?", candidate total 39 "?". Zero mismatches.**

Per-paragraph non-zero counts (source = candidate in every case):
P1 = 4, P4 = 1, P6 = 1, P7 = 1, P9 = 5, P10 = 2, P11 = 1, P12 = 3, P14 = 1, P16 = 1, P18 = 6, P24 = 1, P25 = 3, P26 = 1, P27 = 1, P28 = 2, P30 = 2, P35 = 1, P37 = 2. All other paragraphs 0 = 0.

The two mismatches the drafter reports self-catching (P16 "did we not run after Thee" as a statement; P28 "Whether she were not afraid…" restored as a direct quoted question) are both correctly resolved in the frozen candidate. I independently confirm P16 is period-punctuated in Pusey and that the candidate keeps it as a statement.

**Word-count ratios** (candidate/source) range 0.99–1.18, median ~1.05. No paragraph falls below the 75% floor; no evidence of compression or summary anywhere.

**Archaism scan:** zero hits for thou/thee/thy/thine/hath/hast/doth/dost/didst/shalt/wilt/unto/whence/whither/betwixt/ye/saith/perchance/aught. Clean.

---

## 2. Packet-by-packet findings

### Packet A — P1–P3

**P1 — minor.** Pusey: "But *where* through all those years, and out of what low and deep recess was my free-will called forth in a moment…". Candidate: "But through all those years, and out of what low and deep hiding place, was my free will summoned forth in a single moment…". The locative "where" is dropped. Trivially recoverable; the double interrogative ("where… out of what recess") is part of the rhetorical groping.
*Proposed:* "But where, through all those years, and out of what low and deep hiding place, was my free will summoned forth…"
Everything else in P1 checks out. The key polarity — "to nill what I willed, and to will what Thou willedst" → "that I should stop willing what I willed, and will what you willed" — has the direction right (his will conformed to God's, not the reverse). The four questions are all present and all real questions.

**P2 — no issues.** "vacation of the vintage" → "Vintage Vacation" consistent with P13's "vintage vacation" (see term-consistency note below). Sharp arrows / burning coals, the subtle tongue that "as though advising for us, would thwart" → "as if advising us for our own good, would have opposed us" — polarity correct.

**P3 — no issues.** "for black Thou hadst made bright, and for dead, alive" → "turned from black to bright, and from dead to living" — direction correct. The self-accusation of ostentation and the closing flat statement (no "?" in Pusey, none added) are both intact.

### Packet B — P4–P6

**P4 — minor.** Pusey: "I suffered myself to sit even *one hour* in the chair of lies." Candidate: "I let myself sit even *one more hour* in that chair of lies." "More" is an addition; the source's force is "even a single hour," not "an additional hour."
*Proposed:* "I let myself sit even one hour in that chair of lies."
Otherwise clean: the lung failure, the "secondary, and that no feigned, excuse," the ~twenty days, covetousness departing and patience taking its place, and the closing question are all present and correctly directed.

**P5 — no substantive issues.** Verecundus's specific blocker ("he would not be a Christian on any other terms than on those he could not") is preserved intact, including the difficult double negative. The "mercy not on him only, but on us also" and the reason (so they would not be tormented by unbearable sorrow) are correctly ordered.
*Observation:* Pusey spells it "Cassiacum" here; candidate normalizes to "Cassiciacum." Flagged by the drafter, and consistent with the project's carry-forward spelling. Acceptable.

**P6 — MAJOR (garbled restructuring + direction reversal).**
Pusey: "There he liveth, **whereof he asked much of me, a poor inexperienced man.** Now lays he not his ear to my mouth, but his spiritual mouth unto Thy fountain…"
Candidate: "There he lives, **asking me now for so much, the very things I, in my inexperience, used to be asked about by him.** Now he no longer presses his ear to my mouth, but presses his spiritual mouth to your fountain…"
Two defects compounded. (a) The opening clause puts Nebridius in the *present*, still asking Augustine questions in heaven — which the very next sentence flatly contradicts ("Now he no longer presses his ear to my mouth"). Pusey's clause is entirely past: Nebridius *used to* ask Augustine many things about that place. (b) The repair clause "the very things I, in my inexperience, used to be asked about by him" is a tangled passive that restates the same content a second time and reads as self-contradiction rather than clarification. This is exactly the pattern the brief flags as risk #4 + #5, and it lands on the page as a visible logical contradiction.
*Proposed:* "There he lives — the place about which he used to ask me so many questions, inexperienced little man that I was. Now he no longer presses his ear to my mouth, but presses his spiritual mouth to your fountain…"

**P6 — minor (added causation).** Pusey: "comforting Verecundus, who sorrowed, as far as friendship permitted, that our conversion was *of such sort*." Candidate: "who grieved… that our conversion *had come at such a cost to him*." "At such a cost to him" supplies the causal content Pusey leaves as the bare "of such sort." Accurate as interpretation, but it is interpretation.
*Proposed:* "…who grieved, as far as friendship allowed, that our conversion was of such a kind."

### Packet C — P7–P9

**P7 — minor.** Pusey: "Thou didst rescue my tongue, *whence* Thou hadst before rescued my heart" — i.e. rescued the tongue *from the same place* the heart had already been rescued from (the word-market). Candidate: "You rescued my tongue, *as* you had already rescued my heart," which reduces the spatial claim to a bare comparison.
*Proposed:* "You rescued my tongue from where you had already rescued my heart."
Everything else — books/letters as witnesses, Nebridius absent, the inward goads, the leveling of mountains and hills, Alypius's resistance to inserting Christ's name, the cedars-of-the-schools vs. herbs-of-the-Church contrast — is present and correctly directed.

**P8 — minor.** "in female garb with masculine faith" → "in a woman's body but a man's faith." *Habitus* is dress/bearing, not body; the candidate shifts an outward-appearance claim into a physical-nature claim.
*Proposed:* "in a woman's dress but with a man's faith."
The rest of P8 is strong: the Manichee anger-then-pity turn, the specific anxiety about being overheard, and the careful conditional ("neither should I speak the same things, nor in the same way… nor if I spake them would they so receive them") are all intact with both halves of the two-sided reasoning preserved.

**P9 — no issues.** The causal order in "For till then, the Spirit was not yet given, because Jesus was not yet glorified" is preserved exactly (glorification is the reason, not the consequence). All five questions present. The staccato "He cries out, How long? He cries out, Know this" survives intact.

### Packet D — P10–P12

**P10 — no issues.** "it was not another nature of a people of darkness which sinned for me" → "it was not some other nature belonging to a people of darkness that sinned in my place" — the Manichaean doctrine being denied is stated correctly and the denial is not softened. "Not that light which enlighteneth every man, but we are enlightened by Thee" — direction correct. "the eternal Internal" → "the eternal reality within" is a fair unpacking of a Pusey coinage.

**P11 — no issues.** "nor found I what to do to those deaf and dead" → "I found nothing to do for those who were deaf and dead" (to→for) is within tolerance. Self-accusation ("a pestilent person, a bitter and a blind bawler") retains full force.

**P12 — no issues.** All three questions preserved, including the paired "But what pain? And how did it go away?" The wax tablet, the friends' prayer, the instantaneous cure, and the closing claim that faith would not let him rest easy about unforgiven sins are all present.

### Packet E — P13–P15

**P13 — no issues.** Ambrose's recommendation of Isaiah, Augustine's stated reason for it, and his setting the book aside are all correctly ordered and correctly attributed ("I believe because…" stays as Augustine's inference, not asserted fact).

**P14 — minor.** "our contemporary in grace" → "our equal in grace." Pusey's *coaevum in gratia* means newborn in grace at the same time as us — a temporal claim, not a claim about rank.
*Proposed:* "of the same age as us in grace."
The Adeodatus material is otherwise handled with the care it deserves: "I had no part in that boy, but the sin," the awe ("That gift filled me with awe"), the question "And who but you could be the maker of such wonders?", and "Soon you took his life from the earth; and I remember him now without anxiety" are all present at full weight, with the guilt and the awe both landing. See §5 for *The Master* / *The Teacher*.

**P15 — minor.** "bearing a *chief part* of those anxieties and watchings" → "bearing *a great share* of that anxiety and those vigils." Pusey (*primas partes*) gives Monica the leading role; "a great share" demotes her to one participant among many. Given the chapter's whole second half is Monica's portrait, this understates her.
*Proposed:* "bearing the leading part in that anxiety and those vigils."
Justina/Valentinian/Arians all correct; "divers (yea, almost all)" → "most — indeed almost all" preserves the self-correction.

### Packet F — P16–P18

**P16 — no issues.** Gervasius and Protasius, the empress, the blind citizen, the handkerchief, and the outcome ("though not turned to sound belief, was at least turned back from her fury of persecution" — the precise partial concession) are all intact. "did we not run after you" correctly kept as a statement.

**P17 — minor (quote style — see also §6).** The maidservant's speech is a direct quotation in Pusey with double quotes; the candidate renders it with single quotes. Content is exact, including the water/wine logic and the closing "what they should not want, they no longer wanted."
No other issues. The critical comparison — credit going *more* to the old maidservant than to Monica's mother — is preserved in the correct direction ("she used to give credit less to her mother's diligence than to that of a certain elderly maidservant").

**P18 — MODERATE (direction inversion).**
Pusey: "and did it in private, either for that the time and place of the quarrel so found them; **or lest herself also should have anger, for discovering it thus late.**"
Candidate: "…or **because she feared her own anger** at bringing it up so late."
Pusey's "should have anger" is archaic for *suffer* anger — i.e. the servant feared she herself would get in trouble for having sat on the information so long (Latin: *ne et ipsa haberet malum, quod tam sero prodidisset*). The candidate makes her afraid of her *own* anger, which inverts who is the agent and who the target, and turns an ordinary self-protective motive into an incoherent one.
*Proposed:* "…or for fear that she herself would be in trouble for bringing it up so late."
**Otherwise P18 is excellent.** Both of the paragraph's easily-invertible claims survive in the right direction: "As flattering friends pervert, so reproachful enemies mostly correct" → "Just as flattering friends corrupt, so insulting enemies most often correct" (order and polarity intact); and the hard one — "Yet not what by them Thou doest, but what themselves purposed, dost Thou repay them" → "Yet you do not repay them for what you accomplish through them, but for what they themselves intended" — is exactly right. All six questions preserved as six separate questions.

### Packet G — P19–P21

**P19 — minor (direct speech flattened to indirect).** Pusey gives Monica's advice as a direct quotation: `"That from the time they heard the marriage writings read to them…"`. The candidate converts it to reported speech ("…serious advice: that from the moment they heard the marriage contract read aloud…"). No content is lost and no "?" is affected, but a quoted voice becomes narration, and this is the one place in the chapter where Monica speaks in her own words before her deathbed.
*Proposed:* restore as a double-quoted direct quotation.
Content otherwise exact, including the uncomfortable substance (she blames the wives' tongues, not the husbands' behavior) which the candidate does not soften or editorialize.

**P20 — no issues.** The mother-in-law sequence is correctly ordered (servants incite → Monica wins her by endurance → mother-in-law reveals the gossipers to her son → he beats them at her wish → she threatens the same for future gossip → no one dares). "she promised the like reward" → "she then warned that she would give the same reward" keeps the threat direction correct.

**P21 — no issues.** The peacemaking rule ("she would never reveal to the one what the other had said, except what might help bring them back together") is stated with the exception clause intact, and the contrast with those who "add things that were never said at all" is preserved.

### Packet H — P22–P24 (Ostia begins)

**P22 — no issues.** The before/after structure is exactly preserved and correctly directed: "and once he was a believer, she no longer had to put up with the things she had endured from him before he believed." The catalogue (wife of one husband, repaid her parents, governed her house, well spoken of, raised children with the spiritual-labor gloss) is complete, and "mother of us all / child to us all" keeps both halves.

**P23 — no issues.** Scene-setting is precise and complete: the day known to God and not to them, the window, the garden, Ostia, the rest from the journey before the voyage, "forgetting the things behind us, and reaching forward to the things ahead," the question they were asking, the eye-hath-not-seen formula, and the gasping "with the mouth of our heart." Nothing added, nothing pre-resolved.

**P24 — minor ×1 (see Ostia assessment, §3).** "we slightly touched on her with the whole effort of our heart" → "we touched her for one instant with the whole reach of our hearts." *Slightly* is a qualifier of *degree* (the touch was faint, barely achieved); the candidate converts it to a qualifier of *duration*. The duration reading is supported by P25's "that one moment of understanding," but Pusey's modesty about the contact itself — that they only just brushed it — is lost.
*Proposed:* "we barely touched her, for one instant, with the whole reach of our hearts."

### Packet I — P25–P27

**P25 — minor (added value judgment).** Pusey: "and other visions of kind *far unlike* be withdrawn." Candidate: "and other visions of a far *lesser* kind be taken away." Pusey says *dissimilar*; the candidate says *inferior*. A small interpretive addition that ranks what the source only distinguishes.
*Proposed:* "and other visions of a far different kind be taken away."
Everything else in this very hard paragraph is intact — see §3.

**P26 — no issues. This is the paragraph the brief flags hardest, and it is correct.** See §3.

**P27 — minor.** "wishing for her, *as the happier lot*, that she might die… in her own land" → "wishing, *as if it were the happier outcome*, that she might die…". "As if" injects narratorial doubt that Pusey does not state here; Pusey reports the brother's view flatly and lets Monica's correction supply the judgment.
*Proposed:* "wishing for her, as the happier lot, that she might die not in a foreign place but in her own country."
Otherwise this paragraph is very well handled. "I held my peace and refrained weeping" → "I kept silent and held back my tears" places the first act of suppression correctly. Monica's "Here you will bury your mother," the glance that checks Navigius, "See what he says," and "Lay this body anywhere… remember me at the Lord's altar" are all exact. Quote style is single (§6).

### Packet J — P28–P30

**P28 — no issues of substance.** The direction the brief warns about is correct: "so little can the human mind grasp things divine" is attached to Monica's *earlier* wish for burial beside Patricius, and the later fading of that wish is explicitly something Augustine "did not know" the timing of, discovered only afterward. The candidate does not tie the two threads together or supply the inference. The quoted exchange with the friends is present as direct speech (single quotes), with the question mark intact. Dates (ninth day, fifty-sixth year, thirty-third) all correct.

**P29 — MODERATE (softened emotional content, grief passage).**
Pusey: "there flowed withal a mighty sorrow into my heart, **which was overflowing into tears**; mine eyes at the same time, by the violent command of my mind, drank up their fountain wholly dry."
Candidate: "a great sorrow flowed into my heart and **was on the point of** overflowing into tears; but at the same time my eyes… drank their fountain completely dry."
Pusey (and the Latin *transfluebat in lacrimas*) says the grief *was* overflowing into tears — the tears had started, and the mind forcibly dried them. "On the point of" makes the tears merely imminent and never actually shed, which converts a violent act of suppression into a near miss. This is precisely the softening the brief warns against in this passage, and it weakens the contrast with P34, where the same dammed tears are finally released.
*Proposed:* "a great sorrow flowed into my heart and was overflowing into tears; but at the same time my eyes…"

**P29 — minor (exclamation flattened).** "and woe was me in such a strife!" → "and it was a wretched struggle for me." The exclamation of anguish becomes a flat narrative report.
*Proposed:* "and how wretched I was in that struggle!"

**P29 — minor (wrong connective).** Pusey: "**But** when she breathed her last, the boy Adeodatus burst out into a loud lament." The contrast is between Augustine's suppression and the boy's unrestrained cry. Candidate: "**For** when she breathed her last…", which makes the boy's weeping the *explanation* of Augustine's struggle.
*Proposed:* restore "But."
The paragraph's key double negation — "she was neither unhappy in her death, nor altogether dead" — is preserved with both negations intact, as is the reasoning that tearful lament implies believing the dead unhappy or wholly dead.

**P30 — no issues.** The comparison the brief flags is correctly directed: "what comparison is there between the honor I paid her and her years of servitude for my sake?" — his devotion is the smaller side. Both questions present.

### Packet K — P31–P33

**P31 — no issues. This is the crux of the grief argument and it is handled correctly.** "with a new grief I grieved for my grief, and was thus worn by a double sorrow" → "I grieved with a fresh grief over my own grief, and was worn down by a double sorrow." The doubling is preserved as doubling, not collapsed into one sorrow. The displeasure at "these human things" having such power is retained *together with* the concession that they "must happen in the proper order and design of our natural condition" — both poles present, neither resolved. The deception of the listeners ("thinking me free of all sense of grief") and the tide image are intact.

**P32 — no issues.** The unanswered prayer is preserved with its full sting: "I prayed to you, as best I could, to heal my grief, **and you did not**." The balneum/balaneion etymology, the bath's failure, and "I bathed, and was the same person I had been before I bathed" all land.

**P33 — no issues, one observation.** The Ambrose hymn is rendered as continuous prose rather than as verse lines. Pusey prints it as metrical lines run together in this source file, so nothing is lost textually; content is complete (maker, ruler of the heights, day clothed in light, slumber over night, limbs' power renewed, hearts lifted, sorrows subdued). This is also the *only* paragraph in the candidate that uses double quotes.

### Packet L — P34–P38

**P34 — minor (lost parallel).** Pusey: "the mother who *for the time was dead to mine eyes*, who had for many years wept for me that I might live *in Thine eyes*." Candidate: "the mother who had, for that time, *died before my eyes*, who had for so many years wept for me, that I might live *before yours*." "Dead to my eyes" (she is, for now, lost to my sight) becomes "died before my eyes" (I watched her die) — a different claim, and it breaks the my-eyes/your-eyes antithesis that the second clause depends on.
*Proposed:* "the mother who was, for that time, dead to my eyes, who had for so many years wept for me, that I might live in yours."

**P34 — minor (broken grammar).** "Read it, who will, and interpret it, how he will" → "Let whoever wants to read it, and interpret it however he likes." As written this is a fragment: "Let whoever wants to read it" has no main verb for the permission.
*Proposed:* "Let anyone who wishes read it, and interpret it however he likes."
The paragraph's emotional core is otherwise correct and at full strength: the tears released "to overflow as freely as they wanted," the heart resting on them, the reason (God's ears, not a scornful man's), and the appeal to a reader of large charity.

**P35 — minor (softened imprecation).** Pusey: "And **woe be even unto** the commendable life of men, if, laying aside mercy, Thou shouldest examine it." Candidate: "And **even the most admirable life of men would be in trouble**, if you, setting mercy aside, were to examine it closely." "Would be in trouble" is much too mild for *vae*, and "most admirable" adds a superlative Pusey does not use.
*Proposed:* "And woe even to the praiseworthy life of men, if you were to set mercy aside and examine it."
The two-sided tension the brief asks about is otherwise preserved: he dares not claim Monica sinless after baptism, cites the "You fool" warning, and grounds hope in God's not searching sins too strictly — neither side resolved away. "not extreme in enquiring after sins" → "not merciless in your inquiry into sins" is a slight shift of emphasis (strictness → cruelty) but acceptable.

**P36 — no issues.** The prayers are unambiguously *for* her and about her sins, not merely *at* her memory: "now beg you on behalf of my mother's sins," "forgive her debts too," "Forgive her, Lord, forgive her, I beg you; do not enter into judgment with her." The merciful-to-the-merciful logic, including the "which you yourself made them to be" qualification, is intact.

**P37 — no issues.** Both questions preserved as real open questions. Monica's renunciations (no costly wrapping, no spices, no fine monument, no burial in her own country) are all four present, as is the single positive request. The closing legal image — she will *not* plead that she owes nothing, but that her debt was paid — is correctly directed, which is an easy place to invert and the candidate does not.
*Trivial:* Pusey varies the verb ("Who shall *restore*… Who *repay*…"); the candidate repeats "repay" in both. Not worth changing.

**P38 — minor (dropped allusion).** "which Thy pilgrim people sigheth after from their *Exodus*, even unto their return thither" → "which your people, on pilgrimage, sigh for from the day they set out until the day they return there." The Exodus allusion is generalized away.
*Proposed:* "…sigh for from their exodus until their return there."
*Observation:* "in our Catholic Mother" → "in our Catholic mother the Church" adds an explanatory two words. Defensible for a modern reader; note it as a deliberate gloss.
*Observation:* Pusey's "Monnica" normalized to "Monica" — consistent with project convention and with the rest of the chapter. Acceptable.

---

## 3. Dedicated assessment — the Ostia vision (P23–P26)

**Verdict: no direction inversions. The ascent/descent architecture is correct, and this is the strongest sustained stretch in the candidate.**

I traced the P24 sequence step by step against the source:

| # | Pusey | Candidate | OK |
|---|---|---|---|
| 1 | earthly senses' highest delight not worth comparison, not even mention | same, both halves | ✓ |
| 2 | raising ourselves with more glowing affection toward the "Self-same" | "lifting ourselves up with a more burning love toward the Self-Same" | ✓ |
| 3 | by degrees through all things bodily | "by degrees through all bodily things" | ✓ |
| 4 | even the very heaven whence sun, moon, stars shine | "even the sky itself, from which sun and moon and stars shine down" | ✓ |
| 5 | soaring higher yet, by inward musing, discourse, admiring Thy works | "climbed higher still, through inward reflection, and talk, and wonder at your works" | ✓ |
| 6 | came to our own minds, and went beyond them | identical | ✓ |
| 7 | arrived at the region of never-failing plenty / Wisdom | "reach that region of never-failing abundance… Wisdom" | ✓ |
| 8 | slightly touched her with the whole effort of our heart | "touched her for one instant with the whole reach of our hearts" | degree→duration (minor) |
| 9 | sighed, left bound there the first fruits of the Spirit | identical | ✓ |
| 10 | **returned to vocal expressions of our mouth**, where the spoken word has beginning and end | "**returned to the sound of our own voices**, where a spoken word has a beginning and an end" | ✓ |

**The critical direction question — does the candidate ever imply they stayed elevated, or reverse which way the fall goes?** No. Step 10 is unambiguous and unambiguously downward-from-the-vision: they return to ordinary speech, and the contrast (a spoken word has a beginning and an end, unlike the Word that does not age) is preserved as the reason the return is a loss. Nothing in the candidate suggests the contact persisted.

The tense paradox at step 7 is preserved intact and unresolved: "she herself is not made, but is, just as she has been, and so she will always be; or rather, 'having been' and 'going to be' do not apply to her at all, but only 'being,' since she is eternal." The drafter did not simplify this into "she always existed," which was the obvious temptation.

**P25** restates the same movement as one extended conditional, and the candidate keeps it as one suspended sentence rather than breaking it into independent statements. All the hushed items are present and in order (flesh, earth/water/air images, the vault of heaven, the soul silent to itself, self-transcendence by not thinking of self, dreams and imagined visions, every tongue and sign, everything that exists only by passing away), followed by the created things' testimony, their falling silent, God speaking alone, the four rejected media (tongue of flesh, angel's voice, thunder, dark riddle of comparison), the parenthetical back-reference to their own momentary touch, the sustaining condition, and the two closing questions. Only one minor slip (§2, "far lesser kind"). The hardest negation in the book — "When we all rise again, though we will not all be changed?" — is preserved exactly, negation and all.

**P26 — Monica's stated reason. Correct and specific.** Pusey: "One thing there was for which I desired to linger for a while in this life, that I might see thee a Catholic Christian before I died." Candidate: "There was one thing for which I wanted to linger a while longer in this life — that I might see you become a Catholic Christian before I died." The causal claim is verbatim-specific, not vaguer, not substituted. The follow-on is correctly *additive*, not a replacement: "My God has given me this and more, letting me now see you as well, despising earthly happiness, become his servant." And the closing "What am I still doing here?" retains its question mark and its finality. No flattening.

**Mystical intensity:** lands. "we gasped, with the mouth of our heart"; "lifting ourselves up with a more burning love"; "we touched her… with the whole reach of our hearts"; "seize and absorb and wrap up the one who beholds it." Nothing is domesticated.

---

## 4. Dedicated assessment — the grief passages (P29–P38)

**Verdict: the self-argument is correctly left unresolved, both poles survive, and the prayers are correctly *for* Monica. One moderate softening at the opening (P29) needs fixing.**

The unresolved argument, traced across paragraphs:

- **P29 (pole A — grief would be inappropriate):** "we did not think it right to mark that funeral with tearful lament and groaning, since that is usually how people express grief for the dead when they think of them as unhappy, or as altogether dead; but she was neither unhappy in her death, nor altogether dead." Both negations intact. The theological premise for suppression is stated at full strength.
- **P30–P31 (pole B — the wound is real and human):** "the fresh wound torn open by the sudden breaking of that sweetest and dearest habit of living together"; "that life which had been made one out of hers and mine together was torn apart." Then the self-reproach: "I was very displeased that these human feelings had such power over me" — immediately qualified by "even though this must happen in the proper order and design of our natural condition." **Both sides are in the same sentence, and the candidate resolves neither.** The doubled grief ("I grieved with a fresh grief over my own grief… worn down by a double sorrow") is preserved as genuinely double.
- **P32 (the argument fails to settle):** he prays to be healed of the grief and is refused — "and you did not." The bath fails. Nothing is resolved by the narrative either.
- **P34 (the release, unapologized-for but also unvindicated):** "I let go of the tears I had been holding back, to overflow as freely as they wanted." He then explicitly anticipates a reader who "finds it a sin that I wept for my mother for a small part of an hour," and answers not by defending the weeping but by asking that reader to weep for his sins instead. **The candidate does not convert this into a defense of grief, and does not convert the earlier suppression into a confessed error.** This is the correct outcome — the brief's warning case is avoided.
- **P35 (the third register):** "a very different kind of tears, flowing from a spirit shaken by thoughts of the dangers facing every soul that dies in Adam" — correctly marked as distinct from the personal grief already spent, not merged with it. The tension between human merit and mercy is likewise left standing on both sides.
- **P36–P38 (prayers *for*, not *at*):** unambiguous. "now beg you on behalf of my mother's sins"; "forgive her debts too, Lord"; "Forgive her, Lord, forgive her, I beg you; do not enter into judgment with her"; and the closing request that readers "remember, at your altar, Monica your servant." Intercession, not commemoration. Correct.

**Full weight of shame and weeping:** mostly present — "I blamed the weakness of my own feelings," "I knew what I was keeping down in my heart," "thinking me free of all sense of grief," "let him not mock me." The one place the weight is reduced is the very first beat, P29's "on the point of overflowing into tears" (moderate finding, §2), which should be restored to an actual overflow that the mind then forcibly dries. The two accompanying minors in P29 (the flattened "woe was me… !" and the "For"/"But" connective) pull in the same direction and are worth fixing at the same time, since together they make the chapter's first grief beat noticeably cooler than Pusey's.

---

## 5. Verdict on "The Master" → "The Teacher" (P14)

**Accept the change. Do not revert.**

Reasons:

1. *De Magistro*'s standard English title in modern scholarship and in every current translation series is **"The Teacher"** (Cambridge Texts in the History of Philosophy; the Ancient Christian Writers series; King's *Against the Academicians and The Teacher*). "The Master" is Pusey's 1838 rendering and is not the recognizable title today — reverting would *reduce* recognizability, not preserve it.
2. In present-day English "master" primarily denotes an employer, owner, or expert, not a teacher. In a paragraph that is explicitly about Adeodatus's intellect and about a teaching dialogue between father and son, "The Master" actively misleads.
3. The candidate's own surrounding prose makes the dialogue's subject clear ("it is a dialogue between him and me"), so no context is lost.
4. It is consistent with the project's zero-archaism rule, which the candidate otherwise observes perfectly.

One optional refinement, at the editor's discretion: *The Teacher (De Magistro)*. I would **not** add it — the chapter carries no other parentheticals and the bare title reads better.

---

## 6. Mechanical checks

- **Archaisms:** zero. Clean scan (see §1).
- **Quote style — MODERATE, systemic.** Pusey uses double quotes for every direct quotation. The candidate uses **single quotes for all direct speech** — P17 (the maidservant), P24 (the scare-quoted tense terms 'having been' / 'going to be' / 'being' / 'being hereafter'), P26 (Monica's window speech), P27 (five separate quotations across the deathbed scene), P28 (three, including the quoted question), P30 ('devoted'). The only double quotes in the entire file are the two around the Ambrose hymn in P33.
  I verified the project convention against `book08-accepted.json`: 80 double-quote characters, **zero** speech-opening single quotes. Book 9 is therefore inconsistent with the accepted precedent.
  **Note also that the drafter's self-check claims the opposite** — "Double quotes used for all direct speech per book08-accepted.json convention." That claim is false for the frozen candidate. Mechanical global fix, but it must be made, and the false self-check is worth noting for the project's trust calibration.
- **Technical/proper-term consistency:** consistent throughout. Cassiciacum (normalized once from Pusey's "Cassiacum"), Monica (normalized once from "Monnica"), Ambrose, Alypius, Adeodatus, Nebridius, Verecundus, Euodius, Patricius, Justina, Valentinian, Gervasius, Protasius, Isaiah, Ostia, Milan, Manichees, Arians. "Catechumen" → "catechumen" consistently lowercase; "Self-Same" capitalized consistently in P11 and P24; "vintage vacation" consistent between P2 and P13; "servant" used consistently for Pusey's "handmaid" throughout. Augustine's brother is correctly left as "my brother" and never silently named Navigius — the right call, since Pusey's Book 9 does not name him.
- **Contractions:** one ("I don't remember," P27). Consistent with `book08-accepted.json`, which uses contractions freely. Not a finding.
- **Brackets, ellipses, editorial debris:** none.

---

## 7. Whole-chapter read-through

Read straight through as a reader, not as a checker.

It holds. The voice is consistent from the opening praise through the Ostia vision to the closing prayer, with no register breaks and nothing that reads as machine-flattened. The long periodic sentences (P17's maidservant portrait, P18's wine sequence, P25's great conditional) are handled as long sentences rather than chopped into declaratives, which matters — P25 in particular depends on grammatical suspension for its effect and the candidate does not relieve it early.

The chapter's three emotional peaks land at different pitches, correctly. The baptism/Adeodatus material (P14) carries the awe and the guilt together without the translator picking a side. The Ostia vision rises and then falls, and the fall is felt as a loss. The death scene (P27) is quiet and fast, which is right — Pusey is quiet and fast there too, and the candidate resists any temptation to dwell.

The one place the emotional register is audibly cooler than the source is the first paragraph of the grief sequence, P29. "Was on the point of overflowing into tears… and it was a wretched struggle for me" reads as controlled reporting where Pusey has a man whose tears had already started and who forced them back. Fixing the three P29 findings together (the overflow, the exclamation, the "But") restores that beat and, with it, the payoff twenty paragraphs later when the same tears are finally released in P34.

P6's "asking me now for so much" is the only place where a reader would stop and reread because the sentence does not make sense on its own terms — it says Nebridius is asking Augustine questions now, and the next sentence says he no longer does. That is the one defect a reader will actually trip over.

Everything else reads as competent, sometimes very good, modern English prose.

---

## 8. Summary verdict

**Finding counts (arithmetic double-checked: 1 + 3 + 17 = 21):**

| Severity | Count | Paragraphs |
|---|---|---|
| **Major** | **1** | P6 |
| **Moderate** | **3** | P18, P29, quote style (systemic: P17, P24, P26, P27, P28, P30) |
| **Minor** | **17** | P1, P4, P6, P7, P8, P14, P15, P19, P24, P25, P27, P29 (×2), P34 (×2), P35, P38 |
| **Total** | **21** | |

Minor breakdown, itemized for the count: P1 (dropped "where"); P4 ("one more hour"); P6 ("at such a cost to him"); P7 (lost "whence"); P8 ("woman's body"); P14 ("our equal in grace"); P15 ("a great share"); P19 (direct speech → indirect); P24 ("for one instant" for "slightly"); P25 ("far lesser kind"); P27 ("as if it were the happier outcome"); P29a (flattened "woe was me… !"); P29b ("For" should be "But"); P34a ("died before my eyes"); P34b (broken "Let whoever wants to read it"); P35 ("would be in trouble" for "woe be unto"); P38 (dropped "Exodus"). = 17.

**Not found (checked for, absent):** flattened rhetorical questions — none, 38/38 parity confirmed independently; dropped clauses in long sentences — none found; polarity inversions in the Ostia ascent/descent — none; error in Monica's stated causal reason — none; resolution of Augustine's unresolved grief argument — none, both poles survive; comparison inversions involving Monica's character — none (P17 maidservant-vs-mother, P30 his honor vs. her servitude, and P22 before/after belief are all correctly directed).

**Verdict: ACCEPT WITH CORRECTIONS.** This is the cleanest candidate in the Books 3–8 sequence on the project's dominant defect class — I found no direction inversions in the Ostia vision, none in Monica's stated reason for not wanting to live, and no flattening of the grief argument, which were the three highest-risk targets in this book. Question-mark parity is genuinely 38/38 and the drafter's table is accurate. The single major finding (P6) is a garbled clause that contradicts the sentence following it and must be fixed; the three moderates — the P18 "her own anger" inversion, the P29 softening of the suppressed tears, and the systemic single-quote style that contradicts both the source and `book08-accepted.json` (and the drafter's own self-check) — should be fixed before acceptance. The 17 minors are individually small, but the three clustered in P29 and the two in P34 are worth taking together because they cool the chapter's most important emotional beat. "The Teacher" is the right call and should stand.
