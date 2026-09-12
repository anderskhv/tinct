# RESUME — where this package stands, for the next worker

Updated continuously. Read this first, then `WORKFLOW.md`.

**Last updated:** 2026-09-12, session `session_01K5bL9oWzAagjTMExsyUADi`
(worker 8, **review role**). **Books 1–6 are accepted. Book 7's round 1 has
RUN** — `book07/review/findings-v1.md`, verdict **accept after corrections**,
3 substantive / 10 minor / 7 optional / 6 records, all 29 paragraphs covered,
source verified by an **eleventh** kind of rule. Book 7 is at step 5 and needs
a v2.

## State

**Basis is stated on every row, because a figure without the paragraph set it
is computed over is not a figure — records finding R-1.** The one authoritative
table is `00-progress-ledger.md`, *The comparability table*, and it is produced
by `python3 scripts/checks.py --all`, not typed.

| Book | Step | Accepted file | **basis** | Retention | raw D17 | **NORM RATE** | **MOVE-GAP** | Semicolons |
|---|---|---|---|---|---|---|---|---|
| 1 | 8 — accepted, successor v3 | `candidate-v2.json` | all 32 | **0.72703** | +20.5% | **−3.9%** | **0.05088** | 47 → 13 |
| 2 | 8 — accepted, successors v3–v5 | `candidate-v2.json` | all 35 | 0.90232 | +16.1% | **+4.0%** | **0.01632** | 36 → 21 |
| 3 | 8 — accepted, successor v3 | `candidate-v2.json` | **37 of 38** | 0.89641 | +5.5% | **+1.0%** | **0.02156** | 39 → 32 |
| 4 | 8 — accepted, successors v3 **and v4** | `candidate-v2.json` | all 81 | **0.95872** | +8.9% | **+2.0%** | **0.00431** | 68 → 50 |
| 5 | 8 — accepted | `candidate-v2.json` | all 37 | 0.93808 | +23.5% | **+8.0%** | **0.00891** | 34 → 13 |
| **6** | **8 — ACCEPTED** | **`candidate-v2.json`** | all 26 | **0.93408** | +27.6% | **+7.0%** | **0.01156** | 27 → 5 |
| **7** | **5 — round 1 RUN, v2 owed** | — | all 29 | **0.93943** | +25.2% | **+7.5%** ⚠ | **0.01277** | 30 → 14 ⚠ |

**⚠ Book 7's two starred figures are the review's substantive finding S-1.**
Only **8** of Butler's 30 semicolons survive; **6 of the candidate's 14 are the
drafter's own**, written where Butler wrote a comma. Under D20 a comma raised to
a semicolon scores as a full division, so those six are worth **4.5 points**:
NORM RATE on Butler's own pointing is **+3.0%**, not +7.5%, which puts Book 7
fifth of seven rather than second. `--audit` has no control for that mutation.
`README.md`, `continuity.md` §7 and `review-instructions.md` all say *"fourteen
of Butler's thirty semicolons are kept"*; it is 8 kept + 6 added.

Hashes: Book 6 accepted `0e435458f6c30384415559af86b49ee01c402308bd9d36fdfea5462887bde2be`;
Book 7 v1 frozen `bf8cf2f76f4670daab55daf1da265ba7b1839c0cd6680e3c5691fac8d382dc33`;
the **fifth successor** `book04/candidate-v4.json`
`3b88a4da182eccc7f673e392e125295aef05b584c1cc592d405470d5ee86bf95`.

**Book 3's row is 37 of its 38 paragraphs** — B03-P038, the **D14** splice —
and until 2026-09-12 nothing said so. On all 38 it is 0.86053, 176 → 174
(−1.1%), semicolons 41 → 32, and **the D17 floor derived from a −1.1% rate
would be negative**, which is to say the gate would be vacuous. The exclusion is
correct; its silence was not.

**Book 1's retention is 0.72703, not the 0.721 quoted before 2026-09-12**, and
the measure is the **aggregate-join** form and only that form (`GLOSSARY.md`).
Book 1 is also the only Book for which the aggregate and per-paragraph forms
differ — 0.72703 against 0.73258 — so a "retention" figure of 0.73258 anywhere
is the per-paragraph form MOVE-GAP needs, not the published one.

## The largest thing that changed: the checks run

**Substantive finding S-2 of Book 6's round 1.** Until 2026-09-12, **no check in
this package was executed for a new Book by anything in the repository.** There
was no `build_book06*.py`; `build_book_package.py` called **no check at all**;
D17's gate, the growth gate and D19 lived only inside Books 4's and 5's
*correction* scripts, so **D17 had never gated a v1 candidate**; and no Book had
a `checks-v1.md`. Every published figure was correct and none was reproducible
by running anything in the repo. That is the `hyphen_drift()` disease recurring
one Book later as *all* of the checks.

**`scripts/checks.py` holds every measure and is imported, never re-pasted.**

```
python3 scripts/checks.py N            # writes bookNN/checks-vN.md, non-zero on any gate
python3 scripts/checks.py --all        # re-asserts every accepted Book's published figures
python3 scripts/checks.py --audit      # 10 controls under D18, 2 declared blindnesses
```

