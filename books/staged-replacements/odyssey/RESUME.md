> **2026-09-23: the edition is complete.** Start at `edition/RELEASE-PACKET.md`. The accepted file per Book is listed there (`candidate-accepted.json` for Books 10–24, and named vN files for Books 1–9).

# RESUME — where this package stands, for the next worker

Updated continuously. Read this first, then `WORKFLOW.md`.

**Last updated:** 2026-09-13, session `session_01K5bL9oWzAagjTMExsyUADi`
(worker 13). **Books 1–9 are accepted. Book 10 is FROZEN at `candidate-v1`
and owes a review round.** Book 9's round 1 produced three package repairs and
all three are in: **the source is pinned to Project Gutenberg (A11)**, the
dividing marks are counted **by mark identity (D28)**, and **the prose is
checked** (`--prose`).

## State

**Basis is stated on every row, because a figure without the paragraph set it
is computed over is not a figure (R-1).** The one authoritative table is
`00-progress-ledger.md`, *The comparability table*, produced by
`python3 scripts/checks.py --all`, and since this session the prose copies of
it are **checked against the files** rather than trusted.

| Book | Step | file scored | basis | Retention | raw D17 | semicolons | dividing marks | **kept + class-changed + ADDED (D28)** | **COMPARED FIGURE (D28)** | MOVE-GAP / displaced |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | 8 — accepted, successors v3, v4 | `candidate-v2` | all 32 | 0.72703 | +20.5% | 47 → 13 | 55 → 39 | 17 + 3 + 19 | **−5.9%** | 0.05088 / 2 |
| 2 | 8 — accepted, successors v3–v6 | `candidate-v2` | all 35 | 0.90232 | +16.1% | 36 → 21 | 58 → 61 | 32 + 4 + 25 | **−2.1%** | 0.01632 / 0 |
| 3 | 8 — accepted, successor v3 | `candidate-v2` | **37 of 38** | 0.89641 | +5.5% | 39 → 32 | 53 → 47 | 38 + 1 + 8 | **−2.8%** | 0.02156 / 0 |
| 4 | 8 — accepted, successors v3–v5 | `candidate-v2` | all 81 | 0.95872 | +8.9% | 68 → 50 | 103 → 81 | 79 + 1 + 0 | **+0.3%** | 0.00431 / 0 |
| 5 | 8 — accepted, successor v3 | `candidate-v2` | all 37 | 0.93808 | +23.5% | 34 → 13 | 64 → 35 | 34 + 0 + 1 | **+2.8%** | 0.00891 / 1 |
| 6 | 8 — accepted, successor v3 | `candidate-v2` | all 26 | 0.93408 | +27.6% | 27 → 5 | 38 → 16 | 13 + 1 + 2 | **+4.5%** | 0.01156 / 2 |
| 7 | 8 — accepted | `candidate-v2` | all 29 | 0.93438 | +34.0% | 30 → 7 | 42 → 18 | 14 + 0 + 4 | **+4.8%** | 0.01217 / 1 |
| 8 | 8 — accepted | `candidate-v2` | all 50 | **0.94093** | +22.4% | 42 → 7 | 62 → 31 | 24 + 0 + 7 | **+2.0%** | 0.00692 / 0 |
| **9** | **8 — ACCEPTED** | **`candidate-v2`** | all 44 | **0.92284** | **+18.7%** | **54 → 26** | **71 → 45** | **43 + 2 + 0** | **+1.7%** | **0.01232 / 2** |
| **10** | **4 — FROZEN, owes a review** | **`candidate-v1`** | all 49 | **0.93645** | **+22.3%** | **44 → 11** | **60 → 26** | **26 + 0 + 0** | **+2.1%** | **0.00908 / 0** |

Hashes: Book 9 accepted
`f762b7a33e3517af11fe6113908e16318fbe26ad30dc17e6534854b643d36485`;
Book 10 frozen v1
`eedb949e3a668acb03d3c52b2073c5b05125840ee509f79cb2db0ed9e864a038`;
Book 8 accepted `12f2904e…`; Book 9's frozen draft `41f452ac…`.

**Book 8's retention moved from 0.93862 to 0.94093 and no character of its
accepted file changed.** `checks.py`'s `NAME_MAP` folds Butler's Roman names
onto the edition's Greek ones so the name policy does not read as a loss of
retention, and it was missing `Mars → Ares` — row 13 of D5's table, added at
Book 8 step 2 and written into `GLOSSARY.md` and nowhere else. Butler names
Mars thirteen times in Book 8. **`--all` could never have caught it**, because
it recomputes with the same map on both sides; only meeting a new name
(`Proserpine`, at Book 10) exposed it. `rendering_collisions.py` carried a
**second copy** of the table, two rows behind; there is one table now.

