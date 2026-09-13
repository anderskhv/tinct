# Odyssey Book 3 — checks, candidate v2

Written by `scripts/checks.py`, which is the only thing that computes
these numbers. Before it existed, **none of the package's checks was
executed for a new Book by anything in the repository** — substantive
finding **S-2** of `book06/review/findings-v1.md`. Every figure below
is reproducible by running `python3 scripts/checks.py 3`.

**Subject:** `book03/candidate-v2.json`, sha256 `7095ef4f9925f284d3a31937d298b39766d619d8d5f2a01b61508c434989b905`.

**Basis — records finding R-1.** 37 of 38 — B03-P038 excluded, the **D14** splice: 196 of the served source paragraph's 208 words are the replaced `modern-en`'s own ¶38 and the candidate renders Butler's 12. Scoring a candidate against a source that is not its source measures the defect in the other file. The exclusion is correct and was never stated; both bases are printed here.. A figure without the paragraph
set it is computed over is not a figure, and the package published
one for three Books.

## 1. Verdict

**All gates pass.**


## 2. The figures

| measure | value |
|---|---|
| paragraphs scored | 37 |
| word ratio | 0.99574 |
| Butler token retention (canonical, aggregate-join) | **0.89641** |
| order retention (per paragraph, for MOVE-GAP) | 0.89641 |
| bag retention (order-blind) | 0.91797 |
| **MOVE-GAP** (bag − order), D20 | **0.02156** |
| sentences, source → candidate | 164 → 173 |
| **splitting rate** (D17, raw) | **+5.5%** |
| semicolon-normalized sentences | 203 → 205 |
| NORM RATE as published (D20) | +1.0% |
| semicolon-normalized, on Butler's pointing | 203 → 199 |
| **NORM RATE on Butler's own pointing** (D20, S-1) | **-2.0%** |
| sixty-word sentences | 9 → 6 (33% broken) |
| **semicolons, Butler → candidate** (D19) | **39 → 32** |
| **of which KEPT of Butler's / ADDED by the draft** (S-1) | **26 kept + 6 added** |
| **dividing marks, Butler → candidate** (D27: `;` `:` sentence-internal `—`) | **53 → 47** |
| **of which KEPT / ADDED** (D27) | **39 kept + 8 added** |
| dividing-mark-normalized sentences | 217 → 220 |
| NORM RATE, every dividing mark (D27) | +1.4% |
| dividing-mark-normalized, on Butler's pointing | 217 → 212 |
| NORM RATE, dividing marks on Butler's pointing (D27+D21, the compared figure for Books 1-8) | -2.3% |
| **of which KEPT BY IDENTITY / CLASS-CHANGED / ADDED** (**D28**, Book 9 round 1 S-1) | **38 kept + 1 class-changed + 8 added** |
| dividing-mark-normalized, on Butler's pointing by identity | 217 → 211 |
| **NORM RATE, dividing marks on Butler's pointing BY MARK IDENTITY** — **the compared figure from Book 9 forward** (D28) | **-2.8%** |

**The class changes, named** (D28). A count that cannot be pointed at is what
S-1 is about: `41 kept + 0 added` was true of the count and false of the
claim it was published to support.

| ¶ | Butler | candidate | at |
|---|---|---|---|
| B03-P021 | `;` | `:` | …tell me truly nestor |

Of the +9 sentences added, at most **7** are a semicolon
rewritten as a period — the operation that adds a sentence, moves no
clause, drops no word and costs no retention. That is what NORM RATE
prices out, and why **D19 is a rate and not a count** (D20).

**And the mirror operation, which is the one D20 never priced.**
Substantive finding **S-1** of Book 7's round 1: a comma raised to a
semicolon adds nothing to the sentence count, adds one to the
candidate's semicolon count, and therefore scores under D20 exactly
what a real period scores — while leaving the clause chain inside one
sentence. A period costs a recast; a semicolon costs a keystroke.
**6 of this candidate's 32 semicolons are its own**, and the figure
that is COMPARED from Book 7 forward is **NORM RATE on Butler's own
pointing**, -2.0% here against the +1.0% the unsplit measure gives.

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

