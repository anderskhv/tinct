# Odyssey Book 9 — checks, candidate v1

Written by `scripts/checks.py`, which is the only thing that computes
these numbers. Before it existed, **none of the package's checks was
executed for a new Book by anything in the repository** — substantive
finding **S-2** of `book06/review/findings-v1.md`. Every figure below
is reproducible by running `python3 scripts/checks.py 9`.

**Subject:** `book09/candidate-v1.json`, sha256 `41f452ac577054aa820eba1cf1bb20cc24b382e6e3330b74af8c24f657c481fb`.

**Basis — records finding R-1.** all 44 paragraphs. A figure without the paragraph
set it is computed over is not a figure, and the package published
one for three Books.

## 1. Verdict

**All gates pass.**


## 2. The figures

| measure | value |
|---|---|
| paragraphs scored | 44 |
| word ratio | 0.99138 |
| Butler token retention (canonical, aggregate-join) | **0.92181** |
| order retention (per paragraph, for MOVE-GAP) | 0.92181 |
| bag retention (order-blind) | 0.93447 |
| **MOVE-GAP** (bag − order), D20 | **0.01266** |
| sentences, source → candidate | 171 → 207 |
| **splitting rate** (D17, raw) | **+21.1%** |
| semicolon-normalized sentences | 225 → 231 |
| NORM RATE as published (D20) | +2.7% |
| semicolon-normalized, on Butler's pointing | 225 → 231 |
| **NORM RATE on Butler's own pointing** (D20, S-1) | **+2.7%** |
| sixty-word sentences | 16 → 0 (100% broken) |
| **semicolons, Butler → candidate** (D19) | **54 → 24** |
| **of which KEPT of Butler's / ADDED by the draft** (S-1) | **24 kept + 0 added** |
| **dividing marks, Butler → candidate** (D27: `;` `:` sentence-internal `—`) | **71 → 41** |
| **of which KEPT / ADDED** (D27) | **41 kept + 0 added** |
| dividing-mark-normalized sentences | 242 → 248 |
| NORM RATE, every dividing mark (D27) | +2.5% |
| dividing-mark-normalized, on Butler's pointing | 242 → 248 |
| **NORM RATE, dividing marks on Butler's pointing** — **the compared figure from Book 8 forward** (D27+D21) | **+2.5%** |

Of the +36 sentences added, at most **30** are a semicolon
rewritten as a period — the operation that adds a sentence, moves no
clause, drops no word and costs no retention. That is what NORM RATE
prices out, and why **D19 is a rate and not a count** (D20).

**And the mirror operation, which is the one D20 never priced.**
Substantive finding **S-1** of Book 7's round 1: a comma raised to a
semicolon adds nothing to the sentence count, adds one to the
candidate's semicolon count, and therefore scores under D20 exactly
what a real period scores — while leaving the clause chain inside one
sentence. A period costs a recast; a semicolon costs a keystroke.
**0 of this candidate's 24 semicolons are its own**, and the figure
that is COMPARED from Book 7 forward is **NORM RATE on Butler's own
pointing**, +2.7% here against the +2.7% the unsplit measure gives.

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
| Book 9 v1 — **this candidate** | all 44 paragraphs | 0.92181 | 171 → 207 | +21.1% | 54 → 24 | 71 → 41 | 41 + 0 | +2.7% | **+2.5%** | 0.01266 |

Book 3's row is the reason this column exists. Its published figures
are computed on **37 of its 38 paragraphs** — B03-P038, the **D14**
splice — and nothing said so until now. On all 38 the same measures
give 0.86053 and 176 → 174 (−1.1%), and the D17 floor derived from
them would be **negative**, which is to say the gate would be
vacuous. The exclusion is right; its silence was not.

## 4. D17's gate

Floor **+2.7%**, half accepted Book 3's +5.5% — computed from
the accepted files on each Book's own basis, never re-pasted from
prose. This candidate: **+21.1%**. Sixty-word survival gate:
0 of 16 survive, and the gate fails above 12.00.

## 5. The growth gate, aligned sentence to sentence (D20)

D19's gate as built compared each paragraph's **longest** candidate
sentence with its source paragraph's **longest** — a maximum against
a maximum. A draft that divides a paragraph's longest sentence lowers
the new maximum and can then grow a *different* sentence past the old
one's length with the gate reporting nothing. Division bought cover
for growth. Sentences are now aligned by best token overlap; 50 words
remains the failure; growth is reported from 40.


Sentences grown to 40 words or more: **5**.

