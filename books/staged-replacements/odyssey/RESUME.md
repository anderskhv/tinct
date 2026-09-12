# RESUME — where this package stands, for the next worker

Updated continuously. Read this first, then `WORKFLOW.md`.

**Last updated:** 2026-09-12, session `session_01K5bL9oWzAagjTMExsyUADi`
(worker 6, **review role**). Book 6's round 1 is **back**:
`book06/review/findings-v1.md`, verdict **accept after corrections** —
2 substantive, 9 minor, 6 optional, 5 records, coverage complete
(13 of 26 paragraphs with no material issue). Book 6 step 5 is done;
**step 6, applying the corrections into `candidate-v2.json`, is next.**

## State

| Book | Step reached | Accepted file | sha256 | Retention | Splitting rate | Semicolons (D19) |
|---|---|---|---|---|---|---|
| 1 | 8 — accepted, successor `candidate-v3.json` | `candidate-v2.json` (successor v3) | v3 `c97e20f5…4807b57c` | **0.727** accepted / 0.728 v3 | +20.5%, 60+ 10 → 0 | 47 → 13 |
| 2 | 8 — accepted, successors v3, v4 **and v5** | `candidate-v2.json` (latest `candidate-v5.json`) | v5 `4f9c336e…41761957` | 0.902 | +16.1%, 60+ 7 → 4 | 36 → 21 |
| 3 | 8 — accepted, successor `candidate-v3.json` | `candidate-v2.json` (successor v3) | v3 `a79bacf6…8554ce1e` | 0.897 | +5.5%, 60+ 9 → 6 | 39 → 32 |
| 4 | 8 — accepted, successor `candidate-v3.json` | `candidate-v2.json` (successor v3) | v3 `6926b9f9…f8304534` | **0.95872** | +8.9%, 60+ 17 → 3 | 68 → 50 |
| 5 | **8 — accepted** | **`candidate-v2.json`** | **`acbfcb03…b51479e9`** | **0.93808** | **+23.5%, 60+ 9 → 1** | **34 → 13** |
| 6 | **5 — round 1 returned; step 6 next** | — | v1 **`9391ca16…3c0413f0`** | **0.93669** | **+27.6% raw / +6.3% NORM**, 60+ 7 → 1 | **27 → 4** |

Successor hashes in full: v2-successor `book02/candidate-v4.json`
`3aa8c4f27f7f6b3fabd1447a32852f1507ead3a9710efc6373f43416428773fc`;
`book03/candidate-v3.json`
`a79bacf6fd5f4a995b27d404e38e58790487bd4586bb144c7a0503408554ce1e`;
`book04/candidate-v3.json`
`6926b9f9ae7aa7d43903a8e9f0f4324078f382bfc1029cd9178582e4f8304534`;
`book02/candidate-v5.json`
`4f9c336e7f0db733a5eed6c5d88f5d30ce6a8e7ad863619329b1869441761957`
(the `waterside` successor, Book 6 step 2 — the **fourth** the compound rule
has cost and the **first found by a check rather than by a reader**).

**Book 1's retention was quoted as 0.721 everywhere until 2026-09-12 and that
figure does not reproduce** — records finding R2 of Book 4's round 1. The
package's own `token_retention()` gives **0.72703** for the accepted
`candidate-v2.json` and **0.72751** for the successor v3. The measure is the
aggregate-join form and only that form — see `GLOSSARY.md`, "The retention
measure".

## Book 6 round 1 — what came back

`book06/review/findings-v1.md`. **Accept after corrections.** The round is the
semicolon question, and the answer has two halves that must not be collapsed.

**The drafter's claim is right and its argument is wrong.** The argument offered
— retention 0.93669 is below Book 5 v1's 0.94211, and division costs no
retention, so clauses moved — **does not follow**: D17 was written about the
*other* thing that costs retention and moves nothing, a vocabulary swap with no
syntax work. Decomposed, Book 6's retention deficit is **0.05406 substitution
against 0.00925 movement** — 85% vocabulary. Of the 0.00542 by which it sits
below Book 5 v1, only 0.00204 is clause movement.

