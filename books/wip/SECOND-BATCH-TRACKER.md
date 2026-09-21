# Second Batch (up to 20 books) — Tracker

Continuation of the green-library programme after the first ten-book batch
(see `GREEN-LIBRARY-TRACKER.md` — do not re-touch those ten). Same
acceptance bar: fidelity + genuine accessibility, both required, per
`TRANSLATION_PROTOCOL.md`. Same scope restrictions: content-only, staged,
no registry/deploy/audio/app changes. Up to 3 concurrent lanes.

**Carried-forward failure lessons from batch 1 (apply to every book here):**
- Never import wording from a different translation of the same source
  work, even if "more accurate" to the original-language text — fidelity
  is to the locked `source.json`, not to the author's full/other editions.
- Never silently "correct" a name/spelling/quotation to a historically
  standard form — reproduce the source's own printed form.
- Never let an accessibility gloss name a figure, place, or fact the
  source deliberately leaves unnamed/ambiguous — glosses may only define
  a term/reference already explicit in source's own words.
- Verify every correction against source directly — do not trust the
  correction's own stated rationale. Independently recheck every changed
  paragraph, and sweep wider when a fix touches a repeated name/term.
- "Non-blocking" needs a reader-centered reason (inherent difficulty of
  the idea, deliberate ambiguity, a structural constraint like locked
  paragraph count) — not just "the source did it."

## Inventory investigation (2026-09-21)

Ran `classify-modern-en.py` (mechanical screening signal only) across all
untouched books in `app/src/data/bookRegistry.ts` not in the first batch.
Found substantial **prior, pre-current-protocol repair work** in
`books/wip/`: `anna-karenina-repair/`, `brothers-karamazov-repair/` (+
`-verse-review/`), `confessions-repair/`, `don-quixote-repair/`,
`jane-eyre-repair/` (partial, 5 chapters only), `montaigne-repair/`,
`war-and-peace-repair/`, `wealth-of-nations-repair/`, plus draft-only
chunks for `ivan-ilyich-en/da` and `treasure-island/da` (no review
files). These are **fidelity-only audits against the current live text**
(no accessibility review, no whole-book non-sampled pass, no hash pin) on
very large novels (Anna Karenina, Brothers Karamazov, Don Quixote, War
and Peace all run 8-16 lettered batches each). Given "shortest credible
path," these are **not** in this batch's initial pool — completing even
one properly (full accessibility review + fill any fidelity gaps + whole
book pass) is a multi-session undertaking on its own scale, and Jane
Eyre's repair dir only touches 5 of ~38 chapters (not a near-complete
candidate). Flagging for a **future dedicated batch**, not starting here.

Gate-clean (screening signal only, not proof) candidates prioritized by
size/cleanliness, avoiding titles that show the 2026-05
mechanical-modernization failure signature (>60% LIGHT/MECHANICAL
buckets and/or >10% identical-long-paragraphs): `jerusalem` (77.8%
LIGHT/MECH, 31.9% identical), `vindication-rights-of-woman` (80%,
33.3%), `niels-lyhne` (85.7%, 10.9%), `walden` (100%, 16.9%, 13
MECHANICAL chapters), `on-liberty` (100%, 3 MECHANICAL), `genealogy-of-
morals` (75%), `aristotle-politics` (87.5%), `peloponnesian-war` (42.3%,
larger book) — all deferred to the "needs fresh drafting" lane, not
started.

## The pool (selected 2026-09-21, prioritized shortest/cleanest first)

