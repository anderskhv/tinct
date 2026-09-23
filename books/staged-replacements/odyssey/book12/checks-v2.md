# Odyssey Book 12 — checks, candidate v2

Written by `scripts/checks.py`, which is the only thing that computes
these numbers. Before it existed, **none of the package's checks was
executed for a new Book by anything in the repository** — substantive
finding **S-2** of `book06/review/findings-v1.md`. Every figure below
is reproducible by running `python3 scripts/checks.py 12`.

**Subject:** `book12/candidate-v2.json`, sha256 `04702b98706cef6c7534dc75195cf0b32adbdbd5e1963832a8ff7cd221729874`.

**Basis — records finding R-1.** all 39 paragraphs. A figure without the paragraph
set it is computed over is not a figure, and the package published
one for three Books.

## 1. Verdict

**GATES FAILED — this candidate cannot be frozen.**

- D20 growth gate: a sentence grew past 50 words — P016 54→55; P027 56→59; P031 79→81; P037 68→71
- paragraphs below 0.90 of their source's length: [1, 2, 3, 4, 9], but book12/candidate-v2.json declares []

## 2. The figures

| measure | value |
|---|---|
| paragraphs scored | 39 |
| word ratio | 0.95250 |
| Butler token retention (canonical, aggregate-join) | **0.83121** |
| order retention (per paragraph, for MOVE-GAP) | 0.83121 |
| bag retention (order-blind) | 0.85172 |
| **MOVE-GAP** (bag − order), D20 | **0.02051** |
| sentences, source → candidate | 127 → 141 |
| **splitting rate** (D17, raw) | **+11.0%** |
| semicolon-normalized sentences | 173 → 173 |
| NORM RATE as published (D20) | +0.0% |
| semicolon-normalized, on Butler's pointing | 173 → 170 |
| **NORM RATE on Butler's own pointing** (D20, S-1) | **-1.7%** |
| sixty-word sentences | 15 → 7 (53% broken) |
| **semicolons, Butler → candidate** (D19) | **46 → 32** |
| **of which KEPT of Butler's / ADDED by the draft** (S-1) | **29 kept + 3 added** |
| **dividing marks, Butler → candidate** (D27: `;` `:` sentence-internal `—`) | **56 → 50** |
| **of which KEPT / ADDED** (D27) | **42 kept + 8 added** |
| dividing-mark-normalized sentences | 183 → 191 |
| NORM RATE, every dividing mark (D27) | +4.4% |
| dividing-mark-normalized, on Butler's pointing | 183 → 183 |
| NORM RATE, dividing marks on Butler's pointing (D27+D21, the compared figure for Books 1-8) | +0.0% |
| **of which KEPT BY IDENTITY / CLASS-CHANGED / ADDED** (**D28**, Book 9 round 1 S-1) | **39 kept + 3 class-changed + 8 added** |
| dividing-mark-normalized, on Butler's pointing by identity | 183 → 180 |
| **NORM RATE, dividing marks on Butler's pointing BY MARK IDENTITY** — **the compared figure from Book 9 forward** (D28) | **-1.6%** |

**The class changes, named** (D28). A count that cannot be pointed at is what
S-1 is about: `41 kept + 0 added` was true of the count and false of the
claim it was published to support.

| ¶ | Butler | candidate | at |
|---|---|---|---|
| B12-P010 | `;` | `—` | …scylla is not mortal |
| B12-P018 | `;` | `:` | …these are your orders |
| B12-P022 | `;` | `—` | …and never wear out |

Of the +14 sentences added, at most **14** are a semicolon
rewritten as a period — the operation that adds a sentence, moves no
clause, drops no word and costs no retention. That is what NORM RATE
prices out, and why **D19 is a rate and not a count** (D20).

