# Odyssey Book 8 — review instructions, round 1

You are the independent reviewer. The drafter does not review its own work
(`../WORKFLOW.md` step 4). Findings go under `book08/review/`.

## What to do

1. **Verify the source a second time, by a THIRTEENTH kind of rule.** Twelve
   are enumerated in `../RESUME.md`; do not re-run one of them. Byte-identity
   to a re-run of the drafter's own script is not verification.
   **Audit your rule before you trust it.** Six drafters and reviewers have now
   audited their own source rule and **every one of the six found a defect in
   it as first written** — this Book's found two. Budget for it.
   Your controls must clear the bar Book 7's round 1 set: not a letter flip
   only, but **the B03-P038 splice** and **a paragraph of Butler's own from
   another Book**, both made to fire. `scripts/controls.py` is the D18 rule as
   one callable; route every control through it.
2. **Cover all 50 paragraphs**, one finding or "No material issue found" each.
   17 packets, three paragraphs apiece, in `review-packets/`.
3. **Recompute every published figure** rather than taking it. `checks-v1.md`
   is written by `scripts/checks.py`; an independent recomputation that imports
   nothing from `scripts/` is what Book 7's round 1 did and it is what caught
   substantive finding S-1.
4. **Read `collisions.md` and `continuity.md` §H.1 as work, not as appendices.**
   Every collision row and every compound pair is dispositioned. A disposition
   you think is wrong is a finding.

## The four questions put explicitly

**1. `Hercules` → `Heracles` at B08-P016 — is it inside D5 or outside it?**
The draft writes `Heracles` and says plainly that D5's letter does not reach
him: D5 covers *"the Olympians who have Roman ones"*, and Heracles is a hero.
The draft applies the rule's purpose instead — the edition uses Greek forms,
the poem is Greek, and a reader who meets Ares, Aphrodite and Hephaestus on
that page should not meet Hercules two lines later. **D8 is silent**: the Cast
has no display name for him. Rule it either way; it is one word. If the answer
is that D5 should be widened from *Olympians* to *any figure Butler names in a
Roman form*, say so, because Books 11 and 12 will meet more of them.

**2. The 42 semicolons, every one of them converted — is any division at the
wrong seam?** This is the Book's largest exposure and no measure in the package
can see it. Butler points Book 8 more heavily than any Book so far (42 in 192
sentences) and the draft took every one. Under D20 that is worth exactly zero
on the compared figure, so **nothing was bought by it** and nothing is being
defended: the question is purely whether the resulting sentences break where
the thought breaks. B08-P016, B08-P019, B08-P046 and B08-P049 are the longest
speeches and the densest pointing.

**3. `guardian angel` at B08-P043 — keep, or is it the one anachronism that
should go?** Butler writes *"so shall I bless you as my guardian angel all my
days"*. It is his own Victorian Christianizing idiom in a Greek poem, and the
package's rule is that Butler's images are kept and nothing is added. But a
modern reader meets a Christian figure in Odysseus's mouth. The draft **keeps
it** and flags it rather than deciding quietly. The alternatives are not
obviously better (*"my deliverer"*, *"the one who saved me"* — and the clause
already ends *"for it was you who saved me"*).

**4. Did anything of Butler's get flattened that arrow C could not see?**
Arrow C is new at this step and it caught four of Butler's own discriminations
that this draft had lost (`music`, `noticed`, `stayed`, `dressed`) plus one it
could see inside a paragraph (`lays` → `songs` beside his own `songs`). It only
looks **inside one paragraph**. Butler's discriminations across paragraphs in
this Book — `lays`/`songs`, `minstrelsy`/`music`, `precincts`/`court`,
`raiment` twice — are where to look, and `continuity.md` §6 says what was
decided for each.

## Standing matters

* **D11**: answer every finding either way. An "optional" finding whose real
  subject is a rule for later Books is settled at the Book that raises it.
* **Basis on every figure** (R-1). Book 8's is all 50 paragraphs.
* **Report five numbers**: retention, raw D17 rate, **NORM RATE on Butler's own
  pointing**, semicolons split into kept and added, and **MOVE-GAP** with the
  displaced-runs witness beside it.
* Run `python3 scripts/checks.py --all`, `--manifests`, `--audit`,
  `scripts/prove_manifest.py`, `scripts/rendering_collisions.py`,
  `scripts/collision_triage.py 8`, `scripts/compound_drift.py` and
  `scripts/compound_register.py` in any session that touches this package.
* Content only, under `books/staged-replacements/odyssey/`. Zero Anthropic API
  spend. English only. `app/public/data/editions/**` is read, never written.
