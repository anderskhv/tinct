# Fidelity Review 2 — Leviathan, edition chapter 2 ("Chapter 1. Of Sense")

**Reviewer:** Reviewer B (independent fidelity re-check), round 2 of the
accept/fix/reverify cycle in `books/TRANSLATION_PROTOCOL.md`.

**Fidelity anchor:** `books/wip/leviathan-pilot-ch2/source.json` (locked source,
1651 Head-edition orthography). No other translation of Leviathan consulted.

**Candidate:** `books/wip/leviathan-pilot-ch2/candidate-sonnet.json`
(working tree, commit `dc361d4a`).

**Round-1 baseline:** `books/wip/leviathan-pilot-ch2/fidelity-review-1.md`
(commit `e53dd534`), verdict ACCEPT WITH FIXES REQUIRED, two blocking items
(B1, B2) and five non-blocking notes.

---

## Method

Round 2 was scoped to verification, not re-translation. Three passes:

1. **Mechanical delta.** Decoded-JSON paragraph-by-paragraph comparison of the
   round-1 candidate (`git show e53dd534:…`) against the current file, then a
   word-level opcode diff of paragraph index 3 to enumerate every edit
   independently of the change list supplied with the task.
2. **Clause check of ¶4 (index 3)** against source for each edit site, plus a
   re-read of the whole paragraph for collateral damage.
3. **Structural / untouched-paragraph check** against both source and the
   round-1 certified state.

---

## Structural check

| Check | Result |
| --- | --- |
| Valid JSON (`python3 -m json.tool`) | PASS |
| Top-level keys identical to source | PASS |
| `number` = 2, `title` = "Chapter 1. Of Sense", `section` = "Part I — Of Man" | PASS |
| Paragraph count 5, source order, none merged/split/reordered/dropped | PASS |

**One file-level note (cosmetic, not fidelity):** the file was re-serialized in
round 2 with `ensure_ascii=True`, so every em dash is now stored as the escape
`—` rather than a literal character. `source.json` already stores its
section em dash the same way, and the *decoded* strings are unaffected, so this
changes nothing a reader or the app will see. Flagged only so nobody reads the
raw `git diff` on ¶1/¶2/¶5 and concludes those paragraphs were edited. They
were not — see below.

---

## Untouched-paragraph verification

Decoded-string comparison of round-1 candidate vs. current candidate:

| Paragraph | Result |
| --- | --- |
| 0 (¶1, "Concerning the Thoughts of man") | **IDENTICAL** |
| 1 (¶2, "The Originall of them all") | **IDENTICAL** |
| 2 (¶3, "To know the naturall cause") | **IDENTICAL** |
| 3 (¶4, sense mechanism) | CHANGED — reviewed below |
| 4 (¶5, the Philosophy-schooles) | **IDENTICAL** |

**Scholastic-jargon preservation — PASS.** ¶5 retains, verbatim and
unregularized: `Visible Species`, `Visible Show, Apparition, or Aspect, or a
Being Seen`, `Audible Species`, `Audible Aspect, or Audible Being Seen`,
`Intelligible Species`, `Intelligible Being Seen`. The 1651 oddity of "Being
Seen" applied to hearing and to understanding survives untouched, which is
correct: it is Hobbes's own parody of the schools' vocabulary and the target of
the paragraph's closing jab at "insignificant Speech." Tidying it to "being
heard" would destroy the joke and the argument. Round-1's finding stands and
round 2 did not disturb it.

---

## Verification of the six declared changes (¶4)

### 1. "push itself free of it" → "push itself free of that pressure" — PASS with a note

- **Source:** "causeth there a resistance, or counter-pressure, or endeavour of
  the heart, to deliver it self"
- **Verdict:** No meaning added or lost. "Deliver it self" is the heart freeing
  itself from the pressure conducted inward, and the candidate says exactly
  that. The outward-directedness of the effort, which the next clause depends
  on, is intact.
