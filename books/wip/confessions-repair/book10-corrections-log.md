# Book 10 Corrections Log

Source of truth: `book10-source.json` (Pusey 1838). Base: `book10-candidate.json`.
Output: `book10-corrected.json`. All paragraph indices are 0-based, verified against
the actual JSON array (valid range 0–69, 70 paragraphs total).

Findings are cited by their review IDs: part 1 review uses `¶n` (0-based, same as
array index); part 2 review uses `IDX n (¶n+1)` — the `IDX n` value is the 0-based
array index used throughout this log.

---

## MAJOR (1)

### Paragraph 58 — direction inversion (F-19)
Source: "...he also is praised, while Thou dispraisest; better is he who praised than he who is praised."
Old: "he too is being praised while you are being slighted; and better is the one who gave the praise than the one who received it."
New: "he too is praised while you find fault with him; and better is the one who gave the praise than the one who received it."
Reason: God is the agent delivering an adverse verdict on a man other people praise. The candidate made God the patient ("being slighted"), inverting agency and contradicting the paragraph's own earlier correct rendering ("Whoever wants to be praised by men when you find fault..."). Restored God as the one finding fault.

## MODERATE (10)

### Paragraph 18 — self-contradictory numbers contrast (part 1)
Source: "I have perceived also the numbers of the things with which we number all the senses of my body; but those numbers wherewith we number are different..."
Old: "I have also perceived the numbers by which we count the things we sense with our bodies, but the numbers by which we count are different, and they are not images of those sensed things, and so they truly exist in their own right."
New: "I have also perceived, through all the senses of my body, the numbers of the things we count; but the numbers by which we count are different, and they are not images of those, and therefore they truly are."
Reason: candidate assigned "the numbers by which we count" to both sides of the contrast, making the sentence self-contradictory. Restored the two-term contrast: numbers of counted things vs. the numbers by which we count.

### Paragraph 29 — altered conditional, mis-targeted referent (part 1)
Source: "...though indeed they would not be delighted but for some inward knowledge thereof, nor wish to be the like, unless they were thus delighted."
Old: "though indeed they would not be delighted unless they had some inward knowledge of it, nor would they wish to be like it unless that delight came from something within"
New: "though indeed they would not be delighted unless they had some inward knowledge of it, nor would they wish to be like them unless they were so delighted"
Reason: restored the two-step chain (inward knowledge → delight → wish to be like the eloquent men) and corrected "the like" to refer to the eloquent men, not to eloquence itself.

### Paragraph 43 — self-accusation softened (F-07)
Source: "In this uncertainty the unhappy soul rejoiceth, and therein prepares an excuse..."
Old: "In this uncertainty my unhappy soul takes a kind of comfort, and in it prepares an excuse to shield itself"
New: "In this uncertainty my unhappy soul rejoices, and in it prepares an excuse to shield itself"
Reason: "takes a kind of comfort" makes the soul a passive sufferer; source's "rejoiceth" makes it an accomplice delighting in its own uncertainty because the uncertainty gives it cover. Restored the intensity.

### Paragraph 46 — referent narrowed, breaks logical link to "body" (F-11)
Source: "...because Thine eyes have seen that of Him which is imperfect, and in Thy book shall all be written."
Old: "because your eyes have seen what is still imperfect in me, and in your book all shall be written."
New: "because your eyes have seen what in him is still imperfect, and in your book all shall be written."
Reason: source says God has seen the imperfect part *of Christ's body* — the reason Augustine can be numbered among its weak members. Candidate narrowed "of Him" to "in me," breaking the "because" clause's link to the preceding body-of-Christ logic. Restored "of Him" (rendered "in him").

### Paragraphs 53, 59, 65 — "concupiscence" flattened to "desire" at triad-naming points (F-17)
Source uses "lust of the flesh / lust of the eyes / lust of the world" as a named triad (already correctly rendered "lust of the eyes" at ¶54 and elsewhere), but at the three places the triad itself is being invoked, candidate used generic "desire," breaking the structural link.
- ¶53: Old: "besides the desire of the flesh, which lies in the delight of every sense and pleasure" → New: "besides the lust of the flesh, which lies in the delight of every sense and pleasure"
- ¶59: Old: "to serve one or two or all three of these forms of desire" → New: "to serve one or two or all three of these lusts"
- ¶65: Old: "in that threefold desire, and have called your right hand" → New: "in that threefold lust, and have called your right hand"
(Freestanding, non-triad uses of "concupiscence" elsewhere in the range — e.g. "birdlime of desire," "snare of desire" — were left as "desire" per the review; only the naming points were fixed.)

