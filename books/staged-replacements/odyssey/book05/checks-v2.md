# Odyssey Book 5 — checks, candidate v2

Written by `scripts/checks.py`, which is the only thing that computes
these numbers. Before it existed, **none of the package's checks was
executed for a new Book by anything in the repository** — substantive
finding **S-2** of `book06/review/findings-v1.md`. Every figure below
is reproducible by running `python3 scripts/checks.py 5`.

**Subject:** `book05/candidate-v2.json`, sha256 `acbfcb03f15e8244dc46ec7f29d14d48da9179443191016525636d30b51479e9`.

**Basis — records finding R-1.** all 37 paragraphs. A figure without the paragraph
set it is computed over is not a figure, and the package published
one for three Books.

## 1. Verdict

**All gates pass.**


## 2. The figures

| measure | value |
|---|---|
| paragraphs scored | 37 |
| word ratio | 0.99700 |
| Butler token retention (canonical, aggregate-join) | **0.93808** |
| order retention (per paragraph, for MOVE-GAP) | 0.93808 |
| bag retention (order-blind) | 0.94699 |
| **MOVE-GAP** (bag − order), D20 | **0.00891** |
| sentences, source → candidate | 153 → 189 |
| **splitting rate** (D17, raw) | **+23.5%** |
| semicolon-normalized sentences | 187 → 202 |
| NORM RATE as published (D20) | +8.0% |
| semicolon-normalized, on Butler's pointing | 187 → 201 |
| **NORM RATE on Butler's own pointing** (D20, S-1) | **+7.5%** |
| sixty-word sentences | 9 → 1 (89% broken) |
| **semicolons, Butler → candidate** (D19) | **34 → 13** |
| **of which KEPT of Butler's / ADDED by the draft** (S-1) | **12 kept + 1 added** |
| **dividing marks, Butler → candidate** (D27: `;` `:` sentence-internal `—`) | **64 → 35** |
| **of which KEPT / ADDED** (D27) | **34 kept + 1 added** |
| dividing-mark-normalized sentences | 217 → 224 |
| NORM RATE, every dividing mark (D27) | +3.2% |
| dividing-mark-normalized, on Butler's pointing | 217 → 223 |
| NORM RATE, dividing marks on Butler's pointing (D27+D21, the compared figure for Books 1-8) | +2.8% |
| **of which KEPT BY IDENTITY / CLASS-CHANGED / ADDED** (**D28**, Book 9 round 1 S-1) | **34 kept + 0 class-changed + 1 added** |
| dividing-mark-normalized, on Butler's pointing by identity | 217 → 223 |
| **NORM RATE, dividing marks on Butler's pointing BY MARK IDENTITY** — **the compared figure from Book 9 forward** (D28) | **+2.8%** |

Of the +36 sentences added, at most **21** are a semicolon
rewritten as a period — the operation that adds a sentence, moves no
clause, drops no word and costs no retention. That is what NORM RATE
prices out, and why **D19 is a rate and not a count** (D20).

**And the mirror operation, which is the one D20 never priced.**
Substantive finding **S-1** of Book 7's round 1: a comma raised to a
semicolon adds nothing to the sentence count, adds one to the
candidate's semicolon count, and therefore scores under D20 exactly
what a real period scores — while leaving the clause chain inside one
sentence. A period costs a recast; a semicolon costs a keystroke.
**1 of this candidate's 13 semicolons are its own**, and the figure
that is COMPARED from Book 7 forward is **NORM RATE on Butler's own
pointing**, +7.5% here against the +8.0% the unsplit measure gives.

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
| Book 8 | all 50 paragraphs | 0.94093 | 192 → 235 | +22.4% | 42 → 7 | 62 → 31 | 24 + 7 | +3.4% | **+2.0%** | 0.00692 |
| Book 9 | all 44 paragraphs | 0.92284 | 171 → 203 | +18.7% | 54 → 26 | 71 → 45 | 45 + 0 | +1.8% | **+2.5%** | 0.01232 |

Book 3's row is the reason this column exists. Its published figures
are computed on **37 of its 38 paragraphs** — B03-P038, the **D14**
splice — and nothing said so until now. On all 38 the same measures
give 0.86053 and 176 → 174 (−1.1%), and the D17 floor derived from
them would be **negative**, which is to say the gate would be
vacuous. The exclusion is right; its silence was not.

