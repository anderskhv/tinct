# Odyssey Book 10 — how to review `candidate-v1.json`

**Read `../WORKFLOW.md` step 5 first, then `continuity.md`, then this.** The
candidate is frozen at
`eedb949e3a668acb03d3c52b2073c5b05125840ee509f79cb2db0ed9e864a038` and **must
not be edited** (D10). Corrections go into a `candidate-v2.json` built by a
script, and every finding is answered either way (**D11**): a declined finding
is asserted still present in the built file.

## Before anything else — two instructions this round adds

**1. Check the premises of the questions below before you answer them.** Book
9's round 1 found that question 1 of its own instructions was **false on the
facts** — it asserted that every paragraph of the Book opens a quotation and
the last closes one, and neither end was true — and the reviewer declined to
answer it as put, because answering it would have written a false description
of Butler's punctuation into `PUNCTUATION.md`. That reviewer also declined a
false dichotomy in question 3. **Both refusals were right and both are now
policy**: if a question here contains a false premise or a forced choice
between two true things, say so and answer the question that should have been
asked. A round that answers four questions as put and finds nothing wrong with
them has probably not checked them.

**2. Recompute the figures yourself, and check the PROSE against them.** Book
9 went into its freeze with its retention published as **0.92164** in four
committed files and **0.92181** in `checks-v1.md` and `manifest.json` — one
matched token apart, because the prose was computed over a pre-freeze
candidate. `checks.py --prose` now exists and passes; it reads figure-bearing
**table rows** and is blind to a figure written into a sentence. Check the
sentences.

## What is asserted, so that you can try to break it

| claim | where | how to test it |
|---|---|---|
| **26 dividing marks, every one the mark Butler wrote in that place** — 26 kept by identity, 0 class-changed, 0 added | `continuity.md` §1 | `checks.kept_class_added_div()` and `class_changed_rows()`. **Do not accept the two NORM RATEs agreeing as evidence** — records finding R-8 of Book 9's round shows that agreement rules out marks written from nothing and not marks *exchanged*. |
| **Nothing is repaired under D16 and no word is supplied** | `continuity.md` §5 | Book 9's §5 made this claim and a reviewer disproved it in one grep, finding three. The claim here is meant to be enumerable; enumerate it. |
| **The nine collision repairs all restore Butler's own word** (D29) | `continuity.md` §7 | against PG #1727, one at a time. The repairs removed their own rows from the generated report, so the only record of them is a hand-typed table — records finding R-7 of Book 9's round, still open. |
| **The source is PG #1727's Book X** | `book10/source-verification.txt` | the sixteenth rule. Attack it; two of its own audit failures are written into the file and a third is likely. |
| **The source is PINNED** | `scripts/pg_source.py`, clause (b4) | `scripts/attack_source_pin.py` is eleven attacks and one of them passes. Find a twelfth. |

## The four questions, put explicitly

**Question 1 — the two sixty-word sentences that survive.** Twelve of Butler's
sixty-word sentences become two. Both survivors are at **B10-P013** (the stag)
and **B10-P029** (Circe's four servants), and both are Butler's own long
sentences left long on the ground that the *sequence* is one action. The D17
gate permits nine. **Are they right, or is `12 → 2` two decisions nobody
made?** Read both paragraphs whole. Note that the absolute long-sentence
report (`checks-v1.md` §6) lists 39 candidate sentences of 40 words or more,
which is the carrier for *a sentence left long because it is long in Butler*.

**Question 2 — the thirty-four cashed and the twenty-six kept.** Read all 60
of Butler's dividing marks, dashes included, as Books 8 and 9's rounds did.
This Book keeps a lower proportion than Book 9 did (26 of 60 against 45 of 71)
and the reason is that Book X is narrative where Book IX is a speech. **Is the
proportion right, and is any individual cashing wrong?** Two to look at first:
**B10-P012**, where Butler's `; and having landed we lay there` chain is
divided three ways, and **B10-P029**, where his colon after `set about their
work` is kept.

**Question 3 — `stalwart`, and whether a collision repair can be worse than
the collision.** `six lusty sons` became `six sturdy sons` and the check
repaired it to `six stalwart sons`, because `sturdy` is Butler's own at P011
and P036. **D29 says a repair restores Butler's word; here Butler's word
(`lusty`) is the one that could not be kept, so the repair had to invent a
third.** Is `stalwart` right? Is there a Butler word in this Book that would
have served? And — the general question, which is blind spot 7 — **nothing in
the collision record asks whether a repair is accurate**, only whether it
collides. Five of this Book's nine repairs restore a word; four choose one.
Check all nine.

**Question 4 — the two square brackets at B10-P008, and whether D12 was
applied or evaded.** PG and the served file both carry *"driving in his sheep
and goats **[to be milked]** salutes him who is driving out his flock **[to
feed]**"*. §5 rules that these are a translator's expansion — closed, balanced,
part of the sense — and sets them as ordinary text, unlike Book 9's B09-P041
bracket, which was unclosed and marked a suspected interpolation that Butler
names in his own footnote [82] and Preface. **Is that distinction real, or is
it a convenient reading of D12?** If it is real, D12 needs the distinction
written into it, because at present D12 says only *no square brackets*, and a
drafter who meets a third kind has no rule.

## And two things this round is specifically asked NOT to do

* **Do not accept a disposition in `collisions.md` as a ruling.** Book 9's S-4
  found a wrong rendering dismissed by boilerplate shared by sixteen rows. The
  boilerplate is rewritten to name the one decision each row contains — which
  makes it easier to check, not unnecessary to check.
* **Do not report a figure without the paragraph set it is computed over**
  (R-1). Every row of every table this package writes prints its basis.
