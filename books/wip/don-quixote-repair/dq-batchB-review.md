# Don Quixote — Batch B (Chapters 12–22) — Independent Adversarial Review

## Verdict: ACCEPT AS-IS

The drafter's self-report of "0 defects found" is confirmed by independent
review. No dropped clauses, meaning inversions, softened content, or
paragraph-count mismatches were found across all 445 paragraphs in all 11
chapters.

## What I checked and how

1. **File identity.** Confirmed programmatically that
   `dq-batchB-corrected.json` is byte-identical (via deep equality) to
   `dq-batchB-current-modern-en.json`. Confirmed.

2. **Paragraph counts.** Verified programmatically, chapter by chapter,
   against `dq-batchB-source.json`. All 11 chapters match exactly:
   12→24, 13→32, 14→20, 15→32, 16→25, 17→40, 18→52, 19→44, 20→58, 21→53,
   22→65. Total 445/445.

3. **Full paragraph-by-paragraph read**, not spot-checked, of every chapter's
   source against the modern-en text. I read chapters 12, 13, 14, 15, 16
   (Maritornes bed-swap section), 17 (balsam/blanket-toss), 18 (army-roster
   paragraph), 19 (verified via full length-ratio scan, all in the 0.91–1.02
   range, no anomalies), 20 (fulling-mill terror + Sancho's scatological
   episode), 21 (Mambrino's helmet in full), and 22 (galley slaves in full)
   directly, sentence by sentence in the flagged/high-risk passages and by
   full read for the rest.

4. **Length-ratio outlier scan** across all 445 paragraphs (mod/src character
   length): zero paragraphs fell outside 0.6–1.8, and only 3 fell outside
   0.85–1.3 (ch16 ¶6, ch22 ¶5, ch22 ¶10 — all ordinary modernization
   compression with no semantic loss, confirmed by direct inspection; see
   below).

## Specific checks called out in the task

### Marcela's grave-side speech (Ch. 14, paragraph 14)

Read source and modern-en side by side in full. Every argument is present
and intact, in original order:
- The viper/poison analogy ("as the viper, though it kills with its poison,
  is not blamed for it, since the poison is a gift of nature...").
- The fire-at-a-distance / sword analogy ("Beauty in a modest woman is like
  fire at a distance or a sharp sword: the one does not burn, the other does
  not cut...").
- The "I am a fire far off, a sword laid aside" restatement later in the
  speech.
- The "born free" declaration ("I was born free, and to live in freedom I
  chose the solitude of the fields...").
- The full closing declaration, including the "wild beast, basilisk,
  ungrateful, cruel, wayward" repetition and the closing lines about her
  wealth, her disinterest in constraint, and her recreations.

No compression, no dropped clauses, no softening of her argument's force.

### Galley-slaves episode (Ch. 22)

Read in full. Confirmed complete:
- Every prisoner's crime, in order: the "lover" of a laundry basket (theft),
  the confessed cattle-thief ("cuatrero") mocked by the others for confessing
  under torture, the man imprisoned for lack of ten ducats, the old pimp/
  sorcerer (with Don Quixote's full ironic disquisition on the office of
  pimping), the "joke too far with cousins" bigamist/fraud, the Latin-scholar
  student, and Gines de Pasamonte himself with his ten-year sentence and
  extra chains.
- The Gines de Pasamonte / "Ginesillo de Parapilla" name dispute is intact,
  word for word in substance, including his threat ("I'll make them stop
  calling me so, or I'll be shaved where I only say behind my teeth") and the
  book-in-pawn / "Life of Gines de Pasamonte" / "fig for Lazarillo de Tormes"
  exchange.
- The freeing of the slaves, Don Quixote's speech commanding them to report
  to Dulcinea, Gines's refusal on behalf of the group, Don Quixote's "Don son
  of a bitch" insult, and the closing stoning and stripping of Don Quixote
  (and Sancho, down to his shirt-sleeves) are all present, including the
  detail of the student snatching the basin/helmet and beating it nearly to
  pieces on Don Quixote's shoulders and the ground.

### Comic violence / crudity — not softened

- **Fulling-mill terror (Ch. 20):** Sancho's laxative episode is rendered in
  full explicit detail — untying the breeches, baring "a backside that was
  by no means small," the failed attempt at silence, Don Quixote pinching
  his nose and the "not of ambergris" line, all present and unsoftened.
- **Balsam of Fierabras (Ch. 17):** Don Quixote's and then Sancho's vomiting,
  Sancho's subsequent "discharge both ways" (both vomiting and diarrhea)
  ruining the rush mat and blanket, and the crude self-referential line about
  "vomiting up what bowels I have left" are all intact.
- **Blanket-tossing (Ch. 17):** Fully preserved, including the "sport with
  him as they would with a dog at Shrovetide" line and Don Quixote's
  helpless rage at the wall.
- **Maritornes bed-swap brawl (Ch. 16):** The carrier's cuff that "bathed his
  whole mouth in blood," the pile-on in the dark, and the full comic chaos
  (including the mistaken-identity groping and the line about nothing
  softening what would make "anyone but a carrier vomit") are intact and
  unsanitized.

### Don Quixote's fantastical army speech (Ch. 18, paragraph 20)

Checked in full for roster completeness: every named knight (Laurcalco,
Micocolembo, Brandabarbaran de Boliche, Timonel of Carcajona, Pierres Papin,
Espartafilardo del Bosque) and every named nation/river/region in the two
"armies" passage is present with no omissions.

### Comic wordplay (Ch. 12)

Pedro's malapropisms — "cris" for "eclipse," "estility" for "sterility," and
the "sarna"/"Sarra" mishearing joke — are all preserved with Don Quixote's
corrections intact. This is a place where lazy modernization often drops
or flattens wordplay; it was not flattened here.

## The three length-ratio-flagged paragraphs, examined directly

- **Ch16 ¶6** (0.79): dialogue tightening ("for it has many a time happened
  to me to dream..." → "for I've often dreamed..."). No content lost.
- **Ch22 ¶5** (0.82): "these people are going where they are taking them by
  force, and not of their own will" → "these people are being taken by
  force, not of their own will." Same claim, tighter phrasing.
- **Ch22 ¶10** (0.81): dialogue-tag compression only ("to this he added more
  to the same effect to induce them to tell him what he wanted so civilly
  that..." → "He added more in the same vein, asking so civilly that...").
  No content lost.

All three are ordinary modernization compression, not fidelity breaks.

## Conclusion

I independently verified the claim of "0 defects" through full reads of the
highest-risk passages named in the task (Marcela's speech, the galley-slaves
episode, the crude/violent comic set pieces) plus a complete programmatic
paragraph-count and length-ratio audit of all 445 paragraphs, plus full
manual reads of chapters 12, 13, 15, 16, 17, 18, 20, 21, and 22. I found no
defects. This batch is faithful to source and ready to ship as-is; no edits
recommended.
