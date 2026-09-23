# Odyssey Book 2 — checks, candidate v6

Written by `scripts/checks.py`, which is the only thing that computes
these numbers. Before it existed, **none of the package's checks was
executed for a new Book by anything in the repository** — substantive
finding **S-2** of `book06/review/findings-v1.md`. Every figure below
is reproducible by running `python3 scripts/checks.py 2`.

**Subject:** `book02/candidate-v6.json`, sha256 `a6fb810374a9d378559234ae71d85ff7deec96884b7823c2c54b3473a23798ba`.

**Basis — records finding R-1.** all 35 paragraphs. A figure without the paragraph
set it is computed over is not a figure, and the package published
one for three Books.

## 1. Verdict

**All gates pass.**


## 2. The figures

| measure | value |
|---|---|
| paragraphs scored | 35 |
| word ratio | 0.99952 |
| Butler token retention (canonical, aggregate-join) | **0.90019** |
| order retention (per paragraph, for MOVE-GAP) | 0.90019 |
| bag retention (order-blind) | 0.91651 |
| **MOVE-GAP** (bag − order), D20 | **0.01632** |
| sentences, source → candidate | 137 → 159 |
| **splitting rate** (D17, raw) | **+16.1%** |
| semicolon-normalized sentences | 173 → 180 |
| NORM RATE as published (D20) | +4.0% |
| semicolon-normalized, on Butler's pointing | 173 → 175 |
| **NORM RATE on Butler's own pointing** (D20, S-1) | **+1.2%** |
| sixty-word sentences | 7 → 4 (43% broken) |
| **semicolons, Butler → candidate** (D19) | **36 → 21** |
| **of which KEPT of Butler's / ADDED by the draft** (S-1) | **16 kept + 5 added** |
| **dividing marks, Butler → candidate** (D27: `;` `:` sentence-internal `—`) | **58 → 61** |
| **of which KEPT / ADDED** (D27) | **36 kept + 25 added** |
| dividing-mark-normalized sentences | 195 → 220 |
| NORM RATE, every dividing mark (D27) | +12.8% |
| dividing-mark-normalized, on Butler's pointing | 195 → 195 |
| NORM RATE, dividing marks on Butler's pointing (D27+D21, the compared figure for Books 1-8) | +0.0% |
| **of which KEPT BY IDENTITY / CLASS-CHANGED / ADDED** (**D28**, Book 9 round 1 S-1) | **32 kept + 4 class-changed + 25 added** |
| dividing-mark-normalized, on Butler's pointing by identity | 195 → 191 |
| **NORM RATE, dividing marks on Butler's pointing BY MARK IDENTITY** — **the compared figure from Book 9 forward** (D28) | **-2.1%** |

**The class changes, named** (D28). A count that cannot be pointed at is what
S-1 is about: `41 kept + 0 added` was true of the count and false of the
claim it was published to support.

| ¶ | Butler | candidate | at |
|---|---|---|---|
| B02-P007 | `—` | `:` | …achaeans may understand it |
| B02-P010 | `;` | `:` | …prophesying without due knowledge |
| B02-P024 | `:` | `—` | …his property among us |
| B02-P028 | `;` | `—` | …gone and asks you |

Of the +22 sentences added, at most **15** are a semicolon
rewritten as a period — the operation that adds a sentence, moves no
clause, drops no word and costs no retention. That is what NORM RATE
prices out, and why **D19 is a rate and not a count** (D20).

**And the mirror operation, which is the one D20 never priced.**
Substantive finding **S-1** of Book 7's round 1: a comma raised to a
semicolon adds nothing to the sentence count, adds one to the
candidate's semicolon count, and therefore scores under D20 exactly
what a real period scores — while leaving the clause chain inside one
sentence. A period costs a recast; a semicolon costs a keystroke.
**5 of this candidate's 21 semicolons are its own**, and the figure
that is COMPARED from Book 7 forward is **NORM RATE on Butler's own
pointing**, +1.2% here against the +4.0% the unsplit measure gives.

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
| Book 2 v6 — **this candidate** | all 35 paragraphs | 0.90019 | 137 → 159 | +16.1% | 36 → 21 | 58 → 61 | 36 + 25 | +4.0% | **+0.0%** | 0.01632 |