- **Note (N1, non-blocking, new):** the pronoun is clarified but the referent is
  now arguably *mis*-pointed. The nearest antecedent to "that pressure" is
  "counter-pressure," three words earlier — yet the heart is not freeing itself
  from its own counter-pressure; it is freeing itself from the incoming
  pressure named at the head of the same sentence ("This pressure travels
  inward…"). The distal demonstrative "that" does gesture past the near noun,
  and the reading is recoverable, so this does not block. A one-word fix would
  close it: "free of that **inward** pressure."

### 2. Removal of the "— that is, mental image —" gloss — PASS (round-1 B2 resolved)

- **Source:** "And this Seeming, or Fancy, is that which men call sense;"
- **Candidate:** "And this seeming, or Fancy, is what men call sense."
- **Verdict:** Gloss is gone. *Fancy* is now unglossed at first use, exactly as
  in the source, and the term is free to carry the non-visual load the same
  sentence-chain immediately puts on it — odor, savour, heat, cold, hardness,
  softness. Hobbes's own next clause does the defining work, as round 1 noted.
  Capitalization matches the source's `Fancy`. **B2 closed.**

### 3. Splitting the "all these qualities" sentence — PASS, no content lost

- **Source:** "All which qualities called Sensible, are in the object that
  causeth them, but so many several motions of the matter, by which it presseth
  our organs diversly."
- **Candidate:** "All these qualities, called "sensible," exist in the object
  that causes them as nothing but a number of different motions of matter. It
  is by these motions that the object presses on our organs in different ways."
- **Verdict:** Element-by-element, nothing dropped: *all which qualities* → "all
  these qualities"; *called Sensible* → "called 'sensible'"; *are in the
  object that causeth them* → "exist in the object that causes them"; the trap
  construction *are … but so many* → "as nothing but a number of" (correctly
  read as "are nothing but", not as "are, besides"); *several motions of the
  matter* → "different motions of matter"; *by which it presseth our organs
  diversly* → the second sentence, with the relative's two referents made
  explicit ("these motions", "the object") rather than changed. The
  restrictive-reduction force of "but so many" survives the split, because
  "nothing but" sits inside the first sentence. **No content lost.**

### 4. "produce their effects on us" → "produce the same in us" — PASS (round-1 B1 resolved)

- **Source:** "And as pressing, rubbing, or striking the Eye, makes us fancy a
  light; and pressing the Eare, produceth a dinne; so do the bodies also we see,
  or hear, produce **the same** by their strong, though unobserved action,"
- **Candidate:** "And just as pressing, rubbing, or striking the eye makes us
  imagine a light, and pressing the ear produces a ringing, so the bodies we see
  or hear likewise **produce the same in us**, through a strong though unnoticed
  action of their own."
- **Verdict:** The identity claim is restored and matches the source's "produce
  the same" word for word. The analogy now holds in full: the two mechanical
  cases (poke the eye → a light; press the ear → a din) and the ordinary case
  (seen/heard bodies) are asserted to yield *the same* product, which is the
  inferential step the whole mechanistic argument rests on — and which the
  paragraph's conclusion ("Sense in all cases, is nothing els but originall
  fancy, caused … by the pressure") then cashes. The added "in us" is licensed,
  not invented: the preceding clauses already locate the product in us ("makes
  us imagine"), and the source's own referents for "the same" are the light and
  the din, both fancies in the perceiver. **B1 closed.**
- **Undeclared seventh edit at this site, verified:** "through a strong **but**
  unnoticed action" → "through a strong **though** unnoticed action". This was
  not in the change list. It is an improvement — source reads "though
  unobserved" — and is accepted.

### 5. Splitting the lenses/echoes sentence and "by lenses" → "by glasses, that is, mirrors and lenses," — PASS (round-1 N3 resolved)

- **Source:** "they could not bee severed from them, as by glasses, and in
  Ecchoes by reflection, wee see they are; where we know the thing we see, is in
  one place; the apparence, in another."
- **Candidate:** "…they could not be separated from those objects. Yet we see
  that they can be — by glasses, that is, mirrors and lenses, and by reflection
  in echoes — where we know that the thing we see is in one place and its
  appearance in another."
- **Source word confirmed:** the source's word is **"glasses"**, not "lenses".
  Round-1 N3 was correct that "lenses" silently selected one half of a term
  which in 1651 covers looking-glasses (mirrors) as well as burning/perspective
  glasses (lenses).
- **Does this resolve N3?** **Yes.** The source's own word is now on the page,
  and the gloss widens rather than narrows the term — the opposite of the B2
  failure mode. A bare "glasses" would have been the strictly conservative fix
  round 1 suggested, but bare "glasses" in modern English reads as *spectacles*,
  which would have introduced a fresh and worse error. The gloss is the right
  call here.
- **Is "mirrors and lenses" accurate to the sentence's own framing?** **Yes, and
  the mirror half is if anything the primary sense.** The clause the candidate
  keeps — "the thing we see is in one place and its appearance in another" — is
  a description of reflection: a looking-glass puts the apparence somewhere the
  object is not. The paired auditory example is echoes-by-reflection, which
  makes reflection the organizing idea across both senses. Refraction through a
  lens also displaces an apparence, so "lenses" is not wrong either; keeping
  both is the accurate reading of the period term in this context.
- **Split verified:** no content lost. The counterfactual ("if those Colours,
  and Sounds, were in the Bodies…") retains its scope and consequent in
  sentence 1; the "wee see they are" refutation, both instrument examples, and
  the two-places clause all land in sentence 2.
- **Note (N2, non-blocking, pre-existing — not introduced in round 2):** the
  source's flat "wee see they are" (we see that they *are* severed) is rendered
  as "we see that they **can be**." That is a modal softening of a factual
  claim. It was present in the round-1 candidate and round 1 did not flag it;
  it is recorded here for completeness. "Yet we see that they are" would be
  tighter. Not blocking: the instruments are named in the same breath, so the
  factual force is effectively carried.
- **Consistency observation (no action):** round 2 removed one bracketed gloss
  (B2) and added another in the same paragraph. These are not the same act.
  B2's gloss *replaced* the reader's access to a broad term with a narrow modern
  one; this gloss *preserves* a source word that would otherwise be either
  dropped or misread. The distinction is worth having on the record for the rest
  of the Leviathan batch: gloss to keep a source term usable, never to
  substitute for it.

### 6. "clothed in" → "can seem to merge with" — PASS with a note

- **Source:** "And though at some certain distance, the reall, and very object
  seem invested with the fancy it begets in us; Yet still the object is one
  thing, the image or fancy is another."
- **Candidate:** "And although at a certain distance the real object itself can
  seem to merge with the very image it produces in us, the object is still one
  thing and the image, or fancy, another."
- **Verdict:** Meaning preserved. The claim is that at distance the object and
  its own visual appearance seem to coincide, and the immediately following
  contrast — object one thing, image/fancy another — is intact and does the
  disambiguating work. The concessive "though … yet still" structure survives as
  "although … still". "Seem" → "can seem" adds a modal, but the source clause is
  already distance-conditioned ("at some certain distance"), so no source
  assertion is softened into a possibility that wasn't one.
- **Note (N3, non-blocking, new):** this is billed as register-only and is very
  nearly that, but it is not purely so. "Invested with" is *clothed in* — a
  garment metaphor in which the two remain two, one laid over the other.
  "Merge with" implies fusion into one. The candidate's own next clause denies
  fusion, so the paragraph does not end up asserting anything false, and
  arguably "merge" states the illusion more directly for a modern reader. Still,
  if the goal was register alone, "can seem to be clothed in" would have
  delivered it without touching the metaphor. Reviewer's judgment: acceptable as
  written; not worth another round.

---

## Collateral check on ¶4 (sites not in the change list)

Re-read of the full paragraph against source found no damage outside the seven
edit sites. Specifically re-verified as intact after the two sentence splits:

- Direct/indirect sense pairing (taste and touch / seeing, hearing, smelling) —
  correct and in source order.
- Conduction chain: nerves → other cords and membranes → brain and heart.
- Five-sense enumeration complete and in source order (eye / ear / nostril /
  tongue and palate / rest of body), quality list complete (heat, cold,
  hardness, softness).
- Parenthesis "(for motion, produceth nothing but motion.)" present.
- "the same waking, that dreaming" → "the same whether we are awake or
  dreaming" — present.
- Closing definition "nothing els but originall fancy … by the pressure, that
  is, by the motion" → "nothing but this original fancy … by the pressure —
  that is, the motion" — present, with "original" (not "first") preserving the
  link back to ¶2's "The Originall of them all".
- Negations all present and correctly polarized.
- No new unmodernized islands, no silent corrections, no invented content.

---

## Round-1 items: status

| Item | Type | Status |
| --- | --- | --- |
| B1 — "produce the same" identity claim dropped | Blocking | **CLOSED** |
| B2 — "that is, mental image" gloss narrows *Fancy* | Blocking | **CLOSED** |
| N3 — "by lenses" drops the mirror sense of "glasses" | Non-blocking | **CLOSED** |
| N1 — ¶2 "produced **by** the organs" vs. "begotten **upon**" | Non-blocking | **OPEN** — not taken; ¶2 unchanged |
| N6 — ¶5 "to disparage" vs. "as disapproving of" | Non-blocking | **OPEN** — not taken; ¶5 unchanged |
| N2, N4, N5 | Non-blocking, no fix required | No action, as recommended |

N1 and N6 were listed in round 1 as "recommended while the file is open, not
blocking." They were not taken. They remain non-blocking and this reviewer does
not hold the chapter for them, but they are the two edits worth making if the
file is reopened for any other reason. N1 is the more substantive of the two:
"produced by the organs of Sense" makes the organs the causal agent, where
Hobbes has them as the site, and ¶4 then spends its whole length establishing
that the external object is the agent.

---

## Verdict

**ACCEPT AS-IS**

Both round-1 blocking defects are correctly and minimally repaired, the
non-blocking N3 is repaired as a bonus, the two sentence splits lose no content,
and paragraphs 0, 1, 2 and 4 are byte-for-byte identical to their round-1
certified state once JSON escaping is decoded. The Scholastic "Being Seen"
constructions are untouched, as required. No blocking defects found in round 2.

Nothing must change before this chapter is pinned.

Optional micro-fixes, in descending order of value, **only** if the file is
reopened for another reason (none of these alone justifies a round 3):

1. ¶2 — "produced … by the organs of Sense" → "… **upon** the organs of
   Sense" (round-1 N1; causal direction).
2. ¶4 — "free of that pressure" → "free of that **inward** pressure"
   (this review's N1; pronoun referent).
3. ¶5 — "to disparage" → "as disapproving of" (round-1 N6).
4. ¶4 — "we see that they can be" → "we see that they **are**"
   (this review's N2; modal softening of a factual claim).

**Recommendation: pin chapter 2 and proceed to whole-chapter re-read /
verify-and-pin per `TRANSLATION_PROTOCOL.md`.**
