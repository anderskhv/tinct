# Odyssey Book 8 — ACCEPTED

**Accepted file:** `book08/candidate-v2.json`
**sha256:** `12f2904e6e40ac839a608797cf8f866d1f1e5227ae415f11aee6c0238f43de22`
**Source:** `book08/source-book8.json`, the served `original-en` chapter 8
(Samuel Butler 1900, PG #1727), 50 paragraphs, source verified twice by two
unlike rules (`scripts/verify_source_book8.py`, the **twelfth** kind — PG's
argument lines and table of contents, body-blind;
`book08/review/verify_source_book8_review.py`, the **thirteenth** —
marker-to-marker byte tiling indexed by the served file's own paragraph-count
vector, whose audit failed it **five** times).
**Basis of every figure below: all 50 paragraphs.**

Round 1 (`book08/review/findings-v1.md`) returned **accept after corrections**
— 3 substantive, 8 minor, 7 optional, 5 records, all 50 paragraphs covered, 34
with no material issue, and every published figure recomputed independently.
Step 6 is `scripts/build_book08_v2.py`; step 7, the flow read, is the last row
of `book08/changes-v1-to-v2.md`.

**The frozen draft, for the record:** `book08/candidate-v1.json`,
`e758790c58e0ace5c97159b2fa4e6d0f987f0b0edeba9120542ed772ec6ce012`.

---

## The figures

| | v1 (frozen draft) | **v2 (accepted)** |
|---|---|---|
| paragraphs | 50 | **50** |
| Butler token retention (aggregate-join) | 0.94075 | **0.94093** |
| order retention (per paragraph) | 0.94075 | **0.94093** |
| bag retention | 0.94767 | **0.94784** |
| **MOVE-GAP** (bag − order), an UPPER BOUND | 0.00692 | **0.00692** |
| displaced runs (the strict witness) | **0** | **0** |
| sentences, source → candidate | 192 → 244 | **192 → 235** |
| **raw splitting rate (D17)** | +27.1% | **+22.4%** |
| sixty-word sentences | 11 → 0 (100% broken) | **11 → 1 (91% broken)** |
| **semicolons, Butler → candidate (D19)** | 42 → 0 | **42 → 7** |
| — of Butler's own, **kept** | **0** | **7** |
| — the draft's own, **added** | **0** | **0** |
| **dividing marks (D27: `;` `:` sentence-internal `—`)** | 62 → 22 | **62 → 31** |
| — of Butler's own, **kept** | 15 | **24** |
| — the draft's own, **added** | 7 | **7** |
| NORM RATE as published (D20) | +4.3% | **+3.4%** |
| NORM RATE on Butler's pointing (D21) | +4.3% | **+3.4%** |
| NORM RATE, every dividing mark (D27) | +4.7% | **+4.7%** |
| **NORM RATE, D27, on Butler's pointing — THE COMPARED FIGURE** | **+2.0%** | **+2.0%** |
| word ratio | 0.992 | **0.992** |
| paragraphs byte-identical to Butler | 1 (B08-P033, **declared**) | **1 (B08-P033, declared)** |
| H.1 compound pairs, all dispositioned | 28 | **28** |
| collision rows touching this Book, all dispositioned | 91 | **97** |

`book08/checks-v2.md`, written by `scripts/checks.py`, is the only thing that
computes these. `book08/manifest.json`'s `checks` block names
`candidate-v2.json`, its sha256 and all sixteen figures, and
`scripts/checks.py --manifests` now **re-runs the gates over it** and checks
every figure back against the file.

*(The collision row count is as of Book 9 joining the corpus: every arrow
compares across Books, so a new Book adds rows to every other one. It was 90
immediately after this Book's corrections and 97 once Book 9 was drafted;
every one of the 97 has a disposition.)*

**Read the last four rows of the mark block together, because they are the
Book's whole argument.** The raw rate fell from +27.1% to +22.4% and the
compared figure **did not move at all**: nine marks of Butler's were restored,
which removed nine sentence boundaries and added nine kept marks, and D27
scores that at exactly zero. That is the measure doing what it was built for.
The +2.0% is the Book's real division of Butler's prose — **eight divisions in
fifty paragraphs**, the lowest any Book in this package has shipped — and it
was +2.0% before the corrections too. The corrections did not improve the
number; they made the text match it.

---

## S-2 — zero survivors was a decision made once for a whole category

Book 8 converted **all 42** of Butler's semicolons. Round 1 ruled 35 correctly
cashed — before `indeed`, `still`, `also`, `but`, `for`, `however`, `there`,
Butler's semicolon precedes a clause that stands on its own feet and whose
relation is carried by its own first word, and converting those is what a
modern edition is for. **Seven now stand**, in six paragraphs, and the build
asserts the set exactly, so an eighth appearing anywhere fails it.

| mark | ¶ | why it survives |
|---|---|---|
| [10] | B08-P009 | **specification** — the second clause is the evidence for the first, not a further observation. Three flat sentences read as a staccato inventory where Butler has one gathering appraisal. The strongest single case in the Book. |
| [26] | B08-P034 | **the *therefore* of the arithmetic** — *"counting myself there are thirteen; contribute, each of you…"*. The number is stated in order to issue the order; a period strands it. |
| [30] | B08-P039 | **reason for the order just given** — *"heat some water; our guest will take a warm bath"*. A period turns a reason into an announcement. |
| [34] | B08-P043 | **protasis and apodosis of one wish** — *"grant that I may reach my home; so shall I bless you…"*. `So shall I` is grammatically dependent; a period severs a conditional. **The only one of the 42 whose loss is grammatical rather than rhetorical.** |
| [37] [38] | B08-P046 | **enumeration** — the Trojans' three counsels inside one council. The enumerative semicolon is the one use of the mark no modern style guide has replaced; three sentences turn a debate into a list of reports. |
| [35] | B08-P044 | ruled at **M-2**, not S-2: the period builds a fourteen-word garden path on concessive *"For all the pain his singing may cause me"*, which is first read as the causal `for` this Book uses four times elsewhere. Butler's own mark is the repair; the alternative (writing the concession out with *Despite*) was available and declined, because keeping Butler is the cheaper of two equal repairs. |

Seven more are defensible either way and the draft is **upheld** on all seven,
recorded in `review/findings-v1.md` §5.2 so the record shows they were read.
**[41] at B08-P049 is the optional eighth restoration and is DECLINED**, with
its reason, in `changes-v1-to-v2.md`.

---

## The worst break in the Book is not one of the 42

**B08-P047.** Butler's em dash closes a Homeric simile: *"He wept **as** a
woman weeps when…"* is a protasis running 48 words, and *"**even so**
piteously did Odysseus weep"* is its apodosis. The dash holds the two in one
sentence, which is what makes the correlative readable across that distance.
The draft cashed it for a period, and `Even so` at the head of a new sentence
reads first as a discourse connective — *nevertheless* — before it resolves as
the simile's answering term. The sentence is not concessive; that is the wrong
first reading, and it is a sentence divided at the wrong seam, the class
`RESUME.md` has carried as blind spot 1 since Book 1 with no carrier.

**No instrument in this package could see it.** It is not a semicolon, so the
D19 count and the D21 provenance do not reach it. It moves no clause, so
MOVE-GAP sits at 0.00692 and the displaced-run witness at zero. It lengthens
nothing, so the growth gate is silent. It was found by a person reading.

Restoring it rejoins Butler's own **80-word** sentence; the candidate's is 81,
and that growth is **declared**, with the reason, in `checks.DECLARED`. Leaving
the correlative severed in order to keep a number under a threshold is the
shape M-9 of Book 7's round 1 named, and the declared-instance escape exists so
that it does not have to be done.

**This is the argument D27 was decided on**, and D27 still does not reach this
particular defect — it prices the mark, it cannot tell you the seam was wrong.
What it does is remove the reason there was nothing to lose.

---

## Three words supplied to Butler's text, and one of them inverted the sense

D16 governed **marks**. Nothing governed a word supplied to the text, and Book
8 supplied three without recording any. **D16 gains clause (b)**: a word is
supplied only where Butler's text is defective and only from Butler's own
parallel, and every instance is tabulated in `continuity.md` §5 with the
parallel named.

| ¶ | Butler | candidate | ruling |
|---|---|---|---|
| **B08-P042** | *"He **had done so** before an upper servant told him"* | *"He had **hardly** done so before…"* | **REMOVED.** Not a repair, a change of sense: Butler says Odysseus had *finished* the knot before he was called; `hardly … before` says he had barely finished. No parallel supports it and Butler's clause is idiomatic English. |
| **B08-P045** | *"as soon as they had had to eat and drink"* | *"…had had **enough** to eat and drink"* | **Kept and recorded.** Butler's own identical formula at B08-P006, eleven paragraphs earlier. Emendation from the author's own repetition. |
| **B08-P008** | a verbless fragment: *"Acroneos, Ocyalus, Elatreus, …"* | *"**There were** Acroneos, …"* | **Kept and recorded.** Drawn from his own next clause, *"There was also Euryalus"*. |

---

## The colon, and what a count cannot see

Round 1's mark census reads `: 6 → 6` and calls the class untouched. It was
not: the draft **cashed** Butler's colon at B08-P020 and **added** one at
B08-P008. A count cannot tell a swap from a standstill; D27's provenance can.

`PUNCTUATION.md` §6 now carries a rule for each direction. Butler's six colons
all stand — B08-P020's is restored — and the one addition is **upheld as a
decision** on Book 7 §5.4's precedent: Butler's four-comma appositive *"Three
sons of Alcinous, Laodamas, Halios, and Clytoneus, competed also"* becomes
*"Three sons of Alcinous competed as well: Laodamas, Halios, and Clytoneus"*,
which is the one job modern English keeps the colon for. It adds no sentence
boundary and is worth nothing in the compared figure.

---

## Every other finding, applied or declined

`book08/changes-v1-to-v2.md` has the full table, one row per substitution,
with the finding each answers. **16 substitutions in 12 of the 50 paragraphs;
6 findings declined and asserted still present in the built file (D11).**

Applied besides the marks: **M-4** (`minstrelsy` → *the song that goes with
it*, not *the playing* — Demodocus **sings**, and arrow C's repair is a
constraint, not a direction: freeing a word for a later paragraph is only a
gain if the word that replaces it is still right); **M-7** (a garden path made
by the recast, `follow all the more`); **O-4** (Butler's consequential `so`);
**O-6** (`vestibule`, which is current English and which `entrance` lost for
nothing); **O-7** (`havoc with`, the living idiom, against the older `havoc
of`).

Declined with reasons: **O-1** (upheld, and **D5 widened** to any figure Butler
names in a Roman form, so Book 11 inherits a rule); **O-2** (`guardian angel`
kept, and the flag made permanent as the named class `butlerism`); **O-5**
(`to appease the gods` kept, and which was chosen is now written down);
**M-3(ii)** and **M-3(iii)** (kept, now recorded under D16 clause (b)); **§5.2
[41]** (the optional eighth mark).

---

## The flow read (step 7)

One change, and the corrections made it visible rather than causing it: with
[30] restored two clauses earlier, B08-P039 read *"…heat some water; our guest
will take a warm bath. **See too to** the careful packing…"*, and `too to` is a
stutter. Butler doubled `also` himself twelve words earlier; neither of his
words is the answer, and the clause is a third imperative in a list of
imperatives. *"And see to the careful packing"*.

---

## What this Book adds to the package

* **D27** — D20 clause (a) widened from the semicolon to every dividing mark.
  Book 8's census is what made the case, and every Book's compared figure is
  republished on the new basis in the ledger.
* **D5 widened**, **D16 clause (b)**, **`PUNCTUATION.md` §6**, and the
  `butlerism` class.
* **The thirteenth source rule**, and an audit that failed it five times.
* **The manifest, attacked rather than asserted** — `--manifests` now runs the
  gates, names the file a Book stands behind, and checks its figures back;
  `--declarations` evaluates every row of `DECLARED`; `prove_manifest.py`
  carries nine attacks and the one residue it cannot close.

## What the checks would still not catch, for this Book specifically

1. **A sentence divided at the wrong seam.** B08-P047 is the package's clearest
   instance and no measure reached it. D27 does not close this; it removes the
   incentive.
2. **Whether the 35 cashed semicolons were each right.** A person ruled all 42
   one at a time; nothing can check the ruling.
3. **Register**, and **a figure carried by a single word** — unchanged.
4. **A discrimination lost across paragraphs.** Arrow C closes the
   same-paragraph case only. `minstrelsy` was caught by arrow C and repaired
   wrongly, which is a fifth thing: **nothing asks whether an arrow's repair is
   right.**

---

## Postscript, 2026-09-13 — the retention figure moved, and no word did

**Book 8's retention is republished from 0.93862 to 0.94093, and its bag
retention from 0.94554 to 0.94784, without a character of the accepted file
changing.** `checks.py`'s `NAME_MAP` — which folds Butler's Roman names onto
the modern edition's Greek ones so that the **name policy does not read as a
loss of retention** — was missing `Mars → Ares`. Row 13 of D5's table was
added at Book 8 step 2 and written into `GLOSSARY.md`, and it was never added
to the map the measure uses. Butler names Mars thirteen times in this Book, in
the lay of Ares and Aphrodite, and this edition was **charged retention for
obeying D5** on every one of them.

Found at Book 10 step 2, when `Proserpine → Persephone` had to be added for
Circe's instructions and the same omission was about to be made a second time.
It is the package's own recurring disease in miniature — *a rule written in
one place and applied in another* — and it is the reason the figure was wrong
in a way nothing could catch: `--all` re-asserts the published figure against
a recomputation that uses **the same** map on both sides, so an omission is
invisible to it by construction. Only meeting a new name exposes it.

**Nothing else moved**: sentences, the sixty-word figure, both censuses,
MOVE-GAP and every NORM RATE are unchanged, because none of them reads a
token's identity. The accepted file's sha256 is unchanged.


## Accessibility successor v3 (2026-09-23), now the accepted file

`candidate-v3.json`, sha256 `b23e8b302ea09fbe5b7fcdbf4b8b6e3da473ac425842d4d3923f2bcd9666536c`: ¶16 "an hereditary" → "a hereditary".
This follows the candidate-only accessibility review that the Book had never had. The screening, the edits and their reasons, and the independent re-verification (**VERIFIED CLEAN**, round 2) are in `../edition-review-2026-09-23/books01-09-accessibility/`.