Book 3's row is the reason this column exists. Its published figures
are computed on **37 of its 38 paragraphs** — B03-P038, the **D14**
splice — and nothing said so until now. On all 38 the same measures
give 0.86053 and 176 → 174 (−1.1%), and the D17 floor derived from
them would be **negative**, which is to say the gate would be
vacuous. The exclusion is right; its silence was not.

## 4. D17's gate

Floor **+2.7%**, half accepted Book 3's +5.5% — computed from
the accepted files on each Book's own basis, never re-pasted from
prose. This candidate: **+16.1%**. Sixty-word survival gate:
4 of 7 survive, and the gate fails above 5.25.

## 5. The growth gate, aligned sentence to sentence (D20)

D19's gate as built compared each paragraph's **longest** candidate
sentence with its source paragraph's **longest** — a maximum against
a maximum. A draft that divides a paragraph's longest sentence lowers
the new maximum and can then grow a *different* sentence past the old
one's length with the gate reporting nothing. Division bought cover
for growth. Sentences are now aligned by best token overlap; 50 words
remains the failure; growth is reported from 40.

**FAILURES:**

- B02-P019 49 → 50 words: But mind you never make common cause with any of those foolish suitors, for they have neither sense nor virtue, and they give no thought to death and to the doom that will shortly fall on one and all of them, so that they shall perish on the same day.
- B02-P028 57 → 58 words: “Do not be afraid, nurse,” Telemachus answered, “my plan is not without heaven’s sanction; but swear that you will say nothing about any of this to my mother until I have been away some ten or twelve days—unless she hears that I have gone and asks you—for I do not want her to spoil her beauty with crying.”

Sentences grown to 40 words or more: **3**.

| paragraph | source sentence | candidate sentence |
|---|---|---|
| B02-P009 | 38 words | 40 words |
| B02-P011 | 40 words | 41 words |
| B02-P031 | 40 words | 41 words |

## 6. Every candidate sentence of 40 words or more (absolute)

Blind spot 2 of `findings-v1.md` §9, which had no carrier: *a
sentence left long because it **is** long in Butler.* Every other
length check in the package is relative to the source, so a 43-word
four-limb chain that Butler also wrote at 43 words passes all of
them — which is how B06-P016 and B06-P018 reached a review
untouched. This report is absolute.

**23 sentences.**

| paragraph | words | source paragraph's longest | sentence |
|---|---|---|---|
| B02-P004 | **62** | 62 | They are afraid to go to her father Icarius and ask him to choose the one he likes best and to provide marriage gifts fo… |
| B02-P004 | **52** | 62 | I beg you, by Zeus and by Themis, who is the beginning and the end of councils: do not hold back, my friends, and leave … |
| B02-P004 | **54** | 62 | And if I am to be eaten out of house and home at all, I would rather you did the eating yourselves, for then I could tak… |
| B02-P006 | **44** | 48 | ‘Sweethearts,’ she said, ‘Odysseus is indeed dead, but do not press me to marry again just yet—wait, for I would not hav… |
| B02-P007 | **62** | 70 | She fooled us this way for three years and we never found her out; but as time wore on and she was now in her fourth yea… |
| B02-P007 | **63** | 70 | It was not fair of her to treat us in that way, and as long as she stays in the mind heaven has now given her, so long s… |
| B02-P008 | **41** | 49 | But if you choose instead to go on feeding off one man, heaven help me, but Zeus will settle the account with you in ful… |
| B02-P009 | **48** | 49 | When they were right over the middle of the assembly they wheeled and circled about, beating the air with their wings an… |
| B02-P009 | **40** | 49 | The people wondered as they watched them, and asked each other what all this might mean; and then Halitherses, who was t… |
| B02-P010 | **42** | 42 | Let the suitors do it of their own accord; it will be better for them, for I am not prophesying without due knowledge: e… |
| B02-P011 | **41** | 89 | Odysseus has died in a far country, and it is a pity you are not dead along with him instead of going on here about omen… |
| B02-P011 | **80** | 89 | But I tell you—and it will surely happen—when an old man like you, who should know better, talks a young one round until… |
| B02-P011 | **50** | 89 | We shall go back and go on eating up Telemachus’s estate without paying him, until such time as his mother stops torment… |
| B02-P014 | **53** | 82 | I hope you may never again have a kind and well-disposed ruler, nor one who will govern you fairly; I hope that all your… |
| B02-P014 | **42** | 82 | I am not half so angry with the suitors: if they choose to do violence in the wickedness of their hearts, and stake thei… |
| B02-P015 | **53** | 54 | Even if Odysseus himself were to set upon us while we were feasting in his house, and do his best to drive us out, his w… |
| B02-P015 | **53** | 54 | Now, then, the rest of you go about your business, and let his father’s old friends, Mentor and Halitherses, speed the b… |
| B02-P019 | **50** | 50 | But mind you never make common cause with any of those foolish suitors, for they have neither sense nor virtue, and they… |
| B02-P020 | **41** | 43 | Antinous came up to him at once and laughed as he took his hand in his own, saying, “Telemachus, my fine hothead, bear n… |
| B02-P027 | **45** | 67 | Your poor father is dead and gone in some foreign country, nobody knows where, and as soon as your back is turned these … |
| B02-P028 | **58** | 57 | “Do not be afraid, nurse,” Telemachus answered, “my plan is not without heaven’s sanction; but swear that you will say n… |
| B02-P029 | **40** | 40 | The old woman swore most solemnly that she would not, and when she had finished her oath she began drawing off the wine … |
| B02-P031 | **41** | 40 | She made their drink go to their heads, and made them drop their cups from their hands, so that instead of sitting over … |

