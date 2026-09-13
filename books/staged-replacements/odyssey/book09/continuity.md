# Odyssey Book 9 — continuity, decisions and figures

*Ulysses declares himself and begins his story — the Cicons, Lotophagi, and
Cyclopes.* 44 paragraphs, 5,800 words of Butler. Step 8 of the eight in
`../WORKFLOW.md`: **accepted at `candidate-v2.json`** after round 1. The
figures below are v2's. Where this file used to say something round 1 showed
to be false, the correction is marked and the false statement is quoted rather
than deleted — §1, §4, §5, §6, §7 and §8 all carry one.

## 1. The figures

Every one of them is written by `scripts/checks.py`, not typed. **Basis: all
44 paragraphs.**

| | |
|---|---|
| Butler token retention (canonical, aggregate-join) | **0.92284** |
| order retention / bag retention | 0.92284 / 0.93516 |
| **MOVE-GAP** (bag − order), an UPPER BOUND on clause movement | **0.01232** |
| **displaced runs** (the strict witness) | **2** |
| sentences, source → candidate | 171 → 203 |
| **raw splitting rate (D17)** | **+18.7%** |
| sixty-word sentences | **16 → 1 (94% broken)** — the survivor is Butler's own, restored at P034 by the flow read |
| semicolons, Butler → candidate (D19) | **54 → 26** |
| — of Butler's own, kept / the draft's own, added | **26 kept + 0 added** |
| **dividing marks (D27: `;` `:` sentence-internal `—`)** | **71 → 45** |
| — kept / added (D27, membership) | **45 kept + 0 added** |
| **— kept / class-changed / added (D28, IDENTITY)** | **43 + 2 + 0** |
| NORM RATE as published (D20) | +1.8% |
| NORM RATE on Butler's pointing (D21) | +1.8% |
| NORM RATE, every dividing mark (D27) | +2.5% |
| NORM RATE, D27, on Butler's pointing | +2.5% |
| **NORM RATE, D28, by mark identity — THE COMPARED FIGURE** | **+1.7%** |
| word ratio | 0.99103 |
| paragraphs byte-identical to Butler | **0** |
| paragraphs under 0.90 of their source's length | **0** |
| sentences grown past 50 words | **2, both declared — both are Butler's own sentences handed back** |
| cross-Book compound drift | **none** |
| collision rows touching this Book, all dispositioned | **110** |
| H.1 compound pairs, all dispositioned | 30 |

**The four figures to read together, and the sentence v1 published about them
was FALSE.** The raw rate is +18.7% and the compared figure is +1.7%, and the
gap is Butler's own pointing: 71 dividing marks become 45, twenty-eight of them
cashed for periods. v1's `README.md` and this section both said *"not one of
the 41 is the draft's own — on the semicolon, the colon or the dash"*, and
this section added *"there is nothing in this Book's figure that a keystroke
paid for."*

**Substantive finding S-1 of round 1: that is true of the COUNT and false of
the IDENTITY.** The census counted a mark as kept when the strongest mark
Butler wrote in the aligned span was *any* member of `{; : —}`. It never asked
whether it was the **same** mark, and in v1 it twice was not:

| ¶ | Butler | v1 | v2 |
|---|---|---|---|
| B09-P009 | `excellent sport**;**` | `excellent sport**:**` | kept as a colon, **declared** |
| B09-P013 | `separate flocks**;**` | `separate flocks**:**` | kept as a colon, **declared** |
| B09-P012 | `one housekeeper**:**` | `one housekeeper**.**` | **Butler's colon restored** |
| B09-P021 | `to do as follows**:**` | `the best plan**.**` | **Butler's colon restored** |

So the colon census read `: 7 → 7` and called the class untouched while two of
Butler's colons were spent and two new ones written. **D28** splits the census
into *kept by identity*, *class-changed* and *added*, prices a class change at
zero on the candidate's side — the same price as a mark written from nothing,
because on the evidence of a count the two are the same event — and names the
class changes by paragraph so a person can rule on each.

**Why the two class changes are kept and not undone.** Both introduce a list,
which is the one job modern English keeps the colon for, and both are
improvements to Butler's pointing rather than additions to it. The finding is
not that they are wrong; it is that the package could not see the difference
between improving Butler's pointing and leaving it alone, and published a claim
that depended on the difference.

