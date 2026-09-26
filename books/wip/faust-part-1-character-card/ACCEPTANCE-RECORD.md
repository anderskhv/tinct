# Acceptance Record — Faust Part I, replacement character card

**Status: ACCEPTED, ready for Codex integration. Not published.**

| Item | Value |
|---|---|
| Package | `books/wip/faust-part-1-character-card/` |
| Branch | `claude/cool-clarke-ngd780` |
| Candidate sha256 | `26c8dba4baaecd3f2fe19a2082cf5f0172afb88ae589786569445361c53d3df0` |
| Compiler | `books/characters/build_faust_part_1.py` |
| Independent reviewers | Two rounds: a full independent review, then a targeted recheck of the fix it required |
| Review verdicts | Round 1: **DO NOT ACCEPT (as-is)** — 1 blocking regex gap found. Fixed. Round 2 (recheck): **ACCEPT** |

## Round 1 finding and disposition

Round 1 confirmed schema, hashes, all 16 character IDs, correct
speaker-tag mapping, 24 individual mention spot-checks, zero false
positives, translation-independent snapshot bios, and the companion
onboarding fix — but found one **blocking defect**: the compiler's
speaker-tag regex (`^([A-Z][A-Z ]+)\.\s`) failed to match the common
`NAME (stage direction). dialogue` pattern (e.g. "VALENTINE (a soldier,
Margaret's brother). Whenever I sat..."), silently dropping ~81-83
mentions per edition (~10-11% of all speaker-tag mentions) and producing
2 confirmed wrong `firstMention`/`roleVisibleAt` coordinates: valentine
(ch22/para13 instead of the true earliest, ch22/para0) and martha
(ch13/para2 instead of ch13/para0).

**Fixed**: widened the regex to `^([A-Z][A-Z ]+?)(?:\s*\([^)]*\))?\.\s`,
capturing only the name when an optional parenthetical follows it before
the period. Rebuilt the card. Mentions increased from 723→804
(original-en) and 782→865 (modern-en).

## Round 2 (recheck) verdict

Independently re-derived the missed pattern from scratch (not reusing
the compiler) and got exactly 81/83 matches, matching the reported range
precisely; cross-checked all of them present in the new card with
correct `characterId` and name-only offsets. Confirmed valentine and
martha now resolve to their true earliest paragraphs in both editions,
verified by reading those paragraphs directly. Regression-checked 5
previously-correct mentions: identical, no regression. Confirmed total
mention deltas exactly match the independently-derived missed-pattern
counts. Valid JSON.

## Known, documented, non-blocking gap

"Lisbeth" (chapter 20, "At the Well") is a named character with 7
speaker-tagged lines, same count as the tracked Valentine, but is absent
from both the old and this replacement card. This is inherited scope
from the old card (not a regression introduced by this repair) — both
independent reviewers confirmed this and treated it as non-blocking.
Flagged here for a possible follow-up task, not silently omitted.

## What "accepted" does not mean

Accepted for integration; not published, not live. This card is
authored and compiled through this session's own script, not through
the dedicated `books/characters/` remote authoring queue — that queue's
own planned work on this file, if any, should treat this as a starting
point to verify or supersede. Codex owns integration and the serialized
release process per `books/BOOK-TASK-WORKFLOW.md`.
