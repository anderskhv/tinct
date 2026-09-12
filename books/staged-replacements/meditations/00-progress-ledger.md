# Meditations modern-English — progress ledger

Branch `claude/meditations-modern-en-20260911-v2`. Content agent for the
Meditations thread; the coordinator reads this file, Anders does not read the
session. Kept current at every push.

## Done

- 2026-09-11 — Read the Odyssey Book 10 template package (branch
  `claude/wizardly-allen-ra9p0k`, commit `25d36f36`) and the Book 9 style
  reference; read the 2026-09-11 translation audit's Meditations note and its
  reading standard (`claude/upbeat-brown-cuttkn`).
- 2026-09-11 — `WORKFLOW.md` written: eight steps, template reference, scope
  and voice rules.
- 2026-09-11 — Source verified. The served `original-en` is Meric Casaubon
  1634 (PG #2680), not George Long 1862 as the registry claims; complete
  against PG #2680 (412 paragraphs) but non-standard in numbering (Casaubon's
  Book II starts at standard II.4). Full evidence in `PROVENANCE.md` §1.
- 2026-09-11 — Human-edition assessment done against the accessibility
  standard: Casaubon 1634, Collier/Zimmern 1701/1887, Long 1862, Rendall 1898,
  Jackson 1906, Haines 1916 read from fetched texts; Farquharson 1944 and all
  post-1960 translations ruled out on rights. None meets the standard
  unchanged (`PROVENANCE.md` §2).
- 2026-09-11 — Corrected `original-en` staged from Long 1862 (PG #15877):
  `meditations-original-en.staged.json`, 12 books, 487 paragraphs (one per
  numbered section), built by `scripts/build_original_en_from_pg15877.py`
  from the committed source text; Book II cross-checked against Standard
  Ebooks (`PROVENANCE.md` §3–4).
- 2026-09-11 — `GLOSSARY.md` written and pushed: one rendering per recurring
  concept (nature, reason, the ruling part, the god within, providence, the
  common good, and the rest), plus voice and form rules, fixed before any
  drafting.
- 2026-09-11 — **Book II drafted and frozen** (steps 2–3): `book2/candidate-v1.json`
  (sha256 `42002ed4…`), 17 paragraphs 1:1 with Long's II.1–II.17, word ratio
  0.945 (min paragraph 0.88). Readable copy, `continuity.md`,
  `provenance.json`, `manifest.json`, `review-instructions.md` and six review
  packets pushed. **Stopped for independent review** (step 4, coordinator's
  reviewer session). Findings expected under `book2/review/`.
- 2026-09-11 — **Book II accepted** (steps 4–8). Round-1 independent review
  (`book2/review/findings-v1.md`): Accept after corrections, 5 substantive +
  20 minor. All applied in `book2/candidate-v2.json` (sha256 `8fcc64e2…`) via
  `scripts/build_book2_v2.py`; every change listed in
  `book2/changes-v1-to-v2.md`; changed passages verified by word diff; flow
  read done with two further within-Long fixes; acceptance recorded in
  `book2/ACCEPTANCE.md`. `continuity.md` and `provenance.json` updated.
- 2026-09-11 — **Book I drafted and frozen** (steps 2–3): `book1/candidate-v1.json`
  (sha256 `e1d816d3…`), 17 paragraphs 1:1 with Long's I.1–I.17, word ratio
  0.970 (min paragraph 0.92). Readable copy, `continuity.md`,
  `provenance.json`, `manifest.json`, `review-instructions.md` and six review
  packets pushed, built by the new generic `scripts/build_book_package.py`
  from `scripts/candidates/book1.py`. **Stopped for independent review**
  (step 4). Findings expected under `book1/review/`.
- 2026-09-11 — **Book I accepted** (steps 4–8). Round-1 independent review
  (`book1/review/findings-v1.md`): Accept after corrections, 0 substantive +
  19 minor (11 worth improving, 8 optional preference). All applied in
  `book1/candidate-v2.json` (sha256 `07c7f4b6…`) via
  `scripts/build_book1_v2.py`; every change listed in
  `book1/changes-v1-to-v2.md`; three "also noted" points declined with reasons;
  changed passages verified by word diff; dagger clauses I.9 and I.14 restored
  verbatim; flow read done with one further within-Long fix (I.12); acceptance
  recorded in `book1/ACCEPTANCE.md`. `continuity.md`, `provenance.json`,
  `manifest.json` and `README.md` updated. The three pending glossary rows
  (discontented, in a way, spirits) added to `GLOSSARY.md`.
- 2026-09-11 — **Book III drafted and frozen** (steps 1–3): `book3/candidate-v1.json`
  (sha256 `7079d32b…`), 16 paragraphs 1:1 with Long's III.1–III.16, word ratio
  0.985 (min paragraph 0.94). Source verified from the staged Long chapter 3
  into `book3/source-book3.json` (sha256 `c417f5bc…`); no new glossary row
  needed (every recurring term in Book III was already fixed). Readable copy,
  `continuity.md`, `provenance.json`, `manifest.json`, `README.md`,
  `review-instructions.md` and six review packets (5×3 + 1) pushed, built by
  `scripts/build_book_package.py 3` from `scripts/candidates/book3.py`.
  **Stopped for independent review** (step 4). Findings expected under
  `book3/review/`.
- 2026-09-11 — **Book III accepted** (steps 4–8). Round-1 independent review
  (`book3/review/findings-v1.md`): Accept after corrections, 0 substantive +
  12 minor (5 worth improving, 7 optional preference). All applied in
  `book3/candidate-v2.json` (sha256 `b7038469…`) via
  `scripts/build_book3_v2.py`; every change listed in
  `book3/changes-v1-to-v2.md`; 6.3 resolved by dropping Long's "[or,
  practically]" as apparatus (D11); four "also noted" points applied (Long's
  own word restored: set off, maintain, chastened, when) and four declined
  with reasons; changed passages verified by word diff; dagger clauses III.3,
  III.4, III.11 verbatim; flow read done with one further within-Long fix
  (III.11 "But I know; for this reason"); acceptance recorded in
  `book3/ACCEPTANCE.md`. `continuity.md`, `provenance.json`, `manifest.json`
  and `README.md` updated. No new glossary row.
