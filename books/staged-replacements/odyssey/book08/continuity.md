# Odyssey Book 8 — continuity, decisions and figures

Drafting record for `candidate-v1.json`, the frozen v1. Every figure here is
produced by `python3 scripts/checks.py 8`, which writes `checks-v1.md`; nothing
in this file is typed by hand from memory.

**Basis: all 50 paragraphs.**

## 1. The figures

| | |
|---|---|
| paragraphs | 50, one-to-one with the source |
| source words → candidate words | 5,589 → 5,545 (ratio 0.992) |
| Butler token retention (aggregate-join) | **0.93844** |
| order retention (per paragraph) | 0.93844 |
| bag retention | 0.94536 |
| **MOVE-GAP** (bag − order), an UPPER BOUND | **0.00692** |
| **displaced runs** (the strict witness) | **0** |
| sentences, source → candidate | 192 → 244 |
| **raw splitting rate (D17)** | **+27.1%** |
| sixty-word sentences | **11 → 0 (100% broken)** |
| **semicolons, Butler → candidate (D19)** | **42 → 0** |
| — of Butler's own, kept | 0 |
| — the draft's own, **added** | **0** |
| NORM RATE as published (D20) | **+4.3%** |
| **NORM RATE on Butler's own pointing (D20, S-1)** | **+4.3%** |
| minimum paragraph ratio | 0.9605 at B08-P035 |
| paragraphs byte-identical to Butler | **1, declared** — B08-P033 |
| candidate sentences at 40+ words (absolute report) | 22 of 244 |
| H.1 compound pairs, all dispositioned | 28 — §H.1 |

**The two NORM RATEs are the same figure, and that is the point.** Substantive
finding **S-1** of Book 7's round 1 is that a comma raised to a semicolon scores
as a full division under D20 and costs one keystroke. **Book 8 adds none.** It
is the second Book in the package to add none, after accepted Book 4, and the
first to be drafted after the measure existed. `kept_added()` in
`scripts/checks.py` asserts it.

**MOVE-GAP is 0.00692 and the displaced-run witness is 0**, the lowest pair in
the package. Nothing in this Book moved far enough to be a run of four
consecutive Butler tokens occurring once in each text and landing somewhere
else.

**42 → 0 is the largest semicolon conversion in the package, and it is worth
exactly nothing on the compared figure.** Butler points Book 8 heavily — 42
semicolons in 192 sentences — and every one of them became a period. Under D20
that is worth zero by construction, which is why the raw rate is +27.1% and
NORM RATE is +4.3%. **The +4.3% is the figure; the +27.1% is bookkeeping**, and
this Book is the clearest demonstration of the difference the package has
produced.

## 2. Source

Verified twice, by two unlike rules, as the standing rule requires.

* `scripts/verify_source_book8.py` — the **twelfth** kind of rule, and the
  first to locate a Book by its **title** and PG's **table of contents**,
  reading no character of any chapter's prose to do it. Output in
  `source-verification.txt`. Ten controls under D18, both clauses, including
  the **B03-P038 splice** and **a paragraph of Butler's own Book VI**, which is
  the bar Book 7's round 1 set.
* Its audit failed it **twice** before it was trusted, and both are recorded in
  the script: it expected `[n]` footnote anchors where PG has none in the whole
  translation body, and its clause 3 as first written was tautological.
* That second repair found **three divergences of the served `original-en`
  from PG that nobody had recorded** — a space before an em dash closed at
  B01-P025, and Books III and IV opened with a capital where PG opens
  lower-case because Butler runs the sentence on from the Book before. All
  four divergences (with the **D14** splice at B03-P038) are now enumerated.

## 3. Names — one row added to the closed table, and one question put

**`Mars` → `Ares`, added to GLOSSARY.md's closed table by enumeration**
(D5/D6), forced by B08-P019–P030, the lay of Ares and Aphrodite, which names
him thirteen times. `GLOSSARY.md` anticipates this case in terms: *"A drafter
meeting `Mars` or `Ceres` applies D5 and does not go looking for permission in
the file being replaced."*