### Paragraph 58 — exclamatory verdict flattened (F-20)
Source: "A miserable life this and a foul boastfulness!"
Old: "This is a miserable life, and a shameless kind of boasting."
New: "A miserable life this, and a foul kind of boasting!"
Reason: restored the paragraph's only exclamation (recoil after naming the third temptation) and "foul" (disgust) in place of "shameless" (mere impropriety).

### Paragraph 62 — hedge "truly" opens a gap Augustine doesn't allow; wrong object for "despise" (F-23/F-24)
Source: "...for it doth not contemn when it glorieth" (absolute; no object).
Old: "and so it is no longer contempt of empty glory that it boasts of, since it does not truly despise what it boasts of."
New: "and so it is no longer contempt of empty glory that it boasts of, for in the act of boasting it is not despising empty glory."
Reason: "does not truly despise" implies a partial/half-despising the source's flat contradiction does not allow; "what it boasts of" pointed "despise" at the wrong object (its own contempt, not vainglory). Restored the flat claim and pointed it at vainglory, without resolving the pride/confession paradox in either direction.

### Paragraph 65 — not-X-but-Y construction parses backwards (F-26)
Source: "...but I through my covetousness would not indeed forego Thee, but would with Thee possess a lie."
Old: "wanted not to lose you but to possess a lie along with you"
New: "did not want to lose you — I wanted to possess a lie along with you"
Reason: as punctuated, the candidate reads as "wanted — not to lose you — but to possess a lie" (the opposite of Augustine's point: greed for *both* God and a lie at once). Repunctuated so the correct sense — he did not want to lose God, and additionally wanted a lie — is the natural reading.

## MINOR (18 applied, 4 declined — see below)

### Paragraph 3
Old: "so that you might make me happy in you" → New: "so that you might bless me in you"
Reason: "bless" is the source's word; "make happy" imports the *beatus* vocabulary that only arrives later in Book 10.

### Paragraph 9
Old: `"We are a mass, and a mass is smaller in a part of itself than in the whole."` → New: `"They are a mass, and a mass is smaller in a part of itself than in the whole."`
Reason: candidate shifted the quoted speaker from third person (nature reporting about the bodies) to first person (bodies speaking for themselves), an unlicensed person-shift inside quoted matter.

### Paragraph 12
Old: "hard or soft, hot or cold, rough or smooth, heavy or light" → New: "hard or soft, hot or cold, or rough, heavy or light"
Reason: source pairs only three of the four attributes; candidate supplied an unpaired opposite ("smooth") for "rugged" that source does not give.

### Paragraph 13
Old: "filled with the images of so many great things" → New: "filled with the images of things so many and so great"
Reason: source coordinates two attributes (number and magnitude); candidate collapsed them into one attributive adjective.

### Paragraph 14
Old: "and they pass by themselves without wondering; nor are they amazed that when I spoke of all these things just now" → New: "and they pass themselves by; nor are they amazed that when I spoke of all these things"
Reason: removed a redundant added "without wondering" (duplicating the wonder-verb source places only in the second limb) and a small added temporal marker ("just now") not in source.

### Paragraph 17
Old: "not whatever is gathered anywhere, but what is gathered again" → New: "not whatever is gathered in just any way, but what is gathered again"
Reason: source's "any how" denotes manner, not place; candidate's "anywhere" drifted from manner to location.

### Paragraph 25
Old: "longing to reach you, the one by whom you can be reached, and to cling to you, the one by whom one can cling to you." → New: "longing to reach you by the way in which you can be reached, and to cling to you by the way in which one can cling to you."
Reason: source's "whence" denotes the way/means of reaching God; candidate converted it into an appositive identifying God himself as the means, resolving an ambiguity source leaves open.

### Paragraph 31
Old: "Yet even so, their will is not turned away entirely from some semblance of joy." → New: "Yet their will is not turned away from some semblance of joy."
Reason: "entirely" is an added quantifier weakening a flat claim into a partial one.

### Paragraph 32
Old: "than the truth they so faintly remember has power to make them happy." → New: "than that which they so faintly remember has power to make them happy."
Reason: source leaves the comparatum as unnamed "that which"; candidate supplied "the truth," an unlicensed resolution.

### Paragraph 37 (three fixes, one paragraph)
1. Old: "You were with me, and I was not with you." → New: "You were with me, but I was not with you." (F-01: source's "but" carries the whole point of the reversal; "and" flattens it.)
2. Old: "and I pant for you. I tasted you, and now I hunger and thirst for you." → New: "and I panted for you. I tasted you, and now I hunger and thirst for you." (F-02, partial: fixed the tense shift "pant"→"panted" for consistency with the surrounding past tense; the supplied objects ["on me", "you"] were left as-is per the reviewer's note that they are a defensible, standard reading.)
3. Old: "Too late I loved you, O Beauty so ancient and so new, too late I loved you!" → New: "Too late I loved you, O Beauty so ancient and so new! Too late I loved you!" (F-03 + exclamation-parity bonus finding: restores both of source's exclamation marks in the book's most famous sentence, which had been collapsed into one running clause via comma.)

### Paragraph 38 (two fixes)
1. Old: "Woe is me — look, I do not hide my wounds; you are the physician, I am the sick one;" → New: "Woe is me! Look! I do not hide my wounds; you are the physician, I am the sick one;" (F-04 + exclamation-parity bonus finding: source has "Woe is me! lo!" — two exclamations at the climax of a triple "Woe is me!" repetition; candidate had demoted this third instance to an em-dash. Restored both marks — paragraph exclamation count now matches source exactly, 5/5.)
2. Old: "and because it might shatter endurance." → New: "and for fear that it may shatter endurance." (F-05: source's "lest" is a fear-clause, not asserted causation; "because...might" converts dread into a stated cause.)

### Paragraph 40
Old: "You command continence from illicit sex" → New: "You command continence from sex outside marriage"
Reason (F-06): source uses "concubinage" here and at ¶46, and ¶46 explicitly back-references this paragraph ("as I could of concubinage"). Candidate used two different phrases ("illicit sex" here, "sex outside marriage" at ¶46), weakening the back-reference. Unified on "sex outside marriage" (already correct at ¶46).

### Paragraph 43 (two additional minor fixes, same paragraph as the F-07 moderate fix above)
1. Old: "so that I end up doing for its sake what I say — or think — I am doing for health's sake." → New: "so that I end up doing for its sake what I say I am doing — or mean to be doing — for health's sake." (F-08: source's "wish to do" is a wilful intention; "think" is a mere belief, softening the self-accusation.)
2. Old: "because I have as yet no settled policy about this." → New: "because I have as yet no settled counsel in this matter." (F-09: "policy" is corporate/administrative register, clashing with the surrounding voice.)

### Paragraph 47
Old: "could just as easily be changed from better to worse." → New: "could in the same way be changed from better to worse."
Reason (F-12): source's "likewise" means "in the same way"; "just as easily" adds an unstated probability claim.

### Paragraph 49
Old: "the danger of pleasure and the proven benefit of it," → New: "the danger of pleasure and the proven benefit of the practice,"
Reason (F-13): "of it" most naturally attaches to "pleasure," producing an incoherent "benefit of pleasure" when Augustine means the benefit of the practice of singing.

### Paragraph 51 (two fixes)
1. Old: "O that Light which Tobit saw," → New: "O that Light which Tobias saw," (F-14: source's proper noun is "Tobias"; per the project's proper-noun-preservation rule, restored it even though "Tobit" is the modern name and substantively correct.)
2. Old: "for they are constantly caught." → New: "for they are caught." (F-15: "constantly" is an added intensifier not in source; the next sentence already carries the repetition.)

### Paragraph 52
Old: "though not their rule for using them rightly." → New: "but not their rule for using them."
Reason (F-16): source is a flat denial (no rule of use is drawn from that Beauty at all); candidate's added "rightly" converted it into a partial claim (a rule exists, just not the correct one).

### Paragraph 55
Old: "that just as any consent to such a thing is far from me now, so may it be pushed" → New: "that just as any consent to such a thing is far from me, so may it be pushed"
Reason (F-18): "now" introduces an implicit time-boundedness ("but who knows later") not in source, which states the fact flatly and prays only for further distance.

### Paragraph 59
Old: "For I cannot tell how far I have been cleansed from this plague" → New: "For I cannot tell how much further I have been cleansed from this plague"
Reason (F-21): source's "more" makes this a question about ongoing progress (central to the self-examination that follows); candidate's version asks a static question.

### Paragraph 60
Old: "And when I am troubled by this weakness of mine, an excuse occurs to me" → New: "And when I am troubled by this misery of mine, an excuse occurs to me"
Reason (F-22): candidate's standing rendering of *infirmitas* elsewhere in range is "weakness"; using it here for *miseria* blurs a distinction and softens the word.

### Paragraph 62
Old: "in order to build up some excellence of its own, courts and collects the votes of men." → New: "in order to build up some excellence of our own, courts and collects the votes of men."
Reason (F-30, elevated to required per task brief): source implicates "us" ("our own"); candidate's "its own" deflects the excellence onto the love-of-praise as a freestanding agent, letting the confessing "I" off the hook.

### Paragraph 67
Old: "For as man, he was a mediator; but as the Word, he was not in the middle between God and man" → New: "For as man, he was a Mediator; but as the Word, he was not in the middle between God and man"
Reason (F-27): candidate correctly capitalizes "Mediator" twice earlier in the paragraph (referring to Christ), then lowercases it here, at the exact point source keeps the capital — a downgrade at the wrong moment.

### Paragraph 68
Old: "making us sons instead of servants to you, by being born of you and serving us." → New: "making us your sons instead of servants, by being born of you and serving us."
Reason (F-28): "to you" had attached to "servants" ("servants to you"), garbling the point that God makes us *sons to himself*, not merely servants who happen to belong to him.

---

## Declined findings (reviewed, no change made)

### Paragraph 8 — two minor observations (part 1)
1. "And what is this that I love?" vs. source's bare "And what is this?" — the reviewer's own proposed correction offered "leave as is, or..." as equally acceptable; the added referent is harmless interpretive completion in modern prose. Declined.
2. Soul/body ordering ("one outward, the other inward") — reviewer explicitly flagged this as a no-change observation: the candidate is faithful to Pusey's own word order; the apparent confusion is in the source, not a candidate defect. Declined (no change).

### Paragraph 45 (F-10) — "John the Baptist" supplied for source's unstated subject
Source leaves the subject of "endued with an admirable abstinence" grammatically unstated. Candidate supplies "John the Baptist," which is the correct referent (Matthew 3:4) and a reasonable reader service. The reviewer flagged this only so it would be a deliberate, informed choice rather than a silent one — not as an error. Accepted deliberately; no change made.

### Paragraph 63 (F-25) — "if they credit them to you" as paraphrase of an elliptical source clause
Reviewer explicitly noted "No change needed" — the three-step descent (mine / yours-but-earned / your-grace-but-begrudged) is fully preserved and the paraphrase is accurate. Declined.

### Paragraph 69 (F-29) — present tense "I long to be satisfied" vs. source's past "desired"
Reviewer flagged as "very minor... could be accepted deliberately." The surrounding candidate prose already mixes past/present naturally, and the present tense reads well. Declined.

---

## Summary

- Major addressed: 1 of 1 (paragraph 58).
- Moderate addressed: 10 of 10 (paragraphs 18, 29 from part 1; 43, 46, 53/59/65 as one finding, 58, 62 [×2 findings], 65 from part 2).
- Minor addressed: 18 of 21 flagged (all applicable ones; 3 minor sub-items left as documented reviewer discretion — part of the 4 declined items above, one of which, paragraph 8, carries two sub-items).
- Bonus exclamation-mark finding (paragraphs 37, 38, 58): fixed; file-wide exclamation-mark count now matches source exactly (19/19), not just in the three flagged paragraphs.
- No paragraph without a confirmed finding was touched. The pride/confession paradox (paragraph 62) and its ambiguity were preserved, not resolved, per instructions.