- 2026-09-11 — **Staged original rebuilt** (Book IV step 1). Three PG
  illustration captions had survived into the staged Long (`[Illustration: …]`
  appended to IV.20, V.8, IX.21). `scripts/build_original_en_from_pg15877.py`
  now strips them; the file was rebuilt, sha256 `7bf2d1b1…` → `b0ecf3da…`,
  487 paragraphs before and after, only those three paragraphs changed,
  chapters 1–3 byte-identical (so Books I–III's `source-bookN.json` and
  acceptances stand; a note was added to their `provenance.json`). Recorded in
  `PROVENANCE.md` §4 (D12).
- 2026-09-11 — **Book IV drafted and frozen** (steps 1–3): `book4/candidate-v1.json`
  (sha256 `d85924d1…`), 51 paragraphs 1:1 with Long's IV.1–IV.51, word ratio
  0.993 (min paragraph 0.83, a dropped cross-reference). Source verified from
  the rebuilt staged Long chapter 4 into `book4/source-book4.json` (sha256
  `eeef63f6…`). Five glossary rows added before drafting (perturbation →
  disturbance; seminal → generative; mutation/transmutation →
  change/transformation; vulgar → commonplace / the common sort of men; "the
  All" → the whole) and "reasonable animal" added to the rational-being row.
  Nine dagger clauses named in `review-instructions.md` and kept as Long has
  them. Readable copy, `continuity.md`, `provenance.json`, `manifest.json`,
  `README.md`, `review-instructions.md` and seventeen review packets (17×3)
  pushed, built by `scripts/build_book_package.py 4` from
  `scripts/candidates/book4.py`. **Stopped for independent review** (step 4).
  Findings expected under `book4/review/`.
- 2026-09-11 — **Book IV accepted** (steps 4–8). Round-1 independent review
  (`book4/review/findings-v1.md`): Accept after corrections, 0 substantive +
  8 minor (2 worth improving, 6 optional preference). Seven applied in
  `book4/candidate-v2.json` (sha256 `20d2b4df…`) via
  `scripts/build_book4_v2.py`; one declined with a recorded reason (22.1 —
  IV.22 keeps the glossary's "impulse"; the row distinguishes by sense, IV.40
  is left open by record, and V.3 will take "impulse" too); every change listed
  in `book4/changes-v1-to-v2.md`; six "also noted" points left with reasons;
  changed passages verified by word diff; nine dagger clauses (ten marks —
  the reviewer's recount of IV.19 ×3 is right, `book4/continuity.md` corrected
  from "nine places"; `PROVENANCE.md` §4 already had it) verbatim; flow read
  done with one further within-glossary fix (IV.36 "the nature of the whole",
  which v1 had left as Long's "the nature of the universe" against the glossary
  row and Book II's precedent); acceptance recorded in `book4/ACCEPTANCE.md`.
  `continuity.md`, `provenance.json`, `manifest.json` and `README.md` updated.
  No new glossary row.
- 2026-09-11 — **Book V drafted and frozen** (steps 1–3): `book5/candidate-v1.json`
  (sha256 `9b061974…`), 36 paragraphs 1:1 with Long's V.1–V.36, word ratio
  0.995 (min paragraph 0.95). Source verified from the rebuilt staged Long
  chapter 5 into `book5/source-book5.json` (sha256 `284c37be…`); V.8 confirmed
  clean of the PG caption. Two glossary rows added before drafting (affects →
  feelings; the formal / the material → form / matter) and two extended
  ("leading principle" into the ruling-part row; "common weal" into the
  common-good row). Seven dagger marks (V.9, V.12 ×4, V.28 ×2; four clauses)
  named in `review-instructions.md` and kept as Long has them; V.28's
  bracketed fragment "Neither tragic actor nor whore." kept verbatim as a
  final sentence. Six D11 drops listed (V.8 ×4, V.14, V.32) plus the Hesiod
  citation in V.33; six supplements folded. Base-text defects recorded (V.15
  "snowed", V.29 "them", V.32 "though"; V.1 and V.5 flagged for the reviewer).
  Readable copy, `continuity.md`, `provenance.json`, `manifest.json`,
  `README.md`, `review-instructions.md` and twelve review packets (12×3)
  pushed, built by `scripts/build_book_package.py 5` from
  `scripts/candidates/book5.py`. **Stopped for independent review** (step 4).
  Findings expected under `book5/review/`.
- 2026-09-11 — **Book V accepted** (steps 4–8). Round-1 independent review
  (`book5/review/findings-v1.md`): Accept after corrections, 0 substantive +
  5 minor (3 worth improving, 2 optional preference). All five applied in
  `book5/candidate-v2.json` (sha256 `9a14c3ae…`) via
  `scripts/build_book5_v2.py` — 1.1 "vainglorious" (Long's fourth cognate
  pair restored), 10.1 "so enveloped" (Long's root, no competing idiom), 26.1
  "do not let the ruling part, of itself, add", 33.1 bare "name" restored,
  36.1 "I do not know how"; the two optional findings were applied because
  neither v1 reason survived the reviewer's point (D8); every change listed
  in `book5/changes-v1-to-v2.md`; four "also noted" points left with reasons;
  changed passages verified by word diff; four dagger clauses (seven marks)
  verbatim; V.29 ellipsis kept. Reviewer rulings recorded in
  `book5/continuity.md`: V.15/V.29/V.32 evident word confirmed; V.5 "for
  them" confirmed; V.28 fragment is text, kept verbatim; V.33 citation drop
  confirmed; V.1 "rather than to perfect" is **not** a defect (reads "prefer
  neither X nor Y to Z") and the v1 continuity lines saying it "wants a
  negative" are corrected. Flow read done, no further change. Acceptance
  recorded in `book5/ACCEPTANCE.md`. `continuity.md`, `provenance.json`,
  `manifest.json` and `README.md` updated. No new glossary row.
- 2026-09-11 — **Book VI drafted and frozen** (steps 1–3): `book6/candidate-v1.json`
  (sha256 `78fbe619…`), 59 paragraphs 1:1 with Long's VI.1–VI.59, word ratio
  0.987 (min paragraph 0.88, a dropped cross-reference). Source verified from
  the staged Long chapter 6 into `book6/source-book6.json` (sha256
  `2384b4d0…`); staged-file hash `b0ecf3da…` re-verified. One glossary row
  added before drafting (beneficence / benevolent → kindness / kind, promoted
  from `book1/continuity.md`) and two extended (the bare noun "the universal"
  into the whole row; "vexation" / "vexed because" into the resent row).
  Three dagger marks (VI.38, VI.41 inside Long's bracket, VI.50 at the end;
  three clauses) named in `review-instructions.md` and kept as Long has them.
  Seven cross-references dropped (VI.2, VI.9, VI.10, VI.28, VI.30, VI.36,
  VI.38) and five D11 drops listed (VI.35 ×2, VI.39, VI.41, VI.50 ×2 counting
  "[men]" and "[conditionally]"); seven supplements folded, three of them
  flagged for the reviewer (VI.43 "the earth", VI.45 "neither good nor bad",
  VI.50 "[not]" inside the dagger sentence). Base-text defects recorded and
  checked against Standard Ebooks' Long: VI.41 PG "wilt not blame" (rendered
  without the "not"), VI.49 "dissatisfied. I suppose" (comma), VI.27 stray
  capital. Readable copy, `continuity.md`, `provenance.json`, `manifest.json`,
  `README.md`, `review-instructions.md` and twenty review packets (19×3 + 2)
  pushed, built by `scripts/build_book_package.py 6` from
  `scripts/candidates/book6.py`. **Stopped for independent review** (step 4).
  Findings expected under `book6/review/`.
- 2026-09-11 — **Book VI accepted** (steps 4–8). Round-1 independent review
  (`book6/review/findings-v1.md`): Accept after corrections, 0 substantive +
  3 minor (2 worth improving, 1 optional preference). All three applied in
  `book6/candidate-v2.json` (sha256 `8ee718d5…`) via
  `scripts/build_book6_v2.py` — 9.1 VI.9 "contains this from outside / is
  contained within this nature" (Long's "comprehends" in its older sense,
  which now reads as "understands"), 50.1 VI.50 "Let us try to persuade
  men." (Long's "[men]" is a referent supplement, folded — reclassified in
  `continuity.md` from the D11 list to the folded list), 15.1 VI.15 "the
  breathing of the air" (the optional item, applied under D8; v1 had recorded
  no reason for "breathing in"); every change listed in
  `book6/changes-v1-to-v2.md`; three "also noted" points left with reasons;
  changed passages verified by word diff; three dagger clauses verbatim as
  specified. Reviewer rulings recorded in `book6/continuity.md`: VI.50
  "[not]" fold, VI.43 fold, VI.45 fold, VI.41 PG "not" a base-text error,
  VI.41 dagger-bearing bracket and VI.39 and VI.50 "[conditionally]" D11
  drops, VI.49 comma, VI.27 lowered, VI.34 "patricides" kept. The reviewer's
  record note acted on: `PROVENANCE.md` §3 no longer says Standard Ebooks
  "removes" Long's brackets; it says SE variously runs them as text, keeps
  them, or omits them, and that each book's `continuity.md` records the state
  per case. Flow read done, no further change. Acceptance recorded in
  `book6/ACCEPTANCE.md`. `continuity.md`, `provenance.json`, `manifest.json`
  and `README.md` updated. No new glossary row.