**And the mirror operation, which is the one D20 never priced.**
Substantive finding **S-1** of Book 7's round 1: a comma raised to a
semicolon adds nothing to the sentence count, adds one to the
candidate's semicolon count, and therefore scores under D20 exactly
what a real period scores — while leaving the clause chain inside one
sentence. A period costs a recast; a semicolon costs a keystroke.
**3 of this candidate's 32 semicolons are its own**, and the figure
that is COMPARED from Book 7 forward is **NORM RATE on Butler's own
pointing**, -1.7% here against the +0.0% the unsplit measure gives.

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
| Book 12 v2 — **this candidate** | all 39 paragraphs | 0.83121 | 127 → 141 | +11.0% | 46 → 32 | 56 → 50 | 42 + 8 | +0.0% | **+0.0%** | 0.02051 |

Book 3's row is the reason this column exists. Its published figures
are computed on **37 of its 38 paragraphs** — B03-P038, the **D14**
splice — and nothing said so until now. On all 38 the same measures
give 0.86053 and 176 → 174 (−1.1%), and the D17 floor derived from
them would be **negative**, which is to say the gate would be
vacuous. The exclusion is right; its silence was not.

## 4. D17's gate

Floor **+2.7%**, half accepted Book 3's +5.5% — computed from
the accepted files on each Book's own basis, never re-pasted from
prose. This candidate: **+11.0%**. Sixty-word survival gate:
7 of 15 survive, and the gate fails above 11.25.

## 5. The growth gate, aligned sentence to sentence (D20)

D19's gate as built compared each paragraph's **longest** candidate
sentence with its source paragraph's **longest** — a maximum against
a maximum. A draft that divides a paragraph's longest sentence lowers
the new maximum and can then grow a *different* sentence past the old
one's length with the gate reporting nothing. Division bought cover
for growth. Sentences are now aligned by best token overlap; 50 words
remains the failure; growth is reported from 40.

**FAILURES:**

- B12-P016 54 → 55 words: “They sang these words most musically, and as I longed to hear more of them, I made signs by frowning to my men that they should set me free; but they only rowed harder, and Eurylochus and Perimedes bound me with still tighter bonds until we had passed out of hearing of the Sirens’ voices.
- B12-P027 56 → 59 words: As long as the corn and wine held out, the men did not touch the cattle, hungry as they were; but when they had eaten everything there was in the ship, they were forced to range farther afield, fishing with hook and line, snaring birds, and taking whatever else they could lay their hands on, for they were starving.
- B12-P031 79 → 81 words: “Meanwhile Lampetie went straight to the sun and told him we had been killing his cows, at which he flew into a great rage and said to the immortals, ‘Father Zeus, and all you other gods who live in everlasting bliss, I must have vengeance on the crew of Odysseus’s ship: they have had the insolence to kill my cows, which were the one thing I loved to look upon, whether I was going up to heaven or coming down again.
- B12-P037 68 → 71 words: “I clung to the ship until the sea knocked her sides away from her keel (which drifted about by itself) and tore the mast out of her in the direction of the keel; but there was a backstay of stout ox hide still fastened to it, and with this I lashed the mast and keel together, and getting astride of them, I was carried wherever the winds chose to take me.

Sentences grown to 40 words or more: **2**.

| paragraph | source sentence | candidate sentence |
|---|---|---|
| B12-P025 | 43 words | 44 words |
| B12-P029 | 45 words | 46 words |

## 6. Every candidate sentence of 40 words or more (absolute)

Blind spot 2 of `findings-v1.md` §9, which had no carrier: *a
sentence left long because it **is** long in Butler.* Every other
length check in the package is relative to the source, so a 43-word
four-limb chain that Butler also wrote at 43 words passes all of
them — which is how B06-P016 and B06-P018 reached a review
untouched. This report is absolute.

**34 sentences.**