**And the marks restored are not all colons.** Two of the four are semicolons
of Butler's. B09-P031's was cashed for a full stop that stranded a
forward-pointing `this plan` — M-1's second instance. **B09-P034's was found
by the flow read** (step 7, §9), where the paragraph reads
*"**As** he spoke he drove the ram outside…"* followed by *"**As** for the
sheep, which were very fat…"* — two consecutive sentences opening on the same
word, produced by a division and not by Butler, which is Book 4's F-1 and Book
6's F-1 in a third place. His semicolon holds getting out from under the ram
and getting the sheep to the ship as one movement, and it is restored.

**Four of Butler's marks come back, four sentence boundaries go, and one
sixty-word sentence of his survives** — the 61-word P034 that the restoration
rejoins. `16 → 1` is a worse-looking figure than `16 → 0` and a better text,
which is the whole argument for reading a Book straight through after the
measures have finished with it.

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

## 4. D4 — Butler's unclosed quotation, and it is FOUR CHAPTERS long

**This section was wrong at both ends and the correction is substantive
finding S-2 of round 1.** What it said was: *"every paragraph from P001 to
P044 opens with `“` and none but the last closes one."* Measured, and
trivially checkable by hand:

* **B09-P001 does not open with `“`.** It opens `And Odysseus answered, “King
  Alcinous, …` — the poet's frame, and then the quotation.
* **B09-P044 closes nothing.** Every one of the 44 paragraphs, P044 included,
  ends with quote balance **+1**. Butler closes this quotation nowhere in
  Book IX.

**Where it does close, counted over the served `original-en`:**

| chapter | paragraphs | opening a quotation they do not close | chapter balance |
|---|---|---|---|
| 9 | 44 | 43 | +44 |
| 10 | 49 | 49 | +49 |
| 11 | 54 | 47 | +47 |
| 12 | 39 | 38 | +38 |
| 13 | 38 | 0 | 0 |

Chapter 12's last paragraph is the **first since B09-P001 to end with `”`**,
and chapter 13's balance is zero. Odysseus's speech is opened at B09-P001 and
closed four chapters later, and **177 paragraphs in between open a quotation
nobody closes**, over a span of 186.

**So this Book is not the largest instance the edition will ever have; it is
the first quarter of it**, and the app question is a different and larger one
than a dropped quote. The reader who meets it worst is not this Book's reader
at all: it is the reader who opens **chapter 11** directly, from a library or
a share link, and meets 54 paragraphs of unattributed speech with no speaker
named anywhere on the page.

**In the text: preserved exactly.** Butler's convention is Butler's, the
candidate matches him mark for mark on all 44, and any punctuation change here
would be a change to Butler. **In the app: an affordance, not a mark** — a
persistent *"Odysseus is speaking"* attribution across chapters 9-12.
`../PUNCTUATION.md` §2 records the span.

## 5. D16 — two marks repaired and one word supplied

| ¶ | Butler | candidate | rule |
|---|---|---|---|
| **B09-P022** | `“‘Look here, Cyclops,’ said I, you have been eating…` — the inner speech **reopens with no mark** | `said I, ‘you have been eating…` | **D16.** A modern reader reads the missing `‘` as an error, and under D4 the opening marks of this Book are load-bearing for forty-four paragraphs, so a missing one is a missing speaker. |
| **B09-P041** | `after losing all his men [let him reach his home in another man’s ship and find trouble in his house.’` — a square bracket **opened and never closed** | `after losing all his men. Let him reach his home in another man’s ship, and find trouble in his house.’` | **D16 and D12.** **Butler says which interpolation, in two places (R-6).** Footnote **[82]**: *"This line exists in the text here but not in the corresponding passage xii. 141. I am inclined to think it is interpolated (probably by the poetess herself) from the first of lines xi. 115-137, which I can hardly doubt were added by the writer when the scheme of the work was enlarged and altered."* And the **Preface to the First Edition**: *"the introduction of lines xi., 115-137 and of **line ix., 535** … were the only things that were done to give even a semblance of unity to the old scheme and the new."* Line ix. 535 **is** the bracketed clause. The removal is right and the reason first recorded for it — *"an editor's mark for a suspected interpolation"* — was a guess where a statement of Butler's was available, in the same channel (his own Preface) that settled ledger A7. The bracket is unclosed in PG and in the served file alike. D12 forbids square brackets in a candidate; the clause it opened is a complete sentence and is set as one. **This is one of the Book's genuine divisions** — Butler wrote no mark there at all — and it is counted as one. |
| **B09-P015** | `“‘Strangers, who are you? **Where do sail from?**` | `Where do **you** sail from?` | **D16 clause (b)**, written at Book 8 from its M-3: a word is supplied only where Butler's text is defective and only from Butler's own parallel. The parallel is his own preceding clause, `who are you`, and the formula's second person is fixed by `Are **you** traders, or do **you** sail the sea as rovers`, eleven words later in the same speech. PG carries the omission; it is a compositor's, not Butler's sense. |