- 2026-09-12 — **Staged original rebuilt, second time** (Book VII step 1, D12).
  Three of Long's footnotes are printed flush left in the PG text ("See
  Aristophanes, Acharnenses, v. 661." and "From the Apologia, c. 16." twice,
  PG lines 4600, 4602, 4604), so the build's footnote filter — which tested
  for an *indented* `[A]` opener — missed them and appended them to VII.45 as
  if they were Long's text. `scripts/build_original_en_from_pg15877.py` now
  matches unindented openers too; the file was rebuilt, sha256 `b0ecf3da…` →
  `7798607d…`, 487 paragraphs before and after, VII.45 the only paragraph
  changed, chapters 1–6 byte-identical (so Books I–VI's `source-bookN.json`
  files and acceptances stand; a note was appended to each of their
  `provenance.json` files). The other 124 footnotes in the body were already
  being stripped correctly. Recorded in `PROVENANCE.md` §4.

- 2026-09-12 — **Book VII drafted and frozen** (steps 1–3): `book7/candidate-v1.json`
  (sha256 `1823989f…`), 75 paragraphs 1:1 with Long's VII.1–VII.75, word ratio
  0.995 (min paragraph 0.70, VII.12 — a ten-word meditation whose whole
  difference is the dropped cross-reference). Source verified from the
  **twice-rebuilt** staged Long chapter 7 into `book7/source-book7.json`
  (sha256 `67e7bfd3…`); staged-file hash `7798607d…`. One glossary row added
  before drafting (imagination → imagination, Long's second English word for
  *phantasia*, promoted from the Book II and Book III candidates) and two
  extended (the paired noun "the causal" into the form/matter row; the
  reflexive "vex ourselves at" into the resent row) — committed and pushed
  before any paragraph was written. Seven dagger marks in four sections
  (VII.16 ×2, VII.31 ×2, VII.46 ×2, VII.67; seven clauses) named in
  `review-instructions.md` with their PG line numbers and kept as Long has
  them. Seven cross-references dropped (VII.12, VII.19, VII.23, VII.25,
  VII.29, VII.30, VII.75) and six D11 drops listed (VII.9 "[order]", VII.10
  "[causal]", VII.29 "[formal]", VII.68 "[reality]", VII.72 "[social]",
  VII.75 "[continuity]"); nine supplements folded, of which two are flagged
  (VII.2 "[thoughts]" and VII.17 "[happiness]", both folded as appositions on
  the VI.50 "[men]" ruling). No verse citation had to be dropped: the three in
  VII.45 were Long's footnotes and the step-1 rebuild removed them from the
  staged original itself. Base-text defects recorded (VII.5 "what-soever", a
  line-break hyphen, rendered "whatever"; VII.58's broken ending "and
  remember…", ellipsis kept on the V.29 precedent). **Six decisions flagged
  for the reviewer's ruling**: VII.2 fold-or-drop, VII.13 keeping Long's
  transliterated Greek (*melos* / *meros*) because the meditation is a pun on
  two words differing by one letter, VII.16 applying glossary renderings
  inside dagger clauses, VII.17 "Eudaemonia, happiness, is a good god
  within", VII.50 "unsentient" → "that have no sensation" (the book's one
  expansion), VII.55 "for both are animal" kept exactly as Long has it.
  Readable copy, `continuity.md`, `provenance.json`, `manifest.json`,
  `README.md`, `review-instructions.md` and twenty-five review packets (25×3)
  pushed, built by `scripts/build_book_package.py 7` from
  `scripts/candidates/book7.py`. **Stopped for independent review** (step 4).
  Findings expected under `book7/review/`.