**The enforcement is structural, not a convention — a convention is what
failed.** `build_book_package.py` runs the checks at the end of every build and
writes `manifest.json` **only if the gates pass**, recording the sha256 of the
`checks-vN.md` that run produced. **A package directory whose checks did not run
has no manifest.** Verified by planting a failure in a scratch copy: four gates
fired, the manifest was removed, exit 2.

**What `--all` surfaced the first time it ran, and it is the disease measured
(records finding R-6).** Two of the gates the package believed it had were
**Book 5's assertions about Book 5**. The aligned growth gate fires **eleven
times** across Books 1–4, every one a 1–4 word growth on a sentence Butler
already wrote near fifty. The 0.90 per-paragraph length floor fires **five times
in Book 1**, whose own acceptance record states the minimum, 0.8621, by name.
And one gate was simply **wrong**: "no paragraph byte-identical to Butler" is
Book 5's assertion, while **accepted Book 4 carries seven on purpose**, examined
one by one and asserted exactly. **Disposition: nothing weakened, nothing
exempted** — what each Book carries is enumerated and asserted
(`BYTE_IDENTICAL`, `MIN_PARA_RATIO`, `LEGACY_GROWTH`), each entry with its
reason, so no Book can quietly acquire a twelfth instance and new work gets
every gate at full strength. **Repairing any of the eleven costs a successor and
is a coordinator matter.**

## D20 is decided, in three clauses

1. **The splitting rate that is COMPARED is NORM RATE** — add each text's own
   semicolon count to its own sentence count on **both** sides, so converting a
   semicolon into a period is worth exactly zero. D19's count stays, as the
   numerator.
2. **MOVE-GAP is reported for every Book, as an UPPER BOUND** — bag retention
   minus order retention, so substitution cancels. It counts *any* relocation of
   a surviving token, phrase-internal ones included. The lower bound is the
   **displaced-runs** witness, reported beside it.
3. **The growth gate aligns sentences** instead of comparing paragraph maxima,
   because a maximum against a maximum lets **division buy cover for growth**.
   50 words still fails; growth is reported from 40; and **every** candidate
   sentence of 40+ words is reported absolutely — which answers blind spot 2 of
   Book 6's round 1, the one that had no carrier at all.

**Do not argue from the retention figure that clauses moved.** Book 6's round 1
ruled that inference invalid: D17 was written about a vocabulary swap that
lowers retention and moves nothing. Book 6 v1's deficit was **85% vocabulary**.

## Book 7 — round 1 has run; what it found

`book07/review/findings-v1.md`. **Accept after corrections.** The three
substantive findings, because two of them are about the package and not the
Book:

1. **S-1 — the semicolon arithmetic**, above. A measure-level finding: D20's
   clause (a) makes semicolon→period worth zero and, by the same construction,
   makes **comma→semicolon worth a full division**. That corollary was never
   stated and is inflatable at one keystroke a time.
2. **S-2 — the manifest is write-only, and is already broken.**
   `book07/manifest.json` records `checks.sha256 = 88952e2b…` while the frozen
   `book07/checks-v1.md` hashes to `6ecfeeb4…` in the working tree, at `HEAD`
   and at trunk `f4d7fbcf7` — the last trunk commit changed the rendering,
   regenerated the file and did not rebuild the manifest. **Nothing reads a
   manifest**, so nothing noticed; and a manifest saying `all_gates_passed:
   true` survives a candidate that fails the gates (demonstrated in a scratch
   copy). `checks.py N` needs a read side, and `--manifests` for all Books.
3. **S-3 — `MIN_PARA_RATIO` is a lowered threshold wearing an enumeration's
   name.** `BYTE_IDENTICAL` and `LEGACY_GROWTH` really do enumerate; `{1: 0.86}`
   does not, so Book 1 can quietly acquire a sixth thin paragraph anywhere down
   to 0.86. The disposition's own sentence — *"no Book can quietly acquire a
   twelfth instance"* — is false for that one table. Fix is one line, in
   `BYTE_IDENTICAL`'s shape.

**Rulings the round was asked for:** all four handed-over collision rows
**upheld** (`lighted` and `issue` are not collisions at all — a verb/adjective
pair and a homograph); **`councillors` loses to D9** and costs one successor to
Book 2, because it is the *only* British spelling in seven accepted Books;
B07-P013's parenthesis move **upheld** but `them all` now takes `my friends` as
its antecedent; the present tense at P010–P011 **upheld**; B07-P011's vineyard
semicolons **upheld** and four of Butler's elsewhere ruled to be periods.

**A row the check printed and nobody ruled on:** `walls` ← `precincts` (B07-P012)
+ `walls` (P005, P009). The tool worked; the triage did not. The report returns
**72 rows touching Book 7**, not the eleven the README names — eleven were acted
on and sixty-one dismissed with no record.

## Book 7 — the drafting record, kept

`book07/`, 29 paragraphs, 10 packets, `review-instructions.md` with **five
questions put explicitly**. Not self-reviewed.

