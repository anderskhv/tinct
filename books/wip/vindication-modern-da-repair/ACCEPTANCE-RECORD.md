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

**Re-verification performed after the fix (superseded — see below):** an
initial post-fix check used a zero-Danish-character (æ/ø/å absence)
sweep. That heuristic is weak — it can miss genuine English leftovers
that happen to contain no æøå-bearing word, and flags legitimate Danish
sentences that simply don't contain those characters as false positives.
It was replaced with a proper whole-edition check (below) before this
package could be considered adequately verified.

## Whole-edition completeness review (proper method, post-fix)

A dedicated, fresh whole-edition review (`WHOLE-EDITION-COMPLETENESS-REVIEW.md`,
this folder) re-scanned the entire post-fix candidate using real language
signal instead of character-presence heuristics:

- **Untranslated-English scan, 100% coverage** of all 544 paragraphs
  across the 12 repaired chapters (chapters 7-9 excluded as untouched):
  whole-word English function-word matching with a list curated to
  exclude Danish/English homographs (early attempts using "have"/"to"/
  "her" produced dozens of false positives against ordinary Danish
  words; the working list was `the, and, of, which, with, this, was,
  were, been, would, could, should, from, his, their, is, not, that`),
  plus a supplementary check for short sentences with zero Danish-specific
  characters or guillemets. **Zero genuine untranslated-English defects
  found** — 4 flags raised, all confirmed false positives on inspection
  (2 short but correct Danish sentences without æøå, one being the
  chapter 10 footnote's English book-title reference "Boswells Life of
  Johnson," correctly left untranslated as Wollstonecraft's own citation).
  The previously-fixed chapter 15 paragraph 61 was independently
  confirmed now complete and correct. A supplementary length-ratio scan
  across all 544 paragraphs found zero below a 0.6 Danish/English
  character-length ratio — no evidence of compression co-occurring with
  any missed leftover.
- **Fidelity sample**: 185 of 544 paragraphs (34.0%), sampled so every one
  of the 12 translated chapters individually has ≥33% coverage (not
  concentrated in the longest chapters). Each sampled paragraph compared
  in full against the English baseline: no dropped clauses, no
  compression, no invented content; footnotes and quoted verse/prose
  complete; section markers consistently translated; register consistent
  with the accepted chapters 7-9.
- **Final verdicts**: whole-edition completeness — CLEAN (genuinely and
  completely translated, no gaps); fidelity — STRONG (no evidence of any
  fidelity problem in the sampled 34%, corroborated by the zero-hit
  full-edition length-ratio check). No further action required.

## What "accepted" does not mean

Accepted for integration; not published, not live. Codex owns integration
and the serialized release process per `books/BOOK-TASK-WORKFLOW.md`.
