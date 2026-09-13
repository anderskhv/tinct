# Odyssey Book 10 — frozen draft v1, for independent review

*Aeolus, the Laestrygones, Circe.* 49 paragraphs, 5,684 words of Butler.
Step 4 of the eight in `../WORKFLOW.md`: the draft is frozen and stops here
for a review it does not do itself.

**`candidate-v1.json` sha256 `eedb949e3a668acb03d3c52b2073c5b05125840ee509f79cb2db0ed9e864a038`.**

## What is in this directory

| file | what it is |
|---|---|
| `candidate-v1.json` | the frozen draft. **Never edited** (D10); corrections go to `candidate-v2.json`. |
| `candidate-v1-readable.md` | the same text with paragraph IDs outside the prose |
| `source-book10.json` | the served `original-en` chapter 10 — **PINNED**: `../scripts/pg_source.py` re-derives it from PG #1727 on every run, and the manifest records its sha256 and PG's (A11) |
| `checks-v1.md` | **every published figure, written by `../scripts/checks.py`** |
| `manifest.json` | packet coverage, and the `checks` block: the sha256 of `checks-v1.md`, of the candidate, **of the source and of PG #1727**, and every figure |
| `continuity.md` | the figures, the source rule, the decisions, the collision repairs and §H.1's compound register |
| `collisions.md` | **all 124 collision rows touching this Book, each with a disposition** |
| `review-instructions.md` | how to review it, and **four questions put explicitly** |
| `review-packets/` | 17 packets, three paragraphs each, source beside candidate with one paragraph of context either side |
| `source-verification.txt` | the output of the sixteenth source rule |

## The figures, on all 49 paragraphs

| | |
|---|---|
| Butler token retention | **0.93645** |
| **MOVE-GAP** (upper bound) / displaced runs (strict witness) | **0.00908 / 0** |
| sentences, source → candidate | 175 → 214 |
| raw splitting rate (D17) | +22.3% |
| sixty-word sentences | **12 → 2 (83% broken)** |
| semicolons, Butler → candidate (D19) | **44 → 11**, of which **11 kept + 0 added** |
| **dividing marks (D27)** | **60 → 26** |
| **of which, by MARK IDENTITY (D28)** | **26 kept + 0 class-changed + 0 added** |
| NORM RATE on Butler's pointing (D21) | +2.7% |
| **NORM RATE, D28, by mark identity — the compared figure** | **+2.1%** |
| word ratio | 0.99507 |
| declared gate exceptions | **one growth, and the compound check bought it** |

**Read the last five rows together, and note what this Book claims and what it
does not.** Book 9 published *"not one of the 41 marks the candidate carries
is its own"* and its round 1 showed the claim false on the colon: the census
asked whether Butler's mark in the span was a **member** of `{; : —}`, never
whether it was the **same** mark. **D28** asks the strict question, and this
Book's drafter refuses to write the file unless the answer is clean:

* `if added:   fail(...)` — a mark bought with a keystroke (D21);
* `if changed: fail(...)` — a mark improved rather than kept (D28).

**26 kept by identity, 0 class-changed, 0 added.** And note what is *not*
offered as evidence: round 1's R-8 showed that the two NORM RATEs agreeing to
the decimal rules out marks written from nothing and does **not** rule out
marks exchanged. The evidence here is the middle number being zero.

**MOVE-GAP 0.00908 with zero displaced runs** is the strongest movement figure
in the package after Book 4's.

## What was done differently here

* **The source rule is the SIXTEENTH kind and it reads three characters.**
  Every character that is not `.`, `?` or `!` is deleted — every letter,
  digit, capital, space, comma, semicolon, colon, dash and quotation mark. One
  symbol per sentence, 175 of them, occurring in PG's body exactly once.
* **Its verdicts are checkably different from its neighbours'.** Clause 1
  locates 23 of 24 chapters and fails on **chapter 3**, the B03-P038 splice,
  reporting **0 occurrences** rather than a pass; clause 3 then fails chapters
  1 and 4, whose divergences are a space and a capital that the locator cannot
  see. **21 verify, 3 fail, and the three are exactly the three chapters A7
  records** — with *which clause fires* saying which kind of divergence it is.
* **Its audit failed it twice**, and both are in the file: the control
  harness's own D18 clause (a) compared a list with itself, and clause 2
  resolved a paragraph boundary with `bounds.index()` when **eight** of PG's
  paragraphs contribute no terminator at all and the offsets are therefore not
  injective — which made chapter 4 fail for a reason that had nothing to do
  with chapter 4.
* **The collision check ran BEFORE the freeze and cost nine repairs**, every
  one of which restores Butler's own word or removes a word the draft
  introduced — **D29** applied at drafting. Six rows Book 10 opened in the
  accepted Books are ruled too, rather than left as a backlog.
* **The compound check fired twice and both were real**, and opening
  `drink-offering` to match five accepted Books added one word to a sentence
  Butler wrote at 53. That is the Book's one declaration, and it is declared
  rather than hidden by recasting Butler to protect a number.
* **D5 gains row 14, `Proserpine → Persephone`** — and adding it exposed that
  row 13, `Mars → Ares`, had been in the prose table since Book 8 and never in
  `checks.py`'s `NAME_MAP`. Book 8 was charged retention on thirteen tokens
  for obeying D5; republished 0.93862 → 0.94093 with no character of its
  accepted file changing.