## THE SOURCE IS PINNED — A11, and the attacks on the fix

**What was wrong.** Every figure, census and gate in this package is computed
against `bookNN/source-bookN.json`, and that file was **loaded by naming
convention**. Its sha256 appeared in no manifest, no `ACCEPTED`, `DECLARED` or
`SUPERSEDED` row and no assertion of `prove_manifest.py`. Book 9's round 1
demonstrated it 13 of 13: rewrite twelve of Butler's full stops as semicolons,
run the ordinary `checks.py 9 --write-manifest`, and the published rate goes
21.1% → 30.2% with `--manifests`, `--all` and `--declarations` all exiting 0
and **no declaration written**; or remove **one comma**, which no recorded
figure can see, and nothing needs regenerating at all.

**`scripts/pg_source.py` — and it does not pin the source to the package's own
copy of it.** A recorded hash of a file this package also writes is a promise
it makes to itself. So:

```
gutenberg.org/ebooks/1727.txt.utf-8            the public artefact
  │  sha256 ffbdb29c…, 717 784 bytes — RE-DOWNLOADED 2026-09-13, identical
  ▼
source-texts/pg1727-butler-1900.txt            PG_SHA256, asserted every run
  │  extracted between PG's OWN markers; the footnote-anchor stream asserted
  │  to be PG's apparatus, 1…187 strictly increasing (R-4)
  ▼
PG Book N, normalized         ==  source-bookN.json, except SOURCE_DIVERGENCES
  ▼                               — four rows, each with a reason, set equality
bookNN/source-bookN.json      ==  the served chapter, character for character
```

* **`SOURCE_DIVERGENCES` is ledger A7 made load-bearing.** It was prose.
  Now it is four rows asserted in **both** directions over all 24 chapters: a
  fifth divergence fails, an enumerated one that heals fails. **This is the
  first time A7's claim has been checked by anything.**
* **clause (b4)** of `verify_manifest` requires `source_file`,
  `source_sha256`, `pg_file` and `pg_sha256` and re-runs the derivation, so
  `--manifests` and `--all` reach it.
* **`Gate.source_failures` is deliberately not `Gate.failures`.** No key of
  `DECLARED` reaches it and `manifest_checks_block()` refuses over it, so
  A11's loud form — *rewrite Butler, then re-run `--write-manifest`* — dies at
  the second step, and A9's hatch does not widen to cover it.

**`scripts/attack_source_pin.py` — eleven attacks, and the last one PASSES.**
Each is the cheapest next move once the one above it fails; all run the real
`checks.py` on a fresh copy of the package through the command line.

| | attack | result |
|---|---|---|
| 0 | control — the package as committed | must exit 0, and **it did not on the first run**; the harness had copied the package to a tree shape in which `pg_source.py` could not reach the served file, so every attack was being "rejected" for a reason unrelated to the attack. Fixed and re-run. |
| 1 | **A11(b)** — one comma removed, nothing regenerated | rejected by clause (c) and (d) |
| 2 | **A11(a)** — twelve full stops rewritten, then `--write-manifest` | rejected: the writer refuses over an edited Butler |
| 3 | edit the source **and** the manifest's `source_sha256` | rejected by the derivation |
| 4 | + edit the **served** `original-en` so clause (c) passes | rejected by (d): PG is a third file |
| 5 | + edit PG's own text so all three agree | rejected by `PG_SHA256` |
| 6 | + **declare it** — a fifth `SOURCE_DIVERGENCES` row | rejected by the **bound of four** |
| **7** | **+ edit `PG_SHA256` itself** | **PASSES — the residue** |

**Attack 7 is A9's shape and is named rather than claimed shut.** Where A9
needs one `DECLARED` row and a sentence, this needs **four files in one
commit**: the source, the served `original-en` **which this package is
forbidden to write**, the 718 KB vendored PG text, and the constant. Three of
the four have no business being touched by a content change, and the fourth is
a public artefact — `sha256(PG_URL)`, recomputable by anyone without this
repository. A hash cannot make its anchor unfalsifiable; it can make
falsifying it require editing a number whose true value somebody else
publishes. Saying more than that would be the fourth false claim of soundness
in this mechanism's history.

## D28 — the dividing marks by IDENTITY, and why every figure moved again

**Substantive finding S-1 of Book 9's round 1.** D27 asks whether Butler's
strongest mark in the aligned span was **a member** of `{; : —}`; it never
asked whether it was **the same mark**. Book 9's draft cashed two of Butler's
colons and wrote two of its own over his semicolons; the colon census read
`: 7 → 7` and the dividing census read `41 kept + 0 added`, and `README.md`
published *"not one of the 41 marks the candidate carries is its own."*

