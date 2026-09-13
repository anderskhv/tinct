# Odyssey Book 9 — frozen draft v1, for independent review

*Ulysses declares himself and begins his story — the Cicons, Lotophagi, and
Cyclopes.* 44 paragraphs, 5,800 words of Butler. Step 4 of the eight in
`../WORKFLOW.md`: the draft is frozen and stops here for a review it does not
do itself.

**`candidate-v1.json` sha256 `41f452ac577054aa820eba1cf1bb20cc24b382e6e3330b74af8c24f657c481fb`.**

## What is in this directory

| file | what it is |
|---|---|
| `candidate-v1.json` | the frozen draft. **Never edited** (D10); corrections go to `candidate-v2.json`. |
| `candidate-v1-readable.md` | the same text with paragraph IDs outside the prose |
| `source-book9.json` | the served `original-en` chapter 9, the text this is scored against |
| `checks-v1.md` | **every published figure, written by `scripts/checks.py`** — the only thing that computes them |
| `manifest.json` | packet coverage, and the `checks` block: the sha256 of `checks-v1.md`, of the candidate it was computed over, and all sixteen figures |
| `continuity.md` | the figures, the source rule, the decisions, the D16 repairs, the collision repairs and §H.1's compound register |
| `collisions.md` | **all 110 collision rows touching this Book, each with a disposition** |
| `review-instructions.md` | how to review it, and **four questions put explicitly** |
| `review-packets/` | 15 packets, three paragraphs each, source beside candidate with one paragraph of context either side |
| `source-verification.txt` | the output of the fourteenth source rule |

## The figures, on all 44 paragraphs

| | |
|---|---|
| Butler token retention | **0.92164** |
| **MOVE-GAP** (upper bound) / displaced runs (strict witness) | **0.01266 / 2** |
| sentences, source → candidate | 171 → 207 |
| raw splitting rate (D17) | +21.1% |
| sixty-word sentences | **16 → 0 (100% broken)** |
| semicolons, Butler → candidate (D19) | **54 → 24**, of which **24 kept + 0 added** |
| **dividing marks (D27)** | **71 → 41**, of which **41 kept + 0 added** |
| NORM RATE on Butler's pointing (D21) | +2.7% |
| **NORM RATE, D27, on Butler's pointing — the compared figure** | **+2.5%** |
| word ratio | 0.993 |
| declared gate exceptions | **none** |

**Read the last four rows together.** The raw +21.1% is thirty of Butler's own
dividing marks cashed for periods, which D27 prices at exactly zero, and **not
one of the 41 marks the candidate carries is its own** — on the semicolon, the
colon or the dash. The compared figure is **+2.5%**, and the two NORM RATEs
(guarded and unguarded) agree to the decimal, which is what it looks like when
a figure is not bought with pointing.

## What was done differently here

* **The source rule is the FOURTEENTH kind and it reads integers.** 44
  per-paragraph word counts, matched as a contiguous run against every
  paragraph PG prints between its own structural markers — prefaces, footnotes
  and appendix included. One occurrence. Only then does a clause read a
  character.
* **Its audit failed it once, and for the instructive reason**: the locating
  clause passed *for the wrong reason* (PG glues page numbers to words, and a
  glued number is one token either way), and the verifying clause caught it.
* **It says something about the other 23 chapters**: 22 locate uniquely, and
  the two that do not are exactly the two recorded divergences a word count
  can see. It locates chapter 4, whose divergence is a capital letter.
* **The collision check and the compound register ran BEFORE the freeze**, as
  `RESUME.md` asks, and it cost fifteen repairs in the draft — six of them
  from arrow B across paragraphs, one from arrow C — where a repair costs
  nothing instead of costing a successor. `continuity.md` §7.
* **The compound check raised a FALSE POSITIVE and the class is now declared**:
  attributive hyphenation (`an olive-wood handle` against `of green olive
  wood`) is a rule of English, not a compound with two settings.
  `continuity.md` §8.
* **Eight rows that Book 9's arrival opened in the ACCEPTED Books are ruled
  here**, rather than left as a backlog for a later worker.
