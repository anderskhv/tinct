# RESUME — where this package stands, for the next worker

Updated continuously. Read this first, then `WORKFLOW.md`.

**Last updated:** 2026-09-13, session `session_01K5bL9oWzAagjTMExsyUADi`
(worker 12). **Books 1–8 are accepted. Book 9's ROUND 1 IS DONE** —
`book09/review/findings-v1.md`, 7 substantive, 9 minor, 8 records, 3
optional, all 44 paragraphs ruled — and Book 9 is at **step 6**, owing a
`candidate-v2`. **The manifest was attacked a third time and DEFEATED: no
clause pins the SOURCE file** (A11).

## State

**Basis is stated on every row, because a figure without the paragraph set it
is computed over is not a figure (R-1).** The one authoritative table is
`00-progress-ledger.md`, *The comparability table*, produced by
`python3 scripts/checks.py --all`, not typed.

| Book | Step | file scored | basis | Retention | raw D17 | semicolons | dividing marks (D27) | **kept + ADDED** | **NORM RATE, D27, on Butler's pointing** | MOVE-GAP / displaced |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | 8 — accepted, successors v3, v4 | `candidate-v2` | all 32 | 0.72703 | +20.5% | 47 → 13 | 55 → 39 | 20 + 19 | **−4.3%** | 0.05088 / 2 |
| 2 | 8 — accepted, successors v3–v6 | `candidate-v2` | all 35 | 0.90232 | +16.1% | 36 → 21 | 58 → 61 | 36 + 25 | **+0.0%** | 0.01632 / 0 |
| 3 | 8 — accepted, successor v3 | `candidate-v2` | **37 of 38** | 0.89641 | +5.5% | 39 → 32 | 53 → 47 | 39 + 8 | **−2.3%** | 0.02156 / 0 |
| 4 | 8 — accepted, successors v3–v5 | `candidate-v2` | all 81 | 0.95872 | +8.9% | 68 → 50 | 103 → 81 | **80 + 0** | **+0.5%** | 0.00431 / 0 |
| 5 | 8 — accepted, successor v3 | `candidate-v2` | all 37 | 0.93808 | +23.5% | 34 → 13 | 64 → 35 | 34 + 1 | **+2.8%** | 0.00891 / 1 |
| 6 | 8 — accepted, successor v3 | `candidate-v2` | all 26 | 0.93408 | +27.6% | 27 → 5 | 38 → 16 | 14 + 2 | **+5.2%** | 0.01156 / 2 |
| 7 | 8 — accepted | `candidate-v2` | all 29 | 0.93438 | +34.0% | 30 → 7 | 42 → 18 | 14 + 4 | **+4.8%** | 0.01217 / 1 |
| **8** | **8 — ACCEPTED** | **`candidate-v2`** | all 50 | **0.94093** | **+22.4%** | **42 → 7** | **62 → 31** | **24 + 7** | **+2.0%** | **0.00692 / 0** |
| **9** | **6 — ROUND 1 DONE** | `candidate-v1` | all 44 | **0.92181** | **+21.1%** | **54 → 24** | **71 → 41** | **41 + 0** | **+2.5%** | **0.01266 / 2** |

**Book 9's retention was published as 0.92164 in four places and is
0.92181** — records finding R-1 of `book09/review/findings-v1.md`. The
difference is exactly one matched token, so the prose figures were computed
over a pre-freeze candidate; `checks-v1.md` and `manifest.json` were right
and the four prose copies were not, because nothing checks prose.
`scripts/draft_book09_v1.py`'s docstring publishes a third value, 0.91976.

Hashes: Book 8 accepted
`12f2904e6e40ac839a608797cf8f866d1f1e5227ae415f11aee6c0238f43de22`;
Book 9 frozen v1
`41f452ac577054aa820eba1cf1bb20cc24b382e6e3330b74af8c24f657c481fb`;
Book 8's frozen draft `e758790c…`; Book 7 accepted `e79eb82b…`.

## The column that is new — D27, and why every figure moved

