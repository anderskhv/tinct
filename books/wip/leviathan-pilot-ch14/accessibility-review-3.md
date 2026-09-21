# Accessibility Review — Round 3 (Reviewer A, fresh/blind pass)

**Book/chapter:** Hobbes, *Leviathan*, Chapter 13 ("Of the Naturall Condition
of Mankind, as Concerning Their Felicity, and Misery") — modern-English
reading edition, pilot chapter.

**Candidate file read:** `books/wip/leviathan-pilot-ch14/candidate-sonnet.json`
only. All 14 paragraphs read in full, start to finish, then reread
paragraph by paragraph. I did **not** read `source.json`,
`current-modern-en.json`, or any prior review `.md` file (including
round 2's), per instructions — this is an independent pass, not a
diff against round 2. Indices below are 0-based, matching array
position in the JSON (paragraph 0 = the chapter's first paragraph,
paragraph 13 = the last).

**Note on "round 2's issues":** because I was barred from reading the
round 2 review file, I cannot state which specific round-2 findings
were fixed. What follows is a complete, independent list of everything
I flagged in this candidate as it stands now. The merge owner can diff
this against round 2's list directly to see what closed and what's new
or recurring.

---

## Flagged issues

**Paragraph 1** ("And as for the faculties of the mind…")
> "setting aside skills that depend on the use of words, and especially
> that skill of proceeding by general and infallible rules called
> Science — which very few men have, and only in a few things, since it
> is not a native faculty born with us, nor is it acquired incidentally,
> the way Prudence is, in the course of pursuing something else"

This parenthetical stacks four or five subordinate clauses before the
main clause ("I find yet a greater equality among men than there is in
strength") ever resolves. Grammatically legal, but a reader has to hold
the sentence open across a long detour and will likely need to
re-read to recover what the sentence is actually asserting.

**Paragraph 2** ("And from this it comes about…")
> "And the invader, in turn, is in the like danger from another."

"In the like danger" is an unresolved archaic construction. A
contemporary reader expects "in the same danger" or "in similar
danger" — "the like" as a stand-alone modifier reads as a stumble.

**Paragraph 3** ("And from this mutual distrust…")
> "Also, because there are some who take pleasure in contemplating
> their own power in acts of conquest, and pursue it further than
> their security requires, if others, who would otherwise be glad to
> stay safely within modest bounds, did not increase their own power
> through invasion, they would not be able to survive for long by
> relying on defense alone."

The conditional's subject ("others") and its verb ("did not increase")
are separated by a full embedded relative clause ("who would otherwise
be glad to stay safely within modest bounds"). By the time the reader
reaches "did not increase," the "if…then" frame set up at the start of
the sentence has to be actively reconstructed. This is the kind of
grammatically-legal-but-overloaded sentence the brief asks to flag even
though no single word in it is hard.

**Paragraph 4** ("Again, men take no pleasure…")
> "he naturally endeavors to extort a greater value from those who
> show him contempt, by doing them harm, and from others by the
> example"

Elliptical: "and from others by the example" drops the verb and object
that would make the clause parse cleanly (something like "…and
[extorts a greater valuation] from other people by [making] an example
[of the ones he harms]"). As written, a reader has to guess at the
missing material to finish the thought.

**Paragraph 6** ("From this it is plain…")
> "during the time men live without a common power to keep them all in
> awe"

Risk of a genuine misread rather than just difficulty: in current
usage "awe" mostly carries a positive/wonder connotation ("in awe of
the view"), while Hobbes's sense here is "in fear/subjection." A reader
moving quickly can register the wrong tone for a beat before the
surrounding sentence corrects it.

**Paragraph 7** ("Whatever, therefore, follows from a time of war…")
> "with no other security than what their own strength and their own
> invention will furnish them with"

"Invention" here means ingenuity/resourcefulness, but the far more
common modern sense is "an invented device/gadget." Likely a small
momentary miscue before the reader settles on the right meaning.

> "no commodious building"

"Commodious" (spacious, convenient) is a low-frequency word for a
general contemporary reader and may require inferring the meaning from
context rather than recognizing it directly.

**Paragraph 9** ("It may perhaps be thought…")
> "the kind of life there would be with no common power to fear can be
> perceived from the kind of life that men who have formerly lived
> under a peaceful government tend to degenerate into, during a civil
> war"

The relative clause's verb ("degenerate into") is separated from its
antecedent ("the kind of life") by the long intervening clause "that
men who have formerly lived under a peaceful government tend to" —
another case of legal-but-overloaded syntax that invites a re-read.

**Paragraph 10** ("But though there had never been…")
> "But because by this they uphold the industry of their subjects,
> that misery which accompanies the liberty of individual men does not
> follow from it."

Dense causal compression with inverted word order. A modern reader
would more naturally expect something like "…so their subjects don't
suffer the misery that comes with individual liberty." As written, the
double negative-adjacent phrasing ("does not follow from it," referring
back two clauses) takes a second pass to untangle.

**Paragraph 11** ("To this war of every man against every man…")
> "this also is consequent: that nothing can be unjust"

Archaic predicate order — "this also is consequent" instead of
"this also follows" or "one more consequence of this is…"

> "Justice and injustice are none of the faculties either of the body
> or of the mind."

"Are none of the faculties" is an archaic negative construction; the
natural modern phrasing is "are not among the faculties" or "are not
qualities of."

> "no property, no dominion, no Mine and Thine distinct"

Inverted order — noun before "distinct" — reads oddly. A modern
reader expects "no distinction between mine and thine."

> "though with a possibility of coming out of it, lying partly in the
> passions and partly in his reason"

The participial phrase "lying partly in…" is several words removed
from its real subject ("the possibility"), so on first pass it can
misattach to "it" (the bad condition itself) rather than to the
possibility of escaping it.

**Paragraph 13** (final paragraph)
> "desire of such things as are necessary for a comfortable life"

Archaic "desire of… as are" construction; modern usage would be
"desire for things that are necessary."

---

## What's working well

- Paragraph 5's three-item list ("First, Competition; second,
  Diffidence… third, Glory.") and paragraph 6's parallel breakdown
  ("The first makes men invade for gain; the second, for safety; and
  the third, for reputation…") are crisp and easy to track — the
  semicolon-separated triads carry real clarity.
- "Where there is no common power, there is no law; where no law, no
  injustice." (paragraph 11) is elliptical but reads cleanly — the
  parallelism itself tells the reader what's missing, so it doesn't
  stumble the way the other ellipsis (paragraph 4, above) does.
- The extended gladiator metaphor in paragraph 10 ("in the state and
  posture of gladiators, with their weapons pointing and their eyes
  fixed on one another — that is, their forts, garrisons, and guns
  upon the frontiers…") is long but unspools in order and lands the
  comparison clearly; a good model for how a long sentence can still
  read smoothly.
- The famous closing image of paragraph 7, "the life of man, solitary,
  poor, nasty, brutish, and short," reads as plain, forceful modern
  prose with no friction at all.

---

## Verdict

**Needs targeted fixes.**

Explicitly: at this point essentially all of the remaining difficulty
in this chapter is avoidably difficult *wording*, not unavoidable
conceptual complexity. Hobbes's ideas here — natural equality, the
three causes of quarrel, the definition of war as a standing
disposition rather than constant battle, the state of nature, the
absence of justice without common power — all come through clearly in
this rendering; nothing on the list above reflects a hard concept that
must stay hard. Every item flagged is a leftover piece of
17th-century sentence architecture (inverted word order, elliptical
compression, a subject separated from its verb by a long embedded
clause) or a single word whose common meaning has drifted since Hobbes
wrote it ("awe," "invention," "commodious"). All of these are
fixable by local rewording without touching content, meaning, or
paragraph structure — this is not a chapter that has hit a ceiling of
unavoidable difficulty. A further editing pass focused specifically on
the ~11 sentences quoted above (mostly paragraphs 1, 3, 4, 9, 10, and
11, which carry the bulk of the remaining overload) would likely move
this chapter to "substantially accessible."