| # | Book | id | Gate sim | Buckets | Lane | Stage |
|---|---|---|---|---|---|---|
| 1 | Medea | `medea` | 0.499 | 4 REAL-HEAVY/3 REAL | freed | **Text accepted.** sha256 `8aafd12a4c3fab2c24dd6776b00ba42da12c3bc2bf2a10ebe01e348dda699381` (2026-09-21). Took 3 rounds — round 1's coverage claim proved inaccurate (miscounted paragraphs), independent verification caught a silent name correction + dropped word, and a fresh full Opus pass then found 5 more blocking + 8 minor defects. Release packet pending. |
| 2 | Gilgamesh | `gilgamesh` | 0.547 | 1 REAL-HEAVY/11 REAL | **PARKED** | PARKED after 3 rounds — see `books/wip/green-gilgamesh/PARKED.md`. Recurring defect: systematic sexual-content softening (Shamhat's epithets, nakedness/pleasure euphemisms, "hierodule"->"temple women") only partially fixed by round 2; round 3 found 6 more instances of the same class plus new blockers (a meaning inversion, non-source wording imported at the stay-awake-test scene, invented detail inside an already-"fixed" paragraph, dropped sentences/proper nouns). Next book pulled from pool in its place. |
| 3 | Frederick Douglass (Narrative) | `frederick-douglass` | 0.658 | 12/12 REAL | **PARKED** | PARKED after 3 rounds — see `books/wip/green-frederick-douglass/PARKED.md`. Recurring defect: ch12 p2's Matthew 23 quotation kept importing NIV/ESV wording across 3 rewrites; round 4 surfaced 2 new book-wide defect classes (emphasis-markup loss, a second unmodernized KJV quote at ch12 p5). Next book pulled from pool in its place. |
| 4 | The Death of Ivan Ilyich | `ivan-ilyich` | 0.641 | 12/12 REAL | freed | **Text accepted.** sha256 `2132e58a400175fa679ecd5e811d66d4bd89fa9ce3b1f12270f004a62b311cbc` (2026-09-21). 3 rounds — round 1's whole-book name audit was count-based and missed a location mismatch; round 3 built a proper location-based occurrence map and found 2 more micro-corrections. Release packet pending. |
| 5 | A Midsummer Night's Dream | `midsummer` | 0.411 | 8 REAL-HEAVY/1 REAL | **PARKED** | PARKED after 3 rounds — see `books/wip/green-midsummer/PARKED.md`. Recurring defect: malapropism/deliberate-mangling erasure survived 2 fix rounds (12 restored) before round 3 found 3 MORE fresh instances (an invented "Rawr!" replacing Snug's "Oh!", a malapropism "deflower'd" both corrected and softened, "Jew" removed from "most lovely Jew"). Next book pulled from pool in its place. |
| 6 | The Bacchae | `bacchae` | 0.620 | 11/11 REAL | C | Reviewing (round 3 verification) |
| 7 | The Taming of the Shrew | `taming-of-the-shrew` | 0.624 | 12/12 REAL | queued | Screening done |
| 8 | Julius Caesar | `julius-caesar` | 0.621 | 18/18 REAL | queued | Screening done |
| 9 | The Winter's Tale | `winters-tale` | 0.639 | 3 REAL-HEAVY/12 REAL | queued | Screening done |
| 10 | Othello | `othello` | 0.692 | 2 REAL-HEAVY/13 REAL | queued | Screening done |
| 11 | Twelfth Night | `twelfth-night` | 0.696 | 1 REAL-HEAVY/17 REAL | queued | Screening done |
| 12 | The Merchant of Venice | `merchant-of-venice` | 0.682 | 1 REAL-HEAVY/19 REAL | queued | Screening done |
| 13 | Coriolanus | `coriolanus` | 0.683 | 29/29 REAL | queued | Screening done |
| 14 | Cymbeline | `cymbeline` | 0.648 | 1 REAL-HEAVY/28 REAL | queued | Screening done |
| 15 | Henry V | `henry-v` | 0.695 | 1 REAL-HEAVY/22 REAL | queued | Screening done |
| 16 | The Merry Wives of Windsor | `merry-wives-of-windsor` | 0.731 | 23/23 REAL | queued | Screening done |
| 17 | Richard III | `richard-iii` | 0.720 | 25/25 REAL | queued | Screening done |
| 18 | Romeo and Juliet | `romeo-and-juliet` | 0.446 | 25/25 REAL-HEAVY, 1 truncated-quote flag | queued | Screening done |
| 19 | Macbeth | `macbeth` | 0.483 | 18 REAL-HEAVY/10 REAL | queued | Screening done |
| 20 | The Tempest | `the-tempest` | 0.453 | 8 REAL-HEAVY/2 REAL | queued | Screening done |
| — | Oresteia | `oresteia` | 0.614 | 4 REAL-HEAVY/22 REAL | backup | Screening done, not started |
| — | Nicomachean Ethics | `nicomachean-ethics` | 0.635 | 1 REAL-HEAVY/9 REAL | backup | Screening done, not started |

Backups (Oresteia, Nicomachean Ethics) substitute automatically if any
pool book is parked or deferred per the three-round rule.

## Deferred / not started this batch

- **Meditations** (Marcus Aurelius) — explicit user instruction, stays
  deferred (needs fresh drafting).
- **Apology** (Plato) — explicit user instruction, stays deferred (needs
  substantial repair).
- **The large existing-repair novels** (Anna Karenina, Brothers
  Karamazov, Don Quixote, War and Peace, Wealth of Nations, Montaigne's
  Essays, Confessions) — substantial prior fidelity-only work exists but
  needs accessibility review + gap-filling + whole-book pass at a scale
  this batch isn't sized for. Recommended as the next batch's starting
  point given the head start.
- **Jane Eyre** — only 5 of ~38 chapters have any repair work; not a
  near-complete candidate.
- **Books showing the mechanical-modernization failure signature**
  (jerusalem, vindication-rights-of-woman, niels-lyhne, walden,
  on-liberty, genealogy-of-morals, aristotle-politics) — need fresh
  drafting assessment, not repair.

## Process notes

Same as first batch: Sonnet drafting/repair baseline, fresh candidate-
only accessibility review, independent Opus source-based fidelity
review, no paid API calls, up to 3 concurrent lanes, one editing owner
per book, park (don't lower the bar) after 3 correction rounds with
remaining blockers, move to next eligible book.