**Substantive finding S-1 of Book 8's round 1, with its census.** Of Book 8's
52 new sentence boundaries, **44 were marks Butler had already written** — 40
semicolons, **1 colon, 3 em dashes** — and 8 divided his prose. Commas moved
410 → 407; MOVE-GAP 0.00692 with zero displaced runs. There was no clause
movement to find and the +27.1% was bookkeeping.

**D20 priced the semicolon and nothing else**, so a colon or a sentence-internal
em dash cashed for a period was free division under every measure the package
had. **D27 widens clause (a) to all three**, and D21's construction rides on
top: on the candidate's side only the marks of Butler's that survive count, so
raising a comma to any of the three is worth nothing.

Every Book is republished on that basis in the ledger, **with the old column
kept beside it** rather than overwritten, because replacing a column in place
is R-1. Book 5 falls furthest (+7.5% → +2.8%); **Book 2 goes to zero** — it
carries more dividing marks than Butler does and 25 of its 61 are its own.
Books 6 and 7 remain the two that divided Butler's prose most.

Eight new `--audit` controls, 22 in all. The sharpest: *cashing a colon leaves
the extended measure exactly where it was, moves the raw D17 rate, **and moves
D20 as it stood***.

## The manifest, for the third time — ATTACKED, not asserted

**The defeat, reproduced before it was repaired.** Plant a gate-failing defect
in `book07/candidate-v2.json`, edit **one field** (`checks.candidate_sha256`),
and `--manifests` exits 0 while `checks.py 7` exits 1. `verify_manifest`'s
`all_gates_passed` clause was guarded on `gate is not None` and `--manifests`
never passed one, so on the path most people run **the clause did not exist**.

What is there now:

* **`--manifests` RUNS the gates**, over the candidate the *manifest* names,
  and reports their failures whether or not the manifest claims a pass.
  **Absence of gate evidence beside `all_gates_passed: true` is itself a
  failure**, so a caller that forgets is caught rather than trusted.
* **clause (b2)** — the manifest must name the file the Book stands behind.
* **clause (b3)** — the **figures** it records must reproduce from that
  candidate. The hashes proved the bytes had not moved and nothing proved the
  numbers, which are the part a reader reads.
* **`--declarations`** puts the full gates to **every key of `DECLARED`**, and
  is folded into `--all`.
* **`SUPERSEDED`** — every `bookNN/candidate-v*.json` on disk must be in
  `DECLARED` or in `SUPERSEDED`, in exactly one, asserted as set equality both
  ways. A row that declares anything must carry a written **reason**.
* **`ACCEPTED`'s shipping column must be the highest declared candidate** —
  the staleness class that had `compound_drift.py` reading Book 7's *rejected*
  v1.
* **The generated `checks-vN.md` must still reproduce from the code.**
  `--manifests` now renders what the code *would* write and compares its hash
  with the manifest's. **This class was found by `prove_manifest.py`'s own
  control**, not by an instrument: accepting Book 8 put a ninth row in the
  cross-Book table every checks file prints, so every earlier Book's file
  stopped reproducing — while its recorded hash and the file on disk still
  agreed, because both were the same stale pair. **Accepting a Book now means
  re-running `checks.py N --write-manifest` for every Book that has a checks
  block**, and `--manifests` says so by name when you forget.

**`prove_manifest.py` is now nine attacks and 24 assertions.** The dead fifth
case is gone; R-5 is proved end to end against `DECLARED` through the command
line (a synthetic Book 99 with two identical growths in one paragraph, one
declared) instead of against two hand-built `Counter`s. **It takes about nine
minutes**, because every attack works on a fresh copy and several run the full
gates over twenty files.

**The attacks that were tried, in the order they became the cheapest next
move** — each one is in the script, with its result:

