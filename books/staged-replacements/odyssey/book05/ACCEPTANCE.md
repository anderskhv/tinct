# The Odyssey, Book 5 — acceptance record

**Accepted 2026-09-12 at `candidate-v2.json`**, under `../WORKFLOW.md` step 8:
*accept only when no substantive issue remains.*

| | |
|---|---|
| Accepted file | **`candidate-v2.json`** |
| sha256 | **`acbfcb03f15e8244dc46ec7f29d14d48da9179443191016525636d30b51479e9`** |
| Readable copy | `candidate-v2-readable.md`, sha256 `6fbc6558e25fa6daa700baa5eb82d6616856a9e9208677d255c42c19bb38fc55` |
| Source | `source-book5.json`, sha256 `c84e4bb2924d89250e4a943721703213bba0530c09641b662c93c4a8de02cd57` — byte-identical to chapter 5 of `app/public/data/editions/odyssey-original-en.json`, sha256 `da03f6ac9dfd5a19b9912adabfb9b0b48ed66bd85d8e1507a6b323a374822f07` |
| PG base text | `../source-texts/pg1727-butler-1900.txt`, sha256 `ffbdb29c3dda284b65c11243db1a98167826a70c81bca2ed4b6232f86c905fb9` (Project Gutenberg #1727, Samuel Butler, 1900) |
| Frozen predecessor | `candidate-v1.json`, sha256 `7acc5c346154e7d23c85eaa3c31ef25654600e4e122f455eb93a1bf3737a59cf` — **not edited**, with `candidate-v1-readable.md` and the 13 review packets (**D10**) |
| Review rounds applied | **1** (`review/findings-v1.md`) |
| Second round | **Not run, and not required.** Round 1's single substantive finding, S-1, is a Book-level finding about *which* operation produced the splitting rate. It is answered by three named recasts, three named reversals and a new reported number (**D19**), all of them asserted by the build. Every minor finding is applied; five optional findings are declined, each asserted still present with its reason in `changes-v1-to-v2.md`. |
| Paragraphs | 37, one-to-one with the source, in order |
| Words | 4,652 against 4,666 — **ratio 0.99700** (v1 was 0.99871); lowest paragraph ratio **0.963** at B05-P036 |
| Butler token retention | **0.93808** (v1 was **0.94211**) |
| **Sentence-splitting rate (D17)** | **153 → 189 sentences, +23.5%**; **sixty-word sentences 9 → 1, 89% broken** (v1 broke 6 of 9) |
| **Semicolons against Butler's (D19)** | **34 → 13** (v1 was **34 → 12**) |
| Flow read | `flow-read.md`, one change (F-1), folded into the build script |
| Built by | `../scripts/build_book05_v2.py` |

All hashes, ratios, the retention figure, both sentence counts and the
semicolon counts above were **recomputed independently at acceptance**, not
copied from the build's own output, and the build was re-run to a
byte-identical `candidate-v2.json`.

## S-1, and what was actually done about it

Round 1's substantive finding is not that the draft did too little. It is that
**the operation it did most of is the one D17 counts at full value and a reader
notices least.** Butler's Book 5 carries 34 semicolons; v1 carried 12. A
semicolon rewritten as a period adds a sentence, moves no clause, drops no word
and costs no retention, so it scores perfectly on both of D17's axes while
leaving the sentence exactly as Butler built it. That one fact explains why
Book 5 v1 had both the highest splitting rate in the package (+23.5%) and its
second-highest retention (0.94211).

The round therefore does three things the gate cannot ask for.

**Three paragraphs really recast**, each one where Butler's period still governs
the reading and no semicolon was available to cash:

- **B05-P009** — the relative chain. `the most ill-starred of all those who
  fought nine years before the city of King Priam and sailed home in the tenth
  year after sacking it` is Butler's Victorian suspension, and v1 left it whole
  because there was nothing to divide at. Now two sentences, the relative
  resolved into a main clause, no clause out of Butler's order.
- **B05-P017** — ruling 5. v1 raised Butler's comma to an **em dash**, which is
  the drafter saying *this is where the sentence turns* and then declining to
  turn it. Divided at the dash, and the fronted relative `of whom you are
  thinking` — the single most Victorian construction left in the Book —
  unwound to `the one you think about`. Calypso's offer of immortality is the
  emotional centre of the Book and was the one long sentence in it a reader had
  to re-enter.
- **B05-P021** — the 54-word Bear sentence, whose trailing causal clause
  reached back over a thirty-word astronomical parenthesis to a main clause the
  reader has lost. Calypso's instruction now opens its own sentence and the
  parenthesis is a statement.

**Three divisions reversed**, because they are worse than Butler's semicolon:

- **B05-P021** (finding 21.1) — `She gave him a goatskin … She also gave him a
  bag …`, two consecutive sentences both opening `She` and both `gave him a`:
  the Book 4 flow-read **F-1** shape exactly. Butler's semicolon restored.
- **B05-P020** (finding 20.1) — a seven-word sentence inside a run of four
  opening `She … So she … She also … Then she`. Butler's `and then led the way`
  restored.
- **B05-P027** (finding 27.1) — two consecutive sentences opening `I` inside a
  speech that already opens six clauses with `I`. Butler's own pointing
  restored on both joints.

**The net sentence count is unchanged at 189**, and that is the honest result:
three divisions added where they were owed, three taken back where they hurt.
What moved is retention, **0.94211 → 0.93808** — division neither drops a word
nor moves one, so a round that changes retention is a round that moved clauses.
Sixty-word sentences fell 3 → 1 (finding 37.1 took P037's simile to 59 words;
finding 30.2 took P030's back to Butler's own 62).

**And the number the package was missing is now reported** — records finding
**R-6**, ledger decision **D19**: the semicolon count beside the splitting rate,
for every Book. Butler → candidate across the package: 47 → 13, 36 → 21,
39 → 32, 68 → 50, and Book 5 **34 → 13**.

> **One correction to round 1's own arithmetic.** The finding says the
> candidate carries **14** semicolons and that **20** of the 36 added sentences
> are semicolon conversions. The frozen `candidate-v1.json` carries **12**, so
> the figure is **22**, not 20. The finding is stronger than it claimed, not
> weaker, and nothing in its argument turns on the two.

## The four rulings, and the one that reopened accepted work

1. **`sea shore` → `seashore`.** Applied, both instances. **It cost three
   successors, not one** — records finding **R-3**: `RESUME.md`,
   `review-instructions.md` and `PUNCTUATION.md` §4 each said accepted Book 4
   alone printed the open form, and Books **2, 3 and 4** all print it. All three
   documents are corrected; `../scripts/build_seashore_successors.py` produced
   `book02/candidate-v4.json`, `book03/candidate-v3.json` and
   `book04/candidate-v3.json`, each leaving its accepted candidate and
   `ACCEPTANCE.md` byte-unchanged.
2. **The word supplied at B05-P012 — upheld.** `and` stands, and the class is
   now written into `PUNCTUATION.md` §5: a defective sentence is repaired by the
   smallest edit in the direction of the defect.
3. **The unbroken `heaven` census — upheld.** 4 → 4, asserted.
4. **`batting it back and forth` — upheld**, with `between them` dropped: Butler
   leaves the relation implicit and `at once` already carries the four-way
   simultaneity.
5. **The 62-word sentence at B05-P017 — divided**, as above.

## Findings: what was applied and what was not

**1 substantive, 14 minor, 18 optional, 8 records. Every minor finding
applied.** 30 substitutions in 20 of the 37 paragraphs, listed by paragraph
with the finding each answers in `changes-v1-to-v2.md`.

**Five findings declined**, each asserted still present in the built file so a
decline cannot be a silent application:

| finding | why |
|---|---|
| **C-15** — the colon before an opening quotation mark | The four instances are **one** disposition and the rule was simply never written down: a **colon** where the speech begins in the **next** paragraph (P008 → P009, P016 → P017), a **comma** or full stop where it follows inline (P007, P015). Recorded in `continuity.md` §5 rather than changed. |
| **21.2** — `the wain` → `the Wain` | The capital stands; its *classification* was wrong. Recorded as a **rendering** decision under D15's own test, not as typographic normalization. |
| **7.1** — `Odysseus was not in the cave` | The supplied location is an improvement and the same class as ruling 2's upheld `and`. What was missing was the record, and it is now in `continuity.md` §5. |
| **12.1** — `crying aloud in his despair` | The repair stands; it is a **D16** instance and is now recorded beside B05-P011's. |
| **23.1** — `so hard` against `sorely against my will` | The disposition is defensible and the reviewer says so: the second is a carried cross-Book formula, the first ordinary use. Recorded as a one-word-two-ways row rather than changed. |

**All eight records findings acted on**: R-1 → **D18**, the two-clause control
rule, in `WORKFLOW.md` and applied to every verification script in the package;
R-2 → the same rule's clause (b), and it caught a third live instance while
being applied (see below); R-3 → the three documents corrected and the three
successors built; R-4 → the dead conditional in `verify_source_book5.py`
deleted; R-5 → the word *survive* corrected in `continuity.md` §10 and the
60+ census now reports the delta; R-6 → **D19**; R-7 → the near-identical
report published in `checks-v2.md` §4 and `continuity.md` §11; 30.2 → P030's
recast brought back inside Butler's own word count.

**Three corrections to the artefacts themselves**, which is the class round 1's
section H.4 names as uncheckable: **C-12** (three compounds missing from
`continuity.md`'s table), **C-13** (`review-instructions.md` steered the
reviewer to three paragraphs the package's own `near_identical()` flags **none**
of), and **C-14** (an operator-precedence bug in `verify_source_book5.py`'s
containment guard, `not lo <= at and …`, which could not fire for half its
cases).

## Step 1 — the source, verified twice, by two unlike rules

**By this package**, `../scripts/verify_source_book5.py` — a *sixth* kind of
rule, which never looks for Book 5 at all: it locates the other twenty-three
served chapters in PG, each required to occur exactly once in the whole file,
and identifies Book 5 as the **residue**. 37 of 37 paragraphs accounted for, 32
byte-identical, five classified footnote markers (50–54, one space-set), 0
letter-case, 0 whitespace and 0 other differences, 4,666 words compared word for
word with 0 mismatches. The residue is **exhausted** by chapter 5's heading, the
served chapter and chapter 6's heading, each heading checked against the served
file's own `title` field.

**By the round-1 reviewer**, `review/verify_source_book5_review.py` — a
*seventh*: one global monotone diff of the whole 24-chapter edition against the
whole PG file, no anchors, no needles, no fingerprints. Chapter 5 aligns
**4,709 of 4,709 tokens**, **0 PG tokens unclaimed in the span**, all 37
paragraphs at 100%, and the span lies strictly between chapters 4 and 6 by
monotonicity alone. The two heading gaps it reads out — 9 tokens and 8 tokens —
are exactly the two leftovers the residue rule names.

Two unlike rules, one of which cannot be steered by the thing it checks and one
of which never looks for it. **The source holds.**

## What the package's checks would still not catch

Round 1's section H, with what this round changed against each.

1. **A compound open in Butler and open in the candidate.** Still true in
   general, but the four instances round 1 found by reading — `half way`,
   `river bed`, `mid ocean`, `sweet smelling` — are corrected, and the
   cross-Book check now sees the **closed/open** axis
   (`../scripts/compound_drift.py`). Its own blindness is declared: a pair no
   hyphen attests anywhere is not admitted as a compound at all, because
   keying on separator-stripped letters alone makes `any one`, `on to`,
   `sun set` and `up on` candidates.
2. **A Butler word rendered with a word the package reserves for a different
   Butler word.** Unchanged and still uncaught. `one_word_two_ways()` keys on
   Butler's side within one Book; nothing keys on the *candidate's* side across
   Books, which is the only way to see `hecatomb` → `offering` colliding with
   `offering` → `offering`. Finding 9.1 was found by reading three accepted
   Books, and is answered here with a third word, `victims`.
3. **A division that satisfies D17 and hurts the prose.** By construction. D19
   narrows it — the semicolon count says how much of the rate came from the
   operation that moves nothing — but it does not tell a good division from a
   bad one. The only instrument is the flow read, and this Book's found one
   (F-1).
4. **Prose in the artefacts that contradicts the artefacts.** Still uncaught,
   and it produced C-13 and R-5 in this very Book. Nothing checks a sentence in
   `continuity.md` or `review-instructions.md` against the report it quotes.
   The mitigation here is publication, not verification: `checks-v2.md` now
   prints the reports the prose describes.
5. **A guard or control whose measure is blind to what it mutates.** **Closed**,
   as a rule: **D18** requires both clauses, and `../scripts/controls.py` is the
   rule as one callable, used by every verification script in the package. It
   proved itself immediately — a one-letter control in
   `book04/review/verify_source_book4_review.py`, rewritten to take the
   paragraph's longest token, mutated `understanding.”` into
   `understanding.””`: a real change, invisible to a fingerprint that
   normalizes punctuation. Clause (a) passed, clause (b) failed, the control was
   rebuilt on letter runs.
6. **A recast that grows Butler's sentence.** Narrowed: the build now asserts
   that no paragraph's longest sentence exceeds its source paragraph's longest.
   That is not the general statement — a paragraph can still grow a sentence
   that is not its longest — but it is what caught P030 at 65 against 62.

**And one this Book adds.** A check that exists and is never run is worth what
an absent one is worth. `hyphen_drift()` was written at Book 3 and never called
again; Book 4's build script does not call it, and two cross-Book drifts
(`low-lying`, `well-disposed`) sat in accepted work for two Books inside the
class it could already see. `../scripts/compound_drift.py` is therefore runnable
on its own, self-tests when run, and is called by the Book 5 build.

## Step 8

No substantive issue remains. **Book 5 is accepted at `candidate-v2.json`.**
Nothing here is merged, deployed or registered, and
`app/public/data/editions/**` was not written.
