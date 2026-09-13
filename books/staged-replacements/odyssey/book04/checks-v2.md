# Odyssey Book 4 — checks, candidate v2

Written by `scripts/checks.py`, which is the only thing that computes
these numbers. Before it existed, **none of the package's checks was
executed for a new Book by anything in the repository** — substantive
finding **S-2** of `book06/review/findings-v1.md`. Every figure below
is reproducible by running `python3 scripts/checks.py 4`.

**Subject:** `book04/candidate-v2.json`, sha256 `b3bef2f3570009ef875a41567ecea85628b7883e3678e2bb226a51b49674c446`.

**Basis — records finding R-1.** all 81 paragraphs. A figure without the paragraph
set it is computed over is not a figure, and the package published
one for three Books.

## 1. Verdict

**All gates pass.**


## 2. The figures

| measure | value |
|---|---|
| paragraphs scored | 81 |
| word ratio | 1.00037 |
| Butler token retention (canonical, aggregate-join) | **0.95872** |
| order retention (per paragraph, for MOVE-GAP) | 0.95872 |
| bag retention (order-blind) | 0.96303 |
| **MOVE-GAP** (bag − order), D20 | **0.00431** |
| sentences, source → candidate | 281 → 306 |
| **splitting rate** (D17, raw) | **+8.9%** |
| semicolon-normalized sentences | 349 → 356 |
| NORM RATE as published (D20) | +2.0% |
| semicolon-normalized, on Butler's pointing | 349 → 356 |
| **NORM RATE on Butler's own pointing** (D20, S-1) | **+2.0%** |
| sixty-word sentences | 17 → 3 (82% broken) |
| **semicolons, Butler → candidate** (D19) | **68 → 50** |
| **of which KEPT of Butler's / ADDED by the draft** (S-1) | **50 kept + 0 added** |
| **dividing marks, Butler → candidate** (D27: `;` `:` sentence-internal `—`) | **103 → 81** |
| **of which KEPT / ADDED** (D27) | **80 kept + 0 added** |
| dividing-mark-normalized sentences | 384 → 387 |
| NORM RATE, every dividing mark (D27) | +0.8% |
| dividing-mark-normalized, on Butler's pointing | 384 → 386 |
| NORM RATE, dividing marks on Butler's pointing (D27+D21, the compared figure for Books 1-8) | +0.5% |
| **of which KEPT BY IDENTITY / CLASS-CHANGED / ADDED** (**D28**, Book 9 round 1 S-1) | **79 kept + 1 class-changed + 0 added** |
| dividing-mark-normalized, on Butler's pointing by identity | 384 → 385 |
| **NORM RATE, dividing marks on Butler's pointing BY MARK IDENTITY** — **the compared figure from Book 9 forward** (D28) | **+0.3%** |

**The class changes, named** (D28). A count that cannot be pointed at is what
S-1 is about: `41 kept + 0 added` was true of the count and false of the
claim it was published to support.

| ¶ | Butler | candidate | at |
|---|---|---|---|
| B04-P027 | `;` | `—` | …from some other traveler |

Of the +25 sentences added, at most **18** are a semicolon
rewritten as a period — the operation that adds a sentence, moves no
clause, drops no word and costs no retention. That is what NORM RATE
prices out, and why **D19 is a rate and not a count** (D20).

**And the mirror operation, which is the one D20 never priced.**
Substantive finding **S-1** of Book 7's round 1: a comma raised to a
semicolon adds nothing to the sentence count, adds one to the
candidate's semicolon count, and therefore scores under D20 exactly
what a real period scores — while leaving the clause chain inside one
sentence. A period costs a recast; a semicolon costs a keystroke.
**0 of this candidate's 50 semicolons are its own**, and the figure
that is COMPARED from Book 7 forward is **NORM RATE on Butler's own
pointing**, +2.0% here against the +2.0% the unsplit measure gives.

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
prose. This candidate: **+8.9%**. Sixty-word survival gate:
3 of 17 survive, and the gate fails above 12.75.

## 5. The growth gate, aligned sentence to sentence (D20)

