# The Odyssey, Book 7 — package (frozen at candidate v1)

Steps 1–3 of `../WORKFLOW.md` are done for Book 7, and the step-4 artefacts
(10 packets, manifest, review instructions) are built. **Step 4 itself — the
independent review — has not run**: `candidate-v1.json` is frozen and the
packets are pushed. Book 7 was **not** self-reviewed.

| | |
|---|---|
| Candidate | `candidate-v1.json`, sha256 `bf8cf2f76f4670daab55daf1da265ba7b1839c0cd6680e3c5691fac8d382dc33` — **frozen** |
| Source | `source-book7.json`, sha256 `1c3c67f99747b2e919845a310867f190e592131be953b34e4f5b66c895d35152` |
| Paragraphs | 29 |
| **Basis for every figure below** | **all 29 paragraphs** (records finding **R-1**) |
| Words | 3,365 against 3,347 — ratio **1.00538** |
| Butler token retention | **0.93943** |
| **MOVE-GAP (D20)** | **0.01277**, displaced runs **1** |
| **Splitting rate, raw (D17)** | **103 → 129 sentences, +25.2%; sixty-word 7 → 0, 100% broken** |
| **NORM RATE (D20)** | **+7.5%** |
| **Semicolons against Butler's (D19)** | **30 → 14** |
| Packets | 10, coverage `B07-P001`…`B07-P029` |
| Checks | `checks-v1.md`, written by `../scripts/checks.py`, **all gates pass** |

## The one thing that is new about this Book, and it is not in the prose

**This is the first candidate in the package that anything gated.**

Substantive finding **S-2** of Book 6's round 1: until `scripts/checks.py` was
written, `build_book_package.py` called **no check in the package** — not
`token_retention()`, not `splitting_rate()`, not `semicolons()`, not
`compound_drift()`. D17's gate and the growth gate lived only inside Books 4's
and 5's *correction* scripts, which never run for a new Book, so **D17 had never
gated a v1 candidate**, and no Book had a `checks-v1.md`. Every published figure
in six Books was correct and none was reproducible by running anything in the
repository.

The enforcement is structural rather than a convention, because a convention is
what failed: `build_book_package.py` writes `manifest.json` **only after the
gates pass**, and records the sha256 of the `checks-v1.md` that run produced. A
package directory whose checks did not run therefore has **no manifest**.

**It fired twice while this Book was being drafted, and both were real.**

1. **B07-P021 grew a sentence from 51 words to 52.** The paragraph's maximum
   did not move, so D19's maximum-against-maximum gate could not have seen it by
   construction — that is the hole **D20** closes by aligning sentences.
   Repaired: the period now divides at *"for the space of nine days."*
2. **B07-P024 came out byte-identical to Butler.** Repaired by putting the
   adverb where a modern reader expects it (*"not to bring you on to my house at
   once"*), not declared. Accepted Book 4 declares seven byte-identical
   paragraphs and is right to; this one had a real improvement available.

## Step 1 — the source, verified by a TENTH kind of rule that reads none of Butler's letters

`../scripts/verify_source_book7.py`. The nine rules used before are all about
the text, and every one of them reads his characters in some form — even the
ninth, which destroys every letter but still reads his punctuation and his word
lengths. **This one's instrument is PG #1727 as a published artefact**: the
transcriber's hard wrapping. The whole file is cut into blank-line blocks, each
block is reduced to **one integer — its line count**, the served chapter is
reduced the same way, and **twenty-nine integers locate it**.

The rule is only available because the served `original-en` **preserves PG's
line breaks inside its paragraph strings**. That premise is clause 0 and is
asserted, not assumed.

- The 29-integer signature occurs **exactly once** in the file's 1,382 blocks.
- **Second-best match reported, not bounded: 4 blocks.**
- Characters restored at the located blocks are identical to the served
  paragraphs once PG's footnote numerals are removed.
- The verdict is the **pair** *(occurrences, last recovered block)*, never a
  count — a prefix of a unique sequence is also unique.
- **Clause 4 turns Butler's apparatus into an ordinal index**: his footnote
  numerals run straight through the poem, so a gap inside one chapter would mean
  the span had jumped. The span carries **57 … 64**, contiguous and ascending.

**The audit failed the rule three times**, which is now the package's
expectation: the block splitter kept stray newlines and the signature occurred
**zero** times — reported as a count; clause 2 excluded only the exact start and
announced that the chapter nearly matched *itself*; and one control's "re-wrap"
changed no line count at all. Each is named in the source at the line that
carried it.

## Three numbers, and the fourth that is the one to read

Book 4's round 1 established that retention alone cannot tell a modernization
from a touch-up (**D17**). Book 5's round 1 established that the splitting rate
alone cannot either, because a semicolon rewritten as a period adds a sentence,
moves no clause and costs no retention (**D19**). Book 6's round 1 established
that **the retention figure cannot be the evidence that clauses moved** — D17
was written about the other thing that lowers retention and moves nothing — and
gave the package the two measures that can: **NORM RATE** and **MOVE-GAP**
(**D20**).

So Book 7 does not argue from its retention figure. **16 of its 26 added
sentences are at most a semicolon conversion.** What says the rest is real is
**MOVE-GAP 0.01277**, above every accepted Book but 1 and 3 and above Book 6's
corrected 0.01156, with vocabulary substitution divided out — and **NORM RATE
+7.5%**, which is what the headline +25.2% is worth once the bookkeeping is
priced out.

**Fourteen of Butler's semicolons are kept, and that is a decision.** The
vineyard of B07-P011 is a serial list — raisins, gathering, treading, blossom,
colour — and five periods would make five mechanically short sentences out of
one survey of a garden. Converting them would raise the raw rate and leave NORM
RATE untouched, which is precisely the thing D20 exists to make visible.

## Seven collisions found before the review instead of after it

`../scripts/rendering_collisions.py` — `one_word_two_ways()` across Books and in
**both** directions — was run with Book 7 in the corpus **while it was being
drafted**. It found seven, and all seven are repaired in v1:

| | |
|---|---|
| `comely` → `handsome` | accepted B2-P001 and B4-P025 keep `comely` |
| `midst` → `midst` | accepted B4-P002 renders the *same phrase*, "in the midst of them", as "in the middle of them" |
| `councilors` | accepted B2-P001 prints `councillors` |
| `converse` → `talked` | accepted B4-P052 has "talked together" |
| `depart` → "to go" | accepted B1-P027 has "leave" |
| Butler's own `dwells` flattened into `lives` | and he uses **both** in B07-P021, eleven words apart — the B06-P019 shape |
| "the filling of itself" for his `due replenishing` | collides with Butler's own `filling` at accepted B4-P016 |

Four rows are **kept and recorded as questions** rather than changed —
`endowed`, `lighted`, `luscious` and `issue` — because each is Butler's own word
in a different grammatical role or of a different referent from the accepted
instance. They are question 2 in `review-instructions.md`.

## Files

| file | what it is |
|---|---|
| `candidate-v1.json` | the frozen draft |
| `candidate-v1-readable.md` | the same text with paragraph IDs outside the prose |
| `source-book7.json` | the served chapter, character-identical |
| `continuity.md` | every decision, per paragraph and by class |
| `checks-v1.md` | every measure, written by `../scripts/checks.py` |
| `provenance.json` | hashes, source verification, censuses |
| `manifest.json` | packet coverage, and the checks file's hash |
| `review-packets/` | 10 packets, 3 paragraphs each with 1 of context |
| `review-instructions.md` | what the reviewer is asked, with the questions put explicitly |
