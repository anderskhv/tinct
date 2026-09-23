# Odyssey Book 10 — continuity, decisions and figures

*Aeolus, the Laestrygones, Circe.* 49 paragraphs, 5,684 words of Butler.
Step 4 of the eight in `../WORKFLOW.md`: drafted and **frozen** at
`candidate-v1.json`, and it stops here for a review it does not do itself.

## 1. The figures

Every one of them is written by `scripts/checks.py`, not typed — and since
Book 9's round 1 that sentence is **checked**: `checks.py --prose`, folded
into `--all`, fails on a figure in a table of this file that no candidate of
this Book produces at the precision it is written. **Basis: all 49
paragraphs.**

| | |
|---|---|
| Butler token retention (canonical, aggregate-join) | **0.93645** |
| order retention / bag retention | 0.93645 / 0.94553 |
| **MOVE-GAP** (bag − order), an UPPER BOUND on clause movement | **0.00908** |
| **displaced runs** (the strict witness) | **0** |
| sentences, source → candidate | 175 → 214 |
| **raw splitting rate (D17)** | **+22.3%** |
| sixty-word sentences | **12 → 2 (83% broken)** |
| semicolons, Butler → candidate (D19) | **44 → 11** |
| — of Butler's own, kept / the draft's own, added | **11 kept + 0 added** |
| **dividing marks (D27: `;` `:` sentence-internal `—`)** | **60 → 26** |
| — kept / added (D27, membership) | **26 kept + 0 added** |
| **— kept / class-changed / added (D28, IDENTITY)** | **26 + 0 + 0** |
| NORM RATE as published (D20) | +2.7% |
| NORM RATE on Butler's pointing (D21) | +2.7% |
| NORM RATE, every dividing mark (D27) | +2.1% |
| **NORM RATE, D28, by mark identity — THE COMPARED FIGURE** | **+2.1%** |
| word ratio | 0.99507 |
| paragraphs byte-identical to Butler | **0** |
| paragraphs under 0.90 of their source's length | **0** |
| sentences grown past 50 words | **1, declared — and the compound check bought it** |
| cross-Book compound drift | **none** |
| collision rows touching this Book, all dispositioned | **124** |
| H.1 compound pairs, all dispositioned | 38 |

**The figures to read together.** The raw rate is **+22.3%** and the compared
figure is **+2.1%**, and the gap is Butler's own pointing: 60 dividing marks
become 26, thirty-four cashed for periods.

**And this Book publishes the strict form, which is the point of it.** Book 9
published *"41 kept + 0 added"* and its round 1 showed that the census counted
a mark as kept when Butler's mark in the span was **any** member of `{; : —}`
— so two of his colons could be spent and two of the draft's own written over
his semicolons, invisibly. **D28** asks whether it was the **same** mark, and
this Book's drafter **asserts the strict form before it will write the file**:

```
kept, changed, added = checks.kept_class_added_div(src_flat, paras)
if added:   fail(...)        # D21 — a mark bought with a keystroke
if changed: fail(...)        # D28 — a mark improved rather than kept
```

**26 kept by identity, 0 class-changed, 0 added.** Every dividing mark in this
Book is the mark Butler wrote in that place, and the two NORM RATEs agreeing
is not evidence of that (records finding R-8 of Book 9's round: they agree
whenever the counts agree, which does not rule out an exchange). What is
evidence of it is `kept_class_added_div()`'s middle number being zero.

**And the movement figures are the best in the package.** MOVE-GAP 0.00908
with **zero** displaced runs — the first Book with none since Book 4 and Book
8. Butler's clauses are cut apart and not one is shuffled.

## 2. Source — the SIXTEENTH kind of rule, and it reads three characters

`scripts/verify_source_book10.py`, output in `book10/source-verification.txt`.

Every character of the chapter that is not `.`, `?` or `!` is deleted — every
letter, every digit, every capital, every space, every comma, semicolon,
colon, dash and quotation mark. What survives is **one symbol per sentence**.
Book X's terminator string is 175 characters, twelve of them `?`, and it
occurs in the terminator string of PG's whole body **exactly once**.

**Is it honestly a new channel?** The three characters are a subset of the
ninth rule's (letter-blind typographic shape, which keeps every mark *and*
every word length), as the fifteenth rule's two quotation marks were. What
makes it a different instrument is what it is blind to: the ninth rule sees
word lengths and therefore sees any substitution that changes one; this sees
**only how many sentences there are and how each one ends** — precisely the
axis a modern-English draft moves and a transcription error does not.

**And the verdicts differ from its neighbours' in a checkable way.** Over all
24 chapters:

* **clause 1, the locating clause, locates 23.** The one it cannot is
  **chapter 3**, whose B03-P038 splice changes the sequence: **0 occurrences**,
  and the rule reports zero rather than a pass — the ninth rule's own audit
  failure, avoided by asserting the count and printing it.
