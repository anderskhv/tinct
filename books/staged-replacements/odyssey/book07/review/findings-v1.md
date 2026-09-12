# The Odyssey, Book 7 — independent review, round 1

**Subject:** `book07/candidate-v1.json`, sha256 recomputed here as
`bf8cf2f76f4670daab55daf1da265ba7b1839c0cd6680e3c5691fac8d382dc33` — the frozen
hash. Source `source-book7.json`, sha256 recomputed as
`1c3c67f99747b2e919845a310867f190e592131be953b34e4f5b66c895d35152`.
29 paragraphs, 10 packets.
**Trunk:** `claude/odyssey-modern-en-20260911` @ `f4d7fbcf7`.
**Review branch:** `claude/odyssey-book07-review-20260912`, own worktree.
**Reviewer:** a separate session. Did not draft this Book.

**Verdict: accept after corrections.**

| severity | count |
|---|---|
| substantive | **3** |
| minor | **10** |
| optional | **7** |
| records | **6** |
| paragraphs with no material issue | 13 of 29 |

Coverage is complete: every paragraph `B07-P001` … `B07-P029` has exactly one
entry in §8, a numbered finding or "No material issue found".

Nothing outside `book07/review/`, `../../RESUME.md` and
`../../00-progress-ledger.md` was written. `candidate-v1.json` is untouched
(**D10**); its hash above was recomputed after the review, not before.

**The two things to read first**, because they are the two the Book's own record
gets wrong and no check in the package can reach:

* **S-1.** Six of the candidate's fourteen semicolons are **not Butler's**. Eight
  of his thirty survive. Three package documents say "fourteen of Butler's
  thirty semicolons are kept". The six additions raise **NORM RATE from +3.0%
  to the published +7.5%**, and `--audit` has no control for the operation that
  does it.
* **S-2.** `book07/manifest.json` records a `checks-v1.md` sha256 that does not
  match the frozen `checks-v1.md`. The enforcement's one moving part is already
  broken, on the first Book it was built for, at the commit that is this
  review's subject.

---

## 0. What was re-run rather than taken on trust

The drafter's numbers were not read off `checks-v1.md`. Every one was recomputed
from the two JSON files by `book07/review/checks_reproduce.py`, which imports
nothing from `scripts/` and reimplements each measure from its written
definition, so a typo in `checks.py` would show here as a disagreement.

```
python3 book07/review/checks_reproduce.py           # output: reproduce-output.txt
python3 book07/review/verify_source_book7_review.py # output: verify-output.txt
python3 scripts/checks.py 7                         # byte-identical to the frozen checks-v1.md
python3 scripts/checks.py --all                     # exit 0
python3 scripts/checks.py --audit                   # 10 controls, 2 declared blindnesses
python3 scripts/rendering_collisions.py             # 4 controls
python3 scripts/compound_drift.py                   # 4 controls, 1 declared blindness
```

**Basis on every row (R-1): all 29 paragraphs.**

| measure | published | recomputed independently | |
|---|---|---|---|
| words, Butler → candidate | 3,347 → 3,365, ratio 1.00538 | 3,347 → 3,365, **1.00538** | ✓ |
| retention, aggregate-join (canonical) | 0.93943 | **0.93943** | ✓ |
| retention, per-paragraph (order) | 0.93943 | **0.93943** | ✓ |
| retention, bag (order-blind) | 0.95220 | **0.95220** | ✓ |
| **MOVE-GAP** (bag − order), D20 | 0.01277 | **0.01277** | ✓ |
| decomposition: (1−bag) + MOVE-GAP = 1−order | — | 0.04780 + 0.01277 = **0.06057** | ✓ no residue |
| sentences, Butler → candidate | 103 → 129 | **103 → 129** | ✓ |
| splitting rate, raw (D17) | +25.2% | **+25.2%** | ✓ |
| **NORM RATE** (D20) | +7.5% | **+7.5%** as computed — **but see S-1** | ⚠ |
| sixty-word sentences | 7 → 0 | **7 → 0** | ✓ |
| semicolons (D19) | 30 → 14 | **30 → 14** as counted — **but see S-1** | ⚠ |
| displaced runs | 1, at B07-P013 | **1, at B07-P013**, 17 tokens | ✓ |
| candidate sentences of 40+ words | 17 | **17** | ✓ |
| lowest per-paragraph word ratio | 0.976 at B07-P027 | **0.9756 at B07-P027** | ✓ |
| paragraphs byte-identical to Butler | none | **none** | ✓ |

`checks.py 7` re-run in this worktree writes a `checks-v1.md` **byte-identical**
to the frozen one. That is the first time in this package a published checks
file has been reproducible by running something, and it is worth saying plainly:
the S-2 disease of Book 6's round 1 is cured for the figures.

**The D17 splitter was probed, not trusted.** D17 fixes the Book 4 reviewer's
splitter verbatim so the numbers stay comparable; comparable is not correct. Two
further splitters were run:

| splitter | Butler → candidate | raw rate | NORM RATE |
|---|---|---|---|
| the package's (D17) | 103 → 129 | +25.2% | +7.5% |
| boundary only before a capital or an opening quote | 103 → 129 | +25.2% | +7.5% |
| every terminal mark, quotation marks disregarded | 102 → 128 | +25.5% | +7.6% |

The spread is 0.3 of a point. **The published rates are the text, not the
measure** — which is a result the package has never had and should keep.

**Names, D4 and the hygiene assertions all verify exactly as claimed**, and none
of them is taken on the drafter's word:

* Ulysses 18 → Odysseus 18, Minerva 8 → Athena 8, Jove 6 → Zeus 6, Neptune 4 →
  Poseidon 4, Mercury 1 → Hermes 1, Vulcan 1 → Hephaestus 1; **no Roman form
  survives anywhere in the candidate**. `Arete` is untouched, seven times, and
  the drafter is right that she is this Book's live hazard.
* **D4:** 23 opening and 19 closing double marks in Butler; 23 and 19 in the
  candidate; the unbalanced paragraphs are `[6, 7, 21, 22]` on **both** sides.
  Reproduced exactly.
* One `‘` and its `’` at B07-P021. Butler carries six `’` and the candidate
  five — the one lost is an apostrophe in `Ulysses’`, which **D7** disposes of.
* No ASCII quote or apostrophe, no square bracket, no whitespace defect, no
  rewrap-split compound. All gated, all pass.

---

## 1. Source verification — an ELEVENTH kind of rule, and its audit

`book07/review/verify_source_book7_review.py`, output in `verify-output.txt`.

**Primary instrument: the capitalization bitstring.** Each whitespace token is
reduced to one bit — `1` if its first *letter* is upper case, `0` if lower case;
a token containing no letter emits nothing. Letter identity, word length, every
punctuation mark, every line break and every digit are destroyed before the rule
looks at anything. What survives is where the proper nouns and the sentence
openings fall. The ten rules already used read Butler's letters (1, 3, 4, 5, 6,
7, 8), his pointing and word lengths (9), PG's transcriber wrapping (10) or his
headings in bytes (2). **None of them reads case**: the ninth explicitly maps
every letter to `a`, so case is destroyed there too.

**Corroborating channel: the FOOTNOTES section's own internal structure** — its
entry numbering as a self-consistent sequence and Butler's cross-references
*between* notes. `RESUME.md` names this as a channel nothing has used as an
instrument.

| clause | result |
|---|---|
| 0 — premises | `source-book7.json` **is** the served chapter 7, whitespace-normalized, and carries **no digit of its own**, so clause 2's marker-stripping cannot destroy a number Butler printed |
| 1 — locate, case only | 3,347 bits, 7.5% capitalized; occurs **exactly once** in PG's body. Verdict is the **pair** `(1, 35508)` |
| 2 — confirm, characters restored at the span the bit index gives | **0 of 3,347** tokens differ from the served chapter once trailing footnote numerals are removed |
| 3 — the neighbourhood, reported not bounded | the longest case shape shared with any part of PG outside a **guard band of the chapter's own length** on each side: **114 bits against 3,347** |
| 4 — the apparatus | numbered 1…187 contiguously; 8 note-to-note cross-references (72→64, 73→43, 111→64, 128→75, 132→83, 157→156, 163→175, 183→156), every target in range, none self-referential; markers inside the located span **57…64, contiguous and ascending** |

**Six controls fire on both D18 clauses; two blindnesses are declared.**

### 1.1 The audit — what actually failed, and what did not

