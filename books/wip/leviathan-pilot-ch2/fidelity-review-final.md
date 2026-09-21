# Final Fidelity Review — Leviathan, edition ch. 2 ("Chapter 1. Of Sense")

**Round:** 3 (final, pre-pin)
**Method:** Full non-sampled read of all 5 paragraphs in both files, clause by clause.
Not a diff — each candidate paragraph read against its source paragraph in its current final state.

**Files**
- Source: `books/wip/leviathan-pilot-ch2/source.json`
- Candidate: `books/wip/leviathan-pilot-ch2/candidate-sonnet.json`

---

## Verdict

**ACCEPT AS-IS.** Safe to pin.

No fidelity defects found. No actor swaps, no dropped or added negations, no
inverted or invented causality, no certainty/hedging drift of consequence, no
dropped or altered conditions, no omissions, no substantive additions, no silent
corrections of Hobbes.

---

## Structure

| Check | Result |
|---|---|
| `number` | 2 = 2 ✓ |
| `title` | "Chapter 1. Of Sense" — identical ✓ |
| `section` | "Part I — Of Man" — identical ✓ |
| Paragraph count | 5 = 5 ✓ |
| Paragraph order | 1:1, index-aligned, nothing merged/split/reordered ✓ |
| Top-level keys | identical set ✓ |
| Length ratios (chars) | 1.06 / 0.91 / 0.94 / 1.09 / 1.03 — all within normal rendering range, no truncation, no padding |

## Scholastic-jargon check (explicitly required)

Hobbes's parody of Schools Latin is intact and untouched in ¶5:

- "Visible Species … a Visible Show, Apparition, or Aspect, or a Being Seen" ✓
- "an **Audible Species**, that is, an Audible Aspect, or **Audible Being Seen**" ✓
- "**Intelligible Species**, that is, an **Intelligible Being Seen**" ✓

Counts match source exactly (Species terms 1/1/1; "Being Seen" 3/3). The
deliberate absurdity of an *audible* "Being Seen" and an *intelligible* "Being
Seen" is preserved verbatim — correctly treated as Hobbes's joke, not a defect.
The "(in English)" gloss on *Visible Species* is also preserved as Hobbes's own.

---

## Paragraph-by-paragraph

### ¶1 — Thoughts singly vs. in train
- Program statement intact: first singly, afterward "in sequence, or as they follow from one another" = "in Trayne, or dependance upon one another." ✓
- "Representation or Apparence" → "representation or appearance" ✓
- "some quality, or other Accident" → "some quality or other feature". *Accident* modernized to *feature*; the technical Scholastic sense is flattened slightly, but no claim is changed and the object/accident distinction survives in the sentence. Accepted.
- "a body without us" → "a body outside us" ✓; "commonly called an Object" ✓ (attribution of the name preserved).
- Causal chain intact: object acts on eyes/ears/other parts; **diversity of working → diversity of appearances** — the variation is correctly located in the *manner of acting*, not in the observer. ✓

### ¶2 — Sense as the origin
- "The Originall of them all" → "All of these thoughts originate in what we call Sense" ✓ (universal quantifier kept).
- Negative claim preserved exactly: "there is no idea in a man's mind that was not first produced, wholly or in part, by the organs of Sense" = "no conception … which hath not at first, totally, or by parts, been begotten upon the organs of Sense." Double negation, the "at first", and the "totally, or by parts" disjunction all survive. ✓
- Note (non-defect): "begotten **upon** the organs" → "produced **by** the organs" shifts the organs from site to agent by a hair. Hobbes's own next paragraph makes the external body the cause and the organ the thing pressed, so the rendering is consistent with his doctrine and with ¶4; no correction needed.
- "The rest are derived from that originall" → "Everything else is derived from that origin." ✓

### ¶3 — Methodological aside
- Hedge level preserved: "is not very necessary" → "is not really necessary" (same downgrade, not a denial). ✓
- Prior-work claim preserved with its vagueness: "I have els-where written of the same at large" → "I have already written about it at length elsewhere." ✓
- Intent preserved: "to fill each part of my present method … briefly deliver the same in this place" → "to fill out every part of my present plan … briefly set it down here." ✓ Commitment to brevity kept.