**Two measures were built and audited** (`book06/review/clause_movement.py`,
7 controls under D18, 2 declared blindnesses):

- **NORM RATE** — add each text's own semicolon count to its own sentence count,
  on both sides, so converting one to the other is worth zero. Book 6's
  **+27.6% becomes +6.3%**; Book 1 +20.5% → **−3.9%**, Book 2 +16.1% → +4.0%,
  Book 3 −1.1% → −5.1%, Book 4 +8.9% → +2.0%, Book 5 v2 +23.5% → +8.0%.
  **D19 should become a reported RATE, not a reported count.**
- **MOVE-GAP** — bag retention minus order retention, so substitution cancels
  and only relocation shows. Book 1 0.05088, Book 2 0.01632, Book 3 0.02065,
  Book 4 0.00431, Book 5 v1 0.00721, Book 5 v2 0.00891, **Book 6 0.00925**.
  Book 5 v1 → v2 is the controlled experiment (three recasts, three reversals)
  and Book 6 v1 already sits past where Book 5 landed after its round.

**Ruling: a modernization, not a proofread — but the splitting rate is
bookkeeping and must never again be reported without its denominator.**
23 of 32 added sentences are bought by a semicolon; **17 of 26 paragraphs gain
no boundary a semicolon did not pay for**, and P012 alone supplies 4 of the 9
that are real. Three of the drafter's four named paragraphs hold up; **P005's
clause movement is exactly 0.0000** — a supplied name is a repair, not a recast.

**The two substantive findings.**

- **S-1 — three paragraphs where Butler's period still governs and nothing was
  done.** **B06-P018's silver-plate sentence** is the hardest in the Book —
  subject and verb eleven words apart, and every reader garden-paths at
  *"under Hephaestus and Athena enriches"* — and the same paragraph cashed
  **three** semicolons for three easy divisions and left it alone. **B06-P016**
  is 141 words, two edits, one cashed semicolon, and two untouched chains of 43
  and 38 words: plain lexically, not syntactically. B06-P006 is answered, not
  owed.
- **S-2 — none of the package's checks is executed for Book 6, by anything in
  the repository.** There is no `scripts/build_book06*.py`;
  `build_book_package.py` calls **no check at all**. D17's gate, the 50-word
  growth gate and D19 live in Books 4's and 5's *correction* scripts, which
  never run for a new Book's v1 — **D17 has never gated a v1 candidate** — and
  Book 6 has no `checks-v1.md`. Every published figure reproduces; **none is
  reproducible by running anything in the repo.** The `hyphen_drift()` disease
  recurred at the very next Book, as all of the checks rather than one.
  **The enforcement asked for:** one `scripts/checks.py` holding every measure,
  writing `bookNN/checks-vN.md` and exiting non-zero on any gate, called at the
  end of `build_book_package.py`, plus `--all` to re-assert every accepted
  Book's published figures.

**The class the drafter said could not be mechanized, can be.**
`book06/review/rendering_collisions.py` is `one_word_two_ways()` run **across
Books** and **in both directions**, gated to Butler's rare words. Arrow B — one
*rendering* carrying two Butler words — has never existed in the package. It
finds `grass ← grass (B6-P011) | herbage (B6-P009)` (the drift, question 2, and
the collision the drafter refused at `scion` but took here), **the fifth call
the drafter missed — `topes` → `drinks`, colliding with accepted B04-P020's own
`drinks`** — and **a defect in accepted Book 4**: B04-P010 renders Butler's
`doubted whether` as `was in two minds`, Butler's own other phrase, one
paragraph before his real `in two minds` becomes `still undecided`. B06-P012 is
the better rendering; the repair is a **fifth successor** and is escalated.