| | attack | result |
|---|---|---|
| A1 | defect + rewrite `candidate_sha256` (the one that landed) | rejected |
| A2 | the same, with `all_gates_passed` withdrawn | rejected — the gates are run and reported regardless |
| A3 | leave the defect, point `candidate_file` at a clean file | rejected by (b2) |
| A4 | delete the whole `checks` block | rejected |
| A5 | edit a FIGURE, leave every hash sound | rejected by (b3) |
| A6 | plant the defect in `book02/candidate-v3.json`, which no invocation reached | rejected by `--declarations` |
| A7 | a new candidate file in neither table | rejected by coverage |
| A8 | write a successor, leave the shipping column stale | rejected by coverage |
| A10 | change the RENDERER so the generated `checks-vN.md` no longer reproduces — no candidate touched, every hash internally consistent | rejected — **this class was found by the proof's own CONTROL** |
| **A9** | **declare the defect, then re-run `--write-manifest`** | **PASSES, and must** |

**A11 — AND IT IS DEFEATED AGAIN. Nothing pins the SOURCE.** Book 9's round
1, `book09/review/attack_manifest_a11.py`. Every one of the nine attacks
moves the candidate, a manifest field, the renderer or a declaration.
Clause (b3) recomputes every figure from
`bookNN/source-bookN.json` — a file loaded by naming convention whose
sha256 is in no manifest, no `ACCEPTED` row, no `DECLARED` row, no
`SUPERSEDED` row and no assertion of `prove_manifest.py`. **Remove one comma
from Butler and `checks.py N`, `--manifests` and `--all` all exit 0 with
nothing regenerated**, because no recorded figure can see a comma. Rewrite
Butler so the figures move, re-run `checks.py N --write-manifest`, and the
package is internally consistent again **with no declaration at all** — so
it is not A9. The `verify_source_bookN.py` scripts do tie the file to PG,
and no aggregate command runs them. **Fix: record `source_sha256` in the
manifest, and assert the file is character-identical to the served
`odyssey-original-en.json` chapter.**

**A9 is the residue and it is named, not claimed shut.** A declaration is a
licence and no mechanical check can grade a reason. What the repair buys is
that the reason must exist, be evaluated, and appear in a diff. Note also that
declaring the defect *alone* now exits 1, because (b3) recomputes the figures.

## The `DECLARED` shape, made impossible rather than absent

**Three rows were wrong and they were exactly the three that nothing ran.**
`book02/candidate-v3/v4/v5.json` each declared `compound=[]` and each carried
drift; `ACCEPTED` names Book 2's v2 and v6, and `checks.py 2` takes the
highest, so v3–v5 were reachable by no invocation anybody makes. They were not
wrong by accident — they were wrong because being wrong had no consequence.

Corrected against a run, and the successor chain is legible in them: **v3
carries `seashore`, `storeroom` and `waterside`; v4 `storeroom` and
`waterside`; v5 `storeroom`**. `book07/candidate-v1.json` — the *rejected*
file — was moved out of `DECLARED`, where it had an empty declaration, into
`SUPERSEDED`. `book01/candidate-v4.json` and `book04/candidate-v5.json` were
added and `ACCEPTED` repointed at them. **20 declared files, 8 superseded, 28
on disk.**

## Book 8 is ACCEPTED

`book08/ACCEPTANCE.md`. 16 substitutions in 12 of 50 paragraphs, 6 findings
declined and asserted still present.

* **Seven of Butler's semicolons restored** (S-2's six plus [35] at P044,
  ruled at M-2). The build asserts the set of semicolon-bearing paragraphs
  exactly, so an eighth anywhere fails it.
* **The worst break was not one of the 42** — B08-P047's em dash, closing the
  weeping-woman simile, so that `Even so` no longer reads first as
  *nevertheless*. No instrument in the package could reach it. It rejoins
  Butler's own 80-word sentence; the growth is declared with that reason.
* **What a count cannot see.** The census reads `: 6 → 6` and calls the class
  untouched; the draft had **cashed** Butler's colon at P020 and **added** one
  at P008. Provenance can tell a swap from a standstill.
* `hardly` at P042 removed — it inverted Butler's sense. `minstrelsy` → *the
  song that goes with it*: Demodocus **sings**, and **arrow C's repair is a
  constraint, not a direction.**
* **D5 widened** (any Roman form, with the Book 11 list named), **D16 clause
  (b)** for a word supplied to Butler's text, **`PUNCTUATION.md` §6** for the
  colon and the parenthesis, and the **`butlerism`** class.
