# Acceptance Record — A Vindication of the Rights of Woman, modern-da translation

**Status: ACCEPTED, ready for Codex integration. Not published.**

| Item | Value |
|---|---|
| Package | `books/wip/vindication-modern-da-repair/` |
| Branch | `claude/cool-clarke-ngd780` |
| Final candidate sha256 | `3f6d9951f9d176d799d95cc73f6df9aaa3fe36501816f7c3c84ee2b7674a942d` |
| Replaces live sha256 | `41ec7c251015ca8079dc88e5845757ac634fbf4c62f6ab03160ed5e686fc8880` |
| Independent reviewer | A separate Claude agent instance, working from the English baseline and candidate JSON, verdict formed before reading `RELEASE-PACKET.md` |
| Review verdict | **DO NOT ACCEPT AS-IS** (round 1) → one confirmed defect fixed → **ACCEPTED** (this record) |

## Independent review summary and disposition

Confirmed: all 15 file-chapters' paragraph counts match the English
baseline exactly, 1:1; chapters 7-9 (already-accepted Danish, untouched
by this repair) byte-identical to the live file; all 7 hand-assembled
paragraphs (chapter 6 indices 6, 13, 17, 23, 25; chapter 10 index 15;
chapter 13 index 17) individually verified faithful and complete,
including both footnote paragraphs; broad sample of the four longest
translated chapters plus an automated length-ratio check across every
paragraph found no evidence of dropped clauses or compression; proper
nouns cross-checked 1:1 EN vs. DA; prose register matches the chapters
7-9 reference (consistent »« guillemets, formal register, unsplit
periodic sentences, no calque/MT tells).

**Found and fixed:** chapter 15 (the book's own "Chapter 13"), paragraph
index 61 was left completely untranslated — copied verbatim from
English with only the closing "?" silently changed to ".". The
reviewer's automated sweep confirmed this was the only such instance
across all 13 repaired chapters (a legitimate untranslated "M. W."
signature line in the Dedication is not a defect). Fixed: translated to
"Desuden, hvordan kan kvinder være retfærdige eller gavmilde, når de er
uretfærdighedens slaver?" in the established register.

**Re-verification performed after the fix:** re-ran a zero-Danish-character
sweep (paragraphs >20 characters outside chapters 7-9 containing no
æ/ø/å) across the full repaired file — found only 3 short, genuinely
Danish sentences that simply don't happen to contain those characters
(read and confirmed authentic, not leftover English); re-confirmed all
15 chapters' paragraph counts still match the English baseline exactly
after the edit; re-validated JSON.

## What "accepted" does not mean

Accepted for integration; not published, not live. Codex owns integration
and the serialized release process per `books/BOOK-TASK-WORKFLOW.md`.