**Source verification holds, by a ninth kind of rule**
(`book06/review/verify_source_book6_review.py`): **letter-blind typographic
shape**. Every letter destroyed, PG's footnote numerals deleted, all other
pointing kept exactly. The chapter's 17 732-character shape occurs in PG
**exactly once**; letters restored at the span the shape index gave are
character-for-character identical, both ends printed; the longest shape shared
with anywhere else in the file is **155 characters**. **The audit failed the
rule three times** — digits levelled instead of deleted (and the resulting
**zero** was *reported as a count*), the shape index used as a character index,
and a verdict blind to truncation because a prefix of a unique string is unique.

**R-1 is the records finding that matters beyond this Book:** the D17/D19
comparison table is **not six comparable numbers**. Book 3's row is computed on
**37 of 38 paragraphs** — the D14 splice excluded — and nothing says so. The
package's own measures on accepted Book 3 give **0.86053** and **176 → 174
(−1.1%)**, not 0.897 and +5.5%; dropping P038 reproduces the published figures
to five places. `scripts/checks.py --all` is what catches this class.

**H.1 cannot be closed with the package's own materials, and that was run rather
than assumed:** the closed form of every content-word pair in Book 6's candidate
was looked for in PG plus all twelve staged files — **zero hits**. Butler never
writes `mountaintop`. Full closure needs a vendored word list (a new dependency,
escalated); the cheap instrument that works now is a head-noun filter, which
takes Book 6's **482** pairs down to **23** and surfaces the live instance,
`mountain tops`.

**D19's growth gate gap is real and cost nothing here:** it compares maximum
against maximum, so dividing a paragraph's longest sentence buys cover for
growing a different one. In Book 6, 14 sentences grew, largest growth 2 words,
largest result 40. Close it by aligning sentences, keep the 50-word threshold,
report at 40.

## Done since the last RESUME

### Book 5 is accepted at `candidate-v2.json`

`book05/ACCEPTANCE.md`. Round 1 (`book05/review/findings-v1.md`) returned
*accept after corrections*: 1 substantive, 14 minor, 18 optional, 8 records,
coverage complete. 30 substitutions in 20 of 37 paragraphs via
`scripts/build_book05_v2.py`; **every minor finding applied**; five optional
findings declined and asserted still present with reasons; one flow-read change
(`book05/flow-read.md`, F-1).

**S-1 was the round, and it was subtle.** Book 5 v1 had the package's highest
splitting rate (+23.5%) and its second-highest retention (0.94211), and the two
had one cause: **Butler's 34 semicolons became 12**, so 22 of the 36 added
sentences were a semicolon rewritten as a period — an operation that adds a
sentence, moves no clause, drops no word and costs no retention, and therefore
scores at full value on **both** of D17's axes. *(Round 1 says 14 and 20; the
frozen file carries 12, so the figure is 22. The finding is stronger than it
claimed.)* Answered by **three real recasts** where Butler's period still
governed and no semicolon was available — **P009** the relative chain, **P017**
ruling 5 (v1 raised Butler's comma to an em dash, which is finding the seam and
declining to turn), **P021** the 54-word Bear sentence — and **three reversals**
of divisions worse than Butler's semicolon (**P021**'s `She … She also …`, the
Book 4 F-1 shape; **P020**; **P027**). **Sentence count unchanged at 189;
retention 0.94211 → 0.93808**, which is what moving clauses costs and dividing
them does not.

### The `seashore` ruling reopened three accepted Books — and `waterside` a fourth

Ruling 1: **`sea shore` → `seashore`**. D15 is about the form, not precedent,
and Book 3's finding 27.1 already established that a settled-but-wrong form
gets a successor. **The cost is three successors, not one** — records finding
**R-3**: `RESUME.md`, `book05/review-instructions.md` and `PUNCTUATION.md` §4
each said accepted Book 4 alone printed the open form, and Books **2, 3 and 4**
all print it. All three documents corrected;
`scripts/build_seashore_successors.py` built the three, each leaving its
accepted candidate and `ACCEPTANCE.md` **byte-unchanged**, and all six accepted
build scripts still reproduce their outputs byte for byte.

