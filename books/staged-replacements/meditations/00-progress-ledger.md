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
| D6 | PG #15877 preferred over the Standard Ebooks text as the base file. | PG keeps Long's square brackets (SE removes them); the two otherwise differ only in spelling convention and punctuation. SE used as a cross-check. |
| D8 | Apply every review finding in Book II, including the discretionary ones, and record the two glossary/continuity reversals (II.1 "share of the divine", II.16 "ourselves"). | Each proposed wording stayed inside Long and the glossary; declining any would have needed a reason better than the reviewer's, and none existed. Sets the pattern for later books: minor findings are applied unless `continuity.md` already records a considered reason not to. |
| D7 | Chapter titles `Book 1`…`Book 12`, matching the served file's title style. | Keeps the app's existing chapter labelling; a change of style is not this task's call. |
| D10 | In Book I, Long's "undeviating" is kept in all three places (I.8, I.14, I.16), not only in the dagger-marked I.14. | Dagger clauses stand verbatim (Book II rule); rendering the same Long word two ways in one book would be a worse inconsistency than keeping a slightly formal but current word. Pattern for later books: where a dagger clause fixes a word, the unmarked uses of the same word in that book follow it. |
| D11 | Long's bracketed *alternative renderings* ("[or, practically]", III.6) are apparatus and are dropped; his bracketed *supplements* ("[deity]", "[death]", "[to other things]") are folded into prose as before. | A second translation of one Greek word is Long talking to the reader about his choices, like a cross-reference, not part of Marcus's sentence; folded, it reads as if Marcus named a third kind of good. Raised by the Book III reviewer (finding 6.3). Each drop is listed in the book's `continuity.md`. |
| D12 | The staged original may be rebuilt to remove PG apparatus that the build missed, provided the paragraph count and every already-accepted chapter are byte-identical before and after, and the hash change is recorded here, in `PROVENANCE.md` §4 and in each affected `provenance.json`. | The staged file is this package's own artefact, and an illustration caption is not Long's text; leaving it would put "[Illustration: …]" into the edition. Chapters 1–3 unchanged, so no acceptance is reopened. |
| D9 | On a session collision, the first pushed version stands; the later session discards its duplicate, records any residual point here, and stops. | One accepted text per book and one frozen candidate per review round; two hashes for the same step would be unreadable to the coordinator and the reviewer. |

## Next

1. **Waiting on the coordinator: independent review of Book IV**
   (`book4/review-instructions.md`, `book4/review-packets/`, 17 packets). On
   findings: `book4/candidate-v2.json` via a change script in the established
   pattern, verification, flow read, `book4/ACCEPTANCE.md`.
2. Then Books V … XII in numerical order, each with its own review round.
   Book V is not started until Book IV is accepted.

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
