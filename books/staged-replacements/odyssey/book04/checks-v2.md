# Book 4 — the checks this round adds

Written by `scripts/build_book04_v2.py`. Round 1's section M listed six classes the package's own checks could not catch. Three of them are now measured here; the rest are rules, in `PUNCTUATION.md` and `GLOSSARY.md`.

## 1. Sentence counting and the splitting rate (M-1)

| corpus | sentences src → cand | % added | 60+ word src → cand | % broken |
|---|---|---|---|---|
| accepted Book 1 | 132 → 159 | +20.5% | 10 → 0 | 100% |
| accepted Book 2 | 137 → 159 | +16.1% | 7 → 4 | 43% |
| accepted Book 3 | 164 → 173 | +5.5% | 9 → 6 | 33% |
| **Book 4 v2** | **281 → 306** | **+8.9%** | **17 → 4** | **76%** |

The build FAILS if the rate falls below half the accepted floor, or if more than three quarters of the source's sixty-word sentences survive. Book 4 v1 would have failed both.

## 2. One Butler word rendered two ways (M-2)

For every Butler word-type the candidate changes somewhere, the paragraphs where the same type is left alone. Printed for a human to read, never asserted: most of it is innocuous, and that is the point — nothing mechanical can tell `gave it me` kept beside `lent it him` repaired from a hundred harmless cases.

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

## 3. Better than a byte-identical list (M-5)

The asserted list of identical paragraphs stops at Hamming distance zero. B04-P041 — eighty-nine words, two changed — passed it in v1 and was the clearest instance of the substantive finding. This reports every paragraph of forty words or more within four word-level edits of Butler, identical ones included.

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

## 4. Per-paragraph word counts (R5)

`book04/word-counts-v2.json` stores the 81 source and 81 candidate word counts. A rewrap that breaks on a hyphen, an em-dash, a dropped line or a duplicated line is then one failing assertion instead of a formula check that happened to cover the damage.
