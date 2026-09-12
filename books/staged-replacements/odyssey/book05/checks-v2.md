# Book 5 — the checks this round adds

Written by `scripts/build_book05_v2.py`.

## 1. The semicolon count beside the splitting rate (R-6, D19)

Round 1's substantive finding was that Book 5 v1's splitting rate was bought with semicolons: a semicolon rewritten as a period adds a sentence, moves no clause, drops no word and costs no retention, so it scores at full value on both of D17's axes. The package did not compute the number that shows it.

| corpus | sentences src → cand | % added | 60+ src → cand | semicolons src → cand |
|---|---|---|---|---|
| accepted Book 1 | 132 → 159 | +20.5% | 10 → 0 | 47 → 13 |
| accepted Book 2 | 137 → 159 | +16.1% | 7 → 4 | 36 → 21 |
| accepted Book 3 | 164 → 173 | +5.5% | 9 → 6 | 39 → 32 |
| accepted Book 4 | 281 → 306 | +8.9% | 17 → 3 | 68 → 50 |
| Book 5 **v1** | 153 → 189 | +23.5% | 9 → 3 | 34 → 12 |
| **Book 5 v2** | **153 → 189** | **+23.5%** | **9 → 1** | **34 → 13** |

Read the last column as the denominator D17 is missing: at most **21** of Book 5 v2's +36 added sentences are a semicolon conversion, and the rest are real division.

## 2. Cross-Book compound drift, closed against open (ruling 1)

`scripts/compound_drift.py`. The package's `hyphen_drift()` compared *hyphenated in one Book* against *open in another* and was blind to *closed against open*. The extension keys each compound on its letters with the separator stripped and fails on any key carrying more than one setting across the Books. It is what makes the `seashore` ruling cost three successors rather than pass silently.

Result over this Book and the accepted Books: **no drift**.

## 3. One Butler word rendered two ways

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

## 4. Paragraphs near-identical to Butler (R-7)

Round 1's R-7: this report was computed and then not published, and `review-instructions.md` quoted three paragraphs it does **not** flag. It is published here and in `continuity.md` §11.

| paragraph | source words | edits | longest sentence |
|---|---|---|---|
| B05-P001 | 60 | 4 | 33 words |
| B05-P003 | 59 | 3 | 29 words |
| B05-P013 | 108 | 1 | 39 words |
| B05-P015 | 97 | 3 | 50 words |
| B05-P016 | 92 | 3 | 35 words |
| B05-P018 | 90 | 1 | 21 words |
| B05-P029 | 51 | 2 | 51 words |

## 5. Per-paragraph word counts

`book05/word-counts-v2.json` stores the 37 source and 37 candidate word counts.
