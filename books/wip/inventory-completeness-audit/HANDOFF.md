# Handoff: content-repair tasks and integration dependencies

**Status: audit complete. No content was changed and nothing is published.** This package is findings only. No edition, registry, character, onboarding, thread, SEO, audio or application file was touched. The repair work below still needs to be assigned.

| Item | Value |
|---|---|
| Branch | `claude/laughing-maxwell-3d7f5l` |
| Package path | `books/wip/inventory-completeness-audit/` (owned path; the only path written) |
| Audited commit | `main` `1a7d89ebd816af8a2ac18239010c34fab4bf48c5` (the branch started exactly here) |
| Instructions followed | `books/BOOK-TASK-WORKFLOW.md` (approved 2026-09-24), `books/README.md` (updated 2026-09-24), `AGENTS.md`, `books/AGENTS.md`, `books/CLAUDE.md`, `docs/workflow-boundaries.md`, `STRATEGY.md` §Language scope (2026-09-21); all as of `1a7d89eb` |
| Evidence | `reports/G01–G11` (first-pass audit, one group of books each), `verification/V01–V11` (independent second review) |
| Acceptance status | Findings: **confirmed** (CONFIRMED-DEFECTS.md), **open** (NEEDS-INVESTIGATION.md). Repairs: **not started** |

**Rule for every task below:** restore text **verbatim** from the matched source edition that the task names, never from memory or another translation. Each content package must supply, as the Symposium package did:

- the pinned source (URL and sha256);
- the candidate files and their hashes;
- an explicit old→new paragraph map;
- the changed-paragraph list;
- the character-card impact;
- a whole-text re-check against the source: `coverage` = only headings left uncovered, plus a short-paragraph survival check.

Modern English for restored passages follows the translation protocol and gets an independent review. **Danish is out of scope:** do not generate Danish, and see D-9 for what integration must do about modern-da alignment.

## 1. One structural decision first (blocks several tasks)

**How should restored prefatory units be represented?** This covers prologues, inductions, author's prefaces, introductions, dedications, arguments and epigraphs. The choices are:

- a keyed front-matter array, which keeps chapter numbers (option A of `moby-dick-structural/STRUCTURE-PROPOSAL.md`);
- new chapters, which renumbers everything after them.

The same decision applies to the Moby-Dick package, T-02, T-03, T-04, T-05, T-06, T-08, T-09, T-12, T-15 and T-21, and to the scope items in NEEDS-INVESTIGATION A3.

**Recommendation (Codex design, Anders approval):** option A for units before chapter 1. Where a play's opening scene-units (Induction or Prologue) must sit in the reading flow and table of contents, add them as front units, not renumbered chapters. Paragraph insertions *inside* existing chapters (Macbeth, Federalist, Awakening, Herodotus proem, Paradise Lost Arguments) need only in-chapter maps.

## 2. Tasks, in priority order

Owner key: **C** = Claude content package; **X** = Codex integration or code; **A** = Anders decision.

### Priority 1: missing openings and famous passages (S1)

