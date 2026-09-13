# The Odyssey modern-English — progress ledger

Branch `claude/odyssey-modern-en-20260911`. Content agent for the Odyssey
thread; the coordinator reads this file, Anders does not read the session.
Kept current at every push.

## Done

- 2026-09-13 — **Book 9's round 1 is done and the package's own retention
  figure was wrong in four places.** `book09/review/findings-v1.md`: 7
  substantive, 9 minor, 8 records, 3 optional, all 44 paragraphs ruled
  exactly once. Recomputed independently of `scripts/`: eleven of the twelve
  published figures reproduce; **retention does not** — 0.92164 in
  `README.md`, `continuity.md`, `RESUME.md` and this table against 0.92181
  in `checks-v1.md` and `manifest.json`, a difference of exactly one matched
  token, i.e. the prose was computed over a pre-freeze candidate. The
  drafter's docstring publishes a third value. **Clause (b3) covers the
  manifest and nothing covers the prose**, which is how it survived.
  Substantively: `41 kept + 0 added` is false on the colon (two of Butler's
  cashed, two written over his semicolons, compared figure +2.5% against
  +1.7% on strict identity); the D4 paragraph is wrong at both ends (P001
  opens with the poet's frame, P044 closes nothing, and the speech closes at
  the end of chapter **12**); six rendering collisions survived arrow B's
  rarity gate; and `prove_manifest.py` was **defeated a third time** — no
  clause pins `source-bookN.json` (A11).

- 2026-09-13 — **The Books 1-6 collision backlog is cleared: 221 rows with no
  disposition, now zero, by a worker that did not build the instrument.**
  Ruling them found a defect in the INSTRUMENT before it found one in any
  Book. `kept` dismissed a row from the KEEPER's side and there was no class to
  dismiss it from the MOVER's side, so every row where one Book modernized a
  word another Book could keep stayed open forever in whichever Book had done
  the modernizing — **104 of 214 such rows fall to that one missing mirror,
  `kept-elsewhere`**, measured by running the triage with every hand ruling
  switched off. `RULINGS` was also keyed by `(arrow, key)` alone, which cannot
  be right for eight Books because the correct disposition of a row depends on
  which Book you are asking about; `RULINGS_BY_BOOK` fixes it and is consulted
  first, so Books 7 and 8 regenerate byte-identical under the change.
  **110 rows needed a person and 7 were live** — 103 reasoned dismissals for 7
  repairs. Two new dismissal classes, both named so they can be audited:
  `context-rendered` (the two contexts make each rendering wrong in the other's
  place) and `free-variation` (the honest residue, used four times in six
  Books). Six of the seven live rows came from **arrow C**, its fourth
  independent vindication; the seventh came from arrow B across paragraphs and
  is an accidental, not designed, brush with blind spot 6.
  **Two successors, in ONE pass** (`scripts/build_collision_backlog_sweep.py`,
  A5(a) applied): `book01/candidate-v4.json` `6e5ecb0a…` (five repairs) and
  `book04/candidate-v5.json` `3c21549e…` (two). Every accepted candidate, every
  file built FROM, and both `ACCEPTANCE.md` records hashed before and after and
  asserted byte-unchanged; and, the half a sweep usually forgets, every word
  the repairs exist to PROTECT asserted still present. **The third consecutive
  run of this instrument to find something in ACCEPTED work**: B04-P040's
  `holy hecatombs` -> a bare `holy sacrifices`, one sentence from Butler's own
  `sacrifices`, where accepted Books 1 and 3 both pay for the lost scale with
  an adjective and Book 4 did not — the `luscious` shape again. The sharpest
  finding is B04-P017, `forenoon` -> `morning`, which makes Pisistratus say
  that morning will come and that when it has come it will be there. Recorded
  per Book in each `continuity.md`, "The collision backlog, ruled".

- 2026-09-11 — Read the process templates: Meditations package
  (`WORKFLOW.md`, `GLOSSARY.md`, `PROVENANCE.md`, `00-progress-ledger.md`,
  and `book5/` in full) on `claude/meditations-modern-en-20260911-v2`, and
  the Odyssey Book 10 pilot on `claude/wizardly-allen-ra9p0k`.
- 2026-09-11 — `WORKFLOW.md` written: eight steps adapted for prose epic
  (chapter = Book, paragraph-aligned), scope, naming policy, and voice rules.
- 2026-09-11 — Source verified against the actual Project Gutenberg text: the
  served `original-en` is Samuel Butler's 1900 public-domain prose
  translation, PG #1727, 24 chapters, 1,027 paragraphs, byte-identical Book 1
  opening, file ends exactly where PG's translation body ends. Registry
  attribution already correct. Evidence in `PROVENANCE.md` §1.
- 2026-09-11 — Served `modern-en` checked and recorded as the file being
  replaced (`PROVENANCE.md` §2); none of its wording is reused.
- 2026-09-11 — Odyssey Book 10 pilot's real status checked directly: a
  **frozen draft only**, never independently reviewed (`PROVENANCE.md` §3).
- 2026-09-11 — `GLOSSARY.md` written; Book 1 drafted and frozen at
  `candidate-v1.json` (32 paragraphs, 1:1, ratio 0.943), with readable copy,
  `continuity.md`, `provenance.json`, `manifest.json`, `README.md`,
  `review-instructions.md` and 11 review packets. Stopped for independent
  review.
- 2026-09-12 — **Round 1 of independent review came back** on
  `candidate-v1.json` (`book01/review/findings-v1.md`): *Accept after
  corrections* — 1 standing, 3 substantive, 33 minor, 5 optional, 5
  paragraphs with no material issue, coverage complete. The reviewer
  re-verified the source independently by its own reconstruction of PG lines
  376–740, built from PG's numbered footnote-entry list rather than from the
  build's rule: 32 of 32 paragraphs byte-identical, zero diffs.
- 2026-09-12 — **Book 1 accepted** (steps 6–8) at `candidate-v2.json`, sha256
  `f28a13264288079781a8c8c6cf044ae41d288847dc5d7f23378851a44ba7df45`.
  **All 41 findings applied; none declined.** 37 text corrections in 27
  paragraphs, 47 name substitutions, 22 apostrophes normalized; 29 of 32
  paragraphs differ from v1; ratio 0.9425 → 0.9462. Applied by
  `scripts/build_book01_v2.py`, which asserts v1's frozen hash and every
  glossary hazard before and after. `book01/changes-v1-to-v2.md`,
  `book01/ACCEPTANCE.md`, and the README's mechanical checks re-run verbatim
  (`OK — … all hazards held, ratio 0.9462`). Continuous flow read of the
  corrected book produced no further change.
- 2026-09-12 — **Standing finding S1 applied package-wide**: the naming
  decision is reversed to the Greek forms, written into `GLOSSARY.md` as a
  closed seven-row table with six enumerated hazards, plus `PUNCTUATION.md`
  (new) for the quotation/apostrophe standard. `WORKFLOW.md`,
  `PROVENANCE.md` §2–3, `book01/continuity.md` and
  `book01/review-instructions.md` updated to match. The frozen v1 artefacts
  and the review packets are **deliberately not regenerated**.
- 2026-09-12 — **Book 2 source re-verified independently** (step 1, re-done
  from scratch rather than inherited): `scripts/verify_source_book2.py`
  reconstructs Book 2 from raw PG #1727 by a rule devised for this Book and
  audited against the raw lines before being trusted, then diffs against the
  staged original — **35 of 35 paragraphs byte-identical, zero diffs, 4,184
  words compared word-for-word**. The rule uses the footnote-marker property
  **positionally**: the body holds exactly 187 digit runs and, read in order,
  they are 1…187, against 186 PG footnote entries numbered to 187 with only 29
  absent (Book III) — so the k-th run removed must *be* the k-th marker, and a
  stray body digit breaks the arithmetic instead of vanishing. Two audit
  catches recorded: `FOOTNOTES:` occurs twice in the file and anchoring on the
  first (the table of contents) would have made the relation vacuously true;
  and Book 2's markers are never preceded by a space, so the whitespace clause
  is a no-op here. Two negative controls prove the check can fail (35/35 differ
  if lines are joined with a space; 5/35 differ if markers are left in).
- 2026-09-12 — **Book 2 drafted and frozen** (steps 2–3):
  `book02/candidate-v1.json`, sha256
  `2b5a0280719312bbabb214f0bcbf400cde62541ab7e9c892ce2c2b65bb4273ea`,
  **35 paragraphs**, 1:1 with the source, word ratio **0.9993** (min 0.951 at
  B02-P005, max 1.059 at B02-P003). First Book drafted under the Greek-forms
  decision from the start: Odysseus 17, Athena 8, Zeus 6, Eurycleia 2, each
  matching the source's count exactly; `Ops` untouched. Butler's unclosed
  quotation preserved at B02-P006 → B02-P007 (D4), with the *inner* single
  quotation correctly closed. Zero ASCII quotes. One gloss (the Erinyes), one
  base-text decision (Butler's `[do not]` bracket — mark dropped, words kept),
  two flagged Butler spellings (`Ilius`, `Mycene`). `continuity.md`,
  `provenance.json`, `manifest.json`, `README.md` with passing mechanical
  checks, `review-instructions.md` and **12 review packets** (11×3 + 1×2)
  built by `scripts/build_book_package.py 2`. **Stopped for independent
  review** (step 4). Book 2 was not self-reviewed and Book 3 was not started.
- 2026-09-12 — `scripts/build_book_package.py` gained two things Book 2 needed:
  it maps the **candidate's chapter title** through the closed name table (the
  served `modern-en` does the same), and it **refuses to rebuild a frozen
  Book** without `--force` — Book 1 predates the title mapping and would have
  changed silently if rebuilt.

- 2026-09-12 — **Round 1 of independent review came back on Book 2**
  (`book02/review/findings-v1.md`): *Accept after corrections* — **0
  substantive**, 16 minor (14 paragraph-level + 2 records), 11 optional,
  19 paragraphs with no material issue, coverage complete. The reviewer
  re-verified the source by a reconstruction of a *different kind* from the
  drafter's — it identifies nothing in advance, diffs with PG's apparatus
  still in, and classifies every difference before removing anything:
  35 of 35 paragraphs byte-identical, 4,184 words, zero diffs. It also
  introduced a **retention measure** (Butler word-tokens carried over
  unchanged and in order) that replaces the two weak counter-checks Book 2's
  `continuity.md` offered against its near-1.0 word ratio.
- 2026-09-12 — **Finding 11.1 applied to accepted Book 1** as
  `book01/candidate-v3.json`, sha256
  `c97e20f5b929d0e02b4cd1a3cd0ce8dceec86f71c935371360ab3bd14807b57c` — one
  substitution at B01-P019, `a beloved daughter deserves` → `a beloved
  daughter may expect`. A **recorded successor**, not an edit: `candidate-v2.json`
  and `ACCEPTANCE.md` are byte-unchanged, and the change is documented in
  `book01/changes-v2-to-v3.md` with pointers from Book 1's `README.md`,
  `provenance.json` and `manifest.json`. Built by
  `scripts/build_book01_v3.py`, which asserts v2's accepted hash first and
  re-asserts every hazard and punctuation standard after. The objection had
  been deferred twice; it is now settled in both Books at once.
- 2026-09-12 — **Book 2 accepted** (steps 6–8) at `candidate-v2.json`, sha256
  `71816de3e761932c43a5bc3d5699e5dd2cb8811d0024b1048ca17e76b3445126`.
  **Every paragraph-level finding applied — 14 minor and 8 optional — none
  declined**; all four records findings answered outside the text. 23
  substitutions in 15 of 35 paragraphs; ratio 0.9993 → 1.0002; **Butler token
  retention 0.889 → 0.902**, which is the direction a correction round should
  move, since 19 of the 23 put a word of Butler's back. Applied by
  `scripts/build_book02_v2.py`, which asserts v1's frozen hash, every hazard,
  and that none of the six "also noted" readings the reviewer *declined* to
  raise has been changed. `book02/changes-v1-to-v2.md` (with a recorded reason
  for every optional finding, and the reviewer's optional-count discrepancy
  recorded rather than reconciled), `book02/ACCEPTANCE.md`, `continuity.md`
  amended at R1–R4, README's mechanical checks extended and re-run verbatim
  (`ratio 1.0002`, `retention 0.902`). Continuous flow read produced no further
  change.
- 2026-09-12 — **Two package-wide rules settled before Book 3**, both from
  Book 2's round 1: **D12**, Butler's square brackets disposed of by class
  (A supplied-and-flagged, B unflagged explanatory, C editorial doubt —
  the last **open** and blocking Book 4), with all fifteen brackets in the
  poem enumerated in `GLOSSARY.md` from this package's own pass over PG
  #1727's body; and **D13**, `Mycene` split by referent — the woman keeps
  Butler's spelling, the city becomes `Mycenae` under D8.

- 2026-09-12 — **Book 3 source verified independently** (step 1, re-done from
  scratch), and **it found a defect in the served original**.
  `scripts/verify_source_book3.py` uses the Book 2 *reviewer's* kind of rule
  rather than the Book 2 drafter's: it identifies nothing in advance, anchors
  structurally on `BOOK III`/`BOOK IV` (never on `FOOTNOTES:`, which occurs
  twice — line 75 indented in the table of contents, line 10843 the real
  section, both asserted), cuts paragraphs mechanically so the count of 38 is
  an *output*, diffs **with PG's apparatus still in**, and classifies every
  difference before removing anything. **14 differences in 11 paragraphs: 12
  footnote markers, one Book-opening capitalization — and one paragraph the
  base text does not contain.** After removing only the markers, 36 of 38
  paragraphs are byte-identical and 4,690 words match word-for-word over
  B03-P001…P037. Two negative controls fail as they should.
