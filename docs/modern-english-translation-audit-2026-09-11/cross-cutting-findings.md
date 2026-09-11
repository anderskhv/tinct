# Cross-cutting findings — 2026-09-11 audit

Findings from individual batches that generalize beyond one book, logged
here as they come in so they aren't lost in 101 separate note files. Feeds
the executive report's "main recurring defects" and "verification limits"
sections.

## Rights research that applies to the whole Shakespeare set (from B8)

No rights-clear human modern-English translation exists for any Shakespeare
play in Tinct's inventory. Play On Shakespeare (ACMRS Press) has complete
professional modern-verse translations of all 39 plays, but they are under
live commercial copyright (permission required). Everything actually
freely licensed — Standard Ebooks (CC0), Folger (CC BY-NC 3.0), Internet
Shakespeare Editions (non-profit use only), Open Source Shakespeare
(CC BY-NC) — is either noncommercial-restricted (fatal for a paid product
in both the US and Denmark/EU) or is the *original-language* text with
modernized spelling, not an actual modern-English rendering. This
conclusion is recorded once here rather than re-researched by every
Shakespeare batch (B4-B8); each batch's per-book note should reference this
file rather than re-deriving it, unless it finds a specific counter-example
for its own play.

## Methodology limitation: book-level similarity hides section-level drift

Confirmed independently by two batches (B8 on Cymbeline, B15 on Paradise
Lost and Beowulf): a book can have an unremarkable book-level
`mean_weighted_similarity` and `pct_identical_long_paragraphs` in the
Phase 1 mechanical data while one clearly-bounded section of it (a Act, a
set of Books/Fitts) is almost entirely unmodernized. Cymbeline Acts 1-4
average ~0.30 similarity (real rewrite) while Acts 5.3-5.5 (23.5% of the
play) sit at 0.65-0.68 (near-mechanical) — but the book-level
`pct_identical_long_paragraphs` is only 0.2%, so the existing screening
flag set reports the book as clean. Paradise Lost shows the same pattern
at the multi-Book level (Books 1-7 near-verbatim de-lineated Milton vs.
Books 8-12 genuinely modernized) and so does Beowulf (Fitts I-XXXII good,
XXXIII-XLIII barely touched). **This means every book's Phase 2 sampling
needed to actually spread across the book's full length rather than trust
a single book-level similarity number** — which is what the batch
instructions already required (opening/early/middle/late/outlier), so this
is a confirmation the methodology was necessary, not a gap in this audit.
It IS a real gap in the reusable Phase 1 tooling
(`mechanical/run_mechanical_checks.py`): a future run should emit
per-chapter similarity in the exported summary, not just a book-level
mean, so screening can catch this defect class without a full manual read.

## Two more failure modes to watch for in every remaining batch

1. **Source mislabeling/corruption masquerading as a modernization
   problem.** Faust Part One's `original-en` is credited to Bayard
   Taylor's verse translation in the registry but is actually a corrupted
   OCR prose crib (missing the opening monologue, untranslated German in
   49/895 paragraphs) — `modern-en`'s defects are all downstream of a
   broken source, not a translation-quality issue per se.
2. **A "good" word-token similarity score does not rule out the modern-en
   text being filled from an unrelated external source rather than an
   actual rewrite of the book's own content.** The Bible's modern-en sits
   in the "verified repair" similarity band (0.42, actually the *lowest*
   of any book, which naively reads as the *best* signal) while being
   verbatim NIV — an entirely different, copyrighted, external text. A
   good similarity score only tells you the modern-en text differs a lot
   from the core English source; it says nothing about whether the modern
   text is actually a faithful rendering of THIS book.

Both are now standing instructions to every in-flight batch (added to
their prompts from B18/B19-22 onward, and flagged here for batches that
were already dispatched before this was known — their agents should still
have been generally attentive to this since it's implied by the core
reading standard, but B1-B17's original instructions did not name these
two specific failure modes explicitly).

## Structural bug found in Shakespeare source parsing (from B8)

`richard-iii-original-en.json` (and mirrored in `-modern-en.json`) has
orphaned speaker-tag paragraphs in Act 4.4 — a bare `QUEEN MARGARET.` line
as its own paragraph, with her aside's content and its rhyme-word split
across the following two paragraphs. This is a source-parsing artifact from
whenever the play was originally parsed into JSON, not a translation
defect. Any repair must touch both English editions in lockstep to keep
paragraph alignment.

## Note on verse lineation across the whole Shakespeare set (from B8)

Both English editions (original-en and modern-en) render verse as prose —
line breaks are flattened. This is a pre-existing structural choice, not
introduced by modernization, but it erases Shakespeare's verse/prose
register switch (a real characterization signal — e.g. commoners speak in
prose, nobles in verse, and a character shifting from verse to prose
mid-scene is meaningful). Recorded here as a scope note for the executive
report, not a modern-en-specific defect.

