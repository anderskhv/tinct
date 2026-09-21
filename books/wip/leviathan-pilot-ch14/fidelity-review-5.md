# Fidelity Review — Round 5 (independent re-check)

**Chapter:** edition chapter 14 = Hobbes's Chapter 13, "Of the Naturall Condition of Mankind, as Concerning Their Felicity, and Misery"
**Locked source:** `books/wip/leviathan-pilot-ch14/source.json` (14 paragraphs)
**Candidate:** `books/wip/leviathan-pilot-ch14/candidate-sonnet.json` (14 paragraphs)
**Date:** 2026-09-21
**Reviewer:** independent fidelity pass (round 5 of accept/fix/reverify)

## VERDICT: ACCEPT AS-IS

No fixes required. The chapter is **ready for the final full non-sampled pass.**

---

## Coverage and mechanical checks

- Paragraph count: source 14 / candidate 14. Order and indices match 1:1. Nothing merged, split, reordered, dropped, or added.
- Source file untouched since it was pinned (`e4b82586`); no post-pin commits to `source.json`.
- Mechanical diff of round-4 candidate (`cd3b8903`) vs. current candidate confirms **exactly** the declared change set:
  - CHANGED: 1, 2, 3, 4, 6, 7, 8, 11, 12
  - IDENTICAL (byte-for-byte): 0, 5, 9, 10, 13
- No undeclared edits anywhere. Every token-level difference in the nine touched paragraphs corresponds to one of the nine declared fixes; no incidental rewording rode along.
- JSON structure valid; `number` and `title` unchanged.

---

## Paragraph-by-paragraph findings

### Paragraph 1 — word-order flattening — PASS
Source: "But this proveth rather that men are in that point equall, than unequall."
Candidate: "But this actually proves that men are equal in that point, not unequal."
"actually" carries the contrastive force of Hobbes's "rather ... than," and the "not unequal" tail preserves the rejected alternative. Claim unchanged; the following sentence ("not ordinarily a greater sign of equal distribution than that every man is content with his share") still lands as the support for it.

### Paragraph 2 — subject-first reorder — PASS
"Equality of hope in attaining our ends arises from this equality of ability." Direction of derivation is preserved (ability → hope), matching "From this equality of ability, ariseth equality of hope." No content shift; rest of the paragraph untouched.

### Paragraph 3 — THE SCRUTINIZED ONE — PASS on all five checks

Source: "Also because there be some, that taking pleasure in contemplating their own power in the acts of conquest, which they pursue farther than their security requires; if others, that otherwise would be glad to be at ease within modest bounds, should not by invasion increase their power, they would not be able, long time, by standing only on their defence, to subsist."

Candidate: "Also, some men take pleasure in contemplating their own power in acts of conquest, and pursue it further than their security requires. Because of these men, others — who would otherwise be glad to remain at ease within modest bounds — must also increase their own power through invasion; if they did not, they would not be able to survive for long by relying on defense alone."

(a) Reorder "there is no way ... so reasonable as Anticipation" → "the most reasonable way ... is Anticipation": superlative-by-negation rendered as a direct superlative. Same claim, same strength. The em-dash gloss "that is, by force or by cunning to master the persons of all men he can, until he sees no other power great enough to endanger him" is unchanged and still attaches to Anticipation. PASS.

(i) **"these men" = the power-hungry conquerors.** The immediately preceding sentence names exactly one group — "some men [who] take pleasure in contemplating their own power in acts of conquest, and pursue it further than their security requires." "Because of these men" has no competing antecedent in scope. Correct.

(ii) **"others" = the moderates.** Candidate keeps the source's own defining clause attached to them ("who would otherwise be glad to remain at ease within modest bounds" ← "that otherwise would be glad to be at ease within modest bounds"). The groups are not conflated or swapped. Correct.

(iii) **The survival clause still attaches to the moderates.** In the candidate, "if they did not, they would not be able to survive for long by relying on defense alone" sits inside the clause whose subject is "others," and "they" has "others" as its nearest and only grammatical antecedent in that sentence — "these men" is in the preceding prepositional phrase and is not the subject of any clause the pronoun could bind to. This matches the source, where "they would not be able ... to subsist" resolves to "others, that otherwise would be glad to be at ease." It has **not** become a claim about the aggressors. Correct.

(iv) **Causal/conditional logic intact.** Source structure: because aggressors exist → if moderates do not expand by invasion → they cannot subsist on defense alone. Candidate preserves all three links, with the causal link made explicit ("Because of these men") and the conditional preserved verbatim in form ("if they did not, they would not be able to survive"). No inversion of cause and effect, no dropped condition.

(v) **"must also increase their own power through invasion" does not overstate.** This is the check most likely to fail, and it survives, for two reasons. First, the sentence does not stop at the assertion — the conditional immediately follows and supplies its warrant ("if they did not, they would not be able to survive for long"), so the "must" is read as necessity-relative-to-survival, exactly the modal force of the source, not as a free-standing inevitability claim. Second, Hobbes himself asserts the positive necessity in the very next sentence of the same paragraph: "such augmentation of dominion over men, being necessary to a mans conservation, it ought to be allowed him" — rendered in the candidate as "such enlargement of dominion over other men, being necessary to a man's preservation, ought to be allowed to him." The rendering therefore anticipates by one sentence a claim the source makes explicitly, rather than inventing one. No new content.

Note on register: the split into two sentences plus the named actors is a large structural change, but it is licensed — Hobbes's original is a single anacoluthic sentence whose main clause never resolves ("because there be some, that taking pleasure ... which they pursue"), and any faithful rendering must supply the missing predicate. The candidate supplies it in the direction the argument actually runs.

