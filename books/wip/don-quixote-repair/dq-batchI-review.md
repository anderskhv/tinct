# Batch I Independent Adversarial Review — Don Quixote Ch. 89–99

**Verdict: ACCEPT WITH FIXES REQUIRED** (not clean; two issues must be resolved before this batch is considered done)

## 1. File-consistency check — FAILED (critical)

Task instruction #1 was to confirm `dq-batchI-corrected.json` matches
`dq-batchI-current-modern-en.json`. **It does not.** `diff` shows exactly
three differences, and they are precisely the three claimed fixes — but the
files are the wrong way round relative to what the drafter's notes and the
task framing claim:

- `dq-batchI-corrected.json` contains the **fixed** text for all three claimed
  defects (verified correct against source, see §2).
- `dq-batchI-current-modern-en.json` — described in the task setup as "the
  modern-English text AFTER this pass's 3 fixes" — **still contains all
  three original defects, unfixed**:
  - ch90 P13 still reads "the three of us took counsel together" (invented headcount).
  - ch92 P3 still reads "go-betweens that have moved up in the trade" (inverted meaning).
  - ch92 P15 still contains the invented `(_clavo_ for the peg in his forehead, _leño_ for the wood)` gloss.

In other words: the drafter edited `corrected.json` but never actually
propagated those edits into `current-modern-en.json`. If
`current-modern-en.json` is the file that feeds the live/deployed edition (as
its name and every other batch in this repo suggest — every other batch's
`-corrected.json` is presumably meant to become the new
`-current-modern-en.json`), **none of the three claimed fixes have actually
been applied to the file that matters.** Only the sandbox copy was fixed.
This must be corrected — `current-modern-en.json` needs to be overwritten
with the corrected content — before this batch can be signed off, regardless
of the fixes' own correctness.

## 2. Verification of the 3 claimed fixes (checked against `dq-batchI-corrected.json`, which does hold the real fix)

**Ch. 90, P13 — "the three of us" → "we all"**
Source: *"...the dread of which made **us all there** take counsel
together..."* — genuinely vague about headcount. `corrected.json` now reads
"Dreading this, we all took counsel together there..." — accurate fix,
confirmed.

**Ch. 92, P3 — "moved up in the trade" → "who were once principals themselves"**
Source: *"...most of them have a flavour of agents that have **ceased to be
principals**..."* — describes a decline (once a principal, now reduced to
acting as an agent/go-between). The pre-fix text inverted this to an
*ascent* ("moved up in the trade"). `corrected.json` now reads "who were once
principals themselves" — direction of the euphemism restored, confirmed
correct.

**Ch. 92, P15 — Clavileño etymological gloss — fix is INCOMPLETE, introduces a new defect**
Source: *"...he is called Clavileño the Swift, which name is in accordance
with his being made of wood, **with the peg he has in his forehead**, and
with the swift pace at which he travels..."* — the source gives **three**
reasons for the horse's name: (1) made of wood, (2) the peg in its forehead,
(3) its swift pace.

The pre-fix defective text folded reason (2) into a fabricated Spanish
etymological gloss not present in the source: *"...made of wood (_clavo_ for
the peg in his forehead, _leño_ for the wood), and the swift pace..."* —
correctly flagged as invented content.

But the "fix" in `corrected.json` doesn't restore reason (2) as a clause — it
deletes it outright: *"...a name that fits his being made of wood, and the
swift pace at which he travels."* Only two of the source's three stated
reasons for the name survive. This is itself a dropped-clause fidelity
defect (the same category of error the pass exists to catch), introduced
during the repair. **Required fix:** restore "the peg he has in his
forehead" as a plain clause, e.g.: *"...a name that fits his being made of
wood, the peg he has in his forehead, and the swift pace at which he
travels."*

So: 2 of 3 claimed fixes are clean; the 3rd fix is right to remove the
invented gloss but wrong in also removing genuine source content — it needs
a follow-up correction, not a revert.

## 3. Full-batch paragraph-by-paragraph check (all 11 chapters, ch. 89–99)

Performed both programmatically and by direct reading:

- **Paragraph counts**: verified exactly against source for all 11 chapters —
  14, 16, 8, 28, 50, 34, 33, 43, 34, 18, 50. All match. No merges, splits,
  drops, or invented paragraphs.
- **Length-ratio screen** (word-count ratio per paragraph, source vs.
  corrected): zero paragraphs outside a 0.7×–1.6× band across all 348
  paragraphs — no evidence of compression/summarization or padding anywhere
  in the batch outside the three known spots.
- **Numeric-token screen**: exact digit-token sets compared per paragraph
  (leagues, counts, years, etc.) — zero mismatches anywhere in the batch.
- **Proper-noun frequency screen** (Sancho, Quixote, Dulcinea, Altisidora,
  Trifaldi, Clavileño, Rocinante, Dapple, Antonomasia, Clavijo, Kandy,
  Barataria, Ricote, Tosilos, Rodriguez, Duke, Duchess): all flagged
  differences checked by hand and are benign — chapter-opening pronoun→name
  substitutions for readability (e.g. opening "He was dressed..." rendered as
  "Sancho was dressed..."), and orthography normalization (Rodriguez →
  Rodríguez with accent). No name swaps, no dropped characters, no invented
  characters.
- **Negation/conditional density screen** (not/no/never/none/nothing/nor/n't
  counts per paragraph): 14 paragraphs flagged for a delta of ≥2; all 14 read
  in full against source (ch92 P18; ch93 P6, P26, P39, P41; ch94 P21; ch95
  P23; ch97 P27; ch98 P1; ch99 P1, P7, P25, P40). All are legitimate
  phrasing/contraction differences (e.g. "will not" → "won't", "I don't ...
  no more" restructured, added rhetorical "doesn't seem that sort" framing
  that doesn't change the asserted meaning). No inversions found among these.
- Direct read of the two chapters the notes call "one/two defects" (90, 92)
  plus spot-reads across all remaining chapters (89, 91, 93–99) for
  plot/factual distortion: governorship maxims, the Trifaldi's narration, the
  Clavileño flight, the banquet-with-the-wand scene, and the peasant/farmer
  closing dialogues all track the source's sequence of events, claims, and
  examples. No additional dropped clauses, meaning inversions, or
  factual/plot distortions were found beyond the one identified in §2.

## Summary

- Drafter's claim of "3 defects found and fixed, batch otherwise clean" is
  **substantially correct** on content — my independent read did not turn up
  additional undiscovered defects in the prose itself.
- However, the deliverable is not actually done: (a) the fixes were never
  written into `current-modern-en.json`, which still carries all three
  original defects — this is the more serious of the two problems, since it
  means the "corrected" file is not the one that would ship; and (b) the
  ch92 P15 fix over-corrected, silently dropping genuine source content (the
  peg-in-forehead clause) while removing the invented gloss.

**Required before acceptance:**
1. Regenerate `dq-batchI-current-modern-en.json` from the actually-correct
   text (i.e., make it match `dq-batchI-corrected.json`'s three fixed
   paragraphs, not the other way around).
2. Amend ch92 P15 to restore "the peg he has in his forehead" as a plain
   clause (without the fabricated Spanish gloss) in both files once (1) is
   done.

No other paragraphs in chapters 89–99 require changes.
