# Odyssey Book 6 — acceptance record

**Accepted file:** `book06/candidate-v2.json`
**sha256:** `0e435458f6c30384415559af86b49ee01c402308bd9d36fdfea5462887bde2be`
**26 paragraphs, 1:1 with the source. 3435 → 3431 words, ratio 0.99884.**
**Accepted 2026-09-12**, after round 1 (`book06/review/findings-v1.md`,
verdict *accept after corrections*), step 6 (`scripts/build_book06_v2.py`) and
step 7 (`book06/flow-read.md`).

`candidate-v1.json` stays frozen at
`9391ca16778a8225c1710b24296c51a2d3ba33f26ed3ac9fcf7c677c3c0413f0` and is not
edited (**D10**); it is the record of what round 1 reviewed.

---

## The figures

**Basis: all 26 paragraphs.** Every figure below is produced by
`python3 scripts/checks.py 6` and is written to `book06/checks-v2.md`; none of
it is typed by hand. Stating the basis on every figure is records finding
**R-1** of this Book's own round 1.

| measure | v1 | **v2 (accepted)** |
|---|---|---|
| Butler token retention (canonical, aggregate-join) | 0.93669 | **0.93408** |
| bag retention (order-blind) | 0.94594 | 0.94565 |
| **MOVE-GAP** (bag − order) — **D20** | 0.00925 | **0.01156** |
| displaced runs (the strict witness) | 1 | **2** |
| sentences, source → candidate | 116 → 148 | **116 → 148** |
| **splitting rate, raw — D17** | +27.6% | **+27.6%** |
| **NORM RATE — D20** | +6.3% | **+7.0%** |
| sixty-word sentences | 7 → 1 (86% broken) | **7 → 1 (86% broken)** |
| **semicolons, Butler → candidate — D19** | 27 → 4 | **27 → 5** |
| word ratio | 0.99913 | 0.99884 |

**Read the v1 → v2 column, not the v2 column alone.** The round was about
whether Book 6's headline splitting rate was bookkeeping, and the corrections
were chosen to move the honest numbers rather than the headline. They did:

- **Retention fell 0.93669 → 0.93408 and MOVE-GAP rose 0.00925 → 0.01156.**
  That is what moving clauses costs and dividing them does not — the same
  signature Book 5 v1 → v2 produced when it did three real recasts
  (0.94211 → 0.93808, MOVE-GAP 0.00721 → 0.00891). Book 6 v2's MOVE-GAP is now
  **30% above accepted Book 5 v2's**, and its **displaced runs go 1 → 2**, which
  is the strict witness and the one the reviewer said Book 6 tied Book 5 on.
- **The raw rate did not move at all, and that is the point.** 116 → 148 before
  and after. Two divisions were added (S-1(b)), one was rejoined (M-3), one was
  taken back to Butler's semicolon (the flow read's F-1), and the headline
  landed exactly where it started. **NORM RATE rose +6.3% → +7.0%**, because the
  two added divisions are real and the two removed ones were bought.
- **F-1 is the demonstration.** Putting one semicolon back moved the raw rate
  from +28.4% to +27.6% and left NORM RATE at +7.0% to the decimal. A period
  turned back into a semicolon is worth 0.8 points of headline and exactly zero
  of division.

---

## What was applied, and what was not

`book06/changes-v1-to-v2.md` carries every row. **14 substitutions in 10 of the
26 paragraphs**, plus one flow-read change; **3 findings declined and asserted
still present** in the built file, so a decline cannot be a silent application;
**2 findings settled as rules** with no change to the text (**D11**).

### The two substantive findings

- **S-1(a) — B06-P018, the silver-plate sentence.** The hardest sentence in the
  Book, left untouched while the same paragraph cashed three semicolons for
  three easy divisions. Butler puts *a skillful workman* eleven words from its
  verb *enriches*, and every reader garden-paths at *"under Hephaestus and
  Athena enriches"*. Round 1 offered a minimal repair (two commas) and a better
  one (put the tenor first) and called either a real recast. **The better one is
  taken**, because S-1's complaint is that this paragraph did no syntactic work,
  and commas fence a garden path rather than remove it. The subject and verb now
  touch; the relative clause stands as an appositive where the praise belongs;
  Butler's coda keeps its own em dash; **not one of his words is dropped** and
  the sentence is still one sentence.
- **S-1(b) — B06-P016.** 141 words, two word-level edits, one cashed semicolon
  and two untouched chains of 43 and 38 words: plain lexically and not
  syntactically. Each chain is divided at its second `and` with the subject
  supplied — the smallest edit in the direction of the defect, which is the
  B05-P012 and B06-P005 rule. **+2 sentences, neither bought by a semicolon.**
