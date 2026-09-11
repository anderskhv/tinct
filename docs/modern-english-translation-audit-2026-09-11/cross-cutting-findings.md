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
