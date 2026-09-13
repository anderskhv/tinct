# Odyssey Book 10 — checks, candidate v1

Written by `scripts/checks.py`, which is the only thing that computes
these numbers. Before it existed, **none of the package's checks was
executed for a new Book by anything in the repository** — substantive
finding **S-2** of `book06/review/findings-v1.md`. Every figure below
is reproducible by running `python3 scripts/checks.py 10`.

**Subject:** `book10/candidate-v1.json`, sha256 `eedb949e3a668acb03d3c52b2073c5b05125840ee509f79cb2db0ed9e864a038`.

**Basis — records finding R-1.** all 49 paragraphs. A figure without the paragraph
set it is computed over is not a figure, and the package published
one for three Books.

## 1. Verdict

**All gates pass.**


## 2. The figures

| measure | value |
|---|---|
| paragraphs scored | 49 |
| word ratio | 0.99507 |
| Butler token retention (canonical, aggregate-join) | **0.93645** |
| order retention (per paragraph, for MOVE-GAP) | 0.93645 |
| bag retention (order-blind) | 0.94553 |
| **MOVE-GAP** (bag − order), D20 | **0.00908** |
| sentences, source → candidate | 175 → 214 |
| **splitting rate** (D17, raw) | **+22.3%** |
| semicolon-normalized sentences | 219 → 225 |
| NORM RATE as published (D20) | +2.7% |
| semicolon-normalized, on Butler's pointing | 219 → 225 |
| **NORM RATE on Butler's own pointing** (D20, S-1) | **+2.7%** |
| sixty-word sentences | 12 → 2 (83% broken) |
| **semicolons, Butler → candidate** (D19) | **44 → 11** |
| **of which KEPT of Butler's / ADDED by the draft** (S-1) | **11 kept + 0 added** |
| **dividing marks, Butler → candidate** (D27: `;` `:` sentence-internal `—`) | **60 → 26** |
| **of which KEPT / ADDED** (D27) | **26 kept + 0 added** |
| dividing-mark-normalized sentences | 235 → 240 |
| NORM RATE, every dividing mark (D27) | +2.1% |
| dividing-mark-normalized, on Butler's pointing | 235 → 240 |
| NORM RATE, dividing marks on Butler's pointing (D27+D21, the compared figure for Books 1-8) | +2.1% |
| **of which KEPT BY IDENTITY / CLASS-CHANGED / ADDED** (**D28**, Book 9 round 1 S-1) | **26 kept + 0 class-changed + 0 added** |
| dividing-mark-normalized, on Butler's pointing by identity | 235 → 240 |
| **NORM RATE, dividing marks on Butler's pointing BY MARK IDENTITY** — **the compared figure from Book 9 forward** (D28) | **+2.1%** |

Of the +39 sentences added, at most **33** are a semicolon
rewritten as a period — the operation that adds a sentence, moves no
clause, drops no word and costs no retention. That is what NORM RATE
prices out, and why **D19 is a rate and not a count** (D20).

**And the mirror operation, which is the one D20 never priced.**
Substantive finding **S-1** of Book 7's round 1: a comma raised to a
semicolon adds nothing to the sentence count, adds one to the
candidate's semicolon count, and therefore scores under D20 exactly
what a real period scores — while leaving the clause chain inside one
sentence. A period costs a recast; a semicolon costs a keystroke.
**0 of this candidate's 11 semicolons are its own**, and the figure
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
| Book 8 | all 50 paragraphs | 0.94093 | 192 → 235 | +22.4% | 42 → 7 | 62 → 31 | 24 + 7 | +3.4% | **+2.0%** | 0.00692 |
| Book 9 | all 44 paragraphs | 0.92284 | 171 → 203 | +18.7% | 54 → 26 | 71 → 45 | 45 + 0 | +1.8% | **+2.5%** | 0.01232 |
| Book 10 v1 — **this candidate** | all 49 paragraphs | 0.93645 | 175 → 214 | +22.3% | 44 → 11 | 60 → 26 | 26 + 0 | +2.7% | **+2.1%** | 0.00908 |

Book 3's row is the reason this column exists. Its published figures
are computed on **37 of its 38 paragraphs** — B03-P038, the **D14**
splice — and nothing said so until now. On all 38 the same measures
give 0.86053 and 176 → 174 (−1.1%), and the D17 floor derived from
them would be **negative**, which is to say the gate would be
vacuous. The exclusion is right; its silence was not.

