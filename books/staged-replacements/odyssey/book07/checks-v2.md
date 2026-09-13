# Odyssey Book 7 — checks, candidate v2

Written by `scripts/checks.py`, which is the only thing that computes
these numbers. Before it existed, **none of the package's checks was
executed for a new Book by anything in the repository** — substantive
finding **S-2** of `book06/review/findings-v1.md`. Every figure below
is reproducible by running `python3 scripts/checks.py 7`.

**Subject:** `book07/candidate-v2.json`, sha256 `e79eb82b5ce6051dc3c61ca39c4480406cf0e2a106c0d53f5182fafe1d3163ac`.

**Basis — records finding R-1.** all 29 paragraphs. A figure without the paragraph
set it is computed over is not a figure, and the package published
one for three Books.

## 1. Verdict

**All gates pass.**


## 2. The figures

| measure | value |
|---|---|
| paragraphs scored | 29 |
| word ratio | 1.00269 |
| Butler token retention (canonical, aggregate-join) | **0.93438** |
| order retention (per paragraph, for MOVE-GAP) | 0.93438 |
| bag retention (order-blind) | 0.94656 |
| **MOVE-GAP** (bag − order), D20 | **0.01217** |
| sentences, source → candidate | 103 → 138 |
| **splitting rate** (D17, raw) | **+34.0%** |
| semicolon-normalized sentences | 133 → 145 |
| NORM RATE as published (D20) | +9.0% |
| semicolon-normalized, on Butler's pointing | 133 → 143 |
| **NORM RATE on Butler's own pointing** (D20, S-1) | **+7.5%** |
| sixty-word sentences | 7 → 0 (100% broken) |
| **semicolons, Butler → candidate** (D19) | **30 → 7** |
| **of which KEPT of Butler's / ADDED by the draft** (S-1) | **5 kept + 2 added** |
| **dividing marks, Butler → candidate** (D27: `;` `:` sentence-internal `—`) | **42 → 18** |
| **of which KEPT / ADDED** (D27) | **14 kept + 4 added** |
| dividing-mark-normalized sentences | 145 → 156 |
| NORM RATE, every dividing mark (D27) | +7.6% |
| dividing-mark-normalized, on Butler's pointing | 145 → 152 |
| **NORM RATE, dividing marks on Butler's pointing** — **the compared figure from Book 8 forward** (D27+D21) | **+4.8%** |

Of the +35 sentences added, at most **23** are a semicolon
rewritten as a period — the operation that adds a sentence, moves no
clause, drops no word and costs no retention. That is what NORM RATE
prices out, and why **D19 is a rate and not a count** (D20).

**And the mirror operation, which is the one D20 never priced.**
Substantive finding **S-1** of Book 7's round 1: a comma raised to a
semicolon adds nothing to the sentence count, adds one to the
candidate's semicolon count, and therefore scores under D20 exactly
what a real period scores — while leaving the clause chain inside one
sentence. A period costs a recast; a semicolon costs a keystroke.
**2 of this candidate's 7 semicolons are its own**, and the figure
that is COMPARED from Book 7 forward is **NORM RATE on Butler's own
pointing**, +7.5% here against the +9.0% the unsplit measure gives.

## 3. The cross-Book table, with every basis stated (R-1)

