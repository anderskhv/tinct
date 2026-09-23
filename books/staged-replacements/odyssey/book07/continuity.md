# The Odyssey, Book 7 — continuity and decisions

> **CORRECTION, 2026-09-13 — records finding R-1 of `review/findings-v1.md`.**
> This file says *"fourteen of Butler's thirty semicolons are kept"*. **It is
> eight kept and six added**, and under D20 a comma raised to a semicolon
> scores as a full division, so **v1's NORM RATE on Butler's own pointing is
> +3.0%, not the +7.5% quoted below**. The figures in this file are the frozen
> v1 record and are left standing as what round 1 reviewed (**D10** in
> spirit); the corrected figures, and the accepted v2, are in
> `book07/ACCEPTANCE.md`. `scripts/checks.py` now computes
> `semicolon_provenance()`, `kept_added()` and `norm_rate_butler()` for every
> Book, so no later Book can publish this figure without splitting it.

Every decision taken in drafting `candidate-v1.json`, by class and by
paragraph. Written before the review, so the reviewer reads what was decided
rather than reconstructing it.

**Basis for every figure in this file: all 29 paragraphs** — records finding
**R-1** of Book 6's round 1. A figure without the paragraph set it is computed
over is not a figure.

| | |
|---|---|
| Butler token retention | **0.93943** (aggregate-join, the canonical form) |
| bag retention / **MOVE-GAP** | 0.95220 / **0.01277** |
| displaced runs (the strict witness) | **1** |
| sentences | **103 → 129, +25.2% raw (D17)** |
| **NORM RATE (D20)** | **+7.5%** — **R-1: on Butler's own pointing +3.0%** |
| sixty-word sentences | **7 → 0, 100% broken** |
| **semicolons (D19)** | **30 → 14** — **R-1: 8 kept + 6 ADDED** |
| word ratio | 1.00538; lowest paragraph 0.976 at B07-P027 |

## 1. The source, and the tenth kind of rule

`../scripts/verify_source_book7.py`; the method, the three audit failures and
the controls are in `provenance.json` and `README.md`. The one thing worth
repeating here is the **premise**, because it is what makes the rule possible
and it is asserted rather than assumed: **the served `original-en` preserves
PG's own hard line breaks inside its paragraph strings.** All 29 paragraphs
carry them.

## 2. Names — the closed table gains NO row

Applied from `GLOSSARY.md`'s closed table (**D5**–**D8**), case-sensitive and
word-bounded. Every count matches the source exactly and no Roman form
survives.

| Butler | modern | count |
|---|---|---|
| Ulysses | Odysseus | 18 |
| Minerva | Athena | 8 |
| Jove | Zeus | 6 |
| Neptune | Poseidon | 4 |
| Mercury | Hermes | 1 |
| Vulcan | Hephaestus | 1 |

**The hazard worth naming in this Book is `Arete`.** The queen is named seven
times and the whole of Athena's instruction turns on her — *"First find the
queen"* — so she is the name here that cannot afford to move. The closed table
has nothing to say about her and she is untouched. A general deity list, a
stem-based pass, or any rule reaching for `Ares` would have had something to say
and would have been wrong. This is hazard 1's shape again, and it is reported as
a result rather than as a reassurance.

**Names first met in Book 7**, all already Greek in Butler and left exactly as
he spells them: Eurymedusa, Apeira, Arete, Rhexenor, Periboea, Eurymedon,
Echeneus, Laodamas, Pontonous, Erechtheus, Marathon, Athens, Rhadamanthus,
Tityus, Gaia, Euboea. `Apollo`, `Atlas` and `Calypso` are likewise his own Greek
forms.

**D8 does not fire**: no figure in this Book has a Cast display name that
differs from Butler's spelling.

## 3. Formulas carried from the accepted Books

| Butler | rendering | authority |
|---|---|---|
| "plainly and in all honesty addressed them thus" (P014) | **"spoke to them plainly and in all honesty, and said:"** | the Book 2 row, word for word — accepted B02-P009 and B02-P013 |
| "the cloister" (P020) | **"the gallery"** | the Book 1 row (B01-P023, B01-P026), applied at B02-P033 |
| "hecatombs" (P018) | **"great sacrifices"** | **D3**, and **no number supplied** |
| "On this" (P005) | **"At this"** | the Book 3 / Book 4 connective row |
| "bondsmen" (P019) | **"bondservants"** | accepted B04-P055 |
| "as much as he was minded" (P017, P020) | **"as much as he wanted"** — both times | Butler repeats it; so does the candidate |
| "aid" (P023, P024) | **"aid"** | accepted B06-P013 keeps it; it is current English |
| "inasmuch as" (P020) | **"since"** | accepted B01-P004 |
| "besought" (P023) | **"begged"** | |
| "comely" (P001) | **"comely"** | accepted B02-P001 and B04-P025 keep Butler's word |
| "in the midst of them" (P005) | **"in the middle of them"** | accepted B04-P002, the same phrase |
| "converse" (P028) | **"talked together"** | accepted B04-P052 |
| "depart" (P022) | **"leave"** | accepted B01-P027 |

