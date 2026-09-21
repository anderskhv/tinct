# Fidelity Review 1 — Leviathan, edition chapter 2 ("Chapter 1. Of Sense")

**Reviewer:** Reviewer B (independent fidelity pass), per
`books/prompts/fidelity-review-prompt.md`.

**Fidelity anchor:** `books/wip/leviathan-pilot-ch2/source.json` (locked source,
1651 Head-edition orthography). No other translation of Leviathan was used as a
reference point.

**Candidate:** `books/wip/leviathan-pilot-ch2/candidate-sonnet.json`

---

## Coverage

- Chapter is 5 paragraphs. **All 5 paragraphs were read individually and
  compared clause-by-clause against source. Nothing was sampled or skimmed.**
- Packet 1: paragraphs 1–3 (read together, contiguous, with paragraph 4 as
  trailing context).
- Packet 2: paragraphs 4–5 (read together, with paragraph 3 as leading
  context). Paragraph 4 is the long one and was decomposed into its 13 clause
  units and checked individually.
- Whole-chapter re-read pass done after both packets, specifically for
  cross-boundary consistency of the technical vocabulary: *sense*, *fancy*,
  *appearance / apparence*, *motion*, *pressure / resistance / counter-pressure
  / endeavour*, *object*, *species*.

Structural check: candidate has `number: 2`, `title: "Chapter 1. Of Sense"`,
`section: "Part I — Of Man"`, 5 paragraphs, in source order, none merged,
split, reordered, or dropped. Title and numbering match source exactly (source
stores the section with an escaped em dash; same character). **Structure: PASS.**

---

## Blocking defects (fidelity — must fix before acceptance)

### B1. ¶4 — "produce the same" weakened to "produce their effects on us"

- **Source:** "And as pressing, rubbing, or striking the Eye, makes us fancy a
  light; and pressing the Eare, produceth a dinne; so do the bodies also we
  see, or hear, produce **the same** by their strong, though unobserved action,"
- **Candidate:** "…so the bodies we see or hear likewise **produce their
  effects on us** through a strong but unnoticed action of their own."
- **What's wrong:** The argument turns on an identity claim. Hobbes is saying
  that ordinary seeing and hearing produce *the same thing* — the same fancy of
  light, the same din — that mechanical pressure on the organ produces. That is
  the whole force of the analogy: if the fancy from a poke in the eye and the
  fancy from a seen object are the same product, sensation is mechanical
  throughout. "Produce their effects on us" states only that bodies have some
  effect, which no one disputes, and drops the identity. This is a loss of the
  inferential step, not a stylistic softening.
- **Fix:** "…so the bodies we see or hear produce **the same in us** by their
  strong, though unnoticed, action." (Keep "the same"; the referent — the light
  and the din of the preceding clause — carries over as it does in the source.)

### B2. ¶4 — inserted gloss "that is, mental image" narrows *Fancy*

- **Source:** "And this Seeming, or Fancy, is that which men call sense;"
- **Candidate:** "And this seeming, or Fancy — **that is, mental image** — is
  what men call sense."
- **What's wrong:** Two problems. (a) It is an addition: the source offers no
  gloss here, and the sentence that follows is itself Hobbes's gloss, since it
  enumerates what the fancy consists in for each sense. (b) It narrows the
  term. The very next clauses apply this same *Fancy* to sound, odor, savour,
  heat, cold, hardness and softness. An odor and a hardness are not "images."
  "Fancy" in Hobbes is the appearance-in-the-mind across all five senses;
  "mental image" pulls it toward the visual and toward the modern
  imagination/imagery sense, which is precisely the narrowing the chapter's
  argument cannot afford — and it sets up a false contrast with the genuine
  visual uses later in the paragraph ("the image, or fancy").
- **Fix:** Delete the gloss: "And this seeming, or Fancy, is what men call
  sense;". If a gloss is judged necessary for the reader, the only safe one is
  non-visual and appearance-based — e.g. "that is, how it appears to the mind" —
  but deletion is preferred, since the source's own next clause does the work.

