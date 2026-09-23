# The Odyssey, Book 8 — independent review, round 1

**Subject:** `book08/candidate-v1.json`, sha256 recomputed here as
`e758790c58e0ace5c97159b2fa4e6d0f987f0b0edeba9120542ed772ec6ce012` — the frozen
hash. Source `book08/source-book8.json`, sha256 recomputed as
`5140b989049ffd9aefaa818f4abf652b7ced16816defe0748b57fa72424090a6`.
50 paragraphs, 17 packets.
**Trunk:** `claude/odyssey-modern-en-20260911` @ `59420b649`.
**Review branch:** `claude/odyssey-book08-review-20260913`, own worktree.
**Reviewer:** a separate session. Did not draft this Book.

**Verdict: accept after corrections.**

| severity | count |
|---|---|
| substantive | **3** |
| minor | **8** |
| optional | **7** |
| records | **5** |
| paragraphs with no material issue | 34 of 50 |

Coverage is complete: every paragraph `B08-P001` … `B08-P050` has exactly one
entry in §8, a numbered finding or "No material issue found".

Nothing outside `book08/review/` and the final `RESUME.md` / ledger commit was
written. `candidate-v1.json` is untouched (**D10**); its hash above was
recomputed after the review, not before. `app/public/data/editions/**` was read
and never written. Zero Anthropic API spend.

**The three things to read first.**

* **S-1.** The +27.1% is **85% cashed pointing**. Of the candidate's 52 new
  sentence boundaries, **44 are marks Butler had already written** — 40
  semicolons, 1 colon, 3 em dashes — and **8 are real division of his prose**.
  D20 prices the semicolon and nothing else, so a colon or a dash cashed for a
  period is *free division* under every measure the package has. The census that
  shows this is blind spot 5 of `RESUME.md`, written: `book08/review/mark_census.py`.
* **S-2.** Seven of Butler's marks should have survived, in six paragraphs. The
  worst break in the Book is **not one of the 42**: at **B08-P047** the em dash
  that closes Butler's weeping-woman simile is cashed for a period, severing
  *"He wept as a woman weeps when…"* from *"even so piteously did Odysseus
  weep"*. The simile loses its correlative frame, and nothing in the package can
  see it.
* **S-3.** `checks.py --manifests` — the S-2 read side, which `RESUME.md`
  presents as standing alone — **passes clean on a candidate that fails a gate**
  after one field is edited. `prove_manifest.py`'s 15 assertions never test that
  path, and the fifth of its five enumerated `cases` is dead code: the loop runs
  `cases[:4]`.

---

## 0. What was re-run rather than taken on trust

Every published figure was recomputed by `book08/review/recompute.py`, which
imports nothing from `scripts/` and re-derives each measure from its written
definition. Basis: **all 50 paragraphs**, on both sides, throughout.

| figure | published | recomputed | |
|---|---|---|---|
| token retention (aggregate-join) | 0.93844 | **0.93844** | ✓ |
| order retention | — | 0.93844 | ✓ |
| bag retention | — | 0.94536 | ✓ |
| **MOVE-GAP** (bag − order), D20 | 0.00692 | **0.00692** | ✓ |
| displaced runs (strict witness) | 0 | **0** | ✓ |
| sentences, src → cand | 192 → 244 | **192 → 244** | ✓ |
| raw D17 rate | +27.1% | **+27.1%** | ✓ |
| sixty-word sentences | 11 → 0 | **11 → 0** | ✓ |
| semicolons | 42 → 0 | **42 → 0** | ✓ |
| semicolons kept + added (S-1) | 0 + 0 | **0 + 0** | ✓ |
| **NORM RATE on Butler's own pointing** | +4.3% | **+4.3%** (234 → 244) | ✓ |

All eleven reproduce exactly. `scripts/checks.py --all`, `--manifests`,
`--audit`, `prove_manifest.py`, `rendering_collisions.py`,
`collision_triage.py 8`, `compound_drift.py`, `compound_register.py` and
`controls.py` were all run; outputs in this directory. `--all` exits 0,
`collision_triage.py 8` reports 93 rows all dispositioned, and
`compound_register.py` reports 28 Book 8 pairs, none live.

**Records finding R-1 — the new column carries no information for this Book,
and the ledger's presentation implies that it does.** With **0 semicolons in the
candidate**, `norm_rate_butler()` and `norm_rate()` are the *same arithmetic*:
`kept = semicolons(cand) = 0`. The +4.3% in the ledger's "NORM RATE on Butler's
own pointing" column is not a second, corrected reading of Book 8; it is the
published figure with a different label. That is true and harmless, but the
column exists to show where the two disagree, and a row where they *cannot*
disagree should say so. Book 4 is not the same case: it kept 50 and added 0, so
its two figures could differ and happen not to. **Book 8 is the only row in the
table where the identity holds by construction**, and it holds because the
candidate has no semicolons at all — which is S-1's subject, not a clean bill.

---

## 1. Source verification — a THIRTEENTH kind of rule, and its audit found five defects

`book08/review/verify_source_book8_review.py`, output in `verify-output.txt`.

Twelve kinds are enumerated in `RESUME.md`. This is none of them. It takes two
of the four channels `RESUME.md` lists as still unused, because neither alone
both *locates* and *verifies*:

* **clause A — PG's own file arithmetic.** The `*** START` / `*** END` markers,
  the front matter, the 24 `BOOK N` headings and the `FOOTNOTES:` section as
  byte intervals that must **exactly tile** the marker-to-marker range,
  contiguous, non-empty, no gap and no overlap. **Body-blind**: it reads no word
  of any chapter.
* **clause B — the served edition's own paragraph-count arithmetic.** The served
  file's 24-vector of per-chapter paragraph counts must equal PG's, position for
  position, and sum to 1,027. **Counts only**: it reads no word of either
  artefact. This vector is what says which tile is Book 8.
* **clause C — three positional streams over the located span**, and then over
  all 24 chapters: a **closed-class function-word order stream** with a case bit
  on each paragraph's first token; a **content-word anagram stream** (each
  content word replaced by its sorted letters); and a **mark stream** (every
  punctuation mark in order with two whitespace-adjacency bits and no letter
  content). None of the three is a needle, a fingerprint, a residue, a diff, a
  resemblance profile, a typographic shape, a line count, or a capitalization
  bitstring.

### 1.1 The audit — five defects, and the first one would have shipped

Six drafters and reviewers before this one audited their own source rule and all
six found a defect. This rule's audit found **five**, in the order it found them:

1. **PG's argument line counted as prose.** PG separates the `BOOK N` heading
   from its argument line by a blank line and the argument line from the prose
   by another, so a `\n\n` split of a tile yields **three** classes of block. The
   clause dropped only the heading. Every chapter came out one paragraph long —
   `(1, 32, 33)`, `(2, 35, 36)`, `(3, 38, 39)`, … — a **uniform** off-by-one in
   the same direction in all twenty-four, which is the shape most likely to be
   read as a convention difference and waved through. Repaired to `blocks[2:]`;
   clause B's `sum(want) != 1027` assertion is the second net under it.
