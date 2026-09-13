# RESUME — where this package stands, for the next worker

Updated continuously. Read this first, then `WORKFLOW.md`.

**Last updated:** 2026-09-13, session `session_01K5bL9oWzAagjTMExsyUADi`
(worker 9, **drafting + infrastructure role**). **Books 1–7 are accepted.
Book 8 is drafted and frozen at step 4** and needs an independent review.

## State

**Basis is stated on every row, because a figure without the paragraph set it
is computed over is not a figure (R-1).** The one authoritative table is
`00-progress-ledger.md`, *The comparability table*, produced by
`python3 scripts/checks.py --all`, not typed.

| Book | Step | file scored | basis | Retention | raw D17 | semicolons | **kept + ADDED** | **NORM RATE on Butler's pointing** | MOVE-GAP |
|---|---|---|---|---|---|---|---|---|---|
| 1 | 8 — accepted, successor v3 | `candidate-v2` | all 32 | 0.72703 | +20.5% | 47 → 13 | 12 + 1 | **−4.5%** | 0.05088 |
| 2 | 8 — accepted, successors v3–**v6** | `candidate-v2` | all 35 | 0.90232 | +16.1% | 36 → 21 | 16 + 5 | **+1.2%** | 0.01632 |
| 3 | 8 — accepted, successor v3 | `candidate-v2` | **37 of 38** | 0.89641 | +5.5% | 39 → 32 | 26 + 6 | **−2.0%** | 0.02156 |
| 4 | 8 — accepted, successors v3, v4 | `candidate-v2` | all 81 | 0.95872 | +8.9% | 68 → 50 | **50 + 0** | **+2.0%** | 0.00431 |
| 5 | 8 — accepted, **successor v3** | `candidate-v2` | all 37 | 0.93808 | +23.5% | 34 → 13 | 12 + 1 | **+7.5%** | 0.00891 |
| 6 | 8 — accepted, **successor v3** | `candidate-v2` | all 26 | 0.93408 | +27.6% | 27 → 5 | 3 + 2 | **+5.6%** | 0.01156 |
| **7** | **8 — ACCEPTED** | **`candidate-v2`** | all 29 | **0.93438** | **+34.0%** | **30 → 7** | **5 + 2** | **+7.5%** | **0.01217** |
| **8** | **4 — FROZEN, review owed** | `candidate-v1` | all 50 | **0.93844** | **+27.1%** | **42 → 0** | **0 + 0** | **+4.3%** | **0.00692** |

Hashes: Book 7 accepted
`e79eb82b5ce6051dc3c61ca39c4480406cf0e2a106c0d53f5182fafe1d3163ac`;
Book 8 frozen v1
`e758790c58e0ace5c97159b2fa4e6d0f987f0b0edeba9120542ed772ec6ce012`;
successors `book02/candidate-v6.json` `a6fb8103…`,
`book05/candidate-v3.json` `c8af4cc3…`, `book06/candidate-v3.json` `1ae67a52…`.

## The column that is new, and why it replaces the old one

**Substantive finding S-1 of Book 7's round 1.** D20 clause (a) makes a
semicolon→period worth exactly zero. **By the same construction it makes a
comma→semicolon worth a full division** — and that corollary was never stated
and nothing tested it. Six of Book 7 v1's fourteen semicolons were the
drafter's own, so its published NORM RATE of +7.5% was 60% pointing.

It is now a **measure**: `semicolon_provenance()`, `kept_added()` and
`norm_rate_butler()` in `scripts/checks.py`, computed for every Book, pinned in
`PUBLISHED`, and covered by four new `--audit` controls — including the one
that was missing, *a comma raised to a semicolon must not move the compared
figure*.

**Every Book but 4 and 8 added some.** Book 4 added none; Book 8, the first
drafted after the measure existed, added none.

**A correction to the review, on the review's own principle.** Round 1 says
Book 7 v1's +3.0% is *"fifth of seven"*. That compares one corrected figure
against six uncorrected published ones — two bases in one column, which is
**R-1**, the disease the package has been treating for two Books. On like
against like, **v1 was third of seven**; accepted v2 is joint first.

## The infrastructure, repaired

**S-2 — the manifest was write-only and was already wrong.** It recorded
`88952e2b…` for a `book07/checks-v1.md` hashing to `6ecfeeb4…`, and a manifest
saying `all_gates_passed: true` survived a candidate that failed the gates.
Now:

* `Gate.evaluated` — an empty failure list is no longer a licence, because a
  Gate that was never asked anything has one too.
