# Fidelity Review 1 — Leviathan, edition chapter 14 (Hobbes Ch. 13)

**Book / chapter:** Thomas Hobbes, *Leviathan* (1651) — edition chapter 14 /
Hobbes's Chapter 13, "Of the Naturall Condition of Mankind, as Concerning
Their Felicity, and Misery"
**Fidelity anchor (locked source):** `books/wip/leviathan-pilot-ch14/source.json` (14 paragraphs)
**Candidate:** `books/wip/leviathan-pilot-ch14/candidate-sonnet.json`
**Reviewer:** Reviewer B (independent). Drafter self-report not consulted for
the verdict; every finding below was re-derived from the two texts.

---

## 1. Coverage

Every one of the 14 paragraphs was read individually against its source
counterpart. Nothing was skimmed or sampled.

- **Packet A:** paragraphs 1–7, read with paragraph 8 as trailing context.
- **Packet B:** paragraphs 8–14, read with paragraph 7 as leading context.
- **Whole-chapter pass:** both texts re-read end to end for cross-boundary
  issues (recurring terms, the three-causes argument set up in 4–5 and paid
  off in 6–7, the war/peace definition paid off in 9 and 13).

Structural check (mechanical): paragraph count 14 = 14, order preserved,
`number` and `title` identical, no merges, splits, or reorderings. Per-paragraph
word counts track the source closely (largest deltas +11 in ¶2 and +6 in ¶13,
both from unpacking archaic ellipsis), so there is no evidence of summarizing
or padding anywhere in the chapter.

---

## 2. Blocking defects

### ¶4 — inverted condition ("so long, till" read as "so long as")

**Source:**
> "there is no way for any man to secure himselfe, so reasonable, as
> Anticipation; that is, by force, or wiles, to master the persons of all men
> he can, **so long, till he see no other power great enough to endanger him**"

**Candidate:**
> "there is no way for any man to make himself secure so reasonable as
> Anticipation — that is, by force or by cunning to master the persons of all
> men he can, **for as long as he sees no other power great enough to endanger
> him**"

