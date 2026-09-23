# The Odyssey, Book 6 — independent review, round 1

**Subject:** `book06/candidate-v1.json`, sha256 recomputed here as
`9391ca16778a8225c1710b24296c51a2d3ba33f26ed3ac9fcf7c677c3c0413f0` — the
frozen hash. 26 paragraphs, 9 packets.
**Trunk:** `claude/odyssey-modern-en-20260911` @ `ca3f9d947`.
**Review branch:** `claude/odyssey-book6-review-20260912` (own worktree).
**Reviewer:** a separate session; did not draft this Book.

**Verdict: accept after corrections.**

| severity | count |
|---|---|
| substantive | **2** |
| minor | **9** |
| optional | **6** |
| records | **5** |
| paragraphs with no material issue | 13 of 26 |

Coverage is complete: every paragraph `B06-P001` … `B06-P026` has exactly one
entry below, a numbered finding or "No material issue found".

Nothing outside `book06/review/` was written. `candidate-v1.json` is untouched
(**D10**).

---

## 0. What was re-run, not taken on trust

Every number the drafter published was recomputed here from the frozen files,
using the package's own functions lifted out of `scripts/build_book05_v2.py`.
**All of them reproduce exactly.**

| | drafter | recomputed |
|---|---|---|
| paragraphs | 26 | 26 |
| word ratio | 0.99913 | 0.99913 (3435 → 3432) |
| retention | 0.93669 | 0.93669 |
| sentences | 116 → 148 (+27.6%) | 116 → 148 (+27.6%) |
| sixty-word | 7 → 1 | 7 → 1 (the survivor is P009's simile, 60 words) |
| semicolons | 27 → 4 | 27 → 4 |
| near-identical | P006, P007, P016, P019, P024, P025 | identical list, identical edit counts |
| byte-identical | none | none |
| `one_word_two_ways` | 75 rows | 75 rows |
| quotation marks | 18 open / 15 close, 3 unbalanced | 18 / 15, unbalanced at P013, P021, P022 — **the same three in source and candidate** |
| square brackets (D12) | absent | absent from both |
| name census | 14/11/6/3/2/1, `Nausicaa` 10 → **11** | confirmed, including the single `Nausicaa` excess |
| `Leto` | Greek in Butler, 1 → 1 | confirmed; `Latona` absent from both |
| `compound_drift()` over Books 1–6 | clean | clean (re-run) |

`scripts/compound_drift.py` was executed with Book 6 in the corpus and reports
no compound carrying more than one setting across the six Books.

---

## 1. Source verification — a ninth kind of rule

`book06/review/verify_source_book6_review.py`. The eight rules already used are
all about *location* or *resemblance* and every one of them reads Butler's
**letters**. This one destroys every letter before it looks at anything.

**The rule.** Map each letter to `a`; delete PG's footnote reference numerals
(the served edition deletes them, and the chapter is asserted to contain no
digit of its own, so the deletion cannot destroy a number Butler printed);
collapse whitespace runs to one space or one blank line; **keep every other
character exactly as printed** — comma, em dash, apostrophe, quotation mark,
full stop, hyphen. What survives is the chapter's typographic *shape*: word
lengths and pointing, with the words gone. Then:

1. The chapter's shape, 17 732 characters, occurs in PG #1727's shape
   **exactly once**, at shape offset 150 999.
2. Letters restored at the span the *shape index* gave — 151 518 … 169 254 —
   the PG bytes are **character-for-character** the served chapter's. Both ends
   are checked explicitly and printed (`'S'` … `'.'`). The span carries exactly
   two footnote numerals, `island,55` and `strip56`, named in the output;
   nothing else was normalized away.
3. The longest shape this chapter shares with **any other part of the file** is
   **155 characters**, about thirty words. The drafter's suffix automaton put
   the second-best letter-based match at 37 tokens. Two instruments in two
   different channels agree that the chapter is in one place and that nothing
   else in the file is close.

Clause 0 additionally confirms that `book06/source-book6.json` is
character-identical to the served `odyssey-original-en.json` chapter 6 — the
premise every other check rests on and which nothing in `book06/` asserted.

**The audit failed the rule three times as first written.** As `WORKFLOW.md`
warns, budget for it.

- **Digits.** Version 1 levelled digits to `9` rather than deleting them, on
  the reasoning that a digit is not a letter. PG's body carries Butler's
  footnote numerals flush against the word they follow; the served edition
  strips them. The chapter's shape therefore occurred **zero** times — and the
  rule **reported the zero as a count**. From outside, a rule that prints "0
  occurrences" and one that prints "1 occurrence" look like the same rule
  working. Clause 1 now fails on any count that is not exactly 1.
- **Span recovery.** Version 2 used the shape index as a character index. It is
  not one — digits were deleted and whitespace collapsed — so clause 2 reported
  a mismatch at offset 0 on a byte-clean file. This is the same joint the
  drafter's own audit failed on (its span stopped at the last *letter* and
  dropped the terminal full stop); an index map is now carried through `shape()`.
- **A verdict blind to truncation.** The control that drops the chapter's last
  full stop *passed clause (a) and failed clause (b)*: a prefix of a string
  that occurs once also occurs once, so an occurrence count cannot see a
  truncation. The verdict is now *(count, recovered character end)*.

Four controls fire on both clauses of **D18**; two blindnesses are declared with
the checks that carry them (a changed letter — carried by clause 2 and by all
eight earlier rules; a defect PG itself carries — carried by `PROVENANCE.md` §1).

**Source verification holds** under a rule that shares no channel with the
drafter's.

---

## 2. The round: is 23 of 32 the S-1 defect again?

This is question 5 and it is the round. **The drafter's claim is right and its
argument is wrong**, and the difference matters because the argument is the one
the next Book will reuse.

### 2.1 The argument as offered does not follow

