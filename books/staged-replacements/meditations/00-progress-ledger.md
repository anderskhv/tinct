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

- 2026-09-12 — **Book VIII accepted** (steps 4–8). Round-1 independent review
  (`book8/review/findings-v1.md`, reviewer session spawned by the coordinator,
  which did not draft the candidate): **Accept after corrections**, **0
  substantive**, 4 minor (1.1, 7.1, 55.1, 58.1) and 4 optional preferences
  (1.2, 12.1, 41.1, 51.1); 54 of 61 paragraphs "No material issue found", every
  paragraph covered once and in order. Accepted file `book8/candidate-v2.json`
  (sha256 `dbc4598c…`), built from the frozen v1 (`9f42a271…`, never edited) by
  `scripts/build_book8_v2.py`. **Nine substitutions in seven paragraphs**
  (VIII.1, VIII.7, VIII.12, VIII.41, VIII.51, VIII.55, VIII.58); 54 untouched;
  word ratio 0.9921 → 0.9914; per-paragraph word diff shows only the intended
  tokens changed anywhere in the book. **All four minor findings applied and
  three of the four optional ones; one declined (1.2) and recorded as
  considered.**
  - **7.1** VIII.7's em dash restored to **Long's comma** — the dash took
    "worth" out of the six-item list and made the other five an appositive
    gloss on it, which is an interpretation Long did not print and which
    contradicted `continuity.md`'s own six-item note. Sheet and text now agree.
  - **1.1 / 55.1 / 58.1 answered as ONE decision, applied, and promoted to a
    general rule** in `GLOSSARY.md` (Voice and form): Long's "shall / shalt" as
    a plain future — statement, or subordinate clause of condition or time — is
    "will" or the plain present; "shall" is kept only where it is current
    English in its own right (first person; emphatic/volitional; the
    deliberative "shall" of a first- or third-person direct question; the
    subjunctive of a negative consecutive clause), and second-person "shall" in
    a question takes "will". **Five changes** — VIII.1, VIII.55, VIII.58 ×2 and
    VIII.51 (the reviewer's "also noted" fourth case, taken with the rest
    because one decision for the book means one decision). **Four "shall"
    survive, each licensed and each asserted by the build script**: VIII.1's
    deliberative question, VIII.14's and VIII.45's first person, and VIII.32's
    consecutive subjunctive (not a future; no finding reaches it; recorded as
    considered and left). **The finding's premise is corrected on the record**:
    three third-person plain futures do stand in already-accepted books (III.9,
    VII.8, VII.24), not zero. They are **not** reopened — see "Open, not
    blocking".
  - **12.1 applied** — VIII.12 "peculiarly" → "particularly". The edition keeps
    the current collocation "peculiar to X" (III.16, VII.22, VII.55) and renders
    Long's attributive "peculiar" outside it (V.3, VI.3); this adverb is outside
    it and follows VI.3.
  - **41.1 applied by a third route** — VIII.41 "absolutely" →
    "**unconditionally**". The D11 drop of "[unconditionally, or without any
    reservation]" **stands**; the primary word is rendered by Long's own first
    alternative instead. Folding the bracket (the reviewer's proposal) would put
    one of the book's ten D11 brackets back into the prose with no principle
    separating it from the other nine; leaving "absolutely" bare leaves it
    reading as an intensifier, which points the sentence away from the next
    sentence's contrast. One word for one word, nothing added, D11 untouched.
  - **51.1 applied** — VIII.51 "joined" reverted to Long's "**conjoined**". The
    change had been made inside the dagger-marked clause (PG line 5345), where
    the VI.50 / VII.16 practice is that Long's clause stands with only pronouns
    and glossary renderings changed; "conjoined with" is current English anyway.
  - **1.2 declined** — VIII.1's quoted thought stays reported. Long's quoted
    thought is in the **second** person (Marcus addressing himself) while every
    other quoted thought in the book is in the first, so the direct form would
    force either a quotation that reads as someone else speaking to Marcus or a
    change of person Long does not have.
  **All three flagged decisions ruled the drafter's way and recorded as
  settled**, none left open: VIII.37 "Pergamus" for PG's "Fergamus" stands;
  "effusion" / "effused" stand at VIII.51 and VIII.57; and **VIII.57's Greek
  stands on stronger grounds than the draft claimed** — "its rays are called
  Extensions because they are extended" is a *tautology* in English, not an
  etymology, since no English speaker calls rays "Extensions"; Long coined the
  word to expose the derivation and his own footnote calls it "a piece of bad
  etymology", so the sentence makes no claim at all without the Greek. That
  corrected reasoning is written into `book8/continuity.md` so the question does
  not reopen at a later book. The reviewer also tested the step-1 **no-rebuild**
  finding three ways (byte-identical rebuild, class-by-class re-read of PG
  4933–5418, independent bracket recount) and upheld it, including that VIII.41's
  two flush-left bracket lines are Long's wrapped text and not footnote openers;
  and located all four PG slips and both PG-over-Standard-Ebooks calls (VIII.2's
  article, VIII.44's "not") at their cited PG lines and upheld every one. Flow
  read done, no further change. Acceptance in `book8/ACCEPTANCE.md`;
  `changes-v1-to-v2.md`, `continuity.md`, `provenance.json`, `manifest.json` and
  `README.md` updated; mechanical checks re-run and passing. No new glossary
  rendering row — one general voice rule.

- 2026-09-12 — **Book IX drafted and frozen** (steps 1–3): `book9/candidate-v1.json`
  (sha256 `b02cf135…`), 42 paragraphs 1:1 with Long's IX.1–IX.42, word ratio
  0.9965 (min paragraph 0.79 — IX.20, a nineteen-word meditation whose whole
  difference is the dropped cross-reference; next lowest IX.17 at 0.93 and
  IX.28 at 0.96, both dropped cross-references; 33 of 42 sit between 0.99 and
  1.02). **Step 1: the staged original was NOT rebuilt, and this was the book
  where it might have had to be.** The Book VIII reviewer warned that PG #15877
  line 5628 carries an illustration caption inside Book IX — the same class of
  apparatus that forced the Book IV rebuild, and in fact the third of the three
  captions that rebuild removed. It is **already stripped**: the caption stands
  alone between the end of IX.21 and the start of IX.22, the filter added at
  Book IV removes it, IX.21 ends "a thing to be afraid of." and IX.22 begins
  "22.", and no `[Illustration` survives anywhere in the staged file. PG lines
  5419–5864 were then re-read line by line for every other class: **eight
  footnotes** (PG 5462, 5515, 5601, 5649, 5680, 5707, 5778, 5858), all indented
  and all already stripped; **no flush-left footnote opener**; exactly **three**
  standalone flush-left lines in the whole book (the `IX.` header, the `X.`
  header and the caption); no running head, no page number, no catchword; **no
  verse and no verse citation at all**; and no Greek in the body (every
  `[Greek: …]` span in the range is inside a footnote body). Proof rather than
  assertion: `scripts/build_original_en_from_pg15877.py` was re-run and its
  output is **byte-identical** to the file on the branch — `cmp` clean, `git
  status` clean, sha256 still `7798607d…`, 487 paragraphs, 12 chapters, section
  profile unchanged with 42 in Book 9 — so no paragraph anywhere changed and
  **no accepted book is reopened**. Confirmation added to `PROVENANCE.md` §4.
  Source verified into `book9/source-book9.json` (sha256 `aca874d0…`). One
  glossary row **extended before drafting** (Long's "divinity" as a modified
  count noun — "the highest divinity", "the same divinity", IX.1 — keeps
  "divinity", while the row's "the divine" governs his bare abstract uses;
  committed and pushed before any paragraph was written); no new rendering row
  needed. **First book drafted under the "shall" rule** fixed at Book VIII
  acceptance: three plain futures rendered without "shall" (all in IX.3) and
  eight kept, all licensed — six first-person deliberative questions at IX.40,
  one indirect deliberative question inside Epicurus's reported speech at IX.41,
  and IX.29's emphatic "They themselves shall judge", which is offered to the
  reviewer for confirmation. Three dagger marks in three sections (IX.6 line
  5525, IX.26 line 5661, IX.27 line 5669) named in `review-instructions.md` with
  their PG line numbers and kept as Long has them. Six cross-reference spans
  dropped in five paragraphs (IX.1, IX.17, IX.20, IX.28 ×2, IX.35). **No D11
  drops at all** — Book IX contains four brackets and not one is an alternative
  rendering of the III.6 "[or, practically]" kind, so **all four are folded**
  (IX.9 "[this union]" and IX.22 "[to examine]" as referent supplements under
  the VI.50 / VII.2 / VIII rulings, IX.24 "[such is everything]" and IX.26 "[of
  this]" as completions), and Standard Ebooks runs all four as plain text. No
  expansion: the twelve short meditations stay at Long's length. Base-text
  points recorded after a word-level diff of the whole book against Standard
  Ebooks' Long: one PG slip (IX.34 **"pool souls"**, rendered **"poor souls"**,
  with Long's own "their poor souls" at IX.27 as the internal witness), **three
  places where PG is right and SE is wrong or adds a word** (IX.35 "bound" for
  SE's "found", IX.35 SE's added "done", IX.40 "Pray thou:" for SE's "Another
  prays:", which breaks the alternation the passage is built on), one genuinely
  **open variant** (IX.29 PG "insolence" against SE "indolence" — both English
  words, both making sense; PG followed under D6), and one SE typographic
  paragraph break inside IX.28 which is not a section break (PG's 42 sections
  match the standard count). **Two decisions flagged for the reviewer** (IX.34's
  correction, the one departure from PG's letters in the book; IX.29's
  "insolence") **and one offered for confirmation** (IX.29's emphatic "shall").
  Readable copy, `continuity.md`, `provenance.json`, `manifest.json`,
  `README.md`, `review-instructions.md` and fourteen review packets (14×3) pushed,
  built by `scripts/build_book_package.py 9` from `scripts/candidates/book9.py`.
  Mechanical checks in `book9/README.md` pass. **Stopped for independent review**
  (step 4). Findings expected under `book9/review/`.

- 2026-09-12 — **Book IX accepted** (steps 4–8). Round-1 independent review
  (`book9/review/findings-v1.md`): *Accept after corrections*, **1 substantive**
  (40.1), 3 minor (1.1, 9.1, 41.1) and 5 optional preferences (1.2, 3.1, 7.1,
  28.1, 29.1); 35 of the 42 paragraphs "No material issue found". Accepted as
  `book9/candidate-v2.json` (sha256 `56dd7d13…`), built from the frozen v1 by
  `scripts/build_book9_v2.py`; **three paragraphs changed (IX.1, IX.9, IX.40),
  39 untouched**; every change listed in `book9/changes-v1-to-v2.md`; word ratio
  0.9965 → 0.9960.
  - **40.1 applied (substantive)** — IX.40's three corrective turns restored to
    **imperatives**: "You, pray thus:" / "You, pray:" / "You thus:" for v1's "Do
    you pray thus:" / "You pray thus:" / "You thus:". In modern English the
    first was a yes/no question and the second a declarative claiming the reader
    already prays that way — the reverse of Marcus's point. The reviewer's
    repair taken as proposed: the vocative comma restores the mood in all three,
    keeps Long's fronted second person, keeps the three-two-two diminuendo and
    adds no word. "Do pray thus:" rejected (drops the fronted pronoun); the
    comma alone in both first turns rejected (flattens the diminuendo).
  - **1.1 applied, both halves** — the sheet's "four times" corrected to
    **three**, and the unrecorded fourth substitution **undone**: Long's "for"
    is restored at IX.1 ("…contrary to truth, **for** he had received powers
    from nature…"). "For" is current English and needed no modernising; Long's
    two "for"s mark the two explanatory descents of a sentence already carrying
    three "since".
  - **9.1 applied** — IX.9 "and in a way, loves" → "and, in a way, loves", so
    "loves" is not read as a verb. One comma; the one place in the book a modern
    reader was likely to mis-parse.
  - **41.1 applied as a rule fix** — `GLOSSARY.md`'s "shall" rule widened from
    "the deliberative 'shall' of a **direct** question" to "a question, **direct
    or indirect**", with IX.41 added beside VIII.1 as the example. Committed
    **before Book X was drafted**. No text change; IX.41 keeps its "shall".
  - **1.2 applied** — IX.1's semicolon restored ("the nature of the things that
    are**;** and the things that are have a relation…"); the two definite
    articles the candidate added stay (*ta onta* reads as a term with them, and
    lowering the semicolon had spliced two independent clauses).
  - **Four optional findings declined, each recorded with its reason** in
    `book9/continuity.md` at its paragraph: **3.1** (IX.3's dropped "made" — the
    reviewer's own repair is further from Long and the reviewer preferred the
    drop recorded to undone, so it is now recorded); **7.1** (IX.7's mixed
    semicolon and colon — Long's accidentals stand, nothing misdirects, and
    repointing for evenness alone is unlicensed, unlike the commas actually
    moved at IX.9 and IX.29, which change how a clause parses); **28.1** (IX.28
    "do not let yourself also be governed" — the proposed repair drops Long's
    load-bearing "also", and the permissive shade is not wrong in a sentence
    whose point is that the ruling part stays yours); **29.1** (IX.29 "All of
    them drivel." — "Drivellers, all of them." restores a word ruled not
    current, and "Drivel, all of it." moves the referent from the men to their
    talk).
  **Every base-text call was endorsed and all three flagged decisions are
  settled**: IX.34 "poor souls" upheld without reservation (the reviewer
  confirmed by grep that IX.27's "poor souls" and IX.34's "pool souls" are the
  *only* two occurrences of the phrase in the whole PG file, so the internal
  witness is exact); IX.35's "bound" and PG's ellipsis over SE's added "done";
  IX.40 "Pray thou" not "Another prays"; and the SE paragraph break inside IX.28
  correctly ignored. **IX.29's variant is CLOSED in favour of "insolence"** on
  grounds stronger than D6 — the meditation is about grandiosity, the clause
  answers "Simple and modest is the work of philosophy", and indolence has no
  antecedent anywhere in it — with the reviewer's limitation on the record (no
  Greek text consulted). The **"shall" audit passed**: eleven in Long, three
  removed (all IX.3), eight kept and all licensed, IX.29's "They themselves
  shall judge" confirmed emphatic. The **step-1 no-rebuild finding was upheld by
  the stronger method**, not by a re-run: an independently written
  reconstruction of PG lines 5419–5864 diffed word for word against the staged
  Book IX, whose only three differences in the whole book are the three
  documented dagger marks. That method is adopted for Book X. Flow read done, no
  further change. Acceptance in `book9/ACCEPTANCE.md`; `changes-v1-to-v2.md`,
  `continuity.md`, `provenance.json`, `manifest.json` and `README.md` updated;
  mechanical checks re-run and passing. No new glossary rendering row.

- 2026-09-12 — **Book X drafted and frozen** (steps 1–3): `book10/candidate-v1.json`
  (sha256 `95ce5f7c…`), 38 paragraphs 1:1 with Long's X.1–X.38, word ratio 0.994
  (min paragraph 0.88 — X.23, whose whole difference is the nine-word bracketed
  translator's note dropped as apparatus; next X.5 at 0.90 and X.13 at 0.95,
  both dropped cross-references; max 1.08 at X.29, where "Severally" becomes
  "One by one"; 26 of 38 sit between 0.99 and 1.02 and **five are byte-identical
  to Long** — X.16, X.17, X.18, X.19, X.35). **Step 1: the staged original was
  NOT rebuilt, and the check was NOT a re-run of the build.** The Book IX
  round-1 reviewer's point is now the package's method: byte-identity to a
  re-run proves only that the file matches the script, which is exactly how the
  Book IV captions and the Book VII footnotes survived the first build. PG lines
  5866–6374 were re-extracted by an **independent reconstruction written from
  scratch**, `scripts/verify_book10_source.py`, and diffed word for word against
  the staged Book X: **38 paragraphs, and the only four differences in the whole
  book are the four documented dagger marks** (X.9 PG 6038, X.19 PG 6132, X.25
  PG 6183, X.31 PG 6229). Class by class: **seventeen footnotes** in eleven
  indented runs, all indented, none flush left, all stripped, with all seventeen
  in-text markers gone (sixteen from flush-left text, one from inside Long's
  indented verse at PG 6306 — which is why opener and flush-left marker counts
  differ by one); no illustration caption; exactly one standalone flush-left line
  (the `X.` header); no running head, page number or catchword; **verse present
  and correctly joined** — Long's Homer couplet at PG 6305–6306 (indented five
  spaces) into X.34, against the Odyssey quatrain at PG 6026–6029 (indented
  seven spaces inside footnote [B]) dropped with the footnote; no verse citation
  in the body; no Greek in the body. A flush-left footnote body of the VII.45
  kind would have shown as a diff; none did. sha256 still `7798607d…`, 487
  paragraphs, `git status` clean — **no rebuild, no accepted book reopened**.
  Confirmation added to `PROVENANCE.md` §4. Source verified into
  `book10/source-book10.json` (sha256 `db635cde…`). **Two glossary rows
  extended before drafting** (committed and pushed before any paragraph was
  written): Long's "political [social] animal" → **"a political being"** (X.2,
  the bracket dropped under D11), and his "a good daemon [happiness]" → **"a
  good god within—happiness"** (X.13, on the accepted Book VII's VII.17
  rendering, the gloss folded as an apposition). No new rendering row.
  **Second book drafted under the "shall" rule**, and the first under its
  widened wording: 23 in Long, **six kept** (five first-person "I shall" at X.6;
  X.36's "that there shall not be by him", the negative consecutive subjunctive
  of the VIII.32 class) and **seventeen removed**, all plain futures; Book X
  contains no deliberative question, so the widened clause does not itself fire.
  Four dagger marks in four sections named in `review-instructions.md` with
  their PG line numbers and kept as Long has them — X.9's falls at a sentence
  boundary and affects no clause; X.25's falls at Long's comma after "afraid",
  and that comma is **kept** on the VI.50 / VII.16 / VIII.51 practice. Four
  cross-reference spans dropped in three paragraphs (X.5, X.13 ×2, X.26).
  **Eighteen brackets: fifteen folded, two dropped under D11** (X.2 "[social]",
  X.33 "[order]" — each a second English word for a Greek word whose primary
  rendering Long has already given; *this line read "sixteen folded" until Book X
  acceptance, where finding C1 recounted it — sixteen + two + one is nineteen
  against eighteen brackets. The accepted counts, after finding 15.1 moved X.15's
  "[political community]" to the D11 drops, are **fourteen folded, three dropped
  under D11, one translator's note dropped under D13**, asserted by the build*), **plus one further drop of the same family
  that is not an alternative rendering**: X.23's "[The three last words are
  omitted in the translation.]", a **translator's note** about Long's own
  handling of Plato's Greek, dropped as apparatus with the cross-references and
  footnotes (Standard Ebooks omits it too). **One bracket that looks like a D11
  case is deliberately folded instead** — X.21's "[is wont]", because the
  meditation *is* the double sense of the one Greek verb, so dropping it would
  delete the observation rather than remove a note about Long's choices; the
  VII.13 / VIII.57 principle in another form. No expansion. Base-text points
  recorded after a word-level diff of the whole book against Standard Ebooks'
  Long: **one PG slip** (X.15 "Let **me** see", rendered "Let **men** see",
  which the parallel with "let them know" requires), **two places where PG is
  right and SE is wrong** (X.6 "turn all my efforts" against SE's "turn an my
  efforts"; X.36 "at least some one" against SE's "at last someone"), one slip
  present in **both** texts in different clauses (X.32 "thou are" for "thou
  art", which neither reaches the candidate), PG's Latin name forms kept at X.27
  under D6, and five SE typographic paragraph breaks (X.2, X.13, X.28, X.34 ×2)
  which are not section breaks — the IX.28 ruling. **Three decisions flagged for
  the reviewer** (X.15's correction, the one departure from PG's letters in the
  book; X.9's "Mimi" kept untranslated, where Long's only explanation is a
  footnote the package drops; X.32's "You, only determine…", applying the
  vocative-comma repair the Book IX review made at IX.40) **and one offered for
  confirmation** (Long's comma after "afraid" kept inside the X.25 dagger
  clause). Readable copy, `continuity.md`, `provenance.json`, `manifest.json`,
  `README.md`, `review-instructions.md` and thirteen review packets (12×3 + 2)
  pushed, built by `scripts/build_book_package.py 10` from
  `scripts/candidates/book10.py`. Mechanical checks in `book10/README.md` pass.
  **Stopped for independent review** (step 4). Findings expected under
  `book10/review/`.

- 2026-09-12 — **Book X accepted** (steps 4–8). Round-1 independent review
  (`book10/review/findings-v1.md`): *Accept after corrections*, **0 substantive**,
  6 minor (1.1, 15.1, 21.1, 23.1, 32.1 and the chapter-level C1) and 5 optional
  preferences (9.1, 33.1, 34.1, 36.1, 36.2); 29 of the 38 paragraphs "No material
  issue found". The reviewer calls Book X **"the cleanest book in the package so
  far as prose"** — a token-level diff of all thirty-eight paragraphs shows
  every difference between Long and the candidate accounted for by a documented
  decision, and the complete list of words the candidate uses that occur nowhere
  in Long's Book X is eleven, each documented. Accepted as
  `book10/candidate-v2.json` (sha256 `8ba528dc…`), built from the frozen v1
  (`95ce5f7c…`, never edited) by `scripts/build_book10_v2.py`; **six
  substitutions in five paragraphs (X.15, X.21, X.32, X.33, X.36 ×2), 33
  untouched**; word ratio 0.9943 → 0.9927. **All six minor findings applied and
  three of the five optional ones; two optional findings recorded and left, both
  of which the reviewer itself proposed as records rather than changes.**
  - **21.1** — X.21's gloss moved **outside** Long's quotation marks: `that
    "this or that loves"—is wont—"to be produced?"`. The fold is confirmed (the
    meditation *is* the verb's double sense), but v1's dashes inside the
    quotation credited common speech with words it does not use, and the
    meditation depends on the saying being exactly what people say.
  - **32.1** — **the one place the reviewer rules against the drafter.**
    v1's "You, only determine…" becomes **"Only determine to live no longer
    unless you are such."** The IX.40 vocative comma earned its place by an
    *alternation* X.32 has not; here the fronted "You," carries nothing, reads as
    a summons to a stranger rather than self-address, and invites the misparse
    "only *you* determine". The IX.40 repair is **localised, not narrowed**: the
    vocative is licensed where a fronted pronoun carries a contrast.
  - **15.1** — X.15's "[political community]" **dropped under D11** instead of
    folded, so the D11 line is drawn the same way as at X.2 and X.33. Same shape
    (a second English rendering of one Greek word), same answer to the operative
    test (the meditation's point survives the drop), and Long uses neither word
    again in the section so nothing dangles.
  - **23.1** — **D13 added to this ledger** for Long's bracketed translator's
    notes, worded to generalise; `book10/continuity.md`'s X.23 entry now cites
    D13, not D11.
  - **C1** — the bracket arithmetic corrected in all five places (this ledger,
    `book10/continuity.md` ×2, `book10/README.md` prose and check-block comment,
    `book10/review-instructions.md` with a dated note, `book10/provenance.json`).
    **The arithmetic is now asserted by `scripts/build_book10_v2.py` and by the
    `README.md` check block from an enumerated fold list** — 14 folds + 3 D11
    drops + 1 translator's note = the 18 brackets in the source — so a numeral
    that disagrees with the list is a build failure rather than a reading error.
  - **1.1** — X.1's comma removal recorded, and `book10/continuity.md` gains a
    **punctuation tally in one place**: five commas removed, one raised to a
    semicolon, two added, two replaced by em dashes at acceptance, one kept
    inside a dagger clause, two spaced dashes inherited from the verse join.
  - **Optional: 33.1 applied** (X.33's apposition set with em dashes, as X.13's
    and X.21's are; under D8, since v1 recorded no reason for the commas),
    **36.1 applied** ("by him" → "**beside** him"; Long means at his side and
    the modern reading is agentive — the "shall" is untouched and stays
    defended), **36.2 applied** ("some one" → "**someone**"; 1862 typography,
    normalised with the spelling and the dashes, and the "least"/"last"
    base-text ruling is untouched). **9.1 left** (X.9 "gravity" is a
    virtue-name in a list of virtue-names and the reviewer would leave it) and
    **34.1 left** (X.34's two spaced dashes are inherited from the verse join,
    the paragraph is byte-identical to the staged original, and changing it
    would mean changing a `PROVENANCE.md` §4 rule reaching five other books).
  **All four flagged decisions are settled**, three the drafter's way: X.15
  "Let men see" upheld on four converging grounds and still the one departure
  from PG's letters in the book; X.9 "Mimi" upheld **ungloss'd**, with no gloss
  exception warranted; X.25's comma inside the dagger clause confirmed kept; and
  X.32 overruled (finding 32.1). Every base-text call was endorsed — X.6's
  "all" and X.36's "at least" against Standard Ebooks, the "thou are" slip in
  both texts correctly invisible, X.27's Latin names under D6, and the five SE
  typographic breaks rightly ignored on the IX.28 ruling. The **"shall" audit
  passed**: all 23 classified independently and matched to the drafter's report
  exactly, with X.11's and X.32's questions confirmed **rhetorical** rather than
  deliberative, so the clause widened at Book IX never fires in Book X, and no
  new case added to the three third-person futures under "Open, not blocking".
  The **step-1 no-rebuild finding was upheld by the stronger method, with the
  reconstruction's own RULES audited** against the raw PG range before its output
  was looked at — twelve maximal indented runs enumerated with their
  indentation profiles (so the footnote rule cannot have swallowed Long's Homer
  couplet at 6305–6307, indented five against the footnotes' four), the marker
  recount reconciled exactly (16 flush-left + 1 inside the verse = 17 for 17
  indented openers), and no flush-left footnote body and no illustration caption
  anywhere. The **0.88 minimum ratio at X.23 was ruled on directly** (entirely
  the dropped note; 57 source words against 58 with the note set aside) and the
  **five byte-identical paragraphs** each checked against the accessibility
  standard and ruled right. Flow read done, no further change. Acceptance in
  `book10/ACCEPTANCE.md`; `changes-v1-to-v2.md`, `continuity.md`,
  `provenance.json`, `manifest.json`, `review-instructions.md` and `README.md`
  updated; mechanical checks re-run and passing. No new glossary rendering row
  and no voice rule changed — one new ledger decision row (D13).

- 2026-09-12 — **Book XI step 1: source verified, NO rebuild, and one
  undocumented build rule found and documented.** The check was the established
  stronger method, extended as the Book X reviewer extended it:
  `scripts/verify_book11_source.py`, written from scratch, **audits its own
  rules against the raw PG range before it reports its output**, then
  reconstructs PG lines 6376–6816 and diffs them word for word against the
  staged Book XI. Result: **39 paragraphs, matching the staged count, and the
  only differences in the whole book are the three documented dagger marks** at
  XI.8 (PG 6488), XI.15 (PG 6544) and XI.17 (PG 6577). The rule audit: **all
  seventeen maximal indented runs enumerated with their indentation profiles**
  — eleven footnote runs at **four** spaces, three verse runs in XI.6 at
  **six** (PG 6441–6442, 6446, 6450), two verse citations at 26 and 17 (PG
  6777, 6780), and one unmarked continuation of footnote [A]'s two-paragraph
  body at 6558–6559 — with flush-left text standing between every verse run
  and every footnote run, so the footnote-consumption rule **cannot** have
  swallowed Long's verse; **the marker recount reconciles exactly**, ten
  flush-left in-text markers plus one at the end of the indented verse line 6442
  = eleven, for eleven indented openers; **no flush-left footnote opener** (the
  VII.45 class) and **no illustration caption** (the Book IV class); the only
  three standalone short flush-left lines are Long's own connectives in XI.6,
  not running heads, page numbers or catchwords; and all five `[Greek: …]` spans
  are inside footnote bodies, so there is no Greek in the body. **One rule of the
  build was undocumented and is now documented**: a space before `,` `;` `:` `.`
  `?` `!` is closed up, which produced a fourth diff at XI.18 on the first run.
  It fires in exactly five lines in the whole translation body (IV.19, V.29,
  VII.58, VII.66, XI.18), every one at an ellipsis marking a lacuna in Long's
  Greek, and **changes no word anywhere** — a typographic normalisation of the
  em-dash class, so **no rebuild was made** and D12's standard is not engaged;
  recorded in `PROVENANCE.md` §4 and reproduced in the reconstruction so the two
  are compared on the same rules. sha256 still `7798607d…`, 487 paragraphs,
  twelve chapters, 39 in Book 11, `git status` clean, **no accepted book
  reopened**.

- 2026-09-12 — **Book XI drafted and frozen** (steps 2–3): `book11/candidate-v1.json`
  (sha256 `d0db3918…`), 39 paragraphs 1:1 with Long's XI.1–XI.39, word ratio
  **0.977** — the lowest in the package, and **the whole of the shortfall is
  apparatus**: eleven cross-reference spans, six source citations and five D11
  brackets, 89 words in all. The three lowest paragraphs are XI.32 (0.64), XI.31
  (0.67) and XI.36 (0.71), each a very short meditation whose entire difference
  is a dropped citation of five, three and four words; of the paragraphs carrying
  no apparatus at all **none is below 0.96**, twenty-two sit between 0.99 and
  1.02, and **seven are byte-identical to Long** (XI.14, XI.22, XI.24, XI.25,
  XI.28, XI.38, XI.39) — more than in any earlier book. Source verified into
  `book11/source-book11.json` (sha256 `41ff9b07…`); staged-file hash `7798607d…`,
  not rebuilt (see the step-1 entry above). **Two glossary rows fixed before
  drafting**, committed and pushed before any paragraph was written: the
  rational-being row **lost "rational soul"** from the variants it collects,
  because the edition has never rendered it that way (accepted Book VI keeps "a
  rational soul" at VI.14; accepted Book X keeps "an irrational soul" at X.33,
  confirmed at round 1), and the common-good row **gained "the common advantage"**
  (XI.13, already rendered "for the common good" in the accepted Book IV at
  IV.12). No new rendering row. **Third book drafted under the "shall" rule**: 8
  in Long, **two kept** (both XI.18, both first person, one also a direct
  deliberative question) and **six removed**, all plain futures — the hard one
  is XI.13's "Shall any man hate me?", treated as a **rhetorical** future on the
  X.11 / X.32 ruling and rendered "Will any man hate me?". **First book drafted
  under D13**, which does not fire: Book XI contains no bracketed translator's
  note of the X.23 kind. Three dagger marks in three sections (XI.8 PG 6488,
  XI.15 PG 6544, XI.17 PG 6577) named in `review-instructions.md` with their PG
  line numbers and kept as Long has them; **XI.15's and XI.17's daggers each fall
  immediately after one of Long's commas and both commas are kept**, on the X.25
  ruling. **Eleven brackets: six folded, five dropped under D11, none under D13 —
  6 + 5 + 0 = 11**, asserted by the `README.md` check block from an enumerated
  list, as finding C1 required. **Eleven cross-reference spans dropped in four
  paragraphs** (XI.18 alone carries eight, more than any section in the package)
  and **six source citations** — two verse citations (XI.31, XI.32, on the V.33
  Hesiod precedent) and four Epictetus references (XI.33–XI.36). Punctuation
  recorded in full: six commas before em dashes removed, two subject-verb commas
  removed, **exactly one comma added in the whole book** (XI.20's apposition
  fold), sixteen full stops supplied. Base-text points recorded after a
  word-level diff of the whole book against Standard Ebooks' Long: **one PG
  slip** (XI.18 "nattering", rendered **"flattering"** — Long writes "flatter"
  of exactly this at XI.14), **four places where PG is right and SE is wrong**
  (XI.18 "vexed" against SE's non-word "veied", *in the same clause as the PG
  slip*, so each text gets right what the other gets wrong; XI.8 "become"
  against SE's garbled "be to come"; XI.10 plural "natures"; XI.6 "sank"), one
  PG typographic slip (XI.10's missing full stop, supplied), one slip that does
  not reach the candidate (XI.15 "are" for "art"), two open variants followed
  under D6 (XI.1, XI.35), three 1862 hyphenations normalised under the X.36.2
  ruling, and Long's own broken ending at XI.18 kept on the V.29 / VII.58
  precedent. **Five decisions flagged for the reviewer** (XI.18's "flattering";
  XI.18's nine-word bracket folded — the largest in the package; XI.10's
  "[things indifferent]" dropped under D11 where the primary word is the *less*
  transparent of the two; XI.26's "[Ephesians]" folded as a mark of textual doubt
  rather than a supplement; XI.15's "at once" for "forthwith" beside the dagger
  clause) **and one offered for confirmation** ("pancratium" kept untranslated at
  XI.2, on the X.9 "Mimi" ruling). Readable copy, `continuity.md`,
  `provenance.json`, `manifest.json`, `README.md`, `review-instructions.md` and
  thirteen review packets (13×3) pushed, built by
  `scripts/build_book_package.py 11` from `scripts/candidates/book11.py`.
  Mechanical checks in `book11/README.md` pass, including the bracket-arithmetic
  assertion. **Stopped for independent review** (step 4). Findings expected under
  `book11/review/`.

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
| D13 | Long's bracketed **translator's notes** — his remarks in his own voice about his own handling of the Greek, of which "[The three last words are omitted in the translation.]" (X.23) is the first to arise — are apparatus of the cross-reference and footnote kind and are **dropped, not folded**. The test is **whose voice the bracket is in and what it is about**: a bracket that speaks *about the translation* — what Long omitted, supplied, transposed, conjectured or could not render — is Long addressing his reader, not Marcus addressing himself, and folding it would put a comment on a translation into the mouth of a man who did not write one. This is a **third class**, beside D11's bracketed *alternative renderings* (also dropped) and the bracketed *supplements* the glossary folds. **Limit:** where such a bracket is also the only place in the English in which a sense of Marcus's own argument exists, the X.21 "[is wont]" reasoning governs instead and it is folded — the test there is whether dropping it removes a note about Long's choices or deletes the observation the section is made of. Each drop is listed in the book's `continuity.md`. | Raised by the Book X round-1 reviewer (finding 23.1): D11 as worded reaches alternative renderings only, and the glossary's bracket rule reaches supplements, cross-references and verse citations, so this class had no rule at all. A drafter of Books XI–XII reading D11 literally would have folded it, and the natural mistake is the damaging one. |
| D9 | On a session collision, the first pushed version stands; the later session discards its duplicate, records any residual point here, and stops. | One accepted text per book and one frozen candidate per review round; two hashes for the same step would be unreadable to the coordinator and the reviewer. |

## Next

**Waiting on the coordinator: independent review of Book XI.**
`book11/candidate-v1.json` (sha256 `d0db3918…`) is frozen, with thirteen packets,
`review-instructions.md` and `manifest.json` in place; findings go under
`book11/review/`. **Five decisions are flagged there for an explicit ruling** —
XI.18's "flattering" for PG's "nattering", the one departure from PG's letters in
the book; XI.18's nine-word bracket "[If any have offended against thee, consider
first]" folded, the largest bracket in the package, with the question whether
**D13** should be read to cover a bracket that size whatever its content; XI.10's
"[things indifferent]" dropped under D11, the one drop where the primary word
Long leaves standing is the *less* transparent of the two; XI.26's "[Ephesians]"
folded as a mark of textual doubt rather than as a supplement or a second
rendering; and XI.15's "at once" for Long's "forthwith", chosen over the X.30
rendering because Long's own "immediately" stands nine words earlier inside the
dagger clause — **and one is offered for confirmation** ("pancratium" kept
untranslated at XI.2, on the X.9 "Mimi" ruling). The reviewer is also asked to
test the step-1 no-rebuild finding **by the stronger method rather than by
re-running either script**, and to audit the reconstruction's own **rules** as
the Book X reviewer did, which is the method Book XI's own step 1 used — and
which is what turned up the one undocumented build rule now recorded in
`PROVENANCE.md` §4. Two further things are put to the reviewer with reasons:
whether dropping the four **Epictetus** references is right, given that they
point outside the Meditations to a source Marcus names in his own text; and
whether each of the **seven byte-identical paragraphs** is rightly identical.
This agent does not review its own draft, and **Book XII has not been started**.

Book X is **accepted** (`book10/ACCEPTANCE.md`, `candidate-v2.json` sha256
`8ba528dc…`). After the Book XI review: Book XI steps 6–8 (candidate v2, changes
log, flow read, `ACCEPTANCE.md`), then Book XII, the last, with its own review
round.

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
- **Three third-person "shall" plain futures in already-accepted books** —
  III.9 "whether there shall be in your ruling part any opinion", VII.8 "if it
  shall be necessary", VII.24 "if even the perception of doing wrong shall
  depart". They diverge from the "shall" rule fixed at Book VIII acceptance
  (`GLOSSARY.md`, Voice and form). Not reopened: those acceptances are closed
  and the divergence is formal, not semantic. Candidates for a v3 at a later
  touchpoint, on the II.5 precedent. Recorded here because the Book VIII round-1
  finding asserted there were none, and a later reader collating would find that
  claim false; the finding's conclusion stands and was applied in full.
- The three glossary rows formerly listed here ("in a manner → in a way",
  "dissatisfied → discontented", plural "daemons → spirits") were added to
  `GLOSSARY.md` at Book I acceptance. Done.
