# Odyssey Book 6 — checks, candidate v2

Written by `scripts/checks.py`, which is the only thing that computes
these numbers. Before it existed, **none of the package's checks was
executed for a new Book by anything in the repository** — substantive
finding **S-2** of `book06/review/findings-v1.md`. Every figure below
is reproducible by running `python3 scripts/checks.py 6`.

**Subject:** `book06/candidate-v2.json`, sha256 `0e435458f6c30384415559af86b49ee01c402308bd9d36fdfea5462887bde2be`.

**Basis — records finding R-1.** all 26 paragraphs. A figure without the paragraph
set it is computed over is not a figure, and the package published
one for three Books.

## 1. Verdict

**All gates pass.**


## 2. The figures

| measure | value |
|---|---|
| paragraphs scored | 26 |
| word ratio | 0.99884 |
| Butler token retention (canonical, aggregate-join) | **0.93408** |
| order retention (per paragraph, for MOVE-GAP) | 0.93408 |
| bag retention (order-blind) | 0.94565 |
| **MOVE-GAP** (bag − order), D20 | **0.01156** |
| sentences, source → candidate | 116 → 148 |
| **splitting rate** (D17, raw) | **+27.6%** |
| semicolon-normalized sentences | 143 → 153 |
| **NORM RATE** (D20) | **+7.0%** |
| sixty-word sentences | 7 → 1 (86% broken) |
| **semicolons, Butler → candidate** (D19) | **27 → 5** |

Of the +32 sentences added, at most **22** are a semicolon
rewritten as a period — the operation that adds a sentence, moves no
clause, drops no word and costs no retention. That is what NORM RATE
prices out, and why **D19 is a rate and not a count** (D20).

## 3. The cross-Book table, with every basis stated (R-1)

| Book | basis | retention | sentences | raw D17 | 60+ | semicolons | NORM RATE | MOVE-GAP |
|---|---|---|---|---|---|---|---|---|
| Book 1 | all 32 paragraphs | 0.72703 | 132 → 159 | +20.5% | 10 → 0 | 47 → 13 | -3.9% | 0.05088 |
| Book 2 | all 35 paragraphs | 0.90232 | 137 → 159 | +16.1% | 7 → 4 | 36 → 21 | +4.0% | 0.01632 |
| Book 3 | 37 of 38 | 0.89641 | 164 → 173 | +5.5% | 9 → 6 | 39 → 32 | +1.0% | 0.02156 |
| Book 3 *(all 38)* | all 38 paragraphs (B03-P038 included) | 0.86053 | 176 → 174 | -1.1% | 9 → 6 | 41 → 32 | -5.1% | 0.02065 |
| Book 4 | all 81 paragraphs | 0.95872 | 281 → 306 | +8.9% | 17 → 3 | 68 → 50 | +2.0% | 0.00431 |
| Book 5 | all 37 paragraphs | 0.93808 | 153 → 189 | +23.5% | 9 → 1 | 34 → 13 | +8.0% | 0.00891 |
| Book 6 | all 26 paragraphs | 0.93408 | 116 → 148 | +27.6% | 7 → 1 | 27 → 5 | +7.0% | 0.01156 |

Book 3's row is the reason this column exists. Its published figures
are computed on **37 of its 38 paragraphs** — B03-P038, the **D14**
splice — and nothing said so until now. On all 38 the same measures
give 0.86053 and 176 → 174 (−1.1%), and the D17 floor derived from
them would be **negative**, which is to say the gate would be
vacuous. The exclusion is right; its silence was not.

## 4. D17's gate

Floor **+2.7%**, half accepted Book 3's +5.5% — computed from
the accepted files on each Book's own basis, never re-pasted from
prose. This candidate: **+27.6%**. Sixty-word survival gate:
1 of 7 survive, and the gate fails above 5.25.

## 5. The growth gate, aligned sentence to sentence (D20)

D19's gate as built compared each paragraph's **longest** candidate
sentence with its source paragraph's **longest** — a maximum against
a maximum. A draft that divides a paragraph's longest sentence lowers
the new maximum and can then grow a *different* sentence past the old
one's length with the gate reporting nothing. Division bought cover
for growth. Sentences are now aligned by best token overlap; 50 words
remains the failure; growth is reported from 40.


Sentences grown to 40 words or more: **1**.

| paragraph | source sentence | candidate sentence |
|---|---|---|
| B06-P015 | 38 words | 40 words |

## 6. Every candidate sentence over 40 words (absolute)

Blind spot 2 of `findings-v1.md` §9, which had no carrier: *a
sentence left long because it **is** long in Butler.* Every other
length check in the package is relative to the source, so a 43-word
four-limb chain that Butler also wrote at 43 words passes all of
them — which is how B06-P016 and B06-P018 reached a review
untouched. This report is absolute.

