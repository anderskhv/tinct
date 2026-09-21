# Fidelity Review 6 — Leviathan, edition chapter 27 (Hobbes ch. 26, "Of Civil Laws")

**Date:** 2026-09-21
**Source (locked):** `books/wip/leviathan-pilot-ch27/source.json` — 48 paragraphs
**Candidate:** `books/wip/leviathan-pilot-ch27/candidate-sonnet.json` — 48 paragraphs
**Round:** 6 (independent re-check after round 5's ACCEPT AS-IS + 8 targeted fixes)

## Verdict

**ACCEPT AS-IS.**

No fixes required. Two stylistic observations are recorded below as notes only; neither
alters a claim and neither blocks acceptance.

**Ready for a final full non-sampled pass: YES.** The chapter has now had five consecutive
rounds of narrowing edits with no fidelity regression found in this round, and round 6's
changes are all grammar/idiom conversions of Hobbes's early-modern subjunctive into modern
indicative/modal phrasing. Nothing remains open that a targeted round could resolve; the
appropriate next step is the full 48-paragraph read-through, not another sample.

## Structural checks

| Check | Result |
| --- | --- |
| JSON parses (`python3 -m json.tool`) | PASS |
| Paragraph count source vs candidate | 48 vs 48 — PASS |
| Empty/blank paragraphs | none — PASS |
| Order / merges / splits / insertions | none — PASS |
| Chapter title | "Chapter 26. Of Civil Laws" — correct, matches source heading |

## Change containment

Diffed the working candidate against the round-5 commit (`03bd5e6d`) paragraph by paragraph.
Exactly eight paragraphs differ: **5, 6, 9, 12, 27, 29, 30, 42.** This matches the declared
round-6 set exactly. **No paragraph outside the declared set changed** — the other 40
paragraphs are byte-identical to their round-5 certified state.

Word-level diffs on the three long paragraphs (27, 29, 30) confirm the edits are surgical:
para 27 changed 4 short spans in a 790-word paragraph, para 29 changed 5 short spans in a
398-word paragraph, para 30 changed 3 spans in a 479-word paragraph. Nothing else in those
paragraphs moved.

## Per-edit verification against source

### Paragraph 5 — "he was free before" → "he was never bound in the first place"
Source: *"...and consequently he was free before. For he is free, that can be free when he
will: Nor is it possible for any person to be bound to himselfe; ...and therefore he that is
bound to himselfe onely, is not bound."*

**PASS.** Hobbes's "he was free before" means the sovereign's apparent subjection was never
real subjection, and the paragraph's own closing clause states the conclusion outright
("is not bound"). The new wording states that same conclusion.

The following sentence still works as a justification of the claim just made: "For a man who
can free himself whenever he wills was never truly bound" now supports "never bound in the
first place" more tightly than it supported "free before" (round 5 had already modernized
that clause to "never truly bound", so this edit removes a mismatch rather than creating one).
The "For..." connective remains logically correct — premise (can free himself at will) →
conclusion (was never bound). No disturbance.

### Paragraph 6 — "it is no longer law than the sovereign shall be silent on it" → "it remains law for only as long as the sovereign stays silent about it"
Source: *"and it is no longer Law, then the Soveraign shall be silent therein."*

**PASS.** Hobbes's construction is the archaic "no longer ... then" = "no longer than", i.e.
law persists exactly coextensively with the sovereign's silence, and not one moment beyond it.
"remains law for only as long as ... stays silent" carries both halves: duration equal to the
silence ("as long as") and the upper bound ("only"). Exact equivalence. The round-5 phrasing
was in fact ambiguous in modern English (readable as "it is not law any longer than..." vs.
"it is no longer law, then..."); the new wording removes that ambiguity without adding a claim.

