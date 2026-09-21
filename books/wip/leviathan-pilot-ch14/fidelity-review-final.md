# Fidelity Review — Final Full Pass (non-sampled)

**Book:** Hobbes, *Leviathan* (modern-en pilot)
**Edition chapter:** 14 (Hobbes's Chapter 13, "Of the Natural Condition of Mankind")
**Source:** `books/wip/leviathan-pilot-ch14/source.json`
**Candidate:** `books/wip/leviathan-pilot-ch14/candidate-sonnet.json`
**Date:** 2026-09-21
**Scope:** Full non-sampled read of all 14 paragraphs in current final state (post round 6). Not a diff against a prior round.

## Verdict

**ACCEPT AS-IS**

No fidelity defects found. Three non-blocking observations are recorded at the
end; none require a change before the hash is pinned.

## Structure check

| Field | Source | Candidate | Status |
|---|---|---|---|
| `number` | 14 | 14 | match |
| `title` | "Chapter 13. Of the Naturall Condition of Mankind, as Concerning Their Felicity, and Misery" | identical string | match |
| paragraph count | 14 | 14 | match |
| paragraph order | — | 1:1, no merge/split/reorder | match |
| JSON validity | valid | valid | pass |

Word counts per paragraph (source → candidate): 102→99, 228→249, 134→132,
146→148, 98→110, 20→23, 75→77, 149→158, 135→137, 220→227, 122→128, 107→111,
178→186, 68→68. All within normal rendering range; no paragraph shows
compression consistent with summarizing or expansion consistent with invention.

## Paragraph-by-paragraph

**P1 — natural equality of faculties.** Actors, concessive structure ("though
there bee found one man sometimes manifestly stronger…"), and the negated
comparative ("not so considerable, as that one man can thereupon claim…") all
preserved. "pretend" → "lay claim" is the correct 17th-c. sense. "secret
machination" → "secret scheming", "confederacy with others, that are in the
same danger with himselfe" → "joining with others who are in the same danger as
himself". No omission, no addition.

**P2 — equality of mind.** The long source parenthesis is promoted to its own
opening sentence ("Set aside, for now, skills that depend on the use of
words…"), with the main clause resuming as "As for the rest of the faculties of
the mind, I find yet a greater equality among men than there is in strength."
Restructure only; the exclusion of Science from the comparison is intact, as are
its three qualifiers (very few have it, only in few things; not native; not
attained incidentally as Prudence is). "Prudence is but Experience… equall time,
equally bestowes on all men" preserved with both "equally" senses. "the Vulgar"
→ "the common run of people" with the source's own gloss ("that is, than
everyone but themselves and a few others") retained; "whom by Fame, or for
concurring with themselves, they approve" correctly rendered as approval either
by reputation or because those others agree with them. Concessive "howsoever
they may acknowledge many others to be more witty…" → "although… they will
hardly believe there are many as wise as themselves" — negation and hedging
("hardly") intact. Closing inference ("this proveth rather that men are… equall,
than unequall") and the contentment-with-share observation both preserved.

**P3 — equality of hope, competition.** Causal direction preserved despite the
clause flip: equality of hope *arises from* equality of ability. Conditional
("if any two men desire the same thing, which neverthelesse they cannot both
enjoy") intact, including the concessive "nevertheless". Parenthetical ends
("principally their owne conservation, and sometimes their delectation only")
preserved with both the "chiefly" and "only" scope markers. Hedge "others may
probably be expected" retained as "may probably be expected" — not upgraded to
certainty. Reciprocity clause ("And the Invader again is in the like danger of
another") intact.

**P4 — diffidence and anticipation.** "no way… so reasonable, as Anticipation"
→ "the most reasonable way… is Anticipation": superlative equivalent, no
overstatement. Means ("by force, or wiles"), extent ("all men he can"), and
terminating condition ("so long, till he see no other power great enough to
endanger him") all present. The normative pair "is no more than his own
conservation requireth, and is generally allowed" and the closing "it ought to
be allowed him" are both preserved as stated, not softened. The conquest-lover
conditional is restructured into assertion-plus-conditional ("others… must also
increase their own power through invasion; if they did not, they would not be
able to survive for long by relying on defense alone"). The source's own
conditional is fully restated in the second half, and the "must" in the first
half is the entailment Hobbes immediately endorses in the next sentence
("ought to be allowed him"). Not a fidelity defect; noted below as Observation 2.

**P5 — glory and contempt.** Negation intact ("men have no pleasure, but on the
contrary a great deale of griefe"). "over-awe" → "keep… in check". The source's
mid-sentence parenthesis ("as far as he dares… is far enough to make them
destroy each other") is moved to the end of the sentence; all of its content,
including the condition "amongst them that have no common power, to keep them in
quiet", is preserved. Both extraction targets kept and correctly distinguished:
from his contemners "by dommage" → "by doing them harm"; from others "by the
example" → "by making an example of them".

**P6 — three causes.** Competition / Diffidence / Glory, in order, numbered
first-second-third. Inline gloss "(that is, mutual distrust)" added for
Diffidence — consistent with the editorial-transparency convention used
elsewhere in this chapter.

**P7 — the three causes elaborated.** Gain / Safety / Reputation mapped to the
correct causes. Full object list ("persons, wives, children, and cattell")
intact; "the second, to defend them" preserved with the right referent; the
trifles list (a word, a smile, a different opinion) complete, and the
direct-vs-reflected distinction across Kindred / Friends / Nation / Profession /
Name is complete and in order.

**P8 — the definition of war.** "during the time men live without a common Power
to keep them all in awe" preserved, with gloss "that is, in fear and
subjection". "Warre… of every man, against every man" intact. The negation
defining war ("consisteth not in Battell onely, or the act of fighting") and the
positive definition ("a tract of time, wherein the Will to contend by Battell is
sufficiently known" → "a stretch of time during which the will to fight by
battle is plain to see") are both intact. Weather analogy complete, including
"an inclination thereto of many dayes together". Closing condition "during all
the time there is no assurance to the contrary" and "All other time is PEACE"
(caps retained, as is WAR) preserved.

**P9 — the consequences; "solitary, poor, nasty, brutish, and short".** The
conditional-equivalence frame ("Whatsoever therefore is consequent to a time of
Warre… the same is consequent to the time wherein men live without other
security than…") is preserved in both halves. The privation list is complete and
in source order, all twelve items: industry (with its stated reason, "because the
fruit thereof is uncertain"), culture of the earth, navigation, use of imported
commodities, commodious building, instruments of moving and removing, knowledge
of the face of the earth, account of time, arts, letters, society, and "which is
worst of all, continuall feare, and danger of violent death".

> **Famous line — VERIFIED INTACT:** "and the life of man, solitary, poor,
> nasty, brutish, and short." All five adjectives, in source order, no
> substitutions.

**P10 — the experience argument; round-6 split.** Opening hedge ("It may seem
strange to some man, that has not well weighed these things") preserved,
including the hedged "desire perhaps to have the same confirmed by Experience" →
"may wish perhaps to have it confirmed by experience". All three locks
(journey/arms, doors, chests) present with the concessive "and this when he
knows there bee Lawes, and publike Officers, armed, to revenge all injuries" →
"although he knows there are laws and public officers, armed, to avenge any
injury done to him". The three rhetorical questions are kept as questions with
their correct pairings (fellow subjects/rides armed, fellow citizens/locks
doors, children and servants/locks chests). "Does he not there as much accuse
mankind by his actions, as I do by my words?" intact. Disclaimer "But neither of
us accuse mans nature in it" intact. "The Desires, and other Passions of man,
are in themselves no Sin" intact.

> **Round-6 target — three-step chain VERIFIED COMPLETE AND IN ORDER.**
>
> Source: "No more are the Actions, that proceed from those Passions, till they
> know a Law that forbids them; which till Lawes be made they cannot know: nor
> can any Law be made, till they have agreed upon the Person that shall make it."
>
> Candidate: "Nor are the actions that proceed from those passions sinful until
> men know a law that forbids them. But they cannot know such a law until laws
> are made, and no law can be made until they have agreed upon the person who is
> to make it."
>
> | Step | Source clause | Candidate clause | Status |
> |---|---|---|---|
> | 1. No sin without a known law | "No more are the Actions… till they know a Law that forbids them" | "Nor are the actions… sinful until men know a law that forbids them" | preserved |
> | 2. Law cannot be known until made | "which till Lawes be made they cannot know" | "But they cannot know such a law until laws are made" | preserved |
> | 3. Law cannot be made until a lawmaker is agreed | "nor can any Law be made, till they have agreed upon the Person that shall make it" | "and no law can be made until they have agreed upon the person who is to make it" | preserved |
>
> Nothing dropped, nothing reordered, no step collapsed. The predicate "sinful"
> supplied in step 1 is the correct resolution of the source's ellipsis ("No
> more are the Actions" elides "no Sin" from the preceding sentence) — it makes
> explicit what the source states, and adds no claim. The "until" chain keeps
> each step's dependency pointing the same direction as the source. The split
> from one semicolon-chained sentence into two sentences does not break the
> chain: the connective "But" carries the same adversative-continuation force as
> the source's "which… ; nor…".

**P11 — America / never such a time.** Hedges preserved exactly: "It may
peradventure be thought" → "It may perhaps be thought"; "I believe it was never
generally so, over all the world" retained as a belief, not upgraded to a fact;
the adversative "but there are many places, where they live so now" intact.

> **America passage — VERIFIED UNSOFTENED** (per the round-1 editorial-
> transparency decision): "savage people", "many places of America", "no
> government at all", "brutish manner" all retained verbatim in sense. The
> exception clause is preserved with its correct scope (government of small
> families excepted from "no government at all"), and "the concord whereof
> dependeth on naturall lust" is rendered "whose harmony depends on natural lust
> — that is, natural appetite", an added gloss that clarifies the 17th-c. sense
> without softening the claim. "as I said before" → "I described before".

The closing inference is restructured from "it may be perceived what manner of
life there would be… by the manner of life which men… use to degenerate into, in
a civill Warre" to "the kind of life men tend to degenerate into during a civil
war… shows what kind of life there would be with no common power to fear". The
evidential direction is unchanged (civil-war behavior is the evidence; the
no-common-power condition is what it reveals), and the hedge "use to degenerate
into" is preserved as "tend to degenerate into". "Howsoever" → "In any case".

**P12 — sovereigns in the posture of war; round-6 restructure.** Counterfactual
concessive ("though there had never been any time, wherein particular men were
in a condition of warre one against another") preserved. "Kings, and persons of
Soveraigne authority" and the stated reason "because of their Independency"
intact. Gladiator image complete, with the full appositive mapping (weapons →
forts, garrisons, guns on the frontiers; eyes fixed → continual spies upon their
neighbours) and the concluding "which is a posture of War".

> **Round-6 target — VERIFIED LOGICALLY EQUIVALENT; referent correct.**
>
> Source: "But because they uphold thereby, the Industry of their Subjects;
> there does not follow from it, that misery, which accompanies the Liberty of
> particular men."
>
> Candidate: "But because this posture of war upholds the industry of their
> subjects, that same posture does not produce the misery that accompanies the
> liberty of individual men."
>
> - **Referent of "it":** in the source, "thereby" and "from it" both point back
>   to the posture of war named in the immediately preceding clause ("which is a
>   posture of War") — not to the subjects' industry and not to the sovereigns.
>   "that same posture" is therefore the correct referent, and making it
>   explicit removes a genuine ambiguity in the original pronoun without
>   changing what it denotes.
> - **Negation:** the negation attaches to the same proposition in both — the
>   misery does not follow / is not produced. Scope unchanged.
> - **Causality:** "does not follow from it" (the misery is not a consequence of
>   the posture) → "does not produce" (the posture does not cause the misery).
>   These are converse phrasings of one relation; no strengthening or weakening.
> - **Reason clause:** "because they uphold thereby the Industry of their
>   Subjects" is preserved as the stated ground for the denial.
> - **"particular men" → "individual men"** is correct (Hobbes's contrast is
>   private persons vs. sovereigns) and is used consistently in this paragraph
>   and in P12's opening clause.

One actor note: the source's grammatical subject of "uphold" is the sovereigns
(they uphold industry *thereby*); the candidate makes the posture itself the
subject. The instrument becomes the agent. The causal content is identical —
the sovereigns uphold industry by means of the posture, so the posture upholds
industry — and the active-voice restructure is what round 6 was asked to
deliver. Not a defect; noted below as Observation 3.

**P13 — no injustice; no property.** "To this warre… this also is consequent;
that nothing can be Unjust" preserved with the consequence relation intact.

> **Famous line — VERIFIED INTACT:** "Where there is no common power, there is
> no law; where no law, no injustice." The elliptical second clause is preserved
> as an ellipsis, not expanded; only the source's colon becomes a semicolon.

"Force, and Fraud, are in warre the two Cardinall vertues" intact, with the
restrictive "in war" in place. The faculties argument is complete: justice and
injustice are not faculties of body or mind; the counterfactual test ("If they
were, they might be in a man that were alone in the world, as well as his
Senses, and Passions"); and the conclusion that they are qualities relating to
men in society, not in solitude. Property clause complete — "no Propriety, no
Dominion, no Mine and Thine distinct" — with the positive replacement ("only
that whatever a man can get is his") and its duration condition ("for as long as
he can keep it"). Final sentence preserves the concessive escape hatch: man is
actually placed in this ill condition by mere nature, *though* with a
possibility of coming out of it, that possibility consisting partly in the
passions and partly in his reason. The candidate repeats "a possibility" to fix
the antecedent of "consisting"; this resolves a source ambiguity in the only
reading Hobbes's next paragraph supports.

**P14 — passions and reason inclining to peace.** All three passions present and
in order (fear of death; desire of things necessary to commodious living; hope
by their industry of obtaining them). Reason's role ("suggesteth convenient
Articles of Peace, upon which men may be drawn to agreement") preserved,
including the hedged "may be drawn". Forward reference intact: these articles are
otherwise called the Laws of Nature, treated "in the two following chapters".
Word count identical to source (68).

## Systematic checks

| Check | Result |
|---|---|
| Actors / agents | No misassignment. Every "he", "they", "his companion", "the invader", "kings" resolves to the source's referent. Two deliberate pronoun-to-noun resolutions (P12 "that same posture", P13 "a possibility") both resolve correctly. |
| Negation | All negations preserved with correct scope, including the definitional negations in P8 ("not in Battell onely"), P9's privation list, P12's "does not produce", and P13's "nothing can be Unjust" / "no Law, no Injustice". No double-negative slips, no dropped "not". |
| Causality | All "for", "therefore", "from hence it comes to passe", "by consequence", "because", "till/until" relations preserved with unchanged direction. Three clause-order flips (P3, P11, P12) each keep the causal/evidential arrow pointing the same way. |
| Certainty / hedging | "may perhaps", "probably", "peradventure", "I believe", "it may seem strange", "hardly believe", "use to degenerate", "may be drawn" — all retained. No hedge removed; no assertion upgraded to certainty; no certainty downgraded to hedge. |
| Conditions | All conditionals intact with antecedent and consequent unchanged: P1 "though… yet", P3 "if any two men desire", P4 conquest-lover conditional and "so long, till he see", P8 "during all the time there is no assurance", P10's three-step until-chain, P12's counterfactual "though there had never been any time", P13's "If they were", "for as long as he can keep it". |
| Omissions | None found. Every list is complete and in source order (three causes; gain/safety/reputation; the trifles; kindred/friends/nation/profession/name; the twelve privations; the three passions inclining to peace). |
| Additions | Four inline glosses, all flagged in-text by an em-dash "that is" construction consistent with the chapter's established editorial-transparency convention: "Diffidence (that is, mutual distrust)" (P6), "in awe — that is, in fear and subjection" (P8), "natural lust — that is, natural appetite" (P11). Plus one clarifying repetition ("a possibility", P13). No substantive claim is added anywhere. |
| Silent corrections | None. No factual, logical, or moral "repair" of Hobbes. The America passage, the conquest/"ought to be allowed" passage, and the force-and-fraud line are all left as Hobbes wrote them. |
| Famous lines | All three verified intact — see P9, P13 above. |
| Proper nouns / capitalized terms | America, Science, Prudence, Experience, Competition, Diffidence, Glory, Laws of Nature, WAR, PEACE all preserved. Capitalization of WAR/PEACE for emphasis preserved from source. |

## Non-blocking observations

1. **Title retains original spelling.** The `title` field is carried over
   verbatim from the source, including "Naturall". This matches the source
   exactly and has been stable through all six rounds, so it appears
   intentional for the pilot. Flagged only so the decision is explicit before
   the hash is pinned — no change recommended here.

2. **P4, "must also increase their own power through invasion".** The source
   states this as a conditional only ("if others… should not by invasion
   increase their power, they would not be able… to subsist"). The candidate
   asserts the entailment first and then restates the source's conditional in
   full. Nothing from the source is lost, and the asserted "must" is endorsed by
   the next sentence ("it ought to be allowed him"). Acceptable as rendered.

3. **P12, agent shift.** The source's subject of "uphold" is the sovereigns;
   the candidate's is the posture of war. This is instrument-as-agent, the
   intended effect of the round-6 active-voice restructure, and it does not
   change who does what or what causes what. Acceptable as rendered.

## Conclusion

Fourteen paragraphs read in full against source. No defects in actors,
negation, causality, certainty, conditions, omissions, additions, or silent
corrections. Structure, title, and numbering match. Both round-6 edits are
correct: the P9 three-step chain is complete and in order, and the P11 active-
voice restructure is logically equivalent with the correct referent. All three
famous passages and the unsoftened America passage are intact.

**ACCEPT AS-IS — ready for hash pinning.**
