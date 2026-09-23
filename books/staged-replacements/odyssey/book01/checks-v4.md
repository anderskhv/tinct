# Odyssey Book 1 — checks, candidate v4

Written by `scripts/checks.py`, which is the only thing that computes
these numbers. Before it existed, **none of the package's checks was
executed for a new Book by anything in the repository** — substantive
finding **S-2** of `book06/review/findings-v1.md`. Every figure below
is reproducible by running `python3 scripts/checks.py 1`.

**Subject:** `book01/candidate-v4.json`, sha256 `6e5ecb0a4b7a40d2ca2ccf17ef36408bb95c6980a2584b522d37526959a77de8`.

**Basis — records finding R-1.** all 32 paragraphs. A figure without the paragraph
set it is computed over is not a figure, and the package published
one for three Books.

## 1. Verdict

**All gates pass.**


## 2. The figures

| measure | value |
|---|---|
| paragraphs scored | 32 |
| word ratio | 0.94647 |
| Butler token retention (canonical, aggregate-join) | **0.72800** |
| order retention (per paragraph, for MOVE-GAP) | 0.73354 |
| bag retention (order-blind) | 0.78442 |
| **MOVE-GAP** (bag − order), D20 | **0.05088** |
| sentences, source → candidate | 132 → 159 |
| **splitting rate** (D17, raw) | **+20.5%** |
| semicolon-normalized sentences | 179 → 172 |
| NORM RATE as published (D20) | -3.9% |
| semicolon-normalized, on Butler's pointing | 179 → 171 |
| **NORM RATE on Butler's own pointing** (D20, S-1) | **-4.5%** |
| sixty-word sentences | 10 → 0 (100% broken) |
| **semicolons, Butler → candidate** (D19) | **47 → 13** |
| **of which KEPT of Butler's / ADDED by the draft** (S-1) | **12 kept + 1 added** |
| **dividing marks, Butler → candidate** (D27: `;` `:` sentence-internal `—`) | **55 → 39** |
| **of which KEPT / ADDED** (D27) | **20 kept + 19 added** |
| dividing-mark-normalized sentences | 187 → 198 |
| NORM RATE, every dividing mark (D27) | +5.9% |
| dividing-mark-normalized, on Butler's pointing | 187 → 179 |
| NORM RATE, dividing marks on Butler's pointing (D27+D21, the compared figure for Books 1-8) | -4.3% |
| **of which KEPT BY IDENTITY / CLASS-CHANGED / ADDED** (**D28**, Book 9 round 1 S-1) | **17 kept + 3 class-changed + 19 added** |
| dividing-mark-normalized, on Butler's pointing by identity | 187 → 176 |
| **NORM RATE, dividing marks on Butler's pointing BY MARK IDENTITY** — **the compared figure from Book 9 forward** (D28) | **-5.9%** |

**The class changes, named** (D28). A count that cannot be pointed at is what
S-1 is about: `41 kept + 0 added` was true of the count and false of the
claim it was published to support.

| ¶ | Butler | candidate | at |
|---|---|---|---|
| B01-P004 | `;` | `—` | …folly look at aegisthus |
| B01-P005 | `;` | `—` | …neither here nor there |
| B01-P019 | `;` | `—` | …excuse for doing nothing |

Of the +27 sentences added, at most **34** are a semicolon
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
pointing**, -4.5% here against the -3.9% the unsplit measure gives.

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
| Book 8 | all 50 paragraphs | 0.93862 | 192 → 235 | +22.4% | 42 → 7 | 62 → 31 | 24 + 7 | +3.4% | **+2.0%** | 0.00692 |
| Book 9 | all 44 paragraphs | 0.92284 | 171 → 204 | +19.3% | 54 → 25 | 71 → 44 | 44 + 0 | +1.8% | **+2.5%** | 0.01232 |
| Book 1 v4 — **this candidate** | all 32 paragraphs | 0.72800 | 132 → 159 | +20.5% | 47 → 13 | 55 → 39 | 20 + 19 | -3.9% | **-4.3%** | 0.05088 |

Book 3's row is the reason this column exists. Its published figures
are computed on **37 of its 38 paragraphs** — B03-P038, the **D14**
splice — and nothing said so until now. On all 38 the same measures
give 0.86053 and 176 → 174 (−1.1%), and the D17 floor derived from
them would be **negative**, which is to say the gate would be
vacuous. The exclusion is right; its silence was not.

