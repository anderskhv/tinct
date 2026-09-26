# Acceptance Record — Faust Part I, English edition replacement (Bayard Taylor)

**Status: ACCEPTED — both `original-en` and `modern-en`, ready for Codex
integration. Not published.**

| Item | Value |
|---|---|
| Package | `books/wip/faust-part-1-english-repair/` |
| Branch | `claude/cool-clarke-ngd780` |
| `original-en` sha256 | `e36200c60fe9e763555461ea2d65f9772058aa737635688e7b79ad4010bee79d` (28 chapters, 1,060 paragraphs) |
| `modern-en` sha256 | `7c7b27df8c77e069e8641b8154f67f26d57afab36d73072865d061998d201dfe` (28 chapters, 1,060 paragraphs) |
| Replaces live sha256 | original-en `bff236838e6e5ee6baeb7afd16c6b1c1b2872f87605f21e79e4cd5198a997395`; modern-en `9e66da5b45267bfb3cae70905897d9f9c1397bd1d1c8b080bf325cda0046d28b` |
| Independent reviewers | Two separate Claude agent instances — one for `original-en` (`INDEPENDENT-REVIEW.md`), one for `modern-en` (`MODERN-EN-INDEPENDENT-REVIEW.md`) — each working from the raw source / original-en baseline and candidate JSON only |
| Review verdicts | `original-en`: **ACCEPT** (2 defects found and fixed — see below); `modern-en`: **ACCEPT**, no defects found |

## original-en — review and fixes

Independent review deep-diff-checked 12 scenes spread across the whole
play word-for-word against the raw Gutenberg source, confirmed correct
opening/closing lines and full structural parity. Found and this package
fixed:
1. A leaked PG illustration caption at chapter 28 (Dungeon) paragraph
   index 40 — removed (chapter 28 paragraph count now 58, was 59).
2. Six stray footnote-marker digits glued into chapter 4's Faust
   monologue (paragraph index 33) with no corresponding footnote text
   anywhere in the source — removed.

Also fixed as a cosmetic consistency item (not a fidelity defect,
reviewer's own note): chapter 6/7 titles now read "The Study, Part 1" /
"The Study, Part 2" (Arabic numerals) to match the live edition's
existing convention.

## modern-en — review

Independent review confirmed structural parity with `original-en` across
all 28 chapters (identical paragraph counts, chapter titles, 1:1 order,
no empty paragraphs); word-count ratios of 1.01–1.19 per chapter
(overall 1.12), consistent with genuine verse-to-prose unpacking rather
than truncation; a close read of every priority passage requested
(Prologue in Heaven, the "In the Beginning was the Word/Thought/Power/
Deed" passage, Auerbach's Cellar, Witch's Kitchen, Gretchen's song,
Valentine's death curse, the Cathedral scene, Walpurgis-Night and its
Dream interlude, and the full Dungeon ending) found all faithful, no
invented content, no omissions. Confirmed the play's darkest content
(Margaret's confession of infanticide, the hallucinated child-rescue
scene, Valentine's brutal curse, the ending's dying-away ambiguity) is
unsoftened. Speaker tags and stage directions preserved as their own
paragraphs throughout, including tricky cases (Latin liturgical lines,
rapid-fire epigrams, parenthetical stage directions). A full-corpus
archaism regex scan (thee/thou/thy/hast/dost/etc.) across all 1,060
paragraphs found zero genuine leftover archaic forms (9 hits, all false
positives). No paragraph-level defects found; no fixes required.

## Edition-identity and reader-coordinate handling required by Codex

Unchanged from `RELEASE-PACKET.md`: this is a full replacement of both
editions with a different underlying source text (Taylor's complete
translation, 1,060 paragraphs, replacing the mislabeled/incomplete
Hayward-Buchheim-OCR text at 895 paragraphs) — not a coordinate-preserving
patch. No old→new paragraph map exists or is possible; any reader
mid-book, and any character-card/threads/onboarding chapter-or-paragraph
anchors, need Codex's explicit handling before integration, per the full
detail in `RELEASE-PACKET.md`.

## Scope note on German (original-de) and Danish (modern-da)

`original-de` is a separate, already-accepted fix (see
`books/wip/faust-part-1-original-de-fix/`), untouched here — the German
original is preserved exactly as instructed. `modern-da` is not addressed
by this package; Faust Part I is not among the five books this
assignment's Danish carve-out names, and `modern-da` would need a fresh
render from this new `modern-en` baseline regardless — a separate, future
content assignment if Danish scope is reopened for this book.

## What "accepted" does not mean

Accepted for integration; not published, not live. Codex owns
integration, the edition-identity/reader-coordinate handling documented
above, and the serialized release process per `books/BOOK-TASK-WORKFLOW.md`.
