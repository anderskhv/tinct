# Odyssey Book 7 — instructions for the independent reviewer (round 1)

You are reviewing `book07/candidate-v1.json`, frozen at sha256
`bf8cf2f76f4670daab55daf1da265ba7b1839c0cd6680e3c5691fac8d382dc33`, against
`book07/source-book7.json`. Work on your own branch and your own worktree, and
write nothing outside `book07/review/`. **`candidate-v1.json` is frozen and must
not be edited (D10)** — it is the record of what this round reviewed.

Read `../WORKFLOW.md`, `../GLOSSARY.md`, `../PUNCTUATION.md`, the ledger
(**D1–D20**, plus open item **A4**), `book07/continuity.md` and
`book07/checks-v1.md`. Then the ten packets, which cover
`B07-P001`…`B07-P029` exactly once each.

**Every paragraph gets exactly one entry in your findings file** — a numbered
finding or "No material issue found". Coverage is the point; a review that
reports only what it noticed is not a review.

## What is different about this round

**This is the first Book in the package whose v1 candidate was gated by
anything**, and it is the first whose published figures you can reproduce by
running something rather than by recomputing them yourself:

```
python3 scripts/checks.py 7          # writes book07/checks-v1.md, exits non-zero on any gate
python3 scripts/checks.py --all      # re-asserts every accepted Book's published figures
python3 scripts/checks.py --audit    # 10 controls under D18, 2 declared blindnesses
python3 scripts/verify_source_book7.py
python3 scripts/rendering_collisions.py
python3 scripts/compound_drift.py
```

**Do not take that as a reason to check less.** Take it as a reason to check
*the checks*: `scripts/checks.py` is four days old, its own audit failed twice
while it was being written, and the first time `--all` was run it found that two
of the gates the package believed it had were Book 5's assertions about Book 5
(records finding **R-6**). **Verify the source independently, by an eleventh
kind of rule** — the ten used are listed in `RESUME.md` — and **audit your rule
before you trust it**. Six drafters and reviewers have now audited theirs and
**all six audits failed the rule as first written**; this Book's failed three
times. Budget for it.

## The five questions, put explicitly

**1. B07-P013 — the parenthesis that was opened out AND moved.** Butler puts a
30-word blessing in parentheses *between the verb and its complement*:
*"I humbly pray you, as also your husband and these your guests (whom may heaven
prosper…) to help me home"*. The candidate closes the petition up and makes the
blessing its own sentence after it. That is the **B06-P018** defect and its
**S-1(a)** repair, applied at the drafting stage — and it is also **the Book's
only displaced run**, i.e. the only clause movement the strict witness records.
**Is the move right, and is the blessing's `them all` clear enough at its new
distance from `these guests of yours`?** The alternative was em dashes in
Butler's own position, which keeps the order and keeps the twenty-word
interruption.

**2. Four rendering collisions were found, kept, and are handed to you.**
`scripts/rendering_collisions.py` found eleven rows touching this Book; seven
were repaired before the freeze (`README.md`) and **four were kept because each
is Butler's own word in a different grammatical role or of a different
referent**:

| row | the accepted instance | this Book |
|---|---|---|
| `lighted` | B01-P032, a transitive verb — *"lighted Telemachus to his room"* → **lit** | B07-P010, an adjective — *"with **lighted** torches in their hands"* |
| `luscious` | B05-P006, *"luscious herbage"* → **lush greenery** | B07-P011, *"There are **luscious** figs also"* |
| `endowed` | B02-P001, *"Minerva endowed him with a presence"* → **gave** | B07-P011, *"the splendors with which the gods had **endowed** the house"* |
| `issue` | B03-P007, *"issue"* of an outcome → **outcome** | B07-P007, *"without male issue"* → **without a son** |

**Is each of these the `live in heaven` / `dwell in heaven` discrimination that
B06-P019 was upheld on, or is it the `herbage` drift that M-1 convicted?** The
drafter cannot be the one to say which about its own draft, which is why they
are here rather than in a decision.

**3. `councillors` is kept against the spelling standard, deliberately, and it
costs something either way.** **D9** says American spelling, which gives
`councilors`. Accepted **B02-P001** prints `councillors`. The candidate matches
the accepted Book rather than the rule, on the ground that a successor is the
more expensive correction. **Rule it.** If the rule wins, it costs a successor
to accepted Book 2 and this Book's word changes too; if the accepted Book wins,
`councillors` should be written into `PUNCTUATION.md` §1 as a named exception so
the question is not rediscovered at Book 8.

**4. Fourteen of Butler's thirty semicolons are kept, five of them in one
paragraph.** B07-P011's vineyard is a serial list — raisins, gathering,
treading, blossom, colour. The drafter's argument is that converting them would
add five sentences, raise the raw D17 rate by about five points, and leave
**NORM RATE unchanged to the decimal**, so the conversion would be pure
bookkeeping of exactly the kind **D20** exists to price out. **Test that
argument** — recompute it, do not accept it — **and then say whether the
paragraph reads better with them or without them**, which is a different
question and the one no measure answers.

**5. B07-P010 and B07-P011 keep Butler's present tense inside a past-tense
narrative.** *"There are fifty maidservants in the house"*, *"there is a large
garden"* — and then *"Such, then, **were** the splendors"*. The drafter's
position is that the shift is Homer's and is doing work. **The alternative
reading is that a modern reader takes it for a mistake**, and the accessibility
standard says tangled syntax is simplified while voice is kept. Which is this?

## What the checks still cannot catch, and what you are therefore for

From `book06/review/findings-v1.md` §9, and none of these has gained a carrier
except by a person reading:

1. **A sentence divided at the wrong seam.** D17 counts sentences and NORM RATE
   counts the ones a semicolon did not pay for; neither can tell a good division
   from a bad one. Book 4's F-1, Book 5's three reversals and Book 6's F-1 were
   all found by reading.
2. **A garden path.** Nothing in the package models what a reader parses.
   B06-P018's *"under Hephaestus and Athena enriches"* survived every check in
   the repository. **B07-P026's Euboea sentence was the same shape and was
   divided; look for the one that was not.**
3. **Register.** `picked up` at B06-P022 was ordinary modern English, cost no
   retention, and was wrong.
4. **A figure carried by a single word**, like `scion` preparing the palm tree
   at B06-P013. Retention counts the word; nothing counts what it was for.
5. **A quantity or a concrete detail quietly generalized.** Everything in
   B07-P009 to B07-P011 is an inventory — bronze, blue enamel, silver lintel,
   gold door-hook, fifty maidservants, four acres, two streams. **Check them one
   by one against Butler.** This is the densest concentration of load-bearing
   physical detail in the package so far.

## What to produce

`book07/review/findings-v1.md`: a verdict (*accept* / *accept after
corrections* / *revise and resubmit*), a severity table, coverage for all 29
paragraphs, your own recomputation of every published figure with **its basis
stated on every row** (**R-1**), your independent source verification by an
eleventh rule with its audit, and every finding numbered so the drafter can
answer each one either way (**D11**).
