# Montaigne Batch I — Content Fidelity Repair Notes

Scope: chapters 89–99 (`mt-batchI-current-modern-en.json` checked paragraph-by-paragraph
against `mt-batchI-source.json`). All 765 paragraphs across the 11 chapters were read
side-by-side. Paragraph counts were confirmed programmatically to match the source
exactly, both before and after the fix (11/11 chapters, per-chapter counts identical:
11, 16, 35, 16, 34, 70, 71, 38, 48, 52, 374 — the last confirmed as 373 zero-based
paragraph indices, i.e. 374 total).

## Per-chapter verdicts

- **Ch. 89 — Defence of Seneca and Plutarch**: PASS. No defects found. Faithful on all
  names, citations (Dion, Tacitus, Bodin, Plutarch's Parallels), and argument structure.
- **Ch. 90 — The story of Spurina**: **1 defect found and fixed** (see below).
- **Ch. 91 — Observation on the means to carry on a war according to Julius Caesar**: PASS.
  No defects found. Numbers, names (Vercingetorix, Alesia, Bayezid/Tamerlane, etc.)
  and citations all check out.
- **Ch. 92 — Of three good women**: PASS. No defects found. Arria/Paetus and Seneca/Paulina
  narratives fully faithful, including the closing letter to Madame de Duras.
- **Ch. 93 — Of the most excellent men**: PASS. No defects found. Homer/Alexander/
  Epaminondas comparison intact, all citations and historical details faithful.
- **Ch. 94 — Of the resemblance of children to their fathers**: **1 defect found and fixed**
  (see below). Otherwise PASS — the long digression on medicine is faithful throughout,
  including numeric details (ages, dates, e.g. "182 years" correctly derived from "two
  hundred years, save eighteen").
- **Ch. 95 — Of profit and honesty**: PASS. No defects found.
- **Ch. 96 — Of repentance**: PASS. No defects found.
- **Ch. 97 — Of three commerces**: PASS. No defects found.
- **Ch. 98 — Of diversion**: PASS. No defects found.
- **Ch. 99 — Upon some verses of Virgil**: PASS. No defects found. This is the longest
  chapter in the batch (374 paragraphs) and covers frank sexual material throughout;
  the modern-English rendering does not soften, sanitize, or omit any of Montaigne's
  frank discussion, classical citations, or anecdotes (Messalina, the Amazons, Arria,
  jealousy, marriage customs of Calicut/Sarmatia/Pegu, etc.). All checked faithfully.

## Defects found and fixed

### Defect 1 — Chapter 90 ("The story of Spurina"), paragraph index 15 (0-based)

**Type:** Meaning inversion (swapped attribution).

**Source text (final sentence of the paragraph):**
> "...the well living of Scipio has a thousand fashions, that of Diogenes but one;
> **this as much excels the ordinary lives in innocence as the most accomplished
> excel them in utility and force.**"

Here "this" refers back to the immediately preceding item (Diogenes' single-mode,
ascetic life), and "the most accomplished" refers to Scipio's many-faceted life.
So: Diogenes' life excels ordinary lives in *innocence*; Scipio's life excels them
in *utility and force*.

**Defective modern-en text:**
> "Scipio's good living has a thousand variations, Diogenes' has only one; and
> **Scipio's life surpasses the ordinary ones in innocence as much as Diogenes'
> surpasses them in utility and force.**"

This reverses the attribution: it credits Scipio with the "innocence" superiority
and Diogenes with the "utility and force" superiority — exactly backwards from
Montaigne's point (Diogenes = ascetic single-mode life = innocence; Scipio = full,
multi-faceted life = utility/force/effectiveness in the world).

**Fix applied:**
> "...Scipio's good living has a thousand variations, Diogenes' has only one; and
> **Diogenes' life surpasses the ordinary ones in innocence as much as Scipio's
> surpasses them in utility and force.**"

### Defect 2 — Chapter 94 ("Of the resemblance of children to their fathers"), paragraph index 31 (0-based)

**Type:** Factual/medical distortion (wrong disease name).

**Source text:**
> "...he, whom from an ordinary cold they have thrown into a **double tertian-ague**,
> had but for them been in a continued fever."

**Defective modern-en text:**
> "The patient whom they have driven from an ordinary cold into a **double quartan
> fever** would have been in a continuous fever without them."

"Tertian" (a fever recurring every third day) was changed to "quartan" (recurring
every fourth day) — a different, specifically named medical condition in the
original. This is a factual distortion of a named clinical detail, not a stylistic
choice.

**Fix applied:**
> "The patient whom they have driven from an ordinary cold into a **double tertian
> fever** would have been in a continuous fever without them."

## Method

1. Extracted both JSON files' paragraphs into side-by-side SRC/CUR text files per
   chapter (`ch89.txt` … `ch99.txt`) for direct comparison.
2. Ran an automated length-ratio triage (flagging any paragraph pair whose character
   length ratio fell below 0.5 or above 1.6) — this flagged zero paragraphs across
   the batch, confirming the rendering is not compressing/expanding at a gross level,
   which meant defects had to be found by close reading rather than length heuristics.
3. Read every paragraph of every chapter in full, in parallel with the source,
   checking specifically for: dropped/invented clauses, meaning reversals, compressed
   passages, dropped citations/anecdotes, and factual/historical/name/number errors.
4. Applied the two fixes directly to `mt-batchI-current-modern-en.json`'s content,
   writing the result to `mt-batchI-corrected.json` (paragraph count preserved,
   verified programmatically against source for all 11 chapters).

No other paragraphs were altered. Register, tone, and all other content (including
frank passages on sex, death, and the body) were left as in the current modern-en
rendering, since they were faithful to source.
