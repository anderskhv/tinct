# Frankenstein modern-en — independent re-verification R1 -> R2

**Verdict: DEFECTS FOUND** (1 introduced by an R2 edit, 1 older problem inside a changed paragraph). Everything else is clean.

## 1. Diff integrity — PASS
- I diffed R1 against R2 in code. 37 paragraphs changed, and they are exactly the list in `frankenstein-changed-R2.txt`: same set, same order.
- There are 39 listed edits (fid2-final plus acc-final). They cover exactly those 37 paragraphs; 13.5 and 14.3 each have two edits.
- Each `old` string occurs exactly once in its R1 paragraph. Applying the listed edits to R1 reproduces every R2 paragraph exactly, with no other changes.
- Nothing outside those 37 paragraphs changed, and the top-level keys are unchanged.

## 2. Structure of R2 — PASS
- The file is valid JSON with 28 chapters.
- Every chapter's paragraph count matches the source.
- Chapter numbers match the source, and titles are the same as R1.
- There are no empty paragraphs.

## 3. Content review (each changed paragraph checked against the source, with one neighbour each side)

### DEFECT A — 4.38 (introduced by the acc-final edit, a lost hedge)
- **Source:** "Strange and harrowing must be his story, frightful the storm which embraced the gallant vessel on its course and wrecked it—thus!" Here "must be" governs both halves: Walton is guessing about the storm too.
- **R2:** "His story must be strange and harrowing — and terrible was the storm that struck the gallant vessel on its course and wrecked it — thus!"
- **Problem:** "terrible was" states the storm's terribleness as fact, so the hedge is lost. The edit's reason says "meaning unchanged", which is incorrect.
- **Fix:** replace `and terrible was the storm that struck` with `and terrible must have been the storm that struck`.

### DEFECT B — 24.1 (older problem, not caused by the R2 edit, but in a changed paragraph)
- **Source:** "a race of devils would be propagated upon the earth who might make the very existence of the species of man a condition precarious and full of terror."
- **R2:** "A race of devils might be unleashed upon the earth, making the very existence of the human species precarious and terrifying."
- **Problem:** the certainty has moved. In the source, the race of devils "would" be propagated, and only the threat to humanity is a "might". R2 turns the first into a possibility and the second into a certainty. The epithet fix itself (monsters -> devils) is correct.
- **Fix:** replace `A race of devils might be unleashed upon the earth, making the very existence of the human species precarious and terrifying.` with `A race of devils would spread across the earth, who might make the very existence of the human species precarious and terrifying.`

### Attribution judgments (as requested)
- **14.3, "As Percy Shelley's poem "Mutability" puts it:"**
  - *Accurate:* the stanza ("We rest.—A dream has power to poison sleep … Nought may endure but Mutability") is from P. B. Shelley's "Mutability", published 1816.
  - *Neutral:* it adds no interpretation, and the verse text is unchanged apart from the approved "morrow" -> "tomorrow".
  - *Reads well aloud*, and it fixes the real problem of an unannounced stanza.
  - *Acceptable.* Minor notes, not defects: it puts an explicit citation in Victor's own voice, where the source has none. The anachronism was already in the source, since Victor quotes an 1816 poem. It also uses a different form from the trailing "From …" lines at 9.8 and 22.20. A lead-in is the right choice here, though, because a trailing line would not fix the "who is speaking" confusion.
- **9.8, "From Coleridge's "Ancient Mariner.""**
  - *Accurate:* the lines are from *The Rime of the Ancient Mariner* (Part VI). "Ancient Mariner" is the title as the source prints it, which is correct under the names-as-printed rule.
  - *Neutral:* the attribution line is Mary Shelley's own, and it reads cleanly aloud. Acceptable.
- **22.20, "From Wordsworth's "Tintern Abbey.""**
  - *Accurate:* the lines are from "Lines Composed a Few Miles above Tintern Abbey", and the title is as the source prints it.
  - It is neutral and consistent with 9.8. Moving the period inside the quotes follows house style. Acceptable.

### Other changed paragraphs — clean
1.4, 1.8, 7.3, 9.2, 11.27, 12.1, 13.5, 15.0, 15.2, 15.12, 15.13, 17.16, 18.15, 18.17, 19.2, 19.9, 20.17, 20.36, 21.9, 21.10, 21.11, 22.15, 23.14, 24.18, 25.20, 26.34, 27.15, 28.16, 28.45, 28.47, 28.64.

In each, I checked the edit against the source for actors, negation, causality, hedges, epithets and names as printed. All are correct and grammatical, and they read naturally aloud. Specific checks:
- **11.27:** "Juras" matches the source.
- **23.14:** "St. Andrew's" matches the source.
- **28.16:** "blue seasons" is what the source prints, so it is correct under the names-as-printed rule, though odd aloud.
- **15.12 / 15.13:** "sounds" is right for the Creature's pre-language perception.
- **21.9 / 21.10:** the parallel "evil passions" wording is restored.

Optional notes, not defects:
- **13.5:** "commit" now appears twice in two sentences ("would commit some new atrocity … would still commit some monstrous crime"). The source varies the verbs (perpetrate / commit). For example, `would commit some new atrocity` could become `would perpetrate some new atrocity`.
- **24.24:** "might now satisfy" adds "now". This is harmless, because it is implied by the context.

---

# Addendum: R3 candidate (frank-R3-cand.json vs frank-R2.json)

**Verdict: VERIFIED CLEAN**

- **Diff:** only 4.38 and 24.1 changed. Each `old` string in frank-R3.json occurs exactly once in its R2 paragraph. Applying the two listed edits to R2 reproduces the R3 candidate exactly, with nothing else altered.
- **4.38:** now reads "His story must be strange and harrowing — and terrible must have been the storm that struck the gallant vessel on its course and wrecked it — thus!" The source's "must be … frightful the storm" hedge is back on the storm. It is grammatical and reads naturally aloud, with "thus!" kept. The neighbouring paragraphs 4.37 and 4.39 are unchanged and still consistent.
- **24.1:** now reads "A race of devils would spread across the earth, who might make the very existence of the human species precarious and terrifying." The source's "would be propagated … who might make" is matched: the propagation is certain and the threat is possible. The "devils" epithet is kept, and "the demon" in the preceding sentence of the same paragraph (source "dæmon") is still correct. The neighbouring paragraphs 24.0 and 24.2 are unchanged and consistent. The "who" relative clause separated from "race" is a little formal but clear aloud, and it mirrors the source structure. This is not a defect.
- **Structure:** the file is valid JSON with 28 chapters. Every chapter's paragraph count matches the source, titles are unchanged from R2, and there are no empty paragraphs.
