# Accessibility Review — Reviewer A (fresh read, candidate-only)

**Book/chapter:** Leviathan, Ch. 13 ("Of the Naturall Condition of Mankind...") — pilot chapter 14 in the app's numbering.

**What I read:** All 14 paragraphs of `candidate-sonnet.json`, in full, indices 0–13 (0-based, matching the JSON `paragraphs` array order). I did not read the source, the current modern-en file, or any other review. I read the chapter straight through once, then went back paragraph by paragraph.

Note on scope: per the prompt, this is an accessibility-only read (reader experience), not a fidelity check. I'm not commenting on whether anything is period-typical content (e.g. the description of Indigenous peoples in paragraph 10) — only on whether the *wording* is hard to parse or misleading for a general reader today.

---

## Chapter-wide pattern (not a single paragraph)

**The "consequent to" construction recurs three times** and is genuinely awkward each time, because it inverts normal modern word order (subject after "is/does not"):
- P8: "Whatever therefore is **consequent to** a time of War... the same is **consequent to** the time in which men live..."
- P12: "To this war of every man against every man, this also **is consequent**: that nothing can be unjust."
- P12: "It is likewise **consequent to** the same condition that there is no property..."

None of these are conceptually hard ideas — each is a simple "X follows from Y" claim — but the syntax is archaic Latinate inversion that a modern reader has to unscramble every time it appears. This is avoidably difficult wording, not unavoidable complexity: "Everything that follows from a state of war also follows from..." / "It follows from this war that nothing can be unjust" would carry the identical meaning with no loss.

---

## Paragraph-by-paragraph issues

**P0** — "Nature has made men so equal in the faculties of body and mind that, although one man may sometimes be found clearly stronger in body or quicker of mind than another, yet when everything is reckoned together the difference between one man and another is not so considerable that one man can therefore claim for himself any benefit to which another may not lay claim as well."
This is one sentence carrying four levels of subordination (so...that / although / yet...that / to which). Grammatically legal, but a reader will likely need a second pass to find the main clause. **Avoidably difficult** — the content (rough equality of natural ability) is simple; the single-sentence architecture is the obstacle. Could be split at "yet."

**P1** — "And as for the faculties of the mind (setting aside the arts grounded on words, and especially that skill of proceeding by general and infallible rules called Science — which very few men have, and only in a few things, since it is not a native faculty born with us, nor acquired, as Prudence is, while we are pursuing something else) — I find yet a greater equality among men than there is in strength."
The subject ("I find...") is separated from its verb by a parenthetical roughly 55 words long, itself containing a nested clause ("nor acquired, as Prudence is, while we are pursuing something else"). By the time the reader reaches "I find," the sentence's opening ("as for the faculties of the mind") has to be mentally re-retrieved. **Mixed**: the underlying distinction (Science as rare, teachable skill vs. Prudence as accumulated experience) is inherently a bit abstract — that's unavoidable conceptual content. But burying the main clause this deep inside a parenthetical is an avoidable structural choice; the same content works with the parenthetical moved to its own sentence.

**P1** — "What may perhaps make such equality seem hard to believe is nothing but a vain conceit of one's own wisdom, which almost all men think they have in a greater degree than the common run of people — that is, than everyone but themselves and a few others whom, by reputation or for agreeing with themselves, they approve of."
The closing clause is genuinely tangled: "than everyone but themselves and a few others whom... they approve of" requires tracking two different uses of "themselves" (the men in general, and the specific few they approve of) plus an ambiguous "for agreeing with themselves" (does this mean the few others agree with the man in question, or agree with each other?). **Avoidably difficult** — an ambiguous/overloaded referent chain, not a hard idea. The idea itself ("everyone thinks they're wiser than average, except for a few favorites") is simple.

**P3** — "Also, because there are some who take pleasure in contemplating their own power in acts of conquest, and pursue it further than their security requires, if others, who would otherwise be glad to be at ease within modest bounds, did not by invasion increase their own power, they would not be able, for any length of time, to survive by standing on the defensive alone."
This is the chapter's most overloaded sentence: a conditional ("if others... did not... they would not be able...") has its subject interrupted by an 11-word relative clause before the conditional even resolves, and "increase their own power" sits oddly close to the *earlier* "their own power" (belonging to the aggressive people), risking a misread of whose power is being discussed. **Avoidably difficult** — this is exactly the "grammatically legal but overloaded" case the review brief calls out. A restructure like "Otherwise, people who would be content with modest, defensible bounds could not survive for long on the defensive alone, unless they too expanded their power against invaders" preserves the meaning with far less strain.

