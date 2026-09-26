# Release Packet — Faust Part I, replacement character card

Status: candidate, awaiting independent review. Not published.
Content-only. English editions only — Danish character-card bindings are
not prepared for any book in this project (per
`books/characters/README.md`: "Danish content and bindings are not
prepared"), and this package does not attempt to change that.

## What this fixes

The live `app/public/data/characters/faust-part-1.v1.json` was built
against the OLD, now-fully-replaced Hayward/Buchheim-OCR source (895
paragraphs, sha256 `bff236838e...`/`9e66da5b45...`). The accepted
replacement (Bayard Taylor's translation, 1,060 paragraphs, sha256
`e36200c60f...`/`7c7b27df8c...`) changed the underlying wording
throughout, not just the structure, so every one of the old card's
mention/snapshot coordinates is invalid — not merely stale.

## Method — re-derived, not mechanically shifted

Per instruction, this package does NOT attempt to shift the old
paragraph/offset coordinates by some computed delta (which would be
meaningless here, since the text itself changed, not just its
boundaries). Instead:

1. **Reused the old card's editorial content** (16 characters' `id`,
   `kind`, `storyRole`, and single-snapshot `name`/`subtitle`/`body`) —
   these are factual, translation-independent descriptions ("An aging
   scholar, master of every field of learning...") that remain accurate
   regardless of which English translation is served.
2. **Wrote a new compiler**, `books/characters/build_faust_part_1.py`
   (following the established pattern in `build_macbeth.py`: speaker-tag
   detection at each paragraph's start, plus word-boundary name-alias
   matching), and ran it fresh against BOTH accepted replacement editions
   (`original-en` and `modern-en` separately, since their exact wording
   and offsets differ).
3. **Re-derived every mention from scratch**: 723 mentions in
   `original-en`, 782 in `modern-en`, across all 16 characters. Each
   character's `firstMention`/`roleVisibleAt`/snapshot `availableAt` is
   set to the earliest mention actually found in the new text — not
   copied or shifted from the old card.

## Speaker-tag mapping used

Direct 1:1 correspondence confirmed between the old card's 16 character
IDs and the new text's actual speaker tags (FAUST, MEPHISTOPHELES,
MARGARET, WAGNER, THE LORD, RAPHAEL, GABRIEL, MICHAEL, VALENTINE,
MARTHA, FROSCH, BRANDER, SIEBEL, ALTMAYER, THE WITCH, STUDENT — the last
scoped to chapter 7 only, since "student" is a common noun elsewhere).
Plus word-boundary name-alias matching for 7 characters whose plain name
also appears in narration/other speakers' dialogue beyond their own
speaker tag (Faust, Mephistopheles, Margaret, Wagner, Valentine, Martha,
"the Lord").

Confirmed via spot-check: Taylor's translation uses "Margaret" (never
"Gretchen") and "Valentine" (never "Valentin") throughout — this
resolved a naming mismatch, see the companion onboarding fix below.

## Candidate

| File | sha256 |
|---|---|
| `books/wip/faust-part-1-character-card/faust-part-1.v1.json` | `cf7bdf1bd5696b0c74f352cca59050e274e6225733f5d7fd4575ebf0e780e370` |

Structure: same schema as the live card (`schemaVersion`, `bookId`,
`language`, `contentVersion`, `normalization`, `offsetUnit`,
`reviewStatus`, `editions`), with `editions.original-en` and
`editions.modern-en` each carrying the correct new `sourceSha256`,
`chapterCount` (28), `paragraphCount` (1,060), 16 `characters`, and all
re-derived `mentions`.

## Companion fix — onboarding naming mismatch

While confirming onboarding matches these exact files (per instruction),
found `books/wip/faust-part-1-onboarding-fix/onboarding/faust-part-1.json`
(already accepted for its `openingText` fix) still used "Gretchen
(Margarete)" and "Valentin" throughout — 22 and multiple occurrences
respectively, across `cast`, `about`, `whyItMattersItems`,
`whyItMatters`, `angleCards`, and `preReadingChat` — none of which match
the accepted Taylor text's actual names ("Margaret", "Valentine").
Fixed globally (string replacement across the full onboarding JSON
structure, re-validated as JSON afterward). New sha256:
`2c4cf99ed872857bfe59c16d7eea3dbe96fcaf08eeb97fc5c01895c8296b244c`.
Danish onboarding (`faust-part-1.da.json`) is explicitly untouched — no
further Danish work per this assignment's scope.

## What independent review should check

1. Confirm the 16 character-ID↔speaker-tag mapping is correct and
   complete (no missing character, no misattributed speaker).
2. Spot-check a substantial sample of both editions' mentions for
   correct attribution, especially at scene transitions and for
   characters sharing similar names/roles.
3. Confirm `firstMention`/`roleVisibleAt` coordinates are genuinely the
   EARLIEST occurrence in the new text for each character (not
   accidentally a later one).
4. Confirm the reused snapshot bios remain accurate against the new
   Taylor text (they are translation-independent factual descriptions,
   but verify none references a detail specific to the old translation's
   wording).
5. Confirm the onboarding naming fix is complete (zero remaining
   "Gretchen"/"Valentin" non-e occurrences) and that Danish onboarding
   was correctly left untouched.
6. Confirm no false-positive name-alias matches (e.g. "the Lord" bound to
   an unrelated reverent address, or a common-noun collision for
   "student"/"witch").

## Scope note

This card is authored and compiled through this session's own script,
not through the dedicated `books/characters/` remote authoring queue
noted in an earlier package's release notes — that queue's own planned
work on this file, if any, should treat this as a starting point to
verify or supersede, not be silently overwritten by it. Flagged for
Codex/that pipeline's owners to reconcile.