**The census, asserted by the build and reproducing exactly:**

| Greek | candidate | Butler's Roman | source |
|---|---|---|---|
| Odysseus | 25 | Ulysses | 25 |
| Hephaestus | 14 | Vulcan | 14 |
| **Ares** | **13** | **Mars** | **13** |
| Aphrodite | 7 | Venus | 7 |
| Zeus | 7 | Jove | 7 |
| Athena | 5 | Minerva | 5 |
| Poseidon | 4 | Neptune | 4 |
| Hermes | 4 | Mercury | 4 |
| Hera | 1 | Juno | 1 |
| **Heracles** | **1** | **Hercules** | **1** |

**`Hercules` → `Heracles` is a question, not a decision, and it is put to the
reviewer.** See `review-instructions.md` question 1. D5 covers *"the Olympians
who have Roman ones"*; Heracles is a hero, not an Olympian, so the letter of
the rule does not reach him. This draft writes `Heracles` on the rule's evident
purpose — the edition uses Greek forms, the poem is Greek, and a reader who has
just met Ares, Aphrodite and Hephaestus on the same page should not meet
Hercules. The Cast has no display name for him, so **D8** is silent. It is one
word, at B08-P016, and it is easy to reverse either way.

**`Halios` / `Halius` — Butler spells one man's name two ways.** `Halios` at
B08-P008 and `Halius` at B08-P032, both a son of Alcinous, both in a list of
his sons. This is the **D13** shape with the opposite resolution: D13 split
`Mycene` by *referent* because there were two people; here there is one man, so
one spelling, and **Butler's first is taken**. Found by
`scripts/rendering_collisions.py` arrow B, not by reading — it is row
`halios ← halios (B8-P008) | halius (B8-P032)`, and it is the first time the
collision check has caught a *name*.

## 4. D4 — Butler's unclosed quotation, once, over three paragraphs

Alcinous's closing speech runs **B08-P048 → B08-P049 → B08-P050**. Each
continued paragraph opens its own quotation mark and only the last closes it.
The candidate reproduces it exactly: paragraphs 48 and 49 are unbalanced in
both texts, 50 closes. Asserted by the build.

## 5. D16 — Butler's punctuation slips, four repairs and their rule

**One rule (D16): a Victorian mark is REPAIRED when a modern reader reads it as
an error, and KEPT when it is merely old-fashioned but correct.** Four fire
here, more than in any Book so far.

| ¶ | Butler | candidate | why it is repaired |
|---|---|---|---|
| B08-P012 | *"why do you taunt me in this way? my mind is set"* | *"…like this? My mind is set"* | Lower case after a question mark reads as a printer's error. |
| B08-P050 | *"when you were before Troy? a son-in-law or father-in-law—which are"* | *"…before Troy—a son-in-law or a father-in-law, who are"* | The same, and the question mark is mid-question; the dash carries the apposition. |
| B08-P039 | *"“Wife,” said he, … “Go, fetch the best chest"* | *"“Wife,” he said, … “go, fetch the best chest"* | A capital after a comma inside one continuous address. |
| B08-P014 | *"heaven has adorned **this** with such a good conversation"* | *"heaven has adorned **him** with such good conversation"* | `this` has no antecedent but the man, and a modern reader reads it as a printer's error, not as style. |

## 6. Renderings decided here

* **`cloister` → `gallery`**, the Book 1 row, at B08-P003, B08-P008, B08-P042,
  B08-P044.
* **`bearing-post` → `pillar`**, matching accepted B01-P023's *"one of the
  pillars that held up the roof of the gallery"*, at B08-P005, B08-P042,
  B08-P044.
* **`two and fifty` → `fifty-two`**, and Butler's own `fifty-two` at B08-P004
  is kept. The number is Butler's and is unchanged; only its Victorian form
  moves.