- **The first candidate anything gated, and the gates fired twice.** A sentence
  grown 51 → 52 words at B07-P021 — invisible to the old maximum-against-maximum
  form, because the paragraph's maximum did not move — and B07-P024
  byte-identical to Butler. Both repaired rather than declared. Two sixty-word
  sentences that **passed** the D17 survival gate were divided anyway, taking
  the census from 7 → 2 to **7 → 0**.
- **The collision check ran during drafting rather than after**, for the first
  time. Seven repaired before the freeze — `comely`, `midst`, `councilors`,
  `converse`, `depart`, Butler's own `dwells` flattened into `lives` in a
  paragraph carrying **both**, and `filling` for his `due replenishing` against
  accepted B04-P016's own `filling`. **Four kept and handed over** as question 2.
- **D4 fires twice** (Athena P006→P008, Odysseus P021→P023); **D16 fires once**
  (P021's `Madam` with no comma); **D3 once** (P018's hecatombs, no number).
- **Source verified by a TENTH kind of rule** — see below.

## Next, in order

1. **Book 7 v2**, answering `book07/review/findings-v1.md` — every finding
   either way (**D11**). The corrections that change a published figure (S-1's
   six semicolons, M-6, M-7) should be made together, because they move the raw
   rate and NORM RATE in the same pass.
2. **The three infrastructure repairs**, which are not Book 7's and should not
   wait for it: the manifest read side (S-2), `MIN_PARA_RATIO` as an enumeration
   (S-3), and the comma→semicolon control in `--audit` (S-1).
3. **Then Book 8**, in numerical order, by the full eight steps.
4. **Report five numbers with the basis on every one**: retention, raw D17 rate,
   **NORM RATE**, semicolons, **MOVE-GAP** — and displaced runs beside MOVE-GAP,
   because MOVE-GAP is an upper bound.
5. **Every control under D18.** Use `scripts/controls.py`; do not hand-roll.
6. **Run `scripts/checks.py --all`, `scripts/compound_drift.py` and
   `scripts/rendering_collisions.py` in any session that touches the package** —
   the last of these before freezing, not after, which is what made Book 7's
   seven collisions cheap.
7. **Anders still owes two decisions** — `00-progress-ledger.md` **A4**(ii) (a
   vendored English word list, a new external dependency, which would settle
   D15 mechanically for all 24 Books) and **A2** (Book 10's disposition). **A3**
   (the served Book 3 ¶38 splice) is prepared as a one-line patch and is not
   this package's to apply.

### The ten source rules already used

1. **Book 2 drafter** — PG's footnote-entry list, positionally.
2. **Book 3 drafter** — the `BOOK III`/`BOOK IV` headings, in bytes.
3. **Book 3 reviewer** — anchorless, digit-blind, one contiguous token block,
   occurring exactly once.
4. **Book 4 drafter** — occurrence-unique needles and a derived region.
5. **Book 4 reviewer** — global per-paragraph fingerprint alignment.
6. **Book 5 drafter** — identification by **residue**.
7. **Book 5 reviewer** — one global **monotone diff** of the whole edition
   against the whole file.
8. **Book 6 drafter** — a **suffix-automaton resemblance profile** of the whole
   file, reporting the second-best match rather than bounding it.
9. **Book 6 reviewer** — **letter-blind typographic shape**: every letter
   destroyed, all other pointing kept.
10. **Book 7 drafter** — **PG's own hard wrapping**, measured as **line
    counts**. Twenty-nine integers; the locating clause reads **no character of
    Butler's at all**, which none of the nine can say — the ninth destroys every
    letter but still reads his punctuation and his word lengths. Clause 4 turns
    **Butler's footnote numbering into an ordinal index** (the span carries
    57 … 64, contiguous and ascending).

11. **Book 7 reviewer** — the **capitalization bitstring**: every token reduced
    to one bit, `1` if its first letter is upper case. Letter identity, word
    length, every punctuation mark, every line break and every digit destroyed;
    3,347 bits, unique in PG's body, second best **114 bits** outside a guard
    band of the chapter's own length. Corroborated by clause 4, the **FOOTNOTES
    section's own internal structure** — the channel this file named as unused.
    That clause **failed on first execution and the cause was PG, not the rule**:
    footnote **29**'s opener is transposed, `29[]` for `[29]`, the only one of
    187 (records finding **R-3**). Clauses 0–3 passed first time, which the
    findings file states plainly rather than dressing as a failure — the three
    traps the record names were designed against before the first run. Its
    controls are the first in the package to plant the **B03-P038 splice**.

**A twelfth has to find another channel again.** Nothing so far has used the
**FOOTNOTES section's own internal structure** as its primary instrument
(Butler's cross-references between notes, the notes' own numbering against the
body's), or **PG's published file arithmetic** beyond wrapping (the
transcriber's note, the table of contents, line-count totals), or the **served
edition's internal evidence** (its chapter titles as a sequence, its own
paragraph-count arithmetic).

## Hard rules

Content-only, under `books/staged-replacements/odyssey/` alone. Zero Anthropic
API spend. English only. Nothing merged, deployed, registered, and the served
`app/public/data/editions/**` is never written.