The drafter offers the retention figure — 0.93669, below Book 5 v1's 0.94211 —
as evidence that the nine sentences which are not semicolon conversions are real
recasting, on the ground that *"division costs no retention, so a lower figure
means clauses moved."*

Division indeed costs no retention. But **D17 was written about the other thing
that costs retention and moves nothing**: a thorough vocabulary swap with no
syntax work at all. Book 4 v1 passed every mechanical check in the package on
exactly that basis. A single retention number cannot separate a moved clause
from a replaced word, so it cannot be the evidence that clauses moved. The
inference is invalid as stated, whatever its conclusion.

### 2.2 The measure built to answer it

`book06/review/clause_movement.py`. Two measures, each audited under **D18**
before being used, with seven controls firing on both clauses and two declared
blindnesses.

**NORM RATE — the semicolon-normalized splitting rate.** Add each text's own
semicolon count to its own sentence count, on **both** sides. A semicolon and a
period then score the same, and converting one to the other is worth exactly
zero. What is left is division that Butler's own pointing did not already
supply. *Positive* control: cashing a semicolon in the candidate leaves NORM
RATE at the same five decimal places, while D17's raw rate moves — so the two
are not the same measure written twice.

**MOVE-GAP — bag retention minus order retention.** Order retention is the
package's canonical measure. Bag retention asks the same question order-blind:
does the candidate paragraph hold a copy of this source token at all?
Substitution and deletion cost both the same and cancel; a token that survives
but has changed position is retained in the bag and lost in the alignment. So

```
1 − order_retention  =  (1 − bag_retention)  +  (bag − order)
                     =    substitution+loss   +     MOVE-GAP
```

with no residue. Controls: moving a clause without changing a word raises
MOVE-GAP; deleting a clause does not (loss is not recasting); pure substitution
lowers order retention and leaves MOVE-GAP alone — declared, because that is the
measure working, and it is the whole point.

**Displaced runs**, third and non-statistical: a run of ≥4 consecutive source
tokens, occurring exactly once on each side, that survives verbatim outside the
monotone alignment. Butler's clause, kept, relocated, named in words. *The audit
added the occurrence guard*: without it, Book 6's repeated formulas made the
second copy of a run read as a relocation of the first.

### 2.3 What the measures say

| | raw D17 | **NORM RATE** | order | bag | **MOVE-GAP** |
|---|---|---|---|---|---|
| Book 1 v3 | +20.5% | **−3.9%** | 0.73258 | 0.78346 | **0.05088** |
| Book 2 v5 | +16.1% | **+4.0%** | 0.90232 | 0.91864 | **0.01632** |
| Book 3 v3 | −1.1% | **−5.1%** | 0.86053 | 0.88117 | **0.02065** |
| Book 4 v3 | +8.9% | **+2.0%** | 0.95872 | 0.96303 | **0.00431** |
| Book 5 v1 | +23.5% | **+7.5%** | 0.94211 | 0.94932 | **0.00721** |
| Book 5 v2 (accepted) | +23.5% | **+8.0%** | 0.93808 | 0.94699 | **0.00891** |
| **Book 6 v1** | **+27.6%** | **+6.3%** | 0.93669 | 0.94594 | **0.00925** |

Four things follow, and they are not all in the drafter's favour.

1. **The headline is inflated by a factor of 4.4.** Book 6's +27.6% is the
   package's highest raw rate. On the honest denominator it is **+6.3%** —
   below both Book 5 versions. 116 sentences become 148; 23 of the 32 are paid
   for by a semicolon and **nine** are not. Two paragraphs (P004, P015) cash a
   semicolon and end with *no* net sentence gained, so even nine flatters it.
   **Seventeen of twenty-six paragraphs gain no sentence boundary a semicolon
   did not pay for**, and one paragraph — P012 — supplies four of the nine.
2. **The retention deficit is 85% vocabulary.** Book 6's `1 − 0.93669 = 0.06331`
   decomposes as **0.05406 substitution and deletion** against **0.00925
   movement**. Book 5 v1's was 0.05068 against 0.00721. So of the 0.00542 by
   which Book 6's retention sits below Book 5 v1's, **0.00338 is vocabulary and
   0.00204 is clause movement**. The majority of the very gap the drafter cites
   as proof of clause movement is not clause movement.
3. **The conclusion nonetheless survives, on the right measure.** MOVE-GAP
   0.00925 is above accepted Book 5 v2's 0.00891 and 28% above Book 5 v1's
   0.00721 — and Book 5 v1 → v2 is the controlled experiment, because the only
   thing that changed between them was three real recasts and three reversals:
   MOVE-GAP rose 0.00721 → 0.00891 and order retention fell 0.94211 → 0.93808.
   Book 6 v1 already sits past where Book 5 landed *after* its round. The
   recasting is real.