* `manifest_checks_block()` is the **only** writer in the package and raises
  unless the gates both evaluated and passed.
* `verify_manifest()` is the read side and runs on **every** `checks.py N`;
  `checks.py --manifests` runs it for every Book. It rejects a stale checks
  hash, a candidate whose bytes moved under the manifest, `all_gates_passed`
  beside a failing run, and a post-rule Book with no `checks` block.
* Manifest failures are kept apart from content gates so a stale manifest
  cannot block its own repair.
* **`scripts/prove_manifest.py` plants every one of these defects in a
  throwaway copy and asserts the rejection — 15 assertions, and it hashes the
  package before and after to prove nothing in it was written.**

**S-3 / R-1 / R-5 — one file-keyed table, `DECLARED`,** replaces
`BYTE_IDENTICAL`, `MIN_PARA_RATIO` and `LEGACY_GROWTH`. `MIN_PARA_RATIO = {1:
0.86}` was a lowered threshold wearing an enumeration's name; the floor is 0.90
for every Book and Book 1's five thin paragraphs are enumerated with their
ratios. Growth and compound drift are multiset and exact-list equalities, both
directions. **Keying on the FILE surfaced a mixed basis nobody had seen:**
`LEGACY_GROWTH[4]` declared `(18, 53, 54)`, which is the *successor's* figure;
accepted v2 carries `(18, 53, 55)`.

**R-4 — `--all` now evaluates the gates** for every accepted Book and collects
their manifest failures too.

## The instruments, and what each is for

```
python3 scripts/checks.py N              # writes bookNN/checks-vN.md; gates + manifest read side
python3 scripts/checks.py --all          # every accepted Book's figures AND gates AND manifests
python3 scripts/checks.py --manifests    # the S-2 read side alone
python3 scripts/checks.py --audit        # 14 controls under D18, 2 declared blindnesses
python3 scripts/checks.py N --write-manifest   # the only manifest writer
python3 scripts/prove_manifest.py        # 15 planted defects, all rejected
python3 scripts/rendering_collisions.py  # arrows A, B and C; 7 controls
python3 scripts/collision_triage.py N    # every row touching Book N, with a disposition; fails if any lacks one
python3 scripts/compound_register.py     # §H.1 in every continuity.md, from the served corpus
python3 scripts/compound_drift.py        # cross-Book compound drift
python3 scripts/controls.py              # D18's own self-test
```

**ARROW C is new and it is the one that earns its keep.** Book 7's round 1
showed that M-2, M-5 and M-10 — Butler's own discriminations flattened — are
invisible to **every** instrument in the package. Its diagnosis (arrow B's
rarity gate is on the wrong side) is wrong: arrow B *is* gated on Butler's
side. The real reason is that `abode` occurs in six paragraphs and so is not
rare. **Rarity is the wrong gate for this defect and proximity is the right
one.** Arrow C looks inside one paragraph with no frequency gate at all, and it
found all three of M-2, M-5 and M-10 in the frozen Book 7 candidate, one
nobody had reported in **accepted Book 3**, and **six in Book 8 during
drafting**, four of which were Butler's own discriminations the draft had lost.

**THE TRIAGE IS A RECORD, not an appendix.** R-2 and blind spot 8: the check
returned 72 rows touching Book 7, eleven were acted on, sixty-one were
dismissed with no record. `collision_triage.py` now gives every row a
disposition — five classes mechanical, and the hand-ruled ones in named classes
including **`homograph`**, which is the class the review asked for by name
(`issue` is *outcome* at B03-P007 and *offspring* at B07-P007: two words spelled
alike, not a collision).

## The compound class, closed

**A4(ii) — the vendored word list is DECLINED.** `scripts/compound_register.py`
replaces it: one disposition line per H.1 pair in every `continuity.md` §H.1,
187 pairs, evidence **read** from the 100 served modern-English editions, closed
only when the closed form leads 3× **and** appears in 3+ editions.

**It found a live compound the first time it ran** — `store-room` in accepted
Book 2, closed 31 in 9 editions against 1 hyphenated and 1 open, named by no
reader, no review round and no check in the package's history. It was folded
into the successor Book 2 was already owed for `councillors`, so it cost
nothing extra.

**A correction to A5(c)'s own claim, with its evidence.** A5(c) says the
register *"would have caught `mountain tops` at Book 5 before a successor was
owed"*. **It would not have**: the corpus gives closed 7 in 7 editions against
9 open, short of the margin on both counts. `PROBES` keeps the pair in
`scripts/compound-corpus.json` after the Books stopped carrying it precisely so
this is checkable. What it *would* have caught is `sea shore` (56 in 17 against
0), which cost three successors, and `bed chamber` (28 in 11).