**The `saying` tag is dropped**, per the standing rule: Butler's *"prayed aloud
saying,"* at P027 becomes *"prayed aloud,"*. **No inverted pronoun speech tag
survives**: `said he` at P015 is `he said`, and `replied Ulysses` at P025 and
P026 is `Odysseus replied` / `Alcinous replied`.

## 4. D3, D4, D12, D16 — what does and does not fire

- **D3 (no quantity supplied for a sacrifice).** **FIRES ONCE**: P018's
  *"when we have been offering them hecatombs"* → *"when we have been offering
  them great sacrifices"*. No number.
- **D4 (Butler's unclosed quotation across a paragraph break).** **FIRES
  TWICE**, as in Book 6. **Athena's instruction** runs B07-P006 → B07-P007 →
  B07-P008; **Odysseus's account of his wanderings** runs B07-P021 → B07-P022 →
  B07-P023. Each continued paragraph opens its own mark and only the last of
  each run closes. **23 opening and 19 closing double marks, in the source and in
  the candidate**, with the same four paragraphs unbalanced in both (P006, P007,
  P021, P022). Reproduced exactly.
- **The nested single quotation at B07-P021 is preserved**: Odysseus naming the
  island — *‘the Ogygian.’* — inside his own speech. One `‘` and its `’`; the
  other four `’` in the Book are apostrophes.
- **D12 (Butler's square brackets).** Does not fire. No bracket occurs in the
  source or the candidate.
- **D14 (the served original is not the base text).** Does not fire; Book 7 is
  byte-clean against PG apart from the eight classified footnote numerals.
- **D16 (a Victorian punctuation slip).** **FIRES ONCE, at B07-P021.** Butler
  writes *"It would be a long story Madam, were I to relate"* — a vocative with
  **no comma before it**, which a modern reader reads as an error and not as an
  old-fashioned but correct pointing, so **D16** says repair. The comma is
  supplied and the capital dropped: *"a long story, madam, were I to relate"*.
  *(Recorded here at the drafting stage rather than left to be found, which is
  records finding **R-2** of Book 6's round 1 — that Book made its D16 repair
  silently.)*

## 5. Paragraph-level decisions

- **B07-P001 — Butler's own redundancy repaired, and his archaic opening
  un-inverted.** *"Thus, then, did Ulysses wait and pray"* is a narrative tag,
  not the second limb of a comparison, so it is un-inverted under the **O-3 rule
  settled at Book 6**: *"So Odysseus waited and prayed"*. And Butler's *"brought
  her supper for her into her own room"* carries the dative twice; the candidate
  keeps one — *"brought her supper to her in her own room"*. This is the
  B01-P013 class (a doubled word that is clumsy rather than defective), and it is
  decided the other way **because it reads as an error and B01-P013 does not**;
  flagged here for the reviewer to overrule if they disagree.
- **B07-P005 — the 87-word period divided at Butler's own semicolon**, with the
  contrast kept: *"followed in her steps. Not one of the Phaeacians could see
  him …"*.
- **B07-P010 and B07-P011 — Butler's present-tense ekphrasis is KEPT.** He
  describes the palace and the garden in the present tense in the middle of a
  past-tense narrative — *"There are fifty maidservants in the house"*,
  *"Outside the gate of the outer court there is a large garden"* — and then
  closes the garden on a past tense again, *"Such, then, were the splendors…"*.
  It is Homer's shift and it is reproduced exactly. **Not** normalized, and not
  flagged as a slip: the tense is doing work, holding the palace outside the
  night the narrative is in.
- **B07-P011 — ~~fourteen of Butler's thirty semicolons are kept, and five of them~~
  **R-1: eight are kept and six are the draft's own; B07-P011 carries TWO of
  Butler's, not five. Accepted v2 carries 5 kept + 2 added.** The original
  sentence continues:
  fourteen of Butler's thirty semicolons are kept, and five of them
  are here.** The vineyard is a serial list — raisins, gathering, treading,
  blossom, colour — and five periods would make five mechanically short
  sentences out of one survey of a garden, which the accessibility standard
  forbids in terms. See §7.
- **B07-P013 — Butler's parenthesis is opened out AND moved.** He writes
  *"I humbly pray you, as also your husband and these your guests (whom may
  heaven prosper with long life and happiness, and may they leave their
  possessions to their children, and all the honours conferred upon them by the
  state) to help me home"* — a 30-word parenthesis standing between the verb
  *pray* and its complement *to help me home*. That is the **B06-P018** defect
  exactly, and the one round 1 of Book 6 convicted: subject and verb held apart
  until the reader garden-paths. The petition is closed up and the blessing
  becomes its own sentence after it. **Every word stands and nothing is added**;
  it is the Book's one **displaced run**, and the only real clause movement the
  strict witness records.
- **B07-P015 — divided at the second imperative**, which took Echeneus's 63-word
  instruction to 17 and 46. It had **passed** the D17 sixty-word gate at 7 → 2;
  the gate is a floor to clear, not a target.
- **B07-P018 — `to-morrow` → `tomorrow`, `hitherto` → `until now`, `wayfarer` →
  `traveler`, `affect no concealment` → `make no attempt at concealment`, `one
  of our selves` → `one of ourselves`.** `Aldermen` is **kept**, on the accepted
  B06-P005 precedent, which keeps it too; `councillors` is kept in Butler's
  spelling, and that is a **question for the reviewer** — see §8.
- **B07-P019 — `importunate` → `insistent`, and `dwell only on the due
  replenishing of itself` → `think of nothing but being refilled`.** The second
  is a collision repair, not a preference: `filling` is already the edition's
  rendering of Butler's own `filling` at accepted B04-P016.
- **B07-P021 — Butler's `dwells` and his `lives` are kept apart**, eleven words
  apart, exactly as B06-P019 keeps his `live in heaven` beside his `dwell in
  heaven`. *"Here dwells the cunning and powerful goddess Calypso… She lives by
  herself."* Flattening them would be the mirror defect.
- **B07-P022 — `Days seven and ten did I sail` → `For seventeen days I sailed`.**
  The inversion goes under the O-3 rule and the number stands exactly: Butler's
  *"on the eighteenth"* two clauses later is what makes seventeen the right
  word, and no quantity is supplied that he does not state.
- **B07-P024 — repaired because it came out byte-identical to Butler**, and the
  gate said so. *"not to bring you on at once to my house"* → *"not to bring you
  on to my house at once"*, which is where a modern reader expects the adverb.
  Accepted Book 4 **declares** seven byte-identical paragraphs and is right to;
  this one had a real improvement available and takes it instead.
- **B07-P026 — the 66-word voyage sentence divided at Butler's em dash.** His
  *"further off than Euboea—which those of my people who saw it … tell me is the
  furthest of any place"* separates the relative pronoun from its verb by
  twenty-two words. The relative clause becomes a main clause and the subject
  closes up with its verb. Also `even though it be` → `even if it is`.
- **B07-P027 — `Then was Ulysses glad` → `Then Odysseus was glad`** (O-3, a
  narrative tag), and the `saying` tag dropped.
- **B07-P028 — `Thus did they converse` → `So they talked together`** (accepted
  B04-P052), and `thereon` → `So`.

## 6. American spelling and compounds (D9, D15)

`harbours`→`harbors`, `honours`→`honors`, `splendour(s)`→`splendor(s)`,
`colour`→`color`, `woollen`→`woolen`, `favourite`→`favorite`,
`neighbours`→`neighbors`, `recognised`→`recognized`, `waggon`→`wagon`,
`to-morrow`→`tomorrow`.

**Closed:** `maid servants`→`maidservants`, `sea-faring`→`seafaring`,
`town's people`→`townspeople`.
**Hyphenated:** `well disposed`→`well-disposed`.
**Kept open:** `wine tubs`, `drink offering(s)`.
**Untouched:** `son-in-law`, `yellow-haired`, `ill-fated`, `mid-ocean`,
`gatehouse`.

**Two of these are decisions rather than normalizations, because Butler sets the
same compound both ways inside this one chapter**, and leaving his split would
put one compound in two settings inside one Book — which is exactly what
`compound_drift()` exists to fail on:

- **`drink offering`** — open at B07-P012 and B07-P020, hyphenated at B07-P016
  and B07-P017. The open form is taken in all four, because **D15**'s own table
  records `drink offering` as the standard open form.
- **`well disposed`** — open at B07-P015, hyphenated at B07-P016. The hyphen is
  taken, because the accepted Books print it.

`scripts/compound_drift.py` re-run with Book 7 in the corpus: **no compound
carries more than one setting across the seven Books.**

**The H.1 head-noun filter** (`scripts/checks.py` §11, the interim instrument
for the class `compound_drift()` cannot see) returns **23 pairs** for this Book,
printed in `checks-v1.md`. None of them raises a question; Book 6's `mountain
tops` has no counterpart here.

## 7. The splitting rate, the semicolon count, and the two measures that price them

**103 → 129 sentences (+25.2% raw), 7 → 0 sixty-word sentences, semicolons
30 → 14.** So **16 of the 26 added sentences are at most a semicolon
conversion.**

**What says the rest is real is NOT the retention figure.** That argument was
ruled invalid at Book 6's round 1 and the ruling is not re-litigated here: D17
was written about a vocabulary swap that lowers retention and moves nothing, so
a retention figure cannot separate a moved clause from a replaced word. What
says it is:

- **MOVE-GAP 0.01277** — bag retention minus order retention, so substitution
  cancels. Higher than every accepted Book except 1 and 3, and above Book 6 v2's
  0.01156. **Reported as an upper bound**, per D20: it counts any relocation of a
  surviving token, phrase-internal ones included.
- **NORM RATE +7.5%** — the headline +25.2% with the semicolon conversions
  priced out of both sides. Second in the package, behind Book 5 v2's +8.0%.
- **The strict witness returns one**: B07-P013's blessing, moved out of Butler's
  parenthesis to the end of the petition.

**Fourteen semicolons are kept and that is argued, not conceded.** B07-P011's
vineyard is a list; converting its five semicolons would add five sentences,
raise the raw rate by about five points, and leave **NORM RATE unchanged to the
decimal** — which is the whole of what D20 was written to make visible.

## 8. What the drafter could not check, and hands to the reviewer

**No paragraph is byte-identical to Butler**, and the empty list is asserted.

**The near-identical report, published** (records finding R-7 of Book 5's round
1: printed, not summarized). 40+ source words, ≤4 word-level edits:

| paragraph | source words | edits | longest candidate sentence |
|---|---|---|---|
| B07-P002 | 74 | 4 | 42 words |
| B07-P009 | 116 | 3 | 39 words |
| B07-P025 | 50 | 3 | 28 words |
| B07-P027 | 41 | 3 | 40 words |

Each was read against Butler and left: all four are narrative or short speech in
his plainest register. **This is the claim a drafter cannot certify about its
own draft**, and B07-P009 is the one to press — 116 words, three edits, and a
39-word sentence describing the palace.

**The one-word-two-ways report returns 70 rows**, and its two structural limits
are the ones records finding **R-5** insisted be stated rather than counted: it
keys on Butler's side only, so it cannot see one *rendering* carrying two Butler
words; and it runs inside one Book, so it cannot compare a word's renderings
across Books. Both arrows, across all seven Books, are
`../scripts/rendering_collisions.py`, and **it was run while this Book was being
drafted rather than after**. Seven collisions were found and repaired before the
freeze (`README.md`). **Four are kept and are question 2** — `endowed`,
`lighted`, `luscious`, `issue` — because each is Butler's own word in a
different grammatical role or of a different referent from the accepted
instance, and that is the `live`/`dwell` discrimination or it is drift, and the
drafter cannot be the one to say which about its own draft.

**And one spelling is kept against the standard, deliberately**: `councillors`
at B07-P018, because accepted **B02-P001** prints `councillors` and **D9** says
American spelling. Matching the accepted Book was chosen over matching the rule,
on the ground that a successor is the more expensive correction; the reviewer
should rule, because if the rule wins it costs a successor to Book 2 and this
Book's word changes too.

## H.1 — the compound register

Ledger **A5(c)**, and the answer to **A4(ii)** in the negative: one disposition
line per H.1 compound pair, so the class is a checklist somebody went through
rather than a blind spot. Generated by `scripts/compound_register.py` from
`book07/candidate-v2.json`; the evidence is **100 served modern-English editions**, read only, and
a pair is `closed` only when the closed form leads the open form **3x** and
appears in at least **3 distinct editions**. The corpus is machine-generated and
is never a sole authority (ledger A5(b)).

**23 pairs.**

| pair | disposition | corpus evidence |
|---|---|---|
| `again night` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `arranged beds` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `bad place` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `draw water` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `either side` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `furthest place` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `good woman` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `high walls` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `keeps house` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `landing place` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `like men` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `long way` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `next day` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `nine days` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `old woman` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `others work` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `outer court` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `seventeen days` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `single day` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `tenth night` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `whole time` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `woven work` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `young men` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