D28 splits the census into **kept by identity / class-changed / added**, names
the class changes by paragraph, and makes the compared figure the strict one.
**Six of the ten Books move**; Book 2 goes +0.0% → −2.1% and Book 1 −4.3% →
−5.9%. The D27 column is kept beside it, never over it (R-1).

**And R-8 from the same round matters here**: the two NORM RATEs agreeing to
the decimal rules out marks *written from nothing* and does **not** rule out
marks *exchanged*, so agreement is not evidence. The evidence is the middle
number being zero — which **Book 10's drafter asserts before it will write the
file**, `if changed: fail(...)`.

## `--prose` — the class that had nothing covering it

Clause (b3) recomputes sixteen figures against `manifest.json`; **four
committed files carried the same figures and nothing read any of them**. Book
9 froze with its retention published as **0.92164** in `README.md`,
`continuity.md`, `RESUME.md` and the ledger against **0.92181** in
`checks-v1.md` and `manifest.json` — exactly one matched token, i.e. computed
over a pre-freeze candidate — and `draft_book09_v1.py`'s docstring published a
**third** value, 0.91976.

`checks.py --prose`, folded into `--all`: **every number in a figure-bearing
table row of every committed record must be a figure some candidate of that
Book produces, at the precision it is written.** 359 numbers checked. It is
deliberately narrower than *disagrees with the accepted file* — a `README.md`
legitimately prints the frozen draft's figures beside the accepted
successor's — and what it catches is what R-1 actually was: **a figure no file
in the package produces.**

**Declared blind:** it reads table ROWS. A figure written into a sentence is
not seen, and the published figure in a cell is taken to be what precedes the
first semicolon.

## Book 9 is ACCEPTED

`book09/ACCEPTANCE.md`. 19 corrections in 15 paragraphs, 6 findings declined
and asserted still present.

* **Six rendering collisions the check could not see**, all under arrow B's
  rarity gate — `drove`→`sent`, `gave`→recast, `snatch`→`clutch`, `made his
  supper of`→`devoured`, `cried`→`exclaimed`, `flock`→`them`. The gate is
  `RARE_MAX = 3` paragraphs and `MIN_LEN = 5`, and **the words a narrative
  uses as discriminators are its common words.**
* **`civilized` → `humane`**, and §6's reason for the neighbouring change had
  cited **the draft's own word as Butler's**.
* **Four of Butler's marks restored** — his colon at P012, his colon at P021,
  his semicolon at P031, and **his semicolon at P034, found by the flow read**.
* **The flow read cost the Book its `16 → 0`.** Restoring P034's semicolon
  rejoins a sentence Butler wrote at 59 words; the candidate's is 61, so the
  sixty-word figure is `16 → 1` and the growth is declared. A worse-looking
  number and a better text.
* **S-2, the truth**: 177 paragraphs across chapters 9-12 open a quotation
  nobody closes, over a span of 186. B09-P001 opens with the poet's frame and
  B09-P044 closes nothing. `PUNCTUATION.md` §2 carries the count.
* **D29** — *a repair restores; it does not paraphrase* — from the shape of
  the fifteen pre-freeze repairs: eleven restore Butler's word verbatim, two
  keep his phrasing, two are forced, none invents a paraphrase.

## Book 10 is FROZEN at step 4

`book10/`. 49 paragraphs, 5,684 words. **26 dividing marks, every one the mark
Butler wrote in that place** — 26 kept by identity, 0 class-changed, 0 added,
and the drafter refuses to write the file otherwise. **MOVE-GAP 0.00908 with
ZERO displaced runs.**

**The sixteenth source rule reads three characters.** Every character that is
not `.`, `?` or `!` is deleted; what survives is one symbol per sentence. Book
X's string is 175 characters and occurs in PG's body exactly once. Clause 1
locates 23 of 24 chapters and fails on **chapter 3** (0 occurrences — the
B03-P038 splice); clause 3 then fails **chapters 1 and 4**, whose divergences
are a space and a capital that the locator cannot see. **21 verify, 3 fail,
and the three are exactly the three chapters A7 records — with which clause
fires saying which kind.**

**Its audit failed it twice.** The control harness's own **D18 clause (a)
compared a list with itself** (the snapshot aliased the lists the mutation
edits in place), and clause 2 resolved a paragraph boundary with
`bounds.index()` when **eight** of PG's paragraphs end on a colon or semicolon
and contribute no terminator, so the offsets are not injective — chapter 4
failed for a reason that had nothing to do with chapter 4.