**P4** — "For every man expects his companion to value him at the same rate he sets on himself, and at every sign of contempt or undervaluing he naturally endeavors, so far as he dares (which, among those who have no common power to keep them at peace, is far enough to make them destroy one another), to extort a greater value from those who show him contempt, by doing them harm, and from others by the example."
The verb phrase "endeavors... to extort" is split by a 20-word parenthetical, and the trailing "by doing them harm, and from others by the example" is compressed to the point of ambiguity — it takes a second read to work out that harming the offender is one channel and deterring bystanders is the other. **Avoidably difficult**, same pattern as P3/P1: idea is plain (people demand respect and will hurt others to get it, which deters onlookers too), syntax is what slows the reader.

**P6** — "The first use violence to make themselves masters of other men's persons, wives, children, and cattle; the second, to defend them; the third, over trifles..."
"The first use violence" should be "The first **uses** violence" — "the first" (Competition) is singular, and the immediately preceding sentence correctly uses the singular "makes." This reads as a subject-verb agreement slip and will make an attentive reader stumble/re-read. **Avoidably difficult — likely a wording error to fix**, not a complexity issue at all.

**P8** — "In such a condition there is no place for Industry... no commodious building..." — "commodious" (meaning spacious/convenient) is a genuinely obscure word for a general reader today. Low priority: this is part of the chapter's single most famous sentence ("solitary, poor, nasty, brutish, and short"), so there's a real case for leaving the register slightly elevated here on purpose. Flagging it as **avoidably difficult vocabulary**, but noting the tradeoff rather than urging a reflexive fix.

**P10** — "For the savage people in many places of America, except for the government of small families, **whose harmony depends on natural lust**, have no government at all..."
"Natural lust" is very likely to be misread. In modern English "lust" reads as sexual desire with a negative connotation; a reader will likely take this as saying family cohesion rests on sexual desire, missing that the phrase is doing service for something closer to "natural affection/instinct holding a household together without law." **Avoidably difficult** — this is a case where the literal word choice actively misleads rather than just sounding old-fashioned; it needs either a different word or a light gloss.

**P10** — "In any case, it may be perceived what kind of life there would be where there was no common power to fear, from the kind of life that men who have formerly lived under a peaceful government tend to degenerate into, in a civil war."
The "from the kind of life that..." clause, which tells the reader *how* to perceive the claim, is separated from "it may be perceived" by the entire first clause — a long-distance dependency that forces a re-read to connect the two halves. **Avoidably difficult** — inverted order; "You can see what such a life would be like by looking at how people who lived under peaceful government tend to degenerate in civil war" says the same thing in reading order.

**P11** — "But because by this they uphold the industry of their subjects, there does not follow from it that misery which accompanies the liberty of individual men."
Inverted syntax again ("there does not follow from it that misery," rather than "that misery does not follow from it"). **Avoidably difficult** for the same structural reason as the "consequent to" pattern above — simple claim, archaic word order.

