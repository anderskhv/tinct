# Repair r3 status

Updated: 2026-09-30

Branch: `content/modern-en-repair-r3`.

| Book | Status | Next action |
| --- | --- | --- |
| jungle-book | **READY — whole-book PASS** | Staged replacement for content review/integration; not published |
| genealogy-of-morals | **NOT STARTED** | Next book in the original ordered repair assignment |

Jungle Book: all seven chapters repaired. Whole-book similarity 0.433; LIGHT + MECHANICAL 0%; identical long paragraphs 0.4%; scaffolding 0; truncated quotations flagged 0. Paragraph counts, poem line divisions, exclamation marks and >=75% paragraph word counts verified. HANDOFF.md and changed-paragraphs.json contain full evidence, provenance and hashes.

The content commit uses an isolated Git index and the r3 ref, preserving other tasks' shared checkout/index. No deployment or publication. Zero Anthropic API spend.
