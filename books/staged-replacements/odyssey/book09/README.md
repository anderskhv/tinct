# Odyssey Book 9 — ACCEPTED at `candidate-v2.json`

*Ulysses declares himself and begins his story — the Cicons, Lotophagi, and
Cyclopes.* 44 paragraphs, 5,800 words of Butler. Step 8 of the eight in
`../WORKFLOW.md`: drafted, frozen, reviewed by a separate session, corrected
and accepted. The acceptance record is `ACCEPTANCE.md`.

| | |
|---|---|
| **accepted** | `candidate-v2.json`, sha256 `f762b7a33e3517af11fe6113908e16318fbe26ad30dc17e6534854b643d36485` |
| frozen draft | `candidate-v1.json`, sha256 `41f452ac577054aa820eba1cf1bb20cc24b382e6e3330b74af8c24f657c481fb` — **never edited** (D10) |
| round 1 | `review/findings-v1.md` — 7 substantive, 9 minor, 8 records, 3 optional, all 44 paragraphs ruled |
| built by | `../scripts/build_book09_v2.py`, the only thing that produces v2 |

## What is in this directory

| file | what it is |
|---|---|
| `candidate-v2.json` | **the accepted file** |
| `candidate-v1.json` | the frozen draft, kept for the record |
| `candidate-v{1,2}-readable.md` | the same text with paragraph IDs outside the prose |
| `source-book9.json` | the served `original-en` chapter 9 — **and it is now PINNED**: `../scripts/pg_source.py` re-derives it from PG #1727 and every manifest records its sha256 (A11) |
| `checks-v2.md` | **every published figure, written by `../scripts/checks.py`** |
| `manifest.json` | packet coverage, and the `checks` block: the sha256 of `checks-v2.md`, of the candidate, **of the source and of PG #1727**, and every figure |
| `continuity.md` | the figures, the source rule, the decisions, the D16 repairs, the collision repairs, §H.1's compound register |
| `collisions.md` | every collision row touching this Book, each with a disposition |
| `ACCEPTANCE.md` | what was corrected, what was declined, and why |
| `review/` | round 1: the findings, the fifteenth source rule, the recomputation, and the A11 attack |
| `review-instructions.md`, `review-packets/` | how it was reviewed, and the 15 packets |
| `source-verification.txt` | the output of the fourteenth source rule |

## The figures, on all 44 paragraphs, from `candidate-v2.json`

| | |
|---|---|
| Butler token retention | **0.92284** |
| **MOVE-GAP** (upper bound) / displaced runs (strict witness) | **0.01232 / 2** |
| sentences, source → candidate | 171 → 203 |
| raw splitting rate (D17) | +18.7% |
| sixty-word sentences | **16 → 1** — the one survivor is Butler's own 61-word sentence, restored by the flow read |
| semicolons, Butler → candidate (D19) | **54 → 26**, of which **26 kept + 0 added** |
| **dividing marks (D27)** | **71 → 45** |
| **of which, by MARK IDENTITY (D28)** | **43 kept + 2 class-changed + 0 added** |
| NORM RATE on Butler's pointing (D21) | +1.8% |
| NORM RATE, D27, on Butler's pointing | +2.5% |
| **NORM RATE, D28, by mark identity — the compared figure** | **+1.7%** |
| word ratio | 0.99103 |
| declared gate exceptions | **two growths, and both are Butler's own sentences handed back** |

**Read the last five rows together, and read them differently from how v1's
README asked you to.** v1 published *"not one of the 41 marks the candidate
carries is its own — on the semicolon, the colon or the dash"*, and
**substantive finding S-1 of round 1 showed that claim false on the colon**.
The census counted a mark as *kept* when Butler's mark in the span was any
member of `{; : —}`; it never asked whether it was the **same** mark. Two of
his colons had been cashed and two colons of the draft's own written over his
semicolons, and the class census read `: 7 → 7` and called the class
untouched. **D28 is the repair**, and the number it gives is +1.7%, not +2.5%.

Round 1 also observed that the two NORM RATEs agreeing to the decimal was
over-read as evidence (R-8): they agree because the *count* of Butler's marks
the candidate carries equals the count it carries at all, which rules out
marks written from nothing and does not rule out marks **exchanged**.

What the accepted file now says is narrower and true: **45 dividing marks, 43
of them the mark Butler wrote in that place, 2 of them a colon where he wrote
a semicolon — both introducing a list, both declared by paragraph — and not
one written where he pointed with nothing stronger than a comma.** The two
class changes are priced at zero, the same price as an addition, because on
the evidence of a count the two are the same event.

## What was done differently here

* **The source rule is the FOURTEENTH kind and it reads integers.** 44
  per-paragraph word counts, matched as a contiguous run against every
  paragraph PG prints between its own structural markers — prefaces, footnotes
  and appendix included. One occurrence. Only then does a clause read a
  character. Round 1 added a **fifteenth**, driven by Butler's own Preface,
  which reads two characters and nothing else.
* **Its audit failed it once, and for the instructive reason**: the locating
  clause passed *for the wrong reason*. Records finding R-4 corrects what the
  reason was — PG's inline numerals are **footnote reference anchors**, not
  page numbers, and they are an ordered, checkable stream, 1 to 187, strictly
  increasing. The package already used them and now asserts them:
  `pg_source.extract_books()` refuses to run if that stream is broken.
* **The collision check and the compound register ran BEFORE the freeze**, and
  it cost fifteen repairs in the draft — where a repair costs nothing instead
  of costing a successor. `continuity.md` §7. Round 1 found **six more that
  the check could not see**, all on words under arrow B's rarity gate, and
  they are corrected in v2.
* **The rule that came out of those fifteen**: eleven restore Butler's own
  word verbatim, two keep his phrasing, two are forced, and none invents a
  paraphrase. **A repair restores; it does not paraphrase.** `../GLOSSARY.md`
  D29.
* **The compound check's false positive is gone, and not by exemption.**
  Attributive hyphenation (`an olive-wood handle` against `of green olive
  wood`) is a rule of English; `compound_drift()` is **position-aware** now
  and the row never forms. The exemption it used to need was removed, and
  `len(NOT_COMPOUNDS) <= 2` is asserted so the third one fails the check
  rather than being written. `continuity.md` §8.
* **Nothing pinned Butler, and now something does.** Round 1's A11 rewrote
  twelve of his full stops and moved this Book's published rate nine points
  with every instrument exiting 0. `../scripts/pg_source.py` and clause (b4).
