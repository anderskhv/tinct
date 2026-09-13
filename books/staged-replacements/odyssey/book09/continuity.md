# Odyssey Book 9 — continuity, decisions and figures

*Ulysses declares himself and begins his story — the Cicons, Lotophagi, and
Cyclopes.* 44 paragraphs, 5,800 words of Butler. Step 3 of the eight in
`../WORKFLOW.md`: drafted and frozen at `candidate-v1.json`, and it stops here
for a review it does not do itself.

## 1. The figures

Every one of them is written by `scripts/checks.py`, not typed. **Basis: all
44 paragraphs.**

| | |
|---|---|
| Butler token retention (canonical, aggregate-join) | **0.92164** |
| order retention / bag retention | 0.92164 / 0.93430 |
| **MOVE-GAP** (bag − order), an UPPER BOUND on clause movement | **0.01266** |
| **displaced runs** (the strict witness) | **2** |
| sentences, source → candidate | 171 → 207 |
| **raw splitting rate (D17)** | **+21.1%** |
| sixty-word sentences | **16 → 0 (100% broken)** |
| semicolons, Butler → candidate (D19) | **54 → 24** |
| — of Butler's own, kept / the draft's own, added | **24 kept + 0 added** |
| **dividing marks (D27: `;` `:` sentence-internal `—`)** | **71 → 41** |
| — kept / added | **41 kept + 0 added** |
| NORM RATE as published (D20) | +2.7% |
| NORM RATE on Butler's pointing (D21) | +2.7% |
| NORM RATE, every dividing mark (D27) | +2.5% |
| **NORM RATE, D27, on Butler's pointing — THE COMPARED FIGURE** | **+2.5%** |
| word ratio | 0.993 |
| paragraphs byte-identical to Butler | **0** |
| paragraphs under 0.90 of their source's length | **0** |
| sentences grown past 50 words | **0** |
| cross-Book compound drift | **none** |
| collision rows touching this Book, all dispositioned | **110** |
| H.1 compound pairs, all dispositioned | 30 |

**The four figures to read together.** The raw rate is +21.1% and the compared
figure is +2.5%, and the gap between them is **entirely Butler's own
pointing**: 71 dividing marks become 41, thirty of them cashed for periods,
and **not one of the 41 is the draft's own**. On any of the three marks. That
is substantive finding S-1 of Book 7's round 1 and S-1 of Book 8's answered
before a reviewer has to raise them, and it is why `norm_rate_ext` and
`norm_rate_butler_ext` agree to the decimal here — there is nothing in this
Book's figure that a keystroke paid for.

**And the movement figures say the divisions are divisions.** MOVE-GAP 0.01266
with **2** displaced runs, against Book 1's 0.05088 and Book 8's 0.00692.
Clauses are cut apart, not shuffled.

**Nothing is declared.** `checks.DECLARED` carries an empty row for this file,
with a reason that says so out loud, and every gate runs at full strength.

## 2. Source — the FOURTEENTH kind of rule, and it reads integers

`scripts/verify_source_book9.py`, output in `book09/source-verification.txt`.

Every earlier rule reads something of the text it is looking for — a heading, a
needle, a fingerprint, a residue, a diff, a resemblance profile, a typographic
shape, a line-wrap count, a capitalization bit, a chapter title, a byte tiling.
This one reads **44 integers**: the served chapter's per-paragraph word-count
vector, matched as a contiguous run against the word counts of every paragraph
between PG's `*** START ***` and `*** END ***` markers — prefaces, footnotes,
appendix and illustration captions included, because nothing tells it where
Butler's body begins. **It occurs exactly once.** Only then does clause D read
a character, and all 44 paragraphs are word for word identical.

**The audit failed it once, and the failure is the interesting kind.** PG
prints page numbers inline, sometimes as a bare token (`72`, Book 8) and
sometimes glued to the preceding word (`dawn.75`, `another.76`, `lotus77`,
Book 9). The first version dropped only bare tokens — and clause B **still
located Book 9 correctly**, because a glued page number is one token either
way. The locating clause passed *for the wrong reason*, and only clause D,
which reads characters, caught it. That is precisely the shape the thirteenth
rule's audit found five times, and it is the argument for keeping a clause that
verifies after a clause that locates.