* **clause 3, the verifying clause, then fails two more: chapters 1 and 4.**
  Chapter 1's divergence is a space before an em dash and chapter 4's is an
  initial capital, and the LOCATOR is blind to both by construction. It
  locates both; the verifier catches both.

**21 verify, 3 fail, and the three are exactly the three chapters ledger A7
records a divergence in — with WHICH CLAUSE fires saying which kind it is.**

**Nine controls fire**, each on both of D18's clauses: the **B03-P038 splice**
planted at B10-P020; a paragraph of Butler's **Book IX** (adjacent) and one of
his **Book XXII** (not adjacent), so the control is not about adjacency; one
sentence divided; one full stop raised to a question mark; two paragraphs
transposed; the served chapter replaced entirely **and** PG's Book X replaced
entirely, which is *a chapter matching itself* answered from both ends; and
every `?` and `!` levelled to `.` in both texts, which collapses the stream to
a run of full stops and makes the rule **fail on non-uniqueness** rather than
report "no anomalies".

**The audit failed the rule twice, and both failures are written into the
file.**

1. **The control harness's own D18 clause (a) compared a list with itself.**
   The snapshot was `[c["paragraphs"] for c in sv]` — a list of *references*
   to the very lists the mutation then edits in place — so `before` and
   `after` were the same objects and the clause that exists to catch a
   do-nothing control **could never have failed**. That is D18 clause (a)'s
   own defect sitting inside D18 clause (a)'s implementation.
2. **Clause 2 resolved a paragraph boundary with `bounds.index()`, and the
   boundaries are not injective.** **Eight** of PG's paragraphs end on a colon
   or a semicolon introducing a speech and contribute no terminator at all, so
   they occupy zero characters of the stream and share an offset with their
   neighbour. Chapter 4's span came back as 82 blocks against 81 paragraphs
   and the rule reported a clause-2 failure **that had nothing to do with
   chapter 4's divergence** — a locating clause failing for the wrong reason,
   for the third time in this package's history. Clause 2 now enumerates every
   block pair consistent with the offsets and requires exactly one of the
   right size, and says when the offsets are ambiguous.

**And the source itself is now PINNED** (A11). `scripts/pg_source.py`
re-derives `book10/source-book10.json` from PG #1727 on every run of
`checks.py 10`, `--all` and `--manifests`, PG's own bytes are hashed, and the
manifest records both. That is new since Book 9 and it is the reason the
source rules are no longer the only thing standing between this package and an
edited Butler.

## 3. Names — D5 row 14