## 7. Displaced runs — the strict clause-movement witness

A run of four or more consecutive Butler tokens, occurring exactly
once on each side, surviving verbatim outside the monotone
alignment. MOVE-GAP is an upper bound; this is the lower one.

**None.**


## 8. Paragraphs near-identical to Butler (40+ words, ≤4 edits)

| paragraph | source words | edits | longest sentence |
|---|---|---|---|
| B02-P023 | 52 | 3 | 23 words |
| B02-P024 | 57 | 3 | 36 words |
| B02-P029 | 40 | 1 | 40 words |

## 9. One Butler word rendered two ways (per Book, Butler-keyed)

**131 rows.** This report's declared limits, which records finding
**R-5** is about: it keys on Butler's side only and runs inside one
Book, so it cannot see one *rendering* made to carry two Butler
words, and it cannot compare a word's renderings across Books. Both
arrows, across all Books, are `scripts/rendering_collisions.py`.

| Butler word | times changed | times kept | kept at (first six) |
|---|---|---|---|
| `a` | 1 | 33 | P002, P004, P004, P004, P006, P006 |
| `about` | 3 | 15 | P004, P007, P008, P009, P011, P011 |
| `achaeans` | 1 | 3 | P007, P018, P020 |
| `after` | 1 | 7 | P010, P011, P011, P019, P025, P026 |
| `again` | 1 | 6 | P006, P007, P010, P012, P025, P026 |
| `against` | 1 | 6 | P004, P004, P004, P015, P025, P034 |
| `all` | 3 | 34 | P002, P004, P004, P004, P004, P005 |
| `and` | 2 | 170 | P001, P001, P001, P001, P002, P002 |
| `another` | 1 | 5 | P008, P009, P010, P012, P024 |
| `any` | 2 | 7 | P004, P004, P004, P011, P019, P021 |
| `anything` | 1 | 2 | P011, P026 |
| `are` | 3 | 19 | P004, P004, P011, P011, P014, P014 |
| `as` | 2 | 41 | P001, P004, P004, P004, P004, P004 |
| `be` | 7 | 21 | P004, P004, P004, P004, P008, P008 |
| `been` | 2 | 6 | P003, P006, P013, P013, P015, P028 |
| `besides` | 1 | 1 | P008 |
| `blood` | 1 | 2 | P015, P019 |
| `board` | 1 | 4 | P024, P032, P033, P034 |
| `both` | 1 | 2 | P007, P019 |
| `but` | 4 | 18 | P002, P005, P007, P007, P007, P008 |
| `by` | 3 | 11 | P001, P004, P004, P006, P007, P009 |
| `called` | 1 | 2 | P025, P031 |
| `can` | 1 | 12 | P004, P008, P011, P011, P012, P014 |
| `choice` | 1 | 1 | P007 |
| `dawn` | 1 | 1 | P035 |
| `day` | 2 | 6 | P003, P007, P011, P011, P019, P025 |
| `dear` | 1 | 2 | P026, P027 |
| `death` | 1 | 6 | P006, P009, P010, P019, P023, P026 |
| `do` | 3 | 18 | P004, P004, P006, P007, P007, P008 |
| `does` | 1 | 1 | P003 |
| `due` | 1 | 2 | P010, P011 |
| `each` | 1 | 4 | P009, P011, P030, P030 |
| `eat` | 1 | 3 | P014, P020, P021 |
| `elsewhere` | 1 | 1 | P008 |
| `every` | 1 | 2 | P004, P016 |
| `fear` | 1 | 2 | P004, P011 |
| `find` | 1 | 3 | P011, P019, P026 |
| `for` | 3 | 54 | P001, P001, P002, P002, P004, P004 |
| `from` | 2 | 11 | P003, P004, P004, P009, P023, P023 |
| `go` | 1 | 14 | P004, P007, P007, P011, P011, P011 |
| `got` | 1 | 5 | P003, P004, P004, P030, P033 |
| `had` | 2 | 12 | P002, P002, P002, P002, P004, P004 |
| `hand` | 1 | 6 | P001, P010, P012, P014, P020, P022 |
| `he` | 2 | 53 | P001, P001, P001, P001, P001, P002 |
| `hear` | 1 | 7 | P003, P010, P012, P012, P014, P018 |
| `hearts` | 1 | 1 | P014 |
| `her` | 3 | 33 | P004, P004, P006, P007, P007, P007 |
| `him` | 2 | 33 | P001, P001, P001, P001, P002, P002 |
| `himself` | 1 | 1 | P015 |
| `his` | 2 | 47 | P001, P001, P001, P001, P001, P001 |
| `house` | 1 | 15 | P004, P004, P004, P004, P004, P004 |
| `i` | 1 | 67 | P003, P003, P004, P004, P004, P004 |
| `in` | 8 | 59 | P001, P001, P002, P004, P004, P006 |
| `indeed` | 1 | 2 | P006, P010 |
| `it` | 1 | 27 | P003, P004, P004, P004, P006, P007 |
| `know` | 1 | 7 | P007, P007, P008, P010, P011, P012 |
| `leaves` | 1 | 1 | P008 |
| `make` | 2 | 4 | P007, P012, P019, P032 |
| `man` | 1 | 11 | P002, P004, P007, P008, P011, P011 |
| `marry` | 2 | 3 | P004, P006, P007 |
| `matter` | 1 | 2 | P003, P004 |
| `more` | 4 | 6 | P004, P011, P012, P015, P020, P021 |
| `much` | 1 | 8 | P004, P004, P007, P010, P010, P011 |
| `my` | 2 | 31 | P004, P004, P004, P004, P004, P004 |
| `neither` | 2 | 4 | P011, P019, P019, P021 |
| `no` | 1 | 15 | P003, P004, P004, P004, P005, P008 |
| `nor` | 2 | 9 | P004, P011, P014, P019, P019, P019 |
| `not` | 2 | 35 | P001, P002, P004, P004, P006, P006 |
| `nothing` | 1 | 4 | P008, P011, P026, P028 |
| `now` | 2 | 11 | P003, P004, P004, P007, P007, P010 |
| `of` | 9 | 101 | P001, P001, P002, P002, P002, P002 |
| `off` | 2 | 4 | P009, P026, P029, P032 |
| `on` | 5 | 35 | P001, P002, P004, P004, P004, P006 |
| `one` | 5 | 20 | P002, P004, P004, P005, P006, P007 |
| `only` | 1 | 3 | P008, P011, P011 |
| `other` | 2 | 8 | P003, P006, P007, P009, P011, P011 |
| `others` | 1 | 2 | P022, P034 |
| `over` | 1 | 8 | P002, P009, P009, P013, P019, P030 |
| `people` | 2 | 7 | P001, P001, P009, P012, P015, P021 |
| `prayed` | 1 | 1 | P017 |
| `return` | 3 | 1 | P026 |
| `room` | 2 | 3 | P001, P006, P025 |
| `round` | 1 | 2 | P019, P030 |
| `saying` | 3 | 2 | P015, P020 |
| `sea` | 1 | 1 | P019 |
| `sent` | 2 | 2 | P009, P034 |
| `servants` | 1 | 1 | P013 |
| `shall` | 4 | 9 | P004, P007, P011, P011, P011, P012 |
| `she` | 3 | 35 | P006, P006, P006, P006, P006, P007 |
| `should` | 3 | 7 | P007, P011, P011, P015, P024, P025 |
| `side` | 2 | 2 | P009, P009 |
| `so` | 5 | 16 | P003, P004, P007, P007, P007, P011 |
| `some` | 3 | 10 | P003, P003, P004, P004, P012, P019 |
| `speak` | 2 | 3 | P002, P010, P013 |
| `speech` | 1 | 1 | P004 |
| `spoke` | 1 | 6 | P009, P009, P020, P022, P027, P030 |
| `stay` | 1 | 2 | P015, P027 |
| `still` | 1 | 6 | P002, P002, P004, P005, P014, P019 |
| `store` | 2 | 1 | P025 |
| `such` | 1 | 10 | P001, P004, P004, P007, P011, P011 |
| `take` | 1 | 8 | P004, P008, P011, P012, P014, P019 |
| `telemachus` | 2 | 25 | P001, P004, P005, P006, P008, P011 |
| `that` | 6 | 26 | P001, P004, P006, P007, P007, P007 |
| `the` | 7 | 188 | P001, P001, P001, P001, P001, P002 |
| `them` | 5 | 19 | P004, P004, P009, P009, P009, P010 |
| `then` | 4 | 18 | P001, P003, P004, P006, P007, P009 |
| `these` | 1 | 6 | P004, P011, P013, P026, P027, P034 |
| `they` | 1 | 31 | P001, P001, P002, P004, P004, P004 |
| `things` | 1 | 2 | P026, P034 |
| `this` | 6 | 16 | P004, P005, P007, P007, P007, P008 |
| `though` | 1 | 2 | P014, P021 |
| `till` | 8 | 1 | P035 |
| `to` | 10 | 104 | P001, P001, P002, P002, P003, P003 |
| `too` | 1 | 1 | P025 |
| `two` | 1 | 3 | P001, P004, P009 |
| `up` | 1 | 12 | P002, P006, P007, P011, P012, P014 |
| `upon` | 10 | 1 | P015 |
| `waste` | 1 | 1 | P012 |
| `water` | 1 | 2 | P030, P034 |
| `way` | 1 | 11 | P001, P007, P007, P011, P012, P014 |
| `were` | 4 | 5 | P002, P009, P014, P015, P025 |
| `what` | 1 | 9 | P004, P006, P007, P007, P007, P009 |
| `whether` | 1 | 3 | P007, P008, P021 |
| `which` | 8 | 5 | P011, P014, P015, P019, P030 |
| `whom` | 1 | 1 | P011 |
| `will` | 3 | 43 | P003, P004, P004, P004, P006, P007 |
| `with` | 4 | 34 | P001, P002, P002, P004, P004, P005 |
| `words` | 1 | 2 | P013, P034 |
| `would` | 3 | 11 | P004, P004, P004, P006, P007, P008 |
| `yet` | 2 | 1 | P007 |
| `you` | 2 | 74 | P004, P004, P004, P004, P004, P004 |

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
head. **29 pairs.**

> `after day` · `artful woman` · `barren sea` · `blue water` · `board ship` · `cannot hold` · `catch hold` · `chief men` · `enormous piece` · `everything night` · `excellent man` · `famous women` · `from house` · `good men` · `house day` · `ilius land` · `made doors` · `made way` · `neither ship` · `old man` · `old woman` · `once hold` · `outer court` · `poor man` · `sailing side` · `twelve days` · `twenty men` · `wicked men` · `young man`