* **The compared figure did not move, +2.0% to +2.0%.** Nine restored marks
  removed nine sentence boundaries and added nine kept marks. The corrections
  did not improve the number; they made the text match it.

## Book 9 is FROZEN at step 4

`book09/`. 44 paragraphs, 5,800 words. **41 dividing marks, every one Butler's
own, none added** — on the semicolon, the colon or the dash.

**The fourteenth source rule reads integers.** 44 per-paragraph word counts,
matched as a contiguous run against every paragraph PG prints between its own
structural markers, prefaces and footnotes included. Exactly one occurrence.
**Its audit failed it once, for the instructive reason**: PG glues page numbers
to words as well as setting them bare, and the *locating* clause still passed —
for the wrong reason — while only the verifying clause caught it.

Run over all 24 chapters it locates **22 uniquely** and fails on exactly
**1 and 3**, the two recorded divergences a word count can see. It **locates
chapter 4**, whose divergence is a capital letter.

**The collision check ran BEFORE the freeze and cost fifteen repairs in the
draft** — six from arrow B across paragraphs, one from arrow C. Eight rows that
Book 9's arrival opened in the **accepted** Books are ruled too.

**The compound check raised a FALSE POSITIVE**, and that is the expensive
direction: **attributive hyphenation** (`an olive-wood handle` against `of
green olive wood`) is a rule of English, not a compound with two settings. It
is a named, declared blindness now, with a control. The next instance is
already visible (`ivy-wood bowl`). **If `NOT_COMPOUNDS` ever carries more than
a handful of these, the check has to become position-aware.**

## A7 — and Butler settles it himself

**A3 is WIDENED**, and the widened patch is prepared and hashed the way D14
requires. Two of the served file's four divergences from PG are **not**
normalizations: PG opens Books III and IV lower-case because Butler runs one
sentence across the Book boundary.

| | |
|---|---|
| before | `da03f6ac…` (637,591 bytes) |
| A3 as prepared (truncation alone) | `0cc76350…` (636,440) — reproduced independently |
| **A3 WIDENED** (truncation + the two capitals) | **`e45d6c4d…`** (636,440) |

**And Butler says so in his own Preface to the First Edition**, in a region of
the file no rule in this package had ever read: *"the Leipsic Teubner edition
… makes Books ii. and iii. **end with a comma** … **I have preferred to do
so**"*, and *"**No other Books … have initial capitals** except the three
mentioned unless the first word of the Book is a proper name."* The
half-sentence is the author's stated practice; the capitals overwrite a policy
he wrote down. Full text in the ledger's A7.

**What the fix costs** is stated there in full. The short form: two chapter
openings will look like bugs to a reader who opens a chapter directly (which
is why somebody capitalized them); **it costs this package two successors to
accepted Books 3 and 4, one letter each, owed on the day A3 lands and
deliberately not built before then** — a lower-case modern opening beside a
capitalized original in split-pane view is worse than the state we are in; and
it costs no alignment at all.

## The instruments, and what each is for

```
python3 scripts/checks.py N              # writes bookNN/checks-vN.md; gates + manifest read side
python3 scripts/checks.py --all          # every accepted Book's figures AND gates AND manifests AND declarations
python3 scripts/checks.py --declarations # the gates, over every key of DECLARED; coverage both ways
python3 scripts/checks.py --manifests    # the read side alone — and it RUNS THE GATES now
python3 scripts/checks.py --audit        # 22 controls under D18, 2 declared blindnesses
python3 scripts/checks.py N --write-manifest   # the only manifest writer
python3 scripts/prove_manifest.py        # 9 attacks, 24 assertions, ~9 minutes
python3 scripts/rendering_collisions.py  # arrows A, B and C; 7 controls
python3 scripts/collision_triage.py N    # every row touching Book N, with a disposition; fails if any lacks one
python3 scripts/compound_register.py     # §H.1 in every continuity.md, from the served corpus
python3 scripts/compound_drift.py        # cross-Book compound drift
python3 scripts/verify_source_book9.py   # the fourteenth source rule, with its audit
python3 scripts/controls.py              # D18's own self-test
```

