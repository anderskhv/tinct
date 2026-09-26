# Release Packet — As You Like It, original-en + modern-en completeness and structure repair

Status: **candidate, awaiting independent review** (see `ACCEPTANCE-RECORD.md`
once the independent review lands). Nothing here is published. No live
edition, character-card, thread, onboarding, audio, registry or application
file was touched. This package is content-only; the coding agent owns
integration and publication, per `books/BOOK-TASK-WORKFLOW.md` (2026-09-24).

## What this fixes

`main` `1a7d89ebd816af8a2ac18239010c34fab4bf48c5` audit
(`claude/laughing-maxwell-3d7f5l` `e24c16e8`, `reports/G01-shakespeare-a.md`,
`CONFIRMED-DEFECTS.md` item 3, findings G01-as-you-like-it-01…05) found four
confirmed defects in every served edition of As You Like It:

1. **Act 1 Scene 1 (1,493 words) is entirely absent.** The book currently
   opens at Act 1 Scene 2. Orlando and Adam's opening scene, Orlando's
   confrontation with Oliver, and the introduction of Charles the wrestler
   and the plot against Orlando never appear.
2. **15 of 17 served chapters are mislabeled**, all titled "Act 1, Scene N"
   regardless of actual content, because the importer only recognized bare
   `SCENE N.` headings and never advanced past Act 1. Scene 1 of Acts 2
   through 5 is silently merged into the end of the preceding chapter.
3. **A non-Shakespearean commercial-restriction notice is served as reading
   text** four times: three times mid-book (at the true Act 2/1, Act 4/1 and
   Act 5/1 scene boundaries, exactly where the merged-chapter defect above
   hides them) and once at the very end, followed by "End of this Etext of
   The Complete Works of William Shakespeare, As You Like It." `modern-da`
   even translates the closing instance into Danish.
4. Location lines, act/scene headings, `EPILOGUE`/`EPILOGUE.` and `THE END`
   are served as ordinary body paragraphs (S4, cosmetic) — this matches the
   edition's existing house style for stage directions throughout the book
   (see "What this does not change" below) and was left as-is.

This package restores Act 1 Scene 1, corrects the chapter/scene structure
(17 chapters → 23: 22 scenes + a separated Epilogue), and removes the four
licence-notice blocks from reading text, in both `original-en` and
`modern-en`. It also brings three `modern-en` chapters that were already
failing the mandatory similarity gate — independently of this repair — up
to a genuine paragraph-by-paragraph modern rendering, since the assignment
asked for both editions to be repaired and a mechanically-thin modern-en is
itself a defect this initiative exists to catch.

## Source

