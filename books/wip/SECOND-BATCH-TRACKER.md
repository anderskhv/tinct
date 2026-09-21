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
| 6 | The Bacchae | `bacchae` | 0.620 | 11/11 REAL | freed | **Text accepted.** sha256 `19507a56111d7394a028782d42997e75028a0502fec39c97e631f6efc0f799a8` (2026-09-21). 4 rounds — round 2's name-normalization sweep missed the all-caps speaker-tag form (case-sensitivity gap), fixed directly as a mechanical, unambiguous correction rather than parking hard-won clean work; round 4 confirmed clean with a full case-sensitivity sweep. Release packet pending. |
| 7 | The Taming of the Shrew | `taming-of-the-shrew` | 0.624 | 12/12 REAL | freed | **Text accepted.** sha256 `51ef8f1b346059713de284d3247c104b5eea7f7294c2ad5e192b64360583462b` (2026-09-21). 5 rounds, the longest of the batch — rounds 1-2 fixed 9 defects; round 3 fixed a quantity drift + a first (incomplete) epithet-consistency pass; round 4 found a 5th missed "curst" occurrence (indexing mismatch between rounds' notes) and parked; fixed directly (judgment call) and confirmed clean by a final round-5 Opus pass using a coordinate-matched (not count-based) epithet sweep. Release packet done. |
| 8 | Julius Caesar | `julius-caesar` | 0.621 | 18/18 REAL | queued | Screening done |
| 9 | The Winter's Tale | `winters-tale` | 0.639 | 3 REAL-HEAVY/12 REAL | freed | **Text accepted.** sha256 `4c6ee62fec2b1c65230f378574a7c5b6551169e5824e1c9e012fbdea10f6da3d` (2026-09-21). 2 rounds, independently verified clean. Release packet done. |
| 10 | Othello | `othello` | 0.692 | 2 REAL-HEAVY/13 REAL | freed | **Text accepted.** sha256 `f1795c6e18574a9ffa59bb666366d8810653aa659e86723fdacb4e9eecc4fbb6` (2026-09-21). 2 rounds — round 1 fixed 2 defects (inconsistent partial name-form fix, reversed-meaning antonym); round 2 Opus adversarial re-verification confirmed both, ran a full non-sampled word-for-word read of the whole book, and found+fixed one further narrow defect (dropped verb/collapsed contrast in the First Senator's speech). Release packet done. |
| 11 | Twelfth Night | `twelfth-night` | 0.696 | 1 REAL-HEAVY/17 REAL | freed | **Text accepted.** sha256 `2388962f1d10a2619b72d9e47f74f4b695abe9eeb87bb9bd4d235c9e4c8b7374` (2026-09-21). 4 rounds — round 1 fixed 3 defects, wrongly self-certified clean; round 2 found 12 more in one class (erasure of source's own printed forms) + an off-by-one indexing error, parked 2/3; round 3 fixed all 13 plus found 1 more (Sir Toby's "cubiculo") via a rare-word cross-reference method; round 4 Opus confirmation, using its own independent sweep methodology, found nothing further. Release packet done. |
| 12 | The Merchant of Venice | `merchant-of-venice` | 0.682 | 1 REAL-HEAVY/19 REAL | **HARD PARKED** | Round 1 fixed 2 defects, claimed clean. Round 2 found 18 more defects in the "erasure of source's own printed forms" class (proper-noun swaps, malapropism erasure, imported emendation+invented gloss, meaning alterations, systematic Exeunt->Exit) plus a false verification claim, parked 2/3. Round 3 fixed all 18 plus 6 more found via a fresh sweep, self-reported clean. Round-4 independent Opus verification confirmed all 24 round-3 fixes correct but found **5 further live instances of the same class** on its own first independent pass (two-headed->two-faced Janus, a dropped clause+imported gloss on the angel coin, strumpet->wanton register-softening x2, an added bawdy paraphrase, wether->ram animal-category substitution) — proof the class was not yet exhausted after 2 correction rounds. 3-round budget spent. **HARD PARKED, no acceptance hash.** See PARKED.md. |
| 13 | Coriolanus | `coriolanus` | 0.683 | 29/29 REAL | freed | **Text accepted.** sha256 `012fdaaa359726830d58c6745b9e776891360256de19a0aec008f9831abb829c` (2026-09-21). 4 rounds — round 1 fixed 1 defect, wrongly self-certified clean; round 2 found 12 more (~30 occurrences) in the "erasure of source's own printed forms" class, parked 2/3; round 3 fixed all 35 paragraphs; round 4 ran a third, differently-instrumented sweep (lowercase-hapax cross-reference) that found zero further instances of the parked class, and fixed 3 narrow inverse-class additions. Release packet done. |
| 14 | Cymbeline | `cymbeline` | 0.648 | 1 REAL-HEAVY/28 REAL | freed | **Text accepted.** sha256 `37c9f0de37f0e55d906520605ca2794aedbbf7a0f87da2d0ec1c6b1a204cc904` (2026-09-21). 3 rounds — round 1's "zero defects" claim was wrong (length-ratio tripwire tuned to extremes, missed moderate compression); round 2 independent verification found+fixed 3 blocking defects (dropped clause, reversed deference direction, imported scholarly emendation); round 3 Opus adversarial re-verification confirmed clean via its own compression sweep, proper-noun map, and ~130-paragraph spot-check. Release packet done. |
| 15 | Henry V | `henry-v` | 0.695 | 1 REAL-HEAVY/22 REAL | **STRUCTURAL-SKIP** | `books/wip/green-henry-v/source.json` is missing the play's entire opening Prologue chorus ("O for a Muse of fire...") — confirmed by full-text search and by comparison with romeo-and-juliet's source, which does preserve its own Prologue chapter under this pipeline's convention. This is content loss in the locked source parse itself, not a candidate defect — fixing it means re-parsing/re-extracting the original text and renumbering all downstream chapters, which is structural source reconstruction, explicitly out of scope per the task instruction to skip such books. 0 review rounds run (would produce a false "full coverage" claim against an incomplete source). See `books/wip/green-henry-v/PARKED.md`. Next pool book pulled in its place. |
| 16 | The Merry Wives of Windsor | `merry-wives-of-windsor` | 0.731 | 23/23 REAL | B | Round 1 fixed 101 paragraphs (Evans's Welsh accent, Caius's "by gar", 2 broken jokes), claimed exhaustive. Round-2 independent Opus verification confirmed the speaker-tagged work but found round 1's sweep was tag-keyed, missing 8 untagged Evans/Caius continuation paragraphs, an entire third dialect voice (Mistress Quickly's malapropisms) never swept, a silently-modernized toponym (Colebrook->Colnbrook), a register-softening (punk->wench), a still-broken headline joke where round 1's own record misquotes source, plus ~23 undecided coinage flattenings. PARKED at 2/3 rounds, see PARKED.md. Round-3 fix pass dispatched with explicit tag-agnostic, whole-character scope (last round before hard park). |
| 17 | Richard III | `richard-iii` | 0.720 | 25/25 REAL | **PARKED (2/3)** | Round 1 (Sonnet) fixed 9 defects (Tewksbury ×5, Harry ×3, Tyrrel/Tyrell ×1) and self-certified clean, claiming a location-keyed 45-name map and a capitalized-token diff. Round-2 independent Opus verification confirmed structure (25 ch / 1,420 ¶), confirmed all 9 fixes correct (including that the Tyrrel/Tyrell fix correctly reproduces source's own inconsistency), and ran fresh sweeps: register-check on its own list (book-wide vocabulary diff + ~120-stem per-paragraph drop sweep) = **zero softening**, compression sweep on all 1,420 ¶ = clean, negation/quantity/oath sweeps = clean. But it found **15 live defects in the "erasure of source's own printed forms" class on its first pass**: Rougemount→Rougemont, Ha'rfordwest→Haverfordwest, `Exeunt`→"They exit"/"Exit" at 10 Act-5 locations while 29 other `Exeunt` are kept (2 of them also plural→singular), Mistress Shore→Mrs. Shore ×2 while ch1 keeps "Mistress", and a dropped "God speed". Three of four sub-patterns are *inconsistency* defects needing a book-wide convention decision, so not verifier-fixed. Round 3 to fix + re-sweep by location. See `books/wip/green-richard-iii/PARKED.md`. |
| 18 | Romeo and Juliet | `romeo-and-juliet` | 0.446 | 25/25 REAL-HEAVY, 1 truncated-quote flag | queued | Screening done |
| 19 | Macbeth | `macbeth` | 0.483 | 18 REAL-HEAVY/10 REAL | queued | Screening done |
| 20 | The Tempest | `the-tempest` | 0.453 | 8 REAL-HEAVY/2 REAL | queued | Screening done |
| 7 | Julius Caesar | `julius-caesar` | 0.621 | 18/18 REAL | freed | **Text accepted.** sha256 `be475cf9c2b8ed2b85be22d8a1f8cb9bb1a89332e31bf390e1272323c02f52b9` (2026-09-21). 1 round, independently verified clean. Release packet done. |
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