- 2026-09-12 — **The defect: the served `original-en`'s Book 3 ¶38 is not
  Butler.** PG's Book III ends on a bare half-sentence completed by PG's Book
  IV; the served file finishes it with **196 words taken verbatim from the
  served `odyssey-modern-en.json`'s own ¶38**, which **duplicates the served
  ¶37**. `scripts/scan_staged_original_vs_pg.py` then scanned all 24 Books
  (1,027 paragraphs, 117,228 words): **paragraph counts match everywhere and
  this is the only text-level difference in the whole file.** Also recorded
  there, because it will bite a later Book's verifier: PG separates some
  footnote markers from the preceding word with a **space** in Books 1, 4, 5,
  8, 15, 17, 21 and 22, so a glued-only strip rule leaves part of the marker
  behind — Books 2 and 3 have none, and both scripts assert it. `PROVENANCE.md`
  §4. **Nothing here modifies the served file.**

- 2026-09-12 — **Book 3 drafted and frozen** (steps 2–3):
  `book03/candidate-v1.json`, sha256
  `2f2cf21583e9de6f9da86565e9c3888f3380e574bb4a93cbd0b055535162aefa`,
  **38 paragraphs**, 1:1 with the source. Word ratio **0.9561**, or **0.9959**
  excluding B03-P038 — the figure to read, since that paragraph's 208 source
  words are only 12 Butler's. **Butler token retention 0.895** on the Book 2
  reviewer's measure (Book 1 v3 is 0.728, Book 2 v2 is 0.902 — Book 1's figure
  corrected at records finding R2 of Book 4's round 1); Book 3 sits with
  Book 2, and for the same reason — it is mostly Nestor talking, in plain
  argument Butler had already written in modern English. Names: Odysseus 7,
  Athena 18, Zeus 8, Poseidon 6, each matching the source exactly; `Apollo`,
  `Hades` and `Amphitrite` left alone as already Greek, the table being closed
  at seven. **D13's first application** — Butler's `Mycene` at B03-P024 is the
  city and becomes `Mycenae`. **D12's first class-B bracket** — `[on the
  embers]` at B03-P001, mark dropped, words kept, flagged by class. **D4
  applies seven times**, the package's largest use: Nestor's two long speeches
  run across paragraph breaks and the candidate's unbalanced paragraphs are the
  same seven as the source, with the quotation totals matching at 42/35.
  `Diomed` flagged, not corrected (the Cast is silent). No gloss; "the
  Trito-born" and "aegis-bearing" deliberately unglossed, each recorded as a
  decision. `continuity.md`, `provenance.json`, `manifest.json`, `README.md`
  with passing mechanical checks, `review-instructions.md` and **13 review
  packets** (12×3 + 1×2) built by `scripts/build_book_package.py 3`.
  **Stopped for independent review** (step 4). Book 3 was not self-reviewed and
  Book 4 was not started.
- 2026-09-12 — **B03-P038 is drafted as Butler's half-sentence and nothing
  else**, against a served paragraph of 208 words. Reasons, alternatives and
  cost are in `book03/continuity.md`; the cost is that split-pane view shows
  208 words against 12, and it will look like a bug. **Put to the reviewer and
  the coordinator**, with the recommended long-term fix stated and not taken:
  repair the served `original-en`, which this package never overwrites.


- 2026-09-12 — **Book 5 accepted** (steps 5–8) at `book05/candidate-v2.json`,
  sha256 `acbfcb03f15e8244dc46ec7f29d14d48da9179443191016525636d30b51479e9`.
  Round 1: 1 substantive, 14 minor, 18 optional, 8 records; every minor applied,
  five optional declined and asserted unchanged; one flow-read change.
  Retention 0.94211 → **0.93808**, sentences 153 → 189 (+23.5%), sixty-word
  9 → **1**, semicolons 34 → **13**. S-1 answered by three real recasts (P009,
  P017, P021) and three reversals (P020, P021, P027).
- 2026-09-12 — **Ruling 1 (`seashore`) reopened three accepted Books.**
  `book02/candidate-v4.json` `3aa8c4f2…428773fc`, `book03/candidate-v3.json`
  `a79bacf6…8554ce1e`, `book04/candidate-v3.json` `6926b9f9…f8304534`, built by
  `scripts/build_seashore_successors.py`; every accepted candidate and
  `ACCEPTANCE.md` byte-unchanged. `hyphen_drift()` extended to the closed/open
  axis as `scripts/compound_drift.py`, which also surfaced `low-lying` and
  `well-disposed` — two drifts in the class the ORIGINAL check could already
  see, and never did, because it was written at Book 3 and never run again.
- 2026-09-12 — **D18** (the two-clause control rule, `scripts/controls.py`,
  applied to every verification script in the package) and **D19** (the
  semicolon count reported beside retention and the splitting rate).
- 2026-09-12 — **Book 6 drafted and frozen** at `book06/candidate-v1.json`,
  sha256 `9391ca16778a8225c1710b24296c51a2d3ba33f26ed3ac9fcf7c677c3c0413f0`:
  26 paragraphs, ratio 0.99913, retention **0.93669**, sentences 116 → 148
  (+27.6%), sixty-word 7 → **1**, semicolons 27 → **4**, 9 packets. Source
  verified by an **eighth** kind of rule — a resemblance profile of the whole
  PG file by suffix automaton, which asks not *is the chapter here?* but *is
  there anywhere else it could have come from?* and **reports** the second-best
  match (37 tokens, Athena's beautification of Odysseus, which recurs at Book
  23) rather than bounding it. Its span starts at PG token 28997, the same
  number the Book 5 residue rule read out independently. **The audit failed the
  rule as first written**, as the last three did.
- 2026-09-12 — **`compound_drift()` extended a second time, to the closed-word
  axis**, and it cost a **fourth** successor: `book02/candidate-v5.json`
  `4f9c336e…41761957` (`water side` → `waterside`). `water-side` occurs nowhere
  in PG, so the hyphen-keyed version could not see the pair — blind spot 1 of
  Book 5's round 1. **The first successor in the package found by a check
  rather than by a reader.**

- 2026-09-13 — **Book 7 round 1 applied and Book 7 ACCEPTED** at
  `candidate-v2.json` `e79eb82b…`. 29 substitutions in 16 of 29 paragraphs,
  every finding answered either way (**D11**), three declined with reasons and
  asserted still present. **S-1's figure was EARNED rather than declared**:
  NORM RATE on Butler's own pointing +3.0% → **+7.5%**, semicolons 14 → 7 with
  additions 6 → 2. Flow read found one defect **this round's own correction had
  created** — M-2's literal repair collapses Butler's `home` and `abode` five
  words apart in one clause at B07-P020.
- 2026-09-13 — **Three findings of Book 7's round 1 pushed back on, with
  reasons, and all three recorded in `book07/ACCEPTANCE.md`.** (a) The "fifth of
  seven" ranking compares bases (R-1's disease); on like against like v1 was
  third. (b) **O-7's proposed repair repairs nothing** — it offers `lone
  traveler` to avoid a merge and the candidate already writes `solitary
  traveler`; the merge is untouched either way. (c) **M-7's prose says four
  periods and its own table rules three**, and three plus five is the eight
  S-1 establishes; the table governs.
- 2026-09-13 — **The three infrastructure repairs shipped** (**D22**, **D23**,
  **R-4**), with `scripts/prove_manifest.py` planting each defect and asserting
  the rejection. **`--all` evaluating the gates for the first time immediately
  found a mixed basis in the gate table itself** (`LEGACY_GROWTH[4]` held the
  successor's figure, not the accepted file's).
- 2026-09-13 — **R-2 answered as D24**: all 72 arrow-A/B rows touching Book 7
  plus 11 arrow-C rows, and 93 rows touching Book 8, each with a written
  disposition, generated not typed. Four upheld rows are `kept` — which is WHY
  they are upheld: Book 7 kept Butler's word and another Book moved. `luscious`
  records **accepted Book 5 as the one out of step**, not repaired. `issue` is
  reclassified `homograph`.
- 2026-09-13 — **ARROW C added (D25)**, and it found four repairs round 1 did
  not: `fashioned expressly` → `made` at B07-P010 (a god's craft flattened onto
  the women's weaving), `bid` → `tell` at B07-P015, `bade` → `told` at B07-P022
  (flattening the exact distinction the sentence poses), and a doubled `never`
  at B07-P011. It also found `abode` → `house` in **accepted Book 3**.
- 2026-09-13 — **A5 and A6 done in ONE pass** (`scripts/build_compound_sweep.py`)
  — `book05/candidate-v3.json`, `book06/candidate-v3.json`,
  `book02/candidate-v6.json` — with every accepted candidate and acceptance
  record hashed before and after and asserted byte-unchanged. **R-6 confirmed:
  two successors, not one.** `store-room` was found by the new register while
  the build was being written and folded into the same successor, so it cost
  nothing extra.
- 2026-09-13 — **Book 8 drafted and FROZEN** at `candidate-v1.json`
  `e758790c…`, 50 paragraphs, 17 packets. **Semicolons 42 → 0 with none added**
  — the largest conversion in the package and worth exactly zero on the
  compared figure, which is the clearest demonstration D20 has produced. Source
  verified by a **twelfth** kind of rule whose own audit failed it twice and
  whose repair found **three divergences of the served file from PG that nobody
  had recorded**. Six collisions repaired **before** the freeze, four of them
  Butler's own discriminations. `GLOSSARY.md` gains one row, `Mars` → `Ares`;
  `Hercules` → `Heracles` is flagged to the reviewer rather than added.
- **2026-09-13 — Book 8 round 1 delivered**, `book08/review/findings-v1.md`.
  **Accept after corrections**: 3 substantive, 8 minor, 7 optional, 5 records,
  all 50 paragraphs covered. Every published figure recomputed and reproduced.
  **S-1**: the +27.1% is 85% cashed pointing — 44 of 52 new boundaries are
  marks Butler already wrote, 8 divide his prose; blind spot 5 written as
  `book08/review/mark_census.py`; D20 should price `:` and `—` as it prices
  `;`. **S-2**: six semicolons should survive, and B08-P047's em dash (the
  simile's correlative frame) is the worst break in the Book. **S-3**:
  `--manifests` is defeated by one field edit and `prove_manifest.py` never
  tests that path. Source verified by a **thirteenth** rule whose audit failed
  it **five** times.

## Decided, and why

| # | Decision | Why |
|---|---|---|
| ~~D1~~ | ~~Keep Butler's own Roman name forms.~~ **REVERSED 2026-09-12 — see D5.** | Correct on the drafting brief ("use whatever the served original uses") and correctly applied in `candidate-v1.json` — the reviewer's name census found not one name moved off Butler's form. Overruled by the coordinator on product evidence, not translation evidence. Left on the record rather than deleted. |
| D2 | Odyssey Book 10 pilot is recorded as a frozen, unreviewed draft, not as "accepted" text ready to adopt. | Its own `README.md` and the branch's commit history say plainly that no independent review was run and no acceptance recorded. See `PROVENANCE.md` §3. |
| D3 | "Hecatomb" is folded into a plain description rather than kept as a glossed loanword — **and the description supplies no number.** | Book 1 uses the term once and nothing later depends on recognizing it again; a plain description meets the accessibility standard without adding a term that needs its own gloss. *(Amended 2026-09-12, optional finding 3.1: v1's "an offering of a hundred sheep and oxen" stated a quantity Butler declines to state, and by Homer's period *hecatomb* no longer meant a hundred of anything. Now "a great sacrifice of sheep and oxen". Later Books' hecatombs inherit this form.)* |
| D4 | Butler's paragraph-internal quotation convention (closing mark omitted where a speech runs on into the next paragraph) is preserved exactly, not "corrected." | It is Butler's own printing convention for one continuous speech split by a paragraph break (B01-P018 → B01-P019). Confirmed by the round-1 reviewer. Silently closing the quote would tell the reader the speaker stopped and started again. See `PUNCTUATION.md` §2. |
| **D5** | **The modern edition uses the Greek name forms** (Odysseus, Athena, Zeus, Poseidon, Hermes, Cronus, Artemis), applied by script from the **closed** table in `GLOSSARY.md`, with every hazard asserted by the build. Butler's forms stay in `original-en`. | Coordinator ruling at Book 1 round 1 (standing finding **S1**), answering **A1**. The evidence is the product's: `odyssey-threads.json` (the Cast beside the text) uses Odysseus 319 / Athena 21 / Zeus 24 / Poseidon 19 / Hermes 12, with every Roman form in it inside a `searchNames` alias array; the Book Onboarding uses Odysseus 21 times. A reader who meets "Odysseus" in the onboarding, taps a highlighted "Odysseus" in the Cast and then reads "Ulysses" has been handed two names for one man by the same product on the same screen. |
| **D6** | **The mapping table is closed and enumerated, never generated from a general Roman→Greek deity list, and is applied case-sensitively and word-bounded.** | The hazard that actually fires is **`Ops`** — Butler's name for Eurycleia's grandfather, a man, already Greek, and *also* the Roman name of Rhea. Any general list carries `Ops → Rhea` and would put a goddess into a genealogy. Case-insensitivity destroys the island `Same`. Six hazards enumerated in `GLOSSARY.md`; all six asserted by `scripts/build_book01_v2.py` before and after the pass. |
| **D7** | **Possessive of a name ending in -s: `Odysseus's`.** Decided once for every Book. | Matches the candidate's own `Telemachus's`, `Phemius's`, `Agamemnon's`, and is what an English reader says aloud. Butler's bare `Ulysses’` is not carried over. Asserted: three `Odysseus’s`, no bare `Odysseus’`. |
| **D8** | **Where the Cast (`odyssey-threads.json`) has a display name for a figure, the Cast's spelling wins.** Butler's *Euryclea* → **Eurycleia**. | It removes the last name on which the edition and the Cast disagreed, and the Cast keeps "Euryclea" as a `searchNames` alias so highlighting works either way. Deliberately narrow: the rule is *the Cast's display name*, not the drafter's judgement of what looks Greek enough. Other unusual Butler spellings are still flagged in `continuity.md`, not corrected. |
| **D9** | **Typographic quotation marks and apostrophes throughout; American spelling.** | `PUNCTUATION.md` §1 and `GLOSSARY.md`. v1 mixed curly doubles with ASCII apostrophes and recorded neither; the served `original-en` beside it in split-pane is typographic throughout. American spelling matches the served editions and the rest of the product. `draughts` stays — the game's name, not a spelling variant. |
| **D10** | **A frozen `candidate-vN.json`, its readable copy and its review packets are never regenerated after a later version supersedes them.** | They are the record of what a review round actually reviewed. Regenerating them would make the findings file quote text that no longer exists. Recorded in `book01/manifest.json` and `book01/continuity.md`; Book 1's v1 artefacts stay in Butler's Roman forms for exactly this reason. |
| **D11** | **A finding is answered either way, and an "optional" finding whose real subject is a rule for later Books is settled at the Book that raises it, not deferred.** | Applied at Book 1 to 3.1 (hecatomb, a rule for every later hecatomb) and 26.1 (the "in her heart" formula, which recurs through the poem). The alternative — carry it forward as a preference — means the same question is rediscovered at Book 6 with a rendering already in the file. All five of Book 1's optional findings were applied on this reading. |
| **D12** | **Butler's square brackets are disposed of BY CLASS, and the class is decided by whose voice the bracket is in and what it is about — never by its length.** **Class A**, a supplement Butler makes because the Greek lacks the words and says in a note that he *supplied* them (PG 802, `[do not]`, footnote 18 — the poem's only instance): **the mark is dropped, the words stand**, and the pointing the bracket carried is supplied in ordinary modern punctuation. **Class B**, an unflagged explanatory supplement inside the line (eight instances, of which Book 3's `[on the embers]` at PG 1129 is the first): **the same disposition, on a weaker warrant, so every instance is recorded AND flagged as class B in the Book's `continuity.md`.** **Class C**, a passage set off by a bracket whose note argues about **when and by whom it was composed** (six instances, the first at **PG 1552** in Book 4, footnote 36): **SETTLED 2026-09-12 at Book 3's round 1 — the mark is dropped, every word stands, nothing is recast across the bracket's boundaries, and every instance is recorded, with Butler's note and with who bracketed it. The same disposition as A and B, on a third warrant, with obligations the other classes do not carry: never abridge, merge or compress a class-C passage (PG 4260 and PG 4884 are the same prophecy twice, which is fn 91's whole point); where the bracket is unclosed, record that and do not determine the extent; if the product ever gains a note layer, class C becomes a note. Book 4 is UNBLOCKED.** Enumeration, tests, the six instances and the four corrections are in `GLOSSARY.md`. | Ruling 1 of Book 2's round-1 review, plus records finding **R4**. The Book 2 disposition was right and its recorded *reason* was wrong: `continuity.md` classed `[do not]` as a textual mark "rather than a translator's supplement", and Butler's footnote 18 says in terms that it *is* a translator's supplement — *"without prefixing the necessary 'do not,' which I have supplied."* That makes the disposition **stronger**, since Butler himself calls the words necessary. But a one-line rule generalized from it is dangerous: for class C, "drop the mark, keep the words" **silently converts Butler's recorded editorial doubt into narration**, and the damage is invisible in the output, so a drafter cannot be expected to catch it. Written by class for the same reason the Meditations package needed **D11** and **D13**: one bracket character does at least three jobs, and the natural mistake is the damaging one. **Class C settled at Book 3's round 1 (ruling 2), on four facts checked against PG #1727 rather than on a default:** Butler's footnote 81 says *"lines enclosed in brackets are almost always genuine; all that brackets mean is that the bracketed passage puzzled some early editor"* — so there is no verdict of spuriousness to preserve; footnotes 36, 82, 91 and 107 claim **authorship history**, not doubt (107: the passage was *"written by the same hand as the rest of the poem"*), and footnote 122 shows the Book 13 brackets are **not Butler's** and that he argues against them; our edition carries **no apparatus**, so a bare bracket cannot transmit a claim that lives only in footnotes we will never print; and **four of the six class-C brackets are never closed** (PG's body holds 15 `[` against 11 `]`; PG 1552, 4260, 5691 and 6016 do not close), so keeping the mark means either a stray unclosed character on the first paragraph of Book 4 or the drafter inventing the passage's extent. **Four corrections to D12 as written** (records finding **R3**): class C is not recorded doubt that the passage belongs; **five** of six instances are footnoted about the bracket, not three; PG 6016's brackets are not Butler's; and the first opens at **PG 1552**, not 1551. The bracket-count imbalance is records finding **R4**. |
| **D13** | **`Mycene` is two names in Butler and is split by referent: the WOMAN stays `Mycene`, the CITY becomes `Mycenae`.** Butler spells both `Mycene` — the woman at PG 843 (Book 2, in a list of women), the city at PG 1377 (Book 3) and PG 9326 (Book 21). The city moves under **D8**; the woman does not, because D8 is silent about her. | Records finding **R1** of Book 2's round-1 review, settled before Book 3 is drafted rather than after, per `WORKFLOW.md` step 2. The glossary row as written said "Mycene is the woman, not the city" and filed her under *names that change in no Book*; Book 3's drafter meets the **city** four hundred PG lines later holding that row. D8 applies exactly as written and only to the city: `odyssey-threads.json` gives Agamemnon the epithet **"Murdered King of Mycenae"** — its only occurrence of either spelling — so the Cast has a display name for the place and none for the woman. Confirmed independently: the served `modern-en` being replaced already draws this exact line (`Mycene` at its Book 2 ¶7, `Mycenae` at Book 3 ¶24 and Book 21 ¶6), without recording it. Deliberately narrow, and it sits beside the opposite ruling on `Ilius`, which is **not** flattened to *Troy* because the Cast has no display name for it. |
| **D5 (widened 2026-09-13)** | **Any figure Butler names in a ROMAN form takes the Greek one**, not only the Olympians. First applied at B08-P016: `Hercules` → `Heracles`. | Book 8's round 1, **O-1**. The determining fact is on the page: the candidate's B08-P016 already reads `Ares`, `Aphrodite` and `Hephaestus` within a few hundred words, and the sentence itself continues *"…such as Heracles, or **Eurytus the Oechalian**"* — a Greek name in the same list, in apposition. `Hercules` beside `Eurytus` is not a rule observed, it is a visible inconsistency, and D8 is silent only because the Cast has no entry for him, which is an absence of evidence. The list Books 11 and 12 will force is nameable now — **Proserpine → Persephone, Pluto → Hades, Bacchus → Dionysus, Aurora → Eos**, and Aeolus, Tiresias, Castor and Pollux, Cerberus, Charybdis, Scylla. Widening now means Book 11 inherits a rule instead of re-arguing it. |
| **D16 clause (b) (2026-09-13)** | **A WORD is supplied to Butler's text only where his text is defective and only from Butler's own parallel, and every instance is tabulated in the Book's `continuity.md` §5 with the parallel named.** D16 as written governs MARKS. | Book 8's round 1, **M-3**. Three words were supplied to Butler's text in Book 8 and none was recorded, because no rule covered them. On this clause two pass and one fails, which is the right outcome in all three: **B08-P045**'s `enough` is drawn from Butler's own identical formula eleven paragraphs earlier (B08-P006) and **B08-P008**'s `There were` from his own next clause, while **B08-P042**'s `hardly` has no parallel and **inverts the sense** — Butler says Odysseus *had finished* the knot before he was called, `hardly … before` says he had barely finished. `hardly` is removed in `book08/candidate-v2.json`; the other two stand and are tabulated. Books 9–24 will meet more: PG #1727 has at least two more verbless list-fragments of the B08-P008 kind. |
| **D14** | **Where the served `original-en` is demonstrably not the base text, the candidate renders the BASE TEXT, never the served corruption — and the divergence is recorded, the cost stated plainly, and a repair to the served file escalated rather than performed.** The divergence is recorded per paragraph in the Book's `continuity.md` with the evidence; **paragraph alignment is preserved in every case** — the paragraph exists and is non-empty, because audio, Cast data and saved reading positions key on the paragraph index. **Written for the class, not for the paragraph.** First and so far only application: **B03-P038**, where 196 of the served paragraph's 208 words are the served `modern-en`'s own ¶38, spliced in to complete a half-sentence Butler leaves open at the end of his Book III. The candidate prints Butler's twelve words: `Now when the sun had set and darkness lay over the land,`. The repair text and the before/after hashes are in `book03/ACCEPTANCE.md` and in **A3**, so repairing the served file is a one-line patch rather than a research task. | Ruling 1 of Book 3's round-1 review, settled 2026-09-12. **The decisive argument is about the repair, not about the duplication:** A3 recommends repairing `odyssey-original-en.json` so ¶38 is Butler's clause alone, and that repair will very likely happen. If the modern edition had meanwhile rendered the splice, then on the day of the repair the modern column's ¶38 becomes 200 words with **no source at all** — a paragraph of the *replaced* file's prose aligned against twelve words of Butler, permanently, with nobody left who remembers why. Rendering the base text is correct both before and after the repair. Borrowing Book IV's opening words to complete the sentence was rejected for a second reason worth keeping: it would invent a Book-boundary policy for a 24-Book edition on the strength of one paragraph, and this is not the only place Butler runs a sentence across the join — his Book III opens the same way, on a lower-case `but`. The cost is real and not minimized: 208 words against 12 in split view will be read as a bug, and it **is** a bug, in the other file. A class-level row rather than a note on one paragraph because `scripts/scan_staged_original_vs_pg.py` shows no second instance in *this* file but does not cover the library's other books, and a drafter meeting a similar splice without a rule will do the natural thing — modernize what is in front of them — and will be right to, absent a rule. |
| **D15** | **Compound spelling follows the modern standard form of the compound, in whichever direction that moves Butler's Victorian setting — closed, hyphenated or open. The change is typographic and silent. The test for whether it is typographic at all: *does it alter what a reader would say aloud?* If it does, or if it renames the object, it is a rendering decision and is recorded in the Book's `continuity.md`.** Written out with Book 4's twelve instances in `PUNCTUATION.md` §4. | Records finding **R4** of Book 4's round 1. The package had been running on a single precedent (`sweet meats` → `sweetmeats`, accepted at Book 3, upheld at Book 4 as normalization). One Book then moved compounds in **three directions at once** — four closed, three hyphenated, four opened, three of them recorded decisions and the rest silent — and two of the opened ones landed on a form that is **neither Butler's nor modern English's** (`sea side`, corrected to `seaside`; `drink offering`, which is in fact the standard open form and is kept, recorded). This is the class that already cost the package a whole successor version at Book 2 (`mixing bowl` → `mixing-bowl`, finding 27.1), and it is invisible to every check except the cross-Book `hyphen_drift()` scan, which only fires once a *second* accepted Book disagrees. A rule, written down, is cheaper than a third discovery. |
| **D16** | **One rule for Butler's punctuation slips: a Victorian mark is REPAIRED when a modern reader reads it as an error, and KEPT when it is merely old-fashioned but correct.** `PUNCTUATION.md` §5, with Book 4's three instances: B04-P040's double opening mark repaired (it names the wrong speaker), B04-P046's lower-case opening after a question mark repaired, B04-P039's dated-but-correct terminal question mark kept. | Round 1 of Book 4, section E. The draft had repaired one of the three and kept another without ruling, and the reviewer's point was not about which disposition is right but that **one class had two dispositions**. Under **D4** this Book's opening quotation marks are load-bearing across twenty-one consecutive paragraphs, so a wrong mark is a wrong speaker, not a blemish — which is what separates "repair" from "preserve" and makes the rule decidable rather than a matter of taste. |
| **D17** | **Every Book reports a sentence-splitting rate beside its retention, and the build FAILS if the rate falls below half the weakest accepted Book's or if more than three quarters of the source's sixty-word sentences survive.** Sentences source → candidate as a percentage added, and sixty-word sentences source → candidate as a percentage broken. Implemented in `scripts/build_book04_v2.py`; the splitter is the round-1 reviewer's own, taken verbatim, so the numbers stay comparable across Books. Accepted Books: **+20.5% / 100%** (32 paragraphs), **+16.1% / 43%** (35), **+5.5% / 33%** (**37 of Book 3's 38** — the **D14** splice at B03-P038 excluded; on all 38 it is **−1.1%**, which would make this gate's floor negative), and Book 4 v2 **+8.9% / 82%** (81). **Every rate carries its basis or it is not a rate — records finding R-1 of Book 6's round 1.** The gate now lives in `scripts/checks.py`, is called by `build_book_package.py`, and gates a v1 candidate for the first time. | Substantive finding **S-1** of Book 4's round 1, and the answer to the question Book 4 was sent to review with. Book 4 v1 satisfied **every** mechanical check in the package perfectly — retention to ±0.001, word ratio to ±0.0005, name census, hazard list, formula assertions, the exact list of byte-identical paragraphs — while breaking **one of its source's seventeen** sixty-word sentences and adding **0.4%** to its sentence count, against a source carrying the densest supply of sixty-word periods in the package. Nothing in the checks counted a sentence, so a thorough vocabulary swap with no syntax work at all passed as a modernization. **Two limits are part of the decision, not footnotes to it.** The gate is a floor to clear, not a target: Book 4's flow read reverted a division the gate would have counted (two consecutive sentences opening `But`). And the measure convicts on **sentence division only** — the reviewer's own audit found that chain load predicts splitting in accepted work (ρ = +0.380, n = 98) and does **not** predict clause order (ρ = +0.048), so order retention was refused as grounds for a finding. A draft that divides Butler's sentences and leaves every clause in his order passes the gate, and only a continuous read sees it. |
| **D18** | **A negative control asserts, in two clauses, (a) that its mutation changed the input AND (b) that the check's own verdict changed. Where (b) cannot be made to hold, the blindness is declared by name and a second check is made to carry that class.** Implemented once, as `scripts/controls.py` (`control()` and `declare_blind()`, which requires the name of the check that carries the class). Applied to **every** verification script in the package, not only new ones: `scripts/verify_source_book2.py` (which had none — its controls were prose-described), `verify_source_book3.py`, `verify_source_book4.py`, `verify_source_book5.py`, `book03/review/…`, `book04/review/…`, and `scripts/compound_drift.py`. Written out with the table of scripts in `WORKFLOW.md`. | Records findings **R-1** and **R-2** of Book 5's round 1. Clause (a) is what Book 5's drafter found in its own script: two controls written `paragraph.replace("the", …)`, a no-op on a paragraph that happens not to contain `the`. Round 1 found the same shape in three further scripts (`verify_source_book4.py:234`, `book04/review/…:275`, `book03/review/…:135`) and two unasserted-precondition variants — none a no-op today, none saying so; a control that is sound by luck is not sound. **Clause (b) is the half that survives the fix, and the reviewer demonstrated it rather than asserting it**: its own rule had a control that deleted a twelve-word run, asserted that the text had changed, and still did not fire, because the measure counted only the fraction of chapter-5 tokens that aligned and every surviving token still did. A control that cannot fail and a control whose measure cannot see it are indistinguishable from outside. **The rule caught a third instance while it was being applied**: `book04/review/…`'s one-letter control took the paragraph's longest whitespace token, `understanding.”`, and doubled its last character — a real mutation, invisible to a fingerprint that normalizes punctuation. Clause (a) passed; clause (b) failed; the control was rebuilt on the paragraph's own letter runs. |
| **D19** | **Every Book reports its semicolon count against Butler's, beside the retention and the splitting rate.** Three numbers, not two. Computed by `semicolons()` in `scripts/build_book05_v2.py` and printed in each Book's `checks-vN.md`. Butler → candidate: Book 1 47 → 13 (32 paragraphs), Book 2 36 → 21 (35), Book 3 **39 → 32 on 37 of 38** (on all 38: **41 → 32**), Book 4 68 → 50 (81), **Book 5 34 → 13** (37), **Book 6 27 → 4** (26). Computed by `semicolons()` in `scripts/checks.py` and printed in each Book's `checks-vN.md`. **Superseded in form by D20:** the count is reported, and the number that is compared is the rate it gives. | Substantive finding **S-1** and records finding **R-6** of Book 5's round 1. Book 5 v1 reported the package's highest splitting rate (+23.5%) and its second-highest retention (0.94211), and those two facts had one cause: Butler's 34 semicolons became **12**, so **22 of the 36 added sentences were a semicolon rewritten as a period** — an operation that adds a sentence, moves no clause, drops no word and costs no retention, and therefore scores at full value on **both** of D17's axes while leaving the architecture exactly as Butler built it. That is precisely the blindness D17 declares of itself. The semicolon count is the denominator D17 is missing: it says how much of the added sentence count came from the operation that moves nothing. It is a *report*, not a gate — breaking Butler's semicolons is the correct first move, they are the true seams of his periods, and a Book with few semicolons in its source cannot be convicted for not converting them. |
| **D20** | **DECIDED 2026-09-12 at Book 6's step 6. Three clauses, all implemented in `scripts/checks.py` and reported by every Book from here.** **(a) The splitting rate that is COMPARED is the semicolon-normalized one — NORM RATE.** Add each text's own semicolon count to its own sentence count on **both** sides, so a semicolon and a period score the same and converting one into the other is worth exactly zero. D19's count is still reported; it is the numerator, and this is the division D19 left to the reader. Books 1–5 backfilled: **−3.9%, +4.0%, +1.0% (37 of 38), +2.0%, +8.0%**; Book 5 v1 +7.5%; **Book 6 v1 +6.3%, accepted v2 +7.0%**. The raw D17 rate is still reported and still gates. **(b) MOVE-GAP is reported for every Book** — bag retention minus order retention, so substitution and deletion cancel and only relocation shows, and the retention deficit decomposes with no residue into `substitution+loss` plus MOVE-GAP. Books 1–5: **0.05088, 0.01632, 0.02156, 0.00431, 0.00891**; Book 5 v1 0.00721; **Book 6 v1 0.00925, accepted v2 0.01156**. **It is an UPPER BOUND on clause movement** and must be reported as one: it counts any relocation of a surviving token, phrase-internal ones included, and Book 6's highest paragraph is a dative shift. The lower bound is the **displaced-runs** witness — a run of four or more consecutive Butler tokens, occurring exactly once on each side, surviving verbatim outside the monotone alignment — reported beside it: Books 1–5 give **2, 0, 0, 0, 1**, Book 6 v1 **1** and accepted v2 **2**. **(c) The growth gate aligns sentences instead of comparing paragraph maxima.** Keep **50 words** as the failure; **report from 40**. And report, absolutely, every candidate sentence of 40 words or more with its source paragraph's longest beside it. | Substantive ruling of Book 6's round 1, adopted at step 6 with one correction and one addition. **Clause (a):** D19 gives D17 its denominator and leaves the division to the reader; a rate does it. The count alone let Book 6 report the package's highest splitting rate for a draft whose real division rate is third, and **seventeen of its twenty-six paragraphs gained no boundary a semicolon did not pay for**. Book 6's own flow read then demonstrated the measure: taking one division back to Butler's semicolon moved the raw rate from +28.4% to +27.6% and left NORM RATE at **+7.0% to the decimal**. **Clause (b):** the retention figure cannot do the job Book 6's drafter asked of it. D17 was written about a vocabulary swap that lowers retention and moves nothing, so *retention fell, therefore clauses moved* is invalid however right its conclusion — and Book 6 v1's deficit was **85% vocabulary** (0.05406 substitution against 0.00925 movement). The upper-bound clause is the reviewer's own caveat against its own number and is written into the decision rather than left in a findings file. **Clause (c)** is the correction: D19's gate as built compared each paragraph's **longest** candidate sentence with its source paragraph's **longest**, which is a maximum against a maximum. A draft that divides a paragraph's longest sentence lowers the new maximum and can then grow a *different* sentence past the old one's length with the gate reporting **no growth at all** — division buys cover for growth, and that is a defect the gate cannot see by construction. In Book 6 it cost nothing (14 sentences grew, largest growth 2 words, largest result 40). The absolute report is the addition, and it answers blind spot 2 of round 1 §9, which had **no carrier**: every length check in the package is relative to the source, so a 43-word four-limb chain that Butler also wrote at 43 words passes all of them — which is exactly how B06-P016 reached a review untouched. |