| Book | basis | retention | sentences | raw D17 | semicolons | dividing marks (D27) | kept + added | NORM RATE (D20) | **NORM RATE, D27 on Butler's pointing** | MOVE-GAP |
|---|---|---|---|---|---|---|---|---|---|---|
| Book 1 | all 32 paragraphs | 0.72703 | 132 → 159 | +20.5% | 47 → 13 | 55 → 39 | 20 + 19 | -3.9% | **-4.3%** | 0.05088 |
| Book 2 | all 35 paragraphs | 0.90232 | 137 → 159 | +16.1% | 36 → 21 | 58 → 61 | 36 + 25 | +4.0% | **+0.0%** | 0.01632 |
| Book 3 | 37 of 38 | 0.89641 | 164 → 173 | +5.5% | 39 → 32 | 53 → 47 | 39 + 8 | +1.0% | **-2.3%** | 0.02156 |
| Book 3 *(all 38)* | all 38 paragraphs (B03-P038 included) | 0.86053 | 176 → 174 | -1.1% | 41 → 32 | 56 → 47 | 39 + 8 | -5.1% | **-8.2%** | 0.02065 |
| Book 4 | all 81 paragraphs | 0.95872 | 281 → 306 | +8.9% | 68 → 50 | 103 → 81 | 80 + 0 | +2.0% | **+0.5%** | 0.00431 |
| Book 5 | all 37 paragraphs | 0.93808 | 153 → 189 | +23.5% | 34 → 13 | 64 → 35 | 34 + 1 | +8.0% | **+2.8%** | 0.00891 |
| Book 6 | all 26 paragraphs | 0.93408 | 116 → 148 | +27.6% | 27 → 5 | 38 → 16 | 14 + 2 | +7.0% | **+5.2%** | 0.01156 |
| Book 7 | all 29 paragraphs | 0.93438 | 103 → 138 | +34.0% | 30 → 7 | 42 → 18 | 14 + 4 | +9.0% | **+4.8%** | 0.01217 |

Book 3's row is the reason this column exists. Its published figures
are computed on **37 of its 38 paragraphs** — B03-P038, the **D14**
splice — and nothing said so until now. On all 38 the same measures
give 0.86053 and 176 → 174 (−1.1%), and the D17 floor derived from
them would be **negative**, which is to say the gate would be
vacuous. The exclusion is right; its silence was not.

## 4. D17's gate

Floor **+2.7%**, half accepted Book 3's +5.5% — computed from
the accepted files on each Book's own basis, never re-pasted from
prose. This candidate: **+34.0%**. Sixty-word survival gate:
0 of 7 survive, and the gate fails above 5.25.

## 5. The growth gate, aligned sentence to sentence (D20)

D19's gate as built compared each paragraph's **longest** candidate
sentence with its source paragraph's **longest** — a maximum against
a maximum. A draft that divides a paragraph's longest sentence lowers
the new maximum and can then grow a *different* sentence past the old
one's length with the gate reporting nothing. Division bought cover
for growth. Sentences are now aligned by best token overlap; 50 words
remains the failure; growth is reported from 40.


Sentences grown to 40 words or more: **2**.

| paragraph | source sentence | candidate sentence |
|---|---|---|
| B07-P014 | 41 words | 43 words |
| B07-P028 | 40 words | 41 words |

## 6. Every candidate sentence over 40 words (absolute)

Blind spot 2 of `findings-v1.md` §9, which had no carrier: *a
sentence left long because it **is** long in Butler.* Every other
length check in the package is relative to the source, so a 43-word
four-limb chain that Butler also wrote at 43 words passes all of
them — which is how B06-P016 and B06-P018 reached a review
untouched. This report is absolute.

**10 sentences.**

| paragraph | words | source paragraph's longest | sentence |
|---|---|---|---|
| B07-P002 | **42** | 42 | Presently Odysseus got up to go toward the town, and Athena shed a thick mist all round him to hide him, in case any of … |
| B07-P010 | **53** | 55 | There are fifty maidservants in the house, some of whom are always grinding rich yellow grain at the mill, while others … |
| B07-P011 | **50** | 73 | On the level ground of a part of it the grapes are being made into raisins; in another part they are being gathered; som… |
| B07-P014 | **43** | 41 | Then he sat down on the hearth among the ashes, and they all held their peace, till presently the old hero Echeneus, who… |
| B07-P018 | **50** | 59 | They come and sit at our feasts just like one of ourselves, and if any solitary traveler happens to stumble upon one or … |
| B07-P020 | **47** | 48 | Then, when they had made their drink offerings and had each drunk as much as he wanted, they went away to bed, every man… |
| B07-P022 | **41** | 69 | The sea was so terribly high that I could no longer keep to my raft, which went to pieces under the fury of the gale, an… |
| B07-P023 | **47** | 57 | Sick and sorry as I was, I slept among the leaves all night, and through the next day till afternoon, when I woke as the… |
| B07-P027 | **40** | 41 | Then Odysseus was glad, and prayed aloud, “Father Zeus, grant that Alcinous may do all as he has said, for so he will wi… |
| B07-P028 | **41** | 46 | Then Arete told her maids to set a bed in the room that was in the gatehouse, and to make it with good red rugs, and to … |

