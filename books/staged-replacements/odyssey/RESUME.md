# RESUME — where this package stands, for the next worker

Updated continuously. Read this first, then `WORKFLOW.md`.

**Last updated:** 2026-09-12, session `session_01K5bL9oWzAagjTMExsyUADi`
(worker 4). Book 4 accepted; Book 5 in progress.

## State

| Book | Step reached | Accepted file | sha256 | Retention | Splitting rate |
|---|---|---|---|---|---|
| 1 | 8 — accepted, with recorded successor `candidate-v3.json` | `candidate-v2.json` (successor v3) | v3 `c97e20f5…4807b57c` | **0.727** accepted / 0.728 v3 | +20.5%, 60+ 10 → 0 |
| 2 | 8 — accepted, with recorded successor `candidate-v3.json` | `candidate-v2.json` (successor v3) | v3 `dcf1e301…6f24088ac` | 0.902 | +16.1%, 60+ 7 → 4 |
| 3 | 8 — accepted | `candidate-v2.json` | `7095ef4f…4989b905` | 0.897 | +5.5%, 60+ 9 → 6 |
| 4 | **8 — accepted** | `candidate-v2.json` | `b3bef2f3…9674c446` | **0.95872** | **+8.9%, 60+ 17 → 3** |
| 5 | **4 — round 1 complete, `accept after corrections`; step 5 next** | — | v1 `7acc5c34…3737a59cf` | 0.94211 | +23.5%, 60+ 9 → 3 |

**Book 1's retention was quoted as 0.721 everywhere until 2026-09-12 and that
figure does not reproduce** — records finding R2 of Book 4's round 1. The
package's own `token_retention()` gives **0.72703** for the accepted
`candidate-v2.json` and **0.72751** for the successor v3. Corrected across the
package; **no ranking changes**. The measure is the aggregate-join form and
only that form — see `GLOSSARY.md`, "The retention measure".

## Done since the last RESUME

- **Book 4 steps 5–8 are complete and Book 4 is accepted** at
  `candidate-v2.json`. Round 1 (`book04/review/findings-v1.md`) returned
  *accept after corrections*: **1 substantive (S-1)**, 16 minor, 11 optional,
  7 records. 42 substitutions in 31 of 81 paragraphs via
  `scripts/build_book04_v2.py` (`book04/changes-v1-to-v2.md`); five optional
  findings declined and asserted unchanged; one flow-read change
  (`book04/flow-read.md` F-1); `book04/ACCEPTANCE.md` written.
- **S-1 was the real work.** The draft modernized Butler's vocabulary
  thoroughly and his syntax hardly at all: it broke **one of seventeen**
  sixty-word sentences where the accepted Books broke 100%, 43% and 33%, and
  added 0.4% to its sentence count where they added 20.5%, 16.1% and 5.5% —
  against the densest supply of sixty-word periods in the package. Twelve
  paragraphs recast by **dividing sentences Butler already wrote**; B04-P038's
  105-word shape-changing sentence left standing, as the sheet ruled.
  **281 → 306 sentences (+8.9%), sixty-word 17 → 3 (82% broken), retention
  0.95958 → 0.95872** — division neither drops a word nor moves one, which is
  what round 1's B.7 said the number should do.
- **All seven records findings applied**, and three new ledger decisions:
  **D15** the compound rule (`PUNCTUATION.md` §4), **D16** one rule for
  punctuation slips (`PUNCTUATION.md` §5), **D17** the splitting rate as a
  build gate (`GLOSSARY.md`, "The splitting rate").
- **The checks now count sentences.** Round 1 showed every mechanical check in
  the package is satisfied perfectly by a pure vocabulary swap.
  `scripts/build_book04_v2.py` adds a splitting-rate gate that Book 4 v1 would
  have failed, a one-word-two-ways report, a near-identical report that does
  not stop at Hamming distance zero, and the 81 per-paragraph word counts.
  Its report is `book04/checks-v2.md`.

## Book 5 — done to step 3, frozen, waiting on the review

- **Steps 1–3 are done and `book05/candidate-v1.json` is frozen** at
  `7acc5c346154e7d23c85eaa3c31ef25654600e4e122f455eb93a1bf3737a59cf`: 37
  paragraphs, ratio 0.999, retention **0.94211**, **sentences 153 → 189
  (+23.5%), sixty-word sentences 9 → 3 (67% broken)**, 13 packets,
  `review-instructions.md` written with five questions put explicitly.