| **B09-P022** | `how can you expect people to **come see** you any more` | `come **and** see you any more` | **D16 clause (b)**, added here at round 1's S-5. `come see you` is a defect of exactly the same kind as `Where do sail from?` above — an elided word — in the same speech-pair, seven paragraphs later, and the draft repaired it **silently** while declaring the other one. Either both are D16(b) or neither is. The parallel is Butler's own `come and see` nowhere in this Book and his `go on board` at P005 and P044; the construction is the ordinary one. |

**Two further words are supplied and are restructurings rather than
emendations**, recorded here because round 1 asked for the count and because
§5 previously carried a sentence that was false:

| ¶ | Butler | candidate | why it needs no rule |
|---|---|---|---|
| **B09-P035** | `You wretch, **eat up** your visitors in your own house?` | `You wretch, **to eat up** your visitors in your own house!` | Butler's is a verbless exclamation punctuated as a question. The infinitive is English's way of writing that exclamation; reverting it would print a sentence that is not English. The `?` → `!` is the same decision and is recorded with it. |
| **B09-P044** | `I **bade my men on board** and loose the hawsers` | `I **told my men to go on board** and loose the hawsers` | `bade` licenses a bare complement that `told` does not. `go` is supplied by the grammar of the verb that replaced it, and Butler's own `go on board` at P005 is the phrase. |