- 2026-09-12 — **R-3 is REFUSED, with evidence, and the function stays.**
  Round 1 reports `consecutive()` in
  `book04/review/verify_source_book4_review.py` as "defined and never called,
  in any file in the package". It **is** called, eleven lines below its
  definition, as the **verdict function of control A** — the **D18** control
  asserting that swapping two paragraphs breaks consecutiveness — and the
  control fires when the script is run (`ok   control A: two paragraphs
  swapped breaks consecutiveness`, line 92 of its output, executed here).
  It is passed by name rather than applied at a call site, which is what a
  grep for `consecutive(` would miss. **Deleting it would have deleted a live
  control**, which is the exact damage the package's standing lesson is about,
  inverted: not an unrun check left in place, but a running check removed as
  dead. The refusal is recorded at the function and here, under **D11**.

- 2026-09-12 — **R-6: what `scripts/checks.py --all` surfaced the first time it
  was run over the accepted Books — and it is the S-2 disease, measured.**
  Two of the gates the package believes it has were **Book 5's assertions about
  Book 5**, written into Books 4's and 5's correction scripts and never run
  anywhere else. Run over Books 1–4 for the first time, they fire:

  - **The growth gate fires eleven times**, in the corrected aligned form:
    Book 1 P005 49→50 and P030 48→52; Book 2 P019 49→50 and P028 57→58; Book 3
    P011 64→66, P013 69→72 and P024 73→74 and 56→58; Book 4 P018 53→54, P028
    54→56 and P076 61→62. Every one is a growth of **1 to 4 words** on a
    sentence Butler already wrote at or near fifty — the exact class Book 5's
    finding **30.2** named and the maximum-against-maximum form could not see.
    Books 5 and 6 are clean, because the gate ran for them.
  - **The per-paragraph length floor fires five times in Book 1**, at 0.862 to
    0.889 — and Book 1's own acceptance record *states the minimum by name*
    ("minimum paragraph ratio 0.8621 at B01-P017, which the round-1 reviewer"
    examined). The floor is a Book 5 number, not a package one.
  - **And one gate was simply wrong.** "No paragraph is byte-identical to
    Butler" is Book 5's assertion; **accepted Book 4 carries seven, on purpose**
    — examined one by one, left because they are plain modern English in the
    source, recorded in `book04/continuity.md` §6 and asserted *exactly* by
    Book 4's own build so a later edit cannot add an eighth.

  **Disposition: nothing is weakened and nothing is exempted.** Book 4's shape
  is adopted for all three — what each Book carries is **enumerated and
  asserted** (`BYTE_IDENTICAL`, `MIN_PARA_RATIO`, `LEGACY_GROWTH` in
  `scripts/checks.py`), each entry with its reason, so a Book can never quietly
  acquire a twelfth instance and **new work gets every gate at full strength**.
  Repairing any of the eleven growths costs a successor to an accepted Book and
  is therefore a coordinator matter, not a drafter's. None is new damage; all of
  it is what an unrun check hides.