## 4. D17's gate

Floor **+2.7%**, half accepted Book 3's +5.5% — computed from
the accepted files on each Book's own basis, never re-pasted from
prose. This candidate: **+23.5%**. Sixty-word survival gate:
1 of 9 survive, and the gate fails above 6.75.

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
| B05-P033 | 43 words | 46 words |

## 6. Every candidate sentence of 40 words or more (absolute)

Blind spot 2 of `findings-v1.md` §9, which had no carrier: *a
sentence left long because it **is** long in Butler.* Every other
length check in the package is relative to the source, so a 43-word
four-limb chain that Butler also wrote at 43 words passes all of
them — which is how B06-P016 and B06-P018 reached a review
untouched. This report is absolute.

**22 sentences.**

| paragraph | words | source paragraph's longest | sentence |
|---|---|---|---|
| B05-P004 | **51** | 51 | He is to be escorted neither by gods nor men, but after a dangerous voyage of twenty days on a raft he is to reach ferti… |
| B05-P004 | **43** | 51 | They will send him in a ship to his own country, and will give him more bronze and gold and clothing than he would have … |
| B05-P005 | **42** | 68 | He flew and flew over many a weary wave, but when at last he reached the island that was his journey’s end, he left the … |
| B05-P009 | **40** | 40 | Zeus says that you are to let this man go at once, for it is decreed that he shall not die here, far from his own people… |
| B05-P010 | **44** | 70 | I found the poor creature sitting all alone astride a keel, for Zeus had struck his ship with lightning and sunk it in m… |
| B05-P012 | **49** | 51 | She found him sitting on the beach with his eyes always full of tears, dying of sheer homesickness; for he had grown tir… |
| B05-P015 | **50** | 51 | May heaven above and earth below be my witnesses, with the waters of the river Styx—and this is the most solemn oath a b… |
| B05-P020 | **45** | 45 | When Dawn, the rosy-fingered child of morning, appeared, Odysseus put on his shirt and cloak, while the goddess wore a d… |
| B05-P020 | **45** | 45 | She also gave him a sharp adze, and then led the way to the far end of the island where the largest trees grew—alder, po… |
| B05-P022 | **53** | 68 | So he shook his head and muttered to himself, “Good heavens, so the gods have been changing their minds about Odysseus w… |
| B05-P023 | **40** | 52 | Then he gathered his clouds together, grasped his trident, stirred the sea round with it, and roused the rage of every w… |
| B05-P023 | **52** | 52 | I wish I had been killed on the day when the Trojans were pressing me so hard about the dead body of Achilles, for then … |
| B05-P027 | **52** | 52 | I know what I will do—and I am sure it is best—no matter what happens I will stick to the raft as long as her timbers ho… |
| B05-P028 | **45** | 47 | While he was still undecided, Poseidon sent a terrible great wave that seemed to rear itself above his head till it brok… |
| B05-P029 | **51** | 51 | But Athena decided to help Odysseus, so she bound the paths of all the winds except one, and made them lie quite still; … |
| B05-P030 | **62** | 62 | Then, as children rejoice when their dear father begins to get better after having borne sore affliction for a long time… |
| B05-P031 | **57** | 72 | If, on the other hand, I swim further in search of some shelving beach or harbor, a hurricane may carry me out to sea ag… |
| B05-P032 | **43** | 91 | But presently the wave came on again and carried him back with it far into the sea, tearing his hands as the suckers of … |
| B05-P033 | **46** | 43 | He swam out to sea again, beyond the reach of the surf that was beating against the land, and at the same time he kept l… |
| B05-P036 | **42** | 44 | If I stay here on the riverbed through the long watches of the night, I am so exhausted that the bitter cold and damp ma… |
| B05-P036 | **42** | 44 | If, on the other hand, I climb the hillside, find shelter in the woods, and sleep in some thicket, I may escape the cold… |
| B05-P037 | **59** | 61 | Then, as someone who lives alone in the country, far from any neighbor, hides a brand as fire-seed in the ashes to save … |

## 7. Displaced runs — the strict clause-movement witness

