# War and Peace — Batch E (Ch. 104–125) — INDEPENDENT REVIEW

Reviewer: independent verification pass over the Sonnet drafting pass.
Scope: all 20 chapters in the batch (104, 105, 106, 109–125 — note 107 and 108 are
not in this batch), read paragraph-by-paragraph against
`full-batchE-source.json` (Maude).

**Verdict: the drafter's claims are confirmed. ACCEPT the corrected file.**

---

## 1. Diff verification (independent, script-based)

Compared `full-batchE-corrected.json` against `full-batchE-current-modern-en.json`
chapter object by chapter object, then paragraph by paragraph.

| Chapter | Paragraphs changed |
|---|---|
| 111 | index 14 |
| 116 | index 5 |
| 120 | indexes 0 and 1 |

**All 17 other chapters are byte-identical between current and corrected.**
Chapter numbering, chapter titles, and paragraph counts are identical across
source / current / corrected for all 20 chapters (no merge, split, reorder, or
drop). JSON is valid; object keys are `number`, `title`, `paragraphs` only.
Punctuation conventions in the three edited paragraphs (straight apostrophes,
em dashes) match the surrounding untouched text — no stylistic seam.

This matches the drafter's notes exactly. No undisclosed edits.

---

## 2. Chapter 116 — EXTENSIVE VERIFICATION (highest-stakes item)

Chapter 116 is Pierre's diary. Structure in the source (15 paragraphs):

- [0] framing line
- [1] "24th November" / [2]–[3] that entry
- [4] "27th November" / **[5] that entry**
- [6] "three pages left blank" / [7] the Brother-V entry
- [8] "3rd December" / [9] that entry
- [10] the dog-pack dream
- [11] "7th December" / [12] the Joseph Alexeevich dream
- [13] "9th December" / [14] the Song-of-Songs dream

### (a) Was the pre-fix modern-en genuinely a duplicate of the Dec-3 entry? — CONFIRMED YES

