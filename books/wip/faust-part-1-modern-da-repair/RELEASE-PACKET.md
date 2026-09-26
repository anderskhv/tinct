# Release Packet — Faust Part I, modern-da complete replacement

Status: candidate, awaiting independent whole-edition review. Not
published. Explicitly authorized (Danish repair for Faust named directly
in the assignment).

## What this fixes

The live Danish `modern-da` (895 paragraphs, 28 chapters) was translated
from the OLD, defective English source (the mislabeled Hayward/Buchheim
OCR text with ~1,873 words of gaps and ~2,500 words of German-bleed
contamination) and does not align with the accepted English replacement
(Bayard Taylor's complete translation, 1,060 paragraphs, 28 chapters —
see `books/wip/faust-part-1-english-repair/`). Because the underlying
source text itself changed, not just its structure, no coordinate-
preserving patch is possible — this required a full fresh translation of
all 1,060 paragraphs, the same scale of work as translating a new book's
`modern-da` from scratch.

## Method

Translated in 5 parallel batches directly from the accepted `modern-en`
(chapters 1-6, 7-8, 9-13, 14-19, 20-28), each self-verified for exact
paragraph-count match, absence of empty/untranslated paragraphs, and a
spot-check against the English before merging. Speaker-tag naming was
cross-checked for consistency across all 5 batches after merging (FAUST,
MEFISTOFELES, MARGRETE, MARTHE — all consistent; no conflicts found).
Chapter titles were then harmonized to the live file's existing Danish
title convention (e.g. "Tilegnelse", "Studerekammeret, del 1", "Valborgsnat")
rather than inventing new titles, since the chapter/scene structure itself
is unchanged from the live edition — only the paragraph text is new.

The darkest and most important scenes (the Prologue in Heaven, the "In
the Beginning was the Word/Thought/Power/Deed" passage, Auerbach's
Cellar, the Witch's Kitchen, Gretchen's "Meine Ruh ist hin" song, the
Earth-Spirit monologue, Valentine's death curse, the Cathedral scene,
Walpurgis-Night and its Dream interlude, and the full Dungeon ending)
were explicitly instructed to be translated unsoftened, at full weight,
matching the accepted English's own fidelity standard.

## Candidate

| Item | Value |
|---|---|
| `editions/faust-part-1-modern-da.json` | sha256 `04e36f410cdaea3019cc593bdb2c52fe2ffed56eca39db7fc2ad3d178f980bb5` — 28 chapters, 1,060 paragraphs, matching the accepted `modern-en` structure exactly |
| Replaces live sha256 | `ce719108b40e89f1f008d16a62e1fa7dc9e1f1600b2481439696873f9b471191` (28 chapters, 895 paragraphs, built on the old defective English) |

Per-chapter paragraph counts verified programmatically to match
`books/wip/faust-part-1-english-repair/editions/faust-part-1-modern-en.json`
exactly across all 28 chapters.

## What independent review should check

This is the largest and least-reviewed of the four Danish repairs in this
round — 1,060 paragraphs of freshly-translated verse drama, produced by 5
independent batches with no cross-batch review beyond the naming
consistency check above. Independent review should:
1. Confirm exact paragraph-count match, chapter by chapter, against
   `modern-en`.
2. Read a substantial sample across ALL 5 batches' scope (not just one),
   weighted toward the priority passages named above, checking for
   dropped content, invented content, and — specifically — that the dark
   content (Valentine's curse, the infanticide confession, the Dungeon
   ending) was not softened.
3. Check for any remaining cross-batch naming/terminology inconsistency
   beyond the four names already checked (e.g. minor speaker-tag spelling
   variants for side characters who only appear within one batch's scope
   should still be internally consistent within that scope).
4. Confirm speaker tags and stage directions are preserved as their own
   paragraphs throughout, matching the English structure.

## Edition-identity note

As with the English replacement, this is a full source-text replacement,
not a coordinate-preserving patch — the live `modern-da`'s 895 paragraphs
do not correspond 1:1 to this candidate's 1,060. The same
edition-identity/reader-coordinate handling documented in
`books/wip/faust-part-1-english-repair/RELEASE-PACKET.md` applies here
too; this package does not resolve integration, reader-data preservation,
or publication sequencing — those remain Codex's decisions.