| paragraph | source sentence | candidate sentence |
|---|---|---|
| B09-P001 | 43 words | 45 words |
| B09-P003 | 39 words | 41 words |
| B09-P010 | 38 words | 40 words |
| B09-P031 | 42 words | 44 words |
| B09-P033 | 42 words | 44 words |

## 6. Every candidate sentence over 40 words (absolute)

Blind spot 2 of `findings-v1.md` §9, which had no carrier: *a
sentence left long because it **is** long in Butler.* Every other
length check in the package is relative to the source, so a 43-word
four-limb chain that Butler also wrote at 43 words passes all of
them — which is how B06-P016 and B06-P018 reached a review
untouched. This report is absolute.

**37 sentences.**

| paragraph | words | source paragraph's longest | sentence |
|---|---|---|---|
| B09-P001 | **45** | 50 | There is nothing better or more delightful than when a whole people make merry together, with the guests sitting in thei… |
| B09-P001 | **49** | 50 | But since you are inclined to ask for the story of my sorrows, and to rekindle my own sad memories of them, I do not kno… |
| B09-P002 | **47** | 73 | Neither of them could persuade me, for there is nothing dearer to a man than his own country and his parents, and howeve… |
| B09-P003 | **41** | 67 | I then said we had better make off at once, but my men were fools and would not obey me, so they stayed there drinking a… |
| B09-P003 | **47** | 67 | So long as the morning lasted we held our own against them, though they outnumbered us; but as the sun went down, toward… |
| B09-P005 | **45** | 88 | It was so delicious that those who ate of it stopped caring about home, and did not even want to go back and say what ha… |
| B09-P006 | **43** | 43 | The Cyclopes neither plant nor plow, but trust in providence, and live on such wheat, barley, and grapes as grow wild wi… |
| B09-P007 | **40** | 71 | It is overrun with wild goats, which breed there in great numbers and are never disturbed by the foot of man; for sports… |
| B09-P007 | **45** | 71 | There are meadows that in some places come right down to the seashore, well watered and full of luscious grass; grapes w… |
| B09-P007 | **44** | 71 | There is a good harbor where no cables are wanted, nor anchors either, nor need a ship be moored, but all one has to do … |
| B09-P008 | **45** | 74 | The moon was hidden behind a mass of cloud, so that no one could have seen the island if he had looked for it, and there… |
| B09-P009 | **50** | 73 | Thus through the livelong day to the going down of the sun we ate and drank our fill, and we had plenty of wine left, fo… |
| B09-P010 | **40** | 38 | “‘Stay here, my brave fellows,’ said I, ‘all the rest of you, while I go with my ship and find out what these people are… |
| B09-P012 | **50** | 51 | When we were sacking the city we respected him and spared his life, and his wife and child as well; so he made me presen… |
| B09-P012 | **44** | 51 | I filled a large skin with this wine, and took a bag full of provisions with me, for my mind misgave me that I might hav… |
| B09-P013 | **46** | 49 | They were kept in separate flocks: first the yearlings, then the oldest of the younger lambs, and last the very young on… |
| B09-P013 | **40** | 49 | When my men saw this they begged me to let them steal some cheeses first and make off with them to the ship, and then co… |
| B09-P014 | **47** | 49 | When he came he brought with him a huge load of dry firewood to light the fire for his supper, and he flung it down on t… |
| B09-P016 | **46** | 47 | “We were frightened out of our senses by his loud voice and monstrous form, but I managed to say, ‘We are Achaeans on ou… |
| B09-P019 | **49** | 66 | I was inclined at first to seize my sword, draw it, and drive it into his vitals, but I reflected that if I did we shoul… |
| B09-P020 | **41** | 57 | Presently, with the utmost ease, he rolled the stone away from the door and drove out his sheep, but he put it back agai… |
| B09-P021 | **43** | 59 | I then gave this piece to the men and told them to shave it down evenly at one end, which they did, and last of all I br… |
| B09-P021 | **47** | 59 | When I had done this I hid it under the dung, which was lying about all over the cave, and told the men to cast lots whi… |
| B09-P021 | **45** | 59 | In the evening the wretch came back from shepherding and drove his flocks into the cave—this time driving them all insid… |
| B09-P026 | **58** | 69 | We drove the sharp end of the beam into the monster’s eye, and bearing on it with all my weight I kept turning it round … |
| B09-P026 | **49** | 69 | Even so did we bore the red-hot beam into his eye, till the boiling blood bubbled all over it as we worked it round and … |
| B09-P026 | **54** | 69 | As a blacksmith plunges an axe or hatchet into cold water to temper it—for it is this that gives strength to the iron—an… |
| B09-P026 | **48** | 69 | We ran away in a fright, but he plucked the beam, all besmeared with gore, out of his eye, and hurled it from him in a f… |
| B09-P031 | **44** | 49 | “As for myself, I kept on puzzling to think how I could best save my own life and the lives of my companions; I schemed … |
| B09-P031 | **49** | 49 | As for myself, there was a ram finer than any of the others, so I caught hold of him by the back, wedged myself in the t… |
| B09-P033 | **44** | 42 | You are not in the habit of letting the ewes go before you, but lead the flock at a run, whether to flowery meadow or bu… |
| B09-P034 | **49** | 59 | However, I made signs to them by nodding and frowning that they were to hush their crying, and told them to get all the … |
| B09-P036 | **42** | 43 | “He got more and more furious as he heard me, so he tore the top off a high mountain and flung it just in front of my sh… |
| B09-P037 | **41** | 81 | If he had then heard any further sound of voices he would have pounded our heads and our ship’s timbers into a jelly wit… |
| B09-P038 | **46** | 47 | “But I would not listen to them, and shouted out to him in my rage, ‘Cyclops, if anyone asks you who it was that put you… |
| B09-P039 | **59** | 70 | There was a prophet here once, a man both brave and of great stature, Telemus son of Eurymus, who was an excellent seer … |
| B09-P041 | **43** | 77 | If I am indeed your own true begotten son, grant that Odysseus may never reach his home alive; or if he must get back to… |

