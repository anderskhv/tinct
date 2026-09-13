# Odyssey Book 8 — checks, candidate v1

Written by `scripts/checks.py`, which is the only thing that computes
these numbers. Before it existed, **none of the package's checks was
executed for a new Book by anything in the repository** — substantive
finding **S-2** of `book06/review/findings-v1.md`. Every figure below
is reproducible by running `python3 scripts/checks.py 8`.

**Subject:** `book08/candidate-v1.json`, sha256 `e758790c58e0ace5c97159b2fa4e6d0f987f0b0edeba9120542ed772ec6ce012`.

**Basis — records finding R-1.** all 50 paragraphs. A figure without the paragraph
set it is computed over is not a figure, and the package published
one for three Books.

## 1. Verdict

**All gates pass.**


## 2. The figures

| measure | value |
|---|---|
| paragraphs scored | 50 |
| word ratio | 0.99213 |
| Butler token retention (canonical, aggregate-join) | **0.93844** |
| order retention (per paragraph, for MOVE-GAP) | 0.93844 |
| bag retention (order-blind) | 0.94536 |
| **MOVE-GAP** (bag − order), D20 | **0.00692** |
| sentences, source → candidate | 192 → 244 |
| **splitting rate** (D17, raw) | **+27.1%** |
| semicolon-normalized sentences | 234 → 244 |
| NORM RATE as published (D20) | +4.3% |
| semicolon-normalized, on Butler's pointing | 234 → 244 |
| **NORM RATE on Butler's own pointing** (D20, S-1) | **+4.3%** |
| sixty-word sentences | 11 → 0 (100% broken) |
| **semicolons, Butler → candidate** (D19) | **42 → 0** |
| **of which KEPT of Butler's / ADDED by the draft** (S-1) | **0 kept + 0 added** |

Of the +52 sentences added, at most **42** are a semicolon
rewritten as a period — the operation that adds a sentence, moves no
clause, drops no word and costs no retention. That is what NORM RATE
prices out, and why **D19 is a rate and not a count** (D20).

**And the mirror operation, which is the one D20 never priced.**
Substantive finding **S-1** of Book 7's round 1: a comma raised to a
semicolon adds nothing to the sentence count, adds one to the
candidate's semicolon count, and therefore scores under D20 exactly
what a real period scores — while leaving the clause chain inside one
sentence. A period costs a recast; a semicolon costs a keystroke.
**0 of this candidate's 0 semicolons are its own**, and the figure
that is COMPARED from Book 7 forward is **NORM RATE on Butler's own
pointing**, +4.3% here against the +4.3% the unsplit measure gives.

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
| Book 7 | all 29 paragraphs | 0.93438 | 103 → 138 | +34.0% | 7 → 0 | 30 → 7 | +9.0% | 0.01217 |
| Book 8 v1 — **this candidate** | all 50 paragraphs | 0.93844 | 192 → 244 | +27.1% | 11 → 0 | 42 → 0 | +4.3% | 0.00692 |

Book 3's row is the reason this column exists. Its published figures
are computed on **37 of its 38 paragraphs** — B03-P038, the **D14**
splice — and nothing said so until now. On all 38 the same measures
give 0.86053 and 176 → 174 (−1.1%), and the D17 floor derived from
them would be **negative**, which is to say the gate would be
vacuous. The exclusion is right; its silence was not.

## 4. D17's gate

Floor **+2.7%**, half accepted Book 3's +5.5% — computed from
the accepted files on each Book's own basis, never re-pasted from
prose. This candidate: **+27.1%**. Sixty-word survival gate:
0 of 11 survive, and the gate fails above 8.25.

## 5. The growth gate, aligned sentence to sentence (D20)

D19's gate as built compared each paragraph's **longest** candidate
sentence with its source paragraph's **longest** — a maximum against
a maximum. A draft that divides a paragraph's longest sentence lowers
the new maximum and can then grow a *different* sentence past the old
one's length with the gate reporting nothing. Division bought cover
for growth. Sentences are now aligned by best token overlap; 50 words
remains the failure; growth is reported from 40.


Sentences grown to 40 words or more: **3**.

| paragraph | source sentence | candidate sentence |
|---|---|---|
| B08-P018 | 45 words | 46 words |
| B08-P021 | 48 words | 49 words |
| B08-P042 | 48 words | 49 words |

## 6. Every candidate sentence over 40 words (absolute)