## 4. D17's gate

Floor **+2.7%**, half accepted Book 3's +5.5% — computed from
the accepted files on each Book's own basis, never re-pasted from
prose. This candidate: **+22.3%**. Sixty-word survival gate:
2 of 12 survive, and the gate fails above 9.00.

## 5. The growth gate, aligned sentence to sentence (D20)

D19's gate as built compared each paragraph's **longest** candidate
sentence with its source paragraph's **longest** — a maximum against
a maximum. A draft that divides a paragraph's longest sentence lowers
the new maximum and can then grow a *different* sentence past the old
one's length with the gate reporting nothing. Division bought cover
for growth. Sentences are now aligned by best token overlap; 50 words
remains the failure; growth is reported from 40.

**FAILURES:**

- B10-P044 53 → 54 words: “‘When you have reached this spot, as I now tell you, dig a trench a cubit or so in length, breadth, and depth, and pour into it as a drink offering to all the dead, first honey mixed with milk, then wine, and in the third place water—sprinkling white barley meal over the whole.

Sentences grown to 40 words or more: **5**.

| paragraph | source sentence | candidate sentence |
|---|---|---|
| B10-P001 | 41 words | 43 words |
| B10-P003 | 41 words | 42 words |
| B10-P012 | 39 words | 43 words |
| B10-P016 | 45 words | 47 words |
| B10-P022 | 45 words | 47 words |

## 6. Every candidate sentence of 40 words or more (absolute)

Blind spot 2 of `findings-v1.md` §9, which had no carrier: *a
sentence left long because it **is** long in Butler.* Every other
length check in the package is relative to the source, so a 43-word
four-limb chain that Butler also wrote at 43 words passes all of
them — which is how B06-P016 and B06-P018 reached a review
untouched. This report is absolute.

**39 sentences.**