## 7. Displaced runs — the strict clause-movement witness

A run of four or more consecutive Butler tokens, occurring exactly
once on each side, surviving verbatim outside the monotone
alignment. MOVE-GAP is an upper bound; this is the lower one.

**2.**

| paragraph | run |
|---|---|
| B09-P011 | «we saw a great cave» |
| B09-P014 | «with such a noise» |

## 8. Paragraphs near-identical to Butler (40+ words, ≤4 edits)

| paragraph | source words | edits | longest sentence |
|---|---|---|---|
| B09-P023 | 84 | 3 | 27 words |
| B09-P027 | 48 | 4 | 23 words |
| B09-P035 | 51 | 1 | 21 words |
| B09-P037 | 82 | 2 | 41 words |
| B09-P038 | 47 | 2 | 46 words |
| B09-P041 | 78 | 1 | 43 words |
| B09-P042 | 77 | 4 | 29 words |

## 9. One Butler word rendered two ways (per Book, Butler-keyed)

**138 rows.** This report's declared limits, which records finding
**R-5** is about: it keys on Butler's side only and runs inside one
Book, so it cannot see one *rendering* made to carry two Butler
words, and it cannot compare a word's renderings across Books. Both
arrows, across all Books, are `scripts/rendering_collisions.py`.

| Butler word | times changed | times kept | kept at (first six) |
|---|---|---|---|
| `a` | 4 | 89 | P001, P001, P001, P001, P001, P001 |
| `able` | 2 | 1 | P019 |
| `again` | 4 | 5 | P007, P020, P026, P033, P036 |
| `all` | 3 | 42 | P002, P002, P007, P007, P008, P009 |
| `along` | 2 | 1 | P039 |
| `also` | 4 | 2 | P012, P043 |
| `and` | 6 | 231 | P001, P001, P001, P001, P001, P001 |
| `any` | 3 | 8 | P005, P006, P017, P017, P022, P026 |
| `are` | 2 | 16 | P001, P007, P007, P007, P010, P015 |
| `as` | 5 | 58 | P001, P001, P001, P003, P003, P003 |
| `at` | 3 | 23 | P003, P003, P005, P005, P007, P007 |
| `be` | 2 | 20 | P005, P007, P008, P012, P018, P019 |
| `being` | 2 | 1 | P011 |
| `better` | 1 | 6 | P001, P003, P003, P013, P029, P035 |
| `bowl` | 1 | 4 | P012, P012, P021, P024 |
| `but` | 3 | 50 | P002, P003, P003, P004, P004, P004 |
| `by` | 2 | 18 | P002, P004, P005, P007, P009, P012 |
| `cave` | 1 | 14 | P002, P007, P013, P014, P014, P021 |
| `could` | 1 | 11 | P003, P007, P008, P009, P013, P013 |
| `country` | 1 | 5 | P002, P007, P017, P018, P023 |
| `cried` | 1 | 2 | P020, P039 |
| `dawn` | 4 | 1 | P002 |
| `day` | 2 | 6 | P002, P004, P005, P009, P039, P044 |
| `did` | 3 | 11 | P002, P004, P005, P005, P019, P019 |
| `do` | 2 | 16 | P001, P007, P007, P007, P007, P011 |
| `down` | 2 | 16 | P003, P004, P007, P007, P008, P009 |
| `draw` | 1 | 3 | P012, P018, P019 |
| `due` | 1 | 1 | P014 |
| `either` | 1 | 3 | P003, P027, P031 |
| `ever` | 1 | 1 | P007 |
| `fill` | 1 | 2 | P009, P044 |
| `fine` | 1 | 1 | P012 |
| `first` | 1 | 6 | P003, P013, P019, P033, P034, P042 |
| `for` | 1 | 58 | P001, P001, P002, P002, P003, P003 |
| `from` | 3 | 30 | P002, P002, P002, P002, P002, P003 |
| `full` | 1 | 6 | P007, P009, P012, P019, P020, P032 |
| `further` | 2 | 2 | P037, P037 |
| `go` | 1 | 7 | P005, P005, P007, P007, P010, P022 |
| `got` | 1 | 16 | P003, P003, P004, P009, P011, P014 |
| `great` | 1 | 14 | P003, P007, P011, P012, P012, P016 |
| `grow` | 1 | 1 | P006 |
| `half` | 1 | 2 | P014, P014 |
| `hard` | 2 | 1 | P003 |
| `has` | 2 | 8 | P001, P001, P007, P016, P033, P033 |
| `he` | 3 | 84 | P002, P002, P008, P011, P011, P012 |
| `him` | 1 | 22 | P012, P013, P014, P021, P021, P021 |
| `home` | 1 | 9 | P002, P004, P005, P005, P016, P022 |
| `however` | 2 | 4 | P002, P002, P013, P034 |
| `i` | 1 | 95 | P001, P002, P002, P002, P002, P002 |
| `if` | 1 | 14 | P002, P002, P007, P008, P013, P019 |
| `ill` | 1 | 2 | P029, P029 |
| `in` | 8 | 63 | P002, P002, P002, P003, P003, P003 |
| `inclined` | 1 | 1 | P001 |
| `indeed` | 2 | 2 | P001, P041 |
| `into` | 1 | 15 | P009, P011, P014, P019, P021, P021 |
| `is` | 1 | 35 | P001, P001, P001, P001, P002, P002 |
| `it` | 4 | 84 | P001, P002, P002, P002, P002, P002 |
| `leave` | 1 | 2 | P004, P033 |
| `leaving` | 1 | 2 | P014, P021 |
| `left` | 1 | 4 | P003, P009, P020, P043 |
| `let` | 1 | 7 | P004, P013, P014, P020, P021, P041 |
| `loose` | 1 | 2 | P011, P044 |
| `lotus` | 1 | 5 | P005, P005, P005, P005, P005 |
| `make` | 1 | 9 | P001, P003, P013, P016, P021, P023 |
| `manner` | 1 | 1 | P002 |
| `may` | 1 | 8 | P002, P002, P002, P006, P016, P022 |
| `might` | 1 | 9 | P003, P005, P009, P012, P013, P030 |
| `more` | 1 | 12 | P001, P003, P003, P013, P020, P021 |
| `most` | 1 | 1 | P012 |
| `much` | 3 | 4 | P003, P004, P007, P042 |
| `myself` | 3 | 6 | P020, P021, P021, P031, P031, P031 |
| `no` | 1 | 13 | P005, P006, P006, P007, P007, P007 |
| `noise` | 1 | 1 | P027 |
| `none` | 2 | 1 | P002 |
| `nor` | 4 | 8 | P001, P006, P007, P007, P007, P007 |
| `not` | 2 | 22 | P001, P002, P002, P003, P004, P005 |
| `now` | 2 | 5 | P002, P007, P017, P033, P035 |
| `number` | 1 | 1 | P003 |
| `numbers` | 1 | 1 | P007 |
| `of` | 5 | 168 | P001, P001, P001, P002, P002, P002 |
| `off` | 4 | 9 | P003, P004, P007, P013, P017, P021 |
| `on` | 7 | 41 | P002, P002, P003, P003, P004, P005 |
| `once` | 1 | 6 | P003, P005, P005, P019, P023, P034 |
| `one` | 4 | 21 | P002, P002, P003, P004, P007, P007 |
| `only` | 1 | 3 | P012, P021, P043 |
| `ourselves` | 1 | 2 | P008, P009 |
| `out` | 2 | 26 | P004, P007, P007, P009, P011, P013 |
| `over` | 1 | 5 | P007, P009, P021, P026, P033 |
| `pray` | 1 | 2 | P029, P042 |
| `respect` | 1 | 1 | P012 |
| `return` | 2 | 2 | P005, P043 |
| `run` | 1 | 3 | P004, P009, P033 |
| `s` | 2 | 12 | P002, P007, P007, P015, P021, P022 |
| `saw` | 3 | 2 | P009, P024 |
| `sea` | 4 | 15 | P002, P005, P005, P007, P007, P011 |
| `sent` | 1 | 2 | P005, P009 |
| `set` | 2 | 3 | P003, P004, P014 |
| `shore` | 5 | 4 | P005, P008, P036, P042 |
| `sleep` | 1 | 3 | P019, P026, P031 |
| `so` | 5 | 46 | P002, P003, P003, P003, P003, P003 |
| `some` | 2 | 16 | P007, P008, P009, P011, P012, P013 |
| `such` | 1 | 5 | P001, P006, P016, P019, P027 |
| `than` | 1 | 7 | P001, P002, P013, P017, P031, P040 |
| `that` | 10 | 45 | P002, P003, P003, P003, P004, P005 |
| `the` | 3 | 332 | P001, P001, P001, P001, P001, P002 |
| `them` | 1 | 44 | P001, P002, P003, P004, P005, P005 |
| `then` | 3 | 29 | P002, P003, P004, P005, P011, P013 |
| `there` | 4 | 23 | P001, P002, P002, P002, P003, P003 |
| `therefore` | 1 | 3 | P003, P016, P024 |
| `these` | 1 | 2 | P003, P010 |
| `they` | 3 | 38 | P002, P003, P003, P003, P003, P003 |
| `this` | 5 | 27 | P001, P001, P002, P009, P009, P011 |
| `those` | 2 | 3 | P003, P005, P034 |
| `though` | 1 | 8 | P002, P003, P004, P019, P020, P026 |
| `thus` | 5 | 2 | P009, P044 |
| `time` | 2 | 5 | P002, P003, P007, P021, P031 |
| `to` | 10 | 139 | P001, P001, P001, P001, P001, P002 |
| `twenty` | 1 | 2 | P012, P021 |
| `up` | 4 | 10 | P019, P020, P021, P021, P026, P035 |
| `upon` | 14 | 5 | P001, P002, P007, P033, P043 |
| `very` | 1 | 7 | P002, P007, P013, P021, P026, P031 |
| `vessel` | 1 | 2 | P007, P043 |
| `was` | 4 | 43 | P003, P004, P005, P005, P008, P008 |
| `way` | 1 | 7 | P016, P018, P020, P022, P034, P037 |
| `we` | 5 | 80 | P003, P003, P003, P003, P003, P003 |
| `well` | 1 | 2 | P007, P031 |
| `were` | 3 | 29 | P003, P003, P003, P003, P004, P005 |
| `where` | 1 | 7 | P002, P007, P012, P015, P017, P033 |
| `whereas` | 1 | 1 | P022 |
| `which` | 7 | 12 | P003, P009, P011, P012, P021, P021 |
| `who` | 1 | 22 | P003, P004, P005, P005, P005, P007 |
| `whom` | 1 | 1 | P034 |
| `with` | 6 | 57 | P001, P001, P001, P002, P002, P002 |
| `without` | 2 | 3 | P005, P006, P024 |
| `would` | 1 | 22 | P003, P007, P007, P007, P007, P011 |
| `yet` | 5 | 2 | P009, P033 |
| `your` | 1 | 19 | P015, P016, P017, P017, P017, P018 |
| `yourself` | 1 | 1 | P022 |

## 10. Cross-Book compound drift

`scripts/compound_drift.py`, keyed on separator-stripped letters so
closed, hyphenated and open settings of one compound collide.

Result over book01, book02, book03, book04, book05, book06, book07, book08: **no drift**.

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
head. **30 pairs.**

> `brave men` · `build ships` · `caught hold` · `clear water` · `cold water` · `either side` · `firm hold` · `foreign land` · `fresh water` · `gray sea` · `harvest time` · `high wall` · `huge stone` · `laid hold` · `large yard` · `level land` · `little way` · `livelong day` · `long way` · `merchant ship` · `nine days` · `open sea` · `poor men` · `six men` · `stubble fires` · `tenth day` · `third day` · `third man` · `took hold` · `twelve ships`

