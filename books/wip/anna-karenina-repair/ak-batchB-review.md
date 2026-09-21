# Anna Karenina — Batch B Independent Adversarial Review

**Scope:** Chapters 22–50, excluding 29, 33, 44–49 (21 chapters total). Modern English edition vs. Constance Garnett source.

**Reviewer:** Independent second pass, not trusting the drafter's notes or self-report.

## Verdict: ACCEPT AS-IS

No content-fidelity defects found after a full paragraph-by-paragraph read of every chapter in the batch against source (not spot-checked). The original agent's "0 defects" self-report holds up under independent adversarial review.

## What was checked

1. **File consistency.** `ak-batchB-corrected.json` is byte-for-byte identical to `ak-batchB-current-modern-en.json` (confirmed programmatically — `a == b` is `True`, both 21 chapters).

2. **Paragraph counts.** All 21 chapters match source exactly, paragraph-for-paragraph:
   ch22=25, ch23=27, ch24=30, ch25=70, ch26=13, ch27=13, ch28=36, ch30=13, ch31=22, ch32=19, ch34=30, ch35=33, ch36=36, ch37=33, ch38=24, ch39=26, ch40=55, ch41=77, ch42=14, ch43=32, ch50=44. No merges, splits, or drops anywhere in the batch.

3. **Full paragraph-level read, every chapter, every paragraph** (not just the drafter's cited passages). Compared source and modern-en side by side for all ~665 paragraphs across the batch.

4. **Drafter's cited passages — independently verified, all present, complete, and unsoftened:**
   - **Ch24, P26** — Nikolay Levin's "bad house" disclosure about Marya Nikolaevna ("I took her out of a bad house... but I love her and respect her... She's just the same as my wife") — preserved plainly, no euphemism added, no softening.
   - **Ch25, P63** — Marya Nikolaevna's backstory via Nikolay: source says "trying to get out of a house of ill-fame"; modern-en renders it as "trying to get out of a **brothel**" — this is a clarifying modernization, not a softening; the content is, if anything, more explicit and equally unflinching.
   - **Ch34** — Vronsky's circle and the "two utterly opposed classes" passage (P15) — the class-contempt content ("vulgar, stupid, and, above all, ridiculous people" who believe in marital fidelity and modesty vs. "the real people" who "abandon themselves... to every passion") is rendered in full, unsoftened, with the irony intact.
   - **Ch35** — The celebrated doctor's condescension toward Kitty (P0–P1): the passage asserting that modesty is "a mere relic of barbarism," that he regarded Kitty's modesty as "an insult to himself," and the prince's private contempt ("Conceited blockhead") are all present and unsoftened.
   - **Ch42–43** — Karenin's internal monologue (bridge/chasm metaphor, the numbered rhetorical points he plans to make, the finger-cracking tic) and the confrontation scene with Anna (including her recognition of her own capacity for lying and Karenin's late-night self-deception) are rendered completely and faithfully, beat for beat.

5. **Programmatic anomaly scan** for length-compression outliers (paragraphs where modern-en is <55% or >180% the length of source) and negation-count mismatches (a heuristic for inversion/negation-flip bugs) — both scans returned effectively nothing of concern. The two negation-count flags (ch23 p1, ch36 p31) were read in full and are ordinary paraphrase (contraction expansion, "not X" ↔ "X without Y"), not meaning inversions.

## What I looked for and did not find, anywhere in the batch

- Dropped or invented clauses
- Negation/conditional inversions (e.g., "would not have" flipped to "would have")
- Compressed/summarized passages standing in for full paragraphs
- Factual, plot, or relationship distortions (character names, family relationships, who-said-what attributions all check out — e.g., Karenin/Anna/Vronsky triangle dynamics, Nikolay/Marya Nikolaevna's status, Kitty/Levin/Vronsky history, Dolly/Stiva's strained marriage)
- Softened or bowdlerized treatment of frank content (adultery, prostitution/"house of ill-fame," Nikolay's drinking and squalor, doctor's condescension, class contempt)

## Minor observations (not defects — style choices only, do not block acceptance)

- The modernization consistently expands contractions in narration while keeping/adding contractions in dialogue where natural (standard "modern English" register work), and makes small idiomatic swaps (e.g., "Kazan government" → "Kazan province," "house of ill-fame" → "brothel," "crying off" retained, "manœuvered" → "manoeuvered"/"maneuvered" spelling normalization). These are register/clarity choices, not fidelity issues — meaning, structure, and tone are preserved in every instance checked.

## Conclusion

Batch B is clean. Recommend proceeding to whatever the next step is in the pipeline (i.e., no rework needed for these 21 chapters before this batch is considered closed).
