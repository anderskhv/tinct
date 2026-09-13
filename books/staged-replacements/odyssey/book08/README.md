# Odyssey Book 8 — frozen draft v1, for independent review

*Banquet in the house of Alcinous—the games.* 50 paragraphs, the
second-largest Book the package has drafted. Step 4 of the eight in
`../WORKFLOW.md`: the draft is frozen and stops here for a review it does not
do itself.

## What is in this directory

| file | what it is |
|---|---|
| `candidate-v1.json` | the frozen draft. **Never edited** (D10); corrections go to `candidate-v2.json`. |
| `candidate-v1-readable.md` | the same text with paragraph IDs outside the prose |
| `source-book8.json` | the served `original-en` chapter 8, the text this is scored against |
| `checks-v1.md` | **every published figure, written by `scripts/checks.py`** — the only thing that computes them |
| `manifest.json` | packet coverage, and the `checks` block: the sha256 of `checks-v1.md` and of the candidate it was computed over |
| `continuity.md` | the figures, the decisions, the name census, the D16 repairs, and §H.1's compound register |
| `collisions.md` | **all 93 collision rows touching this Book, each with a disposition** |
| `review-instructions.md` | how to review it, and **four questions put explicitly** |
| `review-packets/` | 17 packets, three paragraphs each, source beside candidate with one paragraph of context either side |
| `source-verification.txt` | the output of the twelfth source rule |

## The figures, on all 50 paragraphs

| | |
|---|---|
| Butler token retention | **0.93844** |
| **MOVE-GAP** (upper bound) / displaced runs (strict witness) | **0.00692 / 0** |
| sentences, source → candidate | 192 → 244 |
| raw splitting rate (D17) | +27.1% |
| sixty-word sentences | **11 → 0 (100% broken)** |
| semicolons, Butler → candidate (D19) | **42 → 0**, of which **0 kept + 0 added** |
| **NORM RATE on Butler's own pointing (D20)** | **+4.3%** |
| word ratio | 0.992 |

**Read the last two rows together.** The raw +27.1% is almost entirely the 42
semicolons becoming periods, which D20 prices at exactly zero. **+4.3% is the
figure.** And the count that Book 7's round 1 was written about — semicolons
the draft *added* where Butler wrote a comma, worth a full division apiece for
one keystroke — is **zero**. Only accepted Book 4 has managed that before, and
this is the first Book drafted after the measure existed.

## What was done differently here

* **The source rule is the twelfth kind, and it reads no prose to find the
  Book.** It locates chapter 8 by matching the served edition's 24 chapter
  **titles** against PG's 24 **argument lines**, cross-checked against PG's
  **table of contents** — two channels `RESUME.md` named as unused. Ten
  controls under D18 on both clauses, including **the B03-P038 splice** and **a
  paragraph of Butler's own Book VI**, which is the bar Book 7's round 1 set,
  and a third of that kind: a paragraph of Butler's own Book VIII moved within
  Book VIII.
* **Its audit failed it twice and both failures are recorded** rather than
  quietly fixed — the anchor format, and a clause that could not fail. The
  second repair found **three divergences of the served file from PG that
  nobody had recorded**.
* **The collision check ran during drafting, with the new arrow C**, and six
  collisions were repaired before the freeze, four of them Butler's own
  discriminations that the draft had flattened. `continuity.md` §7.
* **B08-P033 is DECLARED byte-identical rather than edited.** This is **M-9**
  of Book 7's round 1 applied: the byte-identity gate is a tripwire, not a
  floor to clear, and Book 7 made a cosmetic edit to clear it that the reviewer
  called a disimprovement. Book 8 declares.
* **Every one of the 93 collision rows and all 28 H.1 compound pairs has a
  written disposition** — records finding R-2 and blind spot 8 of Book 7's
  round 1, which is that the instruments worked and the record did not say what
  anyone decided.

## What the checks cannot see, and where to look hardest

Book 7's round 1 listed eight. The ones this Book is most exposed to:

1. **A sentence divided at the wrong seam.** 42 semicolons became periods.
   Every one is a division nobody checked for rightness, and no measure in the
   package can. This is the largest single exposure in the Book.
2. **A garden path the draft builds out of a mark.** B07-P020 was made by
   deleting one comma and no instrument saw it.
3. **Register.** `sup` → `eat` was the Book 7 instance. Here: `playing` for
   `minstrelsy`, `robes` for `raiment`, `was aware of` for `perceived`.
4. **A figure carried by a single word.** B08-P047's simile of the widow is the
   longest and best sustained figure in the Book.

Nothing here is merged, deployed or registered, and
`app/public/data/editions/**` is never written.
