# Leviathan Batch C — Content Fidelity Review Notes

**Scope:** Chapters 21–30 (source `number` fields 21–30): Of Dominion Paternal and
Despotic; Of the Liberty of Subjects; Of Systems Subject, Political, and Private; Of
the Public Ministers of Sovereign Power; Of the Nutrition, and Procreation of a
Commonwealth; Of Counsel; Of Civil Laws; Of Crimes, Excuses, and Extenuations; Of
Punishments, and Rewards; Of Those Things That Weaken, or Tend to the Dissolution of
a Commonwealth.

**Method:** Every paragraph of `lev-batchC-current-modern-en.json` (283 paragraphs
total across 10 chapters) was read against its corresponding paragraph in
`lev-batchC-source.json`, checking for dropped/invented clauses, negation or
conditional inversions, silently compressed argument steps, and distortions of
Hobbes's technical vocabulary or citations. A programmatic length-ratio pass
(flagging any modern paragraph under 55% of the source paragraph's character
length, for source paragraphs over 60 characters) was also run as a check against
silent compression; it returned zero hits, corroborating the manual read.

**Overall verdict:** This batch is an unusually faithful modernization. Across all
283 paragraphs — including the dense syllogistic chains of chapter 21 ("Of the
Liberty of Subjects," Hobbes's argument that liberty and necessity are consistent,
the enumerated liberties a subject retains, the Jephthah/Uriah/Athenian-ostracism
examples) and the long enumerated lists in chapters 26–29 — every clause, premise,
example, and qualifying condition in the source is present in the modern rendering.
No meaning inversions, no dropped negations, no flipped conditionals, and no
silently skipped premises were found anywhere in the batch. The register is
consistently modern-English while preserving Hobbes's argumentative structure
(numbered points, named examples, cross-chapter references) intact.

## Per-chapter verdicts

- **Ch. 21 (Dominion Paternal and Despotic):** Faithful. One defect found (see
  below) — two Bible citation numbers were altered from what the source quotes.
- **Ch. 22 (Of the Liberty of Subjects):** Faithful. Checked with particular care
  given its philosophical importance (definitions of liberty, fear-and-liberty,
  liberty-and-necessity, the enumerated liberties a subject retains against the
  sovereign, the Jephthah/Uriah/Athens ostracism examples, the soldier-substitution
  and press-money passages). No defects found.
- **Ch. 23 (Of Systems Subject, Political, and Private):** Faithful. No defects
  found.
- **Ch. 24 (Of the Public Ministers of Sovereign Power):** Faithful. No defects
  found.
- **Ch. 25 (Of the Nutrition, and Procreation of a Commonwealth):** Faithful. No
  defects found.
- **Ch. 26 (Of Counsel):** Faithful. No defects found.
- **Ch. 27 (Of Civil Laws):** Faithful, including the long enumerated list (points
  1–8) and the extended flight/forfeiture case study. No defects found.
- **Ch. 28 (Of Crimes, Excuses, and Extenuations):** Faithful, including the full
  enumerated list of crime-aggravating factors (paras 42–52) and the three sources
  of criminal error. No defects found.
- **Ch. 29 (Of Punishments, and Rewards):** Faithful, including the full ten-point
  enumeration of what does/does not count as punishment. No defects found.
- **Ch. 30 (Of Those Things That Weaken, or Tend to the Dissolution of a
  Commonwealth):** Faithful, including all six named seditious doctrines and the
  extended disease metaphors (ague, pleurisy, epilepsy, bulimia). No defects found.

## Defects found and fixed

### 1. Chapter 21 (array index 0, source `number`=21), paragraph index 15 — Bible citation numbers altered

This is the long paragraph beginning "Let us now consider what the Scripture
teacheth in the same point..." — Hobbes's catalogue of scriptural support for
absolute sovereign obedience.

**Defect A — Colossians citation swapped:**

- Source text: `St. Paul saith, (Coll. 3. 20) "Servants obey your masters in All
  things," and, (Verse. 22) "Children obey your Parents in All things."`
  (i.e., source cites **Colossians 3:20** for the Servants quote and **verse 22**
  for the Children quote.)
- Defective modern text: `St Paul says (Colossians 3:22): 'Servants, obey your
  masters in all things,' and (verse 20): 'Children, obey your parents in all
  things.'` — the verse numbers were swapped relative to the locked source (note:
  this swap happens to match the real Bible's actual verse numbering, but the task
  is fidelity to the source text as given, not correction of Hobbes's/the source's
  citation).
- Fix applied: restored to `St Paul says (Colossians 3:20): 'Servants, obey your
  masters in all things,' and (verse 22): 'Children, obey your parents in all
  things.'` — matching the source's citation exactly.

**Defect B — Titus citation altered:**

- Source text: `And St. Paul, (Tit. 3. 2) "Warn them that they subject themselves to
  Princes, and to those that are in Authority, & obey them."` (source cites
  **Titus 3:2**.)
- Defective modern text: `And St Paul (Titus 3:1): 'Warn them that they subject
  themselves to princes, and to those that are in authority, and obey them.'` — the
  verse number was changed from the source's 3:2 to 3:1 (again, this happens to
  match the real Bible's actual verse; the source's own citation was not
  reproduced).
- Fix applied: restored to `And St Paul (Titus 3:2): 'Warn them that they subject
  themselves to princes, and to those that are in authority, and obey them.'`

No other content-fidelity defects (dropped clauses, inversions, compressions, or
terminological distortions) were found anywhere else in the batch.

## Verification

- `lev-batchC-corrected.json` contains 10 chapters, 283 total paragraphs.
- Paragraph counts and `number` fields verified programmatically to match
  `lev-batchC-source.json` exactly, chapter by chapter (see verification script run
  during this review — all 10 chapters matched).
- `lev-batchC-current-modern-en.json` was edited in place with the same two fixes
  and is identical in content to `lev-batchC-corrected.json`.
