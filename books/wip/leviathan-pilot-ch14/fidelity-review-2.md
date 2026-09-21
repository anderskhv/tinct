# Fidelity Review 2 — Leviathan, edition chapter 14 (Hobbes Ch. 13)

**Book / chapter:** Thomas Hobbes, *Leviathan* (1651) — edition chapter 14 /
Hobbes's Chapter 13, "Of the Naturall Condition of Mankind, as Concerning
Their Felicity, and Misery"
**Fidelity anchor (locked source):** `books/wip/leviathan-pilot-ch14/source.json` (14 paragraphs)
**Candidate:** `books/wip/leviathan-pilot-ch14/candidate-sonnet.json` (post-revision)
**Baseline:** `fidelity-review-1.md` (verdict: ACCEPT WITH FIXES REQUIRED — one
blocking defect, the inverted condition in the Anticipation paragraph).
**Reviewer:** Reviewer B, round 2, independent. Every judgment below was
re-derived from the source text; the drafter's revision note was not treated as
evidence.

### Note on paragraph numbering

Round 1 numbered paragraphs 1–14 (1-based). The revision request numbers them
0-based. To remove all ambiguity, this review cites **0-based JSON indices**
and names the paragraph:

| 0-based idx | 1-based (round 1) | Paragraph |
|---|---|---|
| 3 | ¶4 | Anticipation / "diffidence of one another" |
| 5 | ¶6 | Three causes of quarrel |
| 6 | ¶7 | Gain / Safety / Reputation |
| 8 | ¶9 | "nasty, brutish, and short" |
| 10 | ¶11 | America passage |
| 12 | ¶13 | "nothing can be Unjust" |

---

## 1. Coverage

- **Mechanical diff** of the current candidate against the round-1 candidate
  (`65d03ec9:…/candidate-sonnet.json`), paragraph by paragraph, to establish
  exactly what changed rather than relying on the change list supplied.
  Result: **exactly six paragraphs differ — 0-based 3, 5, 6, 8, 10, 12.** No
  other paragraph was touched by so much as a comma.
- **Full re-read of all six changed paragraphs** against their source
  counterparts, each with its neighbours as context (2–4, 4–7, 7–9, 9–11,
  11–13).
- **Verbatim-identity check** on the eight unchanged paragraphs (0, 1, 2, 4, 7,
  9, 11, 13) — byte-identical to the text certified in round 1, so round 1's
  certification carries forward unaltered.
- **Whole-chapter pass** for cross-boundary effects of the new glosses
  (specifically: does the new "Diffidence" gloss at idx 5 stay consistent with
  the "mutual distrust" wording at idx 3, and does the new idx 10 gloss disturb
  the hedging asymmetry certified in round 1 §4).

Structural check: paragraph count **14 = 14**, order preserved, `number` (14)
and `title` identical to source, no merges/splits/reorderings. Word counts
track the source closely (largest delta +12 at idx 10, which is the added
gloss; next largest +11 at idx 1, unchanged from round 1). No evidence of
summarizing or padding.

---

## 2. Item-by-item findings

### Item 1 — idx 3, the Anticipation condition — **FIXED, CONFIRMED**

Source:
> "by force, or wiles, to master the persons of all men he can, **so long, till
> he see no other power great enough to endanger him**"

Candidate now:
> "by force or by cunning to master the persons of all men he can, **until he
> sees no other power great enough to endanger him**"