2. **No case bit.** Both word streams were built from lower-cased tokens, so the
   rule was blind to sentence-initial capitalization — which is precisely two of
   the three served-vs-PG divergences it has to reproduce. It reported **two**
   divergences where there are four. Repaired with a case bit on each
   paragraph's first token; `control 5` plants that exact mutation.
3. **A sum is not a tiling.** Clause A summed the interval lengths and compared
   the total with the marker-to-marker length. Two intervals exchanged, or one
   grown and a non-adjacent one shrunk by the same amount, sum identically.
   Repaired to an ordering assertion; `control 9` runs against the *clause*, not
   the text, and asserts the sum is bit-for-bit unchanged while the repaired
   clause fires.
4. **Both word streams punctuation-blind.** They could not see **B01-P025**,
   whose whole difference is a space before an em dash, so the rule reported
   three divergences where the record says four — and would have been read as
   *contradicting* the drafter's clause 3 rather than as incomplete. Repaired
   with the third stream; `control 14` plants it.
5. **Two controls that were themselves in the null space.** `control 1` as first
   written flipped a word's last two letters, which is an anagram; `control 8`
   reordered a content word's letters, which all three streams are blind to.
   `control 1` was repaired to a real letter substitution. `control 8` was
   **converted into a declared blindness with its evidence computed at runtime**
   — the script asserts that the mutation does *not* move the verdict, so the
   declaration cannot rot into a false claim.

### 1.2 The controls

**13 controls fire on both D18 clauses**, all routed through
`scripts/controls.py`. They clear Book 7's bar and add to it:

* **the B03-P038 splice** — the served file's own spliced ¶38, planted into Book VIII;
* **a paragraph of Butler's own Book VI** substituted into Book VIII, every token his;
* a paragraph of Butler's own **Book VIII moved within Book VIII**;
* the first letter's case changed and nothing else (defect 2's class);
* a space inserted before an em dash and nothing else (defect 4's class, B01-P025);
* one function word deleted, every content word kept;
* a word replaced by its own anagram (`on`→`no`);
* one letter changed; two paragraphs transposed; a changed number-word;
* a paragraph deleted (clause B, which reads no word);
* a tile grown and a non-adjacent tile shrunk by the same 400 bytes (clause A);
* one **positive** control.

**Four blindnesses are declared by name**, each with the check that carries the
class: a tile boundary moved in both tiles at once (carried by clause C); a pure
letter reordering inside one content word (carried by
`verify_source_book8.py` clause 2); a defect PG and the served file share
(carried by `verify_source_book7_review.py` clause 4); and a content word
replaced by a different word with the same letter multiset, the same
function-word neighbourhood and the same pointing.

### 1.3 The three divergences, verified independently — records finding R-4

Clause C reproduces the served file's divergences from PG in all 1,027
paragraphs as **exactly four**, and an independent character-level pass
(`/scratchpad` working script, method different again: raw `SequenceMatcher`
opcodes over normalized paragraphs) gives the same four. The drafter's claim
holds. They are:

| ¶ | what it is |
|---|---|
| **B01-P025** | PG sets `and mine above all others —for it is I who am master here` **with a space before the em dash**; the served file closes it up. Whitespace only — no word, no letter. |
| **B03-P001** | PG opens Book III **lower-case**: `but as the sun was rising`. The served file capitalizes it to `But`. One letter's case. |
| **B04-P001** | The same at Book IV: PG opens `they reached the low lying city`, the served file `They`. One letter's case. |
| **B03-P038** | The **D14 splice** (ledger A3), already recorded. PG's ¶38 is the eleven-word half-sentence `Now when the sun had set and darkness was over the land,`; the served file completes it with ~197 words of the served **modern-en**'s own ¶38. |

**And the record should say what the first three actually are, because "three
deliberate normalizations, none touching a word" undersells two of them.**
B03-P001 and B04-P001 are not cosmetic. PG opens those two Books lower-case
because **Butler runs one sentence across the Book boundary** — PG's Book III
¶38 is a protasis whose apodosis is PG's Book IV ¶1 (`Now when the sun had set
and darkness was over the land, / they reached the low lying city of
Lacedaemon`), and the same construction joins Book II to Book III. Capitalizing
`But` and `They` **destroys that device**, and it is the same defect as the
B03-P038 splice, one letter of it. This matters to ledger **A3**: the splice is
prepared as a one-line patch, and the patch as it stands would leave the
capitalization that made the half-sentence look broken in the first place.
Recommend A3 be widened to the three, or at minimum that the record stop calling
B03-P001 and B04-P001 normalizations.

**Verdict on source verification: it holds**, by a rule that shares no channel
with the twelve, whose audit failed it five times, and whose controls include
the two defects this package has actually met.

---

## 2. Substantive findings

### S-1 — The +27.1% is 85% cashed pointing, and every mark but the semicolon is free division

`RESUME.md` blind spot 5: *"Every mark except the semicolon is unmeasured, in
both directions… A per-mark census of source against candidate is still four
lines and still unwritten."* It is written:
`book08/review/mark_census.py`, output in `mark-census-output.txt`.

**The census.**

| mark | Butler | candidate | delta |
|---|---|---|---|
| `;` | 42 | 0 | **−42** |
| `:` | 6 | 6 | 0 |
| `,` | 410 | 407 | −3 |
| `.` | 180 | 233 | +53 |
| `?` | 7 | 6 | −1 |
| `—` | 14 | 16 | +2 |
| `(` `)` | 1 / 1 | 0 / 0 | −1 / −1 |
| `“` `”` | 47 / 45 | 47 / 45 | 0 |

**The decomposition, which is what the census is for.** Counting marks tells you
42 became 0. It does not tell you what the 52 new sentences are *made of*. So
every internal sentence boundary in the candidate is aligned back to the source
— same construction as `semicolon_provenance()` in `scripts/checks.py`, a
`SequenceMatcher` over the two word streams, so the figures are commensurable —
and asked what Butler had there:

| class | count |
|---|---|
| **KEPT** — Butler wrote `.` `!` `?` there | 141 |
| **CASHED `;`** | **40** |
| **CASHED `:`** | **1** |
| **CASHED `—`** | **3** |
| **SPLIT** — Butler wrote `,` or nothing | **9** |

```
Butler's own sentences                 192
the candidate's                        244   (+27.1% raw D17)
new boundaries                         +52
  of which marks Butler already wrote   44
  of which real division of his prose     8
=> 85% of the raw splitting rate is cashed pointing.
```

**This answers the drafter's question and it answers it against the draft.** With
**MOVE-GAP 0.00692 and 0 displaced runs — the lowest movement in the package on
the strict witness — and commas moving 410 → 407**, there is no recasting to
find. The +27.1% is bookkeeping, as `continuity.md` §1 already says; what
`continuity.md` does not say is that the residue after the bookkeeping is **8
divisions in 50 paragraphs**, which is the lowest real splitting rate any Book in
this package has shipped. The +4.3% NORM RATE is not a modest figure that the
+27.1% flatters; **+4.3% is itself flattered**, because D20 normalizes the
semicolon and nothing else.

**The generalization, and it is D11's kind of finding — settle it here.** D20
clause (a) was written so that cashing a semicolon is worth zero. The same
argument applies without modification to **the colon and the em dash**: both are
marks Butler wrote, both bound clauses that a period can separate at no cost in
recasting, and both are worth a full division under the raw rate and under NORM
RATE alike. Book 8 cashes four of them. **Recommendation:** extend D20 clause
(a) to add each text's own `;` **+ `:` + sentence-internal `—`** to its own
sentence count. On that basis Book 8's normalized figure is 192+62 = 254 →
244+16 = 260, **+2.4%**, and the eight genuine divisions are what is left. This
costs a recomputation of every Book's row; it is a coordinator matter and it is
not this review's to apply.

### S-2 — Seven of Butler's marks should have survived, and the worst of them is not a semicolon

The full ruling on all 42 is §5.2. The short form: **35 of the 42 are correctly
cashed** — Butler's semicolon before `indeed`, `still`, `also`, `but`, `for`,
`however`, `there` is doing a job a period does as well or better in modern
English, and the draft's periods are right. **Six should have survived**, in five
paragraphs, and a **seventh mark that is not in the 42 at all** is the worst
break in the Book.

That seventh is **B08-P047**, and it is an em dash:

> Butler: *"…and carry her off into slavery, to a life of labour and sorrow, and
> the beauty fades from her cheeks**—even so piteously did Ulysses weep**, but
> none of those present perceived his tears…"*
>
> candidate: *"…and the beauty fades from her cheeks**. Even so piteously did
> Odysseus weep**, but none of those present was aware of his tears…"*

The dash is the hinge of a Homeric simile: *"He wept **as** a woman weeps
when…"* is a protasis that runs 48 words, and *"**even so** piteously did
Odysseus weep"* is its apodosis. Butler's dash holds the two halves in one
sentence, which is what makes the correlative pair readable across that
distance. A period cuts the correlative, and `Even so` at the head of a new
sentence reads first as a discourse connective (*"even so"* = *"nevertheless"*)
before it resolves as the simile's answering term — which is exactly the wrong
first reading, since the sentence is not concessive. **This is a sentence
divided at the wrong seam, it is the single clearest instance the package has
produced, and no measure in the package can reach it**: it is not a semicolon,
so S-1's count does not see it; it moves no clause, so MOVE-GAP and the
displaced-run witness stay at their floor; it lengthens nothing, so the growth
gate is silent.

**Recommendation:** restore the dash at B08-P047.

### S-3 — `--manifests` is defeated by one field, and `prove_manifest.py` never tests that path

`RESUME.md` says `verify_manifest()` *"rejects a stale checks hash, a candidate
whose bytes moved under the manifest, `all_gates_passed` beside a failing run,
and a post-rule Book with no `checks` block"*, and that
`checks.py --manifests` is *"the S-2 read side alone"*.

**The third of those four is conditional on an argument `--manifests` never
passes.** `verify_manifest(book, figs=None, gate=None)` guards clause (c) with
`if gate is not None`. `run_manifests()` calls `verify_manifest(book)`. So
`--manifests` can *never* reject `all_gates_passed: true` beside a failing
candidate; the only thing standing between it and a lie is the candidate hash.

**Demonstrated.** In a throwaway copy: plant a gate-failing defect in
`book07/candidate-v2.json` (a byte-identical paragraph, which Book 7 declares
none of), then edit **one field** — `manifest.checks.candidate_sha256` — to the
new bytes.

```
checks.py --manifests   exit=0   (no failure reported)
checks.py 7 --no-write  exit=1   ✗ manifest: book07 asserts all_gates_passed: true, and 1 gate(s) just failed
                                 ✗ byte-identical paragraphs [2], but book07/candidate-v2.json declares []
checks.py --all         exit=1   ✗ Book 7 — 2 failure(s)
```

The package is not *breached* — `checks.py N` and `--all` both catch it, and
`WORKFLOW.md` requires both. But `--manifests` is documented as a standalone
read side and it is not one, and **`prove_manifest.py` asserts the opposite by
testing only the case where the hash was *not* updated** (its case 4 looks for
`"moved under the manifest"`). This is the S-2 shape recurring inside the script
written to prove S-2 was closed: a claim about enforcement that is only written
down.

**Two further defects in `prove_manifest.py`:**

* **Its fifth enumerated case is dead code.** `cases` has five entries; the loop
  is `for name, rel, fn, book, needle in cases[:4]`. The fifth —
  `"growth: a SECOND growth identical to a declared one — the R-5 hole"` — has
  `fn = lambda d, s: None` with the comment `# filled in below`, and it is never
  filled in and never run. A reader counting the five enumerated cases against
  "15 assertions, 15 passed" cannot tell.
* **The R-5 assertion tests `collections.Counter`, not the package.** The block
  that replaces case 5 builds two literal lists in memory and asserts that
  multiset subtraction finds an element list membership misses. That is a
  property of Python. It exercises no file of the package, does not call
  `checks.py`, and does not touch `DECLARED`. The multiset comparison *is*
  correctly implemented (`checks.py` ~950), but nothing in the proof demonstrates
  that, which is precisely the gap the proof exists to close.

**Recommendations:** (a) have `run_manifests()` evaluate the gates, or say in
`RESUME.md` that `--manifests` checks hashes only; (b) run `cases[4]` or delete
it; (c) replace the in-memory R-5 demonstration with one that plants a second
identical growth in a real candidate and asserts `checks.py` fires.

---

## 3. Minor findings

### M-1 — B08-P047: covered under S-2. The simile's dash. Restore it.

### M-2 — B08-P044: a garden path built by a period, 14 words long

> Butler: *"…tell him to eat it**;** for all the pain his lays may cause me I
> will salute him none the less…"*
>
> candidate: *"…tell him to eat it**. For all the pain his singing may cause me,**
> I will salute him none the less."*

`for all` here is **concessive** — *despite*. Butler's semicolon keeps it inside
the flow, where the preceding clause forces that reading. At the head of a new
sentence, `For` is first read as the **causal conjunction** the candidate itself
uses four times elsewhere in this Book (*"for there is no bard like him"*, *"for
he was ashamed"*, *"for I am exceedingly angry"*, *"for the Muse teaches them
their songs"*). The reader takes *"For all the pain his singing may cause me"* as
*"because of all the pain…"* and has to reverse at `I will salute him none the
less`. This is the **B07-P020 class** — a garden path the draft builds out of a
mark — and it is the second one in this Book (see M-7).

**Recommendation:** either restore the semicolon, or write the concession out:
*"Despite all the pain his singing may cause me, I will salute him none the
less."*

### M-3 — three words supplied to Butler's text, none recorded, and no rule covers them

`continuity.md` §5 is *"D16 — Butler's punctuation slips, four repairs and their
rule"*, and its rule is about **marks**: *"a Victorian mark is REPAIRED when a
modern reader reads it as an error"*. Three of Book 8's emendations are not
marks. Two are sound, one is not, and none is written down.

| ¶ | Butler | candidate | ruling |
|---|---|---|---|
| **B08-P042** | *"He **had done so** before an upper servant told him to come to the bath"* | *"He **had hardly done so** before an upper servant told him"* | **Remove `hardly`.** This is not a repair, it is a change of sense. Butler says Odysseus *had finished* the knot before he was called. `hardly … before` says he had *barely* finished. Butler's reading is idiomatic English and needs no help. |
| **B08-P045** | *"as soon as they had had **to eat and drink**"* | *"as soon as they had had **enough** to eat and drink"* | **Keep, and record.** A word is missing in PG and in Butler; the candidate supplies it from Butler's own parallel eleven paragraphs earlier — B08-P006 reads *"as soon as they had had enough to eat and drink"*, the identical formula. Emendation from the author's own repetition, which is the strongest kind. |
| **B08-P008** | *"Acroneos, Ocyalus, Elatreus, … and Amphialus son of Polyneus son of Tecton."* — a **verbless fragment** | *"**There were** Acroneos, Ocyalus, …"* | **Keep, and record.** Butler's sentence has no verb; the next sentence begins *"There was also Euryalus"*, so the supplied `There were` is drawn from his own next clause. |

**And D11: the rule is missing, and Book 8 is where it should be written.** D16
governs marks. There is no clause anywhere in `PUNCTUATION.md`, `GLOSSARY.md` or
the ledger governing **a word supplied to Butler's text**, and Books 9–24 will
meet more of them (PG #1727 has at least two more verbless list-fragments of the
B08-P008 kind). **Recommendation:** D16 gains a clause (b) — *a word is supplied
only where Butler's text is defective and only from Butler's own parallel, and
every instance is tabulated in `continuity.md` §5 with the parallel named.* On
that rule B08-P045 and B08-P008 pass and B08-P042 fails, which is the right
outcome in all three.

### M-4 — B08-P007: `minstrelsy` → `the playing that goes with it` — the collision discipline paid for lexical freedom with accuracy

`continuity.md` §7 records this as an arrow-C repair: Butler's `minstrelsy`
(P007) and his own `music` (P017) had both been rendered `music`, so `music` was
reserved for P017 and P007 took `the playing that goes with it`.

The discipline is right and the word is wrong. Demodocus **sings** — that is the
whole content of the paragraph, which is about a bard whose singing makes
Odysseus weep, and the candidate's own next clause is *"the Phaeacians pressed
Demodocus to sing further, for they delighted in his **singing**"*. `Playing`
names what a lyre does. Butler's `minstrelsy` is the bard's whole performance
and is the *superordinate* of his `lays`; rendering it as the accompaniment
inverts the relation.

**Recommendation:** `the singing that goes with it` collides with the same
paragraph's `singing` for `lays`; `the song that goes with it` does not, and is
exact. This is worth saying as a general point: **arrow C's repair is a
constraint, not a direction.** Freeing a word for a later paragraph is only a
gain if the word that takes its place is still right, and nothing in the
collision record asks that question.

### M-5 — `DECLARED`: three rows declare `compound=[]` and their files carry drift, and nothing evaluates them

The brief asked for more of the `LEGACY_GROWTH[4]` shape. Here it is. Running
the gates over **every file `DECLARED` names** — which nothing in the package
does — gives:

```
  OK   book01/candidate-v2.json        OK   book04/candidate-v2.json
  OK   book01/candidate-v3.json        OK   book04/candidate-v3.json
  OK   book02/candidate-v2.json        OK   book04/candidate-v4.json
  FAIL book02/candidate-v3.json  drift ['seashore','storeroom','waterside'], declares []
  FAIL book02/candidate-v4.json  drift ['storeroom','waterside'],            declares []
  FAIL book02/candidate-v5.json  drift ['storeroom'],                        declares []
  OK   book02/candidate-v6.json   … and every remaining row OK, Book 8 included
```

`book02/candidate-v3/v4/v5.json` are the intermediate successors, and each is in
`DECLARED` with `compound=[]` — a declaration that is **false for the file it is
keyed to**. Nothing catches it: `--all` scores one file per Book (the accepted
one, or its latest successor), and `checks.py 2` with no `--version` takes the
highest, v6.

This is the S-3 repair done **halfway**. Keying on the file was right and it did
expose `LEGACY_GROWTH[4]`; but the new per-file rows were populated only for the
rows somebody ran, and three rows that nobody runs were filled in by analogy.
`DECLARED`'s own docstring says *"A file absent from this table declares nothing
and therefore gets every gate at full strength"* — these files are **present**
with a wrong declaration, which is worse than absent.

**Recommendation:** either correct the three rows to `compound=["seashore",
"storeroom", "waterside"]` / `["storeroom","waterside"]` / `["storeroom"]`, or
remove superseded intermediate successors from the table entirely and add a
`checks.py --declared` that evaluates every key. The second is better: a table
whose rows are never evaluated will drift again.

### M-6 — `compound_drift.py` carries a second, stale copy of the accepted-file list, and it names a rejected file

`scripts/checks.py` has `ACCEPTED = {1: (source, accepted, successor), …}` and it
is current. `scripts/compound_drift.py` has its **own** `ACCEPTED` list, and four
of its seven rows are stale:

| Book | `compound_drift.ACCEPTED` says | the accepted file is |
|---|---|---|
| 2 | `book02/candidate-v5.json` | **v6** (`a6fb8103…`) |
| 5 | `book05/candidate-v2.json` | **v3** (`c8af4cc3…`) |
| 6 | `book06/candidate-v2.json` | **v3** (`1ae67a52…`) |
| 7 | `book07/candidate-v1.json` | **v2** (`e79eb82b…`) — v1 is the file the review rejected |

`RESUME.md` tells every session to run `python3 scripts/compound_drift.py`, and
what it runs compares a **rejected candidate** for Book 7 and pre-successor files
for Books 2, 5 and 6. Re-running it with the correct list gives the same verdict
(0 drift both ways, and 0 with Book 8 added), so there is **no live harm** — but
this is one fact written twice and updated once, which is the `hyphen_drift()`
disease in its sibling form, and it is in the instrument whose entire job is
cross-Book consistency.

**Recommendation:** `compound_drift.py` should import `ACCEPTED` from
`checks.py` rather than keep a copy. (`checks.py` already imports
`compound_drift`, so the import must go the other way or move to a third
module.)

**Records finding R-2, beside it:** the standalone run prints *"compound_drift
over book01 … book07"* — **Book 8 is not in it.** `RESUME.md` instructs that the
compound register and the collision check be run *"before freezing, not after"*;
the standalone drift instrument says nothing about the Book being frozen unless
it is passed as an extra argument, and the freeze record does not show that.
Coverage does exist — `checks.py 8` injects the candidate into the drift set and
the gate passes — so this is a misleading headline, not a hole.

### M-7 — B08-P039: a second garden path, made by the recast rather than by the mark

> Butler: *"…he will **thus better enjoy** both his supper and the singing that
> will follow."*
>
> candidate: *"He will **then enjoy** both his supper and the singing that will
> follow **all the more**."*

Moving `all the more` to the end of the clause puts it immediately after *"the
singing that will follow"*, where `follow all the more` reads as a unit before
the reader reverses it onto `enjoy`. The repair is trivial — *"He will then
enjoy his supper, and the singing that follows, all the more"*, or keep Butler's
position: *"He will then enjoy both his supper and the singing that will follow
the better for it."*

### M-8 — `compound_register.py` is keyed on the inflected surface pair, and one lexeme gets two opposite verdicts

Reading the corpus the register reads, with the register's own margin (closed
must lead open **3×** and appear in **3+ editions**):

| pair | closed | open | register's verdict |
|---|---|---|---|
| `mountain top` | **10 in 6 editions** | 1 | **`closed` — LIVE** |
| `mountain tops` | 7 in 7 editions | 9 | `kept open, standard` |

These are one lexeme. The register would tell a Book to close the singular and
leave the plural, in the same paragraph. The instrument counts **surface
bigrams**, and English compounding is a property of the lexeme, not of the
inflected form; the plural's 7-against-9 is thin data being read as a contrary
verdict where the singular's 10-against-1 is decisive.

This bears directly on the correction the brief asked about. The drafter is
right that **the register as built would not have caught `mountain tops`** — I
reproduce 7 in 7 against 9 exactly. But the conclusion the record draws
(A5(c)'s claim withdrawn) is the wrong half. Merging the two forms gives 17
closed against 10 open, which is **1.7×** and still short of the margin, so
lemmatizing alone does not rescue the claim either. What the evidence actually
says is: *the corpus attests `mountaintop` decisively and `mountaintops`
weakly, and the register's arithmetic cannot combine them.*

**Recommendation:** count the lexeme, not the bigram (merge singular and plural
before applying the margin), and report both the merged and the split figures so
a reader can see when they disagree. And note the standing consequence: with the
register as built, **the coordinator's A5 ruling that closed `mountain tops`
across two successors is not supported by the package's own instrument**. One of
the two has to give. My ruling is that the coordinator's is right and the
instrument is under-powered — see R-5.

---

## 4. Optional findings

### O-1 — `Hercules` → `Heracles` at B08-P016: inside D5 once D5 is widened, and it should be widened here

**Ruling: the draft is right, and D5 should be widened from *Olympians who have
Roman names* to *any figure Butler names in a Roman form*, at this Book.**

The draft's reasoning is the correct one and it is not a purpose-over-letter
stretch. `Heracles` is not a licence taken against D5; it is what D5 would have
said if the Book that wrote it had met a hero. The determining fact is on the
page: the candidate's B08-P016 already reads `Ares`, `Aphrodite` and
`Hephaestus` within a few hundred words, and the sentence itself continues
*"…such as Heracles, or **Eurytus the Oechalian**"* — a Greek name in the same
list, in apposition. `Hercules` beside `Eurytus` is not a rule being observed,
it is a visible inconsistency. D8 is silent because the Cast has no entry, which
is an absence of evidence.

The brief asks whether to widen because Books 11 and 12 will meet more. They
will, and the list is nameable now: **Hercules/Heracles, Ulysses/Odysseus (already
D5), Aeolus, Proserpine/Persephone, Pluto/Hades, Tiresias, Castor and Pollux
(Polydeuces), Bacchus/Dionysus, Aurora/Eos, Cerberus, Charybdis, Scylla.** Of
these, **Proserpine → Persephone**, **Pluto → Hades**, **Bacchus → Dionysus** and
**Aurora → Eos** are the ones that will force the question in Book 11, and all
four are the same case as Heracles: a Roman name for a Greek figure in a Greek
poem, in an edition that has already made the Olympians Greek. Widen now and
Book 11 inherits a rule instead of re-arguing it.

### O-2 — `guardian angel` at B08-P043: keep, and the drafter is right to flag rather than decide quietly

**Ruling: keep.** Three reasons, in order of weight.

1. **The package's rule is that Butler's images are kept and nothing is added,
   and this is Butler's image.** Removing it is not restoring Homer; it is
   substituting the reviewer's Homer for Butler's. The edition is *Butler
   modernized*, not *Homer retranslated*, and the moment that distinction is
   relaxed for one Victorian idiom it is relaxed for `aldermen and town
   councillors`, which is a far larger intrusion and which this package has kept
   in every Book.
2. **The alternatives are worse, and the drafter names why.** The clause already
   ends *"for it was you who saved me"*, so `my deliverer` and `the one who
   saved me` are both tautologies in place. What `guardian angel` supplies that
   neither does is the *continuing* relation — Nausicaa watching over him
   afterwards — which is the point of `all my days`.
3. **It is not a doctrinal intrusion in the way it looks.** In current English
   `guardian angel` is a dead metaphor for a protector; a modern reader meets an
   idiom, not a Christian figure. `Aldermen` is the greater anachronism on the
   same page and nobody proposes removing it.

**But the flag should be permanent, not just raised.** Recommend
`continuity.md` §6 keep the line and the ledger gain a one-word class,
`butlerism`, for Butler's Victorian overlays that are kept deliberately
(`guardian angel`, `aldermen and town councillors`, `cast in heavy damages`,
`a bad man's bond is bad security`, `father stranger`). Book 8 has five and
they are currently indistinguishable from renderings nobody examined.

### O-3 — the colon and the parenthesis have no rule, and Book 8 disposes of both silently

Two classes, neither counted anywhere (S-1), neither in `PUNCTUATION.md`:

* **B08-P020**: Butler's colon — *"Let us go to the couch of Vulcan**:** he is
  not at home"* — becomes a period. The colon was doing explanatory work
  (*here is why*), and the period drops it. Butler's other five colons are all
  kept, so the Book has **two dispositions for one mark and no rule**. This is
  Book 7's O-3 recurring on a different mark.
* **B08-P044**: Butler's only parentheses — *"with plenty of fat (for there was
  abundance left on the joint)"* — become em dashes. Parentheses lower an aside;
  dashes raise it. The candidate's other em dashes are Butler's own, so this one
  adds a mark of a class the reader will read as emphasis.

Both are defensible; neither is recorded. **Recommendation:** `PUNCTUATION.md`
gains one line per class — *Butler's colons are kept unless the clause after
them is a new sentence's subject*, and *parentheses become em dashes only where
the aside is a whole clause* — and `continuity.md` §5 tabulates the instances.

### O-4 — B08-P019: `so the sun … told Vulcan` → `and the sun … told Hephaestus`

Butler's `so` is consequential: Ares defiles the bed, **so** the sun tells.
`and` makes it a coincidence. One word, and the causal chain is the paragraph's
armature (defilement → telling → the smithy → the snare). Restore `so`.

### O-5 — B08-P046: `an offering and propitiation for the gods` → `an offering to appease the gods`

Butler's doublet is a hendiadys and the candidate merges it. The merge is
readable and loses the second noun's force — *propitiation* is the appeasing of
an angry god, and the Trojans' third counsel is precisely that the horse might
buy off divine anger. *"as an offering to appease the gods"* keeps the sense;
*"as an offering and a propitiation"* keeps Butler and is not archaic. Either is
fine; record which.

### O-6 — B08-P021: `vestibule` → `entrance`

`vestibule` is current English and needed no change; `entrance` is vaguer and
the noun is architecturally specific (Hephaestus stands in the *πρόθυρον*, the
porch before the door, and shouts inward). No collision forces it —
`collisions.md` has no row for it. Low weight; keep either, but `entrance` is a
loss with no gain.

### O-7 — B08-P009: `making havoc with a man` → `making havoc of a man`

Butler's `havoc with` is the living idiom (*play havoc with*); `havoc of` is the
older one. The change runs against the edition's own direction. One word.

---

## 5. The questions, ruled

### 5.1 Question 1 — `Hercules` → `Heracles`. Ruled at **O-1**: inside D5 once D5 is widened, and widen it here.

### 5.2 Question 2 — the 42 semicolons, every one converted

**The ruling: 35 are correctly cashed; six should have survived; and a seventh
mark that is not a semicolon (B08-P047, S-2) is worse than any of them.**

The criterion applied throughout: a semicolon should survive where the second
clause **cannot stand as an assertion in its own right** — where it specifies,
enumerates, or completes the first rather than following it. Where Butler's
semicolon precedes an adverb or conjunction that already carries the relation
(`indeed`, `still`, `also`, `but`, `for`, `however`, `there`, `and`), the period
is right and the draft is right.

**The six that should survive.**

| # | ¶ | Butler | why |
|---|---|---|---|
| **[10]** | **P009** | *"He seems very powerfully built**;** his thighs, calves, hands, and neck are of prodigious strength"* | **Specification.** The second clause is the *evidence* for the first, not a further observation. The draft's three flat sentences (*"…in any of these sports. He seems very powerfully built. His thighs…"*) read as a staccato inventory where Butler has one gathering appraisal. This is the strongest single case in the Book. |
| **[26]** | **P034** | *"counting myself there are thirteen**;** contribute, each of you, a clean cloak, a shirt, and a talent of fine gold"* | **The arithmetic and the instruction it licenses.** The number is stated *in order to* issue the order; the semicolon is the *therefore*. `There are thirteen. Contribute, each of you…` strands the number. |
| **[30]** | **P039** | *"heat some water**;** our guest will take a warm bath"* | **Reason for the order just given.** The draft's *"Also set a copper on the fire and heat some water. Our guest will take a warm bath."* turns a reason into an announcement. |
| **[34]** | **P043** | *"may Jove … grant that I may reach my home**;** so shall I bless you as my guardian angel all my days"* | **Protasis and apodosis of one wish.** *"So shall I…"* is grammatically dependent — it is the *then* of an *if*. A period severs a conditional. This is the second-strongest case, and the only one where the loss is grammatical rather than rhetorical. |
| **[37]** | **P046** | *"Some were for breaking it up then and there**;** others would have it dragged…"* | **Enumeration.** Three alternatives inside one deliberation. |
| **[38]** | **P046** | *"…and then thrown down the precipice**;** while yet others were for letting it remain…"* | **The same enumeration, third member.** The enumerative semicolon is the one use of the mark that no modern style guide has replaced, and this is a textbook instance: three parallel counsels in one council. The draft's three sentences (*"Some were for… Others would… Others again were for…"*) turn a debate into a list of reports. |

**[35]** at **P044** is a seventh candidate and is ruled at **M-2** instead: the
semicolon should survive *or* the concession should be written out, because the
period creates a garden path. Either repair is acceptable; the present text is
not.

**Seven more are defensible either way, and I uphold the draft on all seven** —
recorded so the record shows they were read, not skipped: **[8]** P009
(`by a long way; he left every one else behind`), **[12]** P014 (`charms every
one who sees him; his honeyed moderation`), **[17]** P016 (`brought down very
low at sea; my provisions ran short`), **[24]** P028 (`a bad man's bond is bad
security; what remedy could I enforce`), **[27]** P034 (`a talent of fine gold;
let us give him all this in a lump`), **[40]** P049 (`a plain answer; tell me
the name`), **[41]** P049 (`the Phaeacians have no pilots; their vessels have no
rudders`). **[41]** is the closest of the seven to a survivor — *"have no
pilots"* is an odd claim that the next clause exists to make intelligible — and
if the coordinator wants a seventh restoration it is that one.

**The remaining 28 are correctly cashed** and I say so with the reason, since
"no measure can check it" is the whole difficulty: **[1]** P001, **[2]** **[3]**
P003, **[4]** P004, **[5]** **[6]** P007, **[7]** P008, **[9]** P009, **[11]**
P012, **[13]** **[14]** P014, **[15]** **[16]** P016, **[18]** P017, **[19]**
P019, **[20]** **[21]** P022, **[22]** P024, **[23]** P028, **[25]** P034,
**[28]** P036, **[29]** P038, **[31]** **[32]** P039, **[33]** P040, **[36]**
P044, **[39]** P049, **[42]** P049. In every one of these Butler's next word is
`indeed`, `still`, `also`, `but`, `for`, `however`, `there`, `and`, `let us`,
`he`, `they`, `a crowd`, `here`, `my`, `who` — a clause that stands on its own
feet and whose relation to the one before it is carried by its own first word.
Converting those to periods is what a modern edition is for. **The draft's
default is right; it is the exceptions it did not stop for.**

**Zero survivors is an extreme and this is why it happened.** Under D20 a
semicolon cashed is worth zero, so the draft had nothing to gain and nothing to
defend, as `review-instructions.md` says. What that argument misses is that
having nothing to gain is not a reason to convert *all* of them — it is a reason
for the decision to be made one mark at a time on the reading, and a
whole-category sweep is the shape of a decision that was made once. **Six
restorations out of forty-two is a 14% exception rate**, which is close to Book
7's (8 kept of 30, though that Book's drafter kept them rather than a reviewer
restoring them).