D19's gate as built compared each paragraph's **longest** candidate
sentence with its source paragraph's **longest** — a maximum against
a maximum. A draft that divides a paragraph's longest sentence lowers
the new maximum and can then grow a *different* sentence past the old
one's length with the gate reporting nothing. Division bought cover
for growth. Sentences are now aligned by best token overlap; 50 words
remains the failure; growth is reported from 40.

**FAILURES:**

- B04-P018 53 → 55 words: One can soon see when a man is son to one whom heaven has blessed both in his wife and in his children—and it has blessed Nestor from first to last all his days, giving him a green old age in his own house, with sons about him who are both well disposed and valiant.
- B04-P028 54 → 56 words: By father Zeus, Athena, and Apollo, if Odysseus is still the man that he was when he wrestled with Philomeleides in Lesbos, and threw him so heavily that all the Achaeans cheered him—if he is still such a man and were to come near these suitors, they would have a short shrift and a sorry wedding.
- B04-P076 61 → 62 words: I am even more anxious about him than about my husband; I am all in a tremble when I think of him, for fear something should happen to him, either from the people among whom he has gone, or by sea, for he has many enemies who are plotting against him, and are bent on killing him before he can return home.”

Sentences grown to 40 words or more: **6**.

| paragraph | source sentence | candidate sentence |
|---|---|---|
| B04-P004 | 42 words | 45 words |
| B04-P017 | 48 words | 49 words |
| B04-P020 | 44 words | 46 words |
| B04-P027 | 41 words | 44 words |
| B04-P048 | 39 words | 40 words |
| B04-P065 | 41 words | 42 words |

## 6. Every candidate sentence of 40 words or more (absolute)

Blind spot 2 of `findings-v1.md` §9, which had no carrier: *a
sentence left long because it **is** long in Butler.* Every other
length check in the package is relative to the source, so a 43-word
four-limb chain that Butler also wrote at 43 words passes all of
them — which is how B06-P016 and B06-P018 reached a review
untouched. This report is absolute.

**52 sentences.**