## 4. D17's gate

Floor **+2.7%**, half accepted Book 3's +5.5% — computed from
the accepted files on each Book's own basis, never re-pasted from
prose. This candidate: **+20.5%**. Sixty-word survival gate:
0 of 10 survive, and the gate fails above 7.50.

## 5. The growth gate, aligned sentence to sentence (D20)

D19's gate as built compared each paragraph's **longest** candidate
sentence with its source paragraph's **longest** — a maximum against
a maximum. A draft that divides a paragraph's longest sentence lowers
the new maximum and can then grow a *different* sentence past the old
one's length with the gate reporting nothing. Division bought cover
for growth. Sentences are now aligned by best token overlap; 50 words
remains the failure; growth is reported from 40.

**FAILURES:**

- B01-P005 49 → 50 words: This daughter of Atlas has got hold of poor unhappy Odysseus and keeps trying, with every kind of flattery, to make him forget his home, so that he is sick of life and thinks of nothing but how he might once again see the smoke rising from his own chimneys.
- B01-P030 48 → 52 words: Then Eurymachus, son of Polybus, answered, “It rests with heaven to decide who shall be chief among us, but you shall be master in your own house and over your own property; no one in Ithaca, as long as there is a man living here, will do you violence or rob you.

Sentences grown to 40 words or more: **2**.

| paragraph | source sentence | candidate sentence |
|---|---|---|
| B01-P005 | 43 words | 45 words |
| B01-P010 | 45 words | 49 words |

## 6. Every candidate sentence of 40 words or more (absolute)

Blind spot 2 of `findings-v1.md` §9, which had no carrier: *a
sentence left long because it **is** long in Butler.* Every other
length check in the package is relative to the source, so a 43-word
four-limb chain that Butler also wrote at 43 words passes all of
them — which is how B06-P016 and B06-P018 reached a review
untouched. This report is absolute.

**18 sentences.**

| paragraph | words | source paragraph's longest | sentence |
|---|---|---|---|
| B01-P005 | **45** | 60 | The island is covered in forest, out in the very middle of the sea, and a goddess lives there, daughter of the magician … |
| B01-P005 | **50** | 60 | This daughter of Atlas has got hold of poor unhappy Odysseus and keeps trying, with every kind of flattery, to make him … |
| B01-P007 | **43** | 79 | Athena said, “Father, son of Cronus, king of kings, if the gods are now agreed that Odysseus should go home, then let us… |
| B01-P008 | **47** | 85 | With this she bound on her bright golden sandals, imperishable, that carry her like the wind over land and sea, and took… |
| B01-P010 | **49** | 45 | There was a footstool for her feet as well, and he set another seat near her for himself, apart from the suitors, so tha… |
| B01-P011 | **40** | 49 | A senior servant brought them bread and set before them many good things from the stores of the house; the carver brough… |
| B01-P014 | **42** | 59 | They say, though, that he no longer comes to town now, and lives alone out in the country, faring hard, with only an old… |
| B01-P014 | **53** | 59 | I am no prophet, and know very little of omens, but I tell you what comes to me from heaven, and I promise you he will n… |
| B01-P017 | **46** | 98 | “Sir,” said Telemachus, “to answer your question: while my father was here, things went well with us and with the house,… |
| B01-P017 | **47** | 98 | I could have borne it better even if he were dead—if he had fallen with his men before Troy, or died among friends once … |
| B01-P017 | **43** | 98 | The chiefs from all our islands—Dulichium, Same, and wooded Zacynthus—along with the leading men of Ithaca itself, are e… |
| B01-P018 | **48** | 50 | Give him his helmet, his shield, and a couple of spears, and if he is the man he was when I first knew him in our house,… |
| B01-P019 | **47** | 53 | Tell the suitors to be off, each to his own home, and if your mother’s mind is set on marrying again, let her go back to… |
| B01-P024 | **47** | 50 | Sing the suitors one of those, and let them drink their wine in silence, but stop this sad story—it breaks my grieving h… |
| B01-P027 | **41** | 72 | But if you choose instead to go on feeding off one man, heaven help me, but Zeus will settle the account with you in ful… |
| B01-P030 | **52** | 48 | Then Eurymachus, son of Polybus, answered, “It rests with heaven to decide who shall be chief among us, but you shall be… |
| B01-P032 | **54** | 68 | Laertes had bought her with his own money when she was quite young, giving the worth of twenty oxen for her, and he had … |
| B01-P032 | **47** | 68 | As he took off his shirt, he handed it to the good old woman, who folded it neatly and hung it on a peg by his bedside, … |