Blind spot 2 of `findings-v1.md` §9, which had no carrier: *a
sentence left long because it **is** long in Butler.* Every other
length check in the package is relative to the source, so a 43-word
four-limb chain that Butler also wrote at 43 words passes all of
them — which is how B06-P016 and B06-P018 reached a review
untouched. This report is absolute.

**22 sentences.**

| paragraph | words | source paragraph's longest | sentence |
|---|---|---|---|
| B08-P001 | **44** | 50 | She went up to the citizens one by one and said, “Aldermen and town councilors of the Phaeacians, come to the assembly, … |
| B08-P002 | **58** | 59 | Everyone was struck by the appearance of Odysseus, for Athena had beautified him about the head and shoulders, making hi… |
| B08-P004 | **54** | 54 | The fifty-two picked oarsmen went to the seashore as they had been told, and when they got there they drew the ship into… |
| B08-P006 | **49** | 75 | The company then laid their hands on the good things that were before them, but as soon as they had had enough to eat an… |
| B08-P011 | **52** | 53 | When Laodamas heard this he made his way into the middle of the crowd and said to Odysseus, “I hope, sir, that you will … |
| B08-P016 | **46** | 57 | I far excel everyone else in the whole world, of those who still eat bread upon the face of the earth, but I should not … |
| B08-P017 | **40** | 72 | I hope you will take my meaning, and will explain to any of your chief men who may be dining with you and your family wh… |
| B08-P017 | **43** | 72 | So now, please, let those of you who are the best dancers set about dancing, so that our guest on his return home may be… |
| B08-P018 | **46** | 45 | Presently the servant came back with Demodocus’s lyre, and the bard took his place in the middle of them, whereupon the … |
| B08-P019 | **46** | 47 | Hephaestus was very angry when he heard such dreadful news, so he went to his smithy brooding mischief, got his great an… |
| B08-P019 | **40** | 47 | As soon as he had spread the chains all over the bed, he made as though he were setting out for the fair state of Lemnos… |
| B08-P021 | **49** | 48 | She was nothing loath, so they went to the couch to take their rest, and there they were caught in the toils that cunnin… |
| B08-P030 | **40** | 40 | Then he loosed the bonds that bound them, and as soon as they were free they scampered off, Ares to Thrace and laughter-… |
| B08-P032 | **43** | 48 | So they took a red ball that Polybus had made for them, and one of them bent himself backward and threw it up toward the… |
| B08-P032 | **47** | 48 | When they had done throwing the ball straight up into the air they began to dance, and at the same time kept throwing it… |
| B08-P042 | **49** | 48 | He was very glad of a warm bath, for he had had no one to wait on him ever since he left the house of Calypso, who for a… |
| B08-P044 | **40** | 74 | Then Odysseus cut off a piece of roast pork with plenty of fat on it—for there was abundance left on the joint—and said … |
| B08-P045 | **42** | 44 | They then laid their hands on the good things that were before them, and as soon as they had had enough to eat and drink… |
| B08-P045 | **42** | 44 | Now, however, change your song and tell us of the wooden horse that Epeus made with the help of Athena, and that Odysseu… |
| B08-P046 | **41** | 47 | The bard, inspired of heaven, took up the story at the point where some of the Argives set fire to their tents and saile… |
| B08-P047 | **49** | 80 | She screams aloud and flings her arms about him as he lies gasping for breath and dying, but her enemies beat her from b… |
| B08-P049 | **42** | 74 | They know all the cities and countries in the whole world, and can cross the sea just as well even when it is covered wi… |

## 7. Displaced runs — the strict clause-movement witness

A run of four or more consecutive Butler tokens, occurring exactly
once on each side, surviving verbatim outside the monotone
alignment. MOVE-GAP is an upper bound; this is the lower one.

**None.**


## 8. Paragraphs near-identical to Butler (40+ words, ≤4 edits)

| paragraph | source words | edits | longest sentence |
|---|---|---|---|
| B08-P013 | 68 | 2 | 30 words |
| B08-P022 | 150 | 4 | 29 words |
| B08-P026 | 40 | 2 | 39 words |
| B08-P027 | 54 | 2 | 28 words |
| B08-P034 | 114 | 3 | 26 words |
| B08-P036 | 58 | 0 | 38 words |
| B08-P043 | 41 | 0 | 22 words |

## 9. One Butler word rendered two ways (per Book, Butler-keyed)