- 2026-09-12 — **Book VII accepted** (steps 4–8). Round-1 independent review
  (`book7/review/findings-v1.md`): Accept after corrections, 0 substantive + 5
  minor (2.1, 9.1 documentation-only, 14.1, 20.1, 66.1) + 1 optional preference
  (8.1), 69 paragraphs with no material issue. **All five findings that propose
  a change were applied** in `book7/candidate-v2.json` (sha256 `a80e224d…`) via
  `scripts/build_book7_v2.py` — 2.1 VII.2 "continually" → "continuously"
  (Long's word; his image is a fire kept alight, not relit), 8.1 VII.8
  "carrying with you" → "having with you" (the optional item, applied under D8:
  VII.8 was not in `continuity.md` at all, so no considered reason was on
  record, and "carrying" added a faint physical image Long does not have), 14.1
  VII.14 the inserted "it" removed (Long's absolute "parts which have felt";
  the "it" created a garden path), 20.1 VII.20 "that I should do" → "that I may
  do" (after a colon "should" reads as obligation and reverses Long's "lest"),
  66.1 VII.66 "know that Telauges" → "know whether" (Long's "if" is "whether";
  "that" turns an open question into a challenge). **9.1 is documentation only**
  and both base-text variants are recorded in `book7/continuity.md`: PG
  "participate in the reason" and lowercase "one god" against Standard Ebooks'
  "the same reason" and "God"; the candidate rightly follows PG under D6.
  Every change listed in `book7/changes-v1-to-v2.md`; no finding declined; the
  reviewer's "also noted" points left with reasons; changed passages verified
  by per-paragraph word diff (five tokens in five paragraphs, nothing else in
  the book); seven dagger clauses (four sections) verbatim; VII.45's corrected
  ending and VII.58's ellipsis intact. **All six flagged decisions were ruled
  the drafter's way and are now recorded as settled** in `book7/continuity.md`,
  none left open: VII.2 "[thoughts]" is a fold (VI.50 "[men]" ruling), VII.13's
  transliterated Greek is kept, VII.16's glossary renderings inside the dagger
  clauses are right, VII.17's "Eudaemonia, happiness, is a good god within" is
  the best available route **with the record that its "within" comes from the
  glossary row and not from the etymology**, VII.50's "the elements that have
  no sensation" is **the book's one licensed one-off expansion and must not be
  cited as precedent**, and VII.55's "for both are animal" is rightly kept. A
  third base-text slip the reviewer found is recorded (VII.54's stray comma,
  rightly not reproduced), alongside the two already on record (VII.5
  "what-soever", VII.58's broken ending), both confirmed. **`GLOSSARY.md` gained
  an explicit exception** (at the reviewer's suggestion, before VIII.57): the
  "the candidate never uses the Greek" note governs the glossary's own Greek
  column, and Long's in-text transliterated Greek is his text and is kept. Flow
  read done, no further change. Acceptance recorded in `book7/ACCEPTANCE.md`.
  `continuity.md`, `provenance.json`, `manifest.json` and `README.md` updated.
  No new glossary rendering row.

- 2026-09-12 — **Book VIII drafted and frozen** (steps 1–3): `book8/candidate-v1.json`
  (sha256 `9f42a271…`), 61 paragraphs 1:1 with Long's VIII.1–VIII.61, word ratio
  0.992 (min paragraph 0.89 — VIII.8 and VIII.13, both dropped apparatus and a
  shortened idiom; no paragraph below 0.89, and 39 of 61 sit between 0.99 and
  1.02). **Step 1: the staged original was NOT rebuilt, and the claim is proved
  rather than asserted.** After two earlier rebuilds (Book IV, illustration
  captions; Book VII, flush-left footnotes), PG #15877 was re-read line by line
  for Book VIII (lines 4933–5418) for every one of those classes: nine
  footnotes, **all indented** (lines 4969, 5045, 5131, 5160, 5218, 5223, 5277,
  5396, 5414) and all already stripped; no flush-left footnote opener; no
  illustration caption (the nearest, line 5628, is in Book IX); no running head,
  page number or catchword; **no verse and no verse citation at all**; and the
  two flush-left bracket lines in VIII.41 (5247, 5249) are Long's own bracketed
  words wrapping, not footnote openers. `scripts/build_original_en_from_pg15877.py`
  was then re-run and its output is **byte-identical** to the file on the branch
  — `cmp` clean, sha256 still `7798607d…`, 487 paragraphs, 12 chapters — so no
  paragraph anywhere changed and **no accepted book is reopened**. Source
  verified into `book8/source-book8.json` (sha256 `c380295d…`). One glossary row
  **extended before drafting** (the nature-of-the-whole row now covers Long's
  third shape "the nature of the universal", VIII.5, VIII.6, VIII.35; committed
  and pushed before any paragraph was written); no new rendering row needed.
  Three dagger marks in three sections (VIII.35 line 5193, VIII.38 line 5226,
  VIII.51 line 5345) named in `review-instructions.md` with their PG line
  numbers and kept as Long has them. Four cross-references dropped (VIII.9,
  VIII.12, VIII.40, VIII.41); **nine D11 drops in ten brackets** (VIII.3
  "[forms]" and "[or conformable to their pursuits]", VIII.7 "[form]", VIII.8
  "[or ability]" ×2, VIII.11 "[or form]", VIII.17 "[chance]", VIII.41
  "[desires]" and "[unconditionally, or without any reservation]", VIII.52
  "[avoids or]"); **twelve supplements folded**, each listed in
  `book8/continuity.md` with the referent supplements named per the VI.50 and
  VII.2 rulings (VIII.1 "[to others]", VIII.4 "[Consider]", VIII.17 "[that which
  is the cause]", VIII.21 "[the body]", VIII.27 "[between thee and other
  things]", VIII.33 "[wealth or prosperity]", VIII.45 "[change of place]" —
  referent; VIII.6 "[to us]", VIII.31 "[but of a whole race]", VIII.41 "[into
  consideration]", VIII.51 "[and not a mere well]", VIII.55 "[of one man]" —
  completions). Twenty-two brackets, all accounted for. No expansion: nothing in
  the book uses more words than Long for a term, and the twenty-one short
  meditations stay at his length. Base-text points recorded after a word-level
  diff of the whole book against Standard Ebooks' Long: four PG slips (VIII.1
  "thou shall", VIII.6 stray comma, VIII.37 **"Fergamus"** rendered
  **"Pergamus"**, VIII.45 "comformably") and **two places where PG is right and
  SE is wrong** (VIII.2 "is the work", VIII.44 "do **not** consider"), both
  followed as PG has them. **Three decisions flagged for the reviewer**: VIII.37
  "Pergamus" (the one departure from PG's letters in the book), VIII.57's
  transliterated Greek kept under the new glossary exception (a weaker case than
  VII.13, since Long's English carries the etymology without it and SE moves it
  to an endnote), and "effusion" / "effused" kept at VIII.51 and VIII.57.
  Readable copy, `continuity.md`, `provenance.json`, `manifest.json`,
  `README.md`, `review-instructions.md` and twenty-one review packets (20×3 + 1)
  pushed, built by `scripts/build_book_package.py 8` from
  `scripts/candidates/book8.py`. **Stopped for independent review** (step 4).
  Findings expected under `book8/review/`.

- 2026-09-11 — **Session collision, twice.** Two content sessions were spawned
  on this thread for the Book II corrections step (this one and
  `session_01UqGstUkaLuExn3RNzcxUs8`, the one whose pushes stand). Both ran
  steps 6–8 on Book II and then steps 1–3 on Book I in parallel; both pushed;
  the second session's pushes were rejected as non-fast-forward each time.
  The texts were near-identical in Book II (five paragraphs differed, all on
  minor findings where the reviewer allowed either route) and of comparable
  quality in Book I. Resolution (D9): the first pushed version stands for both
  books; the second session discarded its duplicates rather than push a
  competing acceptance or a second Book I candidate, and stopped. **Coordinator:
  one content session per step on this branch; do not spawn a second while
  one is running.**

## Decided, and why

| # | Decision | Why |
|---|---|---|
| D1 | Modernise rather than stage a human edition unchanged. | No legally reusable human translation meets the standard. Rendall 1898 is nearest but lapses into thou-forms, keeps Victorian diction, adds interpretive coinages, and exists only as OCR. |
| D2 | The one documented source is George Long 1862, PG #15877. | Literal, standard numbering, clean digital text, PD in US and Denmark, and it is what the registry already promises. Casaubon (the served text) is 1634 English with non-standard numbering; Haines is more archaic; Rendall freer. |
| D3 | Stage a corrected `original-en` (Long) rather than modernise the served Casaubon. | The brief says to stage the correct edition with evidence if the served one is misattributed. Modernising Casaubon would perpetuate a false translator credit and non-standard numbering, and would fight 1634 syntax. Consequence: paragraph count changes 412 → 487; see "Needs Anders". |
| D4 | One paragraph per numbered section; each paragraph begins with its section number. | Keeps meditation numbering visible and stable, and gives the modern edition exact 1:1 alignment with the staged original. |
| D5 | Long's bracketed supplements, cross-references and verse citations kept in the staged original; footnotes, dagger marks and PG apparatus removed. | The brackets are Long's translation; the rest is scholarly apparatus, not text. All normalisations are listed in `PROVENANCE.md` §4 and reproducible by script. |
| D6 | PG #15877 preferred over the Standard Ebooks text as the base file. | PG keeps Long's square brackets uniformly; SE does not (it variously runs them as text, keeps them, or omits them — see `PROVENANCE.md` §3, amended at Book VI acceptance; this row's earlier wording, "SE removes them", carried the same imprecision). The two otherwise differ only in spelling convention and punctuation. SE used as a cross-check. |
| D8 | Apply every review finding in Book II, including the discretionary ones, and record the two glossary/continuity reversals (II.1 "share of the divine", II.16 "ourselves"). | Each proposed wording stayed inside Long and the glossary; declining any would have needed a reason better than the reviewer's, and none existed. Sets the pattern for later books: minor findings are applied unless `continuity.md` already records a considered reason not to. |
| D7 | Chapter titles `Book 1`…`Book 12`, matching the served file's title style. | Keeps the app's existing chapter labelling; a change of style is not this task's call. |
| D10 | In Book I, Long's "undeviating" is kept in all three places (I.8, I.14, I.16), not only in the dagger-marked I.14. | Dagger clauses stand verbatim (Book II rule); rendering the same Long word two ways in one book would be a worse inconsistency than keeping a slightly formal but current word. Pattern for later books: where a dagger clause fixes a word, the unmarked uses of the same word in that book follow it. |
| D11 | Long's bracketed *alternative renderings* ("[or, practically]", III.6) are apparatus and are dropped; his bracketed *supplements* ("[deity]", "[death]", "[to other things]") are folded into prose as before. | A second translation of one Greek word is Long talking to the reader about his choices, like a cross-reference, not part of Marcus's sentence; folded, it reads as if Marcus named a third kind of good. Raised by the Book III reviewer (finding 6.3). Each drop is listed in the book's `continuity.md`. |
| D12 | The staged original may be rebuilt to remove PG apparatus that the build missed, provided the paragraph count and every already-accepted chapter are byte-identical before and after, and the hash change is recorded here, in `PROVENANCE.md` §4 and in each affected `provenance.json`. | The staged file is this package's own artefact, and an illustration caption is not Long's text; leaving it would put "[Illustration: …]" into the edition. Chapters 1–3 unchanged, so no acceptance is reopened. |
| D9 | On a session collision, the first pushed version stands; the later session discards its duplicate, records any residual point here, and stops. | One accepted text per book and one frozen candidate per review round; two hashes for the same step would be unreadable to the coordinator and the reviewer. |

## Next

**Waiting on the coordinator: independent review of Book VIII.**
`book8/candidate-v1.json` (sha256 `9f42a271…`) is frozen, with twenty-one
packets, `review-instructions.md` and `manifest.json` in place; findings go
under `book8/review/`. Three decisions are flagged there for an explicit ruling
(VIII.37 "Pergamus" for PG's "Fergamus"; VIII.57's transliterated Greek kept
under the glossary exception added at Book VII acceptance; "effusion" /
"effused" kept at VIII.51 and VIII.57). The reviewer is also asked to test the
step-1 finding that the staged original needed **no** rebuild for Book VIII.
This agent does not review its own draft, and Book IX has not been started.

After the review: Book VIII steps 6–8 (candidate v2, changes log, flow read,
`ACCEPTANCE.md`), then Books IX … XII in numerical order, each with its own
review round.

## Needs Anders (listed, not waited on)

- **A1. Paragraph-structure change.** Adopting the corrected Long
  `original-en` changes Meditations from 412 to 487 paragraphs with different
  boundaries. Served `modern-en`, `modern-da`, R2 audio, static
  `read/meditations` chapter pages and saved positions for this book all key on
  the old structure. The modern-en staged here aligns to the new structure.
  Decision needed before anything is integrated: accept the re-basing (and
  schedule modern-da and audio regeneration, out of this task's scope), or
  keep Casaubon and relabel it (in which case this modern-en would not align).
  Work continues on the assumption the re-basing is accepted.
- **A2. Registry attribution** is false today ("Long Translation (1862)" on a
  Casaubon text). Fixing it is app/registry work, outside this task.

## Open, not blocking

- Long's dagger-marked passages (textually uncertain Greek) are listed in
  `PROVENANCE.md` §4; reviewers should weigh findings there accordingly.
- II.14 PG reading "that which perish" vs Standard Ebooks "perishes"; kept as
  PG has it in the staged original.
- Book II v2, II.5: "You see how few things there are which, if a man lays hold
  of them, he can live a life…" reproduces Long's dangling relative ("the
  which if a man lays hold of, he is able to live"), ungrammatical in modern
  English. Not a meaning defect; a candidate for a v3 at the next review
  touchpoint (for example "You see how few the things are; and if a man lays
  hold of them, he can live a life…"). Noted by the second content session,
  not changed, per D9.
- The three glossary rows formerly listed here ("in a manner → in a way",
  "dissatisfied → discontented", plural "daemons → spirits") were added to
  `GLOSSARY.md` at Book I acceptance. Done.