**What §5 used to say here was:** *"No other word is supplied anywhere in the
Book, which the draft script does not assert (it cannot) and which a reviewer
should test."* A reviewer tested it and disproved it in one grep — three
others. The invitation was right and the claim was wrong, and the repair is to
enumerate rather than to assert: the table above is the enumeration, and
`checks.py` still has no clause for D16, which stands in the blind-spot list
as item 7 of round 1's §11.

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
* **`uncivilised savages` → `wild savages`** (B09-P010), and **`humane` is
  restored** (S-4). Butler's pair is tautologous in modern English and `wild
  savages` stands. What was recorded beside it was **circular**: the reason
  given for dropping `uncivilised` was that the contrast is with *"a
  hospitable and **civilized** race, which keeps the root"* — and `civilized`
  was **a word the draft wrote**. Butler's second limb is `humane`, and the
  draft had changed it. The rationale removed his first word on the ground
  that his second survived, and his second survived only because it had been
  replaced.

  And the substitution cost the sentence its point. `humane` is *merciful,
  kind* — the quality the Cyclops is about to be shown not to have, in an
  episode whose entire subject is what a host owes a guest. `civilized` makes
  Odysseus's question one about technology and law, which P006-P007 (no
  ploughing, no ships, no assemblies) has already answered. v2 reads `a
  hospitable and humane race`: Butler's own word, and current English.

  **The collision check raised this and the record dismissed it.** Arrow A
  printed the row — `humane · civilized (B9-P010) | humane (B6-P011) | humane
  (B8-P050)` — and `collisions.md` row 45 disposed of it `kept-elsewhere`:
  *"Book 9 supplies the row's only rendering; every other entry is Butler's
  own `humane` carried through unchanged by another Book. There is one
  rendering decision in this row, not two, so there is nothing to reconcile."*
  There is one rendering decision in the row **and that decision is the
  problem**. The two sentences are boilerplate — word for word identical for
  sixteen rows — and they answer a cross-Book consistency question the row
  does not pose. **A generated sentence that is the same for sixteen rows is a
  record that somebody ran a script, not a record that somebody ruled.** §7
  records what the boilerplate is now.

* **The `all highest up in the sea` crux, decided and now RECORDED** (M-9,
  B09-P002). Butler writes *"It lies squat on the horizon, all highest up in
  the sea towards the sunset"* and **footnote [82]'s neighbour, note [48],
  is four hundred words on exactly this clause**, opening *"I give the usual
  translation, but I do not believe the Greek will warrant it"* and offering
  `on the horizon, all highest up in the sea towards the West` against `some
  way off it to the East` for the other islands. The candidate writes `Ithaca
  lies low on the horizon, farthest out to sea toward the sunset`, which takes
  the side Butler declines to take. **A modern edition must choose**, and the
  choice stands — but the served `original-en` strips the footnotes, so a
  reader of the modern text has no way to know a choice was made. It is
  recorded here, which is the whole of the correction.
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

The residue is dismissed with a reason apiece in `book09/collisions.md`, and
eight further rows that Book 9's arrival opened in the **accepted** Books are
ruled there too, rather than left for the next worker.

### The rule these fifteen produced (D29)

Round 1 checked all fifteen against PG one at a time and found the shape:

* **Eleven restore Butler's own word verbatim** — `all manner of subtlety`,
  `renowned`, `hazardous adventures`, `becomes fair`, `luscious`, `yield
  heavily at harvest time`, `the wrath of heaven`, `his huge paunch`,
  `clutched up`, `remained bleating`, `bubbling fountain`.
* **Two keep Butler's phrasing** and modernize only the word that is not
  current — `the morning lasted` (his *"So long as the day waxed and it was
  still morning"*), `preventing us from sleeping` (his *"preventing us from
  being able to sleep"*).
* **Two are new renderings and both are forced** — `such a horrible sight` for
  `horrid`, `wedged` for `esconced`, neither of Butler's being current
  English. Both are still *a word for the thing*.
* **Not one invents a paraphrase of the referent** — which is exactly what
  went wrong with Book 8's `minstrelsy` → *the playing that goes with it*: it
  described a bard instead of naming what he does, and described him wrongly.

**D29: an arrow's repair RESTORES Butler's own word; a third rendering
requires a reason.** Arrow C's constraint says what a repair may not be; this
says what it should be, and it is free.

### Six the check could NOT see, corrected in v2 (S-3)

`rendering_collisions.py` states its gate in its own docstring — *"only
Butler's rare words count"*, `RARE_MAX = 3` paragraphs, `MIN_LEN = 5` letters
— and **the words a narrative uses as discriminators are its common words.**

| ¶ | Butler | v1 | v2 | collided with |
|---|---|---|---|---|
| P018 | `sent my ship on to the rocks` | `drove` | **`sent`** | Butler's `drove` seven times, always of driving flocks — and his `We were **driven** on to them` in the next sentence |
| P019 | `vouchsafed me not one word` | `gave` | **`did not answer me with one word`** | Butler's own `gave`, P005, P017, P021, P024 |
| P019 | `with a sudden clutch` | `snatch` | **`clutch`** | Butler's own `I snatched up a long pole`, P036 |
| P019 | `supped upon them` | `made his supper of them` | **`devoured them`** | Butler's own `supper`, P014 (twice) and P021 |
| P037 | `they exclaimed` | `cried` | **`exclaimed`** | Butler's own `cried`, P020 and P039 |
| P033 | `lead the mob with a run` | `the flock` | **`them`** | Butler's own `flocks`, P011, P013, P021 |

**Four of the six appear nowhere in the 110-row report.** Two were reported and
dismissed, and both dispositions answered a different question from the one
their row poses — blind spot 8 with two instances:

* `vouchsafed` → `gave` is row 65, `variant`: *"`vouchsafe` survives only in
  legal and liturgical registers; the sentence's force is in `not one word`,
  which is kept exactly."* True, and beside the point. The row was raised by
  **arrow A**, keyed on Butler's word across Books, so the disposition ruled on
  whether `gave` is an acceptable modernization of `vouchsafed` and never asked
  whether `gave` is **free in Book 9**. It is not.
* `supper` is row 126, `common-rendering`: *"…arrow B is ungated on this side
  on purpose and **arrow C carries the residue**."* Arrow C is
  **same-paragraph only** — this record says so in four places. P019's `made
  his supper of them` and P014's and P021's `supper` are in different
  paragraphs. **The disposition invoked a safety net that does not cover the
  row it was dismissing.**

**And one of the six is the P020 repair's own doing.** The repair restored
Butler's `clutched up` at P020 to protect his `snatched` at P036 — correctly —
while the same draft wrote `snatch` at P019 for Butler's `clutch`. The
collision the repair removed was **re-created one paragraph earlier**, and
Butler's own `clutch`/`clutched` pair was flattened in the opposite direction
at the same time. Nothing in the package checks a repair against the rest of
its own draft.

**The cheap closure, which needs no new instrument** (round 1's §9): run arrow
B a second time with the rarity gate replaced by a **within-Book repetition**
gate — any candidate word that renders two different Butler words inside one
Book is a row, however common. On this Book that produces exactly the six rows
above and the report stays readable.

### And the boilerplate

`collisions.md`'s `kept-elsewhere` disposition is two sentences that are
word-for-word identical for **sixteen rows**, one of which is S-4's
`humane → civilized`. A generated sentence shared by sixteen rows records that
a script ran. The generator now names, in each such row, **which** rendering
decision the row contains and whose word the other entries are, so that a row
with exactly one rendering decision says so and a reader can see that the one
decision is the thing to rule on.

## 8. The compound check, before the freeze — and the exemption is GONE

`compound_drift()` raised **one row** on this draft and it was a **false
positive**: `an olive-wood handle` (Book 5) against `of green olive wood`
(Book 9, P021). That is **attributive hyphenation** — a rule of English, by
which any two-word modifier standing before its noun takes a hyphen and the
same two words as a noun phrase do not. Butler sets both the same way and both
Books follow him. It is not a compound with two settings.

**The remedy was wrong, and round 1's question 4 ruled it so.** The row was
cleared by `NOT_COMPOUNDS["olivewood"]`. But the false positive is a property
of the **position** and the exemption was keyed on the **compound**, so it
bought one noisy true statement at the price of a permanent, silent false
**negative**: from that moment, a Book writing `olivewood` closed, or writing
`olive wood` attributively against another Book's nominal `olive-wood`, would
have been met with silence. *A check that trades a noisy true statement for a
quiet false one has moved in the wrong direction.*

This record half-knew it — *"the exemption list is itself the hazard"*, *"if
that list ever carries more than a handful, the check has to become
position-aware"* — and **two things were wrong with that as a safeguard**.
*A handful* is not a number and nothing counted it, so the threshold could not
be crossed observably; and **`ivy-wood bowl` against `ivy wood` is already
visible in this same Book (P021)** and would have made it three.

**What is there now.** `compound_drift()` is **position-aware**, and it needed
no vendored word list (the new external dependency ledger A4(ii) escalated) —
only one distinction the text already carries: is a content word being
modified? `_position()` reads the next token and whether it is a function word.
Settings are compared only within one position, so `a beautiful olive-wood
handle` and `it was of green olive wood` fall into different classes and never
meet, while a genuine drift — two Books setting the pair differently in the
**same** position — still fires. **The `olivewood` exemption was removed and
the row does not form.** `ivy-wood` never forms either.

**And the growth trigger is mechanical instead of rhetorical**: the self-test
asserts **`len(NOT_COMPOUNDS) <= 2`**, so a third exemption *fails the check*
and forces the next worker to find another axis rather than name another word.
One exemption remains — `sunset`, where `the sun set` is a verb and its
subject and `sunset` is a noun: two constructions, not two settings, and no
position test can see that. That is the package's own standard — *made
impossible rather than absent* — applied to its own escape hatch, because
exemption-by-name is becoming the way to clear red precisely when clearing red
by exemption costs nothing today and the cost lands on somebody who will not
know it was paid.

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

**Hyphenation drift in two directions, neither of which `compound_drift()` can
see** (round 1, O-2). `drink-offering` → `drink offering` (P022) opens a
compound Butler closes; `bowl full` → `bowlful` (P023) closes one he opens.
Neither is wrong; both are invisible to the check, because `drink` and `full`
are a stop-word and a non-head element respectively. Recorded rather than
changed: changing a reading for a check's convenience is the wrong direction.

