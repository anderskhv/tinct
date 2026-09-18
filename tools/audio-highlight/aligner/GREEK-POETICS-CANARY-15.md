# Canary #15 — Poetics Greek transliteration (no code)

`poetics/modern-en/22` failed under helper v5 with Greek-transliteration
paragraphs around **0.51** and **0.83**. Typical lines from chapter 22:

- `Euripides substitutes thoinatai ('feasts on') for esthiei ('feeds on').`
- `nyn de m' eōn oligos te kai outidanos kai aeikēs`
- `diphron aeikelion katatheis oligēn te trapesan`
- `ēïones boōōsin, ēïones krazousin`
- `dōmatōn apo instead of apo dōmatōn`

## What failed

This is an **ASR vs expected-script mismatch**, not heading/cue noise. The
edition prints Greek in Latin transliteration (with macrons and diaeresis).
The aligner asks English `small.en` Whisper to hear those tokens as spelled.
Whisper emits English-ish approximations or skips them. The missed tokens are
real words in the edition, not unspoken labels.

## Is a safe normalizer possible without lowering 0.85?

Not as a heading-style strip. Dropping Greek-looking tokens from the
denominator would:

- invent an English-only “spoken” script the edition does not have
- hide genuine misses on mixed English/Greek sentences
- still fail lines that are *mostly* transliteration unless the gate moves

A mapping table (`thoinatai` ↔ some English gloss) would be a new semantic
rewrite, not acoustic equivalence like `prepar'd` ↔ `prepared`.

## Recommendation

Hold GPU on Poetics ch22. Do not add a Greek strip. Do not invent English
equivalence. Do not lower 0.85. Revisit only with a script-aware recogniser
or a separately recorded English-only edition of those paragraphs.
