# Acceptance Record — Discourse on Inequality, Appendix/footnotes restoration (English)

**Status: ACCEPTED (English editions), ready for Codex integration. Not
published.** Danish (`modern-da`) translation of the same new content is
a separate, follow-up package (in progress).

| Item | Value |
|---|---|
| Package | `books/wip/discourse-on-inequality-frontmatter-repair/` |
| Branch | `claude/cool-clarke-ngd780` |
| `original-en` sha256 | `6df7da14bcd7bb997f68a61890ef96f8205ffe02ab629f5e8aeac24153fa45be` (5 chapters: Dedication, Preface, Part 1, Part 2, Appendix; 194 paragraphs, was 170) |
| `modern-en` sha256 | `2fba90eed46eed2611730f8b9e43e1eeadd54e7e48bbe64ad24a271399df5fc6` (5 chapters, 194 paragraphs) |
| Independent reviewer | A separate Claude agent instance, verdict formed before reading `CHANGELOG.json` or release notes |
| Review verdict | **ACCEPT** — one non-blocking punctuation improvement found and applied below |

## What this restores

Confirmed audit finding G09-discourse-on-inequality-02: Cole's Appendix
(~3,112 words, Rousseau's Note IX) and 9 footnotes (~450 words) missing
from all editions.

## Independent review summary

Confirmed both files valid JSON, 5 chapters, identical per-chapter
paragraph counts (26, 25, 56, 71, 16) in both editions. Confirmed
Dedication and Preface deep-equal to the live pre-fix files (untouched).
Confirmed all 8 in-text bracket markers present at their original
paragraphs, each immediately followed by its correct footnote, no marker
duplicated/missing/detached. Independently re-fetched Project Gutenberg
#46333 and ran a full word-level diff of Part 2 + Appendix (15,702 vs
15,707 words): zero content differences beyond expected footnote
repositioning. Confirmed all 3 OCR corrections (a stray "<", "caused to
be I punished"→"caused to be punished", "theft fellow-citizens"→"their
fellow-citizens") against the raw source: genuine single-character/word
artifacts, not edits. Confirmed modern-en's Appendix and all 8 footnotes
faithful and non-truncated; verified case-by-case that the "brief
citation" footnote treatment (used for footnotes 2, 4, 5, 6) only occurs
where the translated quote is already inlined in the preceding main-text
paragraph — no content loss.

**Found and fixed:** the reviewer independently checked an authoritative
alternate presentation of Cole's translation (constitution.org,
explicitly attributed to Cole) and found the raw Gutenberg OCR had
dropped a semicolon in the Appendix's closing paragraph, garbling a
four-clause parallel list ("...magistrates those who were honoured...")
into an ungrammatical run-on. Restored the semicolon
("...magistrates; those who were honoured...") in `original-en`,
Appendix (chapter 5), paragraph 15 — matching the confirmed correct
primary-source reading, and matching the structure `modern-en`'s
translator had already independently intuited for the same passage.

## What "accepted" does not mean

Accepted for integration (English editions); not published, not live.
Danish translation of the same new content is a separate follow-up
package. Codex owns integration, coordinate-shift application to
character-card/threads data (per `CHANGELOG.json`, this folder), and the
serialized release process per `books/BOOK-TASK-WORKFLOW.md`.