## Next, in order

1. **Book 9's step 6 — `candidate-v2`.** `book09/review/findings-v1.md`.
   Eleven word changes in nine paragraphs (S-3, S-4, S-5), two marks NOT to
   cash (M-1 at P021 and P031), and four records corrections that are text
   edits to `continuity.md`, `README.md`, `RESUME.md` and the ledger, not to
   the candidate. **Three package fixes fall out of it**: pin the source
   (A11); split `kept_added_div()` into kept / class-changed / added (S-1);
   and make `NOT_COMPOUNDS`'s growth trigger mechanical instead of the word
   *handful* (question 4).
2. Then **Book 10** — subject to A2.
3. **Report five numbers with the basis on every one**: retention, raw D17
   rate, **NORM RATE on the D27 basis on Butler's own pointing**, **dividing
   marks split into kept and added**, and **MOVE-GAP** with displaced runs
   beside it.
4. **Every control under D18.** Use `scripts/controls.py`; do not hand-roll.
5. **Run every instrument above in any session that touches the package** —
   the collision check and the compound register **before** freezing, not
   after. Book 9 is the demonstration: fifteen repairs at draft time, which
   would have been fifteen findings and a successor at review time.
6. **Anders still owes two decisions**: `00-progress-ledger.md` **A2** (Book
   10's disposition) and **A3-widened** (the served file patch, prepared,
   hashed, and now supported by Butler's own preface).

### The fifteen source rules already used

1. **Book 2 drafter** — PG's footnote-entry list, positionally.
2. **Book 3 drafter** — the `BOOK III`/`BOOK IV` headings, in bytes.
3. **Book 3 reviewer** — anchorless, digit-blind, one contiguous token block,
   occurring exactly once.
4. **Book 4 drafter** — occurrence-unique needles and a derived region.
5. **Book 4 reviewer** — global per-paragraph fingerprint alignment.
6. **Book 5 drafter** — identification by **residue**.
7. **Book 5 reviewer** — one global **monotone diff** of the whole file.
8. **Book 6 drafter** — a **suffix-automaton resemblance profile**.
9. **Book 6 reviewer** — **letter-blind typographic shape**.
10. **Book 7 drafter** — **PG's own hard wrapping**, as line counts.
11. **Book 7 reviewer** — the **capitalization bitstring**, one bit per token.
12. **Book 8 drafter** — PG's **argument lines and table of contents**,
    body-blind. Its audit failed it twice.
13. **Book 8 reviewer** — **marker-to-marker byte tiling** indexed by the
    served file's per-chapter paragraph-count vector, three positional
    streams. **Its audit failed it FIVE times.**
14. **Book 9 drafter** — **the arithmetic-only word-count partition.** 44
    integers, matched once against everything PG prints between its own
    structural markers. **Its audit failed it once, and the failure was that
    the locating clause passed for the wrong reason.**

15. **Book 9 reviewer** — **Butler's own PREFACE**, and it reads two
    characters. The Preface to the First Edition names Books ix.–xii. as
    Odysseus's own narrative; D4's convention makes that region a run of
    paragraphs opening a quotation they do not close, and a **parameter-free
    maximum-subarray** over that ±1 stream locates it. Nine controls. Its
    audit failed it **twice**: a control inside the rule's null space, and a
    locating clause failing for the wrong reason. **C6 replaces chapter 9
    entirely and asserts the interval does not move** — the answer to *a
    chapter matching itself*. 22 of 24 chapters locate; the two that fail
    are 3 and 4, the A7 capitals.

**A sixteenth has to find another channel again.** Still unused: **Butler's
own PREFACES and their cross-references into the text** — note that the
First Edition's preface has just proved decisive for A7, so this channel is
now known to be load-bearing and not merely unused; **the footnotes'
cross-references between one another**; and **the appendix's plan of
Odysseus's house** and the paragraphs explanatory of it, which Butler says he
reprinted there.

## What the checks would STILL not catch

1. **A sentence divided at the wrong seam.** B08-P047 is the package's clearest
   instance and no measure reached it — not a semicolon, moves no clause,
   lengthens nothing. **D27 does not close this.** It removes the reason there
   was nothing to lose by dividing everywhere.
2. **A garden path the draft builds out of a mark** (B07-P020; B08-P044 and
   B08-P039 in Book 8's round).
3. **Register.**
4. **A figure carried by a single word.**
5. **Whether a mark that WAS cashed should have been.** D27 counts the marks
   and prices them; it cannot say that any one of Book 9's thirty conversions
   is right. A person ruled all 42 of Book 8's one at a time and nothing can
   check the ruling.
6. **A discrimination lost ACROSS paragraphs.** Arrow C closes the
   same-paragraph case only. **Book 9's draft produced six more instances**,
   caught only because both of Butler's words happened to be rare enough for
   arrow B's gate. The blind spot stands.
7. **Whether an ARROW'S REPAIR is right.** New, from Book 8's M-4: arrow C
   correctly found `minstrelsy` and `music` flattened, and the repair
   (`the playing that goes with it`) misdescribed a bard who sings. Nothing in
   the collision record asks whether the replacement is still accurate.
8. **Whether a disposition in `collisions.md` or §H.1 is RIGHT.** Both files
   guarantee somebody wrote something down for every row. Neither can tell you
   the ruling was good.
9. **A false positive in `compound_drift()` from attributive hyphenation.**
   Declared, exempted by name, and the exemption list is itself the hazard —
   see `book09/continuity.md` §8.
10. **Whether a cross-Book instrument's ROW COUNT in a record is current.**
    Every arrow compares across Books, so drafting a ninth Book adds rows to
    all eight earlier `collisions.md` files. The check exits non-zero when a
    row lacks a disposition, so nothing goes unruled — but a count typed into
    an `ACCEPTANCE.md` goes out of date silently, and Book 8's did within the
    hour (91 → 90 → 97, all dispositioned throughout).
11. **A defect PG and the served file SHARE.** Every source rule in the package
    is blind to it by construction. **Three concrete instances now, all found
    in Book 9's round 1**: `Where do sail from?` (B09-P015), `come see you`
    (B09-P022), and PG's Book II ending in a full stop where Butler's own
    Preface says he preferred a comma (S-7 — and it changes what A3-widened
    should patch). The blindness is demonstrated rather than assumed now, and
    the package needs a register for it: A7 cannot hold these, because A7 is
    served-file-against-PG and here the two agree.
12. **A mark EXCHANGED for another mark of the same class.** D27 asks whether
    Butler's mark in the span was in `{; : —}`, not whether it was the SAME
    mark. Book 9 cashes two of his colons and writes two new ones over his
    semicolons; the census reads `: 7 → 7` and `41 kept + 0 added`, and the
    compared figure is +2.5% where strict identity gives +1.7%.
13. **A figure that is right in the manifest and wrong in the prose.** (b3)
    recomputes sixteen figures against `manifest.json`. Four committed files
    carry the same figures and nothing reads any of them.
14. **A rendering collision on a word Butler uses OFTEN.** All three arrows
    gate on rarity (`RARE_MAX = 3`, `MIN_LEN = 5`). Book 9 carries six that
    the 110-row report does not contain, on `gave`, `drove`, `cried`,
    `supper`, `flock` and `snatch`.
15. **A repair that re-creates its own collision somewhere else in the same
    draft.** B09-P020's repair restored Butler's `clutched up` to protect his
    `snatched` at P036, while the draft wrote `snatch` at P019.
16. **A generated DISPOSITION that answers a different question from the one
    its row poses.** `collisions.md` row 45 disposes of `humane → civilized`
    with boilerplate shared by sixteen rows; the rendering is wrong and the
    disposition never asks.

## Hard rules

Content-only, under `books/staged-replacements/odyssey/` alone. Zero Anthropic
API spend. English only. Nothing merged, deployed, registered, and the served
`app/public/data/editions/**` is **read** (by `compound_register.py` and the
source verifiers) and **never written**.