**11 sentences.**

| paragraph | words | source paragraph's longest | sentence |
|---|---|---|---|
| B06-P003 | **40** | 45 | I will come and help you, so that you can have everything ready as soon as possible, for all the best young men among yo… |
| B06-P009 | **61** | 67 | Just as the huntress Artemis goes out over the mountains of Taygetus or Erymanthus to hunt wild boars or deer, the wood … |
| B06-P010 | **46** | 46 | When it was time for them to start home, and they were folding the clothes and putting them into the wagon, Athena began… |
| B06-P012 | **41** | 79 | He might go up to her, throw himself at her feet and embrace her knees as a suppliant; or he might stay where he was and… |
| B06-P013 | **47** | 99 | I can only compare you to a young palm tree that I saw growing near the altar of Apollo when I was at Delos—for I was th… |
| B06-P015 | **40** | 38 | I will show you the way to the town, and I will tell you the name of our people: we are called Phaeacians, and I am the … |
| B06-P017 | **43** | 43 | But Odysseus said, “Young women, please stand a little to one side, so that I can wash the brine from my shoulders and a… |
| B06-P021 | **43** | 62 | You will find a high wall running all round it, and a good harbor on either side with a narrow entrance into the city, a… |
| B06-P022 | **44** | 61 | “I am afraid of the gossip and scandal that may be started against me later on, for the people here are very ill-natured… |
| B06-P022 | **47** | 61 | Perhaps he is a vagabond sailor she has taken from some foreign vessel, for we have no neighbors; or some god has at las… |
| B06-P022 | **43** | 61 | For I should be scandalized myself at seeing any other girl do the same, and go about with men in spite of everybody, wh… |

## 7. Displaced runs — the strict clause-movement witness

A run of four or more consecutive Butler tokens, occurring exactly
once on each side, surviving verbatim outside the monotone
alignment. MOVE-GAP is an upper bound; this is the lower one.

**2.**

| paragraph | run |
|---|---|
| B06-P013 | «when i was at delos» |
| B06-P018 | «under hephaestus and athena» |

## 8. Paragraphs near-identical to Butler (40+ words, ≤4 edits)

| paragraph | source words | edits | longest sentence |
|---|---|---|---|
| B06-P006 | 94 | 1 | 25 words |
| B06-P007 | 62 | 2 | 37 words |
| B06-P016 | 144 | 4 | 34 words |
| B06-P019 | 81 | 4 | 27 words |
| B06-P024 | 84 | 3 | 29 words |
| B06-P025 | 46 | 3 | 25 words |

## 9. One Butler word rendered two ways (per Book, Butler-keyed)

**77 rows.** This report's declared limits, which records finding
**R-5** is about: it keys on Butler's side only and runs inside one
Book, so it cannot see one *rendering* made to carry two Butler
words, and it cannot compare a word's renderings across Books. Both
arrows, across all Books, are `scripts/rendering_collisions.py`.

