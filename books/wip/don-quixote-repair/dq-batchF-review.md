# Don Quixote Batch F — Independent Adversarial Review

**Reviewer stance:** independent re-read, not a re-check of the drafter's notes. I read
every paragraph of all 11 chapters (56–66) against source myself before opening
`dq-batchF-notes.md`.

## Verdict: ACCEPT AS-IS

No content-fidelity defects found. The drafter's "0 defects" self-report holds up under
independent re-read. This is a genuinely clean, unabridged, paragraph-faithful rendering.

## What was checked

1. **corrected.json vs current-modern-en.json** — `diff` is empty. Byte-identical. Confirmed.
2. **Paragraph counts vs source**, all 11 chapters, verified programmatically:

   | Ch | Title (as stored) | Source paras | Modern-en paras | Match |
   |---|---|---|---|---|
   | 56 | Part 2, Chapter 4  | 26 | 26 | yes |
   | 57 | Part 2, Chapter 5  | 32 | 32 | yes |
   | 58 | Part 2, Chapter 6  | 15 | 15 | yes |
   | 59 | Part 2, Chapter 7  | 34 | 34 | yes |
   | 60 | Part 2, Chapter 8  | 31 | 31 | yes |
   | 61 | Part 2, Chapter 9  | 29 | 29 | yes |
   | 62 | Part 2, Chapter 10 | 38 | 38 | yes |
   | 63 | Part 2, Chapter 11 | 27 | 27 | yes |
   | 64 | Part 2, Chapter 12 | 47 | 47 | yes |
   | 65 | Part 2, Chapter 13 | 34 | 34 | yes |
   | 66 | Part 2, Chapter 14 | 43 | 43 | yes |

   366 paragraphs total (including chapter-title paragraphs), all present, none merged,
   split, dropped, or invented.

3. **Full paragraph-by-paragraph close read**, source vs modern-en, all 11 chapters,
   including the passages named in the task brief and a few more I specifically checked
   for compression risk:
   - Don Quixote's four-part lineages speech (ch. 58 / "Part 2, Ch. 6" §10) — fully rendered,
     no examples dropped (Ottoman house, Pharaohs/Ptolemies/Caesars, the two roads of
     letters and arms, the closing couplet all present).
   - The courtier-vs-knight-errant speech (ch. 58 §6) — the giants-with-mill-wheel-eyes
     passage and the full catalogue of childish dueling niceties are intact.
   - The Erostratus / Charles V and the Rotunda / fame digression (ch. 60 §11) — the poet's
     satire anecdote, the Erostratus/Diana's-temple anecdote, and the Charles-V-at-the-Rotunda
     anecdote are all present in full, plus the closing catalogue (Horatius, Mutius, Curtius,
     Caesar/Rubicon, Cortés) — nothing trimmed.
   - The Knight of the Grove's catalogue of labors for Casildea (ch. 66 §1) — La Giralda,
     the bulls of Guisando, the cavern of Cabra, and the "defeated Don Quixote" claim are
     all present.
   - Both sonnets/verse passages (ch. 58 §11 "It is by rugged paths...", ch. 64 §12/14 the
     Nisus/Euryalus verse tag, ch. 64 §25 the Knight of the Grove's full 14-line sonnet, ch.
     66 §2 the closing couplet) — all rendered in full, re-lineated as verse rather than run
     as prose, but with no lines or clauses dropped.
   - Translator/narrator meta-commentary — the "apocryphal chapter" asides bracketing ch. 57
     (§1, §16, §22), Cide Hamete/Hamete Benengeli's "Blessed be Allah" invocation opening
     ch. 60, and the various "the history says," "as will be seen farther on" asides — all
     preserved, not summarized or dropped.
   - The Cortes of Death cart episode (ch. 63) — full cast list (Death, angel, emperor,
     Cupid, armed knight), the bladder-devil chase, the stone-throwing squadron standoff,
     and Sancho's talking-Don-Quixote-down speech — all intact.
   - The Knight of the Mirrors duel and unmasking (ch. 66) — full sequence, including the
     nose prosthetic reveal and Tom Cecial's identification, intact.

   No compression, no meaning inversions, no dropped clauses, no invented content, no
   altered names/places/objects were found anywhere in the batch.