---

## Non-blocking notes (accuracy grain; reviewer's judgment is that none of these
alone blocks acceptance, but B3 and B4 are worth taking while the file is open)

### N1. ¶2 — "begotten upon the organs of Sense" → "produced … by the organs of Sense"

- **Source:** "there is no conception in a mans mind, which hath not at first,
  totally, or by parts, been **begotten upon** the organs of Sense."
- **Candidate:** "there is no idea in a man's mind that was not first produced,
  wholly or in part, **by** the organs of Sense."
- **Issue:** Mild actor shift. In the source the organs are the *site* on which
  the conception is begotten; the begetter is the external object pressing on
  them (which is exactly what ¶4 goes on to establish). "Produced by the organs"
  makes the organs the producing agent, which reverses the causal direction
  Hobbes is setting up and puts him closer to the position he attacks.
- **Suggested fix:** "…that was not first begotten, wholly or in part, **upon**
  the organs of Sense." ("Begotten upon" is intelligible modern English here;
  if it is judged too archaic, "first produced upon the organs of Sense" keeps
  the locative.)

### N2. ¶1 — "other Accident" → "other feature"

"Accident" is technical (accident as against substance). "Feature" is a
serviceable, non-distorting modernization and does not damage the argument of
this chapter, which does not lean on the substance/accident distinction. No
change required. Flagged only so the choice is on the record for consistency
with later chapters, where Hobbes does use "accident" load-bearingly.

### N3. ¶4 — "as by glasses" → "by lenses"

"Glasses" in 1651 covers mirrors as well as lenses, and the paired example is
echoes-by-reflection, which suggests reflection is in view on the visual side
too. "Lenses" is not wrong, but it silently selects one half of the term.
"By glasses" or "by mirrors and lenses" would be safer; "by mirrors and lenses"
is a small addition, so "by glasses" is the conservative fix. Optional.

### N4. ¶4 — placement of "very"

- **Source:** "the **reall, and very object** seem invested with the fancy it
  begets in us"
- **Candidate:** "the real object itself seems to be clothed in the **very
  image** it produces in us"
- The intensifier moves from the object to the image. Candidate recovers the
  sense with "the real object itself", so nothing is lost; noted only as a
  drift. No fix required.

### N5. ¶4 — "some matter without" → "something out there in the world"

"Matter" (i.e. some material thing outside us) becomes the unspecific
"something." Acceptable — "out there in the world" preserves the externality,
which is the load-bearing part — but "some material thing outside us" would be
tighter. Optional.

### N6. ¶5 — "as disapproving the use of Universities" → "to disparage"

Disapprove (withhold approval from) is not disparage (speak slightingly of).
Hobbes's disclaimer is about endorsement, not about mockery. Small, and the
rhetorical effect is close. Suggested: "I do not say this as disapproving of
the use of universities". Optional.

### N7. ¶5 — "the frequency of insignificant Speech" → "how often they produce speech that means nothing"

The candidate supplies an agent ("they produce") that the source's abstract
noun phrase leaves unstated. The rendering of "insignificant Speech" as "speech
that means nothing" is exactly right and preserves Hobbes's technical sense
(speech without signification, not speech of little importance). The added
agent is harmless here, since universities are the only available referent.
No fix required.

---

## Checks that came back clean

- **Actors / subject-object:** No swaps found. Object presses organ; pressure
  travels inward; heart resists; effort is outward — direction preserved
  throughout ¶4. The schools, not Hobbes, are the subject of every claim in ¶5.
- **Negation:** All negations present and correctly polarized — "no conception
  in a mans mind" (¶2), "not very necessary" (¶3), "could not bee severed"
  (¶4), "nothing but motion" (¶4), "anything els, but divers motions" (¶4),
  "I say not this" (¶5). The "are … but so many several motions" construction
  in ¶4 is correctly read as "are nothing but", which is the trap in that
  sentence, and the candidate does not fall into it.