## 7. Displaced runs — the strict clause-movement witness

A run of four or more consecutive Butler tokens, occurring exactly
once on each side, surviving verbatim outside the monotone
alignment. MOVE-GAP is an upper bound; this is the lower one.

**1.**

| paragraph | run |
|---|---|
| B07-P013 | «to help me home to my own country as soon as possible» |

## 8. Paragraphs near-identical to Butler (40+ words, ≤4 edits)

| paragraph | source words | edits | longest sentence |
|---|---|---|---|
| B07-P002 | 74 | 4 | 42 words |
| B07-P009 | 116 | 3 | 39 words |
| B07-P025 | 50 | 3 | 28 words |
| B07-P027 | 41 | 3 | 40 words |

## 9. One Butler word rendered two ways (per Book, Butler-keyed)

**82 rows.** This report's declared limits, which records finding
**R-5** is about: it keys on Butler's side only and runs inside one
Book, so it cannot see one *rendering* made to carry two Butler
words, and it cannot compare a word's renderings across Books. Both
arrows, across all Books, are `scripts/rendering_collisions.py`.

| Butler word | times changed | times kept | kept at (first six) |
|---|---|---|---|
| `about` | 1 | 6 | P008, P011, P012, P019, P019, P026 |
| `alcinous` | 1 | 20 | P001, P003, P004, P006, P007, P007 |
| `all` | 2 | 22 | P002, P010, P010, P010, P011, P011 |
| `along` | 1 | 4 | P004, P010, P024, P025 |
| `also` | 2 | 3 | P008, P011, P023 |
| `and` | 5 | 144 | P001, P001, P001, P001, P001, P001 |
| `as` | 6 | 25 | P001, P001, P001, P002, P003, P004 |
| `at` | 1 | 19 | P001, P004, P006, P006, P010, P010 |
| `be` | 1 | 14 | P002, P003, P006, P015, P015, P018 |
| `before` | 1 | 4 | P009, P011, P012, P020 |
| `both` | 1 | 3 | P006, P008, P022 |
| `but` | 1 | 19 | P001, P004, P006, P006, P007, P009 |
| `by` | 1 | 13 | P001, P004, P006, P007, P008, P008 |
| `country` | 1 | 4 | P003, P008, P018, P027 |
| `did` | 4 | 4 | P012, P020, P025, P026 |
| `during` | 1 | 2 | P021, P026 |
| `every` | 3 | 5 | P008, P017, P020, P021, P025 |
| `for` | 2 | 35 | P001, P001, P001, P004, P005, P006 |
| `have` | 1 | 10 | P008, P011, P013, P018, P018, P018 |
| `he` | 2 | 34 | P001, P001, P002, P002, P005, P005 |
| `help` | 1 | 1 | P008 |
| `his` | 1 | 21 | P006, P006, P006, P007, P010, P012 |
| `home` | 2 | 5 | P008, P018, P018, P019, P026 |
| `husbands` | 1 | 1 | P008 |
| `i` | 1 | 42 | P003, P004, P004, P013, P013, P018 |
| `in` | 1 | 51 | P002, P002, P002, P003, P003, P004 |
| `into` | 1 | 6 | P001, P011, P016, P019, P023, P023 |
| `is` | 2 | 28 | P006, P006, P006, P006, P006, P008 |
| `it` | 1 | 22 | P010, P011, P011, P011, P011, P015 |
| `itself` | 1 | 2 | P011, P019 |
| `just` | 1 | 2 | P011, P018 |
| `keep` | 1 | 3 | P010, P022, P026 |
| `me` | 1 | 33 | P003, P006, P019, P019, P019, P019 |
| `my` | 2 | 22 | P003, P004, P013, P013, P018, P019 |
| `no` | 1 | 8 | P018, P018, P018, P019, P022, P022 |
| `nor` | 2 | 2 | P011, P019 |
| `not` | 1 | 14 | P003, P004, P004, P005, P006, P015 |
| `odysseus` | 2 | 16 | P001, P002, P002, P005, P009, P012 |
| `of` | 3 | 100 | P001, P001, P002, P002, P002, P003 |
| `on` | 4 | 21 | P001, P009, P009, P009, P010, P010 |
| `once` | 1 | 4 | P012, P018, P018, P019 |
| `one` | 4 | 9 | P005, P006, P010, P011, P016, P018 |
| `other` | 1 | 5 | P007, P010, P011, P018, P018 |
| `our` | 1 | 2 | P018, P018 |
| `own` | 1 | 9 | P001, P001, P004, P006, P018, P020 |
| `people` | 1 | 9 | P001, P004, P006, P006, P008, P012 |
| `place` | 2 | 2 | P023, P023 |
| `possible` | 1 | 1 | P018 |
| `s` | 1 | 4 | P001, P005, P019, P023 |
| `sail` | 1 | 2 | P004, P026 |
| `saw` | 1 | 2 | P023, P025 |
| `sea` | 1 | 7 | P001, P009, P020, P021, P022, P022 |
| `servant` | 1 | 2 | P001, P016 |
| `servants` | 2 | 3 | P015, P016, P020 |
| `seven` | 1 | 1 | P022 |
| `so` | 1 | 17 | P003, P010, P010, P010, P011, P011 |
| `some` | 2 | 4 | P010, P011, P015, P015 |
| `speak` | 1 | 1 | P020 |
| `tell` | 1 | 3 | P015, P019, P025 |
| `that` | 1 | 26 | P004, P009, P009, P010, P011, P011 |
| `the` | 1 | 202 | P001, P001, P001, P001, P001, P001 |
| `their` | 1 | 15 | P005, P008, P008, P010, P010, P010 |
| `them` | 2 | 10 | P005, P005, P007, P010, P018, P018 |
| `then` | 1 | 17 | P002, P004, P009, P011, P012, P014 |
| `they` | 1 | 20 | P004, P005, P006, P010, P010, P011 |
| `this` | 2 | 6 | P001, P005, P006, P016, P022, P026 |
| `those` | 2 | 3 | P010, P019, P020 |
| `though` | 1 | 3 | P001, P006, P023 |
| `till` | 1 | 5 | P012, P014, P022, P023, P023 |
| `to` | 4 | 82 | P001, P001, P001, P002, P002, P002 |
| `town` | 1 | 5 | P001, P002, P002, P003, P018 |
| `upon` | 3 | 6 | P018, P019, P021, P022, P022, P023 |
| `was` | 4 | 33 | P001, P002, P002, P006, P006, P007 |
| `when` | 1 | 13 | P001, P005, P008, P012, P016, P017 |
| `which` | 3 | 9 | P005, P010, P011, P012, P012, P021 |
| `while` | 1 | 9 | P007, P009, P009, P010, P010, P011 |
| `who` | 1 | 16 | P002, P002, P004, P006, P006, P007 |
| `whom` | 1 | 2 | P007, P010 |
| `will` | 1 | 15 | P003, P004, P004, P005, P006, P008 |
| `with` | 1 | 27 | P005, P007, P010, P010, P010, P011 |
| `would` | 1 | 4 | P019, P021, P022, P026 |
| `your` | 1 | 17 | P003, P008, P008, P013, P015, P015 |

## 10. Cross-Book compound drift

`scripts/compound_drift.py`, keyed on separator-stripped letters so
closed, hyphenated and open settings of one compound collide.

Result over book01, book02, book03, book04, book05, book06, book07: **no drift**.

## 11. The closing-compound filter (H.1, interim)

`compound_drift()` is blind to a compound the whole corpus sets
open, and the blindness was demonstrated rather than assumed: the
closed form of every content-word pair in Book 6's candidate was
looked for across PG #1727 and all twelve staged files — **zero
hits**. Butler never writes `mountaintop`; the corpus cannot be its
own dictionary. Full closure needs a vendored English word list,
which is a **new external dependency** and is escalated to the
coordinator as ledger item **A4**(ii), not taken here.

The interim instrument needs no dependency: every adjacent
content-word pair whose **second** element is a common compound
head. **23 pairs.**

> `again night` · `arranged beds` · `bad place` · `draw water` · `either side` · `furthest place` · `good woman` · `high walls` · `keeps house` · `landing place` · `like men` · `long way` · `next day` · `nine days` · `old woman` · `others work` · `outer court` · `seventeen days` · `single day` · `tenth night` · `whole time` · `woven work` · `young men`

