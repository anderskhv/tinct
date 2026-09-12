# The Odyssey, Book 5 — independent review, round 1

**Subject:** `book05/candidate-v1.json`, sha256
`7acc5c346154e7d23c85eaa3c31ef25654600e4e122f455eb93a1bf3737a59cf` —
re-computed by this reviewer from the frozen file; matches.
**Source:** `book05/source-book5.json`, sha256
`c84e4bb2924d89250e4a943721703213bba0530c09641b662c93c4a8de02cd57`.
**Reviewed at** branch `claude/odyssey-modern-en-20260911`, commit `4abb6eae1`,
in a separate worktree. The candidate was **not modified** (**D10**); nothing
outside `book05/review/` was written.

## Verdict

**Accept after corrections.**

| severity | count |
|---|---|
| substantive | **1** (S-1) |
| minor | **14** |
| optional | **18** |
| records | **8** |

Minor: 6.1, 9.1, 10.1, 10.2, 14.1, 21.1, 22.1/28.1, 24.1, 30.1, 35.1, 36.1,
C-12, C-13, C-14.
Optional: 1.1, 3.1, 6.2, 7.1, 10.3, 12.1, 16.1, 17.1, 20.1, 21.2, 23.1, 25.1,
27.1, 32.1, 35.2, 37.1, C-15, and ruling 4's `between them`.
Records: R-1…R-7 and 30.2.

Book 5 is a real modernization, not a touch-up. Every mechanical number the
package reports reproduces exactly from the frozen files, the source
verification holds under a seventh rule devised here, and the four questions
the drafter raised were all worth raising — two of them are settled against the
draft. The one substantive finding is not that the draft did too little: it is
that **the operation it did most of is the one D17 counts at full value and a
reader notices least**, and three named paragraphs show what that leaves
undone.

---

## A. What reproduces, and by what

Everything below was re-run by this reviewer from the frozen files, not taken
from the drafter's report. Scripts: `book05/review/checks_review.py`,
`book05/review/verify_source_book5_review.py` (output in
`book05/review/verify-output.txt`).

| measure | drafter | reviewer | agrees |
|---|---|---|---|
| candidate sha256 | `7acc5c34…` | `7acc5c34…` | yes |
| paragraphs | 37 → 37 | 37 → 37 | yes |
| words | 4,666 → 4,660, ratio 0.9987 | 4,666 → 4,660, ratio **0.99871** | yes |
| Butler token retention | 0.94211 | **0.94211** | yes |
| sentences | 153 → 189, +23.5% | **153 → 189, +23.5%** | yes |
| sixty-word sentences | 9 → 3, 67% broken | **9 → 3, 67% broken** | yes |
| D17 gate | pass | pass (rate 23.5% ≥ 2.75%; survival 0.33 ≤ 0.75) | yes |
| quotation marks | 31/31 both sides, 0 unbalanced | **31/31, 0 unbalanced** | yes |
| ASCII quote or apostrophe | none | **0** | yes |
| name census | 29/12/9/6/6/1/1, no Roman form | identical | yes |
| `heaven` census | 4 → 4, unbroken | **4 → 4** | yes |
| byte-identical paragraphs | none | **none** | yes |

The README's own check block runs green end to end, unmodified, from the frozen
files. `scripts/verify_source_book5.py` runs green. **No number in the package
is wrong.** The three things that are wrong are in the *prose around* the
numbers, and they are R-3, R-5 and finding C-13 below.

## B. The source, verified by a seventh rule

`book05/review/verify_source_book5_review.py`. The six rules already used are
listed in `RESUME.md`; this is a seventh, and it is unlike all six:

> **One global monotone diff of the whole edition against the whole file.**
> Concatenate all 24 served chapters into one ordered token stream. Take the
> **whole** PG #1727 file as one ordered token stream — front matter, preface,
> footnotes, transcriber's note, licence, everything; no region is selected,
> trimmed or chosen by anybody. Run one order-preserving alignment between the
> two, with no anchors, no needles, no fingerprints and no arithmetic on
> chapter lengths. Then read off, **after the fact**, where the tokens that
> happen to belong to chapter 5 landed.

It is not the residue rule: nothing is subtracted, contiguity is never assumed,
and the result is whatever span the aligner produced, holes included. It is not
fingerprint alignment: the unit is the single token, so a merged, split or
half-deleted paragraph would still align. Nothing is searched for — the aligner
is never told chapter 5 exists.

**Result.** 118,031 edition tokens against 132,902 file tokens, 29 matching
blocks. Chapter 5: **4,709 tokens, 4,709 aligned (1.00000)**, PG token span
`[24226, 28935)`, **0 PG tokens left unclaimed inside the span**, and **all 37
paragraphs aligned token for token at 100%**. Read out of the same single
alignment, chapter 4 ends at token 24216 and chapter 6 begins at 28943, so
chapter 5's span lies strictly between them, pinned from both sides by
monotonicity alone.