Pre-fix paragraph [5] (the "27th November" entry, 280 words) opens with two
sentences that do correspond to the real Nov-27 source ("I got up late… lay in
bed… giving in to laziness"; "Read the Scriptures, but without proper feeling"),
and then, from the third sentence onward, is a paraphrase of the **3rd December**
entry:

| Pre-fix [5] (labelled 27 Nov) | Pre-fix [9] (3 Dec, correct) |
|---|---|
| "Afterward went and paced up and down the large hall." | "Afterward went and paced up and down the large hall." |
| Dolokhov meeting after the duel, four years ago, "perfect peace of mind despite my wife's absence" | identical content |
| "gave him the most vicious and bitter replies" | identical content |
| Boris Drubetskoy arrives, telling stories; quarrel; "He fell silent" | identical content |
| "My God, I simply cannot get along with him." | "My God, I cannot get along with him at all." |
| "a voice in my left ear saying: 'Your day!'" | identical |

The two paragraphs are near-identical in substance and sequence, differing only
in surface wording. This is a genuine, serious defect: the same source entry was
rendered twice under two different dates, and **the true Nov-27 entry was
entirely absent** from the shipped text. The drafter's diagnosis is correct and
not overstated.

### (b) Does the corrected [5] render the true Nov-27 source accurately and completely? — CONFIRMED YES

Corrected [5] is 435 words against the source's 437 — a near-exact length match,
which is itself evidence against summarizing. I checked every clause of the
source entry against the new translation:

| Source element | Present in corrected? |
|---|---|
| Got up late; lay in bed yielding to sloth | Yes |
| "O God, help and strengthen me that I may walk in Thy ways!" | Yes ("Your ways") |
| Read the Scriptures, but without proper feeling | Yes |
| **Brother Urúsov came; talk of worldly vanities** | Yes ("Brother Urusov came and we talked about worldly vanities") |
| **He told me of the Emperor's new projects** | Yes |
| **I began to criticize them, but remembered my rules and my benefactor's words** | Yes |
| The maxim: zealous worker for the state when aid required, quiet onlooker when not | Yes ("a zealous worker for the state when his help is needed, and a quiet observer when not called upon to assist") |
| "My tongue is my enemy." | Yes, verbatim |
| Brothers G. V. and O. visited; preliminary talk about reception of a new Brother | Yes, initials preserved |
| **They laid on me the duty of Rhetor** | Yes ("They assigned me the duty of Rhetor") |
| "I feel myself weak and unworthy." | Yes |
| **Seven pillars and steps of the Temple, seven sciences, seven virtues, seven vices, seven gifts of the Holy Spirit** | Yes — all five items, in source order |
| Brother O. was very eloquent | Yes |
| Evening: the admission took place | Yes |
| New decoration of the premises added to the magnificence | Yes |
| **It was Borís Drubetskóy who was admitted** | Yes |
| **I nominated him and was the Rhetor** | Yes ("I nominated him and served as Rhetor") |
| Strange feeling while alone with him in the dark chamber | Yes |
| **Caught myself harboring hatred toward him, vainly tried to overcome it** | Yes |
| "That is why I should really like to save him from evil and lead him into the path of truth" | Yes |
| Evil thoughts of him did not leave me | Yes |
| His object was merely to be intimate and in favor with lodge members | Yes |
| He had asked several times whether N. and S. were members (a question I could not reply to) | Yes, initials preserved |
| Incapable of respect for the order; too preoccupied with "the outer man" | Yes ("too absorbed in and satisfied with outward appearances") |
| No cause to doubt him, yet he seemed insincere | Yes |
| He seemed to be smiling contemptuously at my words | Yes |
| **"I wished really to stab his bare breast with the sword I held to it"** | Yes ("I truly wanted to plunge the sword I held to his bare chest") |
| Could not be eloquent; could not voice doubts to Brothers and Grand Master | Yes |
| "Great Architect of Nature, help me to find the true path out of the labyrinth of lies!" | Yes |

**Omissions found: none. Inventions found: none.** Nothing appears in the
corrected paragraph that is not in the source; sentence order follows the source
exactly. The only renderings worth noting are interpretive, not substantive:

- "the outer man" (a Masonic term) is rendered as "outward appearances" — sense
  preserved, the term-of-art flavour slightly flattened. Acceptable for a modern
  edition; not a defect.
- "A strange feeling agitated me all the time I **was** alone with him" →
  "…the whole time I **stood** alone with him". Harmless.
- "That is why I should really like to save him" → "That is exactly why I would
  like to save him". Harmless.

All proper nouns, initials (G. V., O., N., S.), and the numeric sevens are
preserved. I found no sign of a hallucinated or padded passage: this reads as a
genuine translation of the source paragraph, not a reconstruction.

### (c) Is the 3rd December entry still intact and untouched? — CONFIRMED YES

Corrected [8] ("3rd December") and [9] (the entry) are **byte-identical** to the
pre-fix file — the diff touched only index 5. I re-read [9] against source [9]
independently: it is a complete and faithful rendering (Dolokhov, the recalled
malevolent replies, Boris's visit and the quarrel, the egotism/contempt
self-reproach, the voice saying "Thy day!"). One trivial pre-existing nuance
loss: source "may rather see my own **vileness**" → "may see my own failings"
(the "rather" and the force of "vileness" are softened). Not introduced by this
fix; not worth a change.

The framing paragraph [6] ("three pages were left blank"), the Brother-V entry
[7], the dog dream [10], and the 7th/9th December dreams [12], [14] were all
re-read and are faithful and untouched.

**Chapter 116 conclusion: the fix is correct, complete, and safe to ship.**

---

## 3. Chapter 111 (Speransky's office) — VERIFIED

- Source: "This was Speránski, Secretary of State, **reporter to the Emperor**
  and his companion at Erfurt, where he had more than once met and talked with
  Napoleon."
- Pre-fix: "…Secretary of State, **the Emperor's constant companion and
  counselor at Erfurt**…" — this collapsed two distinct facts into one and
  invented "constant… counselor".
- Corrected: "…Secretary of State, the Emperor's reporter, and his companion at
  Erfurt, where he had met and talked with Napoleon more than once."

Correct: the two roles are separated again and the invented characterization is
gone. Defect and fix both confirmed. The other 40 paragraphs of ch111 were read
against source and are faithful.

## 4. Chapter 120 ("Grande" → "grandee") — VERIFIED

- Source [0]: "an old grandee of Catherine's day"; pre-fix: "a grande of
  Catherine's era" — also dropped "old". Corrected: "an old grandee of
  Catherine's era". Both problems fixed.
- Source [1]: "The grandee's well-known mansion"; pre-fix: "The grande's famous
  mansion"; corrected: "The grandee's famous mansion". Fixed.

No other occurrence of "grande" exists in the batch. Defect and fix confirmed.

---

## 5. Independent findings — the other 17 chapters

I read every paragraph of 104, 105, 106, 109, 110, 112, 113, 114, 115, 117, 118,
119, 121, 122, 123, 124, 125 against source. **I found no defect of the severity
of ch116, ch111, or ch120 — no omitted, duplicated, invented, or summarized
paragraph anywhere.** Paragraph-initial content matches source paragraph by
paragraph throughout; no paragraph falls suspiciously short of its source.

The following are the only things I would flag, all **minor / cosmetic**, all
pre-existing (none introduced by this pass). None blocks acceptance.

1. **Ch120 ¶9 — detail changed (minor, real):** source "white gauze over pink
   silk slips, with **roses on their bodices** and their hair dressed à la
   grecque"; modern-en "with **roses in their hair**, which was styled in the
   Greek fashion". The roses have migrated from the bodices to the hair. Note
   that ch123 ¶4 correctly keeps "a rose that was slipping on her bodice", so
   the edition is internally inconsistent on this detail. Worth a one-word fix
   in a future pass.
2. **Ch123 ¶7 — detail inverted (minor):** source "stared **over** his
   spectacles"; modern-en "stared **through** his spectacles". Small but it
   reverses a characteristic Pierre gesture.
3. **Ch120 ¶1 — conflation (minor):** source "red-liveried footmen **and**
   footmen in plumed hats" (two groups); modern-en "footmen in red livery and
   plumed hats" (one group).
4. **Ch113 ¶3 — word choice (minor):** "after collecting **alms**" rendered as
   "after collecting **dues**". Alms (charitable collection) and dues
   (membership fees) are not the same thing; ¶0 of the same chapter correctly
   uses "charitable contributions".
5. **Redundant footnote paragraphs (cosmetic, structural):** where the source
   has French in the body plus a translating footnote, this edition translates
   the French inline *and* keeps the footnote, so the footnote now repeats the
   body text in English. Occurs at ch111 ¶31/¶32 and ¶34/¶35, ch115 ¶1/¶2/¶3,
   ch121 ¶2/¶3. Paragraph alignment is preserved (which is why it was left), but
   it reads oddly. A future editorial pass could either restore the French in
   the body or reword the footnotes.
6. **Ch118 ¶13:** "invitations he had received from N.N. and S.S." → "from
   such-and-such dignitaries" — the initials, a deliberate Tolstoyan device, are
   dropped here, though they are preserved elsewhere in the batch (ch116, ch121
   "Prince So-and-so", ch123). Inconsistent but not wrong.
7. **Ch124 ¶17:** "Nowadays good wine rides in a carriage and pair" → "Good wine
   travels in style these days" — the concrete period image is flattened to an
   idiom.
8. **Ch119 ¶25:** "Cyril Matvéich" → "Kirill Matveich" — consistent with the
   project's name-normalization pass; noted, not a defect.

---

## 6. Final verdict

- The claimed diff is exactly what is in the file: **chapters 111, 116, 120
  only**, one paragraph each except ch120 (two).
- **The ch116 fresh translation is accurate and complete.** The alleged defect
  was real and serious (the Nov-27 entry was replaced by a duplicate of the Dec-3
  entry, silently dropping Urusov's visit, the self-censored criticism of the
  Emperor, the Rhetor duty, the seven-pillars discussion, and Boris's admission
  with Pierre's hatred and impulse to stab him). The replacement paragraph
  renders every element of the source entry, in source order, with no omission
  and no invention, at 435 words against the source's 437.
- The ch111 and ch120 fixes are both correct and correctly scoped.
- The other 17 chapters are sound. The eight items above are minor pre-existing
  blemishes, recorded for a later polish pass, not blockers.

**Recommendation: accept `full-batchE-corrected.json`.**