**What's wrong:** This is a condition flip, and it reverses Hobbes's argument.
Hobbes's "so long, till" is "so long … *until*": the anticipator keeps
subduing others *until the point at which* no remaining power could endanger
him — i.e. the drive to dominate has no natural stopping point short of total
security. That endpoint is the whole force of the anticipation doctrine and it
is what makes the next sentence (conquest pursued "farther than their security
requires") intelligible.

The candidate's "for as long as he sees no other power great enough to
endanger him" states the opposite condition: he subdues others *while* no
danger is in view, and by implication stops once a serious power appears.
That turns an unbounded drive into a cautious one, and removes the terminal
condition entirely. Not a stylistic quibble — the logical direction of the
sentence is reversed.

**Fix (minimal):**
> "…by force or by cunning to master the persons of all men he can, **until he
> sees no other power great enough to endanger him**."

This is the only blocking defect found in the chapter.

---

## 3. Paragraph 9 — "nasty, brutish, and short" (specifically checked)

Nothing was softened, sanitized, or paraphrased away. Item-by-item audit of
the privation list:

| Source | Candidate | Verdict |
|---|---|---|
| no place for Industry; because the fruit thereof is uncertain | no place for Industry, because its fruit is uncertain | ✅ incl. causal "because" |
| no Culture of the Earth | no cultivation of the earth | ✅ |
| no Navigation, nor use of the commodities that may be imported by Sea | no navigation, nor use of the commodities that may be imported by sea | ✅ |
| no commodious Building | no commodious building | ✅ |
| no Instruments of moving, and removing such things as require much force | no instruments for moving and removing such things as require much force | ✅ |
| no Knowledge of the face of the Earth | no knowledge of the face of the earth | ✅ |
| no account of Time | no account of time | ✅ |
| no Arts; no Letters; no Society | no arts; no letters; no society | ✅ |
| and which is worst of all, continuall feare, and danger of violent death | and, which is worst of all, continual fear and danger of violent death | ✅ superlative kept |
| And the life of man, solitary, poore, nasty, brutish, and short | and the life of man, solitary, poor, nasty, brutish, and short | ✅ all five adjectives, same order, same appositive syntax |

The framing sentence is also intact: "men live without other security, than
what their own strength, and their own invention shall furnish them withall"
→ "men live with no other security than what their own strength and their own
invention will furnish them with." No hedge added, no qualifier introduced,
no bleakness dialed down. **Clean.**

---

## 4. Paragraph 11 — the "savage people … of America" passage (specifically checked)

**Source:**
> "It may peradventure be thought, there was never such a time, nor condition
> of warre as this; and I believe it was never generally so, over all the
> world: but there are many places, where they live so now. For the savage
> people in many places of America, except the government of small Families,
> the concord whereof dependeth on naturall lust, have no government at all;
> and live at this day in that brutish manner, as I said before."

**Candidate:**
> "It may perhaps be thought that there never was such a time, nor such a
> condition of war as this; and I believe it was never generally so over all
> the world. But there are many places where they live so now. For the savage
> people in many places of America, except for the government of small
> families, whose harmony depends on natural lust, have no government at all,
> and live at this day in that brutish manner I described before."

**Rendering check — no defects:**
- "savage people" retained; not replaced with a euphemism.
- "in many places of America" retained verbatim in scope.
- "the concord whereof dependeth on naturall lust" → "whose harmony depends on
  natural lust" — "natural lust" kept, not sanitized.
- "have no government at all" — the absolute negation survives intact, with no
  softening to "little government" or similar.
- "live at this day in that brutish manner" — "brutish" and the present-tense
  "at this day" both retained.
- **No disclaimer, qualifier, or editorial hedge was added.** The candidate
  does not insert "as Hobbes believed", "reportedly", "so it was then thought",
  or any modern caveat. Nothing is silently corrected toward modern
  ethnographic fact. This is the right call under the silent-corrections rule:
  the source's claim is reproduced as the source makes it.
- "as I said before" → "I described before": a permissible modernization of the
  back-reference; the self-citation survives.

**Independent confirmation of the drafter's claimed hedging distinction —
CONFIRMED.**

Checked against the source text directly, not against the drafter's report:

1. The **preceding** sentence *is* hedged in the source, twice over: the whole
   objection is introduced as "It may **peradventure** be thought…", and
   Hobbes's own concession is "and **I believe** it was never generally so,
   over all the world." The first-person epistemic marker "I believe" is
   present in the source, attached specifically to the claim about a universal
   state of war never having obtained.
2. The **America** sentence carries **no hedge whatsoever** in the source. It
   is flat present-tense assertion: "have no government at all; and live at
   this day in that brutish manner." No "I believe", no "it is said", no
   "peradventure", no reported-speech frame. Note that the bridging clause
   "but there are many places, where they live so now" is likewise unhedged
   present tense.

So the asymmetry the drafter claims is real and is a property of the source,
not a reading imposed on it. The candidate reproduces it exactly: "I believe"
survives on the concession; the America claim is rendered in bare present
tense with no added qualifier. Certainty levels match the source on both
sides of the colon.

---

## 5. Other paragraphs — checklist results

All clean on actors, negation, causality, certainty, conditions, omissions,
additions, and silent corrections except as noted in §2 and §6.

- **¶1** — Equality of faculties. "the weakest has strength enough to kill the
  strongest" intact; both means ("secret machination" → "secret scheming";
  "confederacy with others" → "joining with others") preserved. The negated
  comparison ("not so considerable, as that…") survives with correct scope.
