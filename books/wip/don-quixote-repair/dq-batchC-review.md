# Don Quixote Batch C — Independent Adversarial Review

**Scope:** Chapters 23–33 (Part 1), 11 chapters, 412 paragraphs.
**Reviewer:** Independent second pass, not trusting the drafter's notes. Every
paragraph of `dq-batchC-current-modern-en.json` was read side by side against
`dq-batchC-source.json` in full (not spot-checked), via a generated
side-by-side dump covering all 11 chapters end to end.

## 1. File consistency

- `diff dq-batchC-corrected.json dq-batchC-current-modern-en.json` → **IDENTICAL**
  (confirmed independently with `diff`, not just trusted from the notes).

## 2. Paragraph counts vs. source

Verified programmatically (not just read from the notes file):

| Ch | Title | Source paras | Modern-en paras | Match |
|---|---|---|---|---|
| 23 | Sierra Morena / valise & goatherd's tale | 51 | 51 | OK |
| 24 | Continuation / Cardenio begins his story | 21 | 21 | OK |
| 25 | Penance / imitation of Beltenebros | 69 | 69 | OK |
| 26 | Refinements of penance / curate & barber's scheme | 32 | 32 | OK |
| 27 | Curate & barber disguise / Cardenio's full backstory | 31 | 31 | OK |
| 28 | Dorothea's story | 31 | 31 | OK |
| 29 | Extricating DQ / Micomicona ruse | 43 | 43 | OK |
| 30 | Dorothea's cleverness / Andrés / Dapple | 58 | 58 | OK |
| 31 | DQ & Sancho on Dulcinea | 49 | 49 | OK |
| 32 | At the inn / books of chivalry | 42 | 42 | OK |
| 33 | "Ill-Advised Curiosity" novella begins | 36 | 36 | OK |

All 11 chapters match source exactly. No merges, splits, drops, or invented
paragraphs found anywhere in the batch.

## 3. Full paragraph-by-paragraph read

I read every one of the 412 paragraphs against source, including the two
passages most likely to hide compression: Cardenio's full first-person
backstory (ch. 24 paras 11–12, resumed and completed in ch. 27 paras 13–29),
and the opening chapters of "The Ill-Advised Curiosity" novella (ch. 33,
paras 1–35, through Lothario's full diamond/ermine/glass-woman argument and
the embedded verse).

**Finding: no compression, no dropped clauses, no meaning inversions found.**
The rendering is sentence-for-sentence faithful throughout, including in the
longest, most rhetorically dense paragraphs (e.g., ch. 24 para 11, a single
~1,000-word paragraph of Cardenio's backstory — every clause, every
subordinate aside, every rhetorical apostrophe to Marius/Catiline/Sylla/
Ganelon/etc. is present in the modern-en text with nothing summarized).

## 4. Specific plot/factual details checked

All confirmed intact and correctly rendered, matching source:

- **Valise/notebook** (ch. 23 paras 10–16): shirts, gold crowns, the sonnet
  ("Or Love is lacking in intelligence..."), the rejected-lover letter — all
  present, sonnet text verbatim (as it must be, being a fixed verse
  translation already in English).
- **Mambrino's helmet / barber's basin** (ch. 25 paras 19–21): "clue"/"clew"
  wordplay preserved, Don Quixote's enchanters explanation intact.
- **The ring pledge** (ch. 28 para 26 / Dorothea's account): "he drew a rich
  ring off his finger and placed it upon mine" — present and correctly placed
  in the seduction/betrothal sequence.
- **Ginés stealing Dapple** (ch. 23 para 6 initial theft; ch. 30 paras 45–46
  recovery): both ends of the thread present, including Sancho's tirade
  ("Ginesillo, you thief...") and the reunion with Dapple.
- **Princess Micomicona ruse** (ch. 29 paras 8–41 setup, ch. 30 continuation):
  Dorothea's invented Tinacrio-the-Sapient backstory, the "Don Azote or Don
  Gigote" / "Osuna" continuity gags, the mole test — all present and correctly
  sequenced.
- **Diamond / ermine / glass-woman analogies** (ch. 33 para 14 and the
  embedded verse in paras 15–17): Lothario's full extended argument to
  Anselmo — diamond-and-hammer, ermine-and-mud, mirror-of-crystal, garden of
  roses, and the "Woman is a thing of glass" stanza — all present at full
  length with every step of the argument intact, not summarized.

## 5. Register: crude language, comic violence, satire

Checked specifically for softening — found none:

- Sancho's "whoreson wench" (ch. 25 para 44), "son of a bitch of a giant"
  (ch. 29 para 10), "whoreson scoundrel" (ch. 30 para 30) — all rendered with
  equivalent force, not euphemized.
- Comic violence preserved: Cardenio's stone-throwing and beating of Don
  Quixote, Sancho, and the goatherd (ch. 24 para 17); Don Quixote's two
  pike-thwacks that knock Sancho down (ch. 30 para 29); the barber's beard
  torn off by the kicking mule (ch. 29 paras 31–32); Andrés's second flogging
  (ch. 31 para 38).
- Maritornes's and the innkeeper's bawdy/naive literary tastes (ch. 32 paras
  6–14) rendered in full, including the innkeeper's daughter's remarkably
  frank "why not marry them? That's all they want" line — not toned down.

## 6. Other observations (not defects)

- Chapter titles are modernized from the source's all-caps declarative style
  to sentence case ("WHICH TREATS OF..." → "Which treats of...") — a
  consistent, deliberate stylistic choice across the whole batch, not an
  error.
- "clue"/"clew" archaic spelling wordplay in ch. 23 (Sancho's "clew" pun) is
  preserved verbatim from source rather than modernized — correct, since
  modernizing it would break the joke Cervantes/the translator is making.

## Verdict

**Accept as-is.**

Independent re-verification confirms the drafter's self-report. Across all
412 paragraphs of chapters 23–33, I found no content-fidelity defects: no
dropped clauses, no meaning inversions, no compression or summarization
(specifically checked in the two highest-risk passages — Cardenio's full
backstory and the opening of the interpolated novella), no factual/plot
distortions in any of the specifically flagged details (valise/notebook,
Mambrino's helmet, the ring pledge, Ginés/Dapple, the Micomicona ruse, the
diamond/ermine analogies), and no softening of crude language, comic
violence, or satire. Paragraph counts match source exactly in all 11
chapters. `dq-batchC-corrected.json` is confirmed byte-identical to
`dq-batchC-current-modern-en.json`. No edits are required for this batch.