- **S-1(c) — B06-P006 is answered, not owed.** Recorded as declined and
  asserted, so a later pass does not go looking for the third of three.
- **S-2** is answered outside this Book: `scripts/checks.py`, called by
  `scripts/build_book_package.py` and by this Book's own build script. See
  below.

### The nine minor findings — all applied

**M-1** `grass` → `greenery` (one rendering was carrying Butler's `herbage` and
Butler's own `grass` inside one Book; `greenery` also matches accepted
B05-P006, so `herbage` now has one rendering across the package). **M-2**
`topes` → `sits over his wine` (the fifth collision, with accepted B04-P020's
own `drinks`, and it keeps the idleness the joke needs). **M-3** `Athena then
made … She also made …` rejoined. **M-4** is the minimal half of S-1(a) and is
subsumed by it. **M-5** `appear` restored at P015, so Butler's variation against
P021's `seem` is not flattened. **M-6** `picked up` → `taken`. **M-7** `prevent`
restored. **M-8** `Just as … So …`, the correlative restored across the
division. **M-9** `thwarts` → `galls`.

**One recorded variant.** M-6 proposes `taken **off** some foreign vessel`;
Butler's own preposition is `from`, `taken from` is ordinary modern English, and
there is no reason to move a preposition while repairing a verb. Applied as
`taken from`. Likewise **O-2** proposes `like nymphs that haunt mountain tops`;
Butler's own `like **those of** the nymphs` removes the repeated *voices*, is
current English, and compares voices with voices rather than voices with nymphs.
Both variants are recorded rather than taken silently.

### The six optional findings