**P12** — "Justice and injustice are none of the faculties either of the body or of the mind."
"Are none of the faculties" can misparse on first pass as "are not any faculties" (i.e., don't exist as faculties at all) rather than the intended "are not among the [list of] faculties." Minor, but a genuine double-take moment. **Avoidably difficult** — phrasing ambiguity.

**P12** — "It is likewise consequent to the same condition that there is no property, no dominion, no Mine and Thine distinct — but only that **to be every man's which he can get**, and for as long as he can keep it."
Beyond the "consequent to" issue already flagged chapter-wide, "that to be every man's which he can get" is itself inverted (normal order: "only what he can get is every man's"). Two archaisms stacked in one clause. **Avoidably difficult.**

**P12** — "And so much for the bad condition in which man is actually placed by mere nature — though with a possibility of coming out of it, **lying partly in the passions and partly in his reason**."
"Lying" needs to be mentally reattached to "a possibility," several words back across an em-dash. Minor but real friction. **Avoidably difficult** — could read "...though there is a possibility of escaping it, lying partly in..." with "possibility" and "lying" adjacent instead of split.

**P5/P6 — "Diffidence"**: this is the single most important flag in the chapter, and it's a vocabulary *trap* rather than ordinary difficulty. "Diffidence" is named as one of the three causes of quarrel ("Competition... Diffidence... Glory"), and the next paragraph glosses it only implicitly ("the second, for safety"). In current English, "diffidence" means shyness/timidity — a reader will very plausibly wonder why shyness causes people to attack each other, since nothing in the surrounding text tells them the word is being used in its older sense of "mutual distrust/insecurity" (which paragraph 3 had already established as "this mutual distrust," well before the term "Diffidence" is dropped as a proper-noun label). Contrast this with "Anticipation" in P3, which the candidate *does* self-gloss on the spot ("that is, by force or by cunning to master..."). "Diffidence" gets no equivalent gloss where it's introduced as a named cause. **Avoidably difficult — a false-friend word, not unavoidable complexity**, since the idea (fear/distrust breeds preemptive aggression) is not hard; only the untranslated label is.

---

## What's working well

- **P7** — the weather/war analogy ("the nature of foul weather lies not in a shower or two of rain but in an inclination to it over many days together...") reads cleanly and does real explanatory work; this is a case where dense philosophical content is rendered in genuinely accessible prose.
- **P9** — the "when he takes a journey, he arms himself... when he goes to sleep, he locks his doors... even within his own house he locks his chests" passage is vivid, concrete, and rhetorically effective; the following three rhetorical questions land cleanly.
- **P11** — the "state and posture of gladiators, with their weapons pointing and their eyes fixed on one another" image, immediately unpacked via dash into forts/garrisons/spies, is a good model for how to keep a metaphor and still gloss it for a modern reader.
- **P12** — "Where there is no common power, there is no law; where no law, no injustice" and "Force and fraud are, in war, the two cardinal virtues" are crisp, aphoristic, and lose nothing in translation — arguably the strongest writing in the chapter.
- **P13** (closing paragraph) is clean, well-paced, and closes the chapter without strain.
- P8's famous closing list ("no arts; no letters; no society... solitary, poor, nasty, brutish, and short") is appropriately preserved at high register given how well-known the line is; readers are unlikely to fault the one archaism ("commodious") in context.

---

## Unavoidable conceptual complexity (flagging for contrast, not as wording problems)

These are places where the *idea itself* is dense — inherent to a 17th-century philosophical argument — and no rewording would make them "easy," only clearer at the margins:
- The Science/Prudence distinction in P1 (rare, rule-based skill vs. universally acquired experience).
- The move from "equality of ability" to "equality of hope" to enmity in P2 — a compressed piece of formal argument, not a comprehension trap.
- The three-causes-of-quarrel framework itself (Competition/Diffidence/Glory) as a taxonomy — once "Diffidence" is correctly understood, holding three abstract categories in mind is just inherently more demanding reading than narrative prose, and that's expected for this text.
- The Justice/Injustice-has-no-place-in-war argument (P12) — a real philosophical claim (justice is relational, not personal) that takes work to absorb regardless of wording.

---

## Overall verdict: **needs targeted fixes**

The chapter is not broadly failing — several passages (the weather analogy, the locked-doors passage, the gladiator image, the Right/Wrong aphorisms, the closing paragraph) are genuinely well-rendered and should be left alone. But there's a real, fixable pattern of archaic Latinate word order ("consequent to," inverted clauses in P11/P12), a handful of overloaded single sentences where the main clause is buried inside long parentheticals (P0, P1, P3, P4), one apparent subject-verb agreement slip (P6), and — most importantly — one true false-friend vocabulary trap ("Diffidence" in P5/P6) that will actively mislead rather than merely slow a reader down. None of these require re-arguing the philosophy; they're line-level fixes. The remaining difficulty that *should* survive any fix is the chapter's inherent conceptual density (Science/Prudence, the causes-of-quarrel taxonomy, the justice argument), which is appropriate for this text and not something a modern-English rendering should try to eliminate.