**One clause failed on first execution, and its cause is a defect in PG #1727
rather than in the rule.** Clause 4 asserted 1…N contiguous numbering and fired:
186 entries against a maximum of 187, note **29 missing**. Its opener is
**transposed** — `29[] [ The geography of the Ægean…` where all 186 others read
`[29] [ …`. See **R-3**. The fix is not a tolerant parse, which would have
swallowed the defect and licensed a second: the malformed opener is matched
explicitly, counted, asserted to be exactly `[29]`, and printed by name.

**Clauses 0–3 passed on first execution, and this review states that plainly
rather than dressing it as a failure that did not happen.** Six audits before
this one failed the rule as first written and the last two failed three times
each, so a clean first run needs an explanation. It has one and it is not luck:
**the three traps the package's own record names were designed against before
the first run**, read out of the record rather than rediscovered.

* *A count of zero reported as a pass* — the ninth and tenth rules' shared
  failure and the shape the brief names. Clause 1's verdict is the **pair**, and
  the clause **exits** on any count that is not exactly 1. The proximate cause of
  both earlier zeroes was PG's footnote numerals set flush against a word, so
  this rule takes its bit from a token's **first** letter, where a trailing
  numeral cannot reach it, and clause 0 asserts the chapter has no digit.
* *"The chapter nearly matches itself"* — the tenth rule's clause-2 failure.
  Clause 3 excises a guard band of the chapter's own full length on each side
  before measuring. The 114 bits is the real second best.
* *A control that cannot fail* — D18 clause (a). `lower_a_capital` raises rather
  than returning unchanged if there is no interior capital to lower.

**The controls were then made harder, because four letter-flips are not an
audit.** Two controls plant the defect this whole family of rules exists to
catch and which **none of the eleven had ever been made to face**: the
**B03-P038 splice** — a paragraph replaced by the served *modern* edition's own
paragraph for the same position, same events, same proper nouns — and a
paragraph of Butler's **own Book VI** moved into Book VII. Both fire. That is the
one recommendation this section leaves behind: a source rule that catches a
lowered capital and not a spliced paragraph has answered the easy question, and
the splice is the only failure this package has actually suffered.

**Source verification holds.** Book 7's source is Butler's Book VII of PG #1727,
character-identical to the served chapter apart from the eight footnote
numerals, confirmed through a channel none of the ten used.

---

## 2. Substantive findings

### S-1 — Six of the fourteen semicolons are the drafter's own, and they are worth 4.5 points of NORM RATE

`README.md`, `continuity.md` §7 and `review-instructions.md` question 4 all say
the same thing: *"Fourteen of Butler's thirty semicolons are kept"*, and
*"five of them in one paragraph"* (B07-P011). Both halves are wrong, and the
second is checkable in one line: **B07-P011 carries two of Butler's semicolons,
not five.**

Each of the candidate's fourteen semicolons was aligned to Butler's own pointing
at the same place, by anchoring on the four words before it:

| # | ¶ | Butler's mark there | |
|---|---|---|---|
| 1 | P007 | `;` | kept |
| 2 | P010 | `;` | kept |
| 3 | P010 | `;` | kept |
| 4 | P011 | `;` | kept |
| 5 | P011 | `;` | kept |
| 6 | P011 | **`,`** | **added** |
| 7 | P011 | **`,`** | **added** |
| 8 | P015 | `;` | kept |
| 9 | P018 | **`,`** | **added** |
| 10 | P019 | **`,`** | **added** |
| 11 | P021 | `;` | kept |
| 12 | P026 | `;` | kept |
| 13 | P026 | **`,`** | **added** |
| 14 | P028 | **`,`** | **added** |

**Eight of Butler's thirty survive. Six of the candidate's fourteen are new.**
Three paragraphs end with more semicolons than Butler wrote (P011 2→4, P019 0→1,
P028 0→1) and P018 hides its addition behind a net fall of 2→1.

**Why it matters, and it is not bookkeeping.** **D20** clause (a) adds each
text's own semicolon count to its own sentence count on both sides so that
converting a semicolon into a period is worth exactly zero. The corollary was
never stated and nobody has tested it: **converting a comma into a semicolon is
worth a full division.** It adds nothing to the sentence count, adds one to the
candidate's semicolon count, and therefore scores exactly what a real period
would score — while leaving the clause chain inside one sentence, which is the
thing D17, D19 and D20 exist to detect the absence of. It is the mirror of the
operation D20 was written to price out, and it is *cheaper*, because a period
costs a recast and a semicolon costs a keystroke.

On Butler's own pointing — that is, scoring the six additions as the commas
Butler wrote:

| | src_norm | cand_norm | NORM RATE |
|---|---|---|---|
| as published | 133 | 143 | **+7.5%** |
| with the six added semicolons left as Butler's commas | 133 | 137 | **+3.0%** |