| paragraph | words | source paragraph's longest | sentence |
|---|---|---|---|
| B12-P005 | **63** | 67 | So sail past these Sirens, and stop your men’s ears with wax so that none of them can hear; but if you like, you may lis… |
| B12-P006 | **43** | 72 | The only vessel that ever sailed through and survived was the famous Argo, on her way from the house of Aetes, and even … |
| B12-P007 | **42** | 87 | In the middle of it there is a large cave, facing west and turned toward Erebus; you must take your ship this way, but t… |
| B12-P010 | **50** | 91 | There is no help for it; your best chance is to get past her as fast as you can, for if you linger by her rock while you… |
| B12-P011 | **60** | 60 | If you leave these animals unharmed and think of nothing but getting home, you may yet reach Ithaca after much hardship;… |
| B12-P012 | **47** | 47 | Presently the great and cunning goddess Circe sent us a fair wind that blew steady from astern and stayed with us, keepi… |
| B12-P013 | **50** | 55 | “Then, deeply troubled, I said to my men, ‘My friends, it is not right that only one or two of us should know the prophe… |
| B12-P014 | **47** | 47 | Then, all of a sudden, it fell dead calm; there was not a breath of wind nor a ripple on the water, so the men furled th… |
| B12-P015 | **58** | 60 | No one has ever sailed past us without staying to hear the enchanting sweetness of our song—and whoever listens goes on … |
| B12-P016 | **55** | 54 | “They sang these words most musically, and as I longed to hear more of them, I made signs by frowning to my men that the… |
| B12-P018 | **55** | 57 | “‘My friends,’ I said, ‘this is not the first time we have been in danger, and we are in nothing like so bad a case as w… |
| B12-P019 | **57** | 59 | Then, taking two strong spears, I took my stand on the ship’s bow, since it was there I expected to first catch sight of… |
| B12-P020 | **44** | 83 | I was watching both ship and men at once, and in a moment I saw their hands and feet high above me, struggling in the ai… |
| B12-P020 | **81** | 83 | As a fisherman, seated with his spear in hand on some jutting rock, throws bait into the water to deceive the poor littl… |
| B12-P021 | **55** | 56 | So, being much troubled, I said to the men, ‘My men, I know you are hard pressed, but listen while I tell you the prophe… |
| B12-P022 | **49** | 70 | Now, though your men are worn out with toil and lack of sleep, you will not let them land and cook themselves a good sup… |
| B12-P022 | **43** | 70 | It is by night that the winds blow hardest and do the most damage; how can we escape if one of those sudden squalls spri… |
| B12-P023 | **70** | 75 | I saw that heaven meant us harm, and said, ‘You force me to give way, since you are many against one, but each one of yo… |
| B12-P024 | **40** | 42 | As soon as they had eaten and drunk their fill, they began talking about their poor comrades whom Scylla had snatched up… |
| B12-P025 | **44** | 43 | “In the third watch of the night, when the stars had shifted their places, Zeus raised a great gale of wind that blew li… |
| B12-P026 | **43** | 44 | “‘My friends,’ I said, ‘we have meat and drink in the ship, so let us take care not to touch the cattle, or we shall suf… |
| B12-P027 | **59** | 56 | As long as the corn and wine held out, the men did not touch the cattle, hungry as they were; but when they had eaten ev… |
| B12-P027 | **47** | 56 | When I had gone far enough to be clear of all my men, and had found a place well sheltered from the wind, I washed my ha… |
| B12-P028 | **71** | 80 | If we ever get back to Ithaca, we can build a fine temple to the sun-god and fill it with every kind of ornament; but if… |
| B12-P029 | **46** | 62 | Now the cattle, so fair and fine, were feeding not far from the ship; the men, therefore, drove in the best of them, and… |
| B12-P029 | **55** | 62 | They had no wine to pour as drink offerings over the sacrifice while it cooked, so they kept pouring a little water inst… |
| B12-P030 | **40** | 44 | ‘Father Zeus,’ I cried, ‘and all you other gods who live in everlasting bliss, you have done me a cruel mischief with th… |
| B12-P031 | **81** | 79 | “Meanwhile Lampetie went straight to the sun and told him we had been killing his cows, at which he flew into a great ra… |
| B12-P034 | **48** | 49 | And indeed the gods at once began to show signs and wonders among us, for the hides of the cattle crawled about, and the… |
| B12-P035 | **47** | 48 | “For six days my men kept driving in the best cows and feasting on them, but when Zeus, son of Cronus, had added a seven… |
| B12-P035 | **42** | 48 | We had not gone much further when we were caught by a fierce squall from the west that snapped the forestays of the mast… |
| B12-P037 | **71** | 68 | “I clung to the ship until the sea knocked her sides away from her keel (which drifted about by itself) and tore the mas… |
| B12-P038 | **59** | 64 | I could not plant my feet anywhere to stand securely, for the roots were far below and the boughs that overshadowed the … |
| B12-P039 | **40** | 40 | She took me in and was kind to me, but I need say no more about this, for I told you and your noble wife all about it ye… |