| paragraph | words | source paragraph's longest | sentence |
|---|---|---|---|
| B04-P001 | **54** | 54 | They reached the low lying city of Lacedaemon, where they drove straight to the home of Menelaus and found him in his ow… |
| B04-P001 | **46** | 54 | He had given his consent and promised her to him while he was still at Troy, and now the gods were bringing the marriage… |
| B04-P004 | **45** | 42 | Take their horses out, of course, and show the strangers in so that they may have supper; you and I have stayed often en… |
| B04-P008 | **46** | 81 | As soon as they had had enough to eat and drink, Telemachus said to the son of Nestor, with his head so close that no on… |
| B04-P009 | **47** | 71 | But among mortal men—well, there may be another who has as much wealth as I have, or there may not; but at all events I … |
| B04-P009 | **42** | 71 | I went to Cyprus, Phoenicia and the Egyptians; I went also to the Ethiopians, the Sidonians, and the Erembians, and to L… |
| B04-P012 | **58** | 58 | Never yet have I seen either man or woman so like somebody else (indeed when I look at him I hardly know what to think) … |
| B04-P014 | **44** | 45 | Then Pisistratus said, “Menelaus, son of Atreus, you are right in thinking that this young man is Telemachus, but he is … |
| B04-P014 | **43** | 45 | A son always has trouble at home when his father has gone away leaving him without supporters; and this is how Telemachu… |
| B04-P017 | **49** | 48 | I had a brother who died at Troy; he was by no means the worst man there; you are sure to have known him—his name was An… |
| B04-P018 | **55** | 53 | One can soon see when a man is son to one whom heaven has blessed both in his wife and in his children—and it has blesse… |
| B04-P020 | **46** | 44 | Whoever drinks wine drugged in this way cannot shed a single tear all the rest of the day, not even though his father an… |
| B04-P021 | **49** | 81 | “Menelaus, son of Atreus, and you my good friends, sons of honorable men (which is as Zeus wills, for he is the giver bo… |
| B04-P021 | **52** | 81 | When, however, I had washed and anointed him and had given him clothes, and after I had sworn a solemn oath not to betra… |
| B04-P022 | **57** | 57 | Diomed and I could not make up our minds whether to spring out then and there, or to answer you from inside, but Odysseu… |
| B04-P024 | **41** | 42 | At this Helen told the maidservants to set beds in the room that was in the gatehouse, and to make them with good red ru… |
| B04-P027 | **42** | 42 | I am being eaten out of house and home; my fair estate is being wasted, and my house is full of scoundrels who keep kill… |
| B04-P027 | **44** | 42 | So I come as a suppliant to your knees, in the hope that you may tell me about my father’s wretched end, whether you saw… |
| B04-P028 | **54** | 54 | A hind might as well lay her new born young in the lair of a lion, and then go off to feed in the forest or in some gras… |
| B04-P028 | **56** | 54 | By father Zeus, Athena, and Apollo, if Odysseus is still the man that he was when he wrestled with Philomeleides in Lesb… |
| B04-P029 | **49** | 66 | We should have run clean out of provisions and my men would have starved, if a goddess had not taken pity on me and save… |
| B04-P030 | **46** | 46 | “She came to me one day when I was by myself, as I often was, for the men used to go with their barbed hooks, all over t… |
| B04-P030 | **42** | 46 | ‘Stranger,’ she said, ‘it seems to me that you like starving in this way—at any rate it does not greatly trouble you, fo… |
| B04-P034 | **54** | 54 | As soon as he has come up he lies down, and goes to sleep in a great sea cave, where the seals—Halosydne’s chickens, as … |
| B04-P038 | **51** | 105 | “We waited the whole morning and made the best of it, watching the seals come up in hundreds to bask on the sea shore, t… |
| B04-P038 | **105** | 105 | Then we rushed on him with a shout and seized him; at that he began at once with his old tricks, and changed himself fir… |
| B04-P041 | **55** | 93 | But now tell me truly, whether all the Achaeans whom Nestor and I left behind us when we set sail from Troy have got hom… |
| B04-P042 | **43** | 44 | Ajax was wrecked, for Poseidon drove him onto the great rocks of Gyrae; nevertheless, he let him get safe out of the wat… |
| B04-P042 | **41** | 44 | He said the gods could not drown him even though they had tried to do so, and when Poseidon heard this big talk, he seiz… |
| B04-P043 | **58** | 58 | “‘Your brother and his ships escaped, for Hera protected him, but when he was just about to reach the high promontory of… |
| B04-P044 | **53** | 53 | He got him there, all unsuspicious of the doom that was awaiting him, and killed him when the banquet was over as though… |
| B04-P045 | **41** | 77 | Presently, when I had had my fill of weeping and writhing on the ground, the old man of the sea said, ‘Son of Atreus, do… |
| B04-P046 | **42** | 42 | “At this I took comfort in spite of all my sorrow, and said, ‘I know, then, about these two; tell me, therefore, about t… |
| B04-P047 | **40** | 49 | I can see him on an island sorrowing bitterly in the house of the nymph Calypso, who is keeping him prisoner, and he can… |
| B04-P047 | **48** | 49 | There fair-haired Rhadamanthus reigns, and men lead an easier life than anywhere else in the world, for in Elysium there… |
| B04-P048 | **43** | 43 | When Dawn, the rosy-fingered child of morning, appeared, we drew our ships into the water, and put our masts and sails w… |
| B04-P048 | **40** | 43 | When I had thus appeased heaven’s anger, I raised a mound to the memory of Agamemnon so that his name might live for eve… |
| B04-P050 | **42** | 74 | “Son of Atreus,” replied Telemachus, “do not press me to stay longer; I should be content to remain with you for another… |
| B04-P050 | **46** | 74 | I will take no horses back with me to Ithaca, but will leave them to adorn your own stables, for you have much flat grou… |
| B04-P054 | **45** | 45 | He has a ship of mine, and I want it, to cross over to Elis: I have twelve brood mares there with yearling mule foals by… |
| B04-P058 | **44** | 44 | Find me a ship, therefore, with a crew of twenty men, and I will lie in wait for him in the straits between Ithaca and S… |
| B04-P060 | **45** | 45 | Kings may say things sometimes, and they may take a fancy to one man and dislike another, but Odysseus never did an unju… |
| B04-P063 | **41** | 41 | “I do not know,” answered Medon, “whether some god set him on to it, or whether he went on his own impulse to see if he … |
| B04-P065 | **50** | 50 | First I lost my brave and lion-hearted husband, who had every good quality under heaven, and whose name was great over a… |
| B04-P065 | **42** | 50 | Tell him to go at once and tell everything to Laertes, who may be able to hit on some plan for enlisting public sympathy… |
| B04-P066 | **44** | 62 | But he made me take my solemn oath that I would not tell you anything for some ten or twelve days, unless you asked or h… |
| B04-P066 | **44** | 62 | Besides, I cannot think that the gods hate the race of the son of Arceisius so much, but there will be a son left to com… |
| B04-P072 | **62** | 62 | He then chose twenty men, and they went down to their ship and to the seaside; they drew the vessel into the water and g… |
| B04-P074 | **43** | 43 | She told the vision to go to the house of Odysseus, and to make Penelope leave off crying, so it came into her room by t… |
| B04-P076 | **58** | 61 | I, who have lost my brave and lion-hearted husband, who had every good quality under heaven, and whose name was great ov… |
| B04-P076 | **62** | 61 | I am even more anxious about him than about my husband; I am all in a tremble when I think of him, for fear something sh… |
| B04-P077 | **41** | 41 | There is one gone with him whom many a man would be glad enough to have stand by his side, I mean Athena; it is she who … |

## 7. Displaced runs — the strict clause-movement witness

A run of four or more consecutive Butler tokens, occurring exactly
once on each side, surviving verbatim outside the monotone
alignment. MOVE-GAP is an upper bound; this is the lower one.

**None.**


## 8. Paragraphs near-identical to Butler (40+ words, ≤4 edits)

| paragraph | source words | edits | longest sentence |
|---|---|---|---|
| B04-P002 | 47 | 4 | 31 words |
| B04-P007 | 54 | 2 | 32 words |
| B04-P008 | 101 | 2 | 46 words |
| B04-P012 | 89 | 2 | 58 words |
| B04-P013 | 67 | 2 | 30 words |
| B04-P030 | 89 | 2 | 46 words |
| B04-P031 | 72 | 2 | 37 words |
| B04-P035 | 161 | 3 | 38 words |
| B04-P039 | 80 | 0 | 39 words |
| B04-P040 | 81 | 2 | 39 words |
| B04-P042 | 204 | 3 | 43 words |
| B04-P046 | 56 | 1 | 42 words |
| B04-P049 | 63 | 2 | 30 words |
| B04-P052 | 41 | 4 | 28 words |
| B04-P053 | 58 | 2 | 30 words |
| B04-P054 | 57 | 0 | 45 words |
| B04-P055 | 100 | 1 | 27 words |
| B04-P056 | 87 | 3 | 31 words |
| B04-P057 | 57 | 0 | 17 words |
| B04-P058 | 98 | 0 | 44 words |
| B04-P061 | 51 | 0 | 27 words |
| B04-P062 | 73 | 2 | 25 words |
| B04-P063 | 41 | 0 | 41 words |
| B04-P064 | 75 | 2 | 34 words |
| B04-P066 | 185 | 0 | 44 words |
| B04-P067 | 44 | 0 | 17 words |
| B04-P068 | 46 | 3 | 35 words |
| B04-P074 | 73 | 2 | 43 words |
| B04-P076 | 174 | 2 | 62 words |
| B04-P081 | 59 | 1 | 34 words |

## 9. One Butler word rendered two ways (per Book, Butler-keyed)

**104 rows.** This report's declared limits, which records finding
**R-5** is about: it keys on Butler's side only and runs inside one
Book, so it cannot see one *rendering* made to carry two Butler
words, and it cannot compare a word's renderings across Books. Both
arrows, across all Books, are `scripts/rendering_collisions.py`.

| Butler word | times changed | times kept | kept at (first six) |
|---|---|---|---|
| `a` | 2 | 126 | P001, P001, P002, P004, P004, P005 |
| `about` | 2 | 26 | P001, P002, P009, P009, P010, P013 |
| `all` | 3 | 74 | P009, P009, P009, P009, P009, P009 |
| `also` | 2 | 10 | P001, P009, P031, P032, P034, P039 |
| `always` | 1 | 2 | P015, P044 |
| `am` | 1 | 10 | P008, P015, P017, P017, P027, P031 |
| `an` | 2 | 13 | P009, P018, P020, P024, P025, P029 |
| `and` | 4 | 326 | P001, P001, P001, P001, P001, P002 |
| `any` | 2 | 10 | P014, P027, P030, P038, P041, P045 |
| `as` | 4 | 67 | P001, P003, P003, P003, P007, P007 |
| `at` | 1 | 32 | P001, P003, P004, P009, P009, P009 |
| `be` | 4 | 19 | P004, P007, P009, P009, P018, P031 |
| `bear` | 1 | 3 | P027, P045, P068 |
| `beautiful` | 1 | 2 | P011, P049 |
| `being` | 1 | 4 | P009, P027, P027, P039 |
| `best` | 1 | 3 | P034, P038, P056 |
| `broken` | 2 | 1 | P054 |
| `business` | 1 | 2 | P060, P062 |
| `by` | 3 | 33 | P009, P011, P014, P017, P020, P022 |
| `conversation` | 1 | 2 | P050, P079 |
| `course` | 2 | 2 | P004, P051 |
| `dawn` | 3 | 1 | P016 |
| `did` | 5 | 15 | P009, P016, P021, P024, P027, P044 |
| `done` | 1 | 5 | P021, P038, P040, P041, P075 |
| `either` | 1 | 5 | P012, P021, P041, P076, P081 |
| `every` | 2 | 6 | P021, P032, P035, P065, P073, P076 |
| `fetched` | 1 | 2 | P011, P037 |
| `fleet` | 1 | 2 | P009, P034 |
| `for` | 2 | 94 | P001, P001, P005, P007, P007, P009 |
| `get` | 1 | 11 | P009, P029, P030, P035, P039, P040 |
| `go` | 1 | 16 | P028, P030, P034, P035, P035, P035 |
| `gold` | 1 | 5 | P008, P011, P011, P044, P051 |
| `had` | 1 | 53 | P001, P001, P001, P005, P006, P008 |
| `have` | 1 | 57 | P004, P004, P007, P007, P007, P009 |
| `he` | 2 | 144 | P001, P001, P001, P001, P001, P003 |
| `hearted` | 2 | 2 | P065, P076 |
| `heaven` | 1 | 15 | P001, P004, P015, P015, P018, P031 |
| `her` | 2 | 37 | P001, P001, P011, P011, P011, P011 |
| `him` | 1 | 89 | P001, P001, P001, P003, P005, P008 |
| `himself` | 1 | 7 | P021, P021, P035, P038, P038, P042 |
| `his` | 1 | 97 | P001, P001, P001, P001, P001, P001 |
| `i` | 2 | 139 | P004, P007, P008, P009, P009, P009 |
| `if` | 1 | 16 | P017, P027, P027, P028, P028, P029 |
| `in` | 5 | 115 | P001, P001, P002, P002, P004, P004 |
| `indeed` | 1 | 2 | P012, P021 |
| `living` | 1 | 1 | P009 |
| `man` | 2 | 31 | P002, P008, P009, P009, P012, P012 |
| `manner` | 1 | 1 | P045 |
| `may` | 1 | 24 | P004, P004, P009, P009, P009, P009 |
| `me` | 1 | 64 | P009, P014, P015, P017, P021, P021 |
| `means` | 2 | 1 | P017 |
| `mid` | 1 | 1 | P081 |
| `mind` | 1 | 2 | P027, P068 |
| `minds` | 1 | 1 | P022 |
| `no` | 1 | 23 | P001, P008, P009, P009, P009, P014 |
| `noemon` | 1 | 2 | P053, P057 |
| `not` | 4 | 37 | P007, P009, P017, P020, P021, P022 |
| `of` | 5 | 216 | P001, P001, P001, P001, P001, P001 |
| `offered` | 1 | 2 | P040, P048 |
| `on` | 6 | 49 | P008, P009, P009, P011, P012, P013 |
| `one` | 3 | 32 | P008, P009, P009, P009, P009, P009 |
| `our` | 1 | 15 | P017, P017, P018, P018, P022, P022 |
| `perished` | 1 | 1 | P042 |
| `person` | 2 | 1 | P029 |
| `pleased` | 1 | 1 | P065 |
| `regards` | 1 | 1 | P028 |
| `room` | 1 | 8 | P011, P024, P024, P025, P060, P064 |
| `saying` | 1 | 5 | P007, P012, P013, P022, P074 |
| `sea` | 2 | 27 | P026, P028, P029, P029, P031, P032 |
| `servant` | 3 | 2 | P003, P006 |
| `servants` | 1 | 5 | P005, P006, P019, P020, P072 |
| `shall` | 1 | 6 | P003, P007, P012, P040, P047, P079 |
| `she` | 5 | 27 | P001, P020, P020, P029, P030, P036 |
| `should` | 1 | 10 | P015, P015, P015, P015, P029, P037 |
| `side` | 4 | 9 | P011, P024, P044, P044, P054, P065 |
| `so` | 4 | 40 | P001, P002, P005, P008, P008, P009 |
| `stayed` | 1 | 1 | P009 |
| `tell` | 1 | 31 | P003, P003, P021, P026, P027, P027 |
| `that` | 4 | 73 | P001, P004, P004, P005, P008, P008 |
| `the` | 2 | 317 | P001, P001, P001, P001, P001, P001 |
| `their` | 1 | 28 | P003, P003, P004, P005, P005, P006 |
| `them` | 2 | 55 | P002, P002, P003, P003, P005, P005 |
| `there` | 1 | 29 | P002, P003, P009, P009, P014, P017 |
| `therefore` | 2 | 5 | P018, P031, P034, P046, P058 |
| `things` | 1 | 6 | P006, P008, P017, P019, P027, P060 |
| `this` | 1 | 41 | P001, P008, P009, P009, P010, P011 |
| `thus` | 10 | 1 | P048 |
| `to` | 8 | 200 | P001, P001, P001, P001, P001, P002 |
| `true` | 1 | 1 | P022 |
| `two` | 1 | 12 | P002, P003, P006, P011, P011, P022 |
| `up` | 1 | 17 | P002, P003, P022, P022, P034, P034 |
| `upon` | 14 | 4 | P022, P035, P041, P045 |
| `valiant` | 1 | 2 | P001, P018 |
| `was` | 1 | 79 | P001, P001, P001, P001, P001, P001 |
| `were` | 1 | 33 | P001, P002, P005, P008, P009, P017 |
| `what` | 1 | 29 | P003, P009, P010, P012, P012, P021 |
| `when` | 1 | 53 | P002, P005, P005, P006, P007, P010 |
| `where` | 1 | 12 | P001, P004, P009, P020, P034, P036 |
| `which` | 3 | 20 | P008, P011, P011, P021, P024, P029 |
| `will` | 1 | 43 | P017, P018, P021, P028, P028, P028 |
| `with` | 1 | 70 | P001, P001, P005, P006, P008, P009 |
| `within` | 1 | 4 | P022, P048, P060, P062 |
| `would` | 1 | 14 | P017, P028, P028, P029, P037, P037 |
| `yet` | 2 | 6 | P009, P012, P045, P054, P056, P075 |

## 10. Cross-Book compound drift

`scripts/compound_drift.py`, keyed on separator-stripped letters so
closed, hyphenated and open settings of one compound collide.

Result over book01, book02, book03, book04, book05, book06, book07, book08, book09: **lowlying (attributive) {'hyphenated': ['book04', 'book05'], 'open': ['book04-v2']}; seashore {'closed': ['book02', 'book03', 'book04', 'book05', 'book08', 'book09'], 'open': ['book04-v2']}; welldisposed {'hyphenated': ['book04'], 'open': ['book04-v2']}**.

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
head. **48 pairs.**

> `after day` · `best men` · `brave man` · `chief men` · `either man` · `either side` · `end wall` · `fair fields` · `flashed fire` · `gray sea` · `great sea` · `head man` · `hiding place` · `honorable men` · `inner room` · `let water` · `like sea` · `little way` · `long sea` · `long time` · `long way` · `lost hold` · `mortal man` · `mortal men` · `old man` · `open fields` · `open sea` · `opposite side` · `outer court` · `perfumed room` · `pisistratus man` · `poured water` · `precious piece` · `running water` · `salt water` · `sea shore` · `set beds` · `short work` · `silver work` · `third man` · `till night` · `trojan women` · `twelve days` · `twenty days` · `twenty men` · `worst man` · `young man` · `young men`

