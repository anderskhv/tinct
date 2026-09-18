# War and Peace — Batch F Independent Review (Chapters 126–146, excl. 131)

Reviewer: independent adversarial pass. Drafter's verdict (Sonnet, 0/20 defective) was **not**
assumed correct; every paragraph was re-read from scratch against the Maude source.

## 1. Confirmation: corrected == current-modern-en

Confirmed. The drafter made no changes.

```
md5  full-batchF-corrected.json         7f98460aea4e6731b6c0887c3b8b0593
md5  full-batchF-current-modern-en.json 7f98460aea4e6731b6c0887c3b8b0593
```

Byte-identical (not merely content-identical); a normalized `json.tool` diff is also empty.
Paragraph counts match source 20/20 (695 paragraphs total), independently re-verified.

## 2. Method

Not a sampled read. Four passes:

1. **Byte/structural** — md5 + normalized JSON diff corrected vs current; per-chapter and
   per-paragraph count/alignment check against source.
2. **Automated anomaly screen** (independent of the drafter's tooling):
   - word-count ratio per paragraph, flagging anything outside 0.78–1.30 (8 hits, all short
     paragraphs, all inspected — all benign);
   - numeral and number-word set diff per paragraph (digits + spelled numbers), 43 hits, all
     inspected;
   - proper-noun set diff per paragraph, accent-folded so that the ~600 pure
     de-accenting changes drop out and only real name changes surface (~105 hits, all
     inspected);
   - scan for residual diacritics, alternate transliterations (Andrei/Marya/Nikolai/
     Bolkonski), and placeholder tokens (TODO/TK/lorem/XXX) — **zero hits**.
3. **Full manual close-read** — all 695 paragraphs read side-by-side with source, chapter by
   chapter, looking specifically for dropped clauses, invented content, meaning inversion,
   factual/plot distortion, and name inconsistency.
4. **Name-convention audit** — Andrew, Helene, Nicholas, Mary, Bolkonsky, Rostov, Natasha,
   Sonya, Petya, Boris, Vera, Berg, Daniel, "Uncle," Ilagin, Anisya Fedorovna, Pelageya
   Danilovna, Melyukova, Dimmler, Denisov, Dolokhov. All conform; no accents anywhere;
   Kutuzov does not appear in this batch.

## 3. Findings

**Headline: the drafter's substantive verdict holds.** I found no omitted paragraph, no
invented content, no meaning inversion, no plot or factual distortion, no placeholder text,
and no character-name inconsistency with project convention. The batch does not need a
correction round on fidelity grounds.

I did find a set of **small blemishes the first pass did not report**. None is a fidelity
defect of the kind that triggers a correction round; all are logged here so the decision is
made with eyes open rather than on a bare "zero defects" claim.

### 3a. Orphan footnotes (4 instances) — cosmetic, reader-facing, the most worth fixing

The candidate translates the foreign phrase inline but leaves the source's standalone
footnote paragraph in place, so the reader gets the same sentence twice with a dangling `*`
and no marker anywhere in the body.

| Ch. | Para | Candidate body | Orphan footnote paragraph |
|---|---|---|---|
| 126 | P10 / P11 | "...what it means to be a man." | `* To be a man.` |
| 127 | P18 / P19 | "Cousinhood is a dangerous neighborhood, don't you think?" | `* "Cousinhood is a dangerous neighborhood."` |
| 139 | P45 / P46 | "...which the shawl dance should..." | `* The French shawl dance.` |
| 146 | P4 / P5 | "He's charming; he has no sex," they said of him. | `* "He is charming; he has no sex."` |

Ch. 146 is the worst of the four — the footnote is a near-verbatim repeat of the line
immediately above it. This is very likely an edition-wide pattern rather than a batch-F
problem, so it should be handled as its own sweep, not folded into a batch-F correction.

### 3b. Proper-noun distortions (2) — low severity

- **Ch. 136, P1 and P20 — horse's name misspelled.** Source `Viflyánka` → candidate
  `Viflynanka` (extra `n`, letters transposed). Consistent across both occurrences, so it
  reads as a deliberate spelling rather than a typo, but it is not the source's name.
  Strictly a name distortion; trivially fixable if a correction round happens for other
  reasons.
- **Ch. 138, P31 — patronymic altered.** Source `Michael Nikanórovich` → candidate
  `Michael Nikanorych`. The colloquial contraction is not in the source. Harmless in
  isolation; "Uncle" is not named this way elsewhere in the batch, so there is no internal
  inconsistency.

### 3c. Small factual softenings (3) — low severity, defensible as modernization

- **Ch. 141, P0 — temperature unit dropped.** Source: "the calm frost of twenty degrees
  Réaumur." Candidate: "the crisp frost of twenty degrees below." 20°R of frost is about
  −25°C; "twenty degrees below" reads as −20° in whatever scale the reader assumes, so the
  number survives but the quantity does not. Either restore the unit or convert
  ("about twenty-five below").
- **Ch. 133, P6 — physics simile flattened.** Source: "the law by which the force of
  attraction is in inverse proportion to the square of the distance." Candidate:
  "the law by which gravitational force increases as the distance decreases." Direction is
  right, Tolstoy's specific inverse-square joke is gone. Simplification, not error.
- **Ch. 146, P10 — "race" → "upbringing."** Source: "brought by force of circumstances,
  society, and race." An archaic sense of "race" (breeding/stock); the substitution changes
  the term but not Pierre's point. Arguably the right call for a modern-English edition.

### 3d. Nuance losses (3) — low severity, noted not charged

- **Ch. 144, P2–P3 — thou/you flattened.** Source has Nicholas switching to the intimate
  "Sónya, is it well with thee?" / "And with thee?"; candidate renders both as "you." The
  switch is the point of the exchange — it is the grammatical marker that something has
  changed between them. Note that Ch. 130 P0 and Ch. 140 P11 both *do* preserve the
  thou/you distinction where the narrator explains it, so the edition is inconsistent with
  itself here rather than uniformly modernized.
- **Ch. 144, P42 — small causal shift.** Source: "without replying to Sónya's words of
  comfort." Candidate: "without waiting for Sonya's comforting words." Source has Sonya
  speak and Natasha not answer; candidate implies Sonya never got to speak.
- **Ch. 129, P2 / P50 — broken callback.** Source calls Natasha a "chit of a girl" in the old
  prince's speech (P2) and Natasha quotes the phrase back in P50. Candidate renders P2 as
  "slip of a girl" and P50 as "'little girl,'" so the quotation no longer quotes anything.

### 3e. Per-chapter result

All 20 chapters: content, plot, causality, character action, dialogue attribution, and
imagery preserved. Differences are stylistic modernization (contractions, sentence
splitting, de-accenting, vocabulary). Chapters carrying a blemish from §3a–3d are marked.

| Ch. | Verdict | Note |
|---|---|---|
| 126 | Sound | orphan footnote P11 |
| 127 | Sound | orphan footnote P19 |
| 128 | Sound | — |
| 129 | Sound | broken "chit of a girl" callback |
| 130 | Sound | — |
| 132 | Sound | — |
| 133 | Sound | inverse-square simile flattened |
| 134 | Sound | — |
| 135 | Sound | — |
| 136 | Sound | horse name `Viflynanka` |
| 137 | Sound | — |
| 138 | Sound | `Nikanorych` |
| 139 | Sound | orphan footnote P46 |
| 140 | Sound | — |
| 141 | Sound | Réaumur unit dropped |
| 142 | Sound | "A Negro" → "A Black man" (deliberate, meaning preserved) |
| 143 | Sound | — |
| 144 | Sound | thou/you flattened; P42 causal shift |
| 145 | Sound | P3 sentence garbled: "the decisive word whose expression on his face his mother was awaiting with terror" — syntax broken, not a meaning error |
| 146 | Sound | orphan footnote P5 (near-verbatim repeat); "race" → "upbringing" |

## 4. Verdict

**The batch is genuinely clean on fidelity.** I went in expecting to break the 0/20 claim and
could not: no omissions, no inventions, no inversions, no plot or factual distortions, no
placeholders, no name-convention violations. The unusually clean result is real, and is
consistent with this territory being straightforward narrative prose (the hunt, Christmas
week, the mummers) with few dense expository passages of the kind that usually generate
defects.

**No correction round is required for batch F.** The 12 items in §3a–3d are all low severity
and none affects what a reader understands to have happened.

Recommended follow-ups, in priority order, none blocking:

1. **Orphan footnotes** — handle as an edition-wide sweep, not a batch-F fix. Ch. 146 P5 is
   the one a reader would actually notice.
2. **Ch. 136 P1/P20 `Viflynanka` → `Viflyanka`** and **Ch. 138 P31 `Nikanorych` →
   `Nikanorovich`** — two-token fixes, worth folding into any future edit of these files.
3. **Ch. 141 P0 Réaumur** — restore the unit or convert the value.
4. **Ch. 145 P3** — repair the garbled clause.