This restores the source's actual condition. Hobbes's "so long, till" is
"so long … *until*": a terminal condition, not a concurrent one. "Until" carries
the terminal endpoint correctly, and the argument now runs the right direction —
the drive to subdue has no stopping point short of no-remaining-threat, which is
what makes the following clause ("pursue it further than their security
requires") intelligible. The round-1 blocking defect is resolved.

Nuance, non-blocking: "so long, till" also carries a duration sense ("for as
long as it takes, until…") that a bare "until" leaves implicit. The logical
content — the terminal condition — is the load-bearing part and it is now
correct. No fix needed.

The rest of idx 3 is unchanged from the version round 1 certified sound,
including the double-negative conditional ("if others … did not by invasion
increase their own power, they would not be able … to survive by standing on
the defensive alone"), which keeps both negations and the same consequence.

### Item 2 — idx 5, "Diffidence (that is, mutual distrust)" — **ACCURATE, CONFIRMED**

Source: "First, Competition; Secondly, Diffidence; Thirdly, Glory."

The gloss is accurate and, importantly, **licensed by the source itself**: two
paragraphs earlier the source names the same thing as "this **diffidence of one
another**" (idx 3). "Of one another" is exactly what "mutual" renders, and
Hobbes's seventeenth-century "diffidence" is distrust/mistrust, not the modern
"shyness". So the gloss neither adds a claim nor picks a side in any
interpretive dispute — it recovers a sense the source states in its own words
nearby.

It also closes round-1 non-blocking note 1: the English reader can now see that
idx 5 is naming the thing idx 3 described. Good fix.

### Item 3 — idx 6, "The first use violence" → "The first uses violence" — **NO MEANING CHANGE, but see new note N1**

Source: "The first use Violence, to make themselves Masters of other mens
persons…" — Hobbes's plural verb with a singular subject-phrase is period
usage. Singularizing the verb changes nothing about actors, causality, or
content: the subject is still the first cause (Competition), still the source of
the violence, still aimed at the same objects. **Confirmed: grammar only.**

However the revision leaves the sentence internally mismatched — "The first
**uses** violence to make **themselves** masters" — singular verb, plural
reflexive. See §4, note N1. This is a style defect, not a fidelity defect.

### Item 4 — idx 10, the new "natural lust" gloss — **BLOCKING. UNLICENSED ADDITION; RECOMMEND DELETION.**

Source:
> "except the government of small Families, **the concord whereof dependeth on
> naturall lust**, have no government at all"

Candidate now:
> "except for the government of small families, **whose harmony depends on
> natural lust — that is, instinctive desire, not romance —** have no
> government at all"

**My independent judgment: this overreaches and should be removed.** Three
reasons, in order of weight.

1. **The negative half is an assertion the source does not make.** "Instinctive
   desire" is a defensible paraphrase of "naturall lust". "**not romance**" is
   not a paraphrase of anything; it is an exclusion the reviewer-drafter has
   added. The source says what the family bond *rests on*; it says nothing
   about what it is *not*. Under the review checklist's Additions test — "any
   claim … not licensed by the source (including a 'helpful' invented
   explanation)" — the exclusion clause fails outright. A gloss may recover a
   sense the source has; it may not foreclose one.

2. **It settles a genuinely contested reading.** "Naturall lust" in Hobbes is
   not univocal. It is read narrowly as sexual appetite (the family's concord
   rests on carnal desire plus paternal dominion) and more broadly as natural
   appetite or natural affection generally. The gloss picks the narrow reading
   and then hardens it with the exclusion. Whatever one thinks of the merits,
   this is the reading edition asserting an interpretation where the source is
   open — precisely the thing a fidelity pass exists to catch. Note the
   contrast with the idx 5 "Diffidence" gloss, which is licensed *internally*
   by the source's own "diffidence of one another"; nothing in this chapter
   glosses "naturall lust".

3. **The misreading risk it claims to avert is weak, and the cure is
   anachronistic.** "Diffidence" is a true false friend — modern English has
   moved the word. "Lust" has not: the modern reader's default sense of
   "natural lust" is carnal appetite, which is at minimum inside the range the
   source supports. There is no trap to disarm here. Meanwhile "romance" imports
   a modern category alien to the period's vocabulary and to the surrounding
   register, so the gloss reads as a twenty-first-century editorial aside
   planted inside a 1651 sentence.

There is an aggravating factor. Round 1 certified this exact passage clean on
the explicit ground that "**No disclaimer, qualifier, or editorial hedge was
added** … Nothing is silently corrected toward modern ethnographic fact."
Inserting an editorial aside into the one paragraph whose cleanliness was a
function of carrying no editorial asides is a regression against a standard this
chapter had already met. The gloss does not sanitize the America claim — the
"savage people", "have no government at all", "brutish manner" and the hedged/
unhedged asymmetry all survive intact (re-verified, see Item 6) — but it does
break the no-annotation property that certification rested on.

**Required fix (minimal):** delete the gloss, restoring
> "…except for the government of small families, whose harmony depends on
> natural lust, have no government at all…"

If the drafter still judges a gloss necessary, the only version I would pass is
one that adds no exclusion and claims no specificity the source lacks — e.g.
"natural lust (that is, natural appetite)". My recommendation is no gloss at
all; and if the passage genuinely needs framing for modern readers, that belongs
in onboarding/editorial apparatus, not inside Hobbes's sentence.

### Item 5 — idx 8 and idx 12, "consequent to" → "follows from" — **NO MEANING OR LOGIC CHANGE, CONFIRMED**

**idx 8.** Source: "Whatsoever therefore **is consequent to** a time of Warre …
the same **is consequent to** the time, wherein men live without other security…"
Candidate: "Whatever, therefore, **follows from** a time of war … the same **is
consequent to** the time in which men live with no other security…"
"Follows from" is an exact modern equivalent of Hobbes's "is consequent to" here
(entailment/accompaniment, not causation-in-a-different-direction). Direction of
the inference is unchanged, both terms of the identity are unchanged, the
negation ("with no other security than…") is unchanged.

**idx 12.** Source: "**It is consequent also to the same condition**, that there
be no Propriety…" Candidate: "**It likewise follows from the same condition**
that there is no property…" Same relation, same direction, same subject. The
earlier "this also is consequent: that nothing can be unjust" in the same
paragraph was left as-is. Clean.

Non-blocking consequence, see §4 note N2: in both paragraphs the source's
*repeated* formula is now rendered two different ways within a single paragraph,
which slightly blunts a parallel Hobbes is using deliberately.

### Item 6 — the two certified-clean passages — **RE-CONFIRMED (with a numbering correction)**

The request asked me to confirm these two do not appear in the diff. Under the
0-based indexing used for every other item, they do — and that needs stating
precisely, because the two numbering schemes collide here:

- **"nasty, brutish, and short" (idx 8 / round-1 ¶9): APPEARS IN THE DIFF, but
  only in its opening clause.** The change is the item-5 "follows from" edit,
  four words into the paragraph. **The certified content is byte-identical:**
  the framing sentence ("men live with no other security than what their own
  strength and their own invention will furnish them with"), the entire
  privation list in order (Industry + its causal "because its fruit is
  uncertain", cultivation, navigation + imported commodities, commodious
  building, instruments, knowledge of the face of the earth, account of time,
  arts, letters, society), the superlative "and, which is worst of all,
  continual fear and danger of violent death", and all five adjectives in order
  — "solitary, poor, nasty, brutish, and short" — with the same appositive
  syntax. **Nothing softened, sanitized, or hedged. Round 1's certification
  stands.**
- **America passage (idx 10 / round-1 ¶11): APPEARS IN THE DIFF — the gloss of
  Item 4 is the only change.** Everything round 1 certified is verbatim intact:
  "savage people", "in many places of America", "natural lust" retained
  unsanitized, "have no government at all" as an absolute negation, "live at
  this day in that brutish manner", the hedged concession ("It may perhaps be
  thought… and I believe it was never generally so") against the bare
  present-tense, unhedged America assertion. I re-derived the asymmetry from the
  source again and it is a property of the source, as round 1 found. The gloss
  does not alter any of that; it is a separate defect (unlicensed addition), not
  a softening.

If instead the request meant idx 9 and idx 11 (0-based — the armed-traveller
paragraph and the sovereigns-as-gladiators paragraph), both are **byte-identical
to round 1 and absent from the diff.** Confirmed either way.

### Item 7 — structure — **CONFIRMED**

Paragraph count 14 = 14. `number` = 14, `title` identical to source. Order
preserved; no merges, splits, reorderings, or dropped paragraphs. JSON valid.

---

## 3. New defects introduced by this round

One, listed above in full: **idx 10, the "— that is, instinctive desire, not
romance —" gloss (blocking).** No other new fidelity defect was introduced. The
five other edits are each an improvement or neutral.

---

## 4. Non-blocking notes

**N1 (new this round) — idx 6, number disagreement inside the fixed sentence.**
"The first **uses** violence to make **themselves** masters…" — singular verb,
plural reflexive. The pre-revision text at least agreed with itself. Suggested:
"The first uses violence to make **men** masters of other men's persons…", or
revert the verb. Cosmetic; no meaning at stake.

**N2 (new this round) — idx 8 and idx 12, parallel formula now rendered two
ways.** Hobbes repeats "is consequent to" within each of these paragraphs, and
in idx 8 the repetition *is* the argument: whatever is consequent to X, the same
is consequent to Y. Rendering the first instance "follows from" and the second
"is consequent to" (idx 8), and the reverse split in idx 12, makes the two sides
of the equation look like different relations. Suggested: use "follows from"
for both instances in each paragraph. Meaning is preserved as it stands; this is
about the transfer reading cleanly.

**N3 (carried over, not addressed) — idx 2, "if any two men".** Source: "if
**any** two men desire the same thing". Candidate still "if two men desire the
same thing". Universal quantifier slightly weakened; restoring "any" costs
nothing.

**N4 (carried over, not addressed) — idx 9, dropped "therefore".** Source: "and
he may **therefore**, not trusting to this Inference…". Sense survives by
adjacency. Low priority.

**N5 (carried over, partly worsened) — capitalization inconsistency.** Round 1
flagged that idx 5's "Competition; Diffidence; Glory" and idx 6's "gain /
safety / reputation" are the same three items with different casing; that is
unchanged. This round added a small inconsistency inside idx 8, which now reads
"a time of war" (lowercased in the edited opening) while the same paragraph's
source term and the neighbouring idx 7 use "War"/"WAR". Whichever convention the
series adopts should be applied across idx 5/6/7/8.

---

## 5. Verdict

**ACCEPT WITH FIXES REQUIRED**

**Required before acceptance (blocking, 1 item):**

- **idx 10 (America passage):** delete the added gloss "— that is, instinctive
  desire, not romance —", restoring "whose harmony depends on natural lust, have
  no government at all". Unlicensed addition: the exclusion ("not romance")
  makes a claim the source does not make, and the gloss settles a contested
  reading of "naturall lust" inside a passage whose round-1 certification rested
  specifically on its carrying no editorial annotation. A narrower, exclusion-
  free gloss ("that is, natural appetite") would be acceptable if a gloss is
  judged necessary; no gloss is my recommendation.

**Resolved from round 1:** the idx 3 condition inversion is correctly fixed and
the anticipation argument now runs in the source's direction. Non-blocking note
1 from round 1 (the weakened Diffidence link) is also resolved, correctly and
with internal source licence.

**Everything else:** the "nasty, brutish, and short" privation list and the
America claims remain faithful and unsoftened; structure is intact at 14
paragraphs; the "follows from" simplifications change no meaning or logic; the
"uses violence" edit is grammar only. This chapter is one deletion away from
clean — a patch, not a re-draft.