### ¶4 — The mechanism of sense (longest paragraph, read in full)
- Cause correctly assigned: external body/Object presses the organ proper to each sense. ✓
- **Immediate vs. mediate distinction and its membership kept exactly**: directly = taste and touch; indirectly = seeing, hearing, smelling. ✓ (Easy place to invert; not inverted.)
- Transmission path complete and in order: nerves, other cords and membranes → inward → brain **and heart**. The heart is not dropped. ✓
- "causeth there a resistance, or counter-pressure, or endeavour of the heart, to deliver it self" → "a resistance, or counter-pressure — an effort of the heart to push itself free of that pressure." The three-term apposition is kept; "of that pressure" makes the implicit object explicit without adding a claim. ✓
- "which endeavour because Outward, seemeth to be some matter without" → "Because this effort is directed outward, it seems to be something out there in the world." Causal *because* preserved, and crucially the verb stays **seems** — the illusion is not upgraded to fact. ✓
- Sense-modality list complete and correctly matched: eye/light-or-figured-colour, ear/sound, nostril/odour, tongue+palate/savour, rest of body/heat, cold, hardness, softness and other qualities discerned by feeling. ✓ "Colour Figured" → "a shape marked out in color" is an accurate unpacking of the compound.
- Core ontological claim intact: sensible qualities exist **in the object** only as so many several motions of matter. The candidate splits this into two sentences ("…different motions of matter. It is by these motions that the object presses on our organs in different ways."), which is a sentence split *inside* a paragraph — paragraph alignment untouched, and both halves are in the source. ✓
- Parallel claim about us kept with its negation: "in us, who are pressed, they are likewise nothing but various motions" ✓, and the parenthetical axiom "for motion produces nothing but motion" is kept as an unhedged general law. ✓
- "the same waking, that dreaming" → "the same whether we are awake or dreaming" ✓ — parity of waking and dreaming appearance preserved.
- Analogy preserved with the right direction: pressing/rubbing/striking the eye → fancy of light; pressing the ear → a din, rendered "a ringing" (reasonable modern equivalent of the phosphene/tinnitus phenomenon Hobbes describes); **so likewise** bodies we see or hear do the same "through a strong though unnoticed action of their own." The added "in us" is implicit in the source and adds no claim. ✓
- Counterfactual argument kept as a counterfactual: "**if** those colors and sounds actually resided in the bodies … they could **not** be separated from those objects. **Yet we see that they can be**." Conditional, negation, and the empirical rebuttal are all in place and in the right order. ✓
- "as by glasses, and in Ecchoes by reflection" → "by glasses, that is, mirrors and lenses, and by reflection in echoes." The clause "that is, mirrors and lenses" is an **added gloss** — the one genuine addition in the chapter. It is editorially accurate (Hobbes's *glasses* means specula/lenses), non-substantive, and prevents a modern reader from reading "glasses" as spectacles. Consistent with the rendering's practice of unpacking archaic vocabulary inline. Not a fidelity defect; recorded here for the record.
- "where we know the thing we see, is in one place; the apparence, in another" ✓ — the place-splitting evidence is exact.
- "at some certain distance, the reall, and very object seem invested with the fancy it begets in us" → "at a certain distance the real object itself can seem to merge with the very image it produces in us." *Invested with* → *merge with* is a small figure change (clothed-in → fused-with); the point, that object and image are hard to prise apart at distance, is the same, and the following "the object is still one thing and the image, or fancy, another" restates the distinction exactly as Hobbes does. The added modal "can" sits on a verb that is already "seem," so no new hedging is introduced. ✓
- Conclusion intact, including the self-citation and the gloss chain: "sense, in every case, is nothing but this original fancy, caused (as I have said) by the pressure — that is, the motion — of external things upon our eyes, ears, and other organs designed for that purpose." Universal scope ("in all cases"), the pressure=motion identification, and "thereunto ordained" all survive. ✓

### ¶5 — Against the Schools
- Actors correct: the philosophy schools, throughout every university in Christendom, grounded on certain texts of Aristotle, teach **another** doctrine. Aristotle is the ground, the Schools are the speakers — not conflated. ✓ (Clause order rearranged; attribution unchanged.)
- The three species doctrines are reported in source order (vision, hearing, understanding), each as reported speech ("they say"), never as Hobbes's own view. ✓
- Mechanisms kept distinct: species received **into the eye** = seeing; entering **the ear** = hearing; coming **into the understanding** = understanding. ✓
- Disclaimer preserved with its negation: "I do **not** say this to disparage the use of universities." ✓ (*disapproving* → *disparage*: same force.)
- Forward promise preserved: he will later speak of universities' office/function in a commonwealth, and must therefore point out along the way what would need amending. ✓
- Closing jab preserved: "one of these is how often they produce speech that means nothing" = "the frequency of insignificant Speech is one." *Insignificant* correctly rendered as *meaning nothing*, not as *unimportant* — the usual trap here, avoided. ✓ Minor: "they produce" attributes the speech to the universities, which the source implies by locating it "in them." No change in claim.

---

## Summary of non-defect observations (no action required)

1. ¶1 "Accident" → "feature" — technical term flattened, claim unchanged.
2. ¶2 "begotten upon" → "produced by" — hairline agency shift, consistent with ¶4's doctrine.
3. ¶4 "a dinne" → "a ringing" — modern equivalent of the same phenomenon.
4. ¶4 "glasses, that is, mirrors and lenses" — the only added words in the chapter; accurate inline gloss.
5. ¶4 "invested with" → "merge with" — figure changed, distinction immediately restated intact.

None of these alters an actor, a negation, a causal direction, a condition, or a
level of certainty. Nothing in the chapter silently corrects, updates, or
softens Hobbes.

---

**Final verdict: ACCEPT AS-IS — clear to pin the hash.**