| paragraph | words | source paragraph's longest | sentence |
|---|---|---|---|
| B10-P001 | **43** | 41 | All day long the air of the house is loaded with the smell of roasting meat till the whole place groans with it, yard an… |
| B10-P002 | **47** | 49 | He flayed me a prime ox hide to hold the ways of the roaring winds, and shut them up in the hide as in a sack—for Zeus h… |
| B10-P003 | **42** | 43 | See what fine prizes he is taking home from Troy, while we, who have traveled just as far as he has, come back with our … |
| B10-P008 | **51** | 55 | Six days, night and day, we toiled, and on the seventh day we reached the rocky stronghold of Lamus—Telepylus, the city … |
| B10-P010 | **45** | 79 | “When the men got ashore they followed a level road by which the people draw their firewood down from the mountains into… |
| B10-P010 | **44** | 79 | She was going to the fountain Artacia, from which the people bring in their water, and when my men had come close up to … |
| B10-P011 | **50** | 68 | They threw huge rocks at us from the cliffs as though they had been mere stones, and I heard the horrible sound of the s… |
| B10-P011 | **40** | 68 | While they were killing my men inside the harbor I drew my sword, cut the cable of my own ship, and told my men to row w… |
| B10-P012 | **51** | 74 | “From there we sailed sadly on, glad to have escaped death though we had lost our comrades, and came to the Aeaean islan… |
| B10-P012 | **43** | 74 | When the morning of the third day came I took my spear and my sword and went away from the ship to look about me, and se… |
| B10-P012 | **49** | 74 | When I saw this I was uncertain whether, having seen the smoke, to go on at once and find out more, but in the end I jud… |
| B10-P013 | **40** | 90 | ‘Look here, my friends,’ said I, ‘we are not going to die so much before our time after all, and at any rate we shall no… |
| B10-P016 | **47** | 48 | As hounds crowd round their master when they see him coming from dinner—for they know he will bring them something—even … |
| B10-P016 | **48** | 48 | Presently they reached the gates of the goddess’s house, and as they stood there they could hear Circe within, singing m… |
| B10-P017 | **40** | 63 | When she had got them into her house she set them on benches and seats, and mixed them a mess with cheese, honey, meal, … |
| B10-P022 | **47** | 45 | When I had got through the charmed grove and was near the great house of the enchantress Circe, I met Hermes with his go… |
| B10-P023 | **44** | 80 | She will mix a mess for you to drink, and she will drug the meal she makes it with, but she will not be able to enchant … |
| B10-P023 | **64** | 80 | You must not refuse her point blank, for you want her to set your companions free, and to take good care of you as well,… |
| B10-P025 | **41** | 41 | She set me on a richly decorated seat inlaid with silver, and there was a footstool under my feet, and she mixed a mess … |
| B10-P029 | **41** | 73 | A third mixed some sweet wine with water in a silver bowl and put golden cups on the tables, while the fourth brought in… |
| B10-P029 | **51** | 73 | When the water in the cauldron was boiling she poured cold into it till it was just as I liked it, and then she set me i… |
| B10-P029 | **41** | 73 | As soon as she had done washing me and anointing me with oil, she clothed me in a good cloak and shirt and led me to a r… |
| B10-P029 | **43** | 73 | An upper servant brought me bread and offered me many things of what there was in the house, and then Circe asked me to … |
| B10-P030 | **41** | 41 | “When Circe saw me sitting there without eating, and in great grief, she came to me and said, ‘Odysseus, why do you sit … |
| B10-P032 | **54** | 71 | My men came out like so many prime hogs and stood looking at her, but she went about among them and anointed each with a… |
| B10-P032 | **42** | 71 | Circe herself was so sorry for them that she came up to me and said, ‘Odysseus, noble son of Laertes, go back at once to… |
| B10-P033 | **44** | 44 | When they saw me the silly blubbering fellows began frisking round me as calves break out and gambol round their mothers… |
| B10-P036 | **73** | 73 | “When I heard him I was in two minds whether or not to draw the keen blade that hung by my sturdy thigh and cut his head… |
| B10-P038 | **52** | 108 | I know how much you have all of you suffered at sea, and how badly you have fared among cruel savages on the mainland, b… |
| B10-P039 | **51** | 53 | But when the year had passed in the waning of moons and the long days had come round, my men called me aside and said, ‘… |
| B10-P040 | **42** | 42 | Then through the whole long day to the going down of the sun we feasted our fill on meat and wine, but when the sun went… |
| B10-P042 | **55** | 55 | I sat up in bed and wept, and would gladly have lived no longer to see the light of the sun, but presently, when I was t… |
| B10-P043 | **42** | 50 | You will find it near the place where the rivers Pyriphlegethon and Cocytus (which is a branch of the river Styx) flow i… |
| B10-P044 | **54** | 53 | “‘When you have reached this spot, as I now tell you, dig a trench a cubit or so in length, breadth, and depth, and pour… |
| B10-P044 | **41** | 53 | You must also offer many prayers to the poor feeble ghosts, and promise them that when you get back to Ithaca you will s… |
| B10-P046 | **46** | 46 | Then I went about among the men everywhere all over the house, and spoke kindly to each of them, man by man: ‘You must n… |
| B10-P047 | **41** | 47 | We had with us a young man named Elpenor, not very remarkable for sense or courage, who had got drunk and was lying on t… |
| B10-P047 | **45** | 47 | When he heard the noise of the men bustling about, he jumped up suddenly and forgot all about coming down by the main st… |
| B10-P048 | **51** | 51 | “When I had got the men together I said to them, ‘You think you are about to start home again, but Circe has explained t… |

## 7. Displaced runs — the strict clause-movement witness

A run of four or more consecutive Butler tokens, occurring exactly
once on each side, surviving verbatim outside the monotone
alignment. MOVE-GAP is an upper bound; this is the lower one.

**None.**


## 8. Paragraphs near-identical to Butler (40+ words, ≤4 edits)

| paragraph | source words | edits | longest sentence |
|---|---|---|---|
| B10-P015 | 100 | 4 | 28 words |
| B10-P024 | 49 | 1 | 19 words |
| B10-P027 | 84 | 1 | 33 words |
| B10-P030 | 65 | 0 | 41 words |
| B10-P031 | 62 | 0 | 35 words |
| B10-P033 | 125 | 4 | 44 words |
| B10-P034 | 60 | 2 | 30 words |
| B10-P035 | 94 | 4 | 34 words |
| B10-P036 | 74 | 3 | 73 words |
| B10-P042 | 63 | 1 | 55 words |
| B10-P044 | 117 | 2 | 54 words |
| B10-P048 | 51 | 0 | 51 words |
| B10-P049 | 86 | 3 | 31 words |

## 9. One Butler word rendered two ways (per Book, Butler-keyed)