**A5(a) and A6 are done, in ONE pass** (`scripts/build_compound_sweep.py`), and
**R-6 is confirmed: the cost was TWO successors, not the "sixth successor"
singular the record stated** — `mountain tops` is in accepted Book 5 *and*
accepted Book 6.

## Next, in order

1. **Book 8's round 1.** `book08/review-instructions.md`, **four questions put
   explicitly**. A **thirteenth** kind of source rule, audited before trusted,
   with controls that clear Book 7's bar (the B03-P038 splice and a paragraph
   of Butler's own from another Book, both made to fire).
2. Then Book 8 steps 5–8, then **Book 9**.
3. **Report five numbers with the basis on every one**: retention, raw D17
   rate, **NORM RATE on Butler's own pointing**, semicolons **split into kept
   and added**, and **MOVE-GAP** with displaced runs beside it.
4. **Every control under D18.** Use `scripts/controls.py`; do not hand-roll.
5. **Run every instrument above in any session that touches the package** — the
   collision check and the compound register **before** freezing, not after.
6. **Anders still owes two decisions**: `00-progress-ledger.md` **A2** (Book
   10's disposition) and **A3** (the served Book 3 ¶38 splice, prepared as a
   one-line patch and not this package's to apply). **A4(ii), A5 and A6 are
   now answered and closed.**

### The twelve source rules already used

1. **Book 2 drafter** — PG's footnote-entry list, positionally.
2. **Book 3 drafter** — the `BOOK III`/`BOOK IV` headings, in bytes.
3. **Book 3 reviewer** — anchorless, digit-blind, one contiguous token block,
   occurring exactly once.
4. **Book 4 drafter** — occurrence-unique needles and a derived region.
5. **Book 4 reviewer** — global per-paragraph fingerprint alignment.
6. **Book 5 drafter** — identification by **residue** (the other 23 chapters).
7. **Book 5 reviewer** — one global **monotone diff** of the whole file.
8. **Book 6 drafter** — a **suffix-automaton resemblance profile**.
9. **Book 6 reviewer** — **letter-blind typographic shape**.
10. **Book 7 drafter** — **PG's own hard wrapping**, as line counts.
11. **Book 7 reviewer** — the **capitalization bitstring**, one bit per token.
12. **Book 8 drafter** — **PG's argument lines and its table of contents**.
    The locating clause is **body-blind**: the served edition's 24 chapter
    **titles** matched to PG's 24 argument lines, in order, each exactly once,
    reading no character of any chapter's prose. Cross-checked against the
    `Contents` block, two lists written in different places by different
    conventions. **Its audit failed it twice** — it expected `[n]` footnote
    anchors where PG has none in the whole body, and its clause 3 as first
    written was tautological — and the second repair found **three divergences
    of the served file from PG that nobody had recorded**.

**A thirteenth has to find another channel again.** Still unused: **Butler's
own PREFACES** and their cross-references into the text; **the footnotes' own
cross-references between one another**; **PG's licence and transcriber
boilerplate as file arithmetic** (byte offsets, the `*** START` / `*** END`
markers against the body's length); and **the served edition's own
paragraph-count arithmetic per chapter** as an independent index.

## What the checks would STILL not catch

1. **A sentence divided at the wrong seam.** No carrier. **Book 8 is the
   largest exposure the package has ever had to this**: 42 semicolons, every
   one converted, and no measure can say whether any break is in the wrong
   place.
2. **A garden path the draft builds out of a mark** (B07-P020, made by deleting
   one comma).
3. **Register.**
4. **A figure carried by a single word.**
5. **Every mark except the semicolon is unmeasured, in both directions.** S-1's
   half of this is now closed — added semicolons are counted and priced — but
   no comma, dash, colon or quotation mark is counted anywhere. A per-mark
   census of source against candidate is still four lines and still unwritten.
6. **A discrimination lost ACROSS paragraphs.** Arrow C closes the
   same-paragraph case and only that case.
7. **Whether a disposition in `collisions.md` or §H.1 is RIGHT.** Both files
   now guarantee that somebody wrote something down for every row. Neither can
   tell you the ruling was good.

## Hard rules

Content-only, under `books/staged-replacements/odyssey/` alone. Zero Anthropic
API spend. English only. Nothing merged, deployed, registered, and the served
`app/public/data/editions/**` is **read** (by `compound_register.py` and
`verify_source_book8.py`) and **never written**.
