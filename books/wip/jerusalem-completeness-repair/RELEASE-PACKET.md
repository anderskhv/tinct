# Release Packet — Jerusalem, structural repair + targeted modern-en fixes

Status: **candidate, awaiting independent review, and PARTIAL** — see "What
this does NOT fix" below, which is the honest and important part of this
packet. Nothing here is published. No live edition, character-card, thread,
onboarding, audio, registry or application file was touched.

## What this fixes

`main` `1a7d89ebd816af8a2ac18239010c34fab4bf48c5` audit
(`claude/laughing-maxwell-3d7f5l` `e24c16e8`, `reports/G07-novels-b.md`,
`CONFIRMED-DEFECTS.md` item 20/G07-jerusalem-01/02/03) found:

1. **A parsing error splits one sentence into a spurious 18th chapter.**
   Source line 6474, "UNITY, UNITY.", is the second half of the quotation
   "...is UNITY, / UNITY, UNITY." The importer read it as a chapter heading,
   so `original-en`, `modern-en` and `modern-da` all serve chapter 9 ending
   mid-quote ("...is UNITY,") and chapter 10 titled "Unity, Unity." picking
   up immediately after — one source chapter served as two, in every
   edition.
2. **17 `modern-en` paragraphs drop their endings and, in several cases,
   silently substitute invented dialogue that isn't in the source at all**
   (not just a shorter ending — a different one). Example: original-en
   1.11 (145 words) ends "...'But I want to speak to you in private,' I
   say." The served modern-en (74 words) stops after "...linger at the
   door," then continues "But father says: 'Come in, come in! There is
   always room for an Ingmarsson.'" — a line that exists nowhere in the
   source at this point (it's actually the *opening* of the paragraph,
   restated as if it were the close). All 17 locations follow this pattern
   to varying degrees.

This package:

- Fixes the source line ("...is UNITY, UNITY, UNITY.") in `original-en` and
  merges the old chapter 10 into chapter 9 (renumbering 11–18 down to
  10–17), in both `original-en` and `modern-en`. 18 chapters → 17.
- Replaces all 17 defective `modern-en` paragraphs with fresh, complete,
  faithful modern-English renderings of the full `original-en` paragraph
  (not a patch of the existing text — each was rewritten in full, since the
  existing text mixed faithful and fabricated content and a partial edit
  risked an awkward seam).
- **Does not touch `original-en`'s prose anywhere else** (per Anders's
  explicit instruction to preserve `original-en`; the one exception, the
  chapter-9/10 merge and the one-sentence completion, is a parsing-artifact
  fix, not a translation change — flagged clearly here in case Anders wants
  it treated differently).

## What this does NOT fix — read before treating this as "Jerusalem done"

Running the mandatory similarity gate
(`python3 books/classify-modern-en.py jerusalem --gate --per-chapter`)
against this candidate surfaces a **much larger, separate, pre-existing
defect** that the original audit did not fully characterize: **14 of this
book's 17 chapters (82%) are LIGHT or MECHANICAL** — not genuine
paragraph-by-paragraph modern renderings, but thin, largely mechanical
cleanups of the original. Four chapters (the old 15–18, now 14–17) are
**100% byte-identical** to `original-en` — the audit did flag this (S3,
"mislabeled") — but the gate shows the problem extends well beyond those
four: chapters 2, 4, 6, 7, 8, 9, 10, 11, 12 and 13 are also LIGHT
(0.86–0.95 similarity). Only chapters 1, 3 and 5 read as genuine
modernizations (REAL, 0.71–0.81).

**Weighted whole-book similarity: 0.892** (gate limit 0.75). **GATE FAILS.**