Rest of paragraph 6 unchanged, including the pre-existing equity gloss ("that is, by what is
fair, apart from the letter of the law") and the lawyers/reasonable-customs clause. Verified
against source.

### Paragraph 9 — "ever so many, or ever so wise, men" → "however many, or however wise, men"
Source: *"if it should assemble never so many, or so wise men, from the Countries subject to
them, for whatsoever cause"*

**PASS — idiom modernization only.** Hobbes's "never so many" is the early-modern
concessive-intensive idiom whose modern equivalent is "however many" / "no matter how many".
Round 5's "ever so many" was the intermediate-period variant of the same idiom, still archaic.
The new wording is the correct modern rendering. No quantitative or logical change: the point
remains that the size or wisdom of the assembly is irrelevant to whether it acquires
legislative power.

Unchanged parts of paragraph 9 re-checked against source and consistent: the
"Common Law has no controller but the Parliament" quotation; the dissolve/control/
"control their controlling" chain; the `Parlamentum` / `Rex In Parlamento` pair with its
glosses; the force-and-justice "two arms" quotation and Hobbes's sardonic rejoinder.

### Paragraph 12 — golden-rule quotation
Source: *"Do not that to another, which thou thinkest unreasonable to be done by another to
thy selfe."*
New: *"Do not do to another what you would think unreasonable if it were done to yourself."*

**PASS.** All three load-bearing elements survive:
- **Who acts:** "you" (imperative "Do not do").
- **Who is acted upon:** "another".
- **The test:** what *you* would judge unreasonable were you the one on the receiving end.

The dropped element is source's explicit "by another" in the hypothetical reversal. This is
recoverable redundancy: "if it were done to yourself" already presupposes an external agent
(you cannot be the one doing it to yourself in a reciprocity test), and the sentence's first
clause has established the two-party frame. The rule's reciprocal structure is intact and its
scope is not widened or narrowed. Note this paragraph's quotation is itself a modernized
rendering of Hobbes's own English, not a historical quotation requiring verbatim preservation.

### Paragraph 27 — the judge / tittle / fleeing-felon paragraph
Source: *"For though a wrong Sentence given by authority of the Soveraign, if he know and
allow it, in such Lawes as are mutable, be a constitution of a new Law, in cases, in which
every little circumstance is the same; yet in Lawes immutable, such as are the Lawes of
Nature, they are no Lawes to the same, or other Judges, in the like cases for ever after."*

**PASS.** The concessive logic survives. The structure is now
*assert-then-contrast* ("A wrong sentence ... **does constitute** a new law in laws that are
mutable ...; **yet** in immutable laws ... such sentences are no laws ...") rather than
*though-then-yet*. This is legitimate: in the source the "though" clause is a **conceded
truth**, not a hypothetical or a claim Hobbes rejects — he grants that in mutable law a
knowingly-allowed wrong sentence does make new law, and the whole weight of the sentence falls
on the immutable-law exception. Converting the subjunctive "be a constitution of" to the
indicative "does constitute" therefore asserts exactly what Hobbes concedes, and the retained
"yet" preserves the contrast. Both restrictions are intact: mutable laws only, and only "for
cases in which every little circumstance is the same".

Also verified unchanged in this paragraph:
- **Tittle gloss:** "not one tittle — that is, not the smallest stroke — of the law of nature
  shall pass, for it is the eternal law of God" — correctly renders source's "not one title",
  which is Hobbes's spelling of *tittle*. Gloss is accurate and still present.
- **Fleeing-felon hypothetical:** accusation of a capital crime, flight for fear of a
  corrupt/partial bench, capture, legal trial, demonstrated innocence, acquittal, nonetheless
  condemned to lose his goods, "a plain condemnation of the innocent" — every step present and
  in source order.
- **Coke quotation:** intact, with the earlier rounds' "notwithstanding" → "despite" in both
  places ("he shall, despite his innocence, forfeit all his goods" and "an innocent man,
  judicially acquitted, despite his innocence"), plus the chattels gloss.
- The capital/not-capital dilemma, "no law of England", the presumption-of-the-judges point,
  the refuse-to-hear-proof-is-refusing-justice argument, and the closing
  "law to the party pleading, no law to any succeeding judge" — all unchanged and faithful.

**Note (non-blocking):** dropping "For though" also drops source's "For", which linked this
sentence back to the preceding claim as its justification. The candidate's preceding sentence
("Nor (for the same reason) does it become a law to other judges, even if they have sworn to
follow it") still sits immediately before it and the relation is recoverable from context, but
the sentence now reads slightly more as a fresh assertion than as support. Rhetorical only; no
claim added, removed, or altered.

### Paragraph 29 — the substitute-judge remedy
Source: *"but procure of the Soveraign that another be made Judge, and himselfe Witnesse."*
New: *"but he shall have the sovereign appoint another judge, and shall himself become a
witness."*

**PASS.** The causative "have the sovereign appoint" is an exact modern rendering of
"procure of the sovereign that another be made judge": the subject is the sitting judge, the
sovereign is the agent who appoints, the appointee is a replacement judge, and the original
judge's new role is witness. Agency is not inverted (the judge does not appoint; he gets the
sovereign to), and the subjunctive "be made" is correctly absorbed into the causative. The
supplied subject "he shall" is correct — source's bare imperative-style clause continues the
"the judge ... shall" construction from earlier in the sentence.

Remainder of paragraph 29 confirmed unchanged: the letter/sentence distinction, the
one-sense-of-the-law point, the deference-to-equity and defer-judgement remedies, the
thrust-out-of-his-house example, the false-accusation example, and the closing
incommodity/inconvenience caveat ("no inconvenience can warrant a sentence against the law...
every judge of right and wrong is not a judge of what is convenient or inconvenient for the
commonwealth"). The wide diff context on this paragraph is an artifact of character-level
diffing a shortened span; word-level diff shows five short spans changed and nothing else.

### Paragraph 30(a) — judge's vs advocate's abilities
Source: *"The abilities required in a good Interpreter of the Law, that is to say, in a good
Judge, are not the same with those of an Advocate; namely the study of the Lawes."*
New: *"...are different from an advocate's, whose ability is chiefly deep study of the laws."*

**PASS — the ambiguous referent is resolved in the correct direction.** In the source,
"namely the study of the Lawes" is in apposition to *"those of an Advocate"*, i.e. it names
the **advocate's** ability, and the paragraph that follows proves this: Hobbes immediately
argues that a judge need *not* study law beforehand (he takes the law from statutes as alleged
in pleading), and cites the Lords of Parliament and the twelve-man jury as competent judges
untrained in law. Attaching "study of the laws" to the judge would invert the entire argument.
The relative clause "whose ability is..." makes the correct attachment explicit. The contrast
drawn — judge's abilities vs. advocate's abilities — is unchanged.

**Note (non-blocking):** "chiefly" is a hedge with no counterpart in source's flat "namely"
(and "deep" likewise expands "the study of the Lawes", though "deep" is pre-existing from an
earlier round, not introduced here). Neither distorts: Hobbes's point is that legal study is
what characterises the advocate, which "chiefly" states accurately. Recorded for the record
only; no change required.

### Paragraph 30(b) — "presumed to be most in" → "presumed to be found most in"
Source: *"is presumed to be in those most, that have had most leisure, and had the most
inclination to meditate thereon."*

**PASS.** "found" completes the elliptical construction without content change. The
leisure/inclination pair and the equity-depends-on-one's-own-natural-reason-and-meditation
grounding are unchanged, as are the second/third/fourth qualities of a good judge.

### Paragraph 30 — fact/right doubling (requested spot-check)
**CONFIRMED UNCHANGED.** The candidate still reads "give sentence, not only of the fact but of
the right, pronouncing simply for the complainant or for the defendant — that is, they are
judges not only of the fact but also of the right". This mirrors source's own deliberate
restatement ("give Sentence, not onely of the Fact, but of the Right; and pronounce simply for
the Complaynant, or for the Defendant; that is to say, are Judges not onely of the Fact, but
also of the Right"). Correctly left alone again this round; the doubling is Hobbes's, not the
renderer's.

### Paragraph 42 — subjunctive "be assured" → "must be assured"
Source: *"because it is of the essence of Law, that he who is to be obliged, be assured of the
Authority of him that declareth it"*

**PASS.** Straight subjunctive-to-modal conversion inside a "since it belongs to the very
essence of law that..." clause. No content change. The paragraph's two questions (how can a
man be assured of another's revelation; how can he be bound to obey) and the
miracles/sanctity/felicity triad with its "not assured evidence" conclusion are unchanged and
faithful.

## Requested consistency spot-checks (previously certified paragraphs)

All of the following are byte-identical to their round-5 certified state and were re-read
against source for this round:

| Para | Content | Result |
| --- | --- | --- |
| 4 | Sovereign is sole legislator; only sovereign can repeal, since a law is repealed only by another law forbidding its execution | Consistent |
| 8 | Victor's laws; provinces and customs; prescription gloss; generally-observed unwritten law = law of nature | Consistent |
| 9 | (see above — unchanged portions) | Consistent |
| 17 | Judge's sentence as sufficient verification of the law of nature in the individual case; lawyer's advice is only advice | Consistent |
| 20 | Letter vs. intendment; interpretation depends on sovereign authority; interpreter-becomes-legislator warning | Consistent |
| 21 | All laws need interpretation; law of nature most obscure; short/long written laws; final-causes gloss; Gordian knot | Consistent |
| 30 | fact/right doubling (see above) | Unchanged, correctly |
| 33 | Decrees of the whole people of Rome; imperial authority; Acts of Parliament comparison | Consistent |
| 34 | Decrees of the common people excluding the Senate; tribune; House of Commons comparison | Consistent |
| 47 | Laws vs. charters; jubeo/injungo vs. dedi/concessi; all-subjects vs. one-man scope | Consistent |

## Coverage statement

- **Fully verified against source this round:** paragraphs 5, 6, 9, 12, 27, 29, 30, 42 (all
  eight round-6 edits, each read in full against its source paragraph).
- **Re-read against source this round:** paragraphs 4, 8, 17, 20, 21, 33, 34, 47.
- **Verified byte-identical to round-5 certified state:** all 40 paragraphs outside the
  round-6 set (0–3, 7, 8, 10, 11, 13–26, 28, 31–41, 43–47).
- **Structural verification:** all 48 paragraphs (count, order, non-emptiness, JSON validity).

## Recommendation

Accept the round-6 candidate as-is and proceed to the final full non-sampled read-through of
all 48 paragraphs. No paragraph in this chapter is currently carrying a known defect.