That moves Book 7 from **second in the package** (behind Book 5's +8.0%) to
**fifth of seven**, below Books 5, 6 and 2 and above only Books 4, 3 and 1. The
Book's central claim — *"what says the rest is real is NORM RATE +7.5%"* — is
made on a figure 60% of which is the drafter's own new pointing.

**`scripts/checks.py --audit` cannot see this.** Its NORM RATE controls are
*"cashing a semicolon leaves it EXACTLY where it was"* and *"the raw D17 rate DOES
move under the same mutation"*. There is no control in either direction for
comma → semicolon, which is the one mutation that moves NORM RATE without moving
anything a reader experiences.

**What to do, in four parts.**

1. **Correct the record** (R-1): 30 → 14 is right as a count; "fourteen of
   Butler's are kept" is not. The true statement is *8 kept, 6 added, net 14*.
2. **Report NORM RATE with added semicolons excluded**, or report both. The
   honest primitive is *semicolons Butler wrote that the candidate still
   carries*, which is what D19's numerator was always meant to be. A one-line
   change to `semicolons()` — return the pair (kept, added) — makes every future
   Book's figure say what it means, and it is cheap because the alignment used
   here is four source words and a lookup.
3. **Add the control** to `--audit`: *a comma raised to a semicolon must not
   move NORM RATE.* If the package decides it should move it, that is a decision
   and it belongs in D20 in writing; today it moves it silently.
4. Three of the six additions are also wrong as English — see **M-6**. Two are
   right and should stay — see §8, B07-P011.

### S-2 — the manifest is write-only, and it is already broken on Book 7

The enforcement is stated as structural: *"`build_book_package.py` writes
`manifest.json` **only if** the gates pass, and records the sha256 of the
`checks-vN.md` that run produced. A package directory whose checks did not run
has no manifest."* The write side is real and was demonstrated by the drafter.
**There is no read side, and without one the mechanism decays into a claim about
the past.**

**It has already decayed, at the commit this review is of.**

```
book07/manifest.json  →  checks.sha256 = 88952e2be44200d9a44584a7364911e3…
book07/checks-v1.md   →  actual        = 6ecfeeb4568e666c29ed8c343204d935…
```

Working tree, `HEAD` and trunk `f4d7fbcf7` all carry the same `checks-v1.md`, so
this is not an artefact of the review. The cause is visible in the history: the
last trunk commit, *"checks.py: do not print the subject twice once its Book is
accepted"*, changed how `checks-v1.md` renders; the file was regenerated and the
manifest was not. **The one moving part of the enforcement recorded a hash of a
file that no longer exists, on the first Book it was ever built for, and nothing
noticed** — because nothing ever reads it.

**And the manifest survives a candidate that fails the gates.** Demonstrated in
a scratch copy of the package (the package itself was not written):

```
plant a byte-identical paragraph and a compound drift in book07/candidate-v1.json
python3 scripts/checks.py 7   → exit 1, "GATES FAILED: ✗ byte-identical … ✗ compound drift"
book07/manifest.json          → still present, checks.all_gates_passed: true
```

`checks.py` does not remove the manifest; only `build_book_package.py` does, and
only when it is re-run — which it refuses to do for a frozen Book without
`--force`. So **a package directory can carry a manifest asserting that all
gates passed while its candidate fails them**, which is precisely the state the
mechanism was built to make impossible.

**The fix is a read side, and it is small.** `checks.py N` should, at the end of
a run, load `bookNN/manifest.json` if it exists and fail on any of: the recorded
candidate sha256 not matching the candidate on disk; the recorded checks sha256
not matching the checks file it just wrote; `all_gates_passed: true` beside a
non-empty gate list. Add `checks.py --manifests` to do the same for every Book at
once. Until then the correct reading of a manifest is *"a build once passed,
against files whose identity is not asserted"* — which is weaker than the
package believes and should not be described as structural.

Two further observations, both small and both recorded rather than argued:
Books 1–5's manifests carry no `checks` key at all (they predate the rule) and
nothing fails on their absence; and `build_book_package.py`'s `FROZEN` guard
means the natural repair for Book 7's stale hash — rebuild — is the one thing
that is refused, so the read side is not optional.

### S-3 — `MIN_PARA_RATIO` is a relaxed threshold, not an enumeration, and the disposition claims otherwise

The brief asks whether the enumeration records what is there rather than quietly
licensing new instances. **Two of the three tables do. One does not.**

* **`BYTE_IDENTICAL`** — honest, and the right shape. `same == BYTE_IDENTICAL.get(book, [])`
  is exact-list equality in both directions: Book 4's seven are asserted by
  index, an eighth fails, and a Book that declares none fails on the first. This
  is the model.
* **`LEGACY_GROWTH`** — honest in shape (each instance enumerated with its two
  word counts, and `missing` fails when a Book no longer carries a declared
  growth), with one narrow hole — see **R-5**.
* **`MIN_PARA_RATIO = {1: 0.86}`** — **not an enumeration at all.** It is the
  gate's threshold lowered for the whole of Book 1. The comment beside it and
  `RESUME.md` both say *"Disposition: nothing weakened, nothing exempted — what
  each Book carries is enumerated and asserted (`BYTE_IDENTICAL`,
  `MIN_PARA_RATIO`, `LEGACY_GROWTH`), each entry with its reason, so no Book can
  quietly acquire a twelfth instance."* For this table that is false. Book 1
  carries exactly five paragraphs under 0.90 —

  | paragraph | ratio |
  |---|---|
  | B01-P017 | 0.8621 |
  | B01-P011 | 0.8659 |
  | B01-P001 | 0.8850 |
  | B01-P016 | 0.8878 |
  | B01-P009 | 0.8889 |

  — and **a sixth, a seventh and a tenth, anywhere in the Book, at any depth down
  to 0.86, would pass silently.** That is the "quietly acquire" case, in the one
  place the disposition says it is closed.

**Fix, in `BYTE_IDENTICAL`'s shape and no more expensive:**
`MIN_PARA_RATIO = {1: [(17, 0.8621), (11, 0.8659), (1, 0.8850), (16, 0.8878), (9, 0.8889)]}`,
asserted as an exact list of indices with a tolerance on each ratio. Then Book 1
is recorded, not exempted, and the disposition's own sentence becomes true.

---

## 3. Minor findings

### M-1 — B07-P012: `precincts` → `walls`, a collision the check found and nobody ruled on

Butler: *"he crossed the threshold and went **within the precincts** of the
house."* Candidate: *"went **inside the walls** of the house."*

`scripts/rendering_collisions.py` prints this row under **ARROW B**:

```
walls    precincts (B7-P012)  |  walls (B7-P005)  |  walls (B7-P009)
```

One rendering made to carry two Butler words — the arrow that was added to the
package precisely because it is the defect a drafter applies by hand at one place
and misses at another. It was not among the seven repaired and not among the four
handed over; it is in neither list and in no record (see **R-2**).

**And it is not only a collision, it is a sense change.** `precincts` is the
enclosure — Odysseus has crossed the threshold and the next sentence has him
going *"straight through the court"*. *"Inside the walls of the house"* says he
is inside the building, and it lands in a Book where **B07-P009** has just spent
a sentence on the house's literal walls: *"The walls on either side were of
bronze from end to end."* Three paragraphs apart, one word, two referents and a
wrong one.

**Repair:** *"went inside the courtyard of the house"*, or *"went in through the
gate into the courtyard"*. Either keeps Butler's enclosure and frees `walls` for
the bronze.

### M-2 — B07-P009 and B07-P020: `abode` → `house`, twice, once eleven words from Butler's own `house`

B07-P009, one sentence: *"where she entered the **abode** of Erechtheus. But
Odysseus went on to the **house** of Alcinous."* Butler wrote `abode` and
`house`; the candidate writes `house` and `house`.

This is the **B06-P019 shape exactly** — and it is the shape the drafter
identified and repaired at B07-P021, where Butler's `dwells` and `lives` are
kept eleven words apart on the stated ground that flattening them would be the
mirror defect. The same reasoning applies here and was not applied. B07-P020
repeats it: *"every man in his own **abode**"* → *"every man to his own
**house**"*.

`rendering_collisions.py` cannot see it: arrow B keys on the rendering, and
`house` is far too common to pass the rarity gate. **That is a demonstrated
blind spot of the check** and it is worth recording beside records finding R-5
of Book 5's round 1: the rarity gate is applied to the key, so a *common*
rendering absorbing a *rare* Butler word is invisible in both arrows.

**Repair:** B07-P009 *"entered the home of Erechtheus"*; B07-P020 *"every man to
his own home"*. Both are plain modern English and both free `house` for Butler's
own.

### M-3 — B07-P020: a deleted comma builds a garden path, 21 words long

This is the answer to question 3 of the brief and blind spot 2 of Book 6's §9,
and it is the clearest instance in the Book.

> Butler: *"for she recognised the shirt, cloak, and good clothes that Ulysses
> was wearing**,** as the work of herself and of her maids"*
>
> Candidate: *"for she recognized the shirt, cloak and good clothes that
> Odysseus was wearing **as the work of herself and her maids**"*

Butler's comma before `as` is load-bearing: it blocks the reader from attaching
`as the work of…` to `wearing`. Without it, *"wearing as the work of herself"* is
the first parse a reader builds, and the sentence has to be re-entered to attach
`as` to `recognized` twelve words back. **Nothing in the package can see this.**
It is 21 words, so it is under the 40-word absolute report; it costs no
retention, because no word changed; it costs no sentence, because no boundary
moved; MOVE-GAP is blind because no token relocated. A punctuation *deletion*
created it, and the package has no measure that reads punctuation at all except
the semicolon count.

**Repair:** restore the comma. (Restoring the serial comma too — **O-2** — is a
separate matter.)

### M-4 — B07-P013: `them all` takes `my friends` as its nearest antecedent

The move itself is right and is upheld in §5.1. Its execution is not.

> *"…to help me home to my own country as soon as possible, for I have been long
> in trouble and **away from my friends**. **May heaven prosper them all** with
> long life and happiness…"*

Butler's parenthesis sat directly on `these your guests`, so the blessing could
not be misattached. The candidate moves the blessing past the `for I have been
long in trouble` clause, and the nearest plural noun phrase in front of `them
all` is now **`my friends`** — and a blessing on the friends Odysseus has lost is
not a nonsense reading, it is a plausible one. The drafter asks whether `them
all` is *"clear enough at its new distance"*; the problem is not distance, it is
that an intervening antecedent was created.

**Repair, minimal:** swap the last two clauses so the blessing sits against its
own referents and the complaint closes the speech, which is also where Butler's
`for I have been long in trouble` naturally falls:

> *"…and these guests of yours, to help me home to my own country as soon as
> possible. May heaven prosper them all with long life and happiness, and may
> they leave their possessions to their children, and all the honors the state
> has conferred on them. For I have been long in trouble and away from my
> friends."*

No word is added or lost and the displaced run is unaffected.

### M-5 — B07-P019: two flattenings inside one paragraph, in opposite directions

* **`sup` → `eat`.** Butler: *"let me **sup** in spite of sorrow… yet it insists
  that I shall **eat** and drink"*. The candidate writes `eat` for both, thirty
  words apart — the M-2 shape again, and at a supper, where `sup` is not
  decoration but the meal in front of him. **Repair:** *"let me have my supper in
  spite of sorrow"*.
* **`importunate` → `insistent`**, twenty-two words from Butler's own *"yet it
  **insists**"*, which the candidate keeps. Butler varied the root; the candidate
  puts `insistent` and `insists` in one sentence pair. **Repair:** *"a very
  demanding thing"*, which keeps the sense and the variation.

Neither is visible to `one_word_two_ways()` (it keys on Butler's side inside one
Book) and neither costs retention.

### M-6 — three of the six added semicolons are worse English than Butler's commas

Of S-1's six additions, two are right, one is arguable, and three should be
periods. All three are **a semicolon before a coordinating conjunction**, which
is the Victorian habit this edition exists to modernize away from — so the draft
is more Victorian than Butler at these three places, not less.

| ¶ | Butler | candidate | repair |
|---|---|---|---|
| P018 | *"…homeward journey**,** but when he is once at home…"* | `journey; but when` | *"…homeward journey. But when he is once at home…"* |
| P026 | *"…a house and an estate**,** but no one…"* | `estate; but no one` | *"…a house and an estate. But no one—heaven forbid—shall keep you here…"* — which also divides a 43-word sentence |
| P028 | *"…for your bed is ready,” and glad indeed was he…"* | `ready”; and he was glad` | *"…for your bed is ready.” He was glad indeed to go to his rest."* |

P028's is the worst: a semicolon **after a closing quotation mark** before `and`
is neither Butler's pointing nor modern English's. Each repair is also a real
division, so making all three raises the raw rate and raises NORM RATE honestly
— which is the point.

### M-7 — four of Butler's kept semicolons want periods, and each one is holding a 43-to-50-word sentence together

This is the answer to question 4's second half — the half the drafter says no
measure can ask. Of the eight of Butler's semicolons that survive, four are
right and four are not.

| ¶ | the semicolon | candidate sentence | ruling |
|---|---|---|---|
| **P007** | *"…still a bridegroom and without a son**;** but he left a daughter, Arete…"* | **43 words** | **period.** Semicolon before `but`, and the sentence is one of the Book's longest. *"…and without a son. But he left a daughter, Arete, whom Alcinous married, and honors as no other woman is honored…"* — 20 + 24. |
| **P010** | *"…for there was abundance at all seasons**;** and there were golden figures…"* | **49 words** | **period.** Semicolon before `and` joining two unrelated inventories: the feasting and the torch-bearing statues. *"…abundance at all seasons. And there were golden figures of young men…"* — 25 + 25. |
| **P015** | *"…takes all well-disposed suppliants under his protection**;** and let the housekeeper give him some supper…"* | **47 words** | **period.** Semicolon before `and` introducing a *new imperative* after a relative clause about Zeus. *"…under his protection. And let the housekeeper give him some supper, of whatever there may be in the house."* — 30 + 17. This is Echeneus's instruction, the one the drafter already divided once; it needed dividing twice. |
| **P010** | *"…the palace of King Alcinous**;** so they were immortal…"* | 30 words | **borderline; keep.** A result clause, and 30 words is inside a modern reader's span. |
| **P011** ×2 | the vineyard list | — | **keep**, and see §5.4 |
| **P021** | *"…the utmost kindness**;** indeed, she wanted to make me immortal…"* | 31 words | **keep.** Semicolon before `indeed` is current English. |
| **P026** | *"…get angry about nothing**;** it is always better to be reasonable."* | 17 words | **keep.** Two independent clauses, short, correctly pointed. |

Taking the three periods adds three real sentences, moves the raw rate to about
+28%, and raises NORM RATE **honestly** by three — which is worth more than the
six S-1 additions bought, because each one shortens a sentence a reader has to
hold.

### M-8 — B07-P004: Butler's semicolon lowered to a comma, giving a 48-word six-link chain

> Butler: *"I will go before you and show the way, but say not a word as you go,
> and do not look at any man, nor ask him questions**;** for the people here
> cannot abide strangers, and do not like men who come from some other place."*
> (46 words, one sentence, with a semicolon at the seam)
>
> Candidate: *"…and do not look at any man or ask him questions**,** for the
> people here cannot abide strangers and do not like men who come from somewhere
> else."* (48 words, one sentence, no seam)

The one mark Butler supplied at the one place the sentence turns — from
instruction to reason — is the mark that was removed, and the sentence grew by
two words in the process. `checks.py` §5 reports it as growth `46 → 48`, which is
the D20 aligned gate working, and the growth is the smaller half of the problem.

**Repair:** *"…or ask him questions. The people here cannot abide strangers, and
do not like men who come from somewhere else."* 30 + 19.

### M-9 — B07-P024: the byte-identity repair is a disimprovement, made to clear a gate

> Butler: *"not to bring you on **at once** to my house along with the maids"*
> Candidate: *"not to bring you **on to** my house **at once** along with the maids"*

The README says this paragraph *"had a real improvement available and takes it
instead"* of being declared byte-identical. It is not an improvement. `bring you
on to my house` reads as `onto` at first pass, and `at once` now stands between
the goal and `along with the maids`, so both of Butler's adverbials are on the
wrong side of something. Butler's `on at once` is awkward; the replacement is
awkward in a new way and adds a misreading.

**This is D17's own caveat happening to a different gate**: *the gate is a floor
to clear, not a target.* The byte-identity gate has no floor to clear — it has a
tripwire, and a tripwire with no declared-instance escape at this Book creates
pressure to make a cosmetic edit. Accepted Book 4 declares seven such paragraphs
and is right to.

**Repair, either:** declare it — add `7: [24]` to `BYTE_IDENTICAL` with the
reason — or render it properly: *"not to bring you straight to my house along
with the maids"*. The second is better English than Butler and than the
candidate, and it is what should have been reached for.

### M-10 — B07-P010: `chief persons` → `chief men`

Butler: *"Here the **chief persons** of the Phaeacians used to sit and eat and
drink."* The candidate narrows a word Butler chose to be open. In a Book whose
argument turns on Arete — *"First find the queen"*, a woman whose good will
decides the escort — flattening `persons` to `men` in the hall where the
decision is taken is a loss the text is actively working against. It is also
unrecorded: `continuity.md` §5 does not mention it, and it is a rendering
decision, not normalization.

**Repair:** *"the chief people of the Phaeacians"* — which is also the
candidate's own word two paragraphs later at B07-P012, *"all the chief people
among the Phaeacians"*, rendering the same Butler phrase. **The candidate already
writes `chief people` in this Book and writes `chief men` two paragraphs
earlier**, which is an arrow-A collision inside one Book that the per-Book check
missed because Butler's two words differ.

---

## 4. Optional findings

### O-1 — `king` → `King` is right, silent, and should be written down
Applied at P003, P010, P011, P012, before the name; correctly **not** applied at
P001 (*"he was king over the Phaeacians"*, predicative) and P005 (*"the king's
house"*). The distinction is exactly right modern style and the execution is
consistent across all six occurrences. It is nowhere in `continuity.md` §6 or
`PUNCTUATION.md`. **One line in `PUNCTUATION.md` §1** — *a title is capitalized
immediately before a name and lower-cased elsewhere* — settles it for 24 Books
before Book 8 rediscovers it.

### O-2 — the serial comma has two dispositions inside one Book
Kept at P005 (*"harbors, their ships, their places of assembly, and the high
walls"*) and P011 (*"pears, pomegranates, and the most delicious apples"*);
**dropped** at P020 (*"the shirt, cloak and good clothes"*) and P026 (*"Father
Zeus, Athena and Apollo"*), where Butler had it. Nothing in `PUNCTUATION.md`
rules on it. This is the shape **D16** was written about — *the state to avoid is
not any particular disposition but two dispositions for one class*. Keep it (the
package's house style already does, four times to two) and say so.

### O-3 — the parenthesis class has two dispositions and no rule
B07-P013's 30-word parenthesis is **dissolved and moved**; B07-P026's two-word
*"(heaven forbid)"* becomes **em dashes**. Both calls are right, and both are
right for the same reason — length, and whether the interruption separates a verb
from its complement — but neither is recorded and the rule is not stated. Write
it beside D12, which already disposes of Butler's *square* brackets by class:
*a round parenthesis that holds a verb from its complement is dissolved; a short
interjection inside a clause becomes em dashes; both are recorded.*

### O-4 — B07-P005: `lofty` → `high` puts `high` on two Butler words
*"the **lofty** walls of the city"* → *"the **high** walls"*, beside Butler's own
*"the sea was so terribly **high**"* at B07-P022. Low severity — the two senses
are far apart and `high walls` is the natural modern phrase — but it is the
arrow-B shape and it is listed here so the row is on the record rather than
rediscovered.

### O-5 — B07-P026: a residual garden path after a good division
The Euboea sentence was divided, correctly, and the drafter cites it as the
model. The result still separates a subject from its verb by thirteen words:
*"**Those of my people who saw it**, when they took yellow-haired Rhadamanthus to
see Tityus the son of Gaia, **tell me** it is the furthest of any place."* The
reader takes `when they took…` for the main clause and stalls at `tell`. 28
words, so under every report. **Repair:** move the when-clause to the front —
*"When my people took yellow-haired Rhadamanthus to see Tityus the son of Gaia,
those of them who saw it told me it is the furthest place of any."*

### O-6 — B07-P007: `is honored of all those who keep house` reads as *honored BY*
Butler's partitive `of` is kept intact. A modern reader parses *"honored of all
those who keep house along with their husbands"* as an agent — *honored by* the
housekeeping women — which inverts a comparison into a compliment from the wrong
party. **Repair:** *"and honors more than any other woman who keeps house beside
her husband"*. This survives because the accessibility standard's "tangled syntax
is simplified" was applied to sentence length and not to a preposition.

### O-7 — B07-P018: `wayfarer` → `traveler` flattens onto Butler's own `traveller`
Arrow B: the rendering `traveler` carries Butler's `wayfarer` here and his
`traveller` at accepted B03-P011 and B04-P027. `wayfarer` is genuinely archaic
and had to move; `lone traveler` would keep Butler's solitary sense without the
merge. Very low severity, listed for the record.

---

## 5. The questions, ruled

### 5.1 Drafter's question 1 — B07-P013, the parenthesis opened out and moved

**The move is right. Uphold it.** Butler's 30-word blessing stands between `pray`
and `to help me home`, which is the B06-P018 defect and its S-1(a) repair, and
applying the repair at the drafting stage rather than waiting for a reviewer is
exactly what the package asked for. The alternative the drafter names — em dashes
in Butler's position — keeps the twenty-word interruption and therefore keeps the
defect with better typography, which is not a repair.

**`them all` is not right, and the reason is not distance.** See **M-4**: the move
created an intervening plural antecedent (`my friends`) that Butler's position
made impossible. The repair is a clause swap, costs no word, and leaves the
displaced run untouched.

### 5.2 Drafter's question 2 / brief's question 1 — the four kept rendering collisions

**All four are upheld.** Three are the `live`/`dwell` discrimination; the fourth
is not a collision at all.

| row | ruling |
|---|---|
| **`lighted`** | **Uphold — and it is not a close call.** These are two lexemes in modern English, not one word rendered twice: the verb's past is `lit` (*"lit Telemachus to his room"*), the attributive adjective is `lighted` (*"a lighted candle"*, *"with lighted torches in their hands"*). The candidate is internally consistent on exactly this line — it writes `lit the fire` twice as a verb at B07-P001 and `lighted torches` as an adjective at B07-P010. Discrimination, not drift. |
| **`endowed`** | **Uphold.** *"endow X with Y"* said of a house or a place is current English and has no plain substitute that keeps the construction: *"the splendors the gods had given the house"* loses the sense of a settled, permanent gift, which is the whole of what the sentence closes the ekphrasis with. B02-P001's object is a man's bearing, where *"gave him a presence"* is the natural collocation. Different collocation of one verb, ruled by the object. |
| **`luscious`** | **Uphold — but the drafter's reason is not the strongest one, and the row should be recorded rather than repaired.** `luscious` is current English and needed no change in either Book; of figs it is exactly right and `lush figs` would be wrong, since `lush` is said of vegetation, not of fruit. The collision is a **by-product of B05-P006's change to `herbage`**, not of a decision about `luscious` — the drafter there wrote `lush greenery` for `luscious herbage` and moved both words. Book 7 is right and accepted Book 5 is the one out of step; repairing Book 5 costs a successor for no reading gain, so record the divergence with its reason and do not build one. |
| **`issue`** | **Uphold, and reclassify.** This is **not a collision**: it is a homograph. Butler's `issue` at B03-P007 means *outcome* and at B07-P007 means *offspring*. Both senses are archaic in those uses, both had to move, and they moved in different directions because they are different words that happen to be spelled alike. `without a son` is exact — Rhexenor left a daughter and no son. **Recommendation:** the report needs a nameable disposition for this class, *one Butler word, two senses*, because it will recur (`issue`, `state`, `will`, `fair`, `want`), and today each instance costs a reviewer the same work from scratch. |

**But the check found a row nobody ruled on, and that is the finding here.** See
**M-1**: `walls` ← `precincts` + `walls` + `walls` is printed by
`rendering_collisions.py` under arrow B, touches this Book, is not among the
seven repaired and not among the four handed over, and is a sense change as well
as a collision. **The tool worked; the triage did not.** See also **R-2**: the
report returns **72 rows touching Book 7**, not eleven, and the sixty-one that
were looked at and dismissed left no record, so there is no way to tell a row
that was judged from a row that was never read.

### 5.3 Drafter's question 3 — `councillors` against D9

**The rule wins. Write `councilors`, and pay the successor to Book 2.**

The drafter's argument is that a successor is the more expensive correction. The
decisive facts are three, and two of them were not in front of the drafter:

1. **`councillors` is the only British spelling in seven accepted Books.** Every
   candidate was scanned here for `-our`, `-ised`, `-isation`, doubled-`l`
   inflections, `grey`, `plough`, `-ence`, `-re`, `whilst`/`amongst`, `storey`
   and `travell-`. The corpus is clean. `traveller` and `travelled` are Butler's
   and the editions correctly render `traveler` and `traveled`. So this is not
   "the accepted Books' house style against the rule" — it is **one word against
   the rule**, twice in Book 2 and once here.
2. **The package has already paid more for exactly this class.** The `seashore`
   ruling cost **three** successors on a point D15 calls typographic. One
   successor for a spelling that violates a named decision is cheap by the
   package's own settled price.
3. **Keeping it costs more than one word.** If `councillors` stands, D9 acquires
   a named exception that every later Book must be told about, and the next
   British form found in an accepted Book has a precedent for staying. That is
   how `hyphen_drift()` became a disease.

Cost, stated exactly: a new successor to Book 2 changing two words (B02-P001,
B02-P003), with `book02/candidate-v2.json` and `ACCEPTANCE.md` byte-unchanged;
and one word in Book 7. **Do not write the exception into `PUNCTUATION.md` §1.**

### 5.4 Drafter's question 4 / brief's question 2 — the fourteen semicolons

**The arithmetic first, because the argument is built on it and it is wrong.**
See **S-1**. B07-P011 carries **two** of Butler's semicolons, not five; the
candidate's four there include two of its own; and across the Book **eight of
Butler's thirty survive against six the drafter added**. The drafter's argument —
*"converting them would raise the raw rate by about five points and leave NORM
RATE unchanged to the decimal"* — is tested and is **true as far as it goes**:
cashing a semicolon for a period is worth zero under D20, by construction. What
the argument omits is the reverse operation, which the same draft performs six
times and which raised NORM RATE from +3.0% to +7.5%.

**Now the question no measure answers: does B07-P011 read better with them or
without them?**

**With.** Uphold the vineyard list, all four marks, including the two that are
the drafter's own. The five stages — raisins, gathering, treading, blossom,
colour — are one continuous survey of one vineyard from one vantage, and they
are grammatically parallel clauses of the same shape (*"in another part they
are…"*, *"some are being…"*, *"others further on have…"*, *"others again are…"*).
Serial semicolons between parallel clauses are correct modern usage and are what
a modern editor would supply. Five periods would make five declarative sentences
of eight to twelve words each and turn a sweep of the eye into an inventory,
which is the opposite of what the paragraph is doing — and the paragraph is
already an inventory in its other half (four acres, two streams, a wall all
round). **The drafter's two additions here actually improve on Butler**, who
pointed the same five-item list two ways (`;` twice, then `,` twice) for no
reason the text supplies. This is the one place in the Book where an added
semicolon is a genuine editorial improvement, and it should be recorded as a
decision rather than counted as a kept mark.

**Elsewhere, no.** Four of Butler's eight survivors should be periods (**M-7**)
and three of the six additions should be periods (**M-6**). The corrected Book
carries roughly seven semicolons, nine more sentences, a raw rate near +32%, and
a NORM RATE earned rather than pointed.

### 5.5 Drafter's question 5 — the present tense at B07-P010 and B07-P011

**Keep it. The drafter is right, and the reason can be made stronger than
"Homer's shift".**

The tense change is not scattered: it begins exactly where the description of the
palace stops narrating and starts cataloguing (*"There are fifty maidservants in
the house"*), it holds unbroken through the garden, and it closes on a past tense
at the exact point the catalogue ends — *"Such, then, **were** the splendors with
which the gods had endowed the house of King Alcinous."* A reader does not take a
consistent two-paragraph block bounded by a past-tense opening and a past-tense
closing sentence for a mistake; they take it for what it is, a standing
description of a place that is still there. Butler's own pointing marks the
boundaries, and the candidate reproduces them exactly.

The accessibility standard says tangled syntax is simplified and voice is kept.
This is voice. **One caveat, recorded not acted on:** the reading depends on
`Such, then, were` closing the block, so if any later pass shortens or divides
that closing sentence, the tense block loses its right-hand boundary. Worth an
assertion in Book 7's build if a v2 is made.

### 5.6 Brief's question 3 — a garden path under the reporting threshold

**Found: B07-P020, at 21 words — M-3.** A comma Butler wrote before `as the work
of herself` was deleted, and *"the good clothes that Odysseus was wearing as the
work of herself and her maids"* invites the reader to attach `as` to `wearing`.
It is invisible to every instrument in the package and to the new absolute
40-word report, and unlike B06-P018 it was not inherited from Butler — **the
draft created it, by removing a mark**.

Two more below the threshold, both listed above: **B07-P026** at 28 words
(**O-5**, subject and verb held apart by thirteen words, in the very sentence the
drafter divided and cites as the model — the shape survived the division) and
**B07-P007** at 43 words (**O-6**, a partitive `of` read as an agent).

**The general point, and it is the one worth carrying to Book 8.** B06-P018 was
a garden path Butler built and the drafter left. B07-P020 is a garden path the
*drafter* built, out of a comma. Every measure the package has counts words,
sentences, tokens and semicolons; **no measure reads any other mark**, so the
whole class of defects created by adding or removing a comma is outside the
instrument set entirely, in both directions. That is a larger blind spot than
blind spot 2 as written, and it now has two witnesses.

### 5.7 Brief's question 4 — A5 / A4(ii): `mountain tops`, and the vendored word list

**First, a correction to the record, offered with its evidence.** `book06/ACCEPTANCE.md`
O-6 says closing `mountain tops` *"costs a **sixth successor**"*, singular. The
string occurs in **accepted Book 5 at `candidate-v2.json` and accepted Book 6 at
`candidate-v2.json`**, one instance each — verified by grep over every
`book0*/candidate-v*.json`. Both Books are accepted, so closing the form costs a
successor to **each**: `book05/candidate-v3.json` *and* `book06/candidate-v3.json`.
The figure is two, not one. (O-6's own self-correction — that the string is at
B06-P011 only and not B06-P009 — is right and reproduces.)

**Ruling on `mountain tops`: close it, but not by itself.**

D15 as written decides it: the modern standard form is closed, American
dictionaries give `mountaintop`, and D9 names American spelling. The cost is not
a reason to decline — the package paid three successors for `seashore` on a point
D15 calls typographic and silent. But closing one instance for two successors,
while the class that produced it still has no instrument, **guarantees a fourth
round**: `mixing-bowl` cost a successor at Book 2, `seashore`/`low-lying`/
`well-disposed` cost three at Book 5, and this is the third discovery of the same
kind by the same method, which is a person reading. **Recommendation: close
`mountain tops` as one line item of a single consolidated compound sweep run once
over all seven accepted Books, so one successor per Book discharges the whole
class, rather than one successor per rediscovery.**

**Ruling on A4(ii) — recommend AGAINST vendoring a word list. It is both
unnecessary and insufficient, and the evidence is in the repository.**

*Unnecessary.* A4(ii)'s demonstration is sound and its conclusion does not
follow. It looked for the closed form *"across PG #1727 and all twelve staged
files"* — Butler and this package — found zero hits, and correctly concluded
that **the corpus cannot be its own dictionary**. But the corpus it tested is not
the only corpus in the repository. `app/public/data/editions/*-modern-en.json` is
**100 modern-English editions, 44.9 MB, 75,231 distinct word types**, already a
dependency of the product, already in the tree. Nothing was vendored to establish
the following; it is a query:

| form | attested in the product's own modern corpus |
|---|---|
| `mountaintop` | **yes** — Divine Comedy, Iliad, Midsummer, Odyssey, Paradise Lost, Ulysses |
| `mountaintops` | **yes** — Divine Comedy, Faust, Midsummer, Odyssey, Paradise Lost, Romeo and Juliet, Werther |
| `seashore`, `hilltop`, `bedchamber`, `storeroom`, `townspeople`, `gatehouse`, `nightfall`, `daybreak`, `wineskin` | **yes**, all |
| `landingplace`, `outercourt`, `chiefmen`, `ninedays`, `winetubs` | **no** — correctly, these are not compounds |

The instrument A4(ii) wants to buy is sitting in `app/public/data/editions/`.

*Insufficient.* A word list answers *"is `mountaintop` a word?"* It cannot answer
*"is `mountaintop` the standard form against `mountain top`?"*, because a list of
single words has no way to represent the open form at all, and D15 is a rule
about **which of two forms**, not about existence. A corpus answers the question a
list cannot — and the answer it gives here is worth reading:

| closed | count | open | count |
|---|---|---|---|
| `mountaintop` | 10 | `mountain top` | 1 |
| `mountaintops` | **7** | `mountain tops` | **9** |
| `seashore` | 56 | `sea shore` | 0 |
| `townspeople` | 31 | `town's people` | 0 |

**The singular is decided and the plural is contested**, which is exactly the
distinction a binary word list would have flattened into a false verdict. That
is the argument against the dependency in one table.

*The honest caveats, stated rather than waved away.* The product corpus is
machine-generated modern English of varying quality, and a commit on this
repository's default branch — *"Audit: nine modern-en editions are largely the
original text"* — says nine of the hundred are contaminated with the source
prose. So it must be used with a margin, never as a sole authority, and never
without naming the editions: require the closed form to lead by at least 3× **and**
to appear in at least three distinct editions. `mountaintop` passes (six
editions, 10:1). `mountaintops` does not (seven editions against four, 7:9) —
which is why `mountain tops` deserves a human ruling inside a class sweep and not
a mechanical flip.

**And the cheapest fix is not an instrument at all — it is a register.** The
interim H.1 head-noun filter already takes Book 7's candidate to **23 pairs** and
Book 6's to 23. Twenty-three is not a blind spot; it is a checklist. The real gap
is that nothing records that anyone went through the twenty-three or what they
decided, so `mountain tops` could sit in two accepted Books unremarked. **Require
each Book's `continuity.md` to carry one disposition line per H.1 pair —
`closed` / `kept open, standard` / `not a compound`.** Twenty lines a Book, no
dependency, and it would have caught `mountain tops` at Book 5 before a successor
was owed to anyone.

**Summary for the coordinator:** close `mountain tops` (cost: two successors,
inside one consolidated sweep); **do not vendor a word list**; adopt the H.1
disposition register; if mechanization is still wanted, query
`app/public/data/editions/*-modern-en.json` with a ratio and a margin, which is
zero new dependencies.

---

## 6. The checks infrastructure — audit

This is its first live run, and the brief asks two questions of it.

**Does it work?** Largely, yes, and the improvement over Book 6 is real and
should not be lost in the findings. `checks.py 7` reproduces the frozen
`checks-v1.md` byte for byte. `checks.py --all` re-asserts every accepted Book's
published figures **against hard-coded constants** and returns 1 on any
disagreement — it is not a print-out that recomputes what it prints, which is the
failure it would have been easiest to write. Planting a byte-identical paragraph
in accepted Book 4 and a truncated paragraph in accepted Book 1 in a scratch copy
made `--all` fail with eight named disagreements. The D20 gates work: the aligned
growth gate caught a 51→52 sentence the old maximum-against-maximum form could
not see, and the byte-identity tripwire fired, both during drafting. `--audit`
runs ten controls under D18 on both clauses and declares two blindnesses by name.
**The S-2 disease of Book 6's round 1 is genuinely cured for the figures.**

**Is the enumeration honest?** Two tables of three, yes. See **S-3**:
`BYTE_IDENTICAL` is exact-list equality in both directions and is the model;
`LEGACY_GROWTH` enumerates each instance with its word counts and fails both on
an undeclared growth and on a declared growth that has gone; `MIN_PARA_RATIO` is
**a lowered threshold wearing an enumeration's name**, and the disposition's own
sentence — *"no Book can quietly acquire a twelfth instance"* — is false for it.

**Can the manifest be satisfied without the gates passing?** **Yes, and it
already has been.** See **S-2**. The mechanism has a write side and no read side;
`book07/manifest.json` records a checks-file hash that does not match the frozen
checks file; and a manifest asserting `all_gates_passed: true` survives a
candidate that fails two gates.

Three further items, all small:

* **R-4** — `--all` re-asserts *figures*, not *gates*. `BYTE_IDENTICAL`,
  `MIN_PARA_RATIO` and `LEGACY_GROWTH` are only evaluated inside `run_book()`,
  which `--all` does not call. In practice the six pinned figures are a strong
  tripwire — both plants above moved them — but a change that preserved all six
  to the printed precision while adding a byte-identical paragraph would pass
  `--all` silently. Cheap fix: have `--all` call `run_book(bk, write=False,
  quiet=True)` and collect the gate failures.
* **R-5** — the `LEGACY_GROWTH` comparison is membership, not multiplicity:
  `unexpected = [r for r in grown_fail if (r[0], r[1], r[2]) not in legacy]`. A
  Book that declares one 49→50 growth at P5 and then acquires a *second*
  49→50 growth in the same paragraph has both excluded. Narrow, but it is the
  "quietly acquire" case in a table that is otherwise honest. Fix: compare
  `Counter`s.
* The `--audit` control set has **no control for a comma raised to a semicolon**,
  which is the mutation S-1 turns on. Add it; it is three lines and it is the
  mirror of the positive control already there.

---

## 7. Records findings

* **R-1** — *"Fourteen of Butler's thirty semicolons are kept"* is wrong in
  **three** documents — `book07/README.md`, `book07/continuity.md` §7 and
  `book07/review-instructions.md` question 4 — as is *"five of them in one
  paragraph"* for B07-P011, which carries two of Butler's. The true figures are
  **8 kept, 6 added, net 30 → 14**. See **S-1**.
* **R-2** — *"`scripts/rendering_collisions.py` found eleven rows touching this
  Book"* (`README.md`, `review-instructions.md`). The check as run in this
  worktree returns **72 rows touching Book 7**. Eleven were acted on — seven
  repaired, four handed over — and sixty-one were dismissed with no record of
  having been read, which is how **M-1** (`walls` ← `precincts`) passed through.
  The honest form of the sentence is *"seventy-two rows touch this Book; eleven
  are live and are disposed of below"*, with the dismissals available to a
  reviewer. The check has no ranking and cannot acquire one cheaply, so the
  record has to carry the triage.
* **R-3** — **a transcription defect in PG #1727**, found by clause 4 of this
  round's source rule and the first thing anyone has found in the FOOTNOTES
  section's own structure. Footnote **29**'s opener is transposed: `29[] [ The
  geography of the Ægean…`, where all 186 other entries read `[n] [ …`. It is
  harmless to this package — the served editions carry no apparatus and the
  defect is outside every Book's body — and it is recorded because the next rule
  to read the apparatus will otherwise rediscover it as its own bug. Asserted by
  name in `verify_source_book7_review.py`, so the assertion fails again if PG's
  next revision changes it in either direction.
* **R-4** — `checks.py --all` re-asserts published figures but never evaluates
  the gates. §6.
* **R-5** — `LEGACY_GROWTH`'s comparison is membership rather than multiplicity.
  §6.
* **R-6** — `book06/ACCEPTANCE.md` O-6 states the cost of closing `mountain tops`
  as *"a sixth successor"*. The string is in **accepted Book 5 and accepted Book
  6**; the cost is **two** successors. §5.7.

---

## 8. Every paragraph

| id | finding |
|---|---|
| **B07-P001** | No material issue found. The O-3 un-inversion (*"Thus, then, did Ulysses wait and pray"* → *"So Odysseus waited and prayed"*) is right, the division at *"into the house. Meanwhile she went…"* is at a real seam, and `waggon` → `wagon` is D9. The doubled-dative repair (*"brought her supper for her into her own room"* → *"to her in her own room"*) is upheld: Butler's `her supper for her` is genuinely redundant where B01-P013's doubled `brought` is only clumsy, and the drafter is right to decide the two differently and to flag it. `comely` correctly kept against B02-P001 and B04-P025. |
| **B07-P002** | No material issue found. 74 words, four word-level edits, and the near-identical report is right to leave it: this is Butler at his plainest and the one real improvement — *"Then, as he was just entering the town"* → *"Then, just as he was entering the town"* — fixes a genuinely misplaced adverb. `towards` → `toward` is D9. |
| **B07-P003** | **O-1** — `king Alcinous` → `King Alcinous`, correct and unrecorded. Otherwise clean: *"do not know one in your town and country"* → *"do not know anyone in your town or your country"* is the right reading of Butler's Victorian indefinite. |
| **B07-P004** | **M-8** — Butler's semicolon at the sentence's one turn is lowered to a comma, leaving a 48-word six-link chain that the aligned growth gate reports as 46 → 48. `sea-faring` → `seafaring` is D15 and matches accepted B06-P021; *"say not a word"* → *"do not say a word"* is O-3; *"or as a bird in the air"* → *"or like a bird"* restores the parallel. |
| **B07-P005** | **O-4** — `lofty` → `high` beside Butler's own `high` at P022. The 87-word period is divided twice, at Butler's semicolon and again before *"And when they reached"*, both at real seams; `in the midst of them` → `in the middle of them` is the recorded collision repair and matches accepted B04-P002 word for word; `On this` → `At this` is the connective table; the two added `their`s restore a parallel Butler dropped. |
| **B07-P006** | No material issue found. D4's first unclosed quotation opens here and is reproduced exactly. *"which you would have me show you"* → *"that you wanted me to show you"*, *"lost his own life to boot"* → *"as well"*, and the division at *"do not be afraid. Go straight in"* are all right. Poseidon, Nausithous, Periboea and Eurymedon all carry through unchanged. |
| **B07-P007** | **M-7** (the semicolon before `but`, holding a 43-word sentence) and **O-6** (*"is honored of all those who keep house"* read as an agent). `without male issue` → `without a son` is exact and is upheld in §5.2; the comma supplied at *"two sons, Rhexenor and Alcinous"* is a real repair; `honours` → `honors` is D9. |
| **B07-P008** | No material issue found. *"Thus she both was, and still is"* → *"So she was, and still is"* drops a correlative Butler did not complete; *"gain her good will"* → *"win"*; one division at *"about the city. For she is…"*, at Butler's own comma, and it is a real one. D4's first run closes here. |
| **B07-P009** | **M-2** — `abode` → `house` eleven words from Butler's own `house`, the B06-P019 shape the drafter repaired at P021 and missed here. This is the paragraph the drafter said to press, and pressing it on the *inventory* clears it completely: threshold of bronze, walls of bronze end to end, cornice of blue enamel, gold doors, silver pillars, bronze floor, silver lintel, gold door-hook — all eight present and none generalized. The one added word is `the` in *"the sun or the moon"*. |
| **B07-P010** | **M-7** (the 49-word sentence held by a semicolon before `and`) and **M-10** (`chief persons` → `chief men`, against the candidate's own `chief people` two paragraphs later). Everything else in the densest inventory in the package survives: fifty maidservants, the mill, the loom, the aspen-leaf shuttles, the oil-shedding linen. `Vulcan` → `Hephaestus`, `maid servants` → `maidservants`, `backwards and forwards` → `backward and forward` all correct; `lighted torches` correctly kept, §5.2. |
| **B07-P011** | **Contributes 2 of S-1's six added semicolons — and these two are upheld**, §5.4: the five-stage vineyard list is parallel clauses and Butler pointed it two ways for no reason; serial semicolons are right and the draft improves on him. The addition must be *recorded as a decision* rather than counted as a kept mark. Inventory intact: four acres, the wall all round, pears, pomegranates, apples, figs, olives, two streams, the ducts, the outer court. `luscious` and `endowed` correctly kept, §5.2; `town's people` → `townspeople` is D15; the present tense is upheld, §5.5. |
| **B07-P012** | **M-1** — `precincts` → `walls`, an unruled arrow-B collision and a sense change in a Book whose walls are literally bronze. `enveloped` → `wrapped` matches accepted B05-P030 and is right; `Every one` → `Everyone`; the division at *"King Alcinous. Then he laid his hands…"* is at Butler's semicolon. |
| **B07-P013** | **M-4** — `them all` acquires `my friends` as its nearest antecedent. The move out of Butler's parenthesis is **upheld**, §5.1; this is the Book's only displaced run, 17 tokens, and the strict witness names it correctly. |
| **B07-P014** | No material issue found. The Book 2 formula is carried word for word (*"spoke to them plainly and in all honesty, and said:"*, accepted B02-P009 and B02-P013), the comma at *"among the ashes, and they all held their peace"* is a real repair, and the aligned gate's 41 → 43 is that comma and the formula's two extra words. |
| **B07-P015** | **M-7** — the 47-word sentence is held by a semicolon before a *new imperative*; Echeneus's instruction needed dividing twice and was divided once. The first division (63 words → 17 + 46) is right and is the one the D17 gate did not demand — the drafter is correct that the gate is a floor, not a target. `said he` → `he said`, `bid` → `Tell`, `well disposed` → `well-disposed` all correct. |
| **B07-P016** | No material issue found. `bade him take` → `told him to take`, `favourite` → `favorite`, `maid servant` → `maidservant`, `drink-offerings` → `drink offerings` (the D15 table's own open standard form, and it resolves Butler's two settings inside this one chapter in the recorded direction). One division at *"beside him. An upper servant"*. |
| **B07-P017** | No material issue found. 34 words to 34. `as much as he was minded` → `as much as he wanted`, matching the same formula's other use at P020, which is the right call and is recorded. `drink-offering` → `drink offering`. |
| **B07-P018** | **M-6** — a semicolon added before `but` where Butler wrote a comma, in the Book's most Victorian direction. `councillors` is the subject of §5.3 and should become `councilors`. **O-7** — `wayfarer` → `traveler`. D3 fires correctly: `hecatombs` → `great sacrifices`, **no number**. `To-morrow` → `Tomorrow`, `hitherto` → `until now`, `one of our selves` → `one of ourselves`, `affect no concealment` → `make no attempt at concealment` all right; `Aldermen` correctly kept on the B06-P005 precedent. |
| **B07-P019** | **M-5** — `sup` → `eat` beside Butler's own `eat`, and `importunate` → `insistent` twenty-two words from `it insists`. Contributes one of S-1's added semicolons (arguable; a period is cleaner). `bondsmen` → `bondservants` matches accepted B04-P055; *"dwell only on the due replenishing of itself"* → *"think of nothing but being refilled"* is a sound collision repair against accepted B04-P016's `filling`. *"if I may first see once more my property"* would read better as *"see my property once more"*. |
| **B07-P020** | **M-3** — the deleted comma before `as the work of herself`, the Book's clearest garden path and the answer to the brief's question 3. **O-2** — the serial comma dropped from *"the shirt, cloak and good clothes"*, where Butler had it. Otherwise good: `Thus did he speak` → `So he spoke`, `inasmuch as` → `since` (accepted B01-P004), `the cloister` → `the gallery` (the Book 1 row), `Who, and whence are you` → `Who are you, and where do you come from`. |
| **B07-P021** | No material issue found, and this is the Book's best paragraph. **D16 fires correctly and is recorded at the drafting stage** — Butler's *"a long story Madam"* with no comma is repaired to *"a long story, madam"*, which is the R-2 lesson of Book 6's round 1 applied. The gate-triggered division at *"for the space of nine days. At last, during the darkness of the tenth night…"* is at exactly the right seam. `dwells` and `lives` are correctly kept apart, eleven words, the B06-P019 discrimination made deliberately; the nested `‘the Ogygian.’` is preserved; D4's second unclosed quotation opens here. |
| **B07-P022** | No material issue found. *"Days seven and ten did I sail"* → *"For seventeen days I sailed"* is the Book's best single recast: the inversion goes under O-3 and the number is Butler's own, fixed by his *"on the eighteenth"* two clauses later, with no quantity supplied. Seven years, the eighth year, seventeen days, the eighteenth — every number intact. `depart` → `to leave` matches accepted B01-P027; one real division at *"a great storm against me. The sea was so terribly high…"*. |
| **B07-P023** | No material issue found. The longest paragraph in the Book (229 → 230 words) and the detail survives entire: the bad place, the rocks, the river, the thicket, the leaves, the maids on the beach. `besought` → `begged`, `maid servants` → `maidservants`, `westering` → `sinking westward`, and the comma supplied at *"Sick and sorry as I was, I slept"*. D4's second run closes here. |
| **B07-P024** | **M-9** — the byte-identity repair is a disimprovement made to clear a gate; either declare the paragraph or render it properly (*"not to bring you straight to my house"*). |
| **B07-P025** | No material issue found. 50 words to 50, three word-level edits, and the near-identical report is right to leave it. `Pray` → `Please` and the inverted tag `replied Ulysses` → `Odysseus replied` are both the standing rule; `scold` correctly kept where accepted B01-P029 has `chide with` for a different Butler word. |
| **B07-P026** | **M-6** (a semicolon added before `but` where Butler wrote a comma), **O-2** (the serial comma dropped from *"Father Zeus, Athena and Apollo"*), **O-3** (the parenthesis becomes em dashes with no rule stated), **O-5** (the residual garden path after the Euboea division). The Euboea division itself is right and is the Book's second real recast; `even though it be` → `even if it is` and `You will thus see` → `You will see from this` are both correct. |
| **B07-P027** | No material issue found. `Then was Ulysses glad` → `Then Odysseus was glad` (O-3, a narrative tag) and the `saying` tag dropped, per the standing rule. 41 → 40 words, the Book's lowest paragraph ratio at 0.9756, and it is all Butler's inversion coming out. |
| **B07-P028** | **M-6** — the worst of the six added semicolons: `ready”; and he was glad`, a semicolon after a closing quotation mark before `and`, where Butler wrote a comma. `Thus did they converse` → `So they talked together` correctly matches accepted B04-P052; `The maids thereon` → `So the maids`; `woollen` → `woolen`; the parallel infinitives (*"and to make it"*) are a real repair. |
| **B07-P029** | No material issue found. Butler's semicolon is lowered to a comma in a 32-word sentence, which is inside a reader's span and needs nothing; `gateway; but Alcinous lay` → `gateway, but Alcinous lay`. Nothing else moved and nothing needed to. |

---

## 9. What the package's checks would still not catch

Book 6's round 1 listed five. All five stand. This round adds three and
strengthens one, and each is stated with the witness that found it.

1. **A sentence divided at the wrong seam.** Unchanged. No carrier.
2. **A garden path — and now, a garden path the draft *builds* out of a mark.**
   B06-P018 was Butler's, left. **B07-P020 is the drafter's, made by deleting one
   comma** (M-3). The class is wider than it was written: it is not only long
   sentences inherited long, it is any change to the pointing.
3. **Register.** Unchanged. `sup` → `eat` at B07-P019 (M-5) is the same family as
   `picked up`: ordinary modern English, no retention cost, wrong for the meal in
   front of the speaker.
4. **A figure carried by a single word.** Unchanged.
5. **A quantity or a concrete detail quietly generalized.** **This Book clears
   it.** Every number and every physical detail in B07-P009 to B07-P011 and
   B07-P022 to B07-P023 was checked one by one against Butler: eight materials in
   the palace, fifty maidservants, four acres, two streams, seven years, seventeen
   days, the eighteenth. Nothing generalized, nothing supplied — D3's *"no number
   for a sacrifice"* held at P018. The one loss is a **referent**, not a quantity:
   `chief persons` → `chief men` (M-10).
6. **NEW — every mark except the semicolon is unmeasured, in both directions.**
   The package counts words, sentences, tokens and semicolons. It counts no
   comma, no dash, no colon, no quotation mark. So a comma deleted (M-3), a comma
   raised to a semicolon (S-1, six times, worth 4.5 points of NORM RATE), a
   semicolon lowered to a comma (M-8, and P029), a colon dissolved (P011) and a
   parenthesis converted (O-3) are all invisible, and two of those five classes
   **move a published figure**. A per-mark census of source against candidate is
   four lines and would have surfaced S-1 mechanically.
7. **NEW — one common rendering absorbing a rare Butler word.**
   `rendering_collisions.py`'s rarity gate is applied to the key, so arrow B sees
   a *rare* rendering carrying two Butler words and is blind to a *common* one.
   `house` ← `abode` + `house` (M-2) is invisible in both arrows, twice, in one
   Book. Fix: apply the rarity gate to the Butler side in arrow B, not to the
   rendering.
8. **NEW — the triage of a report that has no ranking is itself unrecorded.**
   Seventy-two collision rows touch this Book and eleven were acted on (R-2);
   twenty-three H.1 compound pairs are printed and none is dispositioned (§5.7).
   In both cases the check did its work and the record does not say what a reader
   decided, so the next reviewer cannot tell a judged row from an unread one.
   This is not a gap in an instrument; it is a gap between an instrument and a
   record, and it is the cheaper half to close.

---

## 10. Artefacts written by this review

| file | what it is |
|---|---|
| `findings-v1.md` | this file |
| `README.md` | what this round is and where it ran |
| `verify_source_book7_review.py` | the eleventh source rule, 6 controls, 2 declared blindnesses |
| `verify-output.txt` | its output |
| `checks_reproduce.py` | independent recomputation of every published figure, importing nothing from `scripts/` |
| `reproduce-output.txt` | its output |

`candidate-v1.json`, `checks-v1.md`, `manifest.json`, `continuity.md`,
`provenance.json`, `README.md`, the packets and every file of Books 1–6 are
byte-unchanged by this round. `scripts/` is unchanged. No file under
`app/public/data/editions/` was written; the queries in §5.7 and the controls in
§1.1 are reads.