Book 3's row is the reason this column exists. Its published figures
are computed on **37 of its 38 paragraphs** — B03-P038, the **D14**
splice — and nothing said so until now. On all 38 the same measures
give 0.86053 and 176 → 174 (−1.1%), and the D17 floor derived from
them would be **negative**, which is to say the gate would be
vacuous. The exclusion is right; its silence was not.

## 4. D17's gate

Floor **+2.7%**, half accepted Book 3's +5.5% — computed from
the accepted files on each Book's own basis, never re-pasted from
prose. This candidate: **+5.5%**. Sixty-word survival gate:
6 of 9 survive, and the gate fails above 6.75.

## 5. The growth gate, aligned sentence to sentence (D20)

D19's gate as built compared each paragraph's **longest** candidate
sentence with its source paragraph's **longest** — a maximum against
a maximum. A draft that divides a paragraph's longest sentence lowers
the new maximum and can then grow a *different* sentence past the old
one's length with the gate reporting nothing. Division bought cover
for growth. Sentences are now aligned by best token overlap; 50 words
remains the failure; growth is reported from 40.

**FAILURES:**

- B03-P011 64 → 66 words: We know what fate befell each of the other heroes who fought at Troy, but where Odysseus is concerned heaven has hidden from us even the knowledge that he is dead at all, for no one can tell us for certain in what place he died, nor say whether he fell in battle on the mainland or was lost at sea among the waves of Amphitrite.
- B03-P013 69 → 72 words: “When, however, we had sacked the city of Priam, and were setting sail in our ships as heaven had scattered us, then Zeus saw fit to make the Argives’ homeward voyage a hard one; for they had not all been either wise or understanding, and so many of them came to a bad end through the displeasure of Zeus’s daughter Athena, who brought about a quarrel between the two sons of Atreus.
- B03-P024 73 → 74 words: When we got to Sunium, which is the point of Athens, Apollo with his painless arrows killed Phrontis, the steersman of Menelaus’s ship (and no man ever knew better how to handle a vessel in rough weather), so that he died there and then with the helm in his hand; and Menelaus, though very anxious to press forward, had to wait in order to bury his comrade and give him his due funeral rites.
- B03-P024 56 → 58 words: There is a high headland in those parts stretching out into the sea from a place called Gortyn, and all along this part of the coast as far as Phaestus the sea runs high when there is a south wind blowing; but past Phaestus the coast is more sheltered, for a small headland can make a great shelter.

Sentences grown to 40 words or more: **3**.

| paragraph | source sentence | candidate sentence |
|---|---|---|
| B03-P011 | 43 words | 46 words |
| B03-P016 | 37 words | 40 words |
| B03-P032 | 37 words | 42 words |

## 6. Every candidate sentence of 40 words or more (absolute)

Blind spot 2 of `findings-v1.md` §9, which had no carrier: *a
sentence left long because it **is** long in Butler.* Every other
length check in the package is relative to the source, so a 43-word
four-limb chain that Butler also wrote at 43 words passes all of
them — which is how B06-P016 and B06-P018 reached a review
untouched. This report is absolute.

**26 sentences.**