- **The source is verified by a sixth kind of rule that never looks for
  Book 5.** `scripts/verify_source_book5.py` locates the **other twenty-three**
  served chapters in PG, each required to occur exactly once in the whole file,
  and identifies Book 5 as the **residue**. The region is an output of
  twenty-three alignments none of which can see Book 5 — which closes the
  failure mode every search-then-verify rule shares, that the thing being
  checked chooses where the check looks. The residue is **exhausted** by
  chapter 5's heading, the served chapter 5 and chapter 6's heading, each
  heading checked against the served file's own `title` field.
- **The rule was audited before it was trusted, and the audit found a bug in
  it**: two negative controls were `replace("the", …)` on a paragraph that
  might not contain `the` — a control that cannot fail. Both are now built from
  the paragraph's own words, with the mutation asserted.
- **Its blindness is declared and covered**: a paragraph merge leaves the token
  stream untouched, so the merge and split controls run against the blank-line
  block count instead.

## Book 5 step 4 — round 1 is done

`book05/review/findings-v1.md`, by a separate reviewer session. Verdict
**accept after corrections**: **1 substantive**, 14 minor, 18 optional,
8 records. Every number in the package reproduced exactly from the frozen
files, and the source verification was re-run by a **seventh** rule
(`book05/review/verify_source_book5_review.py`) — one global monotone diff of
the whole 24-chapter edition against the whole PG file, which never looks for
Book 5 and pins its span from both sides by monotonicity. Chapter 5 aligns
**4,709 of 4,709 tokens, 0 PG tokens unclaimed, all 37 paragraphs at 100%**,
and the residue-exhaustion claim is corroborated independently (9-token and
8-token heading gaps).

- **S-1**: the splitting rate is bought mainly with semicolons — Butler's 34
  become 14, so **20 of the 36 added sentences move no clause and cost no
  retention**, which is exactly what D17 cannot see. Three paragraphs named
  (P009, P017, P021). Not a rebuild.
- **The four rulings.** `sea shore` → **`seashore`** (and `hyphen_drift()`
  **should** be extended to the closed/open axis) — and the ruling costs
  **three** successors, not one: Books **2, 3 and 4** all print the open form,
  which `RESUME.md`, `review-instructions.md` and `PUNCTUATION.md` §4 each
  state as Book 4 alone. The supplied `and` at B05-P012 **upheld**. The
  unbroken `heaven` census **upheld**. `battledore and shuttlecock` →
  `batting it back and forth` **upheld**, with `between them` to reconsider.
  The 62-word sentence at B05-P017 **divide it**.
- **The no-op control shape reaches three further scripts**
  (`verify_source_book4.py`, `book04/review/…`, `book03/review/…`), none of
  them a no-op today, none asserting its mutation. And the drafter's fix is
  **necessary and not sufficient** — the reviewer's own rule had a control that
  changed the text, asserted it, and still did not fire, because the measure was
  blind to deletion.
- **Five compounds** left on a Victorian or third setting under D15
  (`sea water`, `half way`, `river bed`, `mid ocean`, `sweet smelling`), three
  of them absent from `continuity.md`'s table.

## Next, in order

1. **Book 5 step 5**: apply the findings at `candidate-v2.json` via a change
   script in the established pattern, then steps 6–8.
2. **Book 6** after that, in numerical order. Verify its source by a rule that
   differs from the **six** now used (Book 2 drafter: PG's footnote-entry list,
   positionally. Book 3 drafter: the `BOOK III`/`BOOK IV` headings, bytes,
   apparatus-in diff. Book 3 reviewer: anchorless and digit-blind, one
   contiguous token block. Book 4 drafter: occurrence-unique needles and a
   derived region. Book 4 reviewer: global per-paragraph fingerprint alignment.
   Book 5 drafter: identification by residue). **Audit the rule before trusting
   it**, then diff word for word; byte-identity to a re-run of your own build
   script is not verification.
3. **Report the splitting rate beside the retention figure** (**D17**). It is a
   floor to clear, not a target, and it convicts on sentence division only.
4. **Open, for Book 5's reviewer**: whether `sea shore` should be the closed
   `seashore` under **D15**. Accepted Book 4 asserts the open form, so a ruling
   for `seashore` means a Book 4 successor. The package's own `hyphen_drift()`
   check is blind to *closed against open* and would never have raised it.
5. Book 10's disposition still needs a coordinator decision — see
   `00-progress-ledger.md`, A2.

## Hard rules

Content-only, under `books/staged-replacements/odyssey/` alone. Zero Anthropic
API spend. English only. Nothing merged, deployed, registered, and the served
`app/public/data/editions/**` is never written.