## Two more methodology notes (from B1, epic poetry)

3. **`pct_identical_long_paragraphs` misses paraphrase-that-isn't.** It
   returned 0.0% for the Odyssey's 4 unmodernized books (Butler with only
   proper-name swaps defeats byte-for-byte identity) and 0.7% for Ulysses,
   where apostrophe-normalized identity is actually ~53% in the "Sirens"
   episode and ~43% in "Circe," and Penelope's eight ~3,000-word paragraphs
   are 99.8% unchanged. Per-chapter word-token similarity (already in the
   Phase 1 data, just not surfaced per-chapter in the summary) is the more
   reliable signal — see item 2 above, this reinforces the same tooling
   recommendation from a different angle (name-substitution vs. section-
   level drift).
4. **The 60% truncation-ratio threshold is too loose for formulaic or
   repetition-heavy texts.** In Gilgamesh it caught only 1 of 9 real
   compressions the batch found by hand; systematic collapse of formulaic
   repetition (e.g. a five-fold funeral refrain reduced, or "twelve
   double-hours of darkness" reduced to four) compresses by roughly
   30-40%, under the 60% floor. A 72% threshold reportedly surfaced the
   rest in this batch's own check. Worth a corpus-wide re-run with a
   tighter threshold in any future revision of the mechanical script,
   particularly for the Bible and other formula-heavy/oral-tradition texts
   (Homer's type-scenes, Beowulf's kennings).

## Rights/provenance risk found outside the Bible (from B1)

**Gilgamesh's `original-en` file has an unresolved provenance/rights
question of its own**, separate from and in addition to the Bible finding.
Two distinctive passages match verbatim a web compilation
(human.libretexts.org / a Jason Colavito page) that asserts "© 2014 Jason
Colavito, all rights reserved"; other passages in our file are absent from
that compilation; ellipsis/lacuna markers (standard in every scholarly
Gilgamesh translation, since large parts of the epic are damaged/missing
on the tablets) appear to have been silently removed or filled; and the
registry's `translator`/`year` fields are both `null`. This book is marked
BLOCKED pending provenance research, independent of its modern-en quality
(which is otherwise reasonable, "Good with fixes").

## Section-level drift, most extreme instance so far (from B19)

**Jerusalem (Lagerlöf) is the worst case yet of the pattern B8 and B15
described — and here the unmodernized section is not "barely touched" but
byte-for-byte identical.** Chapters 15-18 of `jerusalem-modern-en.json`
(*The Auction*, *Gertrude*, *The Dean's Widow*, *The Departure of the
Pilgrims*) are exact string matches to `jerusalem-original-en.json`, all
338 paragraphs, 16,179 words, **21% of the book**. The Phase 1 screening
did partially catch this one (`pct_identical_long_paragraphs 32.0` is the
highest in the inventory), but the number reads as "very light
modernization throughout" rather than "one fifth of the book has no modern
edition at all" — which is the actionable fact. **Suggested addition to
any future mechanical script: a per-chapter `identical_paragraph_pct` and
an explicit flag for any chapter at 100%.** That one check would have
found Jerusalem, Cymbeline's Act 5, Paradise Lost's Books 1-7 and Beowulf's
Fitts XXXIII-XLIII from the mechanical pass alone.

## Illusory abundance of "free" public-domain translations (from B19)

Three of B19's four books have a large apparent supply of free English
editions that on inspection collapses to **the single translation Tinct
already ships as `original-en`**:

- **Candide** — Project Gutenberg #19942 ("Modern Library 1918"), Standard
  Ebooks, and Online Library of Liberty all serve the same Smollett →
  Fleming 1901 text. The frequently cited "Philip Littell translation" is a
  misattribution: Littell wrote the 1918 Modern Library *introduction*
  only. Every genuinely different modern *Candide* (Adams/Norton 1966,
  Wootton/Hackett 2000, Cuffe/Penguin 2005) is in copyright.
- **Werther** — the Standard Ebooks edition is R. D. Boylan verbatim, i.e.
  our `original-en`. Morgan (1957), Hulse, Constantine and Pike are all in
  copyright.
- **Jerusalem** — Howard 1915 is the only PD English text; Norvik Press's
  modern Lagerlöf series does not include it and would be in copyright
  regardless.

**Practical rule for the remaining batches: a Standard Ebooks or Gutenberg
hit is not evidence of a *different* translation.** Check the actual
opening paragraph against our `original-en` before recording a candidate —
in all three cases above the "candidate" was our own source text.

## EU vs US copyright term on early-20th-century translations (from B19)

**Niels Lyhne** surfaces a jurisdictional question that will recur for any
book whose `original-en` is an early-20th-century translation by a
long-lived translator. Hanna Astrup Larsen's 1919 translation is public
domain in the **US** (pre-1929 publication) but Larsen died in 1967, so
under the EU/Danish life+70 term her *translation* is protected until
**2038**. Tinct operates from Denmark. The same arithmetic should be run
for every `original-en` whose translator died after 1956 — the US-only
"pre-1929, therefore PD" reasoning that most of these audit notes rely on
does not settle the Danish/EU position. Flagging as an unresolved legal
question for a human, not a conclusion.

## Equal-length invention is invisible to every Phase 1 check (from B13)

Phase 1 screening is built on length ratios, similarity, identical-paragraph
counts and alignment. All four are blind to a paragraph that is **replaced
with fabricated content of roughly the same length**.

The clean example is **great-expectations ch 26 p1**: 89 source words → 88
modern words, so no truncation flag, no length-ratio signal, nothing. The
source says Jaggers is recognised in the street by faces in the crowd and
talks louder when it happens; the modern text says he was "recognized and
greeted by two people, and started on the subjects of capital punishment and
flogging", then describes an argument with Pip that does not occur anywhere
in the chapter. Same-length, fluent, and entirely invented.

The same chapter also shows two other invisible failure modes:
- **ch 26 p26** — Jaggers's toast (`Mr. Drummle, I drink to you.`) is replaced
  by material belonging to p42, at similar length.
- **ch 26 p27** — the paragraph is a **verbatim duplicate of the chapter's own
  p43**, so its length looks plausible and its content is lost silently.

**Two cheap mechanical checks that would catch these:**
1. **Intra-chapter duplicate-paragraph detection.** Hash each modern paragraph
   ≥ 20 words and flag repeats within a chapter, cross-checked against the
   source (which should have no duplicate there either). Run across this
   batch's five books it returned exactly one hit — great-expectations ch 26
   — with zero false positives.
2. **Proper-noun / named-entity drop-out per paragraph.** Names, places and
   quoted technical phrases are what invented text loses first. Melville's
   `Season-on-the-Line` (ch 44 p8), the `Seychelle ground`, `Volcano Bay`,
   the `Isthmus of Darien` (ch 76 p3), Brontë's `Mrs. Fairfax` and
   `Miss Adèle` (ch 36 p48), Dickens's `jack-towel` — each vanishes from a
   paragraph whose length ratio alone would not always have flagged it.

Neither check needs a model; both are a few lines of Python over the existing
aligned JSON.

## Find-and-replace corruption in shipped text (from B13)

**moby-dick** chapters 134–135 are not modernized (word overlap 0.97+, length
ratio 1.00) and what editing did happen was a blind string substitution, which
left **17 corrupted words in the live text**: `where` → `whbefore`, `there` →
`thbefore`, `nowhere` → `nowhbefore`, `Were` → `Wbefore`, and `eye` → `eyou`
(from a `ye` → `you` replacement). Readers hit `"The ship? Great God, whbefore
is the ship?"` at the climax of the novel.

A regex scan for this class (`\w*(?:hbefore|thbefore|eyou|youa)\w*`) across
every `*-modern-en.json` in the library found hits in only two books:
**moby-dick** (17, all in chs 134–135) and **ulysses** (1, ch 15 p449:
`wouldyousetashoe`). Worth running as a standing lint over the editions
directory — it is a one-line check and the failures it finds are unambiguous.

## Consolidated update after 19/22 batches (88/101 books)

### The "degradation curve" / "effort-decay" pattern is now the single most common defect in the corpus

Confirmed independently in at least 9 books across 5 unrelated batches, always invisible to
book-level Phase 1 stats: **Cymbeline** (B8), **Paradise Lost, Beowulf** (B15), **The
Awakening** (B14), **5 of 6 Plato dialogues** — Republic, Symposium, Phaedo, Phaedrus (B9),
**Beyond Good and Evil, Kant's Groundwork** (B16), **Federalist Papers** (B20), **Notes from
Underground** (B2). The shape is always the same: early material (opening chapters, early
Acts/Books) is genuinely modernized; later material progressively reverts to near-verbatim
source. This is very likely a **generation-process failure** (a batch/session that ran out of
budget partway through a long book) rather than a per-book editorial choice, and it should be
treated as a single root-cause finding, not 9 separate ones, when planning repair work.
**Recommendation for any future mechanical tooling: emit per-chapter/per-section similarity,
not just a book mean** — this alone would have caught the entire pattern class for free.

### Confirmed rights risks beyond the Bible (7 more books/sets)

1. **Gilgamesh** (B1) — original-en shares verbatim text with a web compilation asserting a
   2014 all-rights-reserved copyright notice; translator/year null in registry.
2. **Magna Carta** (B20) — the "English Translation" is verbatim G. R. C. Davis's 1963
   translation, "© The British Library Board."
3. **Bacchae, Medea** (B11) — both editions depend on Gilbert Murray (d. 1957); apparently
   still in copyright in Denmark/EU (life+70) until 1 Jan 2028.
4. **The Art of War** (B12) — Giles (d. 1958); same EU/Denmark life+70 question, until 2029.
5. **Beyond Good and Evil, Genealogy of Morals** (B16) — translators Zimmern (d. 1934, EU
   clear) and Samuel (b. 1883, no established death date — EU term uncomputable).
6. **Fear and Trembling** (B18) — original-en has no documented translator/year at all;
   internal evidence suggests an undocumented in-house translation from the public-domain
   Danish, which would be fine on rights but is undocumented, and no complete rights-clear
   published alternative exists either (Hollander 1923 covers only ~1/3, omits all three
   Problemata).
7. **Confessions** (B18) — the best human alternative, Outler 1955, has conflicting rights
   claims from two different hosting sites (one asserts public domain, one asserts
   noncommercial-only); genuinely unresolved.

None of these are legal advice; all are flagged for a rights opinion, consistent with the
audit brief's instruction not to assert unsupported legal certainty.

### Legal-meaning-altering and factually-reversing defects (distinct from omission/compression)

- **US Founding Documents** (B20): 307 instances of mandatory "shall" converted to predictive
  "will" (and inconsistently to "must"/"may") across the Constitution and Bill of Rights —
  changes the modal force of legal obligation in a text whose exact wording is its whole
  point.
- **Moby-Dick** ch76 (B13): states the sperm whale's forehead is "almost all solid bone" —
  Melville says it is boneless, and the chapter's argument depends on that being false.
- **Jekyll and Hyde** ch10 (B14): "recognised my natural body FROM the mere aura" (cause)
  rendered as "AS a mere aura" (identity) — reverses the confession's central metaphysical
  claim.
- **Frederick Douglass**, Appendix (B20): "no reason, but the most deceitful one" inverted to
  "no honest reason."
- **Kant's Groundwork**, Preface (B16): a possibility modal changed to a necessity modal — a
  logical-force error of exactly the kind the reading standard singles out for protection.

These are qualitatively worse than omission/compression: a reader cannot tell, from the
prose alone, that the claim has been reversed. Recommend these get priority over
compression-only defects in any repair queue, regardless of a book's overall bandbrand.

### Invented content that no ratio/similarity check can detect (same-length or shorter invention)

- **Great Expectations** ch26 (B13): 89 source words -> 88 modern words, entirely invented,
  not a paraphrase of the source paragraph.
- **Kant's Groundwork**, Preface (B16): a confirmed invention (separate from the modal error
  above).