| Item | Value |
|---|---|
| Base text (kept for scenes already served) | The 1990–93 World Library etext, the same edition already served (see "Rights note" below for why this could not simply be re-based without becoming a much larger undertaking) |
| Source for the restored Act 1 Scene 1 | The exact same etext family, retrieved from archive.org, so the restored scene reads in the same edition/spelling as the rest of the book rather than stitching in a different translator's/editor's prose |
| URL | https://archive.org/download/1ws2510/1ws2510.txt |
| Retrieved | 2026-09-26 (this session) |
| sha256 | `b30b9db29fe670195ccb182bdeabddefb5af705fb985ba40c485dc2defb6f39a` — matches the audit's retrieval hash exactly |
| Act 1 Scene 1 location | Lines 547–1002 of `source/1ws2510.txt` (`ACT I. SCENE I.` / "Orchard of OLIVER'S house" … Oliver's closing "Exit"), 1,493 words, copied into this package's build notes verbatim (see `PARAGRAPH-MAP.json`'s companion — the 47 new paragraphs are in `editions/as-you-like-it-original-en.json` chapter 1) |
| Transcription note | The source's line "OLIVER. not Charles, the Duke's wrestler, here to speak with me?" is missing its opening "Is" — an apparent transcription slip in this specific 1990s etext, not a Tinct error. Transcribed verbatim rather than silently corrected; flagged here so a reviewer isn't surprised by it. |

## Candidate

| Item | Value |
|---|---|
| `editions/as-you-like-it-original-en.json` | sha256 `8ab533a42958f570a59d12e686793d4397ff0efe6c9b061acfb468d645254358` — 23 chapters, 931 paragraphs (was 17 chapters, 901 paragraphs) |
| `editions/as-you-like-it-modern-en.json` | sha256 `5a4e95bbf50e3affb4581cc5acd53d19322642e81894342bc56bd03fc7f75e48` — 23 chapters, 931 paragraphs (was 17 chapters, 901 paragraphs) |
| Replaces live sha256 | original-en `2c04249b4ea528612cfa8f41031ed7a78fff2e453f15fbccf7d55f03905ce179`; modern-en `df270fa2b605950982107d654d395fe0eaa0226208f9a5b185d06d7da2b5f8e4` (both match the audit's reported first-16 prefixes; the live served files have not changed since the audit) |
| Alignment | Every one of the 23 chapters has an equal paragraph count in both editions (verified programmatically); Compare pairing for original-en/modern-en is intact |
| Similarity gate | `python3 books/classify-modern-en.py as-you-like-it --gate` (scratch copy, since `app/public/data/editions/` is out of scope for this task): **PASS** — weighted similarity 0.703 (≤0.75), 0% LIGHT/MECHANICAL chapters (≤5%), 1.0% identical long paragraphs (≤5%). Run again per-chapter to confirm: the currently-served text **already fails this gate** (0.762 weighted, 17.6% LIGHT — see "Pre-existing modern-en defect" below); this candidate is the first version of this book to pass it. |

## New chapter structure (17 → 23)

| New | Title | Section | Paragraphs | Source |
|---|---|---|---|---|
| 1 | Act 1, Scene 1 | Act 1 | 47 | **restored**, archive.org `1ws2510.txt` lines 547–1002 |
| 2 | Act 1, Scene 2 | Act 1 | 120 | old chapter 1, unchanged |
| 3 | Act 1, Scene 3 | Act 1 | 51 | old chapter 2, paragraphs 0–50 |
| 4 | Act 2, Scene 1 | Act 2 | 12 | old chapter 2, paragraphs 56–66 (notice + heading at 51–55 removed) + restored location caption |
| 5 | Act 2, Scene 2 | Act 2 | 6 | old chapter 3, unchanged |
| 6 | Act 2, Scene 3 | Act 2 | 12 | old chapter 4, unchanged |
| 7 | Act 2, Scene 4 | Act 2 | 38 | old chapter 5, unchanged |
| 8 | Act 2, Scene 5 | Act 2 | 25 | old chapter 6, unchanged |
| 9 | Act 2, Scene 6 | Act 2 | 4 | old chapter 7, unchanged |
| 10 | Act 2, Scene 7 | Act 2 | 43 | old chapter 8, paragraphs 0–42 |
| 11 | Act 3, Scene 1 | Act 3 | 5 | old chapter 8, paragraphs 44–47 (heading at 43 removed) + restored location caption |
| 12 | Act 3, Scene 2 | Act 3 | 151 | old chapter 9, unchanged |
| 13 | Act 3, Scene 3 | Act 3 | 35 | old chapter 10, unchanged |
| 14 | Act 3, Scene 4 | Act 3 | 27 | old chapter 11, unchanged |
| 15 | Act 3, Scene 5 | Act 3 | 27 | old chapter 12, paragraphs 0–26 |
| 16 | Act 4, Scene 1 | Act 4 | 84 | old chapter 12, paragraphs 32–114 (notice + heading at 27–31 removed) + restored location caption |
| 17 | Act 4, Scene 2 | Act 4 | 12 | old chapter 13, unchanged structure; modern-en rewritten (was LIGHT) |
| 18 | Act 4, Scene 3 | Act 4 | 61 | old chapter 14, paragraphs 0–60 |
| 19 | Act 5, Scene 1 | Act 5 | 33 | old chapter 14, paragraphs 66–97 (notice + heading at 61–65 removed) + restored location caption |
| 20 | Act 5, Scene 2 | Act 5 | 50 | old chapter 15, unchanged |
| 21 | Act 5, Scene 3 | Act 5 | 17 | old chapter 16, unchanged structure; modern-en rewritten (was LIGHT) |
| 22 | Act 5, Scene 4 | Act 5 | 67 | old chapter 17, paragraphs 0–66; modern-en rewritten (was LIGHT) |
| 23 | Epilogue | Epilogue | 4 | old chapter 17, paragraphs 67–70 (`EPILOGUE`/`EPILOGUE.`/Rosalind's speech/`THE END`; the 4 licence paragraphs and the "End of this Etext..." line at 71–75 removed) |

**Post-review correction:** independent review found that removing the
merged "ACT N. SCENE I. <location>" lines at the four splice points (old
2.55, 8.43, 12.31, 14.65) had discarded the location caption along with the
heading — every other scene in the book keeps its plain-text location
caption as its own opening paragraph (e.g. "Orchard of OLIVER'S house" for
the restored Scene 1), and these four newly-split scenes should too. Fixed:
each of new chapters 4, 11, 16 and 19 now opens with its location caption
("The Forest of Arden", "The palace", "The forest", "The forest",
respectively) as paragraph 0, in both `original-en` and `modern-en`. This
added 4 paragraphs (927 → 931) and is reflected in the hashes and paragraph
counts above, in `PARAGRAPH-MAP.json`, and in `CHARACTER-CARD-IMPACT.json`.

Exact source ranges, per-chapter, are in `PARAGRAPH-MAP.json` (880 entries,
every surviving paragraph's old `"chapter.index"` → new `"chapter.index"`)
and `REMOVED-RANGES.json`/`REMOVED-TEXT.json` (the 21 removed paragraphs,
with their text, for audit purposes — all 21 are licence notices or
apparatus headings, none is story text; verified by reading each one).

## What this does not change

- **Stage-direction and location-line style is untouched.** The served
  edition's house style presents `Enter ROSALIND and CELIA` and `A lawn
  before the DUKE'S palace` as plain body paragraphs, not bracketed like
  Macbeth's edition. This package matches that existing convention for the
  restored Scene 1 and does not retrofit bracket-style stage directions
  elsewhere (finding G01-as-you-like-it-05, S4/cosmetic, is out of the scope
  Anders set for this task — restore the scene, fix structure, remove
  licence prose).
- **`EPILOGUE`/`EPILOGUE.`/`THE END` markers are kept as body paragraphs**,
  matching the existing served convention, in the new Epilogue chapter.

## Pre-existing modern-en defect (found and fixed, not introduced by this repair)

Running the mandatory similarity gate against the **currently served,
unmodified** text (as a baseline check before finalizing this package) shows
it already fails: weighted similarity 0.762 (limit 0.75) and 3 of 17
chapters (17.6%) LIGHT — old chapters 13, 16 and 17 (new 17, 21, 22) are
near-mechanical thee/thou → you, hath → has substitutions, not genuine
modern renderings. This is unrelated to the missing-scene defect and was not
previously recorded in `CONFIRMED-DEFECTS.md` (which audited completeness,
not modern-en quality, for this book). Since Anders's assignment asks for
both editions to be repaired, and books/AGENTS.md's gate is mandatory before
handoff, this package rewrites all real dialogue in these three chapters
(new chapters 17, 21, 22) plus the four-paragraph Epilogue (new chapter 23,
also LIGHT) as genuine sentence-level modern renderings — 77 paragraphs
total, listed exactly in `MODERN-EN-QUALITY-REWRITE.json` (keyed by new
chapter/paragraph index). Stage directions and speaker/location lines in
these chapters were left as-is (already plain modern English). The whole
book now passes at 0.703 weighted similarity, 0% LIGHT/MECHANICAL.

## Character-card impact

`as-you-like-it` is in `characterReleases`
(`app/public/data/characters/as-you-like-it.v1.json`). `CHARACTER-CARD-IMPACT.json`
gives the exact re-anchoring:

- **167 mentions (original-en) / 166 mentions (modern-en)** need only their
  `chapterNumber`/`paragraphIndex` remapped via `PARAGRAPH-MAP.json`; text
  offsets are unchanged since none of the surviving paragraphs' text itself
  changed (only its position moved) — except the 77 modern-en quality
  rewrites above, which are a separate, smaller concern: any mention whose
  `paragraphIndex` falls in one of those 4 chapters needs its `startOffset`/
  `endOffset` re-verified against the new phrasing, since character names
  are preserved but surrounding sentence structure changed. This package
  does not compute that finer offset check (it is the one piece of
  integration work left unautomated here); it is bounded to the 77 listed
  paragraphs.
- **1 mention in each edition should be deleted, not remapped**: a
  `characterId: "william"` mention at old `17.75` — the closing "End of this
  Etext... William Shakespeare" boilerplate line — where the character
  extractor matched "William" (the actor character in the play *also* being
  named William is a coincidence the extractor conflated with the author's
  name in the removed licence line). This is exactly the kind of defect
  this whole audit initiative targets: a phantom mention anchored to
  removed non-story text.

## Threads impact

`app/public/data/editions/as-you-like-it-threads.json` keys character
timelines by chapter number (`"chapters": {"1": {...}, ...}`). Because every
chapter number shifts (this is a full renumbering, not a local insertion),
every thread entry's chapter key needs re-deriving. For the 12 old chapters
that map to exactly one new chapter (1, 3, 4, 5, 6, 7, 9, 10, 11, 13, 15,
16), it is a straightforward key substitution per the correspondence table
above (e.g. old key `"1"` → new key `"2"`). For the 5 old chapters that were
split (2, 8, 12, 14, 17), a thread entry needs a human or editorial judgment
call on which half of the split its content belongs to — this package does
not attempt that automatically and flags it as an integration item rather
than guessing.

## Onboarding impact

`app/public/data/onboarding/as-you-like-it.json`'s `openingChapterLabel`
already reads "Act I, Scene I — A lawn before the Duke's palace" — which,
before this repair, was wrong (the served book opened at Scene 2, on a lawn
before the Duke's palace; there was no Scene 1 to label). After this repair,
that label is correct for the first time, but `openingText` currently quotes
Celia and Rosalind's Scene 2 opening line, not the real Scene 1 opening.
Codex should update `openingText` to Orlando's actual opening line ("As I
remember, Adam, it was upon this fashion bequeathed me by will but poor a
thousand crowns...") or an equivalent hook drawn from the new Scene 1, and
verify the location description matches (Scene 1 opens in "Orchard of
OLIVER'S house," not "A lawn before the DUKE'S palace" — the latter is now
Scene 2's location). `app/public/data/onboarding/as-you-like-it.da.json`
(Danish onboarding) was not inspected for the same issue; flagging for
Codex to check, not making a Danish content edit here.

## Audio

Per `books/AGENTS.md`, this is a text repair only: no audio generation, no
manifest/timing regeneration. Every chapter's audio-cache key becomes stale
under this repair (chapter numbers themselves change for every chapter from
2 onward, not just changed-text chapters), so this is a case where narration
cache invalidation needs to cover the *entire* book, not a changed-paragraph
subset. Anders separately asked that audio belonging to defective editions
be removed; given the scale of the renumbering, essentially all of this
book's existing cached narration (if any) keys to chapter numbers that no
longer correspond to the same content and should not be reused after
integration.

## Rights note — needs Anders'/Codex's decision, not resolved here

`NEEDS-INVESTIGATION.md` A1 (from the audit) flagged that the served text is
the 1990–93 World Library etext, whose own notice (the one this package
removes from reading text) asserts "NEITHER SHAREWARE NOR PUBLIC DOMAIN" and
restricts commercial redistribution of *that specific etext's transcription
and editorial choices* — not of Shakespeare's underlying public-domain text,
which is not in question. Removing the notice from reading text does not by
itself resolve whether continuing to serve this transcription's specific
wording (as opposed to a different, unambiguously public-domain edition) is
sound for a paid product. The audit's own recommendation was to re-base the
whole play on PG #1523 or PG #100, but PG #1523 has only 90% token overlap
with the currently served text — meaning a full re-base would replace most
of the book's prose, not just fix the four confirmed defects, a
substantially larger undertaking than what Anders's assignment described
("restore the missing opening scene, correct scene structure and remove
licence/editorial prose... while preserving required notices
appropriately"). This package does the literal, bounded repair Anders
described, using the same source family for the restored scene to avoid
stitching in a third edition's prose. **Needs your decision:** is removing
the notice and structural repair sufficient, or does Anders want the larger
PG #1523/#100 re-base to fully resolve the rights question? This is a
legal/business call beyond a content editor's authority to make unilaterally.

## Scope note on Danish (modern-da) — needs Anders' decision

The assignment (2026-09-26) asks for As You Like It's "both modern editions"
to be repaired, i.e. including `modern-da`. As with the Macbeth package (see
its `RELEASE-PACKET.md`), `STRATEGY.md` §Language scope (2026-09-21) and
`books/AGENTS.md`/`books/CLAUDE.md` (2026-09-24) currently read Danish out
of scope, and the assignment's explicit Danish-authorization line is scoped
to five specific Danish-only books that do not include As You Like It. This
package does not generate new Danish text. Because this is a full
renumbering (17 chapters → 23) rather than a local insertion, `modern-da`
(901 paragraphs, 17 chapters, live) becomes completely chapter-misaligned
with the repaired `original-en`/`modern-en` (931 paragraphs, 23 chapters) —
not just in the touched chapters, but throughout, since every chapter number
after 1 shifts. Per the audit's D-9 guidance, Compare must not pair
`modern-da` against the repaired editions at all until Anders decides
whether to reopen Danish scope for this book (and a Danish repair follows
the same 17→23 restructuring plus new Scene 1 translation) or Codex hides
`modern-da` entirely for this book pending that decision. **Needs your
decision.**

## Verification performed

- `python3 -m json.tool` on both candidate files: valid.
- Chapter count (23) and per-chapter paragraph-count equality between
  `original-en` and `modern-en`: verified programmatically for all 23
  chapters.
- Every removed paragraph (21, listed in `REMOVED-TEXT.json`) was read and
  confirmed to be licence/apparatus text, not story content.
- The new chapter-boundary paragraphs (first and last paragraph of each of
  the 23 new chapters) were read to confirm no orphaned text and no
  licence/heading leakage across a new chapter boundary.
- Similarity gate: PASS (0.703 weighted, 0% LIGHT/MECHANICAL, 1.0% identical
  long paragraphs).
- Untouched paragraphs (all of chapters 2, 5, 6, 7, 8, 9, 12, 13, 14, 15, 16,
  18, 19, 20 in the new numbering, i.e. every old chapter that neither split
  nor needed a modern-en quality fix) are byte-identical to the
  corresponding live served paragraphs, just at a new chapter/index — spot
  checked against `PARAGRAPH-MAP.json`.

## What independent review should check

1. Re-derive Act 1 Scene 1 from `source/1ws2510.txt` (or PG #1523, as a
   cross-check) independently and confirm the restored text is verbatim and
   completely covers the scene (Orlando/Adam through Oliver's closing
   "Exit").
2. Confirm the new chapter structure against the audit's scene map (or by
   re-deriving it independently from the source) — every scene boundary,
   every removed-vs-kept paragraph.
3. Confirm none of the 21 removed paragraphs is story text (re-read
   `REMOVED-TEXT.json` against the source).
4. Spot-check the modern-en rendering of the new Scene 1, and re-run (or
   independently reproduce) the similarity gate for the whole book.
5. Independently re-verify the 77-paragraph modern-en quality rewrite
   (chapters 17, 21, 22, 23) for fidelity — these carry real translation
   risk since Touchstone and Jaques's wordplay (the "Retort Courteous"
   ladder, "seventh cause") is easy to flatten; check meaning and comic
   structure are preserved, not summarized.
6. Confirm the character-card, threads and onboarding impact notes above,
   and flag the rights question and the Danish scope note in the acceptance
   record as open Anders decisions, not silent omissions.