A run of four or more consecutive Butler tokens, occurring exactly
once on each side, surviving verbatim outside the monotone
alignment. MOVE-GAP is an upper bound; this is the lower one.

**1.**

| paragraph | run |
|---|---|
| B05-P021 | «calypso had told him to keep» |

## 8. Paragraphs near-identical to Butler (40+ words, ≤4 edits)

| paragraph | source words | edits | longest sentence |
|---|---|---|---|
| B05-P001 | 60 | 4 | 33 words |
| B05-P003 | 59 | 3 | 29 words |
| B05-P013 | 108 | 1 | 39 words |
| B05-P015 | 97 | 3 | 50 words |
| B05-P016 | 92 | 3 | 35 words |
| B05-P018 | 90 | 1 | 21 words |
| B05-P029 | 51 | 2 | 51 words |

## 9. One Butler word rendered two ways (per Book, Butler-keyed)

**87 rows.** This report's declared limits, which records finding
**R-5** is about: it keys on Butler's side only and runs inside one
Book, so it cannot see one *rendering* made to carry two Butler
words, and it cannot compare a word's renderings across Books. Both
arrows, across all Books, are `scripts/rendering_collisions.py`.

| Butler word | times changed | times kept | kept at (first six) |
|---|---|---|---|
| `a` | 1 | 93 | P002, P002, P004, P004, P004, P005 |
| `again` | 1 | 13 | P003, P009, P010, P010, P024, P024 |
| `all` | 1 | 35 | P002, P004, P006, P007, P007, P009 |
| `and` | 7 | 195 | P001, P001, P001, P002, P002, P002 |
| `another` | 1 | 3 | P009, P021, P037 |
| `any` | 1 | 6 | P002, P013, P027, P027, P030, P037 |
| `are` | 1 | 16 | P002, P003, P003, P004, P004, P009 |
| `at` | 1 | 19 | P005, P006, P006, P006, P007, P007 |
| `be` | 3 | 18 | P002, P002, P004, P007, P010, P011 |
| `bed` | 1 | 3 | P019, P032, P037 |
| `best` | 1 | 5 | P018, P020, P027, P033, P037 |
| `beyond` | 1 | 1 | P033 |
| `by` | 1 | 15 | P004, P005, P009, P010, P012, P018 |
| `calypso` | 1 | 21 | P001, P002, P004, P005, P007, P007 |
| `can` | 1 | 15 | P002, P002, P007, P007, P009, P013 |
| `dawn` | 1 | 2 | P001, P010 |
| `day` | 1 | 4 | P017, P017, P023, P030 |
| `did` | 1 | 9 | P003, P005, P021, P024, P027, P028 |
| `fingered` | 1 | 1 | P010 |
| `foot` | 1 | 1 | P030 |
| `for` | 2 | 42 | P001, P002, P002, P006, P007, P007 |
| `found` | 1 | 5 | P006, P010, P012, P014, P037 |
| `from` | 2 | 26 | P001, P002, P004, P006, P009, P013 |
| `got` | 3 | 8 | P004, P023, P023, P024, P024, P028 |
| `had` | 1 | 34 | P004, P004, P004, P004, P006, P006 |
| `has` | 1 | 5 | P002, P002, P031, P034, P034 |
| `having` | 1 | 3 | P003, P030, P037 |
| `herself` | 1 | 2 | P006, P016 |
| `him` | 1 | 72 | P001, P002, P002, P003, P003, P003 |
| `himself` | 2 | 11 | P010, P022, P023, P027, P028, P031 |
| `his` | 1 | 62 | P002, P002, P002, P002, P004, P004 |
| `hold` | 1 | 3 | P024, P027, P032 |
| `home` | 1 | 14 | P002, P003, P003, P004, P004, P006 |
| `in` | 7 | 49 | P001, P001, P002, P002, P004, P005 |
| `is` | 1 | 30 | P001, P002, P002, P002, P004, P004 |
| `it` | 2 | 58 | P003, P005, P006, P006, P007, P007 |
| `keep` | 1 | 2 | P017, P033 |
| `laid` | 2 | 1 | P016 |
| `left` | 1 | 3 | P005, P016, P035 |
| `lose` | 1 | 1 | P024 |
| `matter` | 1 | 2 | P007, P027 |
| `meaning` | 1 | 1 | P028 |
| `minds` | 2 | 1 | P022 |
| `much` | 1 | 2 | P017, P030 |
| `no` | 1 | 12 | P007, P009, P009, P014, P015, P017 |
| `nor` | 1 | 9 | P002, P002, P004, P010, P010, P030 |
| `now` | 1 | 9 | P001, P010, P014, P022, P023, P023 |
| `of` | 5 | 98 | P001, P001, P001, P001, P001, P002 |
| `on` | 3 | 41 | P005, P005, P006, P007, P009, P010 |
| `one` | 4 | 12 | P002, P002, P004, P006, P009, P021 |
| `river` | 1 | 7 | P015, P033, P035, P035, P035, P035 |
| `rosy` | 1 | 1 | P010 |
| `round` | 1 | 9 | P006, P020, P020, P021, P021, P024 |
| `safe` | 1 | 1 | P029 |
| `sail` | 1 | 3 | P020, P021, P024 |
| `sea` | 5 | 30 | P002, P005, P005, P005, P006, P009 |
| `seeing` | 1 | 1 | P025 |
| `set` | 1 | 5 | P007, P010, P016, P019, P030 |
| `she` | 3 | 29 | P001, P006, P008, P008, P010, P010 |
| `shore` | 3 | 1 | P033 |
| `should` | 1 | 7 | P010, P015, P017, P023, P023, P027 |
| `skin` | 1 | 1 | P032 |
| `so` | 2 | 41 | P006, P006, P008, P009, P010, P010 |
| `some` | 2 | 14 | P008, P013, P018, P020, P020, P021 |
| `sorely` | 1 | 1 | P031 |
| `that` | 3 | 47 | P002, P004, P004, P005, P006, P009 |
| `then` | 2 | 16 | P005, P008, P011, P020, P020, P023 |
| `this` | 2 | 16 | P004, P009, P009, P010, P012, P014 |
| `those` | 1 | 1 | P023 |
| `time` | 1 | 6 | P017, P023, P024, P030, P032, P033 |
| `to` | 4 | 111 | P001, P001, P002, P002, P002, P002 |
| `told` | 1 | 1 | P005 |
| `two` | 2 | 4 | P030, P030, P037, P037 |
| `was` | 1 | 35 | P005, P005, P006, P006, P006, P006 |
| `water` | 1 | 12 | P006, P013, P020, P020, P021, P024 |
| `way` | 1 | 9 | P009, P009, P016, P020, P020, P022 |
| `well` | 1 | 4 | P002, P014, P020, P028 |
| `what` | 2 | 9 | P003, P007, P015, P023, P025, P027 |
| `which` | 4 | 6 | P005, P005, P006, P020, P028, P031 |
| `who` | 3 | 12 | P001, P002, P002, P002, P004, P009 |
| `will` | 2 | 27 | P002, P002, P002, P004, P004, P004 |
| `with` | 2 | 54 | P001, P005, P005, P006, P006, P007 |
| `within` | 1 | 1 | P030 |
| `wood` | 1 | 4 | P006, P013, P020, P020 |
| `would` | 1 | 12 | P003, P004, P009, P012, P017, P017 |
| `yard` | 1 | 1 | P024 |
| `zeus` | 1 | 11 | P001, P002, P009, P009, P009, P010 |

## 10. Cross-Book compound drift

`scripts/compound_drift.py`, keyed on separator-stripped letters so
closed, hyphenated and open settings of one compound collide.

Result over book01, book02, book03, book04, book05, book06, book07, book08, book09: **mountaintops {'closed': ['book05', 'book06'], 'open': ['book05-v2']}**.

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
head. **37 pairs.**

> `above water` · `after day` · `bear men` · `best place` · `caught hold` · `chattering sea` · `deep water` · `earth sea` · `fallow field` · `found ship` · `four days` · `good man` · `good night` · `good way` · `got hold` · `keep house` · `landing place` · `large fire` · `long time` · `long way` · `mortal man` · `mortal woman` · `mountain tops` · `neither ships` · `over land` · `saw land` · `seals men` · `see land` · `seventeen days` · `third day` · `timbers hold` · `time day` · `touch land` · `tremendous sea` · `twenty days` · `under water` · `whole work`