- **O-2** applied (in Butler's form, above). **O-5** `plied` restored.
- **O-3 settled as a rule, no change to the text.** *A Butler inversion is kept
  where it is the second limb of a comparison the sentence needs in order to be
  read, and un-inverted where it is a bare narrative tag.* P009 (`So did the
  girl outshine…`) and P012 (`Even such did Odysseus seem…`) are correlative
  apodoses answering a simile; P026 (`Thus did he pray` → `So he prayed`) is a
  tag. One class, one rule, two outcomes that follow from it — which is what
  **D16** did for punctuation. All three asserted by the build.
- **O-4 settled as a rule, no change to the text.** *Butler's
  `conduct`/`conducted` family is not a reserved term and has no fixed
  rendering: each instance takes the verb its own sentence's action calls for*
  (`take` B01-P007, `led` B01-P010, `conducted` B04-P024, `guide` B06-P010).
  The opposite disposition from `still undecided` for `thus in two minds`, and
  the difference is decidable: a formula Butler repeats verbatim gets one
  rendering, a common verb does not.
- **O-1 declined, and the loss recorded** — which is what round 1 asked for if
  no rendering held both senses, and none does. Butler's `scion` is a plant word
  and prepares the palm tree of the very next sentence; `young woman` is safe and
  severs it. `creature` is Butler's own word at B04-P077 and B05-P010 and taking
  it would be the exact collision M-1 and M-2 exist to stop; `shoot`, `scion`
  and `sapling` said of a girl to her face are not modern English in this
  register. **The figure is lost and the loss is on the record**, here and in
  `continuity.md`.
- **O-6 declined and escalated.** `mountain tops` is the standard *closed* form
  in American English, which is the spelling standard **D15** names — but the
  form is consistent with accepted B05-P030 and recorded, closing it here would
  put Book 6 in drift with accepted Book 5, and closing it there costs a ~~**sixth
  successor**~~. Coordinator decision, ledger **A4**(ii), where it sits beside the
  vendored word list that would settle the class mechanically.

  **CORRECTION, 2026-09-13 — records finding R-6 of `book07/review/findings-v1.md`,
  and the cost is TWO successors, not one.** The sentence above counts only the
  Book 5 successor. `mountain tops` is in **accepted Book 5** (`candidate-v2.json`,
  B05-P030) **and in accepted Book 6** (`candidate-v2.json`, B06-P011) — Book 6 is
  itself accepted, so changing it costs a successor too. **A5 is now decided and
  both are built**: `book05/candidate-v3.json` and `book06/candidate-v3.json`,
  closing it to `mountaintops`, with `book05/candidate-v2.json`,
  `book06/candidate-v2.json` and this acceptance record **byte-unchanged**. The
  vendored word list of A4(ii) is **declined**; the register in each Book's
  `continuity.md` §H.1 is what closes the class. See `scripts/build_compound_sweep.py`.

  *A correction to the finding while declining it:* O-6 cites `B06-P009,
  B06-P011` and §8 repeats it against P009. **The string occurs at P011 only** —
  P009's are *"the mountains of Taygetus or Erymanthus"*. The build's
  decline-assertion failed on the missing fragment, which is the assertion doing
  its job.

### The five records findings

- **R-1** — the comparability table, corrected everywhere it is quoted, with
  every row now stating its basis. See `00-progress-ledger.md`, *The
  comparability table*. Three further corrections in the same class came out of
  the recomputation, including that round 1's own NORM RATE and MOVE-GAP columns
  used the **other** basis for Book 3.
- **R-2** — B06-P020's **D16** comma-splice repair recorded in `continuity.md`
  §4 and asserted by the build.
- **R-3** — **REFUSED, with evidence.** `consecutive()` in
  `book04/review/verify_source_book4_review.py` is **not** dead: it is the
  verdict function of D18 control A and the control fires when the script runs.
  Deleting it would have deleted a live control. Recorded at the function and in
  the ledger.
- **R-4** — accepted. B06-P005's clause movement is 0.0000 and its one
  intervention is a supplied name, which is a repair. The Book's genuine
  recasting is **three** paragraphs, P004, P012 and P013 — and P004's figure is
  a dative shift, so on the strict displaced-runs witness it is P013 alone in
  v1. `continuity.md` §10 corrected.
- **R-5** — accepted. `continuity.md` §11's claim that the one-word-two-ways
  report "returns 75 rows … the three that are real are recorded" is replaced by
  a statement of what the report can and cannot see, with the cross-Book,
  two-arrow successor named.

---

## Source verification

Verified **twice, by two rules sharing no channel**, and each audited before it
was trusted.

- **The drafter's eighth rule** (`scripts/verify_source_book6.py`): a
  resemblance profile of the whole PG file by suffix automaton, asking not *is
  the chapter here* but *is there anywhere else it could have come from*. Full
  length at exactly one position, `[28997, 32456)`; second-best match anywhere
  in the file **37 tokens**.
- **The reviewer's ninth rule**
  (`book06/review/verify_source_book6_review.py`): letter-blind typographic
  shape — every letter destroyed, PG's footnote numerals deleted, all other
  pointing kept exactly. The chapter's 17 732-character shape occurs in PG
  exactly once; letters restored at that span are character-for-character
  identical; the longest shape shared with anywhere else in the file is **155
  characters**. Its audit failed the rule **three times** as first written.

`book06/source-book6.json` is character-identical to the served
`odyssey-original-en.json` chapter 6, sha256
`351c2f4647245348450458e2309214b96cf6f6af5e670e9efbc6ddbcdaec5668`.

---

## The checks, and that they now run

This is the Book at which **S-2** was found, so the acceptance record says
plainly what changed. Until 2026-09-12 **no check in this package was executed
for a new Book by anything in the repository**: there was no
`build_book06*.py`, `build_book_package.py` called no check at all, D17's gate
lived only in Books 4's and 5's *correction* scripts and **had never gated a v1
candidate**, and this Book had no `checks-v1.md`.

Every measure now lives in `scripts/checks.py` and is imported, never re-pasted.
`scripts/build_book_package.py` runs it at the end of every build and writes
`manifest.json` **only if the gates pass**, recording the checks file's sha256 —
so a package directory whose checks did not run has no manifest.
`scripts/build_book06_v2.py` runs it too, and fails if any gate fails.
`python3 scripts/checks.py --all` re-asserts every accepted Book's published
figures. Both `book06/checks-v1.md` and `book06/checks-v2.md` exist, and every
figure above is in them.

**All gates pass for `candidate-v2.json`:** D17's rate floor (+27.6% against a
floor of +2.74%, half accepted Book 3's +5.5% on its own 37-paragraph basis),
D17's sixty-word survival (1 of 7), the **D20** aligned growth gate (no sentence
grown past 50 words; one grown into the 40s and reported), word ratio,
per-paragraph length floor, D9, D12, whitespace, no paragraph byte-identical to
Butler, and cross-Book compound drift clean over all six Books.

## Accessibility successor v4 (2026-09-23), now the accepted file

`candidate-v4.json`, sha256 `2c416c4028517f413963feb9a4e2adf58c1e17b910d78ded88f98589e6f890f0`: ¶12 "a great many people after me" → "following me" (blocking; Butler's "much people after me").
This follows the candidate-only accessibility review that the Book had never had. The screening, the edits and their reasons, and the independent re-verification (**VERIFIED CLEAN**, round 2) are in `../edition-review-2026-09-23/books01-09-accessibility/`.