### Paragraph 4 — "overawe" → "keep them all in check" — PASS (with a non-blocking note)
Meaning preserved: restraint by a superior power. Non-blocking note: "over-awe" carries a fear/intimidation component that "keep in check" softens slightly, and the chapter's lexical echo with paragraph 7's "to keep them all in awe" is now broken. This is not a fidelity defect — paragraph 7 retains "keep them all in awe — that is, in fear and subjection," so the Hobbesian term and its force survive in the chapter where it matters most (the definition of the state of war). No change requested. The paragraph's later "no common power, to keep them in quiet" → "no common power to keep them at peace" is unchanged from the certified state.

### Paragraph 6 — "kindred" → "family" — PASS
Marginally narrower than "Kindred" (kin/relatives broadly), but within normal modern-English range and the list context ("their family, their friends, their nation, their profession, or their name") preserves the widening-circles structure of the source. Acceptable.

### Paragraph 7 — de-abstraction — PASS (style nit only)
"the Will to contend by Battell is sufficiently known" → "the will to fight by battle is plain to see." Both halves are faithful: "contend by battle" → "fight by battle," "sufficiently known" → "plain to see" (known well enough to be evident). Style nit, not a fidelity issue: "fight by battle" reads slightly redundant in modern English. Not worth another round; the parallel later in the paragraph ("the known disposition to it") still carries Hobbes's epistemic framing.

**Famous-material check:** "For WAR consists not in battle only, or the act of fighting, but in a stretch of time..." and "All other time is PEACE." — both intact and unchanged.

### Paragraph 8 — lowercase "industry" + round-4 mandated "comfortable building" — PASS
- "no place for industry" now lowercase, consistent with paragraph 13's "a hope, by their industry, of obtaining them." Capitalization normalized across the chapter.
- "no commodious Building" → "no comfortable building" (round-4 fix) present and correct; consistent with paragraph 13's "commodious living" → "a comfortable life."
- **Famous sentence verified untouched, character for character:** "and, which is worst of all, continual fear and danger of violent death; and the life of man, solitary, poor, nasty, brutish, and short." The five adjectives, their order, and the surrounding clause are byte-identical to the round-4 certified state. No softening.

### Paragraph 11 — named antecedent — PASS
The two sentences before it: kings/sovereigns "are in continual jealousies, and in the state and posture of gladiators ... and continual spies upon their neighbors, **which is a posture of war**." So "thereby" in "because they uphold thereby, the Industry of their Subjects" refers to that posture of war, which the sentence immediately before has just named in those exact words. "this posture of war" is the correct referent, and it is the *textually nearest* candidate as well — no competing antecedent.

Final "it" in "does not follow from it" resolves to the same posture of war, matching the source's "there does not follow from it." Resolution is sound and now anchored rather than floating.

Non-blocking note: the subject shifts from the sovereigns ("they uphold thereby") to the posture itself ("this posture of war upholds"). This is a mild loss of agency, but the instrumental relation Hobbes states — the subjects' industry is upheld *by means of* that posture — is exactly what the new subject expresses, and the sovereigns remain the possessors ("their subjects"). No distortion.

### Paragraph 12 — preposition swap — PASS
"To this warre ... this also is consequent" → "From this war ... this also follows." Correct: Hobbes's "consequent to X" means "follows from X," and "To this war ... this follows" would have read backwards in modern English. The fix removes a real ambiguity.

**Famous sentence verified untouched:** "Where there is no common power, there is no law; where no law, no injustice." Byte-identical to the certified state. Also intact and unchanged: "Force and fraud are, in war, the two cardinal virtues," the mine/thine passage, and the closing "though there is a possibility of coming out of it — a possibility that lies partly in the passions and partly in his reason."

---

## Untouched paragraphs re-read

Confirmed byte-identical to the previously certified round-4 state, and re-read against source for the record:

- **0** — natural equality of body and mind; "the weakest has strength enough to kill the strongest ... by secret scheming or by joining with others." Faithful.
- **5** — three causes of quarrel; the gloss "Diffidence (that is, mutual distrust)" is the previously certified gloss retaining Hobbes's term. Faithful.
- **9** — the "consider with himself" passage (arms on a journey, locks his doors, locks his chests) and "neither of us accuses man's nature in this"; the no-sin-before-law chain intact through "nor can any law be made until they have agreed upon the person who is to make it." Faithful.
- **10** — the America passage, rendered unsoftened per the round-1 decision, with the certified gloss "natural lust — that is, natural appetite." Faithful.
- **13** — the passions inclining to peace and the handoff to the Laws of Nature. Faithful.

---

## Summary

All nine round-5 edits are faithful. The paragraph-3 disambiguation — the one flagged for maximum scrutiny — resolves its pronouns correctly, keeps the survival claim on the moderates, preserves the causal and conditional structure, and does not invent a claim (the necessity it states explicitly is asserted by Hobbes one sentence later). The five untouched paragraphs are byte-identical. All three famous passages ("solitary, poor, nasty, brutish, and short"; "Where there is no common power, there is no law"; "All other time is PEACE") are intact.

Two observations are recorded as non-blocking notes only — the softening of "over-awe" to "keep in check" in paragraph 4, and the slightly redundant "fight by battle" in paragraph 7. Neither changes meaning; neither warrants a round 6.

**ACCEPT AS-IS. Chapter 14 is ready for the final full non-sampled pass.**