### 5.3 Question 3 — `guardian angel`. Ruled at **O-2**: keep, and make the flag a named class.

### 5.4 Question 4 — anything flattened that arrow C could not see

**Yes: one, and it is `minstrelsy` — but arrow C *did* see it, and the repair is
the problem.** Ruled at **M-4**. `continuity.md` §7 records the flattening
(`minstrelsy` and Butler's own `music` both → `music`) and the repair (`the
playing that goes with it`). The repair frees `music` and misdescribes the
bard.

**The four cross-paragraph discriminations the brief names all hold up:**

* **`lays`/`songs`** — `singing` / `songs`, consistent at P007 and P044, and
  arrow C caught the draft's first attempt. Correct.
* **`minstrelsy`/`music`** — distinguished, but see M-4.
* **`precincts`/`court`** — `precincts` kept at B08-P004 against B07-P012's
  `courtyard`; §6's reasoning (plural grounds of a palace vs. a man crossing a
  threshold, plus the M-1 collision with Book 7's bronze walls) is right.
* **`raiment` twice** — `robes` at P030 for the Graces' divine dress, `clothing`
  at P040 for gift-cloth in a chest, matching accepted B05-P004. Ruled in §6 and
  in `collisions.md`. Correct, and the right call: these are two senses, not one
  word rendered twice.

**Two more cross-paragraph flattenings I checked and cleared**, so the record
shows the search was made: Butler's `Thus`/`So` openings (`Thus sang the bard`
P007/P031, `Thus did they converse` P025, `Thus did he speak` P035) all become
`So`, which is one Butler pattern rendered one way — not a flattening. And
Butler's `Thereon` (P030) / `On this` (P018, P023) / `Whereon` (P040) all become
`Then`/`At this`/`and`, which **is** a flattening of four connectives onto
three, but they are pure discourse markers carrying no discrimination and
modern English has no four-way distinction to preserve. Cleared.

**And one thing that looked like a finding and is not.** B08-P001 inverts
Butler's *"Now when the child of morning, rosy-fingered Dawn, appeared"* into
*"When Dawn, the rosy-fingered child of morning, appeared"*. That is the poem's
signature formula and the inversion is not Book 8's: it is the package's
standing rendering, verbatim at B02-P001, B03-P032, B03-P037, B04-P025,
B04-P037, B04-P048 and B05-P020. Consistent. No finding.

---

## 6. The three audits

### 6.1 `prove_manifest.py` — **it does not hold as claimed.** Ruled at **S-3**.

Fifteen assertions, fifteen pass, and the claim they support — *"the manifest
now rejects both a stale hash and a failing candidate"* — is true of `checks.py
N` and `--all` and **false of `--manifests`**, which the same paragraph calls
"the S-2 read side alone". One field edit defeats it, demonstrated above. Plus a
dead fifth case and an R-5 assertion that tests `collections.Counter`. The
previous version made exactly this claim and was false; this version is
*narrower* than its claim rather than false, which is an improvement and is not
what the record says.

### 6.2 The `DECLARED` table — **one more of that shape, and it is three rows.** Ruled at **M-5**.

`book02/candidate-v3/v4/v5.json` each declare `compound=[]` and each carries
compound drift. Nothing in the package evaluates those keys. `book01/candidate-v3`'s
*"identical to v2 on all four measures"* claim I checked and it holds; Book 4's
v3/v4 `(18, 53, 54)` rows are correct for their files; `book07/candidate-v1`
declaring nothing is correct; `book08/candidate-v1`'s `byte_identical=[33]` is
correct and the disposition (declare rather than make a cosmetic edit) is the
right lesson from Book 7's M-9. So: **sixteen of nineteen rows are sound, three
are wrong, and the three are exactly the ones nothing runs.**

### 6.3 `compound_register.py` — **it earns its place, with two conditions.**

**For, on the evidence:**

* It found a **live compound in accepted Book 2** (`store-room`, closed 31 in 9
  editions against 1 and 1) the first time it ran, which no reader, no review
  round and no check in the package's history had named. One real catch is more
  than the vendored word list would have produced, because a list of single
  words cannot represent the open form at all — the drafter's argument against
  A4(ii) is correct and I endorse the decline.
* It closes blind spot 8: every H.1 pair in every Book now carries a
  disposition. 234 across eight Books, none live.
* It is honest against its own record — it withdraws A5(c)'s claim with the
  evidence rather than repeating it.
* **I attacked its corpus and the attack failed.** The register's own caveat
  notes that a commit on the default branch (`d208051e9`) finds **nine of the
  hundred served modern-en editions are largely the original text**. That
  contamination runs in the direction that suppresses closures — original prose
  sets compounds open — so it should inflate the open counts on exactly the
  marginal pairs. I recomputed every probe with those nine excluded
  (`confessions`, `ulysses`, `heart-of-darkness`, `jungle-book`,
  `vindication-rights-of-woman`, `the-awakening`, `jerusalem`, `walden`,
  `brothers-karamazov`): **no verdict changes.** `mountain tops` goes 9 open →
  8; `sea shore` stays 51-in-14 against 0. The corpus is sound for this use, and
  that is now checked rather than hoped.

**Against, and both are fixable:**

* **It is keyed on the inflected surface bigram** (M-8), so `mountain top` is
  live-closed and `mountain tops` is kept-open — one lexeme, two opposite
  verdicts.
* **Its margin currently contradicts a coordinator ruling that stands.** A5
  closed `mountain tops` across two successors; the register says the corpus
  does not support closing it. The register's disposition set has no way to say
  *"ruled closed against the corpus"*, so a decision that overrode the evidence
  is recorded as evidence that no decision was needed.

**Records finding R-5 — the ruling.** The register earns its place as an
instrument for **proposing** closures and must not be used to **forbid** them. A
corpus of a hundred machine-generated editions is good evidence that a form is
current and weak evidence that a form is not. Recommend a fourth disposition,
`ruled closed by the coordinator, against the corpus`, carrying `mountain tops`
with A5 named — so the register's own output records the one case where a reader
outranked it, instead of quietly disagreeing with the package's accepted
decision in every future run.

---

## 7. What the checks would STILL not catch

`RESUME.md`'s list of seven, corrected and extended by this round.

1. **A sentence divided at the wrong seam** — still no carrier, and **B08-P047
   is the demonstration**: the package's worst division is invisible to every
   instrument because the mark was a dash. Item 1's own text names Book 8's 42
   semicolons as the largest exposure; the exposure turned out to be larger than
   that and in a class item 1 does not mention.
2. **A garden path the draft builds out of a mark** — two more this Book, M-2
   and M-7, and M-7 is not made out of a mark at all but out of word order, so
   the class is wider than its name.
3. **Register** — unchanged.
4. **A figure carried by a single word** — unchanged; O-4 (`so` → `and`) is the
   nearest instance, and it is a *relation* carried by a single word, which is
   the same hole.
5. **Every mark except the semicolon is unmeasured** — **half closed by this
   round.** `book08/review/mark_census.py` counts all of them, both directions,
   and decomposes the splitting rate by what Butler had at each boundary. What
   is still open is that **D20 prices only the semicolon**, so the colon and the
   dash remain free division on the compared figure (S-1's recommendation).
6. **A discrimination lost ACROSS paragraphs** — unchanged, and M-4 shows the
   adjacent hole: arrow C's *repair* is unexamined even when its *diagnosis* is
   right.
7. **Whether a disposition is RIGHT** — unchanged, and M-5 adds the sharper
   form: whether a *declaration* is right, when nothing ever evaluates the key
   it is filed under.

**New, from this round:**

8. **A word supplied to Butler's text.** D16 governs marks. Book 8 supplies three
   words and none is recorded (M-3). No check counts insertions that fall below
   the growth gate's 50-word threshold, and a one-word insertion that inverts a
   sense (`hardly`) costs nothing on retention, MOVE-GAP, growth or the census.
9. **A declaration keyed to a file nothing evaluates** (M-5), and **a fact
   written twice and updated once** (M-6). Both are the R-1/S-3 disease, and the
   package now has enough tables that the second is the likelier recurrence.
10. **An instrument that quietly disagrees with an accepted decision** (M-8 /
    R-5). `compound_register.py` has said since it was written that the
    `mountain tops` successors were unsupported, in a disposition class that
    reads as routine.

---

## 8. Paragraph coverage — all 50, one entry each

| ¶ | entry |
|---|---|
| **B08-P001** | No material issue found. The Dawn formula's inversion is the package's standing rendering (verified against B02-P001, B03-P032/037, B04-P025/037/048, B05-P020), not this Book's. Semicolon **[1]** correctly cashed. |
| **B08-P002** | No material issue found. |
| **B08-P003** | No material issue found. `two and fifty` → `fifty-two` and `cloisters` → `gallery` are both recorded in `continuity.md` §6. Semicolons **[2]** **[3]** correctly cashed; **[3]** is rendered as a comma, which is better than a period. |
| **B08-P004** | No material issue found. `out houses` → `outbuildings` (not `outhouses`) is the right call and is recorded under D15. Semicolon **[4]** rendered as a comma. |
| **B08-P005** | No material issue found. `bearing-post` → `pillar` recorded §6, consistent at P042 and P044. |
| **B08-P006** | No material issue found. |
| **B08-P007** | **M-4** — `minstrelsy` → *"the playing that goes with it"*. Semicolons **[5]** **[6]** correctly cashed. |
| **B08-P008** | **M-3(c)** — Butler's verbless list-fragment is given *"There were"*. Keep, and record. Semicolon **[7]** correctly cashed. |
| **B08-P009** | **S-2** — semicolon **[10]** should survive (*"He seems very powerfully built; his thighs, calves, hands, and neck…"*). **[8]** upheld as cashed, **[9]** correctly cashed. **O-7** — `havoc with` → `havoc of`. |
| **B08-P010** | No material issue found. |
| **B08-P011** | No material issue found. |
| **B08-P012** | No material issue found. The D16 repair (lower case after a question mark) is right and recorded. Semicolon **[11]** correctly cashed. |
| **B08-P013** | No material issue found. |
| **B08-P014** | No material issue found. The `this` → `him` emendation is recorded under D16 and is right. Semicolons **[12]** upheld, **[13]** **[14]** correctly cashed. |
| **B08-P015** | No material issue found. |
| **B08-P016** | **O-1** — `Hercules` → `Heracles`: inside D5 once D5 is widened, and widen it here. Semicolons **[15]** **[16]** correctly cashed, **[17]** upheld. |
| **B08-P017** | No material issue found. Semicolon **[18]** correctly cashed. |
| **B08-P018** | No material issue found. The `he` → `the bard` disambiguation is correct (Butler's pronoun could take the servant). |
| **B08-P019** | **O-4** — `so the sun … told` → `and the sun … told`: a consequence downgraded to a coincidence. Semicolon **[19]** correctly cashed. |
| **B08-P020** | **O-3** — Butler's colon cashed for a period, where his other five colons are kept. Two dispositions, no rule. |
| **B08-P021** | **O-6** — `vestibule` → `entrance`, a loss with no gain and no collision forcing it. |
| **B08-P022** | No material issue found. Semicolons **[20]** **[21]** correctly cashed. |
| **B08-P023** | No material issue found. `inextinguishable` → `unquenchable` is a fair rendering of ἄσβεστος γέλως. |
| **B08-P024** | No material issue found. Semicolon **[22]** correctly cashed; the resulting sentence-initial `And now` is current English. |
| **B08-P025** | No material issue found. |
| **B08-P026** | No material issue found. |
| **B08-P027** | No material issue found. |
| **B08-P028** | No material issue found. Semicolon **[23]** correctly cashed, **[24]** upheld. |
| **B08-P029** | No material issue found. |
| **B08-P030** | No material issue found. `raiment` → `robes` ruled in §6 and `collisions.md`; correct. |
| **B08-P031** | No material issue found. |
| **B08-P032** | No material issue found. `Halius` → `Halios` is Butler spelling one man's name two ways; the check found it and `collisions.md` rules it under the D13 shape with the opposite resolution. Correct and well recorded. |
| **B08-P033** | No material issue found. Byte-identical to Butler, **declared** in `DECLARED` rather than edited — which is the right lesson from Book 7's M-9 and is the disposition this reviewer would have asked for. |
| **B08-P034** | **S-2** — semicolon **[26]** should survive (*"…counting myself there are thirteen; contribute, each of you…"*). **[25]** correctly cashed, **[27]** upheld. |
| **B08-P035** | No material issue found. |
| **B08-P036** | No material issue found. Semicolon **[28]** correctly cashed. |
| **B08-P037** | No material issue found. |
| **B08-P038** | No material issue found. Semicolon **[29]** correctly cashed. |
| **B08-P039** | **S-2** — semicolon **[30]** should survive (*"heat some water; our guest will take a warm bath"*). **M-7** — *"the singing that will follow all the more"* is a garden path made by the recast. **[31]** **[32]** correctly cashed; the `thus better` → `then … all the more` repair is competent apart from the word order. The D16 repair (`“Go,` → `“go,`) is right and recorded. |
| **B08-P040** | No material issue found. `raiment` → `clothing`, matching accepted B05-P004; ruled in §6. Semicolon **[33]** correctly cashed. |
| **B08-P041** | No material issue found. |
| **B08-P042** | **M-3(a)** — `hardly` supplied, changing *had finished before he was called* into *had barely finished when he was called*. Remove it. |
| **B08-P043** | **S-2** — semicolon **[34]** should survive; it joins the protasis of a wish to its apodosis (*"may Zeus … grant that I may reach my home; so shall I bless you…"*). **O-2** — `guardian angel`: keep, and name the class. |
| **B08-P044** | **M-2** — *"For all the pain his singing may cause me"* is a garden path 14 words long, made by the period. **O-3** — Butler's only parentheses become em dashes. **[36]** correctly cashed; **[35]** is the finding. |
| **B08-P045** | **M-3(b)** — `enough` supplied, correctly, from Butler's own B08-P006. Keep and record. |
| **B08-P046** | **S-2** — semicolons **[37]** and **[38]** should both survive: they enumerate the Trojans' three counsels, which is the one use of the mark modern English has not replaced. **O-5** — `an offering and propitiation` merged to `an offering to appease`. |
| **B08-P047** | **S-2 / M-1** — **the worst break in the Book.** Butler's em dash closing the weeping-woman simile is cashed for a period, severing *"He wept as a woman weeps when…"* from *"even so piteously did Odysseus weep"*, and leaving `Even so` to be misread first as *nevertheless*. Restore the dash. |
| **B08-P048** | No material issue found. |
| **B08-P049** | **S-2** — semicolon **[41]** is the strongest of the seven upheld-but-close cases (*"the Phaeacians have no pilots; their vessels have no rudders"*: the second clause is what makes the first intelligible). Restore it if a seventh restoration is wanted. **[39]** **[42]** correctly cashed, **[40]** upheld. |
| **B08-P050** | No material issue found. The D16 repair of Butler's mid-question `?` is right and recorded, and ending the last clause with a period rather than Butler's `?` is correct — it is a reason, not a question. |

---

## 9. What this round wrote

```
book08/review/findings-v1.md                  this file
book08/review/recompute.py                    every published figure, importing nothing from scripts/
book08/review/recompute-output.txt
book08/review/verify_source_book8_review.py   the THIRTEENTH kind of rule, 13 controls, 4 declared blindnesses
book08/review/verify-output.txt
book08/review/mark_census.py                  blind spot 5, written: the per-mark census and the D17 decomposition
book08/review/mark-census-output.txt
```

Nothing else. `candidate-v1.json`, `collisions.md`, `continuity.md`, the
`checks-v1.md`, the scripts under `scripts/`, and everything under
`app/public/data/editions/` are unchanged; `git status` was clean after every
instrument was run, including `compound_register.py`, which rewrites §H.1
idempotently.
