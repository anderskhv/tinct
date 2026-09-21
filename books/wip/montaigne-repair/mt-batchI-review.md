# Montaigne Batch I (ch. 89–99) — Independent Adversarial Review

**Verdict: ACCEPT WITH ONE FIX REQUIRED** — the two claimed fixes are correct, the
file-sync issue that has hit other batches did *not* occur here, and paragraph counts
are exact across all 11 chapters. But the drafter's ch. 99 claim of "does not soften...
any of Montaigne's frank discussion" is not true: one paragraph (ch. 99, P312) softens
a specifically anatomical reference. This is a small, isolated defect, not evidence of
systemic softening — but it should be fixed before this batch is signed off, since it
sits in the single passage the notes file singles out as fully checked.

## 1. File-sync check

`mt-batchI-current-modern-en.json` vs `mt-batchI-corrected.json` were diffed
programmatically, paragraph-by-paragraph, across all 11 chapters (765 paragraphs
total, matching the source's per-chapter counts of 11/16/35/16/34/70/71/38/48/52/374).

**Result: exactly 2 paragraphs differ between current and corrected** — ch. 90 P15 and
ch. 94 P31, matching the two claimed fixes exactly. No other content changed. This is
**not** an instance of the file-sync bug seen elsewhere in this project — `current`
genuinely holds the pre-fix text and `corrected` genuinely holds the post-fix text,
and no unrelated content drifted between the two files.

## 2. Verification of the two claimed fixes

Both checked directly against `mt-batchI-source.json`.

- **Ch. 90 P15 (Spurina, innocence/utility swap):** Source: "the well living of Scipio
  has a thousand fashions, that of Diogenes but one; **this** [= Diogenes' life, the
  nearer antecedent] as much excels the ordinary lives in innocence as **the most
  accomplished** [= Scipio's life] excel them in utility and force." Current
  (defective) text attributed innocence to Scipio and utility/force to Diogenes —
  backwards. Corrected text swaps it back to Diogenes = innocence, Scipio =
  utility/force. **Confirmed correct fix.**

- **Ch. 94 P31 (tertian/quartan):** Source: "double tertian-ague." Current (defective)
  text: "double quartan fever." Corrected text: "double tertian fever." **Confirmed
  correct fix**, and the surrounding sentence ("would have been in a continuous fever
  without them") is otherwise unchanged and accurate either way — the fix is a clean,
  minimal, correctly targeted substitution.

## 3. Independent full-batch read

I did not rely on the drafter's chapter-by-chapter verdicts. Checks performed against
`mt-batchI-corrected.json`:

- **Paragraph counts**: verified programmatically, source vs. corrected, all 11
  chapters — exact match (11, 16, 35, 16, 34, 70, 71, 38, 48, 52, 374). No merges,
  splits, or drops.
- **Length-ratio triage**: word-count ratio per paragraph pair, flagged anything under
  0.55 (source paragraphs of meaningful length). Only one hit in the whole batch: ch.
  99 P34, a two-line Latin-epigraph footnote where the corrected text keeps only one
  of the source's two alternate English renderings of the same line ("When the mind is
  languishing, the body is good for nothing." dropped; "It rises to no effort; it
  languishes with the body." kept). Minor, footnote-only, no loss of Montaigne's own
  text — noting for completeness, not blocking.
- **Number preservation**: extracted all standalone numerals from source and corrected
  per paragraph; no missing numerals anywhere in the batch (ages, dates, counts, book/
  chapter citation numbers all intact — including the "182 years" / "twenty-five
  bouts" / citation numbers the drafter called out).
- **Negation/inversion scan**: counted negation markers (not/never/no/none/nor/without/
  unless/nothing) per paragraph pair and manually read every pair whose count shifted
  by exactly one from zero (18 pairs, spanning ch. 90–99). All are legitimate
  paraphrase (e.g. splitting/recombining clauses, "does not hurt" vs. "hurts not") —
  no meaning inversions found beyond the two already-fixed ones.
- **Proper-noun/citation scan**: flagged paragraphs where source capitalized names
  didn't appear in corrected text (Caesar's mistresses list in ch. 90 P3, the Homer
  encomium in ch. 93 P16, the Alexander eulogy in ch. 93 P21, the history-of-medicine
  chain in ch. 94 P42, the catalogue of erotic-philosophy titles in ch. 99 P133, etc.).
  On inspection every flag was pure orthographic modernization (Sulpitius→Sulpicius,
  Mutia→Mucia, Sylla→Sulla, Bajazet→similar, Mauritania→Mauretania,
  Arhaemenes→Achaemenes, Poetayurra→Poetarum) — no names, anecdotes, or citations were
  actually dropped anywhere in the batch.
- **Manual spot-reads** across chapters not touched by any of the above heuristics
  (89, 96, 97, and scattered paragraphs of 91–95, 98) — all faithful, register and
  content preserved, nothing compressed or invented.

### Ch. 99 explicit-content check (given its length and the drafter's specific claim)

I independently located and checked the passages most likely to be softened —
Messalina (P219), the Amazons/Sarmatian women (P111, P286–287), the "member"
deification and genital-mutilation passage (P136, P142), the prostitution/cuckoldry
material (P195, P199–200, P212), and the closing "member"/manhood punchline
(P308–312). All render Montaigne's explicit content plainly and without euphemism
**except one**:

**FINDING — Ch. 99, P312, softened anatomical reference (not previously caught):**

- **Source:** "...done me a most enormous injury. **Every member I have**, as much one
  as another, is equally my own, and no other more properly makes me a man than
  **this**."
- **Corrected (unchanged from current, i.e. never fixed):** "...done me a most
  enormous injury. **Every limb I have**, as much as any other, is equally my own, and
  none other more properly makes me a man than **this**."

This is the essay's own punchline — Montaigne has spent the preceding several
paragraphs (P308–311, the "mentula" epigram and its gloss) building to the joke that
the organ he is complaining about is, specifically, his penis, not a generic body part.
"Member" here is a term of art carried over consistently everywhere else in this same
chapter for the genitals — the corrected text itself renders it correctly as "member"
at P136, P142, and P212, all clearly anatomical, all in the same essay. Only at P312,
the payoff line, does the corrected text switch to "limb," which in ordinary modern
English means arm/leg and defuses the joke and the anatomical specificity. This is a
real (if narrow) instance of exactly the softening the drafter's notes explicitly deny
happened anywhere in ch. 99 ("does not soften, sanitize, or omit any of Montaigne's
frank discussion... All checked faithfully"). I checked every other occurrence of
"member(s)" in the batch (ch. 90 P1, P2, P11; ch. 98 P49) and those are all fine — P1's
"rebelling members"→"rebellious parts" preserves the anatomical sense via context, and
ch. 98 P49's "members and voices" is genuinely about limbs/gestures in context (not
genitalia), so "limbs" there is correct, not a softening. P312 is an isolated miss.

**Recommended fix:** change "Every limb I have" back to "Every member I have" (or
another unambiguous rendering, e.g. "every part of me") at ch. 99, paragraph index 312.

## 4. Other checks

- No dropped/invented clauses, no compressed passages, no factual/historical
  distortions found beyond the ones above.
- No paragraph-count or paragraph-order irregularities in any of the 11 chapters.
- The `mt-batchI-notes.md` "Method" section's claims about paragraph counts and the
  length-ratio triage check out independently. Its per-chapter "PASS, no defects"
  verdicts for 89, 91, 92, 93, 95, 96, 97, 98 also check out on independent spot-read.
  Its ch. 99 "no softening anywhere" claim does **not** fully check out — see finding
  above.

## Summary

| Item | Status |
|---|---|
| File-sync (current vs. corrected) | OK — exactly the 2 claimed diffs, no drift |
| Fix 1 (ch. 90 P15, innocence/utility swap) | Verified correct |
| Fix 2 (ch. 94 P31, tertian/quartan) | Verified correct |
| Paragraph counts, all 11 chapters | Exact match to source |
| Numbers/citations preserved | Yes, no misses found |
| Dropped anecdotes/names | None found (all flags were spelling modernization) |
| Ch. 99 explicit content, general | Faithful, unsoftened, matches drafter's claim |
| Ch. 99 P312 "member"→"limb" | **New defect, not previously caught** — softens the essay's punchline; recommend fix before sign-off |
| Ch. 99 P34 footnote, dropped alt. translation | Minor, footnote-only; flagging for completeness, not blocking |

**Bottom line:** the batch is in good shape and the two claimed fixes are real and
correctly applied, but the drafter's "ch. 99 fully checked, nothing softened" claim
should not be taken at face value — one real (small) softening slipped through at the
chapter's climactic line. Fix ch. 99 P312 before treating this batch as closed.