| paragraph | words | source paragraph's longest | sentence |
|---|---|---|---|
| B03-P011 | **66** | 64 | We know what fate befell each of the other heroes who fought at Troy, but where Odysseus is concerned heaven has hidden … |
| B03-P011 | **46** | 64 | So I come as a suppliant to your knees, in the hope that you may be willing to tell me of his wretched end, whether you … |
| B03-P013 | **72** | 69 | “When, however, we had sacked the city of Priam, and were setting sail in our ships as heaven had scattered us, then Zeu… |
| B03-P014 | **40** | 41 | When they explained why they had called the people together, it appeared that Menelaus was for sailing homeward at once,… |
| B03-P015 | **56** | 77 | When we reached Tenedos we offered sacrifices to the gods, for we were longing to get home; cruel Zeus, however, did not… |
| B03-P015 | **46** | 77 | Later on Menelaus joined us at Lesbos, and found us making up our minds about our course—for we did not know whether to … |
| B03-P016 | **40** | 37 | I do not know who got home safely and who was lost; but, as I am bound to do, I will give you without reserve the report… |
| B03-P017 | **49** | 50 | I wish heaven might grant me to take such vengeance on the insolence of the wicked suitors, who are ill-treating me and … |
| B03-P018 | **64** | 66 | If Athena were to take as great a liking to you as she took to Odysseus when we were fighting before Troy (for I never y… |
| B03-P022 | **61** | 91 | If Menelaus, when he got back from Troy, had found Aegisthus still alive in his house, there would have been no mound he… |
| B03-P023 | **49** | 85 | “At first she would have nothing to do with his wicked scheme, for she was of a good natural disposition; and besides, t… |
| B03-P024 | **74** | 73 | When we got to Sunium, which is the point of Athens, Apollo with his painless arrows killed Phrontis, the steersman of M… |
| B03-P024 | **58** | 73 | There is a high headland in those parts stretching out into the sea from a place called Gortyn, and all along this part … |
| B03-P024 | **40** | 73 | For seven years after he had killed Agamemnon he ruled in Mycenae, and the people were obedient under him; but in the ei… |
| B03-P025 | **45** | 67 | “Take my advice, then, and do not go traveling about for long so far from home, nor leave your property with such danger… |
| B03-P025 | **66** | 67 | Still, I should advise you by all means to go and visit Menelaus, who has lately come back from a voyage among peoples s… |
| B03-P025 | **44** | 67 | Go to him, therefore, by sea, and take your own men with you; or if you would rather travel by land, you can have a char… |
| B03-P026 | **56** | 57 | As he spoke the sun set and darkness came on, and then Athena said, “Sir, all that you have said is well; but now have t… |
| B03-P027 | **48** | 49 | Manservants poured water over the hands of the guests, while pages filled the mixing-bowls with wine and water and hande… |
| B03-P028 | **50** | 51 | Let me tell you, I have plenty of both rugs and cloaks, and I will not allow the son of my old friend Odysseus to camp d… |
| B03-P031 | **40** | 55 | When they had got there and had taken their places on the benches and seats, he mixed them a bowl of sweet wine that was… |
| B03-P031 | **53** | 55 | Then, when they had made their drink offerings and had drunk as much as each of them wanted, the others went home to bed… |
| B03-P032 | **42** | 37 | Neleus had sat here in former days, the equal of the gods in counsel, but he was dead now and had gone to the house of H… |
| B03-P034 | **56** | 56 | Then Stratius and Echephron brought her in by the horns; Aretus fetched water from the house in a ewer that had a flower… |
| B03-P035 | **56** | 56 | When they had finished praying and sprinkling the barley meal, Thrasymedes dealt his blow, and brought the heifer down w… |
| B03-P035 | **55** | 56 | They cut out all the thigh bones in due order, wrapped them round in two layers of fat, and set some pieces of raw meat … |

## 7. Displaced runs — the strict clause-movement witness

A run of four or more consecutive Butler tokens, occurring exactly
once on each side, surviving verbatim outside the monotone
alignment. MOVE-GAP is an upper bound; this is the lower one.

**None.**


## 8. Paragraphs near-identical to Butler (40+ words, ≤4 edits)

| paragraph | source words | edits | longest sentence |
|---|---|---|---|
| B03-P019 | 40 | 3 | 18 words |

## 9. One Butler word rendered two ways (per Book, Butler-keyed)

**156 rows.** This report's declared limits, which records finding
**R-5** is about: it keys on Butler's side only and runs inside one
Book, so it cannot see one *rendering* made to carry two Butler
words, and it cannot compare a word's renderings across Books. Both
arrows, across all Books, are `scripts/rendering_collisions.py`.

| Butler word | times changed | times kept | kept at (first six) |
|---|---|---|---|
| `a` | 1 | 64 | P005, P006, P007, P010, P011, P012 |
| `about` | 3 | 8 | P010, P013, P015, P015, P016, P020 |
| `aegisthus` | 1 | 11 | P016, P016, P020, P021, P021, P022 |
| `after` | 1 | 5 | P018, P023, P024, P027, P028 |
| `again` | 1 | 3 | P015, P016, P024 |
| `against` | 1 | 6 | P009, P009, P012, P015, P018, P024 |
| `all` | 5 | 19 | P008, P011, P011, P012, P012, P012 |
| `also` | 5 | 1 | P033 |
| `am` | 1 | 5 | P003, P003, P004, P028, P029 |
| `an` | 1 | 9 | P002, P006, P008, P021, P024, P025 |
| `and` | 7 | 183 | P001, P001, P001, P001, P001, P002 |
| `any` | 2 | 3 | P011, P012, P021 |
| `as` | 3 | 45 | P001, P001, P007, P008, P008, P009 |
| `at` | 2 | 18 | P005, P011, P011, P011, P012, P014 |
| `athena` | 2 | 16 | P002, P005, P007, P010, P013, P018 |
| `away` | 1 | 3 | P015, P021, P030 |
| `back` | 2 | 5 | P015, P018, P021, P022, P024 |
| `be` | 3 | 13 | P002, P009, P011, P012, P015, P019 |
| `bed` | 1 | 2 | P026, P031 |
| `but` | 2 | 22 | P001, P003, P011, P011, P012, P012 |
| `by` | 6 | 15 | P005, P008, P008, P011, P015, P020 |
| `came` | 2 | 9 | P013, P016, P024, P024, P026, P034 |
| `company` | 1 | 1 | P011 |
| `course` | 1 | 3 | P015, P015, P037 |
| `dead` | 1 | 3 | P011, P022, P035 |
| `did` | 7 | 9 | P011, P015, P015, P015, P016, P016 |
| `do` | 3 | 12 | P006, P009, P011, P014, P014, P016 |
| `done` | 3 | 3 | P022, P028, P036 |
| `down` | 1 | 5 | P007, P028, P035, P036, P037 |
| `during` | 1 | 2 | P015, P033 |
| `each` | 2 | 5 | P001, P001, P005, P011, P031 |
| `either` | 1 | 2 | P013, P018 |
| `end` | 1 | 4 | P002, P011, P013, P016 |
| `even` | 2 | 5 | P012, P019, P020, P022, P025 |
| `fair` | 1 | 3 | P001, P015, P015 |
| `fleet` | 1 | 3 | P024, P024, P037 |
| `from` | 1 | 20 | P004, P009, P011, P011, P011, P012 |
| `gathered` | 1 | 3 | P001, P024, P037 |
| `get` | 2 | 2 | P015, P020 |
| `give` | 1 | 3 | P006, P016, P024 |
| `go` | 2 | 12 | P002, P003, P015, P025, P025, P025 |
| `got` | 1 | 6 | P016, P016, P022, P024, P031, P037 |
| `grace` | 1 | 1 | P007 |
| `has` | 1 | 7 | P002, P007, P011, P018, P020, P021 |
| `have` | 4 | 31 | P002, P003, P004, P006, P007, P009 |
| `he` | 7 | 60 | P002, P002, P002, P002, P005, P006 |
| `heard` | 1 | 3 | P011, P016, P031 |
| `heifer` | 1 | 8 | P030, P033, P034, P034, P034, P034 |
| `her` | 1 | 13 | P002, P005, P005, P007, P014, P023 |
| `herself` | 1 | 2 | P033, P034 |
| `him` | 2 | 31 | P002, P003, P005, P007, P010, P012 |
| `his` | 1 | 56 | P001, P002, P005, P005, P005, P005 |
| `home` | 1 | 10 | P015, P016, P016, P020, P020, P024 |
| `how` | 2 | 9 | P002, P003, P003, P012, P020, P021 |
| `however` | 2 | 2 | P013, P015 |
| `i` | 2 | 46 | P003, P003, P003, P004, P006, P006 |
| `if` | 1 | 9 | P011, P012, P015, P018, P018, P020 |
| `in` | 5 | 64 | P001, P001, P005, P006, P006, P007 |
| `is` | 3 | 21 | P002, P002, P006, P006, P011, P011 |
| `it` | 3 | 29 | P005, P006, P007, P007, P009, P011 |
| `king` | 1 | 1 | P006 |
| `like` | 1 | 4 | P012, P021, P021, P036 |
| `made` | 1 | 9 | P006, P008, P014, P015, P024, P027 |
| `man` | 2 | 12 | P006, P008, P009, P009, P011, P012 |
| `matter` | 2 | 2 | P007, P011 |
| `may` | 2 | 5 | P006, P011, P018, P026, P036 |
| `me` | 1 | 22 | P011, P011, P011, P011, P012, P015 |
| `meats` | 1 | 5 | P001, P005, P008, P035, P036 |
| `men` | 1 | 8 | P001, P012, P015, P016, P025, P029 |
| `mind` | 1 | 1 | P011 |
| `minded` | 2 | 1 | P020 |
| `more` | 1 | 4 | P012, P021, P021, P024 |
| `moreover` | 1 | 1 | P029 |
| `much` | 2 | 13 | P003, P006, P012, P012, P012, P019 |
| `my` | 1 | 25 | P011, P011, P011, P012, P012, P012 |
| `myself` | 1 | 5 | P003, P006, P007, P019, P028 |
| `neleus` | 1 | 3 | P001, P011, P017 |
| `nestor` | 2 | 24 | P002, P003, P005, P005, P007, P008 |
| `never` | 1 | 5 | P003, P012, P015, P018, P030 |
| `no` | 2 | 11 | P002, P011, P012, P012, P016, P017 |
| `nor` | 2 | 3 | P011, P025, P028 |
| `not` | 2 | 19 | P002, P011, P011, P012, P013, P014 |
| `nothing` | 2 | 2 | P019, P023 |
| `now` | 2 | 8 | P004, P009, P011, P018, P026, P029 |
| `of` | 19 | 113 | P001, P001, P001, P001, P001, P005 |
| `off` | 2 | 5 | P008, P023, P031, P034, P036 |
| `offer` | 1 | 3 | P001, P030, P030 |
| `offered` | 1 | 5 | P005, P015, P015, P023, P034 |
| `old` | 1 | 2 | P028, P031 |
| `on` | 6 | 33 | P001, P001, P001, P005, P005, P005 |
| `once` | 2 | 5 | P005, P014, P027, P033, P036 |
| `one` | 5 | 8 | P011, P012, P012, P015, P024, P024 |
| `only` | 1 | 2 | P029, P031 |
| `order` | 1 | 1 | P024 |
| `orders` | 1 | 1 | P023 |
| `pay` | 1 | 1 | P018 |
| `person` | 2 | 1 | P029 |
| `poseidon` | 1 | 5 | P001, P006, P007, P015, P026 |
| `presently` | 1 | 3 | P002, P024, P037 |
| `priam` | 1 | 1 | P013 |
| `return` | 2 | 2 | P007, P030 |
| `round` | 3 | 3 | P005, P027, P035 |
| `said` | 3 | 11 | P002, P011, P018, P020, P026, P026 |
| `sat` | 1 | 2 | P032, P036 |
| `send` | 1 | 2 | P007, P029 |
| `servants` | 1 | 1 | P007 |
| `since` | 1 | 2 | P016, P030 |
| `sir` | 2 | 2 | P026, P029 |
| `so` | 2 | 22 | P002, P003, P006, P012, P014, P015 |
| `some` | 2 | 10 | P004, P005, P007, P011, P015, P015 |
| `speak` | 1 | 5 | P002, P008, P011, P012, P025 |
| `spoken` | 1 | 1 | P029 |
| `stay` | 1 | 1 | P012 |
| `stayed` | 1 | 1 | P015 |
| `store` | 1 | 1 | P017 |
| `strangers` | 1 | 1 | P005 |
| `such` | 1 | 5 | P012, P017, P019, P025, P030 |
| `sweet` | 1 | 1 | P031 |
| `take` | 1 | 5 | P005, P018, P018, P025, P025 |
| `taken` | 3 | 2 | P008, P031 |
| `telemachus` | 3 | 22 | P001, P002, P002, P004, P005, P007 |
| `tell` | 1 | 15 | P002, P002, P011, P011, P011, P011 |
| `that` | 7 | 43 | P005, P006, P006, P006, P007, P009 |
| `the` | 10 | 237 | P001, P001, P001, P001, P001, P001 |
| `their` | 1 | 25 | P001, P001, P005, P005, P009, P014 |
| `them` | 3 | 29 | P005, P005, P005, P005, P005, P005 |
| `then` | 2 | 22 | P005, P005, P013, P016, P018, P020 |
| `there` | 2 | 15 | P001, P005, P012, P012, P020, P021 |
| `therefore` | 3 | 3 | P015, P025, P029 |
| `they` | 1 | 47 | P001, P001, P005, P005, P005, P005 |
| `this` | 3 | 12 | P002, P014, P015, P015, P018, P020 |
| `though` | 1 | 2 | P012, P024 |
| `time` | 3 | 4 | P012, P012, P017, P037 |
| `to` | 12 | 124 | P001, P001, P001, P001, P001, P002 |
| `travel` | 1 | 1 | P025 |
| `try` | 1 | 1 | P002 |
| `up` | 1 | 13 | P002, P003, P014, P015, P015, P022 |
| `upon` | 6 | 2 | P007, P037 |
| `valiant` | 1 | 1 | P016 |
| `wait` | 1 | 2 | P014, P024 |
| `was` | 4 | 31 | P001, P011, P011, P012, P012, P014 |
| `we` | 2 | 27 | P011, P011, P011, P012, P012, P012 |
| `were` | 3 | 26 | P001, P001, P001, P005, P005, P005 |
| `what` | 1 | 10 | P002, P009, P011, P011, P011, P012 |
| `when` | 3 | 31 | P005, P006, P008, P008, P011, P013 |
| `where` | 1 | 9 | P002, P005, P015, P024, P024, P025 |
| `which` | 3 | 5 | P015, P015, P023, P024, P034 |
| `who` | 1 | 24 | P009, P009, P011, P011, P012, P013 |
| `will` | 2 | 18 | P002, P004, P006, P009, P011, P016 |
| `with` | 3 | 42 | P001, P003, P004, P005, P006, P009 |
| `would` | 2 | 12 | P012, P012, P014, P018, P018, P019 |
| `year` | 1 | 1 | P024 |
| `yet` | 2 | 3 | P015, P018, P030 |
| `you` | 1 | 66 | P002, P002, P004, P004, P006, P006 |
| `your` | 1 | 20 | P002, P004, P006, P006, P009, P011 |
| `yourself` | 1 | 2 | P016, P022 |

## 10. Cross-Book compound drift

`scripts/compound_drift.py`, keyed on separator-stripped letters so
closed, hyphenated and open settings of one compound collide.

Result over book01, book02, book03, book04, book05, book06, book07, book08, book09: **seashore {'closed': ['book02', 'book03', 'book04', 'book05', 'book08', 'book09'], 'open': ['book03-v2']}**.

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
head. **20 pairs.**

> `best men` · `comfortable beds` · `excellent man` · `fair sea` · `fetched water` · `five ships` · `former days` · `four days` · `grain lands` · `hundred men` · `inner room` · `malean heads` · `open house` · `open sea` · `poured water` · `putting pieces` · `sea shore` · `spring water` · `wood fire` · `young men`