| Butler word | times changed | times kept | kept at (first six) |
|---|---|---|---|
| `a` | 1 | 74 | P001, P001, P002, P002, P002, P002 |
| `about` | 1 | 14 | P005, P005, P006, P007, P009, P012 |
| `all` | 3 | 23 | P001, P003, P003, P005, P006, P006 |
| `also` | 3 | 1 | P017 |
| `and` | 9 | 160 | P001, P001, P001, P001, P001, P001 |
| `another` | 1 | 3 | P009, P017, P020 |
| `any` | 3 | 7 | P009, P011, P016, P016, P020, P022 |
| `at` | 3 | 17 | P003, P003, P006, P009, P010, P011 |
| `athena` | 1 | 10 | P001, P001, P002, P004, P010, P012 |
| `away` | 1 | 4 | P004, P016, P017, P019 |
| `be` | 2 | 19 | P003, P003, P003, P007, P010, P013 |
| `before` | 1 | 2 | P018, P020 |
| `but` | 1 | 16 | P001, P001, P003, P004, P007, P008 |
| `by` | 1 | 12 | P001, P005, P005, P005, P009, P009 |
| `did` | 2 | 7 | P007, P007, P009, P012, P013, P020 |
| `done` | 1 | 1 | P023 |
| `even` | 1 | 2 | P012, P012 |
| `foot` | 1 | 1 | P024 |
| `for` | 1 | 41 | P003, P003, P003, P003, P003, P004 |
| `gave` | 1 | 2 | P008, P008 |
| `got` | 1 | 6 | P008, P008, P009, P018, P020, P023 |
| `happy` | 1 | 3 | P013, P013, P014 |
| `has` | 1 | 13 | P013, P013, P013, P015, P016, P017 |
| `he` | 2 | 33 | P001, P001, P005, P008, P012, P012 |
| `her` | 1 | 50 | P002, P002, P002, P005, P005, P005 |
| `however` | 1 | 3 | P015, P019, P021 |
| `i` | 2 | 44 | P003, P006, P006, P011, P011, P011 |
| `in` | 4 | 46 | P001, P001, P003, P004, P004, P005 |
| `is` | 1 | 20 | P003, P004, P006, P012, P014, P015 |
| `kinds` | 1 | 1 | P021 |
| `lands` | 1 | 1 | P001 |
| `left` | 1 | 1 | P024 |
| `like` | 1 | 10 | P002, P006, P007, P011, P012, P018 |
| `may` | 2 | 8 | P013, P014, P014, P015, P022, P023 |
| `might` | 1 | 2 | P010, P022 |
| `much` | 1 | 3 | P003, P003, P013 |
| `of` | 5 | 79 | P001, P001, P001, P002, P002, P002 |
| `off` | 1 | 8 | P001, P007, P008, P009, P012, P012 |
| `on` | 8 | 16 | P002, P008, P008, P008, P009, P012 |
| `one` | 4 | 12 | P002, P009, P010, P012, P014, P014 |
| `only` | 1 | 6 | P003, P006, P008, P013, P013, P016 |
| `others` | 1 | 1 | P012 |
| `our` | 1 | 2 | P006, P015 |
| `place` | 1 | 3 | P004, P016, P021 |
| `proud` | 1 | 2 | P003, P013 |
| `put` | 1 | 3 | P009, P012, P018 |
| `road` | 2 | 2 | P008, P024 |
| `sea` | 2 | 5 | P002, P012, P013, P016, P021 |
| `seeing` | 1 | 2 | P012, P022 |
| `servants` | 1 | 1 | P008 |
| `set` | 1 | 3 | P008, P009, P020 |
| `shall` | 1 | 3 | P007, P015, P021 |
| `she` | 4 | 29 | P002, P002, P004, P004, P005, P005 |
| `should` | 1 | 8 | P003, P003, P006, P010, P012, P014 |
| `side` | 5 | 5 | P002, P009, P017, P018, P021 |
| `skin` | 1 | 1 | P017 |
| `take` | 1 | 7 | P003, P006, P012, P015, P016, P016 |
| `that` | 4 | 27 | P003, P003, P006, P007, P008, P009 |
| `the` | 1 | 188 | P001, P001, P001, P001, P001, P001 |
| `their` | 1 | 9 | P001, P005, P008, P009, P009, P014 |
| `therefore` | 2 | 3 | P003, P023, P025 |
| `things` | 1 | 1 | P008 |
| `this` | 1 | 17 | P003, P004, P004, P006, P008, P010 |
| `to` | 5 | 99 | P001, P001, P001, P001, P002, P002 |
| `under` | 1 | 2 | P012, P016 |
| `was` | 3 | 20 | P001, P001, P002, P002, P004, P005 |
| `water` | 2 | 4 | P009, P009, P010, P012 |
| `when` | 2 | 13 | P004, P004, P006, P006, P009, P009 |
| `where` | 1 | 7 | P009, P012, P016, P021, P021, P021 |
| `which` | 6 | 7 | P002, P003, P004, P005, P009, P010 |
| `who` | 2 | 17 | P001, P002, P003, P005, P008, P008 |
| `whom` | 1 | 1 | P015 |
| `will` | 1 | 19 | P003, P003, P007, P012, P013, P015 |
| `with` | 1 | 29 | P001, P002, P005, P007, P007, P008 |
| `would` | 1 | 5 | P019, P022, P022, P022, P026 |
| `yet` | 1 | 3 | P003, P013, P013 |
| `yourself` | 1 | 3 | P003, P003, P013 |

## 10. Cross-Book compound drift

`scripts/compound_drift.py`, keyed on separator-stripped letters so
closed, hyphenated and open settings of one compound collide.

Result over book01, book02, book03, book04, book05, book06: **no drift**.

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
head. **29 pairs.**

> `bearing posts` · `built houses` · `chief man` · `deep water` · `either side` · `famous sea` · `fine house` · `folding doors` · `full head` · `high wall` · `husband house` · `inner court` · `large stones` · `linen room` · `little way` · `mortal woman` · `mountain tops` · `neither man` · `outer court` · `poor man` · `pure water` · `salt water` · `sounding sea` · `twentieth day` · `washing day` · `with men` · `young men` · `young woman` · `young women`