**The collision check cost nine repairs at draft time** and every one restores
Butler's own word or removes a word the draft introduced. **The compound check
fired twice and both were real**, and opening `drink-offering` to match five
accepted Books added one word to a sentence Butler wrote at 53 — the Book's
one declaration.

## A7 — resolved into three hashed options, and B+ is recommended

Book 9's round 1 (S-7) found A7 incomplete: Butler's Preface says **Books ii.
AND iii.** end with a comma and **PG honours it for iii only**, so A3-widened
as prepared would open Book III lower-case *after a full stop*. All the
options are now prepared and hashed by raw substitution in a scratch copy,
each asserted unique, each re-parsed, paragraph counts asserted unchanged;
`0cc76350…` and `e45d6c4d…` reproduced independently of the session that first
computed them. **The served file was not written.**

| option | | sha256 |
|---|---|---|
| A | truncation alone | `0cc76350…` |
| B | + both capitals (A3 WIDENED) | `e45d6c4d…` |
| **B+** | **+ Book II's terminal comma** | **`48397979…`** |
| C | truncation + Book IV's capital only | `56a2a258…` |

**B+ is the only option that leaves the text saying what Butler says he
wrote**, and the pin makes its cost exact: it is the one place the edition
would deliberately print something PG does not, so it costs **one row** of
`SOURCE_DIVERGENCES` against a bound of four, leaving two. Whoever applies it
must write that row with the Preface quoted in it, or `checks.py` fails.

## The instruments, and what each is for

```
python3 scripts/checks.py N              # writes bookNN/checks-vN.md; gates + manifest + THE PIN
python3 scripts/checks.py --all          # figures AND gates AND manifests AND declarations AND PROSE AND the pin
python3 scripts/checks.py --prose        # every figure-bearing table row of every record
python3 scripts/checks.py --declarations # the gates, over every key of DECLARED; coverage both ways
python3 scripts/checks.py --manifests    # the read side; runs the gates and the pin
python3 scripts/checks.py --audit        # 22 controls under D18, 2 declared blindnesses
python3 scripts/checks.py N --write-manifest   # the only manifest writer
python3 scripts/pg_source.py             # THE PIN, with its eight controls
python3 scripts/attack_source_pin.py     # 11 attacks on the pin; the 11th passes and is named
python3 scripts/prove_manifest.py        # 9 attacks, 24 assertions, ~9 minutes
python3 scripts/rendering_collisions.py  # arrows A, B and C; 7 controls
python3 scripts/collision_triage.py N    # every row touching Book N, with a disposition
python3 scripts/compound_register.py     # §H.1 in every continuity.md
python3 scripts/compound_drift.py        # cross-Book drift — POSITION-AWARE now
python3 scripts/verify_source_book10.py  # the sixteenth source rule, with its audit
python3 scripts/controls.py              # D18's own self-test
```

## Next, in order

1. **Book 10's review round.** `book10/review-instructions.md`, four questions,
   17 packets. The instructions open by asking the reviewer to **check the
   premises of the questions** — Book 9's round found question 1 of its own
   instructions false on the facts and question 3 a false dichotomy, and
   declined both, and both refusals were right.
