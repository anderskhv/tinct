# Release Packet — Faust Part I, onboarding correction and character-card gap documentation

Status: onboarding fix independently reviewable and small; character-card
finding is documentation only (no fix authored — see below for why).
Not published. Content dependency relayed from Codex for the Faust
English/Danish source replacement (`books/wip/faust-part-1-english-repair/`,
`books/wip/faust-part-1-modern-da-repair/`).

## Onboarding — what this fixes

`onboarding/faust-part-1.json` and `.da.json`: `openingChapterLabel`
("Dedication" / "Tilegnelse") was already correct, but `openingText`
quoted the OLD Dedication opening — the mislabeled Hayward/Buchheim-OCR
text ("Ye approach again, ye wavering forms...") that the accepted
English replacement fully superseded. Same defect in both languages.
Replaced with the accepted candidates' actual opening line, quoted
verbatim: Taylor's "Again ye come, ye hovering Forms!..." (English) and
its accepted Danish translation "I kommer igen, I svævende
skikkelser..." (Danish). No other onboarding field was touched — `about`,
`whyItMattersItems`, `acclaim`, and `cast` are plot/character
descriptions, not direct textual quotations, so they remain accurate
regardless of which English translation is served (see spoiler review
below for a separate check of `cast`).

## Onboarding `cast` array — spoiler-safety review (no fix needed)

Checked whether Faust's `cast` array (6 entries: Faust, Mephistopheles,
Gretchen, Wagner, Valentin, The Lord) violates this project's "cast cards
that respect spoilers" principle (`STRATEGY.md`), since it does reveal
significant plot outcomes (the pact, Gretchen's full ruin including the
infanticide, Valentin's death, the ending's moral frame).

Compared directly against the established convention: Macbeth's own
onboarding `cast` array (already live, already accepted) reveals
comparably blunt outcomes for its major characters — Duncan's murder,
Banquo's murder, Lady Macbeth's death by suicide (implied), and Macbeth's
own death at Macduff's hand — using the same "introduce, then state what
happens" structure. This confirms the platform's actual convention for
pre-reading onboarding `cast` copy is closer to a Wikipedia-style
character guide (outcomes stated directly for well-known classics) than
a strict spoiler-free teaser. **Faust's cast array is consistent with
this established convention, not a violation of it — no rewrite made.**

The real "spoiler-safe reveal points" mechanism in this platform is a
different, separate system: the in-app character card
(`app/public/data/characters/*.v1.json`), which implements PROGRESSIVE
reveals via per-fact `availableAt` chapter/paragraph/offset coordinates
(confirmed by inspecting Macbeth's card: each character has multiple
`snapshots`, each gated to unlock only once the reader reaches that
coordinate). This is the system actually described by "spoiler-safe
reveal points," and it is Faust's character card, not the onboarding
`cast` prose, that has the real problem — documented below.

## Faust character card — confirmed gap, NOT fixed here (see rationale)

`app/public/data/characters/faust-part-1.v1.json` is built on the
now-fully-replaced source text:

| Edition | Card's `sourceSha256` | Card's `paragraphCount` | Accepted candidate's actual hash/count |
|---|---|---|---|
| `original-en` | `bff236838e6e5ee6baeb7afd16c6b1c1b2872f87605f21e79e4cd5198a997395` | 895 | `e36200c60fe9e763555461ea2d65f9772058aa737635688e7b79ad4010bee79d`, 1,060 |
| `modern-en` | `9e66da5b45267bfb3cae70905897d9f9c1397bd1d1c8b080bf325cda0046d28b` | 895 | `7c7b27df8c77e069e8641b8154f67f26d57afab36d73072865d061998d201dfe`, 1,060 |

The card carries 16 characters and 291-300 per-edition `mentions`, each
anchored by exact `chapterNumber`/`paragraphIndex`/`offset` coordinates
computed against the OLD 895-paragraph text's `paragraphHashes`. Because
the accepted repair is a full source-text replacement (not a
coordinate-preserving patch — the underlying wording changed throughout,
not just the structure), **every single snapshot and mention coordinate
in this card is now invalid**, not merely stale. There is no mechanical
shift (like "+3 paragraphs from chapter 4 on") that can repair it — each
coordinate would need to be independently re-derived by re-reading where
each fact is actually revealed in the NEW 1,060-paragraph text.

**Why this package does not attempt that repair:**
1. **Wrong tooling/lane.** Character-card authoring in this project is a
   distinct, actively-developed pipeline with its own builder scripts
   (`books/characters/build_*.py`), test suite, review process, and its
   own remote authoring queue (`books/characters/AUTOMATION-QUEUE.md`,
   referenced in `docs/character-reference-release-2026-09-11.md` as
   "Remote authority: claude/tinct-character-content-1n5iqq"). No
   `build_faust_part_1.py` exists yet, meaning Faust's card was produced
   by some other/generic process outside this dedicated pipeline. Hand-
   authoring 291-300 offset-anchored mentions outside that pipeline's
   tooling risks producing a schema-incompatible or untested artifact,
   and risks colliding with that separate authoring track's own planned
   work on this exact file — directly against this task's instruction to
   "coordinate with the existing package rather than creating a
   competing version."
2. **Scale and precision.** Unlike the AYLI threads fix (25 entries, a
   simple old-chapter→new-chapter lookup), this requires re-deriving
   hundreds of exact character-by-character text offsets against an
   entirely different translation's prose — genuinely new authoring work
   at the scale of building a new book's character card from scratch,
   not a "check and correct" task.

**What this package does instead:** documents the gap precisely (this
file) so it is not silently missed, and confirms it is real (not merely
theoretical) by showing the exact hash/count mismatch above.

## Candidates

| File | sha256 |
|---|---|
| `onboarding/faust-part-1.json` | `99cee4166ee959b8062919f9fabd54a45cf3673f4cdf28114929906101ff7816` |
| `onboarding/faust-part-1.da.json` | `e144ccbc5683ca25a611e0c5646f525ef4cfcf6f6cbac6fedb33e01acdb05def` |

## What independent review should check

1. Confirm `openingText` in both files is an exact, verbatim quotation of
   the accepted candidates' actual chapter-1 first paragraph (not a
   paraphrase).
2. Confirm the Macbeth cast-array comparison is accurate (i.e. Macbeth's
   own onboarding does reveal comparable plot outcomes) before accepting
   the "no fix needed" conclusion for Faust's `cast` array.
3. Confirm the character-card hash/paragraph-count mismatch is real by
   independently checking `app/public/data/characters/faust-part-1.v1.json`
   against the accepted candidates' actual hashes.

## Scope note

This package does not attempt the character-card regeneration. That
remains open — flagged for Codex/the dedicated character-content
authoring pipeline, not silently left unaddressed by omission.