- **¶2** — The long Science parenthesis is fully preserved, including both
  negatives ("not a native faculty, born with us; nor attained, (as Prudence,)
  while we look after somewhat els"). "Prudence is but Experience" kept as an
  identity, not softened. "the Vulgar" → "the common run of people" is an
  acceptable modernization of a term of art. The self-undercutting punchline
  ("every man is contented with his share") is intact, including its ironic
  direction.
- **¶3** — Causal chain intact: equality of ability → equality of hope →
  enmity → invasion → reciprocal danger. Both ends preserved ("principally
  their owne conservation, and sometimes their delectation only"). The closing
  reciprocity ("And the Invader again is in the like danger of another")
  survives.
- **¶4** — See §2. Apart from the blocking condition flip, the rest is sound,
  including the awkward double-negative conditional ("if others … should not by
  invasion increase their power, they would not be able … to subsist"), which
  is rendered with both negations in place and the same consequence.
- **¶5** — "no pleasure (but on the contrary a great deale of griefe)" intact.
  The nested parenthesis about "them that have no common power" is preserved.
  The two-target extortion ("from his contemners, by dommage; and from others,
  by the example") is kept as two distinct targets.
- **¶6** — Three causes named in source order: Competition, Diffidence, Glory. ✅
- **¶7** — Three-to-three mapping preserved (Gain/Safety/Reputation). Full list
  of objects ("persons, wives, children, and cattell") intact. The
  direct-vs-reflected distinction and all five reflection targets (kindred,
  friends, nation, profession, name) present. ✅
- **¶8** — The definition of WAR. Crucially, the negation "consisteth not in
  Battell onely" and the disposition clause survive; the weather analogy is
  reproduced in full including "a showre or two of rain" and "many dayes
  together"; the terminal "All other time is PEACE" retained with emphasis.
- **¶9** — See §3. Clean.
- **¶10** — The armed-traveler argument. All three empirical instances (arms
  on a journey, locking doors, locking chests) present with their matching
  three inferences (fellow subjects / fellow citizens / children and
  servants), correctly paired — no actor crossover. The concessive "and this
  when he knows there bee Lawes, and publike Officers, armed, to revenge all
  injuries" survives. The moral disclaimer is intact and correctly negated:
  "But neither of us accuse mans nature in it… The Desires, and other Passions
  of man, are in themselves no Sin," plus the full regress (no sin until a law
  is known → no law known until laws are made → no law made until a lawmaker
  is agreed on).
- **¶11** — See §4. Clean.
- **¶12** — Sovereigns as gladiators. The concessive opener ("But though there
  had never been any time…") survives with its negation; "Independency" →
  "independence" as the stated cause is preserved; the gloss list (forts,
  garrisons, guns on the frontiers, continual spies) is complete; and the
  closing contrast — that this posture does *not* produce the misery attending
  the liberty of individual men — keeps its negation and its causal "because
  they uphold thereby, the Industry of their Subjects."
- **¶13** — "nothing can be Unjust." All four chained propositions preserved
  ("Where there is no common Power, there is no Law: where no Law, no
  Injustice"). "Force, and Fraud, are in warre the two Cardinall vertues"
  retained without moralizing. The counterfactual about a man alone in the
  world survives as a counterfactual. "no Propriety, no Dominion, no Mine and
  Thine distinct" intact, with the possession rule ("that to be every mans
  that he can get; and for so long, as he can keep it") — note that *here* the
  "for so long as" is correct, because the source does say "for so long, as he
  can keep it." The escape clause ("though with a possibility to come out of
  it, consisting partly in the Passions, partly in his Reason") is preserved,
  including its two-part division.
- **¶14** — Three peace-inclining passions listed in source order (fear of
  death; desire of things necessary to commodious living; hope of obtaining
  them by industry). Reason's role and the identification with the Laws of
  Nature intact. The forward reference "in the two following Chapters" is
  preserved with the correct number (two) — not silently adjusted.

---

## 6. Non-blocking notes (stylistic / consistency)

None of these change meaning; they are for the drafter's judgment.

1. **¶4 vs ¶6 — "Diffidence" link weakened.** Source uses "diffidence" both as
   the phenomenon in ¶4 ("this diffidence of one another") and as the named
   second cause of quarrel in ¶6. The candidate translates the ¶4 instance as
   "mutual distrust" but keeps "Diffidence" capitalized in the ¶6 list, so an
   English reader no longer sees that ¶6 is naming the thing ¶4 just
   described. Suggested: "And from this mutual distrust — this Diffidence —
   there is no way…" in ¶4, or lowercase-gloss the ¶6 entry.
2. **¶3 — "if any two men desire the same thing"** → "if two men desire the
   same thing." Dropping "any" slightly weakens the universal quantifier.
   Restoring "any two men" costs nothing.
3. **¶10 — dropped "therefore."** Source: "and he may **therefore**, not
   trusting to this Inference… desire perhaps to have the same confirmed by
   Experience." The candidate's "; and such a person, not trusting this
   inference…" preserves the sense by adjacency but loses the explicit causal
   connector. Low priority.
4. **¶10 — recast as direct questions.** The source keeps "what opinion he has
   of his fellow subjects, when he rides armed…" as objects of "Let him
   therefore consider with himselfe." The candidate breaks them out as three
   rhetorical questions addressed by the narrator. The rhetorical force and
   the pairings are preserved and it reads better in modern English; noted
   only because it is the largest syntactic restructure in the chapter.
5. **Capitalization is inconsistent.** Hobbes's emphatic capitals are kept in
   some places ("Industry", "Anticipation", "Science", "Prudence",
   "Competition/Diffidence/Glory", "Mine and Thine", "War/WAR/PEACE",
   "Laws of Nature") and lowercased in others ("gain", "safety",
   "reputation", "cultivation of the earth", "arts", "letters", "society",
   "cardinal virtues", "forts, garrisons, and guns"). Whichever convention the
   series adopts, ¶7's "for gain / for safety / for reputation" and ¶6's
   "Competition; Diffidence; Glory" should match each other, since they are
   the same three items.

---

## 7. Verdict

**ACCEPT WITH FIXES REQUIRED**

**Required before acceptance (blocking, 1 item):**

- **¶4:** replace "for as long as he sees no other power great enough to
  endanger him" with "**until he sees no other power great enough to endanger
  him**". (Condition inversion; reverses the anticipation argument.)

Everything else in the chapter is fidelity-clean. In particular, the two
high-risk passages flagged for special attention — ¶9's "nasty, brutish, and
short" and ¶11's America passage — are both faithful: nothing softened,
sanitized, silently corrected, or annotated, and ¶11 reproduces the source's
hedged-concession / unhedged-assertion asymmetry exactly as the source has it
(independently verified, see §4). A patch, not a re-draft, is what this chapter
needs.