- **Jerusalem** ch3 (B19): a source sentence stating a vision was never told to anyone is
  replaced with an invented description of the vision itself.
- **Aristotle's Politics** Book 5 (B10): modern-en's OCR-debris cleanup fabricated an entire
  paragraph out of a footnote and duplicated a clause.

### More missing-scene/parser-ingestion bugs beyond the ones already logged

- **Henry V** (B5): the Act 1 Prologue ("O for a Muse of fire") is missing from both English
  editions — confirmed present in the source PG#1521.
- **The Taming of the Shrew** (B7): the entire Induction (2 scenes, ~11% of the play) is
  missing from all 3 editions, removing the frame around Katherina's final speech.
- **As You Like It** (B5): Act 1 Scene 1 is missing entirely AND 16 paragraphs of 1990s
  CD-ROM copyright boilerplate are embedded in the reading text.
- **Antony and Cleopatra** (B7): every scene numbered >=11 renders as "Scene 0" — a 2-digit
  scene-number parser bug, making Acts 3-4 unnavigable in all 3 editions.
- **The Histories** (Herodotus, B12): 407 wrong chapter titles (global file index used
  instead of the Herodotean chapter number).

Combined with the previously-logged Henry IV Part 2 Induction and Richard III's orphaned
speaker-tag paragraphs, this makes **6 confirmed source/ingestion-parser bugs in the
Shakespeare + Herodotus editions alone**, all pre-existing in original-en and inherited into
modern-en — none of these are modernization defects, and all need a parser fix applied to
every affected edition in lockstep.

### One methodology finding needing no further confirmation

**Byte-identity-based screening (`pct_identical_long_paragraphs`) is unreliable across the
whole corpus**, not just isolated cases — confirmed independently by at least 6 batches
(B1, B4, B8, B9, B14, B16) via curly-quote/em-dash normalization, name-substitution, or
British/American spelling defeating exact string matching while leaving near-total
non-modernization undetected underneath. A token-sequence-based retention metric, computed
per chapter, is the fix every batch converged on independently.