2. Then **Book 11** — subject to A2, and note that Book 11 is the third
   quarter of the chapters 9-12 quotation and meets more Roman names than any
   Book so far (D5's table will grow).
3. **Report six numbers with the basis on every one**: retention, raw D17
   rate, **the D28 compared figure**, **dividing marks split kept /
   class-changed / added**, **MOVE-GAP with displaced runs beside it**, and
   the word ratio.
4. **Run every instrument above in any session that touches the package** —
   the collision check and the compound register **before** freezing. Book 10
   is the demonstration: nine repairs and two compound corrections at draft
   time, which would have been eleven findings and a successor at review time.
5. **Anders still owes two decisions**: ledger **A2** (Book 11's disposition)
   and **A3/A7** — now three hashed options with **B+** recommended.

### The sixteen source rules already used

1. Book 2 drafter — PG's footnote-entry list, positionally.
2. Book 3 drafter — the `BOOK III`/`BOOK IV` headings, in bytes.
3. Book 3 reviewer — anchorless, digit-blind, one contiguous token block.
4. Book 4 drafter — occurrence-unique needles and a derived region.
5. Book 4 reviewer — global per-paragraph fingerprint alignment.
6. Book 5 drafter — identification by **residue**.
7. Book 5 reviewer — one global **monotone diff** of the whole file.
8. Book 6 drafter — a **suffix-automaton resemblance profile**.
9. Book 6 reviewer — **letter-blind typographic shape**.
10. Book 7 drafter — **PG's own hard wrapping**, as line counts.
11. Book 7 reviewer — the **capitalization bitstring**, one bit per token.
12. Book 8 drafter — PG's **argument lines and table of contents**, body-blind.
13. Book 8 reviewer — **marker-to-marker byte tiling**. Its audit failed **five
    times**.
14. Book 9 drafter — **the arithmetic-only word-count partition**, 44 integers.
15. Book 9 reviewer — **Butler's own PREFACE** and a parameter-free
    maximum-subarray over a ±1 quotation stream. It reads two characters.
16. **Book 10 drafter — the SENTENCE-TERMINATOR SEQUENCE. It reads three
    characters, `.` `?` `!`, and nothing else.** Its audit failed it twice.

**A seventeenth has to find another channel again.** Still unused: **the
footnotes' cross-references between one another** — and note that the obvious
form of it does **not** work and was measured rather than assumed: of the 63
footnotes that cite an Odyssey Book by Roman numeral, only **8** cite the Book
they are anchored in, so self-reference does not locate; **the appendix's plan
of Odysseus's house** and the paragraphs Butler says he reprinted there; and
the **Greek** in the footnotes, which appears nowhere in the body and so
separates apparatus from text without reading a word of either.

## What the checks would STILL not catch

1. **A sentence divided at the wrong seam.** B08-P047 and B09-P034 are the two
   clearest instances and **no measure reached either** — the second was found
   by the flow read, which is a person reading, not an instrument. D27 and D28
   do not close this; they remove the reason there was nothing to lose by
   dividing everywhere.
2. **A garden path the draft builds out of a mark** (B07-P020, B08-P044,
   B09-P021).
3. **Register.**
4. **A figure carried by a single word.**
5. **Whether a mark that WAS cashed should have been.** D28 counts the marks
   and prices them; it cannot say that any one of Book 10's thirty-four
   conversions is right.
6. **A discrimination lost ACROSS paragraphs.** Arrow C closes the
   same-paragraph case only, and arrow B's gate excludes exactly the common
   words a narrative uses as discriminators. Book 9's round found six; the
   cheap closure — a second arrow-B pass gated on **within-Book repetition**
   instead of rarity — is **specified and not built**.
7. **Whether an ARROW'S REPAIR is right.** Book 8's `minstrelsy`. **D29
   narrows it** — a repair prefers Butler's own word — and four of Book 10's
   nine repairs still had to choose a third word, because Butler's own was the
   one that could not be kept.
8. **Whether a disposition in `collisions.md` or §H.1 is RIGHT.** The
   `kept-elsewhere` boilerplate now names the one decision each row contains
   and declares that it cannot rule on its accuracy — which makes the row
   easier to check, not unnecessary to check.
9. **A false positive in an arrow from a SPELLING variant.** New: arrow B
   reads Butler's `shewed` and `showed` as two words. Ruled by hand.
10. **Whether a cross-Book instrument's ROW COUNT in a record is current.**
11. **A defect PG and the served file SHARE.** Every source rule is blind to it
    by construction, and there are now **three demonstrated instances**:
    `Where do sail from?` (B09-P015), `come see you` (B09-P022), and PG's Book
    II ending in a full stop where Butler's own Preface says he preferred a
    comma. **The package still has no register for this class.** A7 cannot
    hold them, because A7 is served-file-against-PG and here the two agree.
12. **A figure written into a SENTENCE rather than a table row.** `--prose`
    closes the rows and declares this.
13. **A rationale that cites the draft's own invention as the source's**
    (B09-P010's §6). `continuity.md` is prose and nothing reads it for sense.
14. **A word supplied where the source is defective, undeclared.** `checks.py`
    has **no clause for D16 at all**; the count is asserted by a sentence.
15. **A repair that re-creates its own collision elsewhere in the same draft.**
    Book 9's v2 opened one (`answer`) and Book 10's draft opened several — and
    the only reason they were caught is that the check was **re-run after the
    repairs**, which is now what step 6 does. Nothing enforces that.
16. **THE SOURCE'S ANCHOR.** The pin reduces the attack from *edit one JSON
    file* to *edit four files including one this package may not write and a
    constant a third party publishes*. It does not eliminate it. Attack 7 of
    `attack_source_pin.py` is that attack, it passes, and it is in the script.

## Hard rules

Content-only, under `books/staged-replacements/odyssey/` alone. Zero Anthropic
API spend. English only. Nothing merged, deployed, registered, and the served
`app/public/data/editions/**` is **read** (by `compound_register.py`,
`pg_source.py` and the source verifiers) and **never written**.
