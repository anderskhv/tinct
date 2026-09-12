# The Odyssey modern-English — progress ledger

Branch `claude/odyssey-modern-en-20260911`. Content agent for the Odyssey
thread; the coordinator reads this file, Anders does not read the session.
Kept current at every push.

## Done

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
| **D14** | **Where the served `original-en` is demonstrably not the base text, the candidate renders the BASE TEXT, never the served corruption — and the divergence is recorded, the cost stated plainly, and a repair to the served file escalated rather than performed.** The divergence is recorded per paragraph in the Book's `continuity.md` with the evidence; **paragraph alignment is preserved in every case** — the paragraph exists and is non-empty, because audio, Cast data and saved reading positions key on the paragraph index. **Written for the class, not for the paragraph.** First and so far only application: **B03-P038**, where 196 of the served paragraph's 208 words are the served `modern-en`'s own ¶38, spliced in to complete a half-sentence Butler leaves open at the end of his Book III. The candidate prints Butler's twelve words: `Now when the sun had set and darkness lay over the land,`. The repair text and the before/after hashes are in `book03/ACCEPTANCE.md` and in **A3**, so repairing the served file is a one-line patch rather than a research task. | Ruling 1 of Book 3's round-1 review, settled 2026-09-12. **The decisive argument is about the repair, not about the duplication:** A3 recommends repairing `odyssey-original-en.json` so ¶38 is Butler's clause alone, and that repair will very likely happen. If the modern edition had meanwhile rendered the splice, then on the day of the repair the modern column's ¶38 becomes 200 words with **no source at all** — a paragraph of the *replaced* file's prose aligned against twelve words of Butler, permanently, with nobody left who remembers why. Rendering the base text is correct both before and after the repair. Borrowing Book IV's opening words to complete the sentence was rejected for a second reason worth keeping: it would invent a Book-boundary policy for a 24-Book edition on the strength of one paragraph, and this is not the only place Butler runs a sentence across the join — his Book III opens the same way, on a lower-case `but`. The cost is real and not minimized: 208 words against 12 in split view will be read as a bug, and it **is** a bug, in the other file. A class-level row rather than a note on one paragraph because `scripts/scan_staged_original_vs_pg.py` shows no second instance in *this* file but does not cover the library's other books, and a drafter meeting a similar splice without a rule will do the natural thing — modernize what is in front of them — and will be right to, absent a rule. |
| **D15** | **Compound spelling follows the modern standard form of the compound, in whichever direction that moves Butler's Victorian setting — closed, hyphenated or open. The change is typographic and silent. The test for whether it is typographic at all: *does it alter what a reader would say aloud?* If it does, or if it renames the object, it is a rendering decision and is recorded in the Book's `continuity.md`.** Written out with Book 4's twelve instances in `PUNCTUATION.md` §4. | Records finding **R4** of Book 4's round 1. The package had been running on a single precedent (`sweet meats` → `sweetmeats`, accepted at Book 3, upheld at Book 4 as normalization). One Book then moved compounds in **three directions at once** — four closed, three hyphenated, four opened, three of them recorded decisions and the rest silent — and two of the opened ones landed on a form that is **neither Butler's nor modern English's** (`sea side`, corrected to `seaside`; `drink offering`, which is in fact the standard open form and is kept, recorded). This is the class that already cost the package a whole successor version at Book 2 (`mixing bowl` → `mixing-bowl`, finding 27.1), and it is invisible to every check except the cross-Book `hyphen_drift()` scan, which only fires once a *second* accepted Book disagrees. A rule, written down, is cheaper than a third discovery. |
| **D16** | **One rule for Butler's punctuation slips: a Victorian mark is REPAIRED when a modern reader reads it as an error, and KEPT when it is merely old-fashioned but correct.** `PUNCTUATION.md` §5, with Book 4's three instances: B04-P040's double opening mark repaired (it names the wrong speaker), B04-P046's lower-case opening after a question mark repaired, B04-P039's dated-but-correct terminal question mark kept. | Round 1 of Book 4, section E. The draft had repaired one of the three and kept another without ruling, and the reviewer's point was not about which disposition is right but that **one class had two dispositions**. Under **D4** this Book's opening quotation marks are load-bearing across twenty-one consecutive paragraphs, so a wrong mark is a wrong speaker, not a blemish — which is what separates "repair" from "preserve" and makes the rule decidable rather than a matter of taste. |
| **D17** | **Every Book reports a sentence-splitting rate beside its retention, and the build FAILS if the rate falls below half the weakest accepted Book's or if more than three quarters of the source's sixty-word sentences survive.** Sentences source → candidate as a percentage added, and sixty-word sentences source → candidate as a percentage broken. Implemented in `scripts/build_book04_v2.py`; the splitter is the round-1 reviewer's own, taken verbatim, so the numbers stay comparable across Books. Accepted Books: **+20.5% / 100%**, **+16.1% / 43%**, **+5.5% / 33%**, and Book 4 v2 **+8.9% / 82%**. | Substantive finding **S-1** of Book 4's round 1, and the answer to the question Book 4 was sent to review with. Book 4 v1 satisfied **every** mechanical check in the package perfectly — retention to ±0.001, word ratio to ±0.0005, name census, hazard list, formula assertions, the exact list of byte-identical paragraphs — while breaking **one of its source's seventeen** sixty-word sentences and adding **0.4%** to its sentence count, against a source carrying the densest supply of sixty-word periods in the package. Nothing in the checks counted a sentence, so a thorough vocabulary swap with no syntax work at all passed as a modernization. **Two limits are part of the decision, not footnotes to it.** The gate is a floor to clear, not a target: Book 4's flow read reverted a division the gate would have counted (two consecutive sentences opening `But`). And the measure convicts on **sentence division only** — the reviewer's own audit found that chain load predicts splitting in accepted work (ρ = +0.380, n = 98) and does **not** predict clause order (ρ = +0.048), so order retention was refused as grounds for a finding. A draft that divides Butler's sentences and leaves every clause in his order passes the gate, and only a continuous read sees it. |
| **D18** | **A negative control asserts, in two clauses, (a) that its mutation changed the input AND (b) that the check's own verdict changed. Where (b) cannot be made to hold, the blindness is declared by name and a second check is made to carry that class.** Implemented once, as `scripts/controls.py` (`control()` and `declare_blind()`, which requires the name of the check that carries the class). Applied to **every** verification script in the package, not only new ones: `scripts/verify_source_book2.py` (which had none — its controls were prose-described), `verify_source_book3.py`, `verify_source_book4.py`, `verify_source_book5.py`, `book03/review/…`, `book04/review/…`, and `scripts/compound_drift.py`. Written out with the table of scripts in `WORKFLOW.md`. | Records findings **R-1** and **R-2** of Book 5's round 1. Clause (a) is what Book 5's drafter found in its own script: two controls written `paragraph.replace("the", …)`, a no-op on a paragraph that happens not to contain `the`. Round 1 found the same shape in three further scripts (`verify_source_book4.py:234`, `book04/review/…:275`, `book03/review/…:135`) and two unasserted-precondition variants — none a no-op today, none saying so; a control that is sound by luck is not sound. **Clause (b) is the half that survives the fix, and the reviewer demonstrated it rather than asserting it**: its own rule had a control that deleted a twelve-word run, asserted that the text had changed, and still did not fire, because the measure counted only the fraction of chapter-5 tokens that aligned and every surviving token still did. A control that cannot fail and a control whose measure cannot see it are indistinguishable from outside. **The rule caught a third instance while it was being applied**: `book04/review/…`'s one-letter control took the paragraph's longest whitespace token, `understanding.”`, and doubled its last character — a real mutation, invisible to a fingerprint that normalizes punctuation. Clause (a) passed; clause (b) failed; the control was rebuilt on the paragraph's own letter runs. |
| **D19** | **Every Book reports its semicolon count against Butler's, beside the retention and the splitting rate.** Three numbers, not two. Computed by `semicolons()` in `scripts/build_book05_v2.py` and printed in each Book's `checks-vN.md`. Butler → candidate: Book 1 47 → 13, Book 2 36 → 21, Book 3 39 → 32, Book 4 68 → 50, **Book 5 34 → 13**. | Substantive finding **S-1** and records finding **R-6** of Book 5's round 1. Book 5 v1 reported the package's highest splitting rate (+23.5%) and its second-highest retention (0.94211), and those two facts had one cause: Butler's 34 semicolons became **12**, so **22 of the 36 added sentences were a semicolon rewritten as a period** — an operation that adds a sentence, moves no clause, drops no word and costs no retention, and therefore scores at full value on **both** of D17's axes while leaving the architecture exactly as Butler built it. That is precisely the blindness D17 declares of itself. The semicolon count is the denominator D17 is missing: it says how much of the added sentence count came from the operation that moves nothing. It is a *report*, not a gate — breaking Butler's semicolons is the correct first move, they are the true seams of his periods, and a Book with few semicolons in its source cannot be convicted for not converting them. |


## Next

**Books 1–5 are accepted. Book 6 is drafted and frozen and waits on its
independent review** (`book06/review-instructions.md`, five questions put
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

- **A3. The served `original-en`'s Book 3 ¶38 is defective, and only a change
  to a production file can really fix it.** 196 of its 208 words are the served
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
