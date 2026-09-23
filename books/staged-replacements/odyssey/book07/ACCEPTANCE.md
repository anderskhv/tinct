# Odyssey Book 7 — ACCEPTED

**Accepted file:** `book07/candidate-v2.json`
**sha256:** `e79eb82b5ce6051dc3c61ca39c4480406cf0e2a106c0d53f5182fafe1d3163ac`
**Source:** `book07/source-book7.json`, the served `original-en` chapter 7
(Samuel Butler 1900, PG #1727), 29 paragraphs, source verified twice by two
unlike rules (`scripts/verify_source_book7.py`, the **tenth** kind;
`book07/review/verify_source_book7_review.py`, the **eleventh**).
**Basis of every figure below: all 29 paragraphs.**

Round 1 (`book07/review/findings-v1.md`) returned **accept after corrections**
— 3 substantive, 10 minor, 7 optional, 6 records, all 29 paragraphs covered.
Step 6 is `scripts/build_book07_v2.py`; step 7, the flow read, is the last row
of `book07/changes-v1-to-v2.md` and found one defect, which this round's own
correction had created.

---

## The figures

| | v1 (frozen draft) | **v2 (accepted)** |
|---|---|---|
| paragraphs | 29 | **29** |
| Butler token retention (aggregate-join) | 0.93943 | **0.93438** |
| order retention (per paragraph) | 0.93943 | **0.93438** |
| bag retention | 0.95220 | **0.94656** |
| **MOVE-GAP** (bag − order), an UPPER BOUND | 0.01277 | **0.01217** |
| displaced runs (the strict witness) | 1 | **1** — B07-P013, 17 tokens |
| sentences, source → candidate | 103 → 129 | **103 → 138** |
| **raw splitting rate (D17)** | +25.2% | **+34.0%** |
| sixty-word sentences | 7 → 0 (100% broken) | **7 → 0 (100% broken)** |
| **semicolons, Butler → candidate (D19)** | 30 → 14 | **30 → 7** |
| — of Butler's own, **kept** | 8 | **5** |
| — the draft's own, **added** | **6** | **2** |
| NORM RATE as published (D20) | +7.5% | **+9.0%** |
| **NORM RATE on Butler's own pointing (D20, S-1)** | **+3.0%** | **+7.5%** |
| word ratio | 0.996 | 0.994 |
| paragraphs byte-identical to Butler | 0 | **0** |
| H.1 compound pairs, all dispositioned | 23 | **23** |

`book07/checks-v2.md`, written by `scripts/checks.py`, is the only thing that
computes these. `book07/manifest.json`'s `checks` block names
`candidate-v2.json` and its sha256, and `scripts/checks.py --manifests`
verifies it.

---

## S-1 — the number the Book published, and what it is now

Round 1's headline finding. `README.md`, `continuity.md` §7 and
`review-instructions.md` question 4 all said *"fourteen of Butler's thirty
semicolons are kept"*. **Eight were kept and six were the drafter's own**,
written where Butler wrote a comma — and under D20 clause (a) a comma raised to
a semicolon scores as a **full division**, because it adds nothing to the
sentence count and one to the semicolon count. That corollary had never been
stated and nothing tested it. **Book 7 v1's NORM RATE on Butler's own pointing
is +3.0%, not +7.5%.**

It is now a measure and not a correction: `semicolon_provenance()`,
`kept_added()` and `norm_rate_butler()` in `scripts/checks.py`, reported for
every Book, with four new `--audit` controls including the one that was
missing — *a comma raised to a semicolon must not move the compared figure*.

**The correction was then earned rather than declared.** Four of the six
additions became periods (**M-6**, and §8's sixth, ruled here), three of
Butler's own survivors became periods (**M-7**), and the one he wrote at
B07-P004's seam and the draft lowered to a comma came back as a period
(**M-8**). Nine more sentences; semicolons 14 → 7; and **NORM RATE on Butler's
own pointing +3.0% → +7.5%**, which is the same figure v1 claimed, now carried
by divisions a reader experiences.

### A correction to the review, on the review's own principle

Round 1 says +3.0% puts Book 7 **"fifth of seven"**. That ranking compares Book
7's *corrected* figure against the other six Books' *uncorrected published*
ones — two bases in one column, which is records finding **R-1** of Book 6's
round 1, the disease this package has been treating for two Books. Every Book's
figure on Butler's own pointing is now computed and pinned in `PUBLISHED`:

| | 1 | 2 | 3 | 4 | 5 | 6 | 7 v1 | **7 v2** |
|---|---|---|---|---|---|---|---|---|
| NORM RATE as published | −3.9% | +4.0% | +1.0% | +2.0% | +8.0% | +7.0% | +7.5% | **+9.0%** |
| **on Butler's own pointing** | **−4.5%** | **+1.2%** | **−2.0%** | **+2.0%** | **+7.5%** | **+5.6%** | **+3.0%** | **+7.5%** |
| semicolons kept + added | 12+1 | 16+5 | 26+6 | **50+0** | 12+1 | 3+2 | 8+6 | **5+2** |

On like against like, **v1 was third of seven, not fifth**, and v2 is joint
first with Book 5. The substance of S-1 is untouched by this — six of fourteen
marks were the drafter's own and the published figure was 60% pointing — but
the ranking was not a comparison. **Book 4 is the only Book in the package that
added none**, and Book 7 v1 was the worst of the seven at 6 of 14.

---

## The corrections, by finding

`book07/changes-v1-to-v2.md` has every substitution with its `old` and `new`.
29 substitutions in 16 of the 29 paragraphs.

**Substantive.** S-1 above. **S-2** (the manifest) and **S-3**
(`MIN_PARA_RATIO`) are not Book 7's and did not wait for it — see
`scripts/prove_manifest.py`, which plants a failing candidate and a stale hash
and asserts both are rejected.

**Minor, all ten applied.** M-1 `precincts` → `courtyard` (the collision the
check printed and nobody ruled on, and a sense change beside B07-P009's literal
bronze walls); M-2 `abode` → `home` at P009 and P020; M-3 Butler's comma before
`as the work of herself`, the 21-word garden path the draft built by deleting a
mark; M-4 the clause swap that takes `my friends` away from `them all`, with no
word added or lost and the displaced run untouched; M-5 `sup` → `have my
supper` and `insistent` → `demanding`; M-6 four added semicolons to periods;
M-7 three of Butler's to periods; M-8 P004's seam restored; M-9 P024 rendered
properly (*`not to bring you straight to my house`*) rather than cosmetically;
M-10 `chief men` → `chief people`.

**Optional: four applied, three declined.** O-2 (the serial comma, restored at
P020 and P026 where Butler had it), O-5 (P026's residual garden path), O-6
(P007's partitive `of` read as an agent), and §8's adverb at P019. O-1 and O-3
are settled as **rules** in `PUNCTUATION.md` rather than as text changes, which
is **D11**. O-4 and O-7 are declined with reasons, below.

**Four repairs are not in the findings file at all.** They are **arrow C**'s —
the third arrow added to `scripts/rendering_collisions.py` at this step, after
round 1 demonstrated that every instrument in the package is blind to the class
M-2, M-5 and M-10 belong to. See `book07/collisions.md`.

---

## Findings and repairs declined, with reasons

| | reason |
|---|---|
| **O-4** — `lofty` → `high` at P005 | The two senses are far apart (a wall's height, a sea's), `high walls` is the natural modern phrase, and the alternatives are either a register this edition does not use or the archaism the Book exists to remove. The findings file itself files this one *for the record*. |
| **O-7** — `wayfarer` → `traveler` at P018 | **The proposed repair does not repair anything.** O-7 offers `lone traveler` to keep the solitary sense without merging onto Butler's `traveller`; the candidate **already writes `solitary traveler`**. The merge is untouched either way, because `traveler` is the only plain modern equivalent of `wayfarer`. Reclassified `unavoidable-merge`. |
| **M-7's fourth period** | **The findings file's prose and its own table disagree, and the table governs.** M-7's heading and §5.4 say *four* of Butler's eight survivors should be periods; the table rules exactly **three** as `period` and **five** as `keep`, and three plus five is the eight S-1 establishes. The three are taken; the `borderline; keep` at P010 is kept. |
| repairing accepted **Book 5**'s `lush greenery` | §5.2's ruling on `luscious`, adopted. Book 7 is right, accepted Book 5 is the one out of step, and the divergence is recorded in `collisions.md` (`kept`) rather than repaired: a successor for no reading gain. |

---

## Rulings carried into the record

* **B07-P011's vineyard semicolons are UPHELD, all four, including the two the
  drafter added** — and recorded as a **decision**, not counted as kept marks.
  The five stages are grammatically parallel clauses of one survey of one
  vineyard; serial semicolons between parallel clauses are correct modern
  usage; and **Butler pointed the same five-item list two ways** (`;` twice,
  then `,` twice) for no reason the text supplies. It is the one place in the
  Book where an added semicolon is an editorial improvement. Asserted by the
  build, exactly four marks in that paragraph.
* **The present tense at P010–P011 is upheld** (§5.5), and §5.5's caveat is now
  an assertion rather than a note: the reading depends on *"Such, then, were
  the splendors…"* closing the block, so the build fails if that sentence is
  shortened, divided or moved off the end.
* **`councillors` → `councilors`** (§5.3, ledger **A6**). D9 wins: it was the
  only British spelling in seven accepted Books. Costs a successor to Book 2.
* **`issue` is a homograph, not a collision** — *outcome* at B03-P007,
  *offspring* at B07-P007. The class now has a name and a disposition in
  `scripts/collision_triage.py`, which is what §5.2 asked for.

---

## What is open

* The served `app/public/data/editions/odyssey-modern-en.json` is untouched.
  Nothing here is merged, deployed or registered.
* Ledger **A2** (Book 10's disposition) and **A4**(ii)/(iii) remain with the
  coordinator. **A4(ii) is now answered in the negative** — see the register in
  every `continuity.md` §H.1 and ledger **A5**.

## Accessibility successor v3 (2026-09-23), now the accepted file

`candidate-v3.json`, sha256 `59d8eed4af9b3d5a68b6725a2aed67d692efe7fcca074c328ab8d3beb0bcbbb3`: ¶6 "But he left a daughter" → "But Rhexenor left a daughter" (blocking; Butler's referent).
This follows the candidate-only accessibility review that the Book had never had. The screening, the edits and their reasons, and the independent re-verification (**VERIFIED CLEAN**, round 2) are in `../edition-review-2026-09-23/books01-09-accessibility/`.
