# Don Quixote — Batch L Fidelity Repair Notes

Scope: `dq-batchL-current-modern-en.json` (Part 2, Chapters 70–74 / novel
chapters 122–126: the final chapters — return home, illness, renunciation of
chivalry, and death), checked paragraph-by-paragraph against the locked
`dq-batchL-source.json`.

## Method

- Read every paragraph of all 5 chapters in both files side by side.
- Checked for dropped/invented clauses, meaning inversions, compression
  (especially in the death scene, ch. 126), factual/plot distortions, and any
  other fidelity break.
- Cross-checked with a programmatic word-count-ratio scan (source words vs.
  modern-en words per paragraph, flagging anything under 75%) to catch
  compression that a close read might miss. **No paragraph fell below 75%** —
  confirms no systematic trimming anywhere in the batch.
- Paragraph count verified programmatically to match source exactly in every
  chapter before and after fixes (25 / 26 / 25 / 22 / 25 — unchanged).

## Overall verdict

This batch is **unusually faithful**. Unlike a typical "passes the mechanical
gate but has undetected content drift" case, this modern-en rendering tracks
the source closely paragraph by paragraph, including in the emotional climax
of the novel (Don Quixote's final lucid renunciation speech in ch. 126,
paras 4–6, and the death paragraph, ch. 126 para 18) — every clause,
enumerated item, proverb, and epithet list survives intact (e.g., the full
7-item list of Barcelona's epithets in ch. 124 para 17; the full proverb
chain in ch. 123 para 25; all four pastoral names in ch. 125 para 13; all six
shepherdess names in ch. 125 para 17). Poetic passages (the two brief verse
insertions and both epitaphs) are legitimate paraphrase-for-register
translations that preserve full content, not cuts.

## Per-chapter verdict

- **Chapter 122 (Part 2, Ch. 70)** — PASS. No defects found.
- **Chapter 123 (Part 2, Ch. 71)** — PASS. No defects found (numeric
  calculation of Sancho's lash payment, all four bargaining proverbs, and the
  Orbaneja/Mauleon anecdotes all verified intact).
- **Chapter 124 (Part 2, Ch. 72)** — PASS. No defects found (Don Álvaro Tarfe
  scene, Barcelona epithet list, and the final lash tally of 3,029 all
  verified intact).
- **Chapter 125 (Part 2, Ch. 73)** — PASS. No defects found (omen sequence,
  Teresa/Sanchica homecoming, and the full pastoral-name and shepherdess-name
  lists verified intact).
- **Chapter 126 (Part 2, Ch. 74)** — PASS, with **2 minor defects found and
  fixed** (see below). The death scene itself (paras 17–18) and the full
  renunciation speech (paras 4–6) were verified clause-by-clause and are
  completely faithful — nothing trimmed, no inversions.

## Defects found and fixed

### Defect 1 — Object substitution (ch. 126, paragraph index 22)

Cide Hamete's address to his pen changes what the pen is resting on.

- **Source text:** "Rest here, hung up by this brass wire, upon this shelf,
  O my pen; whether of skilful make or clumsy cut I know not..."
- **Defective text:** "Rest here, hung from this rack by this brass wire, O
  my pen—whether finely cut or clumsily trimmed, I cannot say..."
- **Fix applied:** Restored "shelf" in place of the invented "rack": "Rest
  here, hung up by this brass wire, upon this shelf, O my pen—whether finely
  cut or clumsily trimmed, I cannot say..."

### Defect 2 — Tone/meaning softening (ch. 126, paragraph index 17)

In the sentence describing the household's behavior while Don Quixote lies
dying (an intentionally cynical, ironic list — eating, drinking, and
indulging while the master fades), "enjoyed himself" (hedonistic indulgence,
matching the irony of the passage) was softened to a more sympathetic
"kept his spirits up" (coping), altering the tone of this deliberately
mordant aside.

- **Source text:** "...but still the niece ate and the housekeeper drank and
  Sancho Panza enjoyed himself; for inheriting property wipes out or
  softens down in the heir the feeling of grief the dead man might be
  expected to leave behind him."
- **Defective text:** "...and yet the niece went on eating, the housekeeper
  drank, and Sancho Panza kept his spirits up—for inheriting something
  erases, or at least softens, in the heir the grief the dead man might
  reasonably be expected to leave behind."
- **Fix applied:** Restored "enjoyed himself" in place of "kept his spirits
  up": "...and yet the niece went on eating, the housekeeper drank, and
  Sancho Panza enjoyed himself—for inheriting something erases, or at least
  softens..."

## Files

- Corrected output: `dq-batchL-corrected.json` (same 5-chapter array shape,
  paragraph counts unchanged, verified programmatically against source).
- Source of truth used for comparison: `dq-batchL-source.json` (untouched).
- Original file under review, `dq-batchL-current-modern-en.json`, left
  untouched per task instructions.