This is not something the 17-paragraph fix or the chapter merge above could
plausibly address — it is nearly the entire book's `modern-en` edition
needing a real paragraph-by-paragraph rewrite, the same class of work as
preparing `modern-en` for a new book, not a bounded repair. That is a
substantially larger undertaking than what fits in this pass alongside
Macbeth, As You Like It and this book's two confirmed structural/omission
defects. **This package does not attempt it.** Flagging this now, rather
than either silently skipping the gate check or rushing a lower-quality
rewrite of ~1,300 paragraphs, is the honest call per `books/AGENTS.md`'s
own gate requirement ("A prose claim that a rendering is 'real' does not
substitute for a passing gate").

**Independent review's spot-check confirms this is not confined to the 17
listed locations.** Reviewing chapter 1 beyond the fixed locations turned up
the same truncation-plus-fabrication pattern, uncaught by this package, at
paragraphs 8, 16, 20, 21 and 47, and chapter 5 paragraph 12 (an invented
Bible-text quotation). Paragraph 21 is plot-relevant, not just stylistic:
the original reveals Brita is pregnant (setting up the later
strangled-infant plot point that paragraph 24, one of the 17 this package
did fix, depends on), and the live modern-en instead invents an unrelated
near-breakup scene, silently dropping the pregnancy reveal. These are
recorded here so the 17-location list in this package is not mistaken for
an exhaustive catalog of the defect class — it is a confirmed sample, not
the full extent. The full re-render recommended below should treat every
LIGHT/MECHANICAL chapter as suspect for this same fabrication pattern, not
only run a mechanical similarity check.

**Recommendation:** treat "Jerusalem modern-en full re-render" as its own
follow-up content assignment, comparable in scope to adding a new book's
modern-en from scratch (~1,300 paragraphs across 14 chapters). This
package's structural fix and 17-paragraph correction should still be
integrated now — they are complete, correct, and independently reviewable
on their own — but Codex/Anders should not read this package as "Jerusalem
modern-en repaired."

## Source

| Item | Value |
|---|---|
| Source | Project Gutenberg #15837, *Jerusalem* (Selma Lagerlöf, trans. Velma Swanston Howard, 1915), Part I only |
| URL | https://www.gutenberg.org/cache/epub/15837/pg15837.txt |
| Retrieved | 2026-09-26 (this session) |
| sha256 | `cc5df0ba5e17cba5dbfebc6ce71eeb0571d8910a9e981df97cd84dcd1ebcff98` — matches the audit's retrieval hash exactly |
| Confirmed | Line 6474 is exactly "UNITY, UNITY." (the second half of "'That which is needed to make life as easy as death is UNITY, / UNITY, UNITY.'"), verified directly against the fetched source. |

## Candidate

| Item | Value |
|---|---|
| `editions/jerusalem-original-en.json` | sha256 `abc0618b87f5384b803432bf430fcdab4c31280924460609e9efc7c17286d407` — 17 chapters, 1,787 paragraphs (was 18 chapters, 1,787 paragraphs — same total, one fewer chapter boundary, one paragraph's text completed) |
| `editions/jerusalem-modern-en.json` | sha256 `ae1c6461b8468cf3a7185f65fe98c948c983bffea19e10fdfc2a49851046bc06` — 17 chapters, 1,787 paragraphs |
| Replaces live sha256 | original-en `747b53bedd58d9ba65877185247a8545dac4bddcd1e8219cf5315da00cdac47c`; modern-en `6cdbf3a5904a26d5edffc0ad45325f29af16e8cd6bc0a959f92450c3b33c00ee` (both match the audit's reported first-16 prefixes) |
| Alignment | All 17 chapters have equal paragraph counts in both editions (verified programmatically) |
| Similarity gate | **FAILS** for the reasons above — this is expected and disclosed, not a defect in what this package actually changed. The 17 rewritten paragraphs and the merged chapter 9 are, on their own, genuine modern renderings; the gate failure is driven entirely by the ~1,300 untouched paragraphs elsewhere in the book. |

**Post-review correction:** independent review found that the top-level
`sections` array (Book/TOC navigation) was not updated in either candidate
file — "Book Three" still listed chapters `[9, 10, ..., 18]`, but chapter 18
no longer exists after the merge. Fixed: "Book Three" now lists
`[9, 10, ..., 17]` in both `editions/jerusalem-original-en.json` and
`editions/jerusalem-modern-en.json`. Hashes above reflect the fix.

## Paragraph map

`PARAGRAPH-MAP.json` gives the complete old→new map for all 1,787
paragraphs (chapters 1–9 unchanged; old chapter 10's paragraphs become
chapter 9's paragraphs 75 onward; old chapters 11–18 keep their paragraph
indices but drop their chapter number by 1).

## Character-card and threads impact

`app/public/data/characters/jerusalem.v1.json` has only 7 mentions per
edition — small enough that `CHARACTER-CARD-IMPACT.json` gives the full
remap directly (old chapter/paragraph → new chapter/paragraph) for both
editions; no mention falls inside the merged region requiring an offset
recompute.

`app/public/data/editions/jerusalem-threads.json` keys 5 characters'
timelines by chapter number. Old keys 1–9 are unchanged; old key "10"'s
content needs manual placement within chapter 9's now-larger paragraph
range (paragraphs 75+); old keys 11–18 each drop by 1.

## Onboarding

`app/public/data/onboarding/jerusalem.json` and `.da.json` were not
inspected for chapter-count or paragraph-coordinate references; flagging
for Codex to check given the chapter renumbering (18 → 17).

## Scope note on Danish (modern-da)

Per the same reasoning as the Macbeth and As You Like It packages:
`STRATEGY.md` §Language scope and `books/AGENTS.md`/`books/CLAUDE.md`
currently read Danish out of scope, and the assignment's explicit
Danish-authorization is scoped to five other books. `modern-da` (1,787
paragraphs, 18 chapters, live) will be chapter-misaligned with the repaired
`original-en`/`modern-en` (17 chapters) once this integrates, in the same
way as the two Shakespeare packages. **Needs your decision**, same as
those: reopen Danish scope for Jerusalem, or hide `modern-da` Compare
pairing until it does.

## Verification performed

- Both candidate JSON files: valid.
- Chapter count (17) and per-chapter paragraph-count equality between
  `original-en` and `modern-en`: verified programmatically.
- The chapter-9/10 merge boundary was read directly in the candidate JSON
  to confirm the completed quotation and the seamless continuation into
  the former chapter 10's content.
- All 17 replaced modern-en paragraphs were checked word-for-word against
  the full `original-en` paragraph for completeness (no dropped content)
  and absence of invented material.
- Similarity gate: run and its (expected) failure fully characterized
  above, not hidden.

## What independent review should check

1. Re-derive the chapter-9/10 splice from the Gutenberg source
   independently and confirm the fix.
2. Check all 17 rewritten modern-en paragraphs against the full
   `original-en` paragraph for completeness and absence of invention —
   this package's own author found the *previous* served text had exactly
   this defect, so apply the same scrutiny to the replacement.
3. Confirm the gate-failure characterization above is accurate (spot-check
   a few of the LIGHT/MECHANICAL chapters this package did not touch) and
   confirm this package does not overclaim what it fixed.