Ulysses → **Odysseus**, Jove → **Zeus**, Mercury → **Hermes**, and
**Proserpine → Persephone**, which is **row 14 of D5's table, added here**.
Book 10 is the first Book to meet her (P041, P043 and P045, four occurrences,
in Circe's instructions for the descent). Added on D5's rule alone, as `Mars`
was: she is one of the Olympians who has a Roman name. No hazard — no other
word in PG #1727 begins `Proserpin` — and the mapping is word-bounded and
case-sensitive (D6).

**And adding her exposed a defect in an accepted Book.** `checks.py`'s
`NAME_MAP` exists so that Butler's Roman name and the edition's Greek one
count as **one token** and the name policy does not read as a loss of
retention. It was missing `Mars → Ares`, added to `GLOSSARY.md`'s table at
Book 8 step 2 and never added to the map. Butler names Mars thirteen times in
Book 8, in the lay of Ares and Aphrodite, and **that edition was charged
retention on every one of them**: 0.93862 where the true figure is 0.94093.
Republished. `--all` could never have caught it, because it recomputes with
the same map on both sides — only meeting a new name exposes it.
`scripts/rendering_collisions.py` carried a **second copy** of the same table,
two rows behind; it imports the one table now.

Everything else in this Book is Greek in Butler already: Aeolus, Hippotas,
Circe, Aeetes, Perse, Oceanus, Polyphemus, Antiphates, Laestrygonians,
Eurylochus, Polites, Elpenor, Teiresias, Hades, Erebus, Styx, Acheron,
Pyriphlegethon, Cocytus, Artacia, Olympus, Achaeans, Argive, Pramnian, Moly.

## 4. D4 — the unclosed quotation, chapters 9-12

**This Book is the second quarter of it, and nothing here is a decision.**
Every one of chapter 10's 49 paragraphs opens `“` and closes nothing: the
quote balance is +49, the highest of the four chapters. Odysseus's narrative
is opened at B09-P001 and closed at the end of chapter 12; 177 paragraphs
across chapters 9-12 open a quotation nobody closes, over a span of 186.
See `../PUNCTUATION.md` §2, which carries the count, and Book 9's round 1
finding S-2, which corrected Book 9's own record of it.

**The reader who meets it worst is not this Book's reader**: it is the one who
opens chapter 11 directly. This Book adds 49 paragraphs to that span and
changes nothing about it. The candidate matches Butler mark for mark on all
49; the fix is an app affordance, not a punctuation change.

## 5. D16 — nothing repaired, nothing supplied

**No mark of Butler's is repaired in this Book and no word is supplied.** The
one place a repair was considered is **B10-P008**, where PG and the served
file both carry editorial square brackets — *"the shepherd who is driving in
his sheep and goats **[to be milked]** salutes him who is driving out his
flock **[to feed]**"*. **D12** forbids square brackets in a candidate, and
unlike Book 9's B09-P041 bracket these are **closed, balanced, and part of the
sentence's sense**: they are a translator's expansion, not a mark of suspected
interpolation. They are set as ordinary text — *"driving in his sheep and
goats to be milked greets the one driving out his flock to feed"* — which
removes two marks and supplies no word.

That is the whole of D16 and D12 in this Book. The claim is small enough to be
checked in one grep, and after Book 9's S-5 — where §5 asserted that no word
was supplied and a reviewer found three in one grep — the standard here is to
**enumerate rather than to assert**: the table above is empty because the
enumeration is empty, and a reviewer who finds a fourth thing has found a
finding.

## 6. Renderings decided here

* **`lusty` → `stalwart`** (B10-P001). Butler's `six lusty sons` is not the
  modern sense of the word. `sturdy` was the draft's first choice and the
  **collision check repaired it**: `sturdy` is Butler's own at P011 (`sturdy
  Laestrygonians`) and P036 (`my sturdy thigh`), so using it here would have
  flattened two of his words onto one of ours.
* **`hoggets`, `withies`, `esconced`** — none of them in this Book. The
  archaisms it does carry are `staid` (→ `stayed`), `shew`/`shewed`
  (→ `show`/`showed`, a spelling and not a word), `whither` (→ `where`),
  `thence` (→ `from there`), `twelvemonth` (**kept** — it is current, it is
  exact, and `a whole year` loses the idiom), and `hue-and-cry` (**kept**,
  set open as `hue and cry`).
* **`atmosphere` → `air`** (B10-P001). Butler's `the atmosphere of the house
  is loaded with the savour of roasting meats` uses the older sense; the
  modern one is meteorological or figurative and neither is meant.
* **`ill` → `badly`** (B10-P038, `how ill you have fared`). The same word Book
  9's M-6 turned on: Butler's `ill` is *badly*, and the draft that wrote `bad
  to deal with` in Book 9 wrote a sentence that is not English. Here it is
  `badly`.
* **`besought` → `entreated`, twice** (P040, P045), and the collision check
  is why it is twice. The draft first wrote `begged` at P040 and `entreated`
  at P045 — one Butler word with two renderings, which arrow A raised. It was
  repaired toward the rendering that leaves `begged` free, and it costs a
  cross-Book row against Book 7's `begged` that is recorded and **not
  chased**: repairing an accepted Book for a synonym pair a reader cannot
  notice costs a successor (ledger R-6).
* **`the fountain Artacia` and `the groves and fountains`** (P010, P029) —
  the draft wrote `spring` in both places and the check repaired both, because
  `fountain` is Butler's own word and `spring` is his verb at P023 (*draw your
  sword and spring on her*). This is **D29**: the repair restores.
* **`arrayed` → `clothed`** (P029), not `dressed`, because `dressed` is
  Butler's own at P046.
* **`Moly` kept**, capital and all. It is the name the gods call the herb, in
  a sentence that says so.

## 7. What the collision check caught BEFORE the freeze

`RESUME.md` asks that the collision check and the compound register run
**before** freezing. They did. The check returned **132 rows** touching Book 10
with **18 undispositioned**, and **nine of the eighteen were live and were
repaired in the draft**, where a repair costs nothing rather than a successor.

| ¶ | was | is | arrow | why |
|---|---|---|---|---|
| P001 | `six sturdy sons` | `six stalwart sons` | B | `sturdy` is Butler's own at P011 and P036 |
| P003 | `our own land` | `our native land` | A | Butler's own `native`, which he also uses at P039 |
| P010 | `the spring Artacia` | `the fountain Artacia` | B | Butler's own `fountain`, and `spring` is his verb at P023 |
| P012 | `I was in two minds` | `I was uncertain` | A | `in two minds` is Butler's own at P036 |
| P025 | `I went on` / `made my way` | `I fared onward` | A | Butler's own, and it frees `fared` for P038 |
| P029 | `the groves and springs` | `the groves and fountains` | B | Butler's own `fountains` |
| P029 | `she dressed me` | `she clothed me` | B | `dressed` is Butler's own at P046 |
| P039, P040 | `we agreed` / `I agreed` | `we assented` / `I assented` | B | `agreed` is Butler's own at P033 |
| P040 | `begged her by her knees` | `entreated her by her knees` | A | so Butler's one `besought` has one rendering |

**Every one of the nine restores Butler's own word or removes a word the draft
introduced.** That is **D29** — *a repair restores; it does not paraphrase* —
applied at drafting rather than at repair, and it is the rule Book 9's round 1
produced out of its own fifteen.

**And six rows that Book 10's arrival opened in the ACCEPTED Books are ruled**
in `collision_triage.py` rather than left as a backlog (blind spot 10):
`slung` against Books 2 and 4's `girded`; `raise` against Books 1 and 2;
`doubted` against Book 4; `sufficiently` and `anyone` against Book 5;
`greeting` against Book 3; `besought` against Book 7; `neighbour` against Book
8; `upwards` against Book 9. None is a defect in an accepted file and each
carries its reason.

**One row is a FALSE POSITIVE of the same kind Book 9's v2 opened.** Arrow B
reads `shewed` (P024) and `showed` (P003) as two Butler words rendered by one
candidate word. They are **one word**: `shewed` is Butler's own archaic
spelling of `showed`, and the edition normalizes spelling under D15. The arrow
keys on letters and cannot know that; the disposition says so.

## 8. The compound check, before the freeze — and it cost a declaration

`compound_drift()` fired on **two** pairs, and both were real:

| pair | Book 10 wrote | the corpus sets |
|---|---|---|
| `drink-offering` | hyphenated | **open** in Books 3, 4, 7, 8 and 9 |
| `ox-hide` | hyphenated | **open** in Book 2 |

Both were opened. Butler hyphenates both, and five accepted Books had already
opened the first — which is the state §H.1 exists to keep visible, and Book 9's
round 1 recorded `drink-offering → drink offering` as an **unchecked** drift
(its O-2) because `compound_drift()` cannot see it there: `drink` is adjacent
to a stop-word element. Here the check *did* see it, because Book 10 set it
closed and five other Books set it open, and a hyphen somewhere in the corpus
is what admits a pair at all.

**And opening it cost the Book its only declaration.** `drink-offering` →
`drink offering` adds one word to B10-P044, a sentence **Butler already wrote
at 53 words**, and the D20 growth gate fires at 50. The candidate's is 54.
`DECLARED` carries `(44, 53, 54)` with that reason. Declaring a one-word
growth on Butler's own sentence is cheaper and more honest than keeping a real
cross-Book drift, or than recasting Circe's instructions to protect a number.

**The position-awareness that Book 9's question 4 forced is why neither of
these is noise.** `compound_drift()` compares settings only within the same
grammatical position now, so `olive-wood handle` against `green olive wood`
never forms a row and the `NOT_COMPOUNDS` exemption that used to hide it is
gone. Both of Book 10's rows are nominal against nominal — the same position —
and both are real.

## H.1 — the compound register

Ledger **A5(c)**, and the answer to **A4(ii)** in the negative: one disposition
line per H.1 compound pair, so the class is a checklist somebody went through
rather than a blind spot. Generated by `scripts/compound_register.py` from
`book10/candidate-v1.json`; the evidence is **100 served modern-English editions**, read only, and
a pair is `closed` only when the closed form leads the open form **3x** and
appears in at least **3 distinct editions**. The corpus is machine-generated and
is never a sole authority (ledger A5(b)).

**38 pairs.**

| pair | disposition | corpus evidence |
|---|---|---|
| `became men` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `cut stones` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `dark house` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `days night` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `dead men` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `fertile shore` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `fetch water` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `fine house` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `good fire` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `great house` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `into bed` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `long day` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `long days` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `long time` | **`kept open, standard`** | the candidate writes `long time`; corpus closed 2 in 2 editions against 0 hyphenated and 658 open — the closed form is attested but does not lead by the margin (3x and 3 editions required) |
| `mere stones` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `mortal men` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `mountain top` | **`ruled closed against the corpus`** | **the singular of a pair ruled closed at ledger **A5(a)**; here the corpus agrees decisively.** Corpus (lexeme): closed 17 in 7 editions against 2 hyphenated and 10 open — SHORT of the margin. — merged with `mountain tops` for the lexeme (M-8): split, this form alone is closed 10 in 6 against 1 open |
| `native land` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `nine days` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `nine nights` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `open water` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `pigs head` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `pigsty doors` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `place water` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `seventh day` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `six days` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `stubble fires` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `tenth day` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `third day` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `third place` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `took hold` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `unhappy man` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `whole house` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `whole place` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `whole time` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `with water` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `young man` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
| `young woman` | **`not a compound`** | the closed form is attested nowhere in 100 editions |