**The reason to believe the rule is what it says about the OTHER chapters.**
Run over all 24, it locates **22 uniquely and fails on exactly two — chapters
1 and 3**, which are the two of the served file's four recorded divergences
from PG that a word count can see (B01-P025's space before an em dash, one
token; B03-P038's splice, 196 words). It **locates chapter 4**, whose recorded
divergence is B04-P001's capital `They` — a case change, which no word count
can reach, and the rule does not pretend otherwise. The instrument's verdict
over the whole file is exactly the recorded set, split correctly by what
arithmetic can and cannot see.

**Nine controls under D18, all on both clauses**, including the two the brief
requires: the **B03-P038 splice** planted into Book 9's vector, and **a
paragraph of Butler's own Book VIII** — and, so the control is not about
adjacency, one of his Book XXII as well. Also the thirteenth rule's own
failure mode (the vector shifted by one), a single word added, the order
reversed, two paragraphs transposed, and a paragraph split in two with the
total unchanged. **Three blindnesses are declared**, one of them the false
positive that costs money.

## 3. Names — D5 as widened at Book 8

Ulysses → **Odysseus**, Jove → **Zeus**, Neptune → **Poseidon**. No new row is
needed: every Roman form in this Book is already in the closed table, and
**D5's widening at Book 8 (`any figure Butler names in a Roman form`) is not
exercised here** — the Book's other names are Greek in Butler already
(Polyphemus, Apollo, Calypso, Circe, Agamemnon, Atreus, Telemus, Eurymus,
Maron, Euanthes, Hades, Achaeans, Cicons, Cyclopes, Lotus-eaters).

`Nectar and Ambrosia` → `nectar and ambrosia`: common nouns in modern English,
capitalized by Victorian convention. Typographic, silent (D15's test — it does
not change what a reader says aloud).

## 4. D4 — Butler's unclosed quotation

Not exercised. Odysseus's whole narrative is one speech opened at B09-P001 and
running to the end of the Book, so **every paragraph from P001 to P044 opens
with `“` and none but the last closes one** — which is D4's convention applied
across forty-four paragraphs rather than two. Preserved exactly. The reader's
hazard `PUNCTUATION.md` §2 names is at its largest here: forty-three
consecutive paragraphs end without a closing mark, and in a paginated reader
that reads as forty-three dropped quotes unless the app knows the convention.
Recorded, not acted on; it is an app question.

## 5. D16 — two marks repaired and one word supplied

| ¶ | Butler | candidate | rule |
|---|---|---|---|
| **B09-P022** | `“‘Look here, Cyclops,’ said I, you have been eating…` — the inner speech **reopens with no mark** | `said I, ‘you have been eating…` | **D16.** A modern reader reads the missing `‘` as an error, and under D4 the opening marks of this Book are load-bearing for forty-four paragraphs, so a missing one is a missing speaker. |
| **B09-P041** | `after losing all his men [let him reach his home in another man’s ship and find trouble in his house.’` — a square bracket **opened and never closed** | `after losing all his men. Let him reach his home in another man’s ship, and find trouble in his house.’` | **D16 and D12.** The bracket is an editor's mark for a suspected interpolation and it is unclosed in PG and in the served file alike. D12 forbids square brackets in a candidate; the clause it opened is a complete sentence and is set as one. **This is one of the Book's genuine divisions** — Butler wrote no mark there at all — and it is counted as one. |
| **B09-P015** | `“‘Strangers, who are you? **Where do sail from?**` | `Where do **you** sail from?` | **D16 clause (b)**, written at Book 8 from its M-3: a word is supplied only where Butler's text is defective and only from Butler's own parallel. The parallel is his own preceding clause, `who are you`, and the formula's second person is fixed by `Are **you** traders, or do **you** sail the sea as rovers`, eleven words later in the same speech. PG carries the omission; it is a compositor's, not Butler's sense. |

**No other word is supplied anywhere in the Book**, which the draft script
does not assert (it cannot) and which a reviewer should test.

## 6. Renderings decided here

* **`withies` → `willow twigs`** (B09-P031). Butler's word is a live term in
  basket-making and nowhere else; the sentence needs the reader to see what
  the monster slept on.
* **`hoggets` → `yearlings`** (B09-P013). A sheep-farmer's word for a lamb in
  its second year. The paragraph's whole point is the three age-graded flocks,
  so the word has to carry an age, and `yearlings` is the one that does.
* **`esconced` → `wedged`** (B09-P031). Butler's spelling of `ensconced`.
  `settled` was the first rendering and was **repaired at the collision
  check** — it collided with his own `colonised` → `settled` at B09-P007, two
  Butler words landing on one.
* **`uncivilised savages` → `wild savages`** (B09-P010). Butler's pair is
  tautologous in modern English; the contrast the sentence draws is with `a
  hospitable and civilized race`, which keeps the root.
* **`butlerism` kept** (the class named at Book 8): `the hand of heaven` twice,
  `your excellency` → `sir` is the one Victorian address this Book has and it
  is **not** kept — it is a form of address, not an image, and Butler's
  Cyclops scene has no aldermen in it.
* **`Noman`** is kept exactly, capital and all, because the pun is the plot:
  `Noman is killing me by fraud; no man is killing me by force` (B09-P028)
  turns on the difference between the two, and Butler's semicolon holding them
  in one sentence is **kept** for the same reason.

## 7. What the collision check caught BEFORE the freeze

`RESUME.md` asks that the collision check and the compound register run
**before** freezing, not after. They did, and this is what it cost and bought.

The check returned **123 rows** touching Book 9 with **27 undispositioned**.
**Fifteen were live and were repaired in the draft** — at draft time, where a
repair costs nothing, rather than at a review round, where it costs a
successor.

| ¶ | was | is | arrow | why |
|---|---|---|---|---|
| P002 | `every kind of cunning` | `all manner of subtlety` | **C** | Butler's `subtlety`, rendered with the word he himself uses eleven words later for `the cunning Aeaean goddess Circe`. The arrow-C class exactly. |
| P002 | `known among mankind` | `renowned among mankind` | B | collided with the candidate's own `known` at P035 (`You might have known`). Butler's word restored. |
| P002 | `dangerous adventures` | `hazardous adventures` | B | `hazardous` is current English and needed no change. |
| P003 | `the day was growing` | `the morning lasted` | B | `growing` collided with Butler's own `poplars growing` at P007. |
| P007 | `the wind turns fair` | `the wind becomes fair` | B | `turns` collided with Butler's own `he turns out to be` at P039. |
| P007 | `full of rich grass` | `full of luscious grass` | A | **the `luscious` shape the record names**, third occurrence in the package: a Butler word that is current English, replaced for nothing. |
| P007 | `give a heavy harvest` | `yield heavily at harvest time` | A | the paragraph keeps `yield` twice on either side of it. |
| P016 | `the anger of heaven` | `the wrath of heaven` | B | collided with Butler's own `shunning their anger` at P017. |
| P019 | `such a horror` | `such a horrible sight` | A | one Butler word (`horrid`) had acquired three renderings across the Book. |
| P019 | `his huge belly` | `his huge paunch` | B | `belly` is Butler's own word for the sheep's underside at P031 and P034; `paunch` is the Cyclops's gut. Two things, two words. |
| P020 | `he snatched up two more` | `he clutched up two more` | B | collided with Butler's own `I snatched up a long pole` at P036. |
| P027 | `keeping us from our sleep` | `preventing us from sleeping` | B | collided with Butler's own `keeping a firm hold` at P031. |
| P031 | `settled myself` | `wedged myself` | B | freed `settled` for Butler's `colonised` at P007. |
| P032 | `the ewes stayed bleating` | `the ewes remained bleating` | B | collided with Butler's own `we stayed sobbing` at P019. |
| P033 | `bubbling spring` | `bubbling fountain` | B | collided with Butler's own `a spring of clear water` at P007. |

**Six of the fifteen came from arrow B across paragraphs**, which is blind spot
6 — *a discrimination lost ACROSS paragraphs* — and arrow C closes only the
same-paragraph case. They were caught because both of Butler's words happened
to be rare enough for arrow B's gate. **The blind spot is not closed; this
Book is simply a Book where it happened to be in range.**

The residue — twelve rows — is dismissed with a reason apiece in
`book09/collisions.md`, and eight further rows that Book 9's arrival opened in
the **accepted** Books are ruled there too, rather than left for the next
worker.

## 8. The compound check, before the freeze

`scripts/compound_drift.py` raised **one** row: `olive wood` (B09-P021,
B09-P026) against accepted Book 5's `olive-wood handle`.

**It is a false positive, and the class it belongs to is now declared.**
English hyphenates a two-word modifier before the noun it modifies and does
not hyphenate the same two words as a noun phrase — `a beautiful **olive-wood**
handle`, `it was of green **olive wood**`. Butler sets both the same way and
both Books follow him. The check keys on letters and cannot see syntactic
position, so it reads one rule of English applied correctly in two places as a
compound carrying two settings.

**ATTRIBUTIVE HYPHENATION** is now a named, declared blindness of
`compound_drift()`, with a control asserting the exemption is in force, and
`NOT_COMPOUNDS` gains `olivewood` with that reason. It is the **false-positive**
direction, which is the expensive one — it is what makes somebody build a
successor for nothing. The next instance is already visible: `ivy-wood bowl`
(B09-P021) against `ivy wood`. **If that list ever carries more than a handful,
the check has to become position-aware instead of exempting pairs one at a
time.**

## H.1 — the compound register

Ledger **A5(c)**, and the answer to **A4(ii)** in the negative: one disposition
line per H.1 compound pair, so the class is a checklist somebody went through
rather than a blind spot. Generated by `scripts/compound_register.py` from
`book09/candidate-v1.json`; the evidence is **100 served modern-English editions**, read only, and
a pair is `closed` only when the closed form leads the open form **3x** and
appears in at least **3 distinct editions**. The corpus is machine-generated and
is never a sole authority (ledger A5(b)).

**30 pairs.**

| pair | disposition | corpus evidence |
|---|---|---|
| `brave men` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `build ships` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `caught hold` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `clear water` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `cold water` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `either side` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `firm hold` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `foreign land` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `fresh water` | **`kept open, standard`** | the candidate writes `fresh water`; corpus closed 5 in 4 editions against 3 hyphenated and 15 open — the closed form is attested but does not lead by the margin (3x and 3 editions required) |
| `gray sea` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `harvest time` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `high wall` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `huge stone` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `laid hold` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `large yard` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `level land` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `little way` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `livelong day` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `long way` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `merchant ship` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `nine days` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `open sea` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `poor men` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `six men` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `stubble fires` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `tenth day` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `third day` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `third man` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `took hold` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `twelve ships` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