* **`out houses` → `outbuildings`, not `outhouses`.** D15's own test — *does it
  alter what a reader would say aloud, or rename the object?* — says this one
  is a rendering decision and not normalization: `outhouses` in modern English
  names privies, and Butler's are the working buildings of a great house.
  Recorded, per D15.
* **`precincts` is KEPT at B08-P004**, where Book 7 rendered it `courtyard` at
  B07-P012. The senses differ and the discrimination is deliberate: B07-P012 is
  a man crossing a threshold into an enclosure, where `precincts` also collided
  with the Book's literal bronze walls (finding **M-1**); B08-P004's is the
  plural grounds of a palace, where `precincts` is current English.
* **`raiment` takes two renderings, deliberately** — `robes` for the divine
  dress the Graces put on Aphrodite at B08-P030, `clothing` for the gift-clothes
  in Arete's chest at B08-P040, which is accepted B05-P004's rendering word for
  word. See `collisions.md`.
* **`lays` → `singing`** at B08-P007 and B08-P044, and Butler's own `songs` at
  B08-P044 is kept. This was a repair: the first draft wrote `songs` for both
  and **arrow C caught it**, Butler's own `songs` being eleven words away in
  the same paragraph.
* **`guardian angel` is KEPT at B08-P043**, and it is flagged rather than
  silently kept: it is Butler's own Victorian Christianizing idiom in a Greek
  poem. See `review-instructions.md` question 3.

## 7. What the collision check caught before the freeze

`scripts/rendering_collisions.py` ran **during** drafting, not after — the
practice Book 7's round 1 showed to be cheap — and the new **arrow C**, added
at Book 7's step 6, caught defects no earlier instrument could see. Six were
repaired before the freeze:

| what | where | repair |
|---|---|---|
| `minstrelsy` and Butler's own `music` both → `music` | P007 / P017 | `the playing that goes with it` |
| Butler's `noticed` and his `perceived` both → `noticed` | P007 / P047 | `was aware of his tears` |
| Butler's `staid` and his `remained` both → `stayed` | P023 / P042 | `for as long as he was with her` |
| Butler's `clothed` and his `dressed` both → `dressed` | P030 / P004 | `they clothed her in robes` |
| `raiment` rendered two ways with no rule | P030 / P040 | ruled, §6 |
| **arrow C**: `lays` → `songs` beside Butler's own `songs` | P044 | `his singing` |

All 93 rows touching Book 8 are dispositioned in `collisions.md`; none is live.

## H.1 — the compound register

Ledger **A5(c)**, and the answer to **A4(ii)** in the negative: one disposition
line per H.1 compound pair, so the class is a checklist somebody went through
rather than a blind spot. Generated by `scripts/compound_register.py` from
`book08/candidate-v2.json`; the evidence is **100 served modern-English editions**, read only, and
a pair is `closed` only when the closed form leads the open form **3x** and
appears in at least **3 distinct editions**. The corpus is machine-generated and
is never a sole authority (ledger A5(b)).

**28 pairs.**

| pair | disposition | corpus evidence |
|---|---|---|
| `bad man` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `bath water` | **`kept open, standard`** | the candidate writes `bath water`; corpus closed 2 in 1 editions against 0 hyphenated and 3 open — the closed form is attested but does not lead by the margin (3x and 3 editions required) |
| `best man` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `blind man` | **`kept open, standard`** | the candidate writes `blind man`; corpus closed 4 in 1 editions against 0 hyphenated and 49 open — the closed form is attested but does not lead by the margin (3x and 3 editions required) |
| `chief men` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `clear fire` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `down side` | **`kept open, standard`** | the candidate writes `down side`; corpus closed 1 in 1 editions against 0 hyphenated and 2 open — the closed form is attested but does not lead by the margin (3x and 3 editions required) |
| `fallow field` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `from land` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `good beds` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `little way` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `long way` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `looking man` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `marriage bed` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `nine men` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `oechalian men` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `phaeacian place` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `polished stone` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `proper man` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `remarkable man` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `set fire` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `standing room` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `starting post` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `stone floor` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `trojan place` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `weary sea` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `whole time` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `young men` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