**`hyphen_drift()` is extended to the closed/open axis**
(`scripts/compound_drift.py`): key each compound on its separator-stripped
letters, fail on any key with more than one setting across the Books. It
subsumes the old check. Run over the five Books it **surfaced two drifts nobody
had raised** — `low-lying` (hyphenated in Book 5, open in Book 4) and
`well-disposed` (hyphenated in Books 2 and 5, open in Book 4) — both in the
class the *original* check could already see. It was written at Book 3 and
**never run again**; Book 4's build script does not call it. An unrun check is
worth what an absent one is worth. Book 4's successor carries all three words.
The new check's own blindness is declared: a pair no hyphen attests anywhere is
not admitted as a compound, because keying on letters alone makes `any one`,
`on to`, `sun set` and `up on` candidates.

### Two new ledger decisions

- **D18 — the two-clause control rule.** *A negative control asserts (a) that
  its mutation changed the input AND (b) that the check's own verdict changed;
  where (b) cannot hold, the blindness is declared by name and a second check
  carries that class.* `scripts/controls.py` is the rule as one callable.
  Applied to **every** verification script in the package, not only new ones —
  including `verify_source_book2.py`, which had no executed controls at all.
  Clause (b) is the half that survives the drafter's fix (records finding
  **R-2**), and **it caught a live instance while being applied**: a one-letter
  control in `book04/review/…` mutated `understanding.”` into
  `understanding.””` — real, and invisible to a fingerprint that normalizes
  punctuation. Written out in `WORKFLOW.md` with the table of scripts.
- **D19 — every Book reports its semicolon count against Butler's**, beside
  retention and the splitting rate. Three numbers, not two. It is the
  denominator D17 is missing.

### Corrections to the artefacts