## 7. Displaced runs — the strict clause-movement witness

A run of four or more consecutive Butler tokens, occurring exactly
once on each side, surviving verbatim outside the monotone
alignment. MOVE-GAP is an upper bound; this is the lower one.

**None.**


## 8. Paragraphs near-identical to Butler (40+ words, ≤4 edits)

| paragraph | source words | edits | longest sentence |
|---|---|---|---|
| — | — | — | — |

## 9. One Butler word rendered two ways (per Book, Butler-keyed)

**204 rows.** This report's declared limits, which records finding
**R-5** is about: it keys on Butler's side only and runs inside one
Book, so it cannot see one *rendering* made to carry two Butler
words, and it cannot compare a word's renderings across Books. Both
arrows, across all Books, are `scripts/rendering_collisions.py`.

| Butler word | times changed | times kept | kept at (first six) |
|---|---|---|---|
| `a` | 7 | 63 | P002, P002, P005, P005, P006, P007 |
| `about` | 4 | 11 | P003, P005, P013, P019, P024, P034 |
| `after` | 3 | 5 | P001, P002, P011, P017, P038 |
| `again` | 1 | 11 | P005, P006, P008, P020, P022, P026 |
| `all` | 9 | 23 | P003, P004, P005, P007, P007, P011 |
| `and` | 7 | 203 | P001, P001, P001, P001, P002, P002 |
| `another` | 1 | 2 | P006, P010 |
| `any` | 3 | 1 | P007 |
| `are` | 5 | 15 | P006, P008, P008, P010, P010, P011 |
| `as` | 7 | 42 | P001, P003, P003, P004, P006, P007 |
| `at` | 2 | 16 | P002, P003, P007, P007, P009, P010 |
| `away` | 3 | 4 | P006, P018, P021, P035 |
| `back` | 1 | 4 | P018, P028, P030, P038 |
| `bad` | 1 | 4 | P010, P018, P028, P028 |
| `be` | 6 | 8 | P010, P018, P020, P022, P023, P023 |
| `been` | 3 | 7 | P002, P007, P014, P018, P028, P031 |
| `began` | 1 | 8 | P012, P012, P014, P020, P024, P030 |
| `being` | 3 | 1 | P021 |
| `bones` | 1 | 3 | P005, P029, P029 |
| `break` | 1 | 1 | P013 |
| `but` | 6 | 24 | P005, P007, P007, P008, P011, P011 |
| `by` | 10 | 17 | P003, P004, P010, P011, P016, P020 |
| `came` | 2 | 3 | P003, P003, P021 |
| `can` | 1 | 6 | P007, P008, P010, P015, P022, P028 |
| `catch` | 1 | 1 | P007 |
| `children` | 1 | 1 | P005 |
| `clear` | 1 | 3 | P007, P013, P027 |
| `come` | 1 | 3 | P005, P011, P015 |
| `cut` | 1 | 3 | P014, P029, P029 |
| `dark` | 1 | 2 | P007, P035 |
| `dawn` | 2 | 2 | P001, P012 |
| `day` | 1 | 5 | P003, P004, P008, P027, P035 |
| `dead` | 1 | 5 | P005, P006, P014, P031, P034 |
| `did` | 2 | 7 | P013, P014, P019, P019, P019, P020 |
| `do` | 1 | 8 | P004, P011, P013, P018, P019, P022 |
| `doing` | 1 | 1 | P012 |
| `done` | 3 | 2 | P028, P030 |
| `down` | 1 | 8 | P003, P004, P008, P020, P031, P031 |
| `drew` | 1 | 2 | P025, P030 |
| `drink` | 1 | 3 | P026, P028, P029 |
| `each` | 1 | 6 | P007, P007, P011, P020, P023, P034 |
| `ended` | 1 | 1 | P012 |
| `ends` | 1 | 2 | P005, P013 |
| `enough` | 1 | 2 | P027, P028 |
| `ever` | 2 | 5 | P006, P006, P007, P015, P028 |
| `everything` | 1 | 3 | P003, P015, P026 |
| `fast` | 2 | 3 | P008, P010, P024 |
| `feet` | 1 | 5 | P007, P007, P020, P038, P038 |
| `fire` | 1 | 2 | P020, P036 |
| `flew` | 1 | 1 | P031 |
| `flocks` | 1 | 3 | P011, P011, P011 |
| `for` | 9 | 34 | P003, P005, P005, P006, P006, P007 |
| `forth` | 1 | 1 | P025 |
| `from` | 2 | 19 | P002, P003, P004, P006, P010, P012 |
| `further` | 3 | 1 | P035 |
| `get` | 5 | 4 | P007, P010, P028, P038 |
| `getting` | 2 | 3 | P011, P036, P037 |
| `give` | 1 | 1 | P006 |
| `go` | 4 | 6 | P012, P022, P022, P031, P032, P038 |
| `going` | 2 | 3 | P003, P015, P031 |
| `gone` | 1 | 1 | P027 |
| `got` | 12 | 1 | P034 |
| `had` | 6 | 35 | P002, P002, P002, P003, P005, P007 |
| `half` | 2 | 1 | P010 |
| `hand` | 2 | 2 | P004, P020 |
| `hands` | 1 | 9 | P007, P014, P018, P020, P020, P027 |
| `hard` | 2 | 1 | P021 |
| `harm` | 1 | 2 | P011, P019 |
| `has` | 2 | 4 | P006, P007, P013, P023 |
| `have` | 2 | 12 | P003, P003, P005, P006, P006, P018 |
| `he` | 1 | 11 | P002, P007, P020, P022, P023, P023 |
| `head` | 2 | 5 | P007, P011, P018, P023, P035 |
| `hear` | 1 | 3 | P005, P015, P016 |
| `her` | 3 | 27 | P003, P003, P006, P006, P007, P007 |
| `here` | 2 | 5 | P003, P012, P015, P021, P022 |
| `him` | 1 | 6 | P002, P003, P005, P005, P031, P035 |
| `his` | 3 | 9 | P002, P002, P005, P015, P018, P020 |
| `hold` | 1 | 3 | P019, P025, P038 |
| `i` | 7 | 77 | P002, P003, P005, P005, P006, P006 |
| `in` | 13 | 50 | P005, P007, P007, P007, P007, P007 |
| `indeed` | 2 | 1 | P034 |
| `into` | 3 | 11 | P002, P007, P020, P024, P025, P027 |
| `is` | 5 | 21 | P005, P007, P007, P007, P007, P007 |
| `it` | 3 | 37 | P002, P005, P007, P007, P007, P007 |
| `ithaca` | 1 | 1 | P028 |
| `laid` | 1 | 1 | P015 |
| `left` | 1 | 3 | P029, P030, P035 |
| `lie` | 1 | 1 | P021 |
| `long` | 2 | 4 | P013, P027, P038, P038 |
| `look` | 2 | 2 | P018, P031 |
| `looking` | 3 | 1 | P036 |
| `losing` | 1 | 1 | P007 |
| `made` | 1 | 5 | P016, P020, P021, P022, P024 |
| `make` | 2 | 1 | P019 |
| `making` | 1 | 2 | P010, P034 |
| `man` | 2 | 3 | P007, P007, P017 |
| `may` | 3 | 5 | P005, P006, P010, P011, P013 |
| `me` | 1 | 34 | P004, P004, P013, P013, P013, P013 |
| `meat` | 1 | 4 | P003, P026, P029, P030 |
| `men` | 2 | 41 | P002, P004, P005, P005, P005, P006 |
| `might` | 1 | 3 | P007, P013, P018 |
| `mischief` | 1 | 1 | P030 |
| `moment` | 1 | 3 | P007, P020, P020 |
| `monster` | 1 | 3 | P007, P019, P019 |
| `more` | 1 | 4 | P008, P035, P038, P039 |
| `morning` | 1 | 3 | P002, P022, P025 |
| `most` | 1 | 3 | P013, P016, P020 |
| `much` | 3 | 3 | P011, P021, P035 |
| `my` | 1 | 37 | P005, P009, P012, P013, P013, P014 |
| `no` | 1 | 14 | P006, P007, P007, P007, P009, P010 |
| `nor` | 1 | 1 | P014 |
| `not` | 4 | 25 | P006, P006, P007, P007, P007, P008 |
| `now` | 1 | 7 | P003, P005, P018, P022, P022, P029 |
| `number` | 1 | 1 | P006 |
| `of` | 17 | 101 | P002, P002, P003, P003, P003, P005 |
| `off` | 6 | 5 | P005, P006, P007, P020, P027 |
| `on` | 16 | 24 | P001, P005, P006, P006, P007, P010 |
| `once` | 1 | 6 | P003, P007, P012, P022, P028, P034 |
| `one` | 3 | 18 | P006, P006, P007, P007, P013, P013 |
| `only` | 2 | 3 | P006, P015, P019 |
| `other` | 2 | 6 | P008, P020, P027, P028, P030, P031 |
| `our` | 1 | 12 | P001, P004, P012, P013, P015, P015 |
| `out` | 4 | 19 | P001, P007, P007, P016, P019, P020 |
| `over` | 2 | 10 | P015, P018, P019, P019, P020, P029 |
| `pass` | 1 | 1 | P006 |
| `past` | 1 | 5 | P006, P006, P007, P010, P015 |
| `places` | 1 | 2 | P012, P025 |
| `pray` | 2 | 1 | P027 |
| `presently` | 1 | 1 | P012 |
| `raised` | 1 | 4 | P014, P025, P035, P035 |
| `reach` | 1 | 1 | P038 |
| `reached` | 1 | 4 | P014, P020, P021, P038 |
| `round` | 4 | 5 | P020, P020, P036, P036, P036 |
| `row` | 1 | 2 | P018, P038 |
| `s` | 2 | 12 | P002, P005, P005, P005, P010, P011 |
| `said` | 1 | 17 | P003, P005, P009, P013, P013, P013 |
| `same` | 1 | 2 | P009, P039 |
| `saying` | 1 | 1 | P029 |
| `sea` | 4 | 17 | P001, P002, P003, P012, P017, P021 |
| `seated` | 1 | 1 | P020 |
| `second` | 1 | 1 | P010 |
| `see` | 2 | 7 | P008, P020, P020, P030, P034, P035 |
| `set` | 2 | 5 | P002, P007, P013, P016, P024 |
| `she` | 4 | 28 | P003, P003, P004, P004, P006, P007 |
| `ship` | 1 | 33 | P001, P006, P007, P007, P008, P010 |
| `shore` | 2 | 2 | P001, P014 |
| `should` | 6 | 2 | P013, P016 |
| `side` | 1 | 2 | P008, P020 |
| `singing` | 1 | 1 | P005 |
| `sirens` | 1 | 7 | P005, P005, P006, P013, P014, P014 |
| `sleep` | 1 | 6 | P004, P022, P024, P027, P030, P030 |
| `so` | 8 | 27 | P003, P005, P005, P007, P007, P008 |
| `some` | 3 | 3 | P002, P020, P027 |
| `south` | 1 | 3 | P027, P027, P038 |
| `spray` | 1 | 1 | P020 |
| `stand` | 2 | 2 | P019, P038 |
| `steadily` | 1 | 1 | P027 |
| `stop` | 1 | 1 | P005 |
| `struck` | 2 | 1 | P036 |
| `sun` | 2 | 12 | P004, P011, P011, P014, P021, P021 |
| `take` | 1 | 5 | P006, P007, P007, P013, P037 |
| `taken` | 1 | 2 | P006, P020 |
| `that` | 17 | 28 | P005, P005, P006, P006, P006, P007 |
| `the` | 24 | 267 | P001, P001, P001, P001, P001, P002 |
| `their` | 2 | 22 | P005, P006, P011, P011, P012, P012 |
| `them` | 4 | 34 | P005, P005, P005, P006, P006, P006 |
| `themselves` | 1 | 2 | P014, P022 |
| `then` | 7 | 17 | P004, P011, P012, P013, P013, P014 |
| `there` | 1 | 16 | P005, P006, P007, P008, P008, P009 |
| `therefore` | 7 | 4 | P017, P021, P027, P029 |
| `these` | 1 | 14 | P005, P006, P006, P006, P007, P011 |
| `they` | 3 | 44 | P005, P005, P005, P008, P011, P011 |
| `thing` | 2 | 2 | P019, P031 |
| `this` | 2 | 14 | P003, P007, P018, P018, P020, P020 |
| `though` | 2 | 4 | P007, P019, P022, P035 |
| `through` | 2 | 1 | P022 |
| `time` | 2 | 3 | P009, P018, P030 |
| `to` | 29 | 97 | P002, P002, P002, P003, P003, P003 |
| `too` | 1 | 4 | P005, P038, P038, P038 |
| `top` | 1 | 3 | P002, P007, P029 |
| `up` | 4 | 14 | P005, P007, P013, P014, P018, P020 |
| `upon` | 11 | 4 | P020, P031, P032, P032 |
| `us` | 1 | 17 | P003, P003, P012, P012, P013, P015 |
| `very` | 1 | 3 | P014, P022, P038 |
| `vessel` | 1 | 2 | P006, P035 |
| `was` | 7 | 25 | P006, P014, P014, P017, P019, P019 |
| `water` | 1 | 10 | P014, P014, P020, P020, P020, P020 |
| `way` | 4 | 6 | P006, P007, P009, P015, P034, P038 |
| `well` | 1 | 3 | P012, P027, P035 |
| `went` | 3 | 8 | P012, P014, P017, P024, P024, P027 |
| `were` | 4 | 22 | P003, P014, P017, P020, P020, P021 |
| `west` | 1 | 4 | P007, P022, P035, P038 |
| `when` | 5 | 18 | P002, P004, P005, P006, P008, P014 |
| `where` | 1 | 6 | P001, P001, P002, P017, P021, P039 |
| `which` | 7 | 8 | P006, P006, P014, P022, P031, P037 |
| `while` | 1 | 10 | P003, P010, P020, P020, P021, P021 |
| `who` | 2 | 10 | P003, P005, P005, P010, P013, P019 |
| `will` | 3 | 21 | P003, P003, P005, P005, P005, P006 |
| `with` | 13 | 34 | P003, P005, P005, P005, P006, P007 |
| `words` | 2 | 1 | P016 |
| `would` | 1 | 7 | P006, P019, P019, P021, P026, P028 |
| `yet` | 1 | 2 | P007, P011 |
| `you` | 4 | 61 | P003, P003, P005, P005, P005, P005 |
| `your` | 2 | 18 | P003, P003, P003, P005, P006, P007 |

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
head. **31 pairs.**

> `best men` · `caught hold` · `dead men` · `either side` · `fifty head` · `fine work` · `fresh water` · `frightful head` · `give way` · `gray sea` · `great fire` · `green field` · `laid pieces` · `like water` · `little pieces` · `little water` · `losing men` · `nine days` · `nymphs hold` · `open sea` · `salt water` · `scylla land` · `seventh day` · `single head` · `six days` · `six heads` · `six men` · `swift night` · `tenth night` · `whole sea` · `with fire`