**110 rows.** This report's declared limits, which records finding
**R-5** is about: it keys on Butler's side only and runs inside one
Book, so it cannot see one *rendering* made to carry two Butler
words, and it cannot compare a word's renderings across Books. Both
arrows, across all Books, are `scripts/rendering_collisions.py`.

| Butler word | times changed | times kept | kept at (first six) |
|---|---|---|---|
| `a` | 1 | 89 | P001, P002, P002, P002, P002, P002 |
| `able` | 1 | 2 | P023, P026 |
| `about` | 2 | 18 | P002, P002, P011, P022, P029, P029 |
| `again` | 1 | 3 | P032, P038, P048 |
| `all` | 2 | 34 | P001, P001, P001, P002, P003, P009 |
| `also` | 5 | 2 | P013, P038 |
| `among` | 1 | 4 | P003, P032, P038, P046 |
| `and` | 7 | 259 | P001, P001, P001, P001, P001, P002 |
| `be` | 3 | 22 | P007, P008, P010, P010, P015, P016 |
| `before` | 1 | 5 | P013, P017, P032, P041, P045 |
| `blow` | 1 | 2 | P002, P043 |
| `break` | 1 | 1 | P033 |
| `but` | 3 | 44 | P001, P002, P002, P004, P006, P007 |
| `by` | 3 | 20 | P005, P008, P008, P010, P012, P015 |
| `came` | 1 | 15 | P002, P012, P012, P014, P017, P019 |
| `captain` | 1 | 1 | P015 |
| `come` | 1 | 14 | P001, P003, P007, P010, P010, P020 |
| `day` | 2 | 10 | P001, P003, P008, P008, P008, P012 |
| `dead` | 1 | 3 | P009, P044, P045 |
| `did` | 6 | 7 | P015, P016, P016, P019, P046, P047 |
| `difficulty` | 1 | 1 | P022 |
| `do` | 1 | 11 | P008, P008, P014, P017, P020, P021 |
| `done` | 1 | 2 | P013, P029 |
| `down` | 1 | 16 | P004, P005, P013, P013, P013, P014 |
| `ever` | 1 | 3 | P003, P019, P040 |
| `for` | 2 | 48 | P002, P002, P002, P002, P003, P006 |
| `from` | 1 | 24 | P002, P003, P004, P007, P009, P010 |
| `further` | 2 | 2 | P023, P027 |
| `go` | 1 | 15 | P002, P005, P012, P012, P020, P021 |
| `got` | 2 | 18 | P003, P010, P011, P013, P013, P015 |
| `have` | 2 | 28 | P003, P006, P006, P012, P013, P014 |
| `he` | 2 | 33 | P001, P002, P002, P002, P002, P002 |
| `help` | 1 | 1 | P008 |
| `her` | 1 | 43 | P010, P010, P010, P010, P011, P016 |
| `here` | 1 | 11 | P005, P007, P013, P020, P026, P027 |
| `him` | 3 | 24 | P002, P002, P002, P003, P003, P005 |
| `his` | 1 | 28 | P001, P003, P005, P007, P008, P008 |
| `house` | 1 | 26 | P001, P005, P010, P012, P016, P016 |
| `however` | 1 | 1 | P040 |
| `i` | 4 | 104 | P002, P002, P002, P003, P003, P003 |
| `if` | 2 | 7 | P006, P011, P031, P036, P039, P041 |
| `ill` | 1 | 1 | P005 |
| `in` | 1 | 59 | P002, P002, P002, P003, P003, P003 |
| `is` | 3 | 18 | P001, P001, P003, P003, P003, P012 |
| `island` | 1 | 6 | P001, P001, P004, P012, P014, P025 |
| `it` | 1 | 56 | P001, P001, P001, P001, P002, P002 |
| `kind` | 1 | 2 | P010, P022 |
| `knew` | 1 | 2 | P032, P038 |
| `laid` | 2 | 3 | P011, P013, P029 |
| `land` | 1 | 3 | P003, P032, P034 |
| `lives` | 1 | 4 | P011, P012, P020, P035 |
| `look` | 1 | 1 | P013 |
| `make` | 1 | 9 | P004, P011, P017, P023, P023, P025 |
| `man` | 2 | 9 | P003, P008, P009, P022, P022, P026 |
| `may` | 1 | 4 | P020, P026, P031, P036 |
| `me` | 1 | 69 | P002, P002, P002, P002, P003, P006 |
| `more` | 1 | 6 | P003, P012, P016, P019, P038, P044 |
| `no` | 2 | 17 | P002, P008, P009, P014, P014, P016 |
| `nor` | 1 | 1 | P020 |
| `not` | 2 | 27 | P002, P004, P011, P011, P011, P013 |
| `now` | 1 | 6 | P001, P003, P025, P027, P038, P044 |
| `of` | 5 | 132 | P001, P001, P001, P001, P002, P002 |
| `on` | 10 | 30 | P001, P001, P002, P003, P003, P004 |
| `one` | 2 | 18 | P002, P005, P007, P008, P009, P011 |
| `out` | 2 | 21 | P003, P003, P004, P008, P008, P009 |
| `outside` | 1 | 2 | P009, P017 |
| `over` | 1 | 12 | P010, P015, P020, P022, P025, P029 |
| `own` | 1 | 12 | P001, P002, P003, P004, P009, P011 |
| `presently` | 1 | 3 | P010, P016, P042 |
| `return` | 1 | 1 | P020 |
| `sail` | 1 | 2 | P041, P045 |
| `saying` | 1 | 3 | P020, P022, P026 |
| `sea` | 4 | 8 | P001, P004, P004, P014, P029, P032 |
| `seeing` | 1 | 1 | P038 |
| `servant` | 1 | 1 | P029 |
| `shall` | 3 | 5 | P023, P027, P035, P042, P044 |
| `shore` | 5 | 2 | P043, P043 |
| `so` | 6 | 38 | P001, P002, P003, P003, P005, P009 |
| `some` | 1 | 10 | P009, P012, P012, P013, P018, P019 |
| `sort` | 1 | 1 | P009 |
| `speak` | 3 | 1 | P018 |
| `that` | 8 | 36 | P001, P001, P002, P003, P003, P003 |
| `the` | 3 | 280 | P001, P001, P001, P001, P001, P001 |
| `them` | 1 | 57 | P002, P008, P009, P010, P011, P011 |
| `themselves` | 1 | 2 | P003, P049 |
| `then` | 2 | 20 | P004, P009, P011, P013, P013, P015 |
| `they` | 2 | 64 | P001, P001, P004, P004, P005, P005 |
| `thinking` | 1 | 1 | P017 |
| `this` | 1 | 22 | P003, P003, P006, P008, P012, P013 |
| `thus` | 7 | 1 | P045 |
| `to` | 8 | 159 | P001, P001, P002, P002, P002, P003 |
| `too` | 1 | 2 | P013, P037 |
| `top` | 1 | 2 | P012, P022 |
| `turn` | 1 | 2 | P035, P045 |
| `until` | 1 | 1 | P031 |
| `upon` | 17 | 1 | P001 |
| `was` | 2 | 37 | P002, P003, P005, P008, P009, P010 |
| `were` | 1 | 20 | P001, P001, P002, P005, P008, P010 |
| `when` | 1 | 46 | P002, P005, P005, P009, P010, P010 |
| `which` | 4 | 6 | P002, P010, P010, P013, P022, P043 |
| `while` | 2 | 5 | P003, P004, P011, P024, P029 |
| `who` | 4 | 15 | P003, P008, P010, P010, P012, P015 |
| `whom` | 1 | 3 | P007, P016, P016 |
| `will` | 2 | 34 | P006, P016, P020, P022, P022, P022 |
| `with` | 3 | 71 | P001, P001, P001, P001, P002, P003 |
| `within` | 2 | 1 | P016 |
| `would` | 3 | 6 | P003, P026, P026, P029, P035, P042 |
| `you` | 4 | 108 | P005, P005, P005, P005, P006, P006 |
| `yourself` | 2 | 1 | P020 |
| `youth` | 1 | 1 | P022 |

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
head. **38 pairs.**

> `became men` · `cut stones` · `dark house` · `days night` · `dead men` · `fertile shore` · `fetch water` · `fine house` · `good fire` · `great house` · `into bed` · `long day` · `long days` · `long time` · `mere stones` · `mortal men` · `mountain top` · `native land` · `nine days` · `nine nights` · `open water` · `pigs head` · `pigsty doors` · `place water` · `seventh day` · `six days` · `stubble fires` · `tenth day` · `third day` · `third place` · `took hold` · `unhappy man` · `whole house` · `whole place` · `whole time` · `with water` · `young man` · `young woman`