| ID | Book | Task | Source (verbatim) | Owner | Depends on |
|---|---|---|---|---|---|
| T-01 | Macbeth | Restore the 34 dropped speech blocks in original-en at the coordinates in `reports/G01-shakespeare-a.md` (table "All 34 gaps"). Render them in modern-en: 31 are absent there, and 3 already exist but inside neighbouring paragraphs (5.1, 15.6, 15.40), so re-segment. Supply the paragraph map (16 chapters change). | PG #1533 (`books/raw/macbeth/raw.txt`, identical to it apart from the BOM) | C → X | D-1…D-9; rebase `green-macbeth` and `staged-replacements/macbeth` |
| T-02 | Taming of the Shrew | Restore the Induction (Scenes 1–2, about 2,400 words) before Act 1 Scene 1; render it in modern-en. | PG #1508 lines 114–587 | C → X | §1; D-1…D-9; rebase the accepted `green-taming-of-the-shrew`; onboarding copy |
| T-03 | As You Like It | Re-base on a public-domain edition (recommended: PG #1523). Restore Act 1 Scene 1, split the merged first scenes of Acts 2–5, retitle all units and give the Epilogue its own unit. Delete the licence notices. Re-derive modern-en to the new structure. | PG #1523 (or PG #100) | A (A1) → C → X | §1; full migration (17 → 22 chapters + Epilogue) |
| T-04 | Henry V | Restore the Prologue as its own unit; move the Act 2–5 Choruses to open their acts (as units or leading paragraphs); give the Epilogue its own unit. Render the Prologue in modern-en. | PG #1521 lines 138–178 (Prologue) | C → X | §1; D-1…D-9 |
| T-05 | Henry IV Part 2 | Restore the Rumour Induction (309 words) as its own unit; give the Epilogue its own unit; render in modern-en. Correct `books/characters/henry-iv-part-2/README.md` and re-anchor the Rumour card. | PG #1518 lines 126–175 | C → X | §1; D-2 |
| T-06 | Don Quixote | Restore Part I front matter: the Author's Preface ("Idle reader…", 2,588 words) and the commendatory verses (1,409 words). Move the Part II front matter (52.47–52.61) to precede Part II. Render in modern-en. | PG #996 lines 2099–2331 (Preface); verses per `reports/G06` | A (Béjar/Lemos scope) → C → X | §1 |
| T-07 | Federalist Papers | Restore the 10 dropped paragraphs (No. 4, 5, 9, 26, 40, 47, 52 opening, 63, 83 ×2) at the coordinates in the register. Render in modern-en. | PG #1404 (lines in `reports/G09` and `verification/V08`) | C → X | In-chapter maps only |
| T-08 | Wealth of Nations | Restore "Introduction and Plan of the Work" (1,058 words) and the Book I title. Move the Book II and Book IV introductions to the start of their Books. Add Book I–V grouping. Render the Introduction in modern-en. | PG #3300 lines 110–218 | C → X | §1; D-4 (see X-1) |
| T-09 | Montaigne | Restore "The Author to the Reader" (238 words); render it in modern-en. Apply the notes policy (A3) to about 56 editorial notes served as text. | PG #3600 lines 2028–2051 | A (notes) → C → X | §1 |
| T-10 | Herodotus | Restore the proem (65 words) as the opening of Book 1 (paragraph 1.0 or a front unit); render in modern-en. Separately, check V01-NEW-2 (407 modern chapter titles misnumbered) and fix the titles. | PG #2707 lines 189–194 | C → X | In-chapter map |
| T-11 | Faust (English) | **Decision A4 first:** relabel as Hayward/Buchheim, or replace with Taylor (PG #14591). If kept: restore the 9 missing passages (about 1,870 words), remove the German facing text from 79 paragraphs, and correct modern-en's invented, duplicated and bridged lines. If replaced: a new import plus a new modern-en. | Hayward/Buchheim 1892 (archive.org `cu31924026191910`, `firstpartoffaust00goetuoft`) or PG #14591 | A → C → X | D-1…D-9 |
| T-11b | Faust (German) | Remove the transcriber's note from 28.69. Restore the dropped speaker labels and scene-opening stage directions (V10). | PG #21000 | C → X | small |
| T-14 | Beyond Good and Evil | Delete paragraph 11.30 ("End of Project Gutenberg's…") in all editions. | — | C → X | Tail deletion; trivial map |

### Priority 2: substantial losses, misattribution, apparatus (S2)

| ID | Book | Task | Source | Owner |
|---|---|---|---|---|
| T-12 | Paradise Lost | Restore Milton's 12 Arguments (2,399 words) and "The Verse" (236). Render in modern-en. Resolve the label (A4). | A 1674-text source: Standard Ebooks, Dartmouth or Wikisource (the ones V01 used) | C → X |
| T-13 | Bible (KJV) | Restore the 116 Psalm titles and the 22 Psalm 119 acrostic headings, preferably as superscription or heading fields rather than verse text. Move the `***` out of Malachi 4:6. Relabel "1611" (A4). | eBible `eng-kjv` USFM (the one G11 and V01 used) | C → X |
| T-15 | Leviathan | Restore the Chapter IX Table of the Sciences (about 245 words), the Epistle Dedicatory (416), the Introduction's plan, the ANGER and LIBERALITY definitions and the ch31 line. Decide the policy for the ~600 marginal notes (A3). | PG #3207 (lines in `reports/G08`, `verification/V02`) | C → X |
| T-16 | Othello, The Tempest | Othello: restore speaker labels to the 43 bracketed speech passages; decide the policy for asides and inline directions. Tempest: re-attribute Ariel's songs (2.116/2.118/2.120, 2.123/2.125, 9.15). Text unchanged. | PG #1531; MIT Tempest | C → X |
| T-17 | Medea; Greek drama labels | Medea: move all 35 stage directions to their source position. Oedipus Rex, Antigone, Oedipus at Colonus, Oresteia, Medea: retitle units to the actual Prologue / Parodos / Episode / Stasimon / Exodos boundaries (text order intact). | PG #35451; PG #31; PG #8604 | C → X |
| T-18 | The Prince | Apply the notes policy: take Marriott's 48 notes out of the body in all editions. Remove the 94 "[p. N modifica]" markers from original-it. Place the "Edward Dacre, 1640" credit correctly. | PG #1232; it.wikisource | A (notes) → C → X |
| T-19 | The Awakening | Restore the 22 dropped short dialogue paragraphs; add modern-en counterparts. | PG #160 (lines in `verification/V07`) | C → X |
| T-20 | Jerusalem (modern-en) | Re-render the 51 paragraphs that lose content or carry invented text. Modernise chapters 15–18. Merge the spurious chapter 10 back into chapter 9. | PG #15837 (Howard) | C → X |
| T-21 | Social Contract | Restore the first line of all 47 footnotes (notes policy A3), and Rousseau's Foreword. | PG #46333 | A → C → X |
| T-22 | Aristotle's Politics | Restore the 23 text-cleaning losses (96 words). Remove running heads, section numbers and footnotes from the body. Fix the 4 modern-en sites. | archive.org `aristotlespoliti00arisiala` (the raw) plus a second copy | C → X |
| T-24 | Candide | Relabel the translation (A4). Remove the 34 dangling note markers. Correct `books/raw/candide/SOURCE.md`. | PG #19942 | X (label), C |

### Priority 3: smaller repairs (S3/S4) and translation-only fixes

- **T-23 Second Treatise:** restore the final four characters of chapters 1–18 in original-en. The modern-en package on `claude/gracious-fermat-bjef6w` already completes them.
- **T-25 Translation-only fixes:**
  - Apology modern-en 2.4/2.5 (the missing exile argument and the duplicate); 2.1/2.2 (duplicate sentence).
  - Great Expectations modern-en 26.0 and chapter 26.
  - Jungle Book modern-en chapter 1.
  - Nicomachean Ethics: the translator's appendix (label it or remove it).
- **T-26 Structure labels:**
  - War and Peace: Book-boundary chapter titles (16 Books).
  - Anna Karenina: Part grouping.
  - Imitation of Christ: Book grouping, and the opening of Book IV served at the end of III.59.
  - Antony and Cleopatra: the "Scene 0" titles.
  - Cymbeline: the split titles.
  - Measure for Measure and Merry Wives: remove the Cambridge line numbers from original-en.
- **T-27 Front matter scope items (after A3):** Frankenstein 1831 Introduction and 1818 Preface (confirmed as belonging to the labelled edition); Jekyll dedication; Karamazov epigraph; Moby-Dick Hawthorne dedication; Locke's Preface; the Douglass prefatory documents; the Jane Eyre Preface and Note.
- **S4 items:** as listed in the register (`CONFIRMED-DEFECTS.md` §4.4) and NEEDS-INVESTIGATION §C. Batch them per book with the tasks above.

### Existing packages: publish, do not redo (X)

Symposium; Moby-Dick (structural and modern-en); Fear and Trembling successor; Odyssey 3.37 fix and staged modern-en; Crito and The Manual modern-en fixes; Vindication modern-en; War and Peace repair tail batches; Wealth of Nations batch C.

Branches, commits and caveats are in `EXISTING-REPAIRS.md` §A. PRs #159 and #160 look superseded by #192; confirm and close them.

## 3. Codex-only items

- **X-1 Wealth of Nations served path (S2):** the primary view loads `editions-chapters/wealth-of-nations-modern-en/` shards that are about 80% the 1776 original, while the whole-book JSON holds the real modern rendering.
  - Regenerate the shards from the canonical whole-book file with `scripts/split-edition-chapters.cjs`.
  - Confirm on production that the primary view, Compare, search and narration read the same text.
  - Regenerate the Montaigne modern-en/da shards too (the `["…"]` wrappers), the modern-da shard titles for 5 books, and the Don Quixote modern-da shards (V07-N4).
- **X-2 Release gate suggestion (tooling; no change made here):** add three checks to book release checks.
  - Every sharded edition's shards must equal its whole-book JSON.
  - A whole-text coverage check against the pinned source must pass (only headings uncovered).
  - A short-paragraph survival check must pass.

  Together these would have caught every class in `CONFIRMED-DEFECTS.md` §3.
- **X-3 Importer lessons** (for any re-import): never drop paragraphs by pattern ("From the", length < 20, first footnote line, final characters). Keep text before the first heading and classify it (front matter or boilerplate) by hand. Recognise `ACT n. SCENE m.` headings. Keep speech continuations that have no speaker heading, and attach the current speaker. Strip licence and transcriber blocks explicitly.
- **X-4 Hide the affected Danish editions** after decision A2: Confessions, Paradise Lost, Heart of Darkness, Vindication, Discourse, Faust.
- **X-5 Rights (A1):** withdraw or replace Gilgamesh pending review; re-base As You Like It.
- **X-6 Registry labels and translators (A4):** Faust, Candide, Nicomachean Ethics, KJV, Paradise Lost, Gilgamesh, Fear and Trembling.
- **X-7 SEO regeneration** after repairs: at least Jerusalem, Antony and Cleopatra, As You Like It, Wealth of Nations, and the affected plays.

## 4. Integration dependencies for every structural repair (D-1…D-9)

- **D-1 Reading-position migration.** Positions, highlights, notes and chat anchors are keyed by `(chapter, paragraph)`. Apply the package's old→new map. Protect "never lose reading position": a position on a removed paragraph maps to the nearest surviving one.
- **D-2 Character packages.** All 100 live books have a released `app/public/data/characters/<id>.v1.json`, pinned to edition bytes and paragraph hashes (101 entries in `characterReleases`, including the staged treasure-island). Re-anchor them and bump the revision.
- **D-3 Threads** (`*-threads.json`, keyed by chapter) and **onboarding copy** (for example the Shrew's frame and Henry IV's Rumour).
- **D-4 Chapter shards** for the 48 sharded editions.
- **D-5 SEO pages** under `app/public/read/<id>/`.
- **D-6 Narration.** Grok streaming caches must key on the new text. Legacy audio-highlight timings for changed chapters become invalid. Generate no audio as part of these text repairs.
- **D-7 Runtime patch overlay** (`edition_patches`). Re-check any rows for the changed books against the new coordinates.
- **D-8 Staged packages that pin the old structure** (EXISTING-REPAIRS §D): publish them first and migrate them, or rebase them on the repaired text.
- **D-9 modern-da alignment.** Inserting paragraphs into original-en and modern-en misaligns modern-da. Danish text is out of scope, so either hide the Danish edition for that book or leave Compare unable to pair it. Open PR #193, "Compare never pairs misaligned editions", is relevant. Never pair misaligned paragraphs silently.

## 5. Suggested order

1. Decisions §1, A1, A2 and A4 (Anders and Codex).
2. Publish the existing accepted packages.
3. X-1 (served-path fix).
4. T-01, T-02, T-04, T-05 and T-07, the highest reader impact with a verbatim source in hand.
5. T-03 and T-06 (larger migrations), then Priority 2 by book popularity.

Keep one writer per book and follow the serialized release process.
