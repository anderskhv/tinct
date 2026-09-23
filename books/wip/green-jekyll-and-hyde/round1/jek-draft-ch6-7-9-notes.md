# Notes — Jekyll & Hyde modern-en, chapters 6, 7, 9

Rendered by hand, paragraph by paragraph, from `source.json` (chapters 6, 7, 9),
using candidate chapters 1-2 as the style reference (curly quotes, em dashes,
British spelling — "honour", "colour", "theatre" — American "Mr." with the
period). Output: `jek-draft-ch6-7-9.json`.

## Glosses added

None. No paragraph in chapters 6, 7, or 9 contains a reference (historical,
legal, mythological, or otherwise) that a first-time listener could not follow
from context, and none required a clarifying addition confirmable against a
reference work. All content is rendered as sentence-level modernization of the
existing text with no inserted explanatory material.

## Passages where source wording/structure was kept close on purpose

- **Ch. 6, all dialogue (paragraphs 3-9):** Utterson's and Lanyon's exchanges
  are already short, plain sentences ("He will not see me," "Nothing can be
  done, ask him yourself"). Only light modernization applied (contractions,
  "someday," "asked" for "inquired") — the terse, clipped register is
  Stevenson's own restraint/suspense effect during Lanyon's refusal scene and
  is deliberate characterization, not archaism, so it was preserved rather
  than expanded.
- **Ch. 6, paragraph 10 (Jekyll's letter):** kept "the chief of sinners... the
  chief of sufferers" repetition/parallelism exactly, since it is Jekyll's own
  deliberate rhetorical figure (confessional voice), not incidental period
  phrasing.
- **Ch. 7, paragraph 11 (the window scene):** rendered as a full modern
  rebuild of syntax ("succeeded by" -> "replaced by", "traversed" -> "made
  their way back") but the sequence of clauses and the beat-by-beat action
  (smile struck out, window thrust down, silence, thoroughfare, "answering
  horror in their eyes") is kept in the same order — this is the chapter's
  suspense payoff and reordering would blunt it.
- **Ch. 9, Jekyll's letter (paragraphs 2-8):** modernized period diction
  ("to-night" -> "tonight", "postpone" -> "put off", "misdirecting" ->
  "giving you the wrong directions") but kept the escalating, panicked,
  elaborate-confessional syntax and every hedge/qualification ("even if you
  were summoned to the bedside of an emperor," "not only... but because,"
  "fantastic as they must appear") since these are Jekyll's own rhetorical
  overreaching under distress — flattening the run-on, qualification-heavy
  sentences would erase his voice.
- **Ch. 9, paragraph 27 (Hyde's/Jekyll's "will you be wise" speech):** kept
  the triple rhetorical-question structure and the "richer nor wiser" /
  "riches of the soul" wordplay exactly, since the passage is explicitly
  about the specific choice Lanyon faces and the paired phrasing is the
  point.
- **Ch. 9, paragraph 32 (Lanyon's closing horror):** "turpitude" rendered as
  "corruption" (plain modern equivalent, same meaning: moral depravity) and
  "incredulous" rendered as "unconvinced" (same sense: he will die still not
  believing what he saw) — both are meaning-preserving modernizations, not
  softenings; nothing about Lanyon's despair, certainty of death, or refusal
  to believe was changed.
- **Ch. 9, "bull's eye" (paragraph 13):** kept as "bull's-eye" (a policeman's
  handheld lantern) rather than expanding into an explanatory gloss — the
  sentence itself makes the object's function clear ("advancing with his
  bull's-eye open"), so no listener-blocking obscurity remains.

## Fidelity checks performed

- Verified paragraph counts match source exactly: ch. 6 = 13, ch. 7 = 14,
  ch. 9 = 34 (see `build_ch6_7_9.py`, asserted against `source.json` counts).
- Verified no empty/whitespace-only paragraphs, valid JSON.
- Re-read every rendered paragraph against its source paragraph side by side
  (see `compare.txt` in this same scratchpad folder) for omissions, actor
  swaps, negation/causality/certainty changes, and dropped hedges/detail.
  No omissions found; all names (Sir Danvers, Poole, Guest, Cavendish Square,
  Dr. Denman, Hastie Lanyon, Carew), quantities (two months, a fortnight,
  two hours, six occurrences of "double"), and the "total failure!!!"
  annotation are preserved exactly as in the source.
- Chapter 10 paragraph-1 known decision note does not apply here (out of
  scope for this batch — chapters 6, 7, 9 only).