## 7. Displaced runs — the strict clause-movement witness

A run of four or more consecutive Butler tokens, occurring exactly
once on each side, surviving verbatim outside the monotone
alignment. MOVE-GAP is an upper bound; this is the lower one.

**2.**

| paragraph | run |
|---|---|
| B01-P013 | «we had many visitors» |
| B01-P020 | «i will give you» |

## 8. Paragraphs near-identical to Butler (40+ words, ≤4 edits)

| paragraph | source words | edits | longest sentence |
|---|---|---|---|
| — | — | — | — |

## 9. One Butler word rendered two ways (per Book, Butler-keyed)

**234 rows.** This report's declared limits, which records finding
**R-5** is about: it keys on Butler's side only and runs inside one
Book, so it cannot see one *rendering* made to carry two Butler
words, and it cannot compare a word's renderings across Books. Both
arrows, across all Books, are `scripts/rendering_collisions.py`.

| Butler word | times changed | times kept | kept at (first six) |
|---|---|---|---|
| `a` | 8 | 61 | P002, P003, P005, P005, P008, P008 |
| `about` | 9 | 9 | P001, P008, P010, P013, P014, P018 |
| `after` | 2 | 3 | P001, P004, P014 |
| `again` | 1 | 8 | P008, P009, P013, P014, P018, P019 |
| `against` | 1 | 2 | P010, P014 |
| `all` | 11 | 12 | P001, P002, P004, P004, P005, P013 |
| `also` | 5 | 1 | P007 |
| `am` | 1 | 5 | P013, P014, P014, P015, P025 |
| `among` | 1 | 5 | P002, P009, P014, P029, P030 |
| `an` | 3 | 4 | P013, P014, P017, P031 |
| `and` | 26 | 135 | P001, P001, P001, P001, P002, P002 |
| `another` | 3 | 4 | P010, P019, P020, P027 |
| `any` | 5 | 4 | P016, P018, P021, P032 |
| `are` | 6 | 12 | P006, P006, P013, P013, P014, P014 |
| `as` | 13 | 22 | P002, P005, P008, P009, P010, P012 |
| `at` | 3 | 12 | P003, P003, P004, P008, P013, P019 |
| `athena` | 1 | 11 | P005, P007, P009, P010, P014, P016 |
| `away` | 4 | 3 | P014, P014, P017 |
| `back` | 3 | 5 | P013, P014, P019, P019, P026 |
| `be` | 8 | 15 | P004, P006, P009, P010, P014, P016 |
| `bear` | 2 | 1 | P025 |
| `bed` | 2 | 4 | P026, P032, P032, P032 |
| `been` | 3 | 5 | P003, P013, P020, P022, P031 |
| `before` | 2 | 10 | P009, P012, P014, P014, P017, P017 |
| `being` | 1 | 1 | P005 |
| `borne` | 1 | 1 | P017 |
| `brought` | 2 | 4 | P011, P011, P012, P013 |
| `but` | 4 | 30 | P001, P002, P004, P004, P005, P005 |
| `by` | 12 | 9 | P003, P006, P006, P010, P013, P019 |
| `came` | 2 | 4 | P012, P014, P023, P025 |
| `can` | 3 | 7 | P006, P007, P014, P019, P019, P029 |
| `celebrate` | 1 | 1 | P024 |
| `close` | 1 | 1 | P014 |
| `come` | 2 | 7 | P013, P013, P013, P014, P019, P021 |
| `coming` | 1 | 1 | P013 |
| `couple` | 1 | 1 | P018 |
| `court` | 1 | 1 | P032 |
| `covered` | 1 | 2 | P005, P026 |
| `days` | 2 | 1 | P013 |
| `dear` | 2 | 2 | P007, P026 |
| `death` | 1 | 2 | P002, P004 |
| `did` | 3 | 4 | P005, P009, P032, P032 |
| `do` | 3 | 9 | P013, P013, P017, P018, P020, P021 |
| `does` | 1 | 3 | P017, P030, P031 |
| `done` | 2 | 1 | P019 |
| `down` | 2 | 3 | P008, P023, P032 |
| `drew` | 1 | 1 | P011 |
| `drink` | 1 | 1 | P024 |
| `each` | 1 | 2 | P019, P026 |
| `eating` | 2 | 2 | P007, P017 |
| `either` | 1 | 2 | P004, P023 |
| `end` | 1 | 2 | P017, P017 |
| `enough` | 1 | 1 | P016 |
| `ever` | 2 | 3 | P001, P017, P022 |
| `fallen` | 1 | 1 | P017 |
| `feared` | 1 | 1 | P018 |
| `fellow` | 4 | 1 | P030 |
| `for` | 16 | 41 | P004, P004, P006, P006, P007, P010 |
| `get` | 4 | 2 | P002, P030 |
| `give` | 3 | 7 | P018, P018, P020, P020, P021, P021 |
| `given` | 1 | 2 | P022, P032 |
| `go` | 3 | 7 | P002, P007, P014, P019, P019, P020 |
| `going` | 1 | 1 | P026 |
| `gone` | 1 | 5 | P003, P003, P017, P030, P031 |
| `good` | 2 | 6 | P004, P011, P012, P030, P032, P032 |
| `got` | 3 | 1 | P005 |
| `great` | 1 | 5 | P005, P008, P023, P024, P029 |
| `had` | 6 | 17 | P002, P002, P003, P003, P003, P008 |
| `hand` | 2 | 2 | P008, P009 |
| `hands` | 2 | 2 | P011, P012 |
| `has` | 4 | 7 | P004, P005, P013, P016, P017, P019 |
| `have` | 4 | 18 | P007, P008, P009, P013, P013, P014 |
| `he` | 19 | 76 | P001, P001, P001, P002, P002, P002 |
| `head` | 1 | 1 | P014 |
| `hear` | 2 | 4 | P012, P019, P019, P027 |
| `heard` | 1 | 2 | P019, P023 |
| `held` | 1 | 1 | P023 |
| `help` | 1 | 1 | P027 |
| `her` | 3 | 28 | P008, P008, P008, P009, P009, P009 |
| `here` | 1 | 4 | P005, P013, P014, P017 |
| `heroes` | 1 | 2 | P008, P024 |
| `him` | 7 | 36 | P002, P002, P002, P002, P002, P004 |
| `himself` | 1 | 3 | P003, P010, P013 |
| `his` | 12 | 53 | P001, P001, P001, P002, P002, P002 |
| `home` | 2 | 15 | P001, P001, P002, P002, P004, P005 |
| `house` | 1 | 18 | P008, P008, P009, P009, P011, P013 |
| `husband` | 1 | 2 | P019, P026 |
| `i` | 2 | 43 | P004, P005, P006, P007, P007, P007 |
| `in` | 18 | 50 | P002, P003, P003, P004, P004, P005 |
| `into` | 2 | 4 | P007, P011, P022, P026 |
| `is` | 7 | 36 | P004, P005, P005, P005, P005, P006 |
| `island` | 2 | 3 | P005, P007, P014 |
| `it` | 13 | 28 | P004, P005, P011, P013, P014, P015 |
| `ithaca` | 1 | 8 | P002, P007, P008, P013, P013, P017 |
| `keep` | 1 | 4 | P005, P019, P021, P021 |
| `killed` | 1 | 2 | P003, P008 |
| `kind` | 1 | 2 | P005, P020 |
| `laid` | 2 | 2 | P017, P023 |
| `lay` | 3 | 2 | P004, P019 |
| `let` | 1 | 8 | P006, P018, P019, P019, P024, P025 |
| `lie` | 1 | 1 | P013 |
| `long` | 1 | 3 | P009, P017, P019 |
| `looking` | 2 | 1 | P019 |
| `love` | 1 | 1 | P024 |
| `made` | 1 | 1 | P022 |
| `make` | 4 | 6 | P005, P007, P016, P019, P019, P025 |
| `making` | 1 | 1 | P018 |
| `man` | 4 | 11 | P006, P014, P015, P017, P018, P018 |
| `many` | 2 | 7 | P001, P005, P010, P011, P024, P025 |
| `marry` | 2 | 1 | P017 |
| `may` | 4 | 6 | P019, P019, P019, P027, P028, P029 |
| `me` | 4 | 26 | P001, P001, P013, P013, P013, P014 |
| `means` | 2 | 2 | P019, P025 |
| `middle` | 1 | 1 | P005 |
| `might` | 4 | 1 | P026 |
| `mind` | 3 | 3 | P006, P019, P025 |
| `mixing` | 1 | 2 | P008, P012 |
| `moment` | 1 | 1 | P030 |
| `more` | 4 | 6 | P010, P014, P017, P018, P022, P031 |
| `much` | 3 | 2 | P014, P032 |
| `must` | 1 | 1 | P019 |
| `my` | 1 | 26 | P005, P006, P013, P013, P013, P014 |
| `never` | 2 | 3 | P013, P025, P028 |
| `night` | 1 | 1 | P032 |
| `no` | 2 | 15 | P005, P012, P013, P014, P015, P016 |
| `nor` | 3 | 2 | P005, P017 |
| `not` | 5 | 20 | P001, P002, P002, P004, P006, P010 |
| `now` | 5 | 10 | P002, P004, P007, P013, P014, P019 |
| `ocean` | 1 | 1 | P014 |
| `odysseus` | 1 | 16 | P002, P005, P005, P005, P006, P006 |
| `of` | 21 | 94 | P001, P001, P001, P003, P003, P003 |
| `old` | 1 | 8 | P013, P014, P014, P015, P029, P031 |
| `on` | 4 | 16 | P005, P006, P008, P008, P012, P014 |
| `one` | 5 | 12 | P003, P013, P016, P020, P021, P021 |
| `or` | 1 | 11 | P002, P013, P013, P014, P016, P017 |
| `other` | 4 | 5 | P003, P003, P010, P014, P032 |
| `our` | 2 | 5 | P006, P009, P014, P017, P018 |
| `out` | 2 | 5 | P007, P008, P009, P016, P032 |
| `over` | 4 | 8 | P002, P008, P012, P014, P017, P019 |
| `own` | 3 | 21 | P001, P001, P002, P004, P005, P009 |
| `people` | 1 | 6 | P002, P007, P013, P016, P019, P025 |
| `poor` | 1 | 1 | P005 |
| `poseidon` | 1 | 4 | P002, P003, P006, P006 |
| `poured` | 1 | 2 | P011, P012 |
| `return` | 5 | 5 | P002, P007, P019, P021, P023 |
| `right` | 1 | 1 | P009 |
| `room` | 2 | 3 | P023, P032, P032 |
| `s` | 1 | 12 | P003, P004, P013, P019, P019, P025 |
| `safely` | 1 | 1 | P002 |
| `said` | 3 | 7 | P003, P005, P007, P013, P016, P017 |
| `sat` | 1 | 2 | P023, P032 |
| `say` | 2 | 2 | P013, P014 |
| `see` | 1 | 5 | P004, P005, P006, P007, P013 |
| `sent` | 1 | 1 | P004 |
| `servant` | 1 | 2 | P011, P012 |
| `set` | 2 | 4 | P010, P011, P019, P019 |
| `shall` | 4 | 6 | P009, P014, P020, P021, P030, P030 |
| `she` | 8 | 16 | P008, P008, P008, P008, P010, P022 |
| `should` | 3 | 3 | P002, P007, P009 |
| `side` | 2 | 1 | P023 |
| `since` | 1 | 1 | P015 |
| `sing` | 1 | 4 | P012, P024, P025, P025 |
| `singing` | 1 | 4 | P013, P023, P025, P032 |
| `sir` | 1 | 4 | P013, P013, P017, P020 |
| `sitting` | 1 | 1 | P009 |
| `so` | 9 | 9 | P005, P005, P005, P008, P012, P017 |
| `some` | 5 | 8 | P008, P008, P014, P014, P016, P018 |
| `soon` | 1 | 2 | P012, P018 |
| `speak` | 1 | 2 | P007, P007 |
| `speech` | 1 | 1 | P028 |
| `still` | 1 | 5 | P006, P006, P014, P023, P029 |
| `strong` | 1 | 1 | P008 |
| `such` | 3 | 3 | P014, P016, P020 |
| `suitors` | 1 | 17 | P007, P008, P009, P010, P012, P018 |
| `take` | 2 | 7 | P004, P005, P019, P019, P019, P021 |
| `telemachus` | 4 | 10 | P007, P009, P012, P017, P022, P027 |
| `tell` | 3 | 14 | P001, P001, P007, P009, P013, P013 |
| `than` | 1 | 5 | P013, P015, P017, P022, P032 |
| `that` | 19 | 20 | P001, P005, P005, P005, P007, P007 |
| `the` | 20 | 131 | P001, P001, P001, P001, P002, P002 |
| `their` | 3 | 11 | P001, P004, P010, P011, P012, P012 |
| `them` | 9 | 15 | P001, P008, P008, P009, P011, P011 |
| `then` | 8 | 14 | P002, P004, P005, P006, P011, P012 |
| `there` | 4 | 12 | P003, P005, P005, P008, P010, P015 |
| `these` | 2 | 9 | P004, P013, P016, P018, P018, P019 |
| `they` | 3 | 16 | P001, P008, P012, P012, P012, P013 |
| `thing` | 1 | 1 | P029 |
| `things` | 2 | 3 | P004, P011, P012 |
| `think` | 1 | 4 | P005, P019, P019, P022 |
| `thinking` | 2 | 1 | P009 |
| `this` | 4 | 10 | P004, P005, P007, P013, P013, P016 |
| `those` | 1 | 1 | P029 |
| `though` | 2 | 4 | P002, P004, P006, P020 |
| `through` | 1 | 1 | P001 |
| `time` | 1 | 2 | P002, P013 |
| `tired` | 1 | 1 | P014 |
| `to` | 34 | 77 | P001, P002, P002, P002, P002, P003 |
| `too` | 2 | 1 | P029 |
| `took` | 1 | 3 | P009, P012, P032 |
| `town` | 2 | 2 | P014, P014 |
| `troy` | 1 | 5 | P001, P014, P017, P023, P025 |
| `trying` | 2 | 1 | P005 |
| `turn` | 1 | 1 | P027 |
| `under` | 2 | 2 | P014, P015 |
| `unhappy` | 1 | 1 | P005 |
| `up` | 2 | 7 | P004, P007, P008, P017, P019, P025 |
| `upon` | 12 | 1 | P025 |
| `us` | 1 | 8 | P004, P006, P009, P014, P014, P017 |
| `value` | 1 | 1 | P021 |
| `very` | 1 | 4 | P005, P014, P018, P020 |
| `visit` | 1 | 1 | P019 |
| `voyage` | 1 | 2 | P014, P020 |
| `want` | 2 | 2 | P013, P030 |
| `wanted` | 1 | 2 | P004, P012 |
| `was` | 12 | 20 | P002, P003, P003, P009, P010, P014 |
| `way` | 2 | 4 | P010, P019, P020, P021 |
| `we` | 3 | 8 | P006, P006, P007, P013, P013, P014 |
| `well` | 1 | 4 | P007, P017, P025, P030 |
| `went` | 2 | 9 | P009, P012, P013, P014, P022, P026 |
| `were` | 11 | 6 | P002, P014, P014, P015, P017, P020 |
| `what` | 3 | 12 | P004, P006, P009, P013, P013, P013 |
| `when` | 7 | 9 | P002, P005, P013, P014, P018, P023 |
| `which` | 4 | 1 | P010 |
| `while` | 3 | 1 | P016 |
| `who` | 6 | 22 | P001, P002, P002, P003, P003, P005 |
| `whom` | 2 | 2 | P024, P029 |
| `whose` | 1 | 2 | P013, P024 |
| `will` | 5 | 23 | P004, P006, P006, P007, P007, P007 |
| `with` | 14 | 26 | P005, P005, P006, P008, P008, P012 |
| `would` | 4 | 11 | P002, P004, P004, P005, P009, P013 |
| `yet` | 5 | 3 | P005, P014, P016 |
| `you` | 5 | 58 | P001, P005, P006, P009, P009, P009 |
| `your` | 1 | 25 | P013, P013, P014, P016, P017, P019 |
| `yourself` | 2 | 3 | P019, P019, P019 |

## 10. Cross-Book compound drift

`scripts/compound_drift.py`, keyed on separator-stripped letters so
closed, hyphenated and open settings of one compound collide.

Result over book01, book02, book03, book04, book05, book06, book07, book08, book09: **no drift**.

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
head. **24 pairs.**

> `best ship` · `brought water` · `capable man` · `either side` · `got hold` · `great men` · `hardly hold` · `house men` · `leading men` · `lonely sea` · `mortal man` · `old days` · `old woman` · `once hold` · `once men` · `outer court` · `over land` · `poor man` · `poured water` · `twenty men` · `whole house` · `whole night` · `with water` · `young man`