**C-12** (three compounds missing from `book05/continuity.md`'s table),
**C-13** (`book05/review-instructions.md` steered the reviewer to three
paragraphs the package's own `near_identical()` flags **none** of — the report
was computed and never published; it is now in `book05/checks-v2.md` §4 and
`continuity.md` §11, records finding **R-7**), **C-14** (operator-precedence
bug in `verify_source_book5.py`'s containment guard, `not lo <= at and …`,
which could not fire for half its cases), **R-4** (a dead conditional four
lines above it, deleted), **R-5** (the word *survive*, corrected — and the
build now fails on any recast that grows a sentence past 50 words beyond its
source's longest).

## Book 6 — drafted and frozen, waiting on the review

- **Steps 1–3 are done and `book06/candidate-v1.json` is frozen** at
  `9391ca16778a8225c1710b24296c51a2d3ba33f26ed3ac9fcf7c677c3c0413f0`: 26
  paragraphs, ratio 0.99913, retention **0.93669**, **sentences 116 → 148
  (+27.6%), sixty-word 7 → 1 (86% broken), semicolons 27 → 4**, 9 packets,
  `review-instructions.md` written with five questions put explicitly.
- **The source is verified by an eighth kind of rule, and it asks a question
  none of the seven asks.** All seven establish *presence*.
  `scripts/verify_source_book6.py` asks the complement — *is there anywhere
  ELSE in PG that this chapter could have come from?* — by building a **suffix
  automaton** over the served chapter and walking the **whole** PG file through
  it once, from token zero, producing a resemblance profile of the entire file.
  The profile reaches the chapter's full length at **exactly one** position
  (span `[28997, 32456)`), and the **second-best match anywhere in the file is
  37 tokens**, reported with its text: Athena's beautification of Odysseus,
  which Homer repeats at Book 23. **28997 is the same number the Book 5 residue
  rule read out independently** for chapter 6's start.
- **The audit failed the rule as first written**, as the last three did: the
  token-span-to-character-span recovery stopped at the last *letter* of the
  chapter and dropped its terminal full stop, so it reported `home` against
  `home.` on a byte-clean file. Fixed and named in place. Six controls under
  **D18**, two blindnesses declared with the checks that carry them.
- **D19 is stated against the draft, not for it.** 23 of Book 6's 32 added
  sentences are at most a semicolon conversion — the S-1 shape. The evidence
  offered that the rest is real is the retention figure, **0.93669**, below
  Book 5 v1's 0.94211; division costs no retention, so a lower figure means
  clauses moved. Four paragraphs are named as the real recasting (P004's
  dropped `but`, P005's referential `she`, P012's deliberation, P013's 57-word
  close). **The reviewer is asked to test that claim** (question 5).
- **D4 fires twice**, the first Book since Book 4: Odysseus's speech across
  P013 → P014 and Nausicaa's across P021 → P022 → P023.

## Next, in order

1. **Book 6 step 6**: apply the corrections into `book06/candidate-v2.json`
   (2 substantive, 9 minor, 6 optional, 5 records — answer each either way,
   **D11**), then steps 7–8. Note that **M-3 and the S-1(b) repairs move the
   sentence count in opposite directions**, which is correct: NORM RATE, not the
   raw rate, is what should improve.
2. **Before Book 7, build `scripts/checks.py`** and wire it into
   `build_book_package.py` (**S-2**). Nothing else in the package is worth doing
   first, because it is the blind spot that hides the others.
3. **Book 7** after that, in numerical order. Verify its source by a **tenth**
   kind of rule — nine are now used, listed below — **audit the rule before
   trusting it** (five drafters/reviewers have now audited theirs and all five
   audits *failed* the rule as first written; Book 6's review audit failed its
   rule **three times**), then diff word for word. Byte-identity to a re-run of
   your own build script is not verification.
4. **Report four numbers**: retention, the raw splitting rate (**D17**), the
   semicolon count (**D19**) and the **semicolon-normalized splitting rate**,
   which is what the count is for. Book 6's round 1 asks that D19 become a
   reported rate. And state the paragraph set each figure is computed over —
   records finding **R-1**.
4. **Every control under D18.** Use `scripts/controls.py`; do not hand-roll.
5. **Run `scripts/compound_drift.py`** before freezing, with the new Book
   included. The lesson of `hyphen_drift()` is that a check nobody runs is not
   a check — it was written at Book 3, never called again, and two drifts sat
   in accepted work for two Books inside the class it could already see.
6. Book 10's disposition still needs a coordinator decision — see
   `00-progress-ledger.md`, A2.

### The nine source rules already used

1. **Book 2 drafter** — PG's footnote-entry list, positionally.
2. **Book 3 drafter** — the `BOOK III`/`BOOK IV` headings, bytes,
   apparatus-in diff.
3. **Book 3 reviewer** — anchorless and digit-blind, one contiguous token
   block, occurring exactly once.
4. **Book 4 drafter** — occurrence-unique needles taken from the served text,
   and a derived region.
5. **Book 4 reviewer** — global per-paragraph fingerprint alignment.
6. **Book 5 drafter** — identification by **residue**: locate the other
   twenty-three chapters, take Book 5 as what is left.
7. **Book 5 reviewer** — one global **monotone diff** of the whole 24-chapter
   edition against the whole PG file, no anchors, no needles, no fingerprints.
8. **Book 6 drafter** — a **resemblance profile** of the whole file, by suffix
   automaton, asking not *is the chapter here?* but *is there anywhere else it
   could have come from?* — and **reporting the second-best match** rather than
   bounding it.
9. **Book 6 reviewer** — **letter-blind typographic shape**: every letter
   destroyed, PG's footnote numerals deleted, all other pointing kept exactly,
   and the chapter located by word lengths and punctuation alone. The first rule
   that does not read Butler's letters at all; the other eight all do.

All nine so far have been about *location* or *resemblance*. A ninth might go
at it from a different direction entirely: the **edition's own internal
evidence** (Butler's footnote numbering, his own cross-references, the
apparatus he prints), or **PG's file structure** as a published artefact
(line-count arithmetic, the transcriber's note, the table of contents), neither
of which any rule so far has used as its primary instrument.

## Hard rules

Content-only, under `books/staged-replacements/odyssey/` alone. Zero Anthropic
API spend. English only. Nothing merged, deployed, registered, and the served
`app/public/data/editions/**` is never written.