**The audit found a bug in this rule, and it is the same bug the drafter found
in its own — one level deeper.** The first version reported one statistic, the
fraction of *chapter-5* tokens that aligned. A control that deleted a twelve-word
run from B05-P019 **changed the text, asserted that it had, and still did not
fire**: every surviving token still aligned, and the figure stayed at 1.00000.
The rule now carries a second, PG-side statistic — how many of PG's tokens
inside the span were left unclaimed — and the deletion opens a thirteen-token
hole there. All five controls now fire (word swap, twelve-word deletion,
longest-word replacement, paragraph reversal, a Book 9 paragraph imported into
Book 5's slot); each asserts its own mutation changed the text first. See R-2:
asserting the mutation is necessary and **not sufficient**.

**The residue-exhaustion claim holds, and my rule corroborates its arithmetic
independently.** The drafter says the residue is exhausted by chapter 5's
heading, the served chapter 5 and chapter 6's heading. From my alignment, the
gap between chapter 4's last aligned token and chapter 5's first is **9**
tokens — exactly `book v calypso ulysses reaches scheria on a raft` — and the
gap between chapter 5's last and chapter 6's first is **8** — exactly
`book vi the meeting between nausicaa and ulysses`. Two unlike rules, same two
leftovers, same sizes.

**The 32 byte-identical paragraphs and the five markers are defensible, and I
checked the markers against PG's own footnote list rather than against the
drafter's classification.** 37 blocks, 32 byte-identical, and five paragraphs
differing by exactly one deleted digit run: `50` (block 4), `' 51'` (block 6,
space-set), `52` (block 9), `53` (block 20), `54` (block 35). PG carries
footnote entries `[50]`…`[54]` and no others in this range; each marker sits
where its note belongs (`Scheria,50`; `…over which they flowed. 51`;
`Minerva,52`; `water.53`; `salt54 stream`), the five are ascending without
repeat, and the region contains no other digit run. Four are glued to the
preceding word and one is space-set — which is why `salt54 stream` yields
`salt stream` and `flowed. 51` yields `flowed.` with the space taken too. The
classification is right, and 32 + 5 = 37 accounts for every paragraph.

**Verdict on the source: it holds.** Two unlike rules, one of which cannot be
steered by the thing it checks and one of which never looks for it.

---

## C. Findings

Severity is marked on each. Paragraph-level findings are numbered `NN.n` by
paragraph; cross-cutting ones `C-n`; records `R-n`.

### S-1 — the splitting rate is bought with semicolons, and clause order is untouched — **substantive**

Book 5 reports the **highest splitting rate in the package** (+23.5%, against
+20.5%, +16.1%, +5.5%, +8.9%) and the **second-highest retention** (0.94211,
against 0.727, 0.902, 0.897, 0.95872). Those two facts have one cause, and the
gate cannot see it.

Butler's Book 5 carries **34 semicolons**. The candidate carries **14**. Twenty
of Butler's semicolons have become full stops. A semicolon rewritten as a period
adds one sentence, moves no clause, drops no word and costs no retention — so it
scores at full value on both of D17's axes while leaving the sentence's
architecture exactly as Butler built it. **Twenty of the thirty-six added
sentences come from that one operation.** This is precisely the blindness D17
declares of itself: chain load predicts splitting (ρ = +0.380) and does not
predict clause order (ρ = +0.048), so a draft that divides Butler's sentences
and leaves every clause in his order passes. Book 5 largely is that draft.

This is **not** a reason to reject, and it is a weaker finding than Book 4's
S-1. Breaking Butler's semicolons is the *correct first move* — they are the
true seams of his periods — and Book 5 also does real vocabulary work
(`forthwith`, `wherein`, `hither and thither`, `polypus`, `no whit`,
`wherefore`, `deemed`, `harbinger`, `staid`, the whole archaism list) and a
number of genuine comma-level recasts. The finding is that the *cheap*
operation was done everywhere and the *expensive* one almost nowhere, and three
paragraphs show the cost.

**The package's own `near_identical()` report, run on Book 5, flags eight
paragraphs** at 40+ words and ≤4 word-level edits: **P001** (60w, 4), **P003**
(59w, 2), **P013** (108w, 1), **P015** (97w, 3), **P016** (92w, 3), **P017**
(119w, 4), **P018** (90w, 1), **P029** (51w, 2). Of these, P013, P018 and P029
are defensible (see their entries). The three where clause order is doing real
damage are:

- **B05-P017** — the 62-word sentence, question 5. See ruling 5.
- **B05-P021** — `…and which turns round and round where it is, facing Orion,
  and alone never dips into the stream of Oceanus—for Calypso had told him to
  keep this on his left.` Fifty-four words in which a trailing causal clause
  reaches back over a thirty-word astronomical parenthesis to a main clause the
  reader has lost. Butler's order; the candidate's too. The repair is not a
  division at a semicolon — there is none — it is moving the Calypso clause to
  the front of its own sentence: *Calypso had told him to keep the Bear on his
  left, so he never closed his eyes, but kept them fixed on…*
- **B05-P009** — `He says that you have here the most ill-starred of all those
  who fought nine years before the city of King Priam and sailed home in the
  tenth year after sacking it.` The relative chain `all those who fought … and
  sailed home …` is Butler's Victorian suspension and it survives whole. No
  semicolon, so no division was available, and none was attempted.

**Recommendation.** Not a rebuild. Recast these three in v2, and — for the next
Book — **report the semicolon-to-period count beside the splitting rate**, so
that D17's number can be read against the cost of producing it (see R-6).

### Compounds — D15 is applied to eight and suspended for five

The Book closes eight compounds correctly (`sandalwood`, `homesickness`,
`seagull`, `goatskin`, `yardarm`, `foothold`, `hillside`, `daytime`) and
hyphenates one (`well-found`). It then leaves five alone. D15 is not "keep
Butler's setting unless it is odd"; it is "the modern standard form, in
whichever direction that moves Butler". These five are findings, and the first
is the failure mode D15 names by name.

- **35.1 — `sea-water` → `sea water`. A third form. — minor.** Butler
  hyphenates; the candidate opens; modern English closes (`seawater`). This is
  `sea-side` → `sea side` exactly, which Book 4's finding 37.1 corrected to
  `seaside` and which `PUNCTUATION.md` §4 names as "the failure mode the rule
  exists to prevent … landing on a third form." **Read `seawater`.** It is not
  in `continuity.md`'s compound table at all.
- **24.1 — `half way` kept. — minor.** `…broke the mast half way up…`. Modern
  standard is closed: **`halfway`**. Not recorded.
- **36.1 — `river bed` kept, `hill side` closed, in the same paragraph. —
  minor.** B05-P036 closes `hill side` → `hillside` and, eleven words earlier,
  leaves `river bed` open. Modern standard is **`riverbed`**. The internal
  inconsistency is the point: one paragraph, two dispositions for one class.
  `continuity.md` records `river bed` as "open, kept" without a modern-standard
  warrant.
- **10.1 — `mid ocean` kept. — minor.** Modern standard is **`mid-ocean`**.
  Cross-Book: accepted **Book 1** met Butler's `mid ocean` and dissolved it
  (`out in the ocean`), so the package now has one Butler compound rendered two
  ways across Books — the characteristic defect, in the class `hyphen_drift()`
  is blind to.
- **6.1 — `sweet smelling` kept. — minor.** `…a thick wood of alder, poplar,
  and sweet smelling cypress trees…`. An attributive compound modifier; modern
  standard is **`sweet-smelling`**. Accepted Book 4 hyphenated exactly this
  class (`fine spun` → `fine-spun`, `violet coloured` → `violet-colored`).
  Not recorded.

### Word-level and cross-Book

- **9.1 — `choice hecatombs` → `choice offerings`. — minor.** D3's *no number*
  requirement is met and that part is right. The **word** is not: across the
  three accepted Books that meet a hecatomb, every one renders it
  **`sacrifice`** — `a great sacrifice of sheep and oxen` (B01),
  `the fine sacrifice` / `great sacrifices` (B03), `my great sacrifices` /
  `holy sacrifices` / `sacrifices` (B04) — and every one reserves
  **`offering`** for Butler's own `offering` (`drink offering`, `burnt
  offering`, twelve times across Books 1–4). Book 5 now renders *hecatomb* with
  the word the package uses for *offering*: **two Butler words flattened into
  one rendering**, which is the mirror defect the instructions name. The
  drafter's reason for avoiding `sacrifices` is good — Butler's own
  `sacrifices` stands four words earlier and `sacrifices or choice sacrifices`
  is absurd — so the repair is a third word, not `sacrifices`: *"…no cities
  full of people to offer me sacrifices or choice victims"* is one option that
  keeps the pair, supplies no number, and does not collide.
- **14.1 — `mischief` → `harm`, colliding with P015's `harm`. — minor.**
  Butler wrote two different words eleven lines apart: Odysseus demands an oath
  *"that you mean me no mischief"* (P014) and Calypso swears *"that I mean you
  no sort of harm"* (P015). The candidate renders both with `harm`, producing a
  verbal echo Butler did not write, in the one exchange of the Book where the
  exact words of an oath are the subject. *"that you mean me no trick"* or
  *"no harm by it"* keeps the two apart.
- **10.2 — `Nevertheless` rendered two ways. — minor.** Kept at B05-P009 and
  B05-P018; rendered `All the same` at B05-P010. One Butler connective, two
  renderings — Book 4's finding 64.2 class. The connective assertion block in
  the README covers only `Thereon`, `On this` and `whereon`; it should cover
  this one too.
- **22.1 / 28.1 — `saying` dropped twice, kept once. — minor.**
  `muttered to himself, saying,` loses `saying` at B05-P022 and B05-P028;
  `Calypso spoke, saying:` keeps it at B05-P016. The kept one is as Victorian
  as the dropped ones. Either disposition is fine; two for one class is not
  (**D16**'s standard, applied to a tag rather than a mark).
- **30.1 — `but the gods deliver him from evil` → `and`. — minor.** In the
  simile of the children and the recovering father, Butler's `but` turns the
  clause: the father has borne long affliction *but* the gods deliver him — and
  the turn is the whole point of the comparison, because Odysseus is at the turn
  too. `and` flattens it into a list. Restore `but`. (The instructions warn
  against "a division that drops a connective Butler needed"; this one is not
  dropped by a division, but it is dropped.)
- **21.1 — the division at `She gave … She also gave …`. — minor.** See
  ruling 4. Butler's semicolon became a period and left two consecutive
  sentences opening `She`, both `gave him a`. This is the Book 4 flow-read F-1
  shape exactly.

### Record-keeping and checks

- **C-12 — `continuity.md` §8's compound table is incomplete. — minor.** It
  omits `sweet smelling` (kept, silently), `half way` (kept, silently) and
  `sea-water` → `sea water` (moved, silently). D15 makes the *typographic*
  change silent; it does not make the table optional, and the table is the only
  place a later Book can look up what this Book did. Three of thirteen
  compounds touched by this Book are not in it.
- **C-13 — `review-instructions.md`'s near-identical claim does not reproduce.
  — minor.** It says "B05-P014, P019 and P030 are within one or two word-level
  edits of Butler at 40+ words." Run the package's own `near_identical()`:
  **P014 is 84 words with 14 edits; P019 is 23 words, below the 40-word
  threshold; P030 is 184 words with 25 edits — one of the most-edited
  paragraphs in the Book.** The real list is the eight named in S-1, and the
  five the reviewer was never told about (P001, P003, P013, P015, P016, P018,
  P029) include the two lightest-touched paragraphs in the Book. Question 5's
  separate figure for P017 — "119 words, four word-level edits" — reproduces
  exactly, so the report itself was run; only the sentence quoting it is wrong.
  **A reviewer steered to the wrong three paragraphs is a review that did not
  happen where it was needed.**
- **C-14 — `verify_source_book5.py`'s containment guard is half vacuous. —
  minor.** Line ~205:
  `if not lo <= at and at + len(b5) <= hi: fail(...)`. Python binds this as
  `(not (lo <= at)) and (at + len(b5) <= hi)`, so the guard cannot fire when the
  served chapter 5 is found **after** the residue. The intended form is
  `if not (lo <= at and at + len(b5) <= hi):`. The error is caught downstream
  by the heading comparison, so the script's verdict is not wrong — but a guard
  that cannot fail for half its cases is the same defect class as a control that
  cannot fail, in the same file, four lines from the comment that boasts about
  fixing it.

---

## D. The four rulings

### Ruling 1 — `sea shore` → **`seashore`**, and yes, extend `hyphen_drift()`

**`seashore`.** D15 says the modern standard form, in whichever direction that
moves Butler, and `seashore` is the modern standard form — closed in every
current dictionary, and the change does not alter what a reader says aloud, so
it passes D15's own typographic test and is made silently. The argument for
keeping the open form is precedent, not English; and the package has already
ruled that a settled-but-wrong form gets a successor rather than tenure
(Book 3's finding 27.1 → `book02/candidate-v3.json`). Keeping `sea shore`
inside a Book that closes `seagull`, `goatskin`, `homesickness`, `daytime`,
`foothold`, `hillside`, `sandalwood` and `yardarm` is not consistency — it is
D15 applied to eight neighbours and suspended for the ninth.

**The cost is larger than the drafter states, and this should be recorded.**
`review-instructions.md` and `RESUME.md` both say accepted **Book 4** asserts
the open form. Accepted **Books 2, 3 and 4** all print it, one instance each
(`book02/candidate-v3.json`, `book03/candidate-v2.json`,
`book04/candidate-v2.json`). The ruling therefore costs **three successors**,
not one — `book02/candidate-v4.json`, `book03/candidate-v3.json`,
`book04/candidate-v3.json`, one word each — plus the two instances in Book 5's
own v2. That is still the right trade: five words now against a fourth
rediscovery later.

**Extend `hyphen_drift()` to the closed/open axis — yes.** The generalization is
one line: key each compound on its letters with the separator stripped
(`seashore`, `sea-shore` and `sea shore` all key to `seashore`), collect the
*set of settings* observed per key across the accepted Books, and fail on any
key with more than one setting. That subsumes the hyphenated-vs-open comparison
it already does, catches closed-vs-open, catches hyphenated-vs-closed, and would
have raised `sea shore` at Book 3 rather than at Book 5. It would also raise
`mid ocean` (finding 10.1) today.

### Ruling 2 — the word supplied at B05-P012: **supplying it is right**

Butler prints *"Calypso then went close up to him said:"*. The candidate prints
*"Then Calypso went close up to him and said:"*. **Upheld.**

The comparison the drafter offers — accepted B03-P028, where a stray `and` was
*dropped* and no word supplied — is the right comparison but it cuts the other
way, and that is why this is the correct disposition rather than merely a
tolerable one. In B03-P028 the defect was a word too many, so the minimal repair
was subtraction. Here the defect is a word too few, and the minimal repair is
addition. The package's rule under **D16** is that a mark a modern reader reads
as an error is repaired; the same logic covers a missing conjunction, which a
modern reader reads not as archaism but as a typo. `and` is the only word the
sentence can take, it supplies no content, no emphasis and no ambiguity, and it
leaves Butler's clause order and every other word untouched.

Recasting to avoid supplying anything would be worse: any recast must move
`then`, and `then` is doing sequencing work in a paragraph that has just moved
from the daytime rocks back to Calypso. (The candidate does move `then` — to the
front, `Then Calypso` — which is a separate and unobjectionable change, since
Butler's post-subject `then` is the Victorian setting.) **Uphold, and record the
class in `PUNCTUATION.md` §5 beside the two D16 repairs: a defective sentence is
repaired by the smallest edit in the direction of the defect — subtraction for a
word too many, addition for a word too few.**

### Ruling 3 — the `heaven` census: **keeping `heaven` at B05-P023 is right**

*"How black Zeus is making heaven with his clouds"*. **Upheld, and the line
Book 4 drew is the right line.**

Book 4 broke its census once, at *"mid heaven"*, and named the break because
that instance was **a position in the sky being measured** — *mid* heaven is a
coordinate, and rendering a coordinate with the word the edition otherwise uses
as a metonym for the gods would have been a category error. B05-P023 is the
opposite case in the same family. Zeus is the subject of the verb; he is
*making heaven black with his clouds*; the sky and its owner are the same
referent in the sentence, and that identity is the line's rhetorical point —
Odysseus is not reporting weather, he is naming who is doing it. Replacing
`heaven` with `the sky` would leave `Zeus is making the sky black`, which is
weather. The metonymic reading is not merely "live", as the drafter puts it: it
is load-bearing.

The remaining three instances (`the gods in heaven`, P013; `heaven may send
some great monster`, P031; `may heaven above and earth below be my witnesses`,
P015) are all plainly the metonym or the formula. **4 → 4, unbroken, correct.**

### Ruling 4 — `battledore and shuttlecock` → `batting it back and forth between them`: **upheld, with one word to reconsider**

**The image is preserved at the same scale and nothing material is added.**
Butler's simile is four winds striking one light object to and fro; the game
supplies only the *manner* of striking, and its name is opaque to a modern
reader in a way `furs` → `ruffles` (Book 4, upheld) was not — `battledore` names
nothing a reader can picture, where `furs` at least named a thing. `batting it
back and forth` keeps the lightness, the alternation and the sport-like
casualness that make the raft's helplessness funny and horrible at once. This is
the right call and it is the Book's only image-word replacement, which is the
correct ratio.

**One word.** `between them` supplies a relation Butler leaves implicit and, with
four winds named in the same clause, `between` is the wrong preposition for the
reciprocity being described — Butler's `with it` is directed at the object, not
at each other. `…were all batting it back and forth at once` says everything the
image needs and adds nothing; the `at once` already carries the four-way
simultaneity. **Recommend dropping `between them`** — optional, not required.

### Ruling 5 — the 62-word sentence at B05-P017: **divide it**

This is the one the drafter was least sure of, and the doubt was right.

First, a correction to how it is framed. `review-instructions.md` says "three of
Butler's nine sixty-word periods survive". **None of the three survives.**
Butler's B05-P017 period is 102 words; the candidate split it and what remains
is a 62-word *residue*, not a surviving sentence. B05-P030's 62-word simile was
recast and came out at **65** — three words *longer* than Butler's. B05-P037's
61-word simile came out at 60. The count `9 → 3` is correct; the word "survive"
is not (R-5).

Second, the ruling. The **B04-P038 disposition does not apply here.** B04-P038
was left standing because its shape *was* the content — a single 105-word period
whose accumulation is the effect. That argument works for P030 and P037, where
the chain is a simile and the piling-up is the figure, and those two are
correctly left long. It does not work for P017, and the draft itself shows why:
the drafter **found the seam and then stopped at it**. Butler has a comma —
`…let me make you immortal, no matter how anxious you may be…` — and the
candidate raised it to an **em dash**. An em dash is the drafter saying *this is
where the sentence turns* and then declining to turn it.

The sentence as it stands opens with a 26-word conditional protasis before the
main clause arrives, then runs three coordinated verbs, then hangs a 22-word
concessive off the end, and closes on `of whom you are thinking all the time,
day after day` — a fronted relative that is the single most Victorian
construction left in the Book. Calypso's offer of immortality is the emotional
centre of the Book, and it is the one long sentence in it that a reader has to
re-enter.

**Divide at the dash, and unwind the relative:**

> …you would stay where you are, keep house along with me, and let me make you
> immortal. It makes no difference how anxious you are to see this wife of
> yours, the one you think about day after day.

That is one more sentence (190, not 189), no clause moved out of Butler's order,
and `of whom you are thinking` gone. **It also makes the point of S-1
concretely:** the change costs retention and gains nothing on D17's second axis,
which is exactly why the gate did not ask for it.

---

## E. Answer to the question behind question 2's neighbour — the no-op control shape, and how far it reaches

The drafter asks whether any *other* control in the package has the shape it
found in its own — `paragraph.replace("the", …)`, a mutation that is a no-op if
the paragraph happens not to contain `the`.

**It reaches three further places, and none of them is a no-op today.**

| file | line | control | no-op today? | mutation asserted? |
|---|---|---|---|---|
| `scripts/verify_source_book4.py` | 234 | `typo[40].replace("the","teh",1)` | no — B04-P041 contains `the` | **no** |
| `book04/review/verify_source_book4_review.py` | 275 | `edited[20].replace('the','teh',1)` | no — B04-P021 contains `the` | **no** |
| `book03/review/verify_source_book3_review.py` | 135 | `.replace('Nestor','Nestorr',1)` | no — `Nestor` occurs in Book 3 | **no** |

Two more have the weaker form of the same shape — an **unasserted
precondition** rather than an unasserted mutation:
`scripts/verify_source_book4.py:236` drops the last word of `served[9]` and
`book04/review/verify_source_book4_review.py:280` drops the sixth word of
`paras[30]`; both are effective only because those paragraphs happen to be 68
and 72 words long, and neither says so. Book 2's two controls are prose-described
process controls (join with a space; leave the markers in) and are effective by
construction. Book 1 runs no source-verification controls at all.

**So: the drafter's fix should be back-ported to three scripts, and the shape
should be written down.** But the fix as stated is **necessary and not
sufficient**, and I can show that rather than assert it — see R-2.

---

## F. Records findings

- **R-1 — the no-op control shape, and the rule to write down.** Three scripts
  carry it (section E). Write the rule into `WORKFLOW.md`: *a negative control
  asserts (a) that its mutation changed the text, and (b) that the check's own
  verdict changed; where (b) cannot be made to hold, the blindness is declared
  by name and a second check is made to carry that class.* Book 5's script
  already does (a) everywhere and (b)'s declaration for merge and split; the
  rule generalizes what it did.
- **R-2 — asserting the mutation is not sufficient, demonstrated.** The
  reviewer's own rule (section B) had a control that changed the text, asserted
  that it had, and **still did not fire**: a twelve-word deletion left every
  surviving token aligned and the statistic at 1.00000. The mutation was real;
  the *measure* was blind. A control that cannot fail and a control whose
  measure cannot see it are indistinguishable from the outside, and only clause
  (b) above catches the second. This is the reach the drafter's framing misses,
  and it is the more dangerous half, because it survives the fix.
- **R-3 — `sea shore` is asserted by three accepted Books, not one.**
  `RESUME.md` ("Accepted Book 4 asserts the open form"),
  `review-instructions.md` question 1 and `PUNCTUATION.md` §4 all name Book 4
  alone. Books 2 and 3 print it too. Correct in all three places; the ruling's
  cost is three successors.
- **R-4 — dead conditional in `verify_source_book5.py`.** Immediately above the
  guard in C-14:
  `if hits != [lo + (len(residue) - len(b5))] and len(hits) != 1: fail(...)`
  is followed by `if len(hits) != 1: fail(...)`. The first can only fire in a
  case the second already covers, so its first operand is never load-bearing.
  Delete it or make it the containment check it looks like.
- **R-5 — "three of Butler's nine sixty-word periods survive" is not what
  happened.** P017's 102-word period was split and left a 62-word residue;
  P030's 62-word simile was recast to **65**; P037's 61 became 60. Say
  *"three sixty-word sentences remain, in paragraphs 17, 30 and 37"* — the
  count is right, the claim of survival is not, and one of the three is longer
  than Butler's.
- **R-6 — report the semicolon count beside the splitting rate.** Source 34 →
  candidate 14 is the single most informative number about this draft and the
  package does not compute it. Two lines in the build script. It gives D17 the
  denominator it is missing: *how much of the added sentence count came from
  the operation that moves nothing.*
- **R-7 — the near-identical report is computed and then not published.** The
  package's `near_identical()` flags eight paragraphs in Book 5 (S-1). Only one
  of them reached the review instructions, and three paragraphs that it does
  **not** flag were presented to the reviewer as though it had (C-13). Put the
  report's actual output in `continuity.md`, as `word-counts-v1.json` already
  does for word counts.

---

## G. Every paragraph, once

**B05-P001** — Finding **1.1 (optional).** `harbinger of light alike to mortals
and immortals` → `bringer of light to mortals and immortals alike`. The move of
`alike` to the end is right; `bringer` is flat where `harbinger` carried
*forerunner* — Dawn precedes the light, she does not carry it. `herald of light`
keeps the sense and is not archaic. `Thereon` → `Then` correct (1 of 3).

**B05-P002** — No material issue found. The division of Butler's semicolon into
`…and she will not let him go. He cannot get back…` is one of the twenty (S-1)
but it is a good one: Butler's relative `who will not let him go` was already
being asked to do too much. `equitably` → `fairly`, `Furthermore … now` → `And
now` both sound.

**B05-P003** — Finding **3.1 (optional).** `hurry-skurrying` → `scurrying`
drops the *hurry*, and the compound's comic redundancy is the point: the suitors
are to come back in an undignified rush. `scurrying back in a hurry` or
`hurrying and scurrying back` keeps it. Recorded in `continuity.md`, so the
disposition is on the record; this is a disagreement with it, not an omission.
The comma-continuation repair (`replied her father. "Did you not…"`) is
`PUNCTUATION.md` §3 and correct.

**B05-P004** — No material issue found. `convoyed` → `escorted`, `raiment` →
`clothing`, `perilous` → `dangerous`, the twenty days intact, *neither by gods
nor men* intact. Dropping `thus` from `When he had thus spoken` is consistent
with B05-P016's identical handling.

**B05-P005** — No material issue found. `Forthwith` → `At once`, `firmament` →
`sky`, and the cormorant simile untouched. The division at `over Pieria. Then he
swooped down` is a semicolon conversion (S-1) and reads well.

**B05-P006** — Finding **6.1 (minor)**, `sweet smelling` → `sweet-smelling`
(see Compounds). Finding **6.2 (optional):** `luscious herbage` → `rich
herbage` modernizes the adjective and keeps the noun, which is the wrong way
round — `herbage` is the word a modern reader stumbles on, `luscious` is not.
`rich grass` or `lush greenery`. `rills` → `streams`, `wherein` → `in which`,
`hither and thither` → `this way and that`, `reek` → `smoke`, `sandal wood` →
`sandalwood` all correct. `occupy their business` → `do their business` is a
good minimal repair of a phrase that is Butler's own oddity.

**B05-P007** — Finding **7.1 (optional).** `Ulysses was not within` → `Odysseus
was not in the cave` supplies a location Butler leaves to the context. It is
harmless and probably an improvement, but it is a supplied word of the same
class as ruling 2's `and` and is not recorded anywhere. Record it. The
`sea-shore` → `sea shore` instance is ruling 1. The change of Butler's
speech-introducing colon to a comma (`said, "Why have you come…`) is finding
**C-15 (optional)**: B05-P008 and B05-P016 keep the colon (`then said:`,
`spoke, saying:`) while B05-P007 and B05-P015 take a comma. Four instances of
one Butler mark, two dispositions, none recorded — **D16**'s standard again.
Either is fine; pick one.

**B05-P008** — No material issue found. One word changed in the whole
paragraph (`Mercury` → `Hermes`), and correctly: Butler is already plain here.

**B05-P009** — Finding **9.1 (minor)**, `choice offerings` (see above).
Also part of **S-1**: the `all those who fought … and sailed home …` chain is
Butler's suspension, left whole. `transgress` → `disobey`, `perished` → `died`
(twice, consistently), `hither` → `here` all correct, and the division of
Butler's `…why I have come here, and I will tell you truly` into two sentences
is clean.

**B05-P010** — Finding **10.1 (minor)**, `mid ocean`; finding **10.2 (minor)**,
`Nevertheless` → `All the same` against `Nevertheless` kept twice elsewhere.
Finding **10.3 (optional):** `I got fond of him and cherished him` → `I grew
fond of him and cared for him` — `cherished` is neither archaic nor obscure, and
`cared for` is what one does for an invalid, not for a lover; this is the one
place in the Book where Calypso says what she felt. Keep `cherished`. The new
row **`Ceres` → `Demeter`** is correctly applied (1 → 1), correctly warranted
under R3's corrected warrant, and `thrice-ploughed` → `thrice-plowed` is D9 not
D15. `in open matrimony` → `openly as husband and wife` is well judged and
recorded. Three of the Book's divisions are here and all three are semicolon
conversions (S-1).

**B05-P011** — No material issue found. Butler's `…punish you”.` → `…punish
you.”` is a **D16** repair, correctly made and correctly named in
`continuity.md` §5 rather than hidden in the 31/31 total.

**B05-P012** — Ruling 2 (upheld). `home sickness` → `homesickness` and `day
time` → `daytime` correct. `crying aloud for his despair` → `in his despair`
repairs a preposition a modern reader reads as an error, and is a **D16**
instance that is **not** recorded — finding **12.1 (optional)**: record it
beside B05-P011's.

**B05-P013** — No material issue found, and this is one to be explicit about:
108 words, **one** word-level edit (`so that it may carry you`), and it is the
right answer. Butler's Calypso is already speaking plain modern English here —
`grieving and fretting your life out`, `of my own free will`, `to save you from
starving` need nothing. Flagged by `near_identical()` (S-1); defensible.

**B05-P014** — Finding **14.1 (minor)**, `mischief` → `harm`. `well found` →
`well-found` correct (D15). The three divisions are good: Butler's colon before
`nothing that you can say or do` was doing the work of a full stop.

**B05-P015** — No material issue found. `which a blessed god can take` → `a
blessed god can take` and the two divisions are sound; the 50-word oath sentence
is correctly left whole, since an oath is one act. The colon-to-full-stop at
`caressed him with her hand.` is part of finding C-15.

**B05-P016** — Finding **16.1 (optional).** `but her maids brought ambrosia` →
`while her maids brought` weakens a contrast Butler needs: mortal food for the
man, immortal food for the goddess, at the same table. `while` reads as
simultaneity; `but` read as opposition. Restore `but`. Finding **22.1/28.1**
also touches this paragraph (`spoke, saying:` retained). The formula `they laid
their hands on the good things that were before them` is carried correctly and
matches accepted Books 1 and 4.

**B05-P017** — **Ruling 5 — divide it.** Also finding **17.1 (optional)**: `no
whit less tall or well-looking` → `not a bit less tall or good-looking` is
correct and recorded.

**B05-P018** — No material issue found. 90 words, one edit (`infinite` →
`endless`). Flagged by `near_identical()` (S-1) and defensible for the same
reason as P013: Butler is already plain, and the paragraph's force is in its
brevity of statement, not its syntax.

**B05-P019** — No material issue found. `whereon` → `At that` correct (1 of 2);
`retired` → `withdrew`, `became` → `grew`. The one division here is Butler's
comma, not a semicolon, and it is the right place.

**B05-P020** — Finding **20.1 (optional).** The division at `She also gave him
a sharp adze. Then she led the way…` leaves a seven-word sentence inside a run
of four consecutive sentences opening `She … So she … She also … Then she`. It
is the F-1 shape at lower intensity than B05-P021's. Butler's `and then led the
way` was fine. The dawn formula is correct and matches accepted Books 2, 3 and
4 verbatim; `girdle` → `belt`, `yard arm` → `yardarm`, `adzed` → `trimmed` with
the adze kept two sentences above — all correct and recorded. Twelve sentences
in, thirteen out: the raft-building catalogue is left as the plain sequence it
already is, which is right.

**B05-P021** — Finding **21.1 (minor)**, the `She … She also …` division
(ruling 4). Part of **S-1**: the 54-word Bear sentence. Finding **21.2
(optional)**: `the wain` → `the Wain` is recorded as typographic, but
capitalizing a common-noun gloss into a proper name is a **rendering** decision
under D15's own test — Butler wrote `the wain` as a translation of a name, not
as one. Keep the capital if you like; record it as a rendering decision, not as
normalization. `Days seven and ten did he sail` → `For seventeen days he
sailed`, `found him in much good meat` → `supplied him with plenty of good
meat`, `goat skin` → `goatskin`, `wallet` → `bag`, `skilfully` → `skillfully`,
`to his left` → `on his left` all correct. The eighteenth day is intact.

**B05-P022** — Finding **22.1 (minor)**, `saying` dropped here and kept at
B05-P016. Otherwise no issue: `wagged his head` → `shook his head` is applied
consistently here and at B05-P028, `calamities that have befallen` → `disasters
that have overtaken` is sound.

**B05-P023** — **Ruling 3 (upheld):** `heaven` correctly kept. Finding **23.1
(optional):** `pressing me so sorely` → `so hard` while `sorely against my
will` is kept at B05-P031 — one Butler word, two dispositions. The disposition
is defensible (the second is a carried formula, the first is ordinary use) but
it is the one-word-two-ways class and belongs in `continuity.md`. `Thereon` →
`Then` (2 of 3), `I am now safe to perish` → `I am certain to die now`,
`Blest` → `Blessed`, `Would that` → `I wish`, `due burial` → `proper burial`,
`honoured` → `honored` all correct. `stirred it round in the sea` → `stirred the
sea round with it` changes which noun the trident stirs and is clearer for it.

**B05-P024** — **Ruling 4 (upheld, with `between them` to reconsider).**
Finding **24.1 (minor)**, `half way` → `halfway`. `towards` → `toward`,
`Autumn` → `autumn` correct. The division at `weighed him down. But at last…`
is a semicolon conversion and a good one.

**B05-P025** — Finding **25.1 (optional).** `a mere mortal` → `an ordinary
mortal`: `mere` is not archaic and carries the diminishment that makes the
promotion to goddess mean something. `marine goddess` → `sea goddess` and
`sea-gull` → `seagull` correct; the added comma in `Ino, daughter of Cadmus,`
is right. This is the Book's most heavily reworked short paragraph (15 edits in
61 words) and every one of them earns its place except `mere`.

**B05-P026** — No material issue found. `said she` → `she said`, `as I bid you`
→ `as I tell you`, `gave it him` → `gave it to him`, `sea-gull` → `seagull` all
correct. Two divisions, both at Butler's semicolons, both clean. Ino's
instructions keep their order and their conditions exactly.

**B05-P027** — Finding **27.1 (optional).** The division at `…as long as her
timbers hold together; but when the sea breaks her up I will swim for it. I do
not see how I can do any better than that.` produces two consecutive sentences
opening `I` in a speech that already opens six clauses with `I`. Butler's
semicolon held the resolve and its justification together. Lower intensity than
21.1; listed for completeness. Both branches of the deliberation are kept with
their consequences, as required. `some one or other of the gods who is luring
me` → `one or other of the gods luring me` is a good tightening; `I am sure it
will be best` → `it is best` shifts tense without cost.

**B05-P028** — Finding **28.1 (minor)**, `saying` (see 22.1). `thus in two
minds` → **`still undecided`** correct and matches accepted B04-P011 (1 of 2).
`On this` → `At this` correct (1 of 2). `swim up and down as you best can` → `as
best you can`, `astride of` → `astride`, `to swim on shore` → `to swim ashore`
all correct.

**B05-P029** — No material issue found, and deliberately so. This is a 51-word
single-sentence paragraph with a mid-sentence semicolon, left whole while
twenty semicolons elsewhere in the Book became periods — and it is **right**,
because Butler's sentence is `But Athena decided … ; but she roused …` and
dividing it would produce two consecutive sentences opening `But`: the exact
shape Book 4's flow read reverted (F-1). The drafter did not divide it. That is
judgment applied against the gate's incentive, and it is the best evidence in
the Book that the gate was not being farmed.

**B05-P030** — Finding **30.1 (minor)**, `but the gods deliver him` → `and`.
Finding **30.2 (records)**: the simile came out at **65 words**, three longer
than Butler's 62 — it is not a sentence "left standing" but a recast that grew
(R-5). The recast itself is an improvement — `after he has borne sore affliction
for a long time, sent on him by some angry spirit` untangles Butler's `after
having for a long time borne sore affliction sent him by` — so the growth is
earned; only the description of it is wrong. `Thereon` → `Then` (3 of 3),
`enveloped` → `wrapped`, `harbours` → `harbors` correct.

**B05-P031** — No material issue found. Both branches of the deliberation and
their consequences are kept; `sorely against my will` matches accepted B04-P043;
`for want of foot hold` → `for want of a foothold` closes the compound and
supplies the article the closed form needs; `harbour` → `harbor`. The division
at `…no landing place. The coast is rocky…` is Butler's comma and is the right
seam. Amphitrite, the monster and Poseidon's anger all intact.

**B05-P032** — No material issue found. `thus in two minds` → `still
undecided` (2 of 2), `polypus` → `octopus`, `some one` → `someone`, `retired` →
`retreated` all correct and the octopus simile's mechanics — suckers torn,
stones coming up with it — are untouched. Finding **32.1 (optional):** `plucks
it from its bed` → `pulls it from its bed` loses the sharp single motion that
the torn suckers depend on; `prizes it off` or keep `plucks`.

**B05-P033** — No material issue found. `would have certainly perished` →
`would certainly have died`, `seaward` → `out to sea`, `afforded` → `gave`,
`towards` → `toward`. The spit `that would take the waves aslant` keeps
Butler's `aslant`, correctly — it is not archaic, only precise.

**B05-P034** — No material issue found. `riverhood` correctly kept, and the
sentence does explain itself. `sea-god` → `sea god` is correct (the modern
standard for this one **is** open, unlike `seawater`), `I approach you
prayerfully` → `I come to you in prayer` with `I declare myself your suppliant`
kept distinct, `Any one` → `Anyone`, `wherefore` → `and so`, `upon` → `on`.

**B05-P035** — Finding **35.1 (minor)**, `sea-water` → `sea water` (read
`seawater`). Finding **35.2 (optional):** `making all calm before him, and
brought him safely into the mouth of the river` mixes a participle and a finite
verb across one `and`; Butler's two participles were parallel. Either
`and bringing him safely` or a full stop. `staid` → `stayed`, `lay swooning` →
`lay in a faint`, `laid himself down` → `lay down`, `whereon` → `At that`
(2 of 2), `bore it towards her` → `carried it toward her` all correct.

**B05-P036** — Finding **36.1 (minor)**, `river bed` against `hillside` in one
paragraph. Otherwise no issue: both branches of the third deliberation are kept
with their consequences, `towards sunrise` → `toward sunrise`, `blowing from off
the river` → `blowing off the river`, `what ever` → `whatever`.

**B05-P037** — Finding **37.1 (optional).** `as one who lives alone in the
country` → `as a man who lives alone` supplies a gender Butler's `one` leaves
open. `as someone who lives alone` costs nothing. Otherwise no issue: the
fire-seed simile is intact at 60 words and correctly left long (the chain is
the figure), `deemed` → `thought`, `the cover they afforded` → `they gave`,
`laid himself down` → `lay down`, `made him lose all memories of his sorrows` →
`made him forget all his sorrows`. The third `nor could` supplied for
parallelism is an addition, but a syntactic one that carries no content.

---

## H. What the package's checks would still not catch

1. **A compound that is open in Butler and open in the candidate.** Every
   compound check in the package is driven by a list somebody wrote. Nothing
   enumerates the candidate's two-word sequences and asks whether the closed or
   hyphenated form is the standard one. `half way`, `river bed`, `mid ocean` and
   `sweet smelling` all passed every check in the package; I found them by
   reading, not by running anything. Ruling 1's `hyphen_drift()` extension
   catches them only once a *second* Book disagrees.
2. **A Butler word rendered with a word the package reserves for a different
   Butler word.** `one_word_two_ways()` looks within one Book and keys on
   Butler's side. Nothing keys on the *candidate's* side across Books, which is
   the only way to see `hecatomb` → `offering` colliding with `offering` →
   `offering` (finding 9.1).
3. **A division that satisfies D17 and hurts the prose.** By construction. The
   `She … She also …` at B05-P021 scores exactly as well as a good division.
   The only instrument is a flow read, and Book 4 established that; Book 5
   confirms it — and B05-P029 shows the drafter running that instrument
   correctly in one place and not in the other.
4. **Prose in the artefacts that contradicts the artefacts.** Every number in
   `README.md` is asserted by a check. Nothing checks the sentences in
   `review-instructions.md` or `continuity.md` against the reports they quote,
   which is how C-13 (three wrong paragraph numbers) and R-5 ("survive") got
   into the document that steers the review.
5. **A guard or control whose measure is blind to what it mutates.** R-2. The
   fix the drafter applied — assert the mutation changed the text — does not
   catch it; only asserting that the *verdict* changed does.
6. **A recast that grows Butler's sentence.** The 60+ census counts sentences at
   or above 60 words; it does not report the delta, so B05-P030 going 62 → 65
   is invisible (R-5).