- **Causality:** "because Outward" → "Because this effort is directed outward";
  "For if those Colours…" → "For if those colors…"; "because I am to speak
  hereafter" → "because I will later have to speak". All directions preserved.
  The "Nevertheless" in ¶3 correctly survives as "Still", keeping the concession
  against "not very necessary".
- **Certainty / hedging:** "seemeth to be" → "it seems to be"; "seem invested
  with" → "seems to be clothed in"; "not very necessary" → "not really
  necessary"; "as I have said" preserved parenthetically. No source hedge is
  hardened into assertion, and no source assertion is softened.
- **Conditions:** The single conditional ("if those Colours, and Sounds, were
  in the Bodies") survives with the same scope, the same counterfactual mood,
  and the same consequent.
- **Omissions:** No clause, example, or list item dropped. The five-sense
  enumeration is complete and in source order (eye / ear / nostril / tongue and
  palate / rest of body), as is the quality list (heat, cold, hardness,
  softness). The parenthesis "(for motion, produceth nothing but motion.)"
  survives.
- **Silent corrections:** None. This is the chapter's main exposure and the
  candidate handles it correctly. Hobbes's "Audible Species, that is, an
  Audible Aspect, or Audible **Being Seen**" is a known oddity of the 1651 text
  — "seen" applied to hearing. The candidate reproduces it verbatim rather than
  tidying it to "being heard." Likewise "Intelligible **Being Seen**" is kept.
  Aristotle's name, the attribution to "certain Texts of Aristotle", and the
  Latin-derived "Species" with its English gloss chain are all preserved
  unaltered.
- **Unmodernized islands:** None. The "Visible Species / Visible Shew,
  Apparition, or Aspect, or a Being Seen" chain is terminology being quoted and
  attacked, not an archaic island; retaining it is correct, and the surrounding
  prose is fully modernized. "Shew" is correctly left as "Show".
- **Cross-boundary consistency (whole-chapter pass):** The ¶1 term
  "appearance" and the ¶4 term "appearance" translate the same source word
  (Apparence) consistently. "Fancy" is capitalized consistently where the source
  capitalizes it and lowercase where it does not, and the ¶4 payoff ("the object
  is still one thing and the image, or fancy, another") correctly depends on
  the fancy/object distinction set up earlier in the same paragraph. The ¶2
  claim that all thoughts originate in sense is correctly paid off by ¶4's "So
  sense, in every case, is nothing but this original fancy" — "originall fancy"
  rendered as "original fancy" rather than "first fancy", which is the right
  call, since it links back to "The Originall of them all" in ¶2. ¶3's promise
  ("I will briefly set it down here") is discharged by ¶4 with no dangling
  reference. ¶5's forward reference to speaking of universities' office "later"
  is preserved as a forward reference, not converted to a completed claim.

---

## Verdict

**ACCEPT WITH FIXES REQUIRED**

Required before this chapter is pinned:

1. **¶4** — restore the identity claim: "produce their effects on us" →
   "produce the same in us". (B1)
2. **¶4** — delete the inserted gloss "— that is, mental image —" after
   "this seeming, or Fancy". (B2)

Recommended while the file is open (not blocking):

3. **¶2** — "produced … by the organs of Sense" → "begotten/produced … **upon**
   the organs of Sense". (N1)
4. **¶4** — "by lenses" → "by glasses". (N3)
5. **¶5** — "to disparage" → "as disapproving of". (N6)

No re-draft is needed. The rendering is a genuine modern-English translation,
not a summary or a mechanical cleanup; the hard technical machinery of the
chapter — pressure, counter-pressure, endeavour, motion, fancy, and the
species doctrine being refuted — is carried across accurately, and the two
blocking items are localized single-phrase patches.