## Samson / Sansón spelling inconsistency — confirmed real, assessed as harmless

Verified directly against text (not just taken from the notes):
- Ch. 56 (P2, P4, P6, P8, P14…) and ch. 58 (P8): **"Samson"**.
- Ch. 59 P1 onward — the housekeeper's flight to find "the bachelor **Sansón** Carrasco" is
  the first occurrence of the accented form — and the accented spelling continues
  consistently through ch. 66 (e.g., "Sansón offered him one," "Sansón embraced him,"
  every reference to "Sansón Carrasco" in the Knight-of-the-Mirrors unmasking).
- This is a real, reproducible switch at a clean chapter boundary (56–58 vs. 59–66), not
  scattered/random — which makes it look like a deliberate but undocumented editorial
  choice partway through drafting, rather than random typos.
- The source (Ormsby-derived English) spells it "Samson" throughout, with no accent, in
  every one of the 11 chapters. So both "Samson" and "Sansón" are the translator's/drafter's
  choice, not a source-fidelity issue — the character, role, and identity are never in
  doubt in either spelling, and no other character is named "Samson" or "Sansón," so there
  is no ambiguity or plot confusion.
- **Assessment: worth a fix, but as a copy-consistency issue, not a fidelity defect.** A
  named character's name changing spelling (and gaining an accent mark that isn't in the
  English source at all) mid-book, at a chapter boundary that has nothing to do with the
  character, reads as sloppy in a finished reading edition — readers will likely notice.
  Recommend normalizing to one spelling across the whole book (not just this batch — check
  whether "Samson"/"Sansón" appears in adjacent batches E and G too, since the switch may
  cross batch boundaries) before this text ships. This is a five-minute mechanical
  find-and-replace fix, not a re-translation issue, and it does not block accepting the
  batch's fidelity — it's a follow-up polish item.

## One thing flagged in the task brief that does not match the actual text

The task description characterizes this batch as "spans end of Part I / start of Part II
... and reportedly the lion episode." Neither is accurate for what's actually in these
files:
- All 11 chapters here are chapter titles "Part 2, Chapter 4" through "Part 2, Chapter 14"
  — i.e., global chapters 56–66 map entirely inside Part II (consistent with Part I running
  52 chapters, so Part II ch. 4 = global 56). There is no Part I material in this batch.
- The famous lion-taming episode (Don Quixote and the lion-keeper's cart) is Part II,
  Chapter 17 (global ch. 69) — several chapters past the end of this batch. It does not
  appear anywhere in these 11 chapters. The drafter's own notes correctly describe "Don
  Quixote's lion-taming exploit's aftermath ... tail end of prior batch bleeding into ch.
  58's start" — but I found no lion material at all in ch. 58 or anywhere else in this
  batch; ch. 58 opens directly with the niece/housekeeper scene, no lion aftermath content
  present. Worth double-checking against batch E's tail end and the drafter's claim there,
  but it does not affect batch F's own fidelity — there's simply no lion content in these
  files to have gotten wrong.

This is a briefing/description inaccuracy, not a translation defect — flagging it so it
doesn't get treated as confirmed fact in future batch reviews or in the project's running
record of what's been covered.

## Summary

- `dq-batchF-corrected.json` == `dq-batchF-current-modern-en.json`: **confirmed identical**.
- Paragraph counts: **all 11 chapters match source exactly**.
- Content fidelity: **no defects found** across a full independent paragraph-by-paragraph
  read, including every digression, sonnet, and meta-commentary passage named in the task
  and several more checked opportunistically.
- Samson/Sansón spelling: **confirmed real**, assessed as a harmless-to-meaning but
  ship-blocking-for-polish consistency issue — recommend a mechanical normalization pass
  (check neighboring batches too) before this text goes live, but it does not represent a
  content-fidelity failure and does not change the accept verdict for this review's scope.
- Task-brief inaccuracy noted (no Part I content, no lion episode in this batch) for the
  record.

**Recommendation: accept as-is for fidelity purposes.** Route the Samson/Sansón spelling
to a follow-up normalization pass (batch-wide, not just this file) before publication.