**109 rows.** This report's declared limits, which records finding
**R-5** is about: it keys on Butler's side only and runs inside one
Book, so it cannot see one *rendering* made to carry two Butler
words, and it cannot compare a word's renderings across Books. Both
arrows, across all Books, are `scripts/rendering_collisions.py`.

| Butler word | times changed | times kept | kept at (first six) |
|---|---|---|---|
| `a` | 2 | 102 | P001, P001, P002, P003, P003, P003 |
| `alike` | 1 | 2 | P014, P048 |
| `all` | 3 | 47 | P001, P002, P004, P004, P006, P007 |
| `also` | 2 | 8 | P005, P008, P017, P019, P035, P039 |
| `am` | 1 | 12 | P003, P003, P014, P016, P016, P016 |
| `and` | 7 | 227 | P001, P001, P001, P001, P001, P001 |
| `any` | 6 | 11 | P009, P011, P013, P015, P015, P016 |
| `appearance` | 1 | 1 | P002 |
| `as` | 4 | 71 | P002, P003, P003, P004, P004, P006 |
| `bed` | 1 | 3 | P019, P019, P022 |
| `been` | 1 | 16 | P003, P004, P009, P012, P015, P016 |
| `being` | 1 | 2 | P049, P049 |
| `better` | 1 | 1 | P016 |
| `bond` | 1 | 1 | P028 |
| `both` | 1 | 7 | P001, P004, P005, P007, P014, P031 |
| `but` | 1 | 29 | P005, P006, P006, P007, P007, P009 |
| `by` | 4 | 16 | P001, P001, P003, P006, P009, P009 |
| `came` | 1 | 10 | P004, P009, P009, P015, P016, P018 |
| `did` | 2 | 3 | P015, P047, P050 |
| `do` | 1 | 16 | P012, P014, P016, P016, P022, P022 |
| `done` | 2 | 3 | P003, P032, P042 |
| `down` | 1 | 7 | P001, P016, P016, P019, P020, P032 |
| `due` | 1 | 1 | P004 |
| `either` | 1 | 1 | P003 |
| `euryalus` | 1 | 5 | P008, P009, P013, P034, P035 |
| `even` | 1 | 6 | P015, P016, P019, P047, P048, P049 |
| `every` | 4 | 2 | P016, P037 |
| `fifty` | 1 | 1 | P004 |
| `fond` | 1 | 2 | P017, P022 |
| `for` | 3 | 68 | P002, P003, P003, P003, P003, P003 |
| `from` | 2 | 23 | P003, P004, P005, P007, P009, P015 |
| `further` | 1 | 1 | P007 |
| `got` | 1 | 5 | P001, P004, P004, P019, P045 |
| `have` | 2 | 36 | P003, P003, P003, P003, P007, P011 |
| `having` | 1 | 2 | P042, P049 |
| `he` | 5 | 98 | P001, P002, P002, P003, P003, P003 |
| `hephaestus` | 1 | 13 | P019, P019, P019, P019, P020, P021 |
| `here` | 2 | 3 | P006, P009, P022 |
| `hermes` | 1 | 3 | P023, P025, P025 |
| `his` | 2 | 68 | P003, P003, P003, P005, P005, P005 |
| `how` | 1 | 14 | P007, P016, P016, P017, P017, P019 |
| `i` | 2 | 63 | P003, P003, P003, P003, P011, P012 |
| `in` | 4 | 72 | P002, P003, P003, P003, P004, P004 |
| `inside` | 1 | 2 | P004, P020 |
| `is` | 4 | 39 | P003, P009, P009, P009, P011, P011 |
| `it` | 1 | 52 | P005, P005, P009, P010, P014, P015 |
| `its` | 1 | 3 | P008, P015, P019 |
| `left` | 1 | 5 | P009, P017, P042, P042, P044 |
| `look` | 1 | 3 | P002, P022, P026 |
| `make` | 2 | 5 | P014, P015, P016, P034, P040 |
| `man` | 2 | 16 | P002, P003, P008, P009, P009, P011 |
| `matter` | 1 | 7 | P003, P006, P016, P016, P049, P049 |
| `may` | 1 | 19 | P003, P003, P007, P014, P014, P015 |
| `more` | 2 | 6 | P015, P016, P045, P048, P049, P049 |
| `most` | 1 | 2 | P030, P046 |
| `much` | 2 | 11 | P009, P011, P013, P014, P015, P017 |
| `no` | 2 | 18 | P003, P003, P003, P007, P009, P014 |
| `nor` | 1 | 5 | P009, P017, P021, P022, P049 |
| `now` | 1 | 9 | P007, P011, P012, P014, P017, P020 |
| `odysseus` | 1 | 24 | P001, P001, P002, P006, P007, P007 |
| `of` | 7 | 143 | P001, P001, P001, P001, P001, P001 |
| `off` | 1 | 11 | P001, P002, P007, P015, P018, P019 |
| `on` | 6 | 27 | P001, P003, P005, P006, P007, P008 |
| `one` | 13 | 28 | P001, P003, P003, P003, P006, P006 |
| `out` | 2 | 9 | P004, P008, P009, P014, P016, P019 |
| `post` | 1 | 1 | P009 |
| `regards` | 1 | 1 | P016 |
| `return` | 1 | 6 | P007, P011, P017, P036, P045, P050 |
| `room` | 1 | 2 | P002, P040 |
| `rose` | 1 | 1 | P001 |
| `run` | 1 | 1 | P016 |
| `said` | 2 | 23 | P001, P003, P009, P011, P013, P015 |
| `sea` | 1 | 5 | P003, P009, P014, P016, P049 |
| `she` | 2 | 12 | P001, P002, P005, P005, P005, P021 |
| `should` | 1 | 5 | P016, P028, P041, P046, P048 |
| `side` | 1 | 2 | P001, P001 |
| `singing` | 1 | 1 | P039 |
| `sitting` | 1 | 3 | P007, P042, P047 |
| `so` | 1 | 33 | P004, P005, P007, P007, P011, P014 |
| `some` | 6 | 7 | P016, P017, P039, P046, P046, P050 |
| `speak` | 1 | 3 | P003, P010, P016 |
| `that` | 12 | 48 | P002, P003, P006, P006, P006, P007 |
| `the` | 2 | 311 | P001, P001, P001, P001, P001, P001 |
| `their` | 1 | 22 | P006, P013, P017, P018, P018, P019 |
| `them` | 2 | 25 | P002, P004, P006, P008, P009, P011 |
| `then` | 2 | 22 | P002, P003, P004, P004, P006, P006 |
| `therefore` | 4 | 1 | P049 |
| `they` | 1 | 54 | P001, P001, P002, P002, P002, P004 |
| `this` | 2 | 23 | P003, P006, P011, P012, P014, P014 |
| `though` | 1 | 4 | P019, P026, P042, P048 |
| `throwing` | 1 | 3 | P009, P032, P032 |
| `time` | 1 | 1 | P032 |
| `to` | 5 | 128 | P001, P001, P001, P001, P001, P001 |
| `together` | 1 | 2 | P006, P022 |
| `true` | 1 | 1 | P014 |
| `under` | 1 | 4 | P016, P045, P045, P049 |
| `up` | 1 | 11 | P001, P010, P014, P015, P016, P021 |
| `upon` | 4 | 2 | P006, P016 |
| `used` | 1 | 2 | P049, P049 |
| `was` | 1 | 53 | P001, P002, P002, P005, P005, P006 |
| `way` | 2 | 10 | P001, P003, P003, P004, P004, P008 |
| `were` | 3 | 27 | P002, P004, P006, P008, P008, P016 |
| `what` | 1 | 7 | P019, P021, P028, P046, P049, P049 |
| `which` | 10 | 17 | P001, P002, P005, P008, P016, P016 |
| `while` | 1 | 7 | P001, P004, P009, P032, P032, P046 |
| `whom` | 1 | 2 | P005, P005 |
| `with` | 3 | 56 | P002, P003, P004, P004, P005, P005 |
| `yet` | 1 | 4 | P003, P003, P015, P017 |
| `yourself` | 1 | 4 | P010, P011, P041, P045 |

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
head. **28 pairs.**

> `bad man` · `bath water` · `best man` · `blind man` · `chief men` · `clear fire` · `down side` · `fallow field` · `from land` · `good beds` · `little way` · `long way` · `looking man` · `marriage bed` · `nine men` · `oechalian men` · `phaeacian place` · `polished stone` · `proper man` · `remarkable man` · `set fire` · `standing room` · `starting post` · `stone floor` · `trojan place` · `weary sea` · `whole time` · `young men`