- 2026-09-12 — **The fifth successor is built: `book04/candidate-v4.json`,
  sha256 `3b88a4da182eccc7f673e392e125295aef05b584c1cc592d405470d5ee86bf95`**,
  closing **A4**(i). Accepted **B04-P010** rendered Butler's `doubted whether`
  as `was in two minds` — Butler's own other phrase — one paragraph before his
  real `thus in two minds` becomes `still undecided`. Now `he did not know
  whether to let him choose his own time for speaking`. Built by
  `scripts/build_fifth_successor.py` from `candidate-v3.json`, so it carries
  the `seashore` and compound corrections too; `book04/candidate-v2.json` and
  `book04/ACCEPTANCE.md` are asserted **byte-unchanged** across the build.
  **Book 6 was not changed to match the defect** — B06-P012's `he did not know
  what to do` is the better rendering and stands. The build asserts that arrow
  B of `scripts/rendering_collisions.py` no longer reports `minds ← doubted`,
  and that the successor passes every gate.

- 2026-09-12 — **`one_word_two_ways()` in both directions and across Books is
  now a package script**, `scripts/rendering_collisions.py`, adopted from
  `book06/review/` with three changes: it resolves the **newest** accepted file
  of each Book rather than naming one (the review copy named
  `book04/candidate-v3.json` and would have gone on naming it after the fifth
  successor existed); it carries the **mirror** of the reviewer's independence
  control, because one direction of independence is not independence; and it
  **asserts the A4(i) row by name** and prints whether the defect stands,
  instead of leaving it in 124 rows. M-1 and M-2 are closed in the report:
  `grass ← grass | herbage` and `drinks ← drinks | topes` are gone.
  **One limit now visible and declared:** `herbage → greenery | lush greenery`
  still prints, because the diff opcode that carries a substitution carries the
  adjacent modifier with it. It is one rendering with two modifiers, not two
  renderings, and no row of that shape should be read as a collision.

- 2026-09-12 — **Book 6 is ACCEPTED at `candidate-v2.json`**, sha256
  `0e435458f6c30384415559af86b49ee01c402308bd9d36fdfea5462887bde2be`.
  `book06/ACCEPTANCE.md`. Round 1's verdict *accept after corrections* answered
  in full: 14 substitutions in 10 of 26 paragraphs by
  `scripts/build_book06_v2.py`, **every minor finding applied**, 3 declined and
  asserted still present, **2 optional findings settled as rules** with no
  change to the text (**O-3**, the inversion rule; **O-4**, the `conduct`
  family), one flow-read change. Retention **0.93669 → 0.93408**, MOVE-GAP
  **0.00925 → 0.01156**, displaced runs **1 → 2**, NORM RATE **+6.3% → +7.0%**,
  raw rate unchanged at +27.6%, semicolons 27 → 5. **The honest numbers moved
  and the headline did not**, which is the whole of what the round was about.
  The flow read's **F-1** is the package's cleanest demonstration of **D20**:
  putting one of Butler's semicolons back moved the raw rate from +28.4% to
  +27.6% and left NORM RATE at **+7.0% to the decimal**.

- 2026-09-12 — **Book 7 drafted and frozen at `candidate-v1.json`**, sha256
  `bf8cf2f76f4670daab55daf1da265ba7b1839c0cd6680e3c5691fac8d382dc33`. 29
  paragraphs, 3347 → 3365 words, ratio 1.00538. Retention **0.93943**, MOVE-GAP
  **0.01277**, displaced runs 1, sentences **103 → 129 (+25.2% raw)**, **NORM
  RATE +7.5%**, sixty-word **7 → 0 (100% broken)**, semicolons **30 → 14**.
  10 packets; `README.md`, `continuity.md`, `provenance.json`,
  `review-instructions.md` and **`checks-v1.md`** written. **Not
  self-reviewed.**

  **It is the first candidate in the package that anything gated, and the gates
  fired twice while it was being drafted.** (i) The **D20** aligned growth gate
  caught a sentence grown from 51 to 52 words at B07-P021 — a growth the
  maximum-against-maximum form could not have seen, because the paragraph's
  maximum did not move. (ii) B07-P024 came out **byte-identical to Butler**.
  Both repaired rather than declared. Two sixty-word sentences that **passed**
  the D17 survival gate at 7 → 2 were divided anyway, which took the census to
  **7 → 0**.

  **And `scripts/rendering_collisions.py` was run during drafting rather than
  after it**, which is the first time in the package that the collision class
  has been caught before a reviewer had to find it. Seven repaired before the
  freeze: `comely`, `midst`, `councilors`, `converse`, `depart`, Butler's own
  `dwells` flattened into `lives` in a paragraph carrying both, and `filling`
  for his `due replenishing` against accepted B04-P016's own `filling`. Four
  kept and handed to the reviewer as question 2.

- 2026-09-12 — **A TENTH kind of source rule**, `scripts/verify_source_book7.py`
  — **PG #1727 as a published artefact**: the transcriber's hard wrapping,
  measured as **line counts**. Twenty-nine integers locate the chapter and the
  locating clause reads **no character of Butler's at all**, which none of the
  nine earlier rules can say — the ninth destroys every letter but still reads
  his punctuation and his word lengths. The premise (the served file preserves
  PG's line breaks inside its paragraph strings) is asserted as clause 0.
  Signature unique in 1 382 blocks; second-best **reported, not bounded**, at 4
  blocks; verdict is the **pair** (occurrences, last recovered block); and
  clause 4 uses **Butler's footnote numbering as an ordinal index** — the span
  carries 57 … 64, contiguous and ascending, so the apparatus agrees the span is
  one piece. **The audit failed the rule three times**: a block splitter that
  kept stray newlines and made the signature occur **zero** times, *reported as
  a count*; a clause-2 exclusion so narrow that the chapter matched **itself**
  one block along and the rule announced 28 as its second-best; and a control
  whose "re-wrap" changed no line count at all.

| **D21** | **The splitting rate that is COMPARED is NORM RATE computed on BUTLER'S OWN POINTING** — the candidate's semicolons split into those of Butler's it KEEPS and those the draft ADDED where he wrote something weaker, with only the kept ones entering the denominator. D20 clause (a) still stands and is unchanged; this is its missing half. Implemented as `semicolon_provenance()`, `kept_added()` and `norm_rate_butler()` in `scripts/checks.py`, pinned in `PUBLISHED` for every Book, and covered by four `--audit` controls. Books 1–8 on this basis: **−4.5%, +1.2%, −2.0%, +2.0%, +7.5%, +5.6%, +7.5% (v2), +4.3%**; added semicolons **1, 5, 6, 0, 1, 2, 2, 0**. | Substantive finding **S-1** of Book 7's round 1. D20 (a) adds each text's own semicolon count to its own sentence count so that a semicolon cashed for a period is worth zero. **The same construction makes a comma raised to a semicolon worth a FULL DIVISION** — it adds nothing to the sentence count, adds one to the semicolon count, and scores exactly what a real period scores, while leaving the clause chain inside one sentence, which is the thing D17, D19 and D20 exist to detect the absence of. A period costs a recast; a semicolon costs a keystroke. The corollary was never stated, nothing tested it, and **six of Book 7 v1's fourteen marks were the drafter's own**, making a published figure 60% pointing. Every Book but 4 and 8 carries some. |
| **D22** | **A manifest is unwriteable unless the gates actually evaluated AND passed, and it is verified against the files it names on every run.** `Gate.evaluated`; `manifest_checks_block()` as the package's only writer, raising otherwise; `verify_manifest()` on every `checks.py N` and `checks.py --manifests` for all Books; manifest failures kept apart from content gates so a stale manifest cannot block its own repair. Proved by planting, in `scripts/prove_manifest.py` — 15 assertions, with the package hashed before and after. | Substantive finding **S-2** of Book 7's round 1. The enforcement was described as structural and was **a claim about the past**: nothing ever read a manifest, `book07/manifest.json` already recorded the hash of a checks file that no longer existed, and a manifest asserting `all_gates_passed: true` survived a candidate failing two gates. An empty failure list is not a pass — a Gate that was never asked anything has one too. |
| **D23** | **What an accepted file carries that a gate would otherwise fire on is enumerated PER FILE, exactly, in both directions** — `DECLARED` in `scripts/checks.py`, replacing `BYTE_IDENTICAL`, `MIN_PARA_RATIO` and `LEGACY_GROWTH`. The per-paragraph length floor is **0.90 for every Book with no lowered threshold anywhere**; growth and compound drift are multiset and exact-list equalities. A file absent from the table declares nothing and gets every gate at full strength. | Substantive finding **S-3** and records finding **R-5** of Book 7's round 1. `MIN_PARA_RATIO = {1: 0.86}` was a lowered threshold wearing an enumeration's name — a sixth, seventh and tenth thin paragraph anywhere in Book 1 would have passed in silence, in the one place the package's own disposition said the door was shut. `LEGACY_GROWTH` compared membership, not multiplicity. **And keying on the Book rather than the FILE hid a mixed basis (R-1's disease):** `LEGACY_GROWTH[4]` declared `(18, 53, 54)`, which is the SUCCESSOR v3's figure; the accepted `candidate-v2.json` that `PUBLISHED` is computed over carries `(18, 53, 55)`. Nothing could notice while the gates ran for no accepted Book (**R-4**). |
| **D24** | **A collision report and a compound report are TRIAGE RECORDS, not print-outs: every row touching a Book gets a disposition or an explicit dismissal reason, generated rather than typed, and the script exits non-zero if any row lacks one.** `scripts/collision_triage.py` writes `bookNN/collisions.md`; `scripts/compound_register.py` writes §H.1 into every `continuity.md`. Five collision classes are mechanical (`variant`, `kept`, `common-rendering`, `common-word`, `artifact`) and the rest are named and hand-ruled, including **`homograph`** — one Butler spelling, two unrelated senses, therefore two words that happen to be spelled alike (`issue`, `appearance`) — plus `same-referent`, `unavoidable-merge`, `phrase-not-word`, `matches-accepted` and `divergence-recorded`. A dismissal that leans on a class names the check that carries the residue, which is D18's `declare_blind` shape applied to a triage. | Records finding **R-2** and blind spot **8** of Book 7's round 1: the check returned **72 rows touching Book 7**, eleven were acted on and **sixty-one were dismissed with no record of having been read**, which is how `walls ← precincts` (M-1) — a sense change in a Book whose walls are literally bronze — passed through. *"This is not a gap in an instrument; it is a gap between an instrument and a record, and it is the cheaper half to close."* |
| **D25** | **ARROW C: inside one paragraph, a rendering that reuses a word BUTLER HIMSELF KEEPS in that same paragraph for a different word of his.** No rarity gate at all and a three-letter minimum, because inside one paragraph proximity does the work rarity does across a corpus. Three controls under D18, all on both clauses, with three-way independence from arrows A and B asserted rather than claimed. | §9.7 of Book 7's round 1: M-2 (`abode` → `house`), M-5 (`sup` → `eat`) and M-10 (`chief persons` → `chief men`) are one defect and **every instrument in the package is blind to all three**. Its diagnosis — that arrow B's rarity gate is on the wrong side — is **wrong**; arrow B is already gated on Butler's side. The real reason is that `abode` occurs in six paragraphs and so is not rare. Arrow C finds all three in the frozen Book 7 candidate, one nobody had reported in **accepted Book 3**, and **six in Book 8 during drafting**, four of them Butler's own discriminations the draft had flattened. |
| **D26** | **A4(ii) is answered: NO vendored word list. The instrument for D15 is the served corpus, and the real fix is the register.** `app/public/data/editions/*-modern-en.json` — 100 modern-English editions, already a product dependency — is READ (never written) and a pair is closed only when the closed form leads the open 3× **and** appears in 3+ distinct editions. The corpus is machine-generated and is never a sole authority. | Book 7's round 1 §5.7, recommending against, on both halves: *unnecessary*, because the corpus is already here and attests the forms; *insufficient*, because a word list answers *"is `mountaintop` a word?"* and **D15 asks which of two forms**, which a list of single words cannot represent. **The register found `store-room` in accepted Book 2 the first time it ran** — 31 closed in 9 editions against 1 open — which no reader, no review round and no check had ever named. **And a correction to A5(c)'s own claim:** it says the register *"would have caught `mountain tops` at Book 5"*. It would not have — closed 7 in 7 editions against 9 open, short of the margin on both counts. It would have caught `sea shore` (56 in 17 against 0), which cost three successors. |
| **D27** | **DECIDED 2026-09-13 at Book 8's step 6. D20 clause (a) is widened from the semicolon to every DIVIDING MARK: `;`, `:`, and an em dash with a word on each side inside one sentence.** Both sides of the comparison add their own count, so cashing any of the three for a period is worth exactly zero, and **D21's construction rides on top of it** — on the candidate's side only the marks of Butler's that survive are counted, so raising a comma to a colon or a dash is worth nothing either. The compared figure from Book 8 forward is **NORM RATE, dividing marks, on Butler's own pointing**. Implemented as `dividing_marks()`, `internal_dash_offsets()`, `_provenance()`, `kept_added_div()`, `norm_rate_ext()` and `norm_rate_butler_ext()` in `scripts/checks.py`, pinned in `PUBLISHED`, recorded in every manifest, and covered by **eight** new `--audit` controls (22 in all). Every Book's figure is republished below on the stated basis; the old columns are kept beside them, because replacing a column in place is R-1. | Substantive finding **S-1** of Book 8's round 1, and its mark census (`book08/review/mark_census.py`). **Of Book 8's 52 new sentence boundaries, 44 are marks Butler already wrote** — 40 semicolons, 1 colon, 3 em dashes — and only 8 divide his prose. Commas move 410 → 407; MOVE-GAP is 0.00692 with **zero** displaced runs, the lowest movement in the package. There is no clause movement to find, and the +27.1% was bookkeeping. **D20 priced the semicolon and nothing else, so a colon or a sentence-internal dash cashed for a period was free division under every measure the package had.** The controls make the point mechanically: cashing a colon leaves the extended measure exactly where it is, moves the raw D17 rate, **and moves D20 as it stood**. On the new basis Book 8's headline **+27.1% is +2.0%**, and the eight genuine divisions are what is left. |

## The comparability table — one table, every basis stated (R-1)

**This is the package's only cross-Book instrument, and until 2026-09-12 it was
not six comparable numbers.** Records finding **R-1** of Book 6's round 1:
Book 3's published row is computed on **37 of its 38 paragraphs** — B03-P038,
the **D14** splice, where 196 of the served source paragraph's 208 words are
the replaced `modern-en`'s own ¶38 and the candidate renders Butler's 12 — and
nothing said so. The exclusion is **correct**: scoring a candidate against a
source that is not its source measures the defect in the other file. Its
silence was not, and the cost is not cosmetic — the **D17 floor** is half the
weakest accepted Book's rate, Book 3 is the weakest, and on all 38 paragraphs
its rate is **−1.1%**, which would make the floor negative and the gate
vacuous.

Every figure below is produced by `python3 scripts/checks.py --all`, from the
accepted files, and every row carries its basis. Nothing here is typed by hand.

| Book | file scored | **basis** | retention | sentences | raw D17 | 60+ | semicolons | NORM RATE | MOVE-GAP |
|---|---|---|---|---|---|---|---|---|---|
| 1 | `candidate-v2` | **all 32 paragraphs** | 0.72703 | 132 → 159 | +20.5% | 10 → 0 | 47 → 13 | −3.9% | 0.05088 |
| 2 | `candidate-v2` | **all 35 paragraphs** | 0.90232 | 137 → 159 | +16.1% | 7 → 4 | 36 → 21 | +4.0% | 0.01632 |
| 3 | `candidate-v2` | **37 of 38 — B03-P038 excluded (D14)** | 0.89641 | 164 → 173 | +5.5% | 9 → 6 | 39 → 32 | +1.0% | 0.02156 |
| 3 *(contrast only)* | `candidate-v2` | **all 38** | 0.86053 | 176 → 174 | −1.1% | 9 → 6 | 41 → 32 | −5.1% | 0.02065 |
| 4 | `candidate-v2` | **all 81 paragraphs** | 0.95872 | 281 → 306 | +8.9% | 17 → 3 | 68 → 50 | +2.0% | 0.00431 |
| 5 | `candidate-v2` | **all 37 paragraphs** | 0.93808 | 153 → 189 | +23.5% | 9 → 1 | 34 → 13 | +8.0% | 0.00891 |
| 5 v1 *(superseded)* | `candidate-v1` | **all 37 paragraphs** | 0.94211 | 153 → 189 | +23.5% | 9 → 3 | 34 → 12 | +7.5% | 0.00721 |
| **6 v2 (accepted)** | `candidate-v2` | **all 26 paragraphs** | **0.93408** | **116 → 148** | **+27.6%** | **7 → 1** | **27 → 5** | **+7.0%** | **0.01156** |
| 6 v1 *(superseded)* | `candidate-v1` | **all 26 paragraphs** | 0.93669 | 116 → 148 | +27.6% | 7 → 1 | 27 → 4 | +6.3% | 0.00925 |
| 7 v1 *(superseded)* | `candidate-v1` | all 29 paragraphs | 0.93943 | 103 → 129 | +25.2% | 7 → 0 | 30 → 14 | +7.5% | 0.01277 |
| **7 v2 (ACCEPTED)** | **`candidate-v2`** | **all 29 paragraphs** | **0.93438** | **103 → 138** | **+34.0%** | **7 → 0** | **30 → 7** | **+9.0%** | **0.01217** |
| 8 v1 *(superseded)* | `candidate-v1` | all 50 paragraphs | 0.93844 | 192 → 244 | +27.1% | 11 → 0 | 42 → 0 | +4.3% | 0.00692 |
| **8 v2 (ACCEPTED)** | **`candidate-v2`** | **all 50 paragraphs** | **0.93862** | **192 → 235** | **+22.4%** | **11 → 1** | **42 → 7** | **+3.4%** | **0.00692** |
| **9 v1 (round 1 done)** | **`candidate-v1`** | **all 44 paragraphs** | **0.92181** | **171 → 207** | **+21.1%** | **16 → 0** | **54 → 24** | **+2.7%** | **0.01266** |

**And the column that replaces the last-but-one, decided as D21.** The NORM
RATE above is the published one, which credits a comma raised to a semicolon
with a full division. **The figure that is COMPARED from Book 7 forward is NORM
RATE on Butler's own pointing** — his semicolons the candidate keeps, and only
those, in the denominator:

| | 1 | 2 | 3 | 4 | 5 | 6 | 7 v1 | **7 v2** | **8 v1** |
|---|---|---|---|---|---|---|---|---|---|
| semicolons, Butler → candidate | 47→13 | 36→21 | 39→32 | 68→50 | 34→13 | 27→5 | 30→14 | **30→7** | **42→0** |
| — **kept + ADDED** | 12+1 | 16+5 | 26+6 | **50+0** | 12+1 | 3+2 | **8+6** | **5+2** | **0+0** |
| NORM RATE as published | −3.9% | +4.0% | +1.0% | +2.0% | +8.0% | +7.0% | +7.5% | **+9.0%** | **+4.3%** |
| **NORM RATE on Butler's own pointing** | **−4.5%** | **+1.2%** | **−2.0%** | **+2.0%** | **+7.5%** | **+5.6%** | **+3.0%** | **+7.5%** | **+4.3%** |

**Book 4 and Book 8 are the only Books that added none**, and Book 8 is the
first drafted after the measure existed. **Book 7 v1 was the worst at 6 of 14**,
and the corrections at step 6 earned its published figure rather than pointing
it: four added semicolons became periods, three of Butler's own became periods,
and one of his that had been lowered to a comma came back.

### The same column on the D27 basis — every dividing mark, republished

**Decided 2026-09-13 at Book 8's step 6 (D27).** The column above prices the
semicolon and nothing else, so Book 8's 1 colon and 3 em dashes cashed for
periods were free division, and so were every other Book's. Below is the same
construction over `;`, `:` and the **sentence-internal** em dash — a dash with a
word on each side inside one sentence; a dash that opens or closes one is not a
divider and is not counted. **This is the figure that is COMPARED from Book 8
forward.** The old column is kept above rather than overwritten, because
replacing a column in place is exactly R-1.

| row | sentences | raw D17 | semicolons | **dividing marks (D27)** | **kept + ADDED** | NORM RATE, Butler's pointing (D21) | **NORM RATE, D27 on Butler's pointing** |
|---|---|---|---|---|---|---|---|
| 1 | 132 → 159 | +20.5% | 47 → 13 | 55 → 39 | 20 + 19 | −4.5% | **−4.3%** |
| 2 | 137 → 159 | +16.1% | 36 → 21 | 58 → 61 | 36 + 25 | +1.2% | **+0.0%** |
| 3 *(37 of 38)* | 164 → 173 | +5.5% | 39 → 32 | 53 → 47 | 39 + 8 | −2.0% | **−2.3%** |
| 3 *(all 38, contrast only)* | 176 → 174 | −1.1% | 41 → 32 | 56 → 47 | 39 + 8 | −7.8% | **−8.2%** |
| 4 | 281 → 306 | +8.9% | 68 → 50 | 103 → 81 | **80 + 0** | +2.0% | **+0.5%** |
| 5 v1 *(superseded)* | 153 → 189 | +23.5% | 34 → 12 | 64 → 37 | 34 + 3 | +6.4% | **+2.8%** |
| 5 | 153 → 189 | +23.5% | 34 → 13 | 64 → 35 | 34 + 1 | +7.5% | **+2.8%** |
| 6 v1 *(superseded)* | 116 → 148 | +27.6% | 27 → 4 | 38 → 14 | 12 + 2 | +4.9% | **+3.9%** |
| 6 v2 | 116 → 148 | +27.6% | 27 → 5 | 38 → 16 | 14 + 2 | +5.6% | **+5.2%** |
| 7 v1 *(superseded)* | 103 → 129 | +25.2% | 30 → 14 | 42 → 25 | 17 + 8 | +3.0% | **+0.7%** |
| 7 v2 | 103 → 138 | +34.0% | 30 → 7 | 42 → 18 | 14 + 4 | +7.5% | **+4.8%** |
| 8 v1 *(superseded)* | 192 → 244 | +27.1% | 42 → 0 | 62 → 22 | 15 + 7 | +4.3% | **+2.0%** |
| **8 v2 (ACCEPTED)** | **192 → 235** | **+22.4%** | **42 → 7** | **62 → 31** | **24 + 7** | **+3.4%** | **+2.0%** |
| **9 v1 (frozen draft)** | **171 → 207** | **+21.1%** | **54 → 24** | **71 → 41** | **41 + 0** | **+2.7%** | **+2.5%** |

**What moves, and what the movement says.**

* **Book 8's +27.1% becomes +2.0%**, which is the figure the review predicted
  (it computed +2.4% from a kept-mark count of 16 where the mechanized
  alignment gives 15; the one mark of difference is a dash whose Butler span
  carries a stronger mark, and the arithmetic is otherwise the review's).
* **Book 5 falls furthest, +7.5% → +2.8%**, and Book 4 next, +2.0% → +0.5%.
  Both cash colons and dashes in quantity — Book 4 alone has 103 dividing
  marks against 68 semicolons.
* **Book 2 goes to zero.** It carries MORE dividing marks than Butler (58 →
  61) and 25 of its 61 are its own. The old column already said +1.2%; this
  one says the added pointing was paying for all of it.
* **Book 1 barely moves** (−4.5% → −4.3%): it is the most heavily rewritten
  Book and its figure was never carried by pointing.
* **Nothing changes the ranking's top**: Books 6 and 7 remain the two Books
  that divided Butler's prose most, at +5.2% and +4.8%.

**A7 sits under this table too.** Every row is computed from the accepted files
by `python3 scripts/checks.py --all`, which asserts each against `PUBLISHED`.
Nothing here is typed.

**A correction to Book 7's round 1, on its own principle.** §S-1 says +3.0%
puts Book 7 *"fifth of seven"*. That ranks one corrected figure against six
uncorrected published ones — **two bases in one column, which is R-1**. On like
against like, v1 was **third of seven**, and v2 is joint first with Book 5. The
substance of S-1 is untouched by this: six of fourteen marks were the drafter's
own and the published figure was 60% pointing.

**Three further corrections the recomputation surfaced, all in the same class
as R-1 and none of them previously stated.**

1. **Book 3's semicolon count is 37-basis too.** The published `39 → 32` is the
   37-paragraph figure; on all 38 it is `41 → 32`. D19's row in this ledger
   quoted the first without saying which.
2. **Book 6 round 1's own new columns used the OTHER basis for Book 3.** Its
   §2.3 table gives Book 3 NORM RATE **−5.1%** and MOVE-GAP **0.02065**, which
   are the all-38 figures, in the same row as a raw D17 rate quoted elsewhere
   in the package on 37. On Book 3's own published basis they are **+1.0%** and
   **0.02156**. The finding that named the disease carried it.
3. **That table's row labels name the wrong files.** It is headed *Book 1 v3*,
   *Book 2 v5*, *Book 3 v3*, *Book 4 v3*, but `clause_movement.py`'s own
   `books` list loads `candidate-v2.json` for every one of them — the
   **accepted** files, which is the right choice and the wrong label. The
   successors (v3, v5) carry the compound corrections and differ: Book 2 v5's
   retention is 0.90161, not 0.90232.

**And one distinction that has to be kept, because two numbers in the package
now look like the same number and are not.** The published retention is the
**aggregate-join** form (`token_retention()`). MOVE-GAP needs retention
computed **per paragraph and summed** (`order_retention()`), or a token deleted
in one paragraph is "found" in another and the bag term inflates. For Books 2–6
the two forms agree to every printed place; **for Book 1 they do not** — 0.72703
aggregate against 0.73258 per-paragraph — so Book 6 round 1's "order" column
reads 0.73258 for a Book whose published retention is 0.72703. Both are right;
neither is the other. `scripts/checks.py` prints both and labels both.


- 2026-09-12 — **Round 1 of Book 6's independent review came back**
  (`book06/review/findings-v1.md`): *Accept after corrections* — **2
  substantive, 9 minor, 6 optional, 5 records**, 13 of 26 paragraphs with no
  material issue, coverage complete. Every published figure was recomputed and
  all reproduce. **Source verified a second time, by a ninth kind of rule** —
  letter-blind typographic shape, `book06/review/verify_source_book6_review.py`
  — whose own audit failed it three times as first written. The round's ruling
  on D19: Book 6 is a modernization, but its +27.6% splitting rate is **+6.3%**
  once semicolon conversion is priced out, and the retention argument the
  drafter offered for the remainder is invalid (85% of the deficit is
  vocabulary, not clause movement). Two new instruments, both audited under
  D18: `book06/review/clause_movement.py` (NORM RATE and MOVE-GAP) and
  `book06/review/rendering_collisions.py` (`one_word_two_ways()` across Books
  and **in both directions**).
- 2026-09-12 — **S-2: none of the package's checks runs for a new Book.** There
  is no `scripts/build_book06*.py`, and `scripts/build_book_package.py` calls no
  check at all. **D17's gate has never gated a v1 candidate** — it lives in
  Books 4's and 5's *correction* scripts — nor has the 50-word growth gate, nor
  D19; Book 6 has no `checks-v1.md`. The `hyphen_drift()` disease recurred at the
  next Book as all of the checks rather than one. Enforcement asked for: one
  `scripts/checks.py`, writing `bookNN/checks-vN.md`, exiting non-zero on any
  gate, called by `build_book_package.py`, with `--all` to re-assert every
  accepted Book's published figures.
- 2026-09-12 — **R-1: the D17/D19 comparison table is not six comparable
  numbers.** Book 3's row is computed on **37 of its 38 paragraphs** (the D14
  splice at B03-P038 excluded) with no note. The package's own measures on
  accepted `book03/candidate-v2.json` give **0.86053** and **176 → 174
  (−1.1%)**, not 0.897 and +5.5%; dropping P038 reproduces the published figures
  to five places.
- 2026-09-12 — **A fifth successor is on the table, and it is escalated.**
  Accepted **B04-P010** renders Butler's `doubted whether` as `was in two
  minds` — Butler's *own other phrase* — one paragraph before his real `in two
  minds` becomes `still undecided`. Found by arrow B of the new check. B06-P012's
  `he did not know what to do` is the better rendering and should not be changed
  to match the defect. **Needs a coordinator decision (see A4).**

## Next

**Books 1–5 are accepted. Book 6's round 1 is back and step 6 is next** (`book06/review-instructions.md`, five questions put
explicitly). After that, steps 5–8, then **Book 7**: a **ninth** kind of source
rule (the eight used are listed in `RESUME.md`), audited before it is trusted,
and **three** numbers — retention, splitting rate (**D17**) and semicolons
against Butler's (**D19**). Every control under **D18**; run
`scripts/compound_drift.py` before freezing.

*Historic, kept for the reasoning:*

1. **Book 3 is accepted and closed.** Round 1 (`book03/review/findings-v1.md`)
   returned **zero substantive findings** and 29 paragraph-level findings, all
   applied at `book03/candidate-v2.json` (sha256 `7095ef4f…4989b905`, retention
   0.895 → **0.897**, `book03/changes-v1-to-v2.md`, none declined); the flow
   read added no change (`book03/flow-read.md`); acceptance is
   `book03/ACCEPTANCE.md`. All five things put to that reviewer were ruled on:
   **B03-P038** (ship Butler's twelve words — now **D14**), **`[on the
   embers]`** (class B upheld), **B03-P028's defective clause** (stray `and`
   dropped, no word supplied, upheld), **the retention figure** (the lightness
   is the source's — the least-changed paragraphs are the sacrifice and the
   voyage catalogues, where Butler is already plain narration; the
   most-rewritten carry *thou/vouchsafe/shewed/aforetime*), and the two
   glossary rows (**"the horseman of Gerene"**, **"the Trito-born"** unglossed,
   both upheld).
2. **Book 2 is accepted and closed.** All three things put to its reviewer were
   ruled on: the `[do not]` bracket (upheld, reason corrected, now **D12**),
   the Erinyes gloss (upheld at this size, for the recorded reason), and the
   marriage-gifts formula (changed, in both Books, as finding 11.1). A later
   round added one recorded successor, `book02/candidate-v3.json`
   (`book02/changes-v2-to-v3.md`, one hyphen at B02-P034).
3. **Book 4 is accepted and closed** at `book04/candidate-v2.json` (sha256
   `b3bef2f3…9674c446`, 81 paragraphs, ratio 1.0004, retention **0.95872**,
   **sentences 281 → 306, +8.9%; sixty-word sentences 17 → 3, 82% broken**).
   Round 1 returned **one substantive finding, S-1** — the draft modernized
   Butler's vocabulary thoroughly and his syntax hardly at all — plus 16 minor,
   11 optional and 7 records findings. 42 substitutions in 31 paragraphs
   (`book04/changes-v1-to-v2.md`), five optional findings declined and asserted
   unchanged, one flow-read change (`book04/flow-read.md` F-1), acceptance in
   `book04/ACCEPTANCE.md`. All five things put to that reviewer were **upheld**:
   the three new name rows (warrant corrected, **R3**), **D12 class C** at
   B04-P001 and B04-P052 with `abode` → `home`, the **B04-P040 quotation
   repair**, and the **one deliberate break in the `heaven` census**. Records
   findings R1–R7 are all applied: **R1** (0.960/0.961 → the exact 0.95958,
   everywhere), **R2** (Book 1's 0.721 is not reproducible; the canonical
   function gives **0.727** for the accepted v2 and **0.728** for v3 —
   corrected everywhere, no ranking changes), **R3** (name warrant), **R4** →
   **D15** (the compound rule), **R5** (`book04/word-counts-v2.json`), **R6**
   (the `tell me truly` flattening written down), **R7** (`PROVENANCE.md` §5:
   the served paragraph division is PG's own blank-line division). Two further
   decisions came out of the round: **D16** (one rule for punctuation slips)
   and **D17** (the splitting rate, a gate the build enforces).
4. **Book 5 round 1 is complete** — `book05/review/findings-v1.md`, verdict
   **accept after corrections**: 1 substantive (**S-1**, the splitting rate is
   bought with semicolons — 34 → 14, so 20 of 36 added sentences move no
   clause), 14 minor, 18 optional, 8 records. All four questions ruled:
   **`seashore`** (costing successors to Books **2, 3 and 4**, not Book 4
   alone), the supplied `and` **upheld**, the unbroken `heaven` census
   **upheld**, `batting it back and forth` **upheld**, and B05-P017's 62-word
   sentence **to be divided**. `hyphen_drift()` to be extended to the
   closed/open axis. Steps 5–8 are next.

5. **Book 5 was frozen at `book05/candidate-v1.json`** (sha256
   `7acc5c34…3737a59cf`, 37 paragraphs, ratio 0.999, retention **0.94211**,
   **sentences 153 → 189 (+23.5%), sixty-word 9 → 3 (67% broken)**, 13 packets)
   and **waiting on the coordinator for step 4, the independent review**.
   Steps 1–3 done: the source is verified by a **sixth** kind of rule
   (`scripts/verify_source_book5.py`) which **never looks for Book 5** — it
   locates the other twenty-three served chapters, each exactly once in the
   whole file, and takes Book 5 as the residue, so the region cannot be moved
   by a defect in the thing being checked. 37 of 37 paragraphs accounted for,
   32 byte-identical, 5 classified footnote markers, 4,666 words word for word,
   0 mismatches, 8 negative controls. The closed name table gains **one** row,
   `Ceres` → `Demeter`, the first added under R3's corrected warrant.
   **Five things are put to that reviewer explicitly**: the open `sea shore`
   and the cross-Book hazard behind it; the one word supplied at B05-P012;
   the **unbroken** `heaven` census, against Book 4's one break; `battledore
   and shuttlecock` → `batting it back and forth`; and the 62-word sentence
   left standing at B05-P017.
6. **Book 6** after Book 5, in numerical order. Nothing blocks it.
7. Book 10's disposition still needs a coordinator decision — see A2 below,
   now narrowed.

## Needs Anders (listed, not waited on)

- **A7 (2026-09-13, from Book 8's round 1 §1.3). A3 IS WIDENED, and the
  widened patch is prepared and hashed the way D14 requires.** Still Anders's
  to apply: it is a production file.

  The served `original-en` diverges from PG in **four** places, not one. Three
  were called *"normalizations that touch no word"*; **two of them are not
  normalizations, and calling them that is the same mistake as the splice, one
  letter of it.**

  | ¶ | divergence | disposition |
  |---|---|---|
  | **B03-P038** | the D14 splice — 196 of 208 words are the served `modern-en`'s own ¶38 | **A3, unchanged** |
  | **B03-P001** | PG opens Book III `but as the sun was rising`; the served file has `But` | **A3, WIDENED to it** |
  | **B04-P001** | PG opens Book IV `they reached the low lying city`; the served file has `They` | **A3, WIDENED to it** |
  | **B01-P025** | PG sets a space before an em dash; the served file closes it up | **a normalization, and left as one** — no word, no letter, no device |

  **Why the two capitals are the splice again.** Butler runs one sentence
  across the Book boundary. PG's Book III ¶38 is a protasis — *"Now when the
  sun had set and darkness was over the land,"* — and PG's Book IV ¶1 is its
  apodosis — *"they reached the low lying city of Lacedaemon"*. The same
  construction joins Book II to Book III. Capitalizing `But` and `They`
  destroys the device, and it destroys it in the direction that makes the
  splice look necessary: with the capital in place, ¶38 reads as a broken
  fragment, and somebody completed it with 196 words of the wrong file.
  **A3's patch as prepared would restore the half-sentence and leave the
  capital that made it look broken.**

  **A7 IS INCOMPLETE, and Butler's Preface says so** (Book 9's round 1, S-7).
  The same sentence that settles the capitals settles a second thing beside
  them: *"the Leipsic Teubner edition of 894 makes **Books ii. AND iii.** end
  with a comma … I have preferred to do so."* **PG honours it for iii only.**
  PG's Book II ends `from dark till dawn.` — a full stop — and PG's Book III
  still opens lower-case `but as the sun was rising`, which is internal
  evidence, independent of the Preface, that a comma belongs there. So A3
  as prepared would give the served edition a lower-case sentence opening
  **after a full stop**, which is neither Butler's device nor PG's intention.
  The two halves cannot be decided separately: either widen A3 once more to
  Book II's terminal comma, on Butler's own stated authority, or restore
  Book IV's opening alone and leave Book III's capital. **Anders's call, and
  the patch hashed as `e45d6c4d…` decides only one of the two.**

  **THE PAIR, RESOLVED INTO THREE HASHED OPTIONS — 2026-09-13.** S-7 said the
  two halves cannot be decided separately and left one of them unprepared, so
  Anders was being asked to choose between a hashed patch and a described one.
  All three are now prepared and hashed the way D14 requires, by raw
  substitution in a scratch copy, each substitution asserted to occur exactly
  once, each result re-parsed and its paragraph counts asserted unchanged
  (1,027 in total, and chapter by chapter). **The served file was not
  written.** `0cc76350…` and `e45d6c4d…` below were reproduced here
  independently of the session that first computed them, which is the point of
  recording them.

  | option | what it does | sha256 | bytes |
  |---|---|---|---|
  | **A** — as prepared | the truncation alone | `0cc76350232962d4c4f1cf1eb7216f14515fc1910f94f666695d2a595d4e6980` | 636,440 |
  | **B** — A3 WIDENED | truncation + **both** capitals | `e45d6c4d1b35873555c8611b0047e707b909666181aa115ffaba8c3fe049a54e` | 636,440 |
  | **B+** — WIDENED **and the pair closed** | B, **plus Book II's terminal comma** | `483979795b333530a2bf17ae0f44a67d46a7d5b3bd8f5534168a1c5d76ceb1e3` | 636,440 |
  | **C** — the half S-7 offers instead | truncation + **Book IV's capital only**, leaving Book III's `But` | `56a2a2589b9d6e66d487f9a4433a06ec53d188843916656a0983cdf132e7f473` | 636,440 |

  **The recommendation is B+, and the argument is that it is the only option
  that leaves the served text saying what Butler says he wrote.**

  * **B alone is incoherent** and that is exactly S-7's finding: it prints
    `… from dark till dawn.` and then `but as the sun was rising`, a
    lower-case sentence opening after a full stop. Neither Butler's device nor
    PG's intention.
  * **C is coherent and it preserves a transcription slip.** Book III's
    lower-case opening is internal evidence, independent of the Preface, that
    something ending in a comma precedes it — and what precedes it in PG ends
    in a full stop. C keeps the slip and capitalizes over the evidence of it.
  * **B+ is what the Preface says.** *"the Leipsic Teubner edition of 894
    makes **Books ii. and iii. end with a comma** … from a spirit of mere
    conservatism, I have preferred to do so."* Two Books, and PG honours one.
  * **B+ is one character**, in the paragraph PG itself points at by opening
    the next Book lower-case.

  **B+ departs from PG, and A, B and C do not — which the new source pin makes
  a mechanical fact rather than a remark.** `scripts/pg_source.py` enumerates
  every divergence between the served file and PG #1727 as
  `SOURCE_DIVERGENCES`, asserts the set in both directions, and bounds it at
  **four**. The arithmetic:

  | | divergences from PG | rows |
  |---|---|---|
  | today | `(1,25)` `(3,1)` `(3,38)` `(4,1)` | 4 |
  | after **A** | `(1,25)` `(3,1)` `(4,1)` | 3 |
  | after **B** | `(1,25)` | 1 |
  | after **B+** | `(1,25)` `(2,35)` | **2** |
  | after **C** | `(1,25)` `(3,1)` | 2 |

  So **B+ costs one row of the register and stays well inside the bound**, and
  the row it costs is the one place in the edition where the package would be
  deliberately printing something PG does not — **on Butler's own written
  authority, which is a better warrant than any this register has ever
  carried.** Whoever applies B+ must write that row, with the Preface quoted
  in it, or `checks.py` fails; that is the pin doing its job. The bound is
  four and B+ leaves two, so no bound has to be raised.

  **What B+ does NOT do.** It does not touch this package's own files. Book 2
  is accepted and its candidate ends in a full stop rendering Butler's; the
  terminal mark of a chapter is not a dividing mark under D27 or D28, moves no
  figure, and the successor it would owe is one character. It is owed on the
  day A3 lands, with the two capital successors to Books 3 and 4, and is
  deliberately not built before then (ledger R-6).

  **The widened patch.** Three substitutions in one file, each occurring
  exactly once, computed in a scratch copy and re-parsed; **the served file
  was not written.**

  1. chapter 3 ¶38 truncated to Butler's clause, exactly:
     `Now when the sun had set and darkness was over the land,`
  2. chapter 3 ¶1 `But as the sun was rising` → `but as the sun was rising`
  3. chapter 4 ¶1 `They reached the low lying city` → `they reached the low
     lying city`

  | | |
  |---|---|
  | File | `app/public/data/editions/odyssey-original-en.json` |
  | sha256 **before** | `da03f6ac9dfd5a19b9912adabfb9b0b48ed66bd85d8e1507a6b323a374822f07` (637,591 bytes) |
  | sha256 **after, A3 as prepared** (the truncation alone) | `0cc76350232962d4c4f1cf1eb7216f14515fc1910f94f666695d2a595d4e6980` (636,440 bytes) |
  | sha256 **after, A3 WIDENED** (truncation + the two capitals) | `e45d6c4d1b35873555c8611b0047e707b909666181aa115ffaba8c3fe049a54e` (636,440 bytes) |
  | Paragraph counts | unchanged, 1,027, and unchanged chapter by chapter |

  The `0cc76350…` row reproduces the figure A3 recorded on 2026-09-12 from an
  independent recomputation here, which is the point of recording it.

  **WHAT THE FIX COSTS, plainly, because two of the three costs are real and
  one of them is this package's.**

  1. **Two chapters of the served original will open with a lower-case word.**
     To a reader who opens Book III directly — which is how the app's library
     works — that reads as a defect. It is not; it is Butler. But it is
     indistinguishable from one without the previous chapter on the screen,
     and *that* is why somebody capitalized it. The fix buys fidelity and pays
     in something that looks like a bug, which is the same trade D14 accepted
     for B03-P038 (208 words against 12) with its eyes open.
  2. **It costs this package two successors — but not yet.** The accepted
     modern Books inherited the capitals from the served file: `book03/…`
     opens `But as the sun was rising` and `book04/…` opens `They reached the
     low-lying city`, while accepted Book 3's own ¶38 already ends at Butler's
     comma. So the modern column currently prints a half-sentence followed by
     a capital, which is the defect with none of the compensation. **Under
     D14 the candidate renders the base text, so the two openings should be
     lower-case, one letter each, in successors to accepted Books 3 and 4.**
     They are **deliberately not built here.** Applying them before the served
     file is repaired would put a lower-case modern opening beside a
     capitalized original in split-pane view, paragraph-aligned — a visible
     mismatch between the two columns of the same screen, which is a worse
     state than the one we are in and is the class D14 exists to prevent. The
     successors are owed **on the day A3 lands**, and this row is the record
     that they are owed.
  3. **What it does NOT cost: alignment.** All three substitutions leave
     1,027 paragraphs, the same count in every chapter. Audio, Cast data and
     saved reading positions key on the paragraph index and none of them
     moves.

  Verified independently by two unlike methods in `book08/review/` (the
  thirteenth source rule's clause C, and a character-level `SequenceMatcher`
  pass), and the hashes above by a third, here.

  **AND BUTLER SAYS SO HIMSELF, which nobody had looked for.** Found while
  surveying the unused channels for Book 9's source rule, in **Preface to the
  First Edition**, PG #1727 — a region of the file no rule in this package had
  ever read, because every rule works inside the body:

  > *"I observe that the Leipsic Teubner edition of 894 makes Books ii. and
  > iii. **end with a comma**. Stops are things of such far more recent date
  > than the “Odyssey,” that there does not seem much use in adhering to the
  > text in so small a matter; still, from a spirit of mere conservatism, **I
  > have preferred to do so**. … **No other Books of the “Odyssey” have
  > initial capitals** except the three mentioned unless the first word of the
  > Book is a proper name."*
  >
  > — S. Butler, *July* 25, 1900

  Two sentences, and between them they settle A7 outright.

  1. **Butler ends his Books II and III with a comma on purpose**, and says he
     does. The half-sentence at the end of Book III is not a defect that
     invited completion — it is the author's stated practice, and the served
     file's ¶38 splice completes a sentence Butler deliberately left open.
  2. **Butler states his own rule for initial capitals**, and Books III and IV
     are not among the exceptions. `But` and `They` are therefore not
     normalizations of an accident; they overwrite a typographic policy the
     translator wrote down in his own preface.

  This is the strongest evidence A7 will get, it is primary, and it is
  verbatim in the package's own `source-texts/pg1727-butler-1900.txt` at lines
  277–289. **It also raises a question for the whole edition**, which is put to
  Book 9's reviewer: Butler's rule names Books **ii, vii and viii** as taking
  initial capitals and **vi, xiii and xvii** as not, and the served file
  capitalizes every Book. If A3-widened is applied, the natural scope is not
  two Books but *whichever of the twenty-four Butler's own rule says should be
  lower-case* — and that is a question about the Greek text he is describing,
  not the English, so it needs a reader who can check it rather than a script
  that can count.

- **~~A5.~~ DONE 2026-09-13 — `mountain tops` closed, the vendored word list
  declined, and the register built. `book05/candidate-v3.json` `c8af4cc3…` and
  `book06/candidate-v3.json` `1ae67a52…`; **R-6 confirmed, the cost was TWO
  successors, not one**; A4(ii) answered as **D26**, A5(c) built as
  `scripts/compound_register.py` and **its own claim corrected with evidence**
  (the register would NOT have caught `mountain tops`; it would have caught
  `sea shore`). The original text, kept:**
  **A5. `mountain tops`, and A4(ii)'s vendored word list — Book 7's round 1
  recommends, and one of the two comes with evidence that changes the question.**
  Full argument in `book07/review/findings-v1.md` §5.7.
  **(a) `mountain tops`: close it — but inside one consolidated compound sweep,
  not as a one-off.** D15 as written decides it (the standard American form is
  closed) and cost is not a reason to decline, since `seashore` cost three
  successors on a point D15 calls typographic. **Correction to the record
  (records finding R-6):** `book06/ACCEPTANCE.md` O-6 states the cost as *"a
  sixth successor"*, singular. The string is in **accepted Book 5** (`candidate-v2.json`)
  **and accepted Book 6** (`candidate-v2.json`, B06-P011), so closing it costs a
  successor to **each** — two, not one. And this is the *third* time the package
  has paid successors for a compound found by a person reading (`mixing-bowl` at
  Book 2, `seashore`/`low-lying`/`well-disposed` at Book 5); paying a third round
  without closing the class guarantees a fourth.
  **(b) A4(ii) — recommend AGAINST vendoring a word list. Unnecessary, and
  insufficient.** *Unnecessary:* A4(ii)'s demonstration searched PG #1727 and the
  twelve staged files, found zero hits and rightly concluded the corpus cannot be
  its own dictionary — but `app/public/data/editions/*-modern-en.json` is **100
  modern-English editions, 44.9 MB, 75,231 distinct word types**, already in this
  repository and already a product dependency, and it **attests `mountaintop` and
  `mountaintops`** along with `seashore`, `hilltop`, `bedchamber`, `storeroom`,
  `townspeople`, `gatehouse`, `nightfall`, `daybreak` and `wineskin`, while
  correctly attesting none of `landingplace`, `outercourt`, `chiefmen`,
  `ninedays`, `winetubs`. *Insufficient:* a word list answers *"is `mountaintop`
  a word?"*; D15 asks *"which of two forms?"*, and a list of single words cannot
  represent the open form at all. A corpus can, and its answer here is worth
  reading — `mountaintop` 10 against `mountain top` 1, but **`mountaintops` 7
  against `mountain tops` 9**. The singular is decided and the plural is
  contested, which is exactly what a binary list would have flattened into a
  false verdict. *Caveat, stated:* the product corpus is machine-generated and a
  commit on the default branch reports nine of the hundred editions are largely
  the original text, so it needs a margin (closed form leading 3x AND appearing
  in at least three distinct editions) and is never a sole authority.
  **(c) The cheap fix is a register, not a dependency.** The H.1 head-noun filter
  already reduces a Book to ~23 pairs. That is a checklist, not a blind spot;
  what is missing is any record that someone went through it. **Require one
  disposition line per H.1 pair in each Book's `continuity.md`** — `closed` /
  `kept open, standard` / `not a compound`. Twenty lines a Book, no dependency,
  and it would have caught `mountain tops` at Book 5 before a successor was owed.

- **~~A6.~~ DONE 2026-09-13 — `book02/candidate-v6.json` `a6fb8103…`, two words
  for `councilors` and two more for `storeroom` in the SAME successor, with
  `book02/candidate-v2.json` and `ACCEPTANCE.md` byte-unchanged, plus one word
  in Book 7 v2. The original text, kept:**
  **A6. `councillors` — ruled by Book 7's round 1, and it costs a successor to
  Book 2.** §5.3. **D9 wins; write `councilors`.** Decisive fact the drafter did
  not have: every accepted candidate was scanned for `-our`, `-ised`,
  `-isation`, doubled-`l` inflections, `grey`, `plough`, `-ence`, `-re`,
  `whilst`/`amongst`, `storey` and `travell-`, and **`councillors` is the only
  British spelling in seven accepted Books** — so this is one word against a
  named rule, not house style against a rule. Cost: a new successor to Book 2
  changing two words (B02-P001, B02-P003), `book02/candidate-v2.json` and
  `ACCEPTANCE.md` byte-unchanged, plus one word in Book 7 v2. **The exception is
  NOT to be written into `PUNCTUATION.md` §1.** Listed here because it costs a
  successor to an accepted Book, which is a coordinator matter.

- **A4. A fifth successor, and a new dependency — both raised by Book 6's
  round 1.**
  **(ii) is DONE 2026-09-13 — DECLINED, see D26. (i) is DONE 2026-09-12** — `book04/candidate-v4.json`, sha256
  `3b88a4da182eccc7f673e392e125295aef05b584c1cc592d405470d5ee86bf95`, built by
  `scripts/build_fifth_successor.py` from `candidate-v3.json`, with
  `book04/candidate-v2.json` asserted **byte-unchanged** across the build and
  arrow B asserted silent afterwards. Book 6 was not changed to match the
  defect. **(ii) and (iii) remain for Anders**, and (ii) is the one that needs a
  decision: a vendored English word list is a **new external dependency**. The
  interim head-noun filter is built and runs in every `checks.py` report.
  The original text of (i), kept:
  (i) **Accepted Book 4 carries a rendering collision.** B04-P010 renders
  Butler's `doubted whether` as `was in two minds`, which is Butler's *own
  other phrase*, one paragraph before his real `in two minds` at B04-P011 is
  rendered `still undecided`. One rendering carrying two Butler words is the
  package's characteristic defect and has already cost four successors. The fix
  is one clause in `book04/candidate-v3.json` (`he did not know whether to let
  him choose his own time for speaking`). **Book 6 must not be changed to
  match it.**
  (ii) **Closing compound blind spot H.1 needs a vendored English word list.**
  Demonstrated rather than assumed: the closed form of every content-word pair
  in Book 6's candidate was looked for across PG #1727 and all twelve staged
  files — **zero hits**. Butler never writes `mountaintop`, so the corpus cannot
  be its own dictionary. One ~100 KB list would settle **D15** mechanically for
  all 24 Books; it is a new external dependency and therefore not the reviewer's
  call. The interim instrument needs no dependency: filter candidate word pairs
  to a common-compound-head list, which takes Book 6's 482 pairs to 23 and
  surfaces the live instance (`mountain tops`).
  (iii) **D20 is proposed, not decided** — see the decisions table.

- **A3. The served `original-en`'s Book 3 ¶38 is defective, and only a change
  to a production file can really fix it. WIDENED 2026-09-13 to Book III's and
  Book IV's lower-case openings — see A7 above for the widened patch, its
  before/after hashes and what it costs. The text below is A3 as it stood.** 196 of its 208 words are the served
  `modern-en`'s own ¶38, spliced in to complete a half-sentence Butler leaves
  open at the end of his Book III, and they duplicate ¶37. Everything else in
  the file is sound — 1,027 paragraphs and 117,228 words checked against PG.
  This package handles it by rendering Butler's 12 words and recording the
  cost; the real fix is to repair
  `app/public/data/editions/odyssey-original-en.json`, which is outside this
  package's scope. Evidence in `PROVENANCE.md` §4 and
  `book03/continuity.md`. **No action taken on the served file.**

  **The repair, prepared so it is a one-line patch and not a research task**
  (Book 3 round 1, section C; **D14**). Replace the whole of chapter 3's
  paragraph 38 with Butler's clause, exactly:

  ```
  Now when the sun had set and darkness was over the land,
  ```

  (Butler's own wording, PG line 1541; the modern edition renders it
  `…darkness lay over the land,` at B03-P038, matching its own rendering of the
  same clause at B03-P037. The served paragraph **already opens with these
  fifty-six characters** — the repair is a truncation, deleting everything
  after the comma.)

  | | |
  |---|---|
  | File | `app/public/data/editions/odyssey-original-en.json` |
  | sha256 **before** | `da03f6ac9dfd5a19b9912adabfb9b0b48ed66bd85d8e1507a6b323a374822f07` (637,591 bytes) |
  | sha256 **after** | `0cc76350232962d4c4f1cf1eb7216f14515fc1910f94f666695d2a595d4e6980` (636,440 bytes) |
  | Paragraph counts | unchanged, 1,027 — the paragraph stays, it is truncated |

  Computed 2026-09-12 in a scratch copy by replacing the one JSON-encoded
  string (it occurs exactly once in the file) and re-parsing; **the served file
  was not written.**

  **Fingerprint evidence, which settles the splice without reference to Project
  Gutenberg at all** (round 1, section A, verified again here): Book 3 ¶38 is
  **the only paragraph in the entire 1,027-paragraph served original that
  contains an ASCII double quote** — it contains two, and the file is
  typographic throughout — and it differs from the served **`modern-en`**'s own
  ¶38 by **exactly one substitution**, `covered` → `was over`. Someone edited
  two words of a 207-word modern paragraph and dropped it into the original.

- ~~**A1. Name-form policy for the whole Odyssey.**~~ **ANSWERED 2026-09-12
  by the coordinator: Greek forms.** Recorded as **D5**–**D8**, applied to
  Book 1 by script, and written into `GLOSSARY.md` so Books 2–24 inherit it.
  Kept here rather than deleted so the reversal is legible.
- **A2. Book 10 pilot's disposition — narrowed, still open.** Applying S1
  removed one of the two stated blockers: the pilot already uses the Greek
  forms, so it and this package now agree on names. What remains is that it
  has had **no independent review at all**, and that it predates this
  package's glossary rows, `PUNCTUATION.md` and continuity conventions.
  Either adopt its draft as the starting point for a from-scratch round 1
  under this package, or set it aside and redraft Book 10 fresh when its turn
  comes in numerical order. Both are workable; no action taken on Book 10.

## Open, not blocking

- **D20 clause (a) has an unstated corollary, and Book 7 v1 banks it six
  times.** Substantive finding **S-1** of Book 7's round 1. NORM RATE adds each
  text's own semicolon count to its own sentence count on both sides so that
  **semicolon → period is worth zero**. By the same construction **comma →
  semicolon is worth a full division**: it adds nothing to the sentence count,
  adds one to the candidate's semicolon count, and scores exactly what a period
  would — while leaving the clause chain inside one sentence, which is the thing
  D17, D19 and D20 exist to detect the absence of. It is the mirror of the
  operation D20 prices out and it is cheaper, because a period costs a recast and
  a semicolon costs a keystroke. Book 7 v1 does it six times (B07-P011 ×2, P018,
  P019, P026, P028) and its NORM RATE is **+7.5% published against +3.0% on
  Butler's own pointing** — second in the package against fifth of seven.
  **Three things to settle, none of them this review's to decide:** whether
  `semicolons()` should report the pair *(Butler's kept, newly added)* rather
  than a count; whether NORM RATE should score an added semicolon at all, in
  writing, either way; and the missing `--audit` control — *a comma raised to a
  semicolon must not move NORM RATE* — which is three lines and is the mirror of
  the positive control already there.

- **Three infrastructure repairs from Book 7's round 1, none of them Book 7's
  and none of them waiting on it.** (1) **The manifest has no read side** (S-2):
  `book07/manifest.json` already records a `checks-v1.md` sha256 that does not
  match the frozen file, at trunk `f4d7fbcf7`, and nothing noticed because
  nothing reads a manifest; a manifest saying `all_gates_passed: true` also
  survives a candidate that fails the gates. `checks.py N` should verify the
  manifest it finds, and `--manifests` should do it for every Book.
  (2) **`MIN_PARA_RATIO` is a lowered threshold, not an enumeration** (S-3) —
  `{1: 0.86}` lets Book 1 quietly acquire a sixth thin paragraph, which is the
  case the disposition says is closed; rewrite it in `BYTE_IDENTICAL`'s shape,
  the five indices with their ratios. (3) **`--all` re-asserts figures but never
  evaluates the gates** (R-4), and **`LEGACY_GROWTH` compares membership rather
  than multiplicity** (R-5).

- **PG #1727 carries one transcription defect in its apparatus** (records
  finding **R-3**). Footnote 29's opener is transposed — `29[] [ The geography of
  the Ægean…` — where all 186 other entries read `[n] [ …`. Harmless here: the
  served editions carry no apparatus and the defect is outside every Book's body.
  Recorded so the next rule to read the FOOTNOTES section does not rediscover it
  as its own bug; asserted by name in
  `book07/review/verify_source_book7_review.py`.

- **B01-P014's source crux is resolved on a stated reading, not settled by
  the source.** Butler prints `for he is not dead yet not on the mainland`,
  unpunctuated and ungrammatical (PG line 538, verified). The adversative
  reading is taken, because the next sentence draws an inference that follows
  from *not on the mainland* and not from *not yet*. A later reader who
  prefers the temporal reading has the argument to argue against, in
  `book01/continuity.md` "Unresolved source issues" item 1.
- **B01-P006's "an eye" → "the eye"** is the package's one deliberate
  resolution of a Victorian indefinite. Recorded at B01-P006 rather than
  silent. If a later Book turns up a second, decide whether this becomes a
  class or stays a one-off.
- **B01-P013's doubled "brought"** ("what kind of ship brought you, and how
  your crew brought you to Ithaca") is clumsy, not defective; the round-1
  reviewer considered a finding and declined. Asserted unchanged by the
  build so a later pass does not drift into it.
- `source-texts/` (this package's directory for fetched public-domain source
  texts) is named differently from the Meditations package's `source/` for
  an environment reason specific to the original task's sandbox; no content
  difference is implied.