4. **The drafter's list of four is wrong in one place.** P004 (0.0417) and P013
   (0.0327, and the Book's one displaced run, «when I was at Delos») are the two
   highest-movement paragraphs and P012 supplies four of the nine real
   divisions — three of the four named are confirmed. **P005's movement is
   exactly 0.0000.** Supplying `Nausicaa` for a referential `she` is a repair,
   not a recast, and naming it as evidence of recasting is a records error
   (**R-4**).

**A caveat I owe, because it cuts against my own number.** MOVE-GAP counts *any*
relocation of a surviving token, not only clause movement. P004's 0.0417 — the
Book's highest — comes almost entirely from a dative shift and a stranded
preposition (*"given instructions to the girl"* → *"given the girl her
instructions"*, *"the place to which the goddess went"* → *"the place the
goddess went to"*), and P014's 0.0275 from *"grant you in all things your
heart's desire"* → *"grant you your heart's desire in all things"*. These are
phrase-internal, not clause movement. MOVE-GAP is therefore an **upper bound**.
The strict witness — displaced runs — returns **one** for Book 6 and **one** for
accepted Book 5 v2, which is the weaker and more honest form of point 3: Book 6
moves at least as much as accepted Book 5 does, and no more.

### 2.4 The ruling

**Book 6 is a modernization, not a proofread with better bookkeeping — but its
splitting rate is bookkeeping, and it should never again be reported without its
denominator.** The vocabulary work is the heaviest in the package after Book 1
(substitution component 0.05406, above every accepted Book), the sixty-word
census is genuinely broken 7 → 1, and the four real recasts are where the
drafter says they are, minus P005. What is *not* there is proportionate to the
+27.6% headline, and three paragraphs show it (**S-1** below).

**D19 should become a reported rate, not a reported count.** The count says how
many semicolons were cashed; NORM RATE says what the splitting rate is worth
once they are. It costs two lines beside `splitting_rate()` and it is the number
that would have made Book 5's S-1 visible before the review.

---

## 3. Substantive findings

### S-1 — three paragraphs where Butler's period still governs and nothing was done

The drafter's own defence of P006 and P016 is that "Butler is already writing
plain modern English there", and the instructions correctly note that this is
the one claim a drafter cannot certify about its own draft. Having read them
against Butler: **it is true of P006 and false of P016 and P018.**

**(a) B06-P018, the silver-plate sentence — the hardest sentence in the Book,
left untouched while three easy seams in the same paragraph were divided.**

> She glorified him about the head and shoulders as a skillful workman who has
> studied every kind of art under Hephaestus and Athena **enriches** a piece of
> silver plate by gilding it—and his work is full of beauty.

38 words. The subject of the simile, *a skillful workman*, is separated from its
verb *enriches* by eleven words, and a modern reader garden-paths at
*"under Hephaestus and Athena enriches"* — reading *Athena* as the subject of
*enriches* before backing out. This is precisely the tangled syntax the
accessibility standard exists to remove, and it is **the one sentence in the
Book where Butler's construction genuinely defeats a modern reader.** The same
paragraph cashed **three** semicolons for three easy divisions and left this
alone. That is S-1's shape exactly: work where a semicolon paid for it, none
where it did not.

*Repair, minimal:* point the relative clause so the subject and verb close up —
`as a skillful workman, who has studied every kind of art under Hephaestus and
Athena, enriches a piece of silver plate by gilding it`. *Repair, better:* put
the tenor first — `She glorified him about the head and shoulders as a skillful
workman gilds a piece of silver plate and enriches it, one who has studied every
kind of art under Hephaestus and Athena—and his work is full of beauty.` Either
is a real recast; the first costs two commas.

**(b) B06-P016 — 141 words, two word-level edits, one cashed semicolon, and a
43-word four-limb chain.**

> Neither he nor anyone else can come here to do us Phaeacians any harm, **for**
> we are dear to the gods, **and** live apart on a land's end that juts into the
> sounding sea, **and** have nothing to do with any other people.

Butler's plainness here is lexical, not syntactic: three verbs hang off one
subject across 43 words with no seam but commas, and the paragraph's second
38-word sentence has the same shape (`for … and … and`). Nothing was done to
either, because there was no semicolon to cash. One division at the second `and`
in each is the whole repair.

**(c) B06-P006** — 93 words, one word-level edit, one cashed semicolon. Here the
drafter is right: the longest sentence is 25 words and the paragraph is a
daughter talking to her father. **Recorded as answered, not as owed.**

*Disposition:* (a) and (b) are the substantive part. Neither requires a word of
Butler to be dropped.

### S-2 — none of the package's checks is executed for Book 6, by anything in the repository

The instructions ask whether any control still escapes **D18**, and whether the
`hyphen_drift()` disease — a check written once and never called again — is
cured. It is not, and it is worse than the instructions suppose: **the disease
recurred at the very next Book, in a larger form, and this time it is not one
check but all of them.**

Facts, from the repository:

- There is **no `scripts/build_book06*.py`**. `scripts/candidates/book6.py`
  holds the frozen text and `scripts/build_book_package.py N` builds the
  artefacts.
- `build_book_package.py` calls **no check in the package**. Not
  `token_retention()`, not `splitting_rate()`, not `semicolons()`, not
  `near_identical()`, not `one_word_two_ways()`, not `compound_drift()`.
- **D17's gate** — *"the build FAILS if the rate falls below half the weakest
  accepted Book's"* — lives in `build_book04_v2.py` and `build_book05_v2.py`.
  Those are Book 4's and Book 5's **correction** scripts. Neither runs for a new
  Book's v1. **D17 has never gated a v1 candidate.** Nor has the 50-word growth
  gate; nor **D19**.
- **Book 6 has no `checks-v1.md`**, though Books 4 and 5 each have one and
  **D19** says the semicolon count is "printed in each Book's `checks-vN.md`".
- One further dead check: `consecutive()` in
  `book04/review/verify_source_book4_review.py` is defined and never called
  (**R-3**).

Every published Book 6 number is therefore correct — I reproduced all of them —
and **none of them is reproducible by running anything in the repository.** They
were computed in conversation and pasted into prose. The package diagnosed
exactly this at Book 5 (*"an unrun check is worth what an absent one is worth"*)
and then shipped the next Book without a script that runs one.

*The enforcement, and it should be one thing, not a habit:* a single
`scripts/checks.py` holding `token_retention`, `sentences`, `sentence_profile`,
`splitting_rate`, `semicolons`, `norm_rate`, `near_identical`,
`one_word_two_ways`, `compound_drift` and the growth gate — imported, never
re-pasted — with one entry point `python3 scripts/checks.py N` that **writes
`bookNN/checks-vN.md` and exits non-zero on any gate**. Then two lines of
enforcement that cost nothing and cannot be forgotten:

1. `build_book_package.py` calls it at the end of every build, for the Book it
   just built. A candidate that cannot be frozen without its checks running is a
   candidate whose checks run.
2. `scripts/checks.py --all` re-runs every accepted Book and asserts each
   published figure against its `checks-vN.md`. Run it in any session that
   touches the package. It is what would have caught **R-1** below three Books
   ago.

The existing build scripts must keep reproducing their frozen outputs byte for
byte (**D10**), so they keep their own copies; the new module is for Book 7
onward and for `--all`.

---

## 4. Minor findings

- **M-1 — B06-P009 / B06-P011: `grass` is made to carry two Butler words inside
  one Book, and `herbage` is rendered two ways across Books.** This is
  question 2, and the answer is **drift, not discrimination** — on the drafter's
  own reasoning, applied consistently. Butler's `herbage` is `lush greenery` in
  accepted B05-P006 and `grass` here; and Butler's **own** `grass` stands
  untouched 200 words later, at B06-P011 (*"meadows of green grass"*). So the
  rendering `grass` now carries both Butler's `herbage` and Butler's `grass`
  within one Book — *"finding 9.1's defect exactly"*, which is the drafter's own
  phrase for why it refused `creature` for `scion` four bullets earlier in
  `continuity.md`. **Repair:** `the sweet juicy greenery that grew by the
  waterside` at B06-P009. One word, and it removes the cross-Book drift and the
  within-Book collision together. Found mechanically — see §6.1.
- **M-2 — B06-P023: `topes` → `drinks` collides with accepted B04-P020's
  `drinks`.** This is the fifth call the drafter's question 4 asks for. Butler's
  own `drinks` at accepted B04-P020 (*"Whoever drinks wine drugged in this
  way"*) is rendered `drinks`; his `topes` here is rendered `drinks` too. Same
  shape as `scion`/`creature`, refused there and taken here. It also flattens
  the joke — *topes* is habitual, idle, excessive drinking, which is the point
  of *"like an immortal god"*. **Repair:** `where he sits over his wine like an
  immortal god`, which keeps the idleness, avoids the collision, and is ordinary
  English.
- **M-3 — B06-P018: `Athena then made … She also made … She glorified …`** is
  the shape Book 5's round 1 reversed at B05-P021 (*"She gave him a … She also
  gave him a …"*) and Book 4's flow read reverted at F-1. Three semicolons were
  cashed here and two of the three divisions leave short parallel sentences
  opening on the same subject. **Repair:** rejoin the first two — *"Athena then
  made him look taller and stronger than before, and made the hair grow thick on
  the top of his head and flow down in curls like hyacinth blossoms."* The third
  needs its own sentence and should keep it. Net sentence count −1, which is the
  correct direction: see §2.
- **M-4 — B06-P018: the silver-plate sentence's pointing.** The minimal half of
  **S-1(a)**, recorded separately because it can be applied alone.
- **M-5 — B06-P015: `you appear to be` → `you seem to be`, flattening a
  difference Butler wrote.** Butler has *"you appear to be a sensible,
  well-disposed person"* here and *"you seem to be a sensible person"* at
  B06-P021. The candidate prints `seem` in both, six paragraphs apart, so a
  phrase Butler varied now repeats almost verbatim in one speech and its
  answer. This is the mirror defect the instructions name. **Repair:** restore
  `appear` at P015.
- **M-6 — B06-P022: `picked up` is out of register.** Butler: *"a vagabond
  sailor **whom she has taken** from some foreign vessel"*. `picked up`, said of
  a man a girl is rumoured to be marrying, carries a modern innuendo Butler's
  verb does not, and the voice rules forbid modernizing into contemporary idiom
  that breaks the register. **Repair:** `she has taken off some foreign vessel`.
- **M-7 — B06-P026: `prevent` → `keep` is an unnecessary change that creates a
  cross-Book difference.** *"prevent Odysseus from getting home"* is ordinary
  modern English and needed nothing; accepted B02-P011 keeps Butler's `prevent`.
  **Repair:** restore `prevent`.
- **M-8 — B06-P009: the `As … even so` correlative is broken by the division.**
  This is half of question 3. Butler's simile is one correlative period:
  *"**As** the huntress Diana goes forth … **even so** did the girl outshine her
  handmaids."* Splitting off the apodosis leaves the 60-word protasis standing
  as a complete sentence in its own right, where `As` is now read as *while* —
  a statement about what Artemis habitually does — and the simile has to be
  reconstructed backwards from `Even so`. **Repair:** open with `Just as` so the
  protasis cannot be read as temporal, and let `so` close it: *"Just as the
  huntress Artemis goes out over the mountains … **So** did the girl outshine
  her handmaids."* Two words. The division itself is right (see the ruling on
  question 3 in §6.3).
- **M-9 — B06-P014: `discomfits` → `thwarts` shifts the sense.** *Discomfit* in
  Butler's sense is to defeat or throw into confusion; *thwart* is to frustrate
  a **plan**, which imports a purpose the enemies have not been given. The
  drafter's note rules out `dismays` under the Book 1 row; `galls` and
  `confounds` are both free and both nearer. **Repair:** `It galls their
  enemies`.

---

## 5. Optional findings

- **O-1 — B06-P013: `scion` → `young woman` loses the figure the next sentence
  needs.** The reasoning that rules out `creature` is correct (see §6.4). But
  *scion* is a **plant** word — a young shoot — and Butler's very next sentence
  is *"I can only compare you to a young palm tree … Never yet did such a young
  plant shoot out of the ground."* The word prepares the simile. `young woman`
  is safe and severs it. If no rendering holds both senses, **record the loss**
  rather than leaving it unremarked; `continuity.md` currently records only the
  `creature` half of the decision.
- **O-2 — B06-P011: *"they sound like the voices of the nymphs"*** repeats
  *voices* four words after *"I seem to hear the voices of young women"*.
  Butler's *"like those of"* avoided it. `like nymphs that haunt mountain tops`
  is shorter and loses nothing.
- **O-3 — three archaic inversions, two kept and one removed, and division
  promoted both survivors to sentence-initial position.** `Even so did the girl
  outshine her handmaids` (P009) and `Even such did Odysseus seem to the young
  women` (P012) were mid-sentence in Butler and now open sentences, where the
  inversion is conspicuous; `Thus did he pray` (P026) is un-inverted to `So he
  prayed`. One class, two dispositions — the shape **D16** exists to forbid for
  punctuation. Worth one rule either way.
- **O-4 — B06-P010: `conduct` → `guide` adds a fourth rendering of Butler's
  `conduct`/`conducted` family** (`take` B01-P007, `led` B01-P010, `conducted`
  B04-P024, `guide` here). `guide` is right for this sentence; the family as a
  whole has never been ruled on. Arrow A of §6.1 prints it.
- **O-5 — B06-P024: `plied her whip with judgement` → `used her whip`.** *Ply*
  is current English and more exact (repeated, workmanlike application);
  `used` is the one flat word in an otherwise well-judged paragraph.
- **O-6 — `mountain tops` (B06-P009, B06-P011).** Recorded in `continuity.md` as
  open and consistent with accepted B05-P030, so it is not an unrecorded
  departure. But `mountaintop` is the standard closed form in American English,
  which is the spelling standard **D15** names, and **no check in the package
  can see this pair** — see §6.6. Repairing it costs a successor to accepted
  Book 5, so it is a coordinator decision, not a Book 6 one.

---

## 6. The five questions, and the four matters left open

### 6.1 Question 4 and matter 1 — the four calls, and whether the class can be mechanized

**It can.** `book06/review/rendering_collisions.py` is
`one_word_two_ways()` with two changes, each of which is one idea:

- **run across Books**, because `herbage` is Butler's word in Book 5 *and* Book 6
  and no single-Book check can compare its renderings;
- **key on the candidate's side as well**, because the defect refused at `scion`
  is not one Butler word rendered two ways — it is one *rendering* made to carry
  two Butler words, and that arrow does not exist in the package.

The report is made readable by one restriction and nothing is exempted by hand:
**only Butler's rare words count** on the Butler side — a word he uses in three
paragraphs or fewer across all six Books is a word whose rendering is a
decision. Arrow A returns 97 rows, arrow B 124; 47 touch Book 6.

**The audit failed the rule twice as first written.** (i) Both arrows carried a
cross-Book precondition, which threw away the single most useful row in the
report — `grass ← grass (B6-P011) | herbage (B6-P009)` — because both halves are
in one Book. A collision inside one Book is the same defect and is cheaper to
repair; the precondition is gone. (ii) Arrow B was gated on Butler's rarity on
*both* sides, which hid accepted B04-P010: Butler's **common** `in two minds` is
reused there as the rendering of his **rare** `doubted whether`. Arrow B's
candidate side is now ungated. Three controls fire on both clauses, including
one that asserts arrow A does **not** move when only arrow B's defect is
planted — the two arrows are two checks, not one written twice.

Ruling on the four calls:

| call | ruling |
|---|---|
| **(a) `live in heaven` / `dwell in heaven`, both at P019** | **Correct.** Butler writes both eleven words apart and the candidate prints both. Flattening them would be the mirror defect. |
| **(b) `skilful` → `skillful`, not `skilled`** | **Correct, and now mechanically confirmed.** Butler writes *both* words, and accepted Book 5 contains both: his `skilful` → `skillful`, his `skilled` → `skilled`. Arrow B flags neither. A discrimination. |
| **(c) `doubted whether` not rendered `still undecided`** | **Correct for this Book, and the class is not clean.** `still undecided` is indeed the fixed rendering of `thus in two minds` (B04-P011, B05-P028, B05-P032). But accepted **B04-P010 renders Butler's `doubted whether` as `was in two minds`** — Butler's *own other phrase* — one paragraph before his real `in two minds` is replaced by `still undecided`. So Butler's `doubted whether` already has two renderings across accepted Books (`in two minds`, and `did not know what to do` here), and one of them is a word reserved for something else. **B06-P012 is the better of the two.** The repair is in accepted Book 4 (`he did not know whether to let him choose his own time for speaking`), which means a fifth successor — **escalate to the coordinator**; do not fix Book 6 to match the defect. |
| **(d) `scion` not rendered `creature`** | **Correct, with a caveat.** `creature` is Butler's own word at B04-P077(×2) and B05-P010 and is rendered `creature`; taking it for `scion` would be the collision. The replacement lands on `young`, which arrow B shows also carries Butler's `youngster` (B02-P023) — much weaker, since `young` is a bare adjective rather than a reserved rendering, but the same shape. See **O-1** for the figure that is lost. |
| **the fifth the drafter missed** | **`topes` → `drinks`, M-2.** Found by arrow B, not by reading. |

### 6.2 Question 1 — the supplied name at B06-P005

**Rule: the supplied `Nausicaa` is correct, and it is the same class as accepted
B05-P012's supplied `and`.** Ruling 2 there was *a defective sentence is
repaired by the smallest edit in the direction of the defect*. The defect here
is referential: Butler's `she` has the mother as its nearer subject and Nausicaa
as its referent, and a modern reader takes the wrong one. The smallest edit *in
the direction of that defect* is to name the referent. It is not a larger
intervention than recasting would be — it is smaller: the recast alternatives
either name her anyway or leave the pronoun ambiguous. Note that **the division
alone does not fix it** — *"Her mother was sitting by the fireside … She
happened to catch her father"* is if anything worse — so the name is doing the
work, and the division is separate.

The `Nausicaa` count 10 → 11 is correctly recorded in `continuity.md` §5 and
correctly declared as the Book's one non-matching name count. Accept.

**But see R-4:** P005 is also named as one of four paragraphs of genuine
recasting, and its clause movement is 0.0000. Repairing an ambiguity is not
recasting, and the two claims should not be made of the same paragraph.

### 6.3 Question 3 — the Artemis simile at 60 words

**Sixty is the right place to stop.** The chain *is* the figure — Artemis on the
mountains, the nymphs, Leto's pride, and only then the comparison — and the
**B04-P038** disposition applied to a simile is the right precedent. The
candidate is also **shorter** than Butler (60 against 67), which is the side of
Book 5's finding 30.2 a recast should be on. Dividing this chain further would
produce the mechanically short sentences the accessibility standard forbids.

**Opening the parenthesis out is a small loss, and an acceptable one.** Butler's
*(then is Leto proud…)* is an aside in the narrator's voice; as a coordinate
clause — *"and Leto is proud then to see…"* — it joins the chain and reads as
part of the same action rather than as a step outside it. Against that: the
package carries no apparatus and a parenthesis inside a 60-word simile is a
second layer a modern reader must hold. Accept the opening-out.

**The real loss is the correlative, not the parenthesis** — see **M-8**, which
costs two words to repair.

### 6.4 Question 2 — `herbage`

**Drift.** See **M-1**. The referents genuinely differ and each rendering is
good English for its referent — but the discrimination collapses because the
chosen word collides with Butler's own `grass` inside the same Book. The cheaper
repair is in Book 6, as the instructions anticipate, and it is one word.

### 6.5 Matter 4 — D19's growth gate

**The gap is real, it did not matter in this Book, and it should be closed
because closing it is cheaper than deciding each time whether it mattered.**

The gate compares each paragraph's **longest** candidate sentence with its
source paragraph's **longest**, and fails only when the result is ≥50 words. Two
holes follow, and the second is the worse one:

1. A sentence that is not the paragraph's longest can grow without limit
   (bounded only by becoming the longest).
2. It is a **maximum against a maximum, not like against like.** A draft that
   divides a paragraph's longest sentence lowers the paragraph's new maximum,
   and can then grow a *different* sentence past the old one's length with the
   gate still reporting no growth at all. Division buys cover for growth. That
   is a defect the gate cannot see by construction, not merely one it lets
   through.

**In Book 6 it costs nothing.** Four paragraphs' longest sentences grew (P004
35→36, P011 30→31, P015 38→40, P019 26→27) and none reaches 50. Aligning every
candidate sentence to the source sentence it came from (best token overlap)
finds **14** grown sentences in all, the largest growth 2 words and the largest
result **40** — well clear of the threshold. No instance.

**The repair:** align sentences instead of comparing paragraph maxima; keep the
50-word failure threshold exactly as it is; **report** every growth, and report
it at ≥40 so the number is visible before it is a failure. It is ten lines, and
it belongs in the `scripts/checks.py` of **S-2**.

### 6.6 Matter 3 — the compound blind spot H.1

**Worth closing, and it cannot be closed with the package's own materials.**

The blind spot is real and Book 6 contains a live instance: `mountain tops`
(**O-6**). `compound_drift()` cannot see it — the corpus prints the pair open
everywhere, which is exactly its declared blindness — and no other check
enumerates two-word sequences at all.

**The obvious instrument does not work, and I ran it rather than assuming.**
Take every content-word pair in the candidate and ask whether its closed form is
attested as a single word anywhere in PG #1727 plus all six sources and all six
candidates — 720 KB of Butler. **Zero hits.** Butler never writes `mountaintop`,
`seafarer` or `waterside` as one word; that is why the package has been closing
compounds by hand in the first place. The corpus cannot be its own dictionary.

So full closure needs an external word list — a **new dependency**, which is a
coordinator decision under the autonomy framework, and worth putting to them,
because one vendored 100 KB list would settle D15 mechanically for all 24 Books.

**A cheaper instrument is available now and I would ship it either way.** Book 6's
candidate holds **482** distinct content-word pairs — too many to read. Filter to
pairs whose **second** element is a common compound head (`top`, `side`, `land`,
`man`, `room`, `water`, `sea`, `stone`, `way`, `house`, `post`, `wall`, `court`,
`field`, `fire`, …) and the list falls to **23**, which a reviewer reads in a
minute:

> bearing posts · chief man · deep water · either side · famous sea · fine house ·
> full head · husband house · inner court · large stones · linen room · little way ·
> **mountain tops** · neither man · outer court · own room · own ship · poor man ·
> pure water · salt water · sounding sea · young men

`mountain tops` is the only one that raises a question, and it is the instance.
Publish that list in each Book's `continuity.md` beside the compound table. It
converts the blind spot from invisible to enumerated, at a cost of twenty lines
of report per Book, without a dependency.

---

## 7. Records findings

- **R-1 — the D17/D19 comparison table is not six comparable numbers.** Book 3's
  row (`0.897`, `164 → 173`, `+5.5%`, `39 → 32`) is computed on **37 of its 38
  paragraphs**: B03-P038, the **D14** splice where the served source carries 208
  words of the replaced `modern-en` against Butler's 12, is excluded. Nothing in
  `review-instructions.md` or `RESUME.md` says so. Running the package's own
  `token_retention()` and `splitting_rate()` on accepted `book03/candidate-v2.json`
  gives **0.86053** and **176 → 174 (−1.1%)**. Dropping P038 reproduces the
  published figures to five places (0.89641, 164 → 173, +5.5%), which confirms the
  cause. The exclusion is *correct* — a paragraph with no source should not be
  scored — but it must be **stated in the table**, or the package's only
  cross-Book instrument silently compares one Book on a different denominator.
  This is the same class as the Book 1 retention discrepancy (finding R2 of
  Book 4) and it would be caught by `scripts/checks.py --all` (**S-2**).
- **R-2 — B06-P020's D16 repair is unrecorded.** Butler's *"She got the linen
  folded and placed in the waggon, **she** then yoked the mules"* is a comma
  splice; the candidate deletes the subject and repairs it. That is squarely
  **D16** (*a Victorian mark is repaired when a modern reader reads it as an
  error*). Book 4 recorded its three D16 instances by name in `continuity.md`;
  Book 6 makes this one silently. The disposition is right; the record is
  missing.
- **R-3 — `consecutive()` in `book04/review/verify_source_book4_review.py` is
  defined and never called**, in any file in the package. A dead check inside a
  review script, in a package whose standing lesson is that an unrun check is
  worth what an absent one is worth.
- **R-4 — B06-P005 is named as genuine recasting and contains none.** Its
  clause-movement figure is 0.0000 and its one intervention is a supplied name,
  which is a repair. Three of the four named paragraphs (P004, P012, P013) hold
  up; the list should say three.
- **R-5 — `continuity.md` §11 says the one-word-two-ways report "returns 75 rows,
  almost all function words" and that "the three that are real are recorded".**
  Reproduced: 75 rows exactly. But the claim that three are real is the
  drafter's reading of a per-Book, Butler-keyed report; run across Books and in
  both directions (§6.1), Book 6 touches **47** rows, of which at least two more
  are real (`herbage`/`grass`, `topes`/`drinks`). The sentence should say what
  the report can and cannot see, not how many rows are real.

---

## 8. Every paragraph

| id | finding |
|---|---|
| **B06-P001** | No material issue found. Two semicolons cashed, both at joints Butler's `but` already marked; `moved them thence` → `from there`, `did Minerva hie in furtherance of the return of Ulysses` → `Athena made her way, to help bring Odysseus home` — the one place the Roman-form sentence had to be rebuilt, and it is rebuilt without adding a motive. |
| **B06-P002** | No material issue found. 93 → 88 words, all of it loose relative pronouns (`a girl who was as lovely` → `a girl as lovely`); `maid servants` → `maidservants` and `well made` → `well-made` are D15 and recorded. |
| **B06-P003** | No material issue found. `what can your mother have been about` → `have been thinking of` is right for Butler's idiom; `remain a maid` → `remain unmarried` is recorded and correct (the Book's own `maids` are servants, eleven of them); `girdles` → `belts` matches accepted Book 5. One real division and no semicolon in the source. |
| **B06-P004** | No material issue found. The Book's highest movement figure (0.0417) and the drafter is right to name it — though the movement is a dative shift and a stranded preposition rather than clause movement (§2.3). `abides` → `lies`, `wherein` → `in which`, `illumined` → `illuminated`; Butler's `but` is kept and only his semicolon is lowered to a comma. |
| **B06-P005** | No material issue found in the text. The supplied `Nausicaa` is correct — §6.2 — and its name-count effect is declared. **R-4** is against the drafter's characterization of the paragraph, not against the paragraph. |
| **B06-P006** | No material issue found. 94 words, one word-level edit, and on this one the drafter's "Butler is already plain here" survives inspection: longest candidate sentence 25 words, and the voice is a daughter coaxing her father. `Papa dear` rightly kept. |
| **B06-P007** | No material issue found. `the men shall get you` → `will get you`; nothing else moved, and nothing needed to. |
| **B06-P008** | No material issue found. `On this` → `At this` and `whereon` → `At that`, both per the connective table; `put them to` → `hitched them to it` and `cruse` → `flask` are the right calls; `goat skin` → `goatskin` is D15. |
| **B06-P009** | **M-8** (the `As … even so` correlative broken by the division) and **M-1** (`grass` for `herbage`, colliding with Butler's own `grass` at P011). The 60-word stop is right and the parenthesis may be opened out — §6.3. `water side` → `waterside` and `sea side` → `seaside` are D15 and are why Book 2 has a fifth version. **O-6** (`mountain tops`) touches this paragraph. |
| **B06-P010** | **O-4** — `conduct` → `guide` adds a fourth rendering of Butler's conduct family. Otherwise clean: `On this` → `At this`, and `The girl, therefore, threw a ball` → `So the girl threw a ball` is a genuine small recast. |
| **B06-P011** | **O-2** — `the voices of the nymphs` repeats *voices*. `amongst` → `among`, `uncivilised` → `uncivilized`, `Let me try if` → `Let me see if`: all correct. |
| **B06-P012** | No material issue found, and this is the Book's best paragraph. Four of the Book's nine real sentence boundaries are here, in a source paragraph with **one** semicolon, which the candidate **keeps** — so none of the four is bought. The deliberation is genuinely recast (`he doubted whether he should … or stay` → `he did not know what to do. He might … ; or he might …`) with both branches and their consequences intact, and `In the end he thought it best` carries the B05-P037 formula. `doubted whether` is correctly not `still undecided` — but see §6.4(c): the class is not clean, and the defect is in accepted Book 4. |
| **B06-P013** | **O-1** — `scion` → `young woman` severs the shoot/palm-tree figure the next sentence depends on. The paragraph is otherwise the second real recast: five semicolons cashed *and* the palm-tree clause order untangled (the Book's one displaced run, «when I was at Delos», moved to where a modern reader needs it), the two-branch `If you are a goddess … if on the other hand` kept whole with both consequences, and `thrice happy` given its `then`. 302 → 309 words is the Book's largest expansion and it is all connective tissue, not addition. |
| **B06-P014** | **M-9** — `discomfits` → `thwarts` imports purposive frustration. `hither` → `here`, `have pity upon` → `on`, `any one` → `anyone` all correct; the heart's-desire phrase is moved, not changed. |
| **B06-P015** | **M-5** — `appear` flattened into `seem`, creating a near-verbatim echo of P021 six paragraphs later. Two semicolons cashed for one net sentence; `this our country` → `this country of ours` and `daughter to` → `the daughter of` are right. |
| **B06-P016** | **S-1(b)** — 141 words, two word-level edits, one cashed semicolon, and two chains of 43 and 38 words left exactly as Butler built them. The claim that Butler is already plain here is lexically true and syntactically false. |
| **B06-P017** | No material issue found. Six sentences in, six out, no semicolon in the source, and the work is all vocabulary and preposition: `please to stand … on one side` → `please stand … to one side`, `cruse` → `flask`, `good looking` → `good-looking`. A paragraph where Butler's periods are already the right length and the candidate leaves them alone — which is the correct answer when it is the correct answer. |
| **B06-P018** | **S-1(a)** / **M-4** (the silver-plate sentence, left with its garden path) and **M-3** (`Athena then made … She also made …`). Three semicolons cashed for three divisions, two of which are worse than Butler's semicolon and the third of which stops one clause short of the sentence that needed the work. The name mapping through `Vulcan` → `Hephaestus` is correct and adds no row to the closed table. |
| **B06-P019** | No material issue found, and the `live in heaven` / `dwell in heaven` pair eleven words apart is correctly carried both ways — §6.1(a). `just such another as he is` → `just such a man as he is` is the right small repair. |
| **B06-P020** | **R-2** — the D16 repair of Butler's comma splice is right and unrecorded. `bethought her of another matter` → `thought of another matter` carries the Book 4 formula exactly. |
| **B06-P021** | No material issue found. `as I bid you` → `as I tell you` (B05-P026 formula), `road side` → `roadside`, `farm lands` → `farmlands`, `sea-faring` → `seafaring`, `harbour` → `harbor`; the `as long as … presently, however` contrast is kept whole, and `Presently, however, we shall come to the town.` is one of the Book's nine real divisions. Dropping `will be` from `the ships will be drawn up` leaves a clean reduced relative under `You will find`. |
| **B06-P022** | **M-6** — `picked up`. Otherwise the hardest paragraph in the Book handled well: the nested single quotation survives with its marks, the conditional slander is imagined and then answered without either half being tidied, and the paragraph stays unbalanced under **D4** exactly as Butler left it. |
| **B06-P023** | **M-2** — `topes` → `drinks` collides with accepted B04-P020. The rest is sound: `as I bid you` → `as I tell you`, `gain her over` → `win her over`, `if you would get home` → `if you want to get home`, `bearing-posts` kept with Butler's hyphen and explained by its own sentence, and *"about as far from the town as a man's voice will carry"* preserved word for word — the one measurement in the Book, and it is not converted into a number. |
| **B06-P024** | **O-5** — `plied` → `used`. `judgement` → `judgment` is the spelling standard; four sentences in and four out, correctly. |
| **B06-P025** | No material issue found. The prayer formula is accepted **B04-P068** word for word, including `unweariable` → `unwearying`, and `aegis-bearing Zeus` is lower-cased as in B03-P031, B04-P066 and B04-P068. Near-identical by design, as the drafter says. |
| **B06-P026** | **M-7** — `prevent` → `keep`, an unnecessary change against accepted B02-P011. `Thus did he pray` → `So he prayed` is good (but see **O-3**); `endeavors` → `efforts` is fine; Poseidon as Athena's **uncle** is kept. |

---

## 9. What the package's checks would still not catch

Listed because the package's method is to name the blind spot and the check that
carries it, and these have no carrier.

1. **A sentence divided at the wrong seam.** D17 counts sentences and NORM RATE
   counts sentences a semicolon did not pay for. Neither can tell a good
   division from a bad one; **M-3** and **M-8** were found by reading, as Book
   4's F-1 and Book 5's three reversals were. The carrier is the flow read
   (step 7), and it is a person.
2. **A sentence left long because it *is* long in Butler.** Every length check
   in the package is relative to the source, so a 43-word four-limb chain that
   Butler also wrote at 43 words (**S-1(b)**) passes everything. An absolute
   report — every candidate sentence over 40 words, with its source sentence
   beside it — would have put P016 and P018 in front of the drafter. Cheap, and
   it belongs in `scripts/checks.py`.
3. **A garden path.** Nothing in the package models what a reader parses.
   B06-P018's *"under Hephaestus and Athena enriches"* survives every check in
   the repository and defeats the first reading of every human being.
4. **Register.** `picked up` (**M-6**) is ordinary modern English, shortens the
   sentence, costs no retention, and is wrong. No mechanical check will ever see
   it.
5. **A compound the whole corpus sets open** (§6.6), demonstrated with zero hits
   rather than asserted.
6. **A figure carried by a single word**, like `scion` preparing the palm tree
   (**O-1**). Retention counts the word; nothing counts what it was for.
7. **A check that does not run.** **S-2.** Until something in the repository
   fails when the checks are skipped, this is the blind spot that hides all the
   others, and it is the one the package has now diagnosed twice.

---

## 10. Artefacts written by this review

All under `book06/review/`, and nothing else was touched.

| file | what it is |
|---|---|
| `findings-v1.md` | this file |
| `verify_source_book6_review.py` | the ninth source rule — letter-blind typographic shape; 4 controls, 2 declared blindnesses |
| `clause_movement.py` | NORM RATE, MOVE-GAP and displaced runs; 7 controls, 2 declared blindnesses; prints the cross-Book table of §2.3 and the per-paragraph ledger |
| `rendering_collisions.py` | `one_word_two_ways()` across Books and in both directions; 3 controls |

Each is runnable from `books/staged-replacements/odyssey/` with `python3`, needs
no network, and calls `scripts/controls.py` for every control rather than
hand-rolling one (**D18**).
