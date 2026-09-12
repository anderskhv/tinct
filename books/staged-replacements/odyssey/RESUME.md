# RESUME — where this package stands, for the next worker

Updated continuously. Read this first, then `WORKFLOW.md`.

**Last updated:** 2026-09-12, session `session_01K5bL9oWzAagjTMExsyUADi`
(worker 5). Book 5 accepted; four successors built; Book 6 drafted and frozen,
waiting on its review.

## State

| Book | Step reached | Accepted file | sha256 | Retention | Splitting rate | Semicolons (D19) |
|---|---|---|---|---|---|---|
| 1 | 8 — accepted, successor `candidate-v3.json` | `candidate-v2.json` (successor v3) | v3 `c97e20f5…4807b57c` | **0.727** accepted / 0.728 v3 | +20.5%, 60+ 10 → 0 | 47 → 13 |
| 2 | 8 — accepted, successors v3, v4 **and v5** | `candidate-v2.json` (latest `candidate-v5.json`) | v5 `4f9c336e…41761957` | 0.902 | +16.1%, 60+ 7 → 4 | 36 → 21 |
| 3 | 8 — accepted, successor `candidate-v3.json` | `candidate-v2.json` (successor v3) | v3 `a79bacf6…8554ce1e` | 0.897 | +5.5%, 60+ 9 → 6 | 39 → 32 |
| 4 | 8 — accepted, successor `candidate-v3.json` | `candidate-v2.json` (successor v3) | v3 `6926b9f9…f8304534` | **0.95872** | +8.9%, 60+ 17 → 3 | 68 → 50 |
| 5 | **8 — accepted** | **`candidate-v2.json`** | **`acbfcb03…b51479e9`** | **0.93808** | **+23.5%, 60+ 9 → 1** | **34 → 13** |
| 6 | **3 — drafted and frozen; step 4, the review, is next** | — | v1 **`9391ca16…3c0413f0`** | **0.93669** | **+27.6%, 60+ 7 → 1** | **27 → 4** |

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

1. **Book 6 step 4**: the independent review, by a separate reviewer session,
   following `book06/review-instructions.md`. Findings under `book06/review/`.
   Then steps 5–8 in the established pattern.
2. **Book 7** after that, in numerical order. Verify its source by a **ninth**
   kind of rule — the eight used are listed below — **audit the rule before
   trusting it** (four drafters/reviewers have now audited theirs and all four
   audits *failed* the rule as first written), then diff word for word.
   Byte-identity to a re-run of your own build script is not verification.
3. **Report three numbers**: retention, splitting rate (**D17**), and the
   semicolon count against Butler's (**D19**).
4. **Every control under D18.** Use `scripts/controls.py`; do not hand-roll.
5. **Run `scripts/compound_drift.py`** before freezing, with the new Book
   included. The lesson of `hyphen_drift()` is that a check nobody runs is not
   a check — it was written at Book 3, never called again, and two drifts sat
   in accepted work for two Books inside the class it could already see.
6. Book 10's disposition still needs a coordinator decision — see
   `00-progress-ledger.md`, A2.

### The eight source rules already used

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

All eight so far have been about *location* or *resemblance*. A ninth might go
at it from a different direction entirely: the **edition's own internal
evidence** (Butler's footnote numbering, his own cross-references, the
apparatus he prints), or **PG's file structure** as a published artefact
(line-count arithmetic, the transcriber's note, the table of contents), neither
of which any rule so far has used as its primary instrument.

## Hard rules

Content-only, under `books/staged-replacements/odyssey/` alone. Zero Anthropic
API spend. English only. Nothing merged, deployed, registered, and the served
`app/public/data/editions/**` is never written.
