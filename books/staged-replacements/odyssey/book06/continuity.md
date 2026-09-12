# The Odyssey, Book 6 — continuity, decisions and evidence

Written at steps 1–3 of `../WORKFLOW.md`, before the independent review. Every
claim here is asserted mechanically by the check block in `README.md` unless it
says otherwise.

| | |
|---|---|
| Candidate | `candidate-v1.json`, sha256 `9391ca16778a8225c1710b24296c51a2d3ba33f26ed3ac9fcf7c677c3c0413f0` — **frozen** |
| Source | `source-book6.json`, sha256 `351c2f4647245348450458e2309214b96cf6f6af5e670e9efbc6ddbcdaec5668` |
| Paragraphs | 26, one-to-one with the source |
| Words | 3,432 against 3,435 — ratio **0.99913**; lowest paragraph ratio **0.946** at B06-P002 |
| Butler token retention | **0.93669** (Books 1–5: 0.727, 0.902, 0.897 **on 37 of Book 3's 38 — R-1**, 0.95872, 0.93808) |
| **Splitting rate (D17)** | **sentences 116 → 148, +27.6%**; **sixty-word sentences 7 → 1, 86% broken** |
| **Semicolons against Butler's (D19)** | **27 → 4** |
| Packets | 9, coverage `B06-P001`…`B06-P026` |

## 1. The source, verified by an EIGHTH kind of rule — and audited first

`../scripts/verify_source_book6.py`. The seven rules already used are listed in
`../RESUME.md`. **Every one of them establishes PRESENCE**: each asks, in its
own way, *is the served chapter there, and there once?*, and then compares.
None asks the complementary question, which is the one a substitution or a
forgery would fail:

> **Is there anywhere ELSE in PG #1727 that this chapter could have come from?
> How closely does the rest of the file resemble it?**

The rule answers that, and it is **driven by PG, not by the served file**:

    Build a SUFFIX AUTOMATON over the served chapter's token stream S.
    Walk the WHOLE PG file's token stream P through it once, from the first
    token of the Gutenberg header to the last of the licence, recording at
    every PG position the length of the longest substring of S ending there.
    One pass. A resemblance PROFILE of the entire file against this chapter.

Nothing is searched for, no region is chosen, no anchor, heading, Book number
or digit is consulted, and the automaton is walked over PG in PG's own order
from position zero, so the served file cannot steer where the check looks.
Three things are then read off the profile, **after the fact**:

```
PG letter-token stream         : 133,038 tokens (the WHOLE file)
served chapter 6               : 3,459 tokens, 26 paragraphs
profile reaches |S| at         : exactly ONE PG position
located span (an OUTPUT)       : PG tokens [28997, 32456)
longest match OUTSIDE the span : 37 tokens
   and it is: "made him look taller and stronger than before she also made
   the hair grow thick on the top of his head and flow down in curls like
   hyacinth blossoms she glorified him about the head and shoulders"
12 PG tokens before the span   : "...book vi the meeting between nausicaa and ulysses"
12 PG tokens after the span    : "book vii reception of ulysses at the palace of king alcinous..."
blank-line blocks in the region: 26  (an OUTPUT) — served paragraphs 26
byte-identical paragraphs      : 24 of 26
footnote-marker deletions      : 2, markers [55, 56], ascending, no repeats
letter-case differences 0   whitespace-only 0   every other difference 0
3,435 words compared word for word, 0 mismatches
```

**The second-best match is reported, not merely bounded**, and reporting it is
the point: it is 37 tokens against the chapter's 3,459, and it is **Athena's
beautification of Odysseus at B06-P018**, which Homer repeats at Book 23. A
bound would have had to be a constant, and a constant would have been wrong,
because Homeric formulas recur by design and the length of the longest
recurrence is a property of the poem, not of this check.

**Two independent corroborations, neither of them arranged.** The span starts
at PG token **28997** — which is the number the **Book 5 residue rule**
(`../scripts/verify_source_book5.py`, the sixth rule) read out independently as
where chapter 6 begins, from an alignment that never looked at chapter 6. And
the tokens on each side of the span are checked against the **served file's own
`title` field** for chapters 6 and 7, so "nothing of Butler's is missing here"
is a result rather than an assumption.

**The audit found a bug in the rule as first written, as the last three audits
did.** Recovering a character span from a token span, the rule ran
`raw[start_of_token(lo) : end_of_token(hi-1)]` — which stops on the last
*letter* of the chapter and therefore drops its terminal full stop. It reported
a word-for-word mismatch, `home` against `home.`, on a file that is byte-clean.
The recovery must run to the first character of the **next** token. Fixed in
place, with the bug named in the source.

**Controls, under D18** (`../scripts/controls.py`): six, each asserting both
that its mutation changed the input **and** that the check's verdict changed —
one letter changed, one word dropped, two paragraphs swapped, a sentence that
is not Butler's appended, a changed number-**word**, and a **twelve-word run
deleted**, which is the mutation that defeated the Book 5 reviewer's rule at
records finding R-2. Two blindnesses are declared with the checks that carry
them: a changed **digit** inside the region (the profile is letter-only;
carried by the assertion that every digit run in the region is a classified
marker) and a defect PG itself carries (carried by the other seven rules).

## 2. Names — the closed table gains NO row

| Butler | modern edition | count, source = candidate |
|---|---|---|
| Ulysses | **Odysseus** | 14 |
| Minerva | **Athena** | 11 |
| Jove | **Zeus** | 6 |
| Neptune | **Poseidon** | 3 |
| Diana | **Artemis** | 2 |
| Vulcan | **Hephaestus** | 1 |

Every Roman name in this Book is already in `../GLOSSARY.md`'s closed table.
**Nothing is added, and that is worth asserting rather than passing over**: the
table grows only when a Book meets a name it does not carry, by enumeration
(D6), and a Book that adds nothing should say so.

**`Leto` is the hazard that did not fire, and it is named.** Butler writes the
**Greek** *Leto* at B06-P009, not the Roman *Latona*. A general Greek→Roman or
Roman→Greek deity list run in either direction would have had something to say
about her; the closed table has nothing to say, and she is untouched. So are
`Apollo` (his Greek name as well as his Roman one) and `Hades`.

**Already Greek and correctly untouched**: Nausicaa, Alcinous, Nausithous,
Dymas, Phaeacians/Phaeacian, Hypereia, Cyclopes, Scheria, Olympus, Taygetus,
Erymanthus, Delos, Ogygian, Leto, Apollo, Hades.

**Hazards asserted, not assumed.** `Ops`, `Same`, `Rhea`, `Helios`, `Cronos`,
`Ceres`, `Euryclea` and every other Roman form are 0 in the candidate. **D8
does not fire**: no figure in this Book has a Cast display name that differs
from Butler's spelling.

**D7 possessives.** `Dymas’s` (Butler's own, kept) and `Zeus’s` ×2 (from
Butler's `Jove’s`). No bare possessive of a name ending in *s* survives.

## 3. The `heaven` census, unbroken in this Book

Butler uses `heaven` seven times and the candidate seven. **No break is taken.**
Six are plainly the metonym or the formula (`inspired by heaven` P001, `dwell
in heaven` P013, `May heaven grant you` and `heaven has still much evil in
store` P014, `live in heaven` and `dwell in heaven` P019, `come down from
heaven` P022) and none is a position in the sky being measured, which is the
one case Book 4 broke.

**And Butler's own difference inside the census is kept.** He writes `live in
heaven` once and `dwell in heaven` twice; B06-P019 has **both, eleven words
apart**, and the candidate prints both. Flattening them would be the mirror
defect the instructions name — a difference Butler wrote turned into sameness —
and `dwell` is current literary English, not an archaism.

## 4. D3, D4, D12 — what does and does not fire

- **D3 (no quantity supplied for a hecatomb).** Does not fire: no hecatomb in
  Book 6. `hecatomb` is asserted absent from source and candidate alike.
- **D4 (Butler's unclosed quotation across a paragraph break).** **FIRES TWICE**,
  and this is the first Book since Book 4 in which it does.
  **Odysseus's speech** runs B06-P013 → B06-P014; **Nausicaa's** runs
  B06-P021 → B06-P022 → B06-P023. Each continued paragraph opens its own mark
  and only the last of each run closes. **18 opening marks and 15 closing, in
  the source and in the candidate**, with the same three paragraphs unbalanced
  in both (P013, P021, P022). Reproduced exactly; "fixing" it would tell the
  reader that Odysseus stopped speaking and started again.
- **The nested single quotation at B06-P022 is preserved**, marks and all:
  Nausicaa quoting the imagined `‘Who is this fine-looking stranger…’` of a low
  fellow in the town. One `‘`, and its `’` — the other eleven `’` in the Book
  are apostrophes.
- **D12 (Butler's square brackets).** Does not fire. No bracket occurs in the
  source or the candidate.
- **D16 (a Victorian punctuation slip).** **FIRES ONCE, at B06-P020**, and v1
  made the repair without recording it — records finding **R-2** of round 1.
  Butler writes *“She got the linen folded and placed in the waggon, **she**
  then yoked the mules”*: a comma splice, which a modern reader reads as an
  error and not as an old-fashioned but correct pointing, so **D16** says
  repair. The candidate repairs it in the direction of the defect and by the
  smallest edit — the second subject is dropped and the two clauses become one
  compound predicate, *“She got the linen folded and placed in the wagon, then
  yoked the mules”*. The disposition was right; the record was missing. Book 4
  named its three D16 instances in its own `continuity.md` and this Book named
  none, which is one class with two dispositions — the shape D16 exists to
  forbid. Asserted by name in `scripts/build_book06_v2.py`.
- **D14 (the served original is not the base text).** Does not fire; Book 6 is
  byte-clean against PG apart from the two classified markers.

## 5. Paragraph-level decisions

- **B06-P005 — one word supplied, and it repairs a real defect.** Butler:
  *"Her mother was sitting by the fireside spinning her purple yarn with her
  maids around her, and **she** happened to catch her father just as he was
  going out…"* — where `she` is **Nausicaa**, but the nearer subject is the
  mother, and a modern reader takes the wrong one. The candidate divides the
  sentence and prints **`Nausicaa happened to catch her father`**. This is the
  same class as accepted B05-P012's supplied `and` (ruling 2 of Book 5's round
  1: *a defective sentence is repaired by the smallest edit in the direction of
  the defect*), and it is the reason the candidate's `Nausicaa` count is **11**
  against the source's **10** — the one name count in the Book that does not
  match, asserted by name rather than hidden. **Put to the reviewer as
  question 1.**
- **B06-P001 — `did Minerva hie in furtherance of the return of Ulysses`**
  becomes **"Athena made her way, to help bring Odysseus home"**. `hie` is dead
  and `in furtherance of` is a legal register Butler does not otherwise use.
- **B06-P004 — Butler's `but` is kept at the division.** *"neither rain nor
  snow can fall; **but** it abides in everlasting sunshine"* — the `but` is the
  turn of the sentence, and a draft of this paragraph that divided at the
  semicolon dropped it. Restored before freezing: the semicolon becomes a
  comma and the sentence stands whole. This is Book 5's finding 30.1 caught in
  advance.
- **B06-P009 — `herbage` is rendered `grass` here and `greenery` in accepted
  Book 5.** Butler writes *"the sweet juicy herbage that grew by the water
  side"* (pasture for the mules) and, at B05-P006, *"the beds of violets and
  luscious herbage"* (garden planting, rendered **`lush greenery`** in accepted
  `book05/candidate-v2.json`). One Butler word, two renderings across Books —
  the package's characteristic defect — **except** that the referents are
  different and each rendering is the right English for its referent.
  Recorded rather than resolved, because a drafter cannot certify its own
  discrimination. **Put to the reviewer as question 2.**
- **B06-P009 — the Artemis simile is left long, at 60 words against Butler's
  67.** It is the only sixty-word sentence in the candidate. The chain is the
  figure — Artemis on the mountains, the nymphs, Leto's pride, and only then
  the comparison — and this is the **B04-P038** disposition applied to a simile,
  as accepted Books 4 and 5 applied it. Butler's parenthesis is opened out into
  the sentence and the closing *"Even so did the girl outshine her handmaids"*
  is given its own sentence, so the simile is **shorter** than Butler's, not
  longer (Book 5's finding 30.2: a recast that grows Butler's sentence is a
  defect).
- **B06-P012 — the deliberation divided, and a semicolon ADDED.** Butler:
  *"he doubted whether he should go up to her … or stay where he was and
  entreat her…"* The candidate prints *"and he did not know what to do. He might
  go up to her … **;** or he might stay where he was…"* — Butler's own `or`
  joint raised from a comma to a semicolon. `doubted whether` is deliberately
  **not** rendered `still undecided`: that is the package's fixed rendering for
  Butler's *other* phrase, `thus in two minds` (accepted B04-P011, B05-P028,
  B05-P032), and using it here would flatten two Butler phrases into one.
- **B06-P012 — `in quest of` → `in search of`, `begrimed` → `caked`.**
  `unkempt`, `famished` and `exulting in his strength` are kept: they are not
  archaic.
- **B06-P013 — `so fair a scion as yourself`** becomes **"so fair a young
  woman as yourself"**. *Scion* in this sense (offspring, a young shoot) is
  dead in ordinary English, and **`creature`** — which would carry the tone —
  is unavailable: it is the edition's rendering of Butler's own `creature` at
  accepted B05-P010, and using it here would be finding 9.1's defect exactly,
  two Butler words flattened into one.
- **B06-P013 — the palm tree's clause order is untangled.** Butler: *"a young
  palm tree **which I saw when I was at Delos growing near the altar of
  Apollo**"*. The candidate: *"a young palm tree that I saw growing near the
  altar of Apollo when I was at Delos"*. Nothing is added or dropped; the
  participle is returned to the noun it modifies.
- **B06-P014 — `It discomfits their enemies`** becomes **"It thwarts their
  enemies"**. *Discomfit* is dead in this sense, and **`dismays`** is
  unavailable under the Book 1 row that keeps `dismay` and `grief` apart.
- **B06-P018 — `skilful workman`** becomes **`skillful workman`**, the American
  spelling of Butler's own word, and **not** `skilled`: Butler writes `skilled`
  himself at accepted B05-P020 (*"as a skilled shipwright"*), and rendering both
  with one word would flatten a distinction he wrote.
- **B06-P023 — `topes`** becomes **`drinks`**; **`gain her over`** becomes
  **`win her over`**; **`bearing-posts`** is kept with Butler's hyphen, because
  it is his own compound for a part of the house and the sentence shows what it
  is (she leans back against one of them).
- **B06-P003 — `you are not going to remain a maid much longer`** becomes
  **"you are not going to remain unmarried much longer"**. Butler's *maid* here
  means *unmarried girl*; the modern reader's first sense of *maid* is the
  servant, and the Book's own `maids` are servants, eleven of them.
- **`aldermen` is kept** (B06-P005). It is current English and it means exactly
  what Butler means: members of a town council, which the same sentence names.
- **`Papa dear` is kept** (B06-P006). It is Butler's, it is in character, and
  it is the one place in the poem where a princess talks like a Victorian
  daughter; modernizing it would be a retelling.

## 6. Connectives — one Butler form, one rendering

| Butler | count | modern edition | where |
|---|---|---|---|
| `On this` | 3 | **At this** | P008, P010, P017 |
| `whereon` | 1 | **At that** | P008 |

The accepted Book 3/4/5 rows, applied across a Book. `Thereon`, `at which` and
the sentential `on which` do not occur in Book 6 and are asserted absent from
the candidate.

## 7. Formulas carried from the accepted Books

- **`aegis-bearing Zeus`** — B06-P009 and B06-P025, matching accepted
  **B03-P031**, **B04-P066** and **B04-P068**. Lower-case `aegis-bearing`;
  *aegis* kept, unglossed, per the Book 3 row.
- **The prayer formula.** B06-P025's *"Hear me, daughter of Aegis-bearing Jove,
  unweariable"* is accepted **B04-P068**'s formula word for word, including
  **`unweariable` → `unwearying`**. Carried exactly.
- **`thought of another matter`** — B06-P020, for Butler's `bethought her of
  another matter`, matching accepted **B04**'s two instances of the same
  formula.
- **`as I tell you`** — B06-P021 and B06-P023, for Butler's `as I bid you`,
  matching accepted **B05-P026**.
- **`In the end he thought it best to…`** — B06-P012, for Butler's `deemed it
  best`, matching accepted **B05-P037** word for word.
- **`still undecided` is deliberately NOT used** — see §5, B06-P012.

## 8. Compounds, under D15

| direction | Butler | edition |
|---|---|---|
| closed | `maid servants`, `goat skin`, `market place`, `road side`, `water side`, `sea side`, `sea-faring`, `farm lands` | `maidservants`, `goatskin`, `marketplace`, `roadside`, **`waterside`**, `seaside`, `seafaring`, `farmlands` |
| hyphenated | `well made`, `well fenced`, `good looking` | `well-made`, `well-fenced`, `good-looking` |
| open, kept open | `washing-cisterns` / `washing cisterns`, `sea captain`, `linen room`, `washing day`, `well dressed`, `salt water`, `mountain tops`, `land’s end`, `garden ground` | `washing cisterns` (Butler sets it both ways in one Book; the open form is the modern standard and is used in both places), `sea captain`, `linen room`, `washing day`, `well dressed` (predicative), `salt water`, `mountain tops` (matching accepted B05-P030), `land’s end`, `garden ground` |
| Butler's own, untouched | `aegis-bearing`, `bearing-posts`, `fine-looking`, `ill-natured`, `well-disposed` | unchanged; `well-disposed` matches accepted Books 2 and 5 and the Book 4 successor |

**`water side` → `waterside` reopened accepted Book 2, and the check that
caught it had to be extended first.** `water-side` occurs **nowhere** in
PG #1727 — Butler always sets it open — so the hyphen-keyed `compound_drift()`
that produced the `seashore` successors could not see this pair at all. That is
**blind spot 1** of Book 5's round 1, the one the reviewer said only a reader
could catch. `../scripts/compound_drift.py` now also admits a pair whose
concatenation is printed as a single word somewhere in the corpus, guarded by a
function-word stoplist and a three-letter minimum (without which `any one`,
`on to`, `up on` and `her a` flood the report). It raises the pair, and
`book02/candidate-v5.json` answers it — the fourth successor the compound rule
has cost, and the first found by a check rather than by a reader.

## 9. American spelling (D9)

`harbour` → `harbor`, `neighbours` → `neighbors`, `skilful` → `skillful`,
`judgement` → `judgment`, `uncivilised` → `uncivilized`, `scandalised` →
`scandalized`, and `waggon` → **`wagon`** ×11 — the Book's most frequent single
change. `endeavors` is already American in PG and is replaced for sense
(`efforts`), not for spelling. `amongst` → `among`; `hither` → `here`;
`thence` → `from there`; `wherein` → `in which`; `for ever and ever` is kept as
the set phrase.

## 10. The splitting rate and the semicolon count (D17, D19)

**116 → 148 sentences (+27.6%), and six of Butler's seven sixty-word periods
are broken. Butler's 27 semicolons become 4.**

The two numbers must be read together, and **D19 exists because of Book 5's
S-1**: a semicolon rewritten as a period adds a sentence, moves no clause,
drops no word and costs no retention, so it scores at full value on both of
D17's axes while leaving the architecture exactly as Butler built it. **23 of
this Book's 32 added sentences are at most that operation.**

**What says the rest is real is the retention figure: 0.93669** — below Book 5
v1's 0.94211, which was convicted of doing nothing *but* convert, and below the
accepted Book 5 v2's 0.93808, which was corrected for it. Division costs no
retention; only moving clauses does. The four paragraphs where Butler's period
still governs and real recasting was owed are **P004** (the dropped `but`),
**P005** (the referential `she`), **P012** (the deliberation) and **P013** (the
57-word close of the speech), and they are named in §5.

**One sixty-word sentence is left long**, B06-P009's Artemis simile, at 60
words against Butler's 67 — shorter than his, not longer.

## 11. What the drafter could not check, and hands to the reviewer

**The near-identical report, published** (records finding R-7 of Book 5's round
1: this report is to be printed, not summarized, and not paraphrased into the
review instructions). 40+ source words, ≤4 word-level edits:

| paragraph | source words | edits | longest candidate sentence |
|---|---|---|---|
| B06-P006 | 94 | 1 | 25 words |
| B06-P007 | 62 | 2 | 37 words |
| B06-P016 | 144 | 2 | 43 words |
| B06-P019 | 81 | 4 | 27 words |
| B06-P024 | 84 | 4 | 29 words |
| B06-P025 | 46 | 3 | 25 words |

Each was read again. **B06-P006 and B06-P016 are the two to look at**: 94 words
with one edit, and 144 words with two. Both are speech — Nausicaa to her father
and Nausicaa to her maids — and in both Butler is already writing plain modern
English (*"could you manage to let me have a good big wagon?"*, *"Can you not
see a man without running away from him?"*). **B06-P025 is a carried formula**
and is *supposed* to be near-identical, since accepted B04-P068 fixed its
wording. But "already plain" is exactly the claim Book 4's round 1 showed a
drafter cannot certify about its own draft.

**No paragraph is byte-identical to Butler**, and the empty list is asserted.

The one-word-two-ways report returns **75 rows**, almost all function words.
The content-word rows were read; the three that are real are recorded in §5
(`herbage`, `skilful`/`skilled`, `scion`/`creature`). That report is
noise-heavy by design and is a reader's instrument, not an assertion.
